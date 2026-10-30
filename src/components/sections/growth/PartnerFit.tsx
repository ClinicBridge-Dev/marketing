"use client"

import { motion } from "framer-motion"
import { Check } from "lucide-react"
import { Container } from "@/components/common/Container"
import { useMotionAnimation, useStaggeredAnimation } from "@/lib/hooks/useMotionAnimation"
import { SectionIntro } from "./SectionIntro"

const CRITERIA = [
  "해외환자 유치를 병원의 지속적인 성장 과제로 추진하는 병원",
  "목표에 필요한 마케팅 예산과 운영 자원을 함께 투입할 수 있는 병원",
  "성과 데이터를 공유하고, 개선안을 함께 실행할 수 있는 병원",
]

export function PartnerFit() {
  const fade = useMotionAnimation()
  const stagger = useStaggeredAnimation(CRITERIA.length, 0.12)

  return (
    <section className="bg-[#F6F5F2] py-24 lg:py-32">
      <Container>
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <SectionIntro
              eyebrow="Selective"
              accent="Partnership"
              lines={["모든 병원과", "함께하지는", "않습니다."]}
              description="전담팀이 깊이 관여하는 만큼, 성장 목표와 실행 여건이 맞는 병원과 파트너십을 시작합니다."
            />
          </div>

          <div className="lg:col-span-7 lg:pt-14">
            <ul className="space-y-3">
              {CRITERIA.map((c, i) => (
                <motion.li key={c} {...stagger(i)} className="flex items-start gap-4 rounded-2xl bg-white p-5 sm:p-6">
                  <Check className="mt-1 h-4 w-4 shrink-0 text-[#C1452D]" strokeWidth={3} />
                  <p className="text-base sm:text-lg font-medium text-[#0A0A0A]" style={{ wordBreak: "keep-all" }}>
                    {c}
                  </p>
                </motion.li>
              ))}
            </ul>

            <motion.div {...fade} className="mt-8 border-t border-black/[0.08] pt-6" style={{ wordBreak: "keep-all" }}>
              <p className="font-semibold text-[#0A0A0A]">서로 윈윈하는 구조를 지향합니다.</p>
              <p className="mt-1 text-sm sm:text-base text-gray-600 leading-relaxed">
                병원의 현재 상황과 목표를 검토하고, 필요한 투자와 실행 방향을 함께 논의합니다.
                병원과 클리닉브릿지의 이해관계가 같은 방향을 향할 때 파트너십을 시작합니다.
              </p>
            </motion.div>
          </div>
        </div>
      </Container>
    </section>
  )
}
