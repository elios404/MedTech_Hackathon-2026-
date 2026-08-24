# SPEC_VISION_AI.md: 수술실 폐기물 4대 성상 실시간 비전 감지 모듈 구현 명세서

이 문서는 AI 코딩 에이전트(Antigravity / Cursor 등)가 수술실 스마트 폐기물 감지 시스템의 **Tier 1 컴퓨터 비전 파이프라인**을 독립적으로 구현할 수 있도록 작성된 엔지니어링 명세서입니다.

---

## 1. 시스템 개요 및 목표

* **목적**: 수술실 쓰레기통 상단에 설치된 웹캠 피드로부터 투입되는 물품을 실시간으로 감지하고, **4대 성상 카테고리로 분류**하여 오투기 이벤트를 디바운싱(중복 방지) 처리한 후 `data/events.jsonl`에 정형 데이터로 기록한다.
* **주요 제약 및 요구사항**:
* **Zero-Shot / 무학습 추론**: 대규모 커스텀 데이터셋 학습 없이 `YOLO-World` 오픈 보캐블러리 모델과 `OpenCV HSV/Texture Heuristics`를 결합하여 즉시 구동.
* **프라이버시(Privacy)**: 화면 전체가 아닌 지정된 **투입구 ROI(Region of Interest)** 내부 객체만 추론.
* **실시간성**: 초당 20 FPS 이상 유지 (<50ms 지연 시간).



---

## 2. 4대 성상 분류 기준 및 판정 알고리즘

```
[웹캠 프레임 수집]
       │
       ▼
[ROI 영역 진입 객체 필터링]
       │
       ▼
[YOLO-World Zero-Shot 객체 탐지]
       │
       ├── 1) 손상성 물품(바늘/가위/메스 등) 감지 시 ──► [CLASS: Sharps_Hazard]
       │
       └── 2) 일반/의료 소모품 감지 시
                 │
                 ▼
         [HSV 색 공간 혈액/체액 오염 분석]
                 │
                 ├── 붉은색/체액 픽셀 비율 ≥ 10% ──────► [CLASS: Biohazard_Infectious]
                 │
                 └── 붉은색/체액 픽셀 비율 < 10%
                           │
                           ▼
                    [재질(Material) 판정]
                    ├── 비닐/페트/블리스터팩/트레이 ──► [CLASS: Clean_Plastic]
                    └── 박스/종이/매뉴얼 ──────────► [CLASS: Clean_Paper]

```

### 성상별 판정 규칙 매트릭스

| 분류 클래스 (`MaterialCategory`) | YOLO-World 탐지 클래스 (Prompts) | 2차 OpenCV 필터 / Heuristic | 비고 / 매핑 규칙 |
| --- | --- | --- | --- |
| **`Clean_Plastic`** | `plastic bottle`, `plastic bag`, `blister pack`, `sterile wrap`, `plastic packaging`, `cup` | **HSV 붉은색 비율 < 10%** + 반사광/투명도 특성 | 재활용/일반 전환 대상 (절감 핵심) |
| **`Clean_Paper`** | `paper box`, `cardboard`, `paper`, `book`, `instruction sheet` | **HSV 붉은색 비율 < 10%** + 저채도/무광 특성 | 일반 쓰레기 스트림 |
| **`Biohazard_Infectious`** | `gauze`, `bandage`, `tissue`, `towel`, `medical glove`, `tubing` 등 모든 객체 | **BBox 내부 HSV 붉은색 픽셀 면적 비율 $\ge$ 10%** | 진성 감염성 폐기물 (노란통 적합) |
| **`Sharps_Hazard`** | `syringe`, `needle`, `scissors`, `scalpel`, `knife`, `blade`, `vial`, `glass ampoule` | 객체 탐지 신뢰도(Confidence) $\ge$ 0.40 시 즉시 확정 | 치명적 위험물 (최우선 판정) |

---

