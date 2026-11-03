# 자동 테스트와 CI

PR마다 GitHub Actions(`.github/workflows/ci.yml`)가 아래 네 가지를 실행한다. 하나라도 실패하면 PR에 빨간 X가 뜨고, `master` 브랜치 규칙에서 `check`를 필수 검사로 지정하면 머지 버튼이 막힌다.

| 순서 | 명령 | 하는 일 |
|---|---|---|
| 1 | `npm run lint` | ESLint 코드 규칙 검사 (경고는 통과, 오류는 실패) |
| 2 | `npm run typecheck` | TypeScript 타입 검사 (`tsc --noEmit`) |
| 3 | `npm test` | 자동 테스트 (`vitest run` + `node --test tests/*.test.cjs`) |
| 4 | `npm run build` | 환경변수 없이 운영 빌드. 비밀값이 없어도 빌드가 깨지지 않아야 한다 |

로컬에서는 커밋 전에 1~3을, 큰 변경이면 4까지 실행한다.

## 테스트 목록

모든 테스트는 외부 서비스로 실제 요청을 보내지 않는다. `tests/helpers/fetchGuard.ts`가 `fetch`를 가로채 등록한 가짜 주소(`.test` 도메인)에만 가짜 응답을 돌려주고, 그 밖의 주소는 바로 실패시킨다. 신청 정보도 가짜 값(`test@example.com` 등)만 쓴다. 테스트는 운영 서버(Vercel)와 같은 UTC 시간대로 실행한다 (`vitest.config.ts`).

| 파일 | 지키는 약속 | 관련 룰 |
|---|---|---|
| `tests/inquiry-route.test.ts` | 상담 신청 API: 기록이 하나라도 남아야 성공(`ok` + `inquiryId`), 운영에서 모두 실패하거나 채널 설정이 없으면 500, 시트 권한 오류(200 + HTML)는 실패, 스팸 방지·입력 검증, 신청자 정보는 설정된 기록 채널로만 전송 | R02, R03 |
| `tests/inquiry-event-id.test.ts` | 접수 ID: 같은 사람·같은 한국 날짜는 같은 ID, 표기 차이 무시, 날짜·비밀값이 바뀌면 다른 ID, 연락처가 ID에 드러나지 않음, 비밀값 없으면 무작위 UUID | R04 |
| `tests/notification-modules.test.ts` | Slack·구글 시트 모듈: 설정이 없으면 건너뜀, 네트워크 오류에도 예외를 던지지 않음, 시트는 응답 JSON `ok`까지 확인, 시트 비밀값 전송 | R03 |
| `tests/openai-pixel.test.ts` | OpenAI `lead_created`: 같은 접수 ID는 한 번만, 빈 ID·픽셀 ID 없음이면 전송 안 함, SDK 오류가 접수 흐름을 깨지 않음 | R04 |
| `tests/secret-exposure.test.ts` | 비밀값 노출 정적 검사: 브라우저 코드가 서버 환경변수·서버 전용 모듈을 쓰지 않음, 비밀값 이름에 `NEXT_PUBLIC_` 금지, 비밀값(환경변수, `apiKey`·`token` 등의 변수)을 잘라서든 통째로든 로그에 출력 금지, `src/app/api/` 아래 디버그·테스트용 라우트 금지, `.env` 파일 커밋 금지 | R01 |
| `tests/meta-pixel.test.cjs` | Meta 픽셀: 방문·상담 이벤트 분리, 중복 방지, 폼 값·쿼리 문자열 미전송 (`docs/analytics/meta-pixel.md`) | R02, R04 |

## 테스트를 추가할 때

- 새 파일은 `tests/이름.test.ts`로 만든다. `@/` 경로 별칭을 쓸 수 있다.
- 외부 요청이 있는 코드는 반드시 `guardFetch()`로 감싼다. 실제 Slack·시트·광고 서비스로 보내는 테스트는 만들지 않는다.
- 모듈을 불러올 때 환경변수를 읽는 파일(`src/app/api/inquiry/route.ts`, `src/lib/slack.ts`, `src/lib/openaiPixel.ts`)은 `vi.stubEnv()`로 값을 바꾼 뒤 `vi.resetModules()`와 `import()`로 새로 불러온다.
- 테스트가 실제로 결함을 잡는지 확인한다. 코드를 일부러 틀리게 바꿨을 때 테스트가 실패해야 한다.
- 기대값을 약하게 바꾸거나 테스트를 지우는 변경은 리뷰에서 사람이 확인한다 (`rules.md` 8장).

## 아직 자동 테스트가 없는 것

- 문의 폼 화면의 제출 흐름(성공 응답일 때만 전환을 부르는지). 지금은 `rules.md` R04 리뷰와 수동 확인으로 본다.
- `contact`, `diagnosis`, `subscribe` API 라우트.
- 화면 표시(디자인), 성능.
