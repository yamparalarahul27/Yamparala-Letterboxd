#!/usr/bin/env node
/**
 * sync-parts.mjs
 *
 * Pulls a lead image for each part listed in data/part-sources.json from
 * beyblade.fandom.com via the MediaWiki API. Writes
 * /public/parts/{type}/{id}.{ext} and updates each
 * data/parts/{tips,wheels,rings,tracks}.json with { image, source }.
 *
 * Editorial fields (name, fullName, info) are preserved.
 *
 * Usage:
 *   npm run sync:parts
 *   npm run sync:parts -- rf storm pegasus-i 145
 *
 * Requires Node 18+ (global fetch).
 */

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, extname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..");
const SOURCES_PATH = join(ROOT, "data", "part-sources.json");
const IMAGES_DIR = join(ROOT, "public", "parts");

const PART_FILES = {
  tip: { path: join(ROOT, "data", "parts", "tips.json"), key: "tips" },
  wheel: { path: join(ROOT, "data", "parts", "wheels.json"), key: "wheels" },
  ring: { path: join(ROOT, "data", "parts", "rings.json"), key: "rings" },
  track: { path: join(ROOT, "data", "parts", "tracks.json"), key: "tracks" },
};

const UA = "YamparalaFavourites/1.0 (fan-project)";

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

// ── Wikitext helpers (same shape as the other sync scripts) ─────────────
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

// ── Bey-page part scraper ───────────────────────────────────────────────
const BEY_SOURCES_PATH = join(ROOT, "data", "sources.json");

const PART_TYPE_PATTERNS = [
  // Canonical Fandom pattern: "Fusion_Wheel_-_Storm.png" (verified live).
  { type: "wheel", regex: /^Fusion[_ ]Wheel[_ ]-[_ ]/i, prefix: "fusion" },
  { type: "ring", regex: /^Energy[_ ]Ring[_ ]-[_ ]/i, prefix: "energy" },
  { type: "track", regex: /^Spin[_ ]Track[_ ]-[_ ]/i, prefix: "spin" },
  { type: "tip", regex: /^Performance[_ ]Tip[_ ]-[_ ]/i, prefix: "performance" },
  // Legacy parens form, kept as fallback.
  { type: "wheel", regex: /\(Fusion[_ ]Wheel\)/i, prefix: null },
  { type: "ring", regex: /\(Energy[_ ]Ring\)/i, prefix: null },
  { type: "track", regex: /\(Spin[_ ]Track\)/i, prefix: null },
  { type: "tip", regex: /\(Performance[_ ]Tip\)/i, prefix: null },
];

function detectPartTypeFromFilename(filename) {
  for (const { type, regex } of PART_TYPE_PATTERNS) {
    if (regex.test(filename)) return type;
  }
  return null;
}

function extractPartNameFromFilename(filename) {
  let base = filename.replace(/\.(png|jpe?g|gif|webp)$/i, "");
  // Strip canonical "Fusion_Wheel_-_" / "Energy_Ring_-_" / etc. prefix.
  base = base.replace(
    /^(?:Fusion[_ ]Wheel|Energy[_ ]Ring|Spin[_ ]Track|Performance[_ ]Tip)[_ ]-[_ ]/i,
    ""
  );
  // Strip legacy parens form too.
  base = base.replace(
    /_?\((?:Fusion[_ ]Wheel|Energy[_ ]Ring|Spin[_ ]Track|Performance[_ ]Tip)\)/gi,
    ""
  );
  return base.replace(/_/g, " ").trim();
}

function buildPartLookup(dataByType) {
  // Map "<type>:<lowercased name or fullName>" → part id, for fast match.
  const map = new Map();
  for (const [type, bucket] of Object.entries(dataByType)) {
    for (const p of bucket.list) {
      const keys = new Set([p.name]);
      if (p.fullName) keys.add(p.fullName);
      // Also try without trailing roman numerals (e.g. "Pegasus I" → "Pegasus").
      keys.add(p.name.replace(/\s+I+$/, "").trim());
      for (const k of keys) {
        if (!k) continue;
        const key = `${type}:${k.toLowerCase()}`;
        if (!map.has(key)) map.set(key, p.id);
      }
    }
  }
  return map;
}

