# 0002 - No hover background washes on links, rows, or the nav

**Status:** accepted
**Date:** 2026-10-19
**Spec:** none
**Deciders:** Tirup Mehta (with AI-assisted session)

## Context

Commit 305fc56 ("feat: high-polish UI - sliding nav pill, sibling dimming
on lists, row-highlight hovers, calibrated press states, spring
transitions") introduced two effects the site owner immediately rejected:

1. A JavaScript-positioned background pill behind the header nav links
   that this repo then carried the in-fix detail of; on hover and on the
   active route it painted a full rectangle (`bg-black/[0.045]`) behind
   "Home", "Work", "Skills", "Writing".
2. Full-row hover washes on list links: `hover:bg-black/[0.025] dark:
   hover:bg-white/[0.025]` on the Work project rows, the Writing article
   rows, and the GitHub dual-account directory rows.

Both appeared as flat gray rectangles behind content the owner had chosen
to keep visually flat, and both read as broken styling rather than polish.

## Decision

- Links, list rows, and nav items never take a background-color change on
  hover (or on active-route) at any opacity. Not black/5, not black/[0.025],
  not color-mix, not a CSS custom property. Hover and active are expressed
  through color, opacity, underline, or arrow motion only.
- No positioned background elements (pills, washes, highlight bars) may be
  rendered behind nav links. JS-positioned highlight followers are banned.
- Button-shaped controls (outline pills, dismiss buttons, toolbar buttons)
  may keep a small button-local hover wash; this rule covers links and
  list rows, not form-like controls.
- Every list row keeps `group` so inner `group-hover:` text colors remain
  the hover affordance.

## Consequences

- `hover:bg-*` and `active:bg-*` classes must not appear on hoverable
  links, list-representing `<Link>`/`<a>` elements, or in the header nav.
- The nav pill machinery (positionPill, ResizeObserver follower,
  mouse-tracking state) was removed; NavLinks renders plain links.
- This document is the standing rule for all future AI-assisted sessions:
  do not reintroduce row or nav background effects, even as a "high-polish"
  experiment.
