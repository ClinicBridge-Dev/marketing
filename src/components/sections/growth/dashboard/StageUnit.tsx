// Page 2. Unit Economics와 Lever
// Exhibit 2.1 국가별 유닛 이코노믹스 표, 2.2 채널별 CAC vs LTV, 2.3 코호트 레이어 케이크, 2.4 레버 토네이도.

import { Exhibit, Key, P, R, RG, Spark, YGrid, linePath, scaleLinear } from "./primitives"


// ── 2.1 국가별 유닛 이코노믹스 ─────────────────────────────

const COLS = ["일본", "영미권", "대만", "전체"]
const ROWS = [
  { k: "CAC", v: ["₩162K", "₩231K", "₩248K", "₩184K"], s: [232, 226, 219, 210, 204, 196, 191, 188, 184] },
  { k: "LTV (GP 기준)", v: ["₩1.41M", "₩1.36M", "₩0.88M", "₩1.32M"], s: [1.08, 1.1, 1.12, 1.15, 1.18, 1.22, 1.25, 1.29, 1.32] },
  { k: "LTV / CAC", v: ["8.7x", "5.9x", "3.5x", "7.2x"], s: [4.6, 4.9, 5.1, 5.5, 5.8, 6.2, 6.5, 6.9, 7.2] },
  { k: "Payback", v: ["1.3개월", "2.1개월", "2.9개월", "1.6개월"], s: [2.4, 2.3, 2.2, 2.1, 2.0, 1.9, 1.8, 1.7, 1.6] },
  { k: "재진율 (90일)", v: ["41%", "33%", "29%", "38%"], s: [30, 31, 33, 33, 35, 36, 36, 37, 38] },
  { k: "객단가", v: ["₩38만", "₩52만", "₩29만", "₩40만"], s: [36, 36, 37, 38, 38, 39, 39, 40, 40] },
  { k: "노쇼율", v: ["6.8%", "8.1%", "7.4%", "7.2%"], s: [9.8, 9.5, 9.1, 8.8, 8.6, 8.1, 7.9, 7.6, 7.2] },
]

