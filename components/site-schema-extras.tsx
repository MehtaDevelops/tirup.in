// Structured data that only matters on the homepage and /about: the blog
// record, the two software projects, and third-party coverage of the author.
// The layout keeps the site-wide identity graph (Person, Organization, WebSite,
// ProfilePage); these entities are referenced from it by @id.
const writingSchema = {
  "@context": "https://schema.org",
  "@type": "Blog",
  "@id": "https://blogs.tirup.in",
  "url": "https://blogs.tirup.in",
  "name": "Tirup Mehta's Engineering Blog",
  "description": "Writing by Tirup Mehta on software engineering, web security, performance, and interface design.",
  "author": {
    "@id": "https://tirup.in/about"
  },
  "publisher": {
    "@id": "https://tirup.in/about"
  }
}

const traceGuardSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "@id": "https://www.npmjs.com/package/trace-guard",
  "name": "trace-guard",
  "alternateName": "Trace Guard",
  "description": "Production-grade behavioral security engine to block AI agents and Vision-Language Model (VLM) bots.",
  "applicationCategory": "SecurityApplication",
  "operatingSystem": "Node.js, Edge Runtime",
  "downloadUrl": "https://www.npmjs.com/package/trace-guard",
  "url": "https://www.npmjs.com/package/trace-guard",
  "sameAs": "https://github.com/tirupmehta/trace-guard",
  "softwareVersion": "3.7.0",
  "programmingLanguage": ["TypeScript", "JavaScript"],
  "author": {
    "@id": "https://tirup.in/about"
  },
  "creator": {
    "@id": "https://tirup.in/about"
  },
  "offers": {
    "@type": "Offer",
    "price": "0.00",
    "priceCurrency": "USD"
  }
}

const gleanBoxSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "@id": "https://github.com/TirupMehta/GleanBox",
  "name": "GleanBox",
  "description": "Open-source developer utility and data harvesting toolkit for structured intelligence.",
  "applicationCategory": "DeveloperApplication",
  "operatingSystem": "Node.js, Cross-platform",
  "url": "https://github.com/TirupMehta/GleanBox",
  "sameAs": "https://github.com/TirupMehta/GleanBox",
  "programmingLanguage": ["TypeScript", "JavaScript"],
  "author": {
    "@id": "https://tirup.in/about"
  },
  "creator": {
    "@id": "https://tirup.in/about"
  },
  "offers": {
    "@type": "Offer",
    "price": "0.00",
    "priceCurrency": "USD"
  }
}

// Third-party coverage. Kept as structured data (no visible page) so search
// engines and AI agents can corroborate identity without amplifying the source
// article's own ranking. Referenced from personSchema.subjectOf.
const divyaBhaskarCoverage = {
  "@context": "https://schema.org",
  "@type": "NewsArticle",
  "@id": "https://tirup.in/about#coverage-divya-bhaskar",
  "headline": "વૈશ્વિક પ્લેટફોર્મ પર નવી ઓળખ: જૂનાગઢની ડૉ. સુભાષ યુનિ.નો કોમ્પ્યુટર એન્જિનિયરિંગના પ્રથમ વર્ષનો વિદ્યાર્થી ગૂગલ સ્ટુડન્ટ એમ્બેસેડર બન્યો",
  "alternateName": "New identity on a global platform",
  "url": "https://www.divyabhaskar.co.in/local/gujarat/junagadh/news/new-identity-on-a-global-platform-136353831.html",
  "datePublished": "2025-11-07",
  "inLanguage": "gu",
  "about": { "@id": "https://tirup.in/about" },
  "mentions": { "@id": "https://tirup.in/about" },
  "publisher": {
    "@type": "Organization",
    "name": "Divya Bhaskar",
    "url": "https://www.divyabhaskar.co.in"
  }
}

const drSubhashUniversityCoverage = {
  "@context": "https://schema.org",
  "@type": "NewsArticle",
  "@id": "https://tirup.in/about#coverage-dr-subhash-university",
  "headline": "DSU Student Achieves Google Student Ambassador Status: A Win for Computer Engineering and Innovation",
  "url": "https://dsuni.ac.in/dsu-google-student-ambassador-tirup-mehta-gsa-2025/",
  "datePublished": "2025-11-07",
  "inLanguage": "en",
  "about": { "@id": "https://tirup.in/about" },
  "mentions": { "@id": "https://tirup.in/about" },
  "publisher": {
    "@type": "Organization",
    "name": "Dr. Subhash University",
    "url": "https://dsuni.ac.in"
  }
}

const extrasGraph = {
  "@context": "https://schema.org",
  "@graph": [
    writingSchema,
    traceGuardSchema,
    gleanBoxSchema,
    divyaBhaskarCoverage,
    drSubhashUniversityCoverage,
  ],
}

export default function SiteSchemaExtras() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(extrasGraph) }}
    />
  )
}
