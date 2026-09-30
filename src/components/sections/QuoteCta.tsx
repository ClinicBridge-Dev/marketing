"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Container } from "@/components/common/Container"
import { Button } from "@/components/common/Button"
import { useMotionAnimation } from "@/lib/hooks/useMotionAnimation"

interface QuoteCtaProps {
  title?: string
}

export function QuoteCta({ title = "정확한 견적이 필요하신가요?" }: QuoteCtaProps) {
  const motionProps = useMotionAnimation()

  return (
    <section className="section-padding py-28 lg:py-40 bg-gray-100">
      <Container>
        <motion.div {...motionProps} className="text-center max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4" style={{ wordBreak: "keep-all" }}>
            {title}
          </h2>
          <p className="text-gray-600 mb-8 leading-relaxed" style={{ wordBreak: "keep-all" }}>
            병원 상황에 맞는 구성과 견적을 상담을 통해 안내해 드립니다.
          </p>
          <Button
            asChild
            variant="default"
            size="lg"
            className="bg-[#C1452D] text-white hover:bg-[#A23A24] shadow-lg font-semibold"
          >
            <Link href="/inquiry">문의하기</Link>
          </Button>
        </motion.div>
      </Container>
    </section>
  )
}
