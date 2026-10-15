# 2026-10-15 작업 기록

## OpenAI Ads `lead_created` 전환 — 운영 동작 확인

### 요청
`/inquiry`(도입 상담) 페이지에서 "문의하기"를 눌렀을 때 OpenAI 광고 전환으로 추적되는지 확인.
코드 변경 없음. 실제 상담 접수·실제 전환 전송 없이 확인함.

### 확인 결과 — 정상 동작
- 운영 반영 상태: `origin/master` = `cbeb501`, 운영 HTML(`https://www.clinicbridge.co.kr/inquiry`)에
  `openai-pixel-init` 스크립트와 `oaiq("init", {"pixelId":"7cATm8KzGCSsbvHaVn9PSo"})` 포함
  → Vercel Production에 `NEXT_PUBLIC_OPENAI_PIXEL_ID`가 설정되어 배포됨.
- 운영 JS 번들(`/inquiry` page chunk)에 `oaiq("measure","lead_created",{type:"customer_action"},{event_id})`
  호출이 `response.ok && ok === true && inquiryId 문자열` 조건 안에 들어 있음.
- SDK(`bzrcdn.openai.com/sdk/oaiq.min.js`) 200 응답.
- Playwright로 운영 사이트 클릭 테스트 (스크래치 디렉터리, 저장소 미포함):
  `/api/inquiry`는 `{ok:true, inquiryId:"claude-test-0001"}`로 모킹(실제 접수 없음),
  `bzr.openai.com`·Google 전송은 가로채서 외부로 나가지 않게 함.
  - 폼 작성 → "문의하기" 클릭 → `/api/inquiry` 1회 → `/inquiry/complete` 이동
  - OpenAI 이벤트 배치에 `lead_created` 1건: `id = claude-test-0001`(= inquiryId), `data = {type: customer_action}`,
    `source_url = /inquiry`
- 광고 클릭 파라미터 유지: `clinicbridge.co.kr` → `www` 308 리다이렉트가 `?oppref=...` 쿼리를 그대로 유지함 (광고 연결 정상).

### 주의
- 픽셀이 운영에 켜져 있으나, 운영 개인정보처리방침은 여전히 "최종 업데이트: 2024년 1월 1일"로 OpenAI 제공 내용이 없음.
  10-14 문서의 운영 반영 순서(방침·동의 문구 반영 → 환경변수 설정 → 배포)의 첫 단계가 빠진 상태.

### 확인하지 못한 것
- 운영 `/api/inquiry`가 실제로 `inquiryId`를 돌려주는지는 실제 접수(Slack/Trello/메일 발송)가 필요해 실행하지 않음.
  같은 배포의 클라이언트 번들이 `cbeb501` 코드이므로 API도 같은 커밋으로 판단.
- OpenAI Ads Manager에서의 이벤트 수신·캠페인 전환 설정은 저장소 밖이라 확인하지 못함.
- 상담 모달(`InquiryDialog` → `ConsultationForm`, `/api/contact`)과 `/benchmark` 진단 폼은 여전히 OpenAI 전환 미연결 (기존과 동일).
- 이번 테스트의 `lead_created`에는 `user`(AAM) 필드가 없었음. 10-14 로컬 테스트와 다르지만, 헤드리스 입력 방식 차이일 수 있어
  운영에서 AAM 값이 붙는지 여부는 판단하지 않음.

## 도입 상담 "문의하기" 알림 연동(이메일·Slack·Trello) 점검

### 요청
도입 상담 신청에서 "문의하기"를 눌렀을 때 이메일·Slack·Trello로 알림이 가는지 확인.
코드 변경 없음. 실제 상담 접수(테스트 제출) 없이 확인함.

### 코드 확인 — 3종 모두 연동되어 있음
- 경로 2개, 둘 다 Trello 카드 생성 → Slack 웹훅 → Resend 메일 순서로 처리:
  - `/inquiry` 페이지 `InquiryForm` → `POST /api/inquiry` (Slack 헤더 "📬 도입 상담 신청", 메일 제목 `[도입 상담] {병원명} 신청 도착`)
  - 블로그 콘텐츠 게이트 모달 `InquiryDialog` → `ConsultationForm` → `POST /api/contact` (Slack 헤더 "📬 신규 문의 접수")
- 각 연동은 환경변수가 있을 때만 동작: `TRELLO_API_KEY/TOKEN/BOARD_ID/LIST_ID`, `SLACK_WEBHOOK_URL`, `RESEND_API_KEY`(+ `TO_EMAIL`, `FROM_EMAIL`).
- 연동이 모두 실패하거나 건너뛰어도 API는 200 `ok:true`를 반환 → 사용자는 완료 화면, 광고 전환도 집계됨.
- 메일 수신처: 코드 기본값 `clinicbridge.kr@gmail.com`, README 예시는 `hckang2000@naver.com` → 실제 수신처는 Vercel의 `TO_EMAIL` 값에 따름.

### 운영 확인
- Slack `#bot-병원영업`(앱: 병원상담문의): 2026-09-16 19:58 KST에 `/api/inquiry` 테스트 접수 알림 확인.
  메시지에 Trello 카드 링크(`trello.com/c/RuAaH66N`) 포함, 접수 시간이 UTC로 찍힘 → 서버(Vercel)에서 Slack·Trello 모두 동작했던 기록.
- 그 이후(09-16 ~ 10-15) 채널에 도입 상담 알림 없음 (Latpeed 결제 테스트 메시지만 있음).
  실제 문의가 없었던 것인지, 알림이 끊긴 것인지는 여기서 구분 불가.
- 운영 `GET /api/trello-debug` → "Trello 설정이 없습니다". 단 `getTrelloConfig()`는 키/토큰 형식 검증(32자리 hex, `ATTA`+64자리)에서도 null을 반환하고,
  `/api/inquiry`는 이 검증을 거치지 않으므로 Trello 미설정으로 단정할 수 없음.
- `/api/trello-debug`가 운영에 공개되어 있음 (설정 시 보드/리스트 ID 노출).

### 확인하지 못한 것
- 이메일(Resend) 운영 발송 여부: 수신 메일함(`TO_EMAIL`)에 접근 권한 없음. 사용자 Gmail에는 관련 메일 없음.
- Vercel 운영 환경변수: 마케팅 사이트 프로젝트가 현재 로그인된 Vercel 팀(`taejeongjeon-clinicbridges-projects`)에 없음.

## 도입 상담 폼 제출 버튼 문구 변경

### 요청
`/inquiry` 폼의 제출 버튼이 사이트 곳곳의 "문의하기"(→ `/inquiry` 이동 링크)와 이름이 같아 혼동될 수 있어 "상담 신청하기"로 변경.

### 변경
- `src/app/inquiry/_components/InquiryForm.tsx`: 제출 버튼 문구 `문의하기` → `상담 신청하기` (전송 중 문구 `전송 중...`은 그대로).
- 헤더·히어로·CTA 등 `/inquiry`로 이동하는 "문의하기" 링크와 상담 모달(`ConsultationForm`)의 버튼 문구는 그대로 둠.

### 영향분석
- 문구만 변경. 제출 로직, Google Ads 전환(`trackConversion`), OpenAI `lead_created` 전송 조건은 버튼 문구와 무관해 영향 없음.
- 버튼 문구를 참조하는 테스트·문서 없음. `eslint` 통과.
- 디자인 규칙(`docs/design/README.md`)에 버튼 문구 규정 없음 → 문서 갱신 불필요.

## Trello 환경변수 위치·알림 메일 수신처 변경 안내 (코드 변경 없음)

- Trello Power-Up `clnicbridge`(bridge clinic's workspace, https://trello.com/apps/admin)가 운영 연동용 앱.
  - `TRELLO_API_KEY`: 앱 → Authorization → Trello Auth → API key. 새로 생성하지 않음.
  - `TRELLO_API_TOKEN`: 같은 화면의 "Token" 링크 → Allow. 보드 멤버인 공용 계정으로, 만료 없음(never)으로 발급.
  - `TRELLO_LIST_ID`·`TRELLO_BOARD_ID`: 9/16 테스트 카드 `https://trello.com/c/RuAaH66N.json`의 `idList`·`idBoard`.
  - Power-Up의 Basic information 이메일은 Trello 연락용이며 알림 메일 수신처와 무관.
- 도입 상담 알림 메일 수신처는 Vercel Production 환경변수 `TO_EMAIL`. 변경 후 재배포 필요.
  - 코드가 `to`에 문자열 하나를 넘기므로 주소 1개만 지원. 여러 명이 받으려면 그룹 메일을 쓰거나 코드 수정 필요.
- 문서 공백: `.env.example`에 서버 환경변수(`SLACK_WEBHOOK_URL`, `TRELLO_*`, `RESEND_API_KEY`, `TO_EMAIL`, `FROM_EMAIL`)가 없음.
