"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface RevealLinesProps {
  lines: React.ReactNode[]
  as?: "h1" | "h2" | "h3" | "p"
  className?: string
  lineClassName?: string
  delay?: number
}

// 각 줄이 마스크 아래에서 위로 올라오며 나타나는 타이포 리빌. 화면에 들어올 때 한 번만 재생한다.
export function RevealLines({ lines, as = "h2", className, lineClassName, delay = 0 }: RevealLinesProps) {
  const Tag = motion[as]

  return (
    <Tag
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
      className={className}
      style={{ wordBreak: "keep-all" }}
    >
      {lines.map((line, i) => (
        <span key={i} className="block overflow-hidden pb-[0.08em] -mb-[0.08em]">
          <motion.span
            className={cn("block", lineClassName)}
            variants={{
              hidden: { y: "110%" },
              show: { y: 0, transition: { duration: 0.9, delay: delay + i * 0.09, ease: [0.22, 1, 0.36, 1] } },
            }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </Tag>
  )
}
