import type React from "react"
import type { Metadata } from "next"
import { Inter, Playfair_Display } from "next/font/google"
import Script from "next/script"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import PageTransition from "@/components/page-transition"

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
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="scroll-smooth no-transitions" data-scroll-behavior="smooth" suppressHydrationWarning>
      {/* Google Tag Manager */}
      <Script id="google-tag-manager" strategy="afterInteractive">
        {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
        new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
        j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
        'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
        })(window,document,'script','dataLayer','GTM-N37XXZ2B');`}
      </Script>
      {/* End Google Tag Manager */}

      {/* Google Analytics (gtag.js) */}
      <Script
        async
        src="https://www.googletagmanager.com/gtag/js?id=G-BKS7VBCPH5"
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'G-BKS7VBCPH5');`}
      </Script>
      {/* End Google Analytics */}

      <body className={`${inter.variable} ${playfair.variable} font-sans antialiased bg-white dark:bg-[#0a0a0a] text-black dark:text-white transition-colors duration-300`} suppressHydrationWarning>
        {/* Theme init — prevents flash of wrong theme */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme:dark)').matches)){document.documentElement.classList.add('dark')}else{document.documentElement.classList.remove('dark')}}catch(e){}})()`,
          }}
        />
        {/* Google Tag Manager (noscript) */}
        <noscript
          dangerouslySetInnerHTML={{
            __html: `<iframe src="https://www.googletagmanager.com/ns.html?id=GTM-N37XXZ2B" height="0" width="0" style="display:none;visibility:hidden"></iframe>`,
          }}
        />
        {/* End Google Tag Manager (noscript) */}

        <PageTransition>{children}</PageTransition>
        <Analytics />
      </body>
    </html>
  )
}

