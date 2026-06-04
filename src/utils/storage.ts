import { seedState } from '../data/seed';
import type { StyleMemoryState } from '../types';

const STORAGE_KEY = 'style-memory-state-v1';

export const loadState = (): StyleMemoryState => {
  if (typeof window === 'undefined') return seedState;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return seedState;
    const parsed = JSON.parse(raw) as Partial<StyleMemoryState>;

    return {
      wardrobe: parsed.wardrobe?.length ? parsed.wardrobe : seedState.wardrobe,
      silhouettes: parsed.silhouettes?.length ? parsed.silhouettes : seedState.silhouettes,
      memoryPhotos: parsed.memoryPhotos ?? seedState.memoryPhotos,
      appointments: parsed.appointments ?? seedState.appointments,
      packingPlans: parsed.packingPlans ?? seedState.packingPlans,
    };
  } catch {
    return seedState;
  }
};

export const saveState = (state: StyleMemoryState) => {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    const withoutLargePhotos: StyleMemoryState = {
      ...state,
      memoryPhotos: state.memoryPhotos.map((photo) => ({
        ...photo,
        src: photo.src.startsWith('data:image') ? '' : photo.src,
      })),
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(withoutLargePhotos));
  }
};

export const resetState = () => {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(STORAGE_KEY);
  }
};
