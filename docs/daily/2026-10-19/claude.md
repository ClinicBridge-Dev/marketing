# 2026-10-19 작업 기록

## OpenAI Ads lead_created 운영 검증 + 접수 기준·재제출 중복 보강

### 요청
1. 도입 상담 폼이 서버에서 정상 접수됐을 때만 `lead_created` 발생
2. 버튼 클릭·폼 열람 시 미발생
3. 같은 문의의 중복 이벤트 방지
4. 테스트 제출로 OpenAI 수신 검증

### 확인 (기존 구현, 10-14 커밋 `cbeb501`)
- 1~3은 이미 구현·운영 배포되어 있었다. 운영 JS 번들에서 `measure`/`lead_created` 호출 확인.
- 운영 `[TEST]` 제출 결과는 `docs/analytics/openai-ads-pixel.md` "운영 검증 기록" 참조. 전송까지 확인, Ads Manager 수신 확인은 담당자.

### 변경 (브랜치 `feat/inquiry-lead-dedupe`)
- `src/lib/inquiryEventId.ts` 신규: 접수 ID 생성. `INQUIRY_EVENT_ID_SECRET`이 있으면 이메일·전화번호·한국 날짜의 HMAC → 같은 날 재제출은 같은 `event_id`.
- `src/app/api/inquiry/route.ts`
  - 접수 ID를 위 모듈로 생성 (기존 `crypto.randomUUID()` 대체).
  - Resend 발송 결과(`{ error }`)를 확인해 `emailSent`로 기록. 응답에 `emailSent` 추가.
  - 시트·트렐로·메일·슬랙 중 하나도 성공하지 못하면 `500` → 전환 미발생. 로컬에서 채널 미설정이면 통과.
  - Resend 미설정 시 신청 내용 전체를 콘솔에 남기던 로그 제거 (개인정보 로그 최소화). 기록 실패 시에만 식별 정보 로그.
  - 성공 응답 생성을 한 곳으로 합침 (기존에는 Resend 유무로 두 군데).
- `.env.example`: `INQUIRY_EVENT_ID_SECRET` 추가.
- `docs/analytics/openai-ads-pixel.md`: 접수 완료 기준, 중복 방지 4중, 환경변수, 운영 검증 기록.

### 영향분석
- 클라이언트(`InquiryForm`, `openaiPixel.ts`)는 변경 없음. 응답 계약(`ok`, `inquiryId`)은 그대로.
- 동작 변화: 운영에서 모든 저장 채널이 실패하면 기존에는 성공 화면 + 전환, 이제는 오류 토스트(재시도)로 바뀐다.
- `INQUIRY_EVENT_ID_SECRET` 미설정 시 기존과 동일한 무작위 ID → 배포만으로는 동작 변화 없음. 설정 후 재배포해야 재제출 중복 방지가 켜진다.
- 다른 폼(`/api/contact`, `/api/diagnosis`)은 영향 없음.
- 용어사전(`docs/glossary/README.md`)은 저장소에 없어 갱신하지 못함.

### 테스트 (로컬 `next build` + `next start`, 저장 채널은 로컬 모의 서버)
| 시나리오 | 기대 | 결과 |
| --- | --- | --- |
| 운영 모드, 시트·슬랙 모두 실패 | 500, 전환 없음 | 500 ✓ |
| 운영 모드, 채널 전부 미설정 | 500 | 500 ✓ |
| 운영 모드, 시트 성공 + 비밀값, 같은 연락처(표기만 다름: `010-1234-5678`/`A@Example.com` vs `01012345678`/`a@example.com`) | 같은 `inquiryId` | 같음 ✓ |
| 같은 조건, 다른 전화번호 | 다른 `inquiryId` | 다름 ✓ |
| 시트 성공, 비밀값 없음, 같은 내용 2회 | 다른 무작위 `inquiryId` | 다름 ✓ |
| 필수값 누락 | 400 | 400 ✓ |
| 로컬 개발(`next dev`), 채널 미설정 | 200 + 경고 로그 | 200 ✓ |
- `tsc --noEmit`, `eslint`(변경 파일), `next build` 통과.
