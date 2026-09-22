import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PlaybackSettings } from '../types';
import { ScaleDegreeTask } from '../audio/solfegeHelper';
import { TONIC_NOTE_OPTIONS } from '../data/musicData';
import { MarathonProgressBar } from './MarathonProgressBar';
import {
  Volume2,
  CheckCircle2,
  Music,
  Settings2,
  Sparkles,
  ArrowRight,
  RotateCw,
} from 'lucide-react';

interface ScaleDegreeModeCardProps {
  task: ScaleDegreeTask | null;
  settings: PlaybackSettings;
  isPlaying: boolean;
  activePlayingMidis: number[];
  onPlayTaskNote: () => void;
  onPlayCadence: (tonic: string, mode: 'major' | 'minor') => void;
  onPlayResolution: () => void;
  onSelectAnswer: (degreeId: string) => void;
  onNewTask: (forceCadence?: boolean) => void;
  onSettingsChange: (updated: Partial<PlaybackSettings>) => void;
  onToggleDrone?: () => void;
  isDroneActive?: boolean;
  degreeMarathonStreak: number;
  degreeMarathonBestStreak: number;
  isNewRecord: boolean;
  onResetMarathon: () => void;
  isTwoNotes: boolean;
  onToggleTwoNotes: (val: boolean) => void;
}

// Pitch class map relative to C = 0
const TONIC_PITCH_MAP: Record<string, number> = {
  C: 0,
  'C#': 1, 'C♯': 1, Cis: 1, Des: 1, 'Cis / Des': 1,
  D: 2,
  'D#': 3, 'D♯': 3, Dis: 3, Es: 3, 'Dis / Es': 3,
  E: 4,
  F: 5,
  'F#': 6, 'F♯': 6, Fis: 6, Ges: 6, 'Fis / Ges': 6,
  G: 7,
  'G#': 8, 'G♯': 8, Gis: 8, As: 8, 'Gis / As': 8,
  A: 9,
  'A#': 10, 'A♯': 10, Ais: 10, 'B♭': 10, Bb: 10, 'Ais / B': 10,
  H: 11, B: 11,
};

const WHITE_PITCH_CLASSES = new Set([0, 2, 4, 5, 7, 9, 11]);

const SEMITONE_TO_DEGREE_ID: Record<number, string> = {
  0: 'deg_I',
  1: 'deg_bII',
  2: 'deg_II',
  3: 'deg_bIII',
  4: 'deg_III',
  5: 'deg_IV',
  6: 'deg_bV',
  7: 'deg_V',
  8: 'deg_bVI',
  9: 'deg_VI',
  10: 'deg_bVII',
  11: 'deg_VII',
};

interface KeyItem {
  relativeSemitone: number;
  pitchClass: number;
  isWhite: boolean;
  isActive: boolean;
  isTonic: boolean;
  degreeId: string;
  degreeLabel: string;
  isStable: boolean;
}

