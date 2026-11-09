import type { Metadata } from "next"
import Header from "@/components/header"
import SkillsSection from "@/components/skills-section"
import SiteFooter from "@/components/site-footer"

export const metadata: Metadata = {
  title: "Skills",
  description: "View the technical skills and core stack utilized by Tirup Mehta across frontend, backend, and security development.",
  alternates: { canonical: "/skills" },
  openGraph: { url: "/skills" },
}

export default function SkillsPage() {
  return (
    <main className="relative min-h-screen flex flex-col">
      <Header />

      {/* Skills Section */}
      <section className="section pb-20 max-w-4xl mx-auto w-full px-6 md:px-20">
        <h1 className="sr-only">Technical Skills</h1>
        <SkillsSection />
      </section>

      <SiteFooter />
    </main>
  )
}
