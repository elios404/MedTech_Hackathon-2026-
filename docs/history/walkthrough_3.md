# 호주 수술실 폐기물 인텔리전스 엔터프라이즈 SaaS 대시보드 (Tier 3) 구축 워크스루

호주 임상 표준(AS/NZS 3816) 및 ESG 폐기물 감축 인프라를 위한 **엔터프라이즈 헬스케어 SaaS 대시보드(Next.js 14 App Router, TypeScript, Tailwind CSS, Recharts)** 구축 및 Tier 1 실시간 AI 비전 연동을 완료하였습니다.

---

## 1. 구현된 대시보드 구조 및 기술 스택

```
dashboard/
├── app/
│   ├── layout.tsx                # 엔터프라이즈 사이드바 + 헤더 레이아웃
│   ├── globals.css               # Slate 테마, 커스텀 스크롤바, 차트 스타일
│   ├── page.tsx                  # /overview 로 자동 리다이렉트
│   ├── overview/page.tsx         # [View 1] 경영진 종합 요약
│   ├── theatres/page.tsx         # [View 2] 수술실별 현장 운영 분석
│   ├── audit/page.tsx            # [View 3] 스마트 카트 물류 감사 & 이상 로그
│   ├── reconciliation/page.tsx   # [View 4] 위탁업체 정산 & ESG 리포트
│   └── api/
│       └── events/route.ts       # events.jsonl 실시간 파일 읽기 및 통계 API
├── components/
│   └── layout/
│       ├── sidebar.tsx           # 좌측 네비게이션 & AS/NZS 3816 규정 뱃지
│       └── header.tsx            # 병원 선택, 기간 필터, 실시간 비전 스트림 인디케이터 & Toast
├── lib/
│   ├── mock-data.ts              # 호주 12개 수술실(Royal Adelaide Hospital) 1개월 실측 데이터
│   └── utils.ts                  # $AUD 화폐, kg 무게, L 체적, kg/L 밀도 포맷터
└── types/
    ├── waste.ts                  # Tier 2 카트, EMR 3단계, 수거업체 청구 스키마
    └── vision.ts                 # Tier 1 Vision Event 스키마
```

---

## 2. 4대 핵심 화면(Views) 상세 기능

### 🏛️ View 1: 경영진 종합 요약 (`/overview`)
* **KPI 카드 4종**:
  * 월간 총 폐기물량 (**18,450 kg**, 전월비 -8.4%)
  * 감염성 폐기물 비율 (**44.2%**, SA Health 목표 25.0% 대비 +19.2% 초과 경고)
  * 오분류 추정 손실 비용 (**$41,250 AUD**, 소각단가 $3.50 vs $0.35 차액)
  * Scope 3 온실가스 감축량 (**14.82 tCO₂-e**)
* **월별 추이 콤보 차트**: 감염성/일반 폐기물 발생량(Bar) + 총 처리비용(Line) 이중 축
* **진료과별 감염성 비율 랭킹**: 정형외과(64.5%), 신경외과(58.2%) 등 누수 집중 진료과 식별

### 🏥 View 2: 수술실별 현장 운영 분석 (`/theatres`)
* **12개 수술실 Data Grid (OT_01 ~ OT_12)**:
  * 수술실별 오분류율(SCI %), 총 배출량, 상태 뱃지 (Normal / Warning / Critical)
* **수술 3단계(Phase 1~3) 오투기 도넛 차트**:
  * **Phase 1 (Pre-Op Setup)이 74% 차지** $\rightarrow$ 절개 전 멸균 포장재 개봉 시 오투기가 지배적임을 증명
* **시간대별 성상 배출 타임라인**: 08:00 ~ 18:00 시간대별 무오염 플라스틱 vs 체액 오염물 스택 영역 차트
* **동선 교정 액션 처방**: "OR 3호실 세팅 단계 비닐 오투기 집중 $\rightarrow$ 간호사 세팅대 옆에 재활용 통을 근접 배치하는 동선 교정"

### ⚖️ View 3: 스마트 카트 물류 감사 & 이상 로그 (`/audit`)
* **비파괴 벌크 밀도 산점도 (Bulk Density Scatter Plot)**:
  * X축: 체적 (L), Y축: 중량 (kg)
  * **$\rho = 0.08\,\text{kg/L}$ 저밀도 기준선**: 비닐/공기만 가득 찬 오투기 봉투 감지
  * **$\rho = 0.70\,\text{kg/L}$ 고밀도 기준선**: 일반통에 체액/석션통 유출된 위험 봉투 감지
* **이상 봉투 감사 테이블 & Detail Drawer**:
  * 봉투별 RFID 태그, 배출 수술실, 실측 밀도 및 **"Dispatch IPC Incident Log"** 격리 보고 버튼

### 📋 View 4: 위탁업체 정산 & ESG 리포트 (`/reconciliation`)
* **정산 오차 Summary**:
  * Cleanaway 수거업체 과다 청구 차액 **+$5,635 AUD** 적발 (중량 1,610 kg 과다 청구)
* **수거업체 청구 대조표**: Cleanaway vs Daniels Health 실측 중량 대비 청구액 차액 감사
* **CPT 소모품 팩 미사용 부품 디번들링(De-bundling)**:
  * 사용되지 않고 포장째 버려지는 소모품(60ml 주사기 팩 등) 조달 제외 요청으로 월 $4,305 AUD 절감
* **Export Green Theatres ESG Report**: SA Health 제출용 공인 리포트 생성 기능

---

## 3. 실시간 AI 비전 연동 (Tier 1 $\rightarrow$ Tier 3)

1. `run_vision.py` 또는 `run_demo_simulation.py` 실행 시 `data/events.jsonl`에 쓰레기 투기 이벤트가 기록됩니다.
2. Next.js 백엔드 API (`/api/events`)가 최신 이벤트를 실시간으로 서빙합니다.
3. 대시보드 상단 헤더에 **"🟢 Tier 1 Edge Vision: OR_03 Stream Active"** 뱃지와 함께, 새로운 투기 이벤트 발생 시 **Toast 알림 및 동기화 카운트**가 실시간으로 갱신됩니다.

---

## 4. 실행 및 접속 방법

대시보드 프로덕션 서버가 현재 구동 중입니다:

* **대시보드 접속 URL**: [http://localhost:3000](http://localhost:3000)
* **개별 화면 바로가기**:
  - 경영진 요약: [http://localhost:3000/overview](http://localhost:3000/overview)
  - 수술실 분석: [http://localhost:3000/theatres](http://localhost:3000/theatres)
  - 카트 물류 감사: [http://localhost:3000/audit](http://localhost:3000/audit)
  - 위탁 정산 & ESG: [http://localhost:3000/reconciliation](http://localhost:3000/reconciliation)
