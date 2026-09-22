export type CardPaletteId = 'indigo' | 'espresso' | 'emerald' | 'violet';

export interface CardPaletteConfig {
  id: CardPaletteId;
  name: string;
  bgClass: string;
  borderClass: string;
  textClass: string;
}

export const CARD_PALETTES: CardPaletteConfig[] = [
  {
    id: 'indigo',
    name: 'Индиго (Классика)',
    bgClass: 'bg-slate-950/40',
    borderClass: 'border-white/10',
    textClass: 'text-amber-300',
  },
  {
    id: 'espresso',
    name: 'Тёплый Эспрессо',
    bgClass: 'bg-[#1c1816]/70',
    borderClass: 'border-amber-900/30',
    textClass: 'text-amber-200',
  },
  {
    id: 'emerald',
    name: 'Северный Изумруд',
    bgClass: 'bg-emerald-950/40',
    borderClass: 'border-emerald-500/20',
    textClass: 'text-emerald-200',
  },
  {
    id: 'violet',
    name: 'Неоновый Фиолет',
    bgClass: 'bg-violet-950/40',
    borderClass: 'border-violet-500/20',
    textClass: 'text-violet-200',
  },
];

export function getCardPaletteClasses(paletteId: CardPaletteId = 'indigo') {
  return CARD_PALETTES.find((p) => p.id === paletteId) || CARD_PALETTES[0];
}
