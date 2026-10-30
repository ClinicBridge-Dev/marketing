"use client"

import { useEffect, useRef, useState } from "react"
import { motion, useInView } from "framer-motion"
import { GROWTH_YEAR, MonthlyPatientCount, monthOverMonth } from "@/data/growthMetrics"

// 월별 해외환자 유치 라인 차트 (라이트 테마). 화면에 들어오면 실적 라인이 그려지고, 호버 시 툴팁을 띄운다.
// 실적은 브랜드 컬러 실선과 옅은 영역, 예상은 점선과 음영 구간으로 구분한다.
// 컨테이너 폭을 측정해 px 단위로 그려서 모바일에서도 글자 크기가 유지된다.

const Y_MIN = 1000
const Y_MAX = 5000
const Y_TICKS = [1000, 2000, 3000, 4000, 5000]
const INK = "#0A0A0A"
const ACCENT = "#C1452D"
const EASE = [0.22, 1, 0.36, 1] as const

const nf = new Intl.NumberFormat("ko-KR")
const pct = (v: number) => `${v >= 0 ? "+" : ""}${(v * 100).toFixed(1)}%`

function useElementWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [width, setWidth] = useState(0)

  useEffect(() => {
    if (!ref.current) return
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width))
    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return { ref, width }
}

export function GrowthChart({ data }: { data: MonthlyPatientCount[] }) {
  const { ref, width } = useElementWidth<HTMLDivElement>()
  const [active, setActive] = useState<number | null>(null)
  const inView = useInView(ref, { once: true, margin: "-120px" })

  const compact = width < 640
  const height = compact ? 280 : 380
  const pad = { top: 36, right: compact ? 8 : 16, bottom: 32, left: compact ? 40 : 52 }
  const innerW = Math.max(width - pad.left - pad.right, 0)
  const innerH = height - pad.top - pad.bottom
  const band = innerW / data.length
  const baseline = pad.top + innerH

  const x = (i: number) => pad.left + band * (i + 0.5)
  const y = (v: number) => pad.top + (1 - (v - Y_MIN) / (Y_MAX - Y_MIN)) * innerH

  const lastActual = data.filter((d) => !d.forecast).length - 1
  const pt = (d: MonthlyPatientCount, i: number) => `${x(i)},${y(d.value)}`
  const actual = data.slice(0, lastActual + 1)
  const actualPath = "M" + actual.map(pt).join(" L")
  const forecastPath = "M" + data.slice(lastActual).map((d, i) => pt(d, i + lastActual)).join(" L")
  const areaPath = `M${x(0)},${baseline} L` + actual.map(pt).join(" L") + ` L${x(lastActual)},${baseline} Z`
  const dividerX = pad.left + band * (lastActual + 1)

  const handlePointer = (clientX: number) => {
    const rect = ref.current?.getBoundingClientRect()
    if (!rect || band === 0) return
    const i = Math.floor((clientX - rect.left - pad.left) / band)
    setActive(Math.min(Math.max(i, 0), data.length - 1))
  }

  const activePoint = active !== null ? data[active] : null
  const activeMoM = active !== null ? monthOverMonth(data, active) : null

  return (
    <div
      ref={ref}
      className="relative w-full select-none touch-pan-y"
      style={{ height }}
      onPointerMove={(e) => handlePointer(e.clientX)}
      onPointerDown={(e) => handlePointer(e.clientX)}
      onPointerLeave={() => setActive(null)}
    >
      {width > 0 && (
        <svg width={width} height={height} className="absolute inset-0 overflow-visible" role="img"
          aria-label={`${GROWTH_YEAR}년 월별 해외환자 유치 수 차트`}>
          <defs>
            <linearGradient id="growth-area" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={ACCENT} stopOpacity={0.14} />
              <stop offset="100%" stopColor={ACCENT} stopOpacity={0} />
            </linearGradient>
          </defs>

          <rect x={dividerX} y={pad.top - 20} width={width - pad.right - dividerX} height={innerH + 20} fill="#F6F5F2" />
          <text x={dividerX + 8} y={pad.top - 6} fill="#9CA3AF" fontSize={11}>예상</text>

          {Y_TICKS.map((t) => (
            <g key={t}>
              <line x1={pad.left} x2={width - pad.right} y1={y(t)} y2={y(t)} stroke="rgba(0,0,0,0.07)" />
              <text x={pad.left - 10} y={y(t)} dy="0.32em" textAnchor="end" fill="#9CA3AF" fontSize={compact ? 10 : 11}>
                {nf.format(t)}
              </text>
            </g>
          ))}

          {data.map((d, i) => (
            <text key={d.month} x={x(i)} y={height - 8} textAnchor="middle" fontSize={compact ? 10 : 12}
              fill={active === i ? INK : "#9CA3AF"}>
              {compact ? d.month : d.label}
            </text>
          ))}

          {active !== null && (
            <line x1={x(active)} x2={x(active)} y1={pad.top} y2={baseline} stroke="rgba(0,0,0,0.2)" strokeDasharray="2 3" />
          )}

          <motion.path d={areaPath} fill="url(#growth-area)"
            initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ duration: 0.8, delay: 1 }} />
          <motion.path d={actualPath} fill="none" stroke={ACCENT} strokeWidth={2.25} strokeLinejoin="round"
            initial={{ pathLength: 0 }} animate={inView ? { pathLength: 1 } : {}} transition={{ duration: 1.4, ease: EASE }} />
          <motion.path d={forecastPath} fill="none" stroke={ACCENT} strokeOpacity={0.55} strokeWidth={2} strokeDasharray="5 5"
            initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ duration: 0.6, delay: 1.4 }} />

          {data.map((d, i) => {
            const isActive = active === i
            const isLatest = i === lastActual
            const showLabel = (!compact || isLatest || i === data.length - 1) && !isActive
            const delay = d.forecast ? 1.5 + (i - lastActual) * 0.1 : (i / lastActual) * 1.4
            return (
              <motion.g key={d.month} initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ duration: 0.3, delay }}>
                <circle
                  cx={x(i)}
                  cy={y(d.value)}
                  r={isActive ? 5.5 : isLatest ? 4.5 : 3}
                  fill={d.forecast ? "#fff" : ACCENT}
                  stroke={ACCENT}
                  strokeWidth={1.5}
                />
                {showLabel && (
                  <text x={x(i)} y={y(d.value) - 12} textAnchor="middle" fontSize={compact ? 10 : 12} fontWeight={isLatest ? 600 : 500}
                    fill={d.forecast ? "#9CA3AF" : isLatest ? ACCENT : "#374151"}>
                    {nf.format(d.value)}
                  </text>
                )}
              </motion.g>
            )
          })}
        </svg>
      )}

      {activePoint && active !== null && (
        <div
          className="pointer-events-none absolute z-10 min-w-[140px] rounded-xl border border-black/10 bg-white px-4 py-3 shadow-[0_8px_24px_-12px_rgba(0,0,0,0.25)]"
          style={{
            left: x(active),
            top: y(activePoint.value),
            transform: `translate(${active > data.length / 2 ? "calc(-100% - 14px)" : "14px"}, -50%)`,
          }}
        >
          <p className="text-xs text-gray-500">
            {GROWTH_YEAR}년 {activePoint.label} {activePoint.forecast ? "예상" : "실적"}
          </p>
          <p className="mt-1 text-lg font-semibold tabular-nums text-[#0A0A0A]">{nf.format(activePoint.value)}명</p>
          {activeMoM !== null && <p className="text-xs tabular-nums text-gray-500">전월 대비 {pct(activeMoM)}</p>}
        </div>
      )}
    </div>
  )
}
