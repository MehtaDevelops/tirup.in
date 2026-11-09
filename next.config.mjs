/** @type {import('next').NextConfig} */

// React/Next dev mode (Turbopack) uses eval() for debugging callstacks, so
// `unsafe-eval` is required locally. Production never uses eval(), so it is
// only added when NODE_ENV=development to keep the deployed policy tight.
const isDev = process.env.NODE_ENV === "development"

// ─── Components subpath ──────────────────────────────────────────────────────
// tirup.in/components is served NATIVELY by this app now (routes under
// app/components/). The shadcn registry JSONs are generated at build time by
// scripts/build-registry.mjs into generated/registry/, then served at
// /components/r/<name>.json by app/components/r/[slug]/route.ts (which sends
// browser navigation to the human-readable source viewer). Keep
// lib/components-site.ts in sync.

const cspScriptSrc = [
  "'self'",
  "'unsafe-inline'",
  ...(isDev ? ["'unsafe-eval'"] : []),
  "https://www.googletagmanager.com",
  "https://*.googletagmanager.com",
  "https://www.google-analytics.com",
  "https://*.clarity.ms",
  "https://www.clarity.ms",
  "https://va.vercel-scripts.com",
  "https://vitals.vercel-insights.com",
  "https://www.youtube.com",
  "https://www.youtube-nocookie.com",
].join(" ")

const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src ${cspScriptSrc}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "connect-src 'self' https://accomplished-condor-793.convex.site https://www.google-analytics.com https://*.google-analytics.com https://www.googletagmanager.com https://va.vercel-scripts.com https://vitals.vercel-insights.com https://github-contributions-api.jogruber.de https://www.youtube.com https://www.youtube-nocookie.com https://*.clarity.ms https://www.clarity.ms https://www.google.com https://analytics.google.com",
  "frame-src 'self' https://www.googletagmanager.com https://www.youtube.com https://www.youtube-nocookie.com",
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
  "upgrade-insecure-requests",
].join("; ")

