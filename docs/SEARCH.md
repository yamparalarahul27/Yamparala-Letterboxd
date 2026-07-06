# Search palette

The search palette is a global, keyboard-driven overlay that lets you jump to any **Beyblade**, **blader**, or **part** in the codex from anywhere on the site. This document describes every detail of how it works.

## At a glance

- **Lives in** [`components/ui/CommandPalette.tsx`](../components/ui/CommandPalette.tsx)
- **Mounted globally** in [`app/layout.tsx`](../app/layout.tsx), so it's available on every route
- **Triggered** by `⌘K` / `Ctrl+K`, by the navbar search button, or by dispatching a `palette:open` window event
- **Indexes** all Beys (50), bladers (41), and parts (79) — ~170 entries total
- **No external dependencies** — fuzzy matching is ~30 lines of local TypeScript scoring
- **Client-only** — uses `"use client"`; doesn't add any new static routes

## Where the code lives

```
components/ui/CommandPalette.tsx   ← the whole palette (modal, input, results, scoring)
components/layout/Navbar.tsx       ← search button that dispatches `palette:open`
app/layout.tsx                     ← mounts <CommandPalette /> once for the whole app
```

## Triggers

The palette can open in three ways:

### 1. Keyboard shortcut — desktop

`⌘K` on macOS, `Ctrl+K` on Windows/Linux.

Implementation (window-level listener registered in `useEffect`):

```ts
const onKey = (e: KeyboardEvent) => {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
    e.preventDefault();
    setOpen((v) => !v);
  }
};
window.addEventListener("keydown", onKey);
```

Behavior:
- `e.preventDefault()` stops the browser's default `⌘K` (which on Chrome/Safari focuses the address bar's search).
- The shortcut **toggles** — pressing it while open closes it.

### 2. Search button — desktop & mobile

The navbar contains a button with a search icon. Clicking it dispatches a custom window event:

```ts
function openPalette() {
  window.dispatchEvent(new Event("palette:open"));
}
```

The button lives in `components/layout/Navbar.tsx`:

```tsx
<button onClick={openPalette} aria-label="Open search">
  <SearchIcon size={14} />
  <span className="hidden md:inline text-[11px]">Search</span>
  <span className="hidden md:inline text-[10px] px-1 ml-1">⌘K</span>
</button>
```

Responsive behavior:
- **Desktop (`md:` and up)**: shows the search icon + "Search" label + a `⌘K` pill hint
- **Mobile (below `md:`)**: shows only the search icon, since touch users don't have keyboard shortcuts

### 3. Programmatic — `palette:open` window event

Any code anywhere can trigger the palette by dispatching the event:

```ts
window.dispatchEvent(new Event("palette:open"));
```

This is what the navbar button does. The palette listens for it:

```ts
const onOpenEvent = () => setOpen(true);
window.addEventListener("palette:open", onOpenEvent);
```

Use this if you want to add a "search" affordance from anywhere else in the app — e.g. an empty-state button, a future onboarding flow, or a deep-link.

## UI states

The palette renders nothing when closed (`if (!open) return null`). When open, it goes through these states:

### Closed

Returns `null`. No DOM, no listeners except the global keyboard one. Body scroll is unlocked.

### Empty (just opened, no query yet)

```
┌────────────────────────────────────────────┐
│  🔍  [autofocused input]              ✕   │
├────────────────────────────────────────────┤
│                                            │
│   Start typing to search across 50         │
│   Beyblades, 41 bladers, and 79 parts.    │
│                                            │
│           ↑↓ NAVIGATE · ↵ OPEN · ESC CLOSE │
│                                            │
└────────────────────────────────────────────┘
```

The placeholder text and counts are dynamic — they show actual catalog sizes via `BEYBLADES.length`, `CHARACTERS.length`, `PARTS.length`.

### With query — results

As you type, results appear grouped by type. See **Result display** below for the full layout.

### With query — no matches

```
┌────────────────────────────────────────────┐
│  🔍  zzzzz                            ✕   │
├────────────────────────────────────────────┤
│                                            │
│           No matches for "zzzzz".          │
│                                            │
└────────────────────────────────────────────┘
```

## The search index

Built **once on mount** via `useMemo` and never rebuilt — the catalog is static so the index is too.

```ts
interface Entry {
  type: "bey" | "blader" | "part";
  id: string;
  name: string;          // primary display label
  subtitle: string;      // secondary line (type/series/owner, role/team, etc.)
  href: string;          // navigation target
  accent: string;        // type-color for the left border + type tag
  haystack: string;      // pre-lowercased searchable string
}
```

**What goes in `haystack`** — concatenated, lowercased fields that get scanned for matches:

| Type | Haystack content |
|---|---|
| Bey | `name`, `combo`, `owner`, `series` |
| Blader | `name`, `team`, `role` |
| Part | `name`, `fullName` |

So searching "kyoya" matches all three Leones (via owner field on each Bey), Kyoya Tategami himself (via name), and nothing under parts.

## Scoring

