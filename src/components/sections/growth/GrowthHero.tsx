"use client"

import { useEffect, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Container } from "@/components/common/Container"
import { MARKET_ROTATE_MS, TARGET_MARKETS } from "@/data/markets"
import { ShaderBackground } from "./ShaderBackground"

const EASE = [0.22, 1, 0.36, 1] as const

// 시장명을 글자 단위로 굴리는 키네틱 타이포. 라벨 폭을 미리 재서 width 만 보간해 뒤 문구가 튀지 않게 한다.
function RollingMarket({ index }: { index: number }) {
  const measureRefs = useRef<(HTMLSpanElement | null)[]>([])
  const [widths, setWidths] = useState<number[]>([])
  const label = TARGET_MARKETS[index].label

  useEffect(() => {
    const measure = () => setWidths(measureRefs.current.map((el) => el?.getBoundingClientRect().width ?? 0))
    measure()
    const ro = new ResizeObserver(measure)
    measureRefs.current.forEach((el) => el && ro.observe(el))
    return () => ro.disconnect()
  }, [])

  return (
    <>
      <motion.span
        className="relative inline-block overflow-hidden align-bottom"
        animate={widths[index] ? { width: widths[index] } : undefined}
        transition={{ duration: 0.6, ease: EASE }}
      >
        <span className="invisible whitespace-nowrap">{label}</span>
        <AnimatePresence initial={false}>
          <motion.span key={label} className="absolute left-0 top-0 flex whitespace-nowrap" aria-label={label}>
            {Array.from(label).map((ch, i) => (
              <motion.span
                key={i}
                aria-hidden
                className="inline-block"
                initial={{ y: "105%" }}
                animate={{ y: 0, transition: { duration: 0.7, delay: 0.12 + i * 0.05, ease: EASE } }}
                exit={{ y: "-105%", transition: { duration: 0.5, delay: i * 0.04, ease: EASE } }}
              >
                {ch}
              </motion.span>
            ))}
          </motion.span>
        </AnimatePresence>
      </motion.span>
      <span aria-hidden className="pointer-events-none absolute -left-[9999px] invisible">
        {TARGET_MARKETS.map((m, i) => (
          <span key={m.key} ref={(el) => { measureRefs.current[i] = el }} className="whitespace-nowrap">
            {m.label}
          </span>
        ))}
      </span>
    </>
  )
}

const enter = (delay: number) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.9, delay, ease: EASE },
})

export function GrowthHero() {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const timer = setTimeout(() => setIndex((i) => (i + 1) % TARGET_MARKETS.length), MARKET_ROTATE_MS)
    return () => clearTimeout(timer)
  }, [index])

  return (
    <section id="hero" className="relative isolate overflow-hidden bg-[#0A0A0A] text-white">
      <ShaderBackground className="absolute inset-0 -z-10 h-full w-full" />

      <Container>
        <div className="flex min-h-[calc(100svh-104px)] lg:min-h-[800px] flex-col justify-between pt-8 pb-8 lg:pt-10">
          <motion.div {...enter(0)} className="flex items-start justify-between text-xs sm:text-sm text-white/55">
            <p>
              <span className="text-white">ClinicBridge</span>
              <span className="mx-2 text-white/30">/</span>
              클리닉 그로스 컴퍼니
            </p>
            <p className="hidden sm:block uppercase tracking-[0.18em] text-[11px]">Global GTM Strategy &amp; Execution</p>
          </motion.div>

          <h1
            className="py-16 font-semibold text-[44px] leading-[1.08] sm:text-[72px] lg:text-[104px] tracking-[-0.045em]"
            style={{ wordBreak: "keep-all" }}
          >
            <motion.span {...enter(0.1)} className="block">
              <RollingMarket index={index} /> 환자가
            </motion.span>
            <motion.span {...enter(0.2)} className="block">먼저 찾는 클리닉을</motion.span>
            <motion.span {...enter(0.3)} className="block text-white/45">만듭니다.</motion.span>
          </h1>

          <motion.div
            {...enter(0.45)}
            className="grid gap-8 border-t border-white/15 pt-6 lg:grid-cols-12 lg:gap-6"
          >
            <ol className="flex gap-6 lg:col-span-4" aria-label="타깃 시장">
              {TARGET_MARKETS.map((m, i) => (
                <li key={m.key}>
                  <button
                    type="button"
                    onClick={() => setIndex(i)}
                    aria-pressed={i === index}
                    className={`text-left text-sm transition-colors ${i === index ? "text-white" : "text-white/35 hover:text-white/70"}`}
                  >
                    <span className="block text-[11px] tabular-nums">({String(i + 1).padStart(2, "0")})</span>
                    <span className="mt-1 block font-medium">{m.label}</span>
                  </button>
                </li>
              ))}
            </ol>

            <p className="text-sm sm:text-base leading-relaxed text-white/65 lg:col-span-5" style={{ wordBreak: "keep-all" }}>
              24/7, 우리 병원의 전략 수립부터 마케팅, 상담, 예약 전환까지.
              해외환자 매출을 책임지는 전담 인하우스 그로스 팀이 됩니다.
            </p>

            <div className="lg:col-span-3 lg:justify-self-end">
              <Link
                href="/inquiry"
                data-meta-placement="hero"
                className="group inline-flex h-12 items-center gap-3 rounded-full bg-[#D65A3B] pl-6 pr-2 text-sm font-semibold text-white transition-colors hover:bg-[#B84A2E]"
              >
                파트너십 문의하기
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 transition-transform duration-300 group-hover:translate-x-0.5">
                  <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            </div>
          </motion.div>
        </div>
      </Container>
    </section>
  )
}
