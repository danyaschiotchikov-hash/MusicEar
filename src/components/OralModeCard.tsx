import React, { useMemo } from 'react';
import { CurrentTask, PlaybackSettings } from '../types';
import { getConstructionBreakdown, getCharacteristicResolution } from '../audio/solfegeHelper';
import {
  HelpCircle,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  Volume2,
  Sparkles,
} from 'lucide-react';

interface OralModeCardProps {
  currentTask: CurrentTask | null;
  settings?: PlaybackSettings;
  onReveal: () => void;
  onReplay?: () => void;
}

export const OralModeCard: React.FC<OralModeCardProps> = ({
  currentTask,
}) => {
  if (!currentTask) {
    return (
      <div className="w-full bg-slate-900/60 border border-slate-800 rounded-2xl p-8 text-center flex flex-col items-center justify-center gap-3">
        <HelpCircle className="w-10 h-10 text-indigo-400/40" />
        <p className="text-slate-400 text-sm">
          Нажмите <span className="text-indigo-400 font-semibold">«Новый звук»</span>, чтобы прослушать элемент в устном режиме
        </p>
      </div>
    );
  }

  const { item, rootNoteName, revealed } = currentTask;
  const direction = currentTask.playedDirection || 'up';
  const isUp = direction === 'up';

  // Compute solfege note breakdown and chord title with true tertian root tone
  const breakdown = useMemo(() => {
    return getConstructionBreakdown(item, currentTask.rootMidi, direction, rootNoteName);
  }, [item, currentTask.rootMidi, direction, rootNoteName]);

  // Compute characteristic interval resolution if applicable
  const charResolution = useMemo(() => {
    return getCharacteristicResolution(item, breakdown.notesMidi, breakdown.noteNames, direction);
  }, [item, breakdown.notesMidi, breakdown.noteNames, direction]);

  return (
    <div className="w-full bg-slate-900/70 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-5 sm:p-7 flex flex-col items-center justify-center text-center shadow-xl transition-all">
      {!revealed ? (
        <div className="flex flex-col items-center justify-center py-6 sm:py-8 w-full max-w-md text-center">
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600/15 border border-indigo-500/30 text-indigo-400 mb-3 shadow-sm">
            <Volume2 className="w-7 h-7 animate-pulse" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-slate-200">
            Определите созвучие на слух
          </h3>
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1.5">
            <span>Направление:</span>
            <span className="font-semibold text-indigo-300 flex items-center gap-1">
              {isUp ? <ArrowUp className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />}
              {isUp ? 'Вверх' : 'Вниз'}
            </span>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 w-full max-w-xl animate-in fade-in zoom-in-95 duration-200 text-left">
          {/* Header Bar: "от [Нота] [Направление]" without "Правильный ответ" */}
          <div className="w-full flex items-center justify-between text-xs border-b border-slate-800/80 pb-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-300 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800 flex items-center gap-1.5">
                <span className="text-slate-400">от</span>
                <strong className="text-amber-300 font-mono text-sm">{rootNoteName}</strong>
              </span>

              <div
                className={`flex items-center gap-1 px-2 py-1 rounded-lg border text-xs font-semibold ${
                  isUp
                    ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40'
                    : 'bg-sky-500/15 text-sky-300 border-sky-500/40'
                }`}
                title={isUp ? 'Направление: вверх' : 'Направление: вниз'}
              >
                {isUp ? <ArrowUp className="w-3.5 h-3.5 stroke-[2.5]" /> : <ArrowDown className="w-3.5 h-3.5 stroke-[2.5]" />}
                <span>{isUp ? 'Вверх' : 'Вниз'}</span>
              </div>
            </div>
          </div>

          {/* Full Chord Name with Tertian Root Tone */}
          <div className="w-full space-y-1">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-100">
              {breakdown.fullChordTitle}
            </h2>
            <div className="flex flex-wrap items-center gap-2 pt-0.5">
              {item.hint && (
                <span className="text-xs font-mono bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30 font-semibold">
                  Подсказка: {item.hint}
                </span>
              )}
              {item.resolutionName && (
                <span className="text-xs font-mono bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30">
                  {item.resolutionName}
                </span>
              )}
            </div>
          </div>

          {/* Characteristic Interval Resolution (Key & Voice Leading Breakdown) */}
          {charResolution && (
            <div className="w-full bg-indigo-950/40 border border-indigo-500/30 rounded-xl p-3 sm:p-4 space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-1 text-xs">
                <span className="text-indigo-300 font-bold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Разрешение в тональность:</span>
                </span>
                <span className="font-bold text-amber-300 bg-slate-900/90 px-2.5 py-0.5 rounded border border-indigo-500/30 text-xs">
                  {charResolution.tonality}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs pt-1 border-t border-indigo-500/20">
                <span className="text-slate-400">Интервал разрешения:</span>
                <span className="font-bold text-emerald-300">
                  {charResolution.resolvedIntervalName} ({charResolution.resolvedNotesString})
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                {charResolution.voiceMovements.map((vm, i) => (
                  <div key={i} className="flex items-center justify-between px-2.5 py-1.5 bg-slate-900/80 rounded-lg border border-slate-800 text-xs">
                    <span className="text-slate-200 font-mono font-bold">
                      {vm.from} <span className="text-[10px] text-slate-400 font-normal">({vm.degreeFrom})</span>
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-indigo-400 shrink-0 mx-1.5" />
                    <span className="text-emerald-300 font-mono font-bold">
                      {vm.to} <span className="text-[10px] text-emerald-400 font-normal">({vm.degreeTo})</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sequence of Notes & Step-by-Step Intervals (hidden for characteristic intervals, which have resolution panel) */}
          {!charResolution && (
            <>
              <div className="w-full space-y-1.5 pt-1">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Звуки созвучия:
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {breakdown.noteNames.map((note, idx) => {
                    const isRoot = idx === 0;
                    return (
                      <React.Fragment key={idx}>
                        <div
                          className={`px-3 py-1.5 rounded-lg font-bold text-sm sm:text-base border shadow-sm transition ${
                            isRoot
                              ? 'bg-indigo-600/20 text-indigo-200 border-indigo-500/40 ring-1 ring-indigo-500/30'
                              : 'bg-slate-800/90 text-white border-slate-700'
                          }`}
                        >
                          <span>{note}</span>
                          {isRoot && (
                            <span className="ml-1.5 text-[9px] font-normal uppercase text-indigo-300/80">
                              (опорный)
                            </span>
                          )}
                        </div>
                        {idx < breakdown.noteNames.length - 1 && (
                          <ArrowRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>

              {breakdown.steps.length > 0 && (
                <div className="w-full space-y-1.5 pt-1">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Интервалы между звуками:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {breakdown.steps.map((st, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900/90 border border-slate-800 text-xs font-mono text-slate-300"
                      >
                        <span className="text-emerald-400 font-bold">{st.intervalName}</span>
                        <span className="text-slate-500">({st.fromNote} → {st.toNote})</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};
