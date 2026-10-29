"use client"

import { useState } from "react"

// 역량 03 "체계적인 데이터 분석"의 예시 대시보드 (라이트 테마, 정적).
// 실제 고객 데이터가 아닌 가상 수치이며, 상단에 예시임을 명시한다.

type TabKey = "unit" | "viral" | "leading" | "projection"

const TABS: { key: TabKey; label: string }[] = [
  { key: "unit", label: "Unit Economics" },
  { key: "viral", label: "Organic Viral K" },
  { key: "leading", label: "선행지표 분석" },
  { key: "projection", label: "매출 프로젝션" },
]

const INK = "#0A0A0A"

function Stat({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="bg-white p-4 sm:p-5">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="mt-3 text-2xl sm:text-3xl font-semibold tracking-[-0.03em] tabular-nums text-[#0A0A0A]">{value}</p>
      {note && <p className="mt-1 text-xs text-gray-400">{note}</p>}
    </div>
  )
}

function Bar({ ratio, tone = "ink" }: { ratio: number; tone?: "ink" | "muted" }) {
  return (
    <div className="h-1.5 w-full bg-black/[0.06]">
      <div className={`h-full ${tone === "ink" ? "bg-[#0A0A0A]" : "bg-gray-400"}`} style={{ width: `${Math.min(ratio, 1) * 100}%` }} />
    </div>
  )
}

const CHANNEL_CAC = [
  { name: "인플루언서 집중 바이럴", value: 142 },
  { name: "시술명 검색 광고", value: 168 },
  { name: "Meta 광고", value: 221 },
  { name: "해외 플랫폼 입점", value: 265 },
]

