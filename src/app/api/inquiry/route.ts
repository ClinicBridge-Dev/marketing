import { NextResponse } from "next/server"
import { Resend } from "resend"
import { formatKoreanDateTime, formatKoreanTimestamp } from "@/lib/datetime"
import { appendSheetRow } from "@/lib/googleSheets"
import { sendSlackNotification } from "@/lib/slack"
import { createInquiryEventId } from "@/lib/inquiryEventId"
import { createTrelloCard, testTrelloAuth, type TrelloCardResponse } from "@/lib/trello"

// 구글 시트에서 도입 상담 접수 내역을 쌓는 탭 이름.
const INQUIRY_SHEET_NAME = "도입상담"

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
      inflow,
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
    // 같은 값을 event_id로 써서 중복 집계를 막는다. 같은 사람·같은 날 재제출은 같은 값이 된다 (lib/inquiryEventId).
    const receivedAt = new Date()
    const inquiryId = createInquiryEventId({ email, phone, receivedAt })

    const countriesLine = targetCountries.join(", ")
    const interestsLine = interests.join(", ")
    // 유입 경로(utm). 폼이 주소에서 자동으로 채운다. 없으면 직접 방문.
    const inflowLine = typeof inflow === "string" && inflow.trim() ? inflow.trim().slice(0, 200) : "직접 방문"

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
• **목표 해외 환자 월 매출:** ${expectedRevenue}
• **월 예산:** ${budget}
• **도입 희망 시기:** ${implementationTiming}
• **유입 경로:** ${inflowLine}

**💬 병원/사업 소개**
${businessIntro}

**⚠️ 현재 겪고 있는 어려움**
${challenges}

---
📅 문의 시간: ${formatKoreanDateTime(receivedAt)}
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

    // Slack 알림과 시트 저장은 서로 기다릴 필요가 없어 동시에 보낸다. 둘 다 예외를 던지지 않는다.
    const [slackResult, sheetResult] = await Promise.all([
      sendSlackNotification({
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
              { type: "mrkdwn", text: `*목표 해외 환자 월 매출*\n${expectedRevenue}` },
              { type: "mrkdwn", text: `*월 예산*\n${budget}` },
              { type: "mrkdwn", text: `*도입 희망 시기*\n${implementationTiming}` },
              { type: "mrkdwn", text: `*유입 경로*\n${inflowLine}` },
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
              { type: "mrkdwn", text: `접수 시간: ${formatKoreanDateTime(receivedAt)}` },
              ...(trelloCard?.shortUrl
                ? [{ type: "mrkdwn" as const, text: `<${trelloCard.shortUrl}|Trello 카드 바로가기>` }]
                : []),
            ],
          },
        ],
      }),
      appendSheetRow({
        sheet: INQUIRY_SHEET_NAME,
        record: {
          "접수 시간": formatKoreanTimestamp(receivedAt),
          "병원명/회사명": hospitalName,
          "직책/성함": name,
          지역: region,
          홈페이지: website,
          연락처: phone,
          이메일: email,
          "희망 국가": countriesLine,
          "관심 서비스": interestsLine,
          // 폼 문구는 '목표 해외 환자 월 매출'로 바뀌었지만, 시트 열은 기존 데이터와 이어지도록 이름을 유지한다
          "기대 해외 환자 월 매출": expectedRevenue,
          "월 예산": budget,
          "도입 희망 시기": implementationTiming,
          "유입 경로": inflowLine,
          "병원/사업 소개": businessIntro,
          "현재 겪고 있는 어려움": challenges,
          "개인정보 수집 동의": "동의",
          "Trello 카드": trelloCard?.shortUrl ?? "",
        },
      }),
    ])

    if (!slackResult.ok && !slackResult.skipped) {
      console.error("❌ Slack 알림 전송 실패:", slackResult)
    }

    let emailSent = false
    if (resend) {
      // Resend는 실패해도 예외 대신 { error } 를 돌려준다.
      const { error: emailError } = await resend.emails.send({
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
              <p><strong>목표 해외 환자 월 매출:</strong> ${expectedRevenue}</p>
              <p><strong>월 예산:</strong> ${budget}</p>
              <p><strong>도입 희망 시기:</strong> ${implementationTiming}</p>
              <p><strong>유입 경로:</strong> ${inflowLine}</p>
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
              <p>접수 시간: ${formatKoreanDateTime(receivedAt)}</p>
            </div>
          </div>
        `,
      })
      if (emailError) {
        console.error("❌ 도입 상담 메일 발송 실패:", emailError)
      } else {
        emailSent = true
      }
    } else {
      console.log("Resend API key not configured. Skipping email send.")
    }

    // 시트·트렐로·메일·슬랙 중 하나라도 남았을 때만 접수 완료로 본다.
    // 모두 실패하면 성공 응답(=광고 전환)을 주지 않고, 신청자에게 다시 시도하도록 안내한다.
    // 단, 로컬 개발에서 저장 채널을 하나도 설정하지 않은 경우는 기존처럼 통과시킨다 (운영에서는 설정 누락을 실패로 본다).
    const trelloConfigured = Boolean(trelloApiKey && trelloToken && trelloBoardId && trelloListId)
    const noChannelConfigured = sheetResult.skipped && slackResult.skipped && !trelloConfigured && !resend
    const localWithoutChannels = noChannelConfigured && process.env.NODE_ENV !== "production"
    if (localWithoutChannels) {
      console.warn("⚠️ 저장 채널이 하나도 설정되지 않은 로컬 환경 — 접수 기록 없이 성공 처리합니다.")
    }
    const recorded = sheetResult.ok || Boolean(trelloCard) || emailSent || slackResult.ok || localWithoutChannels
    if (!recorded) {
      console.error("❌ 도입 상담 접수 기록 실패 — 저장된 채널 없음:", {
        receivedAt: formatKoreanTimestamp(receivedAt),
        hospitalName,
        name,
        phone,
        email,
        sheet: sheetResult,
        slack: slackResult,
      })
      return NextResponse.json({ error: "접수 처리 중 오류가 발생했습니다. 다시 시도해주세요." }, { status: 500 })
    }

    return NextResponse.json({
      ok: true,
      inquiryId,
      trelloCardId: trelloCard?.id ?? null,
      trelloCardShortUrl: trelloCard?.shortUrl ?? null,
      slackNotified: slackResult.ok || slackResult.skipped || false,
      sheetSaved: sheetResult.ok,
      emailSent,
    })
  } catch (error) {
    console.error("Inquiry form error:", error)
    return NextResponse.json({ error: "서버 오류가 발생했습니다. 다시 시도해주세요." }, { status: 500 })
  }
}
