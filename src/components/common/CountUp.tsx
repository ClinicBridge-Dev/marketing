"use client"

import { useEffect, useRef, useState } from "react"
import { animate, useInView } from "framer-motion"

interface CountUpProps {
  value: number
  decimals?: number
  prefix?: string
  suffix?: string
  duration?: number
  className?: string
}

// 화면에 들어오면 0에서 value까지 숫자를 올리는 카운터.
export function CountUp({ value, decimals = 0, prefix = "", suffix = "", duration = 1.6, className }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: "-60px" })
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    if (!inView) return
    const controls = animate(0, value, { duration, ease: "easeOut", onUpdate: setCurrent })
    return () => controls.stop()
  }, [inView, value, duration])

  const formatted = new Intl.NumberFormat("ko-KR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(current)

  return (
    <span ref={ref} className={className}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  )
}
