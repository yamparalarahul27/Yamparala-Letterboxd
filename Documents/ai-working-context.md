# YPM — AI Working Context

This document gives an AI assistant all the key context needed to work on the YPM project without re-reading every file.

## What Is YPM?

**YPM** = Yamparala Prediction Markets. An experimental project by **Yamparala Rahul** making prediction markets simple and interesting. Not a production app — it's a learning/exploration project.

## Current State (as of 2026-03-01)

- ✅ Home screen built: hero, stats row, placeholder market cards, about strip
- ✅ Glassmorphism navbar + footer
- ✅ Full design system in `globals.css`
- ✅ `CardWithCornerShine` component ported from Ydex
- ✅ Pushed to GitHub: `https://github.com/yamparalarahul27/YPM`
- ❌ No real data — all placeholder
- ❌ No auth, no trading, no market detail pages

## Design Rules (NEVER break these)

1. **Background is `#000000`** — pure black, no navy, no dark gray
2. **Primary accent is `#FF4752`** — red only, not purple, not blue
3. **Cards use `rounded-none`** (zero border-radius) — sharp corners always
4. **Filter chips use `rounded-md`** (6px) — only exception to zero-radius rule
5. **Default font is Geist Mono** — do NOT override to sans-serif globally
6. **Stat numbers use GeistPixelGrid** via `.text-num-*` classes
7. **Table row dividers use `#252525`** — not `border-white/10`
8. **Card borders use `rgba(255,255,255,0.10)`** — not solid grey

## Key Files to Know

| File | What's in it |
|---|---|
| `app/globals.css` | All CSS tokens, typography scale |
| `app/layout.tsx` | Fonts, Navbar, Footer, Toaster |
| `app/page.tsx` | Home page (client component) |
| `components/layout/Navbar.tsx` | Glassmorphism navbar |
| `components/layout/Footer.tsx` | Footer |
| `components/ui/CardWithCornerShine.tsx` | Premium card component |

## Common Tasks & How To Approach

### Adding a new page
1. Create `app/[route]/page.tsx`
2. Add it to `navLinks` array in `Navbar.tsx`
3. Default to Server Component unless interactive
4. Wrap content in `max-w-7xl mx-auto px-4 sm:px-6`

### Adding a new component
1. Put UI primitives in `components/ui/`
2. Put layout components in `components/layout/`
3. Put feature-specific components in `components/features/`
4. Always use design tokens from `globals.css` — not arbitrary values
5. Document it in `Documents/design-uiux.md`

### Adding a market card
Use `CardWithCornerShine` with this structure:
```tsx
<CardWithCornerShine padding="lg">
  <div className="flex flex-col gap-4">
    {/* Tags */}
    <div className="flex gap-2">
      <Tag label="Crypto" />
    </div>
    {/* Question */}
    <p className="text-heading-16" style={{ color: "#EFEFEF" }}>
      Will Bitcoin hit $100k?
    </p>
    {/* Bottom row */}
    <div className="flex justify-between" style={{ borderTop: "1px solid #252525", paddingTop: "1rem" }}>
      <span className="text-num-32">{price}</span>
      <span className="text-label-12-mono" style={{ color: "#666" }}>{expiry}</span>
    </div>
  </div>
</CardWithCornerShine>
```

## Design Inspirations

- **Ydex** (`yamparalarahul27/Ydex`) — component architecture, card patterns, typography scale
- **Fireplace.gg Pro** (`pro.fireplace.gg/discover`) — pure black bg, red accent, filter chips, dense table layout

## What NOT to Do

- Don't add `"use client"` unless the component has event handlers or hooks
- Don't use Tailwind's `bg-black/80` for page background — use `#000`
- Don't use purple (`#8C83E9`) — that's Ydex's accent, not YPM's
- Don't use `rounded-lg` on cards — must be `rounded-none`
- Don't import barrel files (e.g. `import { ... } from '@/components'`) — import directly
