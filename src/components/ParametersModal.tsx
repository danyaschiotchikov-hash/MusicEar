import React from 'react';
import { PlaybackSettings, TimbreType, PlaybackStyle, PlaybackDirection } from '../types';
import { NOTE_NAMES, NOTE_NAMES_RU } from '../data/musicData';
import {
  X,
  Sliders,
  Music,
  Volume2,
  Loader2,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

interface ParametersModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: PlaybackSettings;
  onChange: (updated: Partial<PlaybackSettings>) => void;
  sampleStatus: { isLoaded: boolean; isLoading: boolean; progress: number };
  onLoadSamples: () => void;
}

export const ParametersModal: React.FC<ParametersModalProps> = ({
  isOpen,
  onClose,
  settings,
  onChange,
  sampleStatus,
  onLoadSamples,
}) => {
  if (!isOpen) return null;

  const handleTimbreChange = (val: TimbreType) => {
    onChange({ timbre: val });
    if (val === 'salamander' && !sampleStatus.isLoaded && !sampleStatus.isLoading) {
      onLoadSamples();
    }
  };

  const handleResetToDefaults = () => {
    onChange({
      timbre: 'salamander',
      tempo: 1.2,
      resonance: 2.0,
      decay: 2.5,
      volume: 0.8,
      style: 'arpeggio',
      direction: 'up',
      rootNote: 'random',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl max-h-[92vh] bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-slate-900/95 sticky top-0 z-10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-100">
                Параметры звука и воспроизведения
              </h2>
              <p className="text-[11px] text-slate-400">
                Тонкая настройка тембра, темпа, наслоения и затухания
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

        {/* Settings Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 text-xs">
          {/* Timbre selector */}
          <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                <Music className="w-3.5 h-3.5 text-indigo-400" />
                Тембр инструмента
              </span>
              {sampleStatus.isLoading && (
                <div className="flex items-center gap-1 text-[11px] text-amber-400 animate-pulse">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>Загрузка {sampleStatus.progress}%</span>
                </div>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleTimbreChange('salamander')}
                className={`flex flex-col text-left p-2.5 rounded-lg border transition cursor-pointer ${
                  settings.timbre === 'salamander'
                    ? 'bg-indigo-600/20 border-indigo-500/60 text-indigo-100 shadow-sm'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <span className="font-bold text-xs">🎼 Salamander Grand (HQ)</span>
                <span className="text-[10px] text-slate-400 mt-0.5">
                  Реалистичные сэмплы рояля Yamaha C5
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleTimbreChange('triangle')}
                className={`flex flex-col text-left p-2.5 rounded-lg border transition cursor-pointer ${
                  settings.timbre === 'triangle'
                    ? 'bg-indigo-600/20 border-indigo-500/60 text-indigo-100 shadow-sm'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <span className="font-bold text-xs">🎹 Синтезатор (Triangle)</span>
                <span className="text-[10px] text-slate-400 mt-0.5">
                  Быстрый полифонический веб-синтезатор
                </span>
              </button>
            </div>
          </div>

          {/* Sliders Section: Tempo, Resonance, Decay, Volume */}
          <div className="space-y-3 pt-1">
            {/* Tempo */}
            <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800 space-y-1.5">
              <div className="flex justify-between items-center text-slate-200">
                <span className="font-medium">⏱️ Темп</span>
                <span className="font-mono text-indigo-400 font-bold bg-indigo-950/60 px-2 py-0.5 rounded text-[11px]">
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
                <span>1.2x (По умолчанию)</span>
                <span>1.8x (Быстро)</span>
              </div>
            </div>

            {/* Resonance / Overlap */}
            <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800 space-y-1.5">
              <div className="flex justify-between items-center text-slate-200">
                <span className="font-medium">🌊 Наслоение / Резонанс</span>
                <span className="font-mono text-cyan-400 font-bold bg-cyan-950/60 px-2 py-0.5 rounded text-[11px]">
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
                <span>0.0 (Без наслоения)</span>
                <span>1.0</span>
                <span>2.0 (По умолчанию: максимальное наслоение)</span>
              </div>
            </div>

            {/* Decay */}
            <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800 space-y-1.5">
              <div className="flex justify-between items-center text-slate-200">
                <span className="font-medium">📉 Затухание / Длина хвоста</span>
                <span className="font-mono text-violet-400 font-bold bg-violet-950/60 px-2 py-0.5 rounded text-[11px]">
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
                <span>0.2s (Коротко)</span>
                <span>2.5s (По умолчанию)</span>
                <span>3.0s (Максимум)</span>
              </div>
            </div>

            {/* Volume */}
            <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800 space-y-1.5">
              <div className="flex justify-between items-center text-slate-200">
                <span className="font-medium flex items-center gap-1">
                  <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                  Громкость звука
                </span>
                <span className="font-mono text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded text-[11px]">
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
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 border-t border-slate-800 bg-slate-900/95 flex items-center justify-between">
          <button
            onClick={handleResetToDefaults}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Сбросить по умолчанию</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-950 transition cursor-pointer"
          >
            Применить
          </button>
        </div>
      </div>
    </div>
  );
};
