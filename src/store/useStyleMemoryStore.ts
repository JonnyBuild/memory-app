import { useCallback, useEffect, useMemo, useState } from 'react';
import { loadState, resetState, saveState } from '../utils/storage';
import { generateSilhouetteName, getSeasonFromDate, itemsByIds } from '../utils/logic';
import type {
  Appointment,
  CreateSilhouetteDraft,
  MemoryPhoto,
  PackingPlan,
  Silhouette,
  StyleMemoryState,
  WardrobeItem,
} from '../types';

export const useStyleMemoryStore = () => {
  const [state, setState] = useState<StyleMemoryState>(() => loadState());

  useEffect(() => {
    saveState(state);
  }, [state]);

  const addWardrobeItem = useCallback((item: Omit<WardrobeItem, 'id' | 'source' | 'ecoScore' | 'color'> & { color?: string }) => {
    const newItem: WardrobeItem = {
      ...item,
      id: `user-item-${Date.now()}`,
      source: 'user',
      ecoScore: 70,
      color: item.color ?? '#d7c7b7',
    };
    setState((current) => ({ ...current, wardrobe: [...current.wardrobe, newItem] }));
    return newItem;
  }, []);

  const addSilhouette = useCallback((draft: CreateSilhouetteDraft) => {
    let created: Silhouette | undefined;
    setState((current) => {
      const selectedIds = [
        draft.selectedItemIds.haut,
        draft.selectedItemIds.robe,
        draft.selectedItemIds.veste,
        draft.selectedItemIds.bas,
        draft.selectedItemIds.chaussures,
      ].filter((id): id is string => Boolean(id));
      const selectedItems = itemsByIds(current.wardrobe, [...selectedIds, ...draft.accessoryIds]);
      created = {
        id: `silhouette-${Date.now()}`,
        name: generateSilhouetteName(selectedItems, draft.place, draft.date),
        subtitle: draft.reason ? `Preparee pour ${draft.reason}` : 'Nouvelle combinaison',
        baseItemIds: selectedIds,
        accessoryItemIds: draft.accessoryIds,
        place: draft.place,
        firstDate: draft.date,
        season: getSeasonFromDate(draft.date),
        people: draft.people,
        usageCount: 0,
        appointmentReason: draft.reason,
        comment: draft.comment,
        reminderEnabled: draft.reminderEnabled,
        memoryPhotoIds: [],
      };

      return { ...current, silhouettes: [created, ...current.silhouettes] };
    });
    return created;
  }, []);

  const addMemoryPhoto = useCallback((silhouetteId: string, src: string) => {
    setState((current) => {
      const silhouette = current.silhouettes.find((item) => item.id === silhouetteId);
      if (!silhouette) return current;
      const photo: MemoryPhoto = {
        id: `photo-${Date.now()}`,
        silhouetteId,
        src,
        date: silhouette.firstDate,
        place: silhouette.place,
        people: silhouette.people,
      };

      return {
        ...current,
        memoryPhotos: [photo, ...current.memoryPhotos],
        silhouettes: current.silhouettes.map((item) =>
          item.id === silhouetteId
            ? { ...item, memoryPhotoIds: [photo.id, ...item.memoryPhotoIds], usageCount: Math.max(1, item.usageCount) }
            : item,
        ),
      };
    });
  }, []);

  const addAppointment = useCallback((appointment: Omit<Appointment, 'id'>) => {
    const created = { ...appointment, id: `appointment-${Date.now()}` };
    setState((current) => ({ ...current, appointments: [created, ...current.appointments] }));
    return created;
  }, []);

  const addPackingPlan = useCallback((plan: PackingPlan) => {
    setState((current) => ({ ...current, packingPlans: [plan, ...current.packingPlans] }));
  }, []);

  const resetDemo = useCallback(() => {
    resetState();
    setState(loadState());
  }, []);

  return useMemo(
    () => ({
      state,
      setState,
      addWardrobeItem,
      addSilhouette,
      addMemoryPhoto,
      addAppointment,
      addPackingPlan,
      resetDemo,
    }),
    [addAppointment, addMemoryPhoto, addPackingPlan, addSilhouette, addWardrobeItem, resetDemo, state],
  );
};
