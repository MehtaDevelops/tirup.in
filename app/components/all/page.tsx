import type { Metadata } from "next"
import Link from "next/link"
import Header from "@/components/header"
import TextWithBlur from "@/components/text-with-blur"

export const metadata: Metadata = {
  title: "All components",
  description: "Unique React components I built. Live, self-owned, dependency-free.",
  alternates: { canonical: "/components/all" },
  openGraph: { url: "/components/all" },
}

const components = [
  {
    title: "Liquid Ascii",
    description: "FLIP fluid simulation rendered as ASCII characters.",
    slug: "/components/liquid-ascii",
  },
]

export default function AllComponentsPage() {
  const currentYear = new Date().getFullYear()

  return (
    <main className="relative min-h-screen flex flex-col">
      <Header />

      {/* Components index: same row system as the tools page */}
      <section className="section max-w-4xl mx-auto w-full px-6 md:px-20 pb-20">
        <h1 className="sr-only">All Components</h1>
        <div className="flex flex-col">
          {components.map((component, index) => (
            <TextWithBlur key={component.slug} delay={index * 50}>
              <Link
                href={component.slug}
                className={`group block py-5 ${index > 0 ? "border-t" : ""} border-black/10 dark:border-white/10`}
                suppressHydrationWarning
              >
                <div className="flex items-baseline gap-4 md:gap-6">
                  <span className="font-mono tabular-nums text-xs md:text-sm text-black/45 dark:text-white/45 select-none w-6 shrink-0">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-sm md:text-base leading-relaxed group-hover:translate-x-1.5 transition-transform duration-300 ease-out">
                    <span className="font-medium text-black dark:text-white group-hover:text-accent transition-colors duration-300">
                      {component.title}
                    </span>
                    <span className="text-black/20 dark:text-white/20 select-none font-extralight">/</span>
                    <span className="text-black/45 dark:text-white/45 font-light group-hover:text-black/70 dark:group-hover:text-white/70 transition-colors duration-300 text-sm">
                      {component.description}
                    </span>
                  </div>
                </div>
              </Link>
            </TextWithBlur>
          ))}
          {/* End of list bottom border */}
          <div className="border-t border-black/10 dark:border-white/10" />

          <TextWithBlur delay={120}>
            <div className="pt-8">
              <p className="text-sm font-light text-black/40 dark:text-white/40">
                New components land here as I build them. Each one ships with a
                live playground and build notes.
              </p>
            </div>
          </TextWithBlur>
        </div>
      </section>

      <footer className="py-4 px-6 text-center border-t border-black/10 dark:border-white/10 mt-auto">
        <p className="text-xs md:text-sm text-black/40 dark:text-white/40" suppressHydrationWarning>© {currentYear} Tirup Mehta. All rights reserved.</p>
      </footer>
    </main>
  )
}
