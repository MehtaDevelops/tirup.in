import type { Metadata } from "next"
import Link from "next/link"
import { readdirSync, readFileSync } from "node:fs"
import { join } from "node:path"
import { notFound } from "next/navigation"
import ExpressionAvatar from "@/components/expression-avatar"
import { CodeDemo } from "@/components/library/code-demo"
import { CopyTextButton } from "@/components/library/copy-text-button"
import TextWithBlur from "@/components/text-with-blur"
import { AUTHOR, SITE, installCommand, namespaceAddCommand, registryItemUrl } from "@/lib/components-site"

/**
 * Source viewer for a registry item. The install URL
 * /components/r/<name>.json routes browsers here (see the neighboring
 * route.ts): the raw file is what the shadcn CLI consumes, but a human
 * opening it cold previously got a 20k-char escaped wall. This page shows
 * the same bytes — meta, install commands, then each file through the
 * site's own code reader — with a copy affordance for the raw JSON.
 */
const registryDir = join(process.cwd(), "generated", "registry")

type RegistryItem = {
  name: string
  type: string
  title: string
  description: string
  docs: string
  author: string
  dependencies?: string[]
  devDependencies?: string[]
  registryDependencies?: string[]
  files: Array<{ path: string; content: string; type?: string; target?: string }>
}

const NAME_RE = /^[a-z0-9-]+$/

const loadItem = (name: string): RegistryItem | null => {
  try {
    const item = JSON.parse(readFileSync(join(registryDir, `${name}.json`), "utf8")) as RegistryItem
    return item.files?.length ? item : null
  } catch {
    return null
  }
}

const loadRaw = (name: string): string => readFileSync(join(registryDir, `${name}.json`), "utf8")