## 3. 디렉토리 구조 및 파일별 역할

```text
smart-medwaste-ai/
├── config/
│   ├── __init__.py
│   └── settings.py         # ROI 좌표, HSV 임계값, 카메라/모델 파라미터
├── shared/
│   ├── __init__.py
│   └── schemas.py          # Pydantic 기반 이벤트 스키마
├── vision/
│   ├── __init__.py
│   ├── camera.py           # 웹캠 캡처, FPS 관리, 프레임 리사이즈
│   ├── detector.py         # YOLO-World + HSV 혈액 탐지기 통합 엔진
│   ├── tracker.py          # 객체 투입/낙하 추적 및 중복 방지 (Debounce)
│   └── visualizer.py       # OpenCV 화면 바운딩 박스, ROI, HUD 렌더링
├── data/
│   └── events.jsonl        # 발생한 이벤트가 1라인씩 append 저장되는 파일
└── run_vision.py           # 비전 모듈 단독 실행 엔트리포인트

```

---

## 4. 파일별 세부 구현 가이드

### 4.1 `config/settings.py`

```python
from pathlib import Path

# Paths
BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
DATA_DIR.mkdir(exist_ok=True)
EVENT_LOG_PATH = DATA_DIR / "events.jsonl"

# Camera Settings
CAMERA_INDEX = 0
FRAME_WIDTH = 1280
FRAME_HEIGHT = 720
TARGET_FPS = 30

# ROI (Drop Zone) Normalized Coordinates [ymin, xmin, ymax, xmax] (0.0 ~ 1.0)
# 화면 중앙 하단 투입구 영역
ROI_NORMALIZED = [0.30, 0.25, 0.95, 0.75]

# Vision Model Settings
MODEL_NAME = "yolov8s-worldv2.pt"  # Ultralytics Zero-Shot Model
CONFIDENCE_THRESHOLD = 0.35
IOU_THRESHOLD = 0.45

# Zero-Shot Detection Classes Prompt
ZERO_SHOT_CLASSES = [
    # Sharps
    "syringe", "needle", "scissors", "scalpel", "knife", "blade", "glass vial",
    # Biohazard Candidates
    "gauze", "blood tissue", "medical glove", "tubing",
    # Clean Packaging / Plastics
    "plastic bottle", "plastic bag", "blister pack", "plastic packaging", "sterile wrap", "plastic tray",
    # Clean Paper
    "paper box", "cardboard box", "paper"
]

# HSV Blood/Contamination Color Filter Ranges
# Red wrap-around in HSV space
HSV_RED_LOWER1 = (0, 70, 40)
HSV_RED_UPPER1 = (10, 255, 255)
HSV_RED_LOWER2 = (165, 70, 40)
HSV_RED_UPPER2 = (180, 255, 255)
CONTAMINATION_RATIO_THRESHOLD = 0.08  # 8% 이상 붉은 픽셀이면 오염으로 판정

# Tracking & Debouncing Parameters
DROP_CONFIRM_FRAMES = 3   # ROI 내에서 연속으로 몇 프레임 감지되어야 투입 시작으로 인정할지
DISAPPEAR_FRAMES = 5      # 감지되던 객체가 사라진 후 몇 프레임 뒤에 Drop 완료로 확정할지

```

---

### 4.2 `shared/schemas.py`

```python
from datetime import datetime, timezone
from enum import Enum
import uuid
from pydantic import BaseModel, Field

class MaterialCategory(str, Enum):
    CLEAN_PLASTIC = "Clean_Plastic"
    CLEAN_PAPER = "Clean_Paper"
    BIOHAZARD_INFECTIOUS = "Biohazard_Infectious"
    SHARPS_HAZARD = "Sharps_Hazard"
    UNKNOWN = "Unknown"

class TargetBinType(str, Enum):
    YELLOW_BIOHAZARD = "Yellow_Biohazard"
    GENERAL_RECYCLE = "General_Recycle"
    SHARPS_CONTAINER = "Sharps_Container"

class WasteDropEvent(BaseModel):
    event_id: str = Field(default_factory=lambda: f"EVT_{uuid.uuid4().hex[:8].upper()}")
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    theatre_id: str = "OR_03"
    target_bin: TargetBinType = TargetBinType.YELLOW_BIOHAZARD
    detected_category: MaterialCategory
    confidence: float
    is_contaminated: bool
    is_misclassified: bool
    details: dict = Field(default_factory=dict)

```

