import type { Metadata } from "next"
import Link from "next/link"
import Header from "@/components/header"
import TextWithBlur from "@/components/text-with-blur"
import { projectsList as projects } from "@/lib/projects-data"

export const metadata: Metadata = {
  title: "Work",
  description: "Explore projects, developer tools, and security libraries built by Tirup Mehta.",
  alternates: { canonical: "/work" },
  openGraph: { url: "/work" },
}

export default function WorkPage() {
  const currentYear = new Date().getFullYear()

  return (
    <main className="relative min-h-screen">
      <Header />

      {/* Projects Section */}
      <section className="section max-w-4xl mx-auto w-full px-6 md:px-20 pb-20">
        <h1 className="sr-only">Selected Work &amp; Projects</h1>
        <div className="flex flex-col list-hover-group">
          {projects.map((project, index) => {
            return (
              <TextWithBlur key={index} delay={index * 50}>
                <Link
                  href={`/projects/${project.slug}`}
                  className={[
                    "group block py-5 -mx-3 px-3 rounded-lg",
                    index > 0 ? "border-t border-black/10 dark:border-white/10" : "",
                    "[transition:background-color_120ms_ease-out]",
                    "hover:bg-black/[0.025] dark:hover:bg-white/[0.025]",
                    "active:scale-[0.99] [transition:background-color_120ms_ease-out,transform_100ms_cubic-bezier(0.16,1,0.3,1)]",
                  ].join(" ")}
                  suppressHydrationWarning
                >
                  <div className="flex items-baseline gap-4 md:gap-6">
                    {/* Index Number */}
                    <span className="font-mono tabular-nums text-xs md:text-sm text-black/40 dark:text-white/40 select-none w-6 shrink-0 group-hover:text-black/60 dark:group-hover:text-white/60 [transition:color_80ms_ease-out]">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    {/* Content Row — stable, no translate */}
                    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-sm md:text-base leading-relaxed">
                      <span className="font-medium text-black dark:text-white group-hover:text-accent [transition:color_80ms_ease-out]">
                        {project.title}
                      </span>
                      <span className="text-black/20 dark:text-white/20 select-none font-extralight">/</span>
                      <span className="text-black/50 dark:text-white/50 font-light group-hover:text-black/70 dark:group-hover:text-white/70 [transition:color_80ms_ease-out] text-sm">
                        {project.description}
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
