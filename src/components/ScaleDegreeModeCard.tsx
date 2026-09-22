import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PlaybackSettings } from '../types';
import { ScaleDegreeTask, RUSSIAN_NOTE_NAMES_BY_SEMITONE } from '../audio/solfegeHelper';
import { TONIC_NOTE_OPTIONS } from '../data/musicData';
import { audioEngine } from '../audio/audioEngine';
import { MarathonProgressBar } from './MarathonProgressBar';
import {
  Volume2,
  CheckCircle2,
  Music,
  Settings2,
  Sparkles,
  ArrowRight,
  RotateCw,
  Crown,
} from 'lucide-react';

interface ScaleDegreeModeCardProps {
  task: ScaleDegreeTask | null;
  settings: PlaybackSettings;
  isPlaying: boolean;
  activePlayingMidis: number[];
  onPlayTaskNote: () => void;
  onPlayCadence: (tonic: string, mode: 'major' | 'minor') => void;
  onPlayResolution: () => void;
  onSelectAnswer: (degreeId: string, semitone?: number, keyMidi?: number) => void;
  onNewTask: (forceCadence?: boolean, overrideTwoNotes?: boolean) => void;
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
  midi: number;
  isWhite: boolean;
  isActive: boolean;
  isTonic: boolean;
  degreeId: string;
  degreeLabel: string;
  noteNameRu: string;
  isStable: boolean;
}

