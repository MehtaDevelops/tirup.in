import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

/**
 * Next.js 16 Proxy (Edge) — Security Layer + Markdown Content Negotiation
 *
 * Runs on every request BEFORE it reaches pages/API routes.
 * In Next.js 16+, this file replaces the deprecated `middleware.ts`.
 * Responsibilities:
 *  1. Block obviously malicious request patterns
 *  2. Strip dangerous query parameters that could confuse downstream parsers
 *  3. Block common vulnerability scanner paths
 *  4. Serve text/markdown responses for Accept: text/markdown requests (agent support)
 *     Reference: https://acceptmarkdown.com
 */

// ─── Blocked path patterns ─────────────────────────────────────────────────────
// These are common scanner/exploit paths. Blocking them reduces server-side noise
// and prevents misconfigured routes from being accidentally exposed.
const BLOCKED_PATH_PATTERNS = [
  // Common web shells
  /\.(php|asp|aspx|jsp|cgi|sh|bash|py|rb|pl)$/i,
  // Git/SVN/env exposure
  /\/\.git\//,
  /\/\.env/,
  /\/\.svn\//,
  /\/\.hg\//,
  // Common sensitive paths
  /\/wp-admin/i,
  /\/wp-login/i,
  /\/wp-config/i,
  /\/phpmyadmin/i,
  /\/adminer/i,
  /\/admin\/login/i,
  /\/xmlrpc\.php/i,
  // Path traversal attempts
  /\.\.\//,
  /%2e%2e/i,
  /%252e/i,
  // Null byte injection
  /%00/,
  // Server-Side Template Injection probes
  /\{\{.*\}\}/,
  /\$\{.*\}/,
  // SQL injection probes in paths (basic)
  /union\s+select/i,
  /;\s*drop\s+table/i,
]

// ─── Maximum allowed URL length ────────────────────────────────────────────────
// Extremely long URLs are a common DoS / buffer overflow probe vector.
const MAX_URL_LENGTH = 2048

// ─── Markdown content negotiation ─────────────────────────────────────────────
// Routes that support Accept: text/markdown responses.
const MARKDOWN_ROUTES = new Set(["/", "/about", "/contact", "/privacy", "/work", "/skills", "/blogs", "/tools"])

