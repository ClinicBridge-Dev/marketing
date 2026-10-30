"use client"

import { motion } from "framer-motion"
import { Container } from "@/components/common/Container"
import { TeamIntroduction } from "@/components/sections/TeamIntroduction"
import { PageHero } from "@/components/common/PageHero"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <PageHero
        category="회사 소개"
        title="클리닉브릿지 소개"
        subtitle="클리닉 그로스 컴퍼니"
        image="/images/hero-about.png"
      />

      {/* Team Introduction */}
      <TeamIntroduction />

      {/* CEO Profile — 2-column layout */}
      <section className="section-padding bg-white">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl mx-auto"
          >
            {/* Text */}
            <div>
              {/* Label */}
              <p className="text-sm text-[#C1452D] font-medium mb-6 flex items-center gap-2">
                <span className="w-1 h-5 bg-[#C1452D] rounded-full inline-block" />
                클리닉브릿지. 이은석 대표
              </p>

              {/* Headline */}
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-8 leading-tight" style={{ wordBreak: 'keep-all' }}>
                마케팅은 소비가 아닌<br />
                투자입니다.
              </h2>

              {/* Quotes */}
              <p className="text-base font-semibold text-gray-800 mb-2" style={{ wordBreak: 'keep-all' }}>
                &ldquo;서울대 경영대 출신 컨설턴트가 전담 전략을 설계합니다.&rdquo;
              </p>
              <p className="text-base font-semibold text-gray-800 mb-8" style={{ wordBreak: 'keep-all' }}>
                &ldquo;고성과 ROI를 검증된 데이터로 입증합니다.&rdquo;
              </p>

              {/* Description */}
              <div className="space-y-4 text-gray-600 text-[15px] leading-relaxed mb-10" style={{ wordBreak: 'keep-all' }}>
                <p>
                  데이터 기반 의사결정으로 글로벌 성장을 이끄는
                  클리닉브릿지 대표 이은석입니다. 서울대학교 경영대학을 졸업하고
                  10년 이상의 글로벌 마케팅 경험을 바탕으로,
                  일본을 비롯한 글로벌 시장에서 지속 가능한 성과를 만들 수 있도록 함께하고 있습니다.
                </p>
                <p>
                  대규모 캠페인을 직접 설계·운영해 온 경험을 토대로
                  글로벌 의료 마케팅을 책임지겠습니다.
                </p>
                <p>
                  도입 검토 단계에서 부담 없이 문의해 주세요.
                  초기 진단만으로도 성장 기회를 구체화해드리겠습니다.
                </p>
              </div>

              {/* <Button onClick={openContact} variant="default" size="lg">
                10초 문의하기
              </Button> */}
            </div>

            {/* Image (commented out)
            <div className="flex items-center justify-center">
              <div className="relative w-full max-w-[12.6rem] aspect-[3/4] rounded-2xl overflow-hidden">
                <Image
                  src="/images/profiles/ceo_profile.jpg"
                  alt="이은석 대표"
                  fill
                  quality={95}
                  priority
                  className="object-cover object-center"
                  sizes="(max-width: 1024px) 100vw, 202px"
                />
              </div>
            </div>
            */}
          </motion.div>
        </Container>
      </section>
    </div>
  )
}
