import { ImageResponse } from "next/og"
import { SITE } from "@/lib/components-site"

export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: 96,
        background: "#090a0d",
        color: "#f4f4f5",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 32 }}>
        <div style={{ width: 20, height: 20, borderRadius: 9999, background: "#ff6b6b", opacity: 0.85 }} />
        <div style={{ width: 20, height: 20, borderRadius: 9999, background: "#feca57", opacity: 0.85 }} />
        <div style={{ width: 20, height: 20, borderRadius: 9999, background: "#1dd1a1", opacity: 0.85 }} />
        <div style={{ fontSize: 28, opacity: 0.7, marginLeft: 8 }}>{SITE.name}</div>
      </div>
      <div style={{ fontSize: 76, fontWeight: 300, letterSpacing: -2, lineHeight: 1.05 }}>
        Unique components I built myself.
      </div>
      <div style={{ fontSize: 28, opacity: 0.6, marginTop: 24 }}>
        Live playgrounds · Zero dependencies · Copy the code, own it forever.
      </div>
    </div>,
    { ...size }
  )
}
