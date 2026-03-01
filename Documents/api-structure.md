# YPM — API Structure

> **Status**: Not yet built. This is a planning document.

## Planned API Routes (Next.js App Router)

All API routes will live in `app/api/`.

### Markets

```
GET  /api/markets              # List all markets (with filters)
GET  /api/markets/[id]         # Single market detail
GET  /api/markets/trending     # Trending markets
GET  /api/markets/search?q=    # Search markets
```

### Trades

```
POST /api/trades               # Place a trade (buy Yes or No)
GET  /api/trades/[userId]      # User's trade history
```

### Leaderboard

```
GET  /api/leaderboard          # Top traders by profit
```

## Query Parameters (markets list)

| Param | Type | Example | Description |
|---|---|---|---|
| `tab` | string | `trending` | Filter preset |
| `category` | string | `crypto,sports` | Comma-separated categories |
| `sortBy` | string | `volume_30m` | Sort field |
| `sortOrder` | string | `desc` | `asc` or `desc` |
| `priceMin` | number | `0` | Min price (0-1) |
| `priceMax` | number | `1` | Max price (0-1) |

## Market Data Shape

```typescript
interface Market {
  id: string;
  question: string;
  tags: string[];
  price: number;          // 0-1 (probability)
  volume24h: number;      // USD
  volume30m: number;      // USD
  yesCount: number;       // number of yes trades
  noCount: number;        // number of no trades
  expiresAt: string;      // ISO date
  resolvedAt?: string;    // ISO date, if resolved
  outcome?: "yes" | "no"; // if resolved
  createdAt: string;
}
```

## Data Source Options

| Option | Pros | Cons |
|---|---|---|
| Mock JSON in `app/api/` | Zero setup, fast | Not real data |
| Supabase | Real database, easy auth | Setup required |
| Polymarket API | Real market data | External dependency, rate limits |
| Custom backend | Full control | Most work |

**Current**: Mock data hardcoded in `app/page.tsx`
**Planned**: Move to `app/api/markets/route.ts` with mock JSON first
