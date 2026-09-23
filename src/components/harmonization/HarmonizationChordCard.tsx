import React from 'react';
import {
  Layers,
  Sparkles,
  FileCheck,
  RotateCcw,
  RefreshCw,
  Volume2,
  CheckCircle2,
  AlertTriangle,
  Info,
} from 'lucide-react';
import {
  HarmonizedStep,
  HarmonizationKey,
  AuditErrorItem,
} from '../../audio/harmonizationEngine';

interface HarmonizationChordCardProps {
  steps: HarmonizedStep[];
  currentKey: HarmonizationKey;
  activeStepIndex: number | null;
  onAuditionStep: (index: number) => void;
  userChords: string[];
  onSelectChordForStep: (stepIndex: number, chord: string) => void;
  studioTab: 'free' | 'task' | 'dictation';
  showReferenceHarmonization: boolean;
  onToggleReference: () => void;
  onGenerateTask?: () => void;
  onAuditUser: () => void;
  onResetChords?: () => void;
  auditResults: AuditErrorItem[] | null;
}

const COMMON_CHORD_CHOICES = [
  'T5/3', 'T6', 'S5/3', 'S6', 'K6/4', 'D5/3', 'D6', 'D7', 'II6', 'II6/5', 'VI'
];

export const HarmonizationChordCard: React.FC<HarmonizationChordCardProps> = React.memo(({
  steps,
  currentKey,
  activeStepIndex,
  onAuditionStep,
  userChords,
  onSelectChordForStep,
  studioTab,
  showReferenceHarmonization,
  onToggleReference,
  onGenerateTask,
  onAuditUser,
  onResetChords,
  auditResults,
}) => {
  const isTaskMode = studioTab === 'task';
  const hasSteps = steps.length > 0;

  return (
    <div className="w-full bg-slate-900/60 border border-slate-800 rounded-2xl p-3 flex flex-col gap-2.5 shadow-sm select-none transition-all">
      {/* 1. Header Toolbar with Icons */}
      <div className="flex items-center justify-between gap-2 w-full flex-wrap sm:flex-nowrap">
        {/* Left: Identity & Step Count */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Layers className="w-4 h-4" />
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <span className="font-semibold text-slate-200">
              {isTaskMode ? 'Гармонизация' : 'Гармония'}
            </span>
            {hasSteps && (
              <>
                <span className="text-slate-500">·</span>
                <span className="font-mono text-slate-400">
                  {steps.length} {steps.length === 1 ? 'аккорд' : 'аккордов'}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Right: Actions via clean icons with tooltips */}
        <div className="flex items-center gap-1.5 shrink-0 ml-auto">
          {/* New Task (in Task mode) */}
          {isTaskMode && onGenerateTask && (
            <button
              type="button"
              onClick={onGenerateTask}
              className="h-7 px-2.5 bg-slate-950/80 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white rounded-lg text-xs font-medium flex items-center gap-1 cursor-pointer transition active:scale-95 shadow-xs"
              title="Сгенерировать новую задачу"
            >
              <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Новая задача</span>
            </button>
          )}

          {/* Audit / Check voice leading */}
          <button
            type="button"
            onClick={onAuditUser}
            disabled={!hasSteps}
            className="h-7 px-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-lg text-xs font-medium flex items-center gap-1 cursor-pointer transition active:scale-95 shadow-xs"
            title="Проверить голосоведение"
          >
            <FileCheck className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Проверить</span>
          </button>

          {/* Toggle Reference Solution */}
          {isTaskMode && (
            <button
              type="button"
              onClick={onToggleReference}
              className={`h-7 px-2.5 rounded-lg border text-xs font-medium flex items-center gap-1 cursor-pointer transition active:scale-95 shadow-xs ${
                showReferenceHarmonization
                  ? 'bg-amber-600/30 border-amber-500/60 text-amber-200'
                  : 'bg-slate-950/80 hover:bg-slate-800 border-slate-800 text-slate-300 hover:text-white'
              }`}
              title="Показать эталонную академическую гармонизацию"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span className="hidden sm:inline">
                {showReferenceHarmonization ? 'Мой выбор' : 'Эталон'}
              </span>
            </button>
          )}

          {/* Reset user chords */}
          {onResetChords && (
            <button
              type="button"
              onClick={onResetChords}
              disabled={!hasSteps}
              className="h-7 w-7 bg-slate-950/80 hover:bg-slate-800 disabled:opacity-40 border border-slate-800 text-slate-400 hover:text-rose-300 rounded-lg flex items-center justify-center cursor-pointer transition"
              title="Очистить выбранные аккорды"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 2. Chord Steps Matrix */}
      {!hasSteps ? (
        <div className="w-full min-h-[100px] bg-slate-950/40 border border-dashed border-slate-800/80 rounded-xl p-4 flex flex-col items-center justify-center text-center gap-1">
          <Layers className="w-5 h-5 text-slate-600" />
          <span className="text-xs text-slate-500">Ожидание нот мелодии</span>
        </div>
      ) : (
        <div className="w-full overflow-x-auto pb-1 no-scrollbar">
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 min-w-[340px]">
            {steps.map((step, idx) => {
              const isActive = activeStepIndex === idx;
              const currentChoice = userChords[idx] || '';
              const autoChord = step.chordSymbol;
              const isLockedRef = isTaskMode && showReferenceHarmonization;
              const displayValue = isLockedRef
                ? autoChord
                : isTaskMode
                ? currentChoice
                : (currentChoice || autoChord);

              return (
                <div
                  key={`chord_step_${idx}`}
                  className={`flex flex-col gap-1.5 p-2 rounded-xl border text-xs transition relative ${
                    isActive
                      ? 'bg-indigo-950/50 border-indigo-500 ring-1 ring-indigo-500/50'
                      : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {/* Step Header: Index, Note Name, and Audition Icon */}
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 font-mono">№{idx + 1}</span>
                    <span className="text-indigo-300 font-mono font-bold">
                      {step.sopranoNote.noteName}
                    </span>
                    <button
                      type="button"
                      onClick={() => onAuditionStep(idx)}
                      className="text-slate-500 hover:text-indigo-300 transition cursor-pointer p-0.5"
                      title="Прослушать этот аккорд"
                    >
                      <Volume2 className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Chord Function Selector / Badge */}
                  {isLockedRef ? (
                    <div className="w-full h-7 bg-amber-950/30 border border-amber-600/40 rounded-lg flex items-center justify-center text-xs font-mono font-bold text-amber-300">
                      {autoChord}
                    </div>
                  ) : (
                    <select
                      value={displayValue}
                      onChange={(e) => onSelectChordForStep(idx, e.target.value)}
                      className="w-full h-7 bg-slate-900 border border-slate-700 rounded-lg px-1.5 text-xs text-amber-200 font-mono font-bold focus:outline-none focus:border-indigo-500 cursor-pointer"
                    >
                      <option value="">(—)</option>
                      {COMMON_CHORD_CHOICES.map((ch) => (
                        <option key={ch} value={ch}>
                          {ch}
                        </option>
                      ))}
                    </select>
                  )}

                  {/* Metric position footer */}
                  <div className="flex items-center justify-between text-[9px] text-slate-500 font-mono">
                    <span>т.{step.sopranoNote.measure}</span>
                    <span>{step.sopranoNote.degreeRoman} ст.</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. Compact Audit Results Ribbon */}
      {auditResults !== null && (
        <div className="pt-1.5 border-t border-slate-800/80">
          {auditResults.length === 0 ? (
            <div className="p-2 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Голосоведение корректно, ошибок нет!</span>
            </div>
          ) : (
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-1.5 text-xs text-amber-300 font-medium">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                <span>Замечания ({auditResults.length})</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {auditResults.map((err, idx) => (
                  <div
                    key={`audit_${idx}`}
                    className={`p-2 rounded-lg border text-[11px] flex items-start gap-1.5 ${
                      err.type === 'error'
                        ? 'bg-rose-950/30 border-rose-800/50 text-rose-200'
                        : 'bg-amber-950/30 border-amber-800/50 text-amber-200'
                    }`}
                  >
                    {err.type === 'error' ? (
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                    ) : (
                      <Info className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    )}
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-200">
                        т.{err.measure}: {err.titleRu}
                      </span>
                      <span className="text-slate-400 leading-tight">
                        {err.descriptionRu}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
});
