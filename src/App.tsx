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
const atelierAsset = (file: string) => `assets/atelier/${file}`;

const menuItems = [
  { screen: 'silhouettes' as const, label: 'Mes Silhouettes', note: 'Lookbook personnel', image: atelierAsset('wardrobe-flatlay.jpg') },
  { screen: 'calendar' as const, label: 'Mon Calendrier', note: 'Archive des sorties', image: atelierAsset('calendar-still.jpg') },
  { screen: 'impact' as const, label: 'Impact Ecologique', note: 'Matiere et reutilisation', image: atelierAsset('textile-detail.jpg') },
  { screen: 'packing' as const, label: 'Faire sa Valise', note: 'Capsule de voyage', image: atelierAsset('packing-still.jpg') },
  { screen: 'appointment' as const, label: 'Preparer un Rendez-vous', note: 'Memoire relationnelle', image: atelierAsset('memory-photo.jpg') },
];

const primaryButton =
  'inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-graphite px-5 py-3 text-sm font-semibold text-chalk shadow-fine transition hover:bg-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta';
const secondaryButton =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-mist/90 bg-chalk px-4 py-2 text-sm font-semibold text-graphite transition hover:border-terracotta focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta';
const chipButton =
  'rounded-full border px-3 py-2 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta';

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
      onHome={screen === 'menu' ? undefined : goHome}
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
    detail: 'Silhouette',
    create: 'Creer une silhouette',
    appointment: 'Rendez-vous',
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
        <section className="relative flex min-h-[62dvh] overflow-hidden px-5 pb-6 pt-6">
          <img
            src={atelierAsset('atelier-hero.jpg')}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-chalk/96 via-chalk/38 to-chalk" />
          <div className="relative z-10 flex w-full flex-col">
            <div className="flex items-center justify-between">
              <p className="text-[1.08rem] font-bold tracking-tight">Style<span className="text-terracotta">*</span>Memory</p>
              <button
                type="button"
                className="grid h-10 w-10 place-items-center rounded-full border border-mist/80 bg-chalk/90 text-graphite shadow-fine"
                onClick={() => setShowMore(true)}
                aria-label="En savoir plus"
              >
                <Info size={17} />
              </button>
            </div>
            <div className="mt-28 max-w-[21rem]">
              <p className="fine-label text-terracotta">Archive de vestiaire</p>
              <h1 className="mt-3 font-display text-[4.05rem] font-semibold leading-[0.82] tracking-normal">
                Style
                <span className="text-terracotta">*</span>
                <br />
                Memory
              </h1>
            </div>
          </div>
        </section>
        <section className="flex flex-1 flex-col justify-between px-5 pb-8 pt-3">
          <div className="space-y-5">
            <p className="max-w-xl text-[1.08rem] leading-8 text-graphite/82">
              Une app mobile pour composer moins, mieux porter, et garder la memoire de chaque silhouette.
            </p>
            <div className="grid grid-cols-3 border-y border-mist/70 py-4 text-center">
              <div>
                <p className="font-display text-3xl font-semibold">4</p>
                <p className="mt-1 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-stone">Silhouettes</p>
              </div>
              <div className="border-x border-mist/70">
                <p className="font-display text-3xl font-semibold">3</p>
                <p className="mt-1 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-stone">Photos</p>
              </div>
              <div>
                <p className="font-display text-3xl font-semibold">1</p>
                <p className="mt-1 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-stone">Valise</p>
              </div>
            </div>
          </div>
          <div className="mt-8 flex flex-col gap-3">
            <button type="button" className={primaryButton} onClick={onStart}>
              Commencer <ChevronRight size={18} />
            </button>
            <button
              type="button"
              className={secondaryButton}
              onClick={() => setShowMore(true)}
            >
              Lire la vision
            </button>
          </div>
        </section>
      </div>
      {showMore && (
        <Modal title="Vision" onClose={() => setShowMore(false)}>
          <p className="text-[0.98rem] leading-7 text-stone">
            Style*Memory rend visible une mode responsable: connaitre ses pieces, rejouer ses silhouettes, et apprendre a consommer moins sans perdre la memoire des moments.
          </p>
        </Modal>
      )}
    </main>
  );
};

