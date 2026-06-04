import { ClothingGraphic } from './ClothingGraphic';
import type { WardrobeItem } from '../types';

interface SilhouetteCanvasProps {
  baseItems: WardrobeItem[];
  accessoryItems?: WardrobeItem[];
  showAccessories?: boolean;
  onItemClick?: (item: WardrobeItem) => void;
  compact?: boolean;
}

const itemClass = 'absolute transition-transform duration-200 hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-terracotta';

export const SilhouetteCanvas = ({
  baseItems,
  accessoryItems = [],
  showAccessories = true,
  onItemClick,
  compact = false,
}: SilhouetteCanvasProps) => {
  const items = [...baseItems, ...(showAccessories ? accessoryItems : [])];
  const robe = items.find((item) => item.category === 'robe');
  const haut = items.find((item) => item.category === 'haut');
  const veste = items.find((item) => item.category === 'veste');
  const bas = items.find((item) => item.category === 'bas');
  const shoes = items.find((item) => item.category === 'chaussures');
  const scarf = items.find((item) => item.category === 'accessoire');
  const bag = items.find((item) => item.category === 'sac');
  const renderItem = (item: WardrobeItem | undefined, className: string) => {
    if (!item) return null;

    if (!onItemClick) {
      return (
        <div className={`${itemClass} ${className}`}>
          <ClothingGraphic item={item} className="h-full w-full drop-shadow-[0_16px_18px_rgba(38,35,35,0.16)]" />
        </div>
      );
    }

    return (
      <button
        type="button"
        aria-label={`Voir ${item.name}`}
        className={`${itemClass} ${className}`}
        onClick={() => onItemClick(item)}
      >
        <ClothingGraphic item={item} className="h-full w-full drop-shadow-[0_16px_18px_rgba(38,35,35,0.16)]" />
      </button>
    );
  };

  return (
    <div
      className={`relative mx-auto overflow-hidden rounded-[2rem] bg-gradient-to-b from-chalk to-pearl ${
        compact ? 'h-56 w-full max-w-64' : 'h-[26rem] w-full max-w-sm'
      }`}
    >
      <div className="absolute left-1/2 top-12 h-[68%] w-px -translate-x-1/2 border-l border-dashed border-stone/30" />
      {robe
        ? renderItem(robe, compact ? 'left-[28%] top-[10%] h-[68%] w-[44%]' : 'left-[28%] top-[9%] h-[70%] w-[44%]')
        : (
          <>
            {renderItem(veste, compact ? 'left-[21%] top-[8%] h-[35%] w-[35%]' : 'left-[19%] top-[7%] h-[38%] w-[38%]')}
            {renderItem(haut, compact ? 'left-[30%] top-[12%] h-[34%] w-[35%]' : 'left-[29%] top-[12%] h-[36%] w-[36%]')}
            {renderItem(bas, compact ? 'left-[33%] top-[40%] h-[48%] w-[34%]' : 'left-[32%] top-[41%] h-[48%] w-[35%]')}
          </>
        )}
      {renderItem(shoes, compact ? 'left-[45%] top-[78%] h-[15%] w-[36%]' : 'left-[44%] top-[79%] h-[14%] w-[36%]')}
      {renderItem(scarf, compact ? 'left-[53%] top-[8%] h-[20%] w-[33%] rotate-6' : 'left-[55%] top-[10%] h-[18%] w-[32%] rotate-6')}
      {renderItem(bag, compact ? 'left-[57%] top-[32%] h-[30%] w-[34%]' : 'left-[58%] top-[31%] h-[31%] w-[34%]')}
    </div>
  );
};
