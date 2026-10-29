// 리포트 리드 참조(ref).
// 캠페인 웹 리포트·리포트 메일의 '무료 진단' 버튼이 문의 주소에 ?ref=로 붙여 보낸다(campaign.clinicbridge.co.kr /api/go).
// 문의가 어느 리포트 신청자에게서 왔는지 잇는 데 쓴다. 자세한 흐름: docs/analytics/report-ref.md
//
// 형식: base64url(JSON { k: "i", l: 리드 ID }) + "." + base64url(서명). 병원명·연락처 같은 개인정보는 들어 있지 않다.
// 서명 키는 캠페인 프로젝트에만 있어 홈페이지는 검증하지 않는다. 그래서
//   - 리드 ID는 "같은 사람 후보"로만 쓴다(신청자 링크를 넘겨받은 사람이 누르면 원래 신청자 ID가 붙는다).
//   - 원본 토큰을 시트에 함께 남겨 CRM이 나중에 검증한다.

const TOKEN_PATTERN = /^[A-Za-z0-9_-]{1,400}\.[A-Za-z0-9_-]{10,40}$/
const LEAD_ID_PATTERN = /^lead_[A-Za-z0-9_]{1,80}$/

/** 브라우저에서 주소의 ref를 받을지 판단한다. 형식만 본다. */
export function isReportRefToken(value: unknown): value is string {
  return typeof value === "string" && TOKEN_PATTERN.test(value)
}

export interface ReportRef {
  /** 원본 토큰. CRM이 서명을 검증할 때 쓴다. */
  token: string
  /** 토큰에 적힌 리포트 신청 리드 ID (미검증) */
  leadId: string
}

/** 서버에서 ref를 읽는다. 형식이 틀리면 null(문의 접수는 그대로 진행한다). */
export function parseReportRef(value: unknown): ReportRef | null {
  if (!isReportRefToken(value)) return null
  try {
    const data = JSON.parse(Buffer.from(value.split(".")[0], "base64url").toString("utf8"))
    if (data?.k !== "i" || typeof data.l !== "string" || !LEAD_ID_PATTERN.test(data.l)) return null
    return { token: value, leadId: data.l }
  } catch {
    return null
  }
}
