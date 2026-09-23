import React from 'react';
import {
  Play,
  Square,
  RotateCcw,
  Volume2,
  KeyRound,
  Clock,
  Sliders,
  Pencil,
  Target,
  Headphones,
} from 'lucide-react';
import { SUPPORTED_KEYS } from '../../audio/harmonizationEngine';

interface HarmonizationToolbarProps {
  studioTab: 'free' | 'task' | 'dictation';
  onTabChange: (tab: 'free' | 'task' | 'dictation') => void;
  selectedKeyTonic: string;
  onKeyChange: (tonic: string) => void;
  meter: string;
  onMeterChange: (meter: string) => void;
  tempo: number;
  onTempoChange: (tempo: number) => void;
  isPlaying: boolean;
  onPlaySATB: () => void;
  onPlayMelodyOnly: () => void;
  onStopPlayback: () => void;
  onClearMelody: () => void;
  notesCount: number;
}

export const HarmonizationToolbar: React.FC<HarmonizationToolbarProps> = React.memo(({
  studioTab,
  onTabChange,
  selectedKeyTonic,
  onKeyChange,
  meter,
  onMeterChange,
  tempo,
  onTempoChange,
  isPlaying,
  onPlaySATB,
  onPlayMelodyOnly,
  onStopPlayback,
  onClearMelody,
  notesCount,
}) => {
  return (
    <div className="w-full bg-slate-900/60 border border-slate-800 rounded-2xl p-3 flex flex-col gap-2.5 shadow-sm select-none">
      {/* Top Row: Mode Switcher & Audio Transport */}
      <div className="flex items-center justify-between gap-2 w-full flex-wrap sm:flex-nowrap">
        {/* Apple Segmented Control */}
        <div className="flex items-center bg-slate-950/80 border border-slate-800 rounded-lg p-0.5 text-xs font-medium shadow-inner shrink-0">
          <button
            type="button"
            onClick={() => onTabChange('free')}
            className={`px-2.5 sm:px-3 h-7 rounded-md transition cursor-pointer text-xs flex items-center gap-1.5 ${
              studioTab === 'free'
                ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Pencil className="w-3.5 h-3.5" />
            <span>Ввод</span>
          </button>
          <button
            type="button"
            onClick={() => onTabChange('task')}
            className={`px-2.5 sm:px-3 h-7 rounded-md transition cursor-pointer text-xs flex items-center gap-1.5 ${
              studioTab === 'task'
                ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span>Задача</span>
          </button>
          <button
            type="button"
            onClick={() => onTabChange('dictation')}
            className={`px-2.5 sm:px-3 h-7 rounded-md transition cursor-pointer text-xs flex items-center gap-1.5 ${
              studioTab === 'dictation'
                ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Headphones className="w-3.5 h-3.5" />
            <span>Диктант</span>
          </button>
        </div>

        {/* Audio Transport Controls */}
        <div className="flex items-center gap-1.5 shrink-0 ml-auto">
          {isPlaying ? (
            <button
              type="button"
              onClick={onStopPlayback}
              className="h-7 px-3 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 cursor-pointer transition active:scale-95 shadow-xs"
              title="Остановить воспроизведение"
            >
              <Square className="w-3 h-3 fill-current" />
              <span>Стоп</span>
            </button>
          ) : (
            <>
              {studioTab !== 'dictation' && (
                <>
                  <button
                    type="button"
                    onClick={onPlayMelodyOnly}
                    disabled={notesCount === 0}
                    className="h-7 px-2.5 bg-slate-950/80 hover:bg-slate-800 disabled:opacity-40 border border-slate-800 text-slate-300 hover:text-white rounded-lg text-xs font-medium flex items-center gap-1.5 cursor-pointer transition active:scale-95 shadow-xs"
                    title="Прослушать мелодию (сопрано)"
                  >
                    <Volume2 className="w-3.5 h-3.5 text-slate-400" />
                    <span className="hidden sm:inline">Мелодия</span>
                  </button>

                  <button
                    type="button"
                    onClick={onPlaySATB}
                    disabled={notesCount === 0}
                    className="h-7 px-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition active:scale-95 shadow-xs"
                    title="Слушать 4 голоса гармонизации (SATB)"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>Слушать всё</span>
                  </button>
                </>
              )}
            </>
          )}

          {studioTab !== 'dictation' && notesCount > 0 && (
            <button
              type="button"
              onClick={onClearMelody}
              className="h-7 w-7 bg-slate-950/80 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-rose-300 rounded-lg flex items-center justify-center cursor-pointer transition"
              title="Очистить мелодию"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Bottom Parameter Line: Key, Meter, Tempo */}
      {studioTab !== 'dictation' && (
        <div className="flex items-center justify-start gap-2 pt-2 border-t border-slate-800/80 text-xs flex-wrap">
          {/* Key Selector with KeyRound Icon */}
          <div className="flex items-center gap-1.5 bg-slate-950/70 border border-slate-800 rounded-lg px-2 h-7">
            <KeyRound className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <select
              value={selectedKeyTonic}
              onChange={(e) => onKeyChange(e.target.value)}
              className="bg-transparent text-indigo-300 font-medium text-xs focus:outline-none cursor-pointer"
            >
              {SUPPORTED_KEYS.map((k) => (
                <option key={k.tonic} value={k.tonic} className="bg-slate-900 text-slate-100">
                  {k.keyNameRu}
                </option>
              ))}
            </select>
          </div>

          {/* Meter Selector with Clock Icon */}
          <div className="flex items-center gap-1.5 bg-slate-950/70 border border-slate-800 rounded-lg px-2 h-7">
            <Clock className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <select
              value={meter}
              onChange={(e) => onMeterChange(e.target.value)}
              className="bg-transparent text-indigo-300 font-medium text-xs focus:outline-none cursor-pointer"
            >
              <option value="4/4" className="bg-slate-900 text-slate-100">4/4</option>
              <option value="3/4" className="bg-slate-900 text-slate-100">3/4</option>
              <option value="2/4" className="bg-slate-900 text-slate-100">2/4</option>
            </select>
          </div>

          {/* Tempo Slider with Sliders Icon */}
          <div className="flex items-center gap-2 bg-slate-950/70 border border-slate-800 rounded-lg px-2 h-7">
            <Sliders className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span className="text-indigo-300 font-mono text-[11px] w-6">{tempo}</span>
            <input
              type="range"
              min="50"
              max="140"
              step="2"
              value={tempo}
              onChange={(e) => onTempoChange(parseInt(e.target.value, 10))}
              className="w-16 sm:w-20 accent-indigo-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              title={`Темп: ${tempo} BPM`}
            />
          </div>
        </div>
      )}
    </div>
  );
});
