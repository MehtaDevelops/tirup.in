import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import PageTransition from "@/components/page-transition"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Tirup Mehta | Designer & Developer",
  description:
    "Portfolio of Tirup Mehta, a front-end web developer, cybersecurity enthusiast, and UI/UX designer from Gujarat, India.",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.variable} font-sans bg-white text-black antialiased`}>
        <PageTransition>{children}</PageTransition>
      </body>
    </html>
  )
}
