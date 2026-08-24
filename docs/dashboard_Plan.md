# [Claude Code Implementation Plan] 호주 수술실 폐기물 인텔리전스 SaaS 대시보드 프로토타입 구축 사양서

본 문서는 Claude Code(AI 코딩 에이전트)가 즉시 프론트엔드 코드베이스를 스캐폴딩하고 개발에 착수할 수 있도록 작성된 구체적 구현 사양서(Implementation Spec)입니다.

실제 엔터프라이즈 헬스케어 SaaS(Epic, Cerner, Samsara, Carbonly.ai 등)의 디자인 시스템과 데이터 시각화 패턴을 반영하여, **Streamlit의 템플릿적 한계를 벗어난 커스텀 웹 애플리케이션 프레임워크** 기반으로 설계되었습니다.

---

## 1. 프레임워크 및 기술 스택 선정

Streamlit은 빠른 시소구현에 유리하지만 표준화된 UI 템플릿 느낌이 강하고 가로 공간 활용, 실시간 스트리밍 UI, 커스텀 시각화 레이아웃에 제약이 큽니다. 실제 B2B 헬스케어 인터페이스 느낌을 제공하기 위해 다음 스택을 채택합니다.

* **Framework**: Next.js 14+ (App Router, React 18, TypeScript)
* **Styling & UI Kit**: Tailwind CSS + Shadcn UI (`@/components/ui`)
* **Icons**: Lucide React
* **Data Visualization**: Recharts (Enterprise Dashboard 관용 차트 라이브러리)
* **State Management / Data Stream**: Zustand (글로벌 상태) + TanStack Query (Server State Mocking)
* **Design Concept**: Modern Dark/Light Clean Enterprise UI (High-density Data Grid, Micro-cards, Neutral Tone + Status Accents)

---

## 2. 기존 AI 비전 모델 연동 규격 (Vision Inference Interface)

이미 구현되어 있는 **Tier 1 엣지 비전 AI 모델**의 결과값을 대시보드가 수신하여 파이프라인에 태우기 위한 데이터 컨트랙트(Data Contract)입니다.

### 2.1 비전 모델 추론 출력 데이터 스키마 (JSON)

비전 모델이 배출 이벤트 감지 시 프론트엔드 mock WebSocket / Event Stream으로 발행(Publish)하는 페이로드 규격입니다.

```typescript
// types/vision.ts
export type DetectedCategory = 
  | 'SOFT_PLASTIC' 
  | 'HARD_PLASTIC' 
  | 'PAPER_CARD' 
  | 'FLUID_SOILED' 
  | 'SHARPS' 
  | 'UNKNOWN';

export interface VisionInferenceEvent {
  eventId: string;             // UUIDv4
  timestamp: string;           // ISO8601 (e.g. "2026-08-24T10:15:22.120Z")
  binId: string;               // e.g. "BIN-OT04-YELLOW-01"
  theatreId: string;           // e.g. "OT04" (binId 매핑 기반 자동 추출)
  detectedCategory: DetectedCategory;
  confidenceScore: number;     // 0.00 ~ 1.00
  proximityDurationSec: number;// 상부 체류 시간(초)
  hasContaminationRisk: boolean; // 체액/손상성 물질 포함 여부
}

```

---

## 3. 핵심 데이터 구조 및 파생 연산 로직 (TypeScript Schemas)

시스템은 복잡한 외부 센서 없이 **[Tier 1 비전 시각 로그 + Tier 2 카트 중량/부피 로그 + EMR 수술 시간표 CSV]** 3가지 원천 데이터만 조합하여 파생 지표를 산출합니다.

