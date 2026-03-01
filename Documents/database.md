# YPM — Database

> **Status**: Not yet implemented. Planning document only.

## Planned: Supabase

Supabase (PostgreSQL) is the planned data layer — same as Ydex.

## Schema

### `markets`

```sql
CREATE TABLE markets (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question    TEXT NOT NULL,
  tags        TEXT[] DEFAULT '{}',
  price       NUMERIC(5,4) NOT NULL DEFAULT 0.5,  -- 0-1 probability
  volume_24h  NUMERIC(12,2) DEFAULT 0,
  volume_30m  NUMERIC(12,2) DEFAULT 0,
  yes_count   INTEGER DEFAULT 0,
  no_count    INTEGER DEFAULT 0,
  expires_at  TIMESTAMPTZ NOT NULL,
  resolved_at TIMESTAMPTZ,
  outcome     TEXT CHECK (outcome IN ('yes', 'no')),
  created_at  TIMESTAMPTZ DEFAULT now()
);
```

### `trades`

```sql
CREATE TABLE trades (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  market_id   UUID REFERENCES markets(id),
  user_id     UUID,                       -- references auth.users
  side        TEXT CHECK (side IN ('yes', 'no')),
  amount      NUMERIC(10,2) NOT NULL,     -- USD amount
  price       NUMERIC(5,4) NOT NULL,      -- price at time of trade (0-1)
  created_at  TIMESTAMPTZ DEFAULT now()
);
```

### `users` (extends Supabase auth)

```sql
CREATE TABLE profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id),
  username    TEXT UNIQUE,
  display_name TEXT,
  avatar_url  TEXT,
  total_pnl   NUMERIC(12,2) DEFAULT 0,
  win_rate    NUMERIC(5,4) DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT now()
);
```

## Row Level Security (Planned)

```sql
-- Anyone can read markets
ALTER TABLE markets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "markets_public_read" ON markets FOR SELECT TO anon USING (true);

-- Only auth users can trade
ALTER TABLE trades ENABLE ROW LEVEL SECURITY;
CREATE POLICY "trades_auth_insert" ON trades FOR INSERT TO authenticated USING (true);
CREATE POLICY "trades_own_read" ON trades FOR SELECT USING (auth.uid() = user_id);
```

## Indexes (Planned)

```sql
CREATE INDEX idx_markets_price      ON markets(price);
CREATE INDEX idx_markets_volume_30m ON markets(volume_30m DESC);
CREATE INDEX idx_markets_expires_at ON markets(expires_at);
CREATE INDEX idx_trades_market_id   ON trades(market_id);
CREATE INDEX idx_trades_user_id     ON trades(user_id);
```
