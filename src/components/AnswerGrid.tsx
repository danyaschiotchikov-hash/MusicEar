import React from 'react';
import { CurrentTask, MusicItem, CategoryId } from '../types';
import { CATEGORIES, ALL_ITEMS } from '../data/musicData';
import {
  Check,
  X,
  Music2,
  Sparkles,
  Layers,
  Boxes,
  RefreshCw,
  Activity,
  Compass,
  Volume2,
  LucideIcon,
} from 'lucide-react';

interface AnswerGridProps {
  activeItemIds: string[];
  currentTask: CurrentTask | null;
  onSelectAnswer: (item: MusicItem) => void;
  disabled: boolean;
  onEnablePreset?: (preset: 'intervals' | 'chords' | 'scales' | 'all') => void;
  onPlayComparison?: (item: MusicItem) => void;
}

// Icon mapping per category
const CATEGORY_ICONS: Record<CategoryId, LucideIcon> = {
  simple_intervals: Music2,
  characteristic_intervals: Sparkles,
  triads: Layers,
  seventh_chords: Boxes,
  d7_inversions: RefreshCw,
  scales: Activity,
  modes: Compass,
};

// Subtle themed accent border/background per category
const CATEGORY_COLORS: Record<
  CategoryId,
  {
    border: string;
    bgBadge: string;
    textBadge: string;
    iconBg: string;
    iconText: string;
  }
> = {
  simple_intervals: {
    border: 'border-indigo-500/20',
    bgBadge: 'bg-indigo-500/10',
    textBadge: 'text-indigo-300',
    iconBg: 'bg-indigo-500/15',
    iconText: 'text-indigo-400',
  },
  characteristic_intervals: {
    border: 'border-amber-500/20',
    bgBadge: 'bg-amber-500/10',
    textBadge: 'text-amber-300',
    iconBg: 'bg-amber-500/15',
    iconText: 'text-amber-400',
  },
  triads: {
    border: 'border-emerald-500/20',
    bgBadge: 'bg-emerald-500/10',
    textBadge: 'text-emerald-300',
    iconBg: 'bg-emerald-500/15',
    iconText: 'text-emerald-400',
  },
  seventh_chords: {
    border: 'border-purple-500/20',
    bgBadge: 'bg-purple-500/10',
    textBadge: 'text-purple-300',
    iconBg: 'bg-purple-500/15',
    iconText: 'text-purple-400',
  },
  d7_inversions: {
    border: 'border-rose-500/20',
    bgBadge: 'bg-rose-500/10',
    textBadge: 'text-rose-300',
    iconBg: 'bg-rose-500/15',
    iconText: 'text-rose-400',
  },
  scales: {
    border: 'border-sky-500/20',
    bgBadge: 'bg-sky-500/10',
    textBadge: 'text-sky-300',
    iconBg: 'bg-sky-500/15',
    iconText: 'text-sky-400',
  },
  modes: {
    border: 'border-teal-500/20',
    bgBadge: 'bg-teal-500/10',
    textBadge: 'text-teal-300',
    iconBg: 'bg-teal-500/15',
    iconText: 'text-teal-400',
  },
};

