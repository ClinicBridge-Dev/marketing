// 서버(Vercel)는 UTC로 동작하므로, 사람이 읽는 시간은 항상 한국 시간대를 명시해서 만든다.
const KOREA_TIME_ZONE = "Asia/Seoul"

/** 알림·메일 문구용 한국 시간. 예: "2026. 10. 15. 오후 1:30:22" */
export function formatKoreanDateTime(date: Date = new Date()): string {
  return date.toLocaleString("ko-KR", { timeZone: KOREA_TIME_ZONE })
}

/** 정렬할 수 있는 한국 시간(구글 시트 등). 예: "2026-10-15 13:30:22" */
export function formatKoreanTimestamp(date: Date = new Date()): string {
  // sv-SE 로캘은 "YYYY-MM-DD HH:mm:ss" 형식으로 표기한다.
  return date.toLocaleString("sv-SE", { timeZone: KOREA_TIME_ZONE })
}
