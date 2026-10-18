import type { Metadata } from "next"
import { LiquidAsciiDoc } from "./doc-client"
import { JsonLd } from "@/components/library/json-ld"
import { SITE, AUTHOR, installCommand, absoluteUrl } from "@/lib/components-site"

export const metadata: Metadata = {
  title: "Liquid Ascii: ASCII Liquid Fluid Effect for React",
  description:
    "Liquid Ascii (ascii liquid) is a free React component that renders a real-time FLIP fluid simulation as ASCII text. Live playground, props, install command, and copy-paste code. Zero dependencies, MIT licensed.",
  keywords: [
    "ascii liquid",
    "liquid ascii",
    "ascii liquid effect",
    "ascii fluid simulation",
    "ascii art fluid animation",
    "text fluid simulation",
    "react ascii component",
    "shadcn ascii component",
    "FLIP fluid ASCII",
  ],
  alternates: { canonical: absoluteUrl("/liquid-ascii") },
  openGraph: {
    title: "Liquid Ascii: ASCII Liquid Fluid Effect for React",
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
              license: "https://opensource.org/licenses/MIT",
              isAccessibleForFree: true,
              author: {
                "@type": "Person",
                "@id": `${SITE.url}/#person`,
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
      <LiquidAsciiDoc faqs={FAQ} />
    </>
  )
}
