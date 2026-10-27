"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { Button } from "@/components/common/Button"

export function Hero() {
  return (
    <section className="bg-white pt-0 pb-6 lg:pb-8">
      <div className="relative overflow-hidden shadow-lg">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="/images/hero-bg-1.webp"
            alt="Hero background"
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
        </div>

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/60" />

        <div className="relative z-10 flex items-center min-h-[602px] lg:min-h-[714px] py-8 lg:py-10 px-6 lg:px-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-2xl mx-auto"
          >
            <h1
              className="font-bold text-white mb-5 text-[36px] sm:text-[44px] lg:text-[54px] leading-[1.3]"
              style={{ wordBreak: "keep-all" }}
            >
              서울대 출신 마케터들과
              <br />
              해외 환자 마케팅을 시작하세요
            </h1>

            <p
              className="text-white/80 font-normal text-base sm:text-lg leading-relaxed"
              style={{ wordBreak: "keep-all" }}
            >
              해외 환자 마케팅, 최고와 함께 하면 다릅니다
            </p>

            <div className="flex justify-center mt-10 sm:mt-12">
              <Button
                asChild
                variant="default"
                size="lg"
                className="h-16 px-12 sm:px-14 text-lg bg-[#D65A3B] hover:bg-[#B84A2E]"
              >
                <Link href="/inquiry" data-meta-placement="hero" className="flex items-center gap-2">
                  문의하기
                  <ChevronRight className="h-5 w-5" />
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
