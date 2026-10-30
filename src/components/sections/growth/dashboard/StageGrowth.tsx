// Page 1. Growth 분석과 Revenue/GP Breakdown
// Exhibit 1.1 매출 드라이버 트리(병목 1곳 강조), 1.2 GP 브리지, 1.3 Growth Accounting, 1.4 매출 순위 vs GP 순위.

import { Exhibit, Key, P, R, RG, YGrid, linePath, scaleLinear } from "./primitives"


// ── 1.1 드라이버 트리 ─────────────────────────────────────

function Node({ x, y, w, label, value, hot }: { x: number; y: number; w: number; label: string; value: string; hot?: boolean }) {
  return (
    <div
      className="absolute flex h-[36px] flex-col justify-center border px-2"
      style={{ left: x, top: y, width: w, borderColor: hot ? P.accent : "#D4D2CC", background: hot ? P.accentTint : "#fff" }}
    >
      <span className="text-[9px] leading-tight" style={{ color: hot ? P.accent : P.ink2 }}>{label}</span>
      <span className="text-[11.5px] font-semibold leading-tight text-[#141414]"><R>{value}</R></span>
    </div>
  )
}

const FACTORS = [
  { label: "노출", value: "2.76M" },
  { label: "× CTR", value: "2.1%" },
  { label: "× 문의전환", value: "4.8%" },
  { label: "× 예약전환  (BM 26%)", value: "18.0%", hot: true },
  { label: "× 내원율", value: "82.0%" },
]

function DriverTree() {
  const c = (x1: number, y1: number, x2: number, y2: number) => `M${x1},${y1} H${(x1 + x2) / 2} V${y2} H${x2}`
  return (
    <div className="absolute inset-0">
      <svg className="absolute inset-0" width={600} height={220}>
        <g fill="none" stroke="#BDBAB3">
          <path d={c(108, 109, 140, 109)} />
          <path d={c(108, 109, 140, 180)} />
          <path d={c(236, 38, 268, 138)} />
          <line x1={410} x2={410} y1={18} y2={202} />
          {FACTORS.map((f, i) => !f.hot && <line key={i} x1={410} x2={420} y1={18 + i * 46} y2={18 + i * 46} />)}
        </g>
        <g fill="none" stroke={P.accent} strokeWidth={1.6}>
          <path d={c(108, 109, 140, 38)} />
          <path d={c(236, 38, 268, 24)} />
          <path d={c(388, 24, 410, 18)} />
          <line x1={410} x2={410} y1={18} y2={156} />
          <line x1={410} x2={420} y1={156} y2={156} />
        </g>
      </svg>
      <Node x={0} y={91} w={108} label="해외환자 매출 (월)" value="₩4.80억" />
      <Node x={140} y={20} w={96} label="일본" value="₩2.59억" />
      <Node x={140} y={91} w={96} label="영미권" value="₩1.38억" />
      <Node x={140} y={162} w={96} label="대만" value="₩0.83억" />
      <Node x={268} y={6} w={120} label="신환 수 × 신환 객단가" value="411 × ₩38만" />
      <Node x={268} y={120} w={120} label="재진 수 × 재진 객단가" value="286 × ₩36만" />
      {FACTORS.map((f, i) => (
        <div
          key={f.label}
          className="absolute flex h-[32px] items-center justify-between border px-2 text-[9.5px]"
          style={{ left: 420, top: i * 46 + 2, width: 180, borderColor: f.hot ? P.accent : "#D4D2CC", background: f.hot ? P.accentTint : "#fff" }}
        >
          <span style={{ color: f.hot ? P.accent : P.ink2, fontWeight: f.hot ? 600 : 400 }}>{f.label}</span>
          <span className="font-semibold text-[#141414]"><R>{f.value}</R></span>
        </div>
      ))}
    </div>
  )
}

// ── 1.2 GP 브리지 ─────────────────────────────────────────

const BRIDGE = [
  { label: "총매출", v: 5.1, total: true },
  { label: "할인/환불", v: -0.3 },
  { label: "시술 원가", v: -1.34 },
  { label: "의료진 변동비", v: -0.62 },
  { label: "통역/코디", v: -0.29 },
  { label: "플랫폼 수수료", v: -0.19 },
  { label: "마케팅비", v: -0.86 },
  { label: "공헌이익", v: 1.5, total: true },
]

