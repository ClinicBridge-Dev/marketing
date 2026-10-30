# 2026-10-30

## 가격 페이지 삭제 (브랜치 `feat/clinic-growth-renewal`, 미배포)

### 변경 내용
- `src/app/pricing/page.tsx` 삭제 (`/pricing` 라우트 제거)
- `Header`: 내비게이션에서 "가격" 항목 제거 (모바일 메뉴도 같은 목록을 사용하므로 함께 제거됨)
- `next.config.ts`: `/pricing` → `/inquiry` 임시 리다이렉트(307) 추가. 기존 링크, 북마크, 광고 유입이 404 대신 상품과 가격이 안내되는 문의 페이지로 가도록 함
- `src/lib/metaPixel.ts`: `PAGE_TYPES` 에서 `/pricing` 항목 제거

### 영향분석
- 화면에 노출되는 컴포넌트 중 `/pricing` 링크는 헤더뿐이었음
- `PlanCompare`, `TrustPromise`, `WhyClinicBridge` 에도 `/pricing` 링크가 있으나 현재 어떤 페이지에서도 사용하지 않는 컴포넌트라 그대로 둠 (다시 쓰게 되면 링크 정리 필요)
- 문의 폼(`InquiryForm`)의 서비스별 가격 표기는 가격 페이지와 별개라 유지

### 테스트
- `tsc --noEmit`, `eslint` 통과 (기존 경고 3건 무관)
- 서버 재시작 후 `/pricing` 307 → `/inquiry`, `/` 200, `/inquiry` 200 확인. 헤더 메뉴는 홈, 블로그만 노출, 페이지 내 `/pricing` 링크 0개
- 지구본 첫 프레임 음수 반지름 오류 수정(`GlobeCanvas`: 경과 시간을 0 이상으로 제한)

## 블로그 → 그로스LAB, 영미권 공개 예정 칼럼

### 변경 내용
- 명칭 변경: 헤더 메뉴 "블로그", 푸터 "인사이트", 문의 완료 페이지 "인사이트 둘러보기", 역량 패널 링크 "그로스 LAB" → 모두 "그로스LAB". 목록 페이지 제목과 소개 문구 변경. URL 은 `/blog` 유지(기존 링크, 검색 노출 보존)
- `blogPosts.ts`: `UPCOMING_COLUMNS`, `getUpcomingColumns()` 추가. 영미권 칼럼 3개(검색 경로, 신뢰 설계, 제로 투 월 매출 5억 원 실행 기록)를 "영미권 인사이트" 카테고리로 등록. 카테고리 목록에 포함, 관련 콘텐츠 목록에서는 제외
- `blog/page.tsx`: 공개 예정 칼럼은 대표 리포트 바로 뒤에 클릭되지 않는 카드(점선 테두리, "공개 예정" 배지, 요약)로 표시. 카드 렌더링을 `InsightCard`, `UpcomingCard` 로 분리
- 용어: 사용자 표기에 맞춰 "그로스LAB"(붙여 씀)으로 통일

## Data Intelligence: 차트만 세로로 흐르는 대시보드

### 변경 내용
- `GrowthDashboard` 재작성: 러닝 헤더(보고서명, 섹션 트래커, CONFIDENTIAL), 결론 문장, 푸터, 자동 페이지 전환 제거. 5개 화면의 Exhibit 을 세로로 이어 붙여 위로 무한 스크롤(55초 한 바퀴), 위아래 페이드, 모서리 둥글게
- `Exhibit` 본문 전체 블러(1.6px), 수치는 기존처럼 강한 블러 유지
- 각 Stage 파일의 결론 문장 export 삭제

### 테스트
- `tsc --noEmit`, `eslint` 통과
- 1440x900: 대시보드가 패널을 채우고 위로 흐르는 것 확인. `/blog`: 제목 "그로스LAB", 공개 예정 카드 3개, "영미권 인사이트" 필터 시 공개 예정 3개만 노출

