"use client"

import { useEffect, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Container } from "@/components/common/Container"
import { MARKET_ROTATE_MS, TARGET_MARKETS } from "@/data/markets"
import { GlobeCanvas } from "./GlobeCanvas"
import { ShaderBackground } from "./ShaderBackground"

const EASE = [0.22, 1, 0.36, 1] as const

// 시장명을 글자 단위로 굴리는 키네틱 타이포. 라벨 폭을 미리 재서 width 만 보간해 뒤 문구가 튀지 않게 한다.
// 검색엔진과 화면낭독기에는 sr-only 라벨 하나만 텍스트로 남기고, 화면용 글자 조각, 폭 측정용 문구는
// data-text + ::before 로 그려 DOM 텍스트에 섞이지 않게 한다 ("일본 일 본 일본영미권대만" 처럼 읽히는 문제 방지).
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
        <span className="sr-only">{label}</span>
        <span aria-hidden data-text={label} className="invisible whitespace-nowrap before:content-[attr(data-text)]" />
        <AnimatePresence initial={false}>
          <motion.span key={label} aria-hidden className="absolute left-0 top-0 flex whitespace-nowrap">
            {Array.from(label).map((ch, i) => (
              <motion.span
                key={i}
                data-text={ch}
                className="inline-block before:content-[attr(data-text)]"
                initial={{ y: "105%" }}
                animate={{ y: 0, transition: { duration: 0.7, delay: 0.12 + i * 0.05, ease: EASE } }}
                exit={{ y: "-105%", transition: { duration: 0.5, delay: i * 0.04, ease: EASE } }}
              />
            ))}
          </motion.span>
        </AnimatePresence>
      </motion.span>
      <span aria-hidden className="pointer-events-none absolute -left-[9999px] invisible">
        {TARGET_MARKETS.map((m, i) => (
          <span
            key={m.key}
            ref={(el) => { measureRefs.current[i] = el }}
            data-text={m.label}
            className="whitespace-nowrap before:content-[attr(data-text)]"
          />
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
      {/* 배경 레이어: 셰이더 → 인바운드 지구본 → 좌측 스크림 (텍스트 가독성) */}
      <div aria-hidden className="absolute inset-0 -z-10">
        <ShaderBackground className="absolute inset-0 h-full w-full" />
        <GlobeCanvas activeIndex={index} className="absolute inset-0 h-full w-full opacity-60 md:opacity-100" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0A]/90 via-[#0A0A0A]/40 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#0A0A0A] to-transparent" />
      </div>

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
            className="py-12 font-semibold text-[44px] leading-[1.08] sm:text-[72px] lg:text-[104px] tracking-[-0.045em]"
            style={{ wordBreak: "keep-all" }}
          >
            <motion.span {...enter(0.1)} className="block">
              <RollingMarket index={index} /> 환자가
            </motion.span>
            <motion.span {...enter(0.2)} className="block">먼저 찾는 클리닉을</motion.span>
            <motion.span {...enter(0.3)} className="block text-white/45">만듭니다.</motion.span>
          </h1>

          {/* 하단 행: 좌측 소개 문장 + CTA, 우측 하단 시장 선택기 */}
          <motion.div
            {...enter(0.45)}
            className="grid gap-10 border-t border-white/15 pt-8 lg:grid-cols-12 lg:items-end lg:gap-6"
          >
            <div className="lg:col-span-8">
              <p
                className="text-lg sm:text-xl lg:text-2xl font-medium leading-relaxed text-white/80"
                style={{ wordBreak: "keep-all" }}
              >
                24/7, 우리 병원의 전략 수립부터 마케팅, 상담, 예약 전환까지.
                <br className="hidden sm:block" />{" "}
                <strong className="font-semibold text-[#D65A3B]">클리닉브릿지</strong>가 해외환자 매출을 책임지는 인하우스{" "}
                <strong className="font-semibold text-[#D65A3B]">전담 그로스 팀</strong>이 됩니다.
              </p>
              <Link
                href="/inquiry"
                data-meta-placement="hero"
                className="group mt-8 inline-flex h-14 items-center gap-3 rounded-full bg-[#D65A3B] pl-7 pr-2 text-base font-semibold text-white transition-colors hover:bg-[#B84A2E]"
              >
                파트너십 문의하기
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 transition-transform duration-300 group-hover:translate-x-0.5">
                  <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            </div>

            <ol className="flex gap-6 sm:gap-8 lg:col-span-4 lg:justify-self-end" aria-label="타깃 시장">
              {TARGET_MARKETS.map((m, i) => {
                const active = i === index
                return (
                  <li key={m.key} className="w-20 sm:w-24">
                    <button
                      type="button"
                      onClick={() => setIndex(i)}
                      aria-pressed={active}
                      className={`w-full text-left text-sm transition-colors ${active ? "text-white" : "text-white/50 hover:text-white/70"}`}
                    >
                      <span className="block font-medium">{m.label}</span>
                      <span className="mt-3 block h-px w-full overflow-hidden bg-white/15">
                        {active && (
                          <motion.span
                            key={`bar-${index}`}
                            className="block h-full bg-[#D65A3B]"
                            initial={{ width: "0%" }}
                            animate={{ width: "100%" }}
                            transition={{ duration: MARKET_ROTATE_MS / 1000, ease: "linear" }}
                          />
                        )}
                      </span>
                    </button>
                  </li>
                )
              })}
            </ol>
          </motion.div>
        </div>
      </Container>
    </section>
  )
}
