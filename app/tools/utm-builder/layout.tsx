import type { Metadata } from "next"
import type { ReactNode } from "react"

export const metadata: Metadata = {
  title: "UTM Builder",
  description: "Create consistent campaign URLs for Google Analytics attribution.",
  alternates: { canonical: "/tools/utm-builder" },
  openGraph: { url: "/tools/utm-builder" },
}

export default function UtmBuilderLayout({ children }: { children: ReactNode }) {
  return children
}
