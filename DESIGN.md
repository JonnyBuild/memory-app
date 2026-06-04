# Design

## Visual Direction

Style*Memory uses a luxury minimal atelier direction. The interface is mostly white, quiet, and tactile, with realistic generated photography used as demo content. The palette remains the existing brand palette; the redesign changes hierarchy, density, typography, imagery, and component behavior rather than color identity.

## Color Palette

- `chalk` `#fffdf9`: primary surface.
- `pearl` `#f8f4ee`: secondary surface and subtle section depth.
- `graphite` `#262323`: primary text and dark controls.
- `ink` `#191716`: strongest text and dark editorial panels.
- `terracotta` `#8f3d2e`: action, selection, brand accent.
- `clay` `#c9826b`: soft accent.
- `sage` `#7d8975`: responsible fashion / textile accent.
- `mist` `#e8e0d7`: dividers and low-emphasis borders.
- `stone` `#8b8178`: secondary copy.

## Typography

- Display: `Cormorant Garamond`, serif fallback. Used for screen titles, editorial numbers, and premium display moments.
- UI/body: `Plus Jakarta Sans`, then Inter/system fallback. Used for labels, buttons, forms, and dense product copy.
- Avoid heavy `font-black` as a default. Use 400/500/600 for refinement; use strong weight only for compact labels or selected states.

## Imagery

Generated demo images live in `public/assets/atelier/` and are allowed in the client demo. They represent placeholder content for future real user photos, but they should still make the MVP feel like a true product experience.

Image roles:
- `atelier-hero.jpg`: onboarding and atelier mood.
- `wardrobe-flatlay.jpg`: silhouettes / wardrobe entry.
- `memory-photo.jpg`: default memory photo and appointment mood.
- `calendar-still.jpg`: calendar and planning mood.
- `packing-still.jpg`: packing screen mood.
- `textile-detail.jpg`: impact and responsible material mood.

## Components

- Prefer unframed page sections, fine separators, and object-led layouts over card grids.
- Cards should be rare, low-radius, and functional. Target radius: 12-16px.
- Buttons are slim, tactile, and direct. Primary actions use graphite or terracotta.
- System icons are acceptable for navigation and utility actions only. Product navigation should use imagery and typography.

## Mobile Layout

The app is designed first for 375-430px wide phones. Screens should feel full height and intentional, with safe bottom spacing for primary actions. Fixed-format controls like category selectors, silhouette canvases, and bottom action bars must not shift when content changes.

## Motion

Use short, state-driven transitions only. Keep transitions around 150-220ms. Respect reduced motion.
