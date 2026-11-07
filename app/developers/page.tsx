import type { Metadata } from "next"
import type { ReactNode } from "react"
import Link from "next/link"
import Header from "@/components/header"

export const metadata: Metadata = {
  title: {
    absolute: "Tirup Mehta Developer Portal | API Keys, Quickstart & Sandbox",
  },
  description:
    "Developer portal for the tirup.in API: get started in one request, understand API keys and rate limits, use the sandbox, and grab the OpenAPI description, CLI, and RSS feed.",
  keywords: [
    "Tirup Mehta developer portal",
    "Tirup Mehta API keys",
    "tirup.in API quickstart",
    "API sandbox",
    "Tirup Mehta API",
  ],
  alternates: { canonical: "/developers" },
  openGraph: {
    url: "/developers",
    title: "Tirup Mehta Developer Portal | API Keys, Quickstart & Sandbox",
    description:
      "Quickstart, API keys, rate limits, sandbox, OpenAPI description, and CLI for the tirup.in API.",
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

export default function DevelopersPage() {
  const currentYear = new Date().getFullYear()

  return (
    <main className="relative min-h-screen flex flex-col">
      <Header />

      <section className="section px-6 md:px-20 pb-20 max-w-4xl mx-auto w-full">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-serif italic font-medium tracking-tight leading-tight text-black dark:text-white mb-2">
          Tirup Mehta Developer Portal
        </h1>
        <p className="text-xs text-black/40 dark:text-white/40 mb-10">
          Build against the tirup.in API · Version v1
        </p>

        <div className="space-y-10 text-base font-light text-black/70 dark:text-white/70 leading-relaxed max-w-3xl">
          <div>
            <Heading>Quickstart</Heading>
            <p>
              The API is public and read-only. There is nothing to sign up for, so the
              first request is also the whole integration:
            </p>
            <CodeBlock label="Terminal">{`curl -sS https://tirup.in/api/v1/profile`}</CodeBlock>
            <p>
              From JavaScript, the same call needs no SDK:
            </p>
            <CodeBlock label="JavaScript">{`const res = await fetch("https://tirup.in/api/v1/projects", {
  headers: { Accept: "application/json" },
});

if (!res.ok) {
  const problem = await res.json();
  throw new Error(problem.code + ": " + problem.detail);
}

const { projects } = await res.json();`}</CodeBlock>
            <p className="mt-3">
              Full endpoint reference, schemas, and error codes live in the{" "}
              <Link href="/docs" className={linkClass}>
                API documentation
              </Link>
              .
            </p>
          </div>

          <div>
            <Heading>API keys</Heading>
            <p>
              No key is required or issued. Every endpoint is public, read-only, and
              unauthenticated, so a key would only add a secret to leak. Abuse is handled
              by per-client rate limits instead. If you need higher limits for a
              legitimate integration, describe the use case on the{" "}
              <Link href="/contact" className={linkClass}>
                contact page
              </Link>
              .
            </p>
          </div>

          <div>
            <Heading>Rate limits</Heading>
            <p>
              60 requests per 60 seconds per client IP on{" "}
              <code className="font-mono text-sm">/api/v1/profile</code>,{" "}
              <code className="font-mono text-sm">/api/v1/projects</code>, and{" "}
              <code className="font-mono text-sm">/api/v1/writing</code>; 120 per 60
              seconds on{" "}
              <code className="font-mono text-sm">/api/v1/health</code>. Every response
              includes{" "}
              <code className="font-mono text-sm">RateLimit-Limit</code>,{" "}
              <code className="font-mono text-sm">RateLimit-Remaining</code>,{" "}
              <code className="font-mono text-sm">RateLimit-Reset</code>, and{" "}
              <code className="font-mono text-sm">RateLimit-Policy</code>. A 429 adds{" "}
              <code className="font-mono text-sm">Retry-After</code>.
            </p>
          </div>

          <div>
            <Heading>Sandbox</Heading>
            <p>
              The production API is itself the sandbox. There is no write path, no billing,
              and no private data, so a request against{" "}
              <code className="font-mono text-sm">https://tirup.in</code> cannot mutate
              anything. Experiment freely, then ship the same call. A stable staging host
              is not offered because it would serve identical bytes.
            </p>
          </div>

          <div>
            <Heading>Resources</Heading>
            <ul className="space-y-2 list-disc list-inside">
              <li>
                <Link href="/docs" className={linkClass}>
                  API documentation
                </Link>{" "}
                — endpoints, schemas, errors, versioning
              </li>
              <li>
                <a href="/openapi.json" className={linkClass}>
                  OpenAPI 3.1 description
                </a>{" "}
                — import into Postman, Insomnia, or an agent tool registry
              </li>
              <li>
                <a href="/.well-known/api-catalog" className={linkClass}>
                  API catalog
                </a>{" "}
                (RFC 9727) — machine-readable service discovery
              </li>
              <li>
                <Link href="/cli" className={linkClass}>
                  Command-line tool
                </Link>{" "}
                — script the API without writing an integration
              </li>
              <li>
                <a href="/rss.xml" className={linkClass}>
                  RSS feed
                </a>{" "}
                — the writing list without polling the API
              </li>
              <li>
                <a href="/llms.txt" className={linkClass}>
                  llms.txt
                </a>{" "}
                — plain-text site summary for models
              </li>
              <li>
                <a
                  href="https://github.com/TirupMehta"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={linkClass}
                >
                  GitHub
                </a>{" "}
                — source for the CLI and this site
              </li>
            </ul>
          </div>

          <div>
            <Heading>Support</Heading>
            <p>
              Bugs and integration questions go through the{" "}
              <Link href="/contact" className={linkClass}>
                contact page
              </Link>
              . Security reports should follow{" "}
              <a href="/.well-known/security.txt" className={linkClass}>
                security.txt
              </a>
              .
            </p>
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
