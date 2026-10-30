"use client"

import { useEffect, useRef, useState } from "react"
import { motion, useReducedMotion } from "framer-motion"
import { cn } from "@/lib/utils"
import { RedactFilterDefs } from "./primitives"
import { StageKpi } from "./StageKpi"
import { StageGrowth } from "./StageGrowth"
import { StageHowTree } from "./StageHowTree"
import { StageLogicTable } from "./StageLogicTable"
import { StageUnit } from "./StageUnit"
import { StageLeading } from "./StageLeading"
import { StageViral } from "./StageViral"
import { StageProjection } from "./StageProjection"

// 역량 03 "Data Intelligence" 패널을 채우는 그로스 대시보드.
// 핵심 지표 도표, 로직트리, 로직 표, 분석 차트를 세로로 길게 이어 붙이고, 스크롤을 쭉 내리는 것처럼 위로 끝없이 흘려 보낸다.
// 헤더, 결론 문장 없이 차트만 보이며, 텍스트를 포함한 전체를 블러 처리해 "어떤 모양의 분석이 있는지"만 보이게 한다.
// 1200px 폭 캔버스를 패널 너비에 맞춰 축소하고, 패널 높이만큼을 창으로 보여준다.

const CANVAS_W = 1200
const SECTION_H = 520
const GAP = 40
const PAD = 32
const STAGES = [StageKpi, StageGrowth, StageHowTree, StageUnit, StageLeading, StageLogicTable, StageViral, StageProjection]
// 한 바퀴 높이. 같은 스트립을 두 번 이어 붙여 끊김 없이 순환시킨다.
const LOOP_H = STAGES.length * (SECTION_H + GAP)
// 스크롤 속도(캔버스 px/초). 섹션 수가 바뀌어도 속도는 일정하게 유지된다.
const SCROLL_PX_PER_SEC = 120
const LOOP_SEC = LOOP_H / SCROLL_PX_PER_SEC
// 전체 블러 강도: 글자는 읽히지 않고 차트, 트리, 표의 형태만 보이는 정도
const BLUR_PX = 3.6

function useCanvasScale() {
  const ref = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ scale: 0, height: 0 })

  useEffect(() => {
    const el = ref.current
    if (!el) return
    // 레이아웃 크기 사용: 패널의 스크롤 축소 transform 이 측정값에 섞이지 않도록 한다
    const update = () => setSize({ scale: el.clientWidth / CANVAS_W, height: el.clientHeight })
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  return { ref, ...size }
}

function Strip() {
  return (
    <div style={{ paddingLeft: PAD, paddingRight: PAD }}>
      {STAGES.map((Stage, i) => (
        <div key={i} style={{ height: SECTION_H, marginBottom: GAP }}>
          <Stage />
        </div>
      ))}
    </div>
  )
}

// 부모가 크기를 정한다: 고정 높이 패널이면 h-full, 그 외에는 aspect 비율로 높이를 준다.
export function GrowthDashboard({ className }: { className?: string }) {
  const { ref, scale, height } = useCanvasScale()
  const reduceMotion = useReducedMotion()
  const windowH = scale > 0 ? height / scale : 0

  return (
    <div
      ref={ref}
      className={cn("relative h-full w-full overflow-hidden rounded-2xl bg-white", className)}
      aria-hidden
    >
      {scale > 0 && (
        <div className="absolute left-0 top-0 origin-top-left" style={{ width: CANVAS_W, height: windowH, transform: `scale(${scale})` }}>
          <RedactFilterDefs />
          <motion.div
            className="pt-8"
            style={{ filter: `blur(${BLUR_PX}px)` }}
            animate={reduceMotion ? undefined : { y: [0, -LOOP_H] }}
            transition={{ duration: LOOP_SEC, ease: "linear", repeat: Infinity }}
          >
            <Strip />
            <Strip />
          </motion.div>
        </div>
      )}
      {/* 위아래 페이드: 화면 밖으로 이어지는 긴 대시보드 느낌 */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-white to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-white to-transparent" />
    </div>
  )
}
