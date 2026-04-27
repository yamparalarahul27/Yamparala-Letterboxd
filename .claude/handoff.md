# Session handoff

Snapshot of in-flight work so any future Claude (or human) session can pick up
without re-reading prior chat transcripts. Update this file as state changes.

Last updated: 2026-04-27

## Mission state

The codex covers **51 Beyblades** (Metal Fusion / Masters / Fury), **41
characters**, and **79 parts** (tips / wheels / rings / tracks). Image coverage
is at **89%** (153 / 171). The remaining **18 items** are stubbornly null
because their wiki pages either don't exist at the slugs we have or the page
returned no infobox image.

The fix-in-progress: the user is sending alternative wiki page URLs one-by-one.
We update `data/sources.json` / `data/part-sources.json` with the new slugs and
re-run the GitHub Actions sync workflow.

## Missing-images URL collection

| # | id | type | URL | status |
|---|---|---|---|---|
| 1 | storm-pegasus | bey | https://beyblade.fandom.com/wiki/Storm_Pegasus_105RF | received |
| 2 | dark-bull | bey | https://beyblade.fandom.com/wiki/Dark_Bull_H145SD | received |
| 3 | galaxy-pegasus | bey | https://beyblade.fandom.com/wiki/Galaxy_Pegasus_W105R2F | received |
| 4 | killerken | bey | https://beyblade.fandom.com/wiki/Killerken_Balro_A230WB | received |
| 5 | inferno-aquario | bey | https://beyblade.fandom.com/wiki/Inferno_Byxis_CH120RS | received — name mismatch (Byxis vs Aquario), confirm before applying |
| 6 | hades-crown | bey | https://beyblade.fandom.com/wiki/Hell_Crown_130FB | received — Hell vs Hades, confirm before applying |
| 7 | counter | wheel | https://beyblade.fandom.com/wiki/Fusion_Wheel_-_Counter | received — same as current config; sync may still come back null |
| 8 | diablo | wheel | https://beyblade.fandom.com/wiki/Fusion_Wheel_-_Diablo | received — same as current config |
| 9 | ares | ring | https://beyblade.fandom.com/wiki/Variares_145WB | received — using the Variares Bey page since the standalone Ares ring page is empty |
| 10 | lw105 | track | _not found_ | skip — Pass 2 (Bey-wikitext scrape) should still pick it up via Meteo L-Drago |
| 11 | s | tip | https://beyblade.fandom.com/wiki/Performance_Tip_-_Spike | received — **catalog id `s` = Sharp, not Spike**. Confirm intent before applying. |
| 12 | r2f | tip | _pending_ | |
| 13 | bs | tip | _pending_ | |
| 14 | hf-s | tip | _pending_ | |
| 15 | lf | tip | _pending_ | |
| 16 | xd | tip | _pending_ | |
| 17 | dd | tip | _pending_ | |
| 18 | w2d | tip | _pending_ | |

## Open questions to resolve before applying

- `s` tip: user sent the **Spike** wiki page, but the catalog id `s` is for
  **Sharp** (`Performance_Tip_-_Sharp`). Either rename the catalog entry to
  Spike or treat as a typo.
- `inferno-aquario`: user sent the **Inferno Byxis** page. Different Bey name.
  Verify the catalog id should stay `inferno-aquario` or be renamed.
- `hades-crown`: user sent the **Hell Crown** page. JP/intl naming swap. Same
  question.

## Next concrete steps (in order)

1. Finish collecting the 7 remaining tip URLs.
2. Resolve the 3 open questions above.
3. Update `data/sources.json` (Beys 1-6) and `data/part-sources.json` (parts
   7-9, 11-18) with the new slugs.
4. Run the **Sync data from Fandom** workflow on GitHub Actions
   (Actions tab → Run workflow → target = `all`).
5. Verify image coverage jumps from 89% toward 100%.

## Deferred / parked decisions

- **Gallery & 3D images**: today we fetch only the hero/lead image per Bey.
  Fandom pages contain galleries (different angles, individual parts,
  packaging) and some 3D / turntable views via `images[]` in the parse API
  response. Expansion would need:
  - Schema: `entry.image` → `entry.images: { hero, gallery[], threeD? }`
  - Sync: collect everything from `images[]`, classify by filename heuristic,
    download all
  - UI: thumbnail strip / lightbox under the hero on `/bey/[id]`
  Decision pending until the missing-images pass closes.

## Repo rename — pre-flight (2026-04-27)

User intends to rename the GitHub repo (currently `yamparalarahul27/YPM`).
Pre-flight grep results:

- Zero hardcoded `YPM` or `yamparalarahul27` references in source files.
- `package.json` uses the npm name `beyblade-metal-fusion` (no `repository`
  field).
- `.github/workflows/sync-beys.yml` uses `actions/checkout@v4` with implicit
  `GITHUB_REPOSITORY` — no hardcoded slug.

Post-rename action items:

1. `git remote set-url origin <new-url>` on local clones.
2. Update Claude Code's GitHub MCP whitelist (currently scoped to
   `yamparalarahul27/ypm`) to point at the new name.
3. Optionally rename the local working directory `/home/user/YPM` to match.

## Recently shipped (for context)

- PR #14 — `style: thin theme-matched scrollbars` (`scrollbar-width: thin`,
  `scrollbar-color: var(--border) transparent` on `html` and `*`).
- PR #13 — slug-pattern fix + King fix; pushed image coverage from 51% → 89%.
- ⌘K command palette + `docs/SEARCH.md`.
- Bladers index at `/bladers`.
- 700-line per-file cap (ESLint `max-lines` + `scripts/check-lines.mjs`).
