# 엔터프라이즈 B2B 대시보드 UI/UX 고도화 구현 계획서 (v2.0)

사용자 피드백을 반영하여 **1) 수거업체 대조 프레임의 조달/ESG 최적화 전환, 2) 실시간 마이크로 알림 완전 제거, 3) 수술실 마스터-디테일(2-Tab) 구조 도입**을 핵심으로 하는 최종 구현 계획서입니다.

---

## 1. 주요 개선 영역 및 설계 변경점

| 화면 / 영역 | 기존 설계 (As-Is) | 개선 설계 (To-Be) | 기대 효과 |
|---|---|---|---|
| **글로벌 헤더** | 실시간 쓰레기 투기 배너/알림이 점멸하여 시각적 노이즈 발생 | **마이크로 알림 완전 제거**. 시설명(`Royal Adelaide Hospital`), 감사 기간 셀렉터, 데이터 동기화 상태만 깔끔하게 유지 | 인지적 과부하 제로화, 정갈한 엔터프라이즈 룩 완성 |
| **Executive Overview** (`/overview`) | 6~8개 진료과가 빽빽하게 나열되고 모든 수치가 동일 굵기라 피로감 유발 | **3단계 시각적 위계** 적용 (Big Number 집중), **Top 3 핵심 누수과만 노출**하고 "View All Departments" 모달로 분리 | 5초 안에 병원 전체 재무/ESG 상태 즉각 판독 |
| **Theatre Operations** (`/theatres`) | 상단 세부 차트 + 하단 12개 수술실 테이블이 한 화면에 혼재되어 스크롤 압박 | **2-Tab 마스터-디테일 구조** 도입:<br>• **Tab 1: All Theatres Grid (숲)**<br>• **Tab 2: OT Deep-Dive (나무)** | 12개 수술실 비교와 개별 수술실 정밀 진단 목적의 완벽한 분리 |
| **Procurement & ESG** (`/reconciliation`) | 수거업체(Cleanaway)가 병원에 바가지 씌웠다는 공격적인 오버빌링 적발 프레임 | **조달 프로세스 혁신 & 공인 탄소 리포트** 전환:<br>• 디지털 중량 대조 원장<br>• CPT 수술팩 미사용 소모품 디번들링 절감<br>• SA Health 정부 제출용 Scope 3 리포트 | 상호 신뢰 기반의 B2B 조달 및 친환경 의료 인프라 프레임 확립 |

---

## 2. 세부 화면별 구현 명세

### 1) Global Header (`components/layout/header.tsx`)
- 초 단위 팝업이나 벨 아이콘 알림 없이, 상단에 병원 정보와 기간 필터만 정돈되게 배치.
- 5초 법칙에 따라 화면에 들어왔을 때 핵심 대시보드 내용으로 시선이 직행하도록 단순화.

### 2) Executive Overview (`app/overview/page.tsx`)
- **Metric Cards**: 여백 확장(`p-6`), 큰 숫자(`text-3xl font-bold font-mono tracking-tight text-slate-900`)로 가독성 극대화.
- **월별 추이 차트**: 이중 축 콤보 차트의 여백을 넓히고 캡션 톤다운.
- **진료과별 비율 (Top 3 Focus)**:
  - 가장 개선이 시급한 **상위 3개 과(Orthopaedics, Neurosurgery, Emergency)**만 명확히 강조.
  - 하단에 "View All 8 Departments" 모달 버튼을 제공하여 필요 시 전체 진료과 확인.

### 3) Theatre Operations (`app/theatres/page.tsx` - 2-Tab 마스터-디테일)
- 상단에 깔끔한 서브 탭 바 제공:
  - **[Tab 1: All Theatres Matrix]**: 12개 수술실의 진료과, 분리수거 준수율(SCI %), 총 중량, 상태(Normal/Warning/Critical)를 카드 그리드 및 테이블로 정렬. 클릭 시 해당 수술실 딥다이브 탭으로 바로 이동.
  - **[Tab 2: OT Deep-Dive Focus]**: 수술실 드롭다운 셀렉터 + **수술 3단계(Phase 1~3: 74% Setup) 도넛 차트**, **시간대별(07:30~16:30) 유입 곡선**, **Top 4 오투기 소모품**, **임상 동선 교정 처방(Clinical Prescription)**만 오롯이 집중 표출.

### 4) Procurement, De-bundling & Verified ESG (`app/reconciliation/page.tsx`)
- 공격적인 "Overbilling Flag" 용어를 **"Digital Weight Verification Ledger"** 및 **"Reconciliation Variance"**로 정돈.
- CPT 수술팩 디번들링(미사용 주사기, 드레이프 제외)으로 실질적인 구매 예산 절감($4,305/mo) 강조.
- SA Health 제출용 Scope 3 탄소 감축 공인 인증서(Verified Certificate) 내보내기 버튼 유지.

---

## 3. 작업 환경
- **Branch**: `feat/dashboard` (이미 체크아웃됨)

---

## 4. 검증 계획 (Verification Plan)
1. `npm run build`를 통해 모든 컴포넌트 타입 검사 및 9개 라우트 빌드 통과 확인.
2. 브라우저에서:
   - `/overview`에서 Top 3 진료과와 모달 점진적 공개 확인.
   - `/theatres`에서 Tab 1 (12개 수술실 매트릭스) $\leftrightarrow$ Tab 2 (개별 수술실 딥다이브) 전환이 매끄럽고 직관적인지 확인.
   - `/reconciliation`의 정갈한 조달 및 ESG 리포트 톤앤매너 확인.
