# YPM — Architecture Overview

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js (App Router) |
| Language | TypeScript |
| Styling | TailwindCSS v4 |
| Fonts | Geist Sans · Geist Mono · GeistPixelGrid |
| Animations | Framer Motion |
| Icons | Lucide React |
| Toasts | Sonner |
| Charts | Recharts (planned) |
| Data layer | TBD (mock data → Supabase or API) |

## Directory Structure

```
YPM/
├── app/                    # Next.js App Router
│   ├── globals.css         # Design tokens, typography scale, utilities
│   ├── layout.tsx          # Root layout: fonts, Navbar, Footer, Toaster
│   ├── page.tsx            # Home page (client component)
│   └── [future routes]/    # market/[id], portfolio, leaderboard, about
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx      # Glassmorphism navbar, red accent
│   │   └── Footer.tsx      # Simple footer, attribution
│   ├── ui/
│   │   └── CardWithCornerShine.tsx  # Premium card with glow corner brackets
│   └── features/           # Feature-specific components (TBD)
├── Documents/              # Project documentation (this folder)
├── public/
│   └── fonts/
│       └── GeistPixelGrid.woff2
├── .agents/
│   ├── skills/             # vercel-react-best-practices
│   └── workflows/          # browser-testing policy
└── package.json
```

## Rendering Strategy

| Route | Strategy | Reason |
|---|---|---|
| `/` (home) | Client Component | Has inline event handlers (hover effects) |
| `/market/[id]` | Server Component + Client islands | Static shell, dynamic price data |
| `/portfolio` | Client Component | User-specific, interactive |
| `/leaderboard` | Server Component | Mostly static, can be cached |

## Data Flow (Current — Mock)

```
app/page.tsx
└── hardcoded placeholder arrays (stats, placeholderMarkets)
    └── rendered into CardWithCornerShine components
```

## Data Flow (Planned)

```
API / Supabase
└── Server Component fetches market list
    └── Passes to Client Component table/cards
        └── User actions (buy/sell) → API mutation → optimistic UI update
```

## Key Design Decisions

- **`"use client"` on page.tsx** — required because of inline `onMouseEnter` hover handlers on buttons. If refactored to CSS-only hover (Tailwind classes), this can become a Server Component.
- **Fonts loaded via `geist` npm package** — not Google Fonts CDN, to avoid layout shift and network dependency.
- **GeistPixelGrid** — loaded via `@font-face` in `globals.css` from `/public/fonts/`.