```typescript
// types/waste.ts

// 1. Tier 2 감사 카트 수거 로그
export interface Tier2BagAudit {
  bagId: string;               // e.g. "BAG-20260824-001"
  rfidTagId: string;
  theatreId: string;           // 배출 수술실 (e.g. "OT04")
  collectedAt: string;         // ISO8601
  binType: 'YELLOW_BIO' | 'BLACK_GENERAL' | 'BLUE_RECYCLE';
  grossWeightKg: number;       // 로드셀 실측 중량
  measuredVolumeL: number;     // 부피 (L)
  bulkDensityKgL: number;      // 연산: grossWeightKg / measuredVolumeL
  anomalyType: 'LOW_DENSITY_MISCLASS' | 'HIGH_DENSITY_FLUID_RISK' | 'NORMAL';
}

// 2. EMR 수술 시간표 (CSV 업로드 or Mock 입력)
export interface EMRSchedule {
  caseId: string;              // e.g. "CASE-ORTHO-1029"
  theatreId: string;           // e.g. "OT04"
  deptName: string;            // e.g. "Orthopaedics"
  procedureName: string;       // e.g. "Total Knee Arthroplasty"
  setupStart: string;          // ISO8601
  incisionStart: string;       // ISO8601 (환자 절개)
  closureStart: string;        // ISO8601 (봉합 시작)
  caseEnd: string;             // ISO8601
}

// 3. 수거업체 청구 대조 데이터
export interface VendorInvoice {
  billingPeriod: string;       // e.g. "2026-07"
  vendorName: 'Cleanaway' | 'Daniels';
  invoicedWeightKg: number;
  actualWeightKg: number;      // Tier 2 누적합
  invoicedAmountAUD: number;
  calculatedAmountAUD: number; // actualWeightKg 기반 재산출
  varianceAUD: number;         // 차액
}

```

### 3.1 수술 단계(Phase) 자동 매핑 연산 로직

`Tier1Event.timestamp`가 `EMRSchedule` 시간선상 어디에 위치하는지 계산하는 유틸리티 함수입니다:

* `timestamp < setupStart`: 수술 전 준비
* `setupStart <= timestamp < incisionStart`: **Phase 1 (Pre-incision Setup)**
* `incisionStart <= timestamp < closureStart`: **Phase 2 (Intra-operative)**
* `closureStart <= timestamp <= caseEnd`: **Phase 3 (Post-op Breakdown)**

---

## 4. 대시보드 IA 및 4개 핵심 화면별 상세 데이터/UI 설계

### View 1: 경영진 종합 요약 대시보드 (`/overview`)

* **목적**: 병원 전체의 폐기물 비용 손실, 오분류 비율, Scope 3 온실가스 감축 성과 요약.

| UI 위젯 | 데이터 필드 및 연산식 | 시각화 형태 |
| --- | --- | --- |
| **KPI 카드 4종** | • `월간 총 폐기물량 (kg)`: $\sum \text{grossWeightKg}$<br>

<br>• `감염성 비율 (%)`: $\frac{\text{Yellow Weight}}{\text{Total Weight}} \times 100$<br>

<br>• `오분류 추정 손실 ($AUD)`: $\text{오분류 중량} \times (3.50 - 0.30)$<br><br>

<br>• `Scope 3 감축량 ($tCO_2\text{-e}$)`: $\text{절감 소각 중량} \times 0.879 / 1000$<br> | Metric Card + 전월 대비 변동률 Badge (`+12.4%`, `-8.1%`) |
| **월별 추이 차트** | • X축: Month (1~12월)<br>

<br>• Y1축(Bar): 감염성/일반 폐기물 발생량 (kg)<br>

<br>• Y2축(Line): 총 처리 비용 ($AUD$) | Recharts `ComposedChart` (이중 축 혼합 그래프) |
| **진료과별 비율** | • X축: 진료과 (`Orthopaedics`, `Neurosurgery` 등)<br>

<br>• Y축: 감염성 폐기물 비율 (%) | Horizontal Bar Chart (위험도 순 정렬) |

---

### View 2: 수술실별 현장 관리 화면 (`/theatres`)

* **목적**: 수간호사(NUM) 및 감염관리실(IPC)이 문제 수술실과 오투기 집중 시간대(세팅기/청소기)를 식별.

| UI 위젯 | 데이터 필드 및 연산식 | 시각화 형태 |
| --- | --- | --- |
| **수술실 현황 Data Grid** | • `theatreId`, `deptName`<br>

<br>• `오분류율 (SCI, %)`: Tier 1 무오염 성상 건수 비율<br>

<br>• `총 배출량 (kg)`<br>

<br>• `상태`: `Normal` (SCI < 20%), `Warning` (20~50%), `Critical` (> 50%) | Shadcn `DataTable` + Status Badge |
| **수술 단계별 오분류** | • Phase 1 (Setup) 오투기 비율 (%)<br>

