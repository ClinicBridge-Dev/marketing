import { useRef } from "react"
import { useInView } from "framer-motion"

// 반복 애니메이션(마퀴, 대시보드 스크롤, 자동 탭 전환)을 화면 밖에서 멈추기 위한 공통 훅.
// 요소가 뷰포트에서 200px 이상 벗어나면 paused 가 true 가 된다. 모바일 배터리, 발열 부담을 줄인다.
export function useOffscreenPause<T extends Element = HTMLDivElement>() {
  const ref = useRef<T>(null)
  const inView = useInView(ref, { margin: "200px" })
  return { ref, paused: !inView }
}
