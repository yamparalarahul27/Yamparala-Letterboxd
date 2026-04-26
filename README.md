# Metal Fusion Codex

A curated showcase of **Beyblade Metal Fight** tops across the original three sub-series (Metal Fusion 2009–10, Metal Masters 2010–11, Metal Fury 2011–12) — their components, types, owners, and stats. Now with bladers too.

Built with [Next.js](https://nextjs.org) 16, React 19, Tailwind v4, and Geist Mono.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Data

Two layered catalogs:

- **Beyblades** — [`data/beyblades.json`](./data/beyblades.json), typed via [`data/beyblades.ts`](./data/beyblades.ts). Each entry references a character via `ownerId`.
- **Characters** — [`data/characters.json`](./data/characters.json), typed in the same module.

Editorial fields (Beyblade `stats.*` and `description`; Character `name`, `role`, `team`, `bio`) are hand-curated. Canonical fields and lead images come from the [Beyblade Fandom Wiki](https://beyblade.fandom.com) via two sync scripts:

```bash
# Refresh everything
npm run sync:all

# Just Beyblades
npm run sync:beys

# Just characters
npm run sync:characters

# Subset by id
npm run sync:beys -- storm-pegasus rock-leone
npm run sync:characters -- gingka-hagane kyoya-tategami
```

How the scripts work:

1. Read [`data/sources.json`](./data/sources.json) (Beys) or [`data/character-sources.json`](./data/character-sources.json) — maps `id` → Fandom page slug.
2. Hit MediaWiki's `parse` API for that page's wikitext + image list.
3. Parse the infobox (brace-depth-aware) and extract canonical fields.
4. Resolve the lead image via `query/imageinfo`, download to `public/beys/{id}.ext` or `public/bladers/{id}.ext`.
5. Merge fetched fields into the JSON, preserving editorial fields.

Adding new entries: stub the JSON with editorial fields, add the source mapping, run the relevant sync.

## CI

`.github/workflows/sync-beys.yml` runs both syncs via `workflow_dispatch`. From the GitHub mobile or web app: **Actions → Sync Beyblade & Character data → Run workflow**. Optional `target` input picks `all` (default), `beys`, or `characters`; optional `ids` narrows to a subset. The workflow commits the result back to the triggering branch.

## What's inside

- **Home** — hero, per-series stats, anatomy explainer, filterable collection (by type and series), types breakdown, about
- **Beyblade detail** at `/bey/[id]` — large hero, stats bars, parts breakdown with explanations, metadata pills, related Beys
- **Blader detail** at `/blader/[id]` — avatar, role/team chips, bio, full list of their Beyblades

All routes are pre-rendered statically at build time.

## Disclaimer

Fan project. Not affiliated with Takara Tomy or Hasbro. All Beyblade names, characters, and images sourced from the Fandom wiki are property of their respective owners.