function getDegreeMeta(semitones: number, isMajor: boolean): { label: string; isStable: boolean; fullRu: string } {
  const norm = ((semitones % 12) + 12) % 12;
  const third = isMajor ? 4 : 3;
  const sixth = isMajor ? 9 : 8;

  switch (norm) {
    case 0:
      return { label: 'I', isStable: true, fullRu: 'I (Тоника)' };
    case 1:
      return { label: '♭II', isStable: false, fullRu: '♭II (Низкая II)' };
    case 2:
      return { label: 'II', isStable: false, fullRu: 'II ступень' };
    case 3:
      return isMajor
        ? { label: '♭III', isStable: false, fullRu: '♭III ступень' }
        : { label: 'III', isStable: true, fullRu: 'III (Медианта)' };
    case 4:
      return isMajor
        ? { label: 'III', isStable: true, fullRu: 'III (Медианта)' }
        : { label: '♯III', isStable: false, fullRu: '♯III ступень' };
    case 5:
      return { label: 'IV', isStable: false, fullRu: 'IV (Субдоминанта)' };
    case 6:
      return { label: '♭V', isStable: false, fullRu: '♭V (Тритон)' };
    case 7:
      return { label: 'V', isStable: true, fullRu: 'V (Доминанта)' };
    case 8:
      return isMajor
        ? { label: '♭VI', isStable: false, fullRu: '♭VI ступень' }
        : { label: 'VI', isStable: false, fullRu: 'VI (Медианта)' };
    case 9:
      return isMajor
        ? { label: 'VI', isStable: false, fullRu: 'VI (Медианта)' }
        : { label: '♯VI', isStable: false, fullRu: '♯VI (Мелодич.)' };
    case 10:
      return isMajor
        ? { label: '♭VII', isStable: false, fullRu: '♭VII ступень' }
        : { label: 'VII', isStable: false, fullRu: 'VII (Натуральн.)' };
    case 11:
      return isMajor
        ? { label: 'VII', isStable: false, fullRu: 'VII (Вводный тон)' }
        : { label: 'VII♯', isStable: false, fullRu: 'VII♯ (Гармонич.)' };
    default:
      return { label: `${norm}`, isStable: false, fullRu: `${norm} ст.` };
  }
}

