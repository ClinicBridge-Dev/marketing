"use client"

import { useEffect, useLayoutEffect, useRef, useState } from "react"
import { animate, useInView, useReducedMotion } from "framer-motion"

interface CountUpProps {
  value: number
  decimals?: number
  prefix?: string
  suffix?: string
  duration?: number
  className?: string
}

// 화면에 들어오면 0에서 value까지 숫자를 올리는 카운터.
// 서버 HTML에는 최종값을 그대로 넣어 검색엔진, 링크 미리보기가 "0명"이 아닌 실제 값을 읽게 하고,
// 브라우저에서 첫 페인트 전에 0으로 되돌린 뒤 화면에 들어올 때 올린다.
export function CountUp({ value, decimals = 0, prefix = "", suffix = "", duration = 1.6, className }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: "-60px" })
  const reduceMotion = useReducedMotion()
  const [current, setCurrent] = useState(value)

  useLayoutEffect(() => {
    if (!reduceMotion) setCurrent(0)
  }, [reduceMotion])

  useEffect(() => {
    if (!inView || reduceMotion) return
    const controls = animate(0, value, { duration, ease: "easeOut", onUpdate: setCurrent })
    return () => controls.stop()
  }, [inView, value, duration, reduceMotion])

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
