# 공동 디자인 규칙

## 브랜드 컬러 (2026-09-03 개편)

명함 디자인(테라코타 블록 + 화이트/블랙) 기준으로 사이트 전체 키컬러를 블루 → 테라코타로 교체.

| 토큰 | 값 | 용도 |
|------|-----|------|
| Primary | `#C1452D` | 기본 브랜드 컬러 (버튼, 아이콘, 강조 텍스트, 로고 dark variant) |
| Primary Bright | `#D65A3B` | 히어로처럼 어두운 배경 위 CTA 버튼 |
| Primary Bright Hover | `#B84A2E` | 위 버튼의 hover 상태 |
| Primary Dark (hover) | `#A23A24` | 기본 버튼 hover, 강조 텍스트 hover |
| Primary Tint | `#FBEEE8` | 옅은 배경 강조 (섹션 배경, 아이콘 원형 배경) |

- `globals.css`의 `--primary` / `--ring` CSS 변수(HSL `10 62% 47%`)로도 등록되어 있어 `bg-primary`, `text-primary` 등 Tailwind 유틸리티가 자동으로 새 컬러를 따른다.
- 로고(`Logo.tsx`)는 CSS 필터 대신 실제 컬러가 적용된 SVG 두 벌(`cb-logo.svg`=흰색, `cb-logo-terracotta.svg`=`#C1452D`)을 `variant`에 따라 교체한다.
- 새 브랜드 컬러를 쓰는 곳을 늘릴 때는 위 표의 토큰만 사용하고 임의의 새 블루/오렌지 값을 추가하지 않는다.

## 메인 페이지 "클리닉 그로스 컴퍼니" 개편 (2026-10-29, 브랜치 `feat/clinic-growth-renewal`)

원칙: **히어로는 셰이더 배경 + 인바운드 지구본으로 강한 인상, 이후 섹션은 화이트와 미색 교차 배경 위의 정돈된 카드와 타이포.**
레퍼런스: BAT(batcrew.co.kr), Skiper UI 메인, Unicorn Studio, Originkit.

### 토큰

| 토큰 | 값 | 용도 |
|------|-----|------|
| Ink | `#0A0A0A` | 히어로, Data Intelligence 패널, 최종 CTA 배경, 제목 텍스트 |
| Paper | `#FFFFFF` / `#F6F5F2` | 섹션 배경을 번갈아 사용, 카드 배경은 `#F6F5F2` |
| Line | `black/[0.08]` (다크: `white/10~15`) | 카드 외곽선, 블록 구분선 |
| Accent | `#C1452D` (다크 위 `#D65A3B`) | CTA, 차트 실적 라인, 아이브로우 강조 단어, 단계 목록의 마지막 단계 |

### 금지

- 섹션 배경 글로우, 블러 원형 레이어, 장식용 그라데이션 카드 (히어로 제외)
- 알약형 칩 나열, 원형 배경 아이콘, 점선 박스, 이모지
- 강조색 남용 (위 Accent 용도 외 사용 금지)

### 컴포넌트 규칙

