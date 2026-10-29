// 메인 히어로 "ㅁㅁ 환자가 먼저 찾는 클리닉" 의 ㅁㅁ 자리에 순환 노출되는 타깃 시장.

export interface TargetMarket {
  key: string
  label: string
  en: string
}

export const TARGET_MARKETS: TargetMarket[] = [
  { key: "jp", label: "일본", en: "Japan" },
  { key: "en", label: "영미권", en: "English-speaking" },
  { key: "tw", label: "대만", en: "Taiwan" },
]

export const MARKET_ROTATE_MS = 3200
