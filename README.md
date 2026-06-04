# Style*Memory App

MVP mobile-first pour demo client: une PWA React/Vite qui montre une app de memoire vestimentaire responsable, avec silhouettes, photos memoire, calendrier, impact, rendez-vous et valise.

## Liens

- Demo client: https://jonnybuild.github.io/memory-app/
- Repo: https://github.com/JonnyBuild/memory-app
- Statut projet: [docs/PROJECT_STATUS.md](docs/PROJECT_STATUS.md)

## Stack

- React 18
- Vite
- TypeScript
- Tailwind CSS
- Vitest + Testing Library
- GitHub Pages

## Lancer localement

```bash
pnpm install
pnpm dev
```

## Verifier

```bash
pnpm test
pnpm build
```

## Structure

- `src/` — code app, donnees fictives, store, composants, tests.
- `public/` — manifest PWA et icone.
- `mockup-images/` — references visuelles client.
- `docs/` — avancement et passation.

## Notes MVP

- Pas de backend.
- Persistance via `localStorage`.
- Upload photo memoire compresse cote navigateur.
- Cartes, meteo, impact et rappels sont simules.
- Vite est configure pour GitHub Pages avec `base: "/memory-app/"`.
