# 수술실 폐기물 4대 성상 비전 분류 시스템 (Tier 1) 구현 워크스루

수술실 스마트 폐기물 인프라의 **Tier 1 (실시간 배출 순간 엣지 비전 감지 & 디바운싱)** 모듈 구현 및 검증을 완료하였습니다.

---

## 1. 구현된 시스템 구조

```
/Users/cheonsejun/Developer/Hackathon/
├── config/
│   ├── __init__.py
│   └── settings.py          # 모델 가중치, 카메라 설정, ROI 좌표, HSV 임계값, 디바운스 파라미터
├── shared/
│   ├── __init__.py
│   └── schemas.py           # MaterialCategory, TargetBinType, WasteDropEvent Pydantic 스키마
├── vision/
│   ├── __init__.py
│   ├── camera.py            # 스레드 기반 웹캠/비디오 스트림 리더 (버퍼 랙 최소화)
│   ├── detector.py          # YOLO-World Zero-Shot + HSV 2채널 혈액/체액 오염 분석 엔진
│   ├── tracker.py           # 상태 머신 기반 투기 감지, 디바운서, instant flush/fsync 로거
│   └── visualizer.py        # HUD, 바운딩 박스, ROI 가이드, 오투기 경고 배너 렌더러
├── tests/
│   └── test_vision_pipeline.py # 4개 핵심 모듈 통합 단위 테스트
├── data/
│   └── events.jsonl         # 실시간 디스크 동기화되는 JSONL 로그 파일
└── run_vision.py            # CLI 옵션 지원 메인 실행 엔트리포인트
```

---

## 2. 주요 핵심 기능 및 피드백 반영 사항

### 2.1 4대 성상 계층적 분류 파이프라인
1. **`Sharps_Hazard` (최우선 순위)**:
   - 주사기(`syringe`), 바늘(`needle`), 가위(`scissors`), 메스(`scalpel`), 앰플/바이알 등 감지 시 최우선 판정 및 위험 경고.
2. **`Biohazard_Infectious` (감염성 폐기물)**:
   - BBox 내부 HSV 2채널(Hue 0~10 및 165~180) 붉은색 마스크 비율이 8% 이상(`CONTAMINATION_RATIO_THRESHOLD = 0.08`)이거나 거즈/오염 티슈/혈액 키워드 검출 시 감염성으로 판정.
3. **`Clean_Paper` (무오염 종이/박스)**:
   - 멸균 소모품 포장 박스, 종이 매뉴얼 등 감지.
4. **`Clean_Plastic` (무오염 플라스틱)**:
   - 비닐 포장지, 블리스터 팩, 멸균 랩, 플라스틱 트레이 등 감지.

### 2.2 사용자 피드백 3대 요구사항 완벽 반영
1. **모델 Fallback 및 옵션 지원**:
   - 경량 Zero-shot 모델 `yolov8s-worldv2.pt` 기본 탑재 및 CLI 인자(`--model`)로 모델 교체 지원.
2. **빠른 투하(모션 블러) 대응**:
   - `DROP_CONFIRM_FRAMES = 2`, `DISAPPEAR_FRAMES = 4`로 타이트하게 설정하여 쓰레기를 0.3초 만에 투입해도 놓치지 않고 안정적으로 감지.
3. **대시보드 실시간 연동을 위한 디스크 즉시 동기화**:
   - `_write_event_to_disk`에서 `f.flush()` 및 `os.fsync(f.fileno())`를 적용하여 버퍼에 머물지 않고 디스크에 즉시 물리적으로 기록.

---

## 3. 검증 및 테스트 결과

`tests/test_vision_pipeline.py`를 통한 4대 핵심 기능 테스트 전원 통과:

```text
--- [Test 1] HSV Blood / Contamination Heuristic Test ---
Clean patch -> Contaminated: False, Red ratio: 0.0000
Blood stained patch -> Contaminated: True, Red ratio: 0.3600
✅ HSV Blood Detection Test Passed!

--- [Test 2] 4-Tier Hierarchical Classification Logic Test ---
[WasteDetector] Loading YOLO-World model: yolov8s-worldv2.pt...
[WasteDetector] Setting zero-shot vocabulary (28 classes)...
[WasteDetector] Model ready.
✅ 4-Tier Classification Logic Test Passed!

--- [Test 3] Tracker Debouncing & Instant Fsync Test ---
Logged JSON line: {"event_id":"EVT_CC9145E4","timestamp":"2026-08-23T14:17:10.745281+00:00","theatre_id":"OR_03","target_bin":"Yellow_Biohazard","detected_category":"Clean_Plastic","confidence":0.88,"is_contaminated":false,"is_misclassified":true,"details":{"red_ratio":0.01,"label":"plastic bottle","sample_count":2}}
✅ Tracker Debouncing and Fsync Test Passed!

--- [Test 4] Visualizer Render Test ---
✅ Visualizer Render Test Passed!

🎉 ALL TESTS PASSED SUCCESSFULLY!
```

---

## 4. 실행 방법

### 기본 웹캠(0번)으로 실행
```bash
uv run python run_vision.py
```

### 비디오 파일 또는 특정 쓰레기통 지정 실행
```bash
# 비디오 파일 입력 예시
uv run python run_vision.py --source sample_video.mp4

# 일반 재활용 쓰레기통(General_Recycle) 기준 실행
uv run python run_vision.py --bin General_Recycle --theatre OR_01
```

### 핫키 안내
- `q`: 프로그램 안전 종료
- `s`: 현재 화면 스크린샷 캡처 및 저장
