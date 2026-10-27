"use client"

import { useEffect, useState } from "react"
import { Toaster } from "react-hot-toast"
import { ContactProvider } from "./ContactProvider"
import { MetaTracking } from "./MetaTracking"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { InquiryDialog } from "@/components/forms/InquiryDialog"
import { TopBanner, TOP_BANNER_HEIGHT, isTopBannerDismissed } from "@/components/layout/TopBanner"

interface ClientProvidersProps {
  children: React.ReactNode
}

export function ClientProviders({ children }: ClientProvidersProps) {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)
  const [isBannerVisible, setIsBannerVisible] = useState(false)

  // 세션 중 배너를 닫았으면 다시 띄우지 않는다 (SSR 시엔 항상 숨김 → mount 후 판단)
  useEffect(() => {
    setIsBannerVisible(!isTopBannerDismissed())
  }, [])

  // MobileNav 상태를 감지하는 함수
  const handleMobileNavStateChange = (open: boolean) => {
    setIsMobileNavOpen(open)
  }

  const headerOffset = isBannerVisible ? TOP_BANNER_HEIGHT : 0

  return (
    <ContactProvider>
      <MetaTracking />
      {isBannerVisible && <TopBanner onDismiss={() => setIsBannerVisible(false)} />}
      <Header onMobileNavStateChange={handleMobileNavStateChange} topOffset={headerOffset} />
      <main className={`transition-all duration-300 ${
        isBannerVisible ? 'pt-[104px]' : 'pt-16'
      } ${isMobileNavOpen ? 'blur-sm bg-black/20' : ''}`}>
        {children}
      </main>
      <Footer />
      <InquiryDialog />
      <Toaster 
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </ContactProvider>
  )
}
