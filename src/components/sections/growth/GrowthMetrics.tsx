import { Container } from "@/components/common/Container"
import { FORECAST_NOTE, GROWTH_YEAR, MONTHLY_PATIENTS, summarizeGrowth } from "@/data/growthMetrics"
import { GrowthChart } from "./GrowthChart"
import { SectionHeader } from "./SectionHeader"

const summary = summarizeGrowth()
const nf = new Intl.NumberFormat("ko-KR")

const KPIS = [
  { label: `${summary.latestActual.label} 유치 실적`, value: nf.format(summary.latestActual.value), unit: "명" },
  { label: `${summary.firstActual.label} 대비 성장`, value: `+${Math.round(summary.growthSinceFirst * 100)}`, unit: "%" },
  { label: "월평균 성장률", value: `+${(summary.avgMonthlyGrowth * 100).toFixed(1)}`, unit: "%" },
  { label: `${summary.yearEndForecast.label} 예상`, value: nf.format(summary.yearEndForecast.value), unit: "명" },
]

const CASES = [
  { client: "다이어트 클리닉", metric: "2,000만회+", description: "6개월 간 누적 조회수" },
  { client: "B 클리닉", metric: "0 → 5억 원", description: "단일 국가 제로 투 매출 달성" },
]

export function GrowthMetrics() {
  return (
    <section id="growth" className="scroll-mt-16 bg-white py-24 lg:py-36">
      <Container>
        <SectionHeader
          index="01"
          label="Performance"
          title={<>숫자로 확인하는<br />해외 성장</>}
          description="빠르게 성장하는 클리닉브릿지의 그로스 엔진에 탑승하세요."
        />

        <div className="mt-16 lg:mt-24 grid grid-cols-2 lg:grid-cols-4 gap-px border border-black/10 bg-black/10">
          {KPIS.map((kpi) => (
            <div key={kpi.label} className="bg-white p-5 sm:p-6">
              <p className="text-sm text-gray-500">{kpi.label}</p>
              <p className="mt-6 text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-[-0.03em] tabular-nums text-[#0A0A0A]">
                {kpi.value}
                <span className="ml-1 text-base sm:text-lg font-medium text-gray-400">{kpi.unit}</span>
              </p>
            </div>
          ))}
        </div>

        <div className="border-x border-b border-black/10 p-4 sm:p-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-[#0A0A0A]">월별 해외환자 유치 현황</h3>
              <p className="mt-1 text-xs sm:text-sm text-gray-500">
                {GROWTH_YEAR}년 1월~12월, 단위: 명 (취소, 노쇼 미포함 예약 기준)
              </p>
            </div>
            <div className="flex items-center gap-5 text-xs text-gray-500">
              <span className="flex items-center gap-2">
                <span className="h-0.5 w-5 bg-[#0A0A0A]" /> 실적
              </span>
              <span className="flex items-center gap-2">
                <span className="w-5 border-t-2 border-dashed border-gray-400" /> 예상
              </span>
            </div>
          </div>
          <div className="mt-8">
            <GrowthChart data={MONTHLY_PATIENTS} />
          </div>
          <p className="mt-4 text-[11px] sm:text-xs text-gray-400" style={{ wordBreak: "keep-all" }}>
            {FORECAST_NOTE}. 그래프에 마우스를 올리거나 탭하면 월별 수치를 볼 수 있습니다.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-px border-x border-b border-black/10 bg-black/10">
          {CASES.map((c) => (
            <div key={c.client} className="bg-white p-5 sm:p-8">
              <p className="text-sm text-gray-500">{c.client}</p>
              <p className="mt-8 text-4xl sm:text-5xl font-semibold tracking-[-0.035em] text-[#0A0A0A]">{c.metric}</p>
              <p className="mt-3 text-base text-gray-600">{c.description}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  )
}
