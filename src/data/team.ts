// 클리닉브릿지 전담팀 구성. 메인 페이지 역량 섹션과 TeamGrid에서 공통으로 사용한다.

export interface TeamMember {
  name: string
  role: string
  description: string
  photo: string
}

export const TEAM_MEMBERS: TeamMember[] = [
  {
    name: "마케팅 전략",
    role: "대표, 전략 컨설턴트",
    description: "서울대학교 경영대학 졸업. 데이터 기반 글로벌 마케팅 전략을 전담 설계합니다.",
    photo: "/images/profiles/team-1.png",
  },
  {
    name: "콘텐츠 마케팅",
    role: "담당 매니저",
    description: "바이럴 콘텐츠, Before&After, 후기 콘텐츠를 기획하고 제작합니다.",
    photo: "/images/profiles/team-2.png",
  },
  {
    name: "인플루언서 파트너십",
    role: "담당 매니저",
    description: "검증된 일본 현지 인플루언서 풀을 매칭하고 캠페인을 운영합니다.",
    photo: "/images/profiles/team-3.png",
  },
  {
    name: "퍼포먼스 마케팅",
    role: "담당 매니저",
    description: "Meta, Google 광고를 운영하며 상담 리드 파이프라인을 구축합니다.",
    photo: "/images/profiles/team-4.png",
  },
  {
    name: "글로벌 SEO",
    role: "담당 컨설턴트",
    description: "핵심 키워드 상위 노출과 다국어 홈페이지 SEO를 컨설팅합니다.",
    photo: "/images/profiles/team-6.png",
  },
  {
    name: "현지 PR",
    role: "담당 매니저",
    description: "일본 주요 언론, 매거진에 PR 기사를 송출하고 신뢰 자산을 구축합니다.",
    photo: "/images/profiles/team-5.png",
  },
]
