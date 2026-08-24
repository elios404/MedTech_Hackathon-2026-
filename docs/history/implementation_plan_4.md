# .gitignore 보강 및 프로젝트 구조 리팩토링 구현 계획서

프로젝트의 유지보수성, 배포 안정성, 그리고 임포트/경로 에러 제로(Zero Import Error)를 보장하는 **현업 표준 클린 아키텍처(Clean Multi-Module Architecture)** 및 `.gitignore` 고도화 계획입니다.

---

## 1. `.gitignore` 추가 권장 항목

현재 `.gitignore`에는 기본적인 파이썬 및 `node_modules/`, `data/`만 지정되어 있습니다. Next.js 빌드 산출물, 대용량 학습 가중치, OS 및 IDE 캐시가 깃에 커밋되지 않도록 다음 항목들을 체계적으로 분류하여 추가합니다.

### 추가 대상 목록
```gitignore
# === Operating System ===
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# === Python & Virtual Environments ===
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
build/
develop-eggs/
dist/
downloads/
eggs/
.eggs/
lib/
lib64/
parts/
sdist/
var/
wheels/
*.egg-info/
.installed.cfg
*.egg
.pytest_cache/
.ruff_cache/
.venv/
env/
venv/

# === Machine Learning & Weights ===
# 대용량 학습 런로그 및 원본 가중치 제외 (단, 배포용 models/medwaste_yolov8_cls.pt는 유지 가능)
runs/
weights/
*.onnx
yolov8*.pt
!models/medwaste_yolov8_cls.pt

# === Next.js & Frontend (dashboard) ===
dashboard/.next/
dashboard/out/
dashboard/build/
dashboard/node_modules/
node_modules/
*.tsbuildinfo
.next/
out/
.npm/

# === Data & Test Artifacts ===
data/
test_results/
*.log

# === Environment Variables & Local Configs ===
.env
.env*.local
.idea/
.vscode/
*.swp
```

---

## 2. 프로젝트 디렉터리 구조 리팩토링 계획

### [현재 상태 (As-Is)]
- 루트 디렉터리에 비전 실행 파일(`run_vision.py`, `run_demo_simulation.py`, `test_images.py`), 문서(`Concept.md`, `VisionModel_Plan.md`, `dashboard_Plan.md`, `Implementation_Plan/`), 임시 가중치(`yolov8s-cls.pt`, `yolov8s-worldv2.pt`), 빈 폴더(`src/hackathon`)가 뒤섞여 있음.
- `vision/`, `config/`, `shared/`, `scripts/`가 루트에 개별 노출되어 모듈화 수준이 낮음.

### [개편 목표 (To-Be)]
```
.
├── dashboard/                  # [Frontend / Tier 3] Next.js 14 SaaS 대시보드
│   ├── app/
│   ├── components/
│   ├── lib/
│   ├── types/
│   └── package.json
│
├── vision_system/              # [AI & Backend / Tier 1] 비전 파이프라인 핵심 패키지
│   ├── __init__.py
│   ├── config/                 # 카메라 ROI, 모델 경로, HSV 임계값
│   │   ├── __init__.py
│   │   └── settings.py
│   ├── core/                   # 핵심 추론 및 렌더링 엔진 (구 vision/)
│   │   ├── __init__.py
│   │   ├── camera.py           # 스레드 무지연 웹캠 캡처
│   │   ├── detector.py         # YOLOv8-cls & YOLO-World 하이브리드 엔진
│   │   ├── tracker.py          # 투기 디바운스 상태 머신 & fsync 로거
│   │   └── visualizer.py       # 실시간 OpenCV HUD 렌더러
│   ├── shared/                 # 데이터 스키마 및 공통 유틸리티
│   │   ├── __init__.py
│   │   └── schemas.py
│   └── scripts/                # 데이터셋 전처리, 학습, 평가 도구
│       ├── __init__.py
│       ├── prepare_dataset.py
│       ├── train_classifier.py
│       ├── evaluate_model.py
│       └── test_images.py
│
├── run_vision.py               # [CLI 1] 실시간 웹캠 비전 진입점 (Clean Entrypoint)
├── run_demo_simulation.py      # [CLI 2] 사진 인스펙션 인터랙티브 시뮬레이터 (Clean Entrypoint)
│
├── models/                     # [Model Artifacts] 배포용 파인튜닝 가중치 (medwaste_yolov8_cls.pt)
│
├── docs/                       # [Documentation] 기획 및 설계 문서 통합
│   ├── Concept.md              # 3-Tier 폐기물 인텔리전스 인프라 목표
│   ├── VisionModel_Plan.md     # Tier 1 비전 엔진 개발 명세
│   ├── Dashboard_Plan.md       # Tier 3 대시보드 기획 명세
│   └── history/                # 과거 계획/워크스루 아카이브
│       ├── implementation_plan_1.md
│       └── ...
│
├── tests/                      # [Tests] 파이프라인 유닛 및 통합 테스트
│   └── test_vision_pipeline.py
│
├── .gitignore
├── pyproject.toml
└── README.md
```

---

## 3. 경로/임포트 에러 방지 핵심 안전장치 (Zero-Breakage Guarantee)

1. **`vision_system/config/settings.py` 경로 계산 표준화**:
   - `BASE_DIR = Path(__file__).resolve().parent.parent.parent` (프로젝트 루트 고정)
   - `MODEL_PATH = BASE_DIR / "models" / "medwaste_yolov8_cls.pt"`
   - `LOG_FILE = BASE_DIR / "data" / "events.jsonl"`
   - 실행 위치(어느 디렉터리에서 명령어를 실행하든)와 무관하게 항상 프로젝트 루트를 기준으로 절대 경로가 자동 계산되도록 일원화합니다.
2. **패키지 임포트 절대/상대 경로 통일**:
   - 루트 진입점(`run_vision.py`, `run_demo_simulation.py`)은 `from vision_system.core.detector import WasteDetector` 형태로 직관적이고 깔끔하게 호출.
   - 내부 모듈 간에는 `from vision_system.config.settings import ...`, `from vision_system.shared.schemas import ...`로 통일.
3. **대시보드 API (`dashboard/app/api/events/route.ts`) 연동 무결성**:
   - 대시보드는 이미 프로젝트 루트의 `data/events.jsonl`을 상위 탐색(`path.resolve(process.cwd(), "..", "data", "events.jsonl")`)하고 있어 디렉터리 개편 후에도 100% 정상 작동합니다.
4. **미사용 레거시 정리**:
   - 빈 폴더 `src/hackathon` 삭제
   - 루트에 방치된 임시 가중치 `yolov8s-cls.pt`, `yolov8s-worldv2.pt`는 `weights/`로 이동하거나 `.gitignore` 처리하여 루트를 완전히 깨끗하게 정리.

---

## 4. 검증 계획 (Verification Plan)

1. **비전 진입점 실행 검증**:
   - `uv run python run_demo_simulation.py` 실행하여 사진 로드, BBox 추론, ROI 렌더링 정상 동작 확인.
   - `uv run python run_vision.py` 문법 및 모듈 임포트 검증.
2. **테스트 스크립트 실행 검증**:
   - `uv run python tests/test_vision_pipeline.py` 실행하여 유닛 테스트 통과 확인.
3. **대시보드 빌드 및 연동 검증**:
   - `cd dashboard && npm run build` 정상 완료 확인 및 `/api/events` 응답 검증.
