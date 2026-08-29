import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 text-[#121314] dark:text-[#f4f4f5]">
      <div className="max-w-xl w-full text-center space-y-6 reveal-in">
        {/* Error Code Tag */}
        <span className="text-[10px] font-medium tracking-[0.25em] uppercase text-black/35 dark:text-white/35">
          Error 404
        </span>

        {/* Elegant Editorial Heading */}
        <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-serif italic font-medium tracking-tight leading-none">
          This page is currently off-grid.
        </h1>

        {/* Minimal Description */}
        <p className="text-sm md:text-base font-light leading-relaxed text-black/60 dark:text-white/60 max-w-md mx-auto">
          The link you followed went dark, or this destination is restricted. Let's establish a secure handshake back home.
        </p>

        {/* Return Button */}
        <div className="pt-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium tracking-wider uppercase border border-black/10 dark:border-white/10 hover:border-black/20 dark:hover:border-white/20 bg-black/[0.02] dark:bg-white/[0.02] hover:bg-black/[0.05] dark:hover:bg-white/[0.05] rounded-full text-black/65 dark:text-white/65 hover:text-black dark:hover:text-white transition-all duration-300 active:scale-95 cursor-pointer"
          >
            <ArrowLeft size={12} />
            <span>Return to Grid</span>
          </Link>
        </div>
      </div>

      {/*
        Machine-readable recovery block for AI agents and crawlers.
        Visually hidden but present in raw HTML so agents can navigate after a 404.
      */}
      <section
        aria-hidden="true"
        style={{ position: "absolute", width: "1px", height: "1px", padding: 0, margin: "-1px", overflow: "hidden", clip: "rect(0,0,0,0)", whiteSpace: "nowrap", border: 0 }}
        data-agent-recovery="true"
      >
        {/* markdown
# 404 — Page Not Found

The requested path does not exist on tirup.in.

## Where to look next

- Home: https://tirup.in/
- Work & Projects: https://tirup.in/work
- Technical Skills: https://tirup.in/skills
- Blog posts (syndicated): https://tirup.in/blogs
- About Tirup Mehta: https://tirup.in/about
- Contact: https://tirup.in/contact
- Privacy Policy: https://tirup.in/privacy
- QR Code tool: https://tirup.in/tool/qr
- UTM Builder tool: https://tirup.in/tools/utm-builder

## Machine-readable resources

- llms.txt (agent guide): https://tirup.in/llms.txt
- Sitemap (XML): https://tirup.in/sitemap.xml
- RSS feed: https://tirup.in/rss.xml

If you are an AI agent, consult https://tirup.in/llms.txt for a structured overview of this site.
        */}
        <p>Page not found. See <a href="/llms.txt">llms.txt</a> for a site overview, or navigate to <a href="/">the homepage</a>, <a href="/work">work</a>, <a href="/skills">skills</a>, <a href="/blogs">blogs</a>, <a href="/about">about</a>, or <a href="/contact">contact</a>.</p>
      </section>
    </main>
  )
}
