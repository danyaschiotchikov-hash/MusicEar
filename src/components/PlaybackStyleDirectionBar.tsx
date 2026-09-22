import React from 'react';
import { PlaybackSettings, TrainingMode } from '../types';
import {
  Activity,
  Layers,
  ArrowUp,
  ArrowDown,
  Shuffle,
  Eye,
  Library,
  ListMusic,
  Flame,
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
  const isElementsMode = mode === 'oral' || mode === 'standard' || mode === 'marathon';

  return (
    <div className="w-full bg-slate-900/60 border border-slate-800 rounded-xl p-1.5 sm:p-2 flex items-center justify-between gap-2 shadow-sm text-xs">
      {/* 1. Style Group: Арпеджио / Гармонически (слева) */}
      <div className="flex items-center gap-1 flex-1">
        <div className="flex items-center gap-1 bg-slate-950/70 border border-slate-800 p-0.5 rounded-lg flex-1">
          <button
            type="button"
            onClick={() => onSettingsChange({ style: 'arpeggio' })}
            className={`flex-1 flex items-center justify-center p-2 rounded-md text-xs sm:text-sm transition cursor-pointer ${
              settings.style === 'arpeggio'
                ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Мелодически (арпеджио)"
          >
            <Activity className="w-4 h-4 shrink-0" />
          </button>
          <button
            type="button"
            onClick={() => onSettingsChange({ style: 'harmonic' })}
            className={`flex-1 flex items-center justify-center p-2 rounded-md text-xs sm:text-sm transition cursor-pointer ${
              settings.style === 'harmonic'
                ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Гармонически (одновременно)"
          >
            <Layers className="w-4 h-4 shrink-0" />
          </button>
        </div>
      </div>

      <div className="h-7 w-px bg-slate-800 shrink-0 mx-0.5" />

      {/* 2. Sub-mode Group: Слух / Марафон (по центру) */}
      {isElementsMode && onSwitchMode && (
        <div className="flex items-center gap-1 flex-1">
          <div className="flex items-center gap-1 bg-slate-950/70 border border-slate-800 p-0.5 rounded-lg flex-1">
            <button
              type="button"
              onClick={() => onSwitchMode('oral')}
              className={`flex-1 flex items-center justify-center p-2 rounded-md text-xs sm:text-sm transition cursor-pointer ${
                mode === 'oral'
                  ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Карточки"
              aria-label="Карточки"
            >
              <Library className="w-4 h-4 shrink-0" />
            </button>
            <button
              type="button"
              onClick={() => onSwitchMode('marathon')}
              className={`flex-1 flex items-center justify-center p-2 rounded-md text-xs sm:text-sm transition cursor-pointer ${
                mode === 'marathon'
                  ? 'bg-amber-600 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-amber-300'
              }`}
              title="Режим «Марафон»"
              aria-label="Марафон"
            >
              <Flame className={`w-4 h-4 shrink-0 ${mode === 'marathon' ? 'text-white fill-white' : 'text-amber-400 fill-amber-400'}`} />
            </button>
          </div>
        </div>
      )}

      <div className="h-7 w-px bg-slate-800 shrink-0 mx-0.5" />

      {/* 3. Direction Group: Вверх / Случайно / Вниз */}
      <div className="flex items-center gap-1 flex-1">
        <div className="flex items-center gap-1 bg-slate-950/70 border border-slate-800 p-0.5 rounded-lg flex-1">
          <button
            type="button"
            onClick={() => onSettingsChange({ direction: 'up' })}
            className={`flex-1 flex items-center justify-center p-2 rounded-md text-xs sm:text-sm transition cursor-pointer ${
              settings.direction === 'up'
                ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Построение вверх"
          >
            <ArrowUp className="w-4 h-4 stroke-[2.5]" />
          </button>
          <button
            type="button"
            onClick={() => onSettingsChange({ direction: 'random' })}
            className={`flex-1 flex items-center justify-center p-2 rounded-md text-xs sm:text-sm transition cursor-pointer ${
              settings.direction === 'random' || settings.direction === 'chain'
                ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Случайное направление"
          >
            <Shuffle className="w-4 h-4 stroke-[2.5]" />
          </button>
          <button
            type="button"
            onClick={() => onSettingsChange({ direction: 'down' })}
            className={`flex-1 flex items-center justify-center p-2 rounded-md text-xs sm:text-sm transition cursor-pointer ${
              settings.direction === 'down'
                ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Построение вниз"
          >
            <ArrowDown className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
      </div>
    </div>
  );
};

