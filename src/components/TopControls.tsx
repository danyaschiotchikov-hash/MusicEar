import React, { useState } from 'react';
import { PlaybackSettings, TimbreType, PlaybackStyle, PlaybackDirection } from '../types';
import { NOTE_NAMES, NOTE_NAMES_RU } from '../data/musicData';
import { Sliders, Volume2, Music, Shuffle, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';

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
    <div className="w-full bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-3.5 shadow-xl transition-all">
      {/* Top summary row: Always visible */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm">
        {/* Timbre selector */}
        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-medium flex items-center gap-1.5">
            <Music className="w-4 h-4 text-indigo-400" />
            Тембр:
          </span>
          <div className="relative">
            <select
              value={settings.timbre}
              onChange={(e) => handleTimbreChange(e.target.value as TimbreType)}
              className="bg-slate-800/90 hover:bg-slate-750 border border-slate-700/80 text-slate-100 rounded-lg px-2.5 py-1.5 font-medium text-xs focus:ring-2 focus:ring-indigo-500/50 outline-none cursor-pointer pr-7"
            >
              <option value="triangle">🎹 Пианино (Синтезатор)</option>
              <option value="salamander">
                🎼 HQ Salamander Grand {sampleStatus.isLoading ? `(${sampleStatus.progress}%)` : ''}
              </option>
            </select>
          </div>
          {sampleStatus.isLoading && (
            <div className="flex items-center gap-1 text-[11px] text-amber-400 animate-pulse">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>{sampleStatus.progress}%</span>
            </div>
          )}
        </div>

        {/* Quick Style & Direction Selectors */}
        <div className="flex items-center gap-2">
          {/* Playback style */}
          <select
            value={settings.style}
            onChange={(e) => onChange({ style: e.target.value as PlaybackStyle })}
            className="bg-slate-800/90 border border-slate-700/80 text-slate-200 rounded-lg px-2 py-1.5 text-xs font-medium focus:ring-1 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="arpeggio">🎶 Арпеджио</option>
            <option value="harmonic">🎹 Гармонически</option>
          </select>

          {/* Direction */}
          <select
            value={settings.direction}
            onChange={(e) => onChange({ direction: e.target.value as PlaybackDirection })}
            className="bg-slate-800/90 border border-slate-700/80 text-slate-200 rounded-lg px-2 py-1.5 text-xs font-medium focus:ring-1 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="up">⬆️ Снизу вверх</option>
            <option value="chain">🔗 Цепочка</option>
            <option value="down">⬇️ Сверху вниз</option>
          </select>

          {/* Root Note */}
          <select
            value={settings.rootNote}
            onChange={(e) => onChange({ rootNote: e.target.value })}
            className="bg-slate-800/90 border border-slate-700/80 text-slate-200 rounded-lg px-2 py-1.5 text-xs font-medium focus:ring-1 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="random">🎲 Любой тон</option>
            {NOTE_NAMES.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>

          {/* Expand sliders button */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 rounded-lg px-2.5 py-1.5 text-xs font-medium transition cursor-pointer"
            title="Точная настройка звука и темпа"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Параметры</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Expandable sliders drawer */}
      {isExpanded && (
        <div className="mt-3.5 pt-3 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          {/* Tempo slider */}
          <div className="flex flex-col gap-1.5 bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/60">
            <div className="flex justify-between items-center text-slate-300">
              <span className="flex items-center gap-1 font-medium">
                ⏱️ Темп и Длительность
              </span>
              <span className="font-mono text-indigo-400 font-semibold bg-indigo-950/50 px-1.5 py-0.5 rounded text-[11px]">
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
              className="w-full cursor-pointer accent-indigo-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>0.2x (Медленно)</span>
              <span>1.0x</span>
              <span>1.8x (Быстро)</span>
            </div>
          </div>

          {/* Resonance / Overlap slider */}
          <div className="flex flex-col gap-1.5 bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/60">
            <div className="flex justify-between items-center text-slate-300">
              <span className="flex items-center gap-1 font-medium">
                🌊 Наслоение / Резонанс
              </span>
              <span className="font-mono text-cyan-400 font-semibold bg-cyan-950/50 px-1.5 py-0.5 rounded text-[11px]">
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
              className="w-full cursor-pointer accent-cyan-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>0.0 (Сухо)</span>
              <span>0.8 (Стандарт)</span>
              <span>2.0 (Певчий хвост)</span>
            </div>
          </div>

          {/* Decay slider */}
          <div className="flex flex-col gap-1.5 bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/60">
            <div className="flex justify-between items-center text-slate-300">
              <span className="flex items-center gap-1 font-medium">
                📉 Затухание / Decay
              </span>
              <span className="font-mono text-violet-400 font-semibold bg-violet-950/50 px-1.5 py-0.5 rounded text-[11px]">
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
              className="w-full cursor-pointer accent-violet-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>0.2s (Стаккато)</span>
              <span>1.0s</span>
              <span>3.0s (Долго)</span>
            </div>
          </div>

          {/* Volume slider */}
          <div className="flex flex-col gap-1.5 bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/60">
            <div className="flex justify-between items-center text-slate-300">
              <span className="flex items-center gap-1 font-medium">
                <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                Громкость
              </span>
              <span className="font-mono text-emerald-400 font-semibold bg-emerald-950/50 px-1.5 py-0.5 rounded text-[11px]">
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
              className="w-full cursor-pointer accent-emerald-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
