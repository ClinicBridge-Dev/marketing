// 구글 시트 저장 모듈.
// 시트에 붙인 Apps Script 웹 앱(docs/integrations/google-sheets/)으로 한 행을 보낸다.
// Slack 모듈과 같이 예외를 던지지 않고 결과 객체를 돌려준다.

/** 열 이름(시트 1행 헤더) → 값. 시트에 없는 열 이름은 Apps Script가 새 열로 추가한다. */
export type SheetRecord = Record<string, string>

interface AppendSheetRowInput {
  /** 저장할 탭 이름. 없으면 Apps Script가 새로 만든다. */
  sheet: string
  record: SheetRecord
}

interface SheetAppendResult {
  ok: boolean
  skipped?: boolean
  error?: string
  status?: number
}

const REQUEST_TIMEOUT_MS = 10_000

export async function appendSheetRow({
  sheet,
  record,
}: AppendSheetRowInput): Promise<SheetAppendResult> {
  const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL?.trim()
  const secret = process.env.GOOGLE_SHEETS_WEBHOOK_SECRET?.trim()

  if (!webhookUrl || !secret) {
    console.warn("⚠️ 구글 시트 웹훅이 설정되지 않아 저장을 건너뜁니다.")
    return { ok: false, skipped: true, error: "Google Sheets webhook not configured" }
  }

  try {
    // Apps Script는 302로 결과 페이지에 보내므로 리다이렉트를 따라가 마지막 본문을 읽는다.
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret, sheet, record }),
      redirect: "follow",
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    })

    const body = await response.text().catch(() => "")
    let result: { ok?: boolean; error?: string } | null = null
    try {
      result = JSON.parse(body)
    } catch {
      result = null
    }

    // 배포 권한이 잘못되면 200과 함께 Google 로그인 HTML이 오므로 JSON의 ok까지 확인한다.
    if (!response.ok || result?.ok !== true) {
      const error =
        result?.error ??
        (response.ok ? "Apps Script 응답이 JSON이 아닙니다 (웹 앱 액세스 권한 확인)" : response.statusText)
      console.error("❌ 구글 시트 저장 실패:", { status: response.status, error })
      return { ok: false, error, status: response.status }
    }

    return { ok: true, status: response.status }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown Google Sheets error"
    console.error("❌ 구글 시트 저장 중 예외 발생:", message)
    return { ok: false, error: message }
  }
}
