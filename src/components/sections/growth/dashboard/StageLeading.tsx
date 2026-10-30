// Page 3. 선행지표와 데이터 인텔리전스
// Exhibit 3.1 문의(t) vs 내원(t+3주) 리드/래그, 3.2 퍼널 전환율 vs 벤치마크, 3.3 선행지표 보드,
// 3.4 4주 후 내원 예측, 3.5 요일 x 시간대 문의 히트맵.

import { Exhibit, Key, P, R, RG, Spark, YGrid, linePath, scaleLinear } from "./primitives"


// ── 3.1 리드/래그 ─────────────────────────────────────────

const INQ = [180, 172, 195, 210, 204, 190, 230, 244, 250, 238, 240, 270, 286, 300, 292, 285, 320, 334, 340, 352, 330, 360, 376, 390, 410]
const LAG = 3
const CONV = 0.16
const NOISE = [3, -2, 1, 4, -3, 2, -1, -4, 2, 1, -3, 2, 0, 3, -2, 1, -1, 2, -3, 1, 2, -2]

function LeadLag() {
  const W = 748
  const H = 214
  const left = 32
  const bottom = H - 16
  const n = INQ.length
  const x = scaleLinear([0, n - 1], [left, W - 6])
  const y = scaleLinear([150, 430], [bottom, 6])
  const inq = INQ.map((v, i) => [x(i), y(v)] as [number, number])
  const vis = INQ.slice(0, n - LAG).map((v, i) => [x(i), y((v * CONV + NOISE[i]) / CONV)] as [number, number])
  const pred = INQ.slice(n - LAG - 1).map((v, i) => [x(n - LAG - 1 + i), y(v)] as [number, number])
  return (
    <svg width={W} height={H}>
      <rect x={x(n - LAG - 1)} y={6} width={W - 6 - x(n - LAG - 1)} height={bottom - 6} fill="#F5F3EF" />
      <text x={W - 10} y={18} textAnchor="end" fontSize={8.5} fill={P.ink2}>향후 3주 예측 구간</text>
      <YGrid ticks={[200, 300, 400]} y={y} x1={left} x2={W - 6} />
      <path d={linePath(inq)} fill="none" stroke={P.ink} strokeWidth={1.6} />
      <path d={linePath(vis)} fill="none" stroke={P.accent} strokeWidth={1.6} />
      <path d={linePath(pred)} fill="none" stroke={P.accent} strokeWidth={1.6} strokeDasharray="3 3" />
      {INQ.map((_, i) => (i % 4 === 0 ? <text key={i} x={x(i)} y={H - 3} textAnchor="middle" fontSize={8.5} fill={P.ink2}>W{i + 14}</text> : null))}
      <g transform={`translate(${x(8)}, ${y(360)})`}>
        <line x1={0} x2={0} y1={8} y2={34} stroke={P.ink} strokeWidth={0.8} />
        <text x={4} y={4} fontSize={9.5} fontWeight={600} fill={P.ink}>문의 → 내원 3주 시차, 상관계수</text>
        <RG><text x={150} y={4} fontSize={9.5} fontWeight={600} fill={P.accent}>r = 0.81</text></RG>
      </g>
    </svg>
  )
}

// ── 3.2 퍼널 vs 벤치마크 ──────────────────────────────────

const FUNNEL = [
  { step: "노출", rate: null, w: 1 },
  { step: "프로필", rate: 2.1, band: [1.8, 2.6], w: 0.8 },
  { step: "문의", rate: 4.8, band: [3.5, 5.5], w: 0.6 },
  { step: "예약", rate: 18.0, band: [22, 30], w: 0.42 },
  { step: "내원", rate: 82.0, band: [78, 88], w: 0.36 },
  { step: "재방문", rate: 41.0, band: [35, 45], w: 0.25 },
]

