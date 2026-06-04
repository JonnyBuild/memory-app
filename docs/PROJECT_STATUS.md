# Project Status — Style*Memory App

Date: 2026-06-04  
Owner GitHub: `JonnyBuild`  
Demo: https://jonnybuild.github.io/memory-app/  
Repo: https://github.com/JonnyBuild/memory-app

## Niveau actuel

MVP demo client livre et publie sur GitHub Pages.

Validation actuelle:

- `pnpm test` — OK, 7 tests.
- `pnpm build` — OK.
- GitHub Pages — publie depuis `gh-pages`.
- Verification navigateur publique — page charge, interaction OK, console sans erreur.

## Ce qui est implemente

- Onboarding + menu principal.
- Mes Silhouettes: grille, filtres, toggle accessoires, compteurs.
- Detail silhouette: collage interactif, photo memoire, upload compresse, panneaux dates/lieux/personnes, fiche piece.
- Creation silhouette: flow guide avec categories `Haut / Bas / Acc`, etagere de pieces, validation lieu/date/personnes/rappel fictif.
- Preparer rendez-vous: saisie personne, memoire visuelle, historique, premix.
- Calendrier: mois + frise, uniquement silhouettes avec photo memoire.
- Impact ecologique: metriques fictives et message d'encouragement.
- Faire sa valise: destination, dates, meteo fictive, selection silhouettes, checklist.

## Contraintes conservees

- UI en francais.
- Mobile-first, plein ecran, pas de cadre telephone.
- Pas de backend ni API externe.
- Pas de vraie camera, vraie notification, vraie carte ou vraie meteo.
- Donnees fictives locales.
- Persistance MVP via `localStorage`.

## References visuelles importantes

- Les mockups sont dans `mockup-images/`.
- La frame `850a0059-2300-4cee-9a01-3fe08dc8d1c6.png` est importante pour l'ecran creation: categories `Haut / Bas / Acc` a droite, pieces en bas.

## Prochaines etapes recommandees

- Ajouter un workflow GitHub Actions pour deploy Pages automatiquement depuis `main`.
- Ajouter un vrai mode mobile QA avec captures avant chaque demo client.
- Remplacer les photos memoire SVG fictives par des visuels plus proches de la direction Claire Germain.
- Decider si le MVP doit rester `localStorage` ou preparer un stockage backend.
- Ajouter une page de reset/seed visible seulement en mode demo.

## Handoff agents

- Lire d'abord `AGENTS.md`, puis `docs/PROJECT_STATUS.md`.
- Pour code UI/app: lire `src/AGENTS.md`.
- Pour changements visuels: lire aussi `mockup-images/AGENTS.md`.
- Avant de pousser: `pnpm test && pnpm build`.
