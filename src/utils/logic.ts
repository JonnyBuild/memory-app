import type { PackingPlan, Season, Silhouette, StyleMemoryState, WardrobeItem } from '../types';

export interface SilhouetteFilters {
  query: string;
  place: string;
  person: string;
  season: string;
}

export const dateLabel = (value: string) =>
  new Intl.DateTimeFormat('fr-CH', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(value));

export const compactDateLabel = (value: string) =>
  new Intl.DateTimeFormat('fr-CH', { day: '2-digit', month: 'short' }).format(new Date(value));

export const getSeasonFromDate = (date: string): Season => {
  const month = new Date(date).getMonth() + 1;
  if (month >= 3 && month <= 5) return 'printemps';
  if (month >= 6 && month <= 8) return 'ete';
  if (month >= 9 && month <= 11) return 'automne';
  return 'hiver';
};

export const itemsByIds = (wardrobe: WardrobeItem[], ids: string[]) =>
  ids.map((id) => wardrobe.find((item) => item.id === id)).filter((item): item is WardrobeItem => Boolean(item));

export const generateSilhouetteName = (items: WardrobeItem[], place: string, date: string) => {
  const namedPieces = items
    .filter((item) => item.category !== 'accessoire' && item.category !== 'sac')
    .slice(0, 2)
    .map((item) => item.name.replace(' en ', ' ').replace('Pull merinos gris clair', 'Pull gris'));
  const month = new Intl.DateTimeFormat('fr-CH', { month: 'long', year: 'numeric' }).format(new Date(date));
  return `${namedPieces.join(' + ') || 'Silhouette'} - ${place} ${month}`;
};

export const filterSilhouettes = (
  silhouettes: Silhouette[],
  filters: SilhouetteFilters,
  wardrobe: WardrobeItem[],
) => {
  const normalizedQuery = filters.query.trim().toLowerCase();

  return silhouettes.filter((silhouette) => {
    const items = itemsByIds(wardrobe, [...silhouette.baseItemIds, ...silhouette.accessoryItemIds]);
    const haystack = [
      silhouette.name,
      silhouette.subtitle,
      silhouette.place,
      silhouette.people.join(' '),
      silhouette.appointmentReason,
      silhouette.comment,
      items.map((item) => item.name).join(' '),
    ]
      .join(' ')
      .toLowerCase();

    return (
      (!normalizedQuery || haystack.includes(normalizedQuery)) &&
      (!filters.place || silhouette.place === filters.place) &&
      (!filters.person || silhouette.people.includes(filters.person)) &&
      (!filters.season || silhouette.season === filters.season)
    );
  });
};

export const calculateImpactMetrics = (state: StyleMemoryState) => {
  const totalUses = state.silhouettes.reduce((sum, silhouette) => sum + silhouette.usageCount, 0);
  const usedItemIds = new Set(state.silhouettes.flatMap((silhouette) => [...silhouette.baseItemIds, ...silhouette.accessoryItemIds]));
  const rotationRate = state.wardrobe.length ? Math.round((usedItemIds.size / state.wardrobe.length) * 100) : 0;
  const averageEcoScore = state.wardrobe.length
    ? Math.round(state.wardrobe.reduce((sum, item) => sum + item.ecoScore, 0) / state.wardrobe.length)
    : 0;
  const estimatedFootprint = Math.max(12, Math.round(180 - averageEcoScore - totalUses * 1.8));

  return {
    silhouetteCount: state.silhouettes.length,
    wardrobeCount: state.wardrobe.length,
    totalUses,
    rotationRate,
    averageEcoScore,
    estimatedFootprint,
  };
};

export const buildPackingChecklist = (
  selectedSilhouettes: Silhouette[],
  wardrobe: WardrobeItem[],
) => {
  const itemIds = new Set(selectedSilhouettes.flatMap((silhouette) => [...silhouette.baseItemIds, ...silhouette.accessoryItemIds]));
  return itemsByIds(wardrobe, [...itemIds]).map((item) => item.name);
};

export const weatherForDestination = (destination: string) => {
  const byDestination: Record<string, string> = {
    Barcelone: 'Doux et lumineux',
    Paris: 'Variable, veste legere',
    Geneve: 'Frais le matin',
    Lyon: 'Sec et doux',
    Winterthur: 'Frais, risque de pluie',
  };

  return byDestination[destination] ?? 'Meteo douce fictive';
};

export const makePackingPlan = (
  destination: string,
  startDate: string,
  endDate: string,
  silhouettes: Silhouette[],
  wardrobe: WardrobeItem[],
): PackingPlan => ({
  id: `packing-${Date.now()}`,
  destination,
  startDate,
  endDate,
  weather: weatherForDestination(destination),
  silhouetteIds: silhouettes.map((silhouette) => silhouette.id),
  checklist: buildPackingChecklist(silhouettes, wardrobe),
});
