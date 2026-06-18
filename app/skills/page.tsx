"use client"

import { useEffect, useState } from "react"
import Header from "@/components/header"
import SkillsSection from "@/components/skills-section"

export default function SkillsPage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    document.documentElement.style.scrollBehavior = "smooth"
    return () => {
      document.documentElement.style.scrollBehavior = ""
    }
  }, [])

  return (
    <main className="relative min-h-screen">
      <Header />

      {/* Skills Section */}
      <section className="section pb-20 max-w-4xl mx-auto w-full px-6 md:px-20">
        <SkillsSection />
      </section>

      {/* Footer */}
      <footer className="py-6 px-6 text-center border-t border-black/10">
        <p className="text-black/50 dark:text-white/50">© {mounted ? new Date().getFullYear() : "2025"} Tirup Mehta. All rights reserved.</p>
      </footer>
    </main>
  )
}
