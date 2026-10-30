"use client"

import Link from "next/link"
import Image from "next/image"
import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { Menu } from "lucide-react"
import { Logo } from "@/components/common/Logo"
import { Button } from "@/components/common/Button"
import { Container } from "@/components/common/Container"
import { MobileNav } from "./MobileNav"
import { trackButtonClick } from "@/lib/gtag"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "홈", href: "/" },
  { name: "그로스LAB", href: "/blog" },
]

interface HeaderProps {
  onMobileNavStateChange?: (open: boolean) => void
  topOffset?: number
}

export function Header({ onMobileNavStateChange, topOffset = 0 }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  // 메인에서는 다크 히어로 위에 있는 동안만 다크 톤, 히어로를 지나면 기본 화이트로 전환
  const isHome = usePathname() === "/"
  const [pastHero, setPastHero] = useState(false)
  const dark = isHome && !pastHero

  useEffect(() => {
    if (!isHome) return
    const update = () => {
      const hero = document.getElementById("hero")
      setPastHero(!hero || hero.getBoundingClientRect().bottom <= topOffset + 64)
    }
    update()
    window.addEventListener("scroll", update, { passive: true })
    return () => window.removeEventListener("scroll", update)
  }, [isHome, topOffset])

  const handleContactClick = () => {
    trackButtonClick("contact", "header")
  }

  const handleMobileMenuToggle = (open: boolean) => {
    setMobileMenuOpen(open)
    onMobileNavStateChange?.(open)
  }

  return (
    <header
      className={cn(
        "fixed left-0 right-0 z-50 border-b transition-colors duration-300",
        dark ? "bg-[#0A0A0A] border-white/10" : "bg-white border-gray-200"
      )}
      style={{ top: topOffset }}
    >
      <Container>
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="relative h-7 w-7 shrink-0">
              <Image
                src="/images/snu_ui_download.png"
                alt="서울대학교"
                fill
                className="object-contain"
                style={{ filter: dark ? "brightness(0) invert(1)" : "brightness(0)" }}
              />
            </div>
            {/* 두 로고를 미리 렌더링해 다크/화이트 전환 시 이미지 로딩 공백이 없게 한다 */}
            <Logo size="md" variant="light" className={dark ? undefined : "hidden"} />
            <Logo size="md" variant="dark" className={dark ? "hidden" : undefined} />
          </div>

          <nav className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "transition-colors font-medium",
                  dark ? "text-white/70 hover:text-white" : "text-gray-900 hover:text-[#C1452D]"
                )}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center">
            <Button asChild onClick={handleContactClick} variant="default" size="sm">
              <Link href="/inquiry" data-meta-placement="header">문의하기</Link>
            </Button>
          </div>

          <div className="md:hidden flex items-center space-x-2">
            <Button asChild onClick={handleContactClick} variant="default" size="sm">
              <Link href="/inquiry" data-meta-placement="header">문의하기</Link>
            </Button>
            <button
              type="button"
              className={cn("p-2", dark ? "text-white" : "text-gray-900")}
              onClick={() => handleMobileMenuToggle(true)}
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </Container>

      <MobileNav
        open={mobileMenuOpen}
        onClose={() => handleMobileMenuToggle(false)}
        navigation={navigation}
      />
    </header>
  )
}
