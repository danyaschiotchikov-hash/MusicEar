import React from 'react';
import { AppStats } from '../types';
import { BarChart3, Check, X } from 'lucide-react';

interface StatsCounterWidgetProps {
  stats: AppStats;
  onClick: () => void;
}

export const StatsCounterWidget: React.FC<StatsCounterWidgetProps> = ({ stats, onClick }) => {
  const totalTested = stats.totalTested || 0;
  const totalCorrect = stats.totalCorrect || 0;
  const totalIncorrect = Math.max(0, totalTested - totalCorrect);
  const accuracy = totalTested > 0 ? Math.round((totalCorrect / totalTested) * 100) : 0;

  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative flex items-center gap-2 sm:gap-2.5 px-2.5 sm:px-3 py-1.5 sm:py-2 bg-slate-900/90 hover:bg-slate-800/95 active:scale-95 border border-slate-800 hover:border-slate-700 rounded-xl transition-all cursor-pointer shadow-xs shrink-0 select-none"
      title={`Статистика: ${totalCorrect} верно, ${totalIncorrect} ошибок из ${totalTested} (${accuracy}%). Нажмите для подробного отчёта.`}
      aria-label="Статистика тренировки"
    >
      <div className="flex items-center justify-center p-1 rounded-lg bg-indigo-500/15 text-indigo-400 group-hover:scale-105 transition-transform shrink-0">
        <BarChart3 className="w-3.5 h-3.5" />
      </div>

      <div className="flex flex-col items-start gap-0.5">
        <div className="flex items-center gap-2 text-[11px] sm:text-xs font-mono font-semibold leading-none">
          {totalTested === 0 ? (
            <span className="text-[11px] sm:text-xs text-slate-400 font-sans font-medium">
              0 ответов
            </span>
          ) : (
            <>
              <span className="text-emerald-400 flex items-center gap-0.5">
                <Check className="w-3 h-3 stroke-[2.5]" />
                {totalCorrect}
              </span>
              <span className="text-rose-400 flex items-center gap-0.5">
                <X className="w-3 h-3 stroke-[2.5]" />
                {totalIncorrect}
              </span>
              <span className="text-slate-300 font-bold pl-1 border-l border-slate-700/80">
                {accuracy}%
              </span>
            </>
          )}
        </div>

        {/* Micro progress indicator */}
        <div className="w-full bg-slate-800 rounded-full h-1 overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              totalTested === 0
                ? 'bg-transparent'
                : accuracy >= 80
                ? 'bg-emerald-400'
                : accuracy >= 50
                ? 'bg-amber-400'
                : 'bg-rose-400'
            }`}
            style={{ width: `${totalTested === 0 ? 0 : accuracy}%` }}
          />
        </div>
      </div>
    </button>
  );
};
