import Image from "next/image"
import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { Container } from "@/components/common/Container"
import { TEAM_MEMBERS } from "@/data/team"
import { DataDashboardMock } from "./DataDashboardMock"
import { SectionHeader } from "./SectionHeader"

interface CapabilityProps {
  id: string
  index: string
  en: string
  ko: string
  title: string
  description: React.ReactNode
  children: React.ReactNode
}

// 역량 하나: 좌측 3열은 스크롤 중 고정되는 번호와 이름, 우측 9열은 제목, 설명, 본문.
function Capability({ id, index, en, ko, title, description, children }: CapabilityProps) {
  return (
    <article id={id} className="scroll-mt-20 mt-20 lg:mt-28 grid gap-8 border-t border-black/10 pt-8 lg:grid-cols-12 lg:gap-6">
      <div className="lg:col-span-3">
        <div className="lg:sticky lg:top-24">
          <p className="text-5xl lg:text-6xl font-semibold tracking-[-0.04em] text-gray-300 tabular-nums">{index}</p>
          <p className="mt-4 text-base font-semibold text-[#0A0A0A]">{en}</p>
          <p className="text-sm text-gray-500">{ko}</p>
        </div>
      </div>
      <div className="lg:col-span-9">
        <h3
          className="text-2xl sm:text-3xl lg:text-4xl font-semibold leading-tight tracking-[-0.03em] text-[#0A0A0A]"
          style={{ wordBreak: "keep-all" }}
        >
          {title}
        </h3>
        <p className="mt-4 max-w-2xl text-base sm:text-lg leading-relaxed text-gray-600" style={{ wordBreak: "keep-all" }}>
          {description}
        </p>
        <div className="mt-12">{children}</div>
      </div>
    </article>
  )
}

function TeamList() {
  return (
    <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-x-4 gap-y-10">
      {TEAM_MEMBERS.map((member) => (
        <li key={member.name}>
          <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#F6F5F2]">
            <Image
              src={member.photo}
              alt={member.name}
              fill
              className="object-cover grayscale"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 160px"
            />
          </div>
          <p className="mt-4 text-sm sm:text-base font-semibold text-[#0A0A0A]">{member.name}</p>
          <p className="text-xs sm:text-sm text-gray-500">{member.role}</p>
          <p className="mt-2 text-xs leading-relaxed text-gray-600" style={{ wordBreak: "keep-all" }}>
            {member.description}
          </p>
        </li>
      ))}
    </ul>
  )
}

interface StrategyCase {
  myth: string
  answer: string
  thesis: string
  steps: string[]
}

const STRATEGY_CASES: StrategyCase[] = [
  {
    myth: "인플루언서 협찬만 많이 하면 되지 않나요?",
    answer: "협찬의 양보다 집중이 중요합니다.",
    thesis:
      "뾰족한 타깃 고객을 먼저 정의하고, 그 고객이 실제로 팔로우하는 인플루언서에게 같은 기간 안에 폭발적으로 집중해 바이럴을 만듭니다. 그래야 대세감이 생기고 인지가 쌓입니다.",
    steps: ["타깃 고객 정의", "팔로우 인플루언서 선별", "동기간 집중 바이럴", "대세감과 인지 형성"],
  },
  {
    myth: "SNS 관리 잘하고 협찬 많이 하면 되는 것 아닌가요?",
    answer: "전략에는 Thesis가 있어야 합니다.",
    thesis:
      "일본의 잠재 고객은 고민 부위에 맞는 시술을 어느 정도 정한 상태에서 클리닉을 탐색합니다. 그래서 '시술'을 찾는 동선 위에서 '이 시술이라면 OO 클리닉'이라는 Share of Voice를 높이는 데 집중합니다.",
    steps: ["고민 부위 인식", "시술 결정", "시술명으로 탐색", "\"이 시술은 OO 클리닉\""],
  },
]

function StrategyCases() {
  return (
    <div>
      {STRATEGY_CASES.map((c, i) => (
        <div key={c.myth} className={`grid gap-6 lg:grid-cols-9 ${i ? "border-t border-black/10 py-10" : "pb-10"}`}>
          <div className="lg:col-span-4">
            <p className="text-sm text-gray-400 tabular-nums">Case {String(i + 1).padStart(2, "0")}</p>
            <p className="mt-4 text-base text-gray-500" style={{ wordBreak: "keep-all" }}>
              &ldquo;{c.myth}&rdquo;
            </p>
            <p className="mt-2 text-xl sm:text-2xl font-semibold tracking-[-0.02em] text-[#0A0A0A]" style={{ wordBreak: "keep-all" }}>
              {c.answer}
            </p>
          </div>
          <div className="lg:col-span-5">
            <p className="text-sm sm:text-base leading-relaxed text-gray-600" style={{ wordBreak: "keep-all" }}>
              {c.thesis}
            </p>
            <ol className="mt-6 grid grid-cols-2 sm:grid-cols-4 border-t border-black/10">
              {c.steps.map((step, s) => (
                <li key={step} className="pt-3 pr-3">
                  <span className="block text-[11px] tabular-nums text-gray-400">{String(s + 1).padStart(2, "0")}</span>
                  <span className="mt-1 block text-sm font-medium text-[#0A0A0A]" style={{ wordBreak: "keep-all" }}>
                    {step}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      ))}

      <Link
        href="/blog"
        className="group flex flex-col gap-3 border-y border-black/10 py-6 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <p className="font-semibold text-[#0A0A0A]">클리닉브릿지 그로스 LAB</p>
          <p className="mt-1 text-sm text-gray-500" style={{ wordBreak: "keep-all" }}>
            일본, 영미권 등 시장별 환자 행동과 마케팅 리서치를 꾸준히 발행합니다.
          </p>
        </div>
        <span className="flex items-center gap-1 text-sm font-medium text-[#0A0A0A]">
          자료 보러가기
          <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </span>
      </Link>
    </div>
  )
}

export function Capabilities() {
  return (
    <section className="bg-white py-24 lg:py-36">
      <Container>
        <SectionHeader
          index="03"
          label="Capabilities"
          title={<>우리 병원의 성장을 만드는<br />3가지 역량</>}
        />

        <Capability
          id="cap-manpower"
          index="01"
          en="Manpower"
          ko="맨파워"
          title="우리 병원의 성장에 집중하는 전담팀"
          description="서울대 출신 전략, 마케팅 전문가들이 우리 병원의 전담 팀이 됩니다."
        >
          <TeamList />
        </Capability>

        <Capability
          id="cap-strategy"
          index="02"
          en="Strategy & Execution"
          ko="탁월한 전략과 실행"
          title="병원의 강점을 매출로 연결하는 전략"
          description="우리 병원의 예산과 시장 내 포지셔닝, 병원 자산을 가장 효율적으로 레버리지해 매출을 만드는 엔진을 구축합니다."
        >
          <StrategyCases />
        </Capability>

        <Capability
          id="cap-data"
          index="03"
          en="Data Intelligence"
          ko="체계적인 데이터 분석"
          title="감이 아닌 데이터로 판단합니다"
          description="누구나 아는 지표 나열이 아닙니다. 업계 최상위 VC와 스타트업이 쓰는 지표 프레임워크로 돈이 벌리는 구조를 해부하고, 우리 병원의 다음 성장을 설계합니다."
        >
          <DataDashboardMock />
        </Capability>
      </Container>
    </section>
  )
}