function Funnel() {
  return (
    <div>
      <div className="mb-1 grid grid-cols-[40px_1fr_120px] gap-2 text-[8.5px] text-[#8C8C8C]">
        <span />
        <span>규모</span>
        <span className="text-right">전환율 vs 벤치마크 밴드</span>
      </div>
      {FUNNEL.map((f) => {
        const below = f.band && f.rate !== null && f.rate < f.band[0]
        const lo = f.band ? f.band[0] * 0.5 : 0
        const hi = f.band ? f.band[1] * 1.3 : 1
        const pos = (v: number) => `${((v - lo) / (hi - lo)) * 100}%`
        return (
          <div key={f.step} className="grid h-[30px] grid-cols-[40px_1fr_120px] items-center gap-2 border-b border-[#EEECE8] text-[9.5px]">
            <span style={{ color: below ? P.accent : P.ink, fontWeight: below ? 600 : 400 }}>{f.step}</span>
            <div className="h-[14px]" style={{ width: `${f.w * 100}%`, background: below ? P.accent : P.ink, opacity: below ? 1 : 0.85 - f.w * 0.2 }} />
            {f.band && f.rate !== null ? (
              <div className="flex items-center gap-2">
                <div className="relative h-[5px] flex-1 bg-[#EEECE8]">
                  <div className="absolute inset-y-0 bg-[#C9C6BF]" style={{ left: pos(f.band[0]), width: `calc(${pos(f.band[1])} - ${pos(f.band[0])})` }} />
                  <div className="absolute -top-[3px] h-[11px] w-[2px]" style={{ left: pos(f.rate), background: below ? P.accent : P.ink }} />
                </div>
                <span className="w-8 text-right tabular-nums"><R>{f.rate}%</R></span>
              </div>
            ) : (
              <span />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── 3.3 선행지표 보드 ─────────────────────────────────────

const SIGNALS = [
  { name: "일본어 시술명 검색량", v: "12.4K", d: "+18%", rag: "g", s: [6, 7, 7, 8, 9, 9, 10, 11, 12.4] },
  { name: "인플루언서 언급 수", v: "386", d: "+24%", rag: "g", s: [180, 210, 220, 260, 250, 290, 310, 350, 386] },
  { name: "문의 응답시간", v: "14분", d: "+3분", rag: "a", s: [9, 10, 9, 11, 10, 12, 11, 13, 14] },
  { name: "노쇼율", v: "7.2%", d: "-1.1%p", rag: "g", s: [9.8, 9.5, 9.1, 8.8, 8.6, 8.1, 7.9, 7.6, 7.2] },
  { name: "신규 후기 수", v: "214", d: "+9%", rag: "g", s: [120, 132, 140, 151, 160, 172, 185, 196, 214] },
  { name: "LINE 친구 추가", v: "1,920", d: "-4%", rag: "a", s: [1700, 1820, 1900, 2050, 2100, 2080, 2010, 1990, 1920] },
  { name: "영미권 검색량", v: "3.1K", d: "-12%", rag: "r", s: [3.8, 3.9, 3.7, 3.6, 3.6, 3.4, 3.3, 3.2, 3.1] },
] as const
const RAG = { g: "#2E7D4F", a: "#C99A1D", r: P.accent }

function SignalBoard() {
  return (
    <table className="w-full text-[9.5px]">
      <thead>
        <tr className="border-b border-[#141414] text-[8.5px] text-[#8C8C8C]">
          <th className="py-1 text-left font-normal">지표</th>
          <th className="py-1 font-normal">9주</th>
          <th className="py-1 text-right font-normal">값</th>
          <th className="py-1 text-right font-normal">변화</th>
          <th className="py-1 text-center font-normal">상태</th>
        </tr>
      </thead>
      <tbody>
        {SIGNALS.map((s) => (
          <tr key={s.name} className="border-b border-[#EEECE8]">
            <td className="py-[5px] text-[#141414]">{s.name}</td>
            <td className="py-[5px]"><Spark data={[...s.s]} w={56} h={13} color={P.ink2} /></td>
            <td className="py-[5px] text-right tabular-nums"><R>{s.v}</R></td>
            <td className="py-[5px] text-right tabular-nums"><R>{s.d}</R></td>
            <td className="py-[5px] text-center"><span className="inline-block h-2 w-2 rounded-full" style={{ background: RAG[s.rag] }} /></td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

// ── 3.4 4주 후 내원 예측 ──────────────────────────────────

const HIST = [78, 82, 86, 90, 95, 92, 101, 108, 104, 112]
const FC = [118, 123, 129, 134]
const B80 = [6, 9, 12, 15]
const B95 = [10, 15, 20, 25]

function Forecast() {
  const W = 360
  const H = 228
  const left = 30
  const bottom = H - 16
  const n = HIST.length + FC.length
  const x = scaleLinear([0, n - 1], [left, W - 8])
  const y = scaleLinear([65, 165], [bottom, 6])
  const s = HIST.length - 1
  const band = (b: number[]) => {
    const up = FC.map((v, i) => [x(s + 1 + i), y(v + b[i])] as [number, number])
    const lo = FC.map((v, i) => [x(s + 1 + i), y(v - b[i])] as [number, number]).reverse()
    return linePath([[x(s), y(HIST[s])], ...up]) + " " + linePath([...lo, [x(s), y(HIST[s])]]).replace("M", "L") + " Z"
  }
  return (
    <svg width={W} height={H}>
      <YGrid ticks={[80, 120, 160]} y={y} x1={left} x2={W - 8} />
      <path d={band(B95)} fill={P.accent} fillOpacity={0.12} />
      <path d={band(B80)} fill={P.accent} fillOpacity={0.24} />
      <path d={linePath(HIST.map((v, i) => [x(i), y(v)]))} fill="none" stroke={P.ink} strokeWidth={1.5} />
      <path d={linePath([[x(s), y(HIST[s])], ...FC.map((v, i) => [x(s + 1 + i), y(v)] as [number, number])])} fill="none" stroke={P.accent} strokeWidth={1.5} strokeDasharray="3 3" />
      <line x1={x(s)} x2={x(s)} y1={6} y2={bottom} stroke={P.gray} strokeDasharray="2 2" />
      <text x={x(s) - 4} y={16} textAnchor="end" fontSize={8.5} fill={P.ink2}>실적</text>
      <text x={x(s) + 4} y={16} fontSize={8.5} fill={P.ink2}>예측</text>
      <RG><text x={x(n - 1)} y={y(FC[3]) - 8} textAnchor="end" fontSize={9.5} fontWeight={600} fill={P.ink}>134명</text></RG>
      <text x={left} y={H - 3} fontSize={8.5} fill={P.ink2}>-10주</text>
      <text x={W - 8} y={H - 3} textAnchor="end" fontSize={8.5} fill={P.ink2}>+4주</text>
    </svg>
  )
}

// ── 3.5 요일 x 시간대 히트맵 ──────────────────────────────

const DAYS = ["월", "화", "수", "목", "금", "토", "일"]
const SLOTS = Array.from({ length: 12 }, (_, i) => i * 2)
const intensity = (d: number, h: number) => {
  const evening = Math.exp(-Math.pow((h - 22) / 3, 2))
  const lunch = 0.45 * Math.exp(-Math.pow((h - 12) / 2, 2))
  const weekend = d >= 5 ? 1.3 : 1
  return Math.min(1, (evening + lunch + (h < 6 ? 0.08 : 0)) * weekend * (0.85 + ((d * 7 + h) % 5) * 0.04))
}

function Heatmap() {
  const cw = 26
  return (
    <div>
      <div className="flex pl-5">
        {SLOTS.map((h) => <span key={h} className="text-center text-[8px] text-[#8C8C8C]" style={{ width: cw }}>{h}</span>)}
      </div>
      {DAYS.map((d, di) => (
        <div key={d} className="mt-[2px] flex items-center">
          <span className="w-5 text-[8.5px] text-[#4A4A4A]">{d}</span>
          {SLOTS.map((h) => (
            <span
              key={h}
              className="mr-[2px] block h-[24px]"
              style={{ width: cw - 2, background: `rgba(20,20,20,${0.04 + intensity(di, h) * 0.86})`, outline: di === 6 && h === 22 ? `2px solid ${P.accent}` : undefined }}
            />
          ))}
        </div>
      ))}
      <p className="mt-2 text-[9px] text-[#4A4A4A]">
        피크 <span className="font-semibold text-[#C1452D]">일요일 22~24시 (JST)</span>, 야간 상담 인력 재배치
      </p>
    </div>
  )
}

export function StageLeading() {
  return (
    <div className="grid h-full grid-cols-3 grid-rows-[244px_1fr] gap-x-7 gap-y-[18px]">
      <Exhibit no="3.1" title="주간 문의(t) vs 내원(t+3주)" className="col-span-2">
        <div className="absolute right-0 -top-[26px]">
          <Key items={[{ label: "문의 (t)", color: P.ink }, { label: "내원 (t+3주, 환산)", color: P.accent }]} />
        </div>
        <LeadLag />
      </Exhibit>
      <Exhibit no="3.2" title="퍼널 전환율 vs 벤치마크">
        <Funnel />
      </Exhibit>
      <Exhibit no="3.3" title="선행지표 보드">
        <SignalBoard />
      </Exhibit>
      <Exhibit no="3.4" title="4주 후 내원 예측 (80%, 95% 구간)" unit="주간, 명">
        <Forecast />
      </Exhibit>
      <Exhibit no="3.5" title="요일 x 시간대 문의 집중도" unit="일본, 최근 8주">
        <Heatmap />
      </Exhibit>
    </div>
  )
}
