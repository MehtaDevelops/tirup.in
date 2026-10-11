/* eslint-disable @next/next/no-img-element -- next/og ImageResponse cannot use next/image */
import fs from "fs";
import path from "path";

/* Shared OG building blocks for tirup.in: flat paper-white editorial cards.
   Matches the site's light theme exactly (paper #fdfdfc, ink #111111).
   No gradients, no glows, no glass — print-minimal. */

export const OG_SIZE = { width: 1200, height: 630 };

type OgFont = {
  name: string;
  data: ArrayBuffer;
  weight: 400 | 500 | 600;
  style: "normal" | "italic";
};

let cachedFonts: OgFont[] | null = null;

/* Satori cannot parse woff2 (brotli). Plain css2 fetch from Node sends a
   non-browser UA, so Google answers with truetype URLs — exactly what we need. */
async function googleFontTTF(family: string, weight: number, italic: boolean): Promise<ArrayBuffer> {
  const axis = italic ? `ital,wght@1,${weight}` : `wght@${weight}`;
  const res = await fetch(
    `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:${axis}&display=swap`
  );
  if (!res.ok) throw new Error(`OG font CSS failed: ${res.status}`);
  const css = await res.text();
  const blocks = css.split("@font-face").slice(1);
  const latin =
    [...blocks].reverse().find((b) => {
      const comment = b.match(/\/\*\s*([\w-]+)\s*\*\//)?.[1];
      return comment === "latin";
    }) ?? blocks[blocks.length - 1];
  const url =
    latin?.match(/url\((https:[^)]+?\.ttf)\)/)?.[1] ?? latin?.match(/url\((https:[^)]+)\)/)?.[1];
  if (!url) throw new Error(`OG font not found: ${family} ${weight}`);
  const font = await fetch(url);
  if (!font.ok) throw new Error(`OG font download failed: ${font.status}`);
  return await font.arrayBuffer();
}

export async function loadOgFonts(): Promise<OgFont[]> {
  if (cachedFonts) return cachedFonts;
  const [inter400, inter600, playfairItalic] = await Promise.all([
    googleFontTTF("Inter", 400, false),
    googleFontTTF("Inter", 600, false),
    googleFontTTF("Playfair Display", 500, true),
  ]);
  cachedFonts = [
    { name: "Inter", data: inter400, weight: 400, style: "normal" },
    { name: "Inter", data: inter600, weight: 600, style: "normal" },
    { name: "Playfair Display", data: playfairItalic, weight: 500, style: "italic" },
  ];
  return cachedFonts;
}

let cachedAvatar: string | null = null;

/** Default pixel face as a data URL. PNG only: Satori cannot decode webp. */
export function getOgAvatar(): string {
  if (cachedAvatar !== null) return cachedAvatar;
  try {
    const p = path.join(process.cwd(), "public", "og-avatar.png");
    cachedAvatar = `data:image/png;base64,${fs.readFileSync(p).toString("base64")}`;
  } catch {
    cachedAvatar = "";
  }
  return cachedAvatar;
}

export function ogTitleSize(title: string): string {
  if (title.length > 64) return "54px";
  if (title.length > 38) return "62px";
  return "80px";
}

export interface OgShellProps {
  kicker: string;
  title: string;
  excerpt?: string;
  meta?: string[];
  section?: string;
  domain?: string;
}

const INK = "#111111";

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
        backgroundColor: "#fdfdfc",
        padding: "26px",
        fontFamily: "Inter, sans-serif",
        position: "relative",
      }}
    >
      {/* Double hairline frame */}
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          border: "1.5px solid rgba(17, 17, 17, 0.85)",
          borderRadius: "20px",
          backgroundColor: "#fdfdfc",
          padding: "34px 42px",
        }}
      >
        {/* Middle: headline + hero avatar (top row removed — breathing room up top) */}
        <div style={{ display: "flex", alignItems: "center", width: "100%", margin: "6px 0 16px 0", flex: 1 }}>
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "flex-start", flex: "1 1 0", minWidth: 0, paddingRight: "36px", paddingTop: "8px" }}>
            <div
              style={{
                fontFamily: '"Playfair Display", serif',
                fontStyle: "italic",
                fontWeight: 500,
                fontSize: ogTitleSize(title),
                color: INK,
                lineHeight: 1.08,
                letterSpacing: "-0.01em",
                display: "-webkit-box",
                WebkitLineClamp: 3,
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
                  color: "rgba(17, 17, 17, 0.6)",
                  marginTop: "14px",
                  display: "-webkit-box",
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {excerpt}
              </div>
            )}
          </div>
          {avatar && (
            <div
              style={{
                width: "330px",
                height: "360px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#efede7",
                border: "1.5px solid rgba(17, 17, 17, 0.8)",
                borderRadius: "18px",
                overflow: "hidden",
                flexShrink: 0,
              }}
            >
              <img
                src={avatar}
                alt=""
                style={{ width: "330px", height: "330px", objectFit: "cover", objectPosition: "50% 20%", transform: "translateY(50px)" }}
              />
            </div>
          )}
        </div>

        {/* Bottom meta */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "1px solid rgba(17, 17, 17, 0.14)",
            paddingTop: "18px",
            width: "100%",
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            {section && (
              <span style={{ display: "flex", alignItems: "center" }}>
                <span style={{ fontSize: "15px", fontWeight: 600, color: "rgba(17, 17, 17, 0.8)" }}>{section}</span>
                {meta.length > 0 && (
                  <span style={{ margin: "0 10px", color: "rgba(17, 17, 17, 0.25)", fontSize: "15px" }}>/</span>
                )}
              </span>
            )}
            {meta.map((m, i) => (
              <span key={i} style={{ display: "flex", alignItems: "center" }}>
                {i > 0 && (
                  <span style={{ margin: "0 10px", color: "rgba(17, 17, 17, 0.25)", fontSize: "15px" }}>/</span>
                )}
                <span style={{ fontSize: "15px", color: "rgba(17, 17, 17, 0.55)" }}>{m}</span>
              </span>
            ))}
          </div>
          <span style={{ fontSize: "16px", fontWeight: 600, color: "rgba(17, 17, 17, 0.8)", letterSpacing: "0.01em" }}>
            {domain} ↗
          </span>
        </div>
      </div>
    </div>
  );
}
