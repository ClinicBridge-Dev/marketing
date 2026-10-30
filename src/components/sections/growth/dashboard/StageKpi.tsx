// 월별 핵심 지표 도표 + 상담, 예약, 매출 추이 차트.
// 대시보드 전체가 블러 처리되므로 형태(표, 막대, 선)가 읽히는 정도면 충분하다.

import { Exhibit, Key, P, Spark, YGrid, linePath, scaleLinear } from "./primitives"

const MONTHS = ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월"]

// 상담자 수, 예약자 수를 기준으로 나머지 지표를 일관되게 파생한다
const CONSULT = [2410, 2280, 2690, 2860, 3120, 2990, 3240, 3410, 3880]
const BOOKED = [1842, 1715, 2064, 2196, 2438, 2305, 2512, 2687, 3119]
const VISIT = BOOKED.map((v) => Math.round(v * 0.82))
const NEW = VISIT.map((v) => Math.round(v * 0.59))
const REVISIT = VISIT.map((v, i) => v - NEW[i])
const REVENUE = VISIT.map((v) => +(v * 0.0038).toFixed(2)) // 억 원
const AOV = REVENUE.map((r, i) => Math.round((r * 1e4) / VISIT[i])) // 만 원
const GP = REVENUE.map((r) => +(r * 0.31).toFixed(2))
const SPEND = REVENUE.map((r) => +(r * 0.17).toFixed(2))
const CAC = SPEND.map((s, i) => Math.round((s * 1e5) / NEW[i])) // 천 원
const ROAS = REVENUE.map((r, i) => +(r / SPEND[i]).toFixed(1))
const NOSHOW = [9.8, 9.5, 9.1, 8.8, 8.6, 8.1, 7.9, 7.6, 7.2]
const IMPR = CONSULT.map((c) => +(c / 1000).toFixed(2)) // M

const fmt = (n: number) => n.toLocaleString("ko-KR")
const sum = (a: number[]) => a.reduce((s, v) => s + v, 0)
const mom = (a: number[]) => ((a[a.length - 1] / a[a.length - 2] - 1) * 100).toFixed(1)

const ROWS: { k: string; v: (string | number)[]; total: string; data: number[]; strong?: boolean }[] = [
  { k: "노출 (M)", v: IMPR, total: sum(IMPR).toFixed(1), data: IMPR },
  { k: "상담자 수", v: CONSULT.map(fmt), total: fmt(sum(CONSULT)), data: CONSULT, strong: true },
  { k: "예약자 수", v: BOOKED.map(fmt), total: fmt(sum(BOOKED)), data: BOOKED, strong: true },
  { k: "상담 → 예약 (%)", v: BOOKED.map((b, i) => ((b / CONSULT[i]) * 100).toFixed(1)), total: ((sum(BOOKED) / sum(CONSULT)) * 100).toFixed(1), data: BOOKED.map((b, i) => b / CONSULT[i]) },
  { k: "내원 수", v: VISIT.map(fmt), total: fmt(sum(VISIT)), data: VISIT },
  { k: "신환", v: NEW.map(fmt), total: fmt(sum(NEW)), data: NEW },
  { k: "재진", v: REVISIT.map(fmt), total: fmt(sum(REVISIT)), data: REVISIT },
  { k: "매출 (억 원)", v: REVENUE.map((r) => r.toFixed(2)), total: sum(REVENUE).toFixed(1), data: REVENUE, strong: true },
  { k: "객단가 (만 원)", v: AOV, total: String(Math.round((sum(REVENUE) * 1e4) / sum(VISIT))), data: AOV },
  { k: "GP (억 원)", v: GP.map((g) => g.toFixed(2)), total: sum(GP).toFixed(1), data: GP },
  { k: "마케팅비 (억 원)", v: SPEND.map((s) => s.toFixed(2)), total: sum(SPEND).toFixed(1), data: SPEND },
  { k: "CAC (천 원)", v: CAC, total: String(Math.round((sum(SPEND) * 1e5) / sum(NEW))), data: CAC },
  { k: "ROAS (x)", v: ROAS, total: (sum(REVENUE) / sum(SPEND)).toFixed(1), data: ROAS },
  { k: "노쇼율 (%)", v: NOSHOW, total: (sum(NOSHOW) / NOSHOW.length).toFixed(1), data: NOSHOW },
]