function UnitEconomics() {
  const max = Math.max(...CHANNEL_CAC.map((c) => c.value))
  return (
    <div className="grid gap-px bg-black/10 lg:grid-cols-5">
      <div className="grid grid-cols-2 gap-px bg-black/10 lg:col-span-2">
        <Stat label="CAC (환자 1명 획득 비용)" value="₩184K" note="전분기 대비 -18%" />
        <Stat label="LTV (환자 생애 가치)" value="₩1.32M" note="재방문율 반영" />
        <Stat label="LTV / CAC" value="7.2x" note="건전 기준 3x 이상" />
        <Stat label="Payback" value="1.6개월" />
      </div>
      <div className="bg-white p-4 sm:p-6 lg:col-span-3">
        <p className="text-xs text-gray-500">채널별 CAC (천 원)</p>
        <ul className="mt-5 space-y-5">
          {CHANNEL_CAC.map((c, i) => (
            <li key={c.name}>
              <div className="mb-2 flex justify-between text-sm">
                <span className="text-gray-700">{c.name}</span>
                <span className="tabular-nums font-medium text-[#0A0A0A]">{c.value}</span>
              </div>
              <Bar ratio={c.value / max} tone={i === 0 ? "ink" : "muted"} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

const VIRAL_I = 1.9
const VIRAL_C = 0.2
const VIRAL_K = VIRAL_I * VIRAL_C
const SEED = 1000
const GENERATIONS = Array.from({ length: 4 }, (_, g) => Math.round(SEED * Math.pow(VIRAL_K, g)))

function ViralK() {
  return (
    <div className="grid gap-px bg-black/10 lg:grid-cols-5">
      <div className="bg-white p-5 sm:p-6 lg:col-span-2">
        <p className="text-xs text-gray-500">Organic Viral Coefficient</p>
        <p className="mt-3 text-5xl font-semibold tracking-[-0.04em] tabular-nums text-[#0A0A0A]">{VIRAL_K.toFixed(2)}</p>
        <p className="mt-4 text-sm text-gray-600">
          환자 1명당 소개 수 {VIRAL_I} × 소개 전환율 {VIRAL_C * 100}%
        </p>
        <p className="mt-6 border-t border-black/10 pt-4 text-sm text-gray-600">
          유료 유입 1명당 실제 환자 <b className="font-semibold text-[#0A0A0A]">{(1 / (1 - VIRAL_K)).toFixed(2)}명</b>
        </p>
      </div>
      <div className="bg-white p-4 sm:p-6 lg:col-span-3">
        <p className="text-xs text-gray-500">세대별 유입 환자 (유료 유입 {SEED.toLocaleString()}명 기준)</p>
        <ul className="mt-5 space-y-5">
          {GENERATIONS.map((n, g) => (
            <li key={g}>
              <div className="mb-2 flex justify-between text-sm">
                <span className="text-gray-700">{g === 0 ? "유료 유입" : `${g}차 소개`}</span>
                <span className="tabular-nums font-medium text-[#0A0A0A]">{n.toLocaleString()}</span>
              </div>
              <Bar ratio={n / SEED} tone={g === 0 ? "ink" : "muted"} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

const LEADING = [
  { from: "인플루언서 게시물 조회수", to: "상담 문의", r: 0.82, lag: "2주 선행" },
  { from: "시술명 검색 SOV", to: "예약 전환", r: 0.76, lag: "4주 선행" },
  { from: "후기 콘텐츠 누적 수", to: "재방문 예약", r: 0.58, lag: "6주 선행" },
  { from: "LINE 첫 응답 시간", to: "예약률", r: -0.64, lag: "동시" },
]

function LeadingIndicators() {
  return (
    <div className="bg-white">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-black/10 text-left text-xs text-gray-500">
            <th className="py-3 pl-4 sm:pl-6 font-normal">선행지표</th>
            <th className="py-3 font-normal hidden sm:table-cell">매출 지표</th>
            <th className="py-3 font-normal hidden sm:table-cell">시차</th>
            <th className="py-3 pr-4 sm:pr-6 text-right font-normal">상관계수 r</th>
          </tr>
        </thead>
        <tbody>
          {LEADING.map((row) => (
            <tr key={row.from} className="border-b border-black/10 last:border-0">
              <td className="py-4 pl-4 sm:pl-6 text-[#0A0A0A]">
                {row.from}
                <span className="block text-xs text-gray-400 sm:hidden">→ {row.to}, {row.lag}</span>
              </td>
              <td className="py-4 text-gray-600 hidden sm:table-cell">{row.to}</td>
              <td className="py-4 text-gray-500 hidden sm:table-cell">{row.lag}</td>
              <td className="py-4 pr-4 sm:pr-6">
                <div className="flex items-center justify-end gap-3">
                  <div className="hidden md:block w-32">
                    <Bar ratio={Math.abs(row.r)} tone={row.r >= 0 ? "ink" : "muted"} />
                  </div>
                  <span className="w-12 text-right tabular-nums font-medium text-[#0A0A0A]">{row.r.toFixed(2)}</span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// 월 매출 (억 원). 앞 6개월은 실적, 뒤 6개월은 시나리오별 전망.
const PROJ_ACTUAL = [1.2, 1.4, 1.5, 1.8, 2.1, 2.4]
const PROJ_BASE = [2.4, 2.7, 3.0, 3.4, 3.8, 4.2, 4.7]
const PROJ_LOW = [2.4, 2.5, 2.7, 2.9, 3.1, 3.3, 3.5]
const PROJ_HIGH = [2.4, 2.9, 3.4, 4.0, 4.6, 5.3, 6.1]

function Projection() {
  const W = 560
  const H = 220
  const pad = 24
  const total = PROJ_ACTUAL.length + PROJ_BASE.length - 1
  const x = (i: number) => pad + (i / (total - 1)) * (W - pad * 2)
  const y = (v: number) => H - pad - (v / 6.5) * (H - pad * 2)
  const offset = PROJ_ACTUAL.length - 1
  const line = (arr: number[], start = 0) => arr.map((v, i) => `${i ? "L" : "M"}${x(i + start)},${y(v)}`).join(" ")
  const band =
    PROJ_HIGH.map((v, i) => `${i ? "L" : "M"}${x(i + offset)},${y(v)}`).join(" ") +
    " " +
    [...PROJ_LOW].reverse().map((v, i) => `L${x(offset + PROJ_LOW.length - 1 - i)},${y(v)}`).join(" ") +
    " Z"
  const last = (arr: number[]) => arr[arr.length - 1]

  return (
    <div className="grid gap-px bg-black/10 lg:grid-cols-5">
      <div className="bg-white p-4 sm:p-6 lg:col-span-3">
        <p className="text-xs text-gray-500">월 해외환자 매출 (억 원), 실적과 6개월 전망</p>
        <svg viewBox={`0 0 ${W} ${H}`} className="mt-3 h-auto w-full">
          <rect x={x(offset)} y={pad} width={W - pad - x(offset)} height={H - pad * 2} fill="#F6F5F2" />
          <path d={band} fill={INK} opacity={0.06} />
          <path d={line(PROJ_ACTUAL)} fill="none" stroke={INK} strokeWidth={2} />
          <path d={line(PROJ_BASE, offset)} fill="none" stroke="#9CA3AF" strokeWidth={2} strokeDasharray="5 5" />
          <text x={x(offset) + 8} y={pad + 14} fontSize={11} fill="#9CA3AF">전망</text>
        </svg>
      </div>
      <div className="grid gap-px bg-black/10 lg:col-span-2">
        <Stat label="보수 시나리오 (6개월 후)" value={`${last(PROJ_LOW)}억 원`} />
        <Stat label="기본 시나리오 (6개월 후)" value={`${last(PROJ_BASE)}억 원`} note="현 성장률 유지 시" />
        <Stat label="공격 시나리오 (6개월 후)" value={`${last(PROJ_HIGH)}억 원`} note="마케팅 예산 1.5배 투입 시" />
      </div>
    </div>
  )
}

const PANELS: Record<TabKey, () => React.ReactElement> = {
  unit: UnitEconomics,
  viral: ViralK,
  leading: LeadingIndicators,
  projection: Projection,
}

export function DataDashboardMock() {
  const [tab, setTab] = useState<TabKey>("unit")
  const Panel = PANELS[tab]

  return (
    <div className="border border-black/10">
      <div className="flex items-center justify-between border-b border-black/10 px-4 sm:px-6 py-3">
        <p className="text-sm font-semibold text-[#0A0A0A]">Clinic Growth Dashboard</p>
        <p className="text-xs text-gray-400">예시 화면, 가상 데이터</p>
      </div>

      <div className="flex overflow-x-auto scrollbar-hide border-b border-black/10" role="tablist">
        {TABS.map((t) => (
          <button
            key={t.key}
            role="tab"
            aria-selected={tab === t.key}
            onClick={() => setTab(t.key)}
            className={`shrink-0 border-b-2 px-4 sm:px-6 py-3 text-sm transition-colors ${
              tab === t.key ? "border-[#0A0A0A] text-[#0A0A0A] font-medium" : "border-transparent text-gray-400 hover:text-gray-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="min-h-[320px]">
        <Panel />
      </div>
    </div>
  )
}
