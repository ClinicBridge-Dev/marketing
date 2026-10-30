"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { Container } from "@/components/common/Container"
import { SectionIntro } from "./SectionIntro"

const MARQUEE_WORDS = ["Clinic Growth Company", "Global GTM Strategy", "Japan", "English-speaking", "Taiwan", "Execution"]

function TextMarquee() {
  const track = [...MARQUEE_WORDS, ...MARQUEE_WORDS]

  return (
    <div className="marquee-row overflow-hidden border-y border-white/10 py-6" aria-hidden>
      <div className="flex w-max animate-marquee-left items-center gap-10" style={{ animationDuration: "50s" }}>
        {track.map((word, i) => (
          <span key={i} className="flex items-center gap-10 whitespace-nowrap">
            <span
              className={
                i % 2
                  ? "font-serif italic text-5xl sm:text-6xl text-white/70"
                  : "text-5xl sm:text-6xl font-semibold tracking-[-0.03em] text-transparent [-webkit-text-stroke:1px_rgba(255,255,255,0.3)]"
              }
            >
              {word}
            </span>
            <span className="h-1.5 w-1.5 rounded-full bg-[#D65A3B]" />
          </span>
        ))}
      </div>
    </div>
  )
}

export function PartnershipCta() {
  return (
    <section className="bg-[#0A0A0A] pt-24 lg:pt-32 pb-16 text-white">
      <Container>
        <div className="flex flex-col gap-12 lg:flex-row lg:items-end lg:justify-between">
          <SectionIntro
            tone="dark"
            eyebrow="Let's grow"
            accent="together"
            lines={["클리닉브릿지와의 파트너십으로", "클리닉을 성장시켜보세요."]}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <Link
              href="/inquiry"
              data-meta-placement="partnership_cta"
              className="group flex h-40 w-40 sm:h-44 sm:w-44 shrink-0 flex-col items-center justify-center gap-2 rounded-full bg-[#D65A3B] text-center font-semibold transition-all duration-500 hover:scale-105 hover:bg-[#B84A2E]"
            >
              <ArrowUpRight className="h-6 w-6 transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1" />
              <span className="text-base leading-snug">
                파트너십
                <br />
                문의하기
              </span>
            </Link>
          </motion.div>
        </div>
      </Container>

      <div className="mt-20 lg:mt-28">
        <TextMarquee />
      </div>
    </section>
  )
}
