import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Container } from "@/components/common/Container"
import { SectionHeader } from "./SectionHeader"

export function PartnershipCta() {
  return (
    <section className="bg-[#0A0A0A] py-24 lg:py-36 text-white">
      <Container>
        <SectionHeader
          tone="dark"
          index="05"
          label="Contact"
          title={<>클리닉브릿지와의 파트너십으로<br />클리닉을 성장시켜보세요.</>}
        />

        <div className="mt-14 grid lg:grid-cols-12 lg:gap-6">
          <div className="lg:col-start-4 lg:col-span-9 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between border-t border-white/15 pt-6">
            <p className="text-sm sm:text-base text-white/55" style={{ wordBreak: "keep-all" }}>
              병원의 현재 상황과 목표를 알려주시면, 담당 컨설턴트가 검토 후 연락드립니다.
            </p>
            <Link
              href="/inquiry"
              data-meta-placement="partnership_cta"
              className="group inline-flex h-12 shrink-0 items-center gap-3 self-start rounded-full bg-[#D65A3B] pl-6 pr-2 text-sm font-semibold text-white transition-colors hover:bg-[#B84A2E]"
            >
              파트너십 문의하기
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 transition-transform duration-300 group-hover:translate-x-0.5">
                <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
          </div>
        </div>
      </Container>
    </section>
  )
}
