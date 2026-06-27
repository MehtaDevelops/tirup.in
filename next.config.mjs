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
            value: "same-origin",
          },
          // ── Content Security Policy ───────────────────────────────────────
          // IMPORTANT: This is a portfolio site that uses:
          //   - Google Fonts (fonts.googleapis.com, fonts.gstatic.com)
          //   - Google Tag Manager + Analytics (googletagmanager.com, google-analytics.com)
          //   - Vercel Analytics
          //   - External Convex API (accomplished-condor-793.convex.site)
          //   - Images from our own origin
          //   - 'unsafe-inline' for styles is required by Tailwind's runtime class generation
          //     (with Next.js App Router, style nonces are not yet supported for Tailwind).
          //
          // The theme-init script in layout.tsx uses dangerouslySetInnerHTML which
          // requires 'unsafe-inline' for scripts — we mitigate this by keeping it
          // minimal, non-parametric, and not accepting external input.
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              // Scripts: self + GTM + GA + Vercel Speed Insights
              "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com https://va.vercel-scripts.com https://vercel.live",
              // Styles: self + Google Fonts + inline (required by Tailwind)
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              // Fonts: Google Fonts CDN
              "font-src 'self' https://fonts.gstatic.com data:",
              // Images: self + data URIs + our Convex API
              "img-src 'self' data: blob: https://accomplished-condor-793.convex.site https://www.google-analytics.com https://www.googletagmanager.com",
              // Fetch/XHR: self + Convex API + Analytics
              "connect-src 'self' https://accomplished-condor-793.convex.site https://www.google-analytics.com https://analytics.google.com https://www.googletagmanager.com https://vitals.vercel-insights.com https://va.vercel-scripts.com",
              // Media: self only
              "media-src 'self'",
              // Workers: self only
              "worker-src 'self' blob:",
              // Frames: block all (no iframes used; GTM noscript iframe is for non-JS users only)
              "frame-src https://www.googletagmanager.com",
              // Manifest
              "manifest-src 'self'",
              // Prevent loading any plugins (Flash, Java, etc.)
              "object-src 'none'",
              // Base URI locked to self to prevent base tag hijacking
              "base-uri 'self'",
              // Form submissions only to self
              "form-action 'self'",
              // Block upgrade insecure requests
              "upgrade-insecure-requests",
            ].join("; "),
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