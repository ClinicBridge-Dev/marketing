"use client"

import { motion } from "framer-motion"
import { Container } from "@/components/common/Container"
import { CountUp } from "@/components/common/CountUp"
import { useStaggeredAnimation } from "@/lib/hooks/useMotionAnimation"
import { GROWTH_YEAR, MONTHLY_PATIENTS, summarizeGrowth } from "@/data/growthMetrics"
import { GrowthChart } from "./GrowthChart"
import { ProofCases } from "./ProofCases"
import { SectionIntro } from "./SectionIntro"

const summary = summarizeGrowth()

const KPIS = [
  { label: `${summary.latestActual.label} 예약자 수`, value: summary.latestActual.value, suffix: "명" },
  { label: `${summary.firstActual.label} 대비 성장`, value: summary.growthSinceFirst * 100, prefix: "+", suffix: "%" },
  { label: "월평균 성장률", value: summary.avgMonthlyGrowth * 100, prefix: "+", suffix: "%", decimals: 1 },
  { label: `${summary.yearEndForecast.label} 예상`, value: summary.yearEndForecast.value, suffix: "명" },
]

export function GrowthMetrics() {
  const stagger = useStaggeredAnimation(KPIS.length)

  return (
    <section id="growth" className="scroll-mt-16 bg-white py-24 lg:py-32">
      <Container>
        <SectionIntro
          eyebrow="Proof in"
          accent="Numbers"
          lines={[
            // 첫 줄은 도입 문구라 한 단계 작고 연하게 두어 둘째 줄(성과)에 시선이 가게 한다
            <span key="lead" className="text-[0.75em] font-semibold text-gray-600">숫자로 확인하는</span>,
            "클리닉브릿지 해외환자유치 성과",
          ]}
          description={
            <>
              빠르게 성장하는 클리닉브릿지의{" "}
              <span className="text-[#C1452D] underline decoration-[#C1452D]/30 decoration-[6px] underline-offset-[6px]">
                그로스 엔진
              </span>
              에 탑승하세요.
            </>
          }
          descriptionClassName="mt-8 text-xl sm:text-2xl font-semibold text-[#0A0A0A]"
          className="mb-12 lg:mb-16 max-w-5xl"
        />

        <div className="rounded-2xl border border-black/[0.08] p-5 sm:p-8 lg:p-10">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-[#0A0A0A]">클리닉브릿지 월별 해외환자 예약자 수 현황</h3>
              <p className="mt-1 text-xs sm:text-sm text-gray-500" style={{ wordBreak: "keep-all" }}>
                {GROWTH_YEAR}년 1월~12월, 단위: 명 (계약 클라이언트 예약 기준, 취소, 노쇼 미포함)
              </p>
            </div>
            <div className="flex items-center gap-5 text-xs text-gray-500">
              <span className="flex items-center gap-2">
                <span className="h-0.5 w-5 bg-[#C1452D]" /> 실적
              </span>
              <span className="flex items-center gap-2">
                <span className="w-5 border-t-2 border-dashed border-[#C1452D]/60" /> 예상
              </span>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {KPIS.map((kpi, i) => (
              <motion.div key={kpi.label} {...stagger(i)} className="rounded-xl bg-[#F6F5F2] px-4 py-4 sm:px-5 sm:py-5">
                <p className="text-xs sm:text-sm text-gray-500">{kpi.label}</p>
                <CountUp
                  value={kpi.value}
                  prefix={kpi.prefix}
                  suffix={kpi.suffix}
                  decimals={kpi.decimals}
                  className="mt-1 block text-2xl sm:text-3xl font-bold tabular-nums text-[#0A0A0A]"
                />
              </motion.div>
            ))}
          </div>

          <div className="mt-8">
            <GrowthChart data={MONTHLY_PATIENTS} />
          </div>

          <p className="mt-4 text-right text-[11px] sm:text-xs text-gray-500">출처: 클리닉브릿지</p>
        </div>

        <div className="mt-4 sm:mt-6">
          <ProofCases />
        </div>
      </Container>
    </section>
  )
}
