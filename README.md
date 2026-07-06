# Yamparala Favourites

A personal catalog of favourites. The flagship collection is **Beyblade Metal Fight** — tops across the original three sub-series (Metal Fusion 2009–10, Metal Masters 2010–11, Metal Fury 2011–12), their components, types, owners, and stats — plus bladers and a growing anime / movie / series watchlist.

Built with [Next.js](https://nextjs.org) 16, React 19, Tailwind v4, and Geist Mono.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Data

Four layered catalogs. The Beyblade side is typed via [`data/beyblades.ts`](./data/beyblades.ts), the watchlist via [`data/watchlist.ts`](./data/watchlist.ts):

- **Beyblades** — split by series: [`data/beyblades/metal-fusion.json`](./data/beyblades/metal-fusion.json), [`metal-masters.json`](./data/beyblades/metal-masters.json), [`metal-fury.json`](./data/beyblades/metal-fury.json). Each entry references a character via `ownerId` and uses parts by name (`fusionWheel`, `energyRing`, `spinTrack`, `performanceTip`).
- **Characters** — [`data/characters.json`](./data/characters.json).
- **Parts** — split by type: [`data/parts/tips.json`](./data/parts/tips.json), [`wheels.json`](./data/parts/wheels.json), [`rings.json`](./data/parts/rings.json), [`tracks.json`](./data/parts/tracks.json).
- **Watchlist** — split by category: [`data/watchlist/anime.json`](./data/watchlist/anime.json), [`movies.json`](./data/watchlist/movies.json), [`series.json`](./data/watchlist/series.json).

Editorial fields (Beyblade `stats.*` and `description`; Character `name`, `role`, `team`, `bio`) are hand-curated. Canonical fields and lead images come from the [Beyblade Fandom Wiki](https://beyblade.fandom.com) (anime data from [Jikan](https://jikan.moe)) via four sync scripts:

```bash
# Refresh everything
npm run sync:all

# Just one layer
npm run sync:beys
npm run sync:characters
npm run sync:parts
npm run sync:watchlist

# Subset by id
npm run sync:beys -- storm-pegasus rock-leone
npm run sync:characters -- gingka-hagane kyoya-tategami
npm run sync:parts -- rf storm pegasus-i 145
```

How the scripts work:

1. Read the matching sources file — [`data/sources.json`](./data/sources.json) (Beys), [`data/character-sources.json`](./data/character-sources.json), [`data/part-sources.json`](./data/part-sources.json), or [`data/watchlist-sources.json`](./data/watchlist-sources.json) — maps `id` → Fandom page slug (or MyAnimeList id).
2. Hit MediaWiki's `parse` API for that page's wikitext + image list (Jikan's REST API for anime).
3. Parse the infobox (brace-depth-aware) and extract canonical fields.
4. Resolve the lead image via `query/imageinfo`, download to `public/beys/`, `public/bladers/`, `public/parts/{type}/`, or `public/watchlist/anime/`.
5. Merge fetched fields into the JSON, preserving editorial fields.

Adding new entries: stub the JSON with editorial fields, add the source mapping, run the relevant sync.

## CI

Two workflows:

- **`.github/workflows/ci.yml`** — runs on every PR and push to `main`: `npm run check` (lint + line cap), `npm run typecheck`, and `npm run build`.
- **`.github/workflows/sync-beys.yml`** — runs the Fandom syncs via `workflow_dispatch`. From the GitHub mobile or web app: **Actions → Sync data from Fandom → Run workflow**. Optional `target` input picks `all` (default), `beys`, `characters`, or `parts`; optional `ids` narrows to a subset. The workflow commits the result back to the triggering branch. (The watchlist sync is local-only for now.)

## What's inside

- **Home** — hero and collections hub linking into each catalog, about
- **Beyblades** at `/beyblades` — per-series stats, anatomy explainer, filterable collection (by type and series), types breakdown
- **Beyblade detail** at `/bey/[id]` — large hero, stats bars, clickable parts breakdown, metadata pills, related Beys
- **Blader detail** at `/blader/[id]` — avatar, role/team chips, bio, full list of their Beyblades
- **Part detail** at `/part/[type]/[id]` — image, info, list of Beys using this tip / wheel / ring / track
- **Canvas gallery** at `/canvasgallery` — infinite pannable canvas of the collection with a mobile bottom sheet
- **Watchlist** at `/watchlist` — anime / movie / series tracker with per-category detail pages
- **⌘K search palette** — global keyboard-driven search across Beys, bladers, and parts. See [docs/SEARCH.md](./docs/SEARCH.md) for the full implementation.

All routes are pre-rendered statically at build time.

## Project rules

The repo enforces a **700-effective-line cap per file** (blank lines and comments excluded). ESLint covers code; `npm run check:lines` covers JSON / CSS / MD / YML. See [CLAUDE.md](./CLAUDE.md). Run `npm run check` to verify.

## Disclaimer

Fan project. Not affiliated with Takara Tomy or Hasbro. All Beyblade names, characters, and images sourced from the Fandom wiki are property of their respective owners.
