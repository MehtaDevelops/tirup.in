/* eslint-disable @next/next/no-img-element -- next/og ImageResponse cannot use next/image */
import fs from "fs";
import path from "path";

/* Shared premium OG building blocks: brand fonts, avatar, and the card shell.
   Every opengraph-image / twitter-image route on tirup.in composes these so
   all share previews feel like one system: dark, minimal, serif-led. */

export const OG_SIZE = { width: 1200, height: 630 };

type OgFont = {
  name: string;
  data: ArrayBuffer;
  weight: 400 | 500 | 600;
  style: "normal" | "italic";
};

let cachedFonts: OgFont[] | null = null;

async function fetchFont(url: string): Promise<ArrayBuffer> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`OG font fetch failed: ${res.status}`);
  return await res.arrayBuffer();
}

export async function loadOgFonts(): Promise<OgFont[]> {
  if (cachedFonts) return cachedFonts;
  const [inter400, inter600, playfairItalic] = await Promise.all([
    fetchFont("https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-400-normal.woff2"),
    fetchFont("https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-600-normal.woff2"),
    fetchFont("https://cdn.jsdelivr.net/fontsource/fonts/playfair-display@latest/latin-500-italic.woff2"),
  ]);
  cachedFonts = [
    { name: "Inter", data: inter400, weight: 400, style: "normal" },
    { name: "Inter", data: inter600, weight: 600, style: "normal" },
    { name: "Playfair Display", data: playfairItalic, weight: 500, style: "italic" },
  ];
  return cachedFonts;
}

let cachedAvatar: string | null = null;

/** Default pixel face as a data URL (transparent webp on the dark card). */
export function getOgAvatar(): string {
  if (cachedAvatar !== null) return cachedAvatar;
  try {
    const p = path.join(process.cwd(), "public", "expressions", "19-adjusting-glasses.webp");
    cachedAvatar = `data:image/webp;base64,${fs.readFileSync(p).toString("base64")}`;
  } catch {
    cachedAvatar = "";
  }
  return cachedAvatar;
}

export function ogTitleSize(title: string): string {
  if (title.length > 72) return "52px";
  if (title.length > 44) return "62px";
  return "76px";
}

export interface OgShellProps {
  kicker: string;
  title: string;
  excerpt?: string;
  meta?: string[];
  section?: string;
  domain?: string;
}

export function OgShell({
  kicker,
  title,
  excerpt,
  meta = [],
  section,
  domain = "tirup.in",
}: OgShellProps) {
  const avatar = getOgAvatar();
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#0a0a0b",
        padding: "28px",
        fontFamily: 'Inter, sans-serif',
        position: "relative",
      }}
    >
      {/* Ambient glows */}
      <div
        style={{
          position: "absolute",
          top: "-110px",
          right: "-90px",
          width: "620px",
          height: "620px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(129, 140, 248, 0.13) 0%, transparent 70%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-130px",
          left: "-70px",
          width: "520px",
          height: "520px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(56, 189, 248, 0.07) 0%, transparent 70%)",
        }}
      />

      {/* Hairline frame */}
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          border: "1px solid rgba(255, 255, 255, 0.12)",
          borderRadius: "24px",
          backgroundColor: "rgba(13, 14, 17, 0.88)",
          padding: "36px 44px",
        }}
      >
        {/* Top row: identity + section */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            {avatar && (
              <img
                src={avatar}
                alt=""
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  marginRight: "14px",
                  border: "1px solid rgba(255, 255, 255, 0.22)",
                  backgroundColor: "#101013",
                }}
              />
            )}
            <span style={{ fontSize: "19px", fontWeight: 600, color: "#fafafa", letterSpacing: "-0.01em" }}>
              Tirup Mehta
            </span>
            {section && (
              <span style={{ display: "flex", alignItems: "center" }}>
                <span style={{ margin: "0 12px", fontSize: "18px", color: "rgba(255, 255, 255, 0.28)" }}>›</span>
                <span style={{ fontSize: "18px", color: "rgba(255, 255, 255, 0.55)" }}>{section}</span>
              </span>
            )}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "9999px",
              padding: "6px 14px",
              backgroundColor: "rgba(255, 255, 255, 0.04)",
            }}
          >
            <div style={{ width: "7px", height: "7px", borderRadius: "50%", backgroundColor: "#34d399", marginRight: "8px" }} />
            <span style={{ fontSize: "12px", fontWeight: 600, letterSpacing: "0.14em", color: "rgba(244, 244, 245, 0.72)" }}>
              {kicker}
            </span>
          </div>
        </div>

        {/* Headline block */}
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", margin: "20px 0" }}>
          <div
            style={{
              fontFamily: '"Playfair Display", serif',
              fontStyle: "italic",
              fontWeight: 500,
              fontSize: ogTitleSize(title),
              color: "#ffffff",
              lineHeight: 1.12,
              letterSpacing: "-0.01em",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {title}
          </div>
          {excerpt && (
            <div
              style={{
                fontSize: "21px",
                lineHeight: 1.45,
                color: "rgba(244, 244, 245, 0.62)",
                marginTop: "14px",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {excerpt}
            </div>
          )}
        </div>

        {/* Bottom meta */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "1px solid rgba(255, 255, 255, 0.08)",
            paddingTop: "18px",
            width: "100%",
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            {meta.map((m, i) => (
              <span key={i} style={{ display: "flex", alignItems: "center" }}>
                {i > 0 && (
                  <span style={{ margin: "0 10px", color: "rgba(255, 255, 255, 0.2)", fontSize: "15px" }}>/</span>
                )}
                <span style={{ fontSize: "15px", color: "rgba(244, 244, 245, 0.5)" }}>{m}</span>
              </span>
            ))}
          </div>
          <span style={{ fontSize: "16px", fontWeight: 600, color: "rgba(244, 244, 245, 0.78)", letterSpacing: "0.01em" }}>
            {domain} ↗
          </span>
        </div>
      </div>
    </div>
  );
}
