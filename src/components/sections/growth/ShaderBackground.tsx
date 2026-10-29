"use client"

import { useEffect, useRef } from "react"

// 히어로 전용 WebGL 배경. 도메인 워핑한 fbm 노이즈로 흐르는 실크 질감을 만들고,
// 오른쪽으로 갈수록 밝아지게 마스킹해 좌측 텍스트 가독성을 지킨다.
// 화면 밖이면 렌더를 멈추고, reduced-motion 이면 한 프레임만 그린다. WebGL 미지원 시 부모 배경색이 그대로 보인다.

const VERTEX = `
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`

const FRAGMENT = `
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform vec2 uMouse;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p = m * p;
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  vec2 p = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;
  float t = uTime * 0.045;
  vec2 m = uMouse - 0.5;

  vec2 q = vec2(fbm(p * 1.1 + t), fbm(p * 1.1 - t + 3.1));
  vec2 r = vec2(fbm(p * 1.5 + 2.0 * q + vec2(1.7, 9.2) + t * 1.3 + m * 0.25),
                fbm(p * 1.5 + 2.0 * q + vec2(8.3, 2.8) - t));
  float f = fbm(p * 1.3 + 2.4 * r);

  // 실크 주름: 워핑된 좌표 위의 사선 밴드
  float bands = sin((p.x * 1.1 + p.y * 2.2 + f * 5.2) * 5.5 - uTime * 0.18);
  float silk = smoothstep(0.1, 1.0, bands) * f;
  float sheen = pow(max(0.0, bands), 14.0) * f;

  vec3 base = vec3(0.039, 0.039, 0.039);
  vec3 warm = vec3(0.84, 0.36, 0.24);
  vec3 col = base + warm * silk * 0.5 + vec3(1.0, 0.88, 0.8) * sheen * 0.55;

  // 좌측은 어둡게, 우측 상단으로 갈수록 드러나게
  float mask = smoothstep(0.18, 0.95, uv.x) * (0.55 + 0.45 * uv.y);
  col = mix(base, col, 0.08 + mask * 0.92);

  // 포인터 광원
  vec2 mp = vec2(m.x * uRes.x / uRes.y, m.y);
  float d = length(p - mp);
  col += warm * 0.07 * exp(-d * d * 5.0);

  // 비네팅 + 필름 그레인
  col *= 1.0 - 0.3 * length(uv - vec2(0.6, 0.5));
  col += (hash(gl_FragCoord.xy + fract(uTime)) - 0.5) * 0.03;

  gl_FragColor = vec4(col, 1.0);
}
`

function compile(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type)
  if (!shader) return null
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader)
    return null
  }
  return shader
}

// 큰 화면에서 픽셀 수를 줄이기 위한 내부 렌더 배율
const RENDER_SCALE = 0.6

export function ShaderBackground({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const gl = canvas.getContext("webgl", { antialias: false, premultipliedAlpha: false })
    if (!gl) return

    const vs = compile(gl, gl.VERTEX_SHADER, VERTEX)
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT)
    const program = gl.createProgram()
    if (!vs || !fs || !program) return
    gl.attachShader(program, vs)
    gl.attachShader(program, fs)
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return
    gl.useProgram(program)

    // 화면 전체를 덮는 삼각형 하나
    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
    const aPos = gl.getAttribLocation(program, "aPos")
    gl.enableVertexAttribArray(aPos)
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0)

    const uRes = gl.getUniformLocation(program, "uRes")
    const uTime = gl.getUniformLocation(program, "uTime")
    const uMouse = gl.getUniformLocation(program, "uMouse")

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const mouse = { x: 0.7, y: 0.6, tx: 0.7, ty: 0.6 }
    const start = performance.now()
    let raf = 0
    let visible = true

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      const scale = Math.min(window.devicePixelRatio || 1, 1.5) * RENDER_SCALE
      canvas.width = Math.max(1, Math.round(rect.width * scale))
      canvas.height = Math.max(1, Math.round(rect.height * scale))
      gl.viewport(0, 0, canvas.width, canvas.height)
      if (reduceMotion) render(0)
    }

    function render(time: number) {
      mouse.x += (mouse.tx - mouse.x) * 0.04
      mouse.y += (mouse.ty - mouse.y) * 0.04
      gl!.uniform2f(uRes, canvas!.width, canvas!.height)
      gl!.uniform1f(uTime, time)
      gl!.uniform2f(uMouse, mouse.x, mouse.y)
      gl!.drawArrays(gl!.TRIANGLES, 0, 3)
    }

    const loop = (now: number) => {
      if (visible) render((now - start) / 1000)
      raf = requestAnimationFrame(loop)
    }

    const onPointer = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      mouse.tx = (e.clientX - rect.left) / rect.width
      mouse.ty = 1 - (e.clientY - rect.top) / rect.height
    }

    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)
    const io = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting))
    io.observe(canvas)

    if (reduceMotion) {
      render(12)
    } else {
      window.addEventListener("pointermove", onPointer, { passive: true })
      raf = requestAnimationFrame(loop)
    }

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      io.disconnect()
      window.removeEventListener("pointermove", onPointer)
      gl.deleteProgram(program)
      gl.deleteShader(vs)
      gl.deleteShader(fs)
      gl.deleteBuffer(buffer)
    }
  }, [])

  return <canvas ref={canvasRef} aria-hidden className={className} />
}
