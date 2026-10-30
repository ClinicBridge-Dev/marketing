import type { Metadata } from "next"
import Link from "next/link"
import { Container } from "@/components/common/Container"
import { Button } from "@/components/common/Button"

// 상담 신청 완료(Thank-you) 페이지.
// 폼 제출 성공 시 /inquiry 페이지(InquiryForm)와 상담 모달(InquiryDialog)이 이 경로로 이동한다.
// 광고 전환은 각 폼의 제출 핸들러에서 서버 접수 확인 후 이미 보내므로 이 페이지는 순수 확인 UI다
// (Google Ads: 두 폼 모두, OpenAI lead_created: InquiryForm만).
// 여기서 전환을 보내면 새로고침·직접 방문이 중복 집계되니 추가하지 않는다.
// 직접 방문/색인으로 인한 허수 전환을 막기 위해 noindex 처리한다.
export const metadata: Metadata = {
  title: "상담 신청 완료 - 클리닉브릿지",
  description: "도입 상담 신청이 정상적으로 접수되었습니다.",
  robots: { index: false, follow: false },
  alternates: { canonical: undefined },
}

export default function InquiryCompletePage() {
  return (
    <div className="min-h-[70vh] flex items-center bg-gray-50">
      <Container>
        <div className="max-w-xl mx-auto text-center py-16">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#C1452D]/10">
            <svg
              className="h-9 w-9 text-[#C1452D]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            도입 상담 신청이 접수되었습니다
          </h1>

          <p className="text-gray-600 leading-relaxed mb-8">
            전담 컨설턴트가 영업일 기준 1~2일 이내에
            <br className="hidden sm:block" />
            {" "}남겨주신 연락처로 직접 연락드리겠습니다.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild variant="gradient" size="lg">
              <Link href="/">홈으로 돌아가기</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/blog">그로스LAB 둘러보기</Link>
            </Button>
          </div>
        </div>
      </Container>
    </div>
  )
}
