# YPM — UI/UX Design System

## Design Philosophy

**Premium · Data-dense · Dark · Fast**

Inspired by two sources:
- **Ydex** — component architecture, typography scale, card patterns
- **Fireplace.gg Pro** — pure black background, filter chips, dense table layout

## Color Tokens

Defined in `app/globals.css` as CSS variables:

| Variable | Value | Role |
|---|---|---|
| `--bg` | `#000000` | Page background — pure black |
| `--surface` | `#111111` | Card / panel backgrounds |
| `--surface-2` | `#1B1B1B` | Input fields, active chip bg |
| `--border` | `#252525` | Table row dividers, section borders |
| `--border-card` | `rgba(255,255,255,0.10)` | Card borders (glassmorphism) |
| `--accent` | `#FF4752` | **Primary accent — Fireplace red** |
| `--accent-hover` | `#FF2030` | Red hover state |
| `--green` | `#00C076` | Positive deltas, success |
| `--red` | `#FF4752` | Negative deltas, destructive |
| `--text-primary` | `#EFEFEF` | Main body text |
| `--text-muted` | `#666666` | Labels, metadata |
| `--text-muted-2` | `#CACACA` | Secondary values |

## Typography

### Fonts
| Font | Variable | Role |
|---|---|---|
| Geist Mono | `var(--font-geist-mono)` | Body text, headings, nav, code |
| Geist Sans | `var(--font-geist-sans)` | Buttons, small labels |
| GeistPixelGrid | `"GeistPixelGrid"` | Numeric stat displays only |

> **Rule**: Default to Geist Mono. Do NOT override with `font-sans` globally — the monospaced aesthetic is intentional.

### Typography Scale Classes

**Headings** (`text-heading-*`) — titles and section headers
- `text-heading-72` → 4.5rem, bold
- `text-heading-64` → 4rem, bold
- `text-heading-48` → 3rem, bold
- `text-heading-40` → 2.5rem, bold
- `text-heading-32` → 2rem, semibold
- `text-heading-24` → 1.5rem, semibold
- `text-heading-20` → 1.25rem, semibold
- `text-heading-16` → 1rem, semibold
- `text-heading-14` → 0.875rem, semibold

**Labels** (`text-label-*`) — single-line metadata, form labels, tags
- `text-label-16`, `text-label-14`, `text-label-13`, `text-label-12`
- `text-label-12-mono` — Geist Mono variant for key:value pairs

**Numeric** (`text-num-*`) — GeistPixelGrid font, stat displays only
- `text-num-72`, `text-num-56`, `text-num-48`, `text-num-40`, `text-num-32`

## Border Radius Rules

| Element | Radius |
|---|---|
| Cards (`CardWithCornerShine`), Navbar, Modals, Buttons | `0px` (sharp, `rounded-none`) |
| Filter chips, Timeframe toggles | `6px` (`rounded-md`) |
| Small badges / pills | `4px` (`rounded-sm`) |

> **Rule**: `rounded-none` is the default. Only chips and badges get rounded corners.

## Component Patterns

### Glassmorphism Utility
```css
.glass {
  background: rgba(0, 0, 0, 0.80);
  backdrop-filter: blur(24px);
  border: 1px solid rgba(255,255,255,0.10);
}
```
Used by: Navbar, mobile menu, modal overlays, toast notifications.

### CardWithCornerShine
**Location:** `components/ui/CardWithCornerShine.tsx`

L-shaped corner brackets that glow white on hover. Zero border-radius. Semi-transparent `#111` background.

```tsx
<CardWithCornerShine padding="lg">
  <p className="text-num-48" style={{ color: "#EFEFEF" }}>1,234</p>
  <p className="text-label-12" style={{ color: "#666666" }}>TOTAL MARKETS</p>
</CardWithCornerShine>
```

Props: `children`, `className`, `minHeight`, `padding` (`xs|sm|md|lg`), `onClick`

### Navbar (GlassmorphismNavbar)
**Location:** `components/layout/Navbar.tsx`

- Fixed top, `bg-black/80 backdrop-blur-xl`
- Red glow beam at top edge (`#FF4752` linear-gradient)
- Nav link hover: red bottom border `border-b-2 border-[#FF4752]`
- Sign In CTA: solid `#FF4752` bg, `rounded-none`, Geist Sans
- Mobile: full overlay menu with red dot bullets

### Filter Chips (Fireplace-style)
Inline `<button>` elements. Active state: `background: #FF4752`, white text. Inactive: transparent bg, `#666` text, `#252525` border.
```tsx
// Active
style={{ background: "#FF4752", color: "#fff", borderRadius: "6px" }}
// Inactive
style={{ background: "transparent", color: "#666666", borderRadius: "6px", border: "1px solid #252525" }}
```

### Footer
**Location:** `components/layout/Footer.tsx`

Simple 3-column: brand left, links center, "by Yamparala Rahul" right.
`border-top: 1px solid #252525`, `background: #000`.

## Do's and Don'ts

| Do | Don't |
|---|---|
| Use `--accent` (`#FF4752`) for all primary CTAs | Use blue or purple as accent |
| Use `--border` (`#252525`) for row dividers | Use `border-white/10` for table rows |
| Use `rounded-none` on cards/nav/buttons | Apply border radius to cards |
| Use `text-num-*` classes for stat numbers | Use arbitrary font-sizes for stats |
| Use Geist Mono as default body font | Override to sans-serif globally |
| Add corner brackets via `CardWithCornerShine` | Build custom card borders from scratch |
