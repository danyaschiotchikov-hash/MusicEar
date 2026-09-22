import React, { useState, useEffect } from 'react';
import { PlaybackSettings } from '../types';
import {
  HARMONIZATION_TEMPLATES,
  MelodyHarmonizationTemplate,
  validateHarmonization,
  CHORD_NAMES_MAP,
  buildSATBForChord,
} from '../audio/melodyHarmonization';
import { SATBGrandStaff } from './SATBGrandStaff';
import { renderAnalyticalSymbol } from './ProgressionModeCard';
import {
  Volume2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Play,
  Award,
  Eye,
  Check,
  RotateCcw,
  RefreshCw,
  BookOpen,
} from 'lucide-react';

interface MelodyHarmonizationModeCardProps {
  settings: PlaybackSettings;
  isPlaying: boolean;
  onPlayMelodyOnly: (template: MelodyHarmonizationTemplate) => void;
  onPlaySATBProgression: (
    template: MelodyHarmonizationTemplate,
    chordSequence: string[]
  ) => void;
  onPlayStepSATB: (
    sopranoMidi: number,
    chordId: string,
    keyRoot: string,
    scaleMode: 'major' | 'minor'
  ) => void;
  onSettingsChange: (updated: Partial<PlaybackSettings>) => void;
}

export const MelodyHarmonizationModeCard: React.FC<MelodyHarmonizationModeCardProps> = ({
  settings,
  isPlaying,
  onPlayMelodyOnly,
  onPlaySATBProgression,
  onPlayStepSATB,
  onSettingsChange,
}) => {
  const [selectedTemplateIndex, setSelectedTemplateIndex] = useState(0);
  const template = HARMONIZATION_TEMPLATES[selectedTemplateIndex] || HARMONIZATION_TEMPLATES[0];

  const [userChords, setUserChords] = useState<(string | null)[]>(() =>
    template.sopranoMelody.map(() => null)
  );

  const [activeStepSlot, setActiveStepSlot] = useState<number>(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isEvaluated, setIsEvaluated] = useState(false);
  const [previewedStepIndex, setPreviewedStepIndex] = useState<number | null>(null);

  useEffect(() => {
    setUserChords(template.sopranoMelody.map(() => null));
    setActiveStepSlot(0);
    setIsRevealed(false);
    setIsEvaluated(false);
    setPreviewedStepIndex(null);
  }, [selectedTemplateIndex, template]);

  const handleSelectTemplate = (index: number) => {
    setSelectedTemplateIndex(index);
  };

  const handleNextTask = () => {
    const nextIdx = (selectedTemplateIndex + 1) % HARMONIZATION_TEMPLATES.length;
    setSelectedTemplateIndex(nextIdx);
  };

  const handlePickChordForStep = (chordId: string) => {
    const updated = [...userChords];
    updated[activeStepSlot] = chordId;
    setUserChords(updated);
    setIsEvaluated(false);

    const step = template.sopranoMelody[activeStepSlot];
    onPlayStepSATB(step.midi, chordId, template.keyRootNote, template.scaleMode);

    if (activeStepSlot < template.sopranoMelody.length - 1) {
      setActiveStepSlot(activeStepSlot + 1);
    }
  };

  const handleTriggerCheck = () => {
    setIsEvaluated(true);
    const fullChords = userChords.map(
      (c, i) => c || template.referenceChords[i]
    );
    onPlaySATBProgression(template, fullChords);
  };

  const handleFillAuthorAnswer = () => {
    setUserChords([...template.referenceChords]);
    setIsRevealed(true);
    setIsEvaluated(true);
    onPlaySATBProgression(template, template.referenceChords);
  };

  const handleResetSelections = () => {
    setUserChords(template.sopranoMelody.map(() => null));
    setActiveStepSlot(0);
    setIsRevealed(false);
    setIsEvaluated(false);
  };

  const analysis = validateHarmonization(template, userChords);

  const isMinorKey = template.scaleMode === 'minor';
  const chordPalette = isMinorKey
    ? [
        {
          group: 'Тоника',
          color: 'bg-cyan-950/40 border-cyan-800/50 text-cyan-300 hover:bg-cyan-900/60',
          chords: ['t53', 't6', 'VI53'],
        },
        {
          group: 'Субдоминанта',
          color: 'bg-amber-950/40 border-amber-800/50 text-amber-300 hover:bg-amber-900/60',
          chords: ['s53', 's6', 'II6'],
        },
        {
          group: 'Доминанта & Каданс',
          color: 'bg-rose-950/40 border-rose-800/50 text-rose-300 hover:bg-rose-900/60',
          chords: ['D53', 'D6', 'D7', 'D65', 'K64'],
        },
      ]
    : [
        {
          group: 'Тоника',
          color: 'bg-cyan-950/40 border-cyan-800/50 text-cyan-300 hover:bg-cyan-900/60',
          chords: ['T53', 'T6', 'VI53'],
        },
        {
          group: 'Субдоминанта',
          color: 'bg-amber-950/40 border-amber-800/50 text-amber-300 hover:bg-amber-900/60',
          chords: ['S53', 'S6', 'S64', 'II6'],
        },
        {
          group: 'Доминанта & Каданс',
          color: 'bg-rose-950/40 border-rose-800/50 text-rose-300 hover:bg-rose-900/60',
          chords: ['D53', 'D6', 'D64', 'D7', 'D65', 'K64'],
        },
      ];

  const currentStepNote = template.sopranoMelody[activeStepSlot];

  return (
    <div className="w-full flex flex-col gap-3">
      {/* Minimalist Main Card (Matching ProgressionModeCard) */}
      <div className="w-full bg-slate-900/50 border border-slate-800/80 rounded-2xl p-3 sm:p-4 flex flex-col gap-3">
        
        {/* Top Minimal Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-800/60">
          {/* Template Selector Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium hidden sm:inline">Мелодия:</span>
            <select
              value={selectedTemplateIndex}
              onChange={(e) => handleSelectTemplate(Number(e.target.value))}
              className="bg-slate-950 border border-slate-800 text-indigo-300 text-xs font-bold px-2.5 py-1.5 rounded-lg cursor-pointer focus:outline-none"
            >
              {HARMONIZATION_TEMPLATES.map((t, idx) => (
                <option key={t.id} value={idx}>
                  {t.title} ({t.keyNameRu})
                </option>
              ))}
            </select>
          </div>

          {/* Key & Context Badges */}
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 bg-slate-950 border border-slate-800 text-indigo-300 text-xs font-bold font-mono rounded-lg">
              {template.keyNameRu}
            </span>
          </div>
        </div>

        {/* Action Header & Playback Control Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-950/70 border border-slate-800/80 rounded-xl p-2">
          {/* Playback Buttons */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => onPlayMelodyOnly(template)}
              disabled={isPlaying}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold rounded-lg transition cursor-pointer active:scale-95 shadow-sm"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Мелодия</span>
            </button>

            <button
              type="button"
              onClick={() => {
                const fullChords = userChords.map(
                  (c, i) => c || template.referenceChords[i]
                );
                onPlaySATBProgression(template, fullChords);
              }}
              disabled={isPlaying}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-semibold rounded-lg transition cursor-pointer disabled:opacity-50"
            >
              <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
              <span>Мой вариант</span>
            </button>

            <button
              type="button"
              onClick={() => onPlaySATBProgression(template, template.referenceChords)}
              disabled={isPlaying}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700/50 text-emerald-200 text-xs font-semibold rounded-lg transition cursor-pointer disabled:opacity-50"
            >
              <Award className="w-3.5 h-3.5 text-emerald-400" />
              <span>Эталон</span>
            </button>
          </div>

          {/* Primary Action Buttons (Header Level - replaces bottom buttons) */}
          <div className="flex items-center gap-2">
            {!isRevealed ? (
              <>
                <button
                  type="button"
                  onClick={handleTriggerCheck}
                  disabled={userChords.some((c) => !c)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-xs font-bold rounded-lg transition cursor-pointer active:scale-95"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Проверить</span>
                </button>

                <button
                  type="button"
                  onClick={handleFillAuthorAnswer}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-950/80 hover:bg-indigo-900/80 border border-indigo-700/50 text-indigo-200 text-xs font-semibold rounded-lg transition cursor-pointer active:scale-95"
                >
                  <Eye className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Показать ответ</span>
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={handleNextTask}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg transition cursor-pointer active:scale-95 shadow-sm"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Следующая мелодия</span>
              </button>
            )}
          </div>
        </div>

        {/* Step Buttons Bar (Measure Pills) */}
        <div className="flex items-center gap-1.5 w-full overflow-x-auto py-0.5">
          {template.sopranoMelody.map((step, idx) => {
            const userChord = userChords[idx];
            const isActive = activeStepSlot === idx;
            const displayChord = isRevealed ? template.referenceChords[idx] : userChord;

            return (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setActiveStepSlot(idx);
                  if (displayChord) {
                    onPlayStepSATB(step.midi, displayChord, template.keyRootNote, template.scaleMode);
                  }
                }}
                className={`flex-1 min-w-[60px] py-2 px-1 rounded-lg border text-center transition cursor-pointer flex flex-col items-center justify-center ${
                  isActive
                    ? 'bg-indigo-950/80 border-indigo-500 text-white ring-1 ring-indigo-500'
                    : displayChord
                    ? 'bg-slate-900 border-indigo-700/50 text-indigo-200'
                    : 'bg-slate-950/80 border-slate-800/80 text-slate-400 hover:bg-slate-800/60'
                }`}
              >
                <span className="text-[9px] text-slate-400 font-mono">Такт {idx + 1}</span>
                <span className="text-xs font-mono font-bold mt-0.5">
                  {displayChord ? renderAnalyticalSymbol(displayChord) : step.noteName}
                </span>
                <span className="text-[9px] font-mono text-indigo-300/80">{step.degreeRoman} ст.</span>
              </button>
            );
          })}
        </div>

        {/* Interactive SATB Grand Staff */}
        <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-3 flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold text-slate-300">Партитура САТБ ({template.keyNameRu}):</span>
            <span className="text-[10px]">Формула: {template.formula}</span>
          </div>
          <SATBGrandStaff template={template} userChords={isRevealed ? template.referenceChords : userChords} />
        </div>

        {/* Step Builder / Chord Selection Palette (when NOT revealed) */}
        {!isRevealed && (
          <div className="flex flex-col gap-2 p-3 bg-slate-950/80 border border-slate-800/80 rounded-xl">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>
                Выберите аккорд для <strong>Такта {activeStepSlot + 1}</strong> ({currentStepNote.noteName}, {currentStepNote.degreeRoman} ст.):
              </span>
              {userChords.some(Boolean) && (
                <button
                  type="button"
                  onClick={handleResetSelections}
                  className="text-[10px] text-slate-500 hover:text-slate-300 transition flex items-center gap-1"
                >
                  <RotateCcw className="w-2.5 h-2.5" />
                  <span>Сбросить</span>
                </button>
              )}
            </div>

            {/* Chord Palette Groups */}
            <div className="flex flex-col gap-1.5 pt-1">
              {chordPalette.map((grp) => (
                <div key={grp.group} className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-500 w-28 shrink-0">{grp.group}:</span>
                  <div className="flex flex-wrap gap-1">
                    {grp.chords.map((c) => {
                      const isSelected = userChords[activeStepSlot] === c;
                      const isAllowed = currentStepNote.allowedChordIds.includes(c);

                      return (
                        <button
                          key={c}
                          type="button"
                          onClick={() => handlePickChordForStep(c)}
                          className={`px-2 py-1 rounded border text-xs font-mono font-bold transition cursor-pointer ${
                            isSelected
                              ? 'bg-indigo-600 border-indigo-400 text-white ring-1 ring-indigo-400'
                              : isAllowed
                              ? grp.color
                              : 'bg-slate-900/60 border-slate-800/60 text-slate-500 hover:text-slate-300'
                          }`}
                        >
                          {renderAnalyticalSymbol(c)}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Revealed / Evaluation Results */}
        {(isEvaluated || isRevealed) && (
          <div className="p-3 bg-slate-950/90 border border-slate-800/90 rounded-xl flex flex-col gap-2 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-0.5 rounded text-xs font-mono font-black border ${
                    analysis.score >= 80
                      ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/50'
                      : analysis.score >= 50
                      ? 'bg-amber-950/80 text-amber-300 border-amber-700/50'
                      : 'bg-rose-950/80 text-rose-300 border-rose-700/50'
                  }`}
                >
                  {analysis.score}%
                </span>
                <span className="text-xs font-bold text-slate-200">
                  {analysis.summaryRu}
                </span>
              </div>
            </div>

            {template.voiceLeadingExplanationRu && (
              <p className="text-xs text-slate-400 leading-relaxed p-2 rounded-lg bg-slate-900/60 border border-slate-800/60">
                <strong className="text-indigo-300 font-semibold block mb-0.5">Голосоведение и каденция:</strong>
                {template.voiceLeadingExplanationRu}
              </p>
            )}

            {/* Issues List */}
            {analysis.issues.length > 0 ? (
              <div className="flex flex-col gap-1">
                {analysis.issues.map((issue, idx) => (
                  <div
                    key={idx}
                    className={`p-2 rounded-lg border text-xs flex items-start gap-2 ${
                      issue.severity === 'error'
                        ? 'bg-rose-950/30 border-rose-800/40 text-rose-200'
                        : 'bg-amber-950/30 border-amber-800/40 text-amber-200'
                    }`}
                  >
                    {issue.severity === 'error' ? (
                      <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <strong className="font-bold block">{issue.titleRu}</strong>
                      <span className="text-[11px] opacity-90">{issue.descriptionRu}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-2 bg-emerald-950/30 border border-emerald-800/40 text-emerald-200 rounded-lg text-xs flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Гармонизация полностью соответствует правилам классического 4-голосия!</span>
              </div>
            )}
          </div>
        )}

        {/* CRITICAL: NO BUTTONS AT THE BOTTOM! The card ends cleanly right here. */}
      </div>
    </div>
  );
};
