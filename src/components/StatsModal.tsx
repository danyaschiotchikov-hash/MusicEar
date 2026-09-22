import React, { useState, useMemo } from 'react';
import { AppStats, CategoryId } from '../types';
import { CATEGORIES, ALL_ITEMS } from '../data/musicData';
import {
  X,
  BarChart3,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Percent,
  Sparkles,
  AlertTriangle,
  Flame,
  Check,
  HelpCircle,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { getSpacedRepetitionOverview, calculateItemWeight, getItemMasteryLevel } from '../utils/spacedRepetition';

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: AppStats;
  onResetStats: () => void;
  onPracticeStruggling?: (itemIds: string[]) => void;
}

type MasteryFilter = 'all' | 'struggling' | 'learning' | 'mastered' | 'untested';

export const StatsModal: React.FC<StatsModalProps> = ({
  isOpen,
  onClose,
  stats,
  onResetStats,
  onPracticeStruggling,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | 'all'>('all');
  const [masteryFilter, setMasteryFilter] = useState<MasteryFilter>('all');
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  const srsOverview = useMemo(() => {
    return getSpacedRepetitionOverview(stats, ALL_ITEMS);
  }, [stats]);

  if (!isOpen) return null;

  const totalTested = stats.totalTested;
  const totalCorrect = stats.totalCorrect;
  const totalIncorrect = Math.max(0, totalTested - totalCorrect);
  const overallPercentage = totalTested > 0 ? Math.round((totalCorrect / totalTested) * 100) : 0;

  const filteredItems = ALL_ITEMS.filter((item) => {
    if (selectedCategory !== 'all' && item.category !== selectedCategory) {
      return false;
    }
    if (masteryFilter !== 'all') {
      const stat = stats.items[item.id] || { tested: 0, correct: 0 };
      const { level } = getItemMasteryLevel(stat);
      if (level !== masteryFilter) return false;
    }
    return true;
  });

  const handleStartStrugglingPractice = () => {
    if (srsOverview.strugglingItems.length > 0 && onPracticeStruggling) {
      const targetIds = srsOverview.strugglingItems.map((s) => s.item.id);
      onPracticeStruggling(targetIds);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[92vh] bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-slate-900/95 sticky top-0 z-10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-100">
                  Статистика и Умный повтор
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> SRS активен
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Анализ точности и адаптивное распределение частоты повторений
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* SRS Status Banner */}
        <div className="px-4 py-3 bg-slate-950/60 border-b border-slate-800/80 space-y-2.5">
          {/* 4 Mastery Tiers */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
            <button
              onClick={() => setMasteryFilter(masteryFilter === 'struggling' ? 'all' : 'struggling')}
              className={`p-2 rounded-xl border text-left transition cursor-pointer ${
                masteryFilter === 'struggling'
                  ? 'bg-rose-950/50 border-rose-500 ring-1 ring-rose-500/50'
                  : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between text-[11px] text-rose-400 font-medium">
                <span className="flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> Ошибки
                </span>
                <span className="font-mono font-bold">{srsOverview.strugglingCount}</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-1">Частые повторы</div>
            </button>

            <button
              onClick={() => setMasteryFilter(masteryFilter === 'learning' ? 'all' : 'learning')}
              className={`p-2 rounded-xl border text-left transition cursor-pointer ${
                masteryFilter === 'learning'
                  ? 'bg-amber-950/50 border-amber-500 ring-1 ring-amber-500/50'
                  : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between text-[11px] text-amber-400 font-medium">
                <span className="flex items-center gap-1">
                  <Flame className="w-3 h-3" /> В процессе
                </span>
                <span className="font-mono font-bold">{srsOverview.learningCount}</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-1">Закрепление</div>
            </button>

            <button
              onClick={() => setMasteryFilter(masteryFilter === 'mastered' ? 'all' : 'mastered')}
              className={`p-2 rounded-xl border text-left transition cursor-pointer ${
                masteryFilter === 'mastered'
                  ? 'bg-emerald-950/50 border-emerald-500 ring-1 ring-emerald-500/50'
                  : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between text-[11px] text-emerald-400 font-medium">
                <span className="flex items-center gap-1">
                  <Check className="w-3 h-3" /> Освоено
                </span>
                <span className="font-mono font-bold">{srsOverview.masteredCount}</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-1">Редкий контроль</div>
            </button>

            <button
              onClick={() => setMasteryFilter(masteryFilter === 'untested' ? 'all' : 'untested')}
              className={`p-2 rounded-xl border text-left transition cursor-pointer ${
                masteryFilter === 'untested'
                  ? 'bg-slate-800/80 border-slate-600 ring-1 ring-slate-500/50'
                  : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
                <span className="flex items-center gap-1">
                  <HelpCircle className="w-3 h-3" /> Не изучено
                </span>
                <span className="font-mono font-bold">{srsOverview.untestedCount}</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-1">Ждут изучения</div>
            </button>
          </div>

          {/* Focus Drill Callout if user has struggling items */}
          {srsOverview.strugglingCount > 0 && onPracticeStruggling && (
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-rose-950/30 border border-rose-900/60 gap-3">
              <div className="text-xs space-y-0.5">
                <span className="font-semibold text-rose-300 block">
                  Обнаружено {srsOverview.strugglingCount} проблемных элементов
                </span>
                <span className="text-[11px] text-slate-400 block">
                  Умный повтор автоматически повысил их приоритет в генераторе
                </span>
              </div>
              <button
                type="button"
                onClick={handleStartStrugglingPractice}
                className="shrink-0 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm transition cursor-pointer"
              >
                <span>Отработать ошибки</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Global Summary Metric Strip */}
        <div className="px-4 py-2.5 bg-slate-950/40 border-b border-slate-800/80 grid grid-cols-4 gap-2 text-center">
          <div className="bg-slate-900/70 p-2 rounded-lg border border-slate-800">
            <span className="text-[10px] text-slate-400 font-medium block">Вопросов</span>
            <div className="text-sm sm:text-base font-bold font-mono text-slate-100 mt-0.5">
              {totalTested}
            </div>
          </div>
          <div className="bg-slate-900/70 p-2 rounded-lg border border-emerald-900/30">
            <span className="text-[10px] text-emerald-400 font-medium block">Верно</span>
            <div className="text-sm sm:text-base font-bold font-mono text-emerald-400 mt-0.5">
              {totalCorrect}
            </div>
          </div>
          <div className="bg-slate-900/70 p-2 rounded-lg border border-rose-900/30">
            <span className="text-[10px] text-rose-400 font-medium block">Ошибок</span>
            <div className="text-sm sm:text-base font-bold font-mono text-rose-400 mt-0.5">
              {totalIncorrect}
            </div>
          </div>
          <div className="bg-slate-900/70 p-2 rounded-lg border border-indigo-900/30">
            <span className="text-[10px] text-indigo-400 font-medium block">Точность</span>
            <div className="text-sm sm:text-base font-bold font-mono text-indigo-300 mt-0.5">
              {overallPercentage}%
            </div>
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="px-4 py-2 bg-slate-950/70 border-b border-slate-800 flex items-center gap-1.5 overflow-x-auto text-xs shrink-0">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1 rounded-lg font-medium whitespace-nowrap transition cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
            }`}
          >
            Все категории ({ALL_ITEMS.length})
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Items Detailed Breakdown List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              Нет элементов, соответствующих выбранному фильтру.
            </div>
          ) : (
            filteredItems.map((item) => {
              const itemStat = stats.items[item.id] || { tested: 0, correct: 0 };
              const { level, labelRu } = getItemMasteryLevel(itemStat);
              const weight = calculateItemWeight(item.id, itemStat);
              const pct =
                itemStat.tested > 0 ? Math.round((itemStat.correct / itemStat.tested) * 100) : 0;

              let badgeColor = 'bg-slate-800 text-slate-400 border-slate-700';
              let barColor = 'bg-slate-700';
              let textClass = 'text-slate-500';

              if (itemStat.tested > 0) {
                if (level === 'mastered') {
                  badgeColor = 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60';
                  barColor = 'bg-emerald-500';
                  textClass = 'text-emerald-400';
                } else if (level === 'learning') {
                  badgeColor = 'bg-amber-950/60 text-amber-300 border-amber-800/60';
                  barColor = 'bg-amber-500';
                  textClass = 'text-amber-400';
                } else {
                  badgeColor = 'bg-rose-950/60 text-rose-300 border-rose-800/60';
                  barColor = 'bg-rose-500';
                  textClass = 'text-rose-400';
                }
              }

              return (
                <div
                  key={item.id}
                  className="bg-slate-950/50 border border-slate-800/90 rounded-xl p-3 flex flex-col gap-2 hover:border-slate-700 transition"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-semibold text-xs text-slate-200 truncate">
                        {item.shortName}
                      </span>
                      <span className="text-[11px] text-slate-400 truncate hidden sm:inline">
                        • {item.name}
                      </span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${badgeColor}`}
                      >
                        {labelRu}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-mono shrink-0">
                      <span className="text-slate-400">
                        {itemStat.correct} / {itemStat.tested}
                      </span>
                      <span className={`font-bold min-w-[36px] text-right ${textClass}`}>
                        {itemStat.tested > 0 ? `${pct}%` : '—'}
                      </span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-slate-800/80 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${barColor}`}
                      style={{ width: `${itemStat.tested > 0 ? pct : 0}%` }}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer with Reset Confirmation */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/95 flex flex-wrap items-center justify-between gap-3">
          {showConfirmReset ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-rose-400">Сбросить все данные статистики?</span>
              <button
                onClick={() => {
                  onResetStats();
                  setShowConfirmReset(false);
                }}
                className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white text-xs font-medium rounded-lg cursor-pointer"
              >
                Да, стереть
              </button>
              <button
                onClick={() => setShowConfirmReset(false)}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg cursor-pointer"
              >
                Отмена
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowConfirmReset(true)}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-rose-400 transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Сбросить статистику</span>
            </button>
          )}

          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition cursor-pointer"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};