// Generate one prerendered viewer per generated item at build time.
export function generateStaticParams() {
  return readdirSync(registryDir)
    .filter((file) => file.endsWith(".json") && file !== "registry.json")
    .map((file) => ({ slug: file.replace(/\.json$/, "") }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const slug = (await params).slug
  const item = NAME_RE.test(slug) ? loadItem(slug) : null
  if (!item) return {}
  return {
    title: `${item.title} — registry item`,
    description: `${item.description} The registry JSON the shadcn CLI installs ${item.name} from, readable file by file.`,
    alternates: { canonical: `/components/r/${item.name}/source` },
    openGraph: {
      title: `${item.title} — registry item | Tirup Mehta`,
      description: item.description,
      type: "website",
      url: `/components/r/${item.name}/source`,
    },
  }
}

/* Detail block: same numbered-corridor language as the component doc
   pages, inline because the doc's own DetailBlock is page-local. */
function Block({
  index,
  title,
  children,
  wide = false,
  delay = 0,
}: {
  index: string
  title: string
  children: React.ReactNode
  wide?: boolean
  delay?: number
}) {
  const label = (
    <div className="flex items-baseline gap-2">
      <span className="font-mono tabular-nums text-xs text-black/45 dark:text-white/45 select-none">{index}</span>
      <h2 className="text-xs md:text-sm uppercase tracking-[0.2em] text-black/45 dark:text-white/45">{title}</h2>
    </div>
  )
  return (
    <TextWithBlur delay={delay}>
      <div className="border-t border-black/10 dark:border-white/10 py-10 md:py-12">
        {wide ? (
          <>
            {label}
            <div className="mt-6 min-w-0">{children}</div>
          </>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            <div className="col-span-1 flex items-baseline gap-2 min-w-0">{label}</div>
            <div className="col-span-1 md:col-span-2 min-w-0">{children}</div>
          </div>
        )}
      </div>
    </TextWithBlur>
  )
}

export default async function RegistrySourcePage({ params }: { params: Promise<{ slug: string }> }) {
  const slug = (await params).slug
  const name = NAME_RE.test(slug) ? slug : null
  const item = (name && loadItem(name)) || null
  if (!item || !name) notFound()

  const rawJson = loadRaw(name)
  const deps = (item.dependencies?.length ?? 0) + (item.devDependencies?.length ?? 0) + (item.registryDependencies?.length ?? 0)

  let blockIndex = 0
  const next = () => String(++blockIndex).padStart(2, "0")

  return (
    <main className="relative min-h-screen flex flex-col">
      <div className="section px-6 md:px-20 pt-10 md:pt-28 pb-20 max-w-4xl mx-auto w-full">

        {/* Breadcrumb: same system as the component doc pages */}
        <TextWithBlur>
          <div className="flex items-center gap-2 text-xs md:text-sm text-black/45 dark:text-white/45 mb-10 select-none flex-wrap">
            <Link href="/" className="flex items-center gap-1.5 hover:text-black dark:hover:text-white transition-colors">
              <div className="shrink-0">
                <ExpressionAvatar size={20} interactive={false} face="laugh" />
              </div>
              <span className="font-light">Tirup Mehta</span>
            </Link>
            <span className="text-black/20 dark:text-white/20 select-none">›</span>
            <Link href="/components" className="hover:text-black dark:hover:text-white transition-colors font-light">
              Components
            </Link>
            <span className="text-black/20 dark:text-white/20 select-none">›</span>
            <Link href={`/components/${item.name}`} className="hover:text-black dark:hover:text-white transition-colors font-light">
              {item.title}
            </Link>
            <span className="text-black/20 dark:text-white/20 select-none">›</span>
            <span className="font-light text-black/45 dark:text-white/45">Source</span>
          </div>
        </TextWithBlur>

        <TextWithBlur delay={50}>
          <p className="text-xs md:text-sm uppercase tracking-[0.2em] text-black/45 dark:text-white/45 mb-4">
            Registry item
          </p>
          <h1 className="text-3xl md:text-4xl font-light tracking-tight text-black dark:text-white mb-6">
            {item.title} <span className="text-black/30 dark:text-white/30">source</span>
          </h1>
        </TextWithBlur>

        <TextWithBlur delay={80}>
          <div className="flex flex-wrap gap-6 text-sm md:text-base font-light text-black/45 dark:text-white/45 mb-6 border-b border-black/5 dark:border-white/5 pb-4">
            <CopyTextButton text={rawJson} label="Copy raw JSON" />
            <Link href={item.docs} className="group hover:text-black dark:hover:text-white transition-colors inline-flex items-center gap-1">
              <span className="link-hover pb-0.5">Component docs</span>
              <span className="opacity-40 group-hover:opacity-100">↗</span>
            </Link>
          </div>
        </TextWithBlur>

        <TextWithBlur delay={100}>
          <div className="space-y-4 text-base md:text-lg font-light text-black/70 dark:text-white/70 leading-relaxed max-w-3xl mb-6">
            <p>
              {item.description} This is{" "}
              <span className="font-mono text-sm md:text-base text-black dark:text-white">{registryItemUrl(item.name)}</span>{" "}
              rendered for reading — the shadcn CLI always receives the raw
              JSON at that exact address.
            </p>
          </div>
        </TextWithBlur>

        <div className="flex flex-col">
          <Block index={next()} title="Install" wide>
            <CodeDemo
              blocks={[
                { lang: "bash", code: installCommand(item.name) },
                { lang: "bash", code: namespaceAddCommand },
              ]}
            />
            <p className="text-sm md:text-base font-light text-black/70 dark:text-white/70 leading-relaxed mt-4">
              The command writes <span className="font-mono text-sm text-black dark:text-white">{item.files[0].path}</span>{" "}
              into your project. No dependencies: {deps === 0 ? "zero packages, zero registry imports." : `see the item's ${deps} declared dependencies below.`}
            </p>
          </Block>

          <Block index={next()} title="Meta">
            <div className="grid grid-cols-2 gap-6 md:gap-8">
              <div>
                <h3 className="text-xs uppercase tracking-[0.2em] text-black/45 dark:text-white/45 mb-1 select-none">Type</h3>
                <p className="font-light text-accent font-mono text-sm md:text-base">{item.type}</p>
              </div>
              <div>
                <h3 className="text-xs uppercase tracking-[0.2em] text-black/45 dark:text-white/45 mb-1 select-none">Files</h3>
                <p className="font-light text-accent font-mono text-sm md:text-base">{item.files.length}</p>
              </div>
              <div>
                <h3 className="text-xs uppercase tracking-[0.2em] text-black/45 dark:text-white/45 mb-1 select-none">Author</h3>
                <p className="font-light text-black/70 dark:text-white/70 text-sm md:text-base">{AUTHOR.name}</p>
                <p className="text-xs font-mono text-black/40 dark:text-white/40">{SITE.email}</p>
              </div>
              <div>
                <h3 className="text-xs uppercase tracking-[0.2em] text-black/45 dark:text-white/45 mb-1 select-none">Dependencies</h3>
                <p className="font-light text-accent font-mono text-sm md:text-base">{deps}</p>
              </div>
            </div>
          </Block>

          {item.files.map((file) => (
            <Block key={file.path} index={next()} title={file.target ?? file.path} wide>
              <CodeDemo
                blocks={[{ lang: file.path.split(".").pop() ?? "txt", code: file.content }]}
              />
            </Block>
          ))}

          <div className="border-t border-black/10 dark:border-white/10" />
        </div>

        <TextWithBlur>
          <div className="pt-16 pb-4">
            <h2 className="text-xs md:text-sm uppercase tracking-[0.2em] text-black/45 dark:text-white/45 mb-8">
              Continue
            </h2>
            <Link
              href={`/components/${item.name}`}
              className="group block py-5 border-t border-black/10 dark:border-white/10"
            >
              <div className="flex items-baseline gap-4 md:gap-6">
                <span className="font-mono text-xs md:text-sm text-black/45 dark:text-white/45 select-none w-6 shrink-0 group-hover:translate-x-0.5 transition-transform duration-300 ease-out">→</span>
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-sm md:text-base leading-relaxed group-hover:translate-x-1.5 transition-transform duration-300 ease-out">
                  <span className="font-medium text-black dark:text-white group-hover:text-accent transition-colors duration-300">
                    {item.title} docs
                  </span>
                  <span className="text-black/20 dark:text-white/20 select-none font-extralight">/</span>
                  <span className="text-black/50 dark:text-white/50 font-light group-hover:text-black/80 dark:group-hover:text-white/80 transition-colors duration-300 text-sm">
                    playground, props, live demo
                  </span>
                </div>
              </div>
            </Link>
          </div>
        </TextWithBlur>
      </div>

      <footer className="py-4 px-6 text-center border-t border-black/10 dark:border-white/10 mt-auto">
        <p className="text-xs md:text-sm text-black/40 dark:text-white/40">© {new Date().getFullYear()} Tirup Mehta. All rights reserved.</p>
      </footer>
    </main>
  )
}
