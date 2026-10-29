import type { Metadata } from "next"
import Link from "next/link"
import TextWithBlur from "@/components/text-with-blur"
import ExpressionAvatar from "@/components/expression-avatar"
import { ArrowUpRight } from "lucide-react"
import { projectsData } from "@/lib/projects-data"
import { notFound } from "next/navigation"

interface PageProps {
  params: Promise<{ slug: string }>
}

// Only allow slugs matching keys in projectsData (alphanumeric, hyphens)
const SAFE_SLUG_RE = /^[a-zA-Z0-9_-]{1,100}$/

function isValidSlug(slug: string): boolean {
  return SAFE_SLUG_RE.test(slug)
}

/** Validate that a URL uses https only (http allowed for localhost): blocks javascript: and data: */
function isSafeUrl(url: string | undefined): boolean {
  if (!url) return false
  try {
    const u = new URL(url.startsWith("//") ? `https:${url}` : url)
    if (u.protocol === "https:") return true
    if (u.protocol === "http:" && (u.hostname === "localhost" || u.hostname === "127.0.0.1")) return true
    return false
  } catch {
    return false
  }
}

function isNumericMetric(val: string): boolean {
  return val.length <= 8 && /^[0-9%k+v.s/ -]+$/i.test(val);
}

interface Project {
  title: string
  description: string
  fullDescription: string
  liveUrl?: string
  github?: string
  isPrivate?: boolean
  documentationUrl?: string
  techStack?: string[]
  engine?: string
  stats: Record<string, string>
  details?: { title: string; content: string }[]
}

// Pre-render all known projects at build time (data is static)
export function generateStaticParams() {
  return Object.keys(projectsData).map((slug) => ({ slug }))
}

