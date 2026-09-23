import React from 'react';
import { CurrentTask, MusicItem, CategoryId } from '../types';
import { CATEGORIES, ALL_ITEMS } from '../data/musicData';
import {
  Check,
  Music2,
  Sparkles,
  Layers,
  Boxes,
  RefreshCw,
  Activity,
  Compass,
  Volume2,
  Play,
  ArrowUp,
  ArrowDown,
  ListMusic,
  LucideIcon,
} from 'lucide-react';

interface AnswerGridProps {
  activeItemIds: string[];
  currentTask: CurrentTask | null;
  onSelectAnswer: (item: MusicItem) => void;
  disabled: boolean;
  onEnablePreset?: (preset: 'intervals' | 'chords' | 'scales' | 'all') => void;
  onPlayComparison?: (item: MusicItem) => void;
  onNewTask?: () => void;
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
    border: 'border-slate-800',
    bgBadge: 'bg-slate-800/80',
    textBadge: 'text-slate-300',
    iconBg: 'bg-slate-800/60',
    iconText: 'text-slate-300',
  },
  characteristic_intervals: {
    border: 'border-slate-800',
    bgBadge: 'bg-slate-800/80',
    textBadge: 'text-slate-300',
    iconBg: 'bg-slate-800/60',
    iconText: 'text-slate-300',
  },
  triads: {
    border: 'border-slate-800',
    bgBadge: 'bg-slate-800/80',
    textBadge: 'text-slate-300',
    iconBg: 'bg-slate-800/60',
    iconText: 'text-slate-300',
  },
  seventh_chords: {
    border: 'border-slate-800',
    bgBadge: 'bg-slate-800/80',
    textBadge: 'text-slate-300',
    iconBg: 'bg-slate-800/60',
    iconText: 'text-slate-300',
  },
  d7_inversions: {
    border: 'border-slate-800',
    bgBadge: 'bg-slate-800/80',
    textBadge: 'text-slate-300',
    iconBg: 'bg-slate-800/60',
    iconText: 'text-slate-300',
  },
  scales: {
    border: 'border-slate-800',
    bgBadge: 'bg-slate-800/80',
    textBadge: 'text-slate-300',
    iconBg: 'bg-slate-800/60',
    iconText: 'text-slate-300',
  },
  modes: {
    border: 'border-slate-800',
    bgBadge: 'bg-slate-800/80',
    textBadge: 'text-slate-300',
    iconBg: 'bg-slate-800/60',
    iconText: 'text-slate-300',
  },
};

// Curated paired ordering for symmetrical grids in each category:
const CATEGORY_ORDER: Record<CategoryId, string[]> = {
  // 2 columns x 6 rows: Symmetrical pairs (Seconds, Thirds, Fourths/Fifths, Sixths, Sevenths, Tritone/Octave)
  simple_intervals: [
    'm2', 'b2',
    'm3', 'b3',
    'ch4', 'ch5',
    'm6', 'b6',
    'm7', 'b7',
    'tritone', 'ch8',
  ],
  // 2 columns x 4 rows: Left = Major, Right = Minor
  scales: [
    'scale_nat_maj', 'scale_nat_min',
    'scale_harm_maj', 'scale_harm_min',
    'scale_mel_maj', 'scale_mel_min',
    'scale_double_harm_maj', 'scale_double_harm_min',
  ],
  // 2 columns x 4 rows (or 4 x 2): Left = Major forms, Right = Minor forms
  triads: [
    'triad_maj', 'triad_min',
    'triad_maj6', 'triad_min6',
    'triad_maj64', 'triad_min64',
    'triad_aug', 'triad_dim',
  ],
  // 2 columns x 4 rows: Harmonic pairs
  seventh_chords: [
    'seventh_mb7', 'seventh_bb7',
    'seventh_mm7', 'seventh_bm7',
    'seventh_mum7', 'seventh_umum7',
    'seventh_bum7', 'seventh_buv7',
  ],
  // 2 columns x 2 rows on mobile (4 x 1 on tablet/desktop): D7 and its inversions
  d7_inversions: [
    'd7', 'd7_65',
    'd7_43', 'd7_2',
  ],
  // 2 columns x 4 rows: Augmented on left, Diminished on right
  characteristic_intervals: [
    'char_uv2', 'char_um7',
    'char_uv5', 'char_um4',
    'char_uv4_b6', 'char_um5_b3',
    'char_uv4_m6', 'char_um5_m3',
  ],
  // 2 columns x 4 rows: Symmetrical pairs, last item spans full width
  modes: [
    'mode_lydian', 'mode_dorian',
    'mode_mixolydian', 'mode_phrygian',
    'mode_pentatonic_maj', 'mode_pentatonic_min',
    'mode_locrian',
  ],
};

