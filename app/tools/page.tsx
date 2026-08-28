import type { Metadata } from "next"
import Link from "next/link"
import Header from "@/components/header"
import TextWithBlur from "@/components/text-with-blur"

export const metadata: Metadata = {
  title: "Tools",
  description: "Privacy-first, client-side developer utilities and marketing attribution tools built by Tirup Mehta.",
  alternates: { canonical: "/tools" },
  openGraph: { url: "/tools" },
}

const tools = [
  {
    title: "QR Studio",
    description: "Pro vector QR code and Wi-Fi credential generator. 100% offline & client-side.",
    slug: "/tool/qr",
  },
  {
    title: "UTM Builder",
    description: "GA4 campaign URL generator and link attribution studio with bulk exports.",
    slug: "/tools/utm-builder",
  },
]

export default function ToolsPage() {
  const currentYear = new Date().getFullYear()

  return (
    <main className="relative min-h-screen">
      <Header />

      {/* Tools Section */}
      <section className="section max-w-4xl mx-auto w-full px-6 md:px-20 pb-20">
        <h1 className="sr-only">Developer Tools &amp; Utilities</h1>
        <div className="flex flex-col">
          {tools.map((tool, index) => {
            return (
              <TextWithBlur key={tool.slug} delay={index * 50}>
                <Link
                  href={tool.slug}
                  className={`group block py-5 ${index > 0 ? "border-t" : ""} border-black/10 dark:border-white/10`}
                  suppressHydrationWarning
                >
                  <div className="flex items-baseline gap-4 md:gap-6">
                    {/* Index Number */}
                    <span className="font-mono tabular-nums text-xs md:text-sm text-black/45 dark:text-white/45 select-none w-6 shrink-0">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    {/* Content Row */}
                    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-sm md:text-base leading-relaxed group-hover:translate-x-1.5 transition-transform duration-300 ease-out">
                      <span className="font-medium text-black dark:text-white group-hover:text-accent transition-colors duration-300">
                        {tool.title}
                      </span>
                      <span className="text-black/20 dark:text-white/20 select-none font-extralight">/</span>
                      <span className="text-black/45 dark:text-white/45 font-light group-hover:text-black/70 dark:group-hover:text-white/70 transition-colors duration-300 text-sm">
                        {tool.description}
                      </span>
                    </div>
                  </div>
                </Link>
              </TextWithBlur>
            )
          })}
          {/* End of list bottom border */}
          <div className="border-t border-black/10 dark:border-white/10" />
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 px-6 text-center border-t border-black/10">
        <p className="text-black/50 dark:text-white/50" suppressHydrationWarning>© {currentYear} Tirup Mehta. All rights reserved.</p>
      </footer>
    </main>
  )
}