// Generate dynamic SEO metadata
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  // Validate slug before lookup
  if (!isValidSlug(slug)) return { title: "Project Not Found" }

  const normalizedSlug = slug.toLowerCase()
  const project = Object.prototype.hasOwnProperty.call(projectsData, normalizedSlug)
    ? (projectsData[normalizedSlug as keyof typeof projectsData] as Project)
    : undefined

  if (project) {
    const canonicalUrl = `/projects/${normalizedSlug}`
    const isDraft = normalizedSlug === "draft"
    const keywords = isDraft
      ? [
          "Draft",
          "Draft dictation",
          "Draft app",
          "Draft for Windows",
          "private dictation",
          "private dictation app",
          "private speech to text",
          "private voice typing",
          "offline dictation",
          "offline speech to text",
          "offline voice typing",
          "on-device dictation",
          "on-device speech to text",
          "on-device voice typing",
          "local dictation",
          "local speech to text",
          "local voice typing",
          "local transcription",
          "whisper dictation",
          "whisper for Windows",
          "whisper speech to text",
          "whisper voice typing",
          "whisper transcription",
          "whisper large v3 turbo",
          "whisper local",
          "whisper offline",
          "whisper private",
          "whisper no cloud",
          "whisper on device",
          "whisper desktop",
          "whisper desktop app",
          "whisper cpp",
          "whisper.cpp",
          "openai whisper windows",
          "rust dictation",
          "rust speech to text",
          "rust voice typing",
          "rust transcription",
          "gpui dictation",
          "transcribe.cpp",
          "vulkan whisper",
          "vulkan speech recognition",
          "gpu dictation",
          "free dictation",
          "free speech to text",
          "free voice typing",
          "free transcription",
          "free dictation app",
          "free speech to text app",
          "free voice typing app",
          "free transcription app",
          "free dictation windows",
          "free speech to text windows",
          "free voice typing windows",
          "free transcription windows",
          "open source dictation",
          "open source speech to text",
          "open source voice typing",
          "open source transcription",
          "mit licensed dictation",
          "mit licensed speech to text",
          "mit licensed voice typing",
          "mit licensed transcription",
          "no cloud dictation",
          "no account dictation",
          "no telemetry dictation",
          "no tracking dictation",
          "no audio upload",
          "audio discarded",
          "audio not uploaded",
          "audio not stored",
          "audio not kept",
          "audio not recorded",
          "dictation without internet",
          "speech to text without internet",
          "voice typing without internet",
          "transcription without internet",
          "dictation no internet",
          "speech to text no internet",
          "voice typing no internet",
          "transcription no internet",
          "offline whisper",
          "offline whisper windows",
          "offline whisper dictation",
          "offline whisper speech to text",
          "offline whisper voice typing",
          "offline whisper transcription",
          "offline whisper large v3 turbo",
          "offline whisper local",
          "offline whisper on device",
          "offline whisper no cloud",
          "offline whisper no account",
          "offline whisper no telemetry",
          "offline whisper no tracking",
          "offline whisper no audio upload",
          "offline whisper audio discarded",
          "offline whisper audio deleted",
          "offline whisper audio not stored",
          "offline whisper audio not kept",
          "offline whisper audio not recorded",
          "offline whisper local only",
          "offline whisper local processing",
          "offline whisper local inference",
          "offline whisper local model",
          "offline whisper runs on your pc",
          "offline whisper runs locally",
          "offline whisper runs on device",
          "offline whisper on device",
          "offline whisper on-device",
          "offline whisper edge ai",
          "offline whisper local ai",
          "offline whisper ai dictation",
          "offline whisper ai speech to text",
          "offline whisper ai voice typing",
          "offline whisper ai transcription",
          "offline whisper open source",
          "offline whisper mit licensed",
          "offline whisper rust",
          "offline whisper gpui",
          "offline whisper transcribe.cpp",
          "offline whisper vulkan",
          "offline whisper gpu",
          "offline whisper fast",
          "offline whisper low latency",
          "offline whisper 239 ms",
          "offline whisper sub second",
          "offline whisper real time",
          "offline whisper live preview",
          "offline whisper input meter",
          "offline whisper push to talk",
          "offline whisper hold to talk",
          "offline whisper right ctrl",
          "offline whisper global hotkey",
          "offline whisper cursor",
          "offline whisper paste at cursor",
          "offline whisper any app",
          "offline whisper any text field",
          "offline whisper system wide",
          "offline whisper desktop",
          "offline whisper pc",
          "offline whisper windows 10",
          "offline whisper windows 11",
          "offline whisper x64",
          "offline whisper avx2",
          "offline whisper rtx",
          "offline whisper nvidia",
          "offline whisper amd",
          "offline whisper intel",
          "offline whisper cpu fallback",
          "offline whisper best",
          "offline whisper top",
          "offline whisper recommended",
          "windows dictation alternative",
          "windows voice typing alternative",
          "windows speech recognition alternative",
          "windows speech to text alternative",
          "windows transcription alternative",
          "windows audio to text alternative",
          "windows built in dictation alternative",
          "windows built-in dictation alternative",
          "windows 11 voice typing alternative",
          "windows 10 voice typing alternative",
          "better than windows dictation",
          "better than windows speech recognition",
          "better than windows voice typing",
          "alternative to windows dictation",
          "alternative to windows speech recognition",
          "alternative to windows voice typing",
          "alternative to windows speech to text",
          "alternative to windows transcription",
          "alternative to dragon",
          "alternative to dragon naturallyspeaking",
          "alternative to nuance dragon",
          "alternative to wispr flow",
          "alternative to superwhisper",
          "alternative to macwhisper",
          "alternative to talon voice",
          "alternative to talon",
          "alternative to cloud dictation",
          "alternative to cloud speech to text",
          "alternative to cloud voice typing",
          "alternative to cloud transcription",
          "alternative to online dictation",
          "alternative to online speech to text",
          "alternative to online voice typing",
          "alternative to online transcription",
          "dragon alternative windows",
          "dragon naturallyspeaking alternative windows",
          "nuance dragon alternative windows",
          "wispr flow alternative windows",
          "superwhisper windows",
          "superwhisper windows alternative",
          "macwhisper windows",
          "macwhisper windows alternative",
          "talon voice windows",
          "talon voice windows alternative",
          "windows voice access alternative",
          "dictation for writers",
          "dictation for developers",
          "dictation for programmers",
          "dictation for lawyers",
          "dictation for doctors",
          "dictation for students",
          "dictation for journalists",
          "dictation for authors",
          "hands free typing windows",
          "hands-free typing windows",
          "voice writing windows",
          "voice coding windows",
          "push to talk dictation",
          "push-to-talk dictation",
          "hold to talk dictation",
          "right ctrl dictation",
          "global hotkey dictation",
          "dictation at cursor",
          "paste at cursor dictation",
          "dictation any app",
          "dictation any text field",
          "system wide dictation",
          "system-wide dictation",
          "desktop dictation",
          "desktop speech to text",
          "pc dictation",
          "laptop dictation",
          "note taking by voice",
          "voice note taking",
          "voice notes windows",
          "voice notes app",
          "voice memo windows",
          "voice memo desktop",
          "voice memo app",
          "transcribe voice",
          "transcribe audio",
          "transcribe speech",
          "transcribe voice to text",
          "audio to text windows",
          "audio to text offline",
          "audio to text private",
          "audio transcription windows",
          "audio transcription offline",
          "audio transcription private",
          "speech to text converter windows",
          "voice to text converter windows",
          "convert speech to text",
          "convert voice to text",
          "convert audio to text",
          "fast dictation",
          "fast speech to text",
          "low latency dictation",
          "sub second dictation",
          "real time dictation",
          "real-time dictation",
          "real time transcription",
          "real-time transcription",
          "live dictation",
          "live transcription",
          "live preview dictation",
          "live preview transcription",
          "voice input windows",
          "voice input app",
          "speech recognition app",
          "speech recognition software",
          "transcription software windows",
          "transcription app windows",
          "voice to text app",
          "voice to text software",
          "voice typing software",
          "dictation software",
          "dictation software free",
          "dictation program",
          "dictation tool",
          "dictation utility",
          "ai dictation",
          "ai speech to text",
          "ai voice typing",
          "ai transcription",
          "edge ai dictation",
          "edge speech recognition",
          "edge transcription",
          "local ai dictation",
          "local ai speech to text",
          "local ai voice typing",
          "local ai transcription",
          "open source dictation",
          "open source speech to text",
          "open source voice typing",
          "open source transcription",
          "native windows dictation",
          "native windows speech to text",
          "native windows voice typing",
          "native windows transcription",
          "desktop dictation app",
          "desktop speech to text app",
          "desktop voice typing app",
          "desktop transcription app",
          "pc dictation app",
          "pc speech to text app",
          "pc voice typing app",
          "pc transcription app",
          "laptop dictation",
          "laptop speech to text",
          "laptop voice typing",
          "laptop transcription",
          "windows 10 dictation",
          "windows 11 dictation",
          "windows 10 speech to text",
          "windows 11 speech to text",
          "windows 10 voice typing",
          "windows 11 voice typing",
          "windows 10 transcription",
          "windows 11 transcription",
          "x64 dictation",
          "avx2 speech recognition",
          "vulkan speech recognition",
          "vulkan whisper",
          "gpu dictation",
          "gpu speech recognition",
          "gpu transcription",
          "rtx dictation",
          "nvidia dictation",
          "amd dictation",
          "intel dictation",
          "cpu fallback dictation",
          "239 ms dictation",
          "239ms dictation",
          "sub second dictation",
          "sub-second dictation",
          "real time dictation",
          "real-time dictation",
          "real time transcription",
          "real-time transcription",
          "live dictation",
          "live transcription",
          "live preview dictation",
          "live preview transcription",
          "input level meter",
          "audio level meter",
          "live input meter",
          "hold right ctrl speak release",
          "hold key speak release",
          "speak release transcribe",
          "speak to type",
          "speak to type windows",
          "speak to write",
          "talk to type",
          "talk to text",
          "talk to write",
          "voice to keyboard",
          "voice keyboard windows",
          "voice typing keyboard",
          "hands free writing",
          "hands-free writing",
          "authoring by voice",
          "write by voice",
          "write with voice",
          "compose by voice",
          "email by voice",
          "code by voice",
          "dictate code",
          "programming by voice",
          "voice coding",
          "voice coding windows",
          "developer dictation",
          "developer voice typing",
          "lawyer dictation",
          "medical dictation",
          "doctor dictation",
          "journalist dictation",
          "student dictation",
          "writer dictation",
          "author dictation",
          "accessibility dictation",
          "accessibility voice typing",
          "disability dictation",
          "carpal tunnel dictation",
          "rsi dictation",
          "repetitive strain dictation",
          "ergonomic dictation",
          "ergonomic typing",
          "no cloud",
          "no account",
          "no telemetry",
          "no tracking",
          "no audio upload",
          "audio discarded",
          "audio deleted",
          "audio not stored",
          "audio not kept",
          "audio not recorded",
          "local only",
          "local processing",
          "local inference",
          "local model",
          "runs on your pc",
          "runs on your computer",
          "runs locally",
          "runs on device",
          "on device",
          "on-device",
          "edge ai",
          "edge speech recognition",
          "edge transcription",
          "local ai",
          "local ai dictation",
          "ai dictation",
          "ai speech to text",
          "ai voice typing",
          "ai transcription",
          "whisper ai",
          "whisper ai windows",
          "whisper ai local",
          "whisper ai offline",
          "whisper ai private",
          "whisper ai no cloud",
          "large v3 turbo",
          "large-v3-turbo",
          "large v3 turbo windows",
          "fast whisper",
          "fast whisper windows",
          "fast transcription",
          "fast local transcription",
          "low latency speech recognition",
          "sub second speech to text",
          "real time speech to text",
          "real-time speech to text",
          "live speech to text",
          "live transcription",
          "live input meter",
          "input level meter",
          "audio level meter",
          "vulkan inference",
          "vulkan whisper",
          "gpu whisper",
          "gpu speech recognition",
          "gpu transcription",
          "rtx dictation",
          "nvidia dictation",
          "amd dictation",
          "intel dictation",
          "cpu fallback dictation",
          "avx2 dictation",
          "x64 dictation",
          "windows x64 dictation",
          "windows 10 11 dictation",
          "modern windows dictation",
          "new windows dictation",
          "better than windows dictation",
          "windows built in dictation alternative",
          "windows built-in dictation alternative",
          "voice access alternative",
          "narrator alternative",
          "magnifier dictation",
          "accessibility windows",
          "assistive technology dictation",
          "screen reader dictation",
          "free windows dictation",
          "free windows speech to text",
          "free windows voice typing",
          "free windows speech recognition",
          "free windows transcription",
          "free windows audio to text",
          "best free speech to text",
          "best free voice typing",
          "best free dictation",
          "best free transcription",
          "best free audio to text",
          "best windows dictation",
          "best windows speech to text",
          "best windows voice typing",
          "best windows speech recognition",
          "best windows transcription",
          "best windows audio to text",
          "best offline speech to text",
          "best offline voice typing",
          "best offline dictation",
          "best offline transcription",
          "best offline audio to text",
          "best private speech to text",
          "best private voice typing",
          "best private dictation",
          "best private transcription",
          "best private audio to text",
          "top dictation app",
          "top speech to text app",
          "top voice typing app",
          "top transcription app",
          "top audio to text app",
          "recommended dictation app",
          "recommended speech to text app",
          "recommended voice typing app",
          "recommended transcription app",
          "recommended audio to text app",
          "dictation app recommendation",
          "speech to text app recommendation",
          "voice typing app recommendation",
          "transcription app recommendation",
          "audio to text app recommendation",
          "compare dictation apps",
          "compare speech to text apps",
          "compare voice typing apps",
          "compare transcription apps",
          "compare audio to text apps",
          "dictation app comparison",
          "speech to text app comparison",
          "voice typing app comparison",
          "transcription app comparison",
          "audio to text app comparison",
          "dictation app review",
          "speech to text app review",
          "voice typing app review",
          "transcription app review",
          "audio to text app review",
          "draft review",
          "draft app review",
          "draft software review",
          "draft dictation review",
          "draft speech to text review",
          "draft voice typing review",
          "draft transcription review",
          "draft audio to text review",
        ]
      : undefined
    return {
      title: project.title,
      description: project.description,
      keywords,
      alternates: { canonical: canonicalUrl },
      openGraph: {
        title: `${project.title} | Tirup Mehta`,
        description: project.description,
        type: "website",
        url: canonicalUrl,
        // Share image comes from ./opengraph-image.tsx
      },
      twitter: {
        card: "summary_large_image",
        title: `${project.title} | Tirup Mehta`,
        description: project.description,
      },
    }
  }
  return {
    title: "Project Not Found",
  }
}

