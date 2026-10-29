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
