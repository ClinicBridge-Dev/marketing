# 용어사전

프로젝트 공통 용어의 기준 문서입니다. 새 용어, 기능명, 화면 이름이 생기면 이 문서를 먼저 또는 동시에 갱신합니다 (`CLAUDE.md` 용어 관리 규칙).
한국어 표기에는 중간점과 대시를 쓰지 않습니다.

## 브랜드와 메시지

| 용어 | 뜻 | 쓰는 곳 |
| --- | --- | --- |
| 클리닉 그로스 컴퍼니 | 클리닉브릿지의 포지셔닝. 병원의 해외환자 매출 성장을 책임지는 회사라는 뜻. 사이트 제목 형식은 "클리닉브릿지 \| 클리닉 그로스 컴퍼니" | 사이트 제목, 히어로 상단, 푸터, 회사 소개 |
| 전담 그로스팀 | 병원마다 붙는 클리닉브릿지 인하우스형 팀. 전략, 마케팅, 상담, 예약 전환까지 맡음. 히어로 문장에서는 "전담 그로스 팀"으로 띄어 씀 | 히어로, 역량 01 Growth Team |
| 해외환자유치 | 해외(일본, 영미권, 대만) 환자를 병원 예약까지 연결하는 일. "글로벌 의료 마케팅"은 더 이상 대표 문구로 쓰지 않음 | 성과 섹션, 메타 설명 |
| 타깃 시장 | 일본, 영미권, 대만. 코드 기준은 `src/data/markets.ts` 의 `TARGET_MARKETS` | 히어로 시장 선택, 지구본 |

## 메인 페이지 섹션

| 용어 | 뜻 | 코드 |
| --- | --- | --- |
| 성과 섹션 | "숫자로 확인하는 클리닉브릿지 해외환자유치 성과". 월별 해외환자 예약자 수(계약 클라이언트 예약 기준, 취소, 노쇼 미포함) | `GrowthMetrics`, `GrowthChart`, `ProofCases` |
| 그로스 엔진 | 성과 섹션 문구 "클리닉브릿지의 그로스 엔진에 탑승하세요"의 강조어 | `GrowthMetrics` |
| 역량 패널 | 3가지 역량(Growth Team, Strategy & Execution, Data Intelligence)을 스크롤로 겹쳐 보여주는 풀스크린 패널 | `Capabilities` |
| Strategy 사례 (Case 1~3) | 원장님 질문에 대한 실제 전략 결정 사례. Case 1 레버, Case 2 Thesis, Case 3 집중 바이럴. 병원명은 가칭(A, C, D, E)으로만 표기 | `StrategyCases` |
| Thesis | 성장을 만들 핵심 가설. 타깃 시술, 메시지, 채널, 예산의 우선순위를 정하는 기준 | Strategy Case 2 |
| Lever | 매출 공식(일 최대 환자 capa × 가동률 × 객단가) 중 실제로 움직일 수 있는 변수 | Strategy Case 1, Data Intelligence 설명 |
| SOV (Share of Voice) | 타깃 시술 검색, 비교 지면에서 우리 병원이 차지하는 노출 점유율 | Strategy Case 2 |
| Owned Media | 병원 자체 계정. 협찬 콘텐츠를 쌓아 탐색 지면을 강화하는 곳 | Strategy Case 3 |
| 데이터 대시보드 | 역량 03에서 흐리게 처리해 세로로 흘려 보내는 분석 화면. 수치는 예시이며 읽히지 않게 블러 처리 | `dashboard/GrowthDashboard` |

## 콘텐츠

| 용어 | 뜻 | 코드 |
| --- | --- | --- |
| 그로스LAB | 기존 "블로그"의 새 이름. 시장별 해외환자 마케팅 리서치와 인사이트를 공유하는 곳 (경로는 `/blog` 유지) | `src/app/blog`, 헤더, 푸터 |
| 공개 예정 칼럼 | 그로스LAB에 미리 노출하는, 아직 클릭할 수 없는 칼럼 카드 | `UPCOMING_COLUMNS` (`src/data/blogPosts.ts`) |
| 파트너십 문의 | 메인 CTA. `/inquiry` 로 연결. 가격 페이지(`/pricing`)는 제거되어 `/inquiry` 로 임시 리다이렉트 | `next.config.ts` |

## 개발 프로세스

| 용어 | 뜻 | 코드·문서 |
| --- | --- | --- |
| 작업 브랜치 | `master`에서 갈라져 한 가지 작업만 담는 브랜치. `feat/`, `fix/`, `docs/`, `chore/`, `practice/`로 시작 | `AGENTS.md` Git 작업 흐름 |
| PR (Pull Request) | 작업 브랜치의 변경을 `master`에 합쳐 달라는 요청. CI 검사와 리뷰를 확인한 뒤 사람이 머지 (현재 필수 승인 0명, 추후 1명) | `.github/pull_request_template.md` |
| CI 검사 (`check`) | PR마다 GitHub Actions가 실행하는 lint, typecheck, test, build. 브랜치 규칙의 머지 필수 조건 | `.github/workflows/ci.yml`, `docs/testing/README.md` |
| 자동 테스트 | `npm test`로 실행하는 테스트. 외부 서비스로 실제 요청을 보내지 않음 | `tests/`, `docs/testing/README.md` |
| 리뷰 룰 (`rules.md`) | PR 리뷰 때 사람과 AI 리뷰어(Codex, Claude)가 함께 쓰는 판단 기준. Codex용 요약은 `AGENTS.md`의 `Code Review Rules` | `rules.md` |
| 심각도 (critical / major / minor / nit) | 리뷰 지적의 등급. 다음 행동(머지 금지, 사람 승인, 승인 후보, 참고)을 정함. critical은 Codex의 P0, major는 P1. GitHub의 Codex 리뷰는 P0·P1만 코멘트로 남김 | `rules.md` 1장 |
| 오탐 / 미탐 | 오탐: 문제없는 코드를 문제라고 잘못 지적함. 미탐: 실제 문제를 놓침. 반복되는 오탐만 리뷰 룰에 반영 | `rules.md` 9장 |

