import type React from "react"
import type { Metadata } from "next"
import { Inter, Playfair_Display } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import "./globals.css"
import PageTransition from "@/components/page-transition"
import GoogleAnalytics, { GoogleTagManagerNoscript } from "@/components/analytics"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
  style: ["normal", "italic"],
})

export const metadata: Metadata = {
  metadataBase: new URL("https://tirup.in"),
  title: {
    default: "Tirup Mehta | Designer & Developer",
    template: "%s | Tirup Mehta"
  },
  description:
    "Portfolio of Tirup Mehta, a front-end web developer, cybersecurity enthusiast, and UI/UX designer from Gujarat, India.",
  keywords: [
    "Tirup Mehta",
    "Tirup",
    "Mehta",
    "Frontend Developer",
    "UI/UX Designer",
    "Cybersecurity Specialist",
    "Gujarat India",
    "React Developer",
    "Next.js Portfolio",
    "Web Security"
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
    title: "Tirup Mehta | Designer & Developer",
    description: "Portfolio of Tirup Mehta, a front-end web developer, cybersecurity enthusiast, and UI/UX designer from Gujarat, India.",
    siteName: "Tirup Mehta Portfolio",
    images: [
      {
        url: "/profile.png",
        width: 512,
        height: 512,
        alt: "Tirup Mehta"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Tirup Mehta | Designer & Developer",
    description: "Portfolio of Tirup Mehta, a front-end web developer, cybersecurity enthusiast, and UI/UX designer from Gujarat, India.",
    creator: "@TirupMehta",
    images: ["/profile.png"]
  },
  alternates: {
    canonical: "https://tirup.in"
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || ""
  }
}

const personSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "Tirup Mehta",
  "url": "https://tirup.in",
  "image": "https://tirup.in/profile.png",
  "description": "Portfolio of Tirup Mehta, a front-end web developer, cybersecurity enthusiast, and UI/UX designer from Gujarat, India.",
  "jobTitle": "Frontend Developer & UI/UX Designer",
  "sameAs": [
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
  "description": "Portfolio of Tirup Mehta, a front-end web developer, cybersecurity enthusiast, and UI/UX designer.",
  "author": {
    "@type": "Person",
    "name": "Tirup Mehta"
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="scroll-smooth no-transitions" data-scroll-behavior="smooth" suppressHydrationWarning>
      <GoogleAnalytics />

      <body className={`${inter.variable} ${playfair.variable} font-sans antialiased bg-white dark:bg-[#0a0a0a] text-black dark:text-white transition-colors duration-300`} suppressHydrationWarning>
        {/* JSON-LD Schemas for Search Engines */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />

        {/* Theme init — prevents flash of wrong theme */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme:dark)').matches)){document.documentElement.classList.add('dark')}else{document.documentElement.classList.remove('dark')}}catch(e){}})()`,
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
