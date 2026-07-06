# Improvement backlog

Remaining findings from the July 2026 project review, ordered roughly by
value-for-effort. The quick wins from that review (broken detail-page
back-links, CI workflow, stale docs, `setTimeout`-in-render fix, dead
dependency/image cleanup) already landed — this is what's left.

## High priority

### 1. Convert the list pages to server components with a filter island

`/beyblades`, `/bladers`, and `/watchlist` are `"use client"` top-to-bottom
solely because of filter-chip `useState`. Consequences:

- None of them can export `metadata`, so all three serve the identical
  generic `<title>` from `app/layout.tsx`.
- Their static hero / stats / anatomy / about markup — plus the full data
  arrays — ship as client JS.

Fix: keep the static sections server-rendered and extract the filter chips +
grid into a small co-located client component (e.g.
`app/beyblades/_components/CollectionGrid.tsx`). Fixes SEO titles and bundle
size in one move, and the extraction also relieves line-cap pressure on
`app/beyblades/page.tsx` (~519 effective lines).

### 2. Basic SEO plumbing

All routes are statically enumerable, so this is nearly free:

- `app/sitemap.ts` + `app/robots.ts` built from the same data the
  `generateStaticParams` functions use.
- `metadataBase` + `openGraph`/`twitter` blocks in `app/layout.tsx`.
- `generateMetadata` on the dynamic detail routes (`/bey/[id]`,
  `/blader/[id]`, `/part/[type]/[id]`, `/watchlist/[category]/[id]`).
- An `opengraph-image` (static is fine to start).

### 3. Extract a shared lib for the sync scripts

`readJson`, `writeJson`, `fetchJson`, `downloadFile` are copy-pasted into all
four sync scripts; `extractInfobox` (~65 lines), `pickFirst`,
`extractImageFilename`, `findFirstImageInWikitext`, `resolveImageUrl`, and
`fetchPage` are byte-identical across the three Fandom scripts. Extract
`scripts/lib/wiki.mjs` + `scripts/lib/io.mjs` (~300 duplicated lines
removed). While in there:

- Add the Jikan-style rate limiting from `sync-anime.mjs` (1.1s between
  requests) to the Fandom scripts — they currently fire unthrottled, and
  `sync-parts.mjs`'s image-fill pass loops all 50 bey pages back-to-back.
- Add retry with backoff on transient 429/5xx.
- Make JSON writes atomic (write temp file, then `rename`).
- Exit non-zero (or support `--strict`) when *any* entry fails — today a
  partial sync exits 0 and the workflow commits incomplete data as success.

### 4. Fill the Metal Masters / Metal Fury parts catalog

The parts JSONs only cover Metal Fusion + early Masters, so most
Masters/Fury beys have part chips that resolve to no `Part` and don't link
(~16 fusion wheels, ~21 energy rings, ~15 tracks, ~14 tips unmatched —
e.g. "Beat", "Flash", "Scythe", "Striker II", "F:S", "230"). Either add the
missing parts to `data/parts/*.json` + `data/part-sources.json` and sync, or
make the UI degrade honestly (render unlinked chips differently). Watch the
700-line cap on the parts JSONs — may force a further split.

## Medium priority

### 5. Finish wiring the watchlist

The feature is live in the UI but the pipeline is half-connected:

- Content is a stub: 1 anime (all canonical fields null/empty — never
  synced), 0 movies, 0 series.
- `.github/workflows/sync-beys.yml` has no watchlist target, and its commit
  step never stages `data/watchlist/` or `public/watchlist/`.
- No `sync:movies` / `sync:series` scripts exist, though `data/watchlist.ts`
  fully types `MovieItem`/`SeriesItem` (TMDB or OMDb are the obvious
  sources).

### 6. Consolidate the color/accent maps

One palette edit currently touches up to five files:

- `TYPE_COLORS` from `data/design-tokens.ts` is re-declared in
  `app/bey/[id]/page.tsx` and (as a string record) `app/blader/[id]/page.tsx`.
- `app/bey/[id]/page.tsx` also re-implements `TypeChip` and `StatBar`, which
  already exist in `components/ui/bey-bits.tsx` (with the needed `width`
  variant).
- The part accents (`tip`/`wheel`/`ring`/`track`) are duplicated in
  `app/part/[type]/[id]/page.tsx` and `components/ui/CommandPalette.tsx`;
  the watch accents + `STATUS_ACCENT` in `app/watchlist/page.tsx`,
  `app/watchlist/[category]/[id]/page.tsx`, and `CommandPalette.tsx`.
- The canvas gallery (`components/canvas/BeyCanvasGallery.tsx`) uses
  *different* hex values for Defense/Stamina/Balance than the rest of the
  site — same Bey, different type color depending on the page.

Move everything into `data/design-tokens.ts` and import.

### 7. Overlay accessibility

- `components/ui/CommandPalette.tsx`: no `role="dialog"`/`aria-modal`, no
  focus trap, focus not restored on close, backdrop dismiss is click-only.
- Canvas info sheet (`BeyCanvasGallery.tsx`): no Escape-to-close, no dialog
  role.
- Navbar hamburger: no `aria-expanded`; mobile menu closes only on
  outside-mousedown, not keyboard.

### 8. Image handling

Outside the canvas, every image is a raw `<img>` with no dimensions and no
`loading="lazy"` — detail-page heroes and the watchlist grid load eagerly
and cause layout shift. Either adopt `next/image` consistently (decide first
whether the site should set `output: "export"`; `next.config.ts` currently
doesn't, despite the static-export intent in CLAUDE.md) or at minimum add
`width`/`height` + lazy loading to the `<img>` tags.

## Low priority / cleanups

- **Dead code in `BeyCanvasGallery.tsx`** (571 effective lines — closest
  file to the 700 cap): the disabled `SHOW_MINIMAP` block + its `minimap`
  memo, and the no-op `clampPosition` that returns its inputs unchanged.
- **`Wrapper` component defined inside `.map`** in `app/page.tsx` — new
  identity every render remounts the card subtree; hoist it.
- **Hover styling via inline `onMouseEnter`/`onMouseLeave`** in
  `app/beyblades/page.tsx`, `Footer.tsx`, `Navbar.tsx` — CSS classes would
  also cover keyboard focus.
- **`/beyblades` hero copy** still says "Metal Fusion / 2009–2012" above
  stats that include all three series.
- **`aria-disabled` on non-interactive coming-soon cards** in
  `app/page.tsx` conveys nothing to assistive tech; use visible text (it
  already has the "coming soon" pill) and drop the attribute.
- **Stale filename `.github/workflows/sync-beys.yml`** — it syncs beys,
  characters, *and* parts; rename to `sync-data.yml` (update README).
- **Editorial gaps**: 12 parts with `image: null` that have valid source
  mappings (tips `s, r2f, bs, hf-s, lf, xd, dd, w2d`; wheels `counter,
  diablo`; ring `ares`; track `lw105`) — likely fixed by a re-run once the
  sync scripts get retries; `inferno-aquario` is the only bey with no image.
