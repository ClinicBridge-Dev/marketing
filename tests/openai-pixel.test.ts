import { describe, expect, it, vi } from "vitest"

// OpenAI 광고 전환(lead_created) 테스트 (rules.md R04).
// 같은 접수 ID로는 한 번만 보내야 한다. 재렌더링 등으로 두 번 호출돼도 전환이 두 번 잡히면 안 된다.
// 실제 SDK 대신 가짜 oaiq 함수로 호출만 기록한다 (실제 전환을 보내지 않음).

async function loadPixel(pixelId: string) {
  vi.stubEnv("NEXT_PUBLIC_OPENAI_PIXEL_ID", pixelId)
  vi.resetModules()
  return import("@/lib/openaiPixel")
}

describe("trackLeadCreated", () => {
  it("같은 접수 ID로 두 번 호출해도 한 번만 보낸다", async () => {
    const oaiq = vi.fn()
    vi.stubGlobal("window", { oaiq })
    const { trackLeadCreated } = await loadPixel("fake-pixel")

    trackLeadCreated("inquiry-1")
    trackLeadCreated("inquiry-1")
    trackLeadCreated("inquiry-2")

    expect(oaiq).toHaveBeenCalledTimes(2)
    expect(oaiq).toHaveBeenCalledWith("measure", "lead_created", { type: "customer_action" }, { event_id: "inquiry-1" })
  })

  it("접수 ID가 비어 있으면 보내지 않는다", async () => {
    const oaiq = vi.fn()
    vi.stubGlobal("window", { oaiq })
    const { trackLeadCreated } = await loadPixel("fake-pixel")

    trackLeadCreated("")

    expect(oaiq).not.toHaveBeenCalled()
  })

  it("픽셀 ID가 없으면 보내지 않는다", async () => {
    const oaiq = vi.fn()
    vi.stubGlobal("window", { oaiq })
    const { trackLeadCreated } = await loadPixel("")

    trackLeadCreated("inquiry-1")

    expect(oaiq).not.toHaveBeenCalled()
  })

  it("SDK가 오류를 던져도 접수 완료 흐름을 깨지 않는다", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {})
    const oaiq = vi.fn(() => {
      throw new Error("sdk error")
    })
    vi.stubGlobal("window", { oaiq })
    const { trackLeadCreated } = await loadPixel("fake-pixel")

    expect(() => trackLeadCreated("inquiry-1")).not.toThrow()
  })
})
