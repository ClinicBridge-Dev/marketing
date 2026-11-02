import { describe, expect, it, vi } from "vitest"
import { createInquiryEventId } from "@/lib/inquiryEventId"

// 접수 ID(inquiryId) 테스트. 이 값은 광고 전환의 event_id 로 쓰인다 (rules.md R04).
// - 비밀값이 있으면: 같은 사람·같은 한국 날짜의 재제출은 같은 ID → 전환 1건으로 집계.
// - ID에서 연락처를 알아낼 수 없어야 한다 (공개 저장소라 비밀값 없이 만들면 안 됨).

const UUID_SHAPE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
const base = {
  email: "test@example.com",
  phone: "010-1234-5678",
  // 한국 시간 2026-11-02 10:00
  receivedAt: new Date("2026-11-02T01:00:00Z"),
}

describe("createInquiryEventId", () => {
  it("비밀값이 있으면 같은 사람·같은 날 재제출에 같은 ID를 만든다", () => {
    vi.stubEnv("INQUIRY_EVENT_ID_SECRET", "test-secret")
    const later = new Date("2026-11-02T14:00:00Z") // 한국 시간 같은 날 23:00
    expect(createInquiryEventId(base)).toBe(createInquiryEventId({ ...base, receivedAt: later }))
  })

  it("이메일 대소문자·공백과 전화번호 하이픈 차이는 같은 사람으로 본다", () => {
    vi.stubEnv("INQUIRY_EVENT_ID_SECRET", "test-secret")
    const variant = { ...base, email: "  TEST@Example.com ", phone: "01012345678" }
    expect(createInquiryEventId(variant)).toBe(createInquiryEventId(base))
  })

  it("한국 날짜가 바뀌면 다른 ID를 만든다 (UTC가 아니라 한국 시간 기준)", () => {
    vi.stubEnv("INQUIRY_EVENT_ID_SECRET", "test-secret")
    const nextKoreanDay = new Date("2026-11-02T15:00:00Z") // 한국 시간 11-03 00:00
    expect(createInquiryEventId({ ...base, receivedAt: nextKoreanDay })).not.toBe(createInquiryEventId(base))
  })

  it("비밀값이 다르면 다른 ID를 만든다", () => {
    vi.stubEnv("INQUIRY_EVENT_ID_SECRET", "secret-a")
    const a = createInquiryEventId(base)
    vi.stubEnv("INQUIRY_EVENT_ID_SECRET", "secret-b")
    expect(createInquiryEventId(base)).not.toBe(a)
  })

  it("ID는 UUID 모양이고 연락처를 그대로 담지 않는다", () => {
    vi.stubEnv("INQUIRY_EVENT_ID_SECRET", "test-secret")
    const id = createInquiryEventId(base)
    expect(id).toMatch(UUID_SHAPE)
    expect(id).not.toContain("test")
    expect(id).not.toContain("12345678")
  })

  it("비밀값이 없으면 매번 다른 무작위 UUID를 만든다", () => {
    vi.stubEnv("INQUIRY_EVENT_ID_SECRET", "")
    const a = createInquiryEventId(base)
    const b = createInquiryEventId(base)
    expect(a).toMatch(UUID_SHAPE)
    expect(a).not.toBe(b)
  })
})
