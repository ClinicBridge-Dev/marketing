// 메인 페이지 "숫자로 확인하는 클리닉브릿지 해외환자유치 성과" 섹션의 월별 예약자 수.
// 기준: 계약 클라이언트 예약, 취소와 노쇼 제외. forecast=true 인 달은 예상치
// (피부과 인바운드 시즌성과 최근 월간 성장률을 반영한 추정값, 화면에는 "예상" 구간으로만 표시).

export interface MonthlyPatientCount {
  month: number
  label: string
  value: number
  forecast: boolean
}

export const GROWTH_YEAR = 2026

export const MONTHLY_PATIENTS: MonthlyPatientCount[] = [
  { month: 1, label: "1월", value: 1842, forecast: false },
  { month: 2, label: "2월", value: 1715, forecast: false },
  { month: 3, label: "3월", value: 2064, forecast: false },
  { month: 4, label: "4월", value: 2196, forecast: false },
  { month: 5, label: "5월", value: 2438, forecast: false },
  { month: 6, label: "6월", value: 2305, forecast: false },
  { month: 7, label: "7월", value: 2512, forecast: false },
  { month: 8, label: "8월", value: 2687, forecast: false },
  { month: 9, label: "9월", value: 3119, forecast: false },
  { month: 10, label: "10월", value: 3496, forecast: true },
  { month: 11, label: "11월", value: 3962, forecast: true },
  { month: 12, label: "12월", value: 4538, forecast: true },
]

export interface GrowthSummary {
  latestActual: MonthlyPatientCount
  firstActual: MonthlyPatientCount
  yearEndForecast: MonthlyPatientCount
  actualTotal: number
  growthSinceFirst: number
  avgMonthlyGrowth: number
}

export function summarizeGrowth(data: MonthlyPatientCount[] = MONTHLY_PATIENTS): GrowthSummary {
  const actual = data.filter((d) => !d.forecast)
  const firstActual = actual[0]
  const latestActual = actual[actual.length - 1]
  const periods = actual.length - 1

  return {
    firstActual,
    latestActual,
    yearEndForecast: data[data.length - 1],
    actualTotal: actual.reduce((sum, d) => sum + d.value, 0),
    growthSinceFirst: latestActual.value / firstActual.value - 1,
    avgMonthlyGrowth: Math.pow(latestActual.value / firstActual.value, 1 / periods) - 1,
  }
}

export function monthOverMonth(data: MonthlyPatientCount[], index: number): number | null {
  if (index <= 0) return null
  return data[index].value / data[index - 1].value - 1
}
