# 호주 수술실 폐기물 인텔리전스 SaaS 대시보드 (Tier 3) 구현 계획

호주 공공병원(SA Health Royal Adelaide Hospital 등)의 임상 안전 규정(AS/NZS 3816)과 ESG 폐기물 감축 목표를 지원하는 **엔터프라이즈 헬스케어 SaaS 대시보드(Next.js 14 App Router, TypeScript, Tailwind CSS, Recharts)**를 구축합니다.

---

## 1. 아키텍처 및 시스템 구성도

```mermaid
flowchart TD
    subgraph DataLayer [데이터 파이프라인]
        T1["Tier 1: 엣지 비전 실시간 로그\n(data/events.jsonl)"]
        T2["Tier 2: 스마트 카트 수거 로그\n(무게 kg + 부피 L → 밀도 kg/L)"]
        EMR["EMR: 수술 3단계 시간표\n(세팅기 / 집도기 / 정리기)"]
        VEND["수거업체 청구 데이터\n(Cleanaway / Daniels)"]
    end

    subgraph NextBackend [Next.js API Routes]
        API_STREAM["/api/events/stream\n(events.jsonl 실시간 파일 읽기)"]
        API_DATA["/api/dashboard/stats\n(종합 통계 & 분석 엔진)"]
    end

    subgraph FrontendApp [Next.js App Router (dashboard/)]
        LAYOUT["Enterprise Layout\n(사이드바, 탑 헤더, 병원/기간 셀렉터, 비전 상태 뱃지)"]
        V1["/overview\n(경영진 종합 요약 KPI, 월별 추이, 진료과별 비율)"]
        V2["/theatres\n(수술실별 현황, 수술 3단계별 오투기 도넛, 타임라인)"]
        V3["/audit\n(벌크 밀도 산점도, AS/NZS 3816 이상 봉투 격리 Drawer)"]
        V4["/reconciliation\n(위탁 청구 대조표, 정산 차액 검증, ESG PDF 리포트)"]
    end

    T1 --> API_STREAM
    T2 & EMR & VEND --> API_DATA
    API_STREAM & API_DATA --> LAYOUT
    LAYOUT --> V1 & V2 & V3 & V4
```

---

## 2. 디자인 시스템 및 테마 가이드라인 (Authentic Healthcare B2B)

- **디자인 컨셉**: Epic, Samsara, Carbonly.ai 스타일의 정갈하고 데이터 밀도 높은 Slate/Zinc 엔터프라이즈 인터페이스.
- **배색 시스템**:
  - `Background & Cards`: Dark Slate (`#0B0F19`, `#111827`, `#1F2937`) / Clean Light 지원
  - `Normal & Scope 3 ESG`: Emerald (`#10B981`, `#059669`) — 온실가스 절감, 정상 분리배출
  - `Warning & Plastic Misclass`: Amber (`#F59E0B`, `#D97706`) — 비용 누수 오투기
  - `Critical Hazard & Infection`: Crimson (`#EF4444`, `#DC2626`) — AS/NZS 3816 규정 위반, 체액 유출, 손상성 위험
  - `Data Metric Accent`: Medical Cyan/Blue (`#0EA5E9`)
- **타이포그래피 및 포맷팅**:
  - 인터(Inter) 기반 산세리프 폰트
  - 모든 수치에 정확한 단위 명기 (`kg`, `L`, `$AUD`, `tCO₂-e`, `%`)

---

## 3. 디렉토리 구조 및 세부 구현 내용

```text
dashboard/
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── app/
│   ├── layout.tsx                # 글로벌 엔터프라이즈 사이드바 & 헤더 레이아웃
│   ├── globals.css               # Slate 테마 및 차트 토큰
│   ├── page.tsx                  # /overview 로 리다이렉트
│   ├── overview/page.tsx         # [View 1] 경영진 종합 요약
│   ├── theatres/page.tsx         # [View 2] 수술실별 현장 운영 분석
│   ├── audit/page.tsx            # [View 3] 스마트 카트 물류 감사 & 이상 로그
│   ├── reconciliation/page.tsx   # [View 4] 위탁업체 정산 & ESG 리포트
│   └── api/
│       ├── events/route.ts       # events.jsonl 실시간 스트림/폴링 API
│       └── stats/route.ts        # 종합 분석 데이터 제공 API
├── components/
│   ├── layout/
│   │   ├── sidebar.tsx           # 좌측 네비게이션
│   │   └── header.tsx            # 상단 병원 선택, 기간 필터, 비전 연결 상태
│   ├── ui/                       # 카드, 버튼, 뱃지, 테이블, Drawer, 모달
│   ├── overview/                 # View 1 전용 차트 및 메트릭 컴포넌트
│   ├── theatres/                 # View 2 전용 그리드 및 3단계 도넛 차트
│   ├── audit/                    # View 3 전용 밀도 산점도 및 Drawer
│   └── reconciliation/           # View 4 전용 청구 대조표 및 PDF 내보내기
├── lib/
│   ├── mock-data.ts              # 호주 12개 수술실 1개월치 현실적 EMR/카트/청구 Mock 엔진
│   └── utils.ts                  # 화폐($AUD), 무게(kg), 밀도 계산 포맷터
└── types/
    ├── waste.ts                  # Tier 2, EMR, Vendor, Audit 스키마
    └── vision.ts                 # Tier 1 Vision Event 스키마
```

