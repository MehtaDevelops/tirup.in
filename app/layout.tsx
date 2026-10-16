import type React from "react"
import type { Metadata } from "next"
import { Inter, Playfair_Display, JetBrains_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import "./globals.css"
import PageTransition from "@/components/page-transition"
import AmbientShader from "@/components/ambient-shader"
import GoogleAnalytics, { GoogleTagManagerNoscript } from "@/components/analytics"
import UtmTracker from "@/components/utm-tracker"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
  preload: false,
  style: ["normal", "italic"],
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
})

export const metadata: Metadata = {
  metadataBase: new URL("https://tirup.in"),
  title: {
    default: "Tirup Mehta",
    template: "%s | Tirup Mehta"
  },
  description:
    "Tirup Mehta is a software engineering student building secure, high-performance web interfaces. Frontend, cryptography, and systems security. Based in Gujarat, India.",
  keywords: [
    "Tirup Mehta",
    "Tirup",
    "Mehta",
    "Software Engineer",
    "Frontend Engineer",
    "Cybersecurity Specialist",
    "Cryptography",
    "React Developer",
    "Next.js Portfolio",
    "Web Security",
    "Secure Frontend Architecture",
    "Gujarat India"
  ],
  authors: [{ name: "Tirup Mehta", url: "https://tirup.in" }],
  creator: "Tirup Mehta",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://tirup.in",
    title: "Tirup Mehta",
    description: "Tirup Mehta is a software engineering student building secure, high-performance web interfaces. Frontend, cryptography, and systems security. Based in Gujarat, India.",
    siteName: "Tirup Mehta Portfolio",
    // Share image comes from app/opengraph-image.tsx (per-route files override)
  },
  twitter: {
    card: "summary_large_image",
    title: "Tirup Mehta",
    description: "Tirup Mehta is a software engineering student building secure, high-performance web interfaces. Frontend, cryptography, and systems security. Based in Gujarat, India.",
    creator: "@TirupMehta",
    // Share image comes from app/twitter-image.tsx (per-route files override)
  },
  alternates: {
    canonical: "https://tirup.in"
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || ""
  }
}

const profilePageSchema = {
  "@context": "https://schema.org",
  "@type": "ProfilePage",
  "@id": "https://tirup.in/",
  "url": "https://tirup.in",
  "name": "Tirup Mehta - Profile & Portfolio",
  "description": "Tirup Mehta is a software engineering student building secure, high-performance web interfaces. Frontend, cryptography, and systems security. Based in Gujarat, India.",
  "mainEntity": {
    "@id": "https://tirup.in/about"
  },
  "hasPart": [
    { "@id": "https://tirup.in/#trace-guard" },
    { "@id": "https://tirup.in/#gleanbox" }
  ]
}

const personSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  "@id": "https://tirup.in/about",
  "name": "Tirup Mehta",
  "url": "https://tirup.in",
  "image": "https://tirup.in/profile.png",
  "description": "Tirup Mehta is a software engineering student building secure, high-performance web interfaces. Frontend, cryptography, and systems security. Based in Gujarat, India.",
  "jobTitle": "Student Software Engineer",
  "knowsAbout": [
    "Software Engineering",
    "Computer Science",
    "Frontend Development",
    "Web Security",
    "Cryptography",
    "React (software)",
    "Next.js",
    "TypeScript",
    "UI/UX Design",
    "Information Security"
  ],
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Gujarat",
    "addressCountry": "India"
  },
  "gender": "Male",
  "nationality": {
    "@type": "Country",
    "name": "India"
  },
  "alternateName": [
    "Tirup Jayram Mehta",
    "તિરુપ મહેતા",
    "તિરુપ જયરામ મહેતા"
  ],
  "subjectOf": [
    { "@id": "https://blogs.tirup.in" },
    { "@id": "https://tirup.in/about#coverage-divya-bhaskar" },
    { "@id": "https://tirup.in/about#coverage-dr-subhash-university" }
  ],
  "sameAs": [
    "https://blogs.tirup.in",
    "https://github.com/TirupMehta",
    "https://www.linkedin.com/in/TirupMehta",
    "https://peerlist.io/tirupmehta",
    "https://happenstance.ai/u/tirupmehta",
    "https://x.com/TirupMehta",
    "https://www.kaggle.com/TirupMehta",
    "https://g.dev/Tirup",
    "https://www.cloudskillsboost.google/public_profiles/5de29c1c-84d0-46a5-a4eb-5fa999499184",
    "https://medium.com/@TirupMehta",
    "https://instagram.com/TirupMehta",
    "https://youtube.com/@TirupMehta"
  ]
}

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Tirup Mehta Portfolio",
  "url": "https://tirup.in",
  "description": "Tirup Mehta is a software engineering student building secure, high-performance web interfaces. Frontend, cryptography, and systems security. Based in Gujarat, India.",
  "about": {
    "@id": "https://tirup.in/about"
  },
  "significantLink": "https://blogs.tirup.in",
  "publisher": {
    "@id": "https://tirup.in/about"
  },
  "author": {
    "@id": "https://tirup.in/about"
  }
}

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

const jsonLdGraph = {
  "@context": "https://schema.org",
  "@graph": [
    profilePageSchema,
    personSchema,
    websiteSchema,
    writingSchema,
    traceGuardSchema,
    gleanBoxSchema,
    divyaBhaskarCoverage,
    drSubhashUniversityCoverage
  ]
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="scroll-smooth no-transitions" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body className={`${inter.variable} ${playfair.variable} ${jetbrainsMono.variable} font-sans antialiased bg-[#fdfdfc] dark:bg-[#0a0a0b] text-[#111111] dark:text-[#fafafa] transition-colors duration-300 relative`} suppressHydrationWarning>
        <AmbientShader />
        <GoogleAnalytics />
        <UtmTracker />
        {/* JSON-LD Schemas for Search Engines */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdGraph) }}
        />


        {/* Theme init — prevents flash of wrong theme */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme:dark)').matches)){document.documentElement.classList.add('dark')}else{document.documentElement.classList.remove('dark')}}catch(e){}try{var u=localStorage.getItem('tirup-tint');if(u&&/^#([0-9a-f]{6})$/i.test(u)){u=u.toLowerCase();document.documentElement.style.setProperty('--user',u);document.documentElement.setAttribute('data-tint',u);try{if(!localStorage.getItem('tirup-tint-prev-mode'))localStorage.setItem('tirup-tint-prev-mode',document.documentElement.classList.contains('dark')?'dark':'light')}catch(e){}document.documentElement.classList.remove('dark')}}catch(e){}window.setTimeout(function(){document.documentElement.classList.remove('no-transitions')},100)})()`,
          }}
        />
        <GoogleTagManagerNoscript />

        <PageTransition>{children}</PageTransition>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
