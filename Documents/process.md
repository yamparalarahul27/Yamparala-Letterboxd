# YPM — Dev Process

## Branching

- `main` — always deployable
- Feature branches: `feat/[name]` (e.g. `feat/market-detail-page`)
- Bugfix branches: `fix/[name]`

## Commit Convention

```
feat: add market detail page
fix: correct navbar mobile overlay z-index
style: update filter chip active state to red
docs: update ascii-app-structure
refactor: move CardWithCornerShine to ui/
```

## Dev Server

```bash
cd /Users/yamparalarahul/Desktop/YPM
npm run dev
# → http://localhost:3000
```

## Adding New Features

1. Create feature branch
2. Build component in `components/features/` or `components/ui/`
3. Add route in `app/`
4. Update nav in `Navbar.tsx` if needed
5. Update `Documents/ascii-app-structure.md`
6. Commit using convention above
7. Push to `main` (single developer, no PR needed)

## AI Assistant Rules

- Read `Documents/ai-working-context.md` first
- Read `Documents/design-uiux.md` for any UI work
- Don't auto-run browser tests (see `.agents/workflows/browser-testing.md`)
- Apply `vercel-react-best-practices` skill for all React/Next.js code
