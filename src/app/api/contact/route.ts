import { NextResponse } from "next/server"
import { Resend } from "resend"
import {
  createTrelloCard,
  getTrelloConfig,
  testTrelloAuth,
  type TrelloCardResponse,
} from "@/lib/trello"
import { formatKoreanDateTime } from "@/lib/datetime"
import { sendSlackNotification } from "@/lib/slack"

// Check if Resend API key is available
const resendApiKey = process.env.RESEND_API_KEY
const resend = resendApiKey ? new Resend(resendApiKey) : null

export async function POST(req: Request) {
  try {
    const { name, phone, hospital, email, message, hp } = await req.json()

    // Honeypot check
    if (hp) {
      return NextResponse.json({ ok: true })
    }

    // Validation
    if (!name || !phone || !hospital || !email || !message) {
      return NextResponse.json(
        { error: "모든 필드를 입력해주세요" },
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

    // Phone validation
    const phoneRegex = /^[0-9-+\s()]+$/
    if (!phoneRegex.test(phone)) {
      return NextResponse.json(
        { error: "올바른 전화번호를 입력해주세요" },
        { status: 400 }
      )
    }

    // Trello 카드 생성 - 강제 실행
    console.log("🔍 환경변수 직접 확인:", {
      TRELLO_API_KEY: process.env.TRELLO_API_KEY ? `${process.env.TRELLO_API_KEY.substring(0, 8)}...` : "❌ 없음",
      TRELLO_API_TOKEN: process.env.TRELLO_API_TOKEN ? `${process.env.TRELLO_API_TOKEN.substring(0, 8)}...` : "❌ 없음",
      TRELLO_BOARD_ID: process.env.TRELLO_BOARD_ID ? `${process.env.TRELLO_BOARD_ID.substring(0, 8)}...` : "❌ 없음",
      TRELLO_LIST_ID: process.env.TRELLO_LIST_ID ? `${process.env.TRELLO_LIST_ID.substring(0, 8)}...` : "❌ 없음"
    })
    
    // 환경변수가 없어도 강제로 Trello API 호출 시도
    console.log("🚀 Trello API 강제 실행 시작...")
    let trelloCard: TrelloCardResponse | null = null
    
    try {
      // 환경변수에서 직접 가져오기
      const apiKey = process.env.TRELLO_API_KEY
      const token = process.env.TRELLO_API_TOKEN
      const boardId = process.env.TRELLO_BOARD_ID
      const listId = process.env.TRELLO_LIST_ID
      
      console.log("🔍 직접 환경변수 확인:", {
        apiKey: apiKey ? "✅ 설정됨" : "❌ 없음",
        token: token ? "✅ 설정됨" : "❌ 없음",
        boardId: boardId ? "✅ 설정됨" : "❌ 없음",
        listId: listId ? "✅ 설정됨" : "❌ 없음"
      })
      
      if (apiKey && token && boardId && listId) {
        const trelloConfig = {
          apiKey: apiKey.trim(),
          token: token.trim(),
          boardId: boardId.trim(),
          listId: listId.trim()
        }
        
        console.log("✅ 환경변수 모두 설정됨, Trello API 호출 시작...")
        
        // 인증 테스트
        console.log("🧪 Trello API 인증 테스트 시작...")
        const authSuccess = await testTrelloAuth(trelloConfig)
        
        if (authSuccess) {
          console.log("✅ Trello API 인증 성공, 카드 생성 시작...")
          const cardDescription = `**📋 문의자 정보**
• **이름:** ${name}
• **연락처:** ${phone}
• **병원명/직책:** ${hospital}
• **이메일:** ${email}

**💬 문의내용**
${message}

---
📅 문의 시간: ${formatKoreanDateTime()}
🤖 자동 생성된 카드`
          trelloCard = await createTrelloCard(trelloConfig, {
            name: `[문의] ${name} - ${hospital}`,
            description: cardDescription,
          })
          console.log(`✅ Trello 카드 생성 성공: ${trelloCard.shortUrl}`)
        } else {
          console.error("❌ Trello API 인증 실패")
        }
      } else {
        console.error("❌ 환경변수가 일부 누락됨")
        console.error("❌ 누락된 변수:", {
          apiKey: !apiKey,
          token: !token,
          boardId: !boardId,
          listId: !listId
        })
      }
    } catch (error) {
      console.error("❌ Trello API 강제 실행 실패:", error)
      console.error("❌ 오류 상세:", {
        message: error instanceof Error ? error.message : "알 수 없는 오류",
        stack: error instanceof Error ? error.stack : undefined
      })
    }

    const slackMessage = {
      text: `새로운 도입 상담 신청이 접수되었습니다: ${name} (${hospital})`,
      blocks: [
        {
          type: "header",
          text: {
            type: "plain_text",
            text: "📬 신규 문의 접수",
            emoji: true,
          },
        },
        {
          type: "section",
          fields: [
            {
              type: "mrkdwn",
              text: `*이름*\n${name}`,
            },
            {
              type: "mrkdwn",
              text: `*연락처*\n${phone}`,
            },
            {
              type: "mrkdwn",
              text: `*소속/직책*\n${hospital}`,
            },
            {
              type: "mrkdwn",
              text: `*이메일*\n${email}`,
            },
          ],
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*도입 검토 내용*\n${message}`,
          },
        },
        {
          type: "context",
          elements: [
            {
              type: "mrkdwn",
              text: `접수 시간: ${formatKoreanDateTime()}`,
            },
            ...(trelloCard?.shortUrl
              ? [
                  {
                    type: "mrkdwn" as const,
                    text: `<${trelloCard.shortUrl}|Trello 카드 바로가기>`,
                  },
                ]
              : []),
          ],
        },
      ],
    }

    const slackResult = await sendSlackNotification(slackMessage)

    if (!slackResult.ok && !slackResult.skipped) {
      console.error("❌ Slack 알림 전송 실패:", slackResult)
    }

    // Send email
    if (!resend) {
      console.log("Resend API key not configured. Skipping email send.")
      // In development or when API key is not set, just log the data
      console.log("Contact form data:", { name, phone, hospital, email, message })
      return NextResponse.json({ 
        ok: true, 
        trelloCardId: trelloCard?.id ?? null,
        trelloCardShortUrl: trelloCard?.shortUrl ?? null,
        slackNotified: slackResult.ok || slackResult.skipped || false,
      })
    }

    await resend.emails.send({
       from: process.env.FROM_EMAIL || "no-reply@clinicbridge.co.kr",
       to: process.env.TO_EMAIL || "clinicbridge.kr@gmail.com",
      subject: "클리닉브릿지 도입 상담 신청 도착",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333; border-bottom: 2px solid #667eea; padding-bottom: 10px;">
            클리닉브릿지 신규 문의
          </h2>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #667eea; margin-top: 0;">문의자 정보</h3>
            <p><strong>이름:</strong> ${name}</p>
            <p><strong>연락처:</strong> ${phone}</p>
            <p><strong>소속/직책:</strong> ${hospital}</p>
            <p><strong>이메일:</strong> ${email}</p>
          </div>
          
          <div style="background: #fff; border: 1px solid #e9ecef; padding: 20px; border-radius: 8px;">
            <h3 style="color: #667eea; margin-top: 0;">도입 검토 내용</h3>
            <p style="white-space: pre-wrap; line-height: 1.6;">${message}</p>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e9ecef; color: #6c757d; font-size: 14px;">
            <p>이 이메일은 클리닉브릿지 웹사이트를 통해 자동으로 발송되었습니다.</p>
            <p>발송 시간: ${formatKoreanDateTime()}</p>
          </div>
        </div>
      `,
    })

    return NextResponse.json({ 
      ok: true, 
      trelloCardId: trelloCard?.id ?? null,
      trelloCardShortUrl: trelloCard?.shortUrl ?? null,
      slackNotified: slackResult.ok || slackResult.skipped || false,
    })
  } catch (error) {
    console.error("Contact form error:", error)
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다. 다시 시도해주세요." },
      { status: 500 }
    )
  }
}
