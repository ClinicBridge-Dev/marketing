import Image from "next/image"

interface ArticleHeaderProps {
  category: string
  title: string
  subtitle?: string
  author?: string
  dateLabel: string
  readTime?: string
  image?: string
}

export function ArticleHeader({
  category,
  title,
  subtitle,
  author,
  dateLabel,
  readTime,
  image,
}: ArticleHeaderProps) {
  return (
    <div>
      {image && (
        <div className="relative aspect-[1693/929] overflow-hidden bg-black -mx-6 sm:-mx-10 -mt-6 sm:-mt-10 mb-8 w-[calc(100%+3rem)] sm:w-[calc(100%+5rem)]">
          <Image src={image} alt="" fill className="object-cover" sizes="800px" />
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <span className="text-sm font-medium text-[#C1452D] bg-[#FBEEE8] px-3 py-1 rounded-full">
          {category}
        </span>
        <div className="flex flex-wrap items-center gap-2 text-sm text-gray-400">
          {readTime && (
            <>
              <span>{readTime}</span>
              <span>·</span>
            </>
          )}
          <span>{dateLabel}</span>
        </div>
      </div>

      <h1
        className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 leading-tight"
        style={{ wordBreak: "keep-all" }}
      >
        {title}
      </h1>

      {subtitle && (
        <p
          className="text-base text-gray-500 mb-8 leading-relaxed"
          style={{ wordBreak: "keep-all" }}
        >
          {subtitle}
        </p>
      )}

      {author && (
        <div className="flex items-center gap-3 pb-8 mb-8 border-b border-gray-100">
          <div className="w-10 h-10 rounded-full bg-[#FBEEE8] flex items-center justify-center text-[#C1452D] font-semibold">
            {author.charAt(0)}
          </div>
          <div>
            <p className="font-medium text-gray-900 text-sm">{author}</p>
            <p className="text-xs text-gray-400">작성자</p>
          </div>
        </div>
      )}
    </div>
  )
}
