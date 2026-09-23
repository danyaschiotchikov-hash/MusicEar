import React from 'react';
import { Trash2, Timer } from 'lucide-react';
import {
  SopranoInputNote,
  HarmonizationKey,
  NoteDurationType,
  getTonicPitchClass,
} from '../../audio/harmonizationEngine';

interface HarmonizationNoteInputProps {
  currentKey: HarmonizationKey;
  selectedDuration: NoteDurationType;
  onSelectDuration: (dur: NoteDurationType) => void;
  isDotted: boolean;
  onToggleDotted: () => void;
  sopranoNotes: SopranoInputNote[];
  onAddNote: (midi: number) => void;
  onDeleteNote: (index: number) => void;
  activeStepIndex: number | null;
}

// Soprano range piano keys (C4 = 60 to G5 = 79)
const PIANO_KEYS = [
  { midi: 60, name: 'C4', isBlack: false },
  { midi: 61, name: 'C#4', isBlack: true },
  { midi: 62, name: 'D4', isBlack: false },
  { midi: 63, name: 'D#4', isBlack: true },
  { midi: 64, name: 'E4', isBlack: false },
  { midi: 65, name: 'F4', isBlack: false },
  { midi: 66, name: 'F#4', isBlack: true },
  { midi: 67, name: 'G4', isBlack: false },
  { midi: 68, name: 'G#4', isBlack: true },
  { midi: 69, name: 'A4', isBlack: false },
  { midi: 70, name: 'A#4', isBlack: true },
  { midi: 71, name: 'B4', isBlack: false },
  { midi: 72, name: 'C5', isBlack: false },
  { midi: 73, name: 'C#5', isBlack: true },
  { midi: 74, name: 'D5', isBlack: false },
  { midi: 75, name: 'D#5', isBlack: true },
  { midi: 76, name: 'E5', isBlack: false },
  { midi: 77, name: 'F5', isBlack: false },
  { midi: 78, name: 'F#5', isBlack: true },
  { midi: 79, name: 'G5', isBlack: false },
];