<br>• Phase 2 (Intra-op) 오투기 비율 (%)<br>

<br>• Phase 3 (Breakdown) 오투기 비율 (%) | Recharts `PieChart` / Donut Chart (센터 텍스트: "Phase 1 지배적") |
| **시간대별 타임라인** | • X축: 시간대 (08:00 ~ 18:00)<br>

<br>• Y축: 투기 이벤트 횟수<br>

<br>• Stack: 무오염 플라스틱 vs 체액 오염물 | Stacked Area Chart (수술 준비 시간대 오투기 폭증 구간 강조) |

---

### View 3: 물류 감사 & 이상 로그 화면 (`/audit`)

* **목적**: Tier 2 카트 실측 데이터 기반 밀도 이상치(저밀도 오투기 / 체액 역유출 위반) 봉투 식별.

| UI 위젯 | 데이터 필드 및 연산식 | 시각화 형태 |
| --- | --- | --- |
| **벌크 밀도 산점도** | • X축: `measuredVolumeL` (0~100 L)<br>

<br>• Y축: `grossWeightKg` (0~30 kg)<br>

<br>• 기준선 1: 저밀도 플라스틱 ($\rho = 0.08\,\text{kg/L}$)<br>

<br>• 기준선 2: 체액 위험 ($\rho = 0.70\,\text{kg/L}$) | Recharts `ScatterChart` + Reference Lines (이상치 노드 붉은색 상라이트) |
| **이상 봉투 리스트** | • `bagId`, `theatreId`, `collectedAt`, `bulkDensityKgL`<br>

<br>• `anomalyType`: `저밀도 오투기(비닐/공기)`, `체액 누출 위험` | Data Table + Detail Drawer (클릭 시 세부 수치 표출) |

---

### View 4: 위탁 정산 & 비용 모니터링 화면 (`/reconciliation`)

* **목적**: 위탁 수거업체(Cleanaway, Daniels 등) 청구서와 원내 실측 데이터(Tier 2) 간 오차 검증 및 감사 로그 제공.



| UI 위젯 | 데이터 필드 및 연산식 | 시각화 형태 |
| --- | --- | --- |
| **정산 오차 Summary** | • `금월 청구 차액 ($AUD)`: Invoiced AUD - Actual AUD<br>

<br>• `중량 오차 (kg)`: Invoiced Weight - Actual Weight | Stat Card (차액 발생 시 Amber/Red 강조) |
| **청구 대조 테이블** | • `billingPeriod`, `vendorName`<br>

<br>• `Tier 2 실측 중량 (kg)` vs `청구 중량 (kg)`<br>

<br>• `계산 금액 ($AUD)` vs `청구 금액 ($AUD)`<br>

<br>• `오차율 (%)` 및 `감사 상태` | Audit Reconciliation Table + "Export Audit PDF" 버튼 |

---

## 5. Claude Code 전용 실행 디렉토리 구조 및 단계별 구현 로드맵

Claude Code가 프롬프트 수신 시 순차적으로 프로젝트를 생성하고 구성할 수 있도록 명확한 파일 구조와 실행 순서를 지정합니다.

### 5.1 파일 시스템 구조 (Project Directory)

/hospital-waste-intelligence
├── app/
│   ├── layout.tsx                # Enterprise Sidebar + Header Layout
│   ├── page.tsx                  # Redirect to /overview
│   ├── overview/page.tsx         # View 1: 경영진 종합 요약
│   ├── theatres/page.tsx         # View 2: 수술실별 현장 분석
│   ├── audit/page.tsx            # View 3: 물류 감사 & 이상 로그
│   └── reconciliation/page.tsx   # View 4: 위탁 정산 & 비용 모니터링
├── components/
│   ├── layout/
│   │   ├── sidebar.tsx           # Navigation Sidebar
│   │   └── header.tsx            # Top Bar (Hospital Select, Date Range)
│   ├── ui/                       # Shadcn UI (button, card, table, badge 등)
│   ├── overview/                 # View 1 전용 위젯
│   ├── theatres/                 # View 2 전용 위젯
│   ├── audit/                    # View 3 전용 위젯
│   └── reconciliation/           # View 4 전용 위젯
├── lib/
│   ├── mock-data.ts              # Tier 1, Tier 2, EMR, Vendor Mock Engine
│   ├── utils.ts                  # Currency/Weight formatters, SCI calculators
│   └── vision-stream.ts          # AI 비전 연동 Mock SSE/Interval Emitter
├── types/
│   ├── waste.ts                  # Tier 2, EMR, Vendor Schemas
│   └── vision.ts                 # Vision Model Interface Schemas
└── package.json

