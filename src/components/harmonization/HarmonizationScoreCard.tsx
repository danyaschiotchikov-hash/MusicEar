import React from 'react';
import {
  Music,
  Volume2,
  FileMusic,
  ListMusic,
} from 'lucide-react';
import {
  HarmonizationResult,
  HarmonizationKey,
  SopranoInputNote,
} from '../../audio/harmonizationEngine';
import { VexFlowHarmonizationStaff } from '../VexFlowHarmonizationStaff';

interface HarmonizationScoreCardProps {
  harmonization: HarmonizationResult | null;
  currentKey: HarmonizationKey;
  meter: string;
  activeStepIndex: number | null;
  onAuditionStep: (index: number) => void;
  scoreViewMode: 'vexflow' | 'color_voices';
  onScoreViewModeChange: (mode: 'vexflow' | 'color_voices') => void;
  studioTab: 'free' | 'task' | 'dictation';
  userChords: string[];
  showReferenceHarmonization: boolean;
  sopranoNotes: SopranoInputNote[];
}

export const HarmonizationScoreCard: React.FC<HarmonizationScoreCardProps> = React.memo(({
  harmonization,
  currentKey,
  meter = '4/4',
  activeStepIndex,
  onAuditionStep,
  scoreViewMode,
  onScoreViewModeChange,
  studioTab,
  userChords,
  showReferenceHarmonization,
  sopranoNotes,
}) => {
  const isTaskMode = studioTab === 'task';
  const hasNotes = harmonization && harmonization.steps.length > 0;

  return (
    <div className="w-full bg-slate-900/60 border border-slate-800 rounded-2xl p-3 flex flex-col gap-2.5 shadow-sm select-none transition-all">
      {/* 1. Header Toolbar with Icons */}
      <div className="flex items-center justify-between gap-2 w-full flex-wrap sm:flex-nowrap">
        {/* Left: Score identity badge & key info */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Music className="w-4 h-4" />
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <span className="font-semibold text-slate-200">
              {currentKey.keyNameRu}
            </span>
            <span className="text-slate-500">·</span>
            <span className="font-mono text-slate-400">{meter}</span>
            {hasNotes && (
              <>
                <span className="text-slate-500">·</span>
                <span className="font-mono text-indigo-300">
                  {harmonization.steps.length} {harmonization.steps.length === 1 ? 'нота' : 'нот'}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Right: Score view toggle buttons (VexFlow vs SATB Voices) with clean icons */}
        <div className="flex items-center gap-1 bg-slate-950/80 border border-slate-800 rounded-lg p-0.5 ml-auto">
          <button
            type="button"
            onClick={() => onScoreViewModeChange('vexflow')}
            className={`px-2 h-6 rounded flex items-center gap-1 text-[11px] font-medium transition cursor-pointer ${
              scoreViewMode === 'vexflow'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Нотный стан (VexFlow)"
          >
            <FileMusic className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Стан</span>
          </button>
          <button
            type="button"
            onClick={() => onScoreViewModeChange('color_voices')}
            className={`px-2 h-6 rounded flex items-center gap-1 text-[11px] font-medium transition cursor-pointer ${
              scoreViewMode === 'color_voices'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="4 голоса SATB"
          >
            <ListMusic className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">SATB</span>
          </button>
        </div>
      </div>

      {/* 2. Score Notation Stave / Empty State */}
      {!hasNotes ? (
        <div className="w-full min-h-[140px] bg-slate-950/40 border border-dashed border-slate-800/80 rounded-xl p-6 flex flex-col items-center justify-center text-center gap-1.5">
          <Music className="w-6 h-6 text-slate-600" />
          <span className="text-xs text-slate-400 font-medium">Мелодия пуста</span>
          <span className="text-[11px] text-slate-500">Добавьте ноты на клавиатуре ниже</span>
        </div>
      ) : (
        <div className="w-full flex justify-center overflow-x-auto py-1 no-scrollbar rounded-xl bg-slate-950/40 border border-slate-800/50">
          {scoreViewMode === 'vexflow' ? (
            <VexFlowHarmonizationStaff
              steps={harmonization.steps}
              detectedTurns={harmonization.detectedTurns}
              currentKey={currentKey}
              meter={meter}
              activeStepIndex={activeStepIndex}
              onSelectStep={onAuditionStep}
              onlySoprano={isTaskMode && !showReferenceHarmonization}
              userChords={userChords}
            />
          ) : (
            <div className="w-full flex flex-col gap-2 p-2">
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                {harmonization.steps.map((step, idx) => {
                  const isActive = activeStepIndex === idx;
                  const [bassName, tenorName, altoName, sopranoName] = step.noteNamesSATB;
                  const chordSym = isTaskMode && !showReferenceHarmonization
                    ? (userChords[idx] || '—')
                    : step.chordSymbol;

                  return (
                    <button
                      key={`voice_col_${idx}`}
                      type="button"
                      onClick={() => onAuditionStep(idx)}
                      className={`flex flex-col gap-1 p-2 rounded-xl border text-xs text-left transition cursor-pointer ${
                        isActive
                          ? 'bg-indigo-950/60 border-indigo-500 shadow-md ring-1 ring-indigo-500/50'
                          : 'bg-slate-950/70 border-slate-800 hover:bg-slate-850'
                      }`}
                      title={`Шаг ${idx + 1} (${sopranoName}): клик для прослушивания`}
                    >
                      <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                        <span>№{idx + 1}</span>
                        <span className="text-amber-300 font-bold">{chordSym}</span>
                      </div>

                      {/* Soprano */}
                      <div className="flex items-center justify-between text-[11px] text-indigo-300">
                        <span className="text-[10px] text-slate-500 font-mono">S</span>
                        <span className="font-mono font-bold">{sopranoName}</span>
                      </div>

                      {/* Alto, Tenor, Bass */}
                      {(!isTaskMode || showReferenceHarmonization) && (
                        <>
                          <div className="flex items-center justify-between text-[11px] text-emerald-300">
                            <span className="text-[10px] text-slate-500 font-mono">A</span>
                            <span className="font-mono font-medium">{altoName}</span>
                          </div>

                          <div className="flex items-center justify-between text-[11px] text-amber-300">
                            <span className="text-[10px] text-slate-500 font-mono">T</span>
                            <span className="font-mono font-medium">{tenorName}</span>
                          </div>

                          <div className="flex items-center justify-between text-[11px] text-cyan-300">
                            <span className="text-[10px] text-slate-500 font-mono">B</span>
                            <span className="font-mono font-bold">{bassName}</span>
                          </div>
                        </>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
});
