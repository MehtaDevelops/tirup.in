"use client"

import React from "react"
import TextWithBlur from "@/components/text-with-blur"
import {
  SiTypescript,
  SiNextdotjs,
  SiTailwindcss,
  SiReact,
  SiJavascript,
  SiMongodb,
  SiRedis,
  SiGit,
  SiDocker,
  SiFigma,
  SiSupabase,
} from "react-icons/si"

const techIcons: Record<string, React.ReactNode> = {
  "TypeScript": <SiTypescript className="w-[18px] h-[18px] text-[#3178c6]" />,
  "Next.js": <SiNextdotjs className="w-[16px] h-[16px] text-zinc-900 dark:text-zinc-100" />,
  "Tailwind CSS": <SiTailwindcss className="w-[18px] h-[18px] text-[#38bdf8]" />,
  "Motion": (
    <svg viewBox="0 0 25.364 9" className="w-[22px] h-auto fill-current text-zinc-900 dark:text-zinc-100" aria-hidden="true">
      <path d="M 9.587 0 L 4.57 9 L 0 9 L 3.917 1.972 C 4.524 0.883 6.039 0 7.301 0 Z M 20.794 2.25 C 20.794 1.007 21.817 0 23.079 0 C 24.341 0 25.364 1.007 25.364 2.25 C 25.364 3.493 24.341 4.5 23.079 4.5 C 21.817 4.5 20.794 3.493 20.794 2.25 Z M 10.443 0 L 15.013 0 L 9.997 9 L 5.427 9 Z M 15.841 0 L 20.411 0 L 16.494 7.028 C 15.887 8.117 14.372 9 13.11 9 L 10.825 9 Z" />
    </svg>
  ),
  "React": <SiReact className="w-[18px] h-[18px] text-[#61dafb]" />,
  "JavaScript": <SiJavascript className="w-[18px] h-[18px] text-[#f7df1e] bg-black rounded-[2px]" />,
  "shadcn/ui": (
    <svg viewBox="0 0 256 256" className="w-[16px] h-[16px] fill-none stroke-current text-zinc-900 dark:text-zinc-100" strokeWidth="22" strokeLinecap="round" strokeLinejoin="round">
      <line x1="208" y1="128" x2="128" y2="208" />
      <line x1="192" y1="40" x2="40" y2="192" />
    </svg>
  ),
  "Base UI": (
    <svg viewBox="0 0 38 52" className="w-[18px] h-[18px] fill-current text-zinc-900 dark:text-zinc-100">
      <path fillRule="evenodd" clipRule="evenodd" d="M20 50H18C7.88376 50 0 41.0411 0 30.4V2H2C9.87657 2 16.3997 7.43111 18.9021 14.8587C19.4596 14.3116 20.237 13.9799 21.1233 14.0345C30.5421 14.6155 38 22.4361 38 32C38 41.9412 29.9412 50 20 50Z" fill="currentColor"/>
      <path d="M21.0002 16.0307C20.449 15.9967 20 16.4477 20 17V48C28.8366 48 36 40.8366 36 32C36 23.4994 29.3708 16.547 21.0002 16.0307Z" fill="var(--bg)"/>
      <path d="M18 21.6V48C9.16344 48 2 40.1202 2 30.4V4C10.8366 4 18 11.8798 18 21.6Z" fill="var(--bg)"/>
    </svg>
  ),
  "Convex": (
    <svg role="img" viewBox="0 0 24 24" className="w-[18px] h-[18px] fill-[#EE342F]">
      <path d="M15.09 18.916c3.488-.387 6.776-2.246 8.586-5.348-.857 7.673-9.247 12.522-16.095 9.545a3.47 3.47 0 0 1-1.547-1.314c-1.539-2.417-2.044-5.492-1.318-8.282 2.077 3.584 6.3 5.78 10.374 5.399m-10.501-7.65c-1.414 3.266-1.475 7.092.258 10.24-6.1-4.59-6.033-14.41-.074-18.953a3.44 3.44 0 0 1 1.893-.707c2.825-.15 5.695.942 7.708 2.977-4.09.04-8.073 2.66-9.785 6.442m11.757-5.437C14.283 2.951 11.053.992 7.515.933c6.84-3.105 15.253 1.929 16.17 9.37a3.6 3.6 0 0 1-.334 2.02c-1.278 2.594-3.647 4.607-6.416 5.352 2.029-3.763 1.778-8.36-.589-11.847" />
    </svg>
  ),
  "Supabase": <SiSupabase className="w-[18px] h-[18px] text-[#3ecf8e]" />,
  "MongoDB": <SiMongodb className="w-[18px] h-[18px] text-[#47a248]" />,
  "Redis": <SiRedis className="w-[18px] h-[18px] text-[#dc382d]" />,
  "Git": <SiGit className="w-[18px] h-[18px] text-[#f05032]" />,
  "Docker": <SiDocker className="w-[18px] h-[18px] text-[#2496ed]" />,
  "Figma": <SiFigma className="w-[18px] h-[18px] text-[#f24e1e]" />,
}

function TechItem({ name }: { name: string }) {
  const icon = techIcons[name] || null
  return (
    <div className="flex items-center gap-3 group cursor-default select-none">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-zinc-500/[0.03] dark:bg-zinc-100/[0.03] border border-zinc-200 dark:border-zinc-800 transition-colors duration-300">
        {icon}
      </div>
      <span className="font-sans text-sm md:text-base font-light text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors duration-300">
        {name}
      </span>
    </div>
  )
}

export default function SkillsSection() {
  const currentStack = ["TypeScript", "Next.js", "Tailwind CSS", "Motion"]

  const categories = [
    {
      title: "Frontend",
      skills: ["React", "Tailwind CSS", "JavaScript", "shadcn/ui", "Base UI"],
    },
    {
      title: "Backend & Database",
      skills: ["Convex", "Supabase", "MongoDB", "Redis"],
    },
    {
      title: "Dev & Design Tools",
      skills: ["Git", "Docker", "Figma"],
    },
  ]

  return (
    <div className="w-full pt-0">

      <div className="space-y-6 text-base md:text-lg font-light text-black/70 dark:text-white/70 leading-relaxed max-w-3xl mb-14">
        <TextWithBlur delay={50}>
          <p>
            Over the years, I've developed a versatile skillset combining robust frontend architecture with secure systems development and intuitive design thinking.
          </p>
        </TextWithBlur>
      </div>

      {/* Current Stack */}
      <TextWithBlur delay={100}>
        <div className="mb-14">
          <h4 className="text-xs md:text-sm uppercase tracking-[0.2em] text-black/40 dark:text-white/40 mb-5">
            Current Stack
          </h4>
          <div className="flex flex-wrap gap-x-8 gap-y-5 md:gap-x-12">
            {currentStack.map((tech) => (
              <TechItem key={tech} name={tech} />
            ))}
          </div>
        </div>
      </TextWithBlur>

      {/* Category Columns */}
      <TextWithBlur delay={150}>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-10 gap-x-8 md:gap-x-12">
          {categories.map((category) => (
            <div key={category.title} className="flex flex-col">
              <h4 className="text-xs md:text-sm uppercase tracking-[0.2em] text-black/40 dark:text-white/40 mb-5">
                {category.title}
              </h4>
              <div className="flex flex-col gap-4">
                {category.skills.map((tech) => (
                  <TechItem key={tech} name={tech} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </TextWithBlur>
    </div>
  )
}