The scoring function returns a number 0–1000 per entry. Higher = better match. Anything that returns 0 is dropped.

```ts
function score(entry: Entry, q: string): number {
  if (!q) return 0;
  const name = entry.name.toLowerCase();
  if (name === q) return 1000;          // exact name match
  if (name.startsWith(q)) return 500;   // name prefix match
  if (name.includes(q)) return 200;     // name substring match
  if (entry.haystack.includes(q)) return 50;  // any-field substring match
  // multi-word fallback: each word must match somewhere
  const tokens = q.split(/\s+/).filter(Boolean);
  if (tokens.length > 1 && tokens.every((t) => entry.haystack.includes(t))) {
    return 25;
  }
  return 0;
}
```

This means:

- Typing `storm` ranks **Storm Pegasus** (name prefix) above **Galaxy Pegasus** (haystack hit on "storm"-related sibling — actually wouldn't match, but illustrative).
- Typing `gingka` ranks **Gingka Hagane** (exact name) at the top, then any Bey he owns (haystack hit).
- Typing `attack rf` (multi-word) matches Beys whose haystack contains both "attack" and "rf" anywhere — looser fallback for power users.

**Tie-breaking**: when two entries have the same score, results are sorted alphabetically by `name`.

**Result cap**: top 30 across all types. With 170 total entries this is plenty of room for any reasonable query.

## Result display

Results are grouped into three sections in this fixed order: **Beyblades** → **Bladers** → **Parts**. Empty groups are hidden.

```
┌────────────────────────────────────────────┐
│  🔍  leone                            ✕   │
├────────────────────────────────────────────┤
│  BEYBLADES · 3                             │  ← sticky group header
│ ▎Rock Leone                          BEY  │  ← active row (left border)
│   Defense · Metal Fusion · Kyoya Tategami │
│  Counter Leone                       BEY  │
│   Defense · Metal Masters · Kyoya         │
│  Fang Leone                          BEY  │
│   Defense · Metal Fury · Kyoya            │
│  BLADERS · 1                              │
│  Kyoya Tategami                   BLADER  │
│   Rival · Gan Gan Galaxy                  │
└────────────────────────────────────────────┘
```

Each row contains:
- **Primary line**: the entry's `name` (e.g. "Rock Leone", "Kyoya Tategami", "Rubber Flat")
- **Secondary line** (subtitle): contextual info
  - For Beys: `${type} · ${series} · ${owner}`
  - For bladers: `${role} · ${team}` (or just role if no team)
  - For parts: `${partTypeLabel} · ${shortName}` (e.g. "Performance Tip · RF")
- **Right tag**: a colored type pill — `BEY` (red), `BLADER` (gray), or `PART` (type-color: red/blue/green/yellow per tip/wheel/ring/track)

### Active row

The "active" row is the one keyboard navigation targets. It's highlighted with:
- A 2px left border in the row's accent color
- A subtle white-on-5%-opacity background fill

Mouse hover **updates** the active index — this means you can use the mouse and keyboard interchangeably. Hover the third row, then press Enter, and you open the third row.

### Group headers

Each group has a sticky header showing the group name and the count of results in that group: `BLADERS · 1`. The header sticks to the top of the scroll container as you scroll, so you always know which type the visible rows belong to.

## Keyboard navigation

While the palette is open:

| Key | Action |
|---|---|
| `↓` Arrow Down | Move active row down (wraps from last → first) |
| `↑` Arrow Up | Move active row up (wraps from first → last) |
| `Enter` | Open the active row's detail page (`/bey/[id]`, `/blader/[id]`, or `/part/[type]/[id]`) and close the palette |
| `Esc` | Close the palette without navigating |
| `⌘K` / `Ctrl+K` | Toggle (close, since it's already open) |

Implementation lives in `handleKeyDown` on the modal's outer container, which has `onKeyDown` (no need for global listeners while open).

The active index resets to **0** every time the result set changes (typing a new character, deleting one, etc.) — see the `useEffect` watching `results`.

## Click vs Enter

Clicking a row is equivalent to pressing Enter on it:
- Both call `router.push(item.href)`
- Both call `setOpen(false)`

The router push is Next.js's client-side navigation, so the transition is fast and preserves browser history (you can use the back button to return to wherever you were when you opened the palette).

## Mobile specifics

- **No keyboard shortcut** is available on mobile — the search button is the only entry point.
- **Touch input**: tapping the input opens the device's on-screen keyboard. The input has `autofocus`-equivalent behavior via `requestAnimationFrame(() => inputRef.current?.focus())` on open, so the keyboard slides up immediately.
- **Backdrop tap** closes the palette (same as desktop). The dim/blur backdrop is a sibling div with `onClick={() => setOpen(false)}`.
- **Scroll lock**: while the palette is open, `document.body.style.overflow = "hidden"` prevents the page underneath from scrolling when the user is scrolling within the palette's results list.
- **Modal layout**: the palette is positioned with `flex items-start justify-center pt-20`, so on tall screens it sits near the top (not vertically centered). This keeps the input visible above the on-screen keyboard on most devices.

## Accessibility

- The trigger button has `aria-label="Open search"`.
- The close button (×) has `aria-label="Close"`.
- Input is auto-focused when the palette opens.
- Esc closes the palette — standard modal dismissal pattern.
- Each result row is a `<button type="button">`, so it's keyboard-accessible and announced as a button by screen readers.

**Known limitation**: this is not a fully WAI-ARIA-compliant `combobox` widget. No `aria-activedescendant`, no `aria-expanded`, no `role="listbox"` / `role="option"` markup. For a fan codex this is acceptable; if we needed AA accessibility compliance we'd switch to a vetted library like Headless UI Combobox or react-aria.

## Performance

- **Index build**: `O(n)` once on mount. n ≈ 170. Sub-millisecond.
- **Per-keystroke filter**: `O(n)` linear scan with substring matches and one optional split. For 170 entries on a phone this is well under a frame.
- **No debounce**: filtering happens synchronously on every keystroke. Too cheap to need throttling.
- **Memoization**: `useMemo` on the index (deps: `[]`), on the results (deps: `[index, query]`), on the grouped/flattened views (deps: `[results]`).
- **Bundle impact**: `CommandPalette.tsx` is ~10 KB minified, lazy-bundled into the client chunk. No effect on initial page paint since it only renders when `open === true`.

## Edge cases

| Case | Behavior |
|---|---|
| Empty query | Shows the empty-state placeholder, no results listed |
| Query with only whitespace | Same as empty — the `query.trim().toLowerCase()` discards it |
| 0 results | Shows "No matches for &quot;{query}&quot;." |
| 30+ matches | Top 30 by score, alphabetical tie-break. Less-relevant matches are dropped silently |
| Click outside the modal card | Backdrop catches it, closes the palette |
| Open while another palette open | Idempotent — `setOpen(true)` on already-open is a no-op |
| Opening on a route with its own keyboard handler | The palette's `onKeyDown` is on the modal container; once focus is in the input, route-level handlers no longer see those keys |
| Esc while no rows match | Just closes the palette |
| Pressing Enter with 0 results | No-op (`flat.length` guard) |

## Customization knobs

If you want to tweak behavior, here are the levers:

- **Result cap** — hardcoded at `30` in `useMemo` for results: change the `slice(0, 30)`.
- **Group order** — `TYPE_ORDER` constant: `["bey", "blader", "part"]`.
- **Group labels** — `TYPE_LABEL` constant: `{ bey: "Beyblades", blader: "Bladers", part: "Parts" }`.
- **Score weights** — the four `if` branches in `score()`. To weight subtitle hits higher, raise the `50` for haystack matches.
- **Open shortcut** — the keydown handler. Add new shortcuts by extending the condition.
- **Modal positioning** — the outer `div` has `pt-20`; bump down for taller phones, up for shorter screens.

## Why this design

A few decisions worth calling out:

**Why a custom event instead of React Context?**
The palette only needs one consumer (itself) and one producer (the navbar button — for now). A window event has zero React-tree footprint and works from anywhere, including non-React code if we ever need to wire one up. Context would be more idiomatic for richer state, but here it's overkill.

**Why no fuzzy library (Fuse.js, fzy)?**
At ~170 entries, even a simple substring scoring is instant. Fuse.js adds ~9 KB gzipped for capabilities we don't need. The current scoring is also more predictable: typing `storm` puts **Storm Pegasus** at #1, deterministically.

**Why no debounce?**
Filtering 170 entries with substring matches is cheaper than the 16ms frame budget on any device that can run Next.js. Debouncing would add complexity for no perceived benefit.

**Why client-side `router.push` instead of `<Link>` per row?**
We want the palette to close and navigate in one click. Wrapping each row in `<Link>` and ALSO calling `setOpen(false)` works but feels redundant. A button with `router.push + setOpen(false)` is one clear action.

**Why `pt-20` (top-aligned) instead of vertically centered?**
On mobile, when the on-screen keyboard pops up, a vertically-centered modal jumps awkwardly. Top-aligned keeps the input position stable as the keyboard opens.

**Why no recent-searches / history?**
Initially scoped out for simplicity. Easy to add later via `localStorage` if it earns its place — would slot above the empty-state placeholder.

## Future improvements

If we keep iterating, the natural next steps:

- **Fuzzy typo tolerance** — handle `kyoia` finding `Kyoya`. Could add a small Levenshtein-aware scorer (~20 more lines).
- **Recent searches** — top 5 in localStorage, shown above the placeholder when empty.
- **Pinned shortcuts** — "G" for Gingka, "A" for Aguma, etc. Hot-keys for top characters.
- **Keyboard hint per row** — show the inferred shortcut on hover/focus.
- **Search-as-you-type URL sync** — push `?q=...` to the URL while typing for shareable searches.
- **AA compliance** — switch to Headless UI's Combobox if a screen-reader user reports issues.

None of these are urgent. The current palette already feels like a real product tool.
