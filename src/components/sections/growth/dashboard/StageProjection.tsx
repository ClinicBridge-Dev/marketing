// Page 5. 프로젝션과 결정
// Exhibit 5.1 12개월 GP 시나리오(Base/Upside/Downside + 레버 실행안), 5.2 시나리오 가정,
// 5.3 레버 민감도 매트릭스, 5.4 이 분석으로 바뀐 결정.

import { Exhibit, Key, P, R, YGrid, linePath, scaleLinear } from "./primitives"


const HISTORY = [0.92, 0.98, 1.05, 1.1, 1.18, 1.22, 1.3, 1.38, 1.5]
const H12 = 12
const proj = (g: number, lift = 0) =>
  Array.from({ length: H12 }, (_, k) => HISTORY[HISTORY.length - 1] * Math.pow(1 + g, k + 1) * (1 + lift * Math.min(1, (k + 1) / 6)))
const BASE = proj(0.035)
const UP = proj(0.06)
const DOWN = proj(0.01)
const PLAN = proj(0.035, 0.178)
const LABELS = [
  ...Array.from({ length: 9 }, (_, i) => `26.${String(i + 1).padStart(2, "0")}`),
  "26.10", "26.11", "26.12",
  ...Array.from({ length: 9 }, (_, i) => `27.${String(i + 1).padStart(2, "0")}`),
]

function Scenarios() {
  const W = 748
  const H = 214
  const left = 34
  const right = W - 64
  const bottom = H - 16
  const n = HISTORY.length + H12
  const x = scaleLinear([0, n - 1], [left, right])
  const y = scaleLinear([0.8, 3.1], [bottom, 6])
  const s = HISTORY.length - 1
  const series = (arr: number[]) => [[x(s), y(HISTORY[s])] as [number, number], ...arr.map((v, k) => [x(s + 1 + k), y(v)] as [number, number])]
  const end = (arr: number[]) => y(arr[arr.length - 1])
  return (
    <svg width={W} height={H}>
      <rect x={x(s)} y={6} width={right - x(s)} height={bottom - 6} fill="#F7F6F3" />
      <YGrid ticks={[1, 2, 3]} y={y} x1={left} x2={right} fmt={(v) => `${v}억`} />
      <path d={linePath(series(UP)) + " " + linePath([...series(DOWN)].reverse()).replace("M", "L") + " Z"} fill="#E6E4DF" />
      <path d={linePath(HISTORY.map((v, i) => [x(i), y(v)]))} fill="none" stroke={P.ink} strokeWidth={1.8} />
      <path d={linePath(series(BASE))} fill="none" stroke={P.ink} strokeWidth={1.3} strokeDasharray="4 3" />
      <path d={linePath(series(PLAN))} fill="none" stroke={P.accent} strokeWidth={2} />
      {[
        { arr: UP, t: "Upside", c: P.gray },
        { arr: PLAN, t: "레버 실행안", c: P.accent },
        { arr: BASE, t: "Base", c: P.ink },
        { arr: DOWN, t: "Downside", c: P.gray },
      ].map((l) => (
        <text key={l.t} x={right + 6} y={end(l.arr) + 3} fontSize={9} fontWeight={l.c === P.accent ? 600 : 400} fill={l.c}>{l.t}</text>
      ))}
      {LABELS.map((l, i) => (i % 3 === 0 ? <text key={l} x={x(i)} y={H - 3} textAnchor="middle" fontSize={8.5} fill={P.ink2}>{l}</text> : null))}
      <text x={x(s) + 6} y={18} fontSize={8.5} fill={P.ink2}>전망</text>
    </svg>
  )
}

