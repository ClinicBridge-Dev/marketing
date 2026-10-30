"use client"

import { useRef } from "react"
import { motion, MotionValue, useScroll, useTransform } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { ArrowUpRight, ChevronRight } from "lucide-react"
import { Container } from "@/components/common/Container"
import { useStaggeredAnimation } from "@/lib/hooks/useMotionAnimation"
import { cn } from "@/lib/utils"
import { TEAM_MEMBERS } from "@/data/team"
import { GrowthDashboard } from "./dashboard/GrowthDashboard"
import { STRATEGY_INTRO, StrategyCases } from "./StrategyCases"

// ─────────────────────────────────────────────────────────────
// 역량 섹션: 대형 인덱스 + 스크롤 스택 패널
// 데스크톱(lg, 화면 높이 760px 이상)에서는 각 역량이 헤더 아래에 붙는 풀스크린 패널이 되고,
// 다음 패널이 위로 덮으며 올라오는 동안 이전 패널은 살짝 축소, 어두워진다.
// 그 외 환경에서는 패널이 일반 블록처럼 차례로 쌓인다.
// ─────────────────────────────────────────────────────────────

type Tone = "light" | "paper" | "dark"

interface Capability {
  id: string
  en: string
  ko: string
  title: string
  description: React.ReactNode
  tone: Tone
}

const CAPABILITIES: Capability[] = [
  {
    id: "cap-growth-team",
    en: "Growth Team",
    ko: "전담 그로스팀",
    title: "우리 병원의 성장을 이끄는 전담 그로스팀",
    description: "서울대 출신 전략, 마케팅 전문가들이 우리 병원의 성장 전략부터 마케팅 실행까지 함께합니다.",
    tone: "light",
  },
  {
    id: "cap-strategy",
    en: "Strategy & Execution",
    ko: "탁월한 전략과 실행",
    title: "병원의 강점을 매출로 연결하는 전략",
    description: (
      <>
        우리 병원의 예산과 시장 내 포지셔닝, 병원 자산을 가장 효율적으로 레버리지해{" "}
        <span className="font-semibold text-[#0A0A0A] underline decoration-[#C1452D]/50 decoration-2 underline-offset-4">
          매출을 만드는 엔진을 구축
        </span>
        합니다.
      </>
    ),
    tone: "paper",
  },
  {
    id: "cap-data",
    en: "Data Intelligence",
    ko: "체계적인 데이터 분석",
    title: "감이 아닌 데이터로 판단합니다",
    description:
      "깊이가 낮은 흔한 데이터의 나열이 아닙니다. 업계 최상위 VC와 스타트업이 쓰는 지표 프레임워크로 돈이 벌리는 구조를 Break-down하고, 그 중 핵심인 Lever을 도출하여, 우리 병원의 다음 성장을 설계합니다.",
    tone: "dark",
  },
]

const TONE_CLASS: Record<Tone, string> = {
  light: "bg-white text-[#0A0A0A] border border-black/[0.08]",
  paper: "bg-[#F6F5F2] text-[#0A0A0A]",
  dark: "bg-[#0A0A0A] text-white",
}

// 섹션 도입부의 대형 역량 목록. 연한 회색으로 두고 호버 시 진해지며, 클릭하면 해당 패널로 이동한다.
function CapabilityIndex() {
  const stagger = useStaggeredAnimation(CAPABILITIES.length, 0.1)

  return (
    <div className="mb-16 lg:mb-24">
      <p className="text-lg sm:text-xl text-[#0A0A0A]" style={{ wordBreak: "keep-all" }}>
        우리 병원의 성장을 만드는{" "}
        <span className="font-serif italic text-[1.5em] leading-none text-[#C1452D]">3</span>가지 역량
      </p>
      <ul className="mt-8">
        {CAPABILITIES.map((c, i) => (
          <motion.li key={c.id} {...stagger(i)}>
            <a
              href={`#${c.id}`}
              className="group flex items-baseline gap-4 py-1 text-gray-300 transition-colors duration-300 hover:text-[#0A0A0A]"
            >
              <span className="text-[40px] sm:text-[64px] lg:text-[84px] font-semibold leading-[1.1] tracking-[-0.04em]">
                {c.en}
              </span>
              <ChevronRight className="h-6 w-6 sm:h-8 sm:w-8 shrink-0 self-center -translate-x-2 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100 text-[#C1452D]" />
              <span className="hidden sm:inline text-sm text-gray-400 transition-colors group-hover:text-[#C1452D]">{c.ko}</span>
            </a>
          </motion.li>
        ))}
      </ul>
    </div>
  )
}

// ── 패널 본문 ───────────────────────────────────────────────

