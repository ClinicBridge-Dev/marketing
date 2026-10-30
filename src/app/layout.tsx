import type { Metadata } from "next"
import Script from "next/script"
import { Instrument_Serif } from "next/font/google"
// 본문 폰트: Pretendard 가변 폰트 동적 서브셋을 자체 호스팅한다.
// 2MB 단일 파일 대신 92개 조각에 unicode-range 가 걸려 있어, 페이지에 실제로 쓰인 글자 묶음만 받는다.
import "pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css"
import "./globals.css"
import { ClientProviders } from "@/components/providers/ClientProviders"
import { GA_ID, GOOGLE_ADS_ID } from "@/lib/gtag"
import { OPENAI_PIXEL_ID, getOpenAIPixelInitScript } from "@/lib/openaiPixel"

// 섹션 아이브로우의 영문 강조 단어용 세리프 (예: Proof in *Numbers*). 한글은 Pretendard 유지.
const serif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
})

export const metadata: Metadata = {
  title: "클리닉브릿지 | 클리닉 그로스 컴퍼니",
  description: "우리 병원의 전략 수립부터 마케팅, 상담, 예약 전환까지. 클리닉브릿지는 해외환자 매출을 책임지는 전담 그로스 팀입니다.",
  keywords: "클리닉 그로스 컴퍼니, 해외환자 유치, 글로벌 환자 유치, 인바운드 의료 관광, 메디컬 마케팅, 클리닉브릿지",
  authors: [{ name: "클리닉브릿지" }],
  creator: "클리닉브릿지",
  publisher: "클리닉브릿지",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://clinicbridge.co.kr"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "클리닉브릿지 | 클리닉 그로스 컴퍼니",
    description: "우리 병원의 전략 수립부터 마케팅, 상담, 예약 전환까지. 클리닉브릿지는 해외환자 매출을 책임지는 전담 그로스 팀입니다.",
    url: "https://clinicbridge.co.kr",
    siteName: "클리닉브릿지",
    images: [
      {
        url: "/og-image-v2.jpg",
        width: 1200,
        height: 630,
        alt: "클리닉브릿지 | 클리닉 그로스 컴퍼니",
      },
    ],
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "클리닉브릿지 | 클리닉 그로스 컴퍼니",
    description: "우리 병원의 전략 수립부터 마케팅, 상담, 예약 전환까지. 클리닉브릿지는 해외환자 매출을 책임지는 전담 그로스 팀입니다.",
    images: ["/og-image-v2.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko" className={serif.variable} suppressHydrationWarning>
      <body className="antialiased" suppressHydrationWarning>
        {(GA_ID || GOOGLE_ADS_ID) && (
          <>
            <Script
              strategy="afterInteractive"
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID || GOOGLE_ADS_ID}`}
            />
            <Script
              id="gtag-init"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  ${GA_ID ? `gtag('config', '${GA_ID}');` : ""}
                  ${GOOGLE_ADS_ID ? `gtag('config', '${GOOGLE_ADS_ID}');` : ""}
                `,
              }}
            />
          </>
        )}
        {OPENAI_PIXEL_ID && (
          <Script
            id="openai-pixel-init"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{ __html: getOpenAIPixelInitScript(OPENAI_PIXEL_ID) }}
          />
        )}
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  )
}
