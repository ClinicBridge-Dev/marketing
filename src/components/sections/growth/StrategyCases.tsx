"use client"

import { useEffect, useState } from "react"
import { motion, useReducedMotion } from "framer-motion"
import { useOffscreenPause } from "@/lib/hooks/useOffscreenPause"

// 역량 02 "Strategy & Execution" 사례 카드.
// 원본: Strategy & Execution Cases 아티팩트(claude.ai)의 Case 01~03을 역순(레버, Thesis, 집중 바이럴)으로 배치한다. 탭 번호는 배열 순서로 매긴다. 실제 병원명은 가칭(A, C, D, E)으로 표기한다.
// B는 성과 섹션(ProofCases)의 영미권 사례에 쓰이므로 비워 둔다.
// 탭은 8초마다 자동 순환하고, 카드에 마우스를 올리면 멈추며, 탭을 직접 누르면 순환을 끈다.

const ACCENT = "#C1452D"
const ACCENT_SOFT = "#F6D9CF"
const LINE = "#E6E1D9"
const LINE_STRONG = "#CFC9BF"
const MUTED = "#6B6B6B"
const FAINT = "#78736C"
const GREY_MARK = "#7F7A72"
const FG = "#121212"
const ROTATE_MS = 8000

interface Evidence {
  value: string
  desc: string
  client: string
  period: string
}

/** 본문 문단. quote 는 예시 가설 등 인용 블록, tag 는 문단 앞에 붙는 작은 꼬리표(예: 병원마다 상이)로 표시한다. */
type Paragraph = string | { quote: string } | { tag: string; text: string }

interface StrategyCase {
  id: string
  question: string
  /** 줄바꿈(
)으로 두 줄 제목을 만들 수 있다 */
  thesis: string
  body: Paragraph[]
  steps: string[]
  evidence: Evidence[]
  visual: "dualLine" | "serpMock" | "leverMatrix"
  visualNote?: string
  inProgress?: boolean
}

