"use client"

import Link from "next/link"
import Image from "next/image"
import { Mail, Phone, MapPin } from "lucide-react"
import { Logo } from "@/components/common/Logo"
import { Container } from "@/components/common/Container"

export function Footer() {
  return (
    <footer className="bg-black text-white">
      <Container>
        <div className="py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Company Info */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="relative h-9 w-9 shrink-0">
                  <Image
                    src="/images/snu_ui_download.png"
                    alt="서울대학교"
                    fill
                    className="object-contain"
                    style={{ filter: "brightness(0) invert(1)" }}
                  />
                </div>
                <Logo size="lg" variant="light" className="text-white" />
              </div>
              <p className="text-gray-300 mb-6 max-w-md">
                클리닉브릿지는 글로벌 의료 마케팅 파트너입니다.
                데이터 기반 전략과 검증된 운영으로 의료 마케팅의 성과를 설계합니다.
              </p>
              <div className="space-y-2 text-sm text-gray-300">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>서울 구로구 디지털로31길 12(넥스트데이) 2층</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span>010-2082-3825</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span>cb@clinicbridge.co.kr</span>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-semibold mb-4">바로가기</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/about" className="text-gray-300 hover:text-white transition-colors">
                    회사 소개
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className="text-gray-300 hover:text-white transition-colors">
                    그로스LAB
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-800 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-gray-400">
              ©2026 클리닉브릿지. All rights reserved.
            </p>
            <div className="flex space-x-6 text-sm">
              <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">
                개인정보처리방침
              </Link>
              <Link href="/terms" className="text-gray-400 hover:text-white transition-colors">
                이용약관
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </footer>
  )
}
