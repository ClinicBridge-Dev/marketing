import Image from "next/image"
import { Container } from "@/components/common/Container"
import { PARTNER_LOGOS } from "@/data/partners"
import { SectionHeader } from "./SectionHeader"

// 1px 라인 그리드에 흑백 로고를 정적으로 배치 (호버 시에만 컬러).

export function PartnerGrid() {
  return (
    <section className="bg-[#F6F5F2] py-24 lg:py-36">
      <Container>
        <SectionHeader
          index="02"
          label="Partners"
          title="함께하는 파트너"
          description="대형 제약사를 포함해 여러 코스피 상장사와 함께합니다."
        />

        <ul className="mt-16 lg:mt-24 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 border-l border-t border-black/10">
          {PARTNER_LOGOS.map((item) => (
            <li key={item.id} className="group flex h-28 sm:h-32 items-center justify-center border-r border-b border-black/10 px-6">
              <div className="relative h-10 w-full max-w-[150px]">
                <Image
                  src={item.logo}
                  alt={item.name}
                  fill
                  sizes="150px"
                  className="object-contain grayscale opacity-60 transition duration-300 group-hover:grayscale-0 group-hover:opacity-100"
                />
              </div>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  )
}
