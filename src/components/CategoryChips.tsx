import React from 'react';
import {
  Music2,
  Sparkles,
  Layers,
  Sliders,
  Activity,
} from 'lucide-react';

export type QuickCategoryKey =
  | 'simple_intervals'
  | 'characteristic_intervals'
  | 'triads'
  | 'seventh_chords'
  | 'scales';

export interface QuickCategoryItem {
  key: QuickCategoryKey;
  label: string;
  shortLabel?: string;
  icon: React.ComponentType<{ className?: string }>;
  categoryIds: string[];
}

export const QUICK_CATEGORIES: QuickCategoryItem[] = [
  {
    key: 'simple_intervals',
    label: 'Интервалы',
    shortLabel: 'Инт.',
    icon: Music2,
    categoryIds: ['simple_intervals'],
  },
  {
    key: 'characteristic_intervals',
    label: 'Характерные',
    shortLabel: 'Характ.',
    icon: Sparkles,
    categoryIds: ['characteristic_intervals'],
  },
  {
    key: 'triads',
    label: 'Трезвучия',
    shortLabel: 'Трезв.',
    icon: Layers,
    categoryIds: ['triads'],
  },
  {
    key: 'seventh_chords',
    label: 'Септаккорды',
    shortLabel: 'Септ.',
    icon: Sliders,
    categoryIds: ['seventh_chords', 'd7_inversions'],
  },
  {
    key: 'scales',
    label: 'Лады / Гаммы',
    shortLabel: 'Лады',
    icon: Activity,
    categoryIds: ['scales', 'modes'],
  },
];

interface CategoryChipsProps {
  selectedCategories: QuickCategoryKey[];
  onToggleCategory: (key: QuickCategoryKey) => void;
}

export const CategoryChips: React.FC<CategoryChipsProps> = ({
  selectedCategories,
  onToggleCategory,
}) => {
  return (
    <div className="w-full bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-xl p-1 sm:p-1.5 shadow-sm">
      {/* Exactly 5 buttons with multi-select support */}
      <div className="grid grid-cols-5 gap-1 sm:gap-1.5 w-full">
        {QUICK_CATEGORIES.map((cat) => {
          const isSelected = selectedCategories.includes(cat.key);
          const IconComponent = cat.icon;

          return (
            <button
              key={cat.key}
              type="button"
              onClick={() => onToggleCategory(cat.key)}
              className={`flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1.5 py-1.5 px-0.5 sm:px-1.5 rounded-lg text-[10px] sm:text-xs transition active:scale-[0.97] cursor-pointer border ${
                isSelected
                  ? 'bg-indigo-600 text-white border-indigo-400/90 shadow-sm shadow-indigo-950 font-bold ring-1 ring-indigo-400/40'
                  : 'bg-slate-950/40 hover:bg-slate-800/60 text-slate-300 hover:text-slate-100 border-slate-800/80 font-medium'
              }`}
              title={`${cat.label} (кликните для выбора/снятия)`}
            >
              <IconComponent
                className={`w-3.5 h-3.5 shrink-0 ${
                  isSelected ? 'text-white' : 'text-indigo-400'
                }`}
              />
              <span className="truncate whitespace-nowrap hidden sm:inline">
                {cat.label}
              </span>
              <span className="truncate whitespace-nowrap sm:hidden">
                {cat.shortLabel || cat.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