---

### 4.3 `vision/detector.py`

**핵심 책임**:

1. `ultralytics.YOLO`를 통해 `yolov8s-worldv2.pt` 로드 및 `set_classes(ZERO_SHOT_CLASSES)` 초기화.
2. 프레임의 ROI 영역을 자른 뒤 객체 탐지 실행.
3. 바운딩 박스 내부 BGR 이미지를 HSV로 변환하여 붉은색 마스크 비율 계산.
4. 규칙에 따라 최종 `MaterialCategory` 결정.

**세부 구현 로직**:

```python
import cv2
import numpy as np
from ultralytics import YOLO
from config.settings import (
    MODEL_NAME, ZERO_SHOT_CLASSES, CONFIDENCE_THRESHOLD,
    HSV_RED_LOWER1, HSV_RED_UPPER1, HSV_RED_LOWER2, HSV_RED_UPPER2,
    CONTAMINATION_RATIO_THRESHOLD
)
from shared.schemas import MaterialCategory

class WasteDetector:
    def __init__(self):
        self.model = YOLO(MODEL_NAME)
        # YOLO-World 커스텀 클래스 주입
        self.model.set_classes(ZERO_SHOT_CLASSES)
        
        self.sharps_keywords = {"syringe", "needle", "scissors", "scalpel", "knife", "blade", "glass vial"}
        self.paper_keywords = {"paper box", "cardboard box", "paper"}
        self.plastic_keywords = {"plastic bottle", "plastic bag", "blister pack", "plastic packaging", "sterile wrap", "plastic tray"}

    def check_blood_contamination(self, crop_bgr: np.ndarray) -> tuple[bool, float]:
        """HSV 색 공간에서 붉은색 픽셀 비율 분석"""
        if crop_bgr.size == 0:
            return False, 0.0
            
        hsv = cv2.cvtColor(crop_bgr, cv2.COLOR_BGR2HSV)
        mask1 = cv2.inRange(hsv, np.array(HSV_RED_LOWER1), np.array(HSV_RED_UPPER1))
        mask2 = cv2.inRange(hsv, np.array(HSV_RED_LOWER2), np.array(HSV_RED_UPPER2))
        combined_mask = cv2.bitwise_or(mask1, mask2)
        
        red_pixel_count = np.count_nonzero(combined_mask)
        total_pixel_count = crop_bgr.shape[0] * crop_bgr.shape[1]
        ratio = red_pixel_count / max(total_pixel_count, 1)
        
        is_contaminated = ratio >= CONTAMINATION_RATIO_THRESHOLD
        return is_contaminated, float(ratio)

    def classify_detection(self, label: str, crop_bgr: np.ndarray, conf: float) -> tuple[MaterialCategory, bool, float]:
        label_lower = label.lower()
        is_contaminated, red_ratio = self.check_blood_contamination(crop_bgr)
        
        # 1. Sharps 우선 판정
        if any(k in label_lower for k in self.sharps_keywords):
            return MaterialCategory.SHARPS_HAZARD, is_contaminated, red_ratio
            
        # 2. 혈액/체액 오염 판정
        if is_contaminated or "gauze" in label_lower or "blood" in label_lower:
            return MaterialCategory.BIOHAZARD_INFECTIOUS, True, red_ratio
            
        # 3. 무오염 종이/박스 판정
        if any(k in label_lower for k in self.paper_keywords):
            return MaterialCategory.CLEAN_PAPER, False, red_ratio
            
        # 4. 무오염 플라스틱 판정
        if any(k in label_lower for k in self.plastic_keywords):
            return MaterialCategory.CLEAN_PLASTIC, False, red_ratio
            
        # 기본값 (플라스틱/미분류)
        return MaterialCategory.CLEAN_PLASTIC, False, red_ratio

```

