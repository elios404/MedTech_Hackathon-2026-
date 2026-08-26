# 대시보드 UI 정밀 수정 및 3대 쓰레기통·물류 감사 고도화 구현 계획서 (v5.0)

보내주신 5장의 스크린샷과 6가지 세부 지적 사항을 바탕으로, 시각적 결함을 100% 교정하고 임상 인터뷰 내용(3대 쓰레기통별 투기 분석 및 비파괴 봉투 격리 원장)을 직관적으로 완성하는 구현 계획서입니다.

---

## 1. 지적 사항별 구체적 해결 방안

### ① Overview KPI 카드 알약 뱃지 튀어나감 (스크린샷 1)
* **원인**: 카드 폭 대비 라벨과 뱃지 패딩이 커서 우측 경계선 밖으로 삐져나옴.
* **해결**:
  * 4개 KPI 카드 상단 컨테이너에 `overflow-hidden` 적용.
  * 헤더 라벨: `text-[10px] font-bold text-slate-500 uppercase tracking-wide truncate max-w-[110px]`
  * 뱃지: `px-1.5 py-0.5 text-[10px] font-mono font-bold shrink-0 whitespace-nowrap`
  * 뱃지가 카드 내부 패딩 안쪽에 완벽하게 안착되도록 여백 재설계.

### ② 수술실 과별 필터 가시성/직관성 개선 (스크린샷 2)
* **원인**: 작은 텍스트 알약들이 가로로 빽빽하게 나열되어 눈에 잘 안 들어옴.
* **해결**:
  * 상단에 큼직하고 세련된 **세그먼트 탭 그리드(Segmented Tab Card Bar)** 도입.
  * 각 과별 아이콘 + 과 명칭 + 수술실 개수(예: `Orthopaedics (OT_02, 03 - 2 OTs)`, `Neurosurgery (OT_04 - 1 OT)`)를 선명한 카드 형태로 배치하여 즉각적인 선택과 비교 지원.

### ③ 도넛 차트 툴팁 겹침 버그 수정 (스크린샷 3)
* **원인**: 도넛 차트 호버 시 Recharts `Tooltip` 팝업이 중앙의 absolute 고정 텍스트(`76% Phase 1 Setup`)와 겹쳐서 글자가 뭉개짐.
* **해결**:
  * 중앙 고정 텍스트를 제거하고, 도넛 차트 하단에 **선명한 Phase 1~3 프로그레스 바 & 범례(Legend)**로 일원화.
  * 또는 Tooltip 스타일을 컴팩트한 상단 플로팅 툴팁으로 분리하여 텍스트 겹침 현상 원천 차단.

### ④ 시간대별 그래프 명확화 & 3대 쓰레기통별 투기 현황 추가 (스크린샷 4)
* **원인**: Y축 단위가 누락되어 횟수인지 무게인지 불분명하며, 약속했던 3대 쓰레기통별 투기 분석이 누락됨.
* **해결**:
  * **Y축 단위 명시**: `Waste Drop Events / Hour (투기 횟수)` 및 `Estimated Mass (kg)` 명확히 표기.
  * **3대 쓰레기통(Yellow / Clear / White) 필터 탭 추가**:
    * **[All Bins]**: 전체 시간대별 유입 곡선
    * **[Yellow Clinical Bin]**: "07:30~08:30 세팅 단계에 Yellow 통으로 멸균 플라스틱 58건 오투기 집중(경고)"
    * **[Clear General Bin]**: "일반 건식 폐기물 투기 현황"
    * **[White Recycling Bin]**: "재활용 분리배출 현황"

### ⑤ 부피 대비 질량 산점도 목업 대량 보강 & `All Specialties` 제거 (스크린샷 5)
* **원인**: 데이터 포인트가 4~5개뿐이라 휑하며, `All Specialties`는 과별 물리 기준이 달라 의미가 없음.
* **해결**:
  * `All Specialties` 옵션을 **완전히 삭제**하고, 과별(`Orthopaedics`, `Neurosurgery`, `General Surgery`, `Emergency Trauma`, `Ophthalmology & ENT`)로만 전환 가능하도록 강제.
  * 진료과마다 **실제 수술 봉투 15~20개씩 총 80여 개의 현실적 데이터 포인트**를 대량 생성:
    * 정형외과: 정상 고밀도 밴드($0.70 \sim 1.05\,\text{kg/L}$)에 15개 정상 봉투 군집 + 멸균 비닐 오투기 저밀도($0.04 \sim 0.12\,\text{kg/L}$)에 3개 격리 봉투.
    * 안과/ENT: 정상 저밀도 밴드($0.10 \sim 0.25\,\text{kg/L}$)에 15개 정상 봉투 군집.

### ⑥ 3번째 페이지 (`/audit`) 하단 테이블 역할 명확화
* **원인**: 이 테이블이 무엇을 하는 대장인지 직관적으로 이해하기 어려움.
* **해결**:
  * 제목을 **"Tier 2 Smart Cart Non-Destructive Bag Quarantine Log (비파괴 스마트 카트 봉투 격리 대장)"**으로 명시.
  * 설명 배너: *"수술 종료 후 PSSA가 수거한 봉투를 복도에서 스마트 카트로 비파괴 스캔(무게+3D 부피)한 결과입니다. 봉투를 뜯지 않고 밀도 이상치(멸균 비닐 오투기 또는 체액 유출)를 자동 적발하여 격리(QUARANTINED)합니다."*
  * 컬럼 헤더에 명확한 설명 라벨(Origin Suite, Target Bin, Gross Weight, 3D Volume, Bulk Density, Finding, Status) 부착.

---

## 2. 작업 브랜치
* **Branch**: `feat/dashboard`

---

## 3. 검증 계획
1. `npm run build`를 통해 빌드 무결성 확인.
2. 브라우저에서:
   - `/overview`: 4개 KPI 카드의 뱃지가 border 안쪽에 완벽히 안착되어 튀어나가지 않는지 확인.
   - `/theatres`: 상단 과별 필터 카드가 큼직하고 직관적인지, 도넛 차트 호버 시 텍스트 겹침이 없는지, 시간대별 차트에서 3대 쓰레기통별 필터링이 잘 작동하는지 확인.
   - `/audit`: `All Specialties`가 제거되고 정형외과/안과 등에 15개 이상의 풍부한 점들이 정상/격리 영역에 잘 나타나는지, 하단 격리 대장이 한눈에 이해되는지 확인.
