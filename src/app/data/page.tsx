"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Container } from "@/components/common/Container"
import { Button } from "@/components/common/Button"
import { ArticleHeader } from "@/components/common/ArticleHeader"
import { TableOfContents } from "@/components/common/TableOfContents"
import { ArticleCta } from "@/components/common/ArticleCta"
import { CategorySidebar } from "@/components/common/CategorySidebar"
import { RelatedContent } from "@/components/common/RelatedContent"
import { getBlogCategories, getRelatedContent } from "@/data/blogPosts"

const TOC_ITEMS = [
  { id: "key-summary", label: "핵심 요약" },
  { id: "customer-journey", label: "일본인 환자 5단계 고객 여정 분석" },
  { id: "pricing-strategy", label: "가격 민감도 & 티어별 상품 전략" },
  { id: "target-persona", label: "타겟 페르소나" },
  { id: "conclusion", label: "결론 및 제언" },
]

const STATS = [
  { value: "28%", label: "X(트위터) 인지도" },
  { value: "66%", label: "리뷰·증례 중시" },
  { value: "62%", label: "시술 메인 목적" },
  { value: "74%", label: "친구 추천 의향" },
]

const JOURNEY_STAGES = [
  {
    step: "1단계",
    title: "인지도 확보 단계 (Awareness)",
    question: "Q. 일본 환자들은 한국 피부과를 어떻게 처음 알게 될까?",
    facts: [
      <>
        <strong>X(트위터) 28%</strong> &gt; 인스타그램 15% &gt; 지인추천 13% &gt; 구글·블로그 10% 미만
      </>,
      "강남언니 등 예약앱으로 처음 알게 됐다는 경우는 4%뿐",
    ],
    insights: ["일본에서는 X 해시태그 기반 후기 공유가 활발 → 광고보다 타인 경험 노출 효과가 큼"],
    strategies: [
      "일본어 X 전용 계정 운영 → 전후 사진 + 시술 후기를 카드뉴스 형태로 스레드 업로드",
      "해시태그 최적화: #韓国美容クリニック #韓国美容皮膚科 #韓国美容整形",
    ],
  },
  {
    step: "2단계",
    title: "고려 단계 (Consideration)",
    question: "Q. 병원 선택 시 가장 중요하게 생각하는 요소는?",
    facts: [
      <>
        <strong>리뷰·증례(66%)</strong> &gt; 가격(62%) &gt; 접근성(45%) &gt; 일본어 대응(13%)
      </>,
      "장비·기술력 언급은 9% 수준으로 낮음",
    ],
    insights: [
      "가격 경쟁보다 증례 신뢰도 확보가 중요",
      "일본어 사례집 + 환자 후기 영상 노출 필요",
      <>
        의사 실력 강조보다는 <strong>&ldquo;이 시술을 받은 고객의 전후 비교&rdquo;</strong>가 전환율에
        결정적
      </>,
    ],
    strategies: [
      "일본어 증례 페이지 신설 → 시술명 + 효과 + 소요 시간 + 부작용 가능성 명시",
      "환자 후기 카드뉴스, 숏폼 영상 콘텐츠 강화",
      "병원보다는 환자 경험 중심 스토리텔링 필요",
    ],
  },
  {
    step: "3단계",
    title: "예약 및 방문 경험 단계 (Conversion & Experience)",
    question: "Q. 불편했던 점은 무엇일까?",
    facts: [
      <>
        <strong>예약·대기 문제 17%</strong> &gt; 언어 장벽 9% &gt; 결제·환전 4% &gt; 사후케어 4%
      </>,
      "예약앱보다는 DM, 메일, 전화 등 병원 개별 예약 비중 높음",
    ],
    insights: [
      "언어 지원보다 예약 확정 프로세스의 불투명성이 불만의 핵심",
      "“당일 몇 시에 시술 시작, 소요 시간, 세안·메이크업 가능 여부” 같은 디테일 선호",
    ],
    strategies: [
      "일본어 카카오톡 채널 or LINE 자동 알림 구축",
      <>
        <strong>&ldquo;예약 확정 → 시술 루틴 → 회복 가이드&rdquo;</strong>까지 한 번에 전달하는 체크리스트
        발송
      </>,
      "지불 수단 다양화(엔화 결제 가이드 + 면세 안내 + 환율 계산기 제공)",
    ],
  },
  {
    step: "4단계",
    title: "체류 목적과 병원 수요 (Needs)",
    question: "Q. 일본인들은 왜 한국에서 시술을 선택할까?",
    facts: [
      <>
        한국 여행 겸 시술(38%) &lt; <strong>시술 자체가 메인 목적(62%)</strong>
      </>,
      "가격보다 단기간 집중 관리 가능성이 주요 이유 중 하나",
    ],
    insights: [
      "일본인 상당수가 “관광 보조”가 아니라 시술 중심으로 한국을 방문",
      "회복 + 시술 패키지 일정 제안 시 만족도 극대화 가능",
    ],
    strategies: [
      "오전 시술 → 오후 쇼핑 코스 → 호텔 회복 루틴 등 1일 플랜 콘텐츠 제작",
      "“2박3일 피부 리프레시 패키지” → 항공권 시간대와 회복기간을 반영한 제안 필요",
    ],
  },
  {
    step: "5단계",
    title: "재방문 & 추천 단계 (Retention & Advocacy)",
    question: "Q. 일본 환자들의 재방문 의향은?",
    facts: [
      <>
        <strong>친구 추천 의향 74%, 재방문 의향 58%</strong>
      </>,
      "단순 체험형보다 장기 관리 목적의 수요가 많음",
    ],
    insights: [
      "일본 환자 LTV(평생가치) 높음 → 한 번 온 고객을 붙잡는 전략 필요",
      "기존 고객을 통한 바이럴 효과 극대화 가능",
    ],
    strategies: [
      "“재방문 시 10% 할인 + 홈케어 제품 제공” 리콜 마케팅",
      "친구 추천 시 아마존 기프트카드 지급 → 자연스러운 일본 커뮤니티 내 입소문",
    ],
  },
]

