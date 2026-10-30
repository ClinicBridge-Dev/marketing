// HOW 로직트리 (가로 전체 폭). 목표 → How 1 → How 2 → 실행안과 KPI.
// 대시보드 전체가 블러 처리되므로 트리 구조와 박스 배치가 읽히는 정도면 충분하다.

import { Exhibit, P } from "./primitives"

interface Leaf {
  how2: string
  action: string
  kpi: string
  owner: string
  /** 실행 기간 (1~12개월 중 시작, 끝) */
  span: [number, number]
  impact: number // 0~4 하비볼
}

interface Branch {
  how1: string
  leaves: Leaf[]
}

const GOAL = "12개월 내 해외환자 GP 2배"

const TREE: Branch[] = [
  {
    how1: "신환 확대",
    leaves: [
      { how2: "타깃 시술 검색 점유율(SOV) 확대", action: "시술명 키워드 클러스터별 인플루언서 집중 바이럴", kpi: "SOV, 노출", owner: "콘텐츠", span: [1, 4], impact: 4 },
      { how2: "문의 → 예약 전환 개선", action: "LINE 상담 응답 SLA 15분, 예약 링크 단축", kpi: "예약전환율", owner: "상담", span: [1, 3], impact: 4 },
      { how2: "예약 → 내원율 개선", action: "D-3, D-1 리마인드 자동화, 노쇼 재예약 플로우", kpi: "내원율, 노쇼율", owner: "운영", span: [2, 5], impact: 2 },
    ],
  },
  {
    how1: "재진, 객단가 확대",
    leaves: [
      { how2: "재진 리텐션 강화", action: "시술별 재방문 주기 기반 재진 시퀀스", kpi: "90일 재진율", owner: "CRM", span: [3, 8], impact: 3 },
      { how2: "GP 상위 시술 중심 패키지", action: "스킨부스터 중심 패키지 재구성, 리프팅 단가 조정", kpi: "객단가, GP율", owner: "전략", span: [2, 6], impact: 3 },
    ],
  },
  {
    how1: "획득 효율 개선",
    leaves: [
      { how2: "채널 믹스 재배분", action: "CAC vs LTV 기준 예산 30% 재배분", kpi: "블렌디드 CAC", owner: "퍼포먼스", span: [1, 2], impact: 3 },
      { how2: "Organic K 강화", action: "후기, UGC 리워드 설계와 추천 코드", kpi: "K, Organic 비중", owner: "콘텐츠", span: [4, 10], impact: 2 },
      { how2: "운영 비용 절감", action: "통역, 코디 배치 최적화 (문의 히트맵 기반)", kpi: "건당 운영비", owner: "운영", span: [3, 6], impact: 1 },
    ],
  },
]

const ROW_H = 54
const TOP = 26
const COL = { goal: [0, 150], how1: [186, 156], how2: [380, 214], leaf: [632, 504] } as const

function Harvey({ value }: { value: number }) {
  const r = 7
  const angle = (value / 4) * Math.PI * 2
  const x = r + r * Math.sin(angle)
  const y = r - r * Math.cos(angle)
  const large = value > 2 ? 1 : 0
  return (
    <svg width={r * 2 + 2} height={r * 2 + 2} viewBox={`-1 -1 ${r * 2 + 2} ${r * 2 + 2}`}>
      <circle cx={r} cy={r} r={r} fill="#fff" stroke={P.ink} />
      {value === 4 ? (
        <circle cx={r} cy={r} r={r} fill={P.ink} />
      ) : value > 0 ? (
        <path d={`M${r},${r} L${r},0 A${r},${r} 0 ${large},1 ${x},${y} Z`} fill={P.ink} />
      ) : null}
    </svg>
  )
}

