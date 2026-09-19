import React, { useState } from 'react';
import { AppStats, CategoryId } from '../types';
import { CATEGORIES, ALL_ITEMS } from '../data/musicData';
import { X, BarChart3, RotateCcw, Award, CheckCircle2, XCircle, Percent } from 'lucide-react';

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: AppStats;
  onResetStats: () => void;
}

export const StatsModal: React.FC<StatsModalProps> = ({
  isOpen,
  onClose,
  stats,
  onResetStats,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | 'all'>('all');
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  if (!isOpen) return null;

  const totalTested = stats.totalTested;
  const totalCorrect = stats.totalCorrect;
  const totalIncorrect = Math.max(0, totalTested - totalCorrect);
  const overallPercentage = totalTested > 0 ? Math.round((totalCorrect / totalTested) * 100) : 0;

  const filteredItems = ALL_ITEMS.filter((item) => {
    if (selectedCategory === 'all') return true;
    return item.category === selectedCategory;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-slate-900/90 sticky top-0 z-10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-100">
                Статистика тренировки
              </h2>
              <p className="text-xs text-slate-400">
                Анализ точности распознавания элементов на слух
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

        {/* Global Summary Cards */}
        <div className="p-4 bg-slate-950/40 border-b border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
          <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
            <span className="text-[11px] text-slate-400 font-medium">Всего вопросов</span>
            <div className="text-lg font-bold font-mono text-slate-100 mt-0.5">
              {totalTested}
            </div>
          </div>
          <div className="bg-slate-900/80 p-3 rounded-xl border border-emerald-900/40">
            <span className="text-[11px] text-emerald-400 font-medium flex items-center justify-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Верно
            </span>
            <div className="text-lg font-bold font-mono text-emerald-400 mt-0.5">
              {totalCorrect}
            </div>
          </div>
          <div className="bg-slate-900/80 p-3 rounded-xl border border-rose-900/40">
            <span className="text-[11px] text-rose-400 font-medium flex items-center justify-center gap-1">
              <XCircle className="w-3 h-3" /> Ошибок
            </span>
            <div className="text-lg font-bold font-mono text-rose-400 mt-0.5">
              {totalIncorrect}
            </div>
          </div>
          <div className="bg-slate-900/80 p-3 rounded-xl border border-indigo-900/40">
            <span className="text-[11px] text-indigo-400 font-medium flex items-center justify-center gap-1">
              <Percent className="w-3 h-3" /> Точность
            </span>
            <div className="text-lg font-bold font-mono text-indigo-300 mt-0.5">
              {overallPercentage}%
            </div>
          </div>
        </div>

        {/* Category filter tabs */}
        <div className="px-4 py-2.5 bg-slate-950/60 border-b border-slate-800 flex items-center gap-1.5 overflow-x-auto text-xs">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1 rounded-lg font-medium whitespace-nowrap transition cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
            }`}
          >
            Все ({ALL_ITEMS.length})
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

        {/* Items detailed breakdown list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {filteredItems.map((item) => {
            const itemStat = stats.items[item.id] || { tested: 0, correct: 0 };
            const pct =
              itemStat.tested > 0 ? Math.round((itemStat.correct / itemStat.tested) * 100) : 0;

            let colorClass = 'bg-slate-700';
            let textClass = 'text-slate-500';
            if (itemStat.tested > 0) {
              if (pct >= 80) {
                colorClass = 'bg-emerald-500';
                textClass = 'text-emerald-400';
              } else if (pct >= 50) {
                colorClass = 'bg-amber-500';
                textClass = 'text-amber-400';
              } else {
                colorClass = 'bg-rose-500';
                textClass = 'text-rose-400';
              }
            }

            return (
              <div
                key={item.id}
                className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-3 flex flex-col gap-2 hover:border-slate-700/80 transition"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-semibold text-xs text-slate-200 truncate">
                      {item.shortName}
                    </span>
                    <span className="text-[11px] text-slate-400 truncate hidden sm:inline">
                      • {item.name}
                    </span>
                    {item.hint && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 font-mono">
                        {item.hint}
                      </span>
                    )}
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
                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${colorClass}`}
                    style={{ width: `${itemStat.tested > 0 ? pct : 0}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer with Reset confirmation */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex flex-wrap items-center justify-between gap-3">
          {showConfirmReset ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-rose-400">Сбросить все данные?</span>
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
