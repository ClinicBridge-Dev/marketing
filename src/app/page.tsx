"use client"

import { GrowthHero } from "@/components/sections/growth/GrowthHero"
import { GrowthMetrics } from "@/components/sections/growth/GrowthMetrics"
import { PartnerGrid } from "@/components/sections/growth/PartnerGrid"
import { Capabilities } from "@/components/sections/growth/Capabilities"
import { PartnerFit } from "@/components/sections/growth/PartnerFit"
import { PartnershipCta } from "@/components/sections/growth/PartnershipCta"

// 2026-10 "클리닉 그로스 컴퍼니" 메시지 기반 메인 개편.
// 히어로만 모션 효과(셰이더 배경, 키네틱 타이포), 이후 섹션은 정적인 에이전시 그리드.
export default function HomePage() {
  return (
    <>
      <GrowthHero />
      <GrowthMetrics />
      <PartnerGrid />
      <Capabilities />
      <PartnerFit />
      <PartnershipCta />
    </>
  )
}
