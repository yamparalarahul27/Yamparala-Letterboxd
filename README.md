# Beyblade Metal Fusion

A curated showcase of **Beyblade Metal Fight** tops across the original three sub-series (Metal Fusion 2009–10, Metal Masters 2010–11, Metal Fury 2011–12) — their components, types, owners, and stats. Now with bladers too.

Built with [Next.js](https://nextjs.org) 16, React 19, Tailwind v4, and Geist Mono.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Data

Three layered catalogs, all typed via [`data/beyblades.ts`](./data/beyblades.ts):

- **Beyblades** — [`data/beyblades.json`](./data/beyblades.json). Each entry references a character via `ownerId` and uses parts by name (`fusionWheel`, `energyRing`, `spinTrack`, `performanceTip`).
- **Characters** — [`data/characters.json`](./data/characters.json).
- **Parts** — split by type: [`data/parts/tips.json`](./data/parts/tips.json), [`wheels.json`](./data/parts/wheels.json), [`rings.json`](./data/parts/rings.json), [`tracks.json`](./data/parts/tracks.json).

Editorial fields (Beyblade `stats.*` and `description`; Character `name`, `role`, `team`, `bio`) are hand-curated. Canonical fields and lead images come from the [Beyblade Fandom Wiki](https://beyblade.fandom.com) via two sync scripts:

```bash
# Refresh everything
npm run sync:all

# Just one layer
npm run sync:beys
npm run sync:characters
npm run sync:parts

# Subset by id
npm run sync:beys -- storm-pegasus rock-leone
npm run sync:characters -- gingka-hagane kyoya-tategami
npm run sync:parts -- rf storm pegasus-i 145
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
- **Beyblade detail** at `/bey/[id]` — large hero, stats bars, clickable parts breakdown, metadata pills, related Beys
- **Blader detail** at `/blader/[id]` — avatar, role/team chips, bio, full list of their Beyblades
- **Part detail** at `/part/[type]/[id]` — image, info, list of Beys using this tip / wheel / ring / track

All routes are pre-rendered statically at build time.

## Project rules

The repo enforces a **700-effective-line cap per file** (blank lines and comments excluded). ESLint covers code; `npm run check:lines` covers JSON / CSS / MD / YML. See [CLAUDE.md](./CLAUDE.md). Run `npm run check` to verify.

## Disclaimer

Fan project. Not affiliated with Takara Tomy or Hasbro. All Beyblade names, characters, and images sourced from the Fandom wiki are property of their respective owners.
