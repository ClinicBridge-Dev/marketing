import { cn } from "@/lib/utils"

interface SectionHeaderProps {
  index: string
  label: string
  title: React.ReactNode
  description?: React.ReactNode
  tone?: "light" | "dark"
  className?: string
}

// 메인 섹션 공통 헤더. 상단 1px 라인 + 좌측 (번호) 라벨 + 우측 큰 제목의 12열 구성.
export function SectionHeader({ index, label, title, description, tone = "light", className }: SectionHeaderProps) {
  const dark = tone === "dark"

  return (
    <div className={cn("grid gap-6 border-t pt-6 lg:grid-cols-12", dark ? "border-white/15" : "border-black/10", className)}>
      <p className={cn("text-sm lg:col-span-3", dark ? "text-white/50" : "text-gray-500")}>
        <span className="tabular-nums">({index})</span>
        <span className="ml-3">{label}</span>
      </p>
      <div className="lg:col-span-9">
        <h2
          className={cn(
            "text-[34px] sm:text-5xl lg:text-[60px] font-semibold leading-[1.12] tracking-[-0.035em]",
            dark ? "text-white" : "text-[#0A0A0A]"
          )}
          style={{ wordBreak: "keep-all" }}
        >
          {title}
        </h2>
        {description && (
          <p
            className={cn("mt-6 max-w-2xl text-base sm:text-lg leading-relaxed", dark ? "text-white/60" : "text-gray-600")}
            style={{ wordBreak: "keep-all" }}
          >
            {description}
          </p>
        )}
      </div>
    </div>
  )
}
