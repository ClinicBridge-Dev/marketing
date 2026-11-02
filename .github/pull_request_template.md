## 무엇을 바꿨나요

<!-- 1~3줄. 왜 바꿨는지도 함께 -->

## 확인한 것

- [ ] `npm run lint`
- [ ] `npm run typecheck`
- [ ] `npm test`
- [ ] `npm run build` (큰 변경일 때)
- [ ] 화면 변경이면 직접 열어 확인함

## 사람이 꼭 봐야 할 곳 (rules.md 8장)

<!-- 해당되면 체크. 해당 없으면 비워 둡니다. -->
- [ ] 상담 신청 API(`src/app/api/`)나 알림 연동(`src/lib/slack.ts`, `googleSheets.ts`, `trello.ts`) 변경
- [ ] 광고·분석 전환 코드(`gtag.ts`, `metaPixel.ts`, `openaiPixel.ts`, 폼 제출 처리) 변경
- [ ] 환경변수 추가·삭제 (`.env.example`, Vercel 설정 필요)
- [ ] 레이아웃·설정·전역 스크립트 변경 (`layout.tsx`, `next.config.ts`)
- [ ] 리뷰 기준·작업 규칙 변경 (`rules.md`, `AGENTS.md`, `.github/`)

## 문서

- [ ] 관련 문서(`docs/`, `README.md`, 용어사전) 갱신
- [ ] `docs/daily/` 작업 기록
