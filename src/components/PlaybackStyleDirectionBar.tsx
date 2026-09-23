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
  const btnClass = "w-10 sm:w-11 h-8 flex items-center justify-center rounded-md text-xs sm:text-sm transition cursor-pointer shrink-0";

  const isConstruction = mode === 'construction';

  return (
    <div className={`w-full flex items-center justify-center gap-2 sm:gap-3 text-xs ${
      isConstruction
        ? 'p-0.5'
        : 'bg-slate-900/60 border border-slate-800 rounded-xl p-1.5 sm:p-2 shadow-sm'
    }`}>
      {/* 1. Style Group: Арпеджио / Гармонически */}
      <div className="flex items-center gap-0.5 bg-slate-950/70 border border-slate-800 p-0.5 rounded-lg shadow-inner">
        <button
          type="button"
          onClick={() => onSettingsChange({ style: 'arpeggio' })}
          className={`${btnClass} ${
            settings.style === 'arpeggio'
              ? 'bg-indigo-600 text-white font-semibold shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          title="Мелодически (арпеджио)"
          aria-label="Мелодически"
        >
          <Activity className="w-4 h-4 shrink-0" />
        </button>
        <button
          type="button"
          onClick={() => onSettingsChange({ style: 'harmonic' })}
          className={`${btnClass} ${
            settings.style === 'harmonic'
              ? 'bg-indigo-600 text-white font-semibold shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          title="Гармонически (одновременно)"
          aria-label="Гармонически"
        >
          <Layers className="w-4 h-4 shrink-0" />
        </button>
      </div>

      {/* 2. Sub-mode Group: Карточки / Марафон */}
      {isElementsMode && onSwitchMode && (
        <>
          <div className="h-6 w-px bg-slate-800 shrink-0 mx-0.5" />
          <div className="flex items-center gap-0.5 bg-slate-950/70 border border-slate-800 p-0.5 rounded-lg shadow-inner">
            <button
              type="button"
              onClick={() => onSwitchMode('oral')}
              className={`${btnClass} ${
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
              className={`${btnClass} ${
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
        </>
      )}

      <div className="h-6 w-px bg-slate-800 shrink-0 mx-0.5" />

      {/* 3. Direction Group: Вверх / Случайно / Вниз */}
      <div className="flex items-center gap-0.5 bg-slate-950/70 border border-slate-800 p-0.5 rounded-lg shadow-inner">
        <button
          type="button"
          onClick={() => onSettingsChange({ direction: 'up' })}
          className={`${btnClass} ${
            settings.direction === 'up'
              ? 'bg-indigo-600 text-white font-semibold shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          title="Построение вверх"
          aria-label="Вверх"
        >
          <ArrowUp className="w-4 h-4 stroke-[2.5]" />
        </button>
        <button
          type="button"
          onClick={() => onSettingsChange({ direction: 'random' })}
          className={`${btnClass} ${
            settings.direction === 'random' || settings.direction === 'chain'
              ? 'bg-indigo-600 text-white font-semibold shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          title="Случайное направление"
          aria-label="Случайно"
        >
          <Shuffle className="w-4 h-4 stroke-[2.5]" />
        </button>
        <button
          type="button"
          onClick={() => onSettingsChange({ direction: 'down' })}
          className={`${btnClass} ${
            settings.direction === 'down'
              ? 'bg-indigo-600 text-white font-semibold shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          title="Построение вниз"
          aria-label="Вниз"
        >
          <ArrowDown className="w-4 h-4 stroke-[2.5]" />
        </button>
      </div>
    </div>
  );
};

