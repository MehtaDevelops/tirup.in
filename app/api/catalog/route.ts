/**
 * Canonical API catalog (RFC 9727) for Tirup Mehta's public APIs.
 *
 * Served at /api/catalog and rewritten to /.well-known/api-catalog
 * (see rewrites() in next.config.mjs). The catalog itself lives on
 * tirup.in but lists APIs distributed across subdomains, per
 * RFC 9727 Section 5.1.
 *
 * Only unauthenticated public endpoints are listed. Authenticated
 * routes (e.g. blogs.tirup.in /api/posts) are intentionally excluded.
 */

const CATALOG = {
  linkset: [
    {
      anchor: "https://modelregistry.tirup.in/api/v1/models",
      "service-desc": [
        {
          href: "https://modelregistry.tirup.in/openapi.json",
          type: "application/json",
        },
      ],
      "service-doc": [
        {
          href: "https://modelregistry.tirup.in/docs",
          type: "text/html",
        },
      ],
      status: [
        {
          href: "https://modelregistry.tirup.in/api/check-updates",
          type: "application/json",
        },
      ],
    },
    {
      anchor: "https://blogs.tirup.in/rss.xml",
      "service-desc": [
        {
          href: "https://tirup.in/openapi/blogs.json",
          type: "application/json",
        },
      ],
      "service-doc": [
        {
          href: "https://blogs.tirup.in/",
          type: "text/html",
        },
      ],
    },
  ],
}

const BODY = JSON.stringify(CATALOG)

// RFC 9727 Section 4.2: Linkset with the api-catalog profile URI.
const CONTENT_TYPE =
  'application/linkset+json; profile="https://www.rfc-editor.org/info/rfc9727"'

function catalogHeaders() {
  return {
    "Content-Type": CONTENT_TYPE,
    "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    // RFC 9727 Section 3: advertise the catalog link relation.
    Link: '</.well-known/api-catalog>; rel="api-catalog"',
  }
}

export async function GET() {
  return new Response(BODY, { status: 200, headers: catalogHeaders() })
}

export async function HEAD() {
  return new Response(null, { status: 200, headers: catalogHeaders() })
}
