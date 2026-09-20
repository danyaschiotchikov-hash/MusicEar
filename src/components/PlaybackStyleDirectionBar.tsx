import React from 'react';
import { PlaybackSettings, TrainingMode } from '../types';
import {
  Activity,
  Layers,
  ArrowUp,
  ArrowDown,
  Shuffle,
  Eye,
  ListMusic,
} from 'lucide-react';

interface PlaybackStyleDirectionBarProps {
  settings: PlaybackSettings;
  onSettingsChange: (updated: Partial<PlaybackSettings>) => void;
  mode?: TrainingMode | string;
  onSwitchMode?: (newMode: TrainingMode) => void;
}

export const PlaybackStyleDirectionBar: React.FC<PlaybackStyleDirectionBarProps> = ({
  settings,
  onSettingsChange,
  mode,
  onSwitchMode,
}) => {
  const isOralOrStandard = mode === 'oral' || mode === 'standard';

  return (
    <div className="w-full bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-xl p-1 sm:p-1.5 flex items-center justify-between gap-1 sm:gap-2 shadow-sm text-xs overflow-x-auto no-scrollbar [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {/* 0. Sub-mode Group: Устный счёт / Тест на слух (Только иконки) */}
      {isOralOrStandard && onSwitchMode && (
        <>
          <div className="flex items-center gap-1 shrink-0">
            <div className="flex items-center gap-0.5 bg-slate-950/70 border border-slate-800/80 p-0.5 rounded-lg shrink-0">
              <button
                type="button"
                onClick={() => onSwitchMode('oral')}
                className={`flex items-center justify-center p-1.5 sm:px-2 rounded-md text-[11px] sm:text-xs transition cursor-pointer ${
                  mode === 'oral'
                    ? 'bg-indigo-600 text-white font-bold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Устный режим"
                aria-label="Устный режим"
              >
                <Eye className="w-3.5 h-3.5 shrink-0" />
              </button>
              <button
                type="button"
                onClick={() => onSwitchMode('standard')}
                className={`flex items-center justify-center p-1.5 sm:px-2 rounded-md text-[11px] sm:text-xs transition cursor-pointer ${
                  mode === 'standard'
                    ? 'bg-indigo-600 text-white font-bold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Тест на слух (выбор ответа)"
                aria-label="Тест на слух"
              >
                <ListMusic className="w-3.5 h-3.5 shrink-0" />
              </button>
            </div>
          </div>

          <div className="h-4 w-px bg-slate-800/80 shrink-0 mx-0.5" />
        </>
      )}

      {/* 1. Style Group: Арпеджио / Гармонически */}
      <div className="flex items-center gap-1 shrink-0">
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

      {/* 2. Direction Group: Вверх (иконка) / Случайно (иконка) / Вниз (иконка) */}
      <div className="flex items-center gap-1 shrink-0">
        <div className="flex items-center gap-0.5 bg-slate-950/70 border border-slate-800/80 p-0.5 rounded-lg shrink-0">
          <button
            type="button"
            onClick={() => onSettingsChange({ direction: 'up' })}
            className={`flex items-center justify-center p-1.5 sm:px-2.5 rounded-md text-[11px] sm:text-xs transition cursor-pointer ${
              settings.direction === 'up'
                ? 'bg-emerald-600 text-white font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Построение вверх (снизу вверх)"
          >
            <ArrowUp className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>

          <button
            type="button"
            onClick={() => onSettingsChange({ direction: 'random' })}
            className={`flex items-center justify-center p-1.5 sm:px-2.5 rounded-md text-[11px] sm:text-xs transition cursor-pointer ${
              settings.direction === 'random' || settings.direction === 'chain'
                ? 'bg-purple-600 text-white font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Случайное направление"
          >
            <Shuffle className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>

          <button
            type="button"
            onClick={() => onSettingsChange({ direction: 'down' })}
            className={`flex items-center justify-center p-1.5 sm:px-2.5 rounded-md text-[11px] sm:text-xs transition cursor-pointer ${
              settings.direction === 'down'
                ? 'bg-sky-600 text-white font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Построение вниз (сверху вниз)"
          >
            <ArrowDown className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>
        </div>
      </div>
    </div>
  );
};

