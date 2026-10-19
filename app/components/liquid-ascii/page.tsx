import type { Metadata } from "next"
import { Courier_Prime, Inter, Space_Mono, VT323 } from "next/font/google"
import { LiquidAsciiDoc } from "./doc-client"
import { JsonLd } from "@/components/library/json-ld"
import { SITE, AUTHOR, installCommand } from "@/lib/components-site"

// Glyph-face picker: faces are self-hosted here via next/font, so every
// visitor gets exactly the face they pick and the canvas can never silently
// fall back to something else. The woff2 bytes only download when a face is
// first selected; shipping a page costs four @font-face declarations, not
// four fonts. Faces were chosen for visual contrast on the glyph grid:
// strict mono default, proportional sans, quirky mono, pixel, typewriter.
// JetBrains Mono (the default) is already the site-wide face.
const inter = Inter({ subsets: ["latin"] })
const space = Space_Mono({ weight: "400", subsets: ["latin"] })
const vt = VT323({ weight: "400", subsets: ["latin"] })
// Registered at 700 only: Courier Prime's 400 strokes wash out on the glyph
// grid, and a family with a single face makes even a plain
// `<size>px <family>` canvas request resolve to the bold cut.
const courier = Courier_Prime({
  weight: "700",
  subsets: ["latin"],
})

// family: "" means "the host page's own mono", resolved by the component.
const FONTS = [
  { label: "JetBrains", family: "" },
  { label: "Inter", family: inter.style.fontFamily },
  { label: "Space Mono", family: space.style.fontFamily },
  { label: "VT323", family: vt.style.fontFamily },
  { label: "Courier", family: courier.style.fontFamily },
]

export const metadata: Metadata = {
  title: "Liquid Ascii — Free React ASCII Fluid Simulation Component",
  description:
    "Liquid Ascii (ascii liquid) is a free React component that renders a real-time FLIP fluid simulation as ASCII text. Live playground, props, install command, and copy-paste code. Zero dependencies, MIT licensed.",
  keywords: [
    "liquid ascii",
    "ascii liquid",
    "liquid ascii react",
    "liquid ascii component",
    "ascii liquid effect",
    "ascii fluid simulation",
    "ascii fluid react component",
    "ascii water animation",
    "ascii art fluid animation",
    "ascii art component",
    "text fluid simulation",
    "react ascii component",
    "shadcn ascii component",
    "single file react component",
    "zero dependency react component",
    "FLIP fluid ASCII",
  ],
  alternates: { canonical: "/components/liquid-ascii" },
  openGraph: {
    title: "Liquid Ascii | Tirup Mehta",
    description:
      "A free React component that renders a real-time FLIP fluid simulation as ASCII text. Try it live, then copy the code.",
    type: "website",
    url: "/components/liquid-ascii",
  },
  twitter: {
    title: "Liquid Ascii — Free React ASCII Fluid Simulation Component",
    description:
      "A free React component that renders a real-time FLIP fluid simulation as ASCII text. Try it live, then copy the code.",
  },
}

const FAQ = [
  {
    q: "What is Liquid Ascii?",
    a: "Liquid Ascii is a free, open-source React component that renders a real-time FLIP fluid simulation as ASCII text on a canvas. Move your cursor through it and the liquid splashes in characters. It has zero dependencies and ships as a single file you own forever.",
  },
  {
    q: "How do I install Liquid Ascii?",
    a: `Run ${installCommand("liquid-ascii")} in your Next.js or React project, then render the component inside any sized container. It adapts to light and dark mode automatically.`,
  },
  {
    q: "Is Liquid Ascii free for commercial use?",
    a: "Yes. It is MIT licensed, free forever. Copy it, modify it, ship it in commercial projects. No keys, no lock-in, no paid core.",
  },
  {
    q: "Does Liquid Ascii work on mobile?",
    a: "It is desktop-first: the cursor interaction needs a precise pointer. Gate mounting behind a pointer or screen-size check and skip it on small screens. It respects prefers-reduced-motion with a still frame.",
  },
  {
    q: "Can I change the glyph font?",
    a: 'Yes, any font you want. Pass fontFamily={"Inter"} and the component renders any CSS font face your app loads or the system has, monospace or not (proportional faces look great as fluid ink). Load the face in your own app however you like: next/font, a stylesheet link, or a system font. The component renders whatever family string it receives and falls back to your system mono if the face is missing. On this page the Customise panel bundles self-hosted faces so the picker renders identically for everyone.',
  },
  {
    q: "How does the ASCII liquid effect actually work?",
    a: "Up to 20,000 particles carry the fluid on a staggered MAC grid. Each frame runs gravity, a bilinear splat to grid faces, a 30-iteration pressure solve that keeps volume, and a PIC/FLIP blend back to particles. Density is binned per cell and rendered as glyphs: heavy characters on the surface, spray above it, depth-faded characters below.",
  },
]

export default function LiquidAsciiPage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "SoftwareSourceCode",
              "@id": `${SITE.url}/liquid-ascii#software`,
              name: "Liquid Ascii",
              description:
                "Free React component (ascii liquid effect) that renders a real-time FLIP fluid simulation as ASCII text. Zero dependencies, MIT licensed.",
              url: `${SITE.url}/liquid-ascii`,
              programmingLanguage: "TypeScript",
              runtimePlatform: "React",
              applicationCategory: "DeveloperApplication",
              operatingSystem: "Web",
              keywords: [
                "liquid ascii",
                "ascii liquid",
                "ascii fluid simulation",
                "ascii art fluid animation",
                "text fluid simulation",
                "react ascii component",
                "shadcn component",
                "FLIP fluid",
              ],
              codeRepository: "https://github.com/MehtaDevelops/tirup.in",
              license: "https://opensource.org/licenses/MIT",
              isAccessibleForFree: true,
              author: {
                "@type": "Person",
                "@id": "https://tirup.in/about",
                name: AUTHOR.name,
                url: AUTHOR.url,
              },
            },
            {
              "@type": "FAQPage",
              mainEntity: FAQ.map(({ q, a }) => ({
                "@type": "Question",
                name: q,
                acceptedAnswer: { "@type": "Answer", text: a },
              })),
            },
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Home", item: SITE.url },
                {
                  "@type": "ListItem",
                  position: 2,
                  name: "All components",
                  item: `${SITE.url}/all`,
                },
                {
                  "@type": "ListItem",
                  position: 3,
                  name: "Liquid Ascii",
                  item: `${SITE.url}/liquid-ascii`,
                },
              ],
            },
          ],
        }}
      />
      <LiquidAsciiDoc faqs={FAQ} fonts={FONTS} />
    </>
  )
}
