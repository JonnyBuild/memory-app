# PROMPT — Prototype Style Memory App

## Contexte du projet

Crée un prototype fonctionnel d'une application smartphone appelée Style Memory App, conçue par Claire Germain.

Vision : Au-delà des discours, faire exister une vision de la mode responsable et éthique. Créer les conditions pour apprendre à vivre avec moins de vêtements — consommer moins et mieux.

Cible : Une application mobile simple et ludique pour prendre conscience que l'on porte toujours les mêmes pièces, et montrer que l'on peut vivre avec moins de vêtements tout en restant créatif à partir d'un vestiaire de base et des accessoires.

## Contraintes techniques

- Prototype en un seul fichier HTML/CSS/JS (pas de backend)
- Design mobile-first (375px), interface smartphone simulée dans le navigateur
- Données fictives pour tous les exemples (silhouettes, personnes, lieux, dates)
- Pas de base de données réelle — utiliser des objets JavaScript en mémoire
- Style visuel : épuré, élégant, minimaliste — palette neutre (beiges, blancs cassés, gris perle, touche terracotta), typographie douce, beaucoup d'espace blanc

## Structure — 7 sections

1. PAGE D'ACCUEIL / ONBOARDING

---

- Belle image pleine largeur illustrant la philosophie
- Titre : "Style Memory App"
- Quelques paragraphes courts expliquant le but
- Lien "En savoir plus" (modal optionnel)
- Bouton "Commencer" → menu principal

2. MENU PRINCIPAL — 5 entrées

---

1.  Mes Silhouettes
2.  Mon Calendrier
3.  Impact Écologique
4.  Faire sa Valise
5.  Préparer un Rendez-vous

6.  MES SILHOUETTES

---

Vue kaléidoscope :

- Grille de silhouettes (collages vêtements sur fond neutre)
- Pastille avec nombre d'utilisations sur chaque silhouette
- Toggle avec accessoires / sans accessoires
- Nom automatique : vêtements de base + lieu + date de première utilisation
- Sous-titre personnel optionnel
- Bouton flottant "+ Créer une silhouette"

Tri et recherche :

- Par lieu (ex: "Winterthur" → toutes les silhouettes portées là-bas)
- Par personne (ex: "Marie" → silhouettes portées avec elle)
- Par période (été / automne / hiver / printemps)

4. DÉTAIL D'UNE SILHOUETTE

---

- Grande image du collage (vêtements détourés sur fond blanc)
- Flèche droite → bascule vers les photos mémoire (1-2 minimum)
- 3 icônes en bas :
  - 📅 Calendrier → dates d'utilisation
  - 📍 Carte → lieux où portée
  - 👤 Personnes → liste des personnes associées

- Métadonnées : lieu, date, nom des personnes, objet du rendez-vous, commentaire
- Toggle accessoirisé / silhouette de base

Si clic sur une pièce du collage → fiche pièce :

- Nom, matière, caractère écologique (icône), fabricant/marque
- Tags ex: #lin #local #durable

5. CRÉER UNE SILHOUETTE

---

- Fond avec mannequin en pointillés
- Zones cliquables : haut, bas, chaussures, foulard, bracelet, sac, autre
- Clic sur une zone → défilement des pièces disponibles dans cette catégorie
- Sélection → la pièce se pose sur le mannequin
- Possibilité de redimensionner (ex: foulard visible ou discret)
- Deux sources de pièces :
  1.  Vestiaire Claire Germain : pièces pré-sélectionnées, détourées, infos écologiques renseignées (lin, coton bio, fabrication locale...)
  2.  Mes pièces : pièces ajoutées par l'utilisateur

- Bouton "Valider" → saisir lieu prévu, date, activer rappel (veille + sur place : "N'oubliez pas votre photo mémoire !")
- La silhouette n'apparaît dans le calendrier/carte qu'une fois la photo mémoire ajoutée

