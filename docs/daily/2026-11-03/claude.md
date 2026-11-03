# 2026-11-03 작업 기록

## 디버그·테스트용 Trello API 라우트 삭제 (보안)

### 요청
리뷰 룰 R01(서버 비밀값은 서버 밖으로 나가지 않는다) 기준으로 발견한 기존 위험 정리. 새 작업 방식(브랜치 → PR → 리뷰 → 머지)의 첫 `fix/` 작업.

### 영향분석 (사전)
- `GET /api/trello-test-token`, `GET /api/trello-debug`: 인증 없는 공개 라우트. 화면·폼·다른 코드에서 호출하는 곳 없음 (저장소 전체 검색).
- `getTrelloLists`(`src/lib/trello.ts`)는 `trello-debug`에서만 사용.
- 상담 신청(`/api/inquiry`, `/api/contact`)의 Trello 카드 생성은 `createTrelloCard`·`testTrelloAuth`를 쓰므로 영향 없음.

### 변경
- `src/app/api/trello-test-token/`, `src/app/api/trello-debug/` 삭제.
- `src/lib/trello.ts`: 쓰는 곳이 없어진 `getTrelloLists`, `TrelloList` 삭제.
- `src/app/api/contact/route.ts`: Trello 환경변수 앞 8자리를 로그로 출력하던 코드 삭제 (설정 여부만 남기는 로그는 유지).
- `tests/secret-exposure.test.ts`: 테스트 2개 추가.
  - 환경변수 값을 `substring`·`slice`로 잘라서 출력하지 않는다.
  - `src/app/api/` 아래에 이름에 `debug`·`test`가 들어간 라우트를 두지 않는다.
- `docs/testing/README.md` 테스트 목록 갱신.

### 테스트
- `npm run lint` 오류 0, `npm run typecheck` 통과, `npm test` vitest 33개 + node:test 6개 통과, `npm run build` 통과.
- 삭제 전 코드로 되돌려 새 테스트 2개가 실패하는 것 확인 후 원복.

### 배포 후 할 일 (사람)
- Trello API 키·토큰 재발급 후 Vercel 환경변수 교체, 재배포.
- 운영에서 두 주소가 404인지 확인.
