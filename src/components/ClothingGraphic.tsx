import { useId } from 'react';
import type { WardrobeItem } from '../types';

interface ClothingGraphicProps {
  item: WardrobeItem;
  className?: string;
}

const clamp = (value: number) => Math.max(0, Math.min(255, value));

const shade = (hex: string, amount: number) => {
  const normalized = hex.replace('#', '');
  if (!/^[0-9a-f]{6}$/i.test(normalized)) return hex;
  const channels = [0, 2, 4].map((index) => parseInt(normalized.slice(index, index + 2), 16));
  return `#${channels.map((channel) => clamp(channel + amount).toString(16).padStart(2, '0')).join('')}`;
};

const stroke = '#2c2926';

export const ClothingGraphic = ({ item, className = '' }: ClothingGraphicProps) => {
  const uid = useId().replace(/:/g, '');
  const fillId = `cloth-fill-${uid}`;
  const glowId = `cloth-glow-${uid}`;
  const color = item.color;
  const fill = `url(#${fillId})`;
  const highlight = shade(color, 42);
  const lowlight = shade(color, -34);
  const outline = shade(color, -58);

  const defs = (
    <defs>
      <linearGradient id={fillId} x1="20%" y1="0%" x2="78%" y2="100%">
        <stop offset="0%" stopColor={highlight} />
        <stop offset="48%" stopColor={color} />
        <stop offset="100%" stopColor={lowlight} />
      </linearGradient>
      <filter id={glowId} x="-18%" y="-18%" width="136%" height="136%">
        <feDropShadow dx="0" dy="7" stdDeviation="5" floodColor="#2c2926" floodOpacity="0.16" />
      </filter>
    </defs>
  );

  if (item.category === 'bas') {
    return (
      <svg viewBox="0 0 120 160" className={className} role="img" aria-label={item.name}>
        {defs}
        <path d="M35 16h50l9 140H70L60 64l-12 92H24L35 16Z" fill={fill} stroke={outline} strokeWidth="2" strokeLinejoin="round" filter={`url(#${glowId})`} />
        <path d="M42 24c8 7 28 7 37 0M60 20v42M48 68l-8 78M70 68l8 78" stroke={stroke} strokeWidth="3.3" fill="none" strokeLinecap="round" opacity="0.62" />
        <path d="M38 43h18M66 43h18" stroke="#fffaf0" strokeWidth="2.4" fill="none" strokeLinecap="round" opacity="0.48" />
      </svg>
    );
  }

  if (item.category === 'chaussures') {
    return (
      <svg viewBox="0 0 140 80" className={className} role="img" aria-label={item.name}>
        {defs}
        <path d="M19 47c21 1 39-8 55-22 9 18 26 23 51 25 12 1 17 8 13 17H17c-5-8-3-16 2-20Z" fill={fill} stroke={outline} strokeWidth="2" strokeLinejoin="round" filter={`url(#${glowId})`} />
        <path d="M18 66h120M73 27c-2 12-10 22-26 27M92 42h19M79 38h17" stroke={stroke} strokeWidth="3.4" fill="none" strokeLinecap="round" opacity="0.66" />
        <path d="M29 55c25 2 43-4 58-19" stroke="#fffaf0" strokeWidth="2.6" fill="none" strokeLinecap="round" opacity="0.48" />
      </svg>
    );
  }

  if (item.category === 'robe') {
    return (
      <svg viewBox="0 0 130 190" className={className} role="img" aria-label={item.name}>
        {defs}
        <path d="M48 18h35l14 49-14 8 22 100H31L53 75l-16-8 11-49Z" fill={fill} stroke={outline} strokeWidth="2" strokeLinejoin="round" filter={`url(#${glowId})`} />
        <path d="M52 20c3 16 27 16 31 0M50 75h34M43 123h60M65 75v92" stroke={stroke} strokeWidth="3.2" fill="none" strokeLinecap="round" opacity="0.56" />
        <path d="M42 165c13 8 45 8 64 0" stroke="#fffaf0" strokeWidth="2.6" fill="none" strokeLinecap="round" opacity="0.45" />
      </svg>
    );
  }

  if (item.category === 'veste') {
    return (
      <svg viewBox="0 0 150 170" className={className} role="img" aria-label={item.name}>
        {defs}
        <path d="M52 20h45l29 32-18 24 9 87H33l9-87-18-24 28-32Z" fill={fill} stroke={outline} strokeWidth="2" strokeLinejoin="round" filter={`url(#${glowId})`} />
        <path d="M58 23l18 60 21-60M76 84v74M47 92h21M93 92h22" stroke={stroke} strokeWidth="3.3" fill="none" strokeLinecap="round" opacity="0.68" />
        <path d="M48 75c18 8 37 9 59 0" stroke="#fffaf0" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.4" />
      </svg>
    );
  }

  if (item.category === 'accessoire') {
    return (
      <svg viewBox="0 0 130 95" className={className} role="img" aria-label={item.name}>
        {defs}
        <path d="M16 27c24-16 57-18 97-6-11 21-17 40-16 59-32-12-60-11-86 4 10-23 12-42 5-57Z" fill={fill} stroke={outline} strokeWidth="2" strokeLinejoin="round" filter={`url(#${glowId})`} />
        <path d="M24 31c26 11 55 12 88 3M27 74c22-14 50-14 83-1" stroke={stroke} strokeWidth="3.1" fill="none" strokeLinecap="round" opacity="0.52" />
        <path d="M38 23c18 6 40 6 64 1" stroke="#fffaf0" strokeWidth="2.4" fill="none" strokeLinecap="round" opacity="0.42" />
      </svg>
    );
  }

  if (item.category === 'sac') {
    return (
      <svg viewBox="0 0 140 130" className={className} role="img" aria-label={item.name}>
        {defs}
        <path d="M28 50h84c8 0 12 6 10 14l-12 51c-2 8-8 12-17 12H47c-9 0-15-4-17-12L18 64c-2-8 2-14 10-14Z" fill={fill} stroke={outline} strokeWidth="2" strokeLinejoin="round" filter={`url(#${glowId})`} />
        <path d="M48 50c1-29 40-29 43 0" stroke={stroke} strokeWidth="6" fill="none" strokeLinecap="round" opacity="0.58" />
        <path d="M58 66h30M31 77h86" stroke="#fffaf0" strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.58" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 130 150" className={className} role="img" aria-label={item.name}>
      {defs}
      <path d="M45 18h40l28 22-13 24-13-8v91H43V56l-13 8-13-24 28-22Z" fill={fill} stroke={outline} strokeWidth="2" strokeLinejoin="round" filter={`url(#${glowId})`} />
      <path d="M51 20c3 15 26 15 29 0M43 56h44M64 55v86" stroke={stroke} strokeWidth="3.2" fill="none" strokeLinecap="round" opacity="0.56" />
      <path d="M34 42l13-10M96 32l14 10" stroke="#fffaf0" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.42" />
    </svg>
  );
};
