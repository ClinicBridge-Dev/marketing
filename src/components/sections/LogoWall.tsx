"use client"

import Image from "next/image"
import { Container } from "@/components/common/Container"
import { cn } from "@/lib/utils"
import { LogoItem, PARTNER_LOGOS } from "@/data/partners"

// 더스퀘어덱(thesquare-deck) index.html의 "함께한 곳" 로고 월을 클론.
const logos = PARTNER_LOGOS

function LogoTile({ item, ariaHidden = false }: { item: LogoItem; ariaHidden?: boolean }) {
  const width = item.width ?? 140
  const height = item.height ?? 56

  return (
    <div
      aria-hidden={ariaHidden}
      className="flex items-center justify-center shrink-0"
      style={{ width, height }}
    >
      <div className="relative w-full h-full">
        <Image src={item.logo} alt={item.name} fill className="object-contain" sizes={`${width}px`} />
      </div>
    </div>
  )
}

function MarqueeRow({ items, direction }: { items: LogoItem[]; direction: "left" | "right" }) {
  const track = [...items, ...items]

  return (
    <div className="marquee-row overflow-hidden">
      <div
        className={cn(
          "flex items-center w-max gap-10 sm:gap-12",
          direction === "left" ? "animate-marquee-left" : "animate-marquee-right"
        )}
      >
        {track.map((item, index) => (
          <LogoTile key={`${item.id}-${index}`} item={item} ariaHidden={index >= items.length} />
        ))}
      </div>
    </div>
  )
}

export function LogoWall() {
  return (
    <section className="py-20 lg:py-28 bg-white">
      <Container>
        <p
          className="text-center text-xl sm:text-2xl font-bold text-gray-900 leading-[1.5] mb-14 lg:mb-20"
          style={{ wordBreak: "keep-all" }}
        >
          코스피 상장사부터 네트워크 병원 본사까지.
          <br />
          메디컬 리더들의 해외 마케팅을 전담합니다.
        </p>
      </Container>
      <MarqueeRow items={[...logos, ...logos, ...logos]} direction="left" />
    </section>
  )
}
