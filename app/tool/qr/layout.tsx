import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "QR Code Studio",
  description:
    "Pro QR code and vector studio. Generate print-ready vector SVGs, Wi-Fi credentials, vCards, custom module shapes, frames, and high-resolution QR codes. 100% client-side and private.",
  alternates: { canonical: "/tool/qr" },
  robots: { index: true, follow: true },
}

export default function QrStudioLayout({ children }: { children: React.ReactNode }) {
  return children
}
