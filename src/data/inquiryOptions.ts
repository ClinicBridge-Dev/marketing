// 도입 상담 폼(/inquiry)의 선택지. 폼 화면과 입력 검증이 같은 목록을 쓴다.
// 상품 구성·가격은 2026-10-23 Slack 논의(심영훈 안) 기준. 가격은 모두 부가세 별도.

export const COUNTRY_OPTIONS = ["일본", "영미/영어권", "대만", "동남아", "기타"] as const

export interface InterestOption {
  /** 저장·알림에 쓰는 이름 */
  value: string
  /** 폼에 보이는 한 줄 설명 */
  description: string
  /** 폼에 보이는 가격. 없으면 표시하지 않는다 */
  price?: string
}

// 관심 서비스는 하나만 고른다. 국가별 전담 에이전시는 요금 방식이 다른 두 상품으로 나눈다.
export const INTEREST_OPTIONS: InterestOption[] = [
  {
    value: "국가별 전담 에이전시 (기본료 + 성과)",
    description: "월 기본료로 국가별 전담 팀이 시술 선정부터 콘텐츠·인플루언서·현지어 상담까지 운영하고, 성과에 따라 수수료를 더해요",
    price: "월 500만 원 + 해외 환자 매출의 15%",
  },
  {
    value: "국가별 전담 에이전시 (성과 연동)",
    description: "기본료 없이 같은 전담 운영을 받고, 해외 환자 매출에 연동한 수수료만 내요",
    price: "해외 환자 매출의 20~30%",
  },
  {
    value: "바이럴 확산 마케팅 패키지",
    description: "현지 인플루언서와 바이럴 콘텐츠로 단기간에 인지도를 높이는 패키지",
    price: "350만~500만 원",
  },
  {
    value: "Worldwide GTM 파트너십",
    description: "진출할 국가 선정부터 현지 시장 분석, 국가별 실행 로드맵까지 함께 설계",
    price: "별도 협의",
  },
  {
    value: "아직 정하지 못했어요",
    description: "상담하면서 맞는 방식을 추천받고 싶어요",
  },
]

/** 가격 표시에 붙는 공통 안내 */
export const PRICE_NOTE = "가격은 부가세 별도"

export const REVENUE_OPTIONS = ["월 3천만~5천만 원", "월 5천만~1억 원", "월 1억 원 이상"] as const
