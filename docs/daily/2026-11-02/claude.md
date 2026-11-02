# 2026-11-02 작업 기록

## 작업 방식을 브랜치 → PR → 리뷰 → 머지로 변경, 리뷰 룰과 자동 테스트·CI 추가

### 요청
1. 새 작업은 브랜치를 만들어 PR을 올리고 검토 후 머지하는 흐름으로 바꾸기.
2. build, lint 외에 중요한 테스트 항목 추가.
3. (앞선 요청) Project 2 학습 자료(저장소 미포함) 기준으로 리뷰 룰 `rules.md` 작성. 리뷰는 GPT 구독(Codex GitHub 연동)으로 운영할 예정.

### 사전 확인
- 로컬 `master`가 `origin/master`보다 8커밋 뒤처져 있었고, 로컬 작업 폴더에는 커밋 전 작업(OpenAI 서버 전환 등)이 남아 있었음.
  → `origin/master` 기준 별도 worktree(`../marketing-pr-workflow`, 브랜치 `chore/pr-workflow-and-tests`)에서 작업. 로컬 미커밋 작업은 건드리지 않음.
- 저장소는 공개(public). 내 GitHub 권한은 WRITE라 `master` 브랜치 규칙(ruleset)은 관리자가 설정해야 함.
- 기존 검사: `npm run lint`는 기존 오류 6건(`tailwind.config.ts`, `tests/meta-pixel.test.cjs`의 `require()`)으로 실패 상태였음.
- 열린 PR #4(`feat/inquiry-report-ref`)가 `src/app/api/inquiry/route.ts`를 수정함 → 머지 순서에 따라 테스트 조정이 필요할 수 있음.

### 변경
- `CLAUDE.md` → `AGENTS.md`로 이동하고 `CLAUDE.md`는 `@AGENTS.md` 한 줄로 변경. Codex와 Claude가 같은 규칙을 읽게 하기 위함.
- `AGENTS.md`: "Git 작업 흐름" 섹션, 개발 워크플로우 6단계(PR), Codex가 읽는 `## Code Review Rules` 요약 추가. 문서 우선순위 1번을 `AGENTS.md`로.
- `rules.md`(신규, 룰 v1): 심각도 4단계, 프로젝트 룰 R01~R06(비밀값, 개인정보, 접수 기록, 전환 추적, 전역 영향 변경, 팀 규칙), 판단 원칙, 코멘트·요약 형식, 판정 규칙, 오탐 처리.
  현재 `origin/master` 코드 기준(기록이 하나라도 남아야 접수 성공, HMAC 접수 ID, Meta 픽셀)으로 작성.
- 자동 테스트: vitest 3 추가(`vitest.config.ts`, UTC 실행). `npm test` = `vitest run` + 기존 `node --test tests/*.test.cjs`.
  - `tests/inquiry-route.test.ts`(10), `tests/inquiry-event-id.test.ts`(6), `tests/notification-modules.test.ts`(7), `tests/openai-pixel.test.ts`(4), `tests/secret-exposure.test.ts`(4).
  - `tests/helpers/fetchGuard.ts`: 외부 요청을 모두 가로채고 등록하지 않은 주소는 실패시킴. 실제 Slack·시트·광고 서비스로 요청이 나가지 않음.
- `package.json`: `typecheck`, `test` 스크립트, devDependency `vitest`. `package-lock.json`과 `bun.lock` 둘 다 갱신(기존 패키지 버전 변경은 `@types/estree`, `tinyglobby`, `picomatch` 패치뿐).
- `eslint.config.mjs`: `*.cjs`, `tailwind.config.ts`에서 `require()` 허용 (기존 lint 오류 해소).
- `.github/workflows/ci.yml`: PR·master push마다 lint → typecheck → test → build (Node 22, 환경변수 없음).
- `.github/pull_request_template.md`: 변경 내용, 확인 항목, 사람 확인 필요 파일, 문서 체크.
- 문서: `docs/testing/README.md`(신규), `README.md`(테스트, 기여하기), 용어사전 "개발 프로세스" 섹션.

### 테스트
- `npm run lint` 오류 0(기존 경고 3), `npm run typecheck` 통과, `npm test` vitest 31개 + node:test 6개 통과, 환경변수 없이 `npm run build` 통과, 깨끗한 상태에서 `npm ci` 통과.
- 테스트가 결함을 실제로 잡는지 코드를 일부러 틀리게 바꿔 확인(확인 후 원복):
  접수 기록 판정 제거, 스팸 방지 제거, 이메일 정규화 제거, 한국 시간대 제거, `lead_created` 중복 방지 제거, Slack 모듈 예외 전파, 브라우저 코드에서 서버 환경변수 읽기 → 모두 해당 테스트 실패.

### 함께 발견한 기존 위험 (수정하지 않음)
- 리뷰 룰 R01~R03 기준으로 기존 코드에서 보안·개인정보 관련 문제 몇 건을 발견함. 공개 저장소라 상세 내용은 여기에 적지 않고 담당자에게 따로 전달함. 별도 PR로 처리.

### 남은 일 (사람)
- 저장소 관리자: `master` 브랜치 규칙 설정 (PR 필수, 승인 1명, 필수 검사 `check`, 관리자 우회 금지).
- Codex GitHub 연동 후 연습 PR에서 `@codex review` 1회당 사용량 확인 → 자동 리뷰 여부 결정.
- 로컬 작업 폴더 정리: `master`를 최신으로 받기 전에 미커밋 작업(OpenAI 서버 전환)을 별도 브랜치로 옮겨야 함.
