"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import {
  Twitter,
  Instagram,
  MessageCircle as LineIcon,
  Search,
  Newspaper,
  Youtube,
} from "lucide-react"
import { Container } from "@/components/common/Container"
import { SectionTitle } from "@/components/common/SectionTitle"
import { Button } from "@/components/common/Button"
import { Service } from "@/components/sections/Service"
import { useMotionAnimation, useStaggeredAnimation } from "@/lib/hooks/useMotionAnimation"

const SERVICES = [
  {
    icon: Twitter,
    title: "바이럴 콘텐츠 마케팅",
    subtitle: "낮은 CAC로 대규모 인지도 확보",
    description:
      "X(구 Twitter) 등 현지 SNS 채널에서 바이럴 캠페인을 직접 설계·운영합니다.",
    items: [
      "X(트위터) 등 현지 SNS 계정 기획·운영",
      "Before&After, 후기 콘텐츠 제작",
      "해시태그·트렌드 기반 바이럴 캠페인 설계",
    ],
  },
  {
    icon: Instagram,
    title: "인플루언서 마케팅",
    subtitle: "전환 성과로 연결되는 콘텐츠 자산",
    description:
      "검증된 일본 현지 인플루언서 풀을 활용해 통합 콘텐츠 캠페인을 운영합니다.",
    items: [
      "검증된 일본 현지 인플루언서 풀 매칭",
      "팔로워 규모별 캠페인 구성",
      "콘텐츠 가이드라인 수립 및 성과 관리",
    ],
  },
  {
    icon: LineIcon,
    title: "퍼포먼스 광고 (DB)",
    subtitle: "리드 파이프라인 구축",
    description:
      "Meta·Google 등 글로벌 광고 플랫폼을 통해 잠재 고객의 상담 리드를 확보합니다.",
    items: [
      "Meta·Google 광고 세팅 및 운영",
      "상담 리드(DB) 확보 최적화",
      "광고 소재 A/B 테스트 및 리포팅",
    ],
  },
  {
    icon: Search,
    title: "글로벌 SEO",
    subtitle: "장기 자산 확보",
    description:
      "글로벌 구글 검색 결과에서 시술 등 핵심 키워드 및 브랜드 키워드에서의 상위 노출을 확보합니다.",
    items: [
      "핵심 시술·브랜드 키워드 상위 노출",
      "다국어 홈페이지 SEO 컨설팅",
      "생성형 검색(GEO) 노출 대응",
    ],
  },
  {
    icon: Newspaper,
    title: "현지 PR·매거진",
    subtitle: "신뢰 자산 구축",
    description:
      "일본 주요 언론과 뷰티·헬스케어 매거진에 PR 기사를 송출합니다. 프리미엄 브랜딩과 신뢰도 구축에 효과적입니다.",
    items: [
      "일본 주요 언론·뷰티 매거진 PR 송출",
      "프리미엄 브랜딩 콘텐츠 기획",
      "신뢰도 구축을 위한 보도자료 작성",
    ],
  },
  {
    icon: Youtube,
    title: "브랜드 채널 운영",
    subtitle: "Owned Media",
    description:
      "유튜브 등 영상 채널에서 진료 과정, 임상 결과 등을 체계적으로 콘텐츠화하여 업로드합니다.",
    items: [
      "유튜브 등 영상 채널 콘텐츠 기획",
      "진료 과정·임상 결과 콘텐츠화",
      "Owned Media 채널 운영 및 관리",
    ],
  },
]

const PROCESS = [
  { step: "1", title: "진단", detail: "병원 상황과 목표를 진단하고 대표 진료를 정합니다." },
  { step: "2", title: "전략 설계", detail: "채널 조합과 콘텐츠·예산 배분 전략을 설계합니다." },
  { step: "3", title: "실행", detail: "콘텐츠 제작, 인플루언서 매칭, 광고 운영을 실행합니다." },
  { step: "4", title: "리포팅", detail: "성과를 분석하고 다음 액션으로 전략을 조정합니다." },
]

export default function ServicesPage() {
  const heroMotion = useMotionAnimation()
  const serviceStagger = useStaggeredAnimation(SERVICES.length)
  const processStagger = useStaggeredAnimation(PROCESS.length)

  return (
    <div>
      <Service />

      {/* 서비스 상세 */}
      <section className="section-padding bg-white">
        <Container>
          <SectionTitle
            title="6가지 통합 마케팅 서비스"
            subtitle="채널별로 독립 운영하거나, 정기 운영 플랜으로 통합 구성할 수 있습니다"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {SERVICES.map((service, index) => {
              const Icon = service.icon
              return (
                <motion.div
                  key={service.title}
                  {...serviceStagger(index)}
                  className="p-6 sm:p-8 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="w-12 h-12 rounded-full bg-[#FBEEE8] flex items-center justify-center mb-5">
                    <Icon className="h-6 w-6 text-[#C1452D]" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{service.title}</h3>
                  <p className="text-sm text-gray-500 mb-3">{service.subtitle}</p>
                  <p className="text-gray-700 text-sm leading-relaxed mb-4" style={{ wordBreak: "keep-all" }}>
                    {service.description}
                  </p>
                  <ul className="space-y-2">
                    {service.items.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm text-gray-600">
                        <span className="text-[#C1452D] mt-1">·</span>
                        <span style={{ wordBreak: "keep-all" }}>{item}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )
            })}
          </div>
        </Container>
      </section>

      {/* 진행 프로세스 */}
      <section className="section-padding bg-gray-100">
        <Container>
          <SectionTitle title="이렇게 진행됩니다" />
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-5 max-w-5xl mx-auto">
            {PROCESS.map((p, index) => (
              <motion.div
                key={p.step}
                {...processStagger(index)}
                className="p-6 rounded-2xl bg-white border border-gray-100 shadow-sm text-center"
              >
                <div className="w-10 h-10 rounded-full bg-[#C1452D] text-white font-bold flex items-center justify-center mx-auto mb-3">
                  {p.step}
                </div>
                <h4 className="font-bold text-gray-900 mb-1">{p.title}</h4>
                <p className="text-xs text-gray-500 leading-relaxed" style={{ wordBreak: "keep-all" }}>
                  {p.detail}
                </p>
              </motion.div>
            ))}
          </div>
        </Container>
      </section>

      {/* CTA */}
      <section className="section-padding bg-black">
        <Container>
          <motion.div {...heroMotion} className="text-center max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4" style={{ wordBreak: "keep-all" }}>
              우리 병원에 맞는 서비스 조합이 궁금하신가요?
            </h2>
            <p className="text-white/80 mb-8 leading-relaxed" style={{ wordBreak: "keep-all" }}>
              상담을 통해 병원 상황에 맞는 채널 조합과 견적을 안내해 드립니다.
            </p>
            <Button
              asChild
              variant="default"
              size="lg"
              className="bg-white text-[#C1452D] hover:bg-gray-100 shadow-lg font-semibold"
            >
              <Link href="/inquiry" data-meta-placement="services">문의하기</Link>
            </Button>
          </motion.div>
        </Container>
      </section>
    </div>
  )
}
