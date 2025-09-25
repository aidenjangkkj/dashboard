# 🌍 Emissions Dashboard

탄소 배출량을 국가/기업 단위로 집계·분석하고, 환율/세금/목표 감축 시뮬레이션을 지원하는 대시보드 애플리케이션입니다.  
Next.js(App Router) + TypeScript + TailwindCSS + Zustand 상태관리 기반으로 구현되었습니다.

---

## ✨ 주요 기능

### 📊 데이터 집계 및 차트
- **월별 배출량 추이(Line Chart)**  
  기업별 배출량을 `yearMonth` 단위로 합산해 선형 그래프로 표시
- **에너지원별 배출량 비율(Pie Chart)**  
  원별 비중을 색상으로 시각화
- **국가/기업별 상위 Top N (Bar Chart)**  
  국가별, 기업별 배출량 또는 추정세 기준으로 정렬
- **누적/분류별 스택드 바(Stacked Bar Chart)**  
  월별 배출량을 scope/source 단위로 분류하여 표시
- **목표 vs 실제(Target vs Actual)**  
  연도별 감축 목표치와 실제 배출량을 비교

### ⚙️ 필터/설정
- **기간 필터(PeriodFilter)**  
  `YYYY-MM` 단위로 시작/종료 시점 지정 가능
- **단위 변환(Unit)**  
  `tCO2e`, `ktCO2e` 단위 지원
- **환율 적용(FX)**  
  - 실시간(Live): 외부 API 연동  
  - 과거(Historical): 선택한 날짜 기준 API 요청  
  - API 실패 시 Fallback 값(`USDKRW=1350`) 제공
- **정렬 조건 선택**  
  `배출량(emissions)` / `추정세(tax)` 기준 정렬 가능
- **국가/기업 숨김 관리**  
  Desktop: 드롭다운  
  Mobile: 바텀시트

### 📝 메모(Post 관리)
- 특정 회사 선택 후 메모 작성 가능  
- 저장 시 Optimistic UI 반영 + 실패 시 **Toast 알림** 제공  
- 실패 Toast에는 **재시도 버튼** 포함

### 🎯 목표 관리(Target Controls)
- **기준연도, 목표연도, 감축률(%) 설정** 가능
- Zustand 상태에 **월별 목표치(targetsByMonth)** 저장
- Target vs Actual 차트에서 반영

### 🧾 UI/UX
- **Skeleton + Spinner 로딩 처리**  
  - 초기 전체 로딩 시: Spinner 오버레이  
  - KPI/카드/차트별: Skeleton + Spinner Overlay
- **Toast 알림**  
  - 성공/실패 메시지  
  - 실패 시: 닫기 → 메모 작성 페이지 복귀
- **Responsive Layout**  
  - Desktop: 상단 Topbar + Sidebar  
  - Mobile: BottomSheet 기반 설정/검색/필터

---

## 🛠️ 기술 스택

- **Framework**: [Next.js 15 (App Router, Turbopack)](https://nextjs.org/)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **State Management**: Zustand
- **Data Visualization**: Recharts
- **API 통신**: Next.js Route Handlers (`/api/rates` 등)
- **배포**: [Vercel

---


## ⚡ 성능 측정
- (https://pagespeed.web.dev/analysis/https-dashboard-omega-beige-25-vercel-app/3e2cf2wmwt?form_factor=desktop)
- LightHouse
-   <img width="904" height="657" alt="캡처" src="https://github.com/user-attachments/assets/bbf53332-b577-407a-82ca-c7c084cdf970" />



---

## 📂 프로젝트 구조

```
src/
├── app/
│   ├── page.tsx              # 대시보드 메인 페이지
│   └── api/rates/route.ts    # 환율 API (실시간/과거 + fallback)
├── components/
│   ├── charts/               # Line, Pie, Bar, StackedBar, TargetVsActual
│   ├── filters/              # PeriodFilter, TargetControls
│   ├── layout/               # Topbar, Sidebar, MobileMoreSheet
│   ├── metrics/              # CountryCards, CompanyCards
│   ├── posts/                # PostEditor
│   └── ui/                   # Card, Toast, Spinner, Skeleton 등
├── lib/
│   ├── api.ts                # fetchCompanies, fetchCountries 등
│   ├── format.ts             # fmtNumber, scaleUnit
│   ├── date.ts               # inYearMonthRange
│   ├── error.ts              # toMessage
│   └── colors.ts             # SOURCE_COLORS, colorForSource
└── store/
    ├── useDataStore.ts       # 국가/기업/포스트 데이터 관리
    ├── useUiStore.ts         # 필터/목표/숨김/즐겨찾기 관리
    └── useConfigStore.ts     # 환율 상태 관리
```

---

## 🚀 배포 (Vercel)

https://dashboard-omega-beige-25.vercel.app/

---

## 🔄 로딩 전략

- **첫 진입 전체** → `Spinner` 오버레이 (fixed + backdrop)  
- **각 섹션별** → `Skeleton` + 내부 `Spinner` overlay  
- **데이터 불러오기 실패** → `Toast`로 알림 + 재시도 버튼

---


## 📄 라이선스
MIT License
