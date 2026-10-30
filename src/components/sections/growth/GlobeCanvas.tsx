"use client"

import { useEffect, useRef } from "react"
import { GeoPoint, HUB_CITY, TARGET_MARKETS } from "@/data/markets"

// 히어로의 점묘 지구본. 각 시장 도시에서 서울로 들어오는 인바운드 아크를 그린다.
// 활성 시장의 아크는 도시(흐림)에서 서울(선명)로 갈수록 밝아지고, 빛 입자가 서울로 날아와 도착 파동을 만든다.
// activeIndex 가 바뀌면 그 시장과 서울이 함께 보이도록 지구본이 회전한다.
// 의존성 없이 Canvas 2D 로 그리며, 화면 밖이면 렌더를 멈추고 reduced-motion 이면 회전과 입자를 멈춘다.

const ACCENT = "214,90,59"
const DEG = Math.PI / 180
const SEG = 56
const FLIGHT_SEC = 2.4

type Vec3 = [number, number, number]

const toVec = (lat: number, lon: number): Vec3 => {
  const la = lat * DEG
  const lo = lon * DEG
  return [Math.cos(la) * Math.sin(lo), Math.sin(la), Math.cos(la) * Math.cos(lo)]
}

function slerp(a: Vec3, b: Vec3, t: number): Vec3 {
  const dot = Math.min(1, Math.max(-1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2]))
  const omega = Math.acos(dot)
  if (omega < 1e-4) return a
  const s = Math.sin(omega)
  const k1 = Math.sin((1 - t) * omega) / s
  const k2 = Math.sin(t * omega) / s
  return [a[0] * k1 + b[0] * k2, a[1] * k1 + b[1] * k2, a[2] * k1 + b[2] * k2]
}

const cross = (a: Vec3, b: Vec3): Vec3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]
const normalize = (v: Vec3): Vec3 => {
  const l = Math.hypot(v[0], v[1], v[2]) || 1
  return [v[0] / l, v[1] / l, v[2] / l]
}

// 출발지에서 서울까지의 비행 경로. 대권 경로를 옆으로 휘게(bend) 하고 위로 띄워(lift)
// 근거리 노선도 시점과 관계없이 곡선으로 보이게 한다.
function buildRoute(from: Vec3, to: Vec3, side: number): Vec3[] {
  const omega = Math.acos(Math.min(1, Math.max(-1, from[0] * to[0] + from[1] * to[1] + from[2] * to[2])))
  const n = normalize(cross(from, to))
  const bend = Math.min(0.45, omega * 0.35) * side
  const lift = 0.08 + Math.min(0.14, omega * 0.12)
  const pts: Vec3[] = []
  for (let i = 0; i <= SEG; i++) {
    const u = i / SEG
    const s = Math.sin(Math.PI * u)
    const base = slerp(from, to, u)
    const bent = normalize([base[0] + n[0] * bend * s, base[1] + n[1] * bend * s, base[2] + n[2] * bend * s])
    const h = 1 + lift * s
    pts.push([bent[0] * h, bent[1] * h, bent[2] * h])
  }
  return pts
}

function fibonacciSphere(n: number): Vec3[] {
  const pts: Vec3[] = []
  const golden = Math.PI * (3 - Math.sqrt(5))
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / (n - 1)) * 2
    const r = Math.sqrt(1 - y * y)
    const theta = golden * i
    pts.push([Math.cos(theta) * r, y, Math.sin(theta) * r])
  }
  return pts
}

// 각도 차이를 -PI..PI 로 정규화해 최단 경로로 회전하게 한다.
const shortestDelta = (from: number, to: number) => {
  let d = (to - from) % (Math.PI * 2)
  if (d > Math.PI) d -= Math.PI * 2
  if (d < -Math.PI) d += Math.PI * 2
  return d
}

interface GlobeCanvasProps {
  activeIndex: number
  className?: string
}