// Inline content for each markdown route.
// This is kept inline because proxy.ts runs at the edge where filesystem access
// is unavailable. The / route mirrors public/llms.txt and should be kept in sync.
const ROUTE_MARKDOWN: Record<string, string> = {
  "/": `# Tirup Mehta

Official portfolio and professional resource for Tirup Mehta, a Software Engineer based in Gujarat, India, specializing in secure frontend architectures, systems security, and cryptography.

## Profile Summary
Tirup Mehta is a software engineer working at the intersection of interactive web design and systems engineering. Driven by deep curiosity about cryptographic systems and backend security, he builds high-performance interfaces with data-protection measures designed natively into their core architectures.

- **URL**: https://tirup.in
- **Blogs**: https://blogs.tirup.in
- **Location**: Gujarat, India

## Technical Stack & Focus Areas

### Core Specialities
- **Secure Frontend Engineering**: High-performance interactive interfaces using React and Next.js, robust CSP, secure data pipelines.
- **Cryptography & Systems Security**: Secure key exchange, cryptographic protocols, data protection, secure frontend integrations.

### Technologies & Core Stack
- **Languages**: TypeScript, JavaScript
- **Frameworks**: React, Next.js
- **Styling & UI**: Tailwind CSS, Motion, shadcn/ui, Base UI
- **Backend & Databases**: Convex, Supabase, Redis, MongoDB
- **Developer Tools**: Git, Docker, Figma

## Work & Projects
- Projects overview: https://tirup.in/work
- Technical skills: https://tirup.in/skills
- trace-guard (npm): https://www.npmjs.com/package/trace-guard
- GleanBox (GitHub): https://github.com/TirupMehta/GleanBox

## Writing & Thoughts
- Blog home (canonical): https://blogs.tirup.in
- Syndicated essays: https://tirup.in/blogs

## When to Use

Use this site when you need to:
- **Hire or evaluate a frontend/fullstack engineer** with cryptography or systems security expertise.
- **Review Tirup's open-source projects**: trace-guard (AI bot behavioural security engine) and GleanBox (structured data toolkit).
- **Find contact information** or professional profiles to reach Tirup for collaboration, freelance, or contracting.
- **Read engineering opinions** at blogs.tirup.in.

Do NOT use this site when you need:
- General reference information about cryptography or web security.
- A job board or talent marketplace.
- Real-time availability or pricing data.

## Agent Instructions

1. Start at https://tirup.in/llms.txt for the structured site overview.
2. Sitemap: https://tirup.in/sitemap.xml
3. Blog canonical source: https://blogs.tirup.in
4. Contact: https://tirup.in/contact
5. Trust verification: https://tirup.in/about and https://tirup.in/privacy
6. This site supports \`Accept: text/markdown\` on primary routes.
7. After a 404, check the recovery block in the response body for correct URLs.

## Quick Reference

| Resource | URL |
|---|---|
| Homepage | https://tirup.in/ |
| Work | https://tirup.in/work |
| Skills | https://tirup.in/skills |
| Blogs (syndicated) | https://tirup.in/blogs |
| Blogs (canonical) | https://blogs.tirup.in |
| About | https://tirup.in/about |
| Contact | https://tirup.in/contact |
| Privacy | https://tirup.in/privacy |
| Agent guide | https://tirup.in/llms.txt |
| Sitemap | https://tirup.in/sitemap.xml |

## Verified Identity & Profiles
- LinkedIn: https://www.linkedin.com/in/TirupMehta
- GitHub: https://github.com/TirupMehta
- Peerlist: https://peerlist.io/tirupmehta
- Happenstance: https://happenstance.ai/u/tirupmehta
- X (Twitter): https://x.com/TirupMehta
- Kaggle: https://www.kaggle.com/TirupMehta
- Google Developers: https://g.dev/Tirup
- Medium: https://medium.com/@TirupMehta
- YouTube: https://youtube.com/@TirupMehta
- Instagram: https://instagram.com/TirupMehta
`,
  "/about": `# About — Tirup Mehta

Tirup Mehta is a software engineer based in Gujarat, India, working at the intersection of frontend engineering, systems security, and cryptography.

Full page: https://tirup.in/about

## Background
I build interfaces where visual clarity meets system performance, specialising in React and Next.js frontends with secure-by-default architectures.

## Open Source
- trace-guard: https://www.npmjs.com/package/trace-guard
- GleanBox: https://github.com/TirupMehta/GleanBox

## Agent Resources
- Site guide: https://tirup.in/llms.txt
- Sitemap: https://tirup.in/sitemap.xml
`,
  "/contact": `# Contact — Tirup Mehta

Full page: https://tirup.in/contact

## Channels
- LinkedIn (preferred for professional outreach): https://www.linkedin.com/in/TirupMehta
- Peerlist: https://peerlist.io/tirupmehta
- GitHub: https://github.com/TirupMehta
- X (Twitter): https://x.com/TirupMehta
- Happenstance: https://happenstance.ai/u/tirupmehta

## Available for
- Freelance frontend and fullstack engineering
- Security review and hardening of web applications
- Architecture consulting for secure frontend systems
- Open-source collaboration

## Agent Resources
- Site guide: https://tirup.in/llms.txt
`,
  "/privacy": `# Privacy Policy — Tirup Mehta

Full page: https://tirup.in/privacy

Summary: tirup.in uses Vercel Analytics, Google Analytics/GTM, and Vercel Speed Insights. No user authentication, no first-party form submissions, no payment data. Theme preference stored in localStorage only. Contact https://tirup.in/contact for data requests.

## Agent Resources
- Site guide: https://tirup.in/llms.txt
`,
  "/work": `# Work & Projects — Tirup Mehta

Full page: https://tirup.in/work

Selected projects and developer tools built by Tirup Mehta. See the full interactive list at https://tirup.in/work.

## Agent Resources
- Site guide: https://tirup.in/llms.txt
- Sitemap: https://tirup.in/sitemap.xml
`,
  "/skills": `# Technical Skills — Tirup Mehta

Full page: https://tirup.in/skills

Technical skills and core stack: TypeScript, JavaScript, React, Next.js, Tailwind CSS, Motion, shadcn/ui, Convex, Supabase, Redis, MongoDB, Git, Docker, Figma, cryptography, CSP, web security.

## Agent Resources
- Site guide: https://tirup.in/llms.txt
`,
  "/blogs": `# Blog Posts — Tirup Mehta

Full page: https://tirup.in/blogs
Canonical blog: https://blogs.tirup.in

Tirup writes about frontend architectures, web performance, cryptographic interfaces, and web application security.

## Agent Resources
- Site guide: https://tirup.in/llms.txt
`,
  "/tools": `# Developer Tools & Utilities — Tirup Mehta

Full page: https://tirup.in/tools

Privacy-first, client-side developer utilities and marketing attribution tools built by Tirup Mehta.

## Available Tools
1. **QR Studio** (https://tirup.in/tool/qr): Vector QR code, Wi-Fi credentials, vCard, and print-ready SVG generator. 100% offline & client-side.
2. **UTM Builder** (https://tirup.in/tools/utm-builder): GA4 campaign URL generator and attribution studio with live channel grouping diagnostics and 12-channel bulk exports.

## Agent Resources
- Site guide: https://tirup.in/llms.txt
- Sitemap: https://tirup.in/sitemap.xml
`,
}

