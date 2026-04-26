#!/usr/bin/env node
/**
 * sync-beys.mjs
 *
 * Pulls Beyblade data + lead images from beyblade.fandom.com (MediaWiki API)
 * for each entry in data/sources.json, parses the infobox, and merges fields
 * into data/beyblades.json. Lead images are downloaded into public/beys/.
 *
 * Editorial fields (stats.*, description) are preserved — sync only fills in
 * canonical fields like owner, weight, debut, code, parts, and image.
 *
 * Usage:
 *   npm run sync:beys              # all entries
 *   npm run sync:beys -- storm-pegasus rock-leone  # subset
 *
 * Requires Node 18+ (global fetch).
 */

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, extname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..");
const DATA_PATH = join(ROOT, "data", "beyblades.json");
const SOURCES_PATH = join(ROOT, "data", "sources.json");
const IMAGES_DIR = join(ROOT, "public", "beys");

const UA = "MetalFusionCodex/1.0 (https://github.com/yamparalarahul27/YPM; fan-project)";

// ── Utilities ────────────────────────────────────────────────────────────
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

// ── Wikitext infobox parser ──────────────────────────────────────────────
/**
 * Pulls the body of the first {{Infobox ...}} (or {{Beyblade Infobox ...}}, etc.)
 * template from a wikitext string, then splits into key/value pairs.
 * Brace-depth aware — handles nested templates inside values.
 */
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
  const block = wikitext.slice(start + 2, i - 2); // strip the outer {{ }}
  // First line is the template name; drop it.
  const firstPipe = block.indexOf("|");
  const body = firstPipe === -1 ? "" : block.slice(firstPipe + 1);

  // Split body on top-level pipes (depth 0 only).
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

/**
 * Strip wikitext markup down to plain text:
 * - [[link|text]] -> text     (or [[link]] -> link)
 * - {{template|x|y}} -> ""    (drop nested templates outright; values rarely matter)
 * - <ref>...</ref> -> ""
 * - <br>, <br/>, <br /> -> "\n" (so multi-value fields stay separable)
 * - other HTML tags -> ""
 */
