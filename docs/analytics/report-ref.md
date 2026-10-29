# 리포트 리드 참조 (ref)

캠페인 리포트(campaign.clinicbridge.co.kr)를 신청한 사람이 무료 진단 버튼으로 `/inquiry`에 들어오면, 문의 주소에 `ref`가 붙는다. 홈페이지는 이 값으로 **문의가 어느 리포트 신청자에게서 왔는지** 시트에 함께 남긴다.

## 흐름

1. 리포트 플로팅 버튼(`/api/go?src=report`) 또는 리포트 메일의 무료 진단 버튼(`/api/go?t=`)이 캠페인 서버에서 신청자를 알아본다.
2. 캠페인 서버가 `/inquiry?utm_source=campaign&utm_medium=report|email&utm_campaign=…&ref=<토큰>`으로 보낸다. 신청자를 모르면(공유 링크 열람자 등) `ref` 없이 보낸다.
3. 문의 폼(`InquiryForm.tsx`)이 `ref`를 세션 저장소에 두고 주소에서 지운다. 새로고침해도 남고, 주소를 남에게 넘겨도 따라가지 않는다.
4. 제출하면 `/api/inquiry`가 `lib/reportRef.ts`로 토큰을 읽어 저장한다.

| 저장 위치 | 값 |
| --- | --- |
| 시트 `도입상담` 탭 `리포트 리드 ID` 열 | `lead_…` (캠페인 시트 「B2B Marketing - Campaign Leads」 리드 ID와 같은 값) |
| 시트 `리포트 참조` 열 | 원본 토큰 (CRM 검증용) |
| Slack·Trello·알림 메일 | `리포트 신청 리드` 한 줄 (있을 때만) |

시트 열은 Apps Script가 처음 저장할 때 자동으로 만든다.

## 토큰

- 형식: `base64url(JSON {"k":"i","l":"lead_…"}) + "." + base64url(HMAC-SHA256 앞 16바이트)`. 캠페인 `landing/lib/report-link.js`의 `sign`과 같다.
- 리드 ID만 들어 있다. 병원명·이름·연락처는 넣지 않는다.
- 서명 키(`REPORT_LINK_SECRET`)는 캠페인 프로젝트에만 있다. 홈페이지는 **형식만 확인하고 서명은 검증하지 않는다.**

## 한계

- 신청자 링크를 넘겨받은 사람이 누르면 원래 신청자의 리드 ID가 붙는다. 그래서 리드 ID는 "같은 사람 후보"로만 쓴다. 확정은 CRM에서 서명 검증과 연락처 대조로 한다.
- 메타 픽셀은 쿼리 문자열을 보내지 않으므로(`meta-pixel.md`) `ref`가 픽셀로 나가지 않는다.
