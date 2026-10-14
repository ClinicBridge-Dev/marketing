import type { Metadata } from "next"
import Script from "next/script"
import { Suspense } from "react"
import "./globals.css"
import { ClientProviders } from "@/components/providers/ClientProviders"
import { GAProvider } from "@/components/providers/GAProvider"
import { GA_ID, GOOGLE_ADS_ID } from "@/lib/gtag"
import { OPENAI_PIXEL_ID, getOpenAIPixelInitScript } from "@/lib/openaiPixel"

export const metadata: Metadata = {
  title: "클리닉브릿지 - 글로벌 의료 마케팅",
  description: "데이터 기반 전략과 검증된 운영으로 글로벌 의료 마케팅의 성과를 설계합니다.",
  keywords: "글로벌 의료 마케팅, 인바운드 의료 관광, 글로벌 환자 유치, 메디컬 마케팅, 클리닉브릿지",
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
    title: "클리닉브릿지 - 글로벌 의료 마케팅",
    description: "데이터 기반 전략과 검증된 운영으로 글로벌 의료 마케팅의 성과를 설계합니다.",
    url: "https://clinicbridge.co.kr",
    siteName: "클리닉브릿지",
    images: [
      {
        url: "/og-image-v2.jpg",
        width: 1200,
        height: 630,
        alt: "클리닉브릿지 - 글로벌 의료 마케팅",
      },
    ],
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "클리닉브릿지 - 글로벌 의료 마케팅",
    description: "데이터 기반 전략과 검증된 운영으로 글로벌 의료 마케팅의 성과를 설계합니다.",
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
    <html lang="ko" suppressHydrationWarning>
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
          <Suspense fallback={null}>
            <GAProvider />
          </Suspense>
          {children}
        </ClientProviders>
      </body>
    </html>
  )
}
