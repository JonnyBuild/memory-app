import type { WardrobeItem } from '../types';

interface ClothingGraphicProps {
  item: WardrobeItem;
  className?: string;
}

const stroke = '#2c2926';

export const ClothingGraphic = ({ item, className = '' }: ClothingGraphicProps) => {
  const color = item.color;

  if (item.category === 'bas') {
    return (
      <svg viewBox="0 0 120 160" className={className} role="img" aria-label={item.name}>
        <path d="M35 16h50l9 140H70L60 62l-12 94H24L35 16Z" fill={color} />
        <path d="M35 16h50M60 18v42M43 28c8 8 27 8 36 0M36 45h22M64 45h22" stroke={stroke} strokeWidth="4" fill="none" strokeLinecap="round" />
      </svg>
    );
  }

  if (item.category === 'chaussures') {
    return (
      <svg viewBox="0 0 140 80" className={className} role="img" aria-label={item.name}>
        <path d="M22 45c20 1 38-8 52-20 9 18 27 22 52 24 11 1 16 8 12 17H17c-5-9-2-16 5-21Z" fill={color} />
        <path d="M18 66h120M72 26c-2 12-9 21-24 26M92 42h18M80 38h16" stroke={stroke} strokeWidth="4" fill="none" strokeLinecap="round" />
      </svg>
    );
  }

  if (item.category === 'robe') {
    return (
      <svg viewBox="0 0 130 190" className={className} role="img" aria-label={item.name}>
        <path d="M47 18h36l14 49-14 7 23 160H30L53 74l-16-7 10-49Z" fill={color} />
        <path d="M52 19c2 17 28 17 31 0M50 74h34M42 124h62" stroke={stroke} strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.72" />
      </svg>
    );
  }

  if (item.category === 'veste') {
    return (
      <svg viewBox="0 0 150 170" className={className} role="img" aria-label={item.name}>
        <path d="M52 20h45l28 32-18 24 10 139H33L43 76 25 52l27-32Z" fill={color} />
        <path d="M58 23l18 60 21-60M76 84v108M47 92h22M92 92h22" stroke={stroke} strokeWidth="4" fill="none" strokeLinecap="round" />
      </svg>
    );
  }

  if (item.category === 'accessoire') {
    return (
      <svg viewBox="0 0 130 95" className={className} role="img" aria-label={item.name}>
        <path d="M16 26c23-15 55-17 95-6-11 21-17 41-16 60-31-13-59-12-84 3 9-22 11-41 5-57Z" fill={color} />
        <path d="M24 31c26 11 55 12 88 3M27 74c22-14 50-14 83-1" stroke={stroke} strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.58" />
      </svg>
    );
  }

  if (item.category === 'sac') {
    return (
      <svg viewBox="0 0 140 130" className={className} role="img" aria-label={item.name}>
        <path d="M28 50h84c8 0 12 6 10 14l-12 51c-2 8-8 12-17 12H47c-9 0-15-4-17-12L18 64c-2-8 2-14 10-14Z" fill={color} />
        <path d="M48 50c1-28 40-28 42 0M58 65h30" stroke="#fffaf0" strokeWidth="8" fill="none" strokeLinecap="round" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 130 150" className={className} role="img" aria-label={item.name}>
      <path d="M45 18h40l28 22-13 24-13-8v93H43V56l-13 8-13-24 28-22Z" fill={color} />
      <path d="M51 19c2 17 27 17 29 0M43 56h44" stroke={stroke} strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.64" />
    </svg>
  );
};
