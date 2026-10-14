import { NextResponse } from "next/server"
import { Resend } from "resend"
import { sendSlackNotification } from "@/lib/slack"
import { createTrelloCard, testTrelloAuth, type TrelloCardResponse } from "@/lib/trello"

const resendApiKey = process.env.RESEND_API_KEY
const resend = resendApiKey ? new Resend(resendApiKey) : null

export async function POST(req: Request) {
  try {
    const {
      targetCountries,
      interests,
      expectedRevenue,
      budget,
      businessIntro,
      challenges,
      implementationTiming,
      hospitalName,
      name,
      region,
      website,
      phone,
      email,
      privacyConsent,
      hp,
    } = await req.json()

    if (hp) {
      return NextResponse.json({ ok: true })
    }

    if (
      !Array.isArray(targetCountries) ||
      targetCountries.length === 0 ||
      !Array.isArray(interests) ||
      interests.length === 0 ||
      !expectedRevenue ||
      !budget ||
      !businessIntro ||
      !challenges ||
      !implementationTiming ||
      !hospitalName ||
      !name ||
      !region ||
      !website ||
      !phone ||
      !email ||
      !privacyConsent
    ) {
      return NextResponse.json({ error: "모든 필드를 입력해주세요" }, { status: 400 })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "올바른 이메일을 입력해주세요" }, { status: 400 })
    }

    // 접수 건 식별자. 클라이언트는 이 값이 있을 때만 광고 전환(OpenAI lead_created)을 보내고,
    // 같은 값을 event_id로 써서 중복 집계를 막는다. 개인정보와 무관한 무작위 값이다.
    const inquiryId = crypto.randomUUID()

    const countriesLine = targetCountries.join(", ")
    const interestsLine = interests.join(", ")

    let trelloCard: TrelloCardResponse | null = null
    const trelloApiKey = process.env.TRELLO_API_KEY
    const trelloToken = process.env.TRELLO_API_TOKEN
    const trelloBoardId = process.env.TRELLO_BOARD_ID
    const trelloListId = process.env.TRELLO_LIST_ID
    if (trelloApiKey && trelloToken && trelloBoardId && trelloListId) {
      const trelloConfig = {
        apiKey: trelloApiKey.trim(),
        token: trelloToken.trim(),
        boardId: trelloBoardId.trim(),
        listId: trelloListId.trim(),
      }
      try {
        const authSuccess = await testTrelloAuth(trelloConfig)
        if (authSuccess) {
          const cardDescription = `**📋 문의자 정보**
• **이름:** ${name}
• **병원명/회사명:** ${hospitalName}
• **연락처:** ${phone}
• **이메일:** ${email}
• **지역:** ${region}
• **홈페이지:** ${website}

**🌍 마케팅 정보**
• **희망 국가:** ${countriesLine}
• **관심 서비스:** ${interestsLine}
• **기대 해외 환자 월 매출:** ${expectedRevenue}
• **월 예산:** ${budget}
• **도입 희망 시기:** ${implementationTiming}

**💬 병원/사업 소개**
${businessIntro}

**⚠️ 현재 겪고 있는 어려움**
${challenges}

---
📅 문의 시간: ${new Date().toLocaleString("ko-KR")}
🤖 자동 생성된 카드`
          trelloCard = await createTrelloCard(trelloConfig, {
            name: `[문의] ${name} - ${hospitalName}`,
            description: cardDescription,
          })
        } else {
          console.error("❌ Trello API 인증 실패")
        }
      } catch (error) {
        console.error("❌ Trello 카드 생성 실패:", error)
      }
    } else {
      console.warn("⚠️ Trello 환경변수가 설정되지 않아 카드 생성을 건너뜁니다.")
    }

    const slackResult = await sendSlackNotification({
      text: `도입 상담 신청이 접수되었습니다: ${name} (${hospitalName})`,
      blocks: [
        {
          type: "header",
          text: { type: "plain_text", text: "📬 도입 상담 신청", emoji: true },
        },
        {
          type: "section",
          fields: [
            { type: "mrkdwn", text: `*병원명/회사명*\n${hospitalName}` },
            { type: "mrkdwn", text: `*직책/성함*\n${name}` },
            { type: "mrkdwn", text: `*지역*\n${region}` },
            { type: "mrkdwn", text: `*홈페이지*\n${website}` },
            { type: "mrkdwn", text: `*연락처*\n${phone}` },
            { type: "mrkdwn", text: `*이메일*\n${email}` },
          ],
        },
        {
          type: "section",
          fields: [
            { type: "mrkdwn", text: `*희망 국가*\n${countriesLine}` },
            { type: "mrkdwn", text: `*관심 서비스*\n${interestsLine}` },
            { type: "mrkdwn", text: `*기대 해외 환자 월 매출*\n${expectedRevenue}` },
            { type: "mrkdwn", text: `*월 예산*\n${budget}` },
            { type: "mrkdwn", text: `*도입 희망 시기*\n${implementationTiming}` },
          ],
        },
        {
          type: "section",
          text: { type: "mrkdwn", text: `*병원/사업 소개*\n${businessIntro}` },
        },
        {
          type: "section",
          text: { type: "mrkdwn", text: `*현재 겪고 있는 어려움*\n${challenges}` },
        },
        {
          type: "context",
          elements: [
            { type: "mrkdwn", text: `접수 시간: ${new Date().toLocaleString("ko-KR")}` },
            ...(trelloCard?.shortUrl
              ? [{ type: "mrkdwn" as const, text: `<${trelloCard.shortUrl}|Trello 카드 바로가기>` }]
              : []),
          ],
        },
      ],
    })

    if (!slackResult.ok && !slackResult.skipped) {
      console.error("❌ Slack 알림 전송 실패:", slackResult)
    }

    if (!resend) {
      console.log("Resend API key not configured. Skipping email send.")
      console.log("Inquiry form data:", {
        targetCountries,
        interests,
        expectedRevenue,
        budget,
        businessIntro,
        challenges,
        implementationTiming,
        hospitalName,
        name,
        region,
        website,
        phone,
        email,
      })
      return NextResponse.json({
        ok: true,
        inquiryId,
        trelloCardId: trelloCard?.id ?? null,
        trelloCardShortUrl: trelloCard?.shortUrl ?? null,
        slackNotified: slackResult.ok || slackResult.skipped || false,
      })
    }

    await resend.emails.send({
      from: process.env.FROM_EMAIL || "no-reply@clinicbridge.co.kr",
      to: process.env.TO_EMAIL || "clinicbridge.kr@gmail.com",
      subject: `[도입 상담] ${hospitalName} 신청 도착`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333; border-bottom: 2px solid #C1452D; padding-bottom: 10px;">
            도입 상담 신청
          </h2>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>병원명/회사명:</strong> ${hospitalName}</p>
            <p><strong>직책/성함:</strong> ${name}</p>
            <p><strong>지역:</strong> ${region}</p>
            <p><strong>홈페이지:</strong> ${website}</p>
            <p><strong>연락처:</strong> ${phone}</p>
            <p><strong>이메일:</strong> ${email}</p>
            <p><strong>희망 국가:</strong> ${countriesLine}</p>
            <p><strong>관심 서비스:</strong> ${interestsLine}</p>
            <p><strong>기대 해외 환자 월 매출:</strong> ${expectedRevenue}</p>
            <p><strong>월 예산:</strong> ${budget}</p>
            <p><strong>도입 희망 시기:</strong> ${implementationTiming}</p>
          </div>
          <div style="background: #fff; border: 1px solid #e9ecef; padding: 20px; border-radius: 8px; margin-bottom: 12px;">
            <h3 style="color: #C1452D; margin-top: 0;">병원/사업 소개</h3>
            <p style="white-space: pre-wrap; line-height: 1.6;">${businessIntro}</p>
          </div>
          <div style="background: #fff; border: 1px solid #e9ecef; padding: 20px; border-radius: 8px; margin-bottom: 12px;">
            <h3 style="color: #C1452D; margin-top: 0;">현재 겪고 있는 어려움</h3>
            <p style="white-space: pre-wrap; line-height: 1.6;">${challenges}</p>
          </div>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e9ecef; color: #6c757d; font-size: 14px;">
            <p>이 이메일은 클리닉브릿지 웹사이트(/inquiry)를 통해 자동으로 발송되었습니다.</p>
            <p>발송 시간: ${new Date().toLocaleString("ko-KR")}</p>
          </div>
        </div>
      `,
    })

    return NextResponse.json({
      ok: true,
      inquiryId,
      trelloCardId: trelloCard?.id ?? null,
      trelloCardShortUrl: trelloCard?.shortUrl ?? null,
      slackNotified: slackResult.ok || slackResult.skipped || false,
    })
  } catch (error) {
    console.error("Inquiry form error:", error)
    return NextResponse.json({ error: "서버 오류가 발생했습니다. 다시 시도해주세요." }, { status: 500 })
  }
}
