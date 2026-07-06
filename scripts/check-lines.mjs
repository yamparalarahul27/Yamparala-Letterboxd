#!/usr/bin/env node
/**
 * check-lines.mjs
 *
 * Enforces the per-file 700-line cap (effective lines: blank and
 * comment-only lines don't count).
 *
 * ESLint's max-lines rule covers .ts/.tsx/.mjs/.js. This script covers
 * everything else: JSON, CSS, MD, YML.
 *
 * Run: npm run check:lines
 * Exits 1 if any file is over the cap.
 */

import { readFile, readdir, stat } from "node:fs/promises";
import { join, extname, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..");

const MAX_LINES = 700;

// Extensions this script covers (ESLint covers the rest).
const TARGET_EXTS = new Set([".json", ".css", ".md", ".yml", ".yaml"]);

// Directories and files to skip entirely.
const IGNORED_DIRS = new Set([
  "node_modules",
  ".next",
  ".git",
  "out",
  "build",
  ".agents",
  ".agent",
]);
const IGNORED_FILES = new Set(["package-lock.json"]);

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (IGNORED_DIRS.has(entry.name)) continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* walk(full);
    } else if (entry.isFile()) {
      yield full;
    }
  }
}

// Strip blank lines + comment-only lines for a rough "effective" count.
function effectiveLines(text, ext) {
  const lines = text.split("\n");
  let count = 0;
  let inBlock = false;
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;

    if (ext === ".css") {
      // /* ... */ block comments
      if (inBlock) {
        if (line.includes("*/")) inBlock = false;
        continue;
      }
      if (line.startsWith("/*") && !line.includes("*/")) {
        inBlock = true;
        continue;
      }
      if (line.startsWith("/*") && line.endsWith("*/")) continue;
      if (line.startsWith("//")) continue;
    } else if (ext === ".md") {
      // No real comment syntax in markdown; count all non-blank lines.
    } else if (ext === ".yml" || ext === ".yaml") {
      if (line.startsWith("#")) continue;
    } else if (ext === ".json") {
      // JSON has no comments; count all non-blank lines.
    }

    count++;
  }
  return count;
}

async function main() {
  const violations = [];
  for await (const file of walk(ROOT)) {
    const base = file.split("/").pop();
    if (IGNORED_FILES.has(base)) continue;
    const ext = extname(file).toLowerCase();
    if (!TARGET_EXTS.has(ext)) continue;

    const stats = await stat(file);
    if (!stats.isFile()) continue;

    const text = await readFile(file, "utf-8");
    const lines = effectiveLines(text, ext);
    if (lines > MAX_LINES) {
      violations.push({ file: relative(ROOT, file), lines });
    }
  }

  if (violations.length === 0) {
    console.log(`✓ All non-JS files under ${MAX_LINES} effective lines.`);
    return;
  }

  console.error(`✗ ${violations.length} file(s) over the ${MAX_LINES}-line cap:`);
  for (const v of violations.sort((a, b) => b.lines - a.lines)) {
    console.error(`  ${v.lines.toString().padStart(5)}  ${v.file}`);
  }
  console.error(
    `\nFix: split this file into smaller logical parts. See CLAUDE.md for the rule.`
  );
  process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
