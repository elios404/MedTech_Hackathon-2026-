# 대시보드 UI 정밀 교정 및 임상 현실 데이터 모델링 구현 계획서 (v3.0)

첨부해주신 스크린샷과 피드백을 분석하여 **1) 중복된 헤더 및 기간 선택기 단일화, 2) 단일 시계열 기반 기간 필터링 슬라이스, 3) 뱃지/카드 헤더 정렬 및 깨짐 전면 교정, 4) 실제 임상 연구(ANZ J Surg 등) 기반 수술실 성향별 현실적 데이터 모델링**을 수행하는 구현 계획서입니다.

---

## 1. 스크린샷 분석 및 개선 방향

### ① 중복 요소 완전 제거 및 글로벌 단일화
* **문제 (As-Is)**: 
  * 상단 헤더와 본문 타이틀 우측에 `August 2026 (Live MTD)` 기간 선택기가 **2개나 중복 노출**되고, 상단 것은 본문과 동기화되지 않음.
  * 사이드바와 상단 헤더에 `Royal Adelaide Hospital`이 중복 표기되어 화면이 산만함.
* **개선 (To-Be)**:
  * **상단 전역 헤더(`header.tsx`)의 기간 선택기를 단일 글로벌 필터로 일원화**하고, 본문(`overview/page.tsx`, `theatres/page.tsx` 등) 안의 중복 기간 셀렉터는 **완전히 삭제**.
  * React Context 또는 URL State 기반으로 헤더에서 월을 변경하면 모든 하위 페이지가 즉각 반응하도록 연결.

### ② 단일 시계열 데이터 기반의 실제 기간 슬라이싱 (True Time-Series Slicing)
* **문제 (As-Is)**: 기간을 바꿀 때마다 독립된 정적 Mock 객체로 교체되어 부자연스러움.
* **개선 (To-Be)**: 
  * 1월부터 8월까지의 **단일 마스터 월별 시계열 데이터(`MONTHLY_MASTER_SERIES`)**를 구축.
  * 선택된 기간(`August 2026` = 1~8월 전체, `July 2026` = 1~7월, `June 2026` = 1~6월, `Q2 2026` = 4~6월)에 따라 `slice()` 및 `reduce()` 집계 연산을 동적으로 수행하여 **차트 곡선과 KPI 수치가 실제 데이터베이스 쿼리처럼 유기적으로 연동**되도록 구현.

### ③ 카드 헤더 텍스트/알약 뱃지 줄바꿈 및 수직 정렬 칼정렬
* **문제 (As-Is)**: 스크린샷 2번째 줄에서 `MISCLASSIFICATION COST LOSS` 라벨과 `↗ Budget Leak` 뱃지가 겹치거나 세로 정렬이 어긋나 찌그러짐.
* **개선 (To-Be)**:
  * 카드 헤더를 `flex items-center justify-between gap-2`로 엄격 고정.
  * 라벨 텍스트: `text-[11px] font-bold text-slate-500 uppercase tracking-wider truncate`
  * 알약 뱃지: `inline-flex items-center gap-1 shrink-0 whitespace-nowrap px-2 py-0.5 rounded-full text-xs font-mono font-bold`
  * 4개 카드의 상하 높이와 baseline을 `h-full min-h-[140px]`로 완벽 일치.

---

## 2. 실제 임상 연구(Clinical Literature) 기반 수술실 데이터 모델링

호주 수술실 폐기물 감사 임상 연구(*ANZ Journal of Surgery*, *The Lancet Planetary Health*, *RACS Environmental Sustainability in Surgery Guidelines*)를 기반으로 수술실별 특성을 3대 군으로 현실감 있게 모델링합니다.

### 🏥 수술실 성향별 3대 임상 패턴 분류