export const ScaleDegreeModeCard: React.FC<ScaleDegreeModeCardProps> = ({
  task,
  settings,
  isPlaying,
  onPlayTaskNote,
  onPlayCadence,
  onPlayResolution,
  onSelectAnswer,
  onNewTask,
  onSettingsChange,
  degreeMarathonStreak,
  degreeMarathonBestStreak,
  isNewRecord,
  onResetMarathon,
  isTwoNotes,
  onToggleTwoNotes,
}) => {
  const [showSettings, setShowSettings] = useState(false);

  const activeTonicNote =
    settings.tonalRootNote && settings.tonalRootNote !== 'random'
      ? settings.tonalRootNote
      : task?.tonicNoteName ?? 'C';
  const tonicPitchClass = TONIC_PITCH_MAP[activeTonicNote] ?? 0;
  const isTonicBlackKey = !WHITE_PITCH_CLASSES.has(tonicPitchClass);
  const isMajor = (task?.keyScaleMode ?? settings.tonalScaleMode ?? 'major') === 'major';

  const { whiteKeys, blackKeys } = useMemo(() => {
    const minS = isTonicBlackKey ? -1 : 0;
    const maxS = isTonicBlackKey ? 13 : 12;

    const allKeys: KeyItem[] = [];
    for (let s = minS; s <= maxS; s++) {
      const pitchClass = (tonicPitchClass + s + 120) % 12;
      const isWhite = WHITE_PITCH_CLASSES.has(pitchClass);
      const isActive = s >= 0 && s <= 12;
      const isTonic = s === 0 || s === 12;
      const normS = ((s % 12) + 12) % 12;
      const degreeId = SEMITONE_TO_DEGREE_ID[normS];
      const meta = getDegreeMeta(normS, isMajor);

      allKeys.push({
        relativeSemitone: s,
        pitchClass,
        isWhite,
        isActive,
        isTonic,
        degreeId,
        degreeLabel: meta.label,
        isStable: meta.isStable,
      });
    }

    const whiteKeysList = allKeys.filter((k) => k.isWhite);
    const totalWhite = whiteKeysList.length;
    const blackWidthPercent = Math.max(7, Math.min(10, 80 / totalWhite));

    const blackKeysList = allKeys
      .filter((k) => !k.isWhite)
      .map((bKey) => {
        const whiteBelowIndex =
          whiteKeysList.findIndex((w) => w.relativeSemitone > bKey.relativeSemitone) - 1;
        const effectiveBelowIndex =
          whiteBelowIndex >= 0 ? whiteBelowIndex : whiteKeysList.length - 1;
        const leftPercent =
          ((effectiveBelowIndex + 1) / totalWhite) * 100 - blackWidthPercent / 2;

        return {
          ...bKey,
          leftPercent,
          widthPercent: blackWidthPercent,
        };
      });

    return {
      whiteKeys: whiteKeysList,
      blackKeys: blackKeysList,
    };
  }, [tonicPitchClass, isTonicBlackKey, isMajor]);

  if (!task) {
    return (
      <div className="w-full bg-slate-900/60 border border-slate-800 rounded-xl p-8 text-center flex flex-col items-center justify-center gap-3">
        <Sparkles className="w-8 h-8 text-slate-500" />
        <p className="text-slate-300 text-xs sm:text-sm font-medium">
          Нажмите <span className="text-slate-200 font-semibold">«Новая ступень»</span> для начала тренировки
        </p>
      </div>
    );
  }

  const isRevealed = task.revealed;
  const isCadenceBeforeTask = settings.cadenceBeforeTask === true;
  const degreeType = settings.degreeType || 'diatonic';

  const targetOffset = ((task.targetMidi % 12) - (task.tonicMidi % 12) + 12) % 12;
  const secondTargetOffset = task.secondTargetMidi ? ((task.secondTargetMidi % 12) - (task.tonicMidi % 12) + 12) % 12 : null;

  const handleKeyClick = (keyItem: KeyItem) => {
    if (!keyItem.isActive) return;
    if (isRevealed) {
      onPlayTaskNote();
      return;
    }
    onSelectAnswer(keyItem.degreeId);
  };

  return (
    <div className="w-full max-w-xl mx-auto space-y-3 pb-36">
      {/* Marathon Progress Bar */}
      <MarathonProgressBar
        marathonStreak={degreeMarathonStreak}
        marathonBestStreak={degreeMarathonBestStreak}
        isNewRecord={isNewRecord}
        statusMessage={{ text: '', type: 'idle' }}
        currentTask={null}
        isPlaying={isPlaying}
        onReset={onResetMarathon}
      />

      {/* 1. Header Toolbar: Mode Switcher, Sub-mode (1 vs 2 notes) & Key Badge */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 shadow-xs space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          {/* Sub-mode: 1 note vs 2 notes */}
          <div className="flex items-center p-0.5 bg-slate-950/80 rounded-lg border border-slate-800">
            <button
              type="button"
              onClick={() => {
                if (isTwoNotes) {
                  onToggleTwoNotes(false);
                }
              }}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition cursor-pointer ${
                !isTwoNotes
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              1 звук
            </button>
            <button
              type="button"
              onClick={() => {
                if (!isTwoNotes) {
                  onToggleTwoNotes(true);
                }
              }}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition cursor-pointer ${
                isTwoNotes
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              2 звука
            </button>
          </div>

          {/* Diatonic / Chromatic Switcher */}
          <div className="flex items-center p-0.5 bg-slate-950/80 rounded-lg border border-slate-800">
            <button
              type="button"
              onClick={() => {
                if (degreeType !== 'diatonic') {
                  onSettingsChange({ degreeType: 'diatonic' });
                  setTimeout(() => onNewTask(), 50);
                }
              }}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition cursor-pointer ${
                degreeType === 'diatonic'
                  ? 'bg-slate-800 text-slate-100 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Диатоника
            </button>
            <button
              type="button"
              onClick={() => {
                if (degreeType !== 'chromatic') {
                  onSettingsChange({ degreeType: 'chromatic' });
                  setTimeout(() => onNewTask(), 50);
                }
              }}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition cursor-pointer ${
                degreeType === 'chromatic'
                  ? 'bg-slate-800 text-slate-100 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Хроматика
            </button>
          </div>

          {/* Current Key Indicator & Settings */}
          <div className="flex items-center gap-2">
            <div className="px-2.5 py-1 bg-slate-950/80 border border-slate-800 rounded-lg text-xs font-mono font-bold text-amber-300 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span>{task.keyNameRu}</span>
            </div>

            <button
              type="button"
              onClick={() => setShowSettings(!showSettings)}
              className={`p-1.5 rounded-lg border text-xs font-semibold transition cursor-pointer ${
                showSettings
                  ? 'bg-slate-800 border-slate-700 text-amber-300'
                  : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
              title="Параметры"
              aria-label="Параметры"
            >
              <Settings2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Collapsible Settings Drawer */}
        {showSettings && (
          <div className="p-3 bg-slate-950/90 border border-slate-800 rounded-lg space-y-2.5 text-xs animate-in fade-in duration-100">
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <span className="text-slate-400 text-[11px] block">Тоника:</span>
                <select
                  value={settings.tonalRootNote || 'C'}
                  onChange={(e) => {
                    const val = e.target.value;
                    onSettingsChange({ tonalRootNote: val });
                    setTimeout(() => onNewTask(true), 50);
                  }}
                  className="w-full bg-slate-900 border border-slate-800 text-slate-200 rounded-md p-1.5 font-medium outline-none cursor-pointer text-xs"
                >
                  <option value="random">Случайная</option>
                  {TONIC_NOTE_OPTIONS.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400 text-[11px] block">Наклонение:</span>
                <select
                  value={settings.tonalScaleMode || 'major'}
                  onChange={(e) => {
                    const modeVal = e.target.value as 'major' | 'minor' | 'any';
                    onSettingsChange({ tonalScaleMode: modeVal });
                    setTimeout(() => onNewTask(true), 50);
                  }}
                  className="w-full bg-slate-900 border border-slate-800 text-slate-200 rounded-md p-1.5 font-medium outline-none cursor-pointer text-xs"
                >
                  <option value="major">Мажор</option>
                  <option value="minor">Минор</option>
                  <option value="any">Любое</option>
                </select>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
              <label className="flex items-center justify-between cursor-pointer py-1 select-none">
                <span className="text-slate-300 text-xs">Каданс перед заданием</span>
                <input
                  type="checkbox"
                  checked={isCadenceBeforeTask}
                  onChange={(e) => onSettingsChange({ cadenceBeforeTask: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-indigo-500 focus:ring-0 cursor-pointer"
                />
              </label>
            </div>
          </div>
        )}
      </div>

      {/* 2. Structured Answer Feedback Block */}
      <AnimatePresence>
        {isRevealed && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="p-3.5 rounded-xl border text-xs shadow-sm bg-emerald-950/40 border-emerald-500/40 text-emerald-100"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <span className="font-bold mr-1.5">Верно!</span>
                  <span className="font-bold text-white">{task.degreeNameRu}</span>
                  {task.secondDegreeNameRu && <span className="text-emerald-300 ml-1">и {task.secondDegreeNameRu}</span>}
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto border-t border-emerald-500/20 pt-2 sm:pt-0 sm:border-0">
                <button
                  type="button"
                  onClick={() => onNewTask()}
                  className="py-1.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition cursor-pointer shadow-sm active:scale-95"
                >
                  <span>Дальше</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fixed Bottom Container for Keyboard and Controls */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-slate-950/95 border-t border-slate-800 backdrop-blur-sm pb-safe pt-2 px-3">
        <div className="max-w-xl mx-auto space-y-2.5">
          {/* Degree Answer Buttons Grid */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-2.5 shadow-xs">
            <div className={`grid ${degreeType === 'chromatic' ? 'grid-cols-4 sm:grid-cols-6' : 'grid-cols-4 sm:grid-cols-7'} gap-1.5`}>
              {(degreeType === 'chromatic'
                ? [
                    { id: 'deg_I', roman: 'I', solf: 'До' },
                    { id: 'deg_bII', roman: '♭II', solf: '♭Ре' },
                    { id: 'deg_II', roman: 'II', solf: 'Ре' },
                    { id: 'deg_bIII', roman: '♭III', solf: '♭Ми' },
                    { id: 'deg_III', roman: 'III', solf: 'Ми' },
                    { id: 'deg_IV', roman: 'IV', solf: 'Фа' },
                    { id: 'deg_bV', roman: '♭V', solf: '♭Соль' },
                    { id: 'deg_V', roman: 'V', solf: 'Соль' },
                    { id: 'deg_bVI', roman: '♭VI', solf: '♭Ля' },
                    { id: 'deg_VI', roman: 'VI', solf: 'Ля' },
                    { id: 'deg_bVII', roman: '♭VII', solf: '♭Си' },
                    { id: 'deg_VII', roman: 'VII', solf: 'Си' },
                  ]
                : [
                    { id: 'deg_I', roman: 'I', solf: 'Тоника' },
                    { id: 'deg_II', roman: 'II', solf: 'II ступ.' },
                    { id: 'deg_III', roman: 'III', solf: 'Медианта' },
                    { id: 'deg_IV', roman: 'IV', solf: 'Субдом.' },
                    { id: 'deg_V', roman: 'V', solf: 'Доминанта' },
                    { id: 'deg_VI', roman: 'VI', solf: 'VI ступ.' },
                    { id: 'deg_VII', roman: 'VII', solf: 'Вводный' },
                  ]
              ).map((deg) => {
                const isTarget = isRevealed && (deg.id === task.id || deg.id === task.secondDegreeId);
                const isGuessed = task.userAnswerIds?.includes(deg.id);
                const isIncorrect = task.incorrectAnswers?.includes(deg.id);

                let btnBg = 'bg-slate-950/80 hover:bg-slate-800 border-slate-800 text-slate-200';
                if (isGuessed) {
                  btnBg = 'bg-indigo-600 border-indigo-500 text-white font-bold shadow-sm';
                }
                if (isTarget) {
                  btnBg = 'bg-emerald-600 border-emerald-500 text-white font-bold shadow-sm';
                } else if (isIncorrect) {
                  btnBg = 'bg-rose-950/80 border-rose-800 text-rose-300';
                }

                return (
                  <button
                    key={deg.id}
                    type="button"
                    onClick={() => !isRevealed && onSelectAnswer(deg.id)}
                    disabled={isRevealed}
                    className={`py-2 px-1 rounded-lg border text-xs font-semibold flex flex-col items-center justify-center transition active:scale-95 cursor-pointer ${btnBg}`}
                  >
                    <span className="text-sm font-bold">{deg.roman}</span>
                    <span className="text-[10px] opacity-80 truncate max-w-full">{deg.solf}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Interactive Piano Keyboard */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 sm:p-4 shadow-xs">
            <div className="relative w-full h-36 sm:h-40 bg-slate-950 rounded-lg p-1 border border-slate-800/90 overflow-hidden select-none touch-none">
              {/* White Keys */}
              <div className="flex w-full h-full gap-0.5">
                {whiteKeys.map((keyItem) => {
                  const normS = ((keyItem.relativeSemitone % 12) + 12) % 12;
                  const isTarget = isRevealed && keyItem.isActive && (normS === targetOffset || (secondTargetOffset !== null && normS === secondTargetOffset));
                  const isUserGuessed = !isRevealed && task.userAnswerIds?.includes(keyItem.degreeId);
                  const isIncorrectAttempt = keyItem.isActive && task.incorrectAnswers?.includes(keyItem.degreeId);

                  let keyBg = keyItem.isActive
                    ? 'bg-slate-200 hover:bg-white text-slate-800 border-slate-300 cursor-pointer active:bg-slate-300'
                    : 'bg-slate-300/30 opacity-30 border-slate-400/20 cursor-default';

                  if (keyItem.isActive && keyItem.isTonic && !isTarget && !isIncorrectAttempt && !isUserGuessed) {
                    keyBg = 'bg-slate-100 hover:bg-white text-slate-900 border-slate-400 font-bold';
                  }

                  if (isUserGuessed) {
                    keyBg = 'bg-indigo-600 text-white border-indigo-500 font-bold';
                  }

                  if (isTarget) {
                    keyBg = 'bg-emerald-600 text-white border-emerald-500 font-bold';
                  } else if (isIncorrectAttempt) {
                    keyBg = 'bg-rose-950 text-rose-200 border-rose-800 font-semibold';
                  }

                  return (
                    <button
                      key={`white_${keyItem.relativeSemitone}`}
                      type="button"
                      onClick={() => handleKeyClick(keyItem)}
                      disabled={!keyItem.isActive}
                      className={`flex-1 h-full rounded-b-md border border-b-2 transition-colors duration-100 flex flex-col justify-end items-center pb-2 relative ${keyBg}`}
                      aria-label="Клавиша"
                    >
                      {keyItem.isActive && keyItem.isTonic && !isRevealed && (
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500/80 mb-0.5" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Black Keys */}
              {blackKeys.map((keyItem) => {
                const normS = ((keyItem.relativeSemitone % 12) + 12) % 12;
                const isTarget = isRevealed && keyItem.isActive && (normS === targetOffset || (secondTargetOffset !== null && normS === secondTargetOffset));
                const isUserGuessed = !isRevealed && task.userAnswerIds?.includes(keyItem.degreeId);
                const isIncorrectAttempt = keyItem.isActive && task.incorrectAnswers?.includes(keyItem.degreeId);

                let keyBg = keyItem.isActive
                  ? 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-300 cursor-pointer active:bg-slate-950'
                  : 'bg-slate-950 opacity-40 border-slate-800 cursor-default';

                if (keyItem.isActive && keyItem.isTonic && !isTarget && !isIncorrectAttempt && !isUserGuessed) {
                  keyBg = 'bg-slate-800 hover:bg-slate-700 border-slate-600 text-amber-300 font-bold';
                }

                if (isUserGuessed) {
                  keyBg = 'bg-indigo-600 border-indigo-500 text-white font-bold';
                }

                if (isTarget) {
                  keyBg = 'bg-emerald-600 border-emerald-500 text-white font-bold';
                } else if (isIncorrectAttempt) {
                  keyBg = 'bg-rose-950 border-rose-800 text-rose-300 font-semibold';
                }

                return (
                  <button
                    key={`black_${keyItem.relativeSemitone}`}
                    type="button"
                    onClick={() => handleKeyClick(keyItem)}
                    disabled={!keyItem.isActive}
                    style={{
                      left: `${keyItem.leftPercent}%`,
                      width: `${keyItem.widthPercent}%`,
                    }}
                    className={`absolute top-1 h-[60%] rounded-b-md border-x border-b transition-colors duration-100 z-10 flex flex-col justify-end items-center pb-1.5 ${keyBg}`}
                    aria-label="Черная клавиша"
                  >
                    {keyItem.isActive && keyItem.isTonic && !isRevealed && (
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400/90 mb-0.5" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Studio Action Controls Dock */}
          <div className="grid grid-cols-3 gap-1.5 pb-2">
            <button
              type="button"
              onClick={() => {
                onPlayCadence(task.tonicNoteName, task.keyScaleMode);
                window.setTimeout(() => {
                  onPlayTaskNote();
                }, 1200);
              }}
              className="py-2.5 px-2 bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-200 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer active:scale-95"
            >
              <Music className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>Каданс</span>
            </button>

            <button
              type="button"
              onClick={onPlayTaskNote}
              className="py-2.5 px-2 bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-200 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer active:scale-95"
            >
              <Volume2 className={`w-3.5 h-3.5 text-slate-400 shrink-0 ${isPlaying ? 'animate-bounce' : ''}`} />
              <span>Повтор</span>
            </button>

            {isRevealed ? (
              <button
                type="button"
                onClick={() => onNewTask()}
                className="py-2.5 px-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition cursor-pointer shadow-md active:scale-95"
              >
                <span>Дальше</span>
                <ArrowRight className="w-3.5 h-3.5 shrink-0" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onNewTask()}
                className="py-2.5 px-2 bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-200 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer active:scale-95"
              >
                <RotateCw className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>Новая</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
