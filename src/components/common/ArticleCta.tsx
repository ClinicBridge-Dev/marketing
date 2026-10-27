import Link from "next/link"
import { Button } from "@/components/common/Button"

export function ArticleCta() {
  return (
    <div className="bg-black text-white text-center p-8 sm:p-10 my-10">
      <h3 className="font-bold text-lg sm:text-xl mb-2">우리 병원에 맞는 전략이 궁금하신가요?</h3>
      <p className="text-sm text-white/70 mb-6" style={{ wordBreak: "keep-all" }}>
        도입 상담을 통해 대표 진료·디지털 자산·목표 예산을 함께 진단해드립니다.
      </p>
      <Button asChild variant="default" size="lg" className="rounded-none bg-white text-[#C1452D] hover:bg-gray-100">
        <Link href="/inquiry" data-meta-placement="article_cta">문의하기</Link>
      </Button>
    </div>
  )
}