const TIERS = [
  {
    name: "Entry",
    price: "2~3만 엔",
    detail: "기본 관리 (피코토닝, 기본 보톡스)",
    target: "첫 방문 고객, 체험형",
  },
  {
    name: "Middle",
    price: "5~10만 엔",
    detail: "리프팅+피부재생 (리쥬란, 실리프팅)",
    target: "재방문 고객, 집중 케어",
  },
  {
    name: "Premium",
    price: "15만 엔 이상",
    detail: "줄기세포+고주파 복합 (종합 안티에이징)",
    target: "VIP 고객, 장기 관리",
  },
]

const PERSONA_GROUPS = [
  {
    title: "기본 정보",
    items: ["나이: 20대 후반 ~ 30대 중반", "직업: 회사원, 프리랜서", "소득: 안정적인 자기투자 가능"],
  },
  {
    title: "라이프스타일",
    items: [
      "평일 규칙적 근무, 주말 취미 활동",
      "‘미용 여행’ 목적으로 한국 방문",
      "최신 유행에 민감",
      "자기 투자에 적극적",
    ],
  },
  {
    title: "관심사",
    items: [
      "뷰티: 한국 코스메틱, 미용 의료",
      "여행: 한국 여행 전문",
      "문화: K-POP, 한국 드라마",
      "SNS: X, 인스타그램 적극 활용",
    ],
  },
  {
    title: "특징",
    items: [
      "한국 미용 의료의 장점을 이미 인지",
      "SNS 정보 → 직접 경험 → 후기 공유",
      "‘즐거운 경험’으로 미용을 인식",
      "단순 가격보다 품질과 경험 중시",
    ],
  },
]

function fade(delay: number) {
  return {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.5, delay },
  }
}

