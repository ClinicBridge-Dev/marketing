"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { cn } from "@/lib/utils"

// 성과 섹션 하단의 대표 사례 카드 2종.
// 수치와 기간처럼 확인된 사실만 시각화한다 (월별 추이처럼 없는 데이터는 그리지 않는다).
// 실제 캡처(X 게시물, 애널리틱스, 매출 대시보드 등)가 생기면 media 에 경로를 넣으면 카드 상단에 노출된다.

const EASE = [0.22, 1, 0.36, 1] as const

interface ProofCase {
  key: string
  client: string
  tags: string[]
  headline: string
  metric: string
  metricLabel: string
  note?: string
  /** 실제 캡처 이미지 경로 (없으면 기본 시각화만 노출) */
  media?: { src: string; alt: string }
  visual: React.ReactNode
}

// 6개월 집행 기간을 6칸으로 표시하고, 마지막에 누적 결과를 붙인다
function ViralPeriodVisual() {
  return (
    <div>
      <div className="flex items-center gap-1.5">
        {Array.from({ length: 6 }, (_, i) => (
          <motion.span
            key={i}
            className="h-2 flex-1 rounded-full bg-[#D65A3B]"
            style={{ opacity: 0.35 + (i / 5) * 0.65, transformOrigin: "left" }}
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 + i * 0.12, ease: EASE }}
          />
        ))}
      </div>
      <div className="mt-2 flex justify-between text-[11px] text-white/45 tabular-nums">
        <span>1개월</span>
        <span>6개월 누적</span>
      </div>
    </div>
  )
}

// 계약(2026.03) 시점부터 달성(2026.09)까지 7개월 타임라인
const TIMELINE = ["03", "04", "05", "06", "07", "08", "09"]

function ZeroToOneVisual() {
  return (
    <div>
      <div className="relative">
        <div className="h-px w-full bg-white/15" />
        <motion.div
          className="absolute left-0 top-0 h-px w-full bg-[#D65A3B]"
          style={{ transformOrigin: "left" }}
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, delay: 0.2, ease: EASE }}
        />
        <div className="absolute inset-x-0 -top-[5px] flex justify-between">
          {TIMELINE.map((m, i) => {
            const edge = i === 0 || i === TIMELINE.length - 1
            return (
              <motion.span
                key={m}
                className={cn(
                  "block rounded-full",
                  edge ? "h-[11px] w-[11px] bg-[#D65A3B] ring-4 ring-[#D65A3B]/20" : "mt-[3px] h-[5px] w-[5px] bg-white/50"
                )}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 + i * 0.15 }}
              />
            )
          })}
        </div>
      </div>
      <div className="mt-4 flex justify-between text-[11px] tabular-nums">
        <span className="text-white/70">
          26.03 계약
          <span className="block text-white/40">월 매출 0원</span>
        </span>
        <span className="self-end text-white/40">7개월</span>
        <span className="text-right text-white/70">
          26.09 달성
          <span className="block text-[#F08A6E]">월 매출 5억 원</span>
        </span>
      </div>
    </div>
  )
}

const CASES: ProofCase[] = [
  {
    key: "diet",
    client: "다이어트 클리닉",
    tags: ["일본", "X 채널", "Viral"],
    headline: "일본 X 채널 바이럴 성과",
    metric: "2,000만회+",
    metricLabel: "6개월 간 누적 조회수",
    visual: <ViralPeriodVisual />,
  },
  {
    key: "zero-to-one",
    client: "B 클리닉",
    tags: ["영미권", "Zero to One"],
    headline: "영미권 제로 투 월 매출 5억 원 달성",
    metric: "0 → 5억 원",
    metricLabel: "계약 7개월 만의 월 매출",
    note: "*2026년 9월 기준 (계약 시점 2026년 3월, 7개월 경과 성과)",
    visual: <ZeroToOneVisual />,
  },
]

function ChannelMark({ tags }: { tags: string[] }) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-white/50">
      {tags.map((t, i) => (
        <span key={t} className="flex items-center gap-3">
          {i > 0 && <span className="h-3 w-px bg-white/20" />}
          {t === "X 채널" ? (
            <span className="flex items-center gap-1.5">
              <Image src="/images/x.png" alt="" width={12} height={12} className="invert" />
              X 채널
            </span>
          ) : (
            t
          )}
        </span>
      ))}
    </div>
  )
}

export function ProofCases() {
  return (
    <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
      {CASES.map((c, i) => (
        <motion.article
          key={c.key}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, delay: i * 0.12, ease: EASE }}
          className="flex flex-col overflow-hidden rounded-2xl bg-[#0A0A0A] text-white"
        >
          {c.media && (
            <div className="relative aspect-[16/9] w-full">
              <Image src={c.media.src} alt={c.media.alt} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" />
            </div>
          )}

          <div className="flex flex-1 flex-col p-6 sm:p-8 lg:p-10">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold">{c.client}</p>
                <div className="mt-2">
                  <ChannelMark tags={c.tags} />
                </div>
              </div>
              <span className="text-xs tabular-nums text-white/35">Case {String(i + 1).padStart(2, "0")}</span>
            </div>

            <p className="mt-10 text-base sm:text-lg text-white/70" style={{ wordBreak: "keep-all" }}>
              {c.headline}
            </p>
            <p className="mt-2 text-5xl sm:text-6xl font-bold tracking-[-0.04em]">{c.metric}</p>
            <p className="mt-2 text-sm text-[#F08A6E]">{c.metricLabel}</p>

            <div className="mt-10 lg:mt-auto lg:pt-10">{c.visual}</div>

            {c.note && <p className="mt-6 text-[11px] text-white/35">{c.note}</p>}
          </div>
        </motion.article>
      ))}
    </div>
  )
}
