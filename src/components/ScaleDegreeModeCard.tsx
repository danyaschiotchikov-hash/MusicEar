import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PlaybackSettings } from '../types';
import { ScaleDegreeTask, RUSSIAN_NOTE_NAMES_BY_SEMITONE } from '../audio/solfegeHelper';
import { TONIC_NOTE_OPTIONS } from '../data/musicData';
import { audioEngine } from '../audio/audioEngine';
import { MarathonProgressBar } from './MarathonProgressBar';
import { resolveTonalInterval } from '../audio/tonalIntervalResolution';
import {
  Volume2,
  CheckCircle2,
  Music,
  Settings2,
  Sparkles,
  ArrowRight,
  RotateCw,
  Crown,
  Activity,
  Layers,
  ChevronDown,
  Library,
  Flame,
  Play,
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

const TONALITY_KEY_OPTIONS = [
  { value: 'C', label: 'C (До)' },
  { value: 'Des', label: 'D♭ (Ре♭)' },
  { value: 'D', label: 'D (Ре)' },
  { value: 'Es', label: 'E♭ (Ми♭)' },
  { value: 'E', label: 'E (Ми)' },
  { value: 'F', label: 'F (Фа)' },
  { value: 'Fis', label: 'F♯ (Фа♯)' },
  { value: 'G', label: 'G (Соль)' },
  { value: 'As', label: 'A♭ (Ля♭)' },
  { value: 'A', label: 'A (Ля)' },
  { value: 'B', label: 'B♭ (Си♭)' },
  { value: 'H', label: 'H (Си)' },
  { value: 'random', label: '🎲 Рандом' },
];

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
  const [isTonalityOpen, setIsTonalityOpen] = useState(false);
  const [pressedKeyMidi, setPressedKeyMidi] = useState<number | null>(null);
  const tonalityDropdownRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isTonalityOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (tonalityDropdownRef.current && !tonalityDropdownRef.current.contains(e.target as Node)) {
        setIsTonalityOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsTonalityOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isTonalityOpen]);

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
  const subMode = settings.degreeSubMode || 'marathon';

  const targetOffset = ((task.targetMidi % 12) - (task.tonicMidi % 12) + 12) % 12;
  const secondTargetOffset = task.secondTargetMidi ? ((task.secondTargetMidi % 12) - (task.tonicMidi % 12) + 12) % 12 : null;

  // Academic Tonal Interval Resolution Engine for 2 sounds
  const intervalResolution = useMemo(() => {
    if (!isTwoNotes || !task.secondTargetMidi) return null;
    return resolveTonalInterval(
      task.targetMidi,
      task.secondTargetMidi,
      task.tonicMidi,
      task.keyNameRu ? task.keyNameRu.split(' ')[0] : task.tonicNoteName,
      task.keyScaleMode === 'minor' ? 'minor' : 'major'
    );
  }, [isTwoNotes, task.targetMidi, task.secondTargetMidi, task.tonicMidi, task.keyNameRu, task.tonicNoteName, task.keyScaleMode]);

  const handlePlayTwoNotesResolution = () => {
    if (!intervalResolution || intervalResolution.status === 'NO_ACTION') return;
    const { inputInterval, resolvedInterval } = intervalResolution;
    if (!resolvedInterval) return;

    try {
      const ctx = audioEngine.getContext();
      const now = ctx.currentTime + 0.05;

      // Step 1: Play initial interval
      audioEngine.playChord([inputInterval.lowerVoice.midi, inputInterval.upperVoice.midi], now, 0.75, 1.1, settings);

      // Step 2: Smooth voice leading into resolved stable interval
      const resolveTime = now + 0.85;
      audioEngine.playChord([resolvedInterval.lowerVoice.midi, resolvedInterval.upperVoice.midi], resolveTime, 1.25, 1.25, settings);
    } catch (e) {
      console.warn('Resolution play error', e);
    }
  };

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
    }, 180);

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

  const btnSymbolClass = "w-9 sm:w-10 h-8 flex items-center justify-center rounded-md text-xs sm:text-sm transition cursor-pointer shrink-0";

  return (
    <div className="w-full max-w-xl mx-auto space-y-3 select-none">
      {/* Marathon Progress Bar: only active in marathon mode */}
      {subMode === 'marathon' && (
        <MarathonProgressBar
          marathonStreak={degreeMarathonStreak}
          marathonBestStreak={degreeMarathonBestStreak}
          isNewRecord={isNewRecord}
          statusMessage={{ text: '', type: 'idle' }}
          currentTask={null}
          isPlaying={isPlaying}
          onReset={onResetMarathon}
        />
      )}

      {/* 1. Header Toolbar: Minimalist Apple HIG Segmented Controls with Symbols */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-2 sm:p-2.5 shadow-xs space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-1.5 sm:gap-2">
          {/* Floating Tonality Popover Trigger (replacing Cards/Marathon switcher) */}
          <div className="relative" ref={tonalityDropdownRef}>
            <button
              type="button"
              onClick={() => setIsTonalityOpen(!isTonalityOpen)}
              className="h-8 px-2.5 sm:px-3 bg-slate-950/70 hover:bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono font-bold text-amber-300 flex items-center gap-1.5 shadow-xs transition cursor-pointer active:scale-95 shrink-0"
              title="Выбор тональности"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
              <span>{task.keyNameRu}</span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isTonalityOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Floating Popover: Notes & Mode */}
            {isTonalityOpen && (
              <div className="absolute top-full left-0 mt-1.5 w-64 sm:w-72 bg-slate-900/95 border border-slate-700/80 rounded-2xl p-3 shadow-2xl backdrop-blur-xl space-y-2.5 z-50 select-none animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold px-0.5">
                  <span>Наклонение лада</span>
                </div>
                <div className="grid grid-cols-3 p-0.5 bg-slate-950/90 border border-slate-800 rounded-xl">
                  {[
                    { id: 'major', symbol: '☼', label: 'Мажор' },
                    { id: 'any', symbol: '🎲', label: 'Рандом' },
                    { id: 'minor', symbol: '☽', label: 'Минор' },
                  ].map((m) => {
                    const isSelected = (settings.degreeScaleMode || settings.tonalScaleMode || 'major') === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => {
                          onSettingsChange({ degreeScaleMode: m.id as any, tonalScaleMode: m.id as any });
                          setTimeout(() => onNewTask(true), 50);
                        }}
                        className={`py-1.5 px-1 text-center text-xs font-semibold rounded-lg flex items-center justify-center gap-1 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-600 text-white shadow-xs font-bold'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <span className="text-sm leading-none">{m.symbol}</span>
                        <span className="text-[11px]">{m.label}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold px-0.5 pt-1">
                  <span>Тоника (I ступень)</span>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-1">
                  {TONALITY_KEY_OPTIONS.map((t) => {
                    const isSelected = (settings.degreeRootNote || settings.tonalRootNote || 'C') === t.value;
                    return (
                      <button
                        key={t.value}
                        type="button"
                        onClick={() => {
                          onSettingsChange({ degreeRootNote: t.value, tonalRootNote: t.value });
                          setIsTonalityOpen(false);
                          setTimeout(() => onNewTask(true), 50);
                        }}
                        className={`py-1.5 px-1 rounded-lg text-center font-mono text-[11px] font-semibold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-600 text-white shadow-xs font-bold'
                            : 'bg-slate-950/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800/60'
                        }`}
                      >
                        {t.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Sub-mode: 1 note vs 2 notes */}
            <div className="flex items-center gap-0.5 p-0.5 bg-slate-950/70 rounded-lg border border-slate-800 shadow-inner">
              <button
                type="button"
                onClick={() => {
                  if (isTwoNotes) {
                    onToggleTwoNotes(false);
                  }
                }}
                className={`${btnSymbolClass} ${
                  !isTwoNotes
                    ? 'bg-indigo-600 text-white shadow-sm font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="1 звук"
                aria-label="1 звук"
              >
                <span className="font-mono font-bold text-xs sm:text-sm">1</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!isTwoNotes) {
                    onToggleTwoNotes(true);
                  }
                }}
                className={`${btnSymbolClass} ${
                  isTwoNotes
                    ? 'bg-indigo-600 text-white shadow-sm font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="2 звука"
                aria-label="2 звука"
              >
                <span className="font-mono font-bold text-xs sm:text-sm">2</span>
              </button>
            </div>

            {/* Arpeggio / Harmonic toggle for 2 notes */}
            {isTwoNotes && (
              <div className="flex items-center gap-0.5 bg-slate-950/70 border border-slate-800 p-0.5 rounded-lg shadow-inner">
                <button
                  type="button"
                  onClick={() => onSettingsChange({ style: 'arpeggio', twoNotesStyle: 'arpeggio' })}
                  className={`${btnSymbolClass} ${
                    (settings.twoNotesStyle || settings.style) === 'arpeggio'
                      ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="Мелодически (арпеджио)"
                  aria-label="Мелодически"
                >
                  <Activity className="w-4 h-4 shrink-0" />
                </button>
                <button
                  type="button"
                  onClick={() => onSettingsChange({ style: 'harmonic', twoNotesStyle: 'harmonic' })}
                  className={`${btnSymbolClass} ${
                    (settings.twoNotesStyle || settings.style) !== 'arpeggio'
                      ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="Гармонически (одновременно)"
                  aria-label="Гармонически"
                >
                  <Layers className="w-4 h-4 shrink-0" />
                </button>
              </div>
            )}

            {/* Diatonic / Chromatic Switcher */}
            <div className="flex items-center gap-0.5 p-0.5 bg-slate-950/70 rounded-lg border border-slate-800 shadow-inner">
              <button
                type="button"
                onClick={() => {
                  if (degreeType !== 'diatonic') {
                    onSettingsChange({ degreeType: 'diatonic' });
                    setTimeout(() => onNewTask(), 50);
                  }
                }}
                className={`${btnSymbolClass} ${
                  degreeType === 'diatonic'
                    ? 'bg-indigo-600 text-white shadow-sm font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Диатоника (7 ступеней)"
                aria-label="Диатоника"
              >
                <span className="font-bold text-sm leading-none">♮</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  if (degreeType !== 'chromatic') {
                    onSettingsChange({ degreeType: 'chromatic' });
                    setTimeout(() => onNewTask(), 50);
                  }
                }}
                className={`${btnSymbolClass} ${
                  degreeType === 'chromatic'
                    ? 'bg-indigo-600 text-white shadow-sm font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Хроматика (12 звуков)"
                aria-label="Хроматика"
              >
                <span className="font-bold text-[11px] leading-none">♯♭</span>
              </button>
            </div>
          </div>
        </div>

        {/* Clean Balance Slider: only in 2 notes mode */}
        {isTwoNotes && (
          <div className="flex items-center gap-2.5 pt-2 border-t border-slate-800/80 text-xs">
            <span className="text-[11px] text-slate-400 font-medium shrink-0">Баланс:</span>
            <span className="text-[10px] text-slate-500 shrink-0">◄ Нижний</span>
            <input
              type="range"
              min="-1"
              max="1"
              step="0.05"
              value={settings.twoNotesBalance ?? 0}
              onChange={(e) => onSettingsChange({ twoNotesBalance: parseFloat(e.target.value) })}
              className="flex-1 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
            <span className="text-[10px] text-slate-500 shrink-0">Верхний ►</span>
            {(settings.twoNotesBalance ?? 0) !== 0 && (
              <button
                type="button"
                onClick={() => onSettingsChange({ twoNotesBalance: 0 })}
                className="text-[10px] text-indigo-400 hover:text-indigo-300 font-medium px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 cursor-pointer"
                title="Сбросить 50/50"
              >
                50/50
              </button>
            )}
          </div>
        )}
      </div>

      {/* Answer Feedback Block */}
      <AnimatePresence>
        {isRevealed && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="p-3 rounded-xl border text-xs shadow-xs bg-emerald-950/40 border-emerald-500/40 text-emerald-100 flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <span className="font-bold mr-1.5">Верно!</span>
                <span className="font-bold text-white">{task.degreeNameRu}</span>
                {task.secondDegreeNameRu && <span className="text-emerald-300 ml-1">и {task.secondDegreeNameRu}</span>}
              </div>
            </div>

            <button
              type="button"
              onClick={() => onNewTask()}
              className="py-1 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition cursor-pointer shadow-xs active:scale-95 shrink-0"
            >
              <span>Дальше</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Academic 2-Notes Tonal Resolution Card (Apple HIG Inset Grouped) */}
      <AnimatePresence>
        {isTwoNotes && isRevealed && intervalResolution && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="w-full bg-slate-900/80 border border-slate-800 rounded-2xl p-3 sm:p-3.5 space-y-2.5 shadow-inner backdrop-blur-sm"
          >
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <div className="flex items-center gap-2 text-xs">
                <span className="font-medium text-slate-400">Интервал:</span>
                <span className="font-mono font-bold text-amber-300 capitalize text-sm">
                  {intervalResolution.inputInterval.nameRu}
                </span>
                <span className="text-[11px] font-mono text-slate-500">
                  ({intervalResolution.inputInterval.lowerVoice.degree}–{intervalResolution.inputInterval.upperVoice.degree})
                </span>
              </div>

              {intervalResolution.status === 'RESOLVED' && intervalResolution.resolvedInterval ? (
                <button
                  type="button"
                  onClick={handlePlayTwoNotesResolution}
                  className="px-3 py-1 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
                  title="Воспроизвести разрешение интервала"
                >
                  <Play className="w-3 h-3 fill-white" />
                  <span>Разрешить</span>
                </button>
              ) : (
                <span className="text-[11px] font-medium text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2.5 py-0.5 rounded-lg">
                  Ладовый устой
                </span>
              )}
            </div>

            {intervalResolution.status === 'RESOLVED' && intervalResolution.resolvedInterval ? (
              <div className="space-y-2 text-xs">
                {/* Voice Movements Grid */}
                <div className="grid grid-cols-2 gap-2">
                  {/* Upper voice */}
                  <div className="p-2 rounded-xl bg-slate-950/70 border border-slate-800/90 flex flex-col gap-1">
                    <span className="text-[10px] text-slate-400 font-medium">Верхний голос:</span>
                    <div className="flex items-center justify-between font-mono text-xs">
                      <span className="font-bold text-slate-200">
                        {intervalResolution.voiceLeading.upperVoiceMotion.fromDegree} <span className="text-[10px] text-slate-400">({intervalResolution.voiceLeading.upperVoiceMotion.fromNoteRu})</span>
                      </span>
                      <span className="text-slate-500 text-xs font-bold">
                        {intervalResolution.voiceLeading.upperVoiceMotion.direction === 'STAY'
                          ? '—'
                          : intervalResolution.voiceLeading.upperVoiceMotion.direction === 'UP'
                          ? '↑'
                          : '↓'}
                      </span>
                      <span className="font-bold text-emerald-400">
                        {intervalResolution.voiceLeading.upperVoiceMotion.toDegree} <span className="text-[10px] text-emerald-500/80">({intervalResolution.voiceLeading.upperVoiceMotion.toNoteRu})</span>
                      </span>
                    </div>
                  </div>

                  {/* Lower voice */}
                  <div className="p-2 rounded-xl bg-slate-950/70 border border-slate-800/90 flex flex-col gap-1">
                    <span className="text-[10px] text-slate-400 font-medium">Нижний голос:</span>
                    <div className="flex items-center justify-between font-mono text-xs">
                      <span className="font-bold text-slate-200">
                        {intervalResolution.voiceLeading.lowerVoiceMotion.fromDegree} <span className="text-[10px] text-slate-400">({intervalResolution.voiceLeading.lowerVoiceMotion.fromNoteRu})</span>
                      </span>
                      <span className="text-slate-500 text-xs font-bold">
                        {intervalResolution.voiceLeading.lowerVoiceMotion.direction === 'STAY'
                          ? '—'
                          : intervalResolution.voiceLeading.lowerVoiceMotion.direction === 'UP'
                          ? '↑'
                          : '↓'}
                      </span>
                      <span className="font-bold text-emerald-400">
                        {intervalResolution.voiceLeading.lowerVoiceMotion.toDegree} <span className="text-[10px] text-emerald-500/80">({intervalResolution.voiceLeading.lowerVoiceMotion.toNoteRu})</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Resolved Target & Voice Movement Rule */}
                <div className="flex flex-wrap items-center justify-between gap-1.5 pt-0.5 px-0.5 text-[11px]">
                  <span className="text-slate-300">
                    Разрешение в:{' '}
                    <strong className="text-indigo-300 font-semibold">
                      {intervalResolution.resolvedInterval.nameRu}
                    </strong>{' '}
                    <span className="font-mono text-slate-400">
                      ({intervalResolution.resolvedInterval.lowerVoice.degree}–{intervalResolution.resolvedInterval.upperVoice.degree})
                    </span>
                  </span>
                  <span className="text-slate-400 font-mono text-[10px]">
                    {intervalResolution.ruleSummaryRu}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 py-0.5 px-0.5">
                {intervalResolution.ruleSummaryRu}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Subtle indicator when 1st note is found in 2-notes mode */}
      {isTwoNotes && !isRevealed && isFirstNoteGuessed && (
        <div className="text-center text-xs text-indigo-300 font-medium py-1 animate-in fade-in">
          Первый звук найден ({task.degreeNameRu}). Найдите второй.
        </div>
      )}

      {/* 2. Direct Inline Piano Keyboard (Apple Human Interface Guidelines) */}
      <div className="w-full relative h-40 sm:h-44 bg-slate-950 rounded-2xl p-1 border border-slate-800/90 overflow-hidden select-none touch-none shadow-xs" style={{ touchAction: 'none' }}>
        {/* White Keys Row */}
        <div className="flex w-full h-full gap-0.5">
          {whiteKeys.map((keyItem) => {
            const normS = ((keyItem.relativeSemitone % 12) + 12) % 12;
            const isTarget = isRevealed && keyItem.isActive && (normS === targetOffset || (secondTargetOffset !== null && normS === secondTargetOffset));
            const isUserGuessed = !isRevealed && task.userAnswerIds?.includes(keyItem.degreeId);
            const isPhysicalPressed = pressedKeyMidi === keyItem.midi;

            // Apple Minimalist styling: Uniform straight baseline without scale deformation
            let keyStyle =
              'bg-white text-slate-800 border-x border-b border-slate-300/80 rounded-b-lg select-none transition-colors duration-100 cursor-pointer';

            if (!keyItem.isActive) {
              keyStyle =
                'bg-slate-200/40 opacity-20 border-slate-300/30 text-slate-400 cursor-default pointer-events-none rounded-b-lg';
            } else if (isPhysicalPressed) {
              keyStyle =
                'bg-slate-200 text-slate-900 border-x border-b border-slate-400 rounded-b-lg ring-2 ring-indigo-500/50';
            } else if (isTarget) {
              keyStyle =
                'bg-emerald-500 text-white border-x border-b border-emerald-400 font-bold rounded-b-lg z-10 shadow-xs';
            } else if (isUserGuessed) {
              keyStyle =
                'bg-indigo-600 text-white border-x border-b border-indigo-400 font-bold rounded-b-lg z-10 shadow-xs';
            } else if (keyItem.isTonic) {
              // Faint subtle blue illumination for 1st degree without active key shadows
              keyStyle =
                'bg-sky-50/50 text-slate-900 border-x border-b border-sky-400/60 ring-1 ring-sky-400/40 rounded-b-lg';
            }

            return (
              <button
                key={`white_${keyItem.relativeSemitone}`}
                type="button"
                onMouseDown={(e) => handleKeyTouch(keyItem, e)}
                onTouchStart={(e) => handleKeyTouch(keyItem, e)}
                disabled={!keyItem.isActive}
                className={`flex-1 h-full flex flex-col justify-end items-center pb-2 relative select-none ${keyStyle}`}
                title={`${keyItem.degreeLabel} (${keyItem.noteNameRu})`}
                aria-label={`${keyItem.degreeLabel} ${keyItem.noteNameRu}`}
              />
            );
          })}
        </div>

        {/* Black Keys Layer */}
        {blackKeys.map((keyItem) => {
          const normS = ((keyItem.relativeSemitone % 12) + 12) % 12;
          const isTarget = isRevealed && keyItem.isActive && (normS === targetOffset || (secondTargetOffset !== null && normS === secondTargetOffset));
          const isUserGuessed = !isRevealed && task.userAnswerIds?.includes(keyItem.degreeId);
          const isPhysicalPressed = pressedKeyMidi === keyItem.midi;

          // Apple Minimalist styling: Uniform straight baseline without scale deformation
          let keyStyle =
            'bg-neutral-900 text-neutral-200 border-x border-b border-neutral-700/80 rounded-b-md select-none transition-colors duration-100 cursor-pointer';

          if (!keyItem.isActive) {
            keyStyle =
              'bg-neutral-950 opacity-20 border-neutral-900 cursor-default pointer-events-none rounded-b-md';
          } else if (isPhysicalPressed) {
            keyStyle =
              'bg-neutral-800 text-white border-x border-b border-neutral-500 rounded-b-md ring-2 ring-indigo-500/50';
          } else if (isTarget) {
            keyStyle =
              'bg-emerald-600 text-white border-x border-b border-emerald-500 font-bold rounded-b-md z-30 shadow-xs';
          } else if (isUserGuessed) {
            keyStyle =
              'bg-indigo-600 text-white border-x border-b border-indigo-500 font-bold rounded-b-md z-30 shadow-xs';
          } else if (keyItem.isTonic) {
            // Faint subtle blue illumination for 1st degree
            keyStyle =
              'bg-neutral-900 text-sky-200 border-x border-b border-sky-400/60 ring-1 ring-sky-400/40 rounded-b-md';
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
              className={`absolute top-0.5 h-[62%] z-20 flex flex-col justify-end items-center pb-1.5 cursor-pointer select-none ${keyStyle}`}
              title={`${keyItem.degreeLabel} (${keyItem.noteNameRu})`}
              aria-label={`${keyItem.degreeLabel} ${keyItem.noteNameRu}`}
            />
          );
        })}
      </div>

      {/* 3. Studio Action Controls Dock (Integrated directly under piano) */}
      <div className="grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={() => {
            onPlayCadence(task.tonicNoteName, task.keyScaleMode);
          }}
          className="py-2.5 px-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer active:scale-95 shadow-xs"
        >
          <Music className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
          <span>Каданс</span>
        </button>

        <button
          type="button"
          onClick={onPlayTaskNote}
          className="py-2.5 px-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer active:scale-95 shadow-xs"
        >
          <Volume2 className={`w-3.5 h-3.5 shrink-0 ${isPlaying ? 'animate-bounce' : ''}`} />
          <span>{isTwoNotes ? 'Повтор 2 звуков' : 'Повтор'}</span>
        </button>

        {isRevealed ? (
          <button
            type="button"
            onClick={() => onNewTask()}
            className="py-2.5 px-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs active:scale-95"
          >
            <span>Дальше</span>
            <ArrowRight className="w-3.5 h-3.5 shrink-0" />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onNewTask()}
            className="py-2.5 px-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer active:scale-95 shadow-xs"
          >
            <RotateCw className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>Новая</span>
          </button>
        )}
      </div>
    </div>
  );
};
