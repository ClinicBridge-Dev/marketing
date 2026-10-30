// 그로스 리포트(컨설팅펌, VC 보고서 형식) 공통 요소.
// 흰 종이 위 모노톤 팔레트 + 강조색 1개, Exhibit 번호와 굵은 상단 라인, 출처 주석.
// 수치 대부분은 블러 처리한다: HTML 은 <R>, SVG 텍스트는 <RG>(SVG 필터) 로 감싼다.
// 리포트는 1200x675 고정 캔버스에 그려지므로 치수는 px 로 고정한다.

import { cn } from "@/lib/utils"

export const P = {
  ink: "#141414",
  ink2: "#4A4A4A",
  gray: "#8C8C8C",
  light: "#C9C9C9",
  faint: "#E6E4DF",
  paper: "#FFFFFF",
  accent: "#C1452D",
  accentTint: "rgba(193,69,45,0.12)",
  grid: "#EEECE8",
}

export const REDACT_FILTER_ID = "cb-report-redact"

// 캔버스 루트에 한 번만 넣는 SVG 블러 필터 정의
export function RedactFilterDefs() {
  return (
    <svg width={0} height={0} className="absolute" aria-hidden>
      <filter id={REDACT_FILTER_ID} x="-10%" y="-40%" width="120%" height="180%">
        <feGaussianBlur stdDeviation="2.4" />
      </filter>
    </svg>
  )
}

// HTML 텍스트 블러
export function R({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span aria-hidden className={cn("inline-block select-none blur-[3px]", className)}>
      {children}
    </span>
  )
}

// SVG 텍스트 블러 그룹
export function RG({ children }: { children: React.ReactNode }) {
  return <g filter={`url(#${REDACT_FILTER_ID})`} aria-hidden>{children}</g>
}

interface ExhibitProps {
  no: string
  title: string
  unit?: string
  className?: string
  children: React.ReactNode
}

// 보고서 Exhibit: 번호 + 제목, 굵은 상단 라인, 본문.
// 블러는 대시보드 스트립 전체에 한 번 걸리고(GrowthDashboard), 수치는 R/RG 로 한 번 더 강하게 가린다.
export function Exhibit({ no, title, unit, className, children }: ExhibitProps) {
  return (
    <section className={cn("flex min-h-0 flex-col", className)}>
      <div className="flex items-baseline justify-between border-b-[1.5px] border-[#141414] pb-1">
        <p className="text-[10.5px] text-[#141414]">
          <span className="mr-1.5 font-semibold tracking-wide text-[#8C8C8C]">EXHIBIT {no}</span>
          <span className="font-semibold">{title}</span>
        </p>
        {unit && <span className="text-[9px] text-[#8C8C8C]">{unit}</span>}
      </div>
      <div className="relative mt-2 min-h-0 flex-1 select-none">{children}</div>
    </section>
  )
}

export const linePath = (pts: [number, number][]) => pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ")

export function scaleLinear(domain: [number, number], range: [number, number]) {
  const [d0, d1] = domain
  const [r0, r1] = range
  return (v: number) => r0 + ((v - d0) / (d1 - d0)) * (r1 - r0)
}

export function Spark({ data, w = 64, h = 16, color = P.ink }: { data: number[]; w?: number; h?: number; color?: string }) {
  const min = Math.min(...data)
  const max = Math.max(...data)
  const x = scaleLinear([0, data.length - 1], [1, w - 2])
  const y = scaleLinear([min, max === min ? min + 1 : max], [h - 2, 2])
  const pts = data.map((v, i) => [x(i), y(v)] as [number, number])
  return (
    <svg width={w} height={h} className="block">
      <path d={linePath(pts)} fill="none" stroke={color} strokeWidth={1.2} />
      <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r={1.6} fill={color} />
    </svg>
  )
}

export function Key({ items }: { items: { label: string; color: string; dashed?: boolean; box?: boolean }[] }) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[9px] text-[#4A4A4A]">
      {items.map((it) => (
        <span key={it.label} className="flex items-center gap-1">
          {it.box ? (
            <span className="block h-2 w-2" style={{ background: it.color }} />
          ) : (
            <span className="block h-0 w-3" style={{ borderTop: `1.5px ${it.dashed ? "dashed" : "solid"} ${it.color}` }} />
          )}
          {it.label}
        </span>
      ))}
    </div>
  )
}

// 차트 공통: 가로 그리드와 블러 처리된 축 눈금
export function YGrid({ ticks, y, x1, x2, fmt = (v) => String(v) }: {
  ticks: number[]; y: (v: number) => number; x1: number; x2: number; fmt?: (v: number) => string
}) {
  return (
    <g>
      {ticks.map((t) => (
        <line key={t} x1={x1} x2={x2} y1={y(t)} y2={y(t)} stroke={P.grid} />
      ))}
      <RG>
        {ticks.map((t) => (
          <text key={t} x={x1 - 4} y={y(t) + 3} textAnchor="end" fontSize={8.5} fill={P.gray}>{fmt(t)}</text>
        ))}
      </RG>
    </g>
  )
}
