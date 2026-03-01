# YPM — Product Requirements Document

## About

**YPM** (Yamparala Prediction Markets) is an experimental project by **Yamparala Rahul** on making prediction markets simple and interesting.

The goal is to explore what prediction markets could feel like when designed from first principles — focused on clarity, simplicity, and interesting market structures.

## Vision

> "Make prediction markets feel natural — not intimidating."

Most prediction market platforms are built for power users. YPM aims to be the one that anyone can pick up and use — while still being deep enough for serious traders.

## Core Principles

1. **Simplicity first** — every UI decision should reduce cognitive load
2. **Information density** — show the right data, not all of it
3. **Speed** — markets move fast, the UI should too
4. **Experimental** — this is a learning project; ship, iterate, learn

## Feature Scope (v0 — Current)

| Feature | Status |
|---|---|
| Home screen (header, footer, placeholder markets) | ✅ Done |
| Navigation (Discover, Portfolio, Leaderboard, About) | ✅ Done (placeholder routes) |
| Market cards with tags, price, volume, expiry | ✅ Done (placeholder data) |
| Filter chips (All, Crypto, Sports, Tech, Politics) | ✅ Done (UI only) |
| About section | ✅ Done |

## Feature Scope (v1 — Planned)

| Feature | Priority |
|---|---|
| Live market data (real or mock API) | High |
| Market detail page (`/market/[id]`) | High |
| Yes/No trade buttons | High |
| User portfolio page | Medium |
| Leaderboard page | Medium |
| Search functionality | Medium |
| Filter chips working (actual filtering) | Medium |
| Market creation form | Low |
| User authentication | Low |

## Users

- Curious people who want to bet on real-world outcomes
- Traders familiar with prediction markets (Polymarket, Kalshi, Manifold)
- Developers and researchers interested in market design

## Non-Goals (v0)

- Real money / on-chain trading
- User accounts / auth
- Mobile app (web-only for now)