// Subtitle label helpers to make buttons informative yet clean
function isMajorQualityItem(item: MusicItem): boolean {
  const majIds = [
    'scale_nat_maj',
    'scale_harm_maj',
    'scale_mel_maj',
    'scale_double_harm_maj',
    'mode_lydian',
    'mode_mixolydian',
    'mode_pentatonic_maj',
    'triad_maj',
    'triad_maj6',
    'triad_maj64',
    'triad_aug',
    'seventh_mb7',
    'seventh_bb7',
  ];
  return majIds.includes(item.id);
}

function getButtonSubLabel(item: MusicItem): string | null {
  if (item.category === 'scales') {
    return item.hint || null;
  }
  if (item.category === 'modes') {
    return item.hint || (item.modeQuality ? `${item.modeQuality}` : null);
  }
  if (item.category === 'd7_inversions') {
    if (item.id === 'd7') return 'V → Т3';
    return item.hint || null;
  }
  if (item.category === 'triads') {
    if (item.id === 'triad_maj') return 'Мажор';
    if (item.id === 'triad_min') return 'Минор';
    if (item.id === 'triad_maj6') return 'Маж. 6';
    if (item.id === 'triad_min6') return 'Мин. 6';
    if (item.id === 'triad_maj64') return 'Маж. 6/4';
    if (item.id === 'triad_min64') return 'Мин. 6/4';
    if (item.id === 'triad_aug') return 'Увеличенное';
    if (item.id === 'triad_dim') return 'Уменьшенное';
  }
  if (item.category === 'seventh_chords') {
    if (item.id === 'seventh_mb7') return 'Доминантсепт';
    if (item.id === 'seventh_bb7') return 'Maj7';
    if (item.id === 'seventh_bm7') return 'mM7';
    if (item.id === 'seventh_mm7') return 'm7';
    if (item.id === 'seventh_mum7') return 'Полууменьш. ø7';
    if (item.id === 'seventh_umum7') return 'Уменьш. o7';
    if (item.id === 'seventh_bum7') return 'Бум7';
    if (item.id === 'seventh_buv7') return 'Був7';
  }
  if (item.category === 'characteristic_intervals') {
    return item.resolutionName ? `в ${item.resolutionName}` : null;
  }
  if (item.category === 'simple_intervals') {
    if (item.id === 'tritone') return 'ув.4 / ум.5';
    const firstWord = item.name.split(' ')[0];
    if (firstWord && firstWord !== item.shortName) return firstWord;
  }
  return null;
}

