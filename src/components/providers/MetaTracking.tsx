"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"
import { trackMetaConsultClick, trackMetaPageView } from "@/lib/metaPixel"

export function MetaTracking() {
  const pathname = usePathname()

  useEffect(() => {
    if (pathname) trackMetaPageView(pathname)
  }, [pathname])

  useEffect(() => {
    // One delegated listener covers desktop/mobile CTAs, including keyboard clicks.
    // Capture before mobile navigation unmounts its link on click.
    const onClick = (event: MouseEvent) => {
      if (!(event.target instanceof Element)) return
      const link = event.target.closest<HTMLAnchorElement>("a[href]")
      if (!link) return
      const url = new URL(link.href, window.location.href)
      if (url.origin !== window.location.origin || url.pathname.replace(/\/$/, "") !== "/inquiry") return
      trackMetaConsultClick(link.dataset.metaPlacement || "content")
    }
    document.addEventListener("click", onClick, true)
    return () => document.removeEventListener("click", onClick, true)
  }, [])

  return null
}