function Assumptions() {
  const rows = [
    { k: "월 성장률", v: ["1.0%", "3.5%", "6.0%"] },
    { k: "재진율", v: ["35%", "38%", "43%"] },
    { k: "예약전환율", v: ["18%", "21%", "24%"] },
    { k: "블렌디드 CAC", v: ["₩112K", "₩101K", "₩92K"] },
    { k: "Organic 비중", v: ["40%", "45%", "52%"] },
    { k: "12개월 GP", v: ["₩19.1억", "₩22.7억", "₩27.3억"] },
  ]
  return (
    <table className="w-full text-[9.5px]">
      <thead>
        <tr className="border-b border-[#141414] text-[8.5px] text-[#8C8C8C]">
          <th className="py-1 text-left font-normal">가정</th>
          <th className="py-1 text-right font-normal">Down</th>
          <th className="py-1 text-right font-normal">Base</th>
          <th className="py-1 text-right font-normal">Up</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={r.k} className={`border-b border-[#EEECE8] ${i === rows.length - 1 ? "font-semibold" : ""}`}>
            <td className="py-[6px] text-[#141414]">{r.k}</td>
            {r.v.map((v, j) => <td key={j} className="py-[6px] text-right tabular-nums"><R>{v}</R></td>)}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

// 레버 x 개선폭 민감도 (12개월 GP 변화율, %)
const SENS = [
  { k: "재진율", steps: ["+2%p", "+5%p", "+10%p"], v: [3.6, 9.5, 19.0] },
  { k: "예약전환율", steps: ["+2%p", "+3%p", "+6%p"], v: [3.2, 4.8, 9.6] },
  { k: "객단가", steps: ["+3%", "+5%", "+10%"], v: [2.4, 4.0, 8.1] },
  { k: "CAC 절감", steps: ["-5%", "-10%", "-20%"], v: [1.8, 3.5, 7.0] },
  { k: "노쇼율", steps: ["-1%p", "-2%p", "-3%p"], v: [0.9, 1.8, 2.7] },
]

function Sensitivity() {
  return (
    <table className="w-full text-[9.5px]">
      <thead>
        <tr className="border-b border-[#141414] text-[8.5px] text-[#8C8C8C]">
          <th className="py-1 text-left font-normal">레버</th>
          <th className="py-1 text-center font-normal">소폭</th>
          <th className="py-1 text-center font-normal">중간</th>
          <th className="py-1 text-center font-normal">공격</th>
        </tr>
      </thead>
      <tbody>
        {SENS.map((r) => (
          <tr key={r.k} className="border-b border-white">
            <td className="py-[5px] pr-2 text-[#141414]">{r.k}</td>
            {r.v.map((v, j) => (
              <td key={j} className="p-[2px]">
                <div className="flex h-[26px] flex-col items-center justify-center" style={{ background: `rgba(193,69,45,${0.08 + (v / 19) * 0.75})` }}>
                  <span className="text-[8px]" style={{ color: v > 9 ? "#fff" : P.ink2 }}>{r.steps[j]}</span>
                  <span className="text-[9.5px] font-semibold tabular-nums" style={{ color: v > 9 ? "#fff" : P.ink }}><R>+{v.toFixed(1)}%</R></span>
                </div>
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

const DECISIONS = [
  { date: "26.05", title: <>Meta 예산 <R>30%</R>를 인플루언서 집중 바이럴로 이동</>, basis: "Exhibit 2.2", result: "CAC -18%" },
  { date: "26.06", title: "일본 LINE 상담 응답 SLA 15분 도입", basis: "Exhibit 1.1, 3.5", result: "예약전환 +6%p" },
  { date: "26.07", title: "GP 1위 스킨부스터 중심으로 패키지 재구성", basis: "Exhibit 1.4", result: "GP율 +4%p" },
]

function DecisionLog() {
  return (
    <table className="w-full text-[9.5px]">
      <thead>
        <tr className="border-b border-[#141414] text-[8.5px] text-[#8C8C8C]">
          <th className="py-1 text-left font-normal">시점</th>
          <th className="py-1 text-left font-normal">결정</th>
          <th className="py-1 text-right font-normal">결과</th>
        </tr>
      </thead>
      <tbody>
        {DECISIONS.map((d) => (
          <tr key={d.date} className="border-b border-[#EEECE8] align-top">
            <td className="py-[7px] pr-2 tabular-nums text-[#8C8C8C]">{d.date}</td>
            <td className="py-[7px] pr-2">
              <p className="font-semibold leading-snug text-[#141414]" style={{ wordBreak: "keep-all" }}>{d.title}</p>
              <p className="mt-0.5 text-[8.5px] text-[#8C8C8C]">근거: {d.basis}</p>
            </td>
            <td className="whitespace-nowrap py-[7px] text-right font-semibold text-[#C1452D]"><R>{d.result}</R></td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export function StageProjection() {
  return (
    <div className="grid h-full grid-cols-3 grid-rows-[244px_1fr] gap-x-7 gap-y-[18px]">
      <Exhibit no="5.1" title="12개월 GP 시나리오" className="col-span-2" unit="월 GP, 억 원">
        <div className="absolute right-24 -top-[26px]">
          <Key items={[{ label: "실적", color: P.ink }, { label: "Base", color: P.ink, dashed: true }, { label: "레버 실행안", color: P.accent }, { label: "Up/Down 범위", color: "#E6E4DF", box: true }]} />
        </div>
        <Scenarios />
      </Exhibit>
      <Exhibit no="5.2" title="시나리오 가정">
        <Assumptions />
      </Exhibit>
      <Exhibit no="5.3" title="레버 민감도 (12개월 GP 변화)">
        <Sensitivity />
      </Exhibit>
      <Exhibit no="5.4" title="이 분석으로 바뀐 결정" className="col-span-2">
        <DecisionLog />
      </Exhibit>
    </div>
  )
}