const AnswerGridComponent: React.FC<AnswerGridProps> = ({
  activeItemIds,
  currentTask,
  onSelectAnswer,
  onEnablePreset,
  onPlayComparison,
  onNewTask,
}) => {
  // 1. Fallback: If no items are active at all in the app
  const activeItemsCount = ALL_ITEMS.filter((i) => activeItemIds.includes(i.id)).length;
  if (activeItemsCount === 0) {
    return (
      <div className="w-full p-6 text-center bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-slate-800/80 shadow-md space-y-3">
        <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto text-xl">
          ⚠️
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-100">
            Нет активных элементов для тренировки
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
            Все элементы отключены. Выберите готовый набор для быстрого старта:
          </p>
        </div>
        {onEnablePreset && (
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => onEnablePreset('intervals')}
              className="px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 rounded-xl text-xs font-semibold transition cursor-pointer"
            >
              Интервалы
            </button>
            <button
              type="button"
              onClick={() => onEnablePreset('chords')}
              className="px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 rounded-xl text-xs font-semibold transition cursor-pointer"
            >
              Аккорды
            </button>
            <button
              type="button"
              onClick={() => onEnablePreset('scales')}
              className="px-3 py-1.5 bg-sky-600/20 hover:bg-sky-600/30 text-sky-300 border border-sky-500/40 rounded-xl text-xs font-semibold transition cursor-pointer"
            >
              Гаммы и лады
            </button>
            <button
              type="button"
              onClick={() => onEnablePreset('all')}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition shadow-md shadow-indigo-950 cursor-pointer"
            >
              Включить всё
            </button>
          </div>
        )}
      </div>
    );
  }

  // 2. Empty state: Before first task has been started
  if (!currentTask) {
    return (
      <div className="w-full p-5 sm:p-7 text-center bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-slate-800/80 shadow-md space-y-3.5 animate-in fade-in duration-200">
        <div className="w-11 h-11 rounded-2xl bg-indigo-600/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mx-auto shadow-inner">
          <ListMusic className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm sm:text-base font-bold text-slate-100">
            Тест на слух: выбор ответа
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto leading-relaxed">
            Нажмите «Новый звук», чтобы услышать созвучие. На экране сразу появится меню вариантов только из прозвучавшей категории.
          </p>
        </div>

        {onNewTask && (
          <div className="pt-1">
            <button
              type="button"
              onClick={onNewTask}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-indigo-950/60 border border-indigo-400/30 transition cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current shrink-0" />
              <span>Слушать первое задание</span>
            </button>
          </div>
        )}
      </div>
    );
  }

  // 3. Active Task: Render ONLY the buttons from the task's category!
  const currentCategory = currentTask.item.category;
  const categoryInfo = CATEGORIES.find((c) => c.id === currentCategory);
  const colors = CATEGORY_COLORS[currentCategory] || CATEGORY_COLORS.simple_intervals;
  const Icon = CATEGORY_ICONS[currentCategory] || Music2;

  // Retrieve curated items for this category in pedagogical pairing order
  const orderedIds = CATEGORY_ORDER[currentCategory] || [];
  const allCategoryItems = orderedIds
    .map((id) => ALL_ITEMS.find((item) => item.id === id))
    .filter((item): item is MusicItem => item !== undefined);

  // Append any extra items if exist
  ALL_ITEMS.forEach((item) => {
    if (item.category === currentCategory && !allCategoryItems.some((i) => i.id === item.id)) {
      allCategoryItems.push(item);
    }
  });

  // Filter by active items if user customized them and at least 2 are active
  const activeInCategory = allCategoryItems.filter((i) => activeItemIds.includes(i.id));
  const itemsToDisplay = activeInCategory.length >= 2 ? activeInCategory : allCategoryItems;

  const isAnswered = currentTask.userAnswerId !== null;
  const isWrong = isAnswered && !currentTask.isCorrect;
  const userPickedItem = isAnswered && currentTask.userAnswerId
    ? ALL_ITEMS.find((i) => i.id === currentTask.userAnswerId)
    : null;

  // Compute the optimal grid class to ensure 100% no-scrolling fit on phones
  let gridClass = 'grid gap-1.5 sm:gap-2';
  if (currentCategory === 'simple_intervals') {
    // 12 items: 2 columns x 6 rows
    gridClass += ' grid-cols-2';
  } else if (currentCategory === 'd7_inversions') {
    // 4 items: 2 columns on mobile, 4 columns on tablet/desktop
    gridClass += ' grid-cols-2 sm:grid-cols-4';
  } else if (currentCategory === 'triads' || currentCategory === 'seventh_chords') {
    // 8 items: 2 columns on mobile, 4 columns on tablet/desktop
    gridClass += ' grid-cols-2 sm:grid-cols-4';
  } else if (currentCategory === 'scales') {
    // 8 items: 2 columns on mobile (Majors left, Minors right), 4 cols on desktop
    gridClass += ' grid-cols-2 sm:grid-cols-4';
  } else if (currentCategory === 'characteristic_intervals') {
    // 8 items: 2 columns (Augmented left, Diminished right)
    gridClass += ' grid-cols-2 sm:grid-cols-4';
  } else if (currentCategory === 'modes') {
    // 7 items: 2 columns
    gridClass += ' grid-cols-2 sm:grid-cols-4';
  } else {
    gridClass += ' grid-cols-2 sm:grid-cols-4';
  }

  return (
    <div className="w-full space-y-2 animate-in fade-in duration-150">
      {/* Category Section Container: Single focused category card */}
      <section className="w-full bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-2 sm:p-3 shadow-md transition-all">
        {/* Category Header: Category badge + Reference Tone + Items count */}
        <div className="flex items-center justify-between gap-1.5 pb-1.5 mb-1.5 sm:mb-2 border-b border-slate-800/60">
          <div className="flex items-center gap-1.5 min-w-0">
            <div className={`p-1 sm:p-1.5 rounded-lg ${colors.iconBg} ${colors.iconText} border ${colors.border} shrink-0`}>
              <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h2 className="text-xs sm:text-sm font-bold text-slate-100 tracking-tight truncate">
                  {categoryInfo?.name || 'Задание'}
                </h2>
                <span className={`text-[9px] sm:text-[10px] font-mono px-1.5 py-0.2 rounded-md ${colors.bgBadge} ${colors.textBadge} font-semibold shrink-0`}>
                  {itemsToDisplay.length} вар.
                </span>
              </div>
              <p className="text-[10px] text-slate-400 truncate hidden min-[340px]:block">
                {categoryInfo?.shortDesc || 'Выберите созвучие на слух'}
              </p>
            </div>
          </div>

          {/* Reference Tone info */}
          <div className="flex items-center gap-1 px-2 py-0.5 sm:py-1 rounded-lg bg-slate-950/80 border border-slate-800/80 shrink-0 text-right">
            <span className="text-[10px] text-slate-400">
              Опора: <span className="font-bold text-slate-100">{currentTask.rootNoteName}</span>
            </span>
            {currentTask.playedDirection === 'down' ? (
              <span title="Вниз" className="flex items-center">
                <ArrowDown className="w-3 h-3 text-sky-400 shrink-0" />
              </span>
            ) : (
              <span title="Вверх" className="flex items-center">
                <ArrowUp className="w-3 h-3 text-emerald-400 shrink-0" />
              </span>
            )}
          </div>
        </div>

        {/* Compact Auditory Comparison Bar (Only when user picked wrong answer) */}
        {isWrong && (
          <div className="mb-2 p-1.5 sm:p-2 rounded-xl bg-slate-950/90 border border-rose-500/40 shadow-sm flex items-center justify-between gap-1.5 animate-in fade-in duration-150">
            <div className="flex items-center gap-1 min-w-0">
              <Volume2 className="w-3.5 h-3.5 text-rose-400 shrink-0 animate-pulse" />
              <span className="text-[10px] sm:text-[11px] font-semibold text-slate-300 truncate">
                Сравнение от «{currentTask.rootNoteName}»:
              </span>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {userPickedItem && (
                <button
                  type="button"
                  onClick={() => onPlayComparison && onPlayComparison(userPickedItem)}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 active:scale-95 text-rose-200 border border-rose-500/40 text-[10px] sm:text-[11px] font-semibold transition cursor-pointer"
                  title={`Слушать «${userPickedItem.name}»`}
                >
                  <Volume2 className="w-3 h-3 text-rose-400 shrink-0" />
                  <span className="truncate">Ваш: {userPickedItem.shortName}</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => onPlayComparison && onPlayComparison(currentTask.item)}
                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 active:scale-95 text-emerald-200 border border-emerald-500/40 text-[10px] sm:text-[11px] font-semibold transition cursor-pointer"
                title={`Слушать «${currentTask.item.name}»`}
              >
                <Volume2 className="w-3 h-3 text-emerald-400 shrink-0" />
                <span className="truncate">Верный: {currentTask.item.shortName}</span>
              </button>
            </div>
          </div>
        )}

        {/* The Evenly Balanced Category Buttons Grid */}
        {currentCategory === 'scales' || currentCategory === 'modes' ? (
          <div className="space-y-2">
            {/* Major Section */}
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-950/60 border border-slate-800/80 text-slate-300 text-[10px] font-medium tracking-wide">
                <span>{currentCategory === 'scales' ? 'Мажорные гаммы' : 'Мажорные лады и пентатоника'}</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {itemsToDisplay.filter((i) => isMajorQualityItem(i)).map((item) => {
                  const isUserPick = Boolean(currentTask.userAnswerId === item.id);
                  const isCorrectTarget = Boolean(currentTask.item.id === item.id);
                  const isClickableComparison = isWrong && (isCorrectTarget || isUserPick);
                  const isButtonDisabled = isAnswered && !isClickableComparison;

                  let btnStyle =
                    'bg-slate-950/60 hover:bg-slate-800/60 border-slate-800 text-slate-200 hover:border-slate-700 active:scale-[0.99]';

                  if (isAnswered) {
                    if (isCorrectTarget) {
                      btnStyle =
                        'bg-emerald-950/60 border-emerald-500/80 text-emerald-100 ring-1 ring-emerald-500/50 scale-[1.01] z-10 font-semibold';
                    } else if (isUserPick) {
                      btnStyle =
                        'bg-rose-950/60 border-rose-500/80 text-rose-100 ring-1 ring-rose-500/50 font-semibold';
                    } else {
                      btnStyle = 'opacity-25 bg-slate-950/30 border-slate-900/60 text-slate-500 pointer-events-none';
                    }
                  }

                  const subLabel = getButtonSubLabel(item);

                  const handleClick = () => {
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
                      onClick={handleClick}
                      disabled={isButtonDisabled}
                      className={`relative flex flex-col items-center justify-center p-1 sm:p-1.5 rounded-md border transition-all duration-100 text-center select-none h-[46px] sm:h-[50px] ${btnStyle} ${
                        isClickableComparison
                          ? 'cursor-pointer hover:ring-1 hover:ring-slate-400'
                          : isAnswered
                          ? 'cursor-default'
                          : 'cursor-pointer'
                      }`}
                      title={item.name}
                    >
                      <div className="flex items-center justify-center gap-1 w-full px-1">
                        <span className="font-semibold tracking-tight leading-tight truncate text-xs sm:text-[13px]">
                          {item.shortName}
                        </span>
                        {isAnswered && isCorrectTarget && (
                          <span className="flex items-center text-emerald-400 shrink-0">
                            {isWrong ? <Volume2 className="w-3 h-3 animate-pulse" /> : <Check className="w-3 h-3 stroke-[2.5]" />}
                          </span>
                        )}
                        {isAnswered && isUserPick && !isCorrectTarget && (
                          <span className="flex items-center text-rose-400 shrink-0">
                            <Volume2 className="w-3 h-3 animate-pulse" />
                          </span>
                        )}
                      </div>
                      {subLabel && (
                        <span className="text-[9px] sm:text-[10px] font-mono leading-none mt-0.5 truncate px-1 max-w-full text-slate-400">
                          {subLabel}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Minor Section */}
            <div className="space-y-1 pt-1">
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-950/60 border border-slate-800/80 text-slate-300 text-[10px] font-medium tracking-wide">
                <span>{currentCategory === 'scales' ? 'Минорные гаммы' : 'Минорные лады и пентатоника'}</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {itemsToDisplay.filter((i) => !isMajorQualityItem(i)).map((item) => {
                  const isUserPick = Boolean(currentTask.userAnswerId === item.id);
                  const isCorrectTarget = Boolean(currentTask.item.id === item.id);
                  const isClickableComparison = isWrong && (isCorrectTarget || isUserPick);
                  const isButtonDisabled = isAnswered && !isClickableComparison;

                  let btnStyle =
                    'bg-slate-950/60 hover:bg-slate-800/60 border-slate-800 text-slate-200 hover:border-slate-700 active:scale-[0.99]';

                  if (isAnswered) {
                    if (isCorrectTarget) {
                      btnStyle =
                        'bg-emerald-950/60 border-emerald-500/80 text-emerald-100 ring-1 ring-emerald-500/50 scale-[1.01] z-10 font-semibold';
                    } else if (isUserPick) {
                      btnStyle =
                        'bg-rose-950/60 border-rose-500/80 text-rose-100 ring-1 ring-rose-500/50 font-semibold';
                    } else {
                      btnStyle = 'opacity-25 bg-slate-950/30 border-slate-900/60 text-slate-500 pointer-events-none';
                    }
                  }

                  const subLabel = getButtonSubLabel(item);

                  const handleClick = () => {
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
                      onClick={handleClick}
                      disabled={isButtonDisabled}
                      className={`relative flex flex-col items-center justify-center p-1 sm:p-1.5 rounded-md border transition-all duration-100 text-center select-none h-[46px] sm:h-[50px] ${btnStyle} ${
                        isClickableComparison
                          ? 'cursor-pointer hover:ring-1 hover:ring-slate-400'
                          : isAnswered
                          ? 'cursor-default'
                          : 'cursor-pointer'
                      }`}
                      title={item.name}
                    >
                      <div className="flex items-center justify-center gap-1 w-full px-1">
                        <span className="font-semibold tracking-tight leading-tight truncate text-xs sm:text-[13px]">
                          {item.shortName}
                        </span>
                        {isAnswered && isCorrectTarget && (
                          <span className="flex items-center text-emerald-400 shrink-0">
                            {isWrong ? <Volume2 className="w-3 h-3 animate-pulse" /> : <Check className="w-3 h-3 stroke-[2.5]" />}
                          </span>
                        )}
                        {isAnswered && isUserPick && !isCorrectTarget && (
                          <span className="flex items-center text-rose-400 shrink-0">
                            <Volume2 className="w-3 h-3 animate-pulse" />
                          </span>
                        )}
                      </div>
                      {subLabel && (
                        <span className="text-[9px] sm:text-[10px] font-mono leading-none mt-0.5 truncate px-1 max-w-full text-slate-400">
                          {subLabel}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className={gridClass}>
            {itemsToDisplay.map((item, index) => {
              const isUserPick = Boolean(currentTask.userAnswerId === item.id);
              const isCorrectTarget = Boolean(currentTask.item.id === item.id);
              const isClickableComparison = isWrong && (isCorrectTarget || isUserPick);
              const isButtonDisabled = isAnswered && !isClickableComparison;

              // Compute Button Styles
              let btnStyle =
                'bg-slate-950/60 hover:bg-slate-800/60 border-slate-800 text-slate-200 hover:border-slate-700 active:scale-[0.99]';

              if (isAnswered) {
                if (isCorrectTarget) {
                  btnStyle =
                    'bg-emerald-950/60 border-emerald-500/80 text-emerald-100 ring-1 ring-emerald-500/50 scale-[1.01] z-10 font-semibold';
                } else if (isUserPick) {
                  btnStyle =
                    'bg-rose-950/60 border-rose-500/80 text-rose-100 ring-1 ring-rose-500/50 font-semibold';
                } else {
                  btnStyle = 'opacity-25 bg-slate-950/30 border-slate-900/60 text-slate-500 pointer-events-none';
                }
              }

              // Height tuned per category so 100% of options fit on phone screen
              let heightClass = 'h-[46px] sm:h-[50px]';
              if (currentCategory === 'd7_inversions') {
                heightClass = 'h-[48px] sm:h-[54px]';
              } else if (currentCategory === 'simple_intervals') {
                heightClass = 'h-[38px] sm:h-[42px]';
              }

              // Modes special: odd 7th item (Locrian) spans 2 cols on mobile for balanced symmetry
              const isLastOddMode = (currentCategory as string) === 'modes' && index === 6 && itemsToDisplay.length === 7;
              const spanClass = isLastOddMode ? 'col-span-2 sm:col-span-4' : '';

              const subLabel = getButtonSubLabel(item);

              const handleClick = () => {
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
                  onClick={handleClick}
                  disabled={isButtonDisabled}
                  className={`relative flex flex-col items-center justify-center p-1 sm:p-1.5 rounded-md border transition-all duration-100 text-center select-none ${heightClass} ${spanClass} ${btnStyle} ${
                    isClickableComparison
                      ? 'cursor-pointer hover:ring-1 hover:ring-slate-400'
                      : isAnswered
                      ? 'cursor-default'
                      : 'cursor-pointer'
                  }`}
                  title={
                    isClickableComparison
                      ? `Нажмите, чтобы послушать «${item.name}»`
                      : item.name
                  }
                >
                  {/* Short Title & Status Indicator */}
                  <div className="flex items-center justify-center gap-1 w-full px-1">
                    <span
                      className={`font-semibold tracking-tight leading-tight truncate ${
                        currentCategory === 'simple_intervals'
                          ? 'text-xs sm:text-sm'
                          : currentCategory === 'd7_inversions'
                          ? 'text-sm sm:text-base'
                          : 'text-xs sm:text-[13px]'
                      }`}
                    >
                      {item.shortName}
                    </span>

                    {isAnswered && isCorrectTarget && (
                      <span className="flex items-center text-emerald-400 shrink-0">
                        {isWrong ? <Volume2 className="w-3 h-3 animate-pulse" /> : <Check className="w-3 h-3 stroke-[2.5]" />}
                      </span>
                    )}
                    {isAnswered && isUserPick && !isCorrectTarget && (
                      <span className="flex items-center text-rose-400 shrink-0">
                        <Volume2 className="w-3 h-3 animate-pulse" />
                      </span>
                    )}
                  </div>

                  {/* Subtitle / Alteration / Description badge */}
                  {subLabel && (
                    <span
                      className={`text-[9px] sm:text-[10px] font-mono leading-none mt-0.5 truncate px-1 max-w-full ${
                        isAnswered && (isCorrectTarget || isUserPick)
                          ? 'opacity-90 font-semibold text-slate-200'
                          : 'text-slate-400 opacity-80'
                      }`}
                    >
                      {subLabel}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export const AnswerGrid = React.memo(AnswerGridComponent);