export function GlobeCanvas({ activeIndex, className }: GlobeCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const activeRef = useRef(activeIndex)

  useEffect(() => {
    activeRef.current = activeIndex
  }, [activeIndex])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const context = canvas.getContext("2d")
    if (!context) return
    const ctx: CanvasRenderingContext2D = context

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    // next/font 가 붙인 실제 폰트 패밀리명을 캔버스 텍스트에도 사용
    const fontFamily = getComputedStyle(canvas).fontFamily
    let width = 0
    let height = 0
    let dpr = 1
    let dots: Vec3[] = []
    let raf = 0
    let visible = true
    const pointer = { x: 0, y: 0, tx: 0, ty: 0 }

    const first = TARGET_MARKETS[activeRef.current].focus
    const view = { lon: first.lon * DEG, lat: first.lat * DEG, zoom: first.zoom }
    const hub = toVec(HUB_CITY.lat, HUB_CITY.lon)
    // 출발(도시) → 도착(서울) 방향으로 경로를 만든다
    const routes = TARGET_MARKETS.map((m) =>
      m.cities.map((c, ci) => ({ city: c, path: buildRoute(toVec(c.lat, c.lon), hub, ci % 2 ? -1 : 1) }))
    )
    const start = performance.now()

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      width = rect.width
      height = rect.height
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      dots = fibonacciSphere(width < 768 ? 900 : 1800)
    }

    const layout = () => {
      const mobile = width < 768
      const R = (mobile ? width * 0.62 : Math.min(width * 0.22, height * 0.36)) * view.zoom
      return { R, cx: mobile ? width * 0.78 : width * 0.73, cy: mobile ? height * 0.95 : height * 0.5 }
    }

    // world 벡터를 현재 시점(view)으로 회전시킨 뒤 화면 좌표로 투영
    const project = (v: Vec3, R: number, cx: number, cy: number) => {
      const cl = Math.cos(view.lon)
      const sl = Math.sin(view.lon)
      const x1 = v[0] * cl - v[2] * sl
      const z1 = v[0] * sl + v[2] * cl
      const ct = Math.cos(view.lat)
      const st = Math.sin(view.lat)
      const y2 = v[1] * ct - z1 * st
      const z2 = v[1] * st + z1 * ct
      return { x: cx + x1 * R, y: cy - y2 * R, z: z2, r2: x1 * x1 + y2 * y2 }
    }

    const draw = (now: number) => {
      // rAF 타임스탬프가 start 보다 앞설 수 있어 음수 시간(음수 반지름)을 막는다
      const t = Math.max(0, now - start) / 1000
      const active = activeRef.current
      const focus = TARGET_MARKETS[active].focus

      // 목표 시점으로 부드럽게 회전 + 미세한 드리프트 + 포인터 패럴랙스
      pointer.x += (pointer.tx - pointer.x) * 0.05
      pointer.y += (pointer.ty - pointer.y) * 0.05
      const drift = reduceMotion ? 0 : Math.sin(t * 0.15) * 5 * DEG
      const ease = reduceMotion ? 1 : 0.035
      view.lon += shortestDelta(view.lon, focus.lon * DEG + drift + pointer.x * 7 * DEG) * ease
      view.lat += (focus.lat * DEG + pointer.y * 5 * DEG - view.lat) * ease
      view.zoom += (focus.zoom - view.zoom) * ease

      const { R, cx, cy } = layout()
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, width, height)

      // 대기광
      const glow = ctx.createRadialGradient(cx, cy, R * 0.7, cx, cy, R * 1.35)
      glow.addColorStop(0, `rgba(${ACCENT},0.14)`)
      glow.addColorStop(1, "rgba(0,0,0,0)")
      ctx.fillStyle = glow
      ctx.fillRect(0, 0, width, height)

      // 구체 본체 (셰이더 배경이 살짝 비치도록 반투명)
      const body = ctx.createRadialGradient(cx - R * 0.35, cy - R * 0.4, R * 0.1, cx, cy, R)
      body.addColorStop(0, "rgba(36,22,18,0.92)")
      body.addColorStop(1, "rgba(8,8,9,0.94)")
      ctx.fillStyle = body
      ctx.beginPath()
      ctx.arc(cx, cy, R, 0, Math.PI * 2)
      ctx.fill()
      ctx.strokeStyle = `rgba(${ACCENT},0.3)`
      ctx.lineWidth = 1
      ctx.stroke()

      // 점묘 표면
      for (const d of dots) {
        const p = project(d, R, cx, cy)
        if (p.z <= 0) continue
        ctx.fillStyle = `rgba(255,236,228,${0.12 + p.z * 0.6})`
        const s = 1 + p.z * 1.2
        ctx.fillRect(p.x - s / 2, p.y - s / 2, s, s)
      }

      let arrival = 0

      routes.forEach((cities, mi) => {
        const isActive = mi === active
        cities.forEach(({ city, path }, ci) => {
          // u=0 출발 도시, u=1 서울
          const pts = path.map((v) => {
            const p = project(v, R, cx, cy)
            return { x: p.x, y: p.y, vis: p.z > 0 || p.r2 > 1 }
          })

          // 서울에 가까울수록 진해지는 아크
          ctx.lineWidth = isActive ? 1.5 : 1
          for (let i = 1; i <= SEG; i++) {
            const a = pts[i - 1]
            const b = pts[i]
            if (!a.vis || !b.vis) continue
            const u = i / SEG
            ctx.strokeStyle = isActive ? `rgba(${ACCENT},${0.15 + u * 0.8})` : `rgba(255,255,255,${0.04 + u * 0.1})`
            ctx.beginPath()
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
            ctx.stroke()
          }

          // 서울로 날아오는 빛 입자 (도착 직전 서울 파동 강도 누적)
          if (isActive && !reduceMotion) {
            const phase = (t / FLIGHT_SEC + ci / cities.length) % 1
            const head = Math.floor(phase * SEG)
            for (let k = 0; k < 12; k++) {
              const p = pts[head - k]
              if (!p || !p.vis) continue
              ctx.fillStyle = `rgba(255,220,206,${(1 - k / 12) * 0.95})`
              ctx.beginPath()
              ctx.arc(p.x, p.y, 2.4 - k * 0.15, 0, Math.PI * 2)
              ctx.fill()
            }
            if (phase > 0.9) arrival = Math.max(arrival, (phase - 0.9) / 0.1)
          }

          // 근거리 시장은 대표 도시만 라벨 표시 (라벨 겹침 방지)
          drawCity(city, isActive, isActive && (ci === 0 || TARGET_MARKETS[mi].focus.zoom <= 1))
        })
      })

      drawHub(arrival)

      function drawCity(city: GeoPoint, highlight: boolean, label: boolean) {
        const p = project(toVec(city.lat, city.lon), R, cx, cy)
        if (p.z <= 0.05) return
        const alpha = Math.min(1, p.z * 1.6)
        ctx.fillStyle = highlight ? `rgba(255,255,255,${alpha * 0.85})` : `rgba(255,255,255,${alpha * 0.3})`
        ctx.beginPath()
        ctx.arc(p.x, p.y, highlight ? 2.4 : 1.6, 0, Math.PI * 2)
        ctx.fill()
        if (label && width >= 768) {
          ctx.font = `500 10px ${fontFamily}`
          ctx.fillStyle = `rgba(255,255,255,${alpha * 0.55})`
          ctx.fillText(city.name, p.x + 7, p.y - 6)
        }
      }

      function drawHub(arrivalPulse: number) {
        const p = project(hub, R, cx, cy)
        if (p.z <= 0.05) return
        const alpha = Math.min(1, p.z * 1.6)
        // 상시 파동 2겹 + 입자 도착 시 확산 파동
        if (!reduceMotion) {
          for (let k = 0; k < 2; k++) {
            const w = (t * 0.6 + k * 0.5) % 1
            ctx.strokeStyle = `rgba(${ACCENT},${(1 - w) * 0.55 * alpha})`
            ctx.lineWidth = 1
            ctx.beginPath()
            ctx.arc(p.x, p.y, 5 + w * 26, 0, Math.PI * 2)
            ctx.stroke()
          }
        }
        if (arrivalPulse > 0) {
          ctx.fillStyle = `rgba(${ACCENT},${arrivalPulse * 0.35})`
          ctx.beginPath()
          ctx.arc(p.x, p.y, 10 + arrivalPulse * 8, 0, Math.PI * 2)
          ctx.fill()
        }
        const core = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 14)
        core.addColorStop(0, `rgba(${ACCENT},${0.9 * alpha})`)
        core.addColorStop(1, `rgba(${ACCENT},0)`)
        ctx.fillStyle = core
        ctx.beginPath()
        ctx.arc(p.x, p.y, 14, 0, Math.PI * 2)
        ctx.fill()
        ctx.fillStyle = `rgba(255,255,255,${alpha})`
        ctx.beginPath()
        ctx.arc(p.x, p.y, 3.2, 0, Math.PI * 2)
        ctx.fill()
        if (width >= 768) {
          ctx.font = `600 11px ${fontFamily}`
          ctx.fillStyle = `rgba(255,255,255,${alpha * 0.9})`
          ctx.fillText("SEOUL", p.x + 12, p.y + 4)
        }
      }
    }

    const loop = (now: number) => {
      if (visible) draw(now)
      raf = requestAnimationFrame(loop)
    }

    const onPointer = (e: PointerEvent) => {
      pointer.tx = (e.clientX / window.innerWidth - 0.5) * 2
      pointer.ty = (e.clientY / window.innerHeight - 0.5) * 2
    }

    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)
    const io = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting))
    io.observe(canvas)
    window.addEventListener("pointermove", onPointer, { passive: true })
    raf = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      io.disconnect()
      window.removeEventListener("pointermove", onPointer)
    }
  }, [])

  return <canvas ref={canvasRef} aria-hidden className={className} />
}