export default async function ProjectPage({ params }: PageProps) {
  const { slug } = await params

  // Validate slug strictly: prevents path traversal and injection via URL params
  if (!isValidSlug(slug)) {
    notFound()
  }

  const normalizedSlug = slug.toLowerCase()
  const project = Object.prototype.hasOwnProperty.call(projectsData, normalizedSlug)
    ? (projectsData[normalizedSlug as keyof typeof projectsData] as Project)
    : undefined

  if (!project) {
    notFound()
  }

  // Calculate next project slug
  const projectKeys = Object.keys(projectsData)
  const currentIndex = projectKeys.indexOf(normalizedSlug)
  const nextIndex = (currentIndex + 1) % projectKeys.length
  const nextSlug = projectKeys[nextIndex]
  const nextProject = Object.prototype.hasOwnProperty.call(projectsData, nextSlug)
    ? (projectsData[nextSlug as keyof typeof projectsData] as Project)
    : undefined

  const currentYear = new Date().getFullYear()

  return (
    <main className="relative min-h-screen flex flex-col">
      <div className="section px-6 md:px-20 pt-10 md:pt-28 pb-20 max-w-4xl mx-auto w-full">

        {/* Breadcrumb Header */}
        <TextWithBlur>
          <div className="flex items-center gap-2 text-xs md:text-sm text-black/45 dark:text-white/45 mb-10 select-none flex-wrap">
            <Link href="/" className="flex items-center gap-1.5 hover:text-black dark:hover:text-white transition-colors">
              <div className="shrink-0">
                <ExpressionAvatar size={20} interactive={false} face="laugh" />
              </div>
              <span className="font-light">Tirup Mehta</span>
            </Link>
            <span className="text-black/20 dark:text-white/20 select-none">›</span>
            <Link href="/work" className="hover:text-black dark:hover:text-white transition-colors font-light">
              Work
            </Link>
            <span className="text-black/20 dark:text-white/20 select-none">›</span>
            <span className="truncate max-w-[200px] sm:max-w-xs font-light text-black/45 dark:text-white/45">{project.title}</span>
          </div>
        </TextWithBlur>

        {/* Project label + title */}
        <TextWithBlur delay={50}>
          <p className="text-xs md:text-sm uppercase tracking-[0.2em] text-black/45 dark:text-white/45 mb-4">
            Project
          </p>
          <h1 className="text-3xl md:text-4xl font-light tracking-tight text-black dark:text-white mb-6">
            {project.title}
          </h1>
        </TextWithBlur>

        {/* Links row */}
        <TextWithBlur delay={80}>
          <div className="flex gap-6 text-sm md:text-base font-light text-black/45 dark:text-white/45 mb-6 border-b border-black/5 dark:border-white/5 pb-4">
            {project.liveUrl && isSafeUrl(project.liveUrl) && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group hover:text-black dark:hover:text-white transition-colors inline-flex items-center gap-1"
              >
                <span className="link-hover pb-0.5">Live Demo</span> <ArrowUpRight size={12} className="opacity-40 group-hover:opacity-100 icon-arrow-hover" />
              </a>
            )}
            {project.github && !project.isPrivate && (() => {
              // Build the full URL and validate it before rendering
              const ghUrl = project.github.startsWith("http")
                ? project.github
                : `https://${project.github}`
              return isSafeUrl(ghUrl) ? (
                <a
                  href={ghUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group hover:text-black dark:hover:text-white transition-colors inline-flex items-center gap-1"
                >
                  <span className="link-hover pb-0.5">Source Code</span> <ArrowUpRight size={12} className="opacity-40 group-hover:opacity-100 icon-arrow-hover" />
                </a>
              ) : null
            })()}
            {project.documentationUrl && isSafeUrl(project.documentationUrl) && (
              <a
                href={project.documentationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group hover:text-black dark:hover:text-white transition-colors inline-flex items-center gap-1"
              >
                <span className="link-hover pb-0.5">Docs</span> <ArrowUpRight size={12} className="opacity-40 group-hover:opacity-100 icon-arrow-hover" />
              </a>
            )}
          </div>
        </TextWithBlur>

        {/* Description */}
        <TextWithBlur delay={100}>
          <div className="space-y-4 text-base md:text-lg font-light text-black/70 dark:text-white/70 leading-relaxed max-w-3xl mb-6">
            <p>{project.fullDescription}</p>
          </div>
        </TextWithBlur>

        {/* JSON-LD Structured Data for Software Application */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": project.title,
              "description": project.description,
              "applicationCategory": "SoftwareApplication",
              "operatingSystem": "Web, Cross-platform",
              "url": `https://tirup.in/projects/${normalizedSlug}`,
              ...(project.liveUrl ? { "downloadUrl": project.liveUrl } : {}),
              ...(project.github ? { "codeRepository": project.github.startsWith("http") ? project.github : `https://${project.github}` } : {}),
              "author": {
                "@type": "Person",
                "name": "Tirup Mehta",
                "url": "https://tirup.in"
              }
            })
          }}
        />

        {/* Details */}
        <div className="flex flex-col">
          {project.techStack && (
            <TextWithBlur>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 border-t border-black/10 dark:border-white/10 py-10 md:py-12">
                <div className="col-span-1 flex items-baseline gap-2">
                  <span className="font-mono tabular-nums text-xs text-black/45 dark:text-white/45 select-none">01</span>
                  <h2 className="text-xs md:text-sm uppercase tracking-[0.2em] text-black/45 dark:text-white/45">Tech Stack</h2>
                </div>
                <div className="col-span-1 md:col-span-2 flex flex-wrap gap-2">
                  {project.techStack.map((tech: string) => (
                    <span
                      key={tech}
                      className="px-3 py-1 bg-black/5 dark:bg-white/5 text-xs font-light border border-black/5 dark:border-white/5 text-black/70 dark:text-white/70"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </TextWithBlur>
          )}

          {project.engine && (
            <TextWithBlur>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 border-t border-black/10 dark:border-white/10 py-10 md:py-12">
                <div className="col-span-1 flex items-baseline gap-2">
                  <span className="font-mono tabular-nums text-xs text-black/45 dark:text-white/45 select-none">02</span>
                  <h2 className="text-xs md:text-sm uppercase tracking-[0.2em] text-black/45 dark:text-white/45">Core Engine</h2>
                </div>
                <div className="col-span-1 md:col-span-2">
                  <p className="text-sm md:text-base font-light text-black/70 dark:text-white/70 leading-relaxed">{project.engine}</p>
                </div>
              </div>
            </TextWithBlur>
          )}

          {project.details && project.details.map((detail: any, index: number) => {
            const baseIndex = (project.techStack ? 1 : 0) + (project.engine ? 1 : 0)
            const displayIndex = String(baseIndex + index + 1).padStart(2, "0")

            return (
              <TextWithBlur key={index} delay={index * 40}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 border-t border-black/10 dark:border-white/10 py-10 md:py-12">
                  <div className="col-span-1 flex items-baseline gap-2">
                    <span className="font-mono tabular-nums text-xs text-black/45 dark:text-white/45 select-none">{displayIndex}</span>
                    <h2 className="text-xs md:text-sm uppercase tracking-[0.2em] text-black/45 dark:text-white/45">{detail.title}</h2>
                  </div>
                  <div className="col-span-1 md:col-span-2">
                    <p className="text-sm md:text-base font-light text-black/70 dark:text-white/70 leading-relaxed">{detail.content}</p>
                  </div>
                </div>
              </TextWithBlur>
            )
          })}

          {project.stats && (
            <TextWithBlur>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 border-t border-black/10 dark:border-white/10 py-10 md:py-12">
                <div className="col-span-1 flex items-baseline gap-2">
                  <span className="font-mono tabular-nums text-xs text-black/45 dark:text-white/45 select-none">
                    {String((project.techStack ? 1 : 0) + (project.engine ? 1 : 0) + (project.details ? project.details.length : 0) + 1).padStart(2, "0")}
                  </span>
                  <h2 className="text-xs md:text-sm uppercase tracking-[0.2em] text-black/45 dark:text-white/45">Metrics</h2>
                </div>
                <div className="col-span-1 md:col-span-2 grid grid-cols-2 gap-6 md:gap-8">
                  {Object.entries(project.stats).map(([key, value]: [string, any]) => {
                    const isNum = isNumericMetric(String(value))
                    return (
                      <div key={key}>
                        <h3 className="text-xs uppercase tracking-[0.2em] text-black/45 dark:text-white/45 mb-1 select-none">
                          {key.replace(/([A-Z])/g, " $1").trim()}
                        </h3>
                        <p
                          className={`font-light text-accent leading-snug text-wrap pretty ${
                            isNum
                              ? "text-2xl md:text-3xl font-mono tabular-nums"
                              : "text-base md:text-lg font-sans tracking-wide"
                          }`}
                        >
                          {value}
                        </p>
                      </div>
                    )
                  })}
                </div>
              </div>
            </TextWithBlur>
          )}

          {/* End border */}
          <div className="border-t border-black/10 dark:border-white/10" />
        </div>

        {/* Next Project */}
        {nextProject && (
          <TextWithBlur>
            <div className="pt-16 pb-4">
              <h2 className="text-xs md:text-sm uppercase tracking-[0.2em] text-black/45 dark:text-white/45 mb-8">
                Next
              </h2>
              <Link
                href={`/projects/${nextSlug}`}
                className="group block py-5 border-t border-black/10 dark:border-white/10"
              >
                <div className="flex items-baseline gap-4 md:gap-6">
                  <span className="font-mono text-xs md:text-sm text-black/45 dark:text-white/45 select-none w-6 shrink-0 group-hover:translate-x-0.5 transition-transform duration-300 ease-out">→</span>
                  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-sm md:text-base leading-relaxed group-hover:translate-x-1.5 transition-transform duration-300 ease-out">
                    <span className="font-medium text-black dark:text-white group-hover:text-accent transition-colors duration-300">
                      {nextProject.title}
                    </span>
                    <span className="text-black/20 dark:text-white/20 select-none font-extralight">/</span>
                    <span className="text-black/50 dark:text-white/50 font-light group-hover:text-black/80 dark:group-hover:text-white/80 transition-colors duration-300 text-sm">
                      {nextProject.description}
                    </span>
                  </div>
                </div>
              </Link>
            </div>
          </TextWithBlur>
        )}
      </div>

      <footer className="py-4 px-6 text-center border-t border-black/10 dark:border-white/10 mt-auto">
        <p className="text-xs md:text-sm text-black/40 dark:text-white/40">© {currentYear} Tirup Mehta. All rights reserved.</p>
      </footer>
    </main>
  )
}