---

### 5.2 Claude Code를 위한 단계별 구현 프롬프트 instructions (Phase 1 ~ 4)

Claude Code 실행 시 아래 단계에 따라 순차적으로 코드를 작성하도록 명령하십시오.

#### Phase 1: 프로젝트 초기화 및 타입/Mock 데이터 구축

1. `Next.js 14 App Router` TypeScript 프로젝트를 스포트하고 `Tailwind CSS`, `Shadcn UI`, `Recharts`, `Lucide React` 패키지를 설치하라.
2. `types/vision.ts`와 `types/waste.ts` 파일에 스키마 정의 코드를 작성하라.
3. `lib/mock-data.ts`에 호주 공공병원(예: SA Health Royal Adelaide Hospital 기준, 12개 수술실 OT01~OT12)의 1개월분 Tier 1, Tier 2, EMR, Vendor Mock 데이터를 세팅하는 생성기를 구현하라.

#### Phase 2: 레이아웃 및 대시보드 프레임 구축

1. `components/layout/sidebar.tsx` 및 `header.tsx`를 구현하여 실제 Enterprise SaaS (Datadog/Samsara 스타일) 패널 레이아웃을 완성하라.
2. 상단 헤더에 `병원 선택(e.g., Royal Adelaide Hospital)`, `날짜 범위 선택기`, `Vision Stream Status indicator (Connected)` 컴포넌트를 배치하라.

#### Phase 3: 4대 핵심 화면 페이지 제작

1. `/overview`: 4개 KPI 카드, Recharts `ComposedChart` 월별 추이, 진료과별 비율 바 차트를 완성하라.
2. `/theatres`: 수술실 현황 `DataTable`, 수술 단계(Phase 1~3) 오투기 비율 `DonutChart`, 시간대별 `StackedAreaChart`를 연동하라.
3. `/audit`: 부피 대비 중량 `ScatterChart`에 $\rho = 0.08\,\text{kg/L}$ 및 $\rho = 0.70\,\text{kg/L}$ Reference Line을 추가하고, 이상치 봉투 `Detail Drawer` 인터랙션을 구현하라.
4. `/reconciliation`: `Actual Weight vs Invoiced Weight` 대조 정산 테이블과 PDF 리포트 다운로드 Mock 버튼을 배치하라.

#### Phase 4: 비전 모델 Mock 스트리밍 인터랙션 추가

1. `lib/vision-stream.ts`에 3초마다 무작위 배출 이벤트(`VisionInferenceEvent`)를 생성하는 라이브 이미터를 작성하라.
2. 우측 상단 토글 버튼으로 "Live Vision Simulation"을 켜면, 실시간으로 배출 이벤트 Toast 알림이 뜨고 `/theatres` 페이지의 배출 건수 수치가 dynamic update 되도록 Zustand 상태를 연동하라.

---

## 6. 결론 및 프론트엔드 디자인 원칙 요약

* **인공지능(AI) 느낌 제거**: 화려한 형광색 그라데이션이나 알 수 없는 추상적 그래픽을 배제하고, **Slate/Zinc 톤의 정갈한 B2B 데이터 밀도 중심 UI**로 제작합니다.
* **명확한 지표 전달**: 숫자는 반드시 단위(`kg`, `L`, `$AUD`, `%`, `tCO₂-e`)를 동반하고, 이상치(Anomaly) 데이터는 밝은 에메랄드/레드/앰버 규격 색상 태그로 명확히 표시합니다.
* **실제 연동 대비**: 기존에 생성된 AI 비전 모델의 JSON 추론 페이로드(`VisionInferenceEvent`)를 그대로 수신할 수 있는 TypeScript Interface 단에 연동점을 비워둠으로써, 추후 백엔드 API 결합 시 코드를 재작성할 필요가 없도록 보장합니다.