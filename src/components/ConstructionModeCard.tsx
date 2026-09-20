import React, { useMemo } from 'react';
import { CurrentTask, PlaybackSettings } from '../types';
import { getConstructionBreakdown, getCharacteristicResolution } from '../audio/solfegeHelper';
import { ResolutionSchemeView, ResolutionVoiceRow } from './ResolutionSchemeView';
import {
  ArrowUp,
  ArrowDown,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

interface ConstructionModeCardProps {
  currentTask: CurrentTask | null;
  settings?: PlaybackSettings;
  onReveal?: () => void;
  onReplayRoot?: () => void;
  onReplayFull?: () => void;
}

export const ConstructionModeCard: React.FC<ConstructionModeCardProps> = ({
  currentTask,
}) => {
  const item = currentTask?.item;
  const rootNoteName = currentTask?.rootNoteName ?? 'C';
  const revealed = currentTask?.revealed ?? false;
  const direction = currentTask?.constructionDirection || 'up';
  const isUp = direction === 'up';

  // Calculate detailed diatonic solfege notes and interval steps
  const breakdown = useMemo(() => {
    if (!currentTask || !item) {
      return { fullChordTitle: '', noteNames: [], notesMidi: [], degreeLabels: [], steps: [] };
    }
    return getConstructionBreakdown(item, currentTask.rootMidi, direction, rootNoteName);
  }, [currentTask, item, direction, rootNoteName]);

  // Compute characteristic interval resolution if applicable
  const charResolution = useMemo(() => {
    if (!item || !breakdown.notesMidi.length) return null;
    return getCharacteristicResolution(item, breakdown.notesMidi, breakdown.noteNames, direction);
  }, [item, breakdown.notesMidi, breakdown.noteNames, direction]);

  const resolutionRows: ResolutionVoiceRow[] = useMemo(() => {
    if (!charResolution) return [];
    const rows = charResolution.voiceMovements.map((vm) => ({
      fromNote: vm.from,
      fromDegree: vm.degreeFrom,
      toNote: vm.to,
      toDegree: vm.degreeTo,
    }));
    return rows.reverse();
  }, [charResolution]);

  if (!currentTask || !item) {
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

      {/* Revealed Solution with Diatonic Spelling */}
      {revealed && (
        <div className="w-full max-w-xl flex flex-col items-center gap-3.5 animate-in fade-in zoom-in-95 duration-150 text-center">

          {/* Characteristic Interval Resolution Vertical Scheme */}
          {charResolution && (
            <ResolutionSchemeView
              title="Разрешение интервала в тональности"
              tonalityName={charResolution.tonality}
              rows={resolutionRows}
              givenNoteName={rootNoteName}
            />
          )}

          {/* Sequence of Notes & Step-by-Step Interval Scheme */}
          {!charResolution && (
            <>
              {/* Vertical Note Stack: Given note at bottom if UP, at top if DOWN */}
              {breakdown.noteNames.length > 0 && (() => {
                const zipped = breakdown.noteNames.map((note, i) => ({
                  note,
                  label: breakdown.degreeLabels?.[i] || `${i + 1}`,
                  isRoot: i === 0,
                }));
                const itemsToRender = direction === 'up' ? [...zipped].reverse() : zipped;

                return (
                  <div className="w-full space-y-1.5 pt-1">
                    <div className="flex flex-col items-center gap-1 w-full max-w-xs mx-auto">
                      {itemsToRender.map((item, idx) => {
                        const isSpecial = item.label.includes('♭') || item.label.includes('♯') || item.label.includes('♮');
                        return (
                          <div
                            key={idx}
                            className={`w-full flex items-center justify-between px-3.5 py-1.5 rounded-xl font-mono text-xs sm:text-sm border shadow-xs transition-all ${
                              isSpecial
                                ? 'bg-fuchsia-950/70 text-fuchsia-100 border-fuchsia-500/70 font-bold shadow-fuchsia-950/30'
                                : item.isRoot
                                ? 'bg-amber-950/40 text-amber-100 border border-amber-500/50 font-bold'
                                : 'bg-slate-900 text-white border-slate-700/80'
                            }`}
                          >
                            <div className="flex items-center gap-1.5">
                              <span className={`${isSpecial ? 'text-fuchsia-300 font-black' : item.isRoot ? 'text-amber-400 font-bold' : 'text-slate-300 font-extrabold'} text-xs font-mono`}>
                                {item.label}
                              </span>
                            </div>
                            <span className={`min-w-[36px] h-8 px-2 flex items-center justify-center rounded-lg border text-sm font-extrabold shadow-inner ${
                              isSpecial
                                ? 'bg-fuchsia-900/60 border-fuchsia-400/80 text-fuchsia-100'
                                : item.isRoot
                                ? 'bg-amber-950/80 border-amber-500/60 text-amber-200'
                                : 'bg-slate-800 border-slate-600 text-slate-100'
                            }`}>
                              {item.note}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

              {/* Clean Interval Scheme without Notes */}
              {breakdown.steps.length > 0 && (
                <div className="w-full space-y-1.5 pt-1 text-center">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Схема интервалов:
                  </div>
                  <div className="inline-flex flex-wrap items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs sm:text-sm font-mono font-bold text-emerald-400">
                    {breakdown.steps.map((st) => st.intervalName).join(' + ')}
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

