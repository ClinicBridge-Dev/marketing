"use client"

import Image from "next/image"
import { Container } from "@/components/common/Container"
import { cn } from "@/lib/utils"
import { LogoItem, PARTNER_LOGOS } from "@/data/partners"

// 더스퀘어덱(thesquare-deck) index.html의 "함께한 곳" 로고 월을 클론.
const logos = PARTNER_LOGOS

function LogoTile({ item, ariaHidden = false, monochrome = false }: { item: LogoItem; ariaHidden?: boolean; monochrome?: boolean }) {
  const width = item.width ?? 140
  const height = item.height ?? 56

  return (
    <div
      aria-hidden={ariaHidden}
      className={cn(
        "flex items-center justify-center shrink-0",
        monochrome && "grayscale opacity-60 transition duration-300 hover:grayscale-0 hover:opacity-100"
      )}
      style={{ width, height }}
    >
      <div className="relative w-full h-full">
        <Image src={item.logo} alt={item.name} fill className="object-contain" sizes={`${width}px`} />
      </div>
    </div>
  )
}

function MarqueeRow({ items, direction, monochrome }: { items: LogoItem[]; direction: "left" | "right"; monochrome?: boolean }) {
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
          <LogoTile key={`${item.id}-${index}`} item={item} ariaHidden={index >= items.length} monochrome={monochrome} />
        ))}
      </div>
    </div>
  )
}

interface LogoWallProps {
  /** 제목 영역을 통째로 바꿀 때 사용. 없으면 기존 중앙 정렬 문구를 쓴다 */
  intro?: React.ReactNode
  /** true 면 로고를 흑백으로 두고 호버 시 컬러로 표시 */
  monochrome?: boolean
  className?: string
}

export function LogoWall({ intro, monochrome = false, className }: LogoWallProps = {}) {
  return (
    <section className={cn("py-20 lg:py-28 bg-white", className)}>
      <Container>
        {intro ?? (
          <p
            className="text-center text-xl sm:text-2xl font-bold text-gray-900 leading-[1.5] mb-14 lg:mb-20"
            style={{ wordBreak: "keep-all" }}
          >
            코스피 상장사부터 네트워크 병원 본사까지.
            <br />
            메디컬 리더들의 해외 마케팅을 전담합니다.
          </p>
        )}
      </Container>
      <MarqueeRow items={[...logos, ...logos, ...logos]} direction="left" monochrome={monochrome} />
    </section>
  )
}
