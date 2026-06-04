export type WardrobeCategory =
  | 'haut'
  | 'bas'
  | 'robe'
  | 'veste'
  | 'chaussures'
  | 'accessoire'
  | 'sac';

export type Season = 'printemps' | 'ete' | 'automne' | 'hiver';

export type WardrobeSource = 'claire' | 'user';

export interface WardrobeItem {
  id: string;
  name: string;
  category: WardrobeCategory;
  material: string;
  origin: string;
  maker: string;
  tags: string[];
  ecoScore: number;
  source: WardrobeSource;
  color: string;
}

export interface MemoryPhoto {
  id: string;
  silhouetteId: string;
  src: string;
  date: string;
  place: string;
  people: string[];
}

export interface Silhouette {
  id: string;
  name: string;
  subtitle?: string;
  baseItemIds: string[];
  accessoryItemIds: string[];
  place: string;
  firstDate: string;
  season: Season;
  people: string[];
  usageCount: number;
  appointmentReason: string;
  comment: string;
  reminderEnabled: boolean;
  memoryPhotoIds: string[];
}

export interface Appointment {
  id: string;
  person: string;
  place: string;
  date: string;
  silhouetteId?: string;
  draftItemIds: string[];
}

export interface PackingPlan {
  id: string;
  destination: string;
  startDate: string;
  endDate: string;
  weather: string;
  silhouetteIds: string[];
  checklist: string[];
}

export interface StyleMemoryState {
  wardrobe: WardrobeItem[];
  silhouettes: Silhouette[];
  memoryPhotos: MemoryPhoto[];
  appointments: Appointment[];
  packingPlans: PackingPlan[];
}

export interface CreateSilhouetteDraft {
  selectedItemIds: Partial<Record<WardrobeCategory, string>>;
  accessoryIds: string[];
  place: string;
  date: string;
  people: string[];
  reason: string;
  comment: string;
  reminderEnabled: boolean;
}