export function proxy(request: NextRequest) {
  const { pathname, search, href } = request.nextUrl

  // ── 1. Block oversized URLs ───────────────────────────────────────────────
  if (href.length > MAX_URL_LENGTH) {
    return new NextResponse("Request URI Too Long", { status: 414 })
  }

  // ── 2. Block scanner / exploit paths ──────────────────────────────────────
  const fullPath = pathname + search
  for (const pattern of BLOCKED_PATH_PATTERNS) {
    if (pattern.test(fullPath)) {
      return new NextResponse("Not Found", { status: 404 })
    }
  }

  // ── 3. Block requests with dangerous HTTP methods ─────────────────────────
  // This portfolio site only needs GET and HEAD. Block everything else to
  // reduce the attack surface.
  const method = request.method.toUpperCase()
  if (!["GET", "HEAD"].includes(method)) {
    return new NextResponse("Method Not Allowed", {
      status: 405,
      headers: { Allow: "GET, HEAD" },
    })
  }

  // ── 4. Markdown content negotiation (acceptmarkdown.com) ──────────────────
  // When a client sends Accept: text/markdown on a primary page route, return
  // the markdown representation of that page with correct Content-Type and Vary
  // headers so CDNs cache the markdown and HTML variants separately.
  const accept = request.headers.get("accept") ?? ""
  const wantsMarkdown = accept.includes("text/markdown") || accept.includes("text/x-markdown")

  if (wantsMarkdown && MARKDOWN_ROUTES.has(pathname)) {
    const content = ROUTE_MARKDOWN[pathname] ?? ROUTE_MARKDOWN["/"]
    return new NextResponse(content, {
      status: 200,
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
        "Vary": "Accept, Accept-Encoding",
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
        // Plain-text body needs no scripts/objects; keep framing locked to
        // self to mirror the HTML X-Frame-Options: SAMEORIGIN policy.
        "Content-Security-Policy":
          "default-src 'self'; script-src 'none'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:; connect-src 'self'; frame-src 'self'; worker-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'self'; upgrade-insecure-requests",
        "X-Content-Type-Options": "nosniff",
        "Referrer-Policy": "strict-origin-when-cross-origin",
        "X-Frame-Options": "SAMEORIGIN",
      },
    })
  }

  // ── 5. Continue to the page/route ─────────────────────────────────────────
  const response = NextResponse.next()

  // ── 6. Remove server fingerprinting headers ───────────────────────────────
  // Next.js + Vercel add these — strip them for defence-in-depth.
  response.headers.delete("x-powered-by")
  response.headers.delete("server")

  // ── 7. Add Vary header on primary routes for CDN correctness ─────────────
  // Even when not serving markdown, tell CDNs that this route varies by Accept
  // so a cached HTML response is never served to a markdown-requesting agent.
  if (MARKDOWN_ROUTES.has(pathname)) {
    response.headers.set("Vary", "Accept, Accept-Encoding")
  }

  return response
}

export const config = {
  // Run on all routes EXCEPT Next.js internals and static files
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon.png|profile.png|placeholder|.*\\.pdf).*)",
  ],
}