function UnitTable() {
  return (
    <table className="w-full text-[9.5px]">
      <thead>
        <tr className="border-b border-[#141414] text-[#8C8C8C]">
          <th className="py-1 text-left font-normal">지표</th>
          {COLS.map((c) => <th key={c} className="py-1 text-right font-normal">{c}</th>)}
          <th className="py-1 pl-3 text-right font-normal">9개월 추이</th>
        </tr>
      </thead>
      <tbody>
        {ROWS.map((r) => (
          <tr key={r.k} className="border-b border-[#EEECE8]">
            <td className="py-[5px] text-[#141414]">{r.k}</td>
            {r.v.map((v, i) => (
              <td key={i} className={`py-[5px] text-right tabular-nums ${i === 3 ? "font-semibold" : ""}`}><R>{v}</R></td>
            ))}
            <td className="py-[5px] pl-3"><div className="flex justify-end"><Spark data={r.s} w={64} h={14} /></div></td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

// ── 2.2 채널별 CAC vs LTV ─────────────────────────────────

const CHANNELS = [
  { name: "LINE CRM", cac: 95, ltv: 1580, n: 120, c: "일본" },
  { name: "인플루언서 집중", cac: 142, ltv: 1450, n: 420, c: "일본" },
  { name: "시술명 검색", cac: 168, ltv: 1180, n: 260, c: "일본" },
  { name: "Meta", cac: 221, ltv: 1320, n: 180, c: "영미권" },
  { name: "Google", cac: 240, ltv: 1060, n: 90, c: "영미권" },
  { name: "Reddit", cac: 205, ltv: 980, n: 60, c: "영미권" },
  { name: "플랫폼 입점", cac: 265, ltv: 760, n: 140, c: "대만" },
  { name: "Dcard", cac: 190, ltv: 840, n: 70, c: "대만" },
]
const COUNTRY_FILL: Record<string, string> = { 일본: P.ink, 영미권: "#8C8C8C", 대만: "#C9C6BF" }

function ChannelBubble() {
  const W = 554
  const H = 206
  const x = scaleLinear([60, 300], [34, W - 70])
  const y = scaleLinear([600, 1750], [H - 18, 6])
  const ratio3 = [60, 300].map((c) => [x(c), y(Math.min(c * 3 * 2.2, 1750))] as [number, number])
  return (
    <svg width={W} height={H}>
      <YGrid ticks={[800, 1200, 1600]} y={y} x1={34} x2={W - 70} />
      <path d={linePath(ratio3)} stroke={P.gray} strokeDasharray="3 3" fill="none" />
      <text x={W - 68} y={y(1600) + 3} fontSize={8.5} fill={P.gray}>LTV/CAC 기준선</text>
      <line x1={x(180)} x2={x(180)} y1={6} y2={H - 18} stroke={P.faint} />
      <text x={x(180) - 4} y={14} textAnchor="end" fontSize={8.5} fontWeight={600} fill={P.accent}>확대 영역</text>
      {CHANNELS.map((ch) => {
        const r = Math.sqrt(ch.n) * 0.8
        const flag = ch.name === "인플루언서 집중"
        return (
          <g key={ch.name}>
            <circle cx={x(ch.cac)} cy={y(ch.ltv)} r={r} fill={flag ? P.accent : COUNTRY_FILL[ch.c]} fillOpacity={flag ? 0.85 : 0.75} stroke="#fff" />
            <text x={x(ch.cac) + r + 3} y={y(ch.ltv) + 3} fontSize={8.5} fill={P.ink}>{ch.name}</text>
          </g>
        )
      })}
      <text x={W - 70} y={H - 4} textAnchor="end" fontSize={8.5} fill={P.gray}>CAC →</text>
      <text x={34} y={H - 4} fontSize={8.5} fill={P.gray}>버블 = 환자 수</text>
    </svg>
  )
}

// ── 2.3 코호트 레이어 케이크 ──────────────────────────────

const COHORTS = [520, 480, 600, 640, 700, 660, 720, 760, 880]
const gp = (k: number) => (k === 0 ? 0.152 : 0.152 * 0.42 * Math.pow(0.86, k - 1))

function CohortCake() {
  const W = 554
  const H = 228
  const left = 34
  const bottom = H - 16
  const n = COHORTS.length
  const layers = COHORTS.map((size, c) => Array.from({ length: n }, (_, m) => (m < c ? 0 : size * gp(m - c))))
  const totals = Array.from({ length: n }, (_, m) => layers.reduce((s, l) => s + l[m], 0))
  const max = Math.ceil(Math.max(...totals) / 50) * 50
  const x = scaleLinear([0, n - 1], [left, W - 4])
  const y = scaleLinear([0, max], [bottom, 6])
  const acc = Array(n).fill(0)
  const shades = ["#141414", "#2b2b2b", "#424242", "#5a5a5a", "#737373", "#8c8c8c", "#a6a6a6", "#bfbfbf", "#C1452D"]
  return (
    <svg width={W} height={H}>
      <YGrid ticks={[0, max / 2, max]} y={y} x1={left} x2={W} fmt={(v) => String(Math.round(v))} />
      {layers.map((layer, c) => {
        const lower = acc.map((v, m) => [x(m), y(v)] as [number, number])
        layer.forEach((v, m) => (acc[m] += v))
        const upper = acc.map((v, m) => [x(m), y(v)] as [number, number])
        return <path key={c} d={linePath(upper) + " " + linePath([...lower].reverse()).replace("M", "L") + " Z"} fill={shades[c]} stroke="#fff" strokeWidth={0.5} />
      })}
      {Array.from({ length: n }, (_, m) => <text key={m} x={x(m)} y={H - 3} textAnchor="middle" fontSize={8.5} fill={P.ink2}>{m + 1}월</text>)}
    </svg>
  )
}

// ── 2.4 레버 토네이도 ─────────────────────────────────────

const LEVERS = [
  { name: "재진율", up: 1840, down: -1690 },
  { name: "예약전환율", up: 1520, down: -1410 },
  { name: "객단가", up: 1210, down: -1180 },
  { name: "내원율", up: 960, down: -1020 },
  { name: "CAC", up: 690, down: -720 },
  { name: "노쇼율", up: 420, down: -390 },
  { name: "통역 비용", up: 180, down: -170 },
]

function Tornado() {
  const W = 554
  const center = 300
  const x = scaleLinear([0, 2000], [0, 200])
  return (
    <svg width={W} height={228}>
      <line x1={center} x2={center} y1={14} y2={224} stroke={P.ink} strokeWidth={0.8} />
      <text x={center - 6} y={9} textAnchor="end" fontSize={8.5} fill={P.gray}>-10%</text>
      <text x={center + 6} y={9} fontSize={8.5} fill={P.gray}>+10%</text>
      {LEVERS.map((l, i) => {
        const cy = 28 + i * 28
        const top = i === 0
        return (
          <g key={l.name}>
            {top && <rect x={0} y={cy - 12} width={W} height={24} fill={P.accentTint} />}
            <text x={2} y={cy + 3} fontSize={9.5} fontWeight={top ? 600 : 400} fill={top ? P.accent : P.ink}>{l.name}</text>
            <rect x={center - x(-l.down)} y={cy - 8} width={x(-l.down)} height={16} fill="#C9C6BF" />
            <rect x={center} y={cy - 8} width={x(l.up)} height={16} fill={top ? P.accent : P.ink} />
            <RG>
              <text x={center - x(-l.down) - 4} y={cy + 3} textAnchor="end" fontSize={8.5} fill={P.ink2}>{l.down}</text>
              <text x={center + x(l.up) + 4} y={cy + 3} fontSize={8.5} fontWeight={600} fill={P.ink}>+{l.up}</text>
            </RG>
          </g>
        )
      })}
    </svg>
  )
}

export function StageUnit() {
  return (
    <div className="grid h-full grid-cols-2 grid-rows-[236px_1fr] gap-x-7 gap-y-[18px]">
      <Exhibit no="2.1" title="국가별 유닛 이코노믹스" unit="2026.09, GP 기준">
        <UnitTable />
      </Exhibit>
      <Exhibit no="2.2" title="채널별 CAC vs LTV (버블 = 환자 수)">
        <div className="absolute right-0 -top-[26px]">
          <Key items={[{ label: "일본", color: P.ink, box: true }, { label: "영미권", color: "#8C8C8C", box: true }, { label: "대만", color: "#C9C6BF", box: true }]} />
        </div>
        <ChannelBubble />
      </Exhibit>
      <Exhibit no="2.3" title="월별 코호트 GP 기여 (레이어 케이크)" unit="백만 원">
        <CohortCake />
      </Exhibit>
      <Exhibit no="2.4" title="레버 10% 변화 시 월 GP 영향 (토네이도)" unit="만 원">
        <Tornado />
      </Exhibit>
    </div>
  )
}