function GpBridge() {
  const W = 508
  const H = 220
  const bottom = H - 30
  const y = scaleLinear([0, 5.4], [bottom, 8])
  const slot = (W - 28) / BRIDGE.length
  let run = 0
  return (
    <svg width={W} height={H}>
      <YGrid ticks={[0, 1, 2, 3, 4, 5]} y={y} x1={26} x2={W} />
      {BRIDGE.map((d, i) => {
        const from = d.total ? 0 : run
        const to = d.total ? d.v : run + d.v
        run = to
        const top = y(Math.max(from, to))
        const h = Math.max(y(Math.min(from, to)) - top, 1)
        const x = 28 + i * slot + 8
        const bw = slot - 16
        const last = i === BRIDGE.length - 1
        return (
          <g key={d.label}>
            <rect x={x} y={top} width={bw} height={h} fill={last ? P.accent : d.total ? P.ink : "#B5B2AB"} />
            {!last && <line x1={x + bw} x2={x + slot} y1={y(to)} y2={y(to)} stroke={P.gray} strokeDasharray="2 2" />}
            <RG><text x={x + bw / 2} y={top - 4} textAnchor="middle" fontSize={9} fontWeight={600} fill={P.ink}>{d.v.toFixed(2)}</text></RG>
            {d.label.length > 5 ? (
              <text x={x + bw / 2} y={bottom + 11} textAnchor="middle" fontSize={8.5} fill={P.ink2}>
                <tspan x={x + bw / 2}>{d.label.slice(0, d.label.indexOf(" ") > 0 ? d.label.indexOf(" ") : 3)}</tspan>
                <tspan x={x + bw / 2} dy={10}>{d.label.slice(d.label.indexOf(" ") > 0 ? d.label.indexOf(" ") + 1 : 3)}</tspan>
              </text>
            ) : (
              <text x={x + bw / 2} y={bottom + 11} textAnchor="middle" fontSize={8.5} fill={P.ink2}>{d.label}</text>
            )}
          </g>
        )
      })}
    </svg>
  )
}

// ── 1.3 Growth Accounting ─────────────────────────────────

const MONTHS = ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월"]
const NEW = [520, 480, 600, 640, 700, 660, 720, 760, 880]
const RETAINED = [380, 360, 410, 430, 470, 450, 480, 510, 560]
const RESURRECT = [60, 55, 70, 80, 85, 90, 95, 100, 120]
const CHURN = [180, 190, 200, 210, 215, 230, 235, 240, 250]

function GrowthAccounting() {
  const W = 600
  const H = 222
  const chartH = 166
  const left = 34
  const slot = (W - left) / MONTHS.length
  const y = scaleLinear([-300, 1600], [chartH - 4, 4])
  const net = MONTHS.map((_, i) => NEW[i] + RESURRECT[i] - CHURN[i])
  const qr = MONTHS.map((_, i) => (NEW[i] + RESURRECT[i]) / CHURN[i])
  const cx = (i: number) => left + slot * i + slot / 2

  return (
    <svg width={W} height={H}>
      <YGrid ticks={[0, 500, 1000, 1500]} y={y} x1={left} x2={W} />
      <line x1={left} x2={W} y1={y(0)} y2={y(0)} stroke={P.ink} strokeWidth={0.8} />
      {MONTHS.map((m, i) => {
        const bw = slot * 0.56
        const x = cx(i) - bw / 2
        const parts = [
          { v: NEW[i], c: P.ink },
          { v: RESURRECT[i], c: P.accent },
          { v: RETAINED[i], c: "#C9C6BF" },
        ]
        let acc = 0
        return (
          <g key={m}>
            {parts.map((p, k) => {
              const t = y(acc + p.v)
              const b = y(acc)
              acc += p.v
              return <rect key={k} x={x} y={t} width={bw} height={b - t} fill={p.c} />
            })}
            <rect x={x} y={y(0)} width={bw} height={y(-CHURN[i]) - y(0)} fill="#E7B4A8" />
          </g>
        )
      })}
      <path d={linePath(net.map((v, i) => [cx(i), y(v)]))} fill="none" stroke={P.accent} strokeWidth={1.4} strokeDasharray="3 2" />
      {/* 하단 표: 월, 순증, Quick Ratio */}
      {MONTHS.map((m, i) => (
        <text key={m} x={cx(i)} y={chartH + 9} textAnchor="middle" fontSize={8.5} fill={P.ink2}>{m}</text>
      ))}
      <line x1={0} x2={W} y1={chartH + 14} y2={chartH + 14} stroke={P.faint} />
      <text x={0} y={chartH + 26} fontSize={8.5} fill={P.ink2}>순증</text>
      <text x={0} y={chartH + 40} fontSize={8.5} fill={P.ink2}>Quick Ratio</text>
      <RG>
        {MONTHS.map((m, i) => (
          <g key={m}>
            <text x={cx(i)} y={chartH + 26} textAnchor="middle" fontSize={8.5} fill={P.ink}>{net[i]}</text>
            <text x={cx(i)} y={chartH + 40} textAnchor="middle" fontSize={8.5} fontWeight={600} fill={P.ink}>{qr[i].toFixed(1)}</text>
          </g>
        ))}
      </RG>
    </svg>
  )
}

