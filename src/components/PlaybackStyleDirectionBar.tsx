import React from 'react';
import { PlaybackSettings } from '../types';
import {
  Activity,
  Layers,
  ArrowUp,
  ArrowDown,
  Shuffle,
  Sliders,
} from 'lucide-react';

interface PlaybackStyleDirectionBarProps {
  settings: PlaybackSettings;
  onSettingsChange: (updated: Partial<PlaybackSettings>) => void;
}

export const PlaybackStyleDirectionBar: React.FC<PlaybackStyleDirectionBarProps> = ({
  settings,
  onSettingsChange,
}) => {
  return (
    <div className="w-full bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-xl p-1 sm:p-1.5 flex items-center justify-between gap-1 sm:gap-2 shadow-sm text-xs overflow-x-auto">
      {/* 1. Style Group: Арпеджио / Гармонически */}
      <div className="flex items-center gap-1 shrink-0">
        <span className="font-semibold text-slate-400 items-center gap-1 mr-0.5 text-[11px] sm:text-xs hidden lg:flex">
          <Activity className="w-3.5 h-3.5 text-indigo-400" />
          <span>Стиль:</span>
        </span>
        <div className="flex items-center gap-0.5 bg-slate-950/70 border border-slate-800/80 p-0.5 rounded-lg shrink-0">
          <button
            type="button"
            onClick={() => onSettingsChange({ style: 'arpeggio' })}
            className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] sm:text-xs transition cursor-pointer whitespace-nowrap ${
              settings.style === 'arpeggio'
                ? 'bg-indigo-600 text-white font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Мелодически (арпеджио)"
          >
            <Activity className="w-3 h-3 shrink-0" />
            <span>Арпеджио</span>
          </button>
          <button
            type="button"
            onClick={() => onSettingsChange({ style: 'harmonic' })}
            className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] sm:text-xs transition cursor-pointer whitespace-nowrap ${
              settings.style === 'harmonic'
                ? 'bg-indigo-600 text-white font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Гармонически (одновременно)"
          >
            <Layers className="w-3 h-3 shrink-0" />
            <span className="hidden sm:inline">Гармонически</span>
            <span className="sm:hidden">Гарм.</span>
          </button>
        </div>
      </div>

      <div className="h-4 w-px bg-slate-800/80 shrink-0 mx-0.5" />

      {/* 2. Direction Group: Вверх / Вниз / Случайно */}
      <div className="flex items-center gap-1 shrink-0">
        <span className="font-semibold text-slate-400 items-center gap-1 mr-0.5 text-[11px] sm:text-xs hidden lg:flex">
          <Sliders className="w-3.5 h-3.5 text-indigo-400" />
          <span>Направление:</span>
        </span>
        <div className="flex items-center gap-0.5 bg-slate-950/70 border border-slate-800/80 p-0.5 rounded-lg shrink-0">
          <button
            type="button"
            onClick={() => onSettingsChange({ direction: 'up' })}
            className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] sm:text-xs transition cursor-pointer whitespace-nowrap ${
              settings.direction === 'up'
                ? 'bg-emerald-600 text-white font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Снизу вверх"
          >
            <ArrowUp className="w-3 h-3 shrink-0 stroke-[2.5]" />
            <span>Вверх</span>
          </button>
          <button
            type="button"
            onClick={() => onSettingsChange({ direction: 'down' })}
            className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] sm:text-xs transition cursor-pointer whitespace-nowrap ${
              settings.direction === 'down'
                ? 'bg-sky-600 text-white font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Сверху вниз"
          >
            <ArrowDown className="w-3 h-3 shrink-0 stroke-[2.5]" />
            <span>Вниз</span>
          </button>
          <button
            type="button"
            onClick={() => onSettingsChange({ direction: 'random' })}
            className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] sm:text-xs transition cursor-pointer whitespace-nowrap ${
              settings.direction === 'random'
                ? 'bg-purple-600 text-white font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Случайное направление"
          >
            <Shuffle className="w-3 h-3 shrink-0" />
            <span className="hidden sm:inline">Случайно</span>
            <span className="sm:hidden">Случ.</span>
          </button>
        </div>
      </div>
    </div>
  );
};
