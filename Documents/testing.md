# YPM — Testing Strategy

## Current State

No automated tests. Manual browser testing only.

## Manual Testing

After any code change:
1. Check dev server is running (`npm run dev`)
2. Open `http://localhost:3000`
3. Verify no error overlay
4. Test responsive layout at mobile (375px) and desktop (1440px)
5. Hover over cards → confirm corner bracket glow
6. Hover over nav items → confirm red underline
7. Open mobile menu → confirm overlay, confirm links work

## Planned Automated Tests

```bash
# Type checking
npx tsc --noEmit

# Lint
npm run lint

# Build (catches most runtime errors)
npm run build
```

## Browser Testing Policy

See `.agents/workflows/browser-testing.md`:
> Do **not** auto-run browser verification after changes.
> Wait for user to test locally and provide feedback.
> Only use browser tools when user explicitly asks.
