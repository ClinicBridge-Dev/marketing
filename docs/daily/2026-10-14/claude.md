# 2026-10-14 작업 기록

## OpenAI Ads Measurement Pixel — 상담 신청 전환(lead_created) 추적

### 배경
ChatGPT 광고(OpenAI Ads) 성과 측정을 위해 공식 Measurement Pixel(픽셀 ID `7cATm8KzGCSsbvHaVn9PSo`)을 설치하고,
`/inquiry` 상담 신청이 서버에 접수된 경우에만 `lead_created`(`type: customer_action`)를 1회 보내 달라는 요청.
실제 상담 제출·배포는 하지 않음.

### 사전 영향분석
- 대상 흐름: `/inquiry` → `InquiryForm` → `POST /api/inquiry`(Trello 카드 → Slack 알림 → Resend 메일) → `/inquiry/complete`.
- 기존 Google Ads 전환(`trackConversion`)이 같은 위치(제출 성공 후)에서 이미 발사되고 있어 같은 지점에 붙인다.
- `/api/inquiry` 응답에 필드 1개 추가 외에 Trello/Slack/Resend 흐름은 변경 없음. Supabase/LINE은 이 저장소에 없음.
- `next.config.ts`에 CSP 없음 → CSP 수정 불필요.
- UI 변경 없음 → `docs/design/README.md` 변경 불필요.
- 픽셀 원격 설정(`https://bzrcdn.openai.com/pixel-config/v1/7cATm8KzGCSsbvHaVn9PSo.json`) 확인 결과
  `automatic_advanced_matching_enabled: true` → 아래 "확인 필요" 참고.

### 변경 내용
- `src/lib/openaiPixel.ts` (신규): 픽셀 ID(env 전용), 공식 설치 스니펫 생성, `trackLeadCreated(eventId)`.
  - 픽셀 ID에 코드 기본값을 두지 않음. `NEXT_PUBLIC_OPENAI_PIXEL_ID`를 넣어야 활성화된다.
    AAM 설정을 확인하기 전에 일반 배포로 픽셀이 켜지는 것을 막기 위함.
  - debug는 `next dev`에서 자동 켜짐, 운영은 `NEXT_PUBLIC_OPENAI_PIXEL_DEBUG=true`일 때만.
  - 같은 `event_id`는 한 번만 전송 (모듈 내 Set).
- `src/app/layout.tsx`: 픽셀 ID가 있을 때만 `<Script id="openai-pixel-init" strategy="afterInteractive">`로 설치.
- `src/app/api/inquiry/route.ts`: 접수 성공 응답 2곳에 `inquiryId`(`crypto.randomUUID()`) 추가. 허니팟 응답에는 넣지 않음.
- `src/app/inquiry/_components/InquiryForm.tsx`
  - 성공 조건을 `response.ok && result.ok === true && inquiryId 문자열`로 명확히 함 → 이때만 Google Ads + OpenAI 전환.
  - `submitLockRef`로 연타 시 중복 제출 방지 (기존 `isSubmitting` state는 다음 렌더 전까지 반영되지 않음).
  - OpenAI 이벤트: `oaiq("measure", "lead_created", { type: "customer_action" }, { event_id: inquiryId })`.
    요청 원문은 3개 인자였지만, 서버 측 중복 제거를 위해 공식 옵션인 4번째 인자 `event_id`를 추가했다. 이벤트 데이터는 원문 그대로.
- `src/app/inquiry/complete/page.tsx`: 낡은 주석 수정 (전환을 여기서 보내지 않는 이유 명시).
- 문서: `docs/analytics/openai-ads-pixel.md` (신규), `.env.example`, `README.md` 환경변수 섹션.

### 사후 영향분석 / 테스트 결과
- `npx tsc --noEmit` → exit 0. 변경 파일 `eslint` → 경고/에러 없음.
- `next build` (픽셀 ID 설정) → 성공. 빌드된 HTML의 init은 `{"pixelId":"7cATm8KzGCSsbvHaVn9PSo"}` (운영 debug 꺼짐).
- 로컬 API 응답 확인 (Slack/Trello/Resend 환경변수 없음 → 외부 전송 없음, 더미 데이터):
  정상 → `{"ok":true,"inquiryId":"<uuid>",...}` / 허니팟 → `{"ok":true}` / 필드 누락 → 400.
- Playwright 격리 테스트 (스크래치 디렉터리, 저장소 미포함):
  `bzr.openai.com`·`bzrcdn.openai.com`·Google 요청은 모두 가로채 외부 전송 없음, `/api/inquiry`는 모킹.
  - PASS S1 방문만 → `lead_created` 0건 (SDK 자체 `openai::sdk_init`, `oai::diagnostic`만 전송)
  - PASS S2 빈 폼 제출 → API 0회, 전환 0건
  - PASS S3 API 500 → 전환 0건, 페이지 유지
  - PASS S4 200이지만 `inquiryId` 없음 → 전환 0건
  - PASS S5 같은 tick 연타 → POST 1회, `lead_created` 1건, `id = inquiryId`, `data = {type: customer_action}`, 원문 개인정보 없음
  - PASS S6 완료 페이지 새로고침·직접 방문 → 추가 전환 0건
  - PASS S7 AAM 꺼짐 → payload에 `user` 필드 없음
  - **AAM 켜짐(현재 설정)일 때 payload**: `user.fm.em`(이메일 해시), `ph`(전화 해시), `fn`(이름 해시), `rg: "서울"`(지역 원문)이 붙음.
- 별도 리뷰어(correctness) 검토: 확정 결함 없음. 지적된 저위험 사항 1건 반영 —
  SDK의 `measure`가 예외를 던져도 접수 완료 흐름이 깨지지 않도록 `trackLeadCreated` 안에서 try/catch.
- Resend가 설정된 성공 분기는 실제 메일이 나가므로 실행하지 않았고, 코드상 `inquiryId` 포함만 확인함.
- 테스트용 `next build` 결과물(`.next/`)에는 픽셀 ID가 들어가 있다. 로컬에서 `npm start` 전에는 다시 빌드할 것.

### 확인 필요 / 남은 작업
- **운영 반영 전 필수**: Ads Manager에서 이 픽셀의 자동 고급 매칭(AAM)을 끌지 결정.
  켜 두면 상담 폼의 이메일·전화·이름(해시)과 지역(원문)이 OpenAI로 전송되며, 현재 개인정보처리방침·동의 문구에 없다.
- 운영 반영: Vercel에 `NEXT_PUBLIC_OPENAI_PIXEL_ID=7cATm8KzGCSsbvHaVn9PSo` 설정 후 재배포.
- 개인정보처리방침(최종 업데이트 2024-01-01) 점검 결과 — 법무 검토 필요:
  - 실제 수집 항목(병원명, 지역, 홈페이지, 예산·매출, 사업 소개 등)과 방침의 항목이 다름.
  - 처리위탁/국외 이전(Slack, Trello, Resend, Vercel)과 광고·분석 도구(Google Analytics/Ads, OpenAI 픽셀)의
    쿠키·행태정보 수집, 거부 방법이 적혀 있지 않음. 4조는 "사전 동의 없이 제3자 제공 안 함"이라고 되어 있음.
  - 폼의 동의 체크박스는 방침 링크만 있고, 수집 목적·항목·보유기간·거부권을 체크박스 옆에 직접 안내하지 않음.
  - 측정(쿠키) 동의 UI 없음. GA/Google Ads/OpenAI 픽셀 모두 동의 없이 로드됨.
- `ConsultationForm`(상담 모달, `/api/contact`)과 `DiagnosisLeadForm`(`/api/diagnosis`)은 OpenAI 전환 미연결 (요청 범위 밖).
- `/api/inquiry`는 Trello/Slack/Resend가 모두 실패해도 200을 돌려준다 (기존 동작). 이 경우에도 전환은 집계된다.
- `docs/glossary/README.md`가 여전히 없음. 새 용어: OpenAI Measurement Pixel, `lead_created`, `inquiryId`(접수 ID),
  자동 고급 매칭(AAM). 용어사전을 만들 때 옮길 것.

---

## AAM(자동 고급 매칭) 후속 확인

### 결정
- 이름·전화·이메일 자동 매칭 없이 시작 (A안). 담당자가 Ads Manager의 픽셀 편집(Edit pixel) 화면에서
  끄는 스위치를 찾지 못했고, 설정은 바꾸지 않음.

### 확인한 내용
- 원격 설정 재확인: `pixel-config/v1/7cATm8KzGCSsbvHaVn9PSo.json` → 여전히 `automatic_advanced_matching_enabled: true`.
- SDK(`oaiq.min.js`, 오전 분석본과 동일) 분석: `init`은 `pixelId`·`debug`·`user`만 검증·사용한다.
  AAM 여부는 원격 설정 값으로만 정해지므로 코드에서 끌 수 없다. `oaiq("consent", false)`는 AAM도 멈추지만
  전환 전송까지 모두 막으므로 대안이 아님.
- 설정 위치: OpenAI 도움말(help.openai.com/en/articles/20001409)은 403으로 자동 수집이 안 돼 직접 확인하지 못함.
  업계 기사 기준 픽셀 단위(Tools → Conversions → Data Source → Edit pixel)와 계정 단위(Data Source 목록에서
  모든 Web data source 끄기) 두 경로가 있다고 함. 2026-08-17부터 기존 픽셀도 기본 켜짐(opt-out).

### 변경
- `docs/analytics/openai-ads-pixel.md`에 "AAM 끄기" 절 추가: 설정 위치, 스위치가 안 보일 때 확인할 것,
  curl로 꺼짐 확인하는 방법, `false` 확인 전에는 환경변수를 넣지 않는다는 운영 규칙.
- 코드 변경 없음. 환경변수 없이는 픽셀이 로드되지 않으므로 현재 배포해도 OpenAI로 나가는 데이터는 없음.

### 결정 변경: AAM 켜진 상태 유지 (B안)
- 사용자 결정으로 AAM을 끄지 않고 켜진 상태로 운영한다. 위의 A안(끈 상태로 시작) 결정을 대체한다.
- 코드 동작 변경 없음 (AAM은 코드와 무관하게 원격 설정으로 동작).
- 문서 갱신: `docs/analytics/openai-ads-pixel.md`의 AAM 절을 "켜진 상태로 운영"으로 다시 씀
  (전송되는 값, 다른 폼 입력도 붙을 수 있다는 점, 운영 반영 순서, 나중에 끄는 방법).
  `src/lib/openaiPixel.ts` 머리 주석과 `.env.example` 경고 문구도 같은 내용으로 수정.
- 운영 반영 전 남은 일: 개인정보처리방침·폼 동의 문구에 OpenAI 제공(국외 이전 포함) 반영 + 법무 검토
  → Vercel Production에 `NEXT_PUBLIC_OPENAI_PIXEL_ID` 설정 → 배포.
