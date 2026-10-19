// 도입 상담 접수 ID(inquiryId) 생성
//
// 이 값은 광고 전환(OpenAI lead_created)의 event_id 로 쓰인다.
// OpenAI는 pixelId + 이벤트명 + event_id 가 같은 이벤트 중 처음 받은 것만 집계하므로,
// 같은 사람이 같은 날 다시 제출해도 같은 ID를 돌려주면 전환이 한 번만 잡힌다.
//
// - INQUIRY_EVENT_ID_SECRET 이 있으면: HMAC-SHA256(비밀값, 이메일|전화번호|한국 날짜)로 만든다.
//   비밀값 없이는 ID에서 연락처를 역산할 수 없다 (공개 저장소라 고정 솔트를 코드에 두지 않는다).
// - 비밀값이 없으면: 매번 무작위 UUID (재제출 중복은 막지 못하지만 기존 동작과 같다).
import { createHmac, randomUUID } from "crypto"

const KOREA_TIME_ZONE = "Asia/Seoul"

interface InquiryEventIdInput {
  email: string
  phone: string
  receivedAt: Date
}

const normalizeEmail = (email: string) => email.trim().toLowerCase()
const normalizePhone = (phone: string) => phone.replace(/\D/g, "")
// en-CA 로캘은 "YYYY-MM-DD" 형식으로 표기한다.
const koreanDate = (date: Date) => date.toLocaleDateString("en-CA", { timeZone: KOREA_TIME_ZONE })

// HMAC 결과(hex) 앞 32자리를 UUID 모양(8-4-4-4-12)으로 맞춘다. 무작위 UUID와 같은 형식으로 다루기 위함.
const toUuidShape = (hex: string) =>
  `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`

export function createInquiryEventId({ email, phone, receivedAt }: InquiryEventIdInput): string {
  const secret = process.env.INQUIRY_EVENT_ID_SECRET?.trim()
  if (!secret) return randomUUID()

  const key = `${normalizeEmail(email)}|${normalizePhone(phone)}|${koreanDate(receivedAt)}`
  return toUuidShape(createHmac("sha256", secret).update(key).digest("hex"))
}
