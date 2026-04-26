#!/usr/bin/env node
/**
 * sync-characters.mjs
 *
 * Pulls a lead avatar image for each character listed in
 * data/character-sources.json from beyblade.fandom.com via the MediaWiki
 * API. Writes /bladers/{id}.{ext} and updates data/characters.json with
 * { image, source }. Editorial fields (name, role, team, bio) are
 * preserved.
 *
 * Usage:
 *   npm run sync:characters
 *   npm run sync:characters -- gingka-hagane kyoya-tategami
 *
 * Requires Node 18+ (global fetch).
 */

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, extname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..");
const DATA_PATH = join(ROOT, "data", "characters.json");
const SOURCES_PATH = join(ROOT, "data", "character-sources.json");
const IMAGES_DIR = join(ROOT, "public", "bladers");

const UA = "BeybladeMetalFusion/1.0 (fan-project)";

// ── IO helpers ───────────────────────────────────────────────────────────
async function readJson(path) {
  return JSON.parse(await readFile(path, "utf-8"));
}

async function writeJson(path, data) {
  await writeFile(path, JSON.stringify(data, null, 2) + "\n", "utf-8");
}

async function fetchJson(url) {
  const res = await fetch(url, { headers: { "User-Agent": UA, Accept: "application/json" } });
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

// ── Wikitext infobox parsing (shared shape with sync-beys.mjs) ──────────
function extractInfobox(wikitext) {
  const start = wikitext.search(/\{\{\s*[A-Za-z][A-Za-z0-9 _-]*?[Ii]nfobox\b/);
  if (start === -1) return null;
  let depth = 0;
  let i = start;
  for (; i < wikitext.length; i++) {
    if (wikitext[i] === "{" && wikitext[i + 1] === "{") {
      depth++;
      i++;
    } else if (wikitext[i] === "}" && wikitext[i + 1] === "}") {
      depth--;
      i++;
      if (depth === 0) {
        i++;
        break;
      }
    }
  }
  const block = wikitext.slice(start + 2, i - 2);
  const firstPipe = block.indexOf("|");
  const body = firstPipe === -1 ? "" : block.slice(firstPipe + 1);

  const parts = [];
  let buf = "";
  let d = 0;
  let bracket = 0;
  for (let j = 0; j < body.length; j++) {
    const ch = body[j];
    const nx = body[j + 1];
    if (ch === "{" && nx === "{") {
      d++;
      buf += ch;
      continue;
    }
    if (ch === "}" && nx === "}") {
      d--;
      buf += ch;
      continue;
    }
    if (ch === "[" && nx === "[") {
      bracket++;
      buf += ch;
      continue;
    }
    if (ch === "]" && nx === "]") {
      bracket--;
      buf += ch;
      continue;
    }
    if (ch === "|" && d === 0 && bracket === 0) {
      parts.push(buf);
      buf = "";
      continue;
    }
    buf += ch;
  }
  if (buf.trim()) parts.push(buf);

  const fields = {};
  for (const part of parts) {
    const eq = part.indexOf("=");
    if (eq === -1) continue;
    const key = part.slice(0, eq).trim().toLowerCase().replace(/[\s_-]/g, "");
    const value = part.slice(eq + 1).trim();
    if (key) fields[key] = value;
  }
  return fields;
}

function pickFirst(fields, keys) {
  for (const k of keys) {
    if (fields[k] != null && fields[k] !== "") return fields[k];
  }
  return null;
}

function extractImageFilename(raw) {
  if (!raw) return null;
  const m = raw.match(/\[\[(?:File|Image):([^|\]]+)/i);
  if (m) return m[1].trim();
  const stripped = raw
    .replace(/<[^>]+>/g, "")
    .replace(/\{\{[^{}]*\}\}/g, "")
    .trim();
  if (/\.(png|jpe?g|gif|webp)$/i.test(stripped)) return stripped;
  return null;
}

function findFirstImageInWikitext(wikitext) {
  if (!wikitext) return null;
  const m = wikitext.match(/\[\[(?:File|Image):([^|\]\n]+\.(?:png|jpe?g|gif|webp))/i);
  return m ? m[1].trim() : null;
}

// ── Image resolution ─────────────────────────────────────────────────────
async function resolveImageUrl(filename) {
  const url = new URL("https://beyblade.fandom.com/api.php");
  url.search = new URLSearchParams({
    action: "query",
    titles: `File:${filename}`,
    prop: "imageinfo",
    iiprop: "url",
    format: "json",
    formatversion: "2",
  }).toString();
  const data = await fetchJson(url.toString());
  const page = data?.query?.pages?.[0];
  return page?.imageinfo?.[0]?.url ?? null;
}

// ── Per-character sync ───────────────────────────────────────────────────
async function fetchPage(pageSlug) {
  const url = new URL("https://beyblade.fandom.com/api.php");
  url.search = new URLSearchParams({
    action: "parse",
    page: pageSlug,
    prop: "wikitext|images",
    redirects: "true",
    format: "json",
    formatversion: "2",
  }).toString();
  const data = await fetchJson(url.toString());
  if (data.error) throw new Error(`MediaWiki: ${data.error.info}`);
  return {
    title: data.parse?.title ?? pageSlug,
    wikitext: data.parse?.wikitext ?? "",
    images: data.parse?.images ?? [],
  };
}

// ── Main ─────────────────────────────────────────────────────────────────
async function main() {
  const onlyIds = process.argv.slice(2);
  const sourcesFile = await readJson(SOURCES_PATH);
  const dataFile = await readJson(DATA_PATH);
  const byId = new Map(dataFile.characters.map((c) => [c.id, c]));

  const targets = sourcesFile.sources.filter(
    (s) => onlyIds.length === 0 || onlyIds.includes(s.id)
  );
  if (!targets.length) {
    console.error(
      `No matching character sources. Known ids: ${sourcesFile.sources.map((s) => s.id).join(", ")}`
    );
    process.exit(1);
  }

  await mkdir(IMAGES_DIR, { recursive: true });
  let ok = 0;
  let failed = 0;

  for (const src of targets) {
    const existing = byId.get(src.id);
    if (!existing) {
      console.error(`  - ${src.id}: no entry in characters.json (skipping)`);
      failed++;
      continue;
    }
    const sourceUrl = `${sourcesFile.wiki}/wiki/${src.page}`;
    process.stdout.write(`  - ${src.id} (${src.page}) … `);
    try {
      const { wikitext, images } = await fetchPage(src.page);
      const fields = extractInfobox(wikitext);

      // Resolve avatar — prefer infobox image, then any [[File:...]] in body, then parse.images[0].
      let imageFilename = fields
        ? extractImageFilename(
            pickFirst(fields, ["image", "image1", "img", "avatar", "pic", "photo", "picture"])
          )
        : null;
      if (!imageFilename) imageFilename = findFirstImageInWikitext(wikitext);
      if (!imageFilename && images.length) imageFilename = images[0];

      let localPath = null;
      if (imageFilename) {
        const fileUrl = await resolveImageUrl(imageFilename);
        if (fileUrl) {
          const ext = (extname(new URL(fileUrl).pathname) || ".png").toLowerCase().split("?")[0];
          const safeExt = [".png", ".jpg", ".jpeg", ".gif", ".webp"].includes(ext) ? ext : ".png";
          const dest = join(IMAGES_DIR, `${src.id}${safeExt}`);
          await downloadFile(fileUrl, dest);
          localPath = `/bladers/${src.id}${safeExt}`;
        }
      }

      const merged = {
        ...existing,
        source: sourceUrl,
        ...(localPath ? { image: localPath } : {}),
      };
      byId.set(src.id, merged);
      console.log(`ok${localPath ? " (image)" : " (no image)"}`);
      ok++;
    } catch (err) {
      console.log(`failed: ${err.message}`);
      byId.set(src.id, { ...existing, source: sourceUrl });
      failed++;
    }
  }

  const updated = {
    ...dataFile,
    characters: dataFile.characters.map((c) => byId.get(c.id) ?? c),
  };
  await writeJson(DATA_PATH, updated);

  console.log(`\nDone. ${ok} ok, ${failed} failed. Wrote ${DATA_PATH}.`);
  process.exit(failed && !ok ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