export const HarmonizationNoteInput: React.FC<HarmonizationNoteInputProps> = React.memo(({
  currentKey,
  selectedDuration,
  onSelectDuration,
  isDotted,
  onToggleDotted,
  sopranoNotes,
  onAddNote,
  onDeleteNote,
  activeStepIndex,
}) => {
  return (
    <div className="w-full bg-slate-900/60 border border-slate-800 rounded-2xl p-3 flex flex-col gap-2.5 shadow-sm select-none">
      {/* 1. Rhythm & Duration Selector Bar */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 text-xs">
          <div className="flex items-center bg-slate-950/80 border border-slate-800 rounded-lg p-0.5 text-xs font-medium">
            <span className="px-1 text-slate-500 flex items-center">
              <Timer className="w-3.5 h-3.5" />
            </span>

            <button
              type="button"
              onClick={() => onSelectDuration('w')}
              className={`px-2 h-6 rounded transition cursor-pointer flex items-center gap-1 ${
                selectedDuration === 'w'
                  ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Целая нота (4 доли)"
            >
              <span className="font-serif text-sm">𝅝</span>
              <span className="text-[10px] font-mono text-slate-300">4</span>
            </button>

            <button
              type="button"
              onClick={() => onSelectDuration('h')}
              className={`px-2 h-6 rounded transition cursor-pointer flex items-center gap-1 ${
                selectedDuration === 'h'
                  ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Половинная нота (2 доли)"
            >
              <span className="font-serif text-sm">𝅗𝅥</span>
              <span className="text-[10px] font-mono text-slate-300">2</span>
            </button>

            <button
              type="button"
              onClick={() => onSelectDuration('q')}
              className={`px-2 h-6 rounded transition cursor-pointer flex items-center gap-1 ${
                selectedDuration === 'q'
                  ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Четвертная нота (1 доля)"
            >
              <span className="font-serif text-sm">𝅘𝅥</span>
              <span className="text-[10px] font-mono text-slate-300">1</span>
            </button>

            <button
              type="button"
              onClick={() => onSelectDuration('8')}
              className={`px-2 h-6 rounded transition cursor-pointer flex items-center gap-1 ${
                selectedDuration === '8'
                  ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Восьмая нота (0.5 доли)"
            >
              <span className="font-serif text-sm">𝅘𝅥𝅮</span>
              <span className="text-[10px] font-mono text-slate-300">½</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onToggleDotted}
            className={`px-2 h-7 rounded-lg border text-xs font-medium transition cursor-pointer flex items-center gap-1 ${
              isDotted
                ? 'bg-amber-600/30 border-amber-500/60 text-amber-200 font-semibold'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title="Нота с точкой (+50% длительности)"
          >
            <span className="font-bold">•</span>
            <span className="text-[11px]">Точка</span>
          </button>
        </div>

        {/* Note Counter Badge */}
        <div className="text-[11px] font-mono text-slate-400">
          <span className="text-slate-500">Мелодия:</span>{' '}
          <span className="text-indigo-300 font-semibold">{sopranoNotes.length}</span>
        </div>
      </div>

      {/* 2. Apple HIG Piano Keyboard (C4 to G5) */}
      <div className="w-full overflow-x-auto pb-1 no-scrollbar flex justify-start sm:justify-center">
        <div className="flex items-start h-21 sm:h-24 bg-slate-950/80 p-1.5 rounded-xl relative shadow-inner">
          {PIANO_KEYS.map((k) => {
            const isTonic = (k.midi % 12) === getTonicPitchClass(currentKey);

            if (k.isBlack) {
              return (
                <button
                  key={k.midi}
                  type="button"
                  onClick={() => onAddNote(k.midi)}
                  className="z-10 -mx-2.5 sm:-mx-3 w-5 sm:w-6 h-13 sm:h-15 bg-slate-950 hover:bg-slate-900 active:bg-indigo-500 rounded-[4px] shadow-md flex flex-col justify-end items-center pb-1.5 transition-all cursor-pointer shrink-0 border-0 outline-none select-none active:translate-y-0.5"
                  title={k.name}
                >
                  <span className="text-[8px] font-mono text-slate-400 font-semibold tracking-tighter">
                    {k.name.replace(/\d/, '')}
                  </span>
                </button>
              );
            }

            return (
              <button
                key={k.midi}
                type="button"
                onClick={() => onAddNote(k.midi)}
                className={`w-9 sm:w-10 h-18 sm:h-21 rounded-[4px] transition-all cursor-pointer flex flex-col justify-end items-center pb-1.5 shrink-0 border-0 outline-none select-none active:translate-y-0.5 ${
                  isTonic
                    ? 'bg-indigo-950/70 hover:bg-indigo-900/80 active:bg-indigo-600 text-indigo-200'
                    : 'bg-slate-850 hover:bg-slate-800 active:bg-indigo-600 text-slate-200'
                }`}
                title={k.name}
              >
                <span className="text-[10px] font-mono font-medium tracking-tight">
                  {k.name}
                </span>
                {isTonic ? (
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-0.5 shrink-0" />
                ) : (
                  <span className="w-1.5 h-1.5 mt-0.5 shrink-0 opacity-0" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Melody Notes Breadcrumbs */}
      {sopranoNotes.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1 no-scrollbar text-xs">
          {sopranoNotes.map((n, idx) => {
            const isActive = activeStepIndex === idx;
            return (
              <div
                key={n.id}
                className={`flex items-center gap-1 px-2 py-1 rounded-lg border text-xs shrink-0 transition ${
                  isActive
                    ? 'bg-indigo-600/30 border-indigo-400 text-white font-semibold'
                    : 'bg-slate-950/70 border-slate-800 text-slate-300'
                }`}
              >
                <span className="font-mono text-indigo-300 font-medium">{n.noteName}</span>
                <span className="text-[10px] text-slate-400 font-serif">
                  {n.duration === 'w' ? '𝅝' : n.duration === 'h' ? '𝅗𝅥' : n.duration === 'q' ? '𝅘𝅥' : '𝅘𝅥𝅮'}
                  {n.isDotted ? '•' : ''}
                </span>
                <button
                  type="button"
                  onClick={() => onDeleteNote(idx)}
                  className="text-slate-500 hover:text-rose-400 p-0.5 rounded cursor-pointer transition ml-0.5"
                  title="Удалить ноту"
                >
                  <Trash2 className="w-2.5 h-2.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
});