function getDegreeMeta(semitones: number, isMajor: boolean): { label: string; isStable: boolean; fullRu: string } {
  const norm = ((semitones % 12) + 12) % 12;

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
  const [pressedKeyMidi, setPressedKeyMidi] = useState<number | null>(null);

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

    const baseTonicMidi = task?.tonicMidi ?? (60 + tonicPitchClass);

    const allKeys: KeyItem[] = [];
    for (let s = minS; s <= maxS; s++) {
      const pitchClass = (tonicPitchClass + s + 120) % 12;
      const midi = baseTonicMidi + s;
      const isWhite = WHITE_PITCH_CLASSES.has(pitchClass);
      const isActive = s >= 0 && s <= 12;
      const isTonic = s === 0 || s === 12;
      const normS = ((s % 12) + 12) % 12;
      const degreeId = SEMITONE_TO_DEGREE_ID[normS];
      const meta = getDegreeMeta(normS, isMajor);
      const noteNameRu = RUSSIAN_NOTE_NAMES_BY_SEMITONE[pitchClass] ?? '';

      allKeys.push({
        relativeSemitone: s,
        pitchClass,
        midi,
        isWhite,
        isActive,
        isTonic,
        degreeId,
        degreeLabel: meta.label,
        noteNameRu,
        isStable: meta.isStable,
      });
    }

    const whiteKeysList = allKeys.filter((k) => k.isWhite);
    const totalWhite = whiteKeysList.length;
    const blackWidthPercent = Math.max(7.5, Math.min(10.5, 82 / totalWhite));

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
  }, [tonicPitchClass, isTonicBlackKey, isMajor, task?.tonicMidi]);

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

  // Check if first note or second note is guessed
  const isFirstNoteGuessed =
    task.userAnswerIds?.includes(task.id) ||
    (task.userAnswerIds && task.userAnswerIds.length > 0 && isRevealed);
  const isSecondNoteGuessed =
    task.secondDegreeId && task.userAnswerIds?.includes(task.secondDegreeId);

  const handleKeyTouch = (keyItem: KeyItem, e?: React.SyntheticEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!keyItem.isActive) return;

    // Visual press animation
    setPressedKeyMidi(keyItem.midi);
    setTimeout(() => {
      setPressedKeyMidi((prev) => (prev === keyItem.midi ? null : prev));
    }, 220);

    // Audio feedback: play clicked note immediately so user hears the pitch
    try {
      const ctx = audioEngine.getContext();
      audioEngine.playSingleNote(keyItem.midi, ctx.currentTime, 0.75, 1.15, settings);
    } catch (err) {
      console.warn('Audio play error', err);
    }

    if (isRevealed) {
      onPlayTaskNote();
      return;
    }

    const normS = ((keyItem.relativeSemitone % 12) + 12) % 12;
    onSelectAnswer(keyItem.degreeId, normS, keyItem.midi);
  };

  return (
    <div className="w-full max-w-xl mx-auto space-y-3 pb-36 select-none">
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
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition cursor-pointer ${
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
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                isTwoNotes
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>2 звука</span>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
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
              className={`px-2.5 py-1.5 rounded-md text-xs font-semibold transition cursor-pointer ${
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
              className={`px-2.5 py-1.5 rounded-md text-xs font-semibold transition cursor-pointer ${
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
            <div className="px-2.5 py-1.5 bg-slate-950/80 border border-slate-800 rounded-lg text-xs font-mono font-bold text-amber-300 flex items-center gap-1.5 shadow-xs">
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

      {/* 3. Task Note Progress Banner (For 1 Note and 2 Notes Modes) */}
      {isTwoNotes ? (
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-3 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Volume2 className={`w-4 h-4 text-indigo-400 ${isPlaying ? 'animate-bounce' : ''}`} />
              <span className="text-xs font-bold text-slate-200">
                {isRevealed
                  ? 'Оба звука найдены!'
                  : isFirstNoteGuessed
                  ? 'Первый звук угадан! Найдите второй:'
                  : 'Слушайте 2 звука и найдите их на пианино:'}
              </span>
            </div>
            <span className="text-[11px] font-mono text-indigo-300 bg-indigo-950/60 border border-indigo-800/80 px-2 py-0.5 rounded-full">
              {isRevealed ? '2 / 2 ✓' : isFirstNoteGuessed ? '1 / 2' : '0 / 2'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {/* Slot 1 */}
            <div
              className={`p-2.5 rounded-lg border text-center transition-all ${
                isFirstNoteGuessed || isRevealed
                  ? 'bg-emerald-950/60 border-emerald-500/70 text-emerald-200 shadow-sm'
                  : 'bg-slate-950/80 border-slate-800 text-slate-400'
              }`}
            >
              <div className="text-[10px] font-medium uppercase tracking-wider mb-0.5 opacity-80">
                Звук 1
              </div>
              <div className="text-xs font-bold truncate">
                {isFirstNoteGuessed || isRevealed ? (
                  <span className="flex items-center justify-center gap-1 text-emerald-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{task.degreeNameRu}</span>
                  </span>
                ) : (
                  <span className="text-slate-500">определите на клавиатуре...</span>
                )}
              </div>
            </div>

            {/* Slot 2 */}
            <div
              className={`p-2.5 rounded-lg border text-center transition-all ${
                isRevealed
                  ? 'bg-emerald-950/60 border-emerald-500/70 text-emerald-200 shadow-sm'
                  : isFirstNoteGuessed
                  ? 'bg-indigo-950/60 border-indigo-500/70 text-indigo-200 shadow-sm animate-pulse'
                  : 'bg-slate-950/80 border-slate-800 text-slate-500'
              }`}
            >
              <div className="text-[10px] font-medium uppercase tracking-wider mb-0.5 opacity-80">
                Звук 2
              </div>
              <div className="text-xs font-bold truncate">
                {isRevealed && task.secondDegreeNameRu ? (
                  <span className="flex items-center justify-center gap-1 text-emerald-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{task.secondDegreeNameRu}</span>
                  </span>
                ) : isFirstNoteGuessed ? (
                  <span className="text-indigo-300 font-semibold">нажмите 2-ю ступень</span>
                ) : (
                  <span className="text-slate-500">ожидание...</span>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-slate-900/50 border border-slate-800/80 rounded-xl px-3 py-2 flex items-center justify-between text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <Volume2 className={`w-3.5 h-3.5 text-indigo-400 ${isPlaying ? 'animate-bounce' : ''}`} />
            <span>Нажмите нужную клавишу на рояле для ответа:</span>
          </div>
          <span className="text-[11px] font-mono text-amber-300/90 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
            Тоника: I
          </span>
        </div>
      )}

      {/* Fixed Bottom Container for Keyboard and Controls */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-slate-950/95 border-t border-slate-800 backdrop-blur-md pb-safe pt-2.5 px-3 shadow-2xl">
        <div className="max-w-xl mx-auto space-y-2.5">
          {/* Interactive Piano Keyboard (Redesigned with Tactile Grand Piano Aesthetics) */}
          <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-2.5 sm:p-3 shadow-xl">
            <div
              className="relative w-full h-40 sm:h-44 bg-slate-950 rounded-xl p-1 border border-slate-800 overflow-hidden select-none touch-none shadow-inner"
              style={{ touchAction: 'none' }}
            >
              {/* White Keys Row */}
              <div className="flex w-full h-full gap-0.5">
                {whiteKeys.map((keyItem) => {
                  const normS = ((keyItem.relativeSemitone % 12) + 12) % 12;
                  const isTarget = isRevealed && keyItem.isActive && (normS === targetOffset || (secondTargetOffset !== null && normS === secondTargetOffset));
                  const isUserGuessed = !isRevealed && task.userAnswerIds?.includes(keyItem.degreeId);
                  const isIncorrectAttempt = keyItem.isActive && task.incorrectAnswers?.includes(keyItem.degreeId);
                  const isPhysicalPressed = pressedKeyMidi === keyItem.midi;

                  // Base white key styling
                  let keyStyle =
                    'bg-gradient-to-b from-white via-slate-50 to-slate-200 text-slate-800 border-x border-slate-300/80 border-b-2 border-b-slate-400/90 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.3),inset_0_-3px_0_rgba(0,0,0,0.1)] active:translate-y-1';

                  if (!keyItem.isActive) {
                    keyStyle =
                      'bg-slate-300/20 opacity-25 border-slate-700/20 text-slate-600 cursor-default pointer-events-none';
                  } else if (isPhysicalPressed) {
                    keyStyle =
                      'bg-gradient-to-b from-slate-100 to-slate-300 text-slate-900 border-slate-400 translate-y-1.5 shadow-[inset_0_4px_6px_rgba(0,0,0,0.25)]';
                  } else if (isTarget) {
                    keyStyle =
                      'bg-gradient-to-b from-emerald-500 to-emerald-600 text-white border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.7),inset_0_-3px_0_rgba(0,0,0,0.2)] font-black z-10';
                  } else if (isUserGuessed) {
                    keyStyle =
                      'bg-gradient-to-b from-indigo-500 to-indigo-600 text-white border-indigo-400 shadow-[0_0_16px_rgba(99,102,241,0.6),inset_0_-3px_0_rgba(0,0,0,0.2)] font-black z-10';
                  } else if (isIncorrectAttempt) {
                    keyStyle =
                      'bg-gradient-to-b from-rose-900 to-rose-950 text-rose-200 border-rose-700 shadow-inner font-bold';
                  } else if (keyItem.isTonic) {
                    keyStyle =
                      'bg-gradient-to-b from-amber-50 via-slate-50 to-amber-100/80 text-slate-900 border-amber-300/70 border-b-2 border-b-amber-400 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.3),inset_0_-3px_0_rgba(251,191,36,0.25)] font-bold';
                  }

                  return (
                    <button
                      key={`white_${keyItem.relativeSemitone}`}
                      type="button"
                      onMouseDown={(e) => handleKeyTouch(keyItem, e)}
                      onTouchStart={(e) => handleKeyTouch(keyItem, e)}
                      disabled={!keyItem.isActive}
                      className={`flex-1 h-full rounded-b-xl transition-all duration-75 flex flex-col justify-end items-center pb-2.5 relative cursor-pointer select-none ${keyStyle}`}
                      title={`${keyItem.degreeLabel} (${keyItem.noteNameRu})`}
                      aria-label={`${keyItem.degreeLabel} ${keyItem.noteNameRu}`}
                    >
                      {/* Tonic Marker Pin */}
                      {keyItem.isActive && keyItem.isTonic && (
                        <div className="absolute top-1.5 left-1/2 -translate-x-1/2 flex items-center justify-center">
                          <span className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.9)] ring-1 ring-amber-300" />
                        </div>
                      )}

                      {/* Note and Degree Labels */}
                      {keyItem.isActive && (
                        <div className="flex flex-col items-center pointer-events-none leading-none gap-0.5">
                          {/* Russian Note Name */}
                          <span
                            className={`text-[9px] sm:text-[10px] font-medium tracking-tight ${
                              isTarget || isUserGuessed
                                ? 'text-white/90'
                                : isIncorrectAttempt
                                ? 'text-rose-300'
                                : 'text-slate-500'
                            }`}
                          >
                            {keyItem.noteNameRu}
                          </span>

                          {/* Roman Degree Label */}
                          <span
                            className={`text-xs sm:text-sm font-extrabold tracking-tighter ${
                              isTarget || isUserGuessed
                                ? 'text-white drop-shadow-sm'
                                : keyItem.isTonic
                                ? 'text-amber-800'
                                : 'text-slate-800'
                            }`}
                          >
                            {keyItem.degreeLabel}
                          </span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Black Keys Layer */}
              {blackKeys.map((keyItem) => {
                const normS = ((keyItem.relativeSemitone % 12) + 12) % 12;
                const isTarget = isRevealed && keyItem.isActive && (normS === targetOffset || (secondTargetOffset !== null && normS === secondTargetOffset));
                const isUserGuessed = !isRevealed && task.userAnswerIds?.includes(keyItem.degreeId);
                const isIncorrectAttempt = keyItem.isActive && task.incorrectAnswers?.includes(keyItem.degreeId);
                const isPhysicalPressed = pressedKeyMidi === keyItem.midi;

                // Base black key styling
                let keyStyle =
                  'bg-gradient-to-b from-slate-800 via-slate-900 to-black text-slate-200 border-x border-slate-700/80 border-b-2 border-b-slate-600 shadow-[0_6px_12px_rgba(0,0,0,0.8),inset_0_-3px_0_rgba(255,255,255,0.08)] active:translate-y-1';

                if (!keyItem.isActive) {
                  keyStyle =
                    'bg-slate-950 opacity-30 border-slate-800 cursor-default pointer-events-none';
                } else if (isPhysicalPressed) {
                  keyStyle =
                    'bg-gradient-to-b from-slate-950 to-black text-white border-slate-600 translate-y-1.5 shadow-[inset_0_2px_4px_rgba(0,0,0,0.7)]';
                } else if (isTarget) {
                  keyStyle =
                    'bg-gradient-to-b from-emerald-600 to-emerald-800 text-white border-emerald-400 shadow-[0_0_24px_rgba(16,185,129,0.8),inset_0_-3px_0_rgba(0,0,0,0.4)] font-black z-30';
                } else if (isUserGuessed) {
                  keyStyle =
                    'bg-gradient-to-b from-indigo-600 to-indigo-800 text-white border-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.7),inset_0_-3px_0_rgba(0,0,0,0.4)] font-black z-30';
                } else if (isIncorrectAttempt) {
                  keyStyle =
                    'bg-gradient-to-b from-rose-950 to-black text-rose-300 border-rose-700 shadow-inner font-bold';
                } else if (keyItem.isTonic) {
                  keyStyle =
                    'bg-gradient-to-b from-amber-950 via-slate-900 to-black text-amber-300 border-amber-500/70 border-b-2 border-b-amber-500 shadow-[0_6px_12px_rgba(0,0,0,0.8),inset_0_-3px_0_rgba(251,191,36,0.2)] font-bold';
                }

                return (
                  <button
                    key={`black_${keyItem.relativeSemitone}`}
                    type="button"
                    onMouseDown={(e) => handleKeyTouch(keyItem, e)}
                    onTouchStart={(e) => handleKeyTouch(keyItem, e)}
                    disabled={!keyItem.isActive}
                    style={{
                      left: `${keyItem.leftPercent}%`,
                      width: `${keyItem.widthPercent}%`,
                    }}
                    className={`absolute top-1 h-[62%] rounded-b-lg transition-all duration-75 z-20 flex flex-col justify-end items-center pb-2 cursor-pointer select-none ${keyStyle}`}
                    title={`${keyItem.degreeLabel} (${keyItem.noteNameRu})`}
                    aria-label={`${keyItem.degreeLabel} ${keyItem.noteNameRu}`}
                  >
                    {/* Tonic marker */}
                    {keyItem.isActive && keyItem.isTonic && (
                      <div className="absolute top-1 left-1/2 -translate-x-1/2 flex items-center justify-center">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.9)]" />
                      </div>
                    )}

                    {/* Degree Label on Black Keys */}
                    {keyItem.isActive && (
                      <div className="flex flex-col items-center pointer-events-none leading-none gap-0.5">
                        <span
                          className={`text-[8px] sm:text-[9px] font-mono font-medium ${
                            isTarget || isUserGuessed
                              ? 'text-white/90'
                              : isIncorrectAttempt
                              ? 'text-rose-300'
                              : 'text-slate-400'
                          }`}
                        >
                          {keyItem.noteNameRu}
                        </span>
                        <span
                          className={`text-[10px] sm:text-xs font-bold tracking-tighter ${
                            isTarget || isUserGuessed
                              ? 'text-white'
                              : keyItem.isTonic
                              ? 'text-amber-400'
                              : 'text-slate-200'
                          }`}
                        >
                          {keyItem.degreeLabel}
                        </span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Studio Action Controls Dock */}
          <div className="grid grid-cols-3 gap-2 pb-1">
            <button
              type="button"
              onClick={() => {
                onPlayCadence(task.tonicNoteName, task.keyScaleMode);
                window.setTimeout(() => {
                  onPlayTaskNote();
                }, 1200);
              }}
              className="py-2.5 px-2 bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-slate-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer active:scale-95 shadow-sm"
            >
              <Music className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Каданс</span>
            </button>

            <button
              type="button"
              onClick={onPlayTaskNote}
              className="py-2.5 px-2 bg-indigo-950/70 hover:bg-indigo-900/80 border border-indigo-700/60 text-indigo-100 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer active:scale-95 shadow-sm"
            >
              <Volume2 className={`w-3.5 h-3.5 text-indigo-300 shrink-0 ${isPlaying ? 'animate-bounce' : ''}`} />
              <span>{isTwoNotes ? 'Повтор 2 звуков' : 'Повтор'}</span>
            </button>

            {isRevealed ? (
              <button
                type="button"
                onClick={() => onNewTask()}
                className="py-2.5 px-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition cursor-pointer shadow-md active:scale-95"
              >
                <span>Дальше</span>
                <ArrowRight className="w-3.5 h-3.5 shrink-0" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onNewTask()}
                className="py-2.5 px-2 bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-slate-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer active:scale-95 shadow-sm"
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
