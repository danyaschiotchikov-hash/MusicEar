import React from 'react';
import {
  Play,
  RefreshCw,
  FileCheck,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { HarmonizationKey } from '../../audio/harmonizationEngine';
import { VexFlowDictationStaff, DictationNote } from '../VexFlowDictationStaff';

interface HarmonizationDictationSectionProps {
  dictationMelody: DictationNote[];
  userGuessedMidis: number[];
  onSetUserGuessedMidis: React.Dispatch<React.SetStateAction<number[]>>;
  dictationPlaying: boolean;
  onPlayDictationMelody: (melody: DictationNote[]) => void;
  onGenerateDictation: (
    measures: number,
    allowedDurations: ('h' | 'q' | '8' | '16')[],
    type: 'diatonic' | 'chromatic'
  ) => void;
  dictationMeasures: number;
  onSetDictationMeasures: (m: number) => void;
  dictationAllowedDurations: ('h' | 'q' | '8' | '16')[];
  onSetDictationAllowedDurations: (durs: ('h' | 'q' | '8' | '16')[]) => void;
  dictationType: 'diatonic' | 'chromatic';
  onSetDictationType: (type: 'diatonic' | 'chromatic') => void;
  dictationChecked: boolean;
  onSetDictationChecked: (checked: boolean) => void;
  showDictationAnswer: boolean;
  onToggleShowDictationAnswer: () => void;
  currentKey: HarmonizationKey;
  meter: string;
  onPianoKeyClick: (midi: number) => void;
}

// Piano keys for dictation note entry
const DICTATION_PIANO_KEYS = [
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

export const HarmonizationDictationSection: React.FC<HarmonizationDictationSectionProps> = React.memo(({
  dictationMelody,
  userGuessedMidis,
  onSetUserGuessedMidis,
  dictationPlaying,
  onPlayDictationMelody,
  onGenerateDictation,
  dictationMeasures,
  onSetDictationMeasures,
  dictationAllowedDurations,
  onSetDictationAllowedDurations,
  dictationType,
  onSetDictationType,
  dictationChecked,
  onSetDictationChecked,
  showDictationAnswer,
  onToggleShowDictationAnswer,
  currentKey,
  meter,
  onPianoKeyClick,
}) => {
  return (
    <div className="w-full flex flex-col gap-2.5 select-none">
      {/* 1. Dictation Controls Card */}
      <div className="w-full bg-slate-900/60 border border-slate-800 rounded-2xl p-2.5 sm:p-3 flex flex-col gap-2.5 shadow-sm">
        {/* Top line: Header & Actions */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-xs font-semibold text-emerald-200">
              Музыкальный диктант
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0 ml-auto">
            <button
              type="button"
              onClick={() => onPlayDictationMelody(dictationMelody)}
              disabled={dictationPlaying || dictationMelody.length === 0}
              className="h-7 px-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition active:scale-95 shadow-xs"
              title="Прослушать мелодию диктанта"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>{dictationPlaying ? 'Играет...' : 'Слушать'}</span>
            </button>

            <button
              type="button"
              onClick={() => onGenerateDictation(dictationMeasures, dictationAllowedDurations, dictationType)}
              className="h-7 px-2.5 bg-slate-950/80 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white rounded-lg text-xs font-medium flex items-center gap-1 cursor-pointer transition active:scale-95 shadow-xs"
              title="Сгенерировать новый диктант"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Новый</span>
            </button>

            <button
              type="button"
              onClick={() => onSetDictationChecked(true)}
              disabled={userGuessedMidis.length === 0}
              className="h-7 px-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition active:scale-95 shadow-xs"
              title="Проверить написанный диктант"
            >
              <FileCheck className="w-3 h-3" />
              <span>Проверить</span>
            </button>

            <button
              type="button"
              onClick={onToggleShowDictationAnswer}
              className="h-7 px-2.5 bg-slate-950/80 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white rounded-lg text-xs font-medium cursor-pointer transition active:scale-95 shadow-xs"
            >
              {showDictationAnswer ? 'Скрыть ответ' : 'Ответ'}
            </button>
          </div>
        </div>

        {/* Bottom line: Dictation Configuration Pills */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800/80 text-xs flex-wrap">
          {/* Measures count */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 text-[11px]">Такты:</span>
            <div className="flex bg-slate-950/80 border border-slate-800 rounded-lg p-0.5 text-xs font-medium">
              {[4, 8].map((meas) => (
                <button
                  key={meas}
                  type="button"
                  onClick={() => {
                    onSetDictationMeasures(meas);
                    onGenerateDictation(meas, dictationAllowedDurations, dictationType);
                  }}
                  className={`px-2 h-6 rounded transition cursor-pointer text-[11px] ${
                    dictationMeasures === meas
                      ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {meas}т.
                </button>
              ))}
            </div>
          </div>

          {/* Melody Type */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 text-[11px]">Лад:</span>
            <div className="flex bg-slate-950/80 border border-slate-800 rounded-lg p-0.5 text-xs font-medium">
              <button
                type="button"
                onClick={() => {
                  onSetDictationType('diatonic');
                  onGenerateDictation(dictationMeasures, dictationAllowedDurations, 'diatonic');
                }}
                className={`px-2 h-6 rounded transition cursor-pointer text-[11px] ${
                  dictationType === 'diatonic'
                    ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Диатоника
              </button>
              <button
                type="button"
                onClick={() => {
                  onSetDictationType('chromatic');
                  onGenerateDictation(dictationMeasures, dictationAllowedDurations, 'chromatic');
                }}
                className={`px-2 h-6 rounded transition cursor-pointer text-[11px] ${
                  dictationType === 'chromatic'
                    ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Хроматика
              </button>
            </div>
          </div>

          {/* Allowed Durations */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 text-[11px]">Ритм:</span>
            <div className="flex items-center gap-1 bg-slate-950/80 border border-slate-800 rounded-lg p-0.5">
              {[
                { key: 'h', label: '𝅗𝅥' },
                { key: 'q', label: '♩' },
                { key: '8', label: '♪' },
              ].map((dur) => {
                const isSelected = dictationAllowedDurations.includes(dur.key as any);
                return (
                  <button
                    key={dur.key}
                    type="button"
                    onClick={() => {
                      let updated: ('h' | 'q' | '8' | '16')[];
                      if (isSelected) {
                        if (dictationAllowedDurations.length <= 1) return;
                        updated = dictationAllowedDurations.filter((d) => d !== dur.key);
                      } else {
                        updated = [...dictationAllowedDurations, dur.key as any];
                      }
                      onSetDictationAllowedDurations(updated);
                      onGenerateDictation(dictationMeasures, updated, dictationType);
                    }}
                    className={`px-2 h-6 rounded text-xs font-serif transition cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-600/40 text-emerald-300 font-bold border border-emerald-500/50'
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {dur.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Score Notation Card */}
      <div className="w-full bg-slate-900/60 border border-slate-800 rounded-2xl p-2.5 sm:p-4 flex flex-col gap-2.5 shadow-sm">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="font-medium text-slate-300">
            Записано нот: {userGuessedMidis.length} из {dictationMelody.length}
          </span>
          {userGuessedMidis.length > 0 && (
            <button
              type="button"
              onClick={() => onSetUserGuessedMidis((prev) => prev.slice(0, -1))}
              className="h-6 px-2 bg-slate-950/80 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded text-[11px] font-medium flex items-center gap-1 cursor-pointer transition"
            >
              <RotateCcw className="w-2.5 h-2.5" />
              <span>Стереть</span>
            </button>
          )}
        </div>

        <div className="w-full flex justify-center overflow-x-auto py-1 no-scrollbar">
          <VexFlowDictationStaff
            dictationMelody={dictationMelody}
            userGuessedMidis={userGuessedMidis}
            dictationChecked={dictationChecked}
            showDictationAnswer={showDictationAnswer}
            currentKey={currentKey}
            meter={meter}
          />
        </div>

        {/* Verification Result Banner */}
        {dictationChecked && userGuessedMidis.length === dictationMelody.length && (
          <div className="pt-1">
            {userGuessedMidis.every((m, idx) => m === dictationMelody[idx].midi) ? (
              <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>✓ Великолепно! Диктант записан абсолютно верно!</span>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-800/40 text-amber-200 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  Есть несовпадения по высоте нот. Нажмите кнопку «Ответ», чтобы увидеть правильную запись.
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3. Dictation Piano Input */}
      <div className="w-full bg-slate-900/60 border border-slate-800 rounded-2xl p-3 flex flex-col gap-2 shadow-sm">
        <div className="w-full overflow-x-auto pb-1 no-scrollbar flex justify-start sm:justify-center">
          <div className="flex items-start h-21 sm:h-24 bg-slate-950/80 p-1.5 rounded-xl relative shadow-inner">
            {DICTATION_PIANO_KEYS.map((k) => {
              if (k.isBlack) {
                return (
                  <button
                    key={k.midi}
                    type="button"
                    onClick={() => onPianoKeyClick(k.midi)}
                    className="z-10 -mx-2.5 sm:-mx-3 w-5 sm:w-6 h-13 sm:h-15 bg-slate-950 hover:bg-slate-900 active:bg-emerald-600 rounded-[4px] shadow-md flex flex-col justify-end items-center pb-1.5 transition-all cursor-pointer shrink-0 border-0 outline-none select-none active:translate-y-0.5"
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
                  onClick={() => onPianoKeyClick(k.midi)}
                  className="w-9 sm:w-10 h-18 sm:h-21 rounded-[4px] bg-slate-850 hover:bg-slate-800 active:bg-emerald-600 text-slate-200 transition-all cursor-pointer flex flex-col justify-end items-center pb-1.5 shrink-0 border-0 outline-none select-none active:translate-y-0.5"
                  title={k.name}
                >
                  <span className="text-[10px] font-mono font-medium tracking-tight">
                    {k.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
});
