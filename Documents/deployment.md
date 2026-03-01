# YPM — Deployment

## Current State

Local development only. No production deployment configured yet.

## Local Dev

```bash
cd /Users/yamparalarahul/Desktop/YPM
npm run dev
# → http://localhost:3000
```

## Planned: Vercel

1. Connect `https://github.com/yamparalarahul27/YPM` to Vercel
2. Framework: Next.js (auto-detected)
3. Build command: `npm run build`
4. Output directory: `.next`
5. Environment variables: TBD (none required for static v0)

## Build Check

```bash
npm run build    # must pass with zero errors
npm run lint     # must pass with zero warnings
```