function cleanWikitext(s) {
  if (!s) return "";
  // Drop refs, comments
  s = s.replace(/<ref[^>]*?\/>/g, "");
  s = s.replace(/<ref[^>]*>[\s\S]*?<\/ref>/g, "");
  s = s.replace(/<!--[\s\S]*?-->/g, "");
  // <br> variants → newline (BEFORE the generic HTML-tag stripper).
  s = s.replace(/<br\s*\/?\s*>/gi, "\n");
  // Drop nested templates (lossy but predictable).
  for (let i = 0; i < 5; i++) {
    const next = s.replace(/\{\{[^{}]*\}\}/g, "");
    if (next === s) break;
    s = next;
  }
  // [[File:...]] is dropped entirely (image extraction is done separately).
  s = s.replace(/\[\[(?:File|Image):[^\]]*\]\]/gi, "");
  // [[link|display]] -> display, [[link]] -> link
  s = s.replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, "$2");
  s = s.replace(/\[\[([^\]]+)\]\]/g, "$1");
  // External links: [url text] -> text
  s = s.replace(/\[https?:\/\/\S+\s+([^\]]+)\]/g, "$1");
  s = s.replace(/\[https?:\/\/\S+\]/g, "");
  // Remove any remaining HTML tags
  s = s.replace(/<\/?[a-zA-Z][^>]*>/g, "");
  // Bold/italic markup
  s = s.replace(/'''?/g, "");
  // Collapse runs of spaces/tabs but preserve newlines.
  s = s.replace(/[ \t]+/g, " ");
  // Trim each line, drop empties.
  s = s
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .join("\n");
  return s.trim();
}

/**
 * For fields where the wiki may list multiple values separated by <br>
 * (owners, product codes, etc.), take only the first non-empty line.
 */
function firstLine(s) {
  if (!s) return "";
  const idx = s.indexOf("\n");
  return idx === -1 ? s : s.slice(0, idx).trim();
}

/**
 * Extract a Beyblade image filename from raw infobox value or wikitext.
 * Handles:
 *   - Plain "Storm Pegasus.png"
 *   - [[File:Storm Pegasus.png|right|frame|caption]]
 *   - [[Image:Storm Pegasus.png|...]]
 */
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

/**
 * Last-resort image lookup: scan the full wikitext for the first
 * [[File:Something.png|...]] or [[Image:...]] reference.
 */
function findFirstImageInWikitext(wikitext) {
  if (!wikitext) return null;
  const m = wikitext.match(/\[\[(?:File|Image):([^|\]\n]+\.(?:png|jpe?g|gif|webp))/i);
  return m ? m[1].trim() : null;
}

// ── Field mapping ────────────────────────────────────────────────────────
const TYPE_NORMAL = { attack: "Attack", defense: "Defense", stamina: "Stamina", balance: "Balance" };

function pickType(raw) {
  if (!raw) return null;
  const lc = raw.toLowerCase();
  for (const k of Object.keys(TYPE_NORMAL)) {
    if (lc.includes(k)) return TYPE_NORMAL[k];
  }
  return null;
}

function pickFirst(fields, keys) {
  for (const k of keys) {
    if (fields[k] != null && fields[k] !== "") return fields[k];
  }
  return null;
}

function normalizeWeight(raw) {
  if (!raw) return null;
  // Try plain "37.4 g" / "37.4g" first.
  let m = raw.match(/(\d+(?:\.\d+)?)\s*(?:g|grams?)\b/i);
  if (m) return `${m[1]}g`;
  // Unwrap things like {{convert|37.4|g}} → "convert 37.4 g".
  const unwrapped = raw
    .replace(/\{\{[^|{}]*\|/g, " ")
    .replace(/\}\}/g, " ")
    .replace(/\|/g, " ");
  m = unwrapped.match(/(\d+(?:\.\d+)?)\s*(?:g|grams?)\b/i);
  if (m) return `${m[1]}g`;
  // Last resort: first decimal number found.
  m = unwrapped.match(/(\d+(?:\.\d+)?)/);
  if (m) return `${m[1]}g`;
  return cleanWikitext(raw);
}

function normalizeDebut(raw) {
  if (!raw) return null;
  const m = raw.match(/\b(19|20)\d{2}\b/);
  return m ? m[0] : cleanWikitext(raw);
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

// ── Per-Bey sync ─────────────────────────────────────────────────────────
async function fetchBeyData(pageSlug) {
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
    images: data.parse?.images ?? [], // array of filenames (no "File:" prefix)
  };
}

function mapInfobox(fields) {
  return {
    // owner & code are commonly multi-valued (separated by <br>); take the first listed.
    owner: firstLine(cleanWikitext(pickFirst(fields, ["owner", "bladers", "blader", "owners"]))) || null,
    type: pickType(pickFirst(fields, ["type", "performancetype", "battletype"])),
    code: firstLine(cleanWikitext(pickFirst(fields, ["productcode", "code", "productnumber"]))) || null,
    weight: normalizeWeight(pickFirst(fields, ["weight", "totalweight"])),
    debut: normalizeDebut(pickFirst(fields, ["release", "released", "debut", "releasedate"])),
    facebolt: cleanWikitext(pickFirst(fields, ["facebolt", "face"])) || null,
    energyRing: cleanWikitext(pickFirst(fields, ["energyring", "clearwheel"])) || null,
    fusionWheel: cleanWikitext(pickFirst(fields, ["fusionwheel", "metalwheel", "wheel"])) || null,
    spinTrack: cleanWikitext(pickFirst(fields, ["spintrack", "track"])) || null,
    performanceTip: cleanWikitext(pickFirst(fields, ["performancetip", "tip", "bottom"])) || null,
    // Image: extract from [[File:...]] wikilink form OR plain filename. Don't run cleanWikitext —
    // it strips [[File:...]] entirely and we need the filename out of it.
    image: extractImageFilename(
      pickFirst(fields, ["image", "image1", "img", "imagename", "mainimage", "pic", "photo"])
    ),
  };
}

function mergeBey(existing, parsed, sourceUrl, localImagePath) {
  // Only overwrite fields that the wiki actually returned (truthy).
  const out = { ...existing, source: sourceUrl };
  const keys = ["owner", "code", "weight", "debut", "energyRing", "fusionWheel", "spinTrack", "performanceTip"];
  for (const k of keys) if (parsed[k]) out[k] = parsed[k];
  if (parsed.type) out.type = parsed.type;
  if (localImagePath) out.image = localImagePath;
  return out;
}

// ── Main ─────────────────────────────────────────────────────────────────
async function main() {
  const onlyIds = process.argv.slice(2);
  const sourcesFile = await readJson(SOURCES_PATH);
  const dataFile = await readJson(DATA_PATH);
  const byId = new Map(dataFile.beyblades.map((b) => [b.id, b]));

  const targets = sourcesFile.sources.filter((s) => onlyIds.length === 0 || onlyIds.includes(s.id));
  if (!targets.length) {
    console.error(`No matching sources. Known ids: ${sourcesFile.sources.map((s) => s.id).join(", ")}`);
    process.exit(1);
  }

  await mkdir(IMAGES_DIR, { recursive: true });
  let ok = 0;
  let failed = 0;

  for (const src of targets) {
    const existing = byId.get(src.id);
    if (!existing) {
      console.error(`  - ${src.id}: no entry in beyblades.json (skipping)`);
      failed++;
      continue;
    }
    const sourceUrl = `${sourcesFile.wiki}/wiki/${src.page}`;
    process.stdout.write(`  - ${src.id} (${src.page}) … `);
    try {
      const { wikitext, images } = await fetchBeyData(src.page);
      const fields = extractInfobox(wikitext);
      if (!fields) throw new Error("no infobox found");
      const parsed = mapInfobox(fields);

      // Resolve image URL — prefer the infobox image= field, then a [[File:...]] match
      // anywhere in the wikitext, then the first image in parse.images as a last resort.
      let imageFilename = parsed.image;
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
          localPath = `/beys/${src.id}${safeExt}`;
        }
      }

      const merged = mergeBey(existing, parsed, sourceUrl, localPath);
      byId.set(src.id, merged);
      console.log(`ok${localPath ? " (image)" : ""}`);
      ok++;
    } catch (err) {
      console.log(`failed: ${err.message}`);
      // Still record source URL so the entry links back to its origin.
      byId.set(src.id, { ...existing, source: sourceUrl });
      failed++;
    }
  }

  // Preserve original ordering in the file.
  const updated = {
    ...dataFile,
    beyblades: dataFile.beyblades.map((b) => byId.get(b.id) ?? b),
  };
  await writeJson(DATA_PATH, updated);

  console.log(`\nDone. ${ok} ok, ${failed} failed. Wrote ${DATA_PATH}.`);
  if (existsSync(IMAGES_DIR)) console.log(`Images in ${IMAGES_DIR}.`);
  process.exit(failed && !ok ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