| 수술실 군 | 해당 수술실 | 실제 임상 특성 및 오투기 패턴 | 3단계 오투기 비율 | 시간대별 피크 |
|---|---|---|---|---|
| **High Packaging / Urgent (포장재 집중형 - 취약)** | **OT_03 (정형외과 Ortho)**<br>**OT_04 (신경외과 Neuro)**<br>**OT_02 (심장외과 Cardio)** | 대형 인공관절, 보철물, 멸균 드레이프 개봉 시 **무오염 비닐/플라스틱이 노란통에 대량 투하**됨 | **Phase 1 (세팅기): 76%**<br>Phase 2 (수술중): 14%<br>Phase 3 (정리기): 10% | **07:30 ~ 08:30 (아침 첫 수술 세팅)** 및 **12:30 ~ 13:30 (오후 수술 세팅)**에 플라스틱 폭발적 피크 (50~60kg) |
| **Emergency Rapid Turnover (턴어라운드형 - 위험)** | **OT_12 (응급외과 Trauma)**<br>**OT_01 (일반외과 GenSurg)** | 응급 환자 이송 및 빠른 방 교대로 인해 **수술 후 정리 시간에 분리수거를 포기하고 노란통에 몰아넣음** | **Phase 3 (정리기): 48%**<br>Phase 2 (수술중): 32%<br>Phase 1 (세팅기): 20% | **11:30 ~ 12:30** 및 **16:00 ~ 17:30 (수술 정리 및 청소 시간)**에 오투기 집중 |
| **Best Practice Benchmark (모범 수술실 - 우수)** | **OT_08 (안과 Ophth)**<br>**OT_09 (이비인후과 ENT)**<br>**OT_11 (소아외과 Paed)** | 사전 분리배출 프로토콜이 정착되어 무오염 포장재를 재활용통으로 정상 배출함 | **Phase 1: 30%**<br>Phase 2: 40%<br>Phase 3: 30%<br>*(전체 오투기율 15% 미만)* | 특정 피크 없이 고르게 낮은 배출 유지 |

---

## 3. 세부 파일별 변경 계획

1. **`dashboard/lib/mock-data.ts`**:
   - `MONTHLY_MASTER_SERIES`: 1월~8월의 단일 마스터 월별 시계열 데이터 정의.
   - `filterPeriodData(periodKey)`: 선택된 월까지 동적으로 슬라이스/집계하여 KPI, 추이선, 진료과 비율을 반환하는 단일 함수 구현.
   - 12개 수술실별 고유한 임상 연구 기반 3단계 도넛 비율 및 시간대별 피크 곡선 재정의.
2. **`dashboard/components/layout/header.tsx`**:
   - 글로벌 기간 선택기 이벤트를 CustomEvent / State로 브로드캐스트.
   - 병원 명칭을 깔끔한 단일 타이틀로 정돈.
3. **`dashboard/app/overview/page.tsx`**:
   - 본문 내 중복 기간 선택기 완전 삭제.
   - 헤더와 동기화된 단일 기간 상태 반영.
   - KPI 카드 4종의 헤더 라벨, 알약 뱃지, 수치들의 세로 baseline 정렬 및 패딩 완벽 일치.
4. **`dashboard/app/theatres/page.tsx`**:
   - 상단 헤더 정돈 및 2-Tab 마스터/디테일 뷰 유지.
   - 실제 임상 데이터 패턴(Ortho 아침 세팅 피크 vs Trauma 정리 피크 vs ENT 모범)이 차트에 생생하게 반영되도록 연결.

---

## 4. 검증 계획
* `npm run build` 100% 통과 확인.
* 브라우저에서:
  - 상단 헤더에서 기간을 바꿀 때 중복 선택기 없이 `Overview`의 월별 차트와 KPI가 1~8월 슬라이스로 자연스럽게 줄어들고 늘어나는지 검증.
  - KPI 카드 4개의 라벨과 뱃지 줄바꿈/깨짐이 완벽히 해결되었는지 시각적 점검.
  - 수술실 딥다이브에서 정형외과(07:30 피크) vs 응급외과(16:00 피크)의 차이가 뚜렷하게 보이는지 확인.
