import type { Metadata } from "next"
import Link from "next/link"
import Header from "@/components/header"
import TextWithBlur from "@/components/text-with-blur"
import { projectsList as projects } from "@/lib/projects-data"

export const metadata: Metadata = {
  title: "Work | Tirup Mehta",
  description: "Explore projects, developer tools, and security libraries built by Tirup Mehta.",
}

export default function WorkPage() {
  const currentYear = new Date().getFullYear()

  return (
    <main className="relative min-h-screen">
      <Header />

      {/* Projects Section */}
      <section className="section max-w-4xl mx-auto w-full px-6 md:px-20 pb-20">
        <div className="flex flex-col">
          {projects.map((project, index) => {
            return (
              <TextWithBlur key={index} delay={index * 50}>
                <Link
                  href={`/projects/${project.slug}`}
                  className={`group block py-5 ${index > 0 ? "border-t" : ""} border-black/10 dark:border-white/10`}
                  suppressHydrationWarning
                >
                  <div className="flex items-baseline gap-4 md:gap-6">
                    {/* Index Number */}
                    <span className="font-mono tabular-nums text-xs md:text-sm text-black/30 dark:text-white/30 select-none w-6 shrink-0">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    {/* Content Row */}
                    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-sm md:text-base leading-relaxed group-hover:translate-x-1.5 transition-transform duration-300 ease-out">
                      <span className="font-medium text-black dark:text-white group-hover:text-accent transition-colors duration-300">
                        {project.title}
                      </span>
                      <span className="text-black/20 dark:text-white/20 select-none font-extralight">/</span>
                      <span className="text-black/40 dark:text-white/40 font-light group-hover:text-black/70 dark:group-hover:text-white/70 transition-colors duration-300 text-sm">
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
