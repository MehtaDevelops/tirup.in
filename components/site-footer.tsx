import Link from "next/link"
import type { ReactNode } from "react"
import CopyEmail from "@/components/copy-email"

interface SiteFooterProps {
  /** Optional page-specific line (for example the about page dedication). */
  note?: ReactNode
}

/**
 * Portfolio footer. Identical structure to the blog footer: identity column
 * with the email, then a 3x2 link grid. Only the destinations differ.
 */
const FOOTER_LINKS: ReadonlyArray<{ label: string; href: string; external?: boolean }> = [
  { label: "Writing", href: "/writing" },
  { label: "GitHub", href: "https://github.com/TirupMehta", external: true },
  { label: "Blog", href: "https://blogs.tirup.in", external: true },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/TirupMehta", external: true },
  { label: "About", href: "/about" },
  { label: "X", href: "https://x.com/TirupMehta", external: true },
  { label: "Contact", href: "/contact" },
]

const linkClass =
  "w-fit text-black/60 transition-colors hover:text-black dark:text-white/60 dark:hover:text-white"

const metaLinkClass =
  "transition-colors hover:text-black dark:hover:text-white"

export default function SiteFooter({ note }: SiteFooterProps) {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="mt-auto">
      <div className="mx-auto w-full max-w-4xl px-6 md:px-20">
        <div className="border-t border-black/10 py-10 dark:border-white/10">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-black dark:text-white">Tirup Mehta</p>
            <p className="max-w-xs text-sm font-light leading-relaxed text-black/50 dark:text-white/50">
              Software engineer building secure, fast interfaces.
            </p>
            <CopyEmail
              email="contact@tirup.in"
              className="inline-block cursor-pointer text-sm font-light text-black/50 underline decoration-black/20 underline-offset-4 transition-colors hover:text-black hover:decoration-black/40 dark:text-white/50 dark:decoration-white/20 dark:hover:text-white dark:hover:decoration-white/40"
            />
            {note ? (
              <div className="pt-2 text-xs font-light leading-relaxed text-black/35 dark:text-white/35">
                {note}
              </div>
            ) : null}
          </div>

          <nav aria-label="Footer" className="grid grid-cols-2 gap-x-12 gap-y-2 text-sm font-light">
            {FOOTER_LINKS.map(({ label, href, external }) =>
              external ? (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={linkClass}
                >
                  {label}
                </a>
              ) : (
                <Link key={label} href={href} className={linkClass}>
                  {label}
                </Link>
              )
            )}
          </nav>
        </div>

        <div className="mt-8 flex flex-col gap-3 border-t border-black/5 pt-4 text-xs text-black/40 dark:border-white/5 dark:text-white/40 sm:flex-row sm:items-center sm:justify-between">
          <p suppressHydrationWarning>© {currentYear} Tirup Mehta</p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <Link href="/privacy" className={metaLinkClass}>Privacy</Link>
            <a href="/llms.txt" className={metaLinkClass}>llms.txt</a>
            <a href="#main-content" className={metaLinkClass}>Back to top ↑</a>
          </div>
        </div>
        </div>
      </div>
    </footer>
  )
}
