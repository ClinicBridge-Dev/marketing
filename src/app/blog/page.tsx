"use client"

import { Suspense, useMemo, useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import Image from "next/image"
import { useSearchParams } from "next/navigation"
import { Container } from "@/components/common/Container"
import { CategorySidebar } from "@/components/common/CategorySidebar"
import { getAllBlogPosts, getBlogCategories, getUpcomingColumns } from "@/data/blogPosts"

const blogPosts = getAllBlogPosts()
const upcomingColumns = getUpcomingColumns()

// /data 리포트 페이지의 실제 메타 정보
const featuredReport = {
  href: "/data",
  category: "마케팅 리포트",
  title: "일본인 고객 심층 분석",
  subtitle: "일본 글로벌 환자 유치 전략을 위한 5단계 고객 여정 데이터",
  publishedAt: "2025년 8월 25일",
  method: "설문조사 데이터 분석",
  image: "/images/blog/customer-journey-report-cover.png",
}

const CARD_STYLES = [
  { bg: "bg-black", text: "text-white" },
  { bg: "bg-[#FBEEE8]", text: "text-gray-900" },
  { bg: "bg-[#C1452D]", text: "text-white" },
]

interface InsightItem {
  key: string
  /** 공개 예정 시리즈 회차 */
  part?: number
  /** 공개 예정 칼럼은 본문이 없어 링크하지 않는다 */
  href?: string
  upcoming?: boolean
  category: string
  title: string
  subtitle: string
  dateLabel: string
  image?: string
}

export default function BlogPage() {
  return (
    <Suspense fallback={null}>
      <BlogPageContent />
    </Suspense>
  )
}

function BlogPageContent() {
  const searchParams = useSearchParams()

  const items = useMemo<InsightItem[]>(() => {
    const report: InsightItem = {
      key: featuredReport.href,
      href: featuredReport.href,
      category: featuredReport.category,
      title: featuredReport.title,
      subtitle: featuredReport.subtitle,
      dateLabel: featuredReport.publishedAt,
      image: featuredReport.image,
    }

    const posts: InsightItem[] = blogPosts.map((post) => ({
      key: post.slug,
      href: `/blog/${post.slug}`,
      category: post.category,
      title: post.title,
      subtitle: post.excerpt,
      dateLabel: new Date(post.date).toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      image: post.featuredImage,
    }))

    const upcoming: InsightItem[] = upcomingColumns.map((column) => ({
      key: column.id,
      upcoming: true,
      part: column.part,
      category: column.category,
      title: column.title,
      subtitle: "",
      dateLabel: "공개 예정",
    }))

    // 공개 예정 칼럼은 대표 리포트 바로 뒤에 두어 새 시장 리서치가 눈에 띄게 한다
    return [report, ...upcoming, ...posts]
  }, [])

  const categories = useMemo(() => getBlogCategories(), [])

  const requestedCategory = searchParams.get("category")
  const [activeCategory, setActiveCategory] = useState(
    requestedCategory && categories.includes(requestedCategory) ? requestedCategory : "전체"
  )

  const filteredItems =
    activeCategory === "전체" ? items : items.filter((item) => item.category === activeCategory)

  return (
    <div className="min-h-screen bg-white">
      <Container>
        <div className="py-16">
          <div className="flex flex-col lg:flex-row gap-10">
            {/* 카테고리 사이드바 */}
            <CategorySidebar
              categories={categories}
              activeCategory={activeCategory}
              onSelect={setActiveCategory}
            />

            {/* 본문 */}
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">그로스LAB</h1>
              <p className="text-sm text-gray-500 mb-6" style={{ wordBreak: "keep-all" }}>
                클리닉브릿지가 일본, 영미권 등 시장별로 직접 운영하며 쌓은 해외환자 마케팅 리서치와 인사이트를 공유합니다.
              </p>
              <div className="border-b border-gray-200 mb-10" />

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredItems.map((item, index) => {
                  const style = CARD_STYLES[index % CARD_STYLES.length]
                  return (
                    <motion.div
                      key={item.key}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.08 }}
                    >
                      {item.upcoming ? <UpcomingCard item={item} /> : <InsightCard item={item} style={style} />}
                    </motion.div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  )
}

function InsightCard({ item, style }: { item: InsightItem; style: (typeof CARD_STYLES)[number] }) {
  return (
    <Link
      href={item.href ?? "/blog"}
      className="flex flex-col group rounded-2xl overflow-hidden border border-gray-200 bg-white"
    >
      {item.image ? (
        <div className="relative h-[160px] shrink-0">
          <Image
            src={item.image}
            alt=""
            fill
            className="object-cover"
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          />
        </div>
      ) : (
        <div className={`p-6 flex items-end h-[160px] shrink-0 ${style.bg} ${style.text}`}>
          <p className="font-bold text-lg leading-snug line-clamp-2" style={{ wordBreak: "keep-all" }}>
            {item.title}
          </p>
        </div>
      )}

      <div className="p-4 h-[132px] shrink-0 flex flex-col">
        <span className="text-xs font-medium text-gray-500">{item.category}</span>
        <h3
          className="mt-1 font-bold text-gray-900 text-base leading-snug line-clamp-2 group-hover:text-[#C1452D] transition-colors"
          style={{ wordBreak: "keep-all" }}
        >
          {item.title}
        </h3>
        <p className="mt-auto pt-2 text-xs text-gray-500">{item.dateLabel}</p>
      </div>
    </Link>
  )
}

// 공개 예정 칼럼: 클릭되지 않는 카드. 표지에 "공개 예정" 배지와 시리즈 회차를 보여준다.
function UpcomingCard({ item }: { item: InsightItem }) {
  return (
    <div className="flex flex-col rounded-2xl overflow-hidden border border-dashed border-gray-300 bg-white" aria-disabled>
      <div className="relative flex h-[160px] shrink-0 flex-col justify-between bg-[#F6F5F2] p-5">
        <span className="self-start rounded-full bg-[#141414] px-2.5 py-1 text-[11px] font-semibold text-white">공개 예정</span>
        {item.part && (
          <p className="text-5xl font-bold tracking-tight text-[#141414]/15 tabular-nums">{String(item.part).padStart(2, "0")}</p>
        )}
      </div>

      <div className="p-4 h-[132px] shrink-0 flex flex-col">
        <span className="text-xs font-medium text-[#C1452D]">{item.category}</span>
        <h3 className="mt-1 font-bold text-gray-900 text-base leading-snug line-clamp-2" style={{ wordBreak: "keep-all" }}>
          {item.title}
        </h3>
        <p className="mt-auto pt-2 text-xs text-gray-500">{item.dateLabel}</p>
      </div>
    </div>
  )
}
