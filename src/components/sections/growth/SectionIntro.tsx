import { RevealLines } from "@/components/common/RevealLines"
import { cn } from "@/lib/utils"

interface SectionIntroProps {
  /** 아이브로우 앞 단어 (예: "Proof in") */
  eyebrow: string
  /** 세리프 이탤릭으로 강조할 영문 단어 (예: "Numbers") */
  accent: string
  lines: React.ReactNode[]
  description?: React.ReactNode
  /** 설명 문구를 강조형으로 바꿀 때 사용 (기본: 회색 본문) */
  descriptionClassName?: string
  tone?: "light" | "dark"
  className?: string
}

// 메인 섹션 공통 도입부: 영문 아이브로우(세리프 강조) + 줄 단위 리빌 제목 + 설명.
export function SectionIntro({ eyebrow, accent, lines, description, descriptionClassName, tone = "light", className }: SectionIntroProps) {
  const dark = tone === "dark"

  return (
    <div className={cn("max-w-3xl", className)}>
      <p className={cn("mb-5 text-lg", dark ? "text-white/60" : "text-gray-500")}>
        {eyebrow}{" "}
        <span className={cn("font-serif italic text-[1.25em]", dark ? "text-[#F08A6E]" : "text-[#C1452D]")}>{accent}</span>
      </p>
      <RevealLines
        className={cn(
          "text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.15] tracking-[-0.03em]",
          dark ? "text-white" : "text-[#0A0A0A]"
        )}
        lines={lines}
      />
      {description && (
        <p
          className={cn("mt-6 text-base sm:text-lg leading-relaxed", dark ? "text-white/60" : "text-gray-600", descriptionClassName)}
          style={{ wordBreak: "keep-all" }}
        >
          {description}
        </p>
      )}
    </div>
  )
}