function TeamGridCompact() {
  return (
    <ul className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
      {TEAM_MEMBERS.map((member) => (
        <li key={member.name} className="group">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-[#F6F5F2]">
            <Image
              src={member.photo}
              alt={member.name}
              fill
              className="object-cover object-[50%_25%] transition-transform duration-500 group-hover:scale-[1.03]"
              sizes="(max-width: 640px) 50vw, 20vw"
            />
          </div>
          <p className="mt-2.5 text-sm font-bold">{member.name}</p>
          <p className="text-xs text-gray-500">{member.role}</p>
        </li>
      ))}
    </ul>
  )
}

function GrowthLabLink() {
  return (
    <Link href="/blog" className="group mt-8 inline-flex items-center gap-1.5 text-sm font-semibold text-[#C1452D]">
      그로스LAB 리서치 보러가기
      <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
    </Link>
  )
}

const PANEL_BODY: Record<string, React.ReactNode> = {
  "cap-growth-team": <TeamGridCompact />,
  "cap-strategy": <StrategyCases />,
}

// Data Intelligence 패널: 상단에 짧은 소개, 나머지 공간 전체를 대시보드로 채운다.
function DataPanelBody({ capability: c }: { capability: Capability }) {
  return (
    <div className="mt-5 flex min-h-0 flex-1 flex-col gap-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between lg:gap-10">
        <div className="shrink-0">
          <p className="text-[40px] sm:text-[48px] font-semibold leading-none tracking-[-0.04em]">{c.en}</p>
          <p className="mt-2 text-sm font-semibold text-[#F08A6E]">{c.ko}</p>
        </div>
        <div className="max-w-2xl" style={{ wordBreak: "keep-all" }}>
          <h3 className="text-lg sm:text-xl font-bold">{c.title}</h3>
          <p className="mt-1 text-sm leading-relaxed text-white/60">{c.description}</p>
        </div>
      </div>
      {/* 고정 높이 패널(sticky)에서는 남은 높이를 채우고, 그 외에는 캔버스 비율로 높이를 잡는다 */}
      <div className="aspect-[1200/675] w-full lg:[@media(min-height:760px)]:aspect-auto lg:[@media(min-height:760px)]:min-h-0 lg:[@media(min-height:760px)]:flex-1">
        <GrowthDashboard />
      </div>
    </div>
  )
}

// ── 스택 패널 ───────────────────────────────────────────────

interface PanelProps {
  capability: Capability
  index: number
  total: number
  progress: MotionValue<number>
}

function CapabilityPanel({ capability: c, index, total, progress }: PanelProps) {
  const dark = c.tone === "dark"
  const isLast = index === total - 1
  // 다음 패널이 덮어오는 구간(i → i+1)에서 축소와 어둡게
  const range = [index / (total - 1), (index + 1) / (total - 1)]
  const scale = useTransform(progress, range, [1, isLast ? 1 : 0.93])
  const dim = useTransform(progress, range, [0, isLast ? 0 : 0.35])

  return (
    <div
      id={c.id}
      className={cn(
        "scroll-mt-[var(--header-h,64px)] mb-6 lg:mb-0",
        "lg:[@media(min-height:760px)]:sticky lg:[@media(min-height:760px)]:top-[calc(var(--header-h,64px)+16px)]",
        "lg:[@media(min-height:760px)]:h-[calc(100vh-var(--header-h,64px)-32px)] lg:[@media(min-height:760px)]:mb-8"
      )}
    >
      <motion.article
        style={{ scale, transformOrigin: "50% 0%" }}
        className={cn(
          "relative flex h-full flex-col overflow-hidden rounded-[28px] shadow-[0_-12px_40px_-20px_rgba(0,0,0,0.25)]",
          c.id === "cap-data" ? "p-5 sm:p-8 lg:px-10 lg:py-8" : "p-6 sm:p-10 lg:p-12",
          TONE_CLASS[c.tone]
        )}
      >
        <motion.div aria-hidden style={{ opacity: dim }} className="pointer-events-none absolute inset-0 z-10 bg-black" />

        {/* 상단 바: 진행 표시 */}
        <div className={cn("flex items-center justify-between text-sm", dark ? "text-white/50" : "text-gray-400")}>
          <span className="tabular-nums">
            <span className={dark ? "text-[#F08A6E]" : "text-[#C1452D]"}>{String(index + 1).padStart(2, "0")}</span>
            {" "}/ {String(total).padStart(2, "0")}
          </span>
          <span className="flex gap-1.5" aria-hidden>
            {Array.from({ length: total }, (_, i) => (
              <span
                key={i}
                className={cn(
                  "h-1 rounded-full transition-all",
                  i === index ? "w-8 bg-current" : "w-3",
                  i === index ? (dark ? "text-[#D65A3B]" : "text-[#C1452D]") : dark ? "bg-white/15" : "bg-black/10"
                )}
              />
            ))}
          </span>
        </div>

        {c.id === "cap-data" ? (
          <DataPanelBody capability={c} />
        ) : (
        <div className="mt-8 grid flex-1 gap-10 lg:grid-cols-12 lg:items-center lg:gap-12">
          <div className="lg:col-span-4">
            <p className="text-[40px] sm:text-[56px] lg:text-[60px] font-semibold leading-[1.05] tracking-[-0.04em]">{c.en}</p>
            <p className={cn("mt-3 text-sm font-semibold", dark ? "text-[#F08A6E]" : "text-[#C1452D]")}>{c.ko}</p>
            <h3 className="mt-8 text-xl sm:text-2xl font-bold leading-snug" style={{ wordBreak: "keep-all" }}>
              {c.title}
            </h3>
            <p className={cn("mt-3 text-sm sm:text-base leading-relaxed", dark ? "text-white/60" : "text-gray-600")} style={{ wordBreak: "keep-all" }}>
              {c.description}
            </p>
            {c.id === "cap-strategy" && (
              <>
                <p className="mt-4 border-l-2 border-[#C1452D] pl-3 text-sm font-medium leading-relaxed text-[#0A0A0A]" style={{ wordBreak: "keep-all" }}>
                  {STRATEGY_INTRO}
                </p>
                <GrowthLabLink />
              </>
            )}
          </div>
          <div className="lg:col-span-8">{PANEL_BODY[c.id]}</div>
        </div>
        )}
      </motion.article>
    </div>
  )
}

export function Capabilities() {
  const stackRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: stackRef, offset: ["start start", "end end"] })

  return (
    <section className="bg-white pt-24 lg:pt-32 pb-16 lg:pb-24">
      <Container>
        <CapabilityIndex />
        <div ref={stackRef}>
          {CAPABILITIES.map((c, i) => (
            <CapabilityPanel key={c.id} capability={c} index={i} total={CAPABILITIES.length} progress={scrollYProgress} />
          ))}
        </div>
      </Container>
    </section>
  )
}
