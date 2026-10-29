// 함께한 파트너 로고 목록. 메인 파트너 그리드와 LogoWall(마키)에서 공통으로 사용한다.

export interface LogoItem {
  id: number
  name: string
  logo: string
  bg?: string
  width?: number
  height?: number
}

export const PARTNER_LOGOS: LogoItem[] = [
  { id: 1, name: "종근당", logo: "/images/logo_ckd_trim.png", width: 138, height: 34 },
  { id: 2, name: "온누리약국", logo: "/images/logo_onnuri_pharmacy_trim.png", width: 154, height: 43 },
  { id: 3, name: "파미셀", logo: "/images/logo_pharmicell_trim.png", width: 140, height: 44 },
  { id: 4, name: "강남언니", logo: "/images/강남언니_logo_trim.png", width: 161, height: 30 },
  { id: 6, name: "블리비", logo: "/images/블리비_logo_trim.png", width: 112, height: 45 },
  { id: 7, name: "손유나", logo: "/images/sonyouna_logo_trim.png", width: 92, height: 87 },
  { id: 8, name: "더스퀘어치과", logo: "/images/logo_thesquare_dental_trim.png", width: 210, height: 49 },
  { id: 9, name: "오픈닥터", logo: "/images/오픈닥터_logo_trim.png", width: 97, height: 27 },
  { id: 10, name: "플랫팜", logo: "/images/플랫팜_logo_trim.png", width: 136, height: 46 },
  { id: 11, name: "셀린클리닉", logo: "/images/cellin_logo_trim.png", width: 136, height: 52 },
  { id: 12, name: "Thome", logo: "/images/logo_Thome_trim.png", width: 140, height: 26 },
  { id: 13, name: "셀올로지", logo: "/images/logo_cellology_trim.png", width: 140, height: 37 },
  { id: 14, name: "김현수클리닉", logo: "/images/logo_kimhyunsoo_clinic.svg", width: 220, height: 22 },
]
