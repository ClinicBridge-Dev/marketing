import { NextResponse } from "next/server"
import { Resend } from "resend"
import { formatKoreanDateTime } from "@/lib/datetime"

// Check if Resend API key is available
const resendApiKey = process.env.RESEND_API_KEY
const resend = resendApiKey ? new Resend(resendApiKey) : null

export async function POST(req: Request) {
  try {
    const { email } = await req.json()

    // Validation
    if (!email) {
      return NextResponse.json(
        { error: "이메일을 입력해주세요" },
        { status: 400 }
      )
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "올바른 이메일을 입력해주세요" },
        { status: 400 }
      )
    }

    // Send email
    if (!resend) {
      console.log("Resend API key not configured. Skipping email send.")
      // In development or when API key is not set, just log the data
      console.log("Blog subscription:", { email })
      return NextResponse.json({ ok: true })
    }

    await resend.emails.send({
      from: process.env.FROM_EMAIL || "no-reply@clinicbridge.co.kr",
      to: process.env.TO_EMAIL || "clinicbridge.kr@gmail.com",
      subject: "클리닉브릿지 블로그 구독 신청",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333; border-bottom: 2px solid #667eea; padding-bottom: 10px;">
            클리닉브릿지 블로그 구독 신청
          </h2>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #667eea; margin-top: 0;">구독자 정보</h3>
            <p><strong>이메일:</strong> ${email}</p>
          </div>
          
          <div style="background: #fff; border: 1px solid #e9ecef; padding: 20px; border-radius: 8px;">
            <h3 style="color: #667eea; margin-top: 0;">구독 내용</h3>
            <p>블로그 이메일 구독을 신청했습니다.</p>
            <p>매달 새로운 마케팅 칼럼을 이메일로 받아보실 수 있습니다.</p>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e9ecef; color: #6c757d; font-size: 14px;">
            <p>이 이메일은 클리닉브릿지 웹사이트를 통해 자동으로 발송되었습니다.</p>
            <p>발송 시간: ${formatKoreanDateTime()}</p>
          </div>
        </div>
      `,
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Blog subscription error:", error)
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다. 다시 시도해주세요." },
      { status: 500 }
    )
  }
}