| 유형 | 규칙 |
|------|------|
| 섹션 도입부 | `SectionIntro`: 영문 아이브로우(마지막 단어만 `font-serif italic`, Instrument Serif) + `RevealLines` 줄 단위 리빌 제목 + 설명 |
| 본문 폰트 | Pretendard 가변 폰트 동적 서브셋(`pretendardvariable-dynamic-subset.css`, `pretendard` 패키지)을 layout.tsx 에서 불러와 자체 호스팅. unicode-range 로 쓰인 글자 묶음만 받는다(2MB 단일 파일 금지). CDN 의존 없음. 패밀리명 "Pretendard Variable". 캔버스 텍스트는 `getComputedStyle` 로 실제 패밀리명을 읽어 사용 |
| 숫자 | KPI는 `#F6F5F2` 카드 + `CountUp` |
| 대표 사례 카드 | `ProofCases`: Ink 카드에 고객, 채널 태그, 큰 성과 수치, 사실 기반 시각화(집행 기간 칸, 계약부터 달성까지 타임라인). 월별 추이처럼 없는 데이터는 그리지 않는다. 실제 캡처가 있으면 `media` 로 카드 상단에 노출 |
| 출처 표기 | 차트 등 자사 데이터는 우측 하단에 "출처: 클리닉브릿지" |
| 차트 | 라이트 배경, 실적은 Accent 실선과 옅은 영역(화면 진입 시 그려짐), 예상은 점선과 음영 구간, 호버 툴팁 |
| 역량 인덱스 | `text-gray-300` 대형 영문 목록, 호버 시 진해지고 화살표 표시, 클릭 시 패널로 이동 |
| 역량 스택 패널 | 역량마다 풀스크린 패널(배경: 화이트 → 미색 → Ink 순). 데스크톱(lg, 화면 높이 880px 이상)에서 헤더 아래에 sticky 로 붙고 (그보다 낮은 노트북 화면은 상단 공지 배너까지 더하면 사례 카드가 잘리므로 일반 블록으로 쌓는다), 다음 패널이 덮어오는 동안 이전 패널은 93%로 축소되며 어두워진다. 상단에 `01 / 03` 진행 표시. 패널 높이를 넘지 않도록 본문은 압축(팀 사진 3열, 사례는 탭 전환) |
| sticky 기준 | `--header-h` CSS 변수(헤더 + 상단 배너 높이, `ClientProviders`에서 설정)를 top 값으로 사용. 전역 `overflow-x` 는 `clip`(sticky 를 깨지 않음) |
| 단계 목록 | 번호(01~04) + 텍스트, 상단 1px 라인. 칩 사용하지 않음 |
| 로고 | 마키(`LogoWall monochrome`), 흑백 고정, 호버 시 컬러 |
| 그로스 대시보드 | `dashboard/GrowthDashboard`: 8개 섹션(월별 핵심 지표 도표, Growth & GP, HOW 로직트리, Unit Economics, Leading Indicators, 로직 표, Viral K, Projection)을 세로로 이어 붙여 위로 끝없이 흘려 보내는 "스크롤되는 대시보드". 헤더, 결론 문장, 월간 리포트 없이 차트, 트리, 표만. 1200px 폭 캔버스를 패널 너비에 맞춰 축소, 위아래 흰색 페이드 |
| Exhibit | `EXHIBIT n.n` 번호 + 제목, 1.5px 검정 상단 라인. 표는 가로줄만, 우선순위와 영향도는 하비볼 |
| 대시보드 색 | 흰 바탕 위 모노톤(`#141414`, `#4A4A4A`, `#8C8C8C`, `#C9C6BF`) + 강조색 `#C1452D` 한 계열만 |
| 블러 처리 | 스트립 전체에 blur 3.6px(텍스트 포함 전부), 수치는 `R`/`RG` 로 한 번 더. "어떤 모양의 분석이 있는지"만 보이게 한다. 가려지는 병원명도 "OOOO피부과" 같은 자리표시자만 쓴다 |
| 모션 | 초당 120px(캔버스 기준) 선형 순환, 섹션 수와 무관하게 속도 일정. `prefers-reduced-motion` 이면 정지 |
| 모션 | 화면 진입 시 1회 페이드/리빌만 허용. 반복 애니메이션(히어로, 마키, 대시보드 스크롤, 사례 자동 전환)은 화면 밖에서 반드시 멈춘다: 캔버스는 IntersectionObserver, 그 외는 `useOffscreenPause` (`src/lib/hooks`) |
| 텍스트 대비 | 흰 배경 본문, 라벨은 gray-500 이상, 어두운 배경은 white/50 이상. gray-300, 400은 의도적인 장식(역량 인덱스 대형 목록)에만 |
| SEO 텍스트 | 애니메이션용 글자 조각, 측정용 문구는 data-text + ::before 로 그려 DOM 텍스트에 넣지 않고, sr-only 로 한 번만 둔다. 숫자 카운터는 서버 HTML에 최종값 |

### 히어로

| 요소 | 규칙 |
|------|------|
| 배경 | `ShaderBackground`(WebGL 실크 셰이더) 위에 `GlobeCanvas`(점묘 지구본), 좌측 스크림으로 텍스트 가독성 확보 |
| 지구본 연출 | **해외 도시 → 서울** 인바운드. 아크는 출발지에서 흐리고 서울에 가까울수록 진하며, 빛 입자가 서울로 날아와 도착 파동을 만든다. 근거리 노선도 곡선으로 보이도록 경로를 옆으로 휘게 그린다 |
| 시장 전환 | 일본, 영미권, 대만 자동 순환(`MARKET_ROTATE_MS`) + 클릭 선택. 시장마다 시점과 확대 배율(`focus`)이 다르다 |
| 메시지 | 좌측 정렬, 시장명은 글자 단위 롤링 |
| 하단 행 | 좌측: 소개 문장(`text-lg~2xl`, "클리닉브릿지"와 "전담 그로스 팀"만 `#D65A3B` 강조) + CTA. 우측 하단: 시장 선택기(번호 없이 라벨 + 진행 바) |
| 헤더 | 메인에서 히어로 위에 있을 때만 다크, 지나면 기본 화이트 |
| 접근성 | `prefers-reduced-motion` 이면 셰이더 정지 프레임, 지구본 회전과 입자 정지, 시장 자동 순환 정지 |

- 컴포넌트 위치: `src/components/sections/growth/`, 공통: `src/components/common/RevealLines.tsx`, `CountUp.tsx`
- 데이터: `src/data/growthMetrics.ts`(차트, KPI), `src/data/team.ts`(팀), `src/data/partners.ts`(로고), `src/data/markets.ts`(시장, 도시 좌표, 지구본 시점)
