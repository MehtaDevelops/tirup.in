/** @type {import('next').NextConfig} */

// React/Next dev mode (Turbopack) uses eval() for debugging callstacks, so
// `unsafe-eval` is required locally. Production never uses eval(), so it is
// only added when NODE_ENV=development to keep the deployed policy tight.
const isDev = process.env.NODE_ENV === "development"

const cspScriptSrc = [
  "'self'",
  "'unsafe-inline'",
  ...(isDev ? ["'unsafe-eval'"] : []),
  "https://www.googletagmanager.com",
  "https://*.googletagmanager.com",
  "https://www.google-analytics.com",
  "https://va.vercel-scripts.com",
  "https://vitals.vercel-insights.com",
].join(" ")

const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src ${cspScriptSrc}`,
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data: https://fonts.gstatic.com",
  "connect-src 'self' https://accomplished-condor-793.convex.site https://www.google-analytics.com https://*.google-analytics.com https://www.googletagmanager.com https://va.vercel-scripts.com https://vitals.vercel-insights.com https://github-contributions-api.jogruber.de",
  "frame-src 'self' https://www.googletagmanager.com",
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
  "upgrade-insecure-requests",
].join("; ")

const nextConfig = {
  // ─── Build Quality ────────────────────────────────────────────────────────
  // In Next.js 16, ESLint is run via `next lint` CLI — the `eslint` config key
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
    // Allowed output formats — limit to modern, safe formats only
    formats: ["image/avif", "image/webp"],
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
          // GitHub contributions API; img-src allows data:/blob: for QR tool,
          // shader noise SVG, and PDF blob previews.
          // (`unsafe-eval` is auto-included in dev only — see top of file.)
          {
            key: "Content-Security-Policy",
            value: contentSecurityPolicy,
          },
          // ── Browser feature restrictions ─────────────────────────────────
          {
            key: "Permissions-Policy",
            value:
              "camera=(), microphone=(), geolocation=(), interest-cohort=(), payment=(), usb=(), bluetooth=(), serial=(), speaker-selection=(), xr-spatial-tracking=(), ambient-light-sensor=(), autoplay=(self), fullscreen=(self)",
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
    return []
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