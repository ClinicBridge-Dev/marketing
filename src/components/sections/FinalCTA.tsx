"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Container } from "@/components/common/Container"
import { Button } from "@/components/common/Button"
import { ResponsiveText } from "@/components/common/ResponsiveText"
import { useMotionAnimation } from "@/lib/hooks/useMotionAnimation"
import { trackButtonClick } from "@/lib/gtag"

export function FinalCTA() {
  const motionProps = useMotionAnimation()

  const handleContactClick = () => {
    trackButtonClick('contact', 'final_cta')
  }

  return (
    <section className="section-padding bg-black">
      <Container>
        <motion.div {...motionProps} className="text-center max-w-4xl mx-auto">
          <ResponsiveText
            mobile="도입 상담 신청"
            desktop="도입 상담 신청"
            as="h2"
            className="text-xl sm:text-2xl font-bold text-white mb-6"
          />

          <ResponsiveText
            mobile="전담 컨설턴트가 직접 방문하여<br />글로벌 환자 유치 전략을 진단해드립니다."
            desktop="전담 컨설턴트가 직접 방문하여 글로벌 환자 유치 전략을 진단해드립니다."
            className="text-sm text-white/90 mb-8 leading-relaxed"
          />

          <Button
            asChild
            onClick={handleContactClick}
            variant="default"
            size="lg"
            className="w-full lg:w-96 lg:px-8 bg-white text-[#C1452D] hover:bg-gray-100 text-lg py-4 font-semibold shadow-lg"
          >
            <Link href="/inquiry">문의하기</Link>
          </Button>
        </motion.div>
      </Container>
    </section>
  )
}
