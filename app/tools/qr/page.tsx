import { permanentRedirect } from "next/navigation"

export default function LegacyQrRoute() {
  permanentRedirect("/tool/qr")
}