export function StageHowTree() {
  const leaves = TREE.flatMap((b) => b.leaves)
  const rowY = (i: number) => TOP + i * ROW_H
  const mid = (i: number) => rowY(i) + 23

  let cursor = 0
  const branches = TREE.map((b) => {
    const start = cursor
    cursor += b.leaves.length
    return { ...b, start, end: cursor - 1, y: (mid(start) + mid(cursor - 1)) / 2 }
  })
  const goalY = (mid(0) + mid(leaves.length - 1)) / 2
  const elbow = (x1: number, y1: number, x2: number, y2: number) => `M${x1},${y1} H${(x1 + x2) / 2} V${y2} H${x2}`

  return (
    <div className="h-full">
      <Exhibit no="H.1" title="HOW 트리: 목표 달성 경로와 실행안" unit="12개월 로드맵" className="h-full">
        <div className="absolute inset-0">
          {/* 열 머리글 */}
          {[
            ["목표", COL.goal],
            ["How 1", COL.how1],
            ["How 2", COL.how2],
            ["실행안", COL.leaf],
          ].map(([t, [x, w]]) => (
            <span key={t as string} className="absolute top-0 text-[9px] font-semibold tracking-wide text-[#8C8C8C]" style={{ left: x as number, width: w as number }}>
              {t as string}
            </span>
          ))}
          <div className="absolute top-0 flex text-[8.5px] text-[#8C8C8C]" style={{ left: COL.leaf[0] + 4 + 196 + 12 + 52 + 12, width: 204 }}>
            {Array.from({ length: 12 }, (_, m) => <span key={m} className="flex-1 text-center">{m + 1}</span>)}
          </div>

          <svg className="absolute inset-0" width={1136} height={TOP + leaves.length * ROW_H}>
            <g fill="none" stroke="#9C9891" strokeWidth={1}>
              {branches.map((b) => (
                <path key={b.how1} d={elbow(COL.goal[0] + COL.goal[1], goalY, COL.how1[0], b.y)} />
              ))}
              {branches.map((b) =>
                b.leaves.map((_, k) => (
                  <path key={`${b.how1}-${k}`} d={elbow(COL.how1[0] + COL.how1[1], b.y, COL.how2[0], mid(b.start + k))} />
                ))
              )}
              {leaves.map((_, i) => (
                <line key={i} x1={COL.how2[0] + COL.how2[1]} x2={COL.leaf[0]} y1={mid(i)} y2={mid(i)} />
              ))}
            </g>
          </svg>

          {/* 목표 */}
          <div
            className="absolute flex items-center justify-center bg-[#141414] px-3 text-center text-[12px] font-bold leading-snug text-white"
            style={{ left: COL.goal[0], width: COL.goal[1], top: goalY - 34, height: 68 }}
          >
            {GOAL}
          </div>

          {/* How 1 */}
          {branches.map((b, i) => (
            <div
              key={b.how1}
              className="absolute flex items-center border-[1.5px] px-2.5 text-[11px] font-semibold"
              style={{
                left: COL.how1[0],
                width: COL.how1[1],
                top: b.y - 20,
                height: 40,
                borderColor: i === 0 ? P.accent : P.ink,
                color: i === 0 ? P.accent : P.ink,
                background: i === 0 ? P.accentTint : "#fff",
              }}
            >
              <span className="mr-1.5 text-[9px] text-[#8C8C8C]">{String.fromCharCode(65 + i)}</span>
              {b.how1}
            </div>
          ))}

          {/* How 2 + 실행안 */}
          {leaves.map((l, i) => (
            <div key={l.action}>
              <div
                className="absolute flex items-center border border-[#C9C6BF] bg-white px-2.5 text-[10px] leading-snug text-[#141414]"
                style={{ left: COL.how2[0], width: COL.how2[1], top: rowY(i) + 4, height: 38 }}
              >
                {l.how2}
              </div>
              <div
                className="absolute flex items-center gap-3 border-b border-[#EEECE8] px-1"
                style={{ left: COL.leaf[0], width: COL.leaf[1], top: rowY(i), height: ROW_H - 4 }}
              >
                <div className="w-[196px] shrink-0">
                  <p className="text-[10px] font-semibold leading-snug text-[#141414]">{l.action}</p>
                  <p className="mt-0.5 text-[8.5px] text-[#8C8C8C]">KPI: {l.kpi}</p>
                </div>
                <span className="w-[52px] shrink-0 border border-[#D4D2CC] px-1 py-[2px] text-center text-[8.5px] text-[#4A4A4A]">{l.owner}</span>
                <div className="relative h-[10px] w-[204px] shrink-0 bg-[#F5F3EF]">
                  <div
                    className="absolute inset-y-0"
                    style={{
                      left: `${((l.span[0] - 1) / 12) * 100}%`,
                      width: `${((l.span[1] - l.span[0] + 1) / 12) * 100}%`,
                      background: l.impact >= 4 ? P.accent : P.ink,
                    }}
                  />
                </div>
                <Harvey value={l.impact} />
              </div>
            </div>
          ))}
        </div>
      </Exhibit>
    </div>
  )
}
