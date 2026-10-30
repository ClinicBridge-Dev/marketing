"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { Container } from "@/components/common/Container"
import { SectionTitle } from "@/components/common/SectionTitle"
import { useStaggeredAnimation } from "@/lib/hooks/useMotionAnimation"
import { TEAM_MEMBERS as MEMBERS } from "@/data/team"

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
