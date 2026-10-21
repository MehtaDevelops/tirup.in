import type { Metadata } from "next"
import SongBubbleDoc from "./doc-client"
import { JsonLd } from "@/components/library/json-ld"
import { SITE, AUTHOR, installCommand } from "@/lib/components-site"

export const metadata: Metadata = {
  title: "Song Bubble — React Floating Mini Player Component",
  description:
    "Song Bubble is a React component that renders a Spotify-style floating mini player with a real YouTube engine inside: an orb that springs into a draggable song card. Live demo, props, install command, and copy-paste code. Zero dependencies, MIT licensed.",
  keywords: [
    "song bubble",
    "floating player react",
    "mini player react component",
    "spotify style player react",
    "youtube iframe player react",
    "youtube postMessage player",
    "react audio player component",
    "floating widget react",
    "draggable player react",
    "podcast player component react",
    "shadcn audio component",
    "single file react component",
    "zero dependency react component",
  ],
  alternates: { canonical: "/components/song-bubble" },
  openGraph: {
    title: "Song Bubble | Tirup Mehta",
    description:
      "A Spotify-style floating mini player with a real YouTube engine. Try it live, then copy the code.",
    type: "website",
    url: "/components/song-bubble",
  },
  twitter: {
    title: "Song Bubble — React Floating Mini Player Component",
    description:
      "A Spotify-style floating mini player with a real YouTube engine. Try it live, then copy the code.",
  },
}

const FAQ = [
  {
    q: "What is Song Bubble?",
    a: "Song Bubble is an open-source React component that floats on your site: a small cover orb that springs into a Spotify-style card with the song title, artist, a full-bleed progress line, transport and volume controls. Audio streams through a hidden YouTube embed driven by the iframe postMessage API, so any YouTube link becomes the song.",
  },
  {
    q: "How do I install Song Bubble?",
    a: `Run ${installCommand("song-bubble")} in your Next.js or React project, mount <SongBubble /> once in your root layout, and open it from anywhere in your app with the exported toggle command. It reads your site's theme tokens and adapts to light and dark automatically.`,
  },
  {
    q: "Can I use Song Bubble in commercial projects?",
    a: "Yes. It is MIT licensed: copy it, modify it, ship it in commercial projects. No keys, no lock-in.",
  },
  {
    q: "Why mount it in the root layout?",
    a: "The player is a fixed overlay with its own audio session. Mounted once at the layout level, client-side navigation never unmounts it: the song keeps playing while visitors move between pages. Per-page mounts would cut the audio every route change.",
  },
  {
    q: "How do I open it from my own UI?",
    a: "The same file exports the store commands the site itself uses: openSongBubble(), closeSongBubble(), and toggleSongBubble(), plus a useSongBubbleOpen() hook if you want to reflect the state. Everything from an easter-egg dot to a navbar button can be an entry point.",
  },
  {
    q: "Does the card respect theme switching mid-session?",
    a: "Yes. Every color is a CSS custom property read at render time (--bg, --fg, --border-color, --text-muted, --text-secondary) with sensible Spotify-dark fallbacks. Flip your theme or tint while a song plays and the card restyles in place without dropping the audio.",
  },
  {
    q: "How does the YouTube engine actually work?",
    a: "A hidden 320x180 iframe parks offscreen to keep the embed alive, commands are buffered until the widget is ready (some embed boots crash silently if hammered too early), and a short 'listening' handshake poll wakes boots that only start broadcasting once addressed. Metadata and artwork come from YouTube's oEmbed endpoint.",
  },
]

export default function SongBubblePage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "SoftwareSourceCode",
              "@id": `${SITE.url}/song-bubble#software`,
              name: "Song Bubble",
              description:
                "React component that renders a Spotify-style floating mini player with a real YouTube engine inside. Zero dependencies, MIT licensed.",
              url: `${SITE.url}/song-bubble`,
              programmingLanguage: "TypeScript",
              runtimePlatform: "React",
              applicationCategory: "DeveloperApplication",
              operatingSystem: "Web",
              keywords: [
                "song bubble",
                "floating player react",
                "mini player react component",
                "spotify style player react",
                "youtube iframe player react",
                "react audio player component",
                "shadcn component",
              ],
              codeRepository: "https://github.com/MehtaDevelops/tirup.in",
              license: "https://opensource.org/licenses/MIT",
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
                  name: "Song Bubble",
                  item: `${SITE.url}/song-bubble`,
                },
              ],
            },
          ],
        }}
      />
      <SongBubbleDoc faqs={FAQ} />
    </>
  )
}