---

## 4. 4대 핵심 화면(Views) 상세 사양

### View 1: 경영진 종합 요약 (`/overview`)
- **KPI 카드 4종**:
  - `월간 총 폐기물량` (kg) + 전월 대비 증감률
  - `감염성 폐기물 비율` (%) + 목표치 달성도
  - `오분류 추정 손실 비용` ($AUD, 소각 단가 차액 기반)
  - `Scope 3 온실가스 감축량` ($tCO_2\text{-e}$, 소각 감축 기반)
- **월별 추이 콤보 차트**: 감염성/일반 발생량(Bar) + 총 처리비용(Line) 이중 축
- **진료과별 감염성 비율**: 정형외과, 신경외과, 일반외과 등 위험도 순 가로 바 차트

### View 2: 수술실별 현장 운영 분석 (`/theatres`)
- **수술실 12개실 종합 그리드 (OT01 ~ OT12)**:
  - 수술실 ID, 진료과, 오분류 위험도(SCI %), 총 배출량, 상태 뱃지 (Normal / Warning / Critical)
- **수술 3단계(Phase 1~3) 오투기 도넛 차트**:
  - Phase 1 (세팅기: 80% 집중) vs Phase 2 (집도기) vs Phase 3 (정리기)
  - "OR 3호실 세팅 단계 비닐 오투기 집중 $\rightarrow$ 간호사 동선 옆 분리수거통 재배치" 액션 인사이트 표시
- **시간대별 배출 타임라인 차트**: 08:00 ~ 18:00 시간대별 무오염 플라스틱 vs 체액 오염물 스택 영역 차트

### View 3: 스마트 카트 물류 감사 & 이상 로그 (`/audit`)
- **비파괴 벌크 밀도 산점도 (Bulk Density Scatter Plot)**:
  - X축: 체적 (0~100 L), Y축: 중량 (0~30 kg)
  - 기준선 1: $\rho = 0.08\,\text{kg/L}$ (저밀도 오투기 — 비닐/공기만 찬 봉투)
  - 기준선 2: $\rho = 0.70\,\text{kg/L}$ (고밀도 체액 유출 위험 — AS/NZS 3816 규정 위반)
- **이상치 봉투 감사 테이블 & Detail Drawer**:
  - 클릭 시 해당 봉투의 RFID, 배출 수술실, 수거 시각, 밀도 상세 및 격리(Quarantine) 처리 버튼 제공

### View 4: 위탁업체 정산 & ESG 리포트 (`/reconciliation`)
- **정산 오차 요약 카드**: 청구 차액($AUD), 중량 오차(kg), 과다 청구(Overbilling) 감지율
- **청구 대조 테이블**:
  - Cleanaway / Daniels 수거업체 청구 중량 vs Tier 2 카트 실측 중량
  - 청구 금액 vs 실측 기반 재산출 금액, 오차율 및 감사 상태
- **ESG & 주정부 보고서 기능**:
  - SA Health 공인 "Green Theatres Report" PDF 다운로드 모의 인터랙션

---

## 5. 단계별 실행 계획

1. **[Phase 1] 프로젝트 초기화 및 기반 구축**:
   - `dashboard/` 폴더에 Next.js 14 App Router, Tailwind CSS, Lucide React, Recharts 설치
   - `types/`, `lib/utils.ts`, `lib/mock-data.ts` (12개 수술실 1개월 데이터 생성기) 작성
2. **[Phase 2] 엔터프라이즈 레이아웃 & 네비게이션**:
   - 사이드바, 탑 헤더(병원 선택, 날짜 필터, 비전 연결 상태 배지) 구축
3. **[Phase 3] 4대 핵심 화면 순차 개발**:
   - `/overview` $\rightarrow$ `/theatres` $\rightarrow$ `/audit` $\rightarrow$ `/reconciliation`
4. **[Phase 4] 실시간 Tier 1 비전 연동 & 시각화**:
   - `data/events.jsonl` 파일 읽기 API Route 구현
   - 라이브 비전 이벤트 발생 시 Toast 알림 및 대시보드 실시간 카운트 갱신
5. **[Phase 5] 빌드 검증 및 최종 점검**:
   - Next.js 프로덕션 빌드 (`npm run build`) 무결성 확인 및 로컬 데브 서버 구동 검증

---

## 6. 검증 계획

### 6.1 빌드 및 타입 검증
- `cd dashboard && npm run build` 실행을 통해 TypeScript 타입 에러 및 린트 0건 확인

### 6.2 기능 및 인터랙션 검증
- 4개 화면 간 네비게이션 이동 및 차트 렌더링 확인
- 브라우저 서브에이전트 또는 로컬 뷰어를 통한 다크 테마 시각적 퀄리티 및 반응형 레이아웃 검증
- `run_demo_simulation.py`로 이벤트 발생 시 대시보드 실시간 Toast 알림 연동 확인
