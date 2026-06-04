import {
  CalendarDays,
  Camera,
  Check,
  ChevronRight,
  CircleDot,
  CloudSun,
  ImageUp,
  Info,
  Leaf,
  Luggage,
  MapPin,
  PackageCheck,
  Plus,
  Search,
  Shirt,
  Sparkles,
  UserRound,
  Users,
  Wand2,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Modal } from './components/Modal';
import { ScreenShell } from './components/ScreenShell';
import { SilhouetteCanvas } from './components/SilhouetteCanvas';
import { ClothingGraphic } from './components/ClothingGraphic';
import { placesSeed, peopleSeed } from './data/seed';
import { useStyleMemoryStore } from './store/useStyleMemoryStore';
import type { CreateSilhouetteDraft, Season, Silhouette, WardrobeCategory, WardrobeItem } from './types';
import { compressImageFile } from './utils/image';
import {
  buildPackingChecklist,
  calculateImpactMetrics,
  compactDateLabel,
  dateLabel,
  filterSilhouettes,
  itemsByIds,
  makePackingPlan,
  weatherForDestination,
} from './utils/logic';

type Screen =
  | 'onboarding'
  | 'menu'
  | 'silhouettes'
  | 'detail'
  | 'create'
  | 'appointment'
  | 'calendar'
  | 'impact'
  | 'packing';

type DetailPanel = 'dates' | 'places' | 'people';
type StoreApi = ReturnType<typeof useStyleMemoryStore>;

const categoryLabels: Record<WardrobeCategory, string> = {
  haut: 'Haut',
  bas: 'Bas',
  robe: 'Robe',
  veste: 'Veste',
  chaussures: 'Chaussures',
  accessoire: 'Acc.',
  sac: 'Sac',
};

const seasons: Season[] = ['printemps', 'ete', 'automne', 'hiver'];

const cx = (...classes: Array<string | false | undefined>) => classes.filter(Boolean).join(' ');

const menuItems = [
  { screen: 'silhouettes' as const, label: 'Mes Silhouettes', icon: Shirt },
  { screen: 'calendar' as const, label: 'Mon Calendrier', icon: CalendarDays },
  { screen: 'impact' as const, label: 'Impact Ecologique', icon: Leaf },
  { screen: 'packing' as const, label: 'Faire sa Valise', icon: Luggage },
  { screen: 'appointment' as const, label: 'Preparer un Rendez-vous', icon: Users },
];

const primaryButton =
  'inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-graphite px-5 py-3 text-sm font-bold text-chalk transition hover:bg-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta';
const secondaryButton =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-mist bg-chalk px-4 py-2 text-sm font-bold text-graphite transition hover:border-terracotta';
const chipButton =
  'rounded-full border px-3 py-2 text-sm font-bold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta';

export default function App() {
  const {
    state,
    addWardrobeItem,
    addSilhouette,
    addMemoryPhoto,
    addAppointment,
    addPackingPlan,
    resetDemo,
  } = useStyleMemoryStore();
  const [screen, setScreen] = useState<Screen>('onboarding');
  const [selectedSilhouetteId, setSelectedSilhouetteId] = useState(state.silhouettes[0]?.id ?? '');
  const [createPresetId, setCreatePresetId] = useState<string | undefined>();
  const selectedSilhouette = state.silhouettes.find((silhouette) => silhouette.id === selectedSilhouetteId) ?? state.silhouettes[0];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [screen]);

  const goHome = () => setScreen('menu');
  const openDetail = (id: string) => {
    setSelectedSilhouetteId(id);
    setScreen('detail');
  };
  const openCreate = (presetId?: string) => {
    setCreatePresetId(presetId);
    setScreen('create');
  };

  if (screen === 'onboarding') {
    return <OnboardingScreen onStart={() => setScreen('menu')} />;
  }

  return (
    <ScreenShell
      title={screen === 'menu' ? undefined : titleForScreen(screen)}
      onBack={screen === 'menu' ? undefined : goHome}
      onHome={goHome}
      onReset={resetDemo}
    >
      {screen === 'menu' && <MenuScreen onNavigate={setScreen} />}
      {screen === 'silhouettes' && (
        <SilhouettesScreen
          state={state}
          onCreate={() => openCreate()}
          onOpenDetail={openDetail}
        />
      )}
      {screen === 'detail' && selectedSilhouette && (
        <DetailScreen
          silhouette={selectedSilhouette}
          state={state}
          onAddPhoto={addMemoryPhoto}
          onCreateFromPreset={() => openCreate(selectedSilhouette.id)}
        />
      )}
      {screen === 'create' && (
        <CreateSilhouetteScreen
          key={createPresetId ?? 'empty-create'}
          state={state}
          presetId={createPresetId}
          onAddItem={addWardrobeItem}
          onSave={(draft) => {
            const created = addSilhouette(draft);
            if (created) {
              setSelectedSilhouetteId(created.id);
              setScreen('detail');
            }
          }}
        />
      )}
      {screen === 'appointment' && (
        <AppointmentScreen
          state={state}
          onOpenDetail={openDetail}
          onCreateFromPreset={openCreate}
          onSaveAppointment={addAppointment}
        />
      )}
      {screen === 'calendar' && <CalendarScreen state={state} onOpenDetail={openDetail} />}
      {screen === 'impact' && <ImpactScreen state={state} />}
      {screen === 'packing' && (
        <PackingScreen
          state={state}
          onSavePlan={addPackingPlan}
          onOpenDetail={openDetail}
        />
      )}
    </ScreenShell>
  );
}

const titleForScreen = (screen: Screen) => {
  const titles: Record<Screen, string> = {
    onboarding: 'Accueil',
    menu: 'Menu',
    silhouettes: 'Mes Silhouettes',
    detail: 'Detail silhouette',
    create: 'Creer une silhouette',
    appointment: 'Preparer un rendez-vous',
    calendar: 'Mon calendrier',
    impact: 'Impact ecologique',
    packing: 'Faire sa valise',
  };
  return titles[screen];
};

const OnboardingScreen = ({ onStart }: { onStart: () => void }) => {
  const [showMore, setShowMore] = useState(false);

  return (
    <main className="min-h-dvh bg-pearl text-graphite">
      <div className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col bg-chalk">
        <section className="relative min-h-[52dvh] overflow-hidden bg-[#efe6db] px-5 pb-8 pt-8">
          <div className="absolute inset-x-5 top-8 flex items-center justify-between">
            <p className="text-xl font-black">Style<span className="text-terracotta">*</span>Memory</p>
            <button
              type="button"
              className="grid h-10 w-10 place-items-center rounded-full bg-chalk/80 text-graphite shadow-soft"
              onClick={() => setShowMore(true)}
              aria-label="En savoir plus"
            >
              <Info size={17} />
            </button>
          </div>
          <div className="absolute inset-x-0 bottom-0 h-52 bg-gradient-to-t from-chalk to-transparent" />
          <div className="relative mx-auto mt-20 grid max-w-sm grid-cols-[1fr_0.88fr] items-end gap-3">
            <div className="rounded-[2rem] bg-chalk/74 p-4 shadow-soft">
              <ClothingGraphic
                item={{
                  id: 'hero-shirt',
                  name: 'Chemise capsule',
                  category: 'haut',
                  material: 'lin',
                  origin: 'Geneve',
                  maker: 'Claire Germain',
                  tags: ['#lin'],
                  ecoScore: 88,
                  source: 'claire',
                  color: '#fffaf0',
                }}
                className="h-52 w-full"
              />
            </div>
            <div className="space-y-3">
              <div className="rounded-[1.5rem] bg-chalk/82 p-3 shadow-soft">
                <ClothingGraphic
                  item={{
                    id: 'hero-trousers',
                    name: 'Pantalon lin',
                    category: 'bas',
                    material: 'lin',
                    origin: 'France',
                    maker: 'Claire',
                    tags: ['#base'],
                    ecoScore: 91,
                    source: 'claire',
                    color: '#eadfce',
                  }}
                  className="h-40 w-full"
                />
              </div>
              <div className="rounded-[1.5rem] bg-terracotta p-4 text-chalk shadow-soft">
                <Sparkles size={24} />
                <p className="mt-3 text-sm font-bold">Moins de pieces. Plus de memoire.</p>
              </div>
            </div>
          </div>
        </section>
        <section className="flex flex-1 flex-col justify-between px-5 pb-8 pt-8">
          <div className="space-y-5">
            <h1 className="text-4xl font-black leading-none">Style Memory App</h1>
            <p className="max-w-xl text-lg leading-8 text-stone">
              Une application simple et ludique pour voir ce que l'on porte vraiment, recomposer son vestiaire et garder une trace des moments.
            </p>
            <p className="text-base leading-7 text-stone">
              Le prototype montre comment vivre avec moins de vetements sans perdre la creativite: silhouettes, photos memoire, rendez-vous, valise et impact.
            </p>
          </div>
          <div className="mt-10 flex flex-col gap-3">
            <button type="button" className={primaryButton} onClick={onStart}>
              Commencer <ChevronRight size={18} />
            </button>
            <button type="button" className={secondaryButton} onClick={() => setShowMore(true)}>
              En savoir plus
            </button>
          </div>
        </section>
      </div>
      {showMore && (
        <Modal title="Vision" onClose={() => setShowMore(false)}>
          <p className="text-base leading-7 text-stone">
            Au-dela des discours, Style*Memory rend visible une mode responsable: connaitre ses pieces, rejouer ses silhouettes, et apprendre a consommer moins et mieux.
          </p>
        </Modal>
      )}
    </main>
  );
};

const MenuScreen = ({ onNavigate }: { onNavigate: (screen: Screen) => void }) => (
  <section className="flex min-h-[calc(100dvh-6rem)] flex-col justify-between">
    <div className="space-y-8">
      <div>
        <p className="text-sm font-bold uppercase tracking-[0.24em] text-terracotta">Prototype Claire Germain</p>
        <h1 className="mt-3 text-4xl font-black leading-tight">Memoire calme du vestiaire.</h1>
      </div>
      <div className="space-y-3">
        {menuItems.map(({ screen, label, icon: Icon }) => (
          <button
            key={screen}
            type="button"
            className="flex w-full items-center justify-between rounded-[1.5rem] border border-mist bg-pearl/35 p-4 text-left transition hover:border-terracotta hover:bg-pearl"
            onClick={() => onNavigate(screen)}
          >
            <span className="flex items-center gap-4">
              <span className="grid h-12 w-12 place-items-center rounded-full bg-chalk text-terracotta shadow-sm">
                <Icon size={21} />
              </span>
              <span className="text-lg font-black">{label}</span>
            </span>
            <ChevronRight size={20} />
          </button>
        ))}
      </div>
    </div>
    <div className="mt-10 rounded-[1.5rem] bg-graphite p-5 text-chalk">
      <p className="text-3xl font-black">4</p>
      <p className="mt-1 text-sm text-chalk/70">silhouettes pre-creees pour la demo</p>
    </div>
  </section>
);

interface AppStateProp {
  state: ReturnType<typeof useStyleMemoryStore>['state'];
}

