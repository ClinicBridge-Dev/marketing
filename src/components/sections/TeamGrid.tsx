"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { Container } from "@/components/common/Container"
import { SectionTitle } from "@/components/common/SectionTitle"
import { useStaggeredAnimation } from "@/lib/hooks/useMotionAnimation"

interface Member {
  name: string
  role: string
  description: string
  photo: string
}

const MEMBERS: Member[] = [
  {
    name: "마케팅 전략",
    role: "대표 · 전략 컨설턴트",
    description: "서울대학교 경영대학 졸업. 데이터 기반 글로벌 마케팅 전략을 전담 설계합니다.",
    photo: "/images/profiles/team-1.png",
  },
  {
    name: "콘텐츠 마케팅",
    role: "담당 매니저",
    description: "바이럴 콘텐츠, Before&After, 후기 콘텐츠를 기획·제작합니다.",
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
    description: "Meta·Google 광고를 운영하며 상담 리드 파이프라인을 구축합니다.",
    photo: "/images/profiles/team-4.png",
  },
  {
    name: "글로벌 SEO",
    role: "담당 컨설턴트",
    description: "핵심 키워드 상위 노출과 다국어 홈페이지 SEO를 컨설팅합니다",
    photo: "/images/profiles/team-6.png",
  },
  {
    name: "현지 PR",
    role: "담당 매니저",
    description: "일본 주요 언론·매거진에 PR 기사를 송출하고 신뢰 자산을 구축합니다.",
    photo: "/images/profiles/team-5.png",
  },
]

export function TeamGrid() {
  const stagger = useStaggeredAnimation(MEMBERS.length)

  return (
    <section className="pt-16 lg:pt-24 pb-40 lg:pb-56 bg-white">
      <Container>
        <SectionTitle
          title="각 분야 전문가가 함께합니다"
          subtitle="채널별 전담 담당자가 배치되어 있어, 빠르고 정확한 실행이 가능합니다"
        />

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-5">
          {MEMBERS.map((member, index) => (
            <motion.div key={member.name} {...stagger(index)} className="flex flex-col">
              <div className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden bg-[#FBEEE8] mb-3">
                <Image
                  src={member.photo}
                  alt={member.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 50vw, 16vw"
                />
              </div>
              <p className="font-bold text-gray-900 text-sm sm:text-base leading-snug">{member.name}</p>
              <p className="text-xs sm:text-sm text-[#C1452D] font-medium mb-2">{member.role}</p>
              <p className="text-xs text-gray-500 leading-relaxed" style={{ wordBreak: "keep-all" }}>
                {member.description}
              </p>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  )
}