const CASES: StrategyCase[] = [
  {
    id: "case-lever",
    question: "일본 환자를 더 많이 오게 해주세요.",
    thesis: "우리 병원은 단순히 환자만 많이 늘면 손해입니다.\n매출 공식상 움직일 수 있는 Lever는 하나입니다.",
    body: [{ tag: "병원마다 상이", text: "매출은 일 최대 환자 capa × 가동률 × 객단가입니다. 원장 한 분이 직접 보는 병원이라면 capa는 고정이고, 가동률은 끝까지 올려도 2배입니다. 객단가는 30만 원에서 100만 원이면 3.3배, 300만 원이면 10배가 움직입니다. 그래서 '많이 오게'가 아니라 '누가 얼마를 내고 그 슬롯을 채우는가'를 설계합니다. 저단가 수요는 의도적으로 받지 않습니다." }],
    steps: ["매출 공식 분해", "고정 변수와 가동 변수 구분", "레버 하나에 메시지 집중", "Phase별 검증 후 확장"],
    evidence: [
      { value: "10×", desc: "같은 슬롯(1일 2명)을 30만 원 고객으로 채우면 월 1,320만 원, 300만 원이면 1억 3,200만 원", client: "E 피부과 (1인 원장)", period: "2026.10 진행 중, 설계 기준" },
    ],
    visual: "leverMatrix",
    visualNote: "설계 기준, 1일 4명 capa, 22영업일, 단위 만 원",
    inProgress: true,
  },
  {
    id: "case-thesis",
    question: "SNS를 잘 운영하고, 협찬만 많이 하면 되는 거 아닌가요?",
    thesis: "전략에는 명확한 Thesis가 있어야 합니다.",
    body: [
      "어떤 고객을 공략하고, 어떤 이유로 우리 병원을 선택하게 만들 것인가. 클리닉브릿지는 시장과 고객의 행동을 분석해 성장을 만들 핵심 가설, Thesis를 세웁니다. 이 가설을 기준으로 타깃 시술과 메시지, 채널과 예산의 우선순위를 정하고, 각각의 실행이 하나의 성장 방향으로 이어지도록 설계합니다.",
      "예를 들어, 시술을 먼저 정한 뒤 클리닉을 비교하는 고객군을 공략한다면 다음과 같은 Thesis를 세울 수 있습니다.",
      { quote: "타깃 시술을 찾는 고객의 탐색 동선에서 우리 병원의 선택 이유와 함께 SOV(Share of Voice)를 높이면, 해당 시술의 상담과 예약을 늘릴 수 있다." },
      "이 가설에 따라 시술을 검색하고 비교하는 접점에 콘텐츠와 노출을 집중합니다. 'A 시술이라면 B 클리닉'이라는 내러티브를 만들고, 검색 결과 점유율과 상담 및 예약 전환을 함께 추적하며 전략을 검증하고 개선합니다.",
    ],
    steps: ["시장과 고객 행동 분석", "핵심 Thesis 수립", "메시지와 실행 전략 설계", "성과 검증과 전략 개선"],
    evidence: [
      { value: "4.9×", desc: "4개월 만의 월 예약 매출 (2,630만 → 1.3억 원). 타깃 시술 검색 상위 5건 중 3건 점유 및 관련 콘텐츠 조회수를 월간 KPI로 운영", client: "C 의원", period: "2026.01 → 04" },
      { value: "+227%", desc: "'이 시술이면 OO' 내러티브 도입 첫 달 매출, 조회 +614%", client: "D 피부과", period: "2026.05" },
    ],
    visual: "serpMock",
  },
  {
    id: "case-viral",
    question: "인플루언서 협찬만 많이 하면 되지 않나요?",
    thesis: "타깃에게 노출을 집중하고, 협찬 자산을 잘 레버리지해야 합니다.",
    body: [
      "뾰족한 타깃 고객을 먼저 정의하고, 그 고객이 실제로 팔로우하는 인플루언서에게 같은 기간 안에 폭발적으로 집중해 바이럴을 만듭니다. 흩어진 협찬 10건은 열 번 잊히지만, 한 주에 몰린 10건은 하나의 대세감이 됩니다.",
      "또한 단순히 협찬 한 건 한 건의 직접 성과뿐만 아니라, 해당 협찬 콘텐츠를 자체 계정(Owned Media)에 쌓아서 탐색 지면을 강화하거나 소스를 멀티유즈하여 간접 전환을 확대해야 합니다.",
    ],
    steps: ["타깃 고객 정의", "팔로우 인플루언서 선별", "동기간 집중 바이럴", "인용 체인으로 대세감 형성"],
    evidence: [
      { value: "85%", desc: "원본 1건에서 시작한 인용 체인 15건이 만든 첫 달 조회 비중 (첫 달 77만 조회)", client: "A 약국 프로젝트", period: "2026.09" },
      { value: "500만", desc: "방문 협찬 1건의 조회, 북마크 2,800건", client: "다이어트 클리닉", period: "2026.07" },
    ],
    visual: "dualLine",
    visualNote: "개념도, 동일 예산 기준",
  },
]

// ── 시각화 ────────────────────────────────────────────────

function DualLine() {
  const spread = [12, 14, 13, 15, 14, 13, 15, 14]
  const focus = [5, 8, 60, 92, 70, 48, 36, 30]
  const x0 = 34
  const x1 = 372
  const y0 = 14
  const y1 = 196
  const X = (i: number) => x0 + i * ((x1 - x0) / 7)
  const Y = (v: number) => y1 - (v / 100) * (y1 - y0)
  const pts = (a: number[]) => a.map((v, i) => `${X(i).toFixed(1)},${Y(v).toFixed(1)}`).join(" ")
  return (
    <svg viewBox="0 0 400 230" className="block h-auto w-full" role="img" aria-label="분산 협찬과 동기간 집중의 주간 노출 비교">
      {[0, 25, 50, 75, 100].map((v) => <line key={v} x1={x0} x2={x1} y1={Y(v)} y2={Y(v)} stroke={LINE} />)}
      <polyline points={pts(spread)} fill="none" stroke={GREY_MARK} strokeWidth={2} strokeDasharray="5 4" strokeLinejoin="round" />
      <polyline points={pts(focus)} fill="none" stroke={ACCENT} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={X(3)} cy={Y(92)} r={6} fill={ACCENT} stroke="#fff" strokeWidth={2} />
      <text x={X(3) + 12} y={Y(92) + 2} fontSize={13} fill={FG} fontWeight={700}>스파이크 후 긴 꼬리</text>
      <text x={X(3) + 12} y={Y(92) + 18} fontSize={12} fill={MUTED}>같은 예산, 2주 집중</text>
      <text x={x1 - 2} y={Y(30) + 20} fontSize={12.5} textAnchor="end" fill={ACCENT} fontWeight={700}>동기간 집중</text>
      <text x={x1 - 2} y={Y(14) + 20} fontSize={12.5} textAnchor="end" fill={GREY_MARK} fontWeight={600}>분산 협찬</text>
      <text x={x0 - 5} y={Y(100) + 4} fontSize={11} textAnchor="end" fill={FAINT}>100</text>
      <text x={x0 - 5} y={Y(0) + 4} fontSize={11} textAnchor="end" fill={FAINT}>0</text>
      {Array.from({ length: 8 }, (_, i) => (
        <text key={i} x={X(i)} y={217} fontSize={11.5} textAnchor="middle" fill={FAINT}>W{i + 1}</text>
      ))}
    </svg>
  )
}

