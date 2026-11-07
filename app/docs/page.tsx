import type { Metadata } from "next"
import type { ReactNode } from "react"
import Link from "next/link"
import Header from "@/components/header"

export const metadata: Metadata = {
  title: {
    absolute: "Tirup Mehta API Docs | REST API Reference",
  },
  description:
    "Official API documentation for tirup.in. Four read-only REST endpoints (health, profile, projects, writing) with JSON schemas, RFC 9457 problem errors, RFC RateLimit headers, and an OpenAPI 3.1 description.",
  keywords: [
    "Tirup Mehta API",
    "tirup.in API docs",
    "Tirup Mehta API documentation",
    "REST API documentation",
    "OpenAPI 3.1",
  ],
  alternates: { canonical: "/docs" },
  openGraph: {
    url: "/docs",
    title: "Tirup Mehta API Docs | REST API Reference",
    description:
      "Read-only REST API for tirup.in: health, profile, projects, and writing. OpenAPI 3.1, JSON schemas, RFC 9457 errors, RFC RateLimit headers.",
  },
  robots: { index: true, follow: true },
}

const linkClass =
  "underline underline-offset-2 hover:text-black dark:hover:text-white transition-colors"

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

function SectionHeading({ children }: { children: ReactNode }) {
  return (
    <h2 className="text-xs uppercase tracking-[0.2em] text-black/40 dark:text-white/40 mb-3">
      {children}
    </h2>
  )
}

