import { NextResponse } from "next/server"
import { Resend } from "resend"
import { formatKoreanDateTime } from "@/lib/datetime"
import { sendSlackNotification } from "@/lib/slack"

const resendApiKey = process.env.RESEND_API_KEY
const resend = resendApiKey ? new Resend(resendApiKey) : null

export async function POST(req: Request) {
  try {
    const {
      name,
      phone,
      email,
      hospitalName,
      department,
      website,
      japanExperience,
      topTreatment,
      monthlyForeignPatients,
      score,
      tier,
      hp,
    } = await req.json()

    // Honeypot check
    if (hp) {
      return NextResponse.json({ ok: true })
    }

    if (
      !name ||
      !phone ||
      !email ||
      !hospitalName ||
      !department ||
      !website ||
      !japanExperience ||
      !topTreatment ||
      !monthlyForeignPatients
    ) {
      return NextResponse.json({ error: "모든 필드를 입력해주세요" }, { status: 400 })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "올바른 이메일을 입력해주세요" }, { status: 400 })
    }

    const scoreLine = typeof score === "number" ? `${score}/100 (${tier ?? "미상"})` : "미측정"

    const slackResult = await sendSlackNotification({
      text: `일본 진출 가능성 무료 진단 신청이 접수되었습니다: ${name} (${hospitalName})`,
      blocks: [
        {
          type: "header",
          text: { type: "plain_text", text: "🇯🇵 일본 진출 가능성 진단 신청", emoji: true },
        },
        {
          type: "section",
          fields: [
            { type: "mrkdwn", text: `*담당자*\n${name}` },
            { type: "mrkdwn", text: `*연락처*\n${phone}` },
            { type: "mrkdwn", text: `*이메일*\n${email}` },
            { type: "mrkdwn", text: `*병원명*\n${hospitalName}` },
            { type: "mrkdwn", text: `*진료과*\n${department}` },
            { type: "mrkdwn", text: `*홈페이지*\n${website}` },
            { type: "mrkdwn", text: `*일본 진출 경험*\n${japanExperience}` },
            { type: "mrkdwn", text: `*가장 키우고 싶은 진료*\n${topTreatment}` },
            { type: "mrkdwn", text: `*월 해외환자 내원 수*\n${monthlyForeignPatients}` },
            { type: "mrkdwn", text: `*자가진단 스코어*\n${scoreLine}` },
          ],
        },
        {
          type: "context",
          elements: [{ type: "mrkdwn", text: `접수 시간: ${formatKoreanDateTime()}` }],
        },
      ],
    })

    if (!slackResult.ok && !slackResult.skipped) {
      console.error("❌ Slack 알림 전송 실패:", slackResult)
    }

    if (!resend) {
      console.log("Resend API key not configured. Skipping email send.")
      console.log("Diagnosis form data:", {
        name,
        phone,
        email,
        hospitalName,
        department,
        website,
        japanExperience,
        topTreatment,
        monthlyForeignPatients,
        score,
        tier,
      })
      return NextResponse.json({ ok: true, slackNotified: slackResult.ok || slackResult.skipped || false })
    }

    await resend.emails.send({
      from: process.env.FROM_EMAIL || "no-reply@clinicbridge.co.kr",
      to: process.env.TO_EMAIL || "clinicbridge.kr@gmail.com",
      subject: `[일본 진출 진단] ${hospitalName} 신청 도착`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333; border-bottom: 2px solid #C1452D; padding-bottom: 10px;">
            우리 병원 일본 진출 가능성 무료 진단 신청
          </h2>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>담당자:</strong> ${name}</p>
            <p><strong>연락처:</strong> ${phone}</p>
            <p><strong>이메일:</strong> ${email}</p>
            <p><strong>병원명:</strong> ${hospitalName}</p>
            <p><strong>진료과:</strong> ${department}</p>
            <p><strong>홈페이지:</strong> ${website}</p>
            <p><strong>일본 진출 경험:</strong> ${japanExperience}</p>
            <p><strong>가장 키우고 싶은 진료:</strong> ${topTreatment}</p>
            <p><strong>월 해외환자 내원 수:</strong> ${monthlyForeignPatients}</p>
            <p><strong>자가진단 스코어:</strong> ${scoreLine}</p>
          </div>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e9ecef; color: #6c757d; font-size: 14px;">
            <p>이 이메일은 클리닉브릿지 웹사이트(/benchmark)를 통해 자동으로 발송되었습니다.</p>
            <p>발송 시간: ${formatKoreanDateTime()}</p>
          </div>
        </div>
      `,
    })

    return NextResponse.json({ ok: true, slackNotified: slackResult.ok || slackResult.skipped || false })
  } catch (error) {
    console.error("Diagnosis form error:", error)
    return NextResponse.json({ error: "서버 오류가 발생했습니다. 다시 시도해주세요." }, { status: 500 })
  }
}