// ── 1.4 매출 순위 vs GP 순위 ───────────────────────────────

const PROCS = [
  { name: "리프팅", rev: 1, gp: 4, flag: true },
  { name: "스킨부스터", rev: 2, gp: 1 },
  { name: "보톡스", rev: 3, gp: 2 },
  { name: "레이저 토닝", rev: 4, gp: 6 },
  { name: "필러", rev: 5, gp: 3 },
  { name: "실리프팅", rev: 6, gp: 8 },
  { name: "색소 레이저", rev: 7, gp: 5 },
  { name: "여드름 관리", rev: 8, gp: 7 },
]

function RankDumbbell() {
  const W = 508
  const x = scaleLinear([1, 8], [92, 380])
  return (
    <svg width={W} height={222}>
      {[1, 2, 3, 4, 5, 6, 7, 8].map((r) => (
        <g key={r}>
          <line x1={x(r)} x2={x(r)} y1={14} y2={214} stroke={P.grid} />
          <text x={x(r)} y={9} textAnchor="middle" fontSize={8.5} fill={P.gray}>{r}</text>
        </g>
      ))}
      <text x={404} y={9} fontSize={8.5} fill={P.gray}>매출 비중</text>
      <text x={462} y={9} fontSize={8.5} fill={P.gray}>GP율</text>
      {PROCS.map((p, i) => {
        const cy = 26 + i * 25
        return (
          <g key={p.name}>
            {p.flag && <rect x={0} y={cy - 11} width={W} height={22} fill={P.accentTint} />}
            <text x={2} y={cy + 3} fontSize={9.5} fontWeight={p.flag ? 600 : 400} fill={p.flag ? P.accent : P.ink}>{p.name}</text>
            <line x1={x(p.rev)} x2={x(p.gp)} y1={cy} y2={cy} stroke={p.flag ? P.accent : P.light} strokeWidth={2} />
            <circle cx={x(p.rev)} cy={cy} r={4} fill="#fff" stroke={P.ink} strokeWidth={1.4} />
            <circle cx={x(p.gp)} cy={cy} r={4} fill={p.flag ? P.accent : P.ink} />
            <RG>
              <text x={404} y={cy + 3} fontSize={9} fill={P.ink}>{(24 - i * 2.6).toFixed(1)}%</text>
              <text x={462} y={cy + 3} fontSize={9} fill={P.ink}>{(18 + ((i * 7) % 23)).toFixed(0)}%</text>
            </RG>
          </g>
        )
      })}
    </svg>
  )
}

export function StageGrowth() {
  return (
    <div className="grid h-full grid-cols-[600px_1fr] grid-rows-[250px_1fr] gap-x-7 gap-y-[18px]">
      <Exhibit no="1.1" title="해외환자 매출 드라이버 트리" unit="월, 2026.09">
        <DriverTree />
      </Exhibit>
      <Exhibit no="1.2" title="매출에서 공헌이익까지 (GP Bridge)" unit="억 원">
        <GpBridge />
      </Exhibit>
      <Exhibit no="1.3" title="Growth Accounting: 신환, 휴면 복귀, 재진, 이탈" unit="명">
        <div className="absolute right-0 -top-[26px]">
          <Key items={[{ label: "신환", color: P.ink, box: true }, { label: "휴면 복귀", color: P.accent, box: true }, { label: "재진", color: "#C9C6BF", box: true }, { label: "이탈", color: "#E7B4A8", box: true }, { label: "순증", color: P.accent, dashed: true }]} />
        </div>
        <GrowthAccounting />
      </Exhibit>
      <Exhibit no="1.4" title="시술별 매출 순위 vs GP 순위">
        <div className="absolute right-0 -top-[26px]">
          <Key items={[{ label: "매출 순위", color: P.ink }, { label: "GP 순위", color: P.accent }]} />
        </div>
        <RankDumbbell />
      </Exhibit>
    </div>
  )
}
