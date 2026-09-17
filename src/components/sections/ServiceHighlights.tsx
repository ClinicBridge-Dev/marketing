"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Check } from "lucide-react"
import { Container } from "@/components/common/Container"
import { SectionTitle } from "@/components/common/SectionTitle"
import { useStaggeredAnimation } from "@/lib/hooks/useMotionAnimation"

interface ServiceCard {
  title: string
  description: string
  logos: string[]
  features?: string[]
  bottomPrice?: string
  href?: string
  linkLabel?: string
}

const SERVICES: ServiceCard[] = [
  {
    title: "LINE 계정 세팅",
    description: "일본 마케팅 처음이신가요? 뭐부터 해야할지 모르겠고, 처음부터 큰 돈 쓰기는 부담스러우시다구요? 매출 발생의 첫 걸음, 라인 계정 세팅부터 진행하세요. 일본인 방문 가능성이 0에서 1로 바뀌는 가장 중요한 단계입니다.",
    logos: ["/images/line.png"],
    features: ["LINE 계정 생성 및 일본 현지화 세팅"],
    bottomPrice: "15만원",
  },
  {
    title: "바이럴 콘텐츠 마케팅 패키지",
    description: "우리 병원을 알리는 노출을 극대화하는 가장 좋은 선택. LINE 상담 인입이 폭발하게 해드립니다. (자체 계정 운영 및 LINE 상담 운영은 별도)",
    logos: ["/images/x.png", "/images/instagram.png"],
    features: ["X 정보성 콘텐츠 발행 10건", "X 인플루언서 방문형 콘텐츠 협찬 2건"],
    bottomPrice: "350만원",
  },
  {
    title: "월 정기 운영 플랜",
    description: "SNS·인플루언서·광고·PR을 통합 운영하는 올인원 플랜입니다. 컨설팅 50% + 실행 50%로 구성됩니다.",
    logos: ["/images/x.png", "/images/instagram.png", "/images/line.png"],
    features: [
      "SNS 콘텐츠 제작·운영 월 10건",
      "일본어 메신저(LINE) 상담 지원",
      "현지 보도자료(PR) 월 2건",
      "채널 전략 컨설팅",
      "인플루언서 검증 및 매칭",
      "성과 분석 리포트",
    ],
    bottomPrice: "월 500만원",
  },
]

export function ServiceHighlights() {
  const stagger = useStaggeredAnimation(SERVICES.length)

  return (
    <section className="section-padding bg-white">
      <Container>
        <SectionTitle
          title="실제 성과로 이어지는 마케팅 패키지 서비스"
          subtitle="채널별로 검증된 방식으로, 실행까지 책임집니다"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {SERVICES.map((service, index) => (
            <motion.div
              key={service.title}
              {...stagger(index)}
              className={`flex flex-col bg-white rounded-2xl p-6 ${
                service.title === "LINE 계정 세팅"
                  ? "border-2 border-[#06C755]"
                  : "border border-gray-200"
              }`}
            >
              {service.logos.length > 0 && (
                <div className="flex items-center gap-2 mb-4">
                  {service.logos.map((logo) => (
                    <div key={logo} className="relative h-7 w-7 shrink-0">
                      <Image src={logo} alt="" fill className="object-contain" sizes="28px" />
                    </div>
                  ))}
                </div>
              )}

              <h3 className="font-bold text-gray-900 text-base sm:text-lg mb-2">
                {service.title}
              </h3>
              {service.bottomPrice && (
                <p className="text-xl font-bold text-gray-900 mb-3 text-right">{service.bottomPrice}</p>
              )}
              <p
                className="text-sm text-gray-500 leading-relaxed mb-4"
                style={{ wordBreak: "keep-all" }}
              >
                {service.description}
              </p>

              {service.features && (
                <ul className="space-y-2 mb-6">
                  {service.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-gray-700">
                      <Check className="h-4 w-4 text-gray-700 shrink-0 mt-0.5" />
                      <span style={{ wordBreak: "keep-all" }}>{feature}</span>
                    </li>
                  ))}
                </ul>
              )}

              {service.bottomPrice ? (
                <Link
                  href="/inquiry"
                  className="mt-auto w-full inline-flex items-center justify-center gap-1 py-3 rounded-lg bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 transition-colors"
                >
                  문의하기
                  <ArrowRight className="h-4 w-4" />
                </Link>
              ) : (
                <Link
                  href={service.href ?? "/services"}
                  className="mt-auto inline-flex items-center gap-1 text-sm font-semibold text-gray-900 hover:underline"
                >
                  {service.linkLabel ?? "자세히 보기"}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              )}
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  )
}
