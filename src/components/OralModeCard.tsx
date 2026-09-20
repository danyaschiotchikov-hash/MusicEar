import React, { useMemo } from 'react';
import { CurrentTask, PlaybackSettings } from '../types';
import { getConstructionBreakdown, getCharacteristicResolution } from '../audio/solfegeHelper';
import { ResolutionSchemeView, ResolutionVoiceRow } from './ResolutionSchemeView';
import {
  HelpCircle,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  Volume2,
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
  const item = currentTask?.item;
  const rootNoteName = currentTask?.rootNoteName ?? 'C';
  const revealed = currentTask?.revealed ?? false;
  const direction = currentTask?.playedDirection || 'up';
  const isUp = direction === 'up';

  // Compute solfege note breakdown and chord title with true tertian root tone
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
      <div className="w-full bg-slate-900/60 border border-slate-800 rounded-2xl p-8 text-center flex flex-col items-center justify-center gap-3">
        <HelpCircle className="w-10 h-10 text-indigo-400/40" />
        <p className="text-slate-400 text-sm">
          Нажмите <span className="text-indigo-400 font-semibold">«Новый звук»</span>, чтобы прослушать элемент в устном режиме
        </p>
      </div>
    );
  }

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
          <div className="flex items-center gap-1.5 text-xs text-slate-300 mt-2 bg-slate-950/80 border border-slate-800 px-3 py-1.5 rounded-lg">
            <span className="text-slate-400">Заданная нота:</span>
            <strong className="text-amber-300 font-mono text-sm font-bold">{rootNoteName}</strong>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 w-full max-w-xl animate-in fade-in zoom-in-95 duration-200 text-center">
          {/* Highlighted Pitch & Direction Badge */}
          <div className="flex items-center justify-center gap-3 p-3 rounded-2xl bg-slate-950/70 border border-indigo-500/30 shadow-inner w-full max-w-xs mx-auto">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
              <span>от ноты:</span>
              <span className="text-2xl sm:text-3xl font-extrabold text-amber-300 font-mono tracking-tight">
                {rootNoteName}
              </span>
            </div>

            <div
              className={`flex items-center justify-center w-9 h-9 rounded-full border shadow-md transition ${
                isUp
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                  : 'bg-sky-500/20 text-sky-400 border-sky-500/40'
              }`}
              title={isUp ? 'Вверх' : 'Вниз'}
            >
              {isUp ? (
                <ArrowUp className="w-5 h-5 stroke-[2.5]" />
              ) : (
                <ArrowDown className="w-5 h-5 stroke-[2.5]" />
              )}
            </div>
          </div>

          {/* Prominent Answer Title & Formula */}
          <div className="flex flex-col items-center gap-1.5 w-full">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-100 tracking-tight">
              {item.name}
            </h2>
            {breakdown.fullChordTitle && breakdown.fullChordTitle !== item.name && (
              <span className="text-xs font-mono font-bold text-indigo-300 bg-indigo-500/15 px-2.5 py-1 rounded-lg border border-indigo-500/30 shadow-xs">
                {breakdown.fullChordTitle}
              </span>
            )}
            {item.hint && (
              <span className="text-xs font-mono bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30 font-semibold">
                {item.hint}
              </span>
            )}
          </div>

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

