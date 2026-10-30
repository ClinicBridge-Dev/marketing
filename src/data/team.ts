// 클리닉브릿지 전담 그로스팀 구성. 메인 페이지 역량 섹션(Growth Team)과 TeamGrid에서 공통으로 사용한다.
// 배열 순서 = 3열 그리드 배치 순서 (상단 좌, 중, 우 → 하단 좌, 중, 우).

export interface TeamMember {
  name: string
  role: string
  /** 현재 메인 화면에서는 노출하지 않는다 */
  description?: string
  photo: string
}

export const TEAM_MEMBERS: TeamMember[] = [
  { name: "마케팅 전략", role: "대표, 전략 컨설턴트", photo: "/images/profiles/team-1.png" },
  { name: "마케팅 전략, 마케팅 연구", role: "부대표, 전략 컨설턴트", photo: "/images/profiles/team-2.png" },
  { name: "일본 바이럴 및 파트너십", role: "담당 매니저", photo: "/images/profiles/team-3.png" },
  { name: "프로젝트 리드, AX", role: "담당 매니저", photo: "/images/profiles/team-4.png" },
  { name: "기술 운영, AX", role: "Tech 매니저", photo: "/images/profiles/team-6.png" },
  { name: "고객 경험 및 채널 운영", role: "CX / Owned 매니저", photo: "/images/profiles/team-5.png" },
]
