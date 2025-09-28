"use client"

import { useRef, useState } from "react"

interface Skill {
  name: string
  level: number // 1-10
  category: "development" | "design" | "security"
}

export default function SkillsSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(true) // Start visible

  const skills: Skill[] = [
    { name: "React", level: 9, category: "development" },
    { name: "Next.js", level: 9, category: "development" },
    { name: "TypeScript", level: 8, category: "development" },
    { name: "UI/UX Design", level: 9, category: "design" },
    { name: "Figma", level: 8, category: "design" },
    { name: "Cybersecurity", level: 8, category: "security" },
    { name: "Network Security", level: 7, category: "security" },
    { name: "Tailwind CSS", level: 9, category: "development" },
    { name: "JavaScript", level: 9, category: "development" },
    { name: "Responsive Design", level: 9, category: "design" },
    { name: "Penetration Testing", level: 7, category: "security" },
    { name: "CSS/SCSS", level: 8, category: "development" },
  ]

  // Group skills by category
  const developmentSkills = skills.filter((skill) => skill.category === "development")
  const designSkills = skills.filter((skill) => skill.category === "design")
  const securitySkills = skills.filter((skill) => skill.category === "security")

  return (
    <div ref={sectionRef} className="w-full max-w-4xl mx-auto">
      <h2 className="text-3xl font-light mb-12">Expertise</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        <div>
          <h3 className="text-xl font-light mb-6 text-gray-900 dark:text-gray-100">Development</h3>
          <ul className="space-y-4">
            {developmentSkills.map((skill) => (
              <li key={skill.name} className="group">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm">{skill.name}</span>
                  <span className="text-xs text-black/50">{skill.level}/10</span>
                </div>
                <div className="h-[1px] w-full bg-black/10 overflow-hidden">
                  <div
                    className="h-full bg-accent transition-all duration-1000 ease-out origin-left"
                    style={{
                      width: `${skill.level * 10}%`,
                      transitionDelay: `${developmentSkills.indexOf(skill) * 100}ms`,
                    }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-xl font-light mb-6 text-gray-900 dark:text-gray-100">Design</h3>
          <ul className="space-y-4">
            {designSkills.map((skill) => (
              <li key={skill.name} className="group">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm">{skill.name}</span>
                  <span className="text-xs text-black/50">{skill.level}/10</span>
                </div>
                <div className="h-[1px] w-full bg-black/10 overflow-hidden">
                  <div
                    className="h-full bg-accent transition-all duration-1000 ease-out origin-left"
                    style={{
                      width: `${skill.level * 10}%`,
                      transitionDelay: `${designSkills.indexOf(skill) * 100}ms`,
                    }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-xl font-light mb-6 text-gray-900 dark:text-gray-100">Security</h3>
          <ul className="space-y-4">
            {securitySkills.map((skill) => (
              <li key={skill.name} className="group">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm">{skill.name}</span>
                  <span className="text-xs text-black/50">{skill.level}/10</span>
                </div>
                <div className="h-[1px] w-full bg-black/10 overflow-hidden">
                  <div
                    className="h-full bg-accent transition-all duration-1000 ease-out origin-left"
                    style={{
                      width: `${skill.level * 10}%`,
                      transitionDelay: `${securitySkills.indexOf(skill) * 100}ms`,
                    }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
