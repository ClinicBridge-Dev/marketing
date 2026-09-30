"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Container } from "@/components/common/Container"
import { SectionTitle } from "@/components/common/SectionTitle"
import { QuoteCta } from "@/components/sections/QuoteCta"
import { useStaggeredAnimation } from "@/lib/hooks/useMotionAnimation"
import { cn } from "@/lib/utils"

// ── 05 로컬라이징 ─────────────────────────────────────────
const LOCALIZATION_ROWS = [
  { label: "문장 톤", literal: "한국어 어순과 말투 그대로", cb: "현지 SNS에서 쓰는 말투와 길이로" },
  { label: "키워드", literal: "한국어 해시태그 직역", cb: "현지 검색어 기준으로 다시 선정" },
  { label: "관점", literal: "국내 환자 기준 안내", cb: "한국 방문을 계획하는 사람 기준 안내" },
  { label: "채널 형식", literal: "같은 글을 모든 채널에 복사", cb: "X는 짧게, 블로그는 길게, 채널별로 재구성" },
]

// ── 07 비교 ───────────────────────────────────────────────
const COMPARISON_ROWS = [
  { label: "월 비용", agency: "국가당 월 수백만 원", cb: "월 19만 원부터" },
  { label: "진행 확인", agency: "월말 보고서로 확인", cb: "발행된 콘텐츠를 채널에서 바로 확인" },
  { label: "운영 기준", agency: "대행사 기획과 일정에 맞춤", cb: "원장님이 올린 콘텐츠가 곧 기준" },
  { label: "노하우 축적", agency: "담당자가 바뀌면 처음부터 다시", cb: "우리 병원의 맥락을 그대로 유지" },
  { label: "시작까지", agency: "계약, 기획 회의, 세팅 기간 필요", cb: "온라인 결제 후 계정 연결로 바로 시작" },
]

// ── 08 요금제 ─────────────────────────────────────────────
const PLANS = [
  {
    badge: "시작 추천",
    name: "1개국 (일본 or 영미)",
    price: "월 19.9만원",
    perMarket: "국가당 월 19.9만원",
    features: ["국가 1개", "인스타그램", "콘텐츠 업로드수 (월 20개 이내)"],
    highlight: true,
    purchaseUrl: "https://www.latpeed.com/memberships/6abb445b8d8cfe9f30423aba/pay/28Sir",
  },
  {
    badge: "주력 국가 확장",
    name: "3개국 (일본, 영미, 대만)",
    price: "월 39.9만원",
    perMarket: "국가당 월 13.3만원",
    features: ["국가 3개", "인스타그램", "콘텐츠 업로드수 (국가별 월 20개 이내)"],
    highlight: false,
    purchaseUrl: "https://www.latpeed.com/memberships/6abb445b8d8cfe9f30423aba/pay/t4Pdf",
  },
  {
    badge: "글로벌",
    name: "Worldwide",
    price: "월 59.9만원",
    perMarket: "국가당 월 11.98만원",
    features: ["국가 5개", "인스타그램", "콘텐츠 업로드수 (국가별 월 20개 이내)"],
    highlight: false,
    purchaseUrl: "https://www.latpeed.com/memberships/6abb445b8d8cfe9f30423aba/pay/gZ25I",
  },
]

// ── 09 도입 절차 ──────────────────────────────────────────
const ONBOARDING_STEPS = [
  { step: "01", title: "플랜 결제", description: "웹사이트에서 플랜을 고르고 월 구독으로 결제합니다." },
  { step: "02", title: "계정 연결", description: "국내 계정 링크와 해외 계정 정보를 등록합니다." },
  { step: "03", title: "병원 정보 설정", description: "카톡방을 생성하고, 병원의 특장점을 원장님과 소통합니다." },
  { step: "04", title: "운영 시작", description: "첫 콘텐츠가 발행되고, 이후 성과는 대시보드에서 확인합니다." },
]

function Section({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle?: string
  children?: React.ReactNode
}) {
  return (
    <section className="section-padding bg-white">
      <Container>
        <SectionTitle title={title} subtitle={subtitle} />
        {children}
      </Container>
    </section>
  )
}

