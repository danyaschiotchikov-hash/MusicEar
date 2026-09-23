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

const ConstructionModeCardComponent: React.FC<ConstructionModeCardProps> = ({
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
      {/* Solution Display: Single Unified Card */}
      <div className="w-full max-w-sm flex flex-col items-center gap-3 text-center">
        <div className="flex flex-col items-center gap-3 w-full bg-slate-900/70 border border-slate-800 p-3.5 rounded-2xl shadow-inner backdrop-blur-sm">
          {/* Header Row: Given Note & Direction (with enlarged root note) */}
          <div className="flex items-center justify-between w-full pb-2 border-b border-white/5 text-xs">
            <div className="flex items-center gap-2 text-slate-400">
              <span className="text-xs sm:text-sm font-medium">От ноты:</span>
              <span className="text-2xl sm:text-3xl text-amber-300 font-mono font-black leading-none">{rootNoteName}</span>
            </div>
            <div className={`flex items-center gap-1.5 font-bold text-xs sm:text-sm ${isUp ? 'text-emerald-300' : 'text-sky-300'}`}>
              {isUp ? <ArrowUp className="w-4 h-4 stroke-[2.5]" /> : <ArrowDown className="w-4 h-4 stroke-[2.5]" />}
              <span>{isUp ? 'Вверх' : 'Вниз'}</span>
            </div>
          </div>

          {/* Answer Title & Subtitle */}
          <div className="flex flex-col items-center gap-0.5 w-full">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
              {!revealed ? 'Постройте:' : 'Ответ:'}
            </span>
            <h3 className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight">
              {item.name}
            </h3>
            {item.hint && !revealed && (
              <span className="text-[11px] font-mono bg-slate-950/80 text-indigo-300 px-2 py-0.5 rounded-lg border border-slate-800 font-medium mt-0.5">
                {item.hint}
              </span>
            )}
            {breakdown.fullChordTitle && breakdown.fullChordTitle !== item.name && revealed && (
              <span className="text-xs font-mono text-slate-400">{breakdown.fullChordTitle}</span>
            )}
          </div>

          {/* Characteristic Interval Resolution Vertical Scheme */}
          {charResolution && (revealed || effectiveStepCount >= totalNotes) && (
            <div className="w-full pt-1">
              {charResolution.isTritoneDouble ? (
                <div className="flex flex-col gap-3 w-full">
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

          {/* Sequence of Notes & Step-by-Step Progress */}
          {(!charResolution || !revealed) && (
            <div className="w-full space-y-2 pt-0.5">
              {breakdown.noteNames.length > 0 && (() => {
                const zipped = breakdown.noteNames.map((note, i) => ({
                  note,
                  label: breakdown.degreeLabels?.[i] || `${i + 1}`,
                  isRoot: i === 0,
                  isRevealed: i < effectiveStepCount,
                }));
                const itemsToRender = direction === 'up' ? [...zipped].reverse() : zipped;

                return (
                  <div className="flex flex-col items-center gap-1 w-full">
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
                          className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl font-mono text-xs border transition-all ${
                            !itm.isRevealed
                              ? 'bg-slate-950/40 text-slate-600 border-slate-800/60 opacity-60'
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
                          <span className={`min-w-[32px] h-6 px-2 flex items-center justify-center rounded-lg border text-xs font-bold font-mono ${
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
                );
              })()}

              {/* Clean Interval Scheme */}
              {breakdown.steps.length > 0 && (
                <div className="w-full text-center pt-0.5">
                  <div className="inline-flex flex-wrap items-center justify-center gap-1.5 px-3 py-1 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-mono font-bold shadow-inner">
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const ConstructionModeCard = React.memo(ConstructionModeCardComponent);