export default function DataPage() {
  const categories = getBlogCategories()

  return (
    <div className="min-h-screen bg-gray-100">
      <Container>
        <div className="py-10 sm:py-14">
        <div className="flex flex-col lg:flex-row gap-10">
          <CategorySidebar categories={categories} activeCategory="마케팅 리포트" />
          <div className="flex-1 lg:max-w-3xl">
          {/* 콘텐츠 카드 */}
          <motion.div {...fade(0)} className="bg-white border border-gray-100 p-6 sm:p-10">
          <ArticleHeader
            category="마케팅 리포트"
            title="일본인 고객 심층 분석"
            subtitle="일본 글로벌 환자 유치 전략을 위한 5단계 고객 여정 데이터"
            dateLabel="2025년 8월 25일"
            image="/images/blog/customer-journey-report-cover.png"
          />
          <TableOfContents items={TOC_ITEMS} />

          {/* 핵심 요약 */}
          <section id="key-summary" className="scroll-mt-24">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">핵심 요약</h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              {STATS.map((stat) => (
                <div key={stat.label} className="text-center bg-gray-50 p-4">
                  <p className="text-2xl sm:text-3xl font-bold text-[#C1452D] leading-tight">
                    {stat.value}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
                </div>
              ))}
            </div>

            <div className="bg-gray-50 p-5">
              <h3 className="font-bold text-gray-900 mb-3">핵심 인사이트</h3>
              <p className="text-sm text-gray-700 leading-relaxed" style={{ wordBreak: "keep-all" }}>
                <strong className="text-[#C1452D]">
                  일본인 고객은 관광보조가 아닌 시술 중심으로 한국을 방문
                </strong>
                하며, <strong className="text-[#C1452D]">X(트위터)</strong>를 통한 정보 획득과{" "}
                <strong className="text-[#C1452D]">리뷰·증례</strong> 신뢰도를 가장 중요하게
                생각합니다. <strong className="text-[#C1452D]">LINE 메신저</strong>를 통한 예약을
                선호하며, 높은 재방문 및 추천 의향을 보입니다.
              </p>
            </div>
          </section>

          {/* CTA */}
          <ArticleCta />

          {/* 고객 여정 분석 */}
          <section id="customer-journey" className="scroll-mt-24">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-8">
              일본인 환자 5단계 고객 여정 분석
            </h2>

            <div className="space-y-10">
              {JOURNEY_STAGES.map((stage) => (
                <div
                  key={stage.step}
                  className="relative border-2 border-gray-200 p-5 sm:p-7"
                >
                  <span className="absolute -top-3 left-5 bg-[#C1452D] text-white text-xs font-bold px-3 py-1 rounded-full">
                    {stage.step}
                  </span>

                  <h3 className="font-bold text-gray-900 text-lg mb-3">{stage.title}</h3>

                  <blockquote
                    className="border-l-4 border-[#C1452D] pl-4 italic text-gray-600 text-sm mb-4"
                    style={{ wordBreak: "keep-all" }}
                  >
                    {stage.question}
                  </blockquote>

                  <ul className="text-sm text-gray-700 space-y-2 mb-5 list-disc pl-5">
                    {stage.facts.map((fact, i) => (
                      <li key={i} style={{ wordBreak: "keep-all" }}>
                        {fact}
                      </li>
                    ))}
                  </ul>

                  <div className="bg-gray-50 p-4 mb-3">
                    <p className="font-semibold text-gray-900 text-sm mb-2">인사이트</p>
                    <ul className="text-sm text-gray-700 space-y-1.5 list-disc pl-5">
                      {stage.insights.map((insight, i) => (
                        <li key={i} style={{ wordBreak: "keep-all" }}>
                          {insight}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-[#FBEEE8] p-4">
                    <p className="font-semibold text-gray-900 text-sm mb-2">전략 제안</p>
                    <ul className="text-sm text-gray-700 space-y-1.5 list-disc pl-5">
                      {stage.strategies.map((strategy, i) => (
                        <li key={i} style={{ wordBreak: "keep-all" }}>
                          {strategy}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 가격 민감도 & 티어별 상품 전략 */}
          <section id="pricing-strategy" className="scroll-mt-24 border-t border-gray-100 pt-10 mt-10">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">
              가격 민감도 &amp; 티어별 상품 전략
            </h2>

            <h3 className="font-semibold text-gray-900 mb-3">Q. 일본인 고객의 지불 금액대는?</h3>

            <div className="bg-gray-50 p-5 mb-6">
              <ul className="text-sm text-gray-700 space-y-1.5 list-disc pl-5">
                <li>
                  <strong>엔화 환산 중앙값 약 3만 엔</strong>
                </li>
                <li>분포: 1만 엔 이하 20%, 3~10만 엔 50%, 15만 엔 이상 15%, 최고 250만 엔</li>
              </ul>
            </div>

            <div className="bg-[#FBEEE8] p-5 mb-8">
              <p className="font-semibold text-gray-900 text-sm mb-2">인사이트</p>
              <ul className="text-sm text-gray-700 space-y-1.5 list-disc pl-5">
                <li>저가 일괄 전략보다 프리미엄·중저가 티어 동시 운영이 유리</li>
                <li>상위 10% 고가 시술 수요도 놓치지 말아야 함</li>
              </ul>
            </div>

            <div className="border border-gray-100 overflow-x-auto">
              <table className="w-full min-w-[560px] text-sm text-left">
                <thead>
                  <tr className="bg-[#C1452D] text-white">
                    <th className="px-3 sm:px-4 py-3 font-semibold whitespace-nowrap">티어</th>
                    <th className="px-3 sm:px-4 py-3 font-semibold whitespace-nowrap">가격대</th>
                    <th className="px-3 sm:px-4 py-3 font-semibold">서비스 내용</th>
                    <th className="px-3 sm:px-4 py-3 font-semibold">타겟</th>
                  </tr>
                </thead>
                <tbody>
                  {TIERS.map((tier) => (
                    <tr key={tier.name} className="border-t border-gray-100">
                      <td className="px-3 sm:px-4 py-3 font-bold text-gray-900 whitespace-nowrap">{tier.name}</td>
                      <td className="px-3 sm:px-4 py-3 text-gray-700 whitespace-nowrap">{tier.price}</td>
                      <td className="px-3 sm:px-4 py-3 text-gray-700" style={{ wordBreak: "keep-all" }}>
                        {tier.detail}
                      </td>
                      <td className="px-3 sm:px-4 py-3 text-gray-700" style={{ wordBreak: "keep-all" }}>
                        {tier.target}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* 타겟 페르소나 */}
          <section id="target-persona" className="scroll-mt-24 border-t border-gray-100 pt-10 mt-10">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">
              타겟 페르소나: &ldquo;뷰티 오타쿠 여행자&rdquo;
            </h2>

            <div className="border-2 border-gray-200 p-6 sm:p-8">
              <div className="text-center mb-8">
                <span className="inline-block bg-[#C1452D] text-white font-bold text-lg px-6 py-2.5 rounded-full mb-3">
                  뷰티 오타쿠 여행자
                </span>
                <p className="text-sm text-gray-600" style={{ wordBreak: "keep-all" }}>
                  한국 미용 시술을 위해 적극적으로 여행하는 일본인 여성
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {PERSONA_GROUPS.map((group) => (
                  <div key={group.title} className="bg-gray-50 p-5">
                    <p className="font-semibold text-gray-900 text-sm mb-3">{group.title}</p>
                    <ul className="text-sm text-gray-700 space-y-1.5 list-disc pl-5">
                      {group.items.map((item, i) => (
                        <li key={i} style={{ wordBreak: "keep-all" }}>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* 결론 */}
          <section id="conclusion" className="scroll-mt-24 border-t border-gray-100 pt-10 mt-10">
          <div className="bg-black text-white text-center p-8 sm:p-12">
            <h2 className="text-xl sm:text-2xl font-bold mb-5">결론 및 제언</h2>
            <p
              className="text-sm sm:text-base text-white/80 leading-relaxed max-w-2xl mx-auto"
              style={{ wordBreak: "keep-all" }}
            >
              일본인 고객은 단순한 관광객이 아닌{" "}
              <strong className="text-white">&lsquo;전문 미용 의료 소비자&rsquo;</strong>입니다.
              의료 마케팅에서는 가격 경쟁이 아닌{" "}
              <strong className="text-white">표준화된 증례 자산과 체계적인 고객 경험 운영</strong>
              으로 장기 성장의 기반을 만들어야 합니다.{" "}
              <strong className="text-white">X(트위터)·LINE 기반 통합 디지털 마케팅</strong>과{" "}
              <strong className="text-white">티어별 상품 포트폴리오</strong>를 결합하면 높은 LTV의
              일본인 환자를 안정적으로 확보할 수 있습니다.
            </p>
            <div className="mt-8">
              <Button
                asChild
                variant="default"
                size="lg"
                className="rounded-none bg-white text-[#C1452D] hover:bg-gray-100"
              >
                <Link href="/inquiry">문의하기</Link>
              </Button>
            </div>
          </div>
          </section>
          </motion.div>

          {/* 관련 콘텐츠 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-8"
          >
            <RelatedContent items={getRelatedContent("/data")} />
          </motion.div>
          </div>
        </div>
        </div>
      </Container>
    </div>
  )
}
