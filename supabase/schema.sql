-- Beyblade 3D models — initial schema.
-- Run this once in the Supabase SQL editor (or via `supabase db push`).
-- Idempotent: safe to re-run.

-- ── Table: bey_models ────────────────────────────────────────────────────
create table if not exists public.bey_models (
  id uuid primary key default gen_random_uuid(),
  bey_id text not null,
  storage_path text not null,
  format text not null check (format in ('glb', 'gltf')),
  attribution text,
  license text not null default 'Unknown'
    check (license in (
      'CC0','CC-BY','CC-BY-SA','CC-BY-NC','CC-BY-NC-SA',
      'CC-BY-ND','CC-BY-NC-ND','Custom','Unknown'
    )),
  source_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (bey_id, storage_path)
);

create index if not exists bey_models_bey_id_idx on public.bey_models (bey_id);

-- Auto-bump updated_at on row changes.
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists bey_models_set_updated_at on public.bey_models;
create trigger bey_models_set_updated_at
  before update on public.bey_models
  for each row execute function public.set_updated_at();

-- ── RLS: public read, writes via service_role only ──────────────────────
alter table public.bey_models enable row level security;

drop policy if exists "bey_models read public" on public.bey_models;
create policy "bey_models read public"
  on public.bey_models for select
  using (true);

-- No insert/update/delete policies → only service_role can write.

-- ── Storage bucket: bey-models ──────────────────────────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'bey-models',
  'bey-models',
  true,
  52428800, -- 50 MB per file
  array['model/gltf-binary', 'model/gltf+json', 'application/octet-stream']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Public read on bucket objects; uploads via service_role only.
drop policy if exists "bey-models read public" on storage.objects;
create policy "bey-models read public"
  on storage.objects for select
  using (bucket_id = 'bey-models');