const nextConfig = {
  // ─── Build Quality ────────────────────────────────────────────────────────
  // In Next.js 16, ESLint is run via `next lint` CLI: the `eslint` config key
  // is no longer supported. TypeScript checking is still enforced (ignoreBuildErrors
  // defaults to false). Any TS errors will fail the build.
  typescript: {
    ignoreBuildErrors: false,
  },


  // ─── Image Optimisation ───────────────────────────────────────────────────
  images: {
    // Let Next.js optimise images (reduces attack surface of serving arbitrary
    // raw binaries). Restrict remote image domains to our own Convex backend.
    unoptimized: false,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "accomplished-condor-793.convex.site",
        pathname: "/**",
      },
    ],
    // Allowed output formats: limit to modern, safe formats only
    formats: ["image/avif", "image/webp"],
    // Allowed quality levels: default 75 everywhere, 90 for the small
    // pixel avatar where compression artefacts are visible.
    qualities: [75, 90],
    // Minimise dangling image cache
    minimumCacheTTL: 3600,
    dangerouslyAllowSVG: false,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // ─── HTTP Headers ─────────────────────────────────────────────────────────
  // These headers are injected at the Next.js layer (works in both Vercel and
  // self-hosted deployments). The vercel.json file adds a second layer for the
  // Vercel CDN edge.
  async headers() {
    return [
      {
        // Apply to ALL routes
        source: "/(.*)",
        headers: [
          // ── Prevent information leakage ──────────────────────────────────
          {
            key: "X-Powered-By",
            // Overriding (Next.js already strips this, belt-and-suspenders)
            value: "",
          },
          // ── Transport security ───────────────────────────────────────────
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          // ── Clickjacking protection ──────────────────────────────────────
          // SAMEORIGIN (not DENY) so same-origin iframes like the
          // resume preview popup can embed the PDF, while other
          // sites still cannot frame this site.
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          // ── MIME sniffing protection ─────────────────────────────────────
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          // ── Referrer leakage control ─────────────────────────────────────
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          // ── Content Security Policy ──────────────────────────────────────
          // frame-ancestors 'self' mirrors X-Frame-Options: SAMEORIGIN above
          // (same-origin resume preview still works, other sites cannot frame).
          // script-src allows Next.js inline bootstraps + GTM/GA/Vercel
          // analytics; connect-src allows Convex API + analytics beacons +
          // GitHub contributions API + YouTube oEmbed; frame-src allows the
          // hidden YouTube player; img-src allows data:/blob: for QR tool,
          // shader noise SVG, and PDF blob previews.
          // (`unsafe-eval` is auto-included in dev only: see top of file.)
          {
            key: "Content-Security-Policy",
            value: contentSecurityPolicy,
          },
          // ── Browser feature restrictions ─────────────────────────────────
          {
            key: "Permissions-Policy",
            value:
              "camera=(), microphone=(), geolocation=(), interest-cohort=(), payment=(), usb=(), bluetooth=(), serial=(), speaker-selection=(), xr-spatial-tracking=(), ambient-light-sensor=(), autoplay=(self \"https://www.youtube.com\" \"https://www.youtube-nocookie.com\"), fullscreen=(self)",
          },
          // ── Cross-Origin isolation ────────────────────────────────────────
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin-allow-popups",
          },
          {
            key: "Cross-Origin-Resource-Policy",
            value: "cross-origin",
          },
          // ── DNS prefetch control ─────────────────────────────────────────
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          // ── Adobe cross-domain policies ──────────────────────────────────
          {
            key: "X-Permitted-Cross-Domain-Policies",
            value: "none",
          },
        ],
      },
      // ── API routes: no caching, no sniffing ─────────────────────────────
      {
        source: "/api/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, no-cache, must-revalidate",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
        ],
      },
      // ── Homepage agent discovery (RFC 8288 + RFC 9727 §3) ───────────────
      // Advertise machine-readable resources. Only relations whose targets
      // actually exist are listed; API-level service-desc/service-doc links
      // live in the catalog itself, where their anchor context is correct.
      {
        source: "/",
        headers: [
          {
            key: "Link",
            value:
              '</.well-known/api-catalog>; rel="api-catalog", </llms.txt>; rel="describedby"',
          },
        ],
      },
    ]
  },

  // ─── Powered-by Header ────────────────────────────────────────────────────
  // Removes the `X-Powered-By: Next.js` header to avoid fingerprinting.
  poweredByHeader: false,

  // ─── Production Source Maps ───────────────────────────────────────────────
  // Disable production source maps to prevent source code leakage.
  productionBrowserSourceMaps: false,

  // ─── Redirect HTTP → HTTPS ────────────────────────────────────────────────
  // Vercel handles this at the edge, but belt-and-suspenders for self-hosted.
  async redirects() {
    // The blog lived at the ROOT of tirup.in before it moved to /writing and
    // then to blogs.tirup.in. Post bodies still contain root-relative links to
    // those old slugs, and Google still has them indexed from 2026. Without
    // these they 404 on this host (Search Console: "Not found (404)").
    // Kept in sync with the same map in blogs/next.config.ts; targets are the
    // canonical blogs.tirup.in URLs so old links resolve in a single hop.
    const legacyPostRedirects = [
      ["/the-winners-want-to-stop-the-race", "ai-pause-debate-explained-why-the-winners-want-to-stop-the-race"],
      ["/the-rubygems-flood-the-attack-everyone-mistook-for-spam", "rubygems-supply-chain-attack-the-cyberattack-everyone-mistook-for-spam"],
      ["/gpt-6-astra-and-the-operational-delta", "gpt-6-astra-at-70-why-benchmark-scores-dont-make-trustworthy-ai"],
      ["/secure-url-validation-for-web-applications", "ssrf-attacks-explained-how-your-server-gets-tricked-into-hacking-itself"],
      ["/building-a-responsive-portfolio-from-scratch", "responsive-portfolio-redesign-i-rebuilt-mine-three-times-heres-what-was-wrong"],
      ["/frontend-performance-techniques-i-use-in-real-projects", "frontend-performance-fix-my-site-felt-slow-three-real-causes-three-fixes"],
      ["/the-rogue-agent-incident-what-the-july-2026-hugging-face-breach-teaches-us-about-autonomous-ai-security", "openai-hugging-face-hack-700-rogue-agents-a-cover-up-and-alarms-nobody-switched-on"],
      ["/open-redirect-vulnerabilities-explained-with-practical-examples", "open-redirect-vulnerability-that-log-in-button-may-drop-you-on-a-fake-page"],
      ["/claude-opus-5-vs-gpt-5-6-sol-a-frontier-benchmark-for-multi-step-system-engineering", "claude-vs-gpt-for-coding-i-deleted-my-comparison-table-heres-what-replaced-it"],
      ["/hardening-agentic-workflows-zero-trust-runtime-sandboxing-for-autonomous-code-execution", "ai-agent-sandboxing-guide-how-i-would-lock-up-an-ai-that-runs-code"],
      ["/the-us-just-killed-anthropic-s-fable-5-and-their-own-tech-dominance-with-it", "anthropic-fable-5-ban-the-18-day-shutdown-and-the-one-filter-that-ended-it"],
      ["/the-making-of-trace-guard-redefining-anti-bot-security-for-the-vlm-era", "bot-detection-without-captchas-i-built-a-trap-that-catches-ai-agents"],
    ].map(([source, slug]) => ({
      source,
      destination: `https://blogs.tirup.in/${slug}`,
      permanent: true,
    }))

    return [
      // /blogs renamed to /writing: keep old indexed/shared links working
      {
        source: "/blogs",
        destination: "/writing",
        permanent: true,
      },
      {
        source: "/blogs/:path*",
        destination: "/writing/:path*",
        permanent: true,
      },
      // /projects is not a page (only /projects/:slug is). Guessed URLs and
      // stale links landed on a 404; send them to the real index instead.
      {
        source: "/projects",
        destination: "/work",
        permanent: true,
      },
      // /index is a second 200 copy of the homepage; collapse it.
      {
        source: "/index",
        destination: "/",
        permanent: true,
      },
      ...legacyPostRedirects,
    ]
  },

  // ─── Well-Known URIs (RFC 8615) ───────────────────────────────────────────
  // RFC 9727 api-catalog: canonical route lives at /api/catalog; the
  // well-known URI rewrites to it so scanners and agents find it at
  // /.well-known/api-catalog with the route's application/linkset+json
  // Content-Type preserved.
  async rewrites() {
    return [
      {
        source: "/.well-known/api-catalog",
        destination: "/api/catalog",
      },
    ]
  },
}

export default nextConfig