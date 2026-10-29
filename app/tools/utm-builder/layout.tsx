import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "UTM Builder",
  description:
    "GA4 campaign URL generator and attribution studio. Build UTM-tagged links with live channel grouping diagnostics and 12-channel bulk exports.",
  alternates: { canonical: "/tools/utm-builder" },
  robots: { index: true, follow: true },
}

export default function UtmBuilderLayout({ children }: { children: React.ReactNode }) {
  return children
}