export default function DocsPage() {
  const currentYear = new Date().getFullYear()

  return (
    <main className="relative min-h-screen flex flex-col">
      <Header />

      <section className="section px-6 md:px-20 pb-20 max-w-4xl mx-auto w-full">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-serif italic font-medium tracking-tight leading-tight text-black dark:text-white mb-2">
          Tirup Mehta API Documentation
        </h1>
        <p className="text-xs text-black/40 dark:text-white/40 mb-10">
          Read-only REST API · Version v1 · Last updated: November 2026
        </p>

        <div className="space-y-10 text-base font-light text-black/70 dark:text-white/70 leading-relaxed max-w-3xl">
          <div>
            <SectionHeading>Overview</SectionHeading>
            <p>
              The tirup.in API exposes the same facts this site publishes as HTML and
              JSON-LD, in a shape an agent or script can consume directly. It is
              unauthenticated, read-only, and CORS-open. There are four endpoints, all
              under <code className="font-mono text-sm">/api/v1</code>.
            </p>
            <ul className="mt-4 space-y-2 list-disc list-inside">
              <li>
                <a href="#endpoints" className={linkClass}>
                  Endpoints
                </a>{" "}
                with request and response examples
              </li>
              <li>
                <a href="#errors" className={linkClass}>
                  Errors
                </a>{" "}
                as RFC 9457 problem documents
              </li>
              <li>
                <a href="#rate-limits" className={linkClass}>
                  Rate limits
                </a>{" "}
                with RFC RateLimit headers
              </li>
              <li>
                <a href="#versioning" className={linkClass}>
                  Versioning
                </a>{" "}
                and{" "}
                <a href="#deprecation" className={linkClass}>
                  deprecation
                </a>
              </li>
            </ul>
            <p className="mt-4">
              Machine-readable description:{" "}
              <a href="/openapi.json" className={linkClass}>
                /openapi.json
              </a>{" "}
              (OpenAPI 3.1). Plain-text summary for models:{" "}
              <a href="/llms.txt" className={linkClass}>
                /llms.txt
              </a>
              .
            </p>
          </div>

          <div>
            <SectionHeading>Authentication</SectionHeading>
            <p>
              None. Every endpoint is public and read-only, so there is no API key, no
              OAuth flow, and no credential to leak. Requests that would modify state are
              refused with{" "}
              <code className="font-mono text-sm">405 method_not_allowed</code>.
            </p>
          </div>

          <div id="endpoints">
            <SectionHeading>Endpoints</SectionHeading>

            <h3 className="text-sm md:text-base font-medium text-black dark:text-white mt-6 mb-1">
              GET /api/v1/health
            </h3>
            <p>
              Liveness probe. Returns the API version and a process-local uptime counter.
              Touches no downstream service, so a 200 proves the deployment is answering,
              not that the article store is reachable. Limit: 120 requests per 60 seconds.
            </p>
            <CodeBlock label="Request">{`curl -sS https://tirup.in/api/v1/health`}</CodeBlock>
            <CodeBlock label="Response">{`{
  "status": "ok",
  "service": "tirup.in",
  "version": "v1",
  "timestamp": "2026-11-07T11:42:09.512Z",
  "uptimeSeconds": 348,
  "links": {
    "self": "https://tirup.in/api/v1/health",
    "docs": "https://tirup.in/docs",
    "openapi": "https://tirup.in/openapi.json"
  }
}`}</CodeBlock>

            <h3 className="text-sm md:text-base font-medium text-black dark:text-white mt-6 mb-1">
              GET /api/v1/profile
            </h3>
            <p>
              Identity facts: name, headline, summary, location, skills, and verified
              profile links. Static content, cached for an hour.
            </p>
            <CodeBlock label="Request">{`curl -sS https://tirup.in/api/v1/profile`}</CodeBlock>

            <h3 className="text-sm md:text-base font-medium text-black dark:text-white mt-6 mb-1">
              GET /api/v1/projects
            </h3>
            <p>
              The project index behind{" "}
              <Link href="/work" className={linkClass}>
                /work
              </Link>
              : canonical page URL, live URL, repository, tech stack, and headline stats
              for each project.
            </p>
            <CodeBlock label="Request">{`curl -sS https://tirup.in/api/v1/projects`}</CodeBlock>

            <h3 className="text-sm md:text-base font-medium text-black dark:text-white mt-6 mb-1">
              GET /api/v1/writing
            </h3>
            <p>
              Newest-first list of published articles. Each item carries the canonical URL
              on{" "}
              <a href="https://blogs.tirup.in" className={linkClass}>
                blogs.tirup.in
              </a>
              , the only host that owns article content. Accepts{" "}
              <code className="font-mono text-sm">limit</code> from 1 to 50 (default 10).
              Returns 502 if the article store is unreachable.
            </p>
            <CodeBlock label="Request">{`curl -sS "https://tirup.in/api/v1/writing?limit=5"`}</CodeBlock>
            <CodeBlock label="Response">{`{
  "version": "v1",
  "count": 5,
  "total": 14,
  "limit": 5,
  "posts": [
    {
      "slug": "example-slug",
      "title": "Example article",
      "tldr": "One-paragraph summary.",
      "publishedAt": "2026-10-02T00:00:00.000Z",
      "url": "https://blogs.tirup.in/example-slug"
    }
  ],
  "links": {
    "self": "https://tirup.in/api/v1/writing",
    "blog": "https://blogs.tirup.in",
    "rss": "https://tirup.in/rss.xml",
    "docs": "https://tirup.in/docs",
    "openapi": "https://tirup.in/openapi.json"
  }
}`}</CodeBlock>

            <p className="mt-4">
              Every endpoint also answers{" "}
              <code className="font-mono text-sm">HEAD</code> with the same status and
              headers and an empty body.
            </p>
          </div>

          <div id="errors">
            <SectionHeading>Errors</SectionHeading>
            <p>
              Failures are RFC 9457{" "}
              <code className="font-mono text-sm">application/problem+json</code> documents.
              Branch on{" "}
              <code className="font-mono text-sm">code</code>;{" "}
              <code className="font-mono text-sm">detail</code> and{" "}
              <code className="font-mono text-sm">hint</code> are for humans and models.
              Unknown <code className="font-mono text-sm">/api/*</code> paths answer with
              the same shape instead of an HTML page.
            </p>
            <CodeBlock label="Example 404">{`{
  "type": "https://tirup.in/docs#error-not_found",
  "title": "No such API endpoint",
  "status": 404,
  "detail": "No API endpoint is served at /api/v1/nope.",
  "instance": "/api/v1/nope",
  "code": "not_found",
  "hint": "See https://tirup.in/docs for the list of endpoints, or fetch https://tirup.in/openapi.json."
}`}</CodeBlock>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="text-left text-[10px] uppercase tracking-[0.15em] text-black/40 dark:text-white/40">
                    <th className="py-2 pr-4 border-b border-black/10 dark:border-white/15">Status</th>
                    <th className="py-2 pr-4 border-b border-black/10 dark:border-white/15">code</th>
                    <th className="py-2 border-b border-black/10 dark:border-white/15">Meaning</th>
                  </tr>
                </thead>
                <tbody className="align-top">
                  <tr>
                    <td className="py-2 pr-4 border-b border-black/5 dark:border-white/10 font-mono">400</td>
                    <td className="py-2 pr-4 border-b border-black/5 dark:border-white/10 font-mono">invalid_parameter</td>
                    <td className="py-2 border-b border-black/5 dark:border-white/10">A query parameter is out of range or malformed.</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4 border-b border-black/5 dark:border-white/10 font-mono">404</td>
                    <td className="py-2 pr-4 border-b border-black/5 dark:border-white/10 font-mono">not_found</td>
                    <td className="py-2 border-b border-black/5 dark:border-white/10">No endpoint exists at that path.</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4 border-b border-black/5 dark:border-white/10 font-mono">405</td>
                    <td className="py-2 pr-4 border-b border-black/5 dark:border-white/10 font-mono">method_not_allowed</td>
                    <td className="py-2 border-b border-black/5 dark:border-white/10">The endpoint is read-only.</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4 border-b border-black/5 dark:border-white/10 font-mono">429</td>
                    <td className="py-2 pr-4 border-b border-black/5 dark:border-white/10 font-mono">rate_limited</td>
                    <td className="py-2 border-b border-black/5 dark:border-white/10">Too many requests. Wait for Retry-After.</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4 border-b border-black/5 dark:border-white/10 font-mono">502</td>
                    <td className="py-2 pr-4 border-b border-black/5 dark:border-white/10 font-mono">upstream_unavailable</td>
                    <td className="py-2 border-b border-black/5 dark:border-white/10">A dependency (the article store) did not answer.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div id="rate-limits">
            <SectionHeading>Rate limits</SectionHeading>
            <p>
              Limits are fixed-window and counted per client IP, best-effort per instance.
              Every response carries the standard headers so a client can throttle itself
              without waiting for a 429:
            </p>
            <ul className="mt-3 space-y-1 list-disc list-inside font-mono text-sm">
              <li>RateLimit-Limit: requests allowed in the window</li>
              <li>RateLimit-Remaining: requests left in this window</li>
              <li>RateLimit-Reset: seconds until the window resets</li>
              <li>RateLimit-Policy: the quota and window, e.g. 60;w=60</li>
              <li>Retry-After: present only on a 429</li>
            </ul>
            <CodeBlock label="Headers on a successful response">{`RateLimit-Limit: 60
RateLimit-Remaining: 58
RateLimit-Reset: 60
RateLimit-Policy: 60;w=60`}</CodeBlock>
          </div>

          <div id="versioning">
            <SectionHeading>Versioning</SectionHeading>
            <p>
              The major version is in the URL path:{" "}
              <code className="font-mono text-sm">/api/v1</code>. Additive changes (new
              fields, new endpoints) may land in v1 at any time, so clients should ignore
              unknown fields. Breaking changes ship only as{" "}
              <code className="font-mono text-sm">/api/v2</code>, and v1 stays live for at
              least 180 days after v2 is announced.
            </p>
          </div>

          <div id="deprecation">
            <SectionHeading>Deprecation</SectionHeading>
            <p>
              A deprecated endpoint or field is signalled three ways, never silently:
            </p>
            <ul className="mt-3 space-y-1 list-disc list-inside">
              <li>
                a{" "}
                <code className="font-mono text-sm">Deprecation</code> response header
                (RFC 9745)
              </li>
              <li>
                a{" "}
                <code className="font-mono text-sm">Sunset</code> response header (RFC 8594)
                carrying the retirement date
              </li>
              <li>
                a{" "}
                <code className="font-mono text-sm">deprecation</code> object in the JSON
                body with{" "}
                <code className="font-mono text-sm">sunset</code> and{" "}
                <code className="font-mono text-sm">replacement</code>
              </li>
            </ul>
            <p className="mt-3">
              Nothing is removed before its advertised Sunset date.
            </p>
          </div>

          <div>
            <SectionHeading>Tooling</SectionHeading>
            <ul className="space-y-2 list-disc list-inside">
              <li>
                <Link href="/developers" className={linkClass}>
                  Developer portal
                </Link>{" "}
                with quickstart, sandbox guidance, and keys
              </li>
              <li>
                <Link href="/cli" className={linkClass}>
                  CLI
                </Link>{" "}
                for scripting the API from a terminal
              </li>
              <li>
                <a href="/openapi.json" className={linkClass}>
                  OpenAPI 3.1 description
                </a>
              </li>
              <li>
                <a href="/.well-known/api-catalog" className={linkClass}>
                  API catalog
                </a>{" "}
                (RFC 9727)
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
