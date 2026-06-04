# Style*Memory App

> MVP React/Vite mobile-first pour demo client d'une app de memoire vestimentaire responsable.

## Structure

- `src/` — application React, store local, donnees fictives, tests.
- `public/` — manifest PWA et icone publique.
- `mockup-images/` — references visuelles fournies par le client.
- `docs/` — statut projet, handoff et notes de continuation.
- `dist/` — build genere, ignore par Git.

## Commands

- Install: `pnpm install`
- Dev: `pnpm dev`
- Tests: `pnpm test`
- Build: `pnpm build`

## Conventions

- Stack: React 18 + Vite + TypeScript + Tailwind + Vitest.
- UI 100% francais, mobile-first, plein ecran, style minimal raffine.
- Donnees MVP locales: objets TypeScript + `localStorage`, pas de backend.
- GitHub Pages sert `gh-pages`; Vite utilise `base: "/memory-app/"`.
- Avant deploy: lancer `pnpm test` puis `pnpm build`.
- Branches: `feature/*`, `fix/*`, `alfred/*`; eviter les commits directs sur `main` hors MVP rapide.

## Never

- Ne pas mettre de secrets/API keys dans le frontend.
- Ne pas ajouter backend, vraie camera, vraie notification, vraie meteo ou vraie carte sans demande explicite.
- Ne pas remplacer la direction visuelle par une app type Instagram/Vinted.
- Ne pas modifier `gh-pages` manuellement sauf pour publier `dist`.
