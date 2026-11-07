import type { Metadata } from "next"
import type { ReactNode } from "react"
import Link from "next/link"
import Header from "@/components/header"

export const metadata: Metadata = {
  title: {
    absolute: "tirup CLI | Command-Line Tool for the tirup.in API",
  },
  description:
    "tirup is a zero-dependency command-line client for the tirup.in API. Fetch the profile, project index, and article list from a terminal or a script, with JSON output for agents.",
  keywords: [
    "tirup CLI",
    "Tirup Mehta CLI",
    "command-line tool",
    "tirup.in API CLI",
    "API client",
  ],
  alternates: { canonical: "/cli" },
  openGraph: {
    url: "/cli",
    title: "tirup CLI | Command-Line Tool for the tirup.in API",
    description:
      "Zero-dependency CLI for the tirup.in API: health, profile, projects, and writing, with JSON output.",
  },
  robots: { index: true, follow: true },
}

const linkClass =
  "underline underline-offset-2 hover:text-black dark:hover:text-white transition-colors"

function Heading({ children }: { children: ReactNode }) {
  return (
    <h2 className="text-xs uppercase tracking-[0.2em] text-black/40 dark:text-white/40 mb-3">
      {children}
    </h2>
  )
}

function CodeBlock({ children, label }: { children: string; label?: string }) {
  return (
    <div className="mt-4 mb-2">
      {label ? (
        <p className="text-[10px] uppercase tracking-[0.2em] text-black/35 dark:text-white/35 mb-2">
          {label}
        </p>
      ) : null}
      <pre className="overflow-x-auto rounded-md border border-black/10 dark:border-white/15 bg-black/[0.03] dark:bg-white/[0.04] p-4 text-xs md:text-[13px] leading-relaxed font-mono text-black/80 dark:text-white/80">
        <code>{children}</code>
      </pre>
    </div>
  )
}

export default function CliPage() {
  const currentYear = new Date().getFullYear()

  return (
    <main className="relative min-h-screen flex flex-col">
      <Header />

      <section className="section px-6 md:px-20 pb-20 max-w-4xl mx-auto w-full">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-serif italic font-medium tracking-tight leading-tight text-black dark:text-white mb-2">
          tirup CLI
        </h1>
        <p className="text-xs text-black/40 dark:text-white/40 mb-10">
          Command-line tool for the tirup.in API · v1.0.0 · Node 18+
        </p>

        <div className="space-y-10 text-base font-light text-black/70 dark:text-white/70 leading-relaxed max-w-3xl">
          <div>
            <Heading>What it is</Heading>
            <p>
              <code className="font-mono text-sm">tirup</code> is a zero-dependency
              command-line client for the{" "}
              <Link href="/docs" className={linkClass}>
                tirup.in API
              </Link>
              . It fetches the profile, the project index, and the published article list
              without writing an integration, and prints JSON on request so an agent can
              pipe it straight into another step.
            </p>
          </div>

          <div>
            <Heading>Install</Heading>
            <p>
              The CLI lives in the site repository and is not yet published to npm. Install
              it from source:
            </p>
            <CodeBlock label="Shell">{`git clone https://github.com/MehtaDevelops/tirup.in.git
cd tirup.in/cli
npm link`}</CodeBlock>
            <p>
              Or run it without installing anything:
            </p>
            <CodeBlock label="Shell">{`node tirup.in/cli/tirup.mjs health`}</CodeBlock>
          </div>

          <div>
            <Heading>Commands</Heading>
            <CodeBlock label="Shell">{`tirup health                  # is the API serving requests?
tirup profile                 # identity facts
tirup projects                # the project index
tirup writing --limit 5       # newest 5 articles`}</CodeBlock>
            <p className="mt-3">
              Add{" "}
              <code className="font-mono text-sm">--json</code> to any command for the raw
              response, and{" "}
              <code className="font-mono text-sm">--base</code> to point it at another
              host.
            </p>
            <CodeBlock label="Agent-friendly output">{`tirup projects --json | jq -r '.projects[].title'
tirup writing --limit 3 --json`}</CodeBlock>
          </div>

          <div>
            <Heading>Exit codes</Heading>
            <ul className="space-y-1 list-disc list-inside">
              <li>
                <code className="font-mono text-sm">0</code> — success
              </li>
              <li>
                <code className="font-mono text-sm">1</code> — the API returned a problem
                document; its{" "}
                <code className="font-mono text-sm">code</code> and{" "}
                <code className="font-mono text-sm">hint</code> are printed to stderr
              </li>
              <li>
                <code className="font-mono text-sm">2</code> — bad usage or a network
                failure
              </li>
            </ul>
          </div>

          <div>
            <Heading>Source</Heading>
            <p>
              The source is{" "}
              <code className="font-mono text-sm">cli/tirup.mjs</code> in the{" "}
              <a
                href="https://github.com/MehtaDevelops/tirup.in"
                target="_blank"
                rel="noopener noreferrer"
                className={linkClass}
              >
                tirup.in repository
              </a>
              . It is MIT licensed and small enough to read in one sitting.
            </p>
          </div>

          <div>
            <Heading>Related</Heading>
            <ul className="space-y-2 list-disc list-inside">
              <li>
                <Link href="/docs" className={linkClass}>
                  API documentation
                </Link>
              </li>
              <li>
                <Link href="/developers" className={linkClass}>
                  Developer portal
                </Link>
              </li>
              <li>
                <a href="/openapi.json" className={linkClass}>
                  OpenAPI 3.1 description
                </a>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <footer className="py-4 px-6 text-center border-t border-black/10 dark:border-white/10 mt-auto">
        <p className="text-xs md:text-sm text-black/40 dark:text-white/40" suppressHydrationWarning>
          © {currentYear} Tirup Mehta. All rights reserved.
        </p>
      </footer>
    </main>
  )
}
