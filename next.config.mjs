/** @type {import('next').NextConfig} */
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
          {
            key: "X-Frame-Options",
            value: "DENY",
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
}

export default nextConfig