# 2026-10-29

## 메인 페이지 "클리닉 그로스 컴퍼니" 개편 시안 (브랜치 `feat/clinic-growth-renewal`, 미배포)

### 변경 내용
- `src/app/page.tsx`: 섹션 구성을 히어로 → 숫자로 확인하는 해외 성장 → 함께하는 파트너 → 3가지 역량 → 파트너 조건 → 문의 CTA로 교체
- 신규 섹션 (`src/components/sections/growth/`)
  - `GrowthHero`: "일본/영미권/대만 환자가 먼저 찾는 클리닉" 순환 애니메이션, 24/7 파이프라인 칩, 파트너십 문의 CTA
  - `GrowthMetrics` + `GrowthChart`: 월별 해외환자 유치 인터랙티브 차트(실적/예상, 호버 툴팁), KPI 카운트업, 대표 성과 카드 2종
  - `Capabilities` + `DataDashboardMock`: 맨파워(팀 구성), 전략과 실행(사례 2종, 그로스 LAB 링크), 데이터 분석(탭형 예시 대시보드)
  - `PartnerFit`, `PartnershipCta`
- 신규 공통: `src/components/common/CountUp.tsx`, `src/data/growthMetrics.ts`, `src/data/team.ts`
- `LogoWall`: `eyebrow`, `title` props 추가 (기본값은 기존 문구 유지)
- `TeamGrid`: 팀 데이터를 `src/data/team.ts`로 이동, 문구 내 중간점을 쉼표로 교체
- `docs/design/README.md`: 다크 섹션, 차트, 예시 대시보드 디자인 규칙 추가

### 영향분석
- 문의 CTA는 모두 기존 `/inquiry`로 연결, `data-meta-placement`는 `hero`, `partnership_cta` 사용 (Meta ConsultClick 추적 유지)
- 기존 메인에서 빠진 섹션(`WhyClinicBridge`, `TeamGrid`, `ProofResults`, `PlanCompare`, `FAQInsights`, `QuoteCta`) 파일은 삭제하지 않음
- API, Supabase, Slack 연동 변경 없음

### 테스트
- `tsc --noEmit`, `eslint` 통과
- 로컬 `next dev`(3100)에서 데스크톱 1440px, 모바일 375px 렌더링과 차트 툴팁, 대시보드 탭 전환 확인. 가로 스크롤 없음

## 메인 시안 2차: BAT 레퍼런스 기반 디자인, UX 고도화

### 변경 내용
- 히어로 전면 재작성(`GrowthHero`): 메시지 좌측 정렬, 3줄 마스크 리빌, 시장 선택기(01 일본 / 02 영미권 / 03 대만, 자동 순환 + 클릭), 하단 9월 실적 티저
- 히어로 배경: `GlobeCanvas` 신규(Canvas 2D 점묘 지구본, 서울 허브 아크, 활성 시장 펄스, 포인터 패럴랙스, 화면 밖 렌더 중지) + 오로라, 그레인 CSS
- 국가명 전환: layout 스케일 애니메이션 대신 라벨 폭을 측정해 width 만 애니메이션 (글자 늘어짐 방지)
- 신규 공통: `src/components/common/RevealLines.tsx`, `src/data/markets.ts`
- `layout.tsx`: Instrument Serif(next/font) 추가, `tailwind.config.ts`에 `font-serif` 등록
- `Header`: 메인에서만 다크 톤
- `Capabilities`: BAT식 대형 역량 인덱스(Manpower / Strategy & Execution / Data Intelligence, 앵커 이동)
- `LogoWall`: `monochrome`, `align` props 추가
- `PartnershipCta`: 원형 CTA + 텍스트 마키로 재작성
- `docs/design/README.md`: 2차 디자인 규칙 추가

### 영향분석
- Header 변경은 `/` 경로에만 적용되어 다른 페이지 영향 없음
- 문의 CTA 경로와 `data-meta-placement`(hero, partnership_cta) 유지
- 지구본은 단일 rAF 루프, DPR 최대 2, 점 개수 데스크톱 1800 / 모바일 900

### 테스트
- `tsc --noEmit`, `eslint` 통과 (기존 `api/contact` 경고 1건은 이번 변경과 무관)
- 로컬 1440px, 800px, 375px에서 히어로, 지구본 시장 전환, 역량 인덱스, CTA 마키 확인. 콘솔 에러 없음, 가로 스크롤 없음

## 메인 시안 3차: 히어로만 고품질 효과, 나머지는 정적인 에이전시 그리드

### 배경
- 피드백: 2차 시안이 AI 템플릿 느낌. 히어로에만 고품질 효과를 두고 나머지는 깔끔하고 전문적으로.
- 참고: Skiper UI 메인(키네틱 타이포), Unicorn Studio, Originkit(셰이더 배경), BAT. "더에쓰씨", "워디"는 사이트를 특정하지 못해 미반영.

### 변경 내용
- 히어로: `GlobeCanvas`, 오로라, 그레인 제거 → `ShaderBackground`(WebGL 실크 셰이더, 포인터 광원, 렌더 배율 0.6) + 시장명 글자 단위 롤링, 하단 3열 정보행
- 헤더: 메인에서 히어로 위에 있을 때만 다크, 지나면 화이트
- 신규 `SectionHeader`: (번호) 라벨 + 큰 제목의 12열 공통 헤더
- 성과: 카운트업, 카드, 그라데이션 제거. KPI 4열 라인 표, 라이트 차트(최신 실적만 강조색), 사례 2열
- 파트너: 마키 `LogoWall` 대신 정적 `PartnerGrid`(1px 라인 그리드, 흑백). 로고 데이터를 `src/data/partners.ts`로 분리해 `LogoWall`과 공유
- 역량: 좌측 고정 번호와 이름, 우측 본문. 팀 흑백 6열, 사례는 번호 단계 목록, 대시보드는 라이트 테마 표 형태
- 파트너 조건: 번호 행 목록. 최종 CTA: 다크 정적 섹션
- 삭제: `GlobeCanvas`, `RevealLines`, `CountUp`, Instrument Serif 폰트, 오로라/그레인 CSS. `LogoWall`은 원래대로 복원(데이터만 분리)
- `docs/design/README.md`: 메인 개편 규칙을 3차 기준(금지 요소, 토큰, 레이아웃, 히어로)으로 재작성

### 테스트
- `tsc --noEmit`, `eslint` 통과 (기존 `api/contact` 경고 1건 무관)
- 1440px, 375px에서 전체 섹션 확인. 셰이더 렌더, 헤더 전환, 차트 툴팁, 대시보드 탭 정상. 가로 스크롤 없음

## 메인 시안 4차: 2차 섹션 복원 + 정리, 히어로에 인바운드 지구본

### 배경
- 피드백: 히어로(메인헤더)를 제외하면 2차 버전이 더 좋았음. 2차 섹션을 더 깔끔하게, 배경은 3차 것을 차용. 히어로는 2차 지구본 느낌을 살리되 해외에서 한국으로 들어오는 연출.

### 변경 내용
- 히어로: 3차 셰이더 배경 위에 `GlobeCanvas` 재도입. 경로 방향을 도시 → 서울로 뒤집고, 서울 쪽으로 갈수록 진해지는 아크, 서울로 날아오는 빛 입자, 서울 도착 파동 추가
- 근거리 노선(일본, 대만)이 시점 방향으로 겹쳐 안 보이던 문제: 경로를 대권에서 옆으로 휘게(bend) 그리고, 시장별 확대 배율(`focus.zoom`) 추가. 근거리 시장은 대표 도시만 라벨 표시
- 시장 선택기: 진행 바 복원
- 섹션: 2차 구성(아이브로우 + 리빌 제목, KPI 카운트업, 로고 마키, 대형 역량 인덱스, 다크 예시 대시보드, 원형 CTA + 텍스트 마키)으로 복원하되 정리
  - 배경은 3차의 화이트 / `#F6F5F2` 교차, 글로우와 그라데이션 제거
  - 알약형 흐름 칩 → 번호 단계 목록, 점선 박스 → 1px 라인, 원형 아이콘 배경 제거
  - 공통 도입부 `SectionIntro` 신규, `SectionHeader`, `PartnerGrid` 삭제
- 복원: `RevealLines`, `CountUp`, Instrument Serif 폰트(아이브로우 강조어 전용)
- `LogoWall`: `intro`, `monochrome`, `className` props (기본값은 기존 문구 유지)
- `docs/design/README.md`: 메인 개편 규칙을 4차 기준으로 재작성

### 테스트
- `tsc --noEmit`, `eslint` 통과 (기존 `api/contact` 경고 1건 무관)
- 1440px에서 일본, 영미권, 대만 지구본 장면과 전 섹션 확인, 375px 히어로 확인. 가로 스크롤 없음

## 메인 시안 5차: 역량 스크롤 스택, 히어로 하단 재배치

### 변경 내용
- 역량 섹션: Manpower / Strategy & Execution / Data Intelligence 를 풀스크린 스택 패널로 전환
  - 데스크톱(lg, 화면 높이 760px 이상): 헤더 아래 sticky, 다음 패널이 덮어올 때 이전 패널 축소와 어둡게(`useScroll` + `useTransform`)
  - 패널 배경을 화이트, 미색, 다크로 구분하고 상단에 `01 / 03` 진행 표시
  - 본문 압축: 팀 사진 3열(설명은 호버 시 표시), 전략 사례는 Case 01/02 탭, 그로스 LAB 은 좌측 링크
  - 모바일과 낮은 화면에서는 sticky 없이 차례로 쌓임
- `ClientProviders`: `<main>` 에 `--header-h` CSS 변수(헤더 + 배너 높이) 추가
- `globals.css`: html, body 의 `overflow-x: hidden` 뒤에 `overflow-x: clip` 추가. hidden 이 스크롤 컨테이너를 만들어 sticky 가 동작하지 않던 문제 해결 (미지원 브라우저는 hidden 유지)
- 히어로 하단 행: 소개 문장과 CTA 를 좌측으로, 시장 선택기를 우측 하단으로. 선택기 번호 표기 제거. 문구 변경 및 확대, "클리닉브릿지", "전담 그로스 팀" 색 강조
- 지구본: 모바일에서 더 아래로, 60% 투명도, SEOUL 라벨 숨김 (문구와 겹침 방지)

### 영향분석
- `overflow-x: clip` 은 전역 변경. 가로 스크롤 방지 효과는 동일하며 다른 페이지 레이아웃 영향 없음(가로 넘침 없음 확인)
- `--header-h` 는 신규 변수로 기존 스타일과 충돌 없음

### 테스트
- `tsc --noEmit`, `eslint` 통과
- 1440x900 에서 패널 sticky 와 축소 전환 확인(첫 패널 top 120px = 헤더 104 + 여백 16), 375px 에서 패널 일반 배치와 히어로 확인. 가로 스크롤 없음

## 메인 시안 6차: 성과 섹션 문구와 사례 카드

### 변경 내용
- 제목: "숫자로 확인하는 / 클리닉브릿지 해외환자유치 성과", 설명 문구를 크게 키우고 "그로스 엔진"을 색과 밑줄로 강조
- 차트: 제목 "클리닉브릿지 월별 해외환자 예약자 수 현황", 주석에 "계약 클라이언트 예약 기준" 추가, 예상치 설명 문구 삭제, 우측 하단 "출처: 클리닉브릿지". KPI 첫 칸을 "9월 예약자 수"로 통일
- `growthMetrics.ts`: 화면에서 쓰지 않게 된 `FORECAST_NOTE` 삭제 (예상치 산정 기준은 파일 주석에 보존)
- 신규 `ProofCases`: 다크 사례 카드 2종
  - 다이어트 클리닉: 일본, X 채널, Viral 태그 / 2,000만회+ / 6개월 집행 기간 칸 시각화
  - B 클리닉: 영미권, Zero to One / 0 → 5억 원 / 26.03 계약부터 26.09 달성까지 7개월 타임라인, 기준 시점 각주
  - 기존 이미지는 두 사례와 무관해 사용하지 않음. 실제 캡처를 받으면 `media` 필드로 노출
- `Header`: 다크, 화이트 로고를 모두 미리 렌더링해 전환 시 로고가 잠깐 사라지던 현상 수정

## 메인 시안 7차: Data Intelligence 패널을 그로스 대시보드로

