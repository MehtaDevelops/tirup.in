import type { Metadata } from "next"
import Header from "@/components/header"
import SkillsSection from "@/components/skills-section"

export const metadata: Metadata = {
  title: "Skills | Tirup Mehta",
  description: "View the technical skills and core stack utilized by Tirup Mehta across frontend, backend, and security development.",
}

export default function SkillsPage() {
  const currentYear = new Date().getFullYear()

  return (
    <main className="relative min-h-screen">
      <Header />

      {/* Skills Section */}
      <section className="section pb-20 max-w-4xl mx-auto w-full px-6 md:px-20">
        <SkillsSection />
      </section>

      {/* Footer */}
      <footer className="py-6 px-6 text-center border-t border-black/10">
        <p className="text-black/50 dark:text-white/50" suppressHydrationWarning>© {currentYear} Tirup Mehta. All rights reserved.</p>
      </footer>
    </main>
  )
}