function SerpMock() {
  const rows: [string, boolean][] = [["1", true], ["2", true], ["3", false], ["4", true], ["5", false]]
  return (
    <div className="text-[12px]" role="img" aria-label="타깃 시술 검색 결과 상위 5건 중 3건 점유">
      <div className="mb-2.5 flex justify-between rounded-full border px-3 py-1.5" style={{ borderColor: LINE_STRONG, color: MUTED }}>
        <span>リフティング 韓国 クリニック</span>
        <span>⌕</span>
      </div>
      {rows.map(([n, hit]) => (
        <div key={n} className="grid grid-cols-[18px_minmax(0,1fr)_auto] items-center gap-2 border-t py-[7px]" style={{ borderColor: LINE, color: hit ? FG : MUTED }}>
          <span className="font-mono text-[10px]" style={{ color: hit ? ACCENT : FAINT, fontWeight: hit ? 700 : 400 }}>{n}</span>
          <span className="block h-[7px] w-[70%] rounded" style={{ background: hit ? ACCENT_SOFT : LINE }} />
          <span className="font-mono text-[10px]" style={{ color: hit ? ACCENT : FAINT, fontWeight: hit ? 700 : 400 }}>{hit ? "OO クリニック" : "다른 클리닉"}</span>
        </div>
      ))}
      <div className="mt-2.5 flex items-baseline justify-between text-[11px]" style={{ color: MUTED }}>
        <span>타깃 시술 검색 지면, 상시 점유 목표 (KPI)</span>
        <span><b className="text-[22px] tabular-nums" style={{ color: FG }}>3</b> / 5 Share of Voice</span>
      </div>
    </div>
  )
}

