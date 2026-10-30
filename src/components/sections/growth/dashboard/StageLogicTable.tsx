// 로직 표: 이슈 → 가설 → 검증 데이터 → 분석 결과 → 실행안, 영향도와 난이도(하비볼), 우선순위.
// 대시보드 전체가 블러 처리되므로 표의 구조와 밀도가 읽히는 정도면 충분하다.

import { Exhibit, P } from "./primitives"

const ROWS = [
  { issue: "일본 신환 정체", hyp: "예약전환 단계 이탈", data: "퍼널, 상담 로그", find: "예약전환 벤치마크 대비 -8%p", act: "상담 응답 SLA 15분", impact: 4, effort: 1, pr: "P1" },
  { issue: "매출 대비 GP 낮음", hyp: "저마진 시술 편중", data: "시술별 GP", find: "매출 1위 시술 GP 4위", act: "GP 상위 패키지 재구성", impact: 3, effort: 2, pr: "P1" },
  { issue: "CAC 상승", hyp: "채널 믹스 비효율", data: "채널별 CAC, LTV", find: "Meta CAC 1.6배", act: "예산 30% 재배분", impact: 3, effort: 1, pr: "P1" },
  { issue: "재진 저조", hyp: "재방문 접점 부재", data: "코호트 재진율", find: "90일 재진 38%", act: "재진 시퀀스 자동화", impact: 3, effort: 2, pr: "P2" },
  { issue: "노쇼 증가", hyp: "리마인드 미흡", data: "예약, 내원 로그", find: "D-1 미확인 노쇼 62%", act: "D-3, D-1 리마인드", impact: 2, effort: 1, pr: "P2" },
  { issue: "야간 문의 유실", hyp: "상담 인력 공백", data: "요일x시간 히트맵", find: "일 22~24시 집중", act: "야간 상담 교대", impact: 2, effort: 2, pr: "P2" },
  { issue: "영미권 검색 감소", hyp: "키워드 경쟁 심화", data: "검색량, SOV", find: "주요 키워드 SOV -5%p", act: "롱테일 콘텐츠 확장", impact: 2, effort: 3, pr: "P3" },
  { issue: "Organic 비중 정체", hyp: "후기 유인 부족", data: "K, 후기 수", find: "후기 작성률 11%", act: "UGC 리워드 설계", impact: 2, effort: 2, pr: "P3" },
  { issue: "통역 비용 증가", hyp: "배치 비효율", data: "코디 가동률", find: "주간 유휴 34%", act: "시간대별 배치 최적화", impact: 1, effort: 1, pr: "P3" },
]

function Harvey({ value }: { value: number }) {
  const r = 6
  const angle = (value / 4) * Math.PI * 2
  const x = r + r * Math.sin(angle)
  const y = r - r * Math.cos(angle)
  return (
    <svg width={14} height={14} viewBox="-1 -1 14 14" className="mx-auto block">
      <circle cx={r} cy={r} r={r} fill="#fff" stroke={P.ink} />
      {value >= 4 ? (
        <circle cx={r} cy={r} r={r} fill={P.ink} />
      ) : value > 0 ? (
        <path d={`M${r},${r} L${r},0 A${r},${r} 0 ${value > 2 ? 1 : 0},1 ${x},${y} Z`} fill={P.ink} />
      ) : null}
    </svg>
  )
}

const PR_STYLE: Record<string, string> = {
  P1: "bg-[#C1452D] text-white",
  P2: "bg-[#141414] text-white",
  P3: "border border-[#C9C6BF] text-[#4A4A4A]",
}

export function StageLogicTable() {
  return (
    <div className="h-full">
      <Exhibit no="L.1" title="이슈 → 가설 → 검증 → 실행 로직 표" unit="우선순위 기준: 영향도 x 난이도" className="h-full">
        <table className="w-full text-[9.5px]">
          <thead>
            <tr className="border-b-[1.5px] border-[#141414] text-left text-[8.5px] text-[#8C8C8C]">
              <th className="w-6 py-1.5 font-normal">#</th>
              <th className="py-1.5 font-normal">이슈</th>
              <th className="py-1.5 font-normal">가설</th>
              <th className="py-1.5 font-normal">검증 데이터</th>
              <th className="py-1.5 font-normal">분석 결과</th>
              <th className="py-1.5 font-normal">실행안</th>
              <th className="w-12 py-1.5 text-center font-normal">영향도</th>
              <th className="w-12 py-1.5 text-center font-normal">난이도</th>
              <th className="w-14 py-1.5 text-center font-normal">우선순위</th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((r, i) => (
              <tr key={r.issue} className="border-b border-[#EEECE8] align-middle" style={{ height: 47 }}>
                <td className="tabular-nums text-[#8C8C8C]">{String(i + 1).padStart(2, "0")}</td>
                <td className="pr-3 font-semibold text-[#141414]">{r.issue}</td>
                <td className="pr-3 text-[#4A4A4A]">{r.hyp}</td>
                <td className="pr-3 text-[#4A4A4A]">
                  <span className="border border-[#D4D2CC] px-1.5 py-[2px]">{r.data}</span>
                </td>
                <td className="pr-3 font-medium" style={{ color: r.pr === "P1" ? P.accent : P.ink }}>{r.find}</td>
                <td className="pr-3 text-[#141414]">{r.act}</td>
                <td><Harvey value={r.impact} /></td>
                <td><Harvey value={r.effort} /></td>
                <td className="text-center">
                  <span className={`inline-block px-2 py-[2px] text-[9px] font-semibold ${PR_STYLE[r.pr]}`}>{r.pr}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Exhibit>
    </div>
  )
}