const MenuScreen = ({ onNavigate }: { onNavigate: (screen: Screen) => void }) => (
  <section className="flex min-h-[calc(100dvh-8rem)] flex-col justify-between">
    <div className="space-y-7">
      <div>
        <p className="fine-label text-terracotta">Prototype Claire Germain</p>
        <h1 className="mt-3 font-display text-[3.45rem] font-semibold leading-[0.92]">Memoire calme du vestiaire.</h1>
      </div>
      <div className="space-y-3.5">
        {menuItems.map(({ screen, label, note, image }) => (
          <button
            key={screen}
            type="button"
            className="group grid w-full grid-cols-[5.75rem_1fr_auto] items-center gap-4 border-b border-mist/70 pb-3 text-left transition hover:border-terracotta focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-terracotta"
            onClick={() => onNavigate(screen)}
          >
            <span className="block h-20 overflow-hidden rounded-2xl bg-pearl shadow-fine">
              <img src={image} alt="" className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
            </span>
            <span className="min-w-0">
              <span className="block text-[1.05rem] font-semibold">{label}</span>
              <span className="mt-1 block text-sm text-stone">{note}</span>
            </span>
            <ChevronRight size={19} className="text-stone transition group-hover:translate-x-0.5 group-hover:text-terracotta" />
          </button>
        ))}
      </div>
    </div>
    <div className="mt-10 border-t border-mist/70 pt-5">
      <p className="font-display text-4xl font-semibold leading-none">4</p>
      <p className="mt-1 text-sm text-stone">silhouettes pre-creees pour la demo</p>
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
    <section className="space-y-6">
      <div className="space-y-3 border-b border-mist/70 pb-5">
        <p className="fine-label">Lookbook personnel</p>
        <div className="flex items-center gap-2 rounded-2xl border border-mist/80 bg-chalk px-4 py-3">
          <Search size={17} className="text-stone" />
          <input
            className="min-w-0 flex-1 bg-transparent text-[0.95rem] font-medium outline-none placeholder:text-stone/70"
            placeholder="Lieu, personne, piece..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
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

      <div className="grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3">
        {filtered.map((silhouette) => {
          const baseItems = itemsByIds(state.wardrobe, silhouette.baseItemIds);
          const accessoryItems = itemsByIds(state.wardrobe, silhouette.accessoryItemIds);
          return (
            <button
              key={silhouette.id}
              type="button"
              className="group relative text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-terracotta"
              onClick={() => onOpenDetail(silhouette.id)}
            >
              <span className="absolute right-2 top-2 z-10 rounded-full bg-chalk/90 px-2.5 py-1 text-xs font-semibold text-graphite shadow-fine">
                {silhouette.usageCount}x
              </span>
              <SilhouetteCanvas baseItems={baseItems} accessoryItems={accessoryItems} showAccessories={showAccessories} compact />
              <h2 className="mt-3 line-clamp-2 text-[0.92rem] font-semibold leading-tight group-hover:text-terracotta">{silhouette.name}</h2>
              <p className="mt-1 text-xs font-medium text-stone">{silhouette.place} · {compactDateLabel(silhouette.firstDate)}</p>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        className="fixed bottom-5 right-[max(1.25rem,calc((100vw-48rem)/2+1.25rem))] z-20 grid h-14 w-14 place-items-center rounded-full bg-terracotta text-chalk shadow-soft transition hover:bg-graphite focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta"
        onClick={onCreate}
        aria-label="Creer une silhouette"
      >
        <Plus size={23} />
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
      className="h-11 w-full rounded-full border border-mist/90 bg-chalk px-3 text-sm font-semibold text-graphite outline-none transition focus:border-terracotta focus:ring-4 focus:ring-terracotta/10"
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
    <section className="space-y-6">
      <div className="flex items-start justify-between gap-3 border-b border-mist/70 pb-4">
        <div>
          <p className="fine-label text-terracotta">Silhouette utilisee</p>
          <h2 className="mt-2 font-display text-[2.08rem] font-semibold leading-[0.96]">{silhouette.name}</h2>
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
            className="mx-auto h-[27rem] w-full max-w-sm rounded-2xl object-cover shadow-soft"
          />
        ) : (
          <div className="relative mx-auto h-[27rem] w-full max-w-sm overflow-hidden rounded-2xl bg-pearl text-chalk shadow-soft">
            <img src={atelierAsset('memory-photo.jpg')} alt="" className="h-full w-full object-cover opacity-90" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/76 via-ink/10 to-transparent" />
            <div className="absolute inset-x-5 bottom-5">
              <Camera className="text-chalk" size={28} />
              <p className="mt-3 font-display text-3xl font-semibold">Aucune photo memoire</p>
              <p className="mt-2 text-sm leading-6 text-chalk/76">Ajoute une image pour transformer cette silhouette en souvenir.</p>
            </div>
          </div>
        )}
        <button
          type="button"
          className="absolute right-1 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full border border-mist/70 bg-chalk/90 text-graphite shadow-fine backdrop-blur"
          onClick={() => setView((current) => (current === 'silhouette' ? 'photo' : 'silhouette'))}
          aria-label="Basculer silhouette photo"
        >
          <ChevronRight size={24} />
        </button>
      </div>

      <div className="flex items-center justify-center gap-3">
        <CircleDot className={view === 'silhouette' ? 'fill-graphite text-graphite' : 'text-stone/55'} size={15} />
        <CircleDot className={view === 'photo' ? 'fill-graphite text-graphite' : 'text-stone/55'} size={15} />
      </div>

      <div className="flex flex-wrap gap-2 border-b border-mist/70 pb-5">
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

      <section className="border-t border-mist/70 pt-5">
        <h3 className="fine-label">Metadonnees</h3>
        <dl className="mt-4 grid grid-cols-2 gap-x-5 gap-y-4 text-sm">
          <Meta label="Lieu" value={silhouette.place} />
          <Meta label="Date" value={dateLabel(silhouette.firstDate)} />
          <Meta label="Objet" value={silhouette.appointmentReason} />
          <Meta label="Rappel" value={silhouette.reminderEnabled ? 'Actif fictif' : 'Inactif'} />
        </dl>
        <p className="mt-5 border-t border-mist/70 pt-4 text-sm leading-6 text-stone">{silhouette.comment}</p>
      </section>

      {selectedItem && (
        <Modal title={selectedItem.name} onClose={() => setSelectedItem(null)}>
          <div className="grid grid-cols-[7rem_1fr] gap-4">
            <div className="rounded-2xl bg-pearl p-2">
              <ClothingGraphic item={selectedItem} className="h-36 w-full" />
            </div>
            <div className="space-y-2 text-sm text-stone">
              <p><strong className="text-graphite">Matiere:</strong> {selectedItem.material}</p>
              <p><strong className="text-graphite">Fabricant:</strong> {selectedItem.maker}</p>
              <p><strong className="text-graphite">Origine:</strong> {selectedItem.origin}</p>
              <p><strong className="text-graphite">Eco:</strong> {selectedItem.ecoScore}/100</p>
              <div className="flex flex-wrap gap-2 pt-2">
                {selectedItem.tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-mist px-2 py-1 text-xs font-semibold text-graphite">{tag}</span>
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
      'flex min-h-14 items-center justify-center gap-2 rounded-full border text-sm font-semibold',
      active ? 'border-graphite bg-graphite text-chalk' : 'border-mist bg-chalk text-stone',
    )}
    onClick={onClick}
  >
    <Icon size={17} />
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
      <section className="overflow-hidden rounded-2xl bg-graphite text-chalk">
        <div className="relative h-44">
          <img src={atelierAsset('calendar-still.jpg')} alt="" className="h-full w-full object-cover opacity-60" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/88 via-ink/26 to-transparent" />
          <MapPin className="absolute bottom-5 left-5 fill-terracotta text-terracotta" size={30} />
        </div>
        <p className="px-5 py-4 text-sm font-semibold">{silhouette.place}</p>
      </section>
    );
  }

  if (panel === 'people') {
    return (
      <section className="rounded-2xl border border-mist/70 bg-pearl/35 p-4">
        <div className="flex flex-wrap gap-2">
          {silhouette.people.map((person) => (
            <span key={person} className="inline-flex items-center gap-2 rounded-full border border-mist/80 bg-chalk px-3 py-2 text-sm font-semibold">
              <UserRound size={16} /> {person}
            </span>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-mist/70 bg-pearl/35 p-4">
      <div className="space-y-2">
        {[silhouette.firstDate, ...photos.map((photo) => photo.date)].map((date, index) => (
          <div key={`${date}-${index}`} className="flex items-center justify-between border-b border-mist/70 py-3 last:border-b-0">
            <span className="font-semibold">{dateLabel(date)}</span>
            <span className="text-sm text-stone">{index === 0 ? 'Premiere utilisation' : 'Photo memoire'}</span>
          </div>
        ))}
      </div>
    </section>
  );
};

const Meta = ({ label, value }: { label: string; value: string }) => (
  <div>
    <dt className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-stone">{label}</dt>
    <dd className="mt-1 font-semibold text-graphite">{value}</dd>
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
    <section className="space-y-6">
      <div className="flex gap-2">
        {[1, 2, 3].map((item) => (
          <span key={item} className={cx('h-1 flex-1 rounded-full', step >= item ? 'bg-terracotta' : 'bg-mist')} />
        ))}
      </div>

      {step === 1 && (
        <section className="space-y-4">
          <div className="relative">
            <SilhouetteCanvas baseItems={selectedBase} accessoryItems={selectedAccessories} showAccessories />
            <div className="absolute right-4 top-10 flex flex-col items-start gap-0.5">
              {(['haut', 'bas', 'accessoire'] as const).map((category) => (
                <button
                  key={category}
                  type="button"
                  className={cx(
                    'font-display text-[2.35rem] font-semibold leading-[0.9] transition',
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
                      'w-[6.35rem] rounded-2xl border bg-chalk p-2 text-left shadow-fine transition',
                      active ? 'border-terracotta ring-4 ring-terracotta/10' : 'border-mist/80',
                    )}
                    onClick={() => {
                      if (item.category === 'accessoire' || item.category === 'sac') toggleAccessory(item.id);
                      else setSelected((current) => ({ ...current, [item.category]: item.id }));
                    }}
                    aria-label={`Choisir ${item.name}`}
                  >
                    <ClothingGraphic item={item} className="h-20 w-full" />
                    <span className="mt-1 block truncate text-xs font-semibold">{item.name}</span>
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
          <div className="sticky bottom-0 z-20 -mx-4 grid grid-cols-[0.85fr_1.15fr] gap-2 border-t border-mist/70 bg-chalk/95 px-4 py-3 backdrop-blur">
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
                <h2 className="mb-2 font-display text-2xl font-semibold">{categoryLabels[category]}</h2>
                <div className="grid grid-cols-2 gap-2">
                  {items.map((item) => {
                    const isAccessory = category === 'accessoire' || category === 'sac';
                    const active = isAccessory ? accessoryIds.includes(item.id) : selected[category] === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        className={cx(
                          'rounded-2xl border p-3 text-left transition',
                          active ? 'border-terracotta bg-terracotta/10' : 'border-mist bg-chalk',
                        )}
                        onClick={() => (isAccessory ? toggleAccessory(item.id) : setSelected((current) => ({ ...current, [category]: item.id })))}
                      >
                        <ClothingGraphic item={item} className="mx-auto h-24 w-full" />
                        <p className="mt-2 text-sm font-semibold">{item.name}</p>
                        <p className="text-xs text-stone">{item.material}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
          <div className="rounded-2xl border border-mist/70 bg-pearl/35 p-4">
            <h2 className="font-display text-2xl font-semibold">Mes pieces</h2>
            <div className="mt-3 grid grid-cols-[1fr_auto] gap-2">
              <input
                className="min-h-11 rounded-2xl border border-mist bg-chalk px-4 outline-none"
                placeholder="Nom de la piece"
                value={newItemName}
                onChange={(event) => setNewItemName(event.target.value)}
              />
              <select
                className="min-h-11 rounded-2xl border border-mist bg-chalk px-3 text-sm font-semibold outline-none"
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
          <div className="sticky bottom-0 z-20 -mx-4 flex gap-2 border-t border-mist/70 bg-chalk/95 px-4 py-3 backdrop-blur">
            <button type="button" className={secondaryButton} onClick={() => setStep(1)}>Retour</button>
            <button type="button" className={primaryButton} onClick={() => setStep(3)}>Valider les pieces</button>
          </div>
        </section>
      )}

      {step === 3 && (
        <section className="space-y-4">
          <div className="border-b border-mist/70 pb-4">
            <SilhouetteCanvas baseItems={selectedBase} accessoryItems={selectedAccessories} showAccessories compact />
          </div>
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
            <textarea className="form-input min-h-24 py-3" value={comment} onChange={(event) => setComment(event.target.value)} />
          </FormField>
          <label className="flex items-center justify-between rounded-2xl border border-mist/70 bg-pearl/35 p-4 font-semibold">
            Rappel fictif veille + sur place
            <input type="checkbox" checked={reminderEnabled} onChange={(event) => setReminderEnabled(event.target.checked)} />
          </label>
          <button type="button" className={cx(primaryButton, 'sticky bottom-0 z-20 -mx-4 w-[calc(100%+2rem)] rounded-none py-4')} onClick={save}>
            <Check size={18} /> Valider
          </button>
        </section>
      )}
    </section>
  );
};

const FormField = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <label className="block">
    <span className="mb-2 block text-[0.78rem] font-semibold uppercase tracking-[0.12em] text-stone">{label}</span>
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
    <section className="space-y-6">
      <FormField label="Avec qui ?">
        <input className="form-input" value={person} onChange={(event) => setPerson(event.target.value)} list="people" />
        <datalist id="people">{peopleSeed.map((item) => <option key={item} value={item} />)}</datalist>
      </FormField>

      <section className="relative min-h-72 overflow-hidden rounded-2xl bg-ink p-5 text-chalk shadow-soft">
        <img src={atelierAsset('memory-photo.jpg')} alt="" className="absolute inset-0 h-full w-full object-cover opacity-55" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/90 via-ink/44 to-ink/8" />
        <div className="absolute inset-0 flex animate-memory gap-4 opacity-60">
          {[...photos, ...photos, ...photos].map((photo, index) => (
            <img key={`${photo.id}-${index}`} src={photo.src} alt="" className="h-72 w-44 rounded-2xl object-cover opacity-45 blur-[1px]" />
          ))}
        </div>
        <div className="relative z-10 max-w-xs">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-chalk/64">Memoire</p>
          <h2 className="mt-3 font-display text-5xl font-semibold leading-[0.9]">{person || 'Personne'}</h2>
          <p className="mt-3 text-sm leading-6 text-chalk/72">{history.length} silhouettes deja portees ensemble.</p>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-3xl font-semibold">Historique</h2>
        {history.map((silhouette) => (
          <div key={silhouette.id} className="grid grid-cols-[6rem_1fr] gap-3 border-b border-mist/70 pb-3">
            <div className="overflow-hidden rounded-2xl">
              <SilhouetteCanvas
                baseItems={itemsByIds(state.wardrobe, silhouette.baseItemIds)}
                accessoryItems={itemsByIds(state.wardrobe, silhouette.accessoryItemIds)}
                compact
              />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="line-clamp-2 font-semibold">{silhouette.name}</h3>
              <p className="mt-1 text-sm text-stone">{silhouette.place} · {dateLabel(silhouette.firstDate)}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button type="button" className={secondaryButton} onClick={() => onOpenDetail(silhouette.id)}>Voir</button>
                <button type="button" className={secondaryButton} onClick={() => onCreateFromPreset(silhouette.id)}>Premix</button>
              </div>
            </div>
          </div>
        ))}
      </section>

      <section className="rounded-2xl border border-mist/70 bg-pearl/35 p-4">
        <h2 className="font-display text-3xl font-semibold">Nouveau rendez-vous</h2>
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
    <section className="space-y-6">
      <div className="relative h-36 overflow-hidden rounded-2xl bg-pearl shadow-fine">
        <img src={atelierAsset('calendar-still.jpg')} alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-chalk/92 via-chalk/52 to-transparent" />
        <div className="absolute bottom-4 left-4">
          <p className="fine-label text-terracotta">Agenda d'usage</p>
          <p className="mt-1 font-display text-3xl font-semibold">Juin 2025</p>
        </div>
      </div>

      <div className="flex rounded-full border border-mist/80 bg-pearl/45 p-1">
        <button type="button" className={cx('h-11 flex-1 rounded-full font-semibold', mode === 'month' ? 'bg-chalk shadow-fine' : 'text-stone')} onClick={() => setMode('month')}>Mois</button>
        <button type="button" className={cx('h-11 flex-1 rounded-full font-semibold', mode === 'timeline' ? 'bg-chalk shadow-fine' : 'text-stone')} onClick={() => setMode('timeline')}>Frise</button>
      </div>
      {mode === 'month' ? (
        <div className="grid grid-cols-7 gap-1">
          {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((item, index) => <span key={`${item}-${index}`} className="py-2 text-center text-xs font-semibold text-stone">{item}</span>)}
          {days.map((day) => {
            const silhouette = silhouetteByDay.get(day);
            return (
              <button
                key={day}
                type="button"
                className={cx('min-h-20 rounded-2xl border p-1.5 text-left transition', silhouette ? 'border-terracotta bg-chalk shadow-fine' : 'border-mist/70 bg-pearl/28')}
                onClick={() => silhouette && onOpenDetail(silhouette.id)}
              >
                <span className="text-xs font-semibold">{day}</span>
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
              <button key={silhouette.id} type="button" className="flex w-full gap-3 border-b border-mist/70 pb-3 text-left" onClick={() => onOpenDetail(silhouette.id)}>
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-terracotta text-sm font-semibold text-chalk">{compactDateLabel(silhouette.firstDate)}</span>
                <span>
                  <span className="block font-semibold">{silhouette.name}</span>
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
      <span key={item.id} className="h-5 rounded-lg border border-graphite/10 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.28)]" style={{ backgroundColor: item.color }} />
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
    <section className="space-y-6">
      <section className="relative h-56 overflow-hidden rounded-2xl bg-pearl shadow-fine">
        <img src={atelierAsset('textile-detail.jpg')} alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/72 via-ink/10 to-transparent" />
        <div className="absolute bottom-5 left-5 right-5 text-chalk">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-chalk/70">Matiere et usage</p>
          <p className="mt-2 font-display text-5xl font-semibold leading-none">{metrics.estimatedFootprint} kg</p>
          <p className="mt-2 text-sm leading-6 text-chalk/76">Empreinte fictive estimee selon les matieres et la reutilisation.</p>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-3">
        {stats.map(([label, value]) => (
          <div key={label} className="border-b border-mist/70 pb-4">
            <p className="font-display text-4xl font-semibold leading-none">{value}</p>
            <p className="mt-1 text-sm font-medium text-stone">{label}</p>
          </div>
        ))}
      </div>

      <section className="rounded-2xl border border-sage/30 bg-sage/10 p-4">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-chalk text-sage">
            <Leaf size={21} />
          </span>
          <h2 className="font-display text-3xl font-semibold">Encouragement</h2>
        </div>
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
    <section className="space-y-6">
      <section className="relative h-56 overflow-hidden rounded-2xl bg-pearl shadow-fine">
        <img src={atelierAsset('packing-still.jpg')} alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/72 via-ink/10 to-transparent" />
        <div className="absolute bottom-5 left-5 right-5 text-chalk">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-chalk/70">Capsule voyage</p>
          <p className="mt-2 font-display text-5xl font-semibold leading-none">{destination}</p>
        </div>
      </section>

      <section className="rounded-2xl border border-mist/70 bg-pearl/35 p-4">
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

      <section className="rounded-2xl border border-mist/70 bg-chalk p-4 shadow-fine">
        <div className="flex items-center gap-3">
          <CloudSun className="text-terracotta" size={24} />
          <div>
            <p className="font-semibold">{weatherForDestination(destination)}</p>
            <p className="text-sm text-stone">Meteo fictive</p>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-3xl font-semibold">Silhouettes a emporter</h2>
        {state.silhouettes.map((silhouette) => {
          const checked = selectedIds.includes(silhouette.id);
          return (
            <label key={silhouette.id} className="flex items-center gap-3 border-b border-mist/70 pb-3">
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
                <span className="block font-semibold">{silhouette.name}</span>
                <span className="text-sm text-stone">{silhouette.usageCount} utilisations</span>
              </span>
              <button type="button" className="grid h-10 w-10 place-items-center rounded-full border border-mist/80 bg-chalk text-graphite" onClick={() => onOpenDetail(silhouette.id)} aria-label={`Voir ${silhouette.name}`}>
                <ChevronRight size={18} />
              </button>
            </label>
          );
        })}
      </section>

      <section className="rounded-2xl border border-mist/70 bg-pearl/35 p-4">
        <h2 className="font-display text-3xl font-semibold">Checklist</h2>
        <ul className="mt-3 space-y-2">
          {checklist.map((item) => (
            <li key={item} className="flex items-center gap-2 rounded-full bg-chalk px-3 py-2 text-sm font-semibold">
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
        <section className="rounded-2xl bg-graphite p-4 text-chalk">
          <p className="text-sm font-semibold text-chalk/60">Dernier plan</p>
          <h2 className="mt-1 font-display text-3xl font-semibold">{latestPlan.destination}</h2>
          <p className="mt-2 text-sm text-chalk/70">{latestPlan.checklist.length} pieces · {latestPlan.weather}</p>
        </section>
      )}
    </section>
  );
};