export default function AutopilotPage() {
  const planStagger = useStaggeredAnimation(PLANS.length)
  const onboardStagger = useStaggeredAnimation(ONBOARDING_STEPS.length)

  return (
    <div>
      {/* 인트로 */}
      <section className="bg-white pt-0 pb-6 lg:pb-8">
        <div className="relative overflow-hidden shadow-lg">
          <div className="absolute inset-0">
            <Image
              src="/images/hero-skyscraper.png"
              alt="Hero background"
              fill
              className="object-cover"
              priority
              sizes="100vw"
            />
          </div>

          <div className="absolute inset-0 bg-black/60" />

          <div className="relative z-10 flex items-center min-h-[361px] lg:min-h-[428px] py-8 lg:py-10 px-6 lg:px-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-2xl mx-auto"
            >
              <h1
                className="font-bold text-white mb-5 text-[27px] sm:text-[33px] lg:text-[41px] leading-[1.3] sm:whitespace-nowrap"
                style={{ wordBreak: "keep-all" }}
              >
                한국 인스타만 운영하세요.
                <br />
                자동으로 해외환자유치 가능성이 열립니다.
              </h1>

              <p
                className="text-white/80 font-normal text-base sm:text-lg leading-relaxed"
                style={{ wordBreak: "keep-all" }}
              >
                기존 국내 채널에 올린 콘텐츠를 국가별로 재창작해
                <br />
                해외환자 유치용 SNS 채널에 직접 발행하고 운영하는 월 구독 서비스입니다.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 08 요금제 */}
      <Section title="운영할 국가 수만 고르시면 됩니다">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {PLANS.map((plan, i) => (
              <motion.div
                key={plan.name}
                {...planStagger(i)}
                className={cn(
                  "flex flex-col bg-white rounded-2xl p-6",
                  plan.highlight ? "border-2 border-[#C1452D]" : "border border-gray-200"
                )}
              >
                <span className="self-start text-xs font-semibold px-3 py-1 rounded-full mb-4 bg-gray-100 text-gray-500">
                  {plan.badge}
                </span>
                <p className="font-bold text-gray-900 text-lg mb-1">{plan.name}</p>
                <p className="text-2xl font-bold text-gray-900 mb-1">{plan.price}</p>
                <p className="text-xs text-gray-400 mb-5">{plan.perMarket}</p>
                <div className="border-t border-gray-100 mb-5" />
                <ul className="space-y-2 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className="text-sm text-gray-600 flex items-start gap-2">
                      <span className="mt-1.5 h-1 w-1 rounded-full shrink-0 bg-[#C1452D]" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href={plan.purchaseUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-auto w-full inline-flex items-center justify-center gap-1 py-3 rounded-lg bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 transition-colors"
                >
                  플랜 구매하기
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </motion.div>
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-6" style={{ wordBreak: "keep-all" }}>
            이용 중 언제든 플랜 변경 및 해지하실 수 있습니다.
          </p>
        </div>
      </Section>

      {/* 09 도입 절차 */}
      <Section title="결제부터 첫 발행까지, 네 단계면 끝납니다">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
            {ONBOARDING_STEPS.map((step, i) => (
              <motion.div key={step.step} {...onboardStagger(i)} className="bg-white border border-gray-200 rounded-2xl p-6">
                <p className="text-xl font-bold text-[#C1452D] mb-3">{step.step}</p>
                <h3 className="font-bold text-gray-900 text-base mb-2">{step.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed" style={{ wordBreak: "keep-all" }}>
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
          <div className="rounded-2xl p-6 sm:p-8 bg-[#FBEEE8] flex flex-col sm:flex-row sm:items-center gap-3">
            <span className="shrink-0 text-sm font-bold text-[#C1452D]">준비하실 것</span>
            <p className="text-sm text-gray-700 leading-relaxed" style={{ wordBreak: "keep-all" }}>
              운영 중인 국내 계정 링크, 그리고 보유 중인 해외 계정 정보. 해외 계정이 없다면 개설부터
              함께 진행합니다.
            </p>
          </div>
        </div>
      </Section>

      {/* 05 로컬라이징 */}
      <Section title="번역이 아니라, 현지에서 만든 것처럼 다시 씁니다">
        <div className="max-w-5xl mx-auto">
          <div className="rounded-2xl bg-white border border-gray-200 shadow-sm overflow-x-auto mb-6">
            <table className="w-full min-w-[560px] text-sm text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="px-4 sm:px-6 py-3 font-semibold text-gray-900">구분</th>
                  <th className="px-4 sm:px-6 py-3 font-semibold text-gray-500">단순 번역</th>
                  <th className="px-4 sm:px-6 py-3 font-semibold text-gray-900">클리닉브릿지 현지화</th>
                </tr>
              </thead>
              <tbody>
                {LOCALIZATION_ROWS.map((row) => (
                  <tr key={row.label} className="border-t border-gray-100">
                    <td className="px-4 sm:px-6 py-3 font-semibold text-gray-900 whitespace-nowrap">{row.label}</td>
                    <td className="px-4 sm:px-6 py-3 text-gray-400" style={{ wordBreak: "keep-all" }}>
                      {row.literal}
                    </td>
                    <td className="px-4 sm:px-6 py-3 font-medium text-gray-900" style={{ wordBreak: "keep-all" }}>
                      {row.cb}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="border border-gray-200 rounded-2xl p-5 sm:p-6 bg-white">
              <p className="text-xs font-semibold text-gray-400 mb-3">예시 | 국내 인스타그램 원문</p>
              <p className="text-sm text-gray-700 leading-relaxed" style={{ wordBreak: "keep-all" }}>
                여름 휴가 전 피부 컨디션 끌어올리기! 리쥬란 이벤트 진행 중입니다.
              </p>
            </div>
            <div className="rounded-2xl p-5 sm:p-6 bg-white border-2 border-[#C1452D]">
              <p className="text-xs font-semibold text-[#C1452D] mb-3">예시 | 일본 X 재창작</p>
              <p className="text-sm text-gray-900 leading-relaxed mb-2" style={{ wordBreak: "keep-all" }}>
                韓国で話題のリジュラン、夏の渡韓前に受けたい方へ。日本語でご相談いただけます。
              </p>
              <p className="text-xs text-gray-400 leading-relaxed" style={{ wordBreak: "keep-all" }}>
                (한국에서 화제인 리쥬란, 여름 한국 방문 전에 받고 싶은 분께. 일본어로 상담 가능합니다.)
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* 07 비교 */}
      <Section title="해외 마케팅 대행과 무엇이 다른가">
        <div className="max-w-5xl mx-auto">
          <div className="rounded-2xl bg-white border border-gray-200 shadow-sm overflow-x-auto mb-6">
            <table className="w-full min-w-[560px] text-sm text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="px-4 sm:px-6 py-3 font-semibold text-gray-900">구분</th>
                  <th className="px-4 sm:px-6 py-3 font-semibold text-gray-500">일반 해외 마케팅 대행</th>
                  <th className="px-4 sm:px-6 py-3 font-semibold text-gray-900">클리닉브릿지 운영</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON_ROWS.map((row) => (
                  <tr key={row.label} className="border-t border-gray-100">
                    <td className="px-4 sm:px-6 py-3 font-semibold text-gray-900 whitespace-nowrap">{row.label}</td>
                    <td className="px-4 sm:px-6 py-3 text-gray-400" style={{ wordBreak: "keep-all" }}>
                      {row.agency}
                    </td>
                    <td className="px-4 sm:px-6 py-3 font-medium text-gray-900" style={{ wordBreak: "keep-all" }}>
                      {row.cb}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-sm text-gray-500" style={{ wordBreak: "keep-all" }}>
            광고 집행, 인플루언서, 전담 운영까지 필요한 병원은 클리닉브릿지 대행 상품으로 별도 안내해
            드립니다.
          </p>
        </div>
      </Section>

      <QuoteCta title="다른 마케팅 대행 상품 견적을 원하시나요?" />
    </div>
  )
}
