"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import { Users, ShieldCheck } from "lucide-react"
import { Container } from "@/components/common/Container"
import { SectionTitle } from "@/components/common/SectionTitle"
import { ServiceHighlights } from "@/components/sections/ServiceHighlights"
import { QuoteCta } from "@/components/sections/QuoteCta"
import { cn } from "@/lib/utils"
import { useStaggeredAnimation } from "@/lib/hooks/useMotionAnimation"

const ADD_ON_CATEGORIES = ["노출", "전환", "기타"] as const

const ADD_ON_SERVICES = [
  { name: "채널별 SNS 운영 대행", price: "1,000,000원", unit: "/ 월", note: "채널 1개 기준", category: "노출", logo: "/images/instagram.png" },
  { name: "인플루언서 협찬", price: "350,000~1,600,000원", unit: "/ 인", note: "팔로워 규모별 차등", category: "노출", logo: "/images/ameba.png" },
  { name: "퍼포먼스 마케팅 운영", price: "2,200,000원", unit: "/ 월", note: "Meta·Google 등", category: "노출", logo: "/images/google.png" },
  { name: "강남언니 광고 운영", price: "1,000,000원", unit: "/ 월", note: "", category: "노출", logo: "/images/강남언니_logo.png" },
  { name: "홈페이지 SEO / GEO 컨설팅", price: "25,000,000원", unit: "(1회)", note: "", category: "노출", logo: "/images/google.png" },
  { name: "일본어 메신저 상담 대행", price: "1,500,000원", unit: "/ 월", note: "LINE 상담 응대", category: "전환", logo: "/images/line.png" },
  { name: "오프라인 상담 이벤트", price: "5,000,000원", unit: "+ 성과 20%", note: "현지 상담회 기획·운영", category: "전환", icon: Users },
  { name: "KAHF 인증 지원", price: "15,000,000원", unit: "", note: "", category: "기타", icon: ShieldCheck },
]

const NOTES = [
  "모든 가격은 부가세(VAT) 별도입니다.",
  "월 정기 운영 플랜은 최소 3개월 계약을 기준으로 합니다.",
  "병원 규모, 진료과, 목표에 따라 구성과 견적이 조정될 수 있습니다.",
  "애드온 서비스는 정기 운영 플랜과 별도로, 또는 함께 구성할 수 있습니다.",
]

export default function PricingPage() {
  const [activeCategory, setActiveCategory] = useState<(typeof ADD_ON_CATEGORIES)[number]>(
    ADD_ON_CATEGORIES[0]
  )
  const filteredAddOns = ADD_ON_SERVICES.filter((service) => service.category === activeCategory)
  const addOnStagger = useStaggeredAnimation(filteredAddOns.length)

  return (
    <div>
      <ServiceHighlights />

      {/* 안내 사항 */}
      <section className="pb-16 lg:pb-24 bg-white">
        <Container>
          <div className="max-w-2xl">
            <h3 className="text-sm font-bold text-gray-900 mb-4">안내 사항</h3>
            <ul className="space-y-2">
              {NOTES.map((note) => (
                <li key={note} className="text-sm text-gray-500 flex items-start gap-2">
                  <span className="text-gray-300">·</span>
                  <span style={{ wordBreak: "keep-all" }}>{note}</span>
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </section>

      {/* 애드온 서비스 */}
      <section className="section-padding bg-white">
        <Container>
          <SectionTitle
            title="애드온 서비스"
            subtitle="필요한 항목만 골라 패키지 또는 정기 운영 플랜에 더할 수 있습니다"
          />

          <div className="flex justify-center gap-2 mb-8">
            {ADD_ON_CATEGORIES.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
                className={cn(
                  "px-5 py-2 rounded-full text-sm font-medium transition-colors",
                  activeCategory === category
                    ? "bg-gray-900 text-white"
                    : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300"
                )}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-x-auto">
            <table className="w-full min-w-[560px] table-fixed text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="w-[40%] px-3 sm:px-6 py-4 text-sm font-semibold text-gray-900">서비스</th>
                  <th className="w-[30%] px-3 sm:px-6 py-4 text-sm font-semibold text-gray-900">가격</th>
                  <th className="w-[30%] px-3 sm:px-6 py-4 text-sm font-semibold text-gray-900">비고</th>
                </tr>
              </thead>
              <tbody>
                {filteredAddOns.map((service, index) => (
                  <motion.tr
                    key={service.name}
                    {...addOnStagger(index)}
                    className="border-b border-gray-100 last:border-b-0"
                  >
                    <td className="px-3 sm:px-6 py-4 font-semibold text-gray-900">
                      <div className="flex items-center gap-2.5">
                        {service.logo ? (
                          <Image
                            src={service.logo}
                            alt=""
                            width={20}
                            height={20}
                            className="h-5 w-5 object-contain shrink-0"
                          />
                        ) : (
                          service.icon && (
                            <service.icon className="h-5 w-5 text-gray-700 shrink-0" strokeWidth={1.75} />
                          )
                        )}
                        {service.name}
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-4">
                      <span className="text-lg font-bold text-gray-900">{service.price}</span>
                      {service.unit && <span className="text-sm text-gray-500"> {service.unit}</span>}
                    </td>
                    <td className="px-3 sm:px-6 py-4 text-sm text-gray-500">{service.note || "-"}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </Container>
      </section>

      <QuoteCta />
    </div>
  )
}
