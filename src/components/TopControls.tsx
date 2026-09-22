import React, { useState } from 'react';
import { PlaybackSettings, TimbreType, PlaybackStyle, PlaybackDirection } from '../types';
import { NOTE_NAMES, NOTE_NAMES_RU } from '../data/musicData';
import { Sliders, Volume2, Music, Shuffle, ChevronDown, ChevronUp, Loader2, Palette } from 'lucide-react';
import { CARD_PALETTES, CardPaletteId } from '../utils/cardPalettes';

interface TopControlsProps {
  settings: PlaybackSettings;
  onChange: (updated: Partial<PlaybackSettings>) => void;
  sampleStatus: { isLoaded: boolean; isLoading: boolean; progress: number };
  onLoadSamples: () => void;
}

export const TopControls: React.FC<TopControlsProps> = ({
  settings,
  onChange,
  sampleStatus,
  onLoadSamples,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleTimbreChange = (val: TimbreType) => {
    onChange({ timbre: val });
    if (val === 'salamander' && !sampleStatus.isLoaded && !sampleStatus.isLoading) {
      onLoadSamples();
    }
  };

  return (
    <div className="w-full bg-slate-900/60 border border-slate-800 rounded-xl p-2.5 sm:p-3 shadow-sm transition-all">
      {/* Top summary row: Always visible */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 text-xs sm:text-sm">
        {/* Timbre selector */}
        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-medium flex items-center gap-1.5">
            <Music className="w-3.5 h-3.5 text-slate-400" />
            Тембр:
          </span>
          <div className="relative">
            <select
              value={settings.timbre}
              onChange={(e) => handleTimbreChange(e.target.value as TimbreType)}
              className="bg-slate-950/70 hover:bg-slate-800/80 border border-slate-800 text-slate-200 rounded-md px-2.5 py-1.5 font-medium text-xs focus:ring-1 focus:ring-slate-400 outline-none cursor-pointer pr-7"
            >
              <option value="triangle">Пианино (Синтезатор)</option>
              <option value="salamander">
                Salamander Grand HQ {sampleStatus.isLoading ? `(${sampleStatus.progress}%)` : ''}
              </option>
            </select>
          </div>
          {sampleStatus.isLoading && (
            <div className="flex items-center gap-1 text-[11px] text-amber-300 animate-pulse">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>{sampleStatus.progress}%</span>
            </div>
          )}
        </div>

        {/* Quick Style & Direction Selectors */}
        <div className="flex items-center gap-1.5">
          {/* Playback style */}
          <select
            value={settings.style}
            onChange={(e) => onChange({ style: e.target.value as PlaybackStyle })}
            className="bg-slate-950/70 border border-slate-800 text-slate-200 rounded-md px-2 py-1.5 text-xs font-medium focus:ring-1 focus:ring-slate-400 cursor-pointer"
          >
            <option value="arpeggio">Арпеджио</option>
            <option value="harmonic">Гармонически</option>
          </select>

          {/* Direction */}
          <select
            value={settings.direction}
            onChange={(e) => onChange({ direction: e.target.value as PlaybackDirection })}
            className="bg-slate-950/70 border border-slate-800 text-slate-200 rounded-md px-2 py-1.5 text-xs font-medium focus:ring-1 focus:ring-slate-400 cursor-pointer"
          >
            <option value="up">Снизу вверх</option>
            <option value="chain">Цепочка</option>
            <option value="down">Сверху вниз</option>
          </select>

          {/* Root Note */}
          <select
            value={settings.rootNote}
            onChange={(e) => onChange({ rootNote: e.target.value })}
            className="bg-slate-950/70 border border-slate-800 text-slate-200 rounded-md px-2 py-1.5 text-xs font-medium focus:ring-1 focus:ring-slate-400 cursor-pointer"
          >
            <option value="random">Любой тон</option>
            {NOTE_NAMES.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>

          {/* Expand sliders button */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700/80 rounded-md px-2.5 py-1.5 text-xs font-medium transition cursor-pointer"
            title="Параметры звука и темпа"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Параметры</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Expandable sliders drawer */}
      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* Tempo slider */}
          <div className="flex flex-col gap-1.5 bg-slate-950/60 p-2.5 rounded-md border border-slate-800/80">
            <div className="flex justify-between items-center text-slate-300">
              <span className="font-medium">Темп</span>
              <span className="font-mono text-slate-200 font-semibold bg-slate-800 px-1.5 py-0.5 rounded text-[11px]">
                {settings.tempo.toFixed(2)}x
              </span>
            </div>
            <input
              type="range"
              min="0.2"
              max="1.8"
              step="0.05"
              value={settings.tempo}
              onChange={(e) => onChange({ tempo: parseFloat(e.target.value) })}
              className="w-full cursor-pointer accent-slate-400"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>0.2x</span>
              <span>1.0x</span>
              <span>1.8x</span>
            </div>
          </div>

          {/* Resonance / Overlap slider */}
          <div className="flex flex-col gap-1.5 bg-slate-950/60 p-2.5 rounded-md border border-slate-800/80">
            <div className="flex justify-between items-center text-slate-300">
              <span className="font-medium">Резонанс</span>
              <span className="font-mono text-slate-200 font-semibold bg-slate-800 px-1.5 py-0.5 rounded text-[11px]">
                {settings.resonance.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min="0.0"
              max="2.0"
              step="0.05"
              value={settings.resonance}
              onChange={(e) => onChange({ resonance: parseFloat(e.target.value) })}
              className="w-full cursor-pointer accent-slate-400"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>Сухо</span>
              <span>Стандарт</span>
              <span>Шлейф</span>
            </div>
          </div>

          {/* Decay slider */}
          <div className="flex flex-col gap-1.5 bg-slate-950/60 p-2.5 rounded-md border border-slate-800/80">
            <div className="flex justify-between items-center text-slate-300">
              <span className="font-medium">Затухание</span>
              <span className="font-mono text-slate-200 font-semibold bg-slate-800 px-1.5 py-0.5 rounded text-[11px]">
                {settings.decay.toFixed(2)}s
              </span>
            </div>
            <input
              type="range"
              min="0.2"
              max="3.0"
              step="0.05"
              value={settings.decay}
              onChange={(e) => onChange({ decay: parseFloat(e.target.value) })}
              className="w-full cursor-pointer accent-slate-400"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>0.2s</span>
              <span>1.0s</span>
              <span>3.0s</span>
            </div>
          </div>

          {/* Volume slider */}
          <div className="flex flex-col gap-1.5 bg-slate-950/60 p-2.5 rounded-md border border-slate-800/80">
            <div className="flex justify-between items-center text-slate-300">
              <span className="font-medium flex items-center gap-1">
                <Volume2 className="w-3.5 h-3.5 text-slate-400" />
                Громкость
              </span>
              <span className="font-mono text-slate-200 font-semibold bg-slate-800 px-1.5 py-0.5 rounded text-[11px]">
                {Math.round(settings.volume * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0.0"
              max="1.0"
              step="0.05"
              value={settings.volume}
              onChange={(e) => onChange({ volume: parseFloat(e.target.value) })}
              className="w-full cursor-pointer accent-slate-400"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>

          {/* Card Color Palette Selector */}
          <div className="flex flex-col gap-1.5 bg-slate-950/60 p-2.5 rounded-md border border-slate-800/80 sm:col-span-2 lg:col-span-4">
            <div className="flex items-center justify-between text-slate-300">
              <span className="font-medium flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-indigo-400" />
                Палитра карточек и ответов
              </span>
              <span className="text-[11px] font-mono text-indigo-300">
                {CARD_PALETTES.find((p) => p.id === (settings.cardPalette || 'indigo'))?.name}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              {CARD_PALETTES.map((palette) => {
                const isSelected = (settings.cardPalette || 'indigo') === palette.id;
                return (
                  <button
                    key={palette.id}
                    type="button"
                    onClick={() => onChange({ cardPalette: palette.id })}
                    className={`px-3 py-2 rounded-lg border text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
                        : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    <span>{palette.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