---

### 4.4 `vision/tracker.py`

**핵심 책임**:

* 사람이 손으로 물건을 들고 흔들거나 카메라 앞에서 정지해 있을 때 중복 카운트되는 현상을 방지(Debouncing).
* 상태 머신(State Machine): `IDLE` $\rightarrow$ `OBJECT_PRESENT` (연속 N프레임 감지) $\rightarrow$ `DROPPED` (객체가 사라짐) $\rightarrow$ **이벤트 로깅 트리거**.

```python
import json
from datetime import datetime, timezone
from shared.schemas import WasteDropEvent, MaterialCategory, TargetBinType
from config.settings import DROP_CONFIRM_FRAMES, DISAPPEAR_FRAMES, EVENT_LOG_PATH

class DropEventTracker:
    def __init__(self, target_bin: TargetBinType = TargetBinType.YELLOW_BIOHAZARD):
        self.target_bin = target_bin
        self.state = "IDLE"  # IDLE, TRACKING, COOLDOWN
        self.present_frame_count = 0
        self.missing_frame_count = 0
        self.candidate_detections = []

    def update(self, detections: list[dict]) -> WasteDropEvent | None:
        """
        detections: [{'category': MaterialCategory, 'conf': float, 'is_contaminated': bool, 'box': [...]}]
        """
        if detections:
            self.present_frame_count += 1
            self.missing_frame_count = 0
            # 후보군 누적 (가장 빈도 높은 클래스 결정을 위함)
            self.candidate_detections.extend(detections)
            
            if self.present_frame_count >= DROP_CONFIRM_FRAMES:
                self.state = "TRACKING"
        else:
            if self.state == "TRACKING":
                self.missing_frame_count += 1
                if self.missing_frame_count >= DISAPPEAR_FRAMES:
                    # 객체가 완전히 투입되어 사라짐 -> 이벤트 발생!
                    event = self._commit_event()
                    self._reset()
                    return event
            else:
                self._reset()
        return None

    def _commit_event(self) -> WasteDropEvent:
        # 가장 높은 confidence의 감지 결과 선택
        best_det = max(self.candidate_detections, key=lambda x: x["conf"])
        cat = best_det["category"]
        
        # 오분류 여부 판정: 노란통(Yellow_Biohazard)에 Clean_Plastic 또는 Clean_Paper가 들어가면 오분류
        is_misclassified = False
        if self.target_bin == TargetBinType.YELLOW_BIOHAZARD:
            if cat in [MaterialCategory.CLEAN_PLASTIC, MaterialCategory.CLEAN_PAPER]:
                is_misclassified = True

        event = WasteDropEvent(
            theatre_id="OR_03",
            target_bin=self.target_bin,
            detected_category=cat,
            confidence=best_det["conf"],
            is_contaminated=best_det["is_contaminated"],
            is_misclassified=is_misclassified,
            details={"red_ratio": best_det.get("red_ratio", 0.0)}
        )
        
        # 파일에 저장 (JSONL Append)
        with open(EVENT_LOG_PATH, "a", encoding="utf-8") as f:
            f.write(event.model_dump_json() + "\n")
            
        return event

    def _reset(self):
        self.state = "IDLE"
        self.present_frame_count = 0
        self.missing_frame_count = 0
        self.candidate_detections.clear()

```

---

### 4.5 `vision/visualizer.py`

**핵심 책임**:

