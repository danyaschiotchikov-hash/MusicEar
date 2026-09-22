import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CurrentTask, PlaybackSettings } from '../types';
import { getConstructionBreakdown, getCharacteristicResolution } from '../audio/solfegeHelper';
import { ResolutionSchemeView, ResolutionVoiceRow } from './ResolutionSchemeView';
import { getCardPaletteClasses } from '../utils/cardPalettes';
import {
  HelpCircle,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  Volume2,
  Sparkles,
  Music,
  RotateCcw,
  CheckCircle2,
  Eye,
} from 'lucide-react';

interface OralModeCardProps {
  currentTask: CurrentTask | null;
  settings?: PlaybackSettings;
  onReveal: () => void;
  onReplay?: () => void;
}

export const OralModeCard: React.FC<OralModeCardProps> = ({
  currentTask,
  settings,
  onReveal,
  onReplay,
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
      <div className="w-full bg-slate-900/60 border border-slate-800 rounded-xl p-8 text-center flex flex-col items-center justify-center gap-3">
        <HelpCircle className="w-8 h-8 text-slate-500" />
        <p className="text-slate-400 text-xs sm:text-sm">
          Нажмите <span className="text-slate-200 font-semibold">«Новый звук»</span>, чтобы прослушать элемент в устном режиме
        </p>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center justify-center text-center transition-all">
      <AnimatePresence mode="wait">
        {!revealed ? (
          <motion.div
            key="unrevealed"
            initial={{ opacity: 0, y: 6, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.99 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center justify-center py-4 sm:py-6 w-full max-w-md text-center gap-3"
          >
            <div className="w-12 h-12 rounded-xl bg-slate-950/90 border border-slate-800 flex items-center justify-center text-slate-300 shadow-xs">
              <Volume2 className="w-6 h-6 animate-pulse text-indigo-400" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base sm:text-lg font-bold text-slate-100 tracking-tight">
                Определите созвучие на слух
              </h3>
              <p className="text-xs text-slate-400">
                Попробуйте спеть или назвать ноты про себя перед открытием ответа
              </p>
            </div>

            {/* Root Pitch & Direction pill */}
            <div className="flex items-center gap-2 text-xs bg-slate-950/80 border border-slate-800 px-3 py-1.5 rounded-lg shadow-xs mt-1">
              <span className="text-slate-400 font-medium">Заданная нота:</span>
              <span className="text-amber-300 font-mono text-sm font-bold">{rootNoteName}</span>
              <span className="text-slate-600">|</span>
              <span className="flex items-center gap-1 font-semibold text-slate-300">
                {isUp ? (
                  <>
                    <ArrowUp className="w-3.5 h-3.5 text-emerald-400 stroke-[2.5]" />
                    <span>Вверх</span>
                  </>
                ) : (
                  <>
                    <ArrowDown className="w-3.5 h-3.5 text-sky-400 stroke-[2.5]" />
                    <span>Вниз</span>
                  </>
                )}
              </span>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="revealed"
            initial={{ opacity: 0, y: 8, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.99 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center gap-3 w-full max-w-lg text-center"
          >
            {(() => {
              const palette = getCardPaletteClasses(settings?.cardPalette);
              return (
                /* Unified Single Card Container for Everything */
                <div className={`flex flex-col items-center gap-3 w-full ${palette.bgClass} border ${palette.borderClass} p-4 rounded-2xl shadow-inner`}>
                  {/* Root Note & Direction */}
                  <div className="flex items-center justify-between w-full pb-2.5 border-b border-white/5 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <span>От ноты:</span>
                      <span className={`${palette.textClass} font-mono font-bold`}>{rootNoteName}</span>
                    </div>
                    <div className={`flex items-center gap-1 font-semibold ${isUp ? 'text-emerald-300' : 'text-sky-300'}`}>
                      {isUp ? <ArrowUp className="w-3.5 h-3.5 stroke-[2.5]" /> : <ArrowDown className="w-3.5 h-3.5 stroke-[2.5]" />}
                      <span>{isUp ? 'Вверх' : 'Вниз'}</span>
                    </div>
                  </div>

                  {/* Answer Title & Formula */}
                  <div className="flex flex-col items-center gap-1 w-full pt-1">
                    <h2 className={`text-xl sm:text-2xl font-bold ${palette.textClass} tracking-tight`}>
                      {item.name}
                    </h2>
                    {(breakdown.fullChordTitle && breakdown.fullChordTitle !== item.name) || item.hint ? (
                      <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-mono text-slate-300">
                        {breakdown.fullChordTitle && breakdown.fullChordTitle !== item.name && (
                          <span>{breakdown.fullChordTitle}</span>
                        )}
                        {item.hint && (
                          <span className="text-indigo-300">· {item.hint}</span>
                        )}
                      </div>
                    ) : null}
                  </div>

              {/* Characteristic Interval Resolution Vertical Scheme */}
              {charResolution && (
                <div className="w-full pt-2">
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

              {/* Sequence of Notes & Step-by-Step Interval Scheme */}
              {!charResolution && (
                <div className="w-full space-y-3 pt-1">
                  {breakdown.noteNames.length > 0 && (() => {
                    const zipped = breakdown.noteNames.map((note, i) => ({
                      note,
                      label: breakdown.degreeLabels?.[i] || `${i + 1}`,
                      isRoot: i === 0,
                    }));
                    const itemsToRender = direction === 'up' ? [...zipped].reverse() : zipped;

                    return (
                      <div className="flex flex-col items-center gap-1 w-full max-w-sm mx-auto">
                        {itemsToRender.map((itm, idx) => {
                          const isSpecial = itm.label.includes('♭') || itm.label.includes('♯') || itm.label.includes('♮');
                          return (
                            <div
                              key={idx}
                              className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg font-mono text-xs border transition-all ${
                                isSpecial
                                  ? 'bg-slate-900/90 text-slate-100 border-indigo-500/40 font-semibold'
                                  : itm.isRoot
                                  ? 'bg-amber-950/40 text-amber-200 border-amber-800/40 font-semibold'
                                  : 'bg-slate-900/60 text-slate-200 border-slate-800/80'
                              }`}
                            >
                              <span className={`${isSpecial ? 'text-indigo-300' : itm.isRoot ? 'text-amber-400' : 'text-slate-400'} text-xs font-mono font-medium`}>
                                {itm.label}
                              </span>
                              <span className={`min-w-[32px] h-6 px-2 flex items-center justify-center rounded border text-xs font-bold font-mono ${
                                isSpecial
                                  ? 'bg-slate-800 border-indigo-500/50 text-indigo-200'
                                  : itm.isRoot
                                  ? 'bg-amber-950/70 border-amber-500/40 text-amber-200'
                                  : 'bg-slate-900 border-slate-700 text-slate-200'
                              }`}>
                                {itm.note}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}

                  {breakdown.steps.length > 0 && (
                    <div className="w-full text-center">
                      <div className="inline-flex flex-wrap items-center justify-center gap-1 px-3 py-1 rounded-lg bg-slate-900/80 border border-slate-800 text-xs font-mono font-bold text-emerald-400 shadow-inner">
                        {breakdown.steps.map((st) => st.intervalName).join(' + ')}
                      </div>
                    </div>
                  )}
                </div>
              )}
                </div>
              );
            })()}
        </motion.div>
      )}
    </AnimatePresence>
    </div>
  );
};

