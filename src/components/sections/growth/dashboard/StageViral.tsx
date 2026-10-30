// Page 4. Organic Viral K
// Exhibit 4.1 바이럴 루프, 4.2 K 산식, 4.3 K 추이(K=1 기준선, 현실 범위 0.2~0.6),
// 4.4 Paid vs Organic 비중, 4.5 블렌디드 CAC. K 가 1을 넘는다는 과장은 하지 않는다.

import { Exhibit, P, R, RG, YGrid, linePath, scaleLinear } from "./primitives"

const K_I = 2.25
const K_C = 0.2
const K = K_I * K_C
const MULT = 1 / (1 - K)


const MONTHS = ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월"]
const K_TREND = [0.21, 0.24, 0.27, 0.31, 0.33, 0.36, 0.39, 0.42, 0.45]
const ORGANIC = [0.18, 0.21, 0.24, 0.28, 0.31, 0.35, 0.38, 0.42, 0.45]
const PAID_CAC = [232, 226, 219, 210, 204, 196, 191, 188, 184]

// ── 4.1 루프: 타원 위 4개 노드를 시계 방향 호 화살표로 잇는다 ─────

const NODES = ["환자", "후기, UGC, 추천", "노출", "신규 문의"]

function Loop() {
  const W = 360
  const H = 220
  const cx = W / 2
  const cy = H / 2
  const rx = 128
  const ry = 76
  const pt = (a: number) => [cx + rx * Math.cos(a), cy + ry * Math.sin(a)] as const
  const angle = (i: number) => -Math.PI / 2 + (i * Math.PI) / 2
  const GAP = 0.42

  return (
    <svg width={W} height={H}>
      <defs>
        <marker id="cb-loop-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
          <path d="M0,0 L10,5 L0,10 z" fill={P.ink} />
        </marker>
      </defs>
      {NODES.map((_, i) => {
        const [x1, y1] = pt(angle(i) + GAP)
        const [x2, y2] = pt(angle(i + 1) - GAP)
        return (
          <path key={i} d={`M${x1},${y1} A${rx},${ry} 0 0,1 ${x2},${y2}`} fill="none" stroke={P.ink} strokeWidth={1.2} markerEnd="url(#cb-loop-arrow)" />
        )
      })}
      <text x={cx} y={cy - 6} textAnchor="middle" fontSize={9} fill={P.gray}>Organic Loop</text>
      <text x={cx} y={cy + 12} textAnchor="middle" fontSize={15} fontWeight={700} fill={P.ink}>K = i × c</text>
      {NODES.map((label, i) => {
        const [x, y] = pt(angle(i))
        return (
          <g key={label} transform={`translate(${x}, ${y})`}>
            <rect x={-50} y={-14} width={100} height={28} fill="#fff" stroke={i === 1 ? P.accent : P.ink} />
            <text y={4} textAnchor="middle" fontSize={9.5} fontWeight={600} fill={i === 1 ? P.accent : P.ink}>{label}</text>
          </g>
        )
      })}
    </svg>
  )
}

// ── 4.2 K 산식 ────────────────────────────────────────────