6. PRÉPARER UN RENDEZ-VOUS

---

Étape 1 — Avec qui ?

- Champ de saisie : nom de la personne
- Après saisie : écran mémoire onirique — défilement doux et légèrement flou de toutes les photos mémoire avec cette personne (fond sombre, opacité variable, animation lente et nostalgique)

Étape 2 — Historique

- Silhouettes de base et accessoirisées déjà portées avec elle
- Quand et où chaque fois

Étape 3 — Préparer la nouvelle silhouette

- Partir d'une silhouette existante (prémix) OU créer de zéro
- Si modification : afficher la silhouette, changer chaque pièce par catégorie
- Valider → lieu, date, rappel

7. MON CALENDRIER

---

- Vue mensuelle avec miniatures des silhouettes sur les jours
- Clic sur un jour → détail de la silhouette
- Vue alternative : frise chronologique

8. IMPACT ÉCOLOGIQUE

---

- Nombre de silhouettes créées, pièces dans le vestiaire, taux de rotation
- Estimation empreinte selon les matières renseignées
- Messages d'encouragement liés à la philosophie

## Données fictives à inclure

Personnes : Marie, Jonas, Léa, Pierre, Akira
Lieux : Winterthur, Genève, Paris, Lyon, Barcelone

Vestiaire Claire Germain (pièces de base) :

- Jean brut (coton bio, Portugal)
- Pantalon lin beige (lin français, atelier local)
- Pull mérinos gris clair (laine mérinos, Italie)
- Chemise blanche en lin (lin belge)
- Robe midi terracotta (viscose LENZING™)
- Blazer camel (laine recyclée)
- Foulard soie ivoire
- Sneakers blanches (cuir recyclé)
- Bottines camel (cuir végétal)

4 silhouettes pré-créées :

1.  Jean brut + Pull gris — Winterthur, 3 février (6 utilisations)
2.  Pantalon lin + Chemise blanche — Genève, 15 avril (4 utilisations)
3.  Robe terracotta + Foulard soie — Paris, 22 juin (3 utilisations)
4.  Jean brut + Blazer camel — Lyon, 8 octobre (8 utilisations)

## Ce qu'il NE faut PAS faire

- Pas de backend, pas de localStorage
- Pas de design type Instagram/Vinted/app de mode classique
- Pas de couleurs vives ou flashy
- Navigation simple et directe
- Ne pas simuler de vraie caméra ou notifications réelles

Alain Renk
Research Laboratory Director & Co-Founder | Architect-Urbanist
Multigination DUT  Coordinator
Linkedin

Open Urbanism Foundation — Geneva, Switzerland 
ENoLL Urban Living Lab Certified
Chemin Champ-Claude 10, 
1214 Vernier GE Switzerland  CH ‭+41 78 216 44 07‬   

The Open Urbanism Foundation is based in Geneva, Switzerland and serves citizens, public institutions, researchers, and private actors worldwide. Our activities center on Open Urbanism, guided by Free Software ethics, with theoretical, methodological, and digital commons openly shared for public benefit. As an international foundation, our mission is to advance urban transition through research, collective intelligence and IRL - In Real Life - projects,  in alignment with the Sustainable Development Goals (SDGs). Our commitment to the Commons approach and Open Science  ensures that our concepts, methods, and civic-tech tools are freely accessible, enabling urban open innovation dissemination at a global scale.

Our structure includes three main streams:
1 The Research Laboratory develops theoretical approaches to urbanism for transitions and uncertainties, delivering civic tech for collective intelligence, and participates in European collaborative research such as the DUT Driving Urban Transitions programme. 2 The Project Studio collaborates with local governments and municipalities of all sizes, applying innovative methods through real-world Urban Living Labs (ENoLL member). 3 The international network "7 Billion Urbanists" brings together urban thinkers who actively use shared commons we have co-initiated and foster authentic civic engagement for successful urban transitions.
