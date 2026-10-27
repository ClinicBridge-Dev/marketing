// Shared with campaign.clinicbridge.co.kr. Main-site conversions must NOT use Lead.
export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim() || "1979462026345832"

type MetaQueue = {
  (...args: unknown[]): void
  callMethod?: (...args: unknown[]) => void
  queue: unknown[][]
  push: MetaQueue
  loaded: boolean
  version: string
}

declare global {
  interface Window {
    fbq?: MetaQueue
    _fbq?: MetaQueue
    clinicBridgeMeta?: { initialized: boolean; lastPath?: string; inquiryStarted?: boolean }
  }
}

const PRODUCTION_HOSTS = new Set(["www.clinicbridge.co.kr", "clinicbridge.co.kr"])
const START_KEY = "cb:meta:inquiry-start:v1"
const PAGE_TYPES: Record<string, string> = {
  "/": "home",
  "/about": "about",
  "/services": "service",
  "/pricing": "pricing",
  "/autopilot": "product",
  "/blog": "content_list",
  "/data": "report_article",
  "/benchmark": "assessment",
  "/inquiry": "inquiry",
  "/inquiry/complete": "inquiry_complete",
  "/privacy": "legal",
  "/terms": "legal",
}

function isEnabled() {
  return typeof window !== "undefined" &&
    process.env.NEXT_PUBLIC_META_PIXEL_ENABLED !== "false" &&
    PRODUCTION_HOSTS.has(window.location.hostname)
}

// Called after hydration or by an interaction. Queue events while the async SDK loads.
// All public tracking helpers swallow SDK/storage errors so forms keep working.
function getPixel() {
  if (!isEnabled()) return undefined
  const state = window.clinicBridgeMeta ??= { initialized: false }
  if (!window.fbq) {
    const fbq: MetaQueue = Object.assign(function (...args: unknown[]) {
      if (fbq.callMethod) fbq.callMethod(...args)
      else fbq.queue.push(args)
    }, { queue: [] as unknown[][], loaded: true, version: "2.0" }) as MetaQueue
    fbq.push = fbq
    window.fbq = fbq
    window._fbq ??= fbq

    const script = document.createElement("script")
    script.async = true
    script.src = "https://connect.facebook.net/en_US/fbevents.js"
    document.head.appendChild(script)
  }
  if (!state.initialized) {
    // Manual events only; do not scrape form values or enable advanced matching.
    window.fbq("set", "autoConfig", false, META_PIXEL_ID)
    window.fbq("init", META_PIXEL_ID)
    state.initialized = true
  }
  return window.fbq
}

function pageContext() {
  // Deliberately omit query strings, hashes, referrers, and all form values.
  const pagePath = window.location.pathname
  const pageType = PAGE_TYPES[pagePath] ?? (pagePath.startsWith("/blog/") ? "article" : "content")
  return { site_area: "main", page_path: pagePath, page_type: pageType, schema_version: "1.0" }
}

export function trackMetaPageView(pathname: string) {
  try {
    const fbq = getPixel()
    const state = window.clinicBridgeMeta
    if (!fbq || !state || state.lastPath === pathname) return
    fbq("trackSingle", META_PIXEL_ID, "PageView", pageContext())
    state.lastPath = pathname
  } catch { /* Analytics must not interrupt navigation. */ }
}

type CustomEvent = "ConsultClick" | "InquiryStart" | "ConsultationSubmit" | "DiagnosisSubmit"

function trackCustom(event: CustomEvent, params: Record<string, string>) {
  try {
    const fbq = getPixel()
    if (!fbq) return false
    fbq("trackSingleCustom", META_PIXEL_ID, event, { ...pageContext(), ...params })
    return true
  } catch { return false }
}

export function trackMetaConsultClick(placement: string) {
  trackCustom("ConsultClick", { placement, destination_path: "/inquiry" })
}

export function trackMetaInquiryStart() {
  if (!isEnabled()) return
  const state = window.clinicBridgeMeta ??= { initialized: false }
  if (state.inquiryStarted) return
  try {
    if (sessionStorage.getItem(START_KEY)) {
      state.inquiryStarted = true
      return
    }
  } catch { /* In-memory fallback for browsers with storage disabled. */ }
  if (!trackCustom("InquiryStart", { form_id: "inquiry", lead_type: "consultation" })) return
  state.inquiryStarted = true
  try { sessionStorage.setItem(START_KEY, "1") } catch { /* In-memory fallback. */ }
}

// Only invoke from the corresponding API success branch, never a completion page.
// No inquiryId dedup: that ID can be shared by distinct same-day submissions.
export function trackMetaConsultationSubmit() {
  trackCustom("ConsultationSubmit", { form_id: "inquiry", lead_type: "consultation" })
}

export function trackMetaDiagnosisSubmit() {
  trackCustom("DiagnosisSubmit", { form_id: "diagnosis", lead_type: "diagnosis" })
}
