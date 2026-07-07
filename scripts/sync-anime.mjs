#!/usr/bin/env node
/**
 * sync-anime.mjs
 *
 * Pulls anime metadata + cover images from MyAnimeList via the Jikan v4 API
 * (no key required) for each entry in data/watchlist-sources.json (anime),
 * and merges canonical fields into data/watchlist/anime.json. Cover images
 * are downloaded into public/watchlist/anime/.
 *
 * Editorial fields (status, rating, favorite, notes) are preserved — sync
 * only fills title, year, episodes, studios, genres, synopsis, image, source.
 *
 * Usage:
 *   npm run sync:anime              # all entries
 *   npm run sync:anime -- jujutsu-kaisen  # subset by id
 *
 * Requires Node 18+ (global fetch).
 */

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, extname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..");
const ANIME_PATH = join(ROOT, "data", "watchlist", "anime.json");
const SOURCES_PATH = join(ROOT, "data", "watchlist-sources.json");
const IMAGES_DIR = join(ROOT, "public", "watchlist", "anime");

const UA = "YamparalaWatchlist/1.0 (fan-project)";
const RATE_LIMIT_MS = 1100;

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf-8"));
}

async function writeJson(path, data) {
  await writeFile(path, JSON.stringify(data, null, 2) + "\n", "utf-8");
}

async function fetchJson(url) {
  const res = await fetch(url, {
    headers: { "User-Agent": UA, Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.json();
}

async function downloadFile(url, destPath) {
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await mkdir(dirname(destPath), { recursive: true });
  await writeFile(destPath, buf);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function pickImageUrl(images) {
  if (!images) return null;
  return (
    images?.webp?.large_image_url ||
    images?.jpg?.large_image_url ||
    images?.webp?.image_url ||
    images?.jpg?.image_url ||
    null
  );
}

function mapJikan(data) {
  return {
    // Prefer the English title for display (e.g. "Solo Leveling" over
    // "Ore dake Level Up na Ken"); fall back to romaji, then Japanese.
    title: data.title_english || data.title || data.title_japanese || "",
    titleEnglish: data.title_english || null,
    year: data.year ?? (data.aired?.from ? new Date(data.aired.from).getUTCFullYear() : null),
    episodes: data.episodes ?? null,
    studios: Array.isArray(data.studios) ? data.studios.map((s) => s.name) : [],
    genres: Array.isArray(data.genres) ? data.genres.map((g) => g.name) : [],
    synopsis: data.synopsis || "",
    imageUrl: pickImageUrl(data.images),
    source: data.url || null,
  };
}

function mergeAnime(existing, parsed, localImagePath) {
  const out = { ...existing };
  if (parsed.title) out.title = parsed.title;
  if (parsed.titleEnglish !== null) out.titleEnglish = parsed.titleEnglish;
  if (parsed.year !== null) out.year = parsed.year;
  if (parsed.episodes !== null) out.episodes = parsed.episodes;
  if (parsed.studios.length) out.studios = parsed.studios;
  if (parsed.genres.length) out.genres = parsed.genres;
  if (parsed.synopsis) out.synopsis = parsed.synopsis;
  if (parsed.source) out.source = parsed.source;
  if (localImagePath) out.image = localImagePath;
  return out;
}

async function main() {
  const onlyIds = process.argv.slice(2);
  const sourcesFile = await readJson(SOURCES_PATH);
  const animeFile = await readJson(ANIME_PATH);

  const byId = new Map(animeFile.anime.map((a) => [a.id, a]));
  const sources = sourcesFile.anime?.sources ?? [];
  const targets = sources.filter(
    (s) => onlyIds.length === 0 || onlyIds.includes(s.id)
  );

  if (!targets.length) {
    console.error(
      `No matching anime sources. Known ids: ${sources.map((s) => s.id).join(", ") || "(none)"}`
    );
    process.exit(1);
  }

  await mkdir(IMAGES_DIR, { recursive: true });
  let ok = 0;
  let failed = 0;

  for (let i = 0; i < targets.length; i++) {
    const src = targets[i];
    const existing = byId.get(src.id);
    if (!existing) {
      console.error(
        `  - ${src.id}: no entry in data/watchlist/anime.json (skipping)`
      );
      failed++;
      continue;
    }

    process.stdout.write(`  - ${src.id} (mal:${src.malId}) … `);
    try {
      const url = `${sourcesFile.anime.jikan}/anime/${src.malId}/full`;
      const data = await fetchJson(url);
      const parsed = mapJikan(data.data ?? {});

      let localPath = null;
      if (parsed.imageUrl) {
        const ext =
          (extname(new URL(parsed.imageUrl).pathname) || ".jpg")
            .toLowerCase()
            .split("?")[0];
        const safeExt = [".png", ".jpg", ".jpeg", ".gif", ".webp"].includes(ext)
          ? ext
          : ".jpg";
        const dest = join(IMAGES_DIR, `${src.id}${safeExt}`);
        await downloadFile(parsed.imageUrl, dest);
        localPath = `/watchlist/anime/${src.id}${safeExt}`;
      }

      const merged = mergeAnime(existing, parsed, localPath);
      byId.set(src.id, merged);
      console.log(`ok${localPath ? " (image)" : ""}`);
      ok++;
    } catch (err) {
      console.log(`failed: ${err.message}`);
      failed++;
    }

    if (i < targets.length - 1) await sleep(RATE_LIMIT_MS);
  }

  const updated = {
    ...animeFile,
    anime: animeFile.anime.map((a) => byId.get(a.id) ?? a),
  };
  await writeJson(ANIME_PATH, updated);

  console.log(`\nDone. ${ok} ok, ${failed} failed.`);
  process.exit(failed && !ok ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
