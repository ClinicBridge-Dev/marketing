"use client"

import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import { Menu } from "lucide-react"
import { Logo } from "@/components/common/Logo"
import { Button } from "@/components/common/Button"
import { Container } from "@/components/common/Container"
import { MobileNav } from "./MobileNav"
import { trackButtonClick } from "@/lib/gtag"

const navigation = [
  { name: "홈", href: "/" },
  { name: "가격", href: "/pricing" },
  { name: "블로그", href: "/blog" },
]

interface HeaderProps {
  onMobileNavStateChange?: (open: boolean) => void
  topOffset?: number
}

export function Header({ onMobileNavStateChange, topOffset = 0 }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleContactClick = () => {
    trackButtonClick("contact", "header")
  }

  const handleMobileMenuToggle = (open: boolean) => {
    setMobileMenuOpen(open)
    onMobileNavStateChange?.(open)
  }

  return (
    <header
      className="fixed left-0 right-0 z-50 bg-white border-b border-gray-200"
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
                style={{ filter: "brightness(0)" }}
              />
            </div>
            <Logo size="md" variant="dark" />
          </div>

          <nav className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-gray-900 hover:text-[#C1452D] transition-colors font-medium"
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
              className="p-2 text-gray-900"
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
