import { Container } from "@/components/common/Container"
import { SectionHeader } from "./SectionHeader"

const CRITERIA = [
  "해외환자 유치를 병원의 지속적인 성장 과제로 추진하는 병원",
  "목표에 필요한 마케팅 예산과 운영 자원을 함께 투입할 수 있는 병원",
  "성과 데이터를 공유하고, 개선안을 함께 실행할 수 있는 병원",
]

export function PartnerFit() {
  return (
    <section className="bg-[#F6F5F2] py-24 lg:py-36">
      <Container>
        <SectionHeader
          index="04"
          label="Partnership"
          title={<>모든 병원과<br />함께하지는 않습니다.</>}
          description="전담팀이 깊이 관여하는 만큼, 성장 목표와 실행 여건이 맞는 병원과 파트너십을 시작합니다."
        />

        <div className="mt-16 lg:mt-24 grid lg:grid-cols-12 lg:gap-6">
          <ol className="lg:col-start-4 lg:col-span-9 border-t border-black/10">
            {CRITERIA.map((c, i) => (
              <li key={c} className="grid grid-cols-[3rem_1fr] sm:grid-cols-[5rem_1fr] items-baseline border-b border-black/10 py-6 sm:py-8">
                <span className="text-sm tabular-nums text-gray-400">{String(i + 1).padStart(2, "0")}</span>
                <span
                  className="text-lg sm:text-2xl font-medium tracking-[-0.02em] text-[#0A0A0A]"
                  style={{ wordBreak: "keep-all" }}
                >
                  {c}
                </span>
              </li>
            ))}
          </ol>

          <div className="mt-10 lg:col-start-4 lg:col-span-9 grid sm:grid-cols-[5rem_1fr]">
            <span className="hidden sm:block" />
            <div style={{ wordBreak: "keep-all" }}>
              <p className="text-base font-semibold text-[#0A0A0A]">같이 잘 벌어야 오래 갑니다.</p>
              <p className="mt-2 max-w-2xl text-sm sm:text-base leading-relaxed text-gray-600">
                병원의 현재 상황과 목표를 검토하고, 필요한 투자와 실행 방향을 함께 논의합니다.
                병원과 클리닉브릿지의 이해관계가 같은 방향을 향할 때 파트너십을 시작합니다.
              </p>
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}
