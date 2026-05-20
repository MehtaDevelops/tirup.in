"use client"

import React from "react"
import TextWithBlur from "@/components/text-with-blur"
import { 
  Cpu, 
  Code2, 
  FileCode, 
  Paintbrush, 
  Layers, 
  Figma, 
  MonitorSmartphone, 
  ShieldCheck, 
  Globe, 
  Terminal 
} from "lucide-react"

interface SkillItem {
  name: string
  detail: string
  icon: React.ReactNode
}

interface SkillCategory {
  index: string
  title: string
  skills: SkillItem[]
}

export default function SkillsSection() {
  const categories: SkillCategory[] = [
    {
      index: "01",
      title: "Development",
      skills: [
        { 
          name: "React & Next.js", 
          detail: "App Router architectures, React Server Components (RSC), SSR, and performance optimization.",
          icon: <Cpu size={14} className="text-black/50 dark:text-white/50" />
        },
        { 
          name: "TypeScript", 
          detail: "Designing type-safe application structures, strict compiler checks, and clean API contracts.",
          icon: <Code2 size={14} className="text-black/50 dark:text-white/50" />
        },
        { 
          name: "JavaScript", 
          detail: "Modern ES6+, asynchronous workflow handling, and performant client-side scripting.",
          icon: <FileCode size={14} className="text-black/50 dark:text-white/50" />
        },
        { 
          name: "Tailwind CSS & CSS/SCSS", 
          detail: "Creating custom responsive grids, theme styling architectures, and smooth layout animations.",
          icon: <Paintbrush size={14} className="text-black/50 dark:text-white/50" />
        },
      ],
    },
    {
      index: "02",
      title: "Design",
      skills: [
        { 
          name: "UI/UX Design", 
          detail: "Structuring intuitive user journeys, interactive wireframes, and user-centric flows.",
          icon: <Layers size={14} className="text-black/50 dark:text-white/50" />
        },
        { 
          name: "Figma", 
          detail: "Maintaining design systems, variable-based component configurations, and interactive prototypes.",
          icon: <Figma size={14} className="text-black/50 dark:text-white/50" />
        },
        { 
          name: "Responsive Layouts", 
          detail: "Delivering mobile-first layouts, flexible grid systems, and fluid typography hierarchies.",
          icon: <MonitorSmartphone size={14} className="text-black/50 dark:text-white/50" />
        },
      ],
    },
    {
      index: "03",
      title: "Security",
      skills: [
        { 
          name: "Cybersecurity", 
          detail: "Reviewing code structures for security vulnerabilities, threat modeling, and access control.",
          icon: <ShieldCheck size={14} className="text-black/50 dark:text-white/50" />
        },
        { 
          name: "Network Security", 
          detail: "Monitoring network traffic, analyzing packet structures, and implementing secure firewall rules.",
          icon: <Globe size={14} className="text-black/50 dark:text-white/50" />
        },
        { 
          name: "Penetration Testing", 
          detail: "Performing systematic audits, script-based vulnerability scanning, and security reporting.",
          icon: <Terminal size={14} className="text-black/50 dark:text-white/50" />
        },
      ],
    },
  ]

  return (
    <div className="w-full max-w-4xl mx-auto py-16 px-4 md:px-0">
      <h2 className="text-3xl font-light mb-16 tracking-tight text-black dark:text-white">
        Expertise
      </h2>

      <div className="flex flex-col">
        {categories.map((cat) => {
          return (
            <TextWithBlur key={cat.title}>
              <div
                className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 border-t border-black/10 dark:border-white/10 py-10 md:py-14 transition-all duration-300"
              >
                {/* Category Info */}
                <div className="col-span-1 flex items-baseline gap-2">
                  <span className="font-mono text-xs md:text-sm text-black/40 dark:text-white/40 select-none">
                    {cat.index}
                  </span>
                  <h3 className="text-lg md:text-xl font-light tracking-tight text-black dark:text-white">
                    {cat.title}
                  </h3>
                </div>

                {/* Skills List */}
                <div className="col-span-1 md:col-span-2 space-y-8">
                  {cat.skills.map((skill, sIdx) => {
                    return (
                      <div
                        key={skill.name}
                        className={`relative cursor-default transition-all duration-300 ${
                          sIdx > 0 ? "border-t border-black/10 dark:border-white/10 pt-8" : ""
                        }`}
                      >
                        <h4 className="text-lg md:text-xl font-light tracking-tight text-black dark:text-white flex items-center gap-2">
                          {skill.icon}
                          <span>{skill.name}</span>
                        </h4>
                        <p className="text-sm md:text-lg font-light text-black/70 dark:text-white/70 leading-relaxed mt-2">
                          {skill.detail}
                        </p>
                      </div>
                    )
                  })}
                </div>
              </div>
            </TextWithBlur>
          )
        })}
        {/* End of list bottom border */}
        <div className="border-t border-black/10 dark:border-white/10" />
      </div>
    </div>
  )
}
