import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CurrentTask, PlaybackSettings } from '../types';
import { getConstructionBreakdown, getCharacteristicResolution } from '../audio/solfegeHelper';
import { ResolutionSchemeView, ResolutionVoiceRow } from './ResolutionSchemeView';
import {
  ArrowUp,
  ArrowDown,
  Sparkles,
  ArrowRight,
  Layers,
} from 'lucide-react';

interface ConstructionModeCardProps {
  currentTask: CurrentTask | null;
  settings?: PlaybackSettings;
  constructionStepCount?: number;
  onReveal?: () => void;
  onReplayRoot?: () => void;
  onReplayFull?: () => void;
  onStepNext?: () => void;
}

export const ConstructionModeCard: React.FC<ConstructionModeCardProps> = ({
  currentTask,
  constructionStepCount = 1,
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

  const totalNotes = breakdown.noteNames.length;
  const effectiveStepCount = revealed ? totalNotes : Math.max(1, constructionStepCount);

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
      <div className="w-full bg-slate-900/60 border border-slate-800 rounded-xl p-8 text-center flex flex-col items-center justify-center gap-3">
        <Sparkles className="w-8 h-8 text-slate-500" />
        <p className="text-slate-400 text-xs sm:text-sm">
          Нажмите <span className="text-slate-200 font-semibold">«Новый звук»</span> для старта режима построения
        </p>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center text-center transition-all gap-3">
      {/* Header Bar: Note & Direction Badge */}
      <div className="flex items-center justify-between gap-3 p-2 px-3 rounded-lg bg-slate-950/80 border border-slate-800 w-full max-w-lg">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">От ноты:</span>
          <span className="text-xl font-mono font-bold text-amber-300 leading-none">
            {rootNoteName}
          </span>
        </div>

        <div
          className={`flex items-center gap-1 px-2 py-0.5 rounded-md border text-xs font-semibold ${
            isUp
              ? 'bg-emerald-950/50 text-emerald-300 border-emerald-800/40'
              : 'bg-sky-950/50 text-sky-300 border-sky-800/40'
          }`}
        >
          {isUp ? (
            <>
              <ArrowUp className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Вверх</span>
            </>
          ) : (
            <>
              <ArrowDown className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Вниз</span>
            </>
          )}
        </div>
      </div>

      {/* Main Prompt Box */}
      <div className="flex flex-col items-center gap-1 w-full max-w-lg bg-slate-950/60 border border-slate-800/80 p-3 rounded-lg">
        <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
          Постройте:
        </span>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight">
          {item.name}
        </h2>
        {item.hint && (
          <span className="text-[11px] font-mono bg-slate-900 text-indigo-300 px-2 py-0.5 rounded border border-slate-800 font-medium mt-0.5">
            {item.hint}
          </span>
        )}
      </div>

      {/* Solution Display with Diatonic Spelling & Step-by-Step Progress */}
      <div className="w-full max-w-lg flex flex-col items-center gap-3 text-center">
        {/* Characteristic Interval Resolution Vertical Scheme */}
        {charResolution && (revealed || effectiveStepCount >= totalNotes) && (
          <div className="w-full space-y-4">
            {charResolution.isTritoneDouble ? (
              <div className="flex flex-col gap-4 w-full">
                <ResolutionSchemeView
                  title="ув.4 (увеличенная кварта)"
                  tonalityName={charResolution.uv4Resolution!.tonality}
                  targetName={charResolution.uv4Resolution!.resolvedIntervalName}
                  rows={charResolution.uv4Resolution!.voiceMovements.map((vm) => ({
                    fromNote: vm.from,
                    fromDegree: vm.degreeFrom,
                    toNote: vm.to,
                    toDegree: vm.degreeTo,
                  }))}
                  givenNoteName={rootNoteName}
                />
                <ResolutionSchemeView
                  title="ум.5 (уменьшенная квинта)"
                  tonalityName={charResolution.um5Resolution!.tonality}
                  targetName={charResolution.um5Resolution!.resolvedIntervalName}
                  rows={charResolution.um5Resolution!.voiceMovements.map((vm) => ({
                    fromNote: vm.from,
                    fromDegree: vm.degreeFrom,
                    toNote: vm.to,
                    toDegree: vm.degreeTo,
                  }))}
                  givenNoteName={rootNoteName}
                />
              </div>
            ) : (
              <ResolutionSchemeView
                title="В ладу"
                tonalityName={charResolution.tonality}
                targetName={charResolution.resolvedIntervalName}
                rows={resolutionRows}
                givenNoteName={rootNoteName}
              />
            )}
          </div>
        )}

        {/* Sequence of Notes & Step-by-Step Interval Scheme */}
        {(!charResolution || !revealed) && (
          <>
            {/* Vertical Note Stack: Given note at bottom if UP, at top if DOWN */}
            {breakdown.noteNames.length > 0 && (() => {
              const zipped = breakdown.noteNames.map((note, i) => ({
                note,
                label: breakdown.degreeLabels?.[i] || `${i + 1}`,
                isRoot: i === 0,
                isRevealed: i < effectiveStepCount,
              }));
              const itemsToRender = direction === 'up' ? [...zipped].reverse() : zipped;

              return (
                <div className="w-full space-y-1">
                  <div className="flex flex-col items-center gap-1 w-full max-w-sm mx-auto">
                    {itemsToRender.map((itm, idx) => {
                      const isSpecial = itm.isRevealed && (itm.label.includes('♭') || itm.label.includes('♯') || itm.label.includes('♮'));
                      return (
                        <motion.div
                          key={idx}
                          initial={false}
                          animate={{
                            scale: itm.isRevealed ? 1 : 0.98,
                            opacity: itm.isRevealed ? 1 : 0.65,
                          }}
                          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                          className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg font-mono text-xs border transition-all ${
                            !itm.isRevealed
                              ? 'bg-slate-950/40 text-slate-600 border-slate-850 opacity-60'
                              : isSpecial
                              ? 'bg-slate-900/90 text-slate-100 border-indigo-500/40 font-semibold'
                              : itm.isRoot
                              ? 'bg-amber-950/40 text-amber-200 border-amber-800/40 font-semibold'
                              : 'bg-slate-950/80 text-slate-200 border-slate-800'
                          }`}
                        >
                          <span className={`${
                            !itm.isRevealed
                              ? 'text-slate-600 font-medium'
                              : isSpecial
                              ? 'text-indigo-300'
                              : itm.isRoot
                              ? 'text-amber-400'
                              : 'text-slate-400'
                          } text-xs font-mono`}>
                            {itm.label}
                          </span>
                          <span className={`min-w-[32px] h-6 px-2 flex items-center justify-center rounded border text-xs font-bold font-mono ${
                            !itm.isRevealed
                              ? 'bg-slate-900 border-slate-800 text-slate-600 font-mono'
                              : isSpecial
                              ? 'bg-slate-800 border-indigo-500/50 text-indigo-200'
                              : itm.isRoot
                              ? 'bg-amber-950/70 border-amber-500/40 text-amber-200'
                              : 'bg-slate-900 border-slate-700 text-slate-200'
                          }`}>
                            {itm.isRevealed ? itm.note : '?'}
                          </span>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            {/* Clean Interval Scheme without Notes */}
            {breakdown.steps.length > 0 && (
              <div className="w-full text-center pt-1">
                <div className="inline-flex flex-wrap items-center justify-center gap-1.5 px-3 py-1 rounded-lg bg-slate-950/80 border border-slate-800 text-xs font-mono font-bold shadow-inner">
                  {breakdown.steps.map((st, sIdx) => {
                    const isStepRevealed = effectiveStepCount >= sIdx + 2;
                    return (
                      <React.Fragment key={sIdx}>
                        {sIdx > 0 && <span className="text-slate-600">+</span>}
                        <span className={isStepRevealed ? 'text-emerald-400' : 'text-slate-600'}>
                          {isStepRevealed ? st.intervalName : '?'}
                        </span>
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};


