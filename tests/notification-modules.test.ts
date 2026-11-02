import { beforeEach, describe, expect, it, vi } from "vitest"
import { guardFetch, jsonResponse, textResponse } from "./helpers/fetchGuard"

// 알림 연동 모듈(Slack, 구글 시트) 테스트 (rules.md R03).
// 모듈은 실패해도 예외를 던지지 않고 결과 객체({ ok, skipped, error })를 돌려줘야 한다.
// 예외가 나면 상담 신청 API 전체가 실패하기 때문이다.

const SLACK_URL = "https://hooks.slack.test/services/fake"
const SHEETS_URL = "https://sheets.test/macros/exec"

beforeEach(() => {
  vi.spyOn(console, "warn").mockImplementation(() => {})
  vi.spyOn(console, "error").mockImplementation(() => {})
})

// slack.ts 는 모듈을 불러올 때 웹훅 주소를 읽으므로 환경변수를 바꾼 뒤 새로 불러온다.
async function loadSlack(webhookUrl: string) {
  vi.stubEnv("SLACK_WEBHOOK_URL", webhookUrl)
  vi.resetModules()
  return import("@/lib/slack")
}

describe("sendSlackNotification", () => {
  it("웹훅 주소가 없으면 보내지 않고 skipped를 돌려준다", async () => {
    const { fetchMock } = guardFetch()
    const { sendSlackNotification } = await loadSlack("")

    expect(await sendSlackNotification({ text: "테스트" })).toMatchObject({ ok: false, skipped: true })
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it("네트워크 오류가 나도 예외를 던지지 않는다", async () => {
    guardFetch({
      [SLACK_URL]: () => {
        throw new Error("network down")
      },
    })
    const { sendSlackNotification } = await loadSlack(SLACK_URL)

    await expect(sendSlackNotification({ text: "테스트" })).resolves.toMatchObject({ ok: false })
  })

  it("Slack이 오류 상태를 돌려주면 ok: false다", async () => {
    guardFetch({ [SLACK_URL]: () => textResponse("invalid_payload", 400) })
    const { sendSlackNotification } = await loadSlack(SLACK_URL)

    await expect(sendSlackNotification({ text: "테스트" })).resolves.toMatchObject({ ok: false, status: 400 })
  })
})

describe("appendSheetRow", () => {
  async function loadSheets({ url = SHEETS_URL, secret = "fake-secret" } = {}) {
    vi.stubEnv("GOOGLE_SHEETS_WEBHOOK_URL", url)
    vi.stubEnv("GOOGLE_SHEETS_WEBHOOK_SECRET", secret)
    return import("@/lib/googleSheets")
  }

  it("주소나 비밀값이 없으면 보내지 않고 skipped를 돌려준다", async () => {
    const { fetchMock } = guardFetch()
    const { appendSheetRow } = await loadSheets({ secret: "" })

    expect(await appendSheetRow({ sheet: "테스트", record: {} })).toMatchObject({ ok: false, skipped: true })
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it("Apps Script가 { ok: true }를 돌려줄 때만 성공이다", async () => {
    guardFetch({ [SHEETS_URL]: () => jsonResponse({ ok: true }) })
    const { appendSheetRow } = await loadSheets()

    expect(await appendSheetRow({ sheet: "테스트", record: { 이름: "홍길동" } })).toMatchObject({ ok: true })
  })

  it("비밀값을 요청 본문에 담아 보낸다 (주소만 알아서는 시트에 쓸 수 없게)", async () => {
    const { calls } = guardFetch({ [SHEETS_URL]: () => jsonResponse({ ok: true }) })
    const { appendSheetRow } = await loadSheets()

    await appendSheetRow({ sheet: "테스트", record: {} })

    expect(JSON.parse(String(calls[0].init?.body))).toMatchObject({ secret: "fake-secret", sheet: "테스트" })
  })

  it("네트워크 오류가 나도 예외를 던지지 않는다", async () => {
    guardFetch({
      [SHEETS_URL]: () => {
        throw new Error("timeout")
      },
    })
    const { appendSheetRow } = await loadSheets()

    await expect(appendSheetRow({ sheet: "테스트", record: {} })).resolves.toMatchObject({ ok: false })
  })
})
