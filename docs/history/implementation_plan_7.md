# 대시보드 고도화 구현 계획서 (v4.0) — 규정 정합성, 진료과별 감축 성과 정산 및 UI 디테일 완벽 교정

사용자 피드백을 반영하여 **1) 수거업체 불신/대조 프레임 완전 삭제 $\rightarrow$ 병원 진료과별 폐기물 감축 성과 정산표(Internal Specialty Diversion Ledger)로 전면 교체, 2) Overview KPI 카드 하단 설명 텍스트 잘림(`...`) 완전 해소, 3) 쓰레기통 표준 규정(AS/NZS 3816 / WHO) 정합화, 4) 진료과별 동적 벌크 밀도(Dynamic Bulk Density) 및 EMR Count Sign-off 연동**을 수행하는 구현 계획서입니다.

---

## 1. 주요 변경 및 개선 사항

### ① 4번째 페이지 (`/reconciliation`) 전면 개편: "수거업체 대조" $\rightarrow$ "진료과별 감축 성과 정산 & 공인 ESG 원장"
* **문제 (As-Is)**: "수거업체가 청구한 무게 vs 병원 측정 무게"를 비교하는 표는 위탁 수거업체를 불필요하게 불신/감시하는 인상을 줌.
* **개선 (To-Be)**:
  * 수거업체 비교 테이블을 **완전히 삭제**.
  * **"진료과별 폐기물 감축 성과 및 비용 절감 정산표 (Specialty-by-Specialty Waste Diversion & Savings Ledger)"**로 전면 전환.
  * 8개 진료과별로: **총 배출량(kg) $\rightarrow$ 재활용 전환 성공량(kg) $\rightarrow$ 소각 비용 절감액($AUD) $\rightarrow$ 감축된 Scope 3 탄소(tCO₂-e)**를 투명하게 정산하여, 병원 내부 부서별 인센티브 및 SA Health 공식 보고 자료로 활용하도록 완벽하게 재구성.
  * CPT 수술팩 디번들링(미사용 부품 조달 제외) 절감액도 실질적인 병원 구매 최적화 관점으로 유지.

### ② 1번째 페이지 (`/overview`) KPI 카드 하단 텍스트 잘림(`...`) 완전 해소
* **문제 (As-Is)**: 카드 하단 메타 텍스트에 `truncate`가 적용되어 있어 화면 폭에 따라 설명 문구가 `...`으로 잘려 보임.
* **개선 (To-Be)**:
  * `truncate`를 제거하고 `leading-relaxed text-[11px] text-slate-500`로 자연스러운 2줄 레이아웃을 보장.
  * 카드 하단 패딩을 여유 있게 확보하여 4개 카드의 세로 높이와 텍스트가 잘림 없이 100% 선명하게 노출되도록 수정.

### ③ 2번째 페이지 (`/theatres`): 진료과 필터 바 & 표준 규정(Yellow / Clear / White) 투기 현황
* **쓰레기통 규정 정합화**:
  * 호주 AS/NZS 3816 표준 준수: **Yellow Bin (임상/감염성)**, **Clear/Black Bin (일반 마른 폐기물)**, **White/Blue Bin (멸균 포장재 재활용)**
* **진료과 필터 바 (Specialty Selector)**:
  * `[All 12 Theatres]` | `[Orthopaedics (OT_02, 03)]` | `[Neurosurgery (OT_04)]` | `[General Surgery (OT_01)]` | `[Emergency Trauma (OT_12)]` | `[Ophthalmology & ENT (OT_08, 09)]`
  * 진료과 탭 선택 시 해당 진료과 소속 수술실들만 필터링되어 비교.
* **EMR 수술 계수(Surgical Count Sign-off) & PSSA 수거 타임라인**:
  * 간호사 인터뷰 사실 반영: "수술 중 쓰레기는 방 안에 보관 $\rightarrow$ 11:15 거즈/기구 카운트 확정 $\rightarrow$ 11:20 PSSA 스마트 카트 수거" 임상 타임라인 명시.

### ④ 3번째 페이지 (`/audit`): 진료과별 동적 벌크 밀도 (Dynamic Bulk Density)
* **진료과별 정상/이상 밀도 밴드**:
  * **정형외과 (Ortho)**: 정상 $0.70 \sim 1.05\,\text{kg/L}$ (세척액/체액) $\rightarrow$ $\rho < 0.25\,\text{kg/L}$ 이하일 때 멸균 비닐 오투기 플래그.
  * **안과/ENT (Ophth/ENT)**: 정상 $0.10 \sim 0.25\,\text{kg/L}$ (가벼운 포장재/미세거즈) $\rightarrow$ $0.15\,\text{kg/L}$라도 정상 판정.
  * **일반외과 (General)**: 정상 $0.40 \sim 0.75\,\text{kg/L}$.
* 산점도 상단 진료과 필터 선택 시 기준선 및 밴드가 동적으로 전환.

---

## 2. 작업 브랜치
* **Branch**: `feat/dashboard`

---

## 3. 검증 계획
1. `npm run build`를 통해 TypeScript 0 에러 및 빌드 무결성 확인.
2. 브라우저에서:
   - `/overview`: 4개 KPI 카드의 하단 설명이 잘림 없이 깔끔하게 표출되는지 확인.
   - `/theatres`: 상단 진료과 필터 탭 클릭 시 정형외과(OT_02, 03), 안과/ENT(OT_08, 09) 등으로 필터링되고 EMR Count 타임라인이 잘 표시되는지 확인.
   - `/audit`: 진료과별 동적 밀도 기준선이 차트에 잘 반영되는지 확인.
   - `/reconciliation`: 수거업체 불신표 대신 "진료과별 감축 성과 정산표"가 품격 있게 표시되는지 확인.