const SilhouettesScreen = ({
  state,
  onCreate,
  onOpenDetail,
}: AppStateProp & { onCreate: () => void; onOpenDetail: (id: string) => void }) => {
  const [showAccessories, setShowAccessories] = useState(true);
  const [query, setQuery] = useState('');
  const [place, setPlace] = useState('');
  const [person, setPerson] = useState('');
  const [season, setSeason] = useState('');

  const filtered = useMemo(
    () => filterSilhouettes(state.silhouettes, { query, place, person, season }, state.wardrobe),
    [person, place, query, season, state.silhouettes, state.wardrobe],
  );

  return (
    <section className="space-y-5">
      <div className="rounded-[1.5rem] bg-pearl/55 p-4">
        <div className="flex items-center gap-2 rounded-full border border-mist bg-chalk px-4 py-3">
          <Search size={17} className="text-stone" />
          <input
            className="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-stone/70"
            placeholder="Lieu, personne, piece..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <SelectPill label="Lieu" value={place} onChange={setPlace} options={placesSeed} />
          <SelectPill label="Personne" value={person} onChange={setPerson} options={peopleSeed} />
          <SelectPill label="Saison" value={season} onChange={setSeason} options={seasons} />
          <button
            type="button"
            className={cx(chipButton, showAccessories ? 'border-terracotta bg-terracotta text-chalk' : 'border-mist bg-chalk text-graphite')}
            onClick={() => setShowAccessories((current) => !current)}
          >
            {showAccessories ? 'Avec accessoires' : 'Sans accessoires'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {filtered.map((silhouette) => {
          const baseItems = itemsByIds(state.wardrobe, silhouette.baseItemIds);
          const accessoryItems = itemsByIds(state.wardrobe, silhouette.accessoryItemIds);
          return (
            <button
              key={silhouette.id}
              type="button"
              className="relative rounded-[1.5rem] border border-mist bg-chalk p-3 text-left shadow-sm transition hover:border-terracotta"
              onClick={() => onOpenDetail(silhouette.id)}
            >
              <span className="absolute right-3 top-3 z-10 rounded-full bg-graphite px-2.5 py-1 text-xs font-black text-chalk">
                {silhouette.usageCount}x
              </span>
              <SilhouetteCanvas baseItems={baseItems} accessoryItems={accessoryItems} showAccessories={showAccessories} compact />
              <h2 className="mt-3 line-clamp-2 text-sm font-black leading-tight">{silhouette.name}</h2>
              <p className="mt-1 text-xs font-bold text-stone">{silhouette.place} · {compactDateLabel(silhouette.firstDate)}</p>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        className="fixed bottom-5 right-[max(1.25rem,calc((100vw-48rem)/2+1.25rem))] z-20 grid h-16 w-16 place-items-center rounded-full bg-terracotta text-chalk shadow-soft"
        onClick={onCreate}
        aria-label="Creer une silhouette"
      >
        <Plus size={26} />
      </button>
    </section>
  );
};

const SelectPill = ({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) => (
  <label className="relative">
    <span className="sr-only">{label}</span>
    <select
      className="h-11 w-full rounded-full border border-mist bg-chalk px-3 text-sm font-bold text-graphite outline-none"
      value={value}
      onChange={(event) => onChange(event.target.value)}
    >
      <option value="">{label}</option>
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  </label>
);

const DetailScreen = ({
  silhouette,
  state,
  onAddPhoto,
  onCreateFromPreset,
}: AppStateProp & {
  silhouette: Silhouette;
  onAddPhoto: (silhouetteId: string, src: string) => void;
  onCreateFromPreset: () => void;
}) => {
  const [showAccessories, setShowAccessories] = useState(true);
  const [view, setView] = useState<'silhouette' | 'photo'>('silhouette');
  const [panel, setPanel] = useState<DetailPanel>('dates');
  const [selectedItem, setSelectedItem] = useState<WardrobeItem | null>(null);
  const [uploading, setUploading] = useState(false);
  const baseItems = itemsByIds(state.wardrobe, silhouette.baseItemIds);
  const accessoryItems = itemsByIds(state.wardrobe, silhouette.accessoryItemIds);
  const photos = silhouette.memoryPhotoIds
    .map((id) => state.memoryPhotos.find((photo) => photo.id === id))
    .filter((photo): photo is NonNullable<typeof photo> => Boolean(photo));

  const handleUpload = async (file: File | undefined) => {
    if (!file) return;
    setUploading(true);
    try {
      const src = await compressImageFile(file);
      onAddPhoto(silhouette.id, src);
      setView('photo');
    } finally {
      setUploading(false);
    }
  };

  return (
    <section className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-terracotta">Silhouette utilisee</p>
          <h2 className="mt-1 text-2xl font-black leading-tight">{silhouette.name}</h2>
        </div>
        <button
          type="button"
          className={secondaryButton}
          onClick={() => setShowAccessories((current) => !current)}
        >
          {showAccessories ? 'Accessoirisee' : 'Base'}
        </button>
      </div>

      <div className="relative">
        {view === 'silhouette' ? (
          <SilhouetteCanvas
            baseItems={baseItems}
            accessoryItems={accessoryItems}
            showAccessories={showAccessories}
            onItemClick={setSelectedItem}
          />
        ) : photos[0] ? (
          <img
            src={photos[0].src}
            alt={`Photo memoire ${silhouette.name}`}
            className="mx-auto h-[26rem] w-full max-w-sm rounded-[2rem] object-cover shadow-soft"
          />
        ) : (
          <div className="mx-auto grid h-[26rem] w-full max-w-sm place-items-center rounded-[2rem] border border-dashed border-stone/40 bg-pearl/55 p-6 text-center">
            <div>
              <Camera className="mx-auto text-terracotta" size={36} />
              <p className="mt-3 font-black">Aucune photo memoire</p>
            </div>
          </div>
        )}
        <button
          type="button"
          className="absolute right-1 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-chalk/88 text-graphite shadow-soft"
          onClick={() => setView((current) => (current === 'silhouette' ? 'photo' : 'silhouette'))}
          aria-label="Basculer silhouette photo"
        >
          <ChevronRight size={24} />
        </button>
      </div>

      <div className="flex items-center justify-center gap-3">
        <CircleDot className={view === 'silhouette' ? 'fill-graphite text-graphite' : 'text-stone'} size={19} />
        <CircleDot className={view === 'photo' ? 'fill-graphite text-graphite' : 'text-stone'} size={19} />
      </div>

      <div className="flex flex-wrap gap-2">
        <label className={primaryButton}>
          <ImageUp size={18} />
          {uploading ? 'Ajout...' : 'Ajouter photo memoire'}
          <input className="hidden" type="file" accept="image/*" onChange={(event) => void handleUpload(event.target.files?.[0])} />
        </label>
        <button type="button" className={secondaryButton} onClick={onCreateFromPreset}>
          <Wand2 size={17} /> Premix
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <PanelButton label="Dates" icon={CalendarDays} active={panel === 'dates'} onClick={() => setPanel('dates')} />
        <PanelButton label="Lieux" icon={MapPin} active={panel === 'places'} onClick={() => setPanel('places')} />
        <PanelButton label="Personnes" icon={Users} active={panel === 'people'} onClick={() => setPanel('people')} />
      </div>
      <DetailPanelView panel={panel} silhouette={silhouette} photos={photos} />

      <section className="rounded-[1.5rem] bg-pearl/55 p-4">
        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-stone">Metadonnees</h3>
        <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
          <Meta label="Lieu" value={silhouette.place} />
          <Meta label="Date" value={dateLabel(silhouette.firstDate)} />
          <Meta label="Objet" value={silhouette.appointmentReason} />
          <Meta label="Rappel" value={silhouette.reminderEnabled ? 'Actif fictif' : 'Inactif'} />
        </dl>
        <p className="mt-4 text-sm leading-6 text-stone">{silhouette.comment}</p>
      </section>

      {selectedItem && (
        <Modal title={selectedItem.name} onClose={() => setSelectedItem(null)}>
          <div className="grid grid-cols-[7rem_1fr] gap-4">
            <div className="rounded-[1.25rem] bg-pearl p-2">
              <ClothingGraphic item={selectedItem} className="h-36 w-full" />
            </div>
            <div className="space-y-2 text-sm text-stone">
              <p><strong className="text-graphite">Matiere:</strong> {selectedItem.material}</p>
              <p><strong className="text-graphite">Fabricant:</strong> {selectedItem.maker}</p>
              <p><strong className="text-graphite">Origine:</strong> {selectedItem.origin}</p>
              <p><strong className="text-graphite">Eco:</strong> {selectedItem.ecoScore}/100</p>
              <div className="flex flex-wrap gap-2 pt-2">
                {selectedItem.tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-mist px-2 py-1 text-xs font-bold text-graphite">{tag}</span>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </section>
  );
};

const PanelButton = ({
  label,
  icon: Icon,
  active,
  onClick,
}: {
  label: string;
  icon: typeof CalendarDays;
  active: boolean;
  onClick: () => void;
}) => (
  <button
    type="button"
    className={cx(
      'flex min-h-20 flex-col items-center justify-center gap-2 rounded-[1.25rem] border text-sm font-black',
      active ? 'border-terracotta bg-terracotta text-chalk' : 'border-mist bg-chalk text-stone',
    )}
    onClick={onClick}
  >
    <Icon size={22} />
    {label}
  </button>
);

const DetailPanelView = ({
  panel,
  silhouette,
  photos,
}: {
  panel: DetailPanel;
  silhouette: Silhouette;
  photos: Array<{ id: string; date: string; place: string; people: string[] }>;
}) => {
  if (panel === 'places') {
    return (
      <section className="rounded-[1.5rem] bg-graphite p-4 text-chalk">
        <div className="relative h-40 overflow-hidden rounded-[1rem] bg-chalk/10">
          <div className="absolute inset-0 grid grid-cols-5 grid-rows-4 opacity-25">
            {Array.from({ length: 20 }).map((_, index) => <span key={index} className="border border-chalk/30" />)}
          </div>
          <MapPin className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 fill-terracotta text-terracotta" size={42} />
        </div>
        <p className="mt-3 text-sm font-bold">{silhouette.place}</p>
      </section>
    );
  }

  if (panel === 'people') {
    return (
      <section className="rounded-[1.5rem] bg-pearl/55 p-4">
        <div className="flex flex-wrap gap-2">
          {silhouette.people.map((person) => (
            <span key={person} className="inline-flex items-center gap-2 rounded-full bg-chalk px-3 py-2 text-sm font-bold">
              <UserRound size={16} /> {person}
            </span>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-[1.5rem] bg-pearl/55 p-4">
      <div className="space-y-3">
        {[silhouette.firstDate, ...photos.map((photo) => photo.date)].map((date, index) => (
          <div key={`${date}-${index}`} className="flex items-center justify-between rounded-[1rem] bg-chalk px-3 py-3">
            <span className="font-bold">{dateLabel(date)}</span>
            <span className="text-sm text-stone">{index === 0 ? 'Premiere utilisation' : 'Photo memoire'}</span>
          </div>
        ))}
      </div>
    </section>
  );
};

const Meta = ({ label, value }: { label: string; value: string }) => (
  <div>
    <dt className="text-xs font-black uppercase tracking-[0.2em] text-stone">{label}</dt>
    <dd className="mt-1 font-bold text-graphite">{value}</dd>
  </div>
);

const CreateSilhouetteScreen = ({
  state,
  presetId,
  onAddItem,
  onSave,
}: AppStateProp & {
  presetId?: string;
  onAddItem: StoreApi['addWardrobeItem'];
  onSave: (draft: CreateSilhouetteDraft) => void;
}) => {
  const preset = presetId ? state.silhouettes.find((silhouette) => silhouette.id === presetId) : undefined;
  const presetItems = preset ? itemsByIds(state.wardrobe, [...preset.baseItemIds, ...preset.accessoryItemIds]) : [];
  const [step, setStep] = useState(1);
  const [selected, setSelected] = useState<Partial<Record<WardrobeCategory, string>>>(() => {
    const initial: Partial<Record<WardrobeCategory, string>> = {};
    presetItems.forEach((item) => {
      if (item.category !== 'accessoire' && item.category !== 'sac') initial[item.category] = item.id;
    });
    if (!preset) {
      initial.haut = 'pull-merinos-gris';
      initial.bas = 'pantalon-lin-beige';
      initial.chaussures = 'sneakers-blanches';
    }
    return initial;
  });
  const [accessoryIds, setAccessoryIds] = useState<string[]>(() => presetItems.filter((item) => item.category === 'accessoire' || item.category === 'sac').map((item) => item.id));
  const [place, setPlace] = useState(preset?.place ?? 'Geneve');
  const [date, setDate] = useState('2026-06-12');
  const [people, setPeople] = useState<string[]>(preset?.people ?? ['Marie']);
  const [reason, setReason] = useState(preset?.appointmentReason ?? 'Rendez-vous');
  const [comment, setComment] = useState('');
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<WardrobeCategory>('haut');
  const [activeCreateCategory, setActiveCreateCategory] = useState<'haut' | 'bas' | 'accessoire'>('haut');

  const selectedBase = itemsByIds(state.wardrobe, Object.values(selected).filter((id): id is string => Boolean(id)));
  const selectedAccessories = itemsByIds(state.wardrobe, accessoryIds);
  const selectableCategories: WardrobeCategory[] = ['haut', 'robe', 'veste', 'bas', 'chaussures', 'accessoire', 'sac'];
  const shelfItems = state.wardrobe.filter((item) => {
    if (activeCreateCategory === 'haut') return item.category === 'haut' || item.category === 'robe' || item.category === 'veste';
    if (activeCreateCategory === 'bas') return item.category === 'bas';
    return item.category === 'accessoire' || item.category === 'sac' || item.category === 'chaussures';
  });

  const toggleAccessory = (id: string) => {
    setAccessoryIds((current) => (current.includes(id) ? current.filter((itemId) => itemId !== id) : [...current, id]));
  };

  const save = () => {
    onSave({
      selectedItemIds: selected,
      accessoryIds,
      place,
      date,
      people,
      reason,
      comment,
      reminderEnabled,
    });
  };

  return (
    <section className="space-y-5">
      <div className="flex gap-2">
        {[1, 2, 3].map((item) => (
          <span key={item} className={cx('h-2 flex-1 rounded-full', step >= item ? 'bg-terracotta' : 'bg-mist')} />
        ))}
      </div>

      {step === 1 && (
        <section className="space-y-4">
          <div className="relative">
            <SilhouetteCanvas baseItems={selectedBase} accessoryItems={selectedAccessories} showAccessories />
            <div className="absolute right-4 top-10 flex flex-col items-start gap-1">
              {(['haut', 'bas', 'accessoire'] as const).map((category) => (
                <button
                  key={category}
                  type="button"
                  className={cx(
                    'text-3xl font-black leading-none transition',
                    activeCreateCategory === category ? 'text-graphite' : 'text-stone/35',
                  )}
                  onClick={() => setActiveCreateCategory(category)}
                >
                  {category === 'accessoire' ? 'Acc' : categoryLabels[category]}
                </button>
              ))}
            </div>
          </div>

          <div className="-mx-4 overflow-x-auto px-4">
            <div className="flex min-w-max gap-3 pb-1">
              {shelfItems.map((item) => {
                const active =
                  item.category === 'accessoire' || item.category === 'sac' || item.category === 'chaussures'
                    ? accessoryIds.includes(item.id) || selected.chaussures === item.id
                    : selected[item.category] === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    className={cx(
                      'w-24 rounded-[1.25rem] border bg-chalk p-2 text-left shadow-sm',
                      active ? 'border-terracotta' : 'border-mist',
                    )}
                    onClick={() => {
                      if (item.category === 'accessoire' || item.category === 'sac') toggleAccessory(item.id);
                      else setSelected((current) => ({ ...current, [item.category]: item.id }));
                    }}
                    aria-label={`Choisir ${item.name}`}
                  >
                    <ClothingGraphic item={item} className="h-20 w-full" />
                    <span className="mt-1 block truncate text-xs font-black">{item.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {(['haut', 'bas', 'accessoire'] as const).map((category) => (
              <button
                key={category}
                type="button"
                className={cx(chipButton, activeCreateCategory === category ? 'border-terracotta bg-terracotta text-chalk' : 'border-mist bg-chalk text-graphite')}
                onClick={() => setActiveCreateCategory(category)}
              >
                {category === 'accessoire' ? 'Accessoires' : categoryLabels[category]}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button type="button" className={secondaryButton} onClick={() => setStep(2)}>
              Mes pieces
            </button>
            <button type="button" className={primaryButton} onClick={() => setStep(3)}>
              Continuer <ChevronRight size={18} />
            </button>
          </div>
        </section>
      )}

      {step === 2 && (
        <section className="space-y-5">
          {selectableCategories.map((category) => {
            const items = state.wardrobe.filter((item) => item.category === category);
            return (
              <div key={category}>
                <h2 className="mb-2 text-lg font-black">{categoryLabels[category]}</h2>
                <div className="grid grid-cols-2 gap-2">
                  {items.map((item) => {
                    const isAccessory = category === 'accessoire' || category === 'sac';
                    const active = isAccessory ? accessoryIds.includes(item.id) : selected[category] === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        className={cx(
                          'rounded-[1.25rem] border p-3 text-left transition',
                          active ? 'border-terracotta bg-terracotta/10' : 'border-mist bg-chalk',
                        )}
                        onClick={() => (isAccessory ? toggleAccessory(item.id) : setSelected((current) => ({ ...current, [category]: item.id })))}
                      >
                        <ClothingGraphic item={item} className="mx-auto h-24 w-full" />
                        <p className="mt-2 text-sm font-black">{item.name}</p>
                        <p className="text-xs text-stone">{item.material}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
          <div className="rounded-[1.5rem] bg-pearl/55 p-4">
            <h2 className="text-lg font-black">Mes pieces</h2>
            <div className="mt-3 grid grid-cols-[1fr_auto] gap-2">
              <input
                className="min-h-11 rounded-full border border-mist bg-chalk px-4 outline-none"
                placeholder="Nom de la piece"
                value={newItemName}
                onChange={(event) => setNewItemName(event.target.value)}
              />
              <select
                className="min-h-11 rounded-full border border-mist bg-chalk px-3 text-sm font-bold outline-none"
                value={newItemCategory}
                onChange={(event) => setNewItemCategory(event.target.value as WardrobeCategory)}
              >
                {selectableCategories.map((category) => <option key={category} value={category}>{categoryLabels[category]}</option>)}
              </select>
            </div>
            <button
              type="button"
              className={cx(secondaryButton, 'mt-3')}
              onClick={() => {
                if (!newItemName.trim()) return;
                const item = onAddItem({
                  name: newItemName.trim(),
                  category: newItemCategory,
                  material: 'matiere renseignee plus tard',
                  origin: 'personnel',
                  maker: 'Utilisateur',
                  tags: ['#mespieces'],
                });
                if (newItemCategory === 'accessoire' || newItemCategory === 'sac') toggleAccessory(item.id);
                else setSelected((current) => ({ ...current, [newItemCategory]: item.id }));
                setNewItemName('');
              }}
            >
              <Plus size={17} /> Ajouter
            </button>
          </div>
          <div className="flex gap-2">
            <button type="button" className={secondaryButton} onClick={() => setStep(1)}>Retour</button>
            <button type="button" className={primaryButton} onClick={() => setStep(3)}>Valider les pieces</button>
          </div>
        </section>
      )}

      {step === 3 && (
        <section className="space-y-4">
          <SilhouetteCanvas baseItems={selectedBase} accessoryItems={selectedAccessories} showAccessories compact />
          <FormField label="Lieu">
            <select className="form-input" value={place} onChange={(event) => setPlace(event.target.value)}>
              {placesSeed.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </FormField>
          <FormField label="Date">
            <input className="form-input" type="date" value={date} onChange={(event) => setDate(event.target.value)} />
          </FormField>
          <FormField label="Personnes">
            <div className="flex flex-wrap gap-2">
              {peopleSeed.map((person) => (
                <button
                  key={person}
                  type="button"
                  className={cx(chipButton, people.includes(person) ? 'border-terracotta bg-terracotta text-chalk' : 'border-mist bg-chalk text-graphite')}
                  onClick={() => setPeople((current) => (current.includes(person) ? current.filter((item) => item !== person) : [...current, person]))}
                >
                  {person}
                </button>
              ))}
            </div>
          </FormField>
          <FormField label="Objet du rendez-vous">
            <input className="form-input" value={reason} onChange={(event) => setReason(event.target.value)} />
          </FormField>
          <FormField label="Commentaire">
            <textarea className="form-input min-h-24 rounded-[1.25rem] py-3" value={comment} onChange={(event) => setComment(event.target.value)} />
          </FormField>
          <label className="flex items-center justify-between rounded-[1.25rem] bg-pearl/55 p-4 font-bold">
            Rappel fictif veille + sur place
            <input type="checkbox" checked={reminderEnabled} onChange={(event) => setReminderEnabled(event.target.checked)} />
          </label>
          <button type="button" className={primaryButton} onClick={save}>
            <Check size={18} /> Valider
          </button>
        </section>
      )}
    </section>
  );
};

const FormField = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <label className="block">
    <span className="mb-2 block text-sm font-black text-stone">{label}</span>
    {children}
  </label>
);

const AppointmentScreen = ({
  state,
  onOpenDetail,
  onCreateFromPreset,
  onSaveAppointment,
}: AppStateProp & {
  onOpenDetail: (id: string) => void;
  onCreateFromPreset: (presetId?: string) => void;
  onSaveAppointment: ReturnType<typeof useStyleMemoryStore>['addAppointment'];
}) => {
  const [person, setPerson] = useState('Marie');
  const [place, setPlace] = useState('Geneve');
  const [date, setDate] = useState('2026-06-19');
  const history = state.silhouettes.filter((silhouette) => silhouette.people.includes(person));
  const photoIds = new Set(history.flatMap((silhouette) => silhouette.memoryPhotoIds));
  const photos = state.memoryPhotos.filter((photo) => photoIds.has(photo.id));

  return (
    <section className="space-y-5">
      <FormField label="Avec qui ?">
        <input className="form-input" value={person} onChange={(event) => setPerson(event.target.value)} list="people" />
        <datalist id="people">{peopleSeed.map((item) => <option key={item} value={item} />)}</datalist>
      </FormField>

      <section className="relative min-h-64 overflow-hidden rounded-[1.75rem] bg-ink p-4 text-chalk">
        <div className="absolute inset-0 flex animate-memory gap-4 opacity-60">
          {[...photos, ...photos, ...photos].map((photo, index) => (
            <img key={`${photo.id}-${index}`} src={photo.src} alt="" className="h-64 w-44 rounded-[1.25rem] object-cover blur-[1px]" />
          ))}
        </div>
        <div className="relative z-10 max-w-xs">
          <p className="text-sm font-bold uppercase tracking-[0.22em] text-chalk/60">Memoire</p>
          <h2 className="mt-3 text-3xl font-black">{person || 'Personne'}</h2>
          <p className="mt-3 text-sm leading-6 text-chalk/72">{history.length} silhouettes deja portees ensemble.</p>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-black">Historique</h2>
        {history.map((silhouette) => (
          <div key={silhouette.id} className="flex items-center gap-3 rounded-[1.5rem] border border-mist bg-chalk p-3">
            <SilhouetteCanvas
              baseItems={itemsByIds(state.wardrobe, silhouette.baseItemIds)}
              accessoryItems={itemsByIds(state.wardrobe, silhouette.accessoryItemIds)}
              compact
            />
            <div className="min-w-0 flex-1">
              <h3 className="line-clamp-2 font-black">{silhouette.name}</h3>
              <p className="mt-1 text-sm text-stone">{silhouette.place} · {dateLabel(silhouette.firstDate)}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button type="button" className={secondaryButton} onClick={() => onOpenDetail(silhouette.id)}>Voir</button>
                <button type="button" className={secondaryButton} onClick={() => onCreateFromPreset(silhouette.id)}>Premix</button>
              </div>
            </div>
          </div>
        ))}
      </section>

      <section className="rounded-[1.5rem] bg-pearl/55 p-4">
        <h2 className="text-xl font-black">Nouveau rendez-vous</h2>
        <div className="mt-4 grid gap-3">
          <select className="form-input" value={place} onChange={(event) => setPlace(event.target.value)}>
            {placesSeed.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
          <input className="form-input" type="date" value={date} onChange={(event) => setDate(event.target.value)} />
          <button
            type="button"
            className={primaryButton}
            onClick={() => {
              onSaveAppointment({ person, place, date, draftItemIds: [], silhouetteId: history[0]?.id });
              onCreateFromPreset(history[0]?.id);
            }}
          >
            Preparer la silhouette
          </button>
        </div>
      </section>
    </section>
  );
};

const CalendarScreen = ({ state, onOpenDetail }: AppStateProp & { onOpenDetail: (id: string) => void }) => {
  const [mode, setMode] = useState<'month' | 'timeline'>('month');
  const visibleSilhouettes = state.silhouettes.filter((silhouette) => silhouette.memoryPhotoIds.length > 0);
  const days = Array.from({ length: 30 }, (_, index) => index + 1);
  const silhouetteByDay = new Map(visibleSilhouettes.map((silhouette) => [new Date(silhouette.firstDate).getDate(), silhouette]));

  return (
    <section className="space-y-5">
      <div className="flex rounded-full bg-pearl p-1">
        <button type="button" className={cx('h-11 flex-1 rounded-full font-black', mode === 'month' ? 'bg-chalk shadow-sm' : 'text-stone')} onClick={() => setMode('month')}>Mois</button>
        <button type="button" className={cx('h-11 flex-1 rounded-full font-black', mode === 'timeline' ? 'bg-chalk shadow-sm' : 'text-stone')} onClick={() => setMode('timeline')}>Frise</button>
      </div>
      {mode === 'month' ? (
        <div className="grid grid-cols-7 gap-1">
          {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((item, index) => <span key={`${item}-${index}`} className="py-2 text-center text-xs font-black text-stone">{item}</span>)}
          {days.map((day) => {
            const silhouette = silhouetteByDay.get(day);
            return (
              <button
                key={day}
                type="button"
                className={cx('min-h-20 rounded-[1rem] border p-1 text-left', silhouette ? 'border-terracotta bg-chalk' : 'border-mist bg-pearl/35')}
                onClick={() => silhouette && onOpenDetail(silhouette.id)}
              >
                <span className="text-xs font-black">{day}</span>
                {silhouette && <CalendarThumbnail items={itemsByIds(state.wardrobe, [...silhouette.baseItemIds, ...silhouette.accessoryItemIds])} />}
              </button>
            );
          })}
        </div>
      ) : (
        <div className="space-y-3">
          {visibleSilhouettes
            .slice()
            .sort((a, b) => a.firstDate.localeCompare(b.firstDate))
            .map((silhouette) => (
              <button key={silhouette.id} type="button" className="flex w-full gap-3 rounded-[1.5rem] bg-pearl/55 p-3 text-left" onClick={() => onOpenDetail(silhouette.id)}>
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-terracotta text-sm font-black text-chalk">{compactDateLabel(silhouette.firstDate)}</span>
                <span>
                  <span className="block font-black">{silhouette.name}</span>
                  <span className="mt-1 block text-sm text-stone">{silhouette.place} · {silhouette.people.join(', ')}</span>
                </span>
              </button>
            ))}
        </div>
      )}
    </section>
  );
};

const CalendarThumbnail = ({ items }: { items: WardrobeItem[] }) => (
  <div className="mt-1 grid grid-cols-2 gap-1">
    {items.slice(0, 4).map((item) => (
      <span key={item.id} className="h-5 rounded-md border border-graphite/10" style={{ backgroundColor: item.color }} />
    ))}
  </div>
);

const ImpactScreen = ({ state }: AppStateProp) => {
  const metrics = calculateImpactMetrics(state);
  const stats = [
    ['Silhouettes', metrics.silhouetteCount],
    ['Pieces', metrics.wardrobeCount],
    ['Utilisations', metrics.totalUses],
    ['Rotation', `${metrics.rotationRate}%`],
  ];

  return (
    <section className="space-y-5">
      <div className="grid grid-cols-2 gap-3">
        {stats.map(([label, value]) => (
          <div key={label} className="rounded-[1.5rem] bg-pearl/55 p-4">
            <p className="text-3xl font-black">{value}</p>
            <p className="mt-1 text-sm font-bold text-stone">{label}</p>
          </div>
        ))}
      </div>
      <section className="rounded-[1.75rem] bg-graphite p-5 text-chalk">
        <Leaf size={30} className="text-sage" />
        <p className="mt-4 text-4xl font-black">{metrics.estimatedFootprint} kg</p>
        <p className="mt-2 text-sm leading-6 text-chalk/70">Empreinte fictive estimee selon les matieres renseignees et le nombre de reutilisations.</p>
      </section>
      <section className="rounded-[1.5rem] bg-sage/15 p-4">
        <h2 className="text-xl font-black">Encouragement</h2>
        <p className="mt-2 leading-7 text-stone">
          Le vestiaire tourne deja a {metrics.rotationRate}%. La prochaine victoire: rejouer une silhouette existante avant d'ajouter une nouvelle piece.
        </p>
      </section>
    </section>
  );
};

const PackingScreen = ({
  state,
  onSavePlan,
  onOpenDetail,
}: AppStateProp & {
  onSavePlan: ReturnType<typeof useStyleMemoryStore>['addPackingPlan'];
  onOpenDetail: (id: string) => void;
}) => {
  const [destination, setDestination] = useState('Barcelone');
  const [startDate, setStartDate] = useState('2026-07-04');
  const [endDate, setEndDate] = useState('2026-07-07');
  const [selectedIds, setSelectedIds] = useState<string[]>(state.silhouettes.slice(0, 2).map((silhouette) => silhouette.id));
  const selectedSilhouettes = state.silhouettes.filter((silhouette) => selectedIds.includes(silhouette.id));
  const checklist = buildPackingChecklist(selectedSilhouettes, state.wardrobe);
  const latestPlan = state.packingPlans[0];

  return (
    <section className="space-y-5">
      <section className="rounded-[1.5rem] bg-pearl/55 p-4">
        <div className="grid gap-3">
          <FormField label="Destination">
            <select className="form-input" value={destination} onChange={(event) => setDestination(event.target.value)}>
              {placesSeed.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Depart">
              <input className="form-input" type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
            </FormField>
            <FormField label="Retour">
              <input className="form-input" type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} />
            </FormField>
          </div>
        </div>
      </section>

      <section className="rounded-[1.5rem] bg-chalk p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <CloudSun className="text-terracotta" size={26} />
          <div>
            <p className="font-black">{weatherForDestination(destination)}</p>
            <p className="text-sm text-stone">Meteo fictive</p>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-black">Silhouettes a emporter</h2>
        {state.silhouettes.map((silhouette) => {
          const checked = selectedIds.includes(silhouette.id);
          return (
            <label key={silhouette.id} className="flex items-center gap-3 rounded-[1.5rem] border border-mist bg-chalk p-3">
              <input
                type="checkbox"
                checked={checked}
                onChange={(event) =>
                  setSelectedIds((current) =>
                    event.target.checked ? [...current, silhouette.id] : current.filter((id) => id !== silhouette.id),
                  )
                }
              />
              <span className="min-w-0 flex-1">
                <span className="block font-black">{silhouette.name}</span>
                <span className="text-sm text-stone">{silhouette.usageCount} utilisations</span>
              </span>
              <button type="button" className="grid h-10 w-10 place-items-center rounded-full bg-pearl text-graphite" onClick={() => onOpenDetail(silhouette.id)} aria-label={`Voir ${silhouette.name}`}>
                <ChevronRight size={18} />
              </button>
            </label>
          );
        })}
      </section>

      <section className="rounded-[1.5rem] bg-pearl/55 p-4">
        <h2 className="text-xl font-black">Checklist</h2>
        <ul className="mt-3 space-y-2">
          {checklist.map((item) => (
            <li key={item} className="flex items-center gap-2 rounded-full bg-chalk px-3 py-2 text-sm font-bold">
              <PackageCheck size={16} className="text-sage" /> {item}
            </li>
          ))}
        </ul>
        <button
          type="button"
          className={cx(primaryButton, 'mt-4 w-full')}
          onClick={() => onSavePlan(makePackingPlan(destination, startDate, endDate, selectedSilhouettes, state.wardrobe))}
        >
          Sauver la valise
        </button>
      </section>

      {latestPlan && (
        <section className="rounded-[1.5rem] bg-graphite p-4 text-chalk">
          <p className="text-sm font-bold text-chalk/60">Dernier plan</p>
          <h2 className="mt-1 text-xl font-black">{latestPlan.destination}</h2>
          <p className="mt-2 text-sm text-chalk/70">{latestPlan.checklist.length} pieces · {latestPlan.weather}</p>
        </section>
      )}
    </section>
  );
};