function KCalc() {
  const rows = [
    { k: "i", d: "환자 1명당 발생한 소개 수", v: K_I.toFixed(2) },
    { k: "c", d: "소개의 환자 전환율", v: `${K_C * 100}%` },
    { k: "K", d: "i × c", v: K.toFixed(2), strong: true },
    { k: "배수", d: "1 / (1 - K)", v: `${MULT.toFixed(2)}x` },
    { k: "환자", d: "유료 환자 100명 기준 최종 환자", v: `${Math.round(100 * MULT)}명`, strong: true },
    { k: "CAC", d: "블렌디드 CAC 변화", v: `-${Math.round((1 - 1 / MULT) * 100)}%` },
  ]
  return (
    <div>
      <table className="w-full text-[9.5px]">
        <tbody>
          {rows.map((r) => (
            <tr key={r.k} className="border-b border-[#EEECE8]">
              <td className="w-10 py-[6px] font-semibold" style={{ color: r.strong ? P.accent : P.ink }}>{r.k}</td>
              <td className="py-[6px] text-[#4A4A4A]">{r.d}</td>
              <td className="py-[6px] text-right font-semibold tabular-nums"><R>{r.v}</R></td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-2 text-[8.5px] leading-relaxed text-[#8C8C8C]" style={{ wordBreak: "keep-all" }}>
        클리닉의 현실적인 K는 0.2~0.6 수준으로, 자가 성장(K &gt; 1)이 아니라 블렌디드 CAC 하락 효과로 해석한다.
      </p>
    </div>
  )
}

// ── 4.3 K 추이 ────────────────────────────────────────────

function KTrend() {
  const W = 360
  const H = 220
  const left = 28
  const bottom = H - 16
  const x = scaleLinear([0, MONTHS.length - 1], [left, W - 8])
  const y = scaleLinear([0, 1.1], [bottom, 6])
  return (
    <svg width={W} height={H}>
      <rect x={left} y={y(0.6)} width={W - 8 - left} height={y(0.2) - y(0.6)} fill="#F5F3EF" />
      <text x={W - 10} y={y(0.6) + 11} textAnchor="end" fontSize={8.5} fill={P.ink2}>클리닉 현실 범위 0.2~0.6</text>
      <YGrid ticks={[0, 0.5, 1]} y={y} x1={left} x2={W - 8} />
      <line x1={left} x2={W - 8} y1={y(1)} y2={y(1)} stroke={P.ink} strokeDasharray="4 3" strokeWidth={0.8} />
      <text x={left + 4} y={y(1) - 4} fontSize={8.5} fill={P.ink2}>K = 1 (자가 성장 기준선)</text>
      <path d={linePath(K_TREND.map((v, i) => [x(i), y(v)]))} fill="none" stroke={P.accent} strokeWidth={1.8} />
      {K_TREND.map((v, i) => <circle key={i} cx={x(i)} cy={y(v)} r={2} fill={P.accent} />)}
      <RG><text x={x(8) - 4} y={y(0.45) - 7} textAnchor="end" fontSize={9.5} fontWeight={600} fill={P.ink}>0.45</text></RG>
      {MONTHS.map((m, i) => <text key={m} x={x(i)} y={H - 3} textAnchor="middle" fontSize={8.5} fill={P.ink2}>{m}</text>)}
    </svg>
  )
}

// ── 4.4 Paid vs Organic ───────────────────────────────────

function PaidOrganic() {
  const W = 554
  const H = 222
  const left = 34
  const bottom = H - 16
  const x = scaleLinear([0, MONTHS.length - 1], [left, W - 70])
  const y = scaleLinear([0, 1], [bottom, 6])
  const top = ORGANIC.map((v, i) => [x(i), y(v)] as [number, number])
  const base = MONTHS.map((_, i) => [x(i), y(0)] as [number, number])
  const ceil = MONTHS.map((_, i) => [x(i), y(1)] as [number, number])
  return (
    <svg width={W} height={H}>
      <path d={linePath(ceil) + " " + linePath([...top].reverse()).replace("M", "L") + " Z"} fill="#E6E4DF" />
      <path d={linePath(top) + " " + linePath([...base].reverse()).replace("M", "L") + " Z"} fill={P.accent} fillOpacity={0.85} />
      <YGrid ticks={[0, 0.5, 1]} y={y} x1={left} x2={W - 70} fmt={(v) => `${v * 100}%`} />
      <text x={W - 64} y={y(0.75)} fontSize={9.5} fill={P.ink}>Paid</text>
      <text x={W - 64} y={y(0.2)} fontSize={9.5} fontWeight={600} fill={P.accent}>Organic</text>
      <RG>
        <text x={W - 64} y={y(0.75) + 12} fontSize={9} fill={P.ink}>55%</text>
        <text x={W - 64} y={y(0.2) + 12} fontSize={9} fill={P.accent}>45%</text>
      </RG>
      {MONTHS.map((m, i) => <text key={m} x={x(i)} y={H - 3} textAnchor="middle" fontSize={8.5} fill={P.ink2}>{m}</text>)}
    </svg>
  )
}

// ── 4.5 블렌디드 CAC ──────────────────────────────────────

function BlendedCac() {
  const W = 554
  const H = 222
  const left = 36
  const bottom = H - 16
  const blended = PAID_CAC.map((v, i) => Math.round(v * (1 - ORGANIC[i])))
  const x = scaleLinear([0, MONTHS.length - 1], [left, W - 70])
  const y = scaleLinear([80, 250], [bottom, 6])
  const paid = PAID_CAC.map((v, i) => [x(i), y(v)] as [number, number])
  const blend = blended.map((v, i) => [x(i), y(v)] as [number, number])
  const last = blend.length - 1
  return (
    <svg width={W} height={H}>
      <YGrid ticks={[100, 150, 200, 250]} y={y} x1={left} x2={W - 70} fmt={(v) => `${v}K`} />
      <path d={linePath(paid) + " " + linePath([...blend].reverse()).replace("M", "L") + " Z"} fill={P.accentTint} />
      <path d={linePath(paid)} fill="none" stroke={P.ink} strokeWidth={1.4} strokeDasharray="4 3" />
      <path d={linePath(blend)} fill="none" stroke={P.accent} strokeWidth={1.8} />
      <text x={paid[last][0] + 6} y={paid[last][1] + 3} fontSize={9} fill={P.ink}>Paid CAC</text>
      <text x={blend[last][0] + 6} y={blend[last][1] + 3} fontSize={9} fontWeight={600} fill={P.accent}>Blended</text>
      <text x={x(4)} y={(y(PAID_CAC[4]) + y(blended[4])) / 2 + 3} textAnchor="middle" fontSize={9} fill={P.accent}>바이럴이 절감한 비용</text>
      {MONTHS.map((m, i) => <text key={m} x={x(i)} y={H - 3} textAnchor="middle" fontSize={8.5} fill={P.ink2}>{m}</text>)}
    </svg>
  )
}

export function StageViral() {
  return (
    <div className="flex h-full flex-col gap-[18px]">
      <div className="grid h-[250px] grid-cols-3 gap-x-7">
        <Exhibit no="4.1" title="Organic 바이럴 루프">
          <Loop />
        </Exhibit>
        <Exhibit no="4.2" title="K 산식과 효과" unit="2026.09">
          <KCalc />
        </Exhibit>
        <Exhibit no="4.3" title="월별 Organic Viral K">
          <KTrend />
        </Exhibit>
      </div>
      <div className="grid min-h-0 flex-1 grid-cols-2 gap-x-7">
        <Exhibit no="4.4" title="신규 환자 유입 비중: Paid vs Organic">
          <PaidOrganic />
        </Exhibit>
        <Exhibit no="4.5" title="Paid CAC vs 블렌디드 CAC" unit="천 원">
          <BlendedCac />
        </Exhibit>
      </div>
    </div>
  )
}
