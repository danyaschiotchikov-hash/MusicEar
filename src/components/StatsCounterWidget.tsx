import React from 'react';
import { AppStats } from '../types';
import { BarChart3, CheckCircle2, XCircle } from 'lucide-react';

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
      className="group relative flex flex-col justify-center px-2 py-1 sm:px-2.5 sm:py-1.5 bg-slate-900/90 hover:bg-slate-800/95 active:scale-95 border border-slate-700/80 hover:border-indigo-500/50 rounded-xl transition-all cursor-pointer shadow-xs shrink-0 select-none overflow-hidden"
      title={`Статистика: ${totalCorrect} верно, ${totalIncorrect} ошибок из ${totalTested} (${accuracy}%). Нажмите для подробного отчёта.`}
      aria-label="Статистика тренировки"
    >
      <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs font-mono font-bold leading-none">
        <BarChart3 className="w-3.5 h-3.5 text-indigo-400 shrink-0 group-hover:scale-110 transition-transform" />

        {totalTested === 0 ? (
          <span className="text-[10px] sm:text-xs text-slate-400 font-sans font-medium">
            Статистика
          </span>
        ) : (
          <div className="flex items-center gap-1.5">
            <span className="text-emerald-400 flex items-center gap-0.5">
              <CheckCircle2 className="w-3 h-3 shrink-0" />
              {totalCorrect}
            </span>
            <span className="text-rose-400 flex items-center gap-0.5">
              <XCircle className="w-3 h-3 shrink-0" />
              {totalIncorrect}
            </span>
            <span className="text-indigo-300 font-black pl-0.5 border-l border-slate-700 text-[10px] sm:text-xs">
              {accuracy}%
            </span>
          </div>
        )}
      </div>

      {/* Mini Progress Bar */}
      <div className="w-full bg-slate-800 rounded-full h-1 mt-1 overflow-hidden">
        {totalTested === 0 ? (
          <div className="w-0 h-full bg-slate-700" />
        ) : (
          <div
            className={`h-full transition-all duration-500 ${
              accuracy >= 80
                ? 'bg-emerald-400'
                : accuracy >= 50
                ? 'bg-amber-400'
                : 'bg-rose-400'
            }`}
            style={{ width: `${accuracy}%` }}
          />
        )}
      </div>
    </button>
  );
};
