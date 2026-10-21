/**
 * Builds the shadcn-compatible component registry from source.
 *
 * Reads each component's single-file source and emits:
 *   generated/registry/<name>.json  : registry item the shadcn CLI installs
 *                                     from (served at
 *                                     tirup.in/components/r/<name>.json by
 *                                     app/components/r/[slug]/route.ts,
 *                                     which forwards browser navigation to
 *                                     the human-readable source viewer)
 *
 * The JSONs deliberately live OUTSIDE public/: a static copy would shadow
 * the route handler and every URL would become a raw-dump page for humans
 * again. Run automatically on `prebuild`, or manually with
 * `node scripts/build-registry.mjs`.
 * Source of truth is components/library/. Never hand-edit generated/registry.
 *
 * Install flow this enables (in the user's project, easiest first):
 *   1. npx shadcn@latest add https://tirup.in/components/r/liquid-ascii.json
 *   2. ...or register once: npx shadcn@latest registry add @mehta=https://tirup.in/components/r/{name}.json
 *      then npx shadcn@latest add @mehta/liquid-ascii
 *
 * Keep BASE_URL / author in sync with lib/components-site.ts.
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")
const outDir = join(root, "generated", "registry")

const BASE_URL = "https://tirup.in/components"

const ITEMS = [
  {
    name: "liquid-ascii",
    source: "components/library/liquid-ascii-demo.tsx",
    target: "components/liquid-ascii.tsx",
    type: "registry:component",
    title: "Liquid Ascii",
    description: "FLIP fluid simulation rendered as ASCII characters.",
    docs: `${BASE_URL}/liquid-ascii`,
  },
  {
    name: "song-bubble",
    source: "components/library/song-bubble.tsx",
    target: "components/song-bubble.tsx",
    type: "registry:component",
    title: "Song Bubble",
    description:
      "Spotify-style floating mini player: an orb that springs into a draggable song card with a real YouTube engine inside.",
    docs: `${BASE_URL}/song-bubble`,
  },
]

mkdirSync(outDir, { recursive: true })

const index = []

for (const item of ITEMS) {
  let content = readFileSync(join(root, item.source), "utf8")
  content = content.replace(/\r\n/g, "\n")
  if (!content.endsWith("\n")) content += "\n"
  if (!content.includes("export function") && !content.includes("export default")) {
    throw new Error(`${item.source} has no export, so the registry item would be broken`)
  }
  const registryItem = {
    $schema: "https://ui.shadcn.com/schema/registry-item.json",
    name: item.name,
    type: item.type,
    title: item.title,
    description: item.description,
    docs: item.docs,
    author: "tirup.in/components <contact@tirup.in>",
    dependencies: [],
    devDependencies: [],
    registryDependencies: [],
    files: [
      {
        path: item.target,
        content,
        type: item.type,
        target: item.target,
      },
    ],
  }
  const out = join(outDir, `${item.name}.json`)
  writeFileSync(out, JSON.stringify(registryItem, null, 2) + "\n")
  console.log(`registry: ${item.name}.json (${content.length} chars of source embedded)`)
  index.push({
    name: item.name,
    title: item.title,
    description: item.description,
    docs: item.docs,
    file: `${item.name}.json`,
  })
}

writeFileSync(join(outDir, "registry.json"), JSON.stringify(index, null, 2) + "\n")
console.log(`registry: registry.json (${index.length} items)`)
