"use client"

import { GrowthHero } from "@/components/sections/growth/GrowthHero"
import { GrowthMetrics } from "@/components/sections/growth/GrowthMetrics"
import { LogoWall } from "@/components/sections/LogoWall"
import { Capabilities } from "@/components/sections/growth/Capabilities"
import { PartnerFit } from "@/components/sections/growth/PartnerFit"
import { PartnershipCta } from "@/components/sections/growth/PartnershipCta"
import { SectionIntro } from "@/components/sections/growth/SectionIntro"

// 2026-10 "클리닉 그로스 컴퍼니" 메시지 기반 메인 개편.
// 히어로: 셰이더 배경 + 인바운드 지구본. 이후 섹션: 화이트와 미색 교차 배경 위의 정돈된 카드와 타이포.
export default function HomePage() {
  return (
    <>
      <GrowthHero />
      <GrowthMetrics />
      <LogoWall
        monochrome
        className="bg-[#F6F5F2] py-24 lg:py-32"
        intro={
          <SectionIntro
            eyebrow="Trusted"
            accent="Partners"
            lines={["함께하는 파트너"]}
            description="대형 제약사를 포함해 여러 코스피 상장사와 함께합니다."
            className="mb-14 lg:mb-20"
          />
        }
      />
      <Capabilities />
      <PartnerFit />
      <PartnershipCta />
    </>
  )
}
