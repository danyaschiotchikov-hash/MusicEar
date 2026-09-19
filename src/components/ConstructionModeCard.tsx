import React, { useMemo } from 'react';
import { CurrentTask, PlaybackSettings } from '../types';
import { getConstructionBreakdown, getCharacteristicResolution } from '../audio/solfegeHelper';
import {
  ArrowUp,
  ArrowDown,
  Sparkles,
  ArrowRight,
  Radio,
} from 'lucide-react';

interface ConstructionModeCardProps {
  currentTask: CurrentTask | null;
  settings: PlaybackSettings;
  onReveal: () => void;
  onReplayRoot: () => void;
  onReplayFull: () => void;
}

export const ConstructionModeCard: React.FC<ConstructionModeCardProps> = ({
  currentTask,
}) => {
  if (!currentTask) {
    return (
      <div className="w-full bg-slate-900/60 border border-slate-800 rounded-xl p-6 text-center flex flex-col items-center justify-center gap-2">
        <Sparkles className="w-8 h-8 text-amber-400/50" />
        <p className="text-slate-300 text-xs sm:text-sm font-medium">
          Нажмите <span className="text-indigo-400 font-bold">«Новый звук»</span> для старта режима построения
        </p>
        <p className="text-[11px] text-slate-500 max-w-sm">
          В этом режиме звучит опорный тон, и вам предлагается построить интервал или аккорд вверх или вниз.
        </p>
      </div>
    );
  }

  const { item, rootNoteName, revealed, constructionDirection } = currentTask;
  const direction = constructionDirection || 'up';
  const isUp = direction === 'up';

  // Calculate detailed diatonic solfege notes and interval steps
  const breakdown = useMemo(() => {
    return getConstructionBreakdown(item, currentTask.rootMidi, direction, rootNoteName);
  }, [item, currentTask.rootMidi, direction, rootNoteName]);

  // Compute characteristic interval resolution if applicable
  const charResolution = useMemo(() => {
    return getCharacteristicResolution(item, breakdown.notesMidi, breakdown.noteNames, direction);
  }, [item, breakdown.notesMidi, breakdown.noteNames, direction]);

  return (
    <div className="w-full bg-slate-900/70 backdrop-blur-xl border border-slate-800/80 rounded-xl p-4 sm:p-5 flex flex-col items-center text-center shadow-lg transition-all space-y-3.5">
      {/* Highlighted Pitch & Direction Arrow */}
      <div className="flex items-center justify-center gap-3 p-3 rounded-2xl bg-slate-950/70 border border-indigo-500/30 shadow-inner w-full max-w-xs">
        <span className="text-2xl sm:text-3xl font-extrabold text-amber-300 font-mono tracking-tight">
          {rootNoteName}
        </span>

        <div
          className={`flex items-center justify-center w-9 h-9 rounded-full border shadow-md transition ${
            isUp
              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
              : 'bg-sky-500/20 text-sky-400 border-sky-500/40'
          }`}
          title={isUp ? 'Построение вверх' : 'Построение вниз'}
        >
          {isUp ? (
            <ArrowUp className="w-5 h-5 stroke-[2.5]" />
          ) : (
            <ArrowDown className="w-5 h-5 stroke-[2.5]" />
          )}
        </div>
      </div>

      {/* Main Prompt */}
      <div className="space-y-1">
        <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
          {item.name}
        </h2>
        {item.hint && (
          <span className="inline-block text-[10px] font-mono text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded">
            {item.hint}
          </span>
        )}
      </div>

      {/* Revealed Solution with Chord Root Title and Diatonic Spelling */}
      {revealed && (
        <div className="w-full max-w-xl bg-slate-950/80 border border-slate-800/90 rounded-xl p-4 text-left space-y-3.5 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between text-xs border-b border-slate-800/80 pb-2">
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
              >
                {isUp ? <ArrowUp className="w-3.5 h-3.5 stroke-[2.5]" /> : <ArrowDown className="w-3.5 h-3.5 stroke-[2.5]" />}
                <span>{isUp ? 'Вверх' : 'Вниз'}</span>
              </div>
            </div>
          </div>

          {/* Full Chord Name with Root Tone */}
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
              {breakdown.fullChordTitle}
            </h3>
          </div>

          {/* Characteristic Interval Resolution (Key & Voice Leading Breakdown) */}
          {charResolution && (
            <div className="w-full bg-indigo-950/40 border border-indigo-500/30 rounded-xl p-3 sm:p-3.5 space-y-2.5">
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
              <div className="space-y-1.5">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Звуки {direction === 'down' ? 'сверху вниз' : 'снизу вверх'}:
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {breakdown.noteNames.map((note, idx) => {
                    const isRoot = idx === 0;
                    return (
                      <React.Fragment key={idx}>
                        <div
                          className={`px-3 py-1.5 rounded-lg font-bold text-sm sm:text-base border shadow-sm transition ${
                            isRoot
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                              : 'bg-slate-800/90 text-white border-slate-700'
                          }`}
                        >
                          <span>{note}</span>
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
                <div className="space-y-1.5 pt-1">
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
