# Metal Fusion Codex

A curated showcase of **Beyblade Metal Fight** tops across the original three sub-series (Metal Fusion 2009–10, Metal Masters 2010–11, Metal Fury 2011–12) — their components, types, owners, and stats.

Built with [Next.js](https://nextjs.org) 16, React 19, Tailwind v4, and Geist Mono.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Data

The Beyblade catalog lives in [`data/beyblades.json`](./data/beyblades.json) and is consumed via the typed importer in [`data/beyblades.ts`](./data/beyblades.ts).

Editorial fields (`stats.*`, `description`) are hand-curated. Canonical fields (`owner`, `weight`, `debut`, `code`, parts, `image`) can be refreshed from the [Beyblade Fandom Wiki](https://beyblade.fandom.com) using the sync script:

```bash
# Refresh all entries
npm run sync:beys

# Refresh a subset
npm run sync:beys -- storm-pegasus rock-leone
```

What the script does:

1. Reads [`data/sources.json`](./data/sources.json) — a mapping of `id` → Fandom page slug.
2. For each entry, hits the MediaWiki `parse` API for that page's wikitext + image list.
3. Parses the infobox (brace-depth-aware) and extracts canonical fields.
4. Resolves the lead image's CDN URL via the `query/imageinfo` API.
5. Downloads the image into `public/beys/{id}.{ext}`.
6. Merges fetched fields into `data/beyblades.json` (preserving editorial fields).

Adding a new Beyblade: add a stub entry to `data/beyblades.json` with editorial stats + description, add the `id` → page slug to `data/sources.json`, then run `npm run sync:beys -- new-id`.

## What's inside

- **Hero** — sets the tone for the collection
- **Anatomy** — the five parts of a Metal Fight Beyblade
- **Collection** — filterable grid of cataloged tops with components and stats
- **Types** — Attack / Defense / Stamina / Balance explainer
- **About** — why the codex exists

## Disclaimer

Fan project. Not affiliated with Takara Tomy or Hasbro. All Beyblade names, characters, and images sourced from the Fandom wiki are property of their respective owners.
