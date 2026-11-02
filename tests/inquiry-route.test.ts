import { beforeEach, describe, expect, it, vi } from "vitest"
import { guardFetch, jsonResponse, textResponse } from "./helpers/fetchGuard"

// 도입 상담 신청 API(POST /api/inquiry) 테스트.
// 지키는 약속 (rules.md R03, R04):
// - 시트·Slack·Trello·메일 중 하나라도 기록돼야 접수 성공(ok + inquiryId)이다. 성공 응답이 있어야 광고 전환이 나간다.
// - 운영에서 모든 기록이 실패하거나 기록 채널이 하나도 없으면 실패(500)로 응답해 전환이 나가지 않게 한다.
// - 스팸 방지 필드(hp)가 채워지면 아무 데도 보내지 않는다.
// 외부 요청은 helpers/fetchGuard 로 모두 가로채며, 가짜 주소(.test 도메인)와 가짜 신청 정보만 쓴다.

const SLACK_URL = "https://hooks.slack.test/services/fake"
const SHEETS_URL = "https://sheets.test/macros/exec"

const validBody = {
  targetCountries: ["일본"],
  interests: ["광고 운영"],
  expectedRevenue: "1000만 원",
  budget: "300만 원",
  businessIntro: "테스트 병원 소개",
  challenges: "테스트 고민",
  implementationTiming: "즉시",
  hospitalName: "테스트병원",
  name: "홍길동",
  region: "서울",
  website: "https://example.com",
  phone: "010-0000-0000",
  email: "test@example.com",
  privacyConsent: true,
}

const makeRequest = (body: unknown) =>
  new Request("http://localhost/api/inquiry", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })

// route.ts 와 slack.ts 는 모듈을 불러올 때 환경변수를 읽으므로, 환경변수를 바꾼 뒤 새로 불러온다.
async function loadRoute() {
  vi.resetModules()
  return import("@/app/api/inquiry/route")
}

function configureChannels({ slack = true, sheets = true } = {}) {
  if (slack) vi.stubEnv("SLACK_WEBHOOK_URL", SLACK_URL)
  if (sheets) {
    vi.stubEnv("GOOGLE_SHEETS_WEBHOOK_URL", SHEETS_URL)
    vi.stubEnv("GOOGLE_SHEETS_WEBHOOK_SECRET", "fake-secret")
  }
}

beforeEach(() => {
  for (const name of [
    "RESEND_API_KEY",
    "TRELLO_API_KEY",
    "TRELLO_API_TOKEN",
    "TRELLO_BOARD_ID",
    "TRELLO_LIST_ID",
    "SLACK_WEBHOOK_URL",
    "GOOGLE_SHEETS_WEBHOOK_URL",
    "GOOGLE_SHEETS_WEBHOOK_SECRET",
    "INQUIRY_EVENT_ID_SECRET",
  ]) {
    vi.stubEnv(name, "")
  }
  vi.spyOn(console, "log").mockImplementation(() => {})
  vi.spyOn(console, "warn").mockImplementation(() => {})
  vi.spyOn(console, "error").mockImplementation(() => {})
})

describe("POST /api/inquiry", () => {
  it("스팸 방지 필드(hp)가 채워지면 성공처럼 응답하고 외부로 아무것도 보내지 않는다", async () => {
    configureChannels()
    const { fetchMock } = guardFetch()
    const { POST } = await loadRoute()

    const response = await POST(makeRequest({ ...validBody, hp: "bot" }))

    expect(await response.json()).toEqual({ ok: true })
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it("필수 항목이 비어 있으면 400을 돌려주고 외부로 보내지 않는다", async () => {
    configureChannels()
    const { fetchMock } = guardFetch()
    const { POST } = await loadRoute()

    const response = await POST(makeRequest({ ...validBody, phone: "" }))

    expect(response.status).toBe(400)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it("개인정보 수집 동의가 없으면 400을 돌려준다", async () => {
    const { POST } = await loadRoute()
    const response = await POST(makeRequest({ ...validBody, privacyConsent: false }))
    expect(response.status).toBe(400)
  })

  it("이메일 형식이 틀리면 400을 돌려준다", async () => {
    const { POST } = await loadRoute()
    const response = await POST(makeRequest({ ...validBody, email: "not-an-email" }))
    expect(response.status).toBe(400)
  })

  it("운영에서 시트와 Slack이 모두 실패하면 500을 돌려주고 접수 ID를 주지 않는다 (광고 전환 차단)", async () => {
    vi.stubEnv("NODE_ENV", "production")
    configureChannels()
    guardFetch({
      [SLACK_URL]: () => textResponse("error", 500),
      [SHEETS_URL]: () => textResponse("error", 500),
    })
    const { POST } = await loadRoute()

    const response = await POST(makeRequest(validBody))
    const body = await response.json()

    expect(response.status).toBe(500)
    expect(body.ok).toBeUndefined()
    expect(body.inquiryId).toBeUndefined()
  })

  it("운영에서 기록 채널이 하나도 설정되지 않았으면 500을 돌려준다 (설정 누락을 성공으로 숨기지 않음)", async () => {
    vi.stubEnv("NODE_ENV", "production")
    const { fetchMock } = guardFetch()
    const { POST } = await loadRoute()

    const response = await POST(makeRequest(validBody))

    expect(response.status).toBe(500)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it("Slack이 실패해도 시트 저장이 성공하면 접수 성공(ok + inquiryId)이다", async () => {
    vi.stubEnv("NODE_ENV", "production")
    configureChannels()
    guardFetch({
      [SLACK_URL]: () => textResponse("error", 500),
      [SHEETS_URL]: () => jsonResponse({ ok: true }),
    })
    const { POST } = await loadRoute()

    const response = await POST(makeRequest(validBody))
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.ok).toBe(true)
    expect(typeof body.inquiryId).toBe("string")
    expect(body.sheetSaved).toBe(true)
  })

  it("시트가 200이어도 JSON ok가 없으면(권한 오류 HTML 등) 저장 실패로 본다", async () => {
    vi.stubEnv("NODE_ENV", "production")
    configureChannels({ slack: false })
    guardFetch({
      [SHEETS_URL]: () => new Response("<html>Google 로그인</html>", { status: 200 }),
    })
    const { POST } = await loadRoute()

    const response = await POST(makeRequest(validBody))

    expect(response.status).toBe(500)
  })

  it("로컬 개발에서 기록 채널이 하나도 없으면 기존처럼 통과시킨다", async () => {
    vi.stubEnv("NODE_ENV", "development")
    const { fetchMock } = guardFetch()
    const { POST } = await loadRoute()

    const response = await POST(makeRequest(validBody))
    const body = await response.json()

    expect(body.ok).toBe(true)
    expect(typeof body.inquiryId).toBe("string")
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it("신청자 정보는 설정된 기록 채널(Slack, 시트)로만 보낸다", async () => {
    vi.stubEnv("NODE_ENV", "production")
    configureChannels()
    const { calls } = guardFetch({
      [SLACK_URL]: () => textResponse("ok", 200),
      [SHEETS_URL]: () => jsonResponse({ ok: true }),
    })
    const { POST } = await loadRoute()

    await POST(makeRequest(validBody))

    const hosts = new Set(calls.map((call) => new URL(call.url).host))
    expect(hosts).toEqual(new Set(["hooks.slack.test", "sheets.test"]))
  })
})