## 그로스LAB 공개 예정 칼럼 교체

- `UPCOMING_COLUMNS`: Reddit, 신뢰 설계 칼럼 삭제. "영미권 환자 마케팅 제로 투 월 매출 5억 원, 첫 7개월의 실행 기록" (1)(2)(3) 3개로 교체. 요약(excerpt) 필드 삭제, 회차(part) 필드 추가
- 공개 예정 카드 표지: 요약 문구 대신 "공개 예정" 배지 + 회차 번호(01~03)

## Data Intelligence: 핵심지표 도표, HOW 로직트리, 로직 표 추가

### 변경 내용
- 신규 `StageKpi`: 월별 핵심 지표 표(노출, 상담자 수, 예약자 수, 상담→예약, 내원, 신환, 재진, 매출, 객단가, GP, 마케팅비, CAC, ROAS, 노쇼율 x 1~9월 + 합계, MoM, 추이) + 상담자 vs 예약자 막대 + 매출, GP 차트. 상담자 수, 예약자 수를 기준으로 나머지 지표를 일관되게 파생
- 신규 `StageHowTree`: 가로 전체 폭 HOW 트리(목표 → How 1 3개 → How 2 8개 → 실행안, KPI, 담당, 12개월 일정 바, 영향도 하비볼)
- 신규 `StageLogicTable`: 이슈 → 가설 → 검증 데이터 → 분석 결과 → 실행안, 영향도와 난이도 하비볼, 우선순위(P1~P3) 9행
- `StageProjection`: 월간 리포트 썸네일(Exhibit 5.5) 삭제, 결정 로그가 남은 폭 사용
- `GrowthDashboard`: 섹션 순서 KPI, Growth, HOW 트리, Unit, Leading, 로직 표, Viral, Projection. 스트립 전체 blur 2.2px(텍스트 포함). 스크롤 속도를 초당 120px 로 고정(이전 약 51px/초 대비 2배 이상)
- `Exhibit`: 본문 개별 블러 제거(스트립 전체 블러로 대체)

### 테스트
- `tsc --noEmit`, `eslint` 통과
- 8개 섹션 모두 520px 칸 안에 들어감(스크립트 검사). 1440x900 에서 표, 트리, 차트 형태가 보이고 글자는 읽히지 않는 것 확인
- `/blog`: 공개 예정 카드 3개가 (1)(2)(3) 시리즈로 표시, 요약 문구 없음

## Manpower 호버 설명 제거, 대시보드 블러 강화

- `Capabilities` 팀 사진: 마우스오버 시 담당 업무 설명이 뜨던 오버레이 삭제 (이름, 역할만 표시)
- `GrowthDashboard`: 스트립 전체 블러 2.2px → 3.6px
- `docs/design/README.md` 블러 수치 갱신

## 파트너 조건 문구 수정

- `PartnerFit`: "같이 잘 벌어야 오래 갑니다." → "서로 윈윈하는 구조를 지향합니다."

## Manpower → Growth Team

- `Capabilities`: 역량 01 영문명 "Manpower" → "Growth Team", 한글 라벨 "맨파워" → "그로스팀", 앵커 id `cap-manpower` → `cap-growth-team`
  - 제목: "우리 병원의 성장을 이끄는 전담 그로스팀"
  - 설명: "서울대 출신 전략, 마케팅 전문가들이 우리 병원의 성장 전략부터 마케팅 실행까지 함께합니다."
- `team.ts`: 팀 구성 갱신 (배열 순서 = 3열 배치). 상단: 마케팅 전략(대표, 전략 컨설턴트) / 마케팅 전략, 마케팅 연구(부대표, 전략 컨설턴트) / 일본 바이럴 및 파트너십(담당 매니저). 하단: 프로젝트 리드, AX(담당 매니저) / 기술 운영, AX(Tech 매니저) / 고객 경험 및 채널 운영(CX / Owned 매니저). 사진은 자리별로 기존 그대로
- `description` 은 화면에 노출하지 않아 선택 필드로 바꾸고 기존 문구 삭제
- 요청의 "하단 좌측" 두 번째 항목(고객 경험 및 채널 운영)은 하단 우측으로 해석

## Strategy 사례 교체, 라벨과 문구 수정

### 변경 내용
- 신규 `StrategyCases.tsx`: 사용자 아티팩트 "Strategy & Execution Cases"의 Case 01~03 이식
  - 01 집중 바이럴 / 02 시술 동선 선점 / 03 레버는 하나
  - 질문, Thesis, 본문, 4단계, 시각화(동기간 집중 vs 분산 협찬 이중선, 검색 결과 상위 5건 점유 목업, 가동률 x 객단가 레버 매트릭스), 근거 수치 2개(고객, 기간, Case 03 은 "진행 중"), "이 결정으로 바뀐 것", 출처 각주
  - 8초 자동 순환 + 진행 바, 카드 호버 시 일시정지, 탭 클릭 시 순환 해제
  - 레버 매트릭스 범례의 대시 문자는 선 견본(SVG line)으로 대체
  - 탭 전환은 퇴장 애니메이션 없이 새 패널만 페이드인. `AnimatePresence mode="wait"` 사용 시 빠른 연속 전환이나 백그라운드 탭에서 패널이 opacity 0 으로 멈추는 문제 확인 후 수정
- `Capabilities`: 기존 Case 2개 탭 삭제 후 `StrategyCases` 사용. Strategy 좌측에 인트로 문구("원장님들이 가장 자주 하시는 질문과, 저희가 실제 클라이언트에서 내린 결정입니다.") 추가
- Growth Team 한글 라벨: "그로스팀" → "전담 그로스팀"
- Data Intelligence 설명: "깊이가 낮은 흔한 데이터의 나열이 아닙니다. ... Break-down하고, 그 중 핵심인 Lever을 도출하여, ..." (사용자 문구 그대로)

### 확인
- `tsc --noEmit`, `eslint` 통과
- 1440x900 에서 Case 01~03 모두 패널 안에 들어감(콘텐츠 656px / 패널 804px), 빠른 연속 탭 클릭 후에도 패널 정상 표시
- 주의: 근거 수치의 고객명이 실명으로 노출됨. 공개 전 고객 동의 확인 필요 (이후 가칭으로 교체, 아래 참고)

## 성과 섹션 제목 첫 줄 톤 다운

- `GrowthMetrics.tsx`: 제목 첫 줄 "숫자로 확인하는"을 0.75em, semibold, gray-600으로 낮춰 둘째 줄 "클리닉브릿지 해외환자유치 성과"에 시선이 가도록 조정 (데스크톱 48px → 36px).
- 브라우저에서 계산된 스타일과 화면으로 확인.

## Strategy 패널 소개 문구 교체

- `StrategyCases.tsx` `STRATEGY_INTRO`: "원장님들이 가장 자주 하시는 질문과..." → "같은 진료과, 같은 시술이어도 병원마다 답은 다릅니다. Key Message와 시장 지형, 핵심 지표 현황 등을 고려하여 클리닉브릿지는 우리 병원만을 위한 맞춤 전략을 설계합니다." (병원별 맞춤 전략 메시지)

## Strategy 설명 문구 부분 강조

- `Capabilities.tsx`: `Capability.description` 타입을 `React.ReactNode`로 넓히고, Strategy 설명의 "매출을 만드는 엔진을 구축"을 semibold, 진한 글자색, 브랜드색 반투명 2px 밑줄로 강조. tsc 통과, 브라우저 확인.

## Strategy 사례 카드 개편 (Case 표기, Case 1 문구, 가칭)

- `StrategyCases.tsx`
  - 탭 번호 "01/02/03" → "Case 1/2/3" (`num`을 숫자로 변경).
  - 질문 문구를 13px 회색 → 17px semibold로 키움.
  - Case 1 문구 교체: 결론 "타깃에게 노출을 집중하고, 협찬 자산을 잘 레버리지해야 합니다.", 본문 2문단(집중 바이럴 + Owned Media 축적, 멀티유즈로 간접 전환 확대). `body`를 문단 배열(`string[]`)로 변경.
  - 하단 "→ 이 결정으로 바뀐 것" 줄과 출처 각주(FOOTNOTE)를 세 사례 모두에서 삭제 (`decision` 필드 제거).
  - 실제 병원명을 가칭으로 교체: A 약국 프로젝트, 다이어트 클리닉(성과 섹션 표기와 통일), C 의원, D 피부과, E 피부과 (1인 원장). B는 성과 섹션 영미권 사례("B 클리닉")와 겹치지 않도록 비움. 실명은 기록에도 남기지 않는다.
- 검증: tsc, eslint 통과. 1440×900에서 세 사례 카드 높이 470~490px, 패널(764px) 안에 들어감.

## Strategy Case 2 문구 교체

- `StrategyCases.tsx`
  - Case 2 질문 "SNS를 잘 운영하고, 협찬만 많이 하면 되는 거 아닌가요?", 결론 "전략에는 명확한 Thesis가 있어야 합니다.", 본문 4문단(Thesis 수립 방식, 예시 가설 인용, 검증 방식)으로 교체.
  - 본문 문단 타입을 `Paragraph = string | { quote }`로 확장해 예시 가설을 브랜드색 왼쪽 선 인용 블록으로 표시.
  - 단계: 시장과 고객 행동 분석 / 핵심 Thesis 수립 / 메시지와 실행 전략 설계 / 성과 검증과 전략 개선.
  - 근거 1: "4개월 만의 월 예약 매출 (2,630만 → 1.3억 원). 타깃 시술 검색 상위 5건 중 3건 점유 및 관련 콘텐츠 조회수를 월간 KPI로 운영". 배수를 수치에 맞춰 3.5× → 4.9×(13,000 / 2,630)로 수정.
  - 본문이 길어져 1440×900에서 22px 넘침 → 본문 13px, 줄간격 1.65, 문단 간격 축소로 해결 (Case 2 카드 607px, 패널 764px 안).

## Strategy 사례 순서 변경, Case 3(레버) 문구 교체

- `StrategyCases.tsx`
  - 순서를 레버 → Thesis → 집중 바이럴로 뒤집고, 탭은 "Case 1/2/3"만 표시(사례 이름 라벨 제거). 번호는 배열 순서로 매기고 `num`, `label` 필드 삭제. id는 내용 기준(case-lever, case-thesis, case-viral).
  - 레버 사례 결론을 두 줄로: "우리 병원은 단순히 환자만 많이 늘면 손해입니다. / 매출 공식상 움직일 수 있는 Lever는 하나입니다." (`thesis`에 줄바꿈 허용, whitespace-pre-line)
  - 본문 앞에 "병원마다 상이" 꼬리표 추가 (`Paragraph`에 `{ tag, text }` 형태 추가).
  - 근거 "5,385 검색량 1위 시술" 삭제.
- 검증: tsc, eslint 통과. 1440×900에서 카드 426~574px, 패널(764px) 안.

## 커밋, 푸시, PR

- `npm run build` 통과 후 `e778330` 커밋(작성자 심영훈, 저장소 git 설정 변경 없음).
- 사용자 승인 후 `feat/clinic-growth-renewal` 푸시, PR ClinicBridge-Dev/marketing#5 (base master) 생성. 병합하지 않음.
- 푸시 시 Vercel이 미리보기 배포를 자동 생성함(운영 반영은 master 병합 시). 이 기록 추가분은 로컬에만 있고 커밋하지 않음.

## 사이트 제목과 설명을 새 메시지로 교체 (리뷰 피드백)

- `src/app/layout.tsx`: title, OG, Twitter, OG 이미지 alt "클리닉브릿지 - 글로벌 의료 마케팅" → "클리닉브릿지 | 클리닉 그로스 컴퍼니". description을 히어로 문구 기반 "우리 병원의 전략 수립부터 마케팅, 상담, 예약 전환까지. 클리닉브릿지는 해외환자 매출을 책임지는 전담 그로스 팀입니다."로 교체. keywords 맨 앞에 "클리닉 그로스 컴퍼니, 해외환자 유치".
- `Footer.tsx`: "글로벌 의료 마케팅 파트너입니다." → "클리닉 그로스 컴퍼니입니다." / `about/page.tsx` 서브타이틀 → "클리닉 그로스 컴퍼니".
- 남은 것: about 본문 "글로벌 의료 마케팅을 책임지겠습니다." 문장, 블로그 태그, OG 이미지(og-image-v2.jpg) 속 문구 "서울대 출신 대표가 직접 진행하는 일본 병원 마케팅".
- 리뷰 1번 재현: 1366×768 + 상단 공지 배너(헤더 104px)에서 Strategy Case 2 카드가 약 123px 잘림, Case 1은 4px. 배너가 닫힌 상태(헤더 64px)에서는 잘림 없음.

## 리뷰 피드백 반영 (PR #5 후속)

- 역량 패널 잘림: sticky 기준을 화면 높이 760px → 880px 이상으로 올림(`Capabilities.tsx`, 디자인 규칙 갱신). 1366×768 + 공지 배너에서 패널이 일반 블록으로 쌓이고 잘림 0, 1440×900에서는 기존처럼 sticky, 잘림 0.
- 성과 숫자 SEO: `CountUp` 초기값을 최종값으로 두고 `useLayoutEffect`로 페인트 전 0으로 되돌림. 서버 HTML에 "3,119명", "+69%", "+6.8%", "4,538명"이 들어감을 curl로 확인. 화면에서는 기존처럼 0부터 올라감.
- 히어로 h1: 굴러가는 글자 조각, 폭 측정 문구를 data-text + ::before 로 그리고 sr-only 라벨 하나만 텍스트로 둠. 서버 HTML h1 텍스트 "일본 환자가 먼저 찾는 클리닉을 만듭니다."
- 폰트: `next/font/local` 2MB 단일 파일 → Pretendard 동적 서브셋 CSS(92조각, unicode-range). 메인 첫 화면에서 16조각 약 380KB만 받음. Tailwind sans 첫 항목 "Pretendard Variable".
- 화면 밖 애니메이션 정지: 공통 훅 `src/lib/hooks/useOffscreenPause.ts` 추가. 로고 월, CTA 텍스트 마퀴(data-offscreen → CSS 일시정지), 대시보드 스크롤(framer → CSS `cb-dashboard-scroll` + animation-play-state), Strategy 자동 전환에 적용. 화면 밖 paused, 진입 시 running 확인.
- 대비: 역량 인덱스 한글 라벨, 패널 진행 표시, 차트 축 라벨(#9CA3AF → #6B7280), 성과 출처, 그로스LAB 날짜를 gray-500으로. Strategy 보조 글자색 #A8A49D → #78736C. 어두운 카드 white/35, 40 → white/50, 55. 히어로 비활성 시장 white/35 → white/50. 역량 인덱스 대형 목록(gray-300)은 장식으로 유지.
- 용어사전 `docs/glossary/README.md` 신설 (클리닉 그로스 컴퍼니, 전담 그로스팀, 그로스LAB, Thesis, Lever, SOV 등).
- 이 기록 파일의 실제 병원명 제거.
- 남은 것: 메인 JS 201kB(대시보드 지연 로딩은 후순위), OG 이미지 문구 교체, 성과 수치 근거 확인(사용자).
- 검증: tsc, eslint, `npm run build` 통과.
