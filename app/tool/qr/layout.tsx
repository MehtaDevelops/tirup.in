import type { Metadata } from "next"
import type { ReactNode } from "react"

export const metadata: Metadata = {
  title: "QR Studio",
  description: "Generate customizable QR codes for links, Wi-Fi, contact details, and more.",
  alternates: { canonical: "/tool/qr" },
  openGraph: { url: "/tool/qr" },
}

export default function QrStudioLayout({ children }: { children: ReactNode }) {
  return children
}
