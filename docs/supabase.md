# Supabase

Used to store 3D Beyblade models (GLB/GLTF) and their metadata. The site is
still fully statically pre-rendered — Supabase is consumed at build time
(via service-role key) or strictly client-side (via anon key) for the
interactive 3D viewer.

## Project

- URL: `https://jerirjkzrkquhgskoopq.supabase.co`
- Region/owner: see Supabase dashboard.

## Local setup

1. `npm install` — pulls `@supabase/supabase-js`.
2. Copy `.env.example` to `.env.local`:
   ```
   cp .env.example .env.local
   ```
3. Fill in:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (Supabase Dashboard → Project Settings → API)
4. Run the schema once in the SQL editor: paste `supabase/schema.sql`
   into Supabase Dashboard → SQL Editor and execute. It's idempotent.

## What the schema creates

- **Table `public.bey_models`** — one row per uploaded model
  (`bey_id`, `storage_path`, `format`, `attribution`, `license`, `source_url`).
- **Storage bucket `bey-models`** — public read, 50 MB cap,
  GLB/GLTF MIME types only.
- **RLS** — anon key can `select` the table and read the bucket; only the
  service-role key can insert/update/delete. Sync scripts must use
  `lib/supabase/server.ts`.

## Client usage

- Browser / 3D viewer:
  ```ts
  import { getSupabaseBrowserClient, publicModelUrl } from "@/lib/supabase/client";
  const sb = getSupabaseBrowserClient();
  const { data } = await sb.from("bey_models").select("*").eq("bey_id", "storm-pegasus");
  // <model-viewer src={publicModelUrl(data[0].storage_path)} />
  ```
- Sync scripts / build-time:
  ```ts
  import { getSupabaseServiceClient } from "@/lib/supabase/server";
  const sb = getSupabaseServiceClient();
  await sb.storage.from("bey-models").upload(...);
  ```

## TODO — Vercel

- [ ] In Vercel project → Settings → Environment Variables, add for
      Production, Preview, and Development:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY` (Production + Preview only — not Development)
- [ ] Trigger a redeploy after adding the vars.
- [ ] Confirm the build picks them up: the bey detail page should render
      the 3D viewer without throwing the "Missing NEXT_PUBLIC_SUPABASE_*"
      error.

## TODO — content pipeline

- [ ] Add `scripts/sync-models.mjs` to upload local GLBs from a staging
      directory, write metadata rows, and refresh attribution.
- [ ] Decide on a per-bey naming convention, e.g.
      `bey-models/{bey_id}/{variant}.glb`.
- [ ] Wire the bey detail page (`app/bey/[id]/page.tsx`) to look up models
      and render them with `<model-viewer>` or react-three-fiber.
