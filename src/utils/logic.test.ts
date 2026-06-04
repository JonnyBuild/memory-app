import { describe, expect, it } from 'vitest';
import { seedState } from '../data/seed';
import {
  buildPackingChecklist,
  calculateImpactMetrics,
  filterSilhouettes,
  generateSilhouetteName,
  itemsByIds,
  weatherForDestination,
} from './logic';

describe('style memory logic', () => {
  it('filtre les silhouettes par lieu et personne', () => {
    const results = filterSilhouettes(
      seedState.silhouettes,
      { query: '', place: 'Geneve', person: 'Jonas', season: '' },
      seedState.wardrobe,
    );

    expect(results).toHaveLength(1);
    expect(results[0].name).toContain('Geneve');
  });

  it('genere un nom automatique avec pieces, lieu et mois', () => {
    const items = itemsByIds(seedState.wardrobe, ['pantalon-lin-beige', 'chemise-lin-blanche']);

    expect(generateSilhouetteName(items, 'Paris', '2026-06-12')).toContain('Paris juin 2026');
  });

  it('calcule les metriques impact principales', () => {
    const metrics = calculateImpactMetrics(seedState);

    expect(metrics.silhouetteCount).toBe(4);
    expect(metrics.wardrobeCount).toBeGreaterThan(8);
    expect(metrics.rotationRate).toBeGreaterThan(50);
  });

  it('dedoublonne la checklist de valise', () => {
    const checklist = buildPackingChecklist(seedState.silhouettes.slice(0, 2), seedState.wardrobe);

    expect(checklist).toContain('Sneakers blanches');
    expect(checklist.filter((item) => item === 'Sneakers blanches')).toHaveLength(1);
  });

  it('retourne une meteo fictive par destination', () => {
    expect(weatherForDestination('Barcelone')).toBe('Doux et lumineux');
    expect(weatherForDestination('Zurich')).toBe('Meteo douce fictive');
  });
});
