# YPM — ASCII App Structure

Last updated: 2026-03-01

```
YPM/
│
├── app/                                   # Next.js App Router root
│   ├── globals.css                        # ★ Design tokens, typography, utilities
│   ├── layout.tsx                         # Root layout: fonts, Navbar, Footer, Toaster
│   ├── page.tsx                           # Home page [CLIENT]
│   │   ├── Hero section
│   │   │   ├── "Experimental · Early Access" badge
│   │   │   ├── "Predict. Trade. Win." heading
│   │   │   ├── Project subtitle + creator credit
│   │   │   └── "Explore Markets" + "Learn More" CTAs
│   │   ├── Stats row (4 placeholder metrics)
│   │   │   ├── Markets Open
│   │   │   ├── Total Volume
│   │   │   ├── Active Traders
│   │   │   └── Resolved Today
│   │   ├── Trending Markets section
│   │   │   ├── Section header + "PLACEHOLDER" label
│   │   │   ├── Filter chips: [All] [Crypto] [Sports] [Tech] [Politics]
│   │   │   ├── 4× CardWithCornerShine market cards
│   │   │   │   ├── Tags (red chip badges)
│   │   │   │   ├── Market question
│   │   │   │   └── Price / Volume / Expiry row
│   │   │   └── "Coming soon" banner
│   │   └── About strip
│   │       ├── "ABOUT YPM" label
│   │       ├── "Markets, Simplified." heading
│   │       └── Project description paragraphs
│   │
│   └── [planned routes]
│       ├── market/[id]/page.tsx           # Market detail page
│       ├── portfolio/page.tsx             # User portfolio
│       ├── leaderboard/page.tsx           # Leaderboard
│       └── about/page.tsx                # About page
│
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx                     # ★ Glassmorphism navbar [CLIENT]
│   │   │   ├── Logo (YPM · Prediction Markets)
│   │   │   ├── Desktop nav links (Discover, Portfolio, Leaderboard, About)
│   │   │   ├── Sign In button (red, sharp)
│   │   │   └── Mobile hamburger + overlay menu
│   │   └── Footer.tsx                     # Simple footer [CLIENT]
│   │       ├── Brand (YPM · Prediction Markets — Experimental)
│   │       ├── Links (Docs, GitHub, Twitter/X, Terms)
│   │       └── Attribution (by Yamparala Rahul)
│   │
│   └── ui/
│       └── CardWithCornerShine.tsx        # ★ Premium card with glow corners [CLIENT]
│           ├── CornerAccents (4× L-brackets)
│           └── Content slot (children)
│
├── Documents/                             # Project documentation
│   ├── document-index.md                 # Index of all docs
│   ├── product-prd.md                    # Product requirements
│   ├── architecture.md                   # System architecture
│   ├── design-uiux.md                    # UI/UX design system
│   ├── ascii-app-structure.md            # This file
│   ├── api-structure.md                  # API routes (planned)
│   ├── database.md                       # Database schema (planned)
│   ├── process.md                        # Dev process
│   ├── deployment.md                     # Deployment guide
│   ├── testing.md                        # Testing strategy
│   └── ai-working-context.md             # AI assistant context
│
├── public/
│   └── fonts/
│       └── GeistPixelGrid.woff2          # Pixel font for stat numbers
│
├── .agents/
│   ├── skills/
│   │   └── vercel-react-best-practices/  # 57 perf rules for React/Next.js
│   │       ├── SKILL.md
│   │       ├── AGENTS.md
│   │       └── rules/
│   └── workflows/
│       └── browser-testing.md            # Don't auto-run browser tests
│
├── .agent/
│   └── skills/
│       └── vercel-react-best-practices/  # Mirror of .agents/ skill
│
├── app/globals.css                        # [See above in app/]
├── package.json
├── tsconfig.json
├── next.config.ts
└── postcss.config.mjs
```

## Component Status Legend

- ★ = Core / critical component
- [CLIENT] = `"use client"` directive present
- [SERVER] = Server Component (default in App Router)
- [PLANNED] = Not yet built