export const AnswerGrid: React.FC<AnswerGridProps> = ({
  activeItemIds,
  currentTask,
  onSelectAnswer,
  onEnablePreset,
  onPlayComparison,
}) => {
  // Group active items by categories in predefined order
  const categoryGroups = CATEGORIES.map((cat) => {
    const items = ALL_ITEMS.filter(
      (item) => item.category === cat.id && activeItemIds.includes(item.id)
    );
    return {
      ...cat,
      items,
      colors: CATEGORY_COLORS[cat.id],
      Icon: CATEGORY_ICONS[cat.id] || Music2,
    };
  }).filter((g) => g.items.length > 0);

  // If no items selected at all
  if (categoryGroups.length === 0) {
    return (
      <div className="w-full p-6 text-center bg-slate-900/40 rounded-2xl border border-slate-800 space-y-3">
        <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto text-xl">
          ⚠️
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-200">
            Нет активных элементов для тренировки
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
            Все элементы отключены. Выберите готовый набор для быстрого старта:
          </p>
        </div>
        {onEnablePreset && (
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
            <button
              onClick={() => onEnablePreset('intervals')}
              className="px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 rounded-xl text-xs font-semibold transition cursor-pointer"
            >
              Интервалы
            </button>
            <button
              onClick={() => onEnablePreset('chords')}
              className="px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 rounded-xl text-xs font-semibold transition cursor-pointer"
            >
              Аккорды
            </button>
            <button
              onClick={() => onEnablePreset('scales')}
              className="px-3 py-1.5 bg-sky-600/20 hover:bg-sky-600/30 text-sky-300 border border-sky-500/40 rounded-xl text-xs font-semibold transition cursor-pointer"
            >
              Гаммы и лады
            </button>
            <button
              onClick={() => onEnablePreset('all')}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-indigo-950 cursor-pointer"
            >
              Включить всё
            </button>
          </div>
        )}
      </div>
    );
  }

  const isAnswered = Boolean(currentTask && currentTask.userAnswerId !== null);
  const isWrong = Boolean(isAnswered && currentTask && !currentTask.isCorrect);
  const userPickedItem = isAnswered && currentTask?.userAnswerId
    ? ALL_ITEMS.find((i) => i.id === currentTask.userAnswerId)
    : null;

  return (
    <div className="w-full space-y-2.5 sm:space-y-3">
      {/* Auditory Comparison Banner when user picked a wrong answer */}
      {isWrong && currentTask && (
        <div className="w-full bg-slate-900/90 backdrop-blur-xl border border-rose-500/40 rounded-xl p-2.5 sm:p-3 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-2 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="p-1.5 rounded-lg bg-rose-500/15 text-rose-400 border border-rose-500/30 shrink-0">
              <Volume2 className="w-4 h-4 animate-pulse" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-100 truncate">
                Сравнение от ноты «{currentTask.rootNoteName}»:
              </p>
              <p className="text-[10px] text-slate-400 truncate">
                Нажмите кнопку, чтобы услышать разницу в звучании
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 w-full sm:w-auto justify-end shrink-0">
            {/* Play User Wrong Choice */}
            {userPickedItem && (
              <button
                type="button"
                onClick={() => onPlayComparison && onPlayComparison(userPickedItem)}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 active:scale-95 text-rose-200 border border-rose-500/40 text-xs font-semibold transition cursor-pointer"
                title={`Слушать «${userPickedItem.name}» от ${currentTask.rootNoteName}`}
              >
                <Volume2 className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span className="truncate whitespace-nowrap">Ваш: {userPickedItem.shortName}</span>
              </button>
            )}

            {/* Play Correct Choice */}
            <button
              type="button"
              onClick={() => onPlayComparison && onPlayComparison(currentTask.item)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 active:scale-95 text-emerald-200 border border-emerald-500/40 text-xs font-semibold transition cursor-pointer"
              title={`Слушать «${currentTask.item.name}» от ${currentTask.rootNoteName}`}
            >
              <Volume2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="truncate whitespace-nowrap">Верный: {currentTask.item.shortName}</span>
            </button>
          </div>
        </div>
      )}

      {/* Render Each Category Group in its own clean, compact section */}
      {categoryGroups.map((group) => {
        const Icon = group.Icon;
        const colors = group.colors;

        return (
          <section
            key={group.id}
            className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-xl p-2.5 sm:p-3 shadow-md transition-all"
          >
            {/* Category Header */}
            <div className="flex items-center justify-between gap-2 pb-1.5 mb-1.5 border-b border-slate-800/60">
              <div className="flex items-center gap-1.5 min-w-0">
                <div className={`p-1 rounded-md ${colors.iconBg} ${colors.iconText} border ${colors.border} shrink-0`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <h2 className="text-xs font-bold text-slate-200 tracking-tight truncate whitespace-nowrap">
                  {group.name}
                </h2>
                <span className="text-[10px] text-slate-400 hidden sm:inline truncate">
                  • {group.shortDesc}
                </span>
              </div>
              <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${colors.bgBadge} ${colors.textBadge} font-semibold shrink-0`}>
                {group.items.length}
              </span>
            </div>

            {/* Responsive Category Grid: 4 columns on mobile! */}
            <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-1 sm:gap-1.5">
              {group.items.map((item) => {
                const isUserPick = Boolean(currentTask && currentTask.userAnswerId === item.id);
                const isCorrectTarget = Boolean(currentTask && currentTask.item.id === item.id);

                let btnStyle =
                  'bg-slate-950/70 hover:bg-slate-800/80 border-slate-800/80 text-slate-200 hover:border-slate-700 active:scale-[0.98]';
                let badgeStyle = 'bg-slate-900 text-slate-400 border-slate-800';

                // Can this button be clicked after answer? Yes, if it's the correct answer or user pick!
                const isClickableComparison = isWrong && (isCorrectTarget || isUserPick);
                const isButtonDisabled = isAnswered && !isClickableComparison;

                if (isAnswered) {
                  if (isCorrectTarget) {
                    btnStyle =
                      'bg-emerald-950/90 border-emerald-500 text-emerald-100 shadow-md shadow-emerald-950 ring-2 ring-emerald-500/60 scale-[1.01] z-10';
                    badgeStyle = 'bg-emerald-500/30 text-emerald-200 border-emerald-400/50 font-bold';
                  } else if (isUserPick) {
                    btnStyle =
                      'bg-rose-950/90 border-rose-500 text-rose-100 shadow-md shadow-rose-950 ring-2 ring-rose-500/60';
                    badgeStyle = 'bg-rose-500/30 text-rose-200 border-rose-400/50 font-bold';
                  } else {
                    btnStyle = 'opacity-35 bg-slate-950/40 border-slate-900 text-slate-500';
                  }
                }

                // Strictly remove hints for simple intervals, characteristic intervals, triads, and seventh chords
                let subtitleHint: string | undefined = item.hint;
                if (
                  item.category === 'simple_intervals' ||
                  item.category === 'characteristic_intervals' ||
                  item.category === 'triads' ||
                  item.category === 'seventh_chords'
                ) {
                  subtitleHint = undefined;
                }

                const handleCardClick = () => {
                  if (!isAnswered) {
                    onSelectAnswer(item);
                  } else if (isClickableComparison && onPlayComparison) {
                    onPlayComparison(item);
                  }
                };

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={handleCardClick}
                    disabled={isButtonDisabled}
                    className={`relative flex flex-col justify-between p-1 sm:p-2 rounded-lg border transition-all duration-150 text-left min-h-[44px] sm:min-h-[52px] ${btnStyle} ${
                      isClickableComparison ? 'cursor-pointer hover:ring-2 hover:ring-indigo-400/50' : isAnswered ? 'cursor-default' : 'cursor-pointer'
                    }`}
                    title={
                      isClickableComparison
                        ? `Нажмите, чтобы послушать «${item.name}» от ${currentTask?.rootNoteName}`
                        : item.name
                    }
                  >
                    {/* Top Row: Short Name and State Icon */}
                    <div className="flex items-start justify-between w-full gap-0.5">
                      <span className="font-bold text-[10px] sm:text-xs tracking-tight leading-tight truncate whitespace-nowrap">
                        {item.shortName}
                      </span>

                      {isAnswered && isCorrectTarget && (
                        <span className="flex items-center gap-0.5 text-[8px] sm:text-[9px] font-bold text-emerald-400 bg-emerald-950/80 px-1 py-0.2 rounded border border-emerald-500 shrink-0">
                          {isWrong ? <Volume2 className="w-2.5 h-2.5" /> : <Check className="w-2.5 h-2.5" />}
                          <span className="hidden sm:inline">{isWrong ? 'Слушать' : 'Верно'}</span>
                        </span>
                      )}
                      {isAnswered && isUserPick && !isCorrectTarget && (
                        <span className="flex items-center gap-0.5 text-[8px] sm:text-[9px] font-bold text-rose-400 bg-rose-950/80 px-1 py-0.2 rounded border border-rose-500 shrink-0">
                          <Volume2 className="w-2.5 h-2.5" />
                          <span className="hidden sm:inline">Слушать</span>
                        </span>
                      )}
                    </div>

                    {/* Bottom Row: Full name description & hint badge */}
                    {(subtitleHint || item.category === 'scales' || item.category === 'modes') && (
                      <div className="flex items-center justify-between w-full mt-0.5 gap-0.5">
                        <span className="text-[8px] sm:text-[9px] text-slate-400 truncate whitespace-nowrap opacity-80 leading-none">
                          {item.category === 'scales' || item.category === 'modes'
                            ? item.name.split(' ')[0]
                            : ''}
                        </span>

                        {subtitleHint && (
                          <span
                            className={`text-[8px] sm:text-[9px] font-mono font-semibold px-1 py-0.2 rounded border leading-none shrink-0 whitespace-nowrap ${
                              item.modeQuality === 'мажор' || subtitleHint.includes('Мажор')
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                : item.modeQuality === 'минор' || subtitleHint.includes('Минор')
                                ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                                : subtitleHint.includes('♯')
                                ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                                : subtitleHint.includes('♭')
                                ? 'bg-sky-500/15 text-sky-300 border-sky-500/30'
                                : badgeStyle
                            }`}
                          >
                            {subtitleHint}
                          </span>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
};