function LeverMatrix() {
  const rows = ["300만", "100만", "30만"]
  const cols = ["25%", "50%", "100%"]
  const cells = [[6600, 13200, 26400], [2200, 4400, 8800], [660, 1320, 2640]]
  const ours = new Set(["1-0", "1-1", "0-1", "0-2"])
  const gx = 78
  const gy = 34
  const w = 100
  const h = 56
  const cx = (j: number) => gx + j * w + w / 2
  const cy = (i: number) => gy + i * h + h / 2
  return (
    <svg viewBox="0 0 400 262" className="block h-auto w-full" role="img" aria-label="가동률과 객단가에 따른 월 매출 매트릭스">
      <defs>
        <marker id="lever-arA" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill={ACCENT} /></marker>
        <marker id="lever-arG" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill={GREY_MARK} /></marker>
      </defs>
      <text x={gx} y={13} fontSize={11} fill={FAINT}>가동률 →</text>
      <text x={10} y={gy - 7} fontSize={11} fill={FAINT}>객단가</text>
      {cols.map((c, j) => <text key={c} x={cx(j)} y={gy - 7} fontSize={12.5} textAnchor="middle" fill={MUTED} fontWeight={600}>{c}</text>)}
      {rows.map((r, i) => (
        <g key={r}>
          <text x={gx - 8} y={cy(i) + 4} fontSize={12.5} textAnchor="end" fill={MUTED} fontWeight={600}>{r}</text>
          {cols.map((c, j) => {
            const on = ours.has(`${i}-${j}`)
            return (
              <g key={c}>
                <rect x={gx + j * w} y={gy + i * h} width={w} height={h} fill={on ? ACCENT_SOFT : "#fff"} stroke={LINE} />
                <text x={cx(j)} y={cy(i) + 1} fontSize={on ? 15 : 13.5} textAnchor="middle" fill={on ? FG : MUTED} fontWeight={on ? 700 : 400} style={{ fontVariantNumeric: "tabular-nums" }}>
                  {cells[i][j].toLocaleString()}
                </text>
              </g>
            )
          })}
        </g>
      ))}
      <polyline points={`${cx(0) + 16},${cy(1) + 18} ${cx(1) - 14},${cy(1) + 18}`} fill="none" stroke={ACCENT} strokeWidth={2} markerEnd="url(#lever-arA)" />
      <polyline points={`${cx(1) + 30},${cy(1) - 10} ${cx(1) + 30},${cy(0) + 22}`} fill="none" stroke={ACCENT} strokeWidth={2} markerEnd="url(#lever-arA)" />
      <polyline points={`${cx(1) + 36},${cy(0) + 18} ${cx(2) - 22},${cy(0) + 18}`} fill="none" stroke={ACCENT} strokeWidth={2} markerEnd="url(#lever-arA)" />
      <polyline points={`${cx(0) + 16},${cy(2) + 18} ${cx(2) - 14},${cy(2) + 18}`} fill="none" stroke={GREY_MARK} strokeWidth={1.6} strokeDasharray="4 3" markerEnd="url(#lever-arG)" />
      <text x={cx(0) + 44} y={cy(1) + 14} fontSize={10.5} fill={ACCENT} fontWeight={700}>P1</text>
      <text x={cx(1) + 36} y={cy(1) - 12} fontSize={10.5} fill={ACCENT} fontWeight={700}>P2</text>
      <text x={cx(1) + 62} y={cy(0) + 14} fontSize={10.5} fill={ACCENT} fontWeight={700}>P3</text>
      {/* 범례: 선 견본 + 설명 */}
      <line x1={gx} x2={gx + 18} y1={gy + 3 * h + 20} y2={gy + 3 * h + 20} stroke={GREY_MARK} strokeWidth={1.6} strokeDasharray="4 3" />
      <text x={gx + 24} y={gy + 3 * h + 24} fontSize={11.5} fill={GREY_MARK}>일반 대행사: 가동률만 올림, 최대 2,640</text>
      <line x1={gx} x2={gx + 18} y1={gy + 3 * h + 38} y2={gy + 3 * h + 38} stroke={ACCENT} strokeWidth={2} />
      <text x={gx + 24} y={gy + 3 * h + 42} fontSize={11.5} fill={ACCENT} fontWeight={700}>설계 경로: 객단가 먼저, 가동률은 50%에서 대기, 26,400</text>
    </svg>
  )
}

const VISUALS = { dualLine: DualLine, serpMock: SerpMock, leverMatrix: LeverMatrix }

// ── 카드 ──────────────────────────────────────────────────

