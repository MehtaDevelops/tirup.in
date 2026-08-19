# 0001 - Blog syndication canonicalization

**Status:** proposed
**Date:** 2026-08-19

## Context

`tirup.in/blogs/[slug]` renders copies of articles whose source site is `blogs.tirup.in`. Indexing both copies competes for the same content in search.

## Decision

Keep `tirup.in/blogs` as an indexable writing hub. Mark individual portfolio article copies as `noindex, follow`, canonicalize them to the matching `blogs.tirup.in/[slug]` URL, and omit them from the portfolio sitemap.

## Consequences

Search engines receive one authoritative URL per article while the portfolio retains a useful entry point and internal links to the original work.
