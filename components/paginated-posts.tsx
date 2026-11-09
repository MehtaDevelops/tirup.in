"use client"

import { useState } from "react"
import Link from "next/link"
import TextWithBlur from "@/components/text-with-blur"
import ListSpotlight from "@/components/list-spotlight"
import { ChevronLeft, ChevronRight } from "lucide-react"

export interface BlogPost {
  slug: string
  title: string
  tldr: string
  createdAt: string
  status?: "draft" | "published"
}

interface PaginatedPostsProps {
  posts: BlogPost[]
  pageSize?: number
}

function formatDate(dateStr: string) {
  try {
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) return ""
    const day = String(date.getUTCDate()).padStart(2, "0")
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const month = months[date.getUTCMonth()]
    const year = date.getUTCFullYear()
    return `${day}.${month}.${year}`
  } catch {
    return ""
  }
}

/**
 * Writing index pager. Kept structurally identical to the blog home pager in
 * the blogs repo so the two surfaces of the same list cannot drift: same row
 * markup, same stagger, same spotlight container, same controls. Only the
 * href prefix differs, because each site owns its own article route.
 */
export function PaginatedPosts({ posts, pageSize = 10 }: PaginatedPostsProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const totalPages = Math.max(1, Math.ceil(posts.length / pageSize))

  const startIndex = (currentPage - 1) * pageSize
  const currentPosts = posts.slice(startIndex, startIndex + pageSize)

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) return
    setCurrentPage(page)
    const listElem = document.getElementById("blog-posts-list")
    if (listElem) {
      const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
      listElem.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" })
    }
  }

  if (posts.length === 0) {
    return (
      <div className="py-8">
        <p className="text-sm font-light text-black/40 dark:text-white/40">No articles published yet.</p>
      </div>
    )
  }

  return (
    <div id="blog-posts-list">
      {/* Animated container keyed by currentPage for transition animation */}
      <div key={`page-${currentPage}`} className="flex flex-col animate-page-transition">
        {/* ListSpotlight owns the rows: the sibling dimming needs them as
            direct children, so the pagination controls sit outside it. */}
        <ListSpotlight className="flex flex-col list-hover-group">
          {currentPosts.map((post, index) => {
            return (
              <TextWithBlur key={post.slug} delay={Math.min(index * 20, 100)}>
                <Link
                  href={`/writing/${post.slug}`}
                  className={[
                    "group block",
                    // The first row hugs the intro line: its top padding would
                    // read as dead space under the list introduction.
                    index === 0 ? "pb-5" : "py-5",
                    index > 0 ? "border-t border-black/10 dark:border-white/10" : "",
                    // Hover is color-only: the row never shifts or washes, so the
                    // dividers stay perfectly aligned with the text column.
                    "[transition:transform_100ms_cubic-bezier(0.16,1,0.3,1)]",
                    "active:scale-[0.99]",
                  ].join(" ")}
                >
                  <div className="flex flex-col gap-1.5">
                    {/* Top line: Title and Date */}
                    <div className="flex justify-between items-baseline gap-2 sm:gap-4">
                      {/* Left: Title */}
                      <div className="flex items-baseline gap-x-2 leading-relaxed min-w-0 flex-1">
                        <h2 className="font-medium text-black dark:text-white group-hover:text-accent [transition:color_80ms_ease-out] text-base md:text-lg break-words">
                          {post.title}
                        </h2>
                      </div>

                      {/* Right: Date */}
                      <span className="tabular-nums text-xs text-black/40 dark:text-white/40 select-none shrink-0 group-hover:text-black/60 dark:group-hover:text-white/60 [transition:color_80ms_ease-out] whitespace-nowrap">
                        {formatDate(post.createdAt)}
                      </span>
                    </div>

                    {/* Description / TLDR below title */}
                    {post.tldr && (
                      <p className="text-sm text-black/60 dark:text-white/55 group-hover:text-black/80 dark:group-hover:text-white/75 font-light leading-relaxed line-clamp-2 [transition:color_80ms_ease-out] pr-2 sm:pr-4 break-words">
                        {post.tldr}
                      </p>
                    )}
                  </div>
                </Link>
              </TextWithBlur>
            )
          })}
          {/* End border */}
          <div className="border-t border-black/10 dark:border-white/10" />
        </ListSpotlight>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-6 select-none">
          {/* Previous Page Button */}
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            aria-label="Previous Page"
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 border border-black/5 dark:border-white/5 disabled:opacity-30 disabled:pointer-events-none transition-all duration-200 cursor-pointer active:scale-[0.97]"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Previous</span>
          </button>

          {/* Page Indicators */}
          <div className="flex items-center gap-1.5">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
              const isActive = pageNum === currentPage
              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  aria-label={`Go to page ${pageNum}`}
                  aria-current={isActive ? "page" : undefined}
                  className={`w-7 h-7 rounded-lg text-xs tabular-nums flex items-center justify-center transition-colors cursor-pointer active:scale-[0.97] ${
                    isActive
                      ? "bg-black dark:bg-white text-white dark:text-black font-medium"
                      : "text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5"
                  }`}
                >
                  {pageNum}
                </button>
              )
            })}
          </div>

          {/* Next Page Button */}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            aria-label="Next Page"
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 border border-black/5 dark:border-white/5 disabled:opacity-30 disabled:pointer-events-none transition-all duration-200 cursor-pointer active:scale-[0.97]"
          >
            <span>Next</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  )
}