function KpiTable() {
  return (
    <table className="w-full text-[9.5px]">
      <thead>
        <tr className="border-b border-[#141414] text-[#8C8C8C]">
          <th className="py-1 text-left font-normal">지표</th>
          {MONTHS.map((m) => <th key={m} className="py-1 text-right font-normal">{m}</th>)}
          <th className="py-1 text-right font-semibold text-[#141414]">합계</th>
          <th className="py-1 text-right font-normal">MoM</th>
          <th className="py-1 pl-3 text-right font-normal">추이</th>
        </tr>
      </thead>
      <tbody>
        {ROWS.map((r) => (
          <tr key={r.k} className="border-b border-[#EEECE8]" style={{ background: r.strong ? P.accentTint : undefined }}>
            <td className="py-[2px] font-medium text-[#141414]" style={{ color: r.strong ? P.accent : undefined }}>{r.k}</td>
            {r.v.map((v, i) => <td key={i} className="py-[2px] text-right tabular-nums text-[#4A4A4A]">{v}</td>)}
            <td className="py-[2px] text-right font-semibold tabular-nums">{r.total}</td>
            <td className="py-[2px] text-right tabular-nums text-[#2E7D4F]">{mom(r.data)}%</td>
            <td className="py-[2px] pl-3"><div className="flex justify-end"><Spark data={r.data} w={60} h={12} color={r.strong ? P.accent : P.ink2} /></div></td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function ConsultBookingChart() {
  const W = 554
  const H = 150
  const left = 34
  const bottom = H - 14
  const slot = (W - left) / MONTHS.length
  const y = scaleLinear([0, 4200], [bottom, 6])
  return (
    <svg width={W} height={H}>
      <YGrid ticks={[0, 2000, 4000]} y={y} x1={left} x2={W} />
      {MONTHS.map((m, i) => {
        const x = left + slot * i + slot * 0.18
        const bw = slot * 0.3
        return (
          <g key={m}>
            <rect x={x} y={y(CONSULT[i])} width={bw} height={bottom - y(CONSULT[i])} fill="#C9C6BF" />
            <rect x={x + bw + 2} y={y(BOOKED[i])} width={bw} height={bottom - y(BOOKED[i])} fill={P.ink} />
            <text x={x + bw} y={H - 2} textAnchor="middle" fontSize={8.5} fill={P.ink2}>{m}</text>
          </g>
        )
      })}
    </svg>
  )
}

function RevenueChart() {
  const W = 554
  const H = 150
  const left = 34
  const bottom = H - 14
  const x = scaleLinear([0, MONTHS.length - 1], [left + 14, W - 14])
  const y = scaleLinear([0, 10], [bottom, 6])
  const gpY = (v: number) => y(v)
  const rev = REVENUE.map((v, i) => [x(i), y(v)] as [number, number])
  return (
    <svg width={W} height={H}>
      <YGrid ticks={[0, 5, 10]} y={y} x1={left} x2={W} />
      {GP.map((g, i) => <rect key={i} x={x(i) - 9} y={gpY(g)} width={18} height={bottom - gpY(g)} fill={P.accent} fillOpacity={0.35} />)}
      <path d={linePath(rev)} fill="none" stroke={P.accent} strokeWidth={2} />
      {rev.map(([px, py], i) => <circle key={i} cx={px} cy={py} r={2.4} fill={P.accent} />)}
      {MONTHS.map((m, i) => <text key={m} x={x(i)} y={H - 2} textAnchor="middle" fontSize={8.5} fill={P.ink2}>{m}</text>)}
    </svg>
  )
}

export function StageKpi() {
  return (
    <div className="grid h-full grid-cols-2 grid-rows-[300px_1fr] gap-x-7 gap-y-[18px]">
      <Exhibit no="0.1" title="월별 핵심 지표 (상담, 예약, 내원, 매출, GP, CAC)" unit="2026.01~2026.09" className="col-span-2">
        <KpiTable />
      </Exhibit>
      <Exhibit no="0.2" title="월별 상담자 수 vs 예약자 수" unit="명">
        <div className="absolute right-0 -top-[26px] mr-6">
          <Key items={[{ label: "상담자", color: "#C9C6BF", box: true }, { label: "예약자", color: P.ink, box: true }]} />
        </div>
        <ConsultBookingChart />
      </Exhibit>
      <Exhibit no="0.3" title="월별 매출과 GP" unit="억 원">
        <div className="absolute right-0 -top-[26px] mr-10">
          <Key items={[{ label: "매출", color: P.accent }, { label: "GP", color: "rgba(193,69,45,0.35)", box: true }]} />
        </div>
        <RevenueChart />
      </Exhibit>
    </div>
  )
}