* 메인 화면에 ROI 박스 및 상태 HUD 표시.
* 클래스별 색상 매핑:
* `Clean_Plastic`: **초록색 (Green)**
* `Clean_Paper`: **파란색 (Blue)**
* `Biohazard_Infectious`: **주황/노란색 (Orange/Yellow)**
* `Sharps_Hazard`: **적색 점멸 (Red Blink)**


* 오투기 발생 시 화면 테두리에 시각적 경고 펄스 효과 렌더링.

---

### 4.6 `run_vision.py` (엔트리포인트 실행 루프)

```python
import cv2
from config.settings import CAMERA_INDEX, FRAME_WIDTH, FRAME_HEIGHT, ROI_NORMALIZED
from vision.camera import CameraStream
from vision.detector import WasteDetector
from vision.tracker import DropEventTracker
from vision.visualizer import render_hud

def main():
    cam = CameraStream(index=CAMERA_INDEX, width=FRAME_WIDTH, height=FRAME_HEIGHT).start()
    detector = WasteDetector()
    tracker = DropEventTracker()
    
    print("🚀 Tier 1 Vision System Active. Press 'q' to exit.")
    
    while True:
        frame = cam.read()
        if frame is None:
            continue
            
        # 1. ROI 좌표 계산
        h, w = frame.shape[:2]
        ymin, xmin, ymax, xmax = [
            int(ROI_NORMALIZED[0] * h), int(ROI_NORMALIZED[1] * w),
            int(ROI_NORMALIZED[2] * h), int(ROI_NORMALIZED[3] * w)
        ]
        roi_crop = frame[ymin:ymax, xmin:xmax]
        
        # 2. 사물 추론
        results = detector.model(roi_crop, conf=0.35, verbose=False)[0]
        detections = []
        
        for box in results.boxes:
            bx1, by1, bx2, by2 = map(int, box.xyxy[0].tolist())
            conf = float(box.conf[0])
            cls_id = int(box.cls[0])
            label = detector.model.names[cls_id]
            
            item_crop = roi_crop[by1:by2, bx1:bx2]
            category, is_contaminated, red_ratio = detector.classify_detection(label, item_crop, conf)
            
            detections.append({
                "category": category,
                "conf": conf,
                "is_contaminated": is_contaminated,
                "red_ratio": red_ratio,
                "box": [xmin + bx1, ymin + by1, xmin + bx2, ymin + by2],
                "label": label
            })
            
        # 3. 투기 이벤트 트래킹
        event = tracker.update(detections)
        if event:
            print(f"🔥 [DROP EVENT LOGGED] {event.detected_category.value} | Misclassified: {event.is_misclassified}")
            
        # 4. 시각화
        display_frame = render_hud(frame, detections, [xmin, ymin, xmax, ymax], tracker.state, event)
        cv2.imshow("Smart MedWaste Tier 1 Vision", display_frame)
        
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break
            
    cam.stop()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    main()

```

---

## 5. 실행 및 검증 절차

1. **실행 명령**:
```bash
uv run run_vision.py

```


2. **소품을 활용한 4단계 시연 검증**:
* **생수병 / 투명 비닐봉지 투입**: `Clean_Plastic` 인식 $\rightarrow$ 녹색 박스 $\rightarrow$ `is_misclassified: true` 로그 적재.
* **종이 상자 / 메모지 투입**: `Clean_Paper` 인식 $\rightarrow$ 파란색 박스 $\rightarrow$ `is_misclassified: true` 로그 적재.
* **붉은 마커를 칠한 거즈/휴지 투입**: HSV 오염도 $\ge 10\%$ $\rightarrow$ `Biohazard_Infectious` 인식 $\rightarrow$ 주황색 박스 $\rightarrow$ `is_misclassified: false` 로그 적재.
* **가위 / 커터칼 투입**: `Sharps_Hazard` 즉각 인식 $\rightarrow$ 적색 점멸 경고.


3. **로그 검증**: `data/events.jsonl` 파일에 규격화된 JSON 라인이 정상 생성되는지 확인.