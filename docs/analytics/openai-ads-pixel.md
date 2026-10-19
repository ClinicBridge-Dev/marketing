# OpenAI Ads Measurement Pixel — 상담 신청 전환 추적

공식 문서: https://developers.openai.com/ads/measurement-pixel

## 요약

| 항목 | 내용 |
| --- | --- |
| 픽셀 ID | `7cATm8KzGCSsbvHaVn9PSo` (`NEXT_PUBLIC_OPENAI_PIXEL_ID`로 설정해야 활성화) |
| 설치 위치 | `src/app/layout.tsx` — 전체 페이지 (`next/script`, `afterInteractive`) |
| 공통 모듈 | `src/lib/openaiPixel.ts` |
| 전환 이벤트 | `lead_created` / 데이터 `{ type: "customer_action" }` / 옵션 `{ event_id: inquiryId }` |
| 전송 위치 | `src/app/inquiry/_components/InquiryForm.tsx` 제출 핸들러 |
| 전송 조건 | `/api/inquiry` 응답이 `200` + `ok: true` + `inquiryId` 문자열일 때만 1회 (서버는 시트·트렐로·메일·슬랙 중 하나 이상 기록됐을 때만 `ok`) |
| 접수 ID | `src/lib/inquiryEventId.ts` — 비밀값이 있으면 이메일·전화번호·한국 날짜의 HMAC, 없으면 무작위 UUID |

## 왜 전체 페이지에 설치하나

광고 클릭으로 들어온 첫 페이지(랜딩 페이지)에서 SDK가 URL의 `oppref`를 읽어 `__oppref` 쿠키에 저장해야
이후 `/inquiry`에서 발생한 전환이 광고와 연결된다. 그래서 설치 스니펫은 루트 레이아웃에 둔다.
픽셀 설치만으로는 `lead_created`가 전송되지 않는다. SDK는 로드 시 자체 진단 이벤트(`openai::sdk_init`,
`oai::diagnostic`)만 보내며, 이는 전환이 아니다.

## 전송 규칙

보내는 경우
- 상담 신청이 서버에 접수되어 `/api/inquiry`가 `{ ok: true, inquiryId }`를 돌려준 경우에만, 제출 핸들러 안에서 1회.
- 서버의 "접수 완료" 기준 (2026-10-19): 구글 시트 저장, 트렐로 카드 생성, 알림 메일 발송, 슬랙 알림 중 **하나 이상 성공**.
  모두 실패하면 `500`을 돌려주고(신청자에게 재시도 안내) 전환도 보내지 않는다. 기록이 없는 전환을 막기 위함이다.
  예외: 로컬 개발(`NODE_ENV !== production`)에서 저장 채널을 하나도 설정하지 않은 경우는 테스트를 위해 통과시킨다.

보내지 않는 경우
- 페이지 방문, 버튼 클릭, 입력 검증 오류(클라이언트 zod / 서버 400), 접수 실패(5xx·네트워크 오류)
- 허니팟 응답(`{ ok: true }`만 오고 `inquiryId` 없음)
- `/inquiry/complete` 진입·새로고침·직접 방문 (완료 페이지에는 추적 코드를 두지 않는다)

중복 방지 (4중)
1. 전환을 렌더링/`useEffect`가 아닌 제출 핸들러에서만 보낸다 → 재렌더링·새로고침으로 다시 실행되지 않음.
2. `InquiryForm`의 `submitLockRef`로 연타 시 두 번째 제출을 막는다 (서버 접수 자체가 1건).
3. `trackLeadCreated`가 같은 `event_id`를 한 번만 보내고, OpenAI도 `pixelId + 이벤트명 + event_id`가 같으면 처음 것만 집계한다.
4. **같은 사람의 재제출** (2026-10-19): `INQUIRY_EVENT_ID_SECRET`이 설정돼 있으면 접수 ID를
   `HMAC-SHA256(비밀값, 소문자 이메일 | 숫자만 남긴 전화번호 | 한국 날짜)`로 만든다.
   같은 날 같은 연락처로 다시 제출하면 같은 `event_id`가 되어 OpenAI가 두 번째 전환을 무시한다.
   - 접수 기록(시트·트렐로·메일·슬랙)은 제출마다 남는다. 막는 것은 광고 전환 중복뿐이다.
   - 비밀값이 없으면 연락처를 역산할 수 없는 무작위 UUID를 쓴다 (재제출 중복은 막지 못함).
   - 비밀값은 공개 저장소에 넣지 않는다. 고정 솔트를 코드에 두면 전화번호(경우의 수가 적음)를 역산할 수 있다.

## 개인정보

- 우리 코드가 보내는 이벤트 데이터는 `{ type: "customer_action" }` 하나뿐이다. 이름·연락처·이메일·상담 내용은 넣지 않는다.
- `event_id`(`inquiryId`)는 서버가 접수마다 만드는 무작위 UUID다. Slack/Trello/메일에는 저장하지 않는다.
- 측정 동의: SDK 기본값은 동의(`true`)다. 동의 배너를 도입하면 `oaiq("consent", false)`를 init **전에** 호출하고,
  사용자가 동의하면 `oaiq("consent", true)`를 호출한다. 거부 시 `__oppref`/`__obref` 쿠키가 삭제되고 AAM도 멈춘다.

### 자동 고급 매칭(AAM) — 켜진 상태로 운영 (2026-10-14 결정)

- AAM이 켜져 있으면 SDK가 페이지의 입력칸을 스스로 읽어 전환 이벤트의 `user` 필드에 붙인다.
  코드의 `measure` 호출과 무관하게 동작하며, `init` 옵션(`pixelId`·`debug`·`user`만 받음)으로 끌 수 없다.
- 로컬 격리 테스트에서 `/inquiry` 제출 시 `lead_created`에 붙은 값:
  `em`(이메일 SHA-256), `ph`(전화번호 SHA-256), `fn`(이름 SHA-256), `rg`(지역 **원문**, 예: `"서울"`).
- SDK는 문서 전체의 입력 이벤트를 감지하므로, 같은 탭에서 상담 모달(`ConsultationForm`)이나
  `/benchmark` 진단 폼(`DiagnosisLeadForm`)에 입력한 값도 이후 전환에 붙을 수 있다 (SDK 구조상, 별도 테스트는 안 함).
- 해시값도 개인정보로 다룬다. **운영 반영 전** 개인정보처리방침과 폼 동의 문구에 OpenAI로의 제공
  (항목, 목적, 보유기간, 국외 이전, 거부 방법)을 반영한다. 문구는 법무 검토를 거친다.
- 운영 반영 순서: 개인정보처리방침·동의 문구 반영 → Vercel **Production**에 `NEXT_PUBLIC_OPENAI_PIXEL_ID` 설정 → 배포.
- 현재 상태 확인 (누구나 실행 가능, 픽셀 동작에 영향 없음):
  ```bash
  curl -s https://bzrcdn.openai.com/pixel-config/v1/7cATm8KzGCSsbvHaVn9PSo.json
  # {"automatic_advanced_matching_enabled":true}  → 켜짐
  ```
- 나중에 끄려면 (업계 기사 기준 경로; OpenAI 도움말은 자동 수집이 막혀 직접 확인 못 함):
  Ads Manager → Tools → Conversions → Data Source 목록의 계정 단위 옵션, 또는 해당 픽셀 → Edit pixel.
  2026-10-14 담당자는 Edit pixel 화면에서 스위치를 찾지 못했다. 안 보이면 계정 권한을 확인하거나 OpenAI Ads 지원에 요청한다.
  2026-08-17부터 기존 픽셀도 기본으로 켜지는 opt-out 방식이다.

## SDK가 사용하는 저장소

| 이름 | 종류 | 기간 | 용도 |
| --- | --- | --- | --- |
| `__oppref` | 1st-party 쿠키 | 30일 | 광고 클릭 식별자(oppref) |
| `__obref` | 1st-party 쿠키 | 365일 | 무작위 브라우저 참조값 |
| `oaiq_consent` / `__oaiq_consent` | localStorage / 쿠키 | — | 측정 동의 상태 (consent 호출 시) |

## 환경변수

| 변수 | 설명 |
| --- | --- |
| `NEXT_PUBLIC_OPENAI_PIXEL_ID` | 비어 있으면 픽셀을 불러오지 않는다. 운영 반영 = 이 값을 Vercel에 넣는 것. |
| `NEXT_PUBLIC_OPENAI_PIXEL_DEBUG` | `true`면 운영에서도 SDK 콘솔 로그를 켠다. `next dev`에서는 항상 켜짐. |
| `INQUIRY_EVENT_ID_SECRET` | 서버 전용. 있으면 같은 날 같은 연락처의 재제출이 같은 접수 ID(`event_id`)가 된다. 없으면 무작위 ID. |

CSP: 현재 `next.config.ts`에 CSP 헤더가 없어 추가 설정이 필요 없다. CSP를 도입하면 공식 문서의
`script-src https://bzrcdn.openai.com`, `connect-src https://bzr.openai.com https://bzrcdn.openai.com`,
`img-src https://bzr.openai.com`를 추가한다.

## 안전한 테스트 방법

실제 상담을 접수하지 않고, OpenAI로 이벤트를 보내지 않는 방법.

1. 로컬 실행 (Slack/Trello/Resend 키가 없는 환경)
   ```bash
   NEXT_PUBLIC_OPENAI_PIXEL_ID=7cATm8KzGCSsbvHaVn9PSo npm run dev
   ```
   `.env.local`에 Slack/Trello/Resend 키가 있으면 로컬 제출도 실제 알림이 가므로 먼저 비우거나, 아래 2번처럼 API를 모킹한다.
2. Chrome DevTools
   - Network 패널 → 요청 우클릭 → **Block request domain**으로 `bzr.openai.com`을 차단한다 (전환이 외부로 나가지 않음).
   - `/api/inquiry`는 Sources → **Overrides**(또는 Network → Override content)로 `{"ok":true,"inquiryId":"test-1"}` 응답을 지정하면 서버 핸들러가 실행되지 않는다.
   - Console에서 `[oaiq] event queued {eventName: lead_created, eventId: test-1 ...}` 로그를 확인한다 (dev에서는 debug 자동 켜짐).
3. 확인할 시나리오: 방문만 → 없음 / 빈 폼 제출 → 없음 / API 500 → 없음 / 성공 → `lead_created` 1건 /
   완료 페이지 새로고침 → 추가 없음 / 연타 → POST 1회.
4. 배포 후: Ads Manager 전환 탭에서 이벤트 수신을 확인한다. 필요 시 `NEXT_PUBLIC_OPENAI_PIXEL_DEBUG=true`로 잠시 콘솔 로그를 켠다.

## 연결되지 않은 다른 폼

아래 폼은 Google Ads 전환(`trackConversion`)만 보내고 OpenAI 전환은 보내지 않는다. 필요하면 각 API가
`inquiryId` 같은 접수 ID를 돌려주게 한 뒤 `trackLeadCreated`를 호출하면 된다.
- `src/components/forms/ConsultationForm.tsx` (상담 모달, 블로그 콘텐츠 게이트) → `/api/contact`
- `src/app/benchmark/_components/DiagnosisLeadForm.tsx` (진단 리드) → `/api/diagnosis`

## 운영 검증 기록 (2026-10-19)

운영 사이트(`www.clinicbridge.co.kr/inquiry`)에서 `[TEST]` 신청 1건으로 확인했다 (16:46 KST, Headless Chrome).

| 시나리오 | 결과 |
| --- | --- |
| 페이지 방문·버튼 클릭·빈 폼 제출 | `/api/inquiry` 호출 없음, `oaiq("measure")` 호출 없음 |
| 정상 제출 | `/api/inquiry` → `200 {ok: true, inquiryId, slackNotified: true, sheetSaved: true}` (트렐로 카드 생성) |
| 전환 호출 | `oaiq("measure", "lead_created", {type: "customer_action"}, {event_id: inquiryId})` 1회 |
| 전송 | `POST https://bzr.openai.com/v1/sdk/events?pid=7cATm8KzGCSsbvHaVn9PSo…&ec=1` 본문 `events[0].type = "lead_created"`, `id = inquiryId` |
| AAM | 같은 요청의 `user.fm`에 `em`·`ph`·`fn`·`ln`(해시)와 `rg`(지역 원문) 포함 |
| 완료 페이지 새로고침 | 추가 이벤트 전송 없음 |

- 요청 응답은 `no-cors` 방식이라 브라우저에서 상태값을 읽을 수 없다 (`status 0`). 최종 수신 확인은 Ads Manager → `CB_web` 데이터 소스에서 한다.
- 이 테스트 1건은 실제 전환으로 집계된다. 시트·트렐로·슬랙의 `[TEST]` 기록은 담당자가 정리한다.
