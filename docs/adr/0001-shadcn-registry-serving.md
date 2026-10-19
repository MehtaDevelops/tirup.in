# 0001 - Serve shadcn registry items through a route handler with audience split

**Status:** accepted
**Date:** 2026-10-19
**Spec:** none
**Deciders:** Tirup Mehta (with AI-assisted session)

## Context

The components library at tirup.in/components publishes shadcn-compatible
registry items that the shadcn CLI installs from /components/r/<name>.json.
For a long time these were plain static files under public/components/r/.

That has two problems:

1. Any static file shadows the app route at the same path, so no runtime
   logic (audience detection, negotiation) can ever run for that URL.
2. The file is a large JSON whose embedded source strings are unreadable
   for a human: a browser shows a wall of escaped \n and \u003C. The CLI,
   meanwhile, needs those exact bytes. One URL, two opposite needs.

## Decision

- scripts/build-registry.mjs emits each item into generated/registry/
  (not public/), on `prebuild` or manually via node. Files are committed.
- app/components/r/[slug]/route.ts serves /components/r/<name>.json by
  reading the generated files at request time.
- The audience is split on the sec-fetch-dest header: programmatic fetches
  (the shadcn CLI, scripts) always receive the exact raw JSON bytes, no
  redirect. Real browser navigations (sec-fetch-dest: document) get a 307
  to /components/r/<name>/source.
- /components/r/<name>/source is a statically prerendered viewer page that
  shows the item description, install commands, metadata, and every file's
  real source through the site's own CodeDemo component, plus a "Copy raw
  JSON" affordance.
- The machine index generated/registry/registry.json carries no files
  array, so it is served raw to every client, always.

## Consequences

- Install URLs are unchanged and byte-stable: npx shadcn add
  https://tirup.in/components/r/liquid-ascii.json keeps working exactly as
  before. Localhosts, forks, curl, and the CLI all keep getting raw JSON.
- Humans opening the URL get the branded source viewer instead of escapes.
- generated/registry/ must remain committed: the route and viewer read it
  from disk at runtime, and local dev has no build step that regenerates it.
- New components need only a rerun of scripts/build-registry.mjs; the
  viewer prerenders one page per generated item automatically.
- Under very old browsers that omit sec-fetch-dest, the fallback is the
  raw JSON: the safe default for a machine-facing endpoint.

## Alternatives Considered

- Keep static file in public/: simplest, satisfies only the CLI; humans
  keep the escape wall, and no negotiation is possible since static assets
  shadow route handlers.
- Redirect browser navigations to the component docs page instead of a
  dedicated /source viewer: less build cost, but loses the file-by-file
  registry view (exact target paths, embedded source as installed).