### 변경 내용
- Data Intelligence 패널 레이아웃: 상단에 짧은 소개(영문명, 한글명, 제목, 설명), 나머지 공간 전체를 대시보드로 채움. 패널 여백 축소
- 신규 `src/components/sections/growth/dashboard/`
  - `GrowthDashboard`: 1200x640 고정 캔버스를 부모 크기에 맞춰 축소(실제 캡처 느낌), 브라우저 크롬, 사이드바(5단계 메뉴, 블러 처리된 클라이언트 목록과 담당자), 기간/국가 필터 헤더. 7초 자동 순환, 조작 시 중단
  - `StageGrowth`: 매출 드라이버 트리(일본 예약전환 18% vs 벤치마크 26% 병목 1곳만 강조), GP 워터폴, 시술별 매출 순위 vs GP 순위 덤벨, Growth Accounting + Quick Ratio
  - `StageUnit`: CAC, LTV, LTV/CAC, Payback 카드, 코호트 레이어 케이크, 채널별 CAC vs LTV 쿼드런트 버블, 레버 토네이도, 실행 우선순위
  - `StageLeading`: 문의(t) vs 내원(t+3주) 리드/래그 + "3주 선행" 주석, 벤치마크 밴드 퍼널, 선행지표 보드(7개 스파크라인 + 신호등), 4주 내원 예측 팬 차트, 요일 x 시간대 문의 히트맵
  - `StageViral`: 바이럴 루프(입자 애니메이션), K = i × c 카드(K 0.45, 유료 100명 → 182명), K 추이(K=1 기준선, 현실 범위 0.2~0.6), Paid vs Organic 비중, 블렌디드 CAC 하락
  - `StageProjection`: Base/Upside/Downside 팬 차트 + What-if 슬라이더(재진율, 예약전환율, CAC 절감 → 12개월 GP 변화), 결정 로그 3건, 월간 리포트 블러 썸네일 + "상담 시 공개"
  - `primitives`: 색 토큰, Panel, Redact(블러), Badge, Sparkline, Legend, 경로 헬퍼
- 삭제: `DataDashboardMock.tsx`
- 모든 수치는 예시이며 캔버스 상단에 "예시 화면, 가상 데이터" 표기. 블러 처리된 병원명도 "OOOO피부과" 자리표시자만 사용
- 월간 리포트 썸네일은 그려 넣은 자리표시자. 실제 리포트 캡처(블러)를 받으면 교체 필요

### 테스트
- `tsc --noEmit`, `eslint` 통과
- 1440x900에서 5단계 전부 카드 밖으로 넘치는 요소 없음(스크립트 검사), What-if 슬라이더 동작 확인(재진율 +10%p 시 12개월 GP +14.6% → +22.4%), 375px에서 축소 표시와 가로 스크롤 없음 확인

## 메인 시안 8차: Data Intelligence 를 컨설팅 리포트 형식으로, Pretendard 자체 호스팅

### 변경 내용
- Data Intelligence: 다크 대시보드 → 컨설팅펌, VC 보고서 형식의 흰 종이 페이지(1200x675)
  - 러닝 헤더(보고서명, 블러 클라이언트, 섹션 트래커, CONFIDENTIAL), 액션 타이틀, Exhibit 번호와 굵은 상단 라인, 출처/주석/페이지 번호 푸터, 뒤에 겹친 종이 2장
  - 브라우저 틀, URL, "예시 화면, 가상 데이터" 문구 제거
  - 5개 페이지 모두 더 빽빽한 Exhibit 으로 재작성 (드라이버 트리, GP 브리지 8단계, Growth Accounting + 순증/Quick Ratio 표, 순위 덤벨 8개 시술, 국가별 유닛 이코노믹스 표, 채널 버블 8개, 코호트 레이어 케이크, 토네이도 7개 레버, 25주 리드/래그, 퍼널 밴드, 선행지표 표, 예측 팬, 히트맵, 루프, K 산식 표, K 추이, Paid vs Organic, 블렌디드 CAC, 시나리오 + 가정 표, 레버 민감도 매트릭스, 결정 로그 표, 리포트 썸네일)
  - What-if 슬라이더는 보고서 형식에 맞춰 정적 민감도 매트릭스로 대체
  - 수치 대부분 블러(HTML `R`, SVG `RG` 필터)
  - 패널 안에서 세로 가운데 정렬. 크기 측정을 `clientWidth/Height` 로 바꿔 패널 축소 transform 이 섞여 페이지가 넘치던 문제 수정
- 폰트: jsDelivr CDN `@import` 제거, `pretendard@1.3.9` 패키지의 가변 폰트를 `next/font/local` 로 자체 호스팅. `tailwind` sans 첫 순위를 `var(--font-pretendard)` 로. 지구본 캔버스 라벨도 실제 폰트 패밀리명 사용
- 의존성 추가: `pretendard` (package.json, package-lock.json)

### 테스트
- `tsc --noEmit`, `eslint` 통과 (기존 경고 3건 무관)
- 5개 페이지 모두 Exhibit 밖으로 넘치는 요소 없음(스크립트 검사), 1440x900 에서 페이지가 패널에 정확히 맞음(559px), 375px 에서 가로 스크롤 없음
- dev 서버를 `.next` 캐시 정리 후 재시작 (새 의존성과 폰트 반영)
