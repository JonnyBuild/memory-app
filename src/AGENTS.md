# Source App

> Code applicatif React/TypeScript du MVP Style*Memory.

## Key files

- `App.tsx` — navigation interne et ecrans MVP.
- `types.ts` — interfaces publiques du domaine.
- `data/seed.ts` — donnees fictives et photos memoire SVG.
- `store/useStyleMemoryStore.ts` — state local et persistance.
- `utils/logic.ts` — logique testee: filtres, impact, valise.
- `components/` — composants UI reutilisables et silhouettes SVG.

## Local rules

- Garder les flows mobile-first et en francais.
- Mettre la logique pure dans `utils/logic.ts` avec tests proches.
- Garder les pieces de vetement interactives via composants, pas images plates.
- Compresser les uploads avant stockage `localStorage`.
- Eviter les abstractions lourdes: MVP demo client, pas produit scale.
