// 메인 히어로의 타깃 시장 정의. 문구 순환("ㅁㅁ 환자가 먼저 찾는")과 지구본 애니메이션이 함께 사용한다.
// 지구본은 각 시장 도시(출발)에서 서울(도착)로 환자가 들어오는 인바운드 흐름을 그린다.

export interface GeoPoint {
  name: string
  lat: number
  lon: number
}

export interface TargetMarket {
  key: string
  label: string
  en: string
  /**
   * 지구본 시점. lat/lon 은 화면 중앙에 오는 위경도, zoom 은 지구본 확대 배율.
   * 근거리 시장은 살짝 확대해 도시 간격을 벌린다.
   */
  focus: { lat: number; lon: number; zoom: number }
  cities: GeoPoint[]
}

export const HUB_CITY: GeoPoint = { name: "SEOUL", lat: 37.57, lon: 126.98 }

export const TARGET_MARKETS: TargetMarket[] = [
  {
    key: "jp",
    label: "일본",
    en: "Japan",
    focus: { lat: 26, lon: 136, zoom: 1.25 },
    cities: [
      { name: "TOKYO", lat: 35.68, lon: 139.69 },
      { name: "OSAKA", lat: 34.69, lon: 135.5 },
      { name: "FUKUOKA", lat: 33.59, lon: 130.4 },
      { name: "SAPPORO", lat: 43.06, lon: 141.35 },
    ],
  },
  {
    key: "en",
    label: "영미권",
    en: "English-speaking",
    focus: { lat: 22, lon: -172, zoom: 1 },
    cities: [
      { name: "LOS ANGELES", lat: 34.05, lon: -118.24 },
      { name: "NEW YORK", lat: 40.71, lon: -74.0 },
      { name: "LONDON", lat: 51.5, lon: -0.13 },
      { name: "SYDNEY", lat: -33.87, lon: 151.21 },
    ],
  },
  {
    key: "tw",
    label: "대만",
    en: "Taiwan",
    focus: { lat: 24, lon: 118, zoom: 1.35 },
    cities: [
      { name: "TAIPEI", lat: 25.03, lon: 121.56 },
      { name: "TAICHUNG", lat: 24.15, lon: 120.67 },
      { name: "KAOHSIUNG", lat: 22.63, lon: 120.3 },
    ],
  },
]

export const MARKET_ROTATE_MS = 3600