async function fillPartImagesFromBeys(dataByType) {
  const beySources = await readJson(BEY_SOURCES_PATH);
  const lookup = buildPartLookup(dataByType);
  let scraped = 0;

  for (const src of beySources.sources) {
    process.stdout.write(`  scanning bey ${src.id} … `);
    try {
      const { wikitext } = await fetchPage(src.page);
      // Find every [[File:<filename>...]] reference.
      const seen = new Set();
      const re = /\[\[(?:File|Image):([^|\]\n]+\.(?:png|jpe?g|gif|webp))/gi;
      let m;
      let hits = 0;
      while ((m = re.exec(wikitext))) {
        const filename = m[1].trim();
        if (seen.has(filename)) continue;
        seen.add(filename);
        const partType = detectPartTypeFromFilename(filename);
        if (!partType) continue;
        const partName = extractPartNameFromFilename(filename);
        if (!partName) continue;
        const key = `${partType}:${partName.toLowerCase()}`;
        const partId = lookup.get(key);
        if (!partId) continue;
        const existing = dataByType[partType].byId.get(partId);
        if (!existing || existing.image) continue; // already has one

        const fileUrl = await resolveImageUrl(filename);
        if (!fileUrl) continue;
        const ext = (extname(new URL(fileUrl).pathname) || ".png")
          .toLowerCase()
          .split("?")[0];
        const safeExt = [".png", ".jpg", ".jpeg", ".gif", ".webp"].includes(ext)
          ? ext
          : ".png";
        const dest = join(IMAGES_DIR, partType, `${partId}${safeExt}`);
        await downloadFile(fileUrl, dest);
        const localPath = `/parts/${partType}/${partId}${safeExt}`;
        dataByType[partType].byId.set(partId, { ...existing, image: localPath });
        scraped++;
        hits++;
      }
      console.log(`${hits} new`);
    } catch (err) {
      console.log(`skip (${err.message})`);
    }
  }
  return scraped;
}

// ── Main ─────────────────────────────────────────────────────────────────
async function main() {
  const onlyIds = process.argv.slice(2);
  const sourcesFile = await readJson(SOURCES_PATH);

  // Load each part-type JSON into memory.
  const dataByType = {};
  for (const [type, { path, key }] of Object.entries(PART_FILES)) {
    const raw = await readJson(path);
    dataByType[type] = { raw, list: raw[key], byId: new Map(raw[key].map((p) => [p.id, p])) };
  }

  const targets = sourcesFile.sources.filter(
    (s) => onlyIds.length === 0 || onlyIds.includes(s.id)
  );
  if (!targets.length) {
    console.error("No matching part sources.");
    process.exit(1);
  }

  let ok = 0;
  let failed = 0;

  for (const src of targets) {
    const bucket = dataByType[src.type];
    if (!bucket) {
      console.error(`  - ${src.id}: unknown type "${src.type}" (skipping)`);
      failed++;
      continue;
    }
    const existing = bucket.byId.get(src.id);
    if (!existing) {
      console.error(`  - ${src.id}: no entry in parts/${src.type}s.json (skipping)`);
      failed++;
      continue;
    }
    const sourceUrl = `${sourcesFile.wiki}/wiki/${src.page}`;
    process.stdout.write(`  - ${src.type}/${src.id} (${src.page}) … `);
    try {
      const { wikitext, images } = await fetchPage(src.page);
      const fields = extractInfobox(wikitext);

      let imageFilename = fields
        ? extractImageFilename(
            pickFirst(fields, ["image", "image1", "img", "imagename", "mainimage", "pic", "photo"])
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
          const dest = join(IMAGES_DIR, src.type, `${src.id}${safeExt}`);
          await downloadFile(fileUrl, dest);
          localPath = `/parts/${src.type}/${src.id}${safeExt}`;
        }
      }

      const merged = {
        ...existing,
        source: sourceUrl,
        ...(localPath ? { image: localPath } : {}),
      };
      bucket.byId.set(src.id, merged);
      console.log(`ok${localPath ? " (image)" : " (no image)"}`);
      ok++;
    } catch (err) {
      console.log(`failed: ${err.message}`);
      bucket.byId.set(src.id, { ...existing, source: sourceUrl });
      failed++;
    }
  }

  // ── Pass 2: scrape part images from Bey wikitexts ───────────────────
  // Many parts don't have dedicated wiki pages. But each Bey article on
  // the wiki includes inline [[File:Storm_(Fusion_Wheel).png]]-style
  // references for its components. We scan all Bey wikitexts for those
  // patterns and fill in any part image that's still null.
  if (onlyIds.length === 0) {
    const filledFromBeys = await fillPartImagesFromBeys(dataByType);
    console.log(`\nFrom Bey pages: ${filledFromBeys} additional part images.`);
  }

  // Write back each part-type JSON, preserving original ordering.
  for (const [type, { raw, list, byId }] of Object.entries(dataByType)) {
    const updated = {
      ...raw,
      [PART_FILES[type].key]: list.map((p) => byId.get(p.id) ?? p),
    };
    await writeJson(PART_FILES[type].path, updated);
  }

  console.log(`\nDone. ${ok} ok, ${failed} failed.`);
  process.exit(failed && !ok ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