export function StrategyCases() {
  const reduceMotion = useReducedMotion()
  const [cur, setCur] = useState(0)
  const [touched, setTouched] = useState(false)
  const [hovering, setHovering] = useState(false)
  const { ref, paused } = useOffscreenPause()
  const running = !touched && !hovering && !reduceMotion && !paused

  useEffect(() => {
    if (!running) return
    const t = setTimeout(() => setCur((i) => (i + 1) % CASES.length), ROTATE_MS)
    return () => clearTimeout(t)
  }, [cur, running])

  const c = CASES[cur]
  const Visual = VISUALS[c.visual]

  return (
    <div
      ref={ref}
      className="min-w-0 rounded-2xl bg-white px-6 pb-5 pt-5 shadow-[0_1px_0_#E6E1D9]"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      style={{ wordBreak: "keep-all" }}
    >
      <div className="mb-5 flex gap-5 overflow-x-auto border-b scrollbar-hide" style={{ borderColor: LINE }} role="tablist" aria-label="전략 사례">
        {CASES.map((item, i) => {
          const active = i === cur
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => {
                setTouched(true)
                setCur(i)
              }}
              className="relative shrink-0 whitespace-nowrap pb-3 pt-1 text-[13px]"
              style={{ color: active ? ACCENT : MUTED, fontWeight: active ? 700 : 500 }}
            >
              Case {i + 1}
              {active && <span className="absolute inset-x-0 -bottom-px h-0.5" style={{ background: LINE_STRONG }} />}
              {active && running && (
                <motion.span
                  key={`prog-${cur}`}
                  className="absolute left-0 -bottom-px z-[1] h-0.5"
                  style={{ background: ACCENT }}
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: ROTATE_MS / 1000, ease: "linear" }}
                />
              )}
            </button>
          )
        })}
      </div>

      {/* 탭 전환: 퇴장 애니메이션 없이 새 패널만 페이드인 (빠른 연속 전환이나 백그라운드 탭에서도 멈추지 않도록) */}
      <motion.div
          key={c.id}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          role="tabpanel"
        >
          <div className="grid gap-6 md:grid-cols-2">
            <div className="min-w-0">
              <p className="mb-2 text-[17px] font-semibold leading-snug" style={{ color: MUTED }}>&ldquo;{c.question}&rdquo;</p>
              <h4 className="mb-3 whitespace-pre-line text-[20px] font-extrabold leading-snug tracking-[-0.01em]" style={{ color: FG }}>{c.thesis}</h4>
              <div className="mb-4 space-y-2 text-[13px] leading-[1.65]" style={{ color: FG }}>
                {c.body.map((para) =>
                  typeof para === "string" ? (
                    <p key={para}>{para}</p>
                  ) : "tag" in para ? (
                    <p key={para.text}>
                      <span className="mr-1.5 inline-block rounded border px-1.5 align-[1px] text-[11px] font-semibold" style={{ borderColor: LINE_STRONG, color: MUTED }}>
                        {para.tag}
                      </span>
                      {para.text}
                    </p>
                  ) : (
                    <p key={para.quote} className="border-l-2 py-0.5 pl-3 font-semibold" style={{ borderColor: ACCENT }}>
                      &ldquo;{para.quote}&rdquo;
                    </p>
                  )
                )}
              </div>
              <ol className="grid grid-cols-2 gap-3 border-t pt-4 sm:grid-cols-4" style={{ borderColor: LINE }}>
                {c.steps.map((s, i) => (
                  <li key={s}>
                    <span className="mb-1 block font-mono text-[11px] tracking-wide" style={{ color: i === c.steps.length - 1 ? ACCENT : FAINT }}>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="block text-[12.5px] font-semibold leading-snug" style={{ color: FG }}>{s}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="flex min-w-0 flex-col gap-3.5">
              <div className="overflow-hidden rounded-xl border px-3.5 pb-2.5 pt-3.5" style={{ borderColor: LINE }}>
                <Visual />
                {c.visualNote && <p className="mt-1.5 text-[11px]" style={{ color: FAINT }}>{c.visualNote}</p>}
              </div>
              <div className="grid gap-3">
                {c.evidence.map((e) => (
                  <div key={e.value} className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-x-3.5">
                    <div className="min-w-[4.2ch] whitespace-nowrap text-[26px] font-extrabold leading-none tracking-[-0.02em] tabular-nums" style={{ color: FG }}>
                      {e.value}
                    </div>
                    <div>
                      <p className="text-[12px] leading-relaxed" style={{ color: MUTED }}>{e.desc}</p>
                      <p className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[11px]" style={{ color: FAINT }}>
                        {c.inProgress && (
                          <span className="rounded-full border px-1.5 text-[10px] font-bold tracking-wide" style={{ borderColor: ACCENT, color: ACCENT }}>
                            진행 중
                          </span>
                        )}
                        <span>{e.client}, {e.period}</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

      </motion.div>
    </div>
  )
}

export const STRATEGY_INTRO =
  "같은 진료과, 같은 시술이어도 병원마다 답은 다릅니다. Key Message와 시장 지형, 핵심 지표 현황 등을 고려하여 클리닉브릿지는 우리 병원만을 위한 맞춤 전략을 설계합니다."
