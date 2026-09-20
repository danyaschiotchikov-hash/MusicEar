import React, { useState, useEffect } from 'react';
import { PlaybackSettings } from '../types';
import {
  RealizedProgression,
  ProgressionCategory,
} from '../audio/harmonicProgressions';
import {
  Volume2,
  RefreshCw,
  Layers,
  Sparkles,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Music,
  RotateCcw,
  Delete,
  BookOpen,
} from 'lucide-react';

interface ProgressionModeCardProps {
  progression: RealizedProgression | null;
  settings: PlaybackSettings;
  isPlaying: boolean;
  activePlayingMidis: number[];
  activeStepIndex: number;
  onPlayProgression: () => void;
  onPlayStep: (stepIdx: number) => void;
  onPlayVoice?: (voiceIndex: 0 | 1 | 2 | 3) => void;
  onPlayStepVoice?: (stepIndex: number, voiceIndex: 0 | 1 | 2 | 3) => void;
  onNewTask: () => void;
  onSettingsChange?: (updated: Partial<PlaybackSettings>) => void;
  onPlayCadence?: (tonic: string, mode: 'major' | 'minor') => void;
  onReveal?: () => void;
  onOpenProgressionCatalog?: () => void;
}

export function convertSymbolToRomanDegree(symbol: string): string {
  let s = symbol.trim();
  // Strip root 5/3 or 5
  if (s.endsWith('5/3')) {
    s = s.slice(0, -3);
  } else if (
    s === 'T5' || s === 't5' || s === 'S5' || s === 's5' || s === 'D5' || s === 'd5' ||
    s === 'I5' || s === 'i5' || s === 'IV5' || s === 'iv5' || s === 'V5' || s === 'v5' ||
    s === 'II5' || s === 'ii5' || s === 'VII5' || s === 'vii5' || s === 'VI5' || s === 'vi5' || s === 'III5' || s === 'iii5'
  ) {
    s = s.slice(0, -1);
  }

  // K6/4 / k6/4 -> I6/4 (cadential 6/4 in Roman degree analysis is built on step I)
  if (s.toUpperCase().startsWith('K6/4') || s.toUpperCase().startsWith('K64')) {
    return 'I6/4';
  }

  // T / t -> I
  if (s === 'T' || s === 't') return 'I';
  if (s.startsWith('T') || s.startsWith('t')) return 'I' + s.slice(1);

  // S / s -> IV
  if (s === 'S' || s === 's') return 'IV';
  if (s.startsWith('s#IV')) return '#IV';
  if (s.startsWith('S') || s.startsWith('s')) return 'IV' + s.slice(1);

  // D / d -> V
  if (s === 'D' || s === 'd') return 'V';
  if (s.startsWith('D') || s.startsWith('d')) return 'V' + s.slice(1);

  if (s === 'n6') return '♭II6';

  return s;
}

export function renderAnalyticalSymbol(symbol: string): React.ReactNode {
  let clean = symbol.trim();

  // Clean root position indicators (5/3 and 5) -> simple T, t, S, s, D, d, I, IV, V
  if (clean.endsWith('5/3')) {
    clean = clean.slice(0, -3);
  } else if (
    clean === 'T5' || clean === 't5' || clean === 'S5' || clean === 's5' || clean === 'D5' || clean === 'd5' ||
    clean === 'I5' || clean === 'i5' || clean === 'IV5' || clean === 'iv5' || clean === 'V5' || clean === 'v5' ||
    clean === 'II5' || clean === 'ii5' || clean === 'VII5' || clean === 'vii5' || clean === 'VI5' || clean === 'vi5' || clean === 'III5' || clean === 'iii5'
  ) {
    clean = clean.slice(0, -1);
  }

  if (clean.includes('6/4')) {
    const base = clean.replace('6/4', '');
    return (
      <span className="inline-flex items-center font-mono font-extrabold">
        <span>{base}</span>
        <span className="inline-flex flex-col text-[10px] leading-[0.85] font-extrabold mx-0.5 align-middle text-indigo-300">
          <span>6</span>
          <span>4</span>
        </span>
      </span>
    );
  }

  if (clean.includes('6/5')) {
    const base = clean.replace('6/5', '');
    return (
      <span className="inline-flex items-center font-mono font-extrabold">
        <span>{base}</span>
        <span className="inline-flex flex-col text-[10px] leading-[0.85] font-extrabold mx-0.5 align-middle text-indigo-300">
          <span>6</span>
          <span>5</span>
        </span>
      </span>
    );
  }

  if (clean.includes('4/3')) {
    const base = clean.replace('4/3', '');
    return (
      <span className="inline-flex items-center font-mono font-extrabold">
        <span>{base}</span>
        <span className="inline-flex flex-col text-[10px] leading-[0.85] font-extrabold mx-0.5 align-middle text-indigo-300">
          <span>4</span>
          <span>3</span>
        </span>
      </span>
    );
  }

  if (clean.endsWith('6')) {
    const base = clean.slice(0, -1);
    return (
      <span className="inline-flex items-baseline font-mono font-extrabold">
        <span>{base}</span>
        <sub className="text-[11px] font-extrabold ml-0.5 text-indigo-300">6</sub>
      </span>
    );
  }

  if (clean.endsWith('7')) {
    const base = clean.slice(0, -1);
    return (
      <span className="inline-flex items-baseline font-mono font-extrabold">
        <span>{base}</span>
        <sub className="text-[11px] font-extrabold ml-0.5 text-indigo-300">7</sub>
      </span>
    );
  }

  if (clean.endsWith('2')) {
    const base = clean.slice(0, -1);
    return (
      <span className="inline-flex items-baseline font-mono font-extrabold">
        <span>{base}</span>
        <sub className="text-[11px] font-extrabold ml-0.5 text-indigo-300">2</sub>
      </span>
    );
  }

  if (clean.endsWith('9')) {
    const base = clean.slice(0, -1);
    return (
      <span className="inline-flex items-baseline font-mono font-extrabold">
        <span>{base}</span>
        <sub className="text-[11px] font-extrabold ml-0.5 text-indigo-300">9</sub>
      </span>
    );
  }

  return <span className="font-mono font-extrabold">{clean}</span>;
}

/**
 * Computes letter notation (e.g. "C", "G/D", "Dm7/F") for a progression step
 */
export function getStepLetterChordSymbol(
  stepSymbol: string,
  bassNoteWithOctave: string,
  tonicName: string,
  scaleMode: 'major' | 'minor'
): string {
  const bassNote = (bassNoteWithOctave || '').replace(/\d+/g, '').trim();
  const cleanTonic = (tonicName || 'C').replace(/\d+/g, '').trim();
  const isMinor = scaleMode === 'minor';

  const notePitches = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const noteFlats = ['C', 'D♭', 'D', 'E♭', 'E', 'F', 'G♭', 'G', 'A♭', 'A', 'B♭', 'B'];

  const getTransposedNote = (baseNote: string, intervalSemitones: number): string => {
    const isFlatKey = baseNote.includes('♭') || baseNote === 'F' || baseNote === 'B♭' || baseNote === 'E♭' || baseNote === 'A♭';
    let baseIdx = notePitches.indexOf(baseNote);
    if (baseIdx === -1) baseIdx = noteFlats.indexOf(baseNote);
    if (baseIdx === -1) baseIdx = 0;
    const targetIdx = (baseIdx + intervalSemitones) % 12;
    return isFlatKey ? noteFlats[targetIdx] : notePitches[targetIdx];
  };

  let rootNote = cleanTonic;
  let chordQuality = '';
  let hasInversion = false;

  const s = stepSymbol;

  if (s.startsWith('T') || s.startsWith('t')) {
    rootNote = cleanTonic;
    chordQuality = isMinor ? 'm' : '';
    if (s.includes('6/4') || s.includes('6')) hasInversion = true;
  } else if (s.startsWith('K6/4') || s.startsWith('k6/4') || s === 'K64' || s === 'k64') {
    rootNote = cleanTonic;
    chordQuality = isMinor ? 'm' : '';
    hasInversion = true;
  } else if (s.startsWith('S') || s.startsWith('s')) {
    rootNote = getTransposedNote(cleanTonic, 5);
    chordQuality = isMinor ? 'm' : '';
    if (s.includes('6/4') || s.includes('6')) hasInversion = true;
  } else if (s.startsWith('D') || s.startsWith('d')) {
    rootNote = getTransposedNote(cleanTonic, 7);
    if (s.includes('7') || s.includes('6/5') || s.includes('4/3') || s.includes('2')) {
      chordQuality = '7';
      if (s.includes('6/5') || s.includes('4/3') || s.includes('2')) hasInversion = true;
    } else if (s.includes('9')) {
      chordQuality = '9';
    } else {
      chordQuality = '';
      if (s.includes('6/4') || s.includes('6')) hasInversion = true;
    }
  } else if (s.includes('II') || s.includes('ii')) {
    rootNote = getTransposedNote(cleanTonic, 2);
    if (s.includes('7') || s.includes('6/5') || s.includes('4/3') || s.includes('2')) {
      chordQuality = isMinor ? 'ø7' : 'm7';
      if (s.includes('6/5') || s.includes('4/3') || s.includes('2')) hasInversion = true;
    } else {
      chordQuality = isMinor ? 'dim' : 'm';
      if (s.includes('6')) hasInversion = true;
    }
  } else if (s.includes('VII') || s.includes('vii')) {
    rootNote = getTransposedNote(cleanTonic, 11);
    if (s.includes('7') || s.includes('6/5') || s.includes('4/3') || s.includes('2')) {
      chordQuality = isMinor ? 'dim7' : 'ø7';
      if (s.includes('6/5') || s.includes('4/3') || s.includes('2')) hasInversion = true;
    } else {
      chordQuality = 'dim';
      if (s.includes('6')) hasInversion = true;
    }
  } else if (s.includes('VI') || s.includes('vi')) {
    rootNote = getTransposedNote(cleanTonic, isMinor ? 8 : 9);
    chordQuality = isMinor ? '' : 'm';
  } else if (s.includes('III') || s.includes('iii')) {
    rootNote = getTransposedNote(cleanTonic, isMinor ? 3 : 4);
    chordQuality = isMinor ? '' : 'm';
  }

  const cleanBass = bassNote.replace(/[0-9]/g, '');
  const isSlash = hasInversion || (cleanBass && cleanBass !== rootNote);

  if (isSlash && cleanBass) {
    return `${rootNote}${chordQuality}/${cleanBass}`;
  }
  return `${rootNote}${chordQuality}`;
}

const extractPureRomanDegree = (str: string): string => {
  if (!str) return '';
  const match = str.match(/([#♭b]?[IVXivx]+)/);
  return match ? match[1].toUpperCase() : str.replace(/[^IVXivx#♭b+-]/g, '').trim();
};

export const ProgressionModeCard: React.FC<ProgressionModeCardProps> = ({
  progression,
  settings,
  isPlaying,
  activePlayingMidis,
  activeStepIndex,
  onPlayStep,
  onPlayVoice,
  onPlayStepVoice,
  onNewTask,
  onSettingsChange,
  onPlayCadence,
  onReveal,
  onOpenProgressionCatalog,
}) => {
  const [localIsRevealed, setLocalIsRevealed] = useState(false);
  const [userStepSymbols, setUserStepSymbols] = useState<string[]>([]);
  const [activeStepSlot, setActiveStepSlot] = useState<number>(0);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);
  const [isCorrectGuess, setIsCorrectGuess] = useState<boolean | null>(null);
  const [previewedStepIndex, setPreviewedStepIndex] = useState<number | null>(null);

  useEffect(() => {
    if (progression) {
      setUserStepSymbols(new Array(progression.steps.length).fill(''));
      setActiveStepSlot(0);
      setFeedbackError(null);
      setIsCorrectGuess(null);
      setLocalIsRevealed(false);
      setPreviewedStepIndex(null);
    }
  }, [progression]);

  if (!progression) {
    return (
      <div className="w-full p-8 text-center bg-slate-900/40 rounded-2xl border border-slate-800">
        <p className="text-slate-400 text-sm">Загрузка гармонического оборота...</p>
      </div>
    );
  }

  const isRevealed = Boolean(progression.revealed || localIsRevealed);
  const currentCategory = settings.progressionCategory ?? 'all';
  const viewMode = settings.progressionViewMode ?? 'cards';
  const currentKey = settings.progressionRootNote ?? settings.tonalRootNote ?? 'C';
  const currentNotation = settings.progressionNotation ?? 'roman';

  const categories: { id: ProgressionCategory | 'all'; label: string }[] = [
    { id: 'all', label: 'Все обороты' },
    { id: 'passing', label: 'Проходящие' },
    { id: 'auxiliary', label: 'Вспомогательные' },
    { id: 'phrygian', label: 'Фригийские' },
    { id: 'cadential', label: 'Кадансовые' },
  ];

  const keyOptions = [
    { value: 'C', label: 'C (До)' },
    { value: 'G', label: 'G (Соль)' },
    { value: 'D', label: 'D (Ре)' },
    { value: 'A', label: 'A (Ля)' },
    { value: 'E', label: 'E (Ми)' },
    { value: 'F', label: 'F (Фа)' },
    { value: 'Bb', label: 'B♭ (Си-бемоль)' },
    { value: 'Es', label: 'E♭ (Ми-бемоль)' },
    { value: 'random', label: '🎲 Случайно' },
  ];

  const handleCategorySelect = (catId: ProgressionCategory | 'all') => {
    onSettingsChange?.({ progressionCategory: catId });
    onNewTask();
  };

  const handleToggleViewMode = (mode: 'cards' | 'test') => {
    onSettingsChange?.({ progressionViewMode: mode });
  };

  const handleKeyChange = (newKey: string) => {
    onSettingsChange?.({ progressionRootNote: newKey });
    onNewTask();
  };

  const handleToggleNotation = (notation: 'analytical' | 'roman' | 'letter') => {
    onSettingsChange?.({ progressionNotation: notation });
  };

  const handleTriggerReveal = () => {
    setLocalIsRevealed(true);
    onReveal?.();
  };

  const handleNextTask = () => {
    setLocalIsRevealed(false);
    setUserStepSymbols(new Array(progression.steps.length).fill(''));
    setActiveStepSlot(0);
    setFeedbackError(null);
    setIsCorrectGuess(null);
    setPreviewedStepIndex(null);
    onNewTask();
  };

  const isMinorKey = progression.scaleMode === 'minor';
  const chordPalette = isMinorKey
    ? [
        {
          group: currentNotation === 'roman' ? 'Тоника (I)' : 'Тоника (t)',
          color: 'bg-cyan-500/15 border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/25',
          chords: currentNotation === 'roman' ? ['I', 'I6', 'I6/4'] : ['t', 't6', 't6/4'],
        },
        {
          group: currentNotation === 'roman' ? 'Субдоминанта (IV)' : 'Субдоминанта (s)',
          color: 'bg-amber-500/15 border-amber-500/30 text-amber-300 hover:bg-amber-500/25',
          chords: currentNotation === 'roman' ? ['IV', 'IV6', 'IV6/4', 'II6/5', 'n6', '#IV'] : ['s', 's6', 's6/4', 'ii6/5', 'n6', 's#IV'],
        },
        {
          group: currentNotation === 'roman' ? 'Доминанта & Каданс (V)' : 'Доминанта & Каданс (d / D)',
          color: 'bg-rose-500/15 border-rose-500/30 text-rose-300 hover:bg-rose-500/25',
          chords: currentNotation === 'roman' ? ['V', 'V6', 'V6/4', 'V7', 'v6', 'I6/4', 'VII6'] : ['D', 'D6', 'D6/4', 'D7', 'd6', 'k6/4', 'vii6'],
        },
      ]
    : [
        {
          group: currentNotation === 'roman' ? 'Тоника (I)' : 'Тоника (T)',
          color: 'bg-cyan-500/15 border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/25',
          chords: currentNotation === 'roman' ? ['I', 'I6', 'I6/4'] : ['T', 'T6', 'T6/4'],
        },
        {
          group: currentNotation === 'roman' ? 'Субдоминанта (IV)' : 'Субдоминанта (S)',
          color: 'bg-amber-500/15 border-amber-500/30 text-amber-300 hover:bg-amber-500/25',
          chords: currentNotation === 'roman' ? ['IV', 'IV6', 'IV6/4', 'II6/5'] : ['S', 'S6', 'S6/4', 'II6/5'],
        },
        {
          group: currentNotation === 'roman' ? 'Доминанта & Каданс (V)' : 'Доминанта & Каданс (D)',
          color: 'bg-rose-500/15 border-rose-500/30 text-rose-300 hover:bg-rose-500/25',
          chords: currentNotation === 'roman' ? ['V', 'V6', 'V6/4', 'V7', 'I6/4', 'VII6', 'VII7'] : ['D', 'D6', 'D6/4', 'D7', 'K6/4', 'VII6', 'VII7'],
        },
      ];

  const handlePickChordForStep = (symbol: string) => {
    const updated = [...userStepSymbols];
    updated[activeStepSlot] = symbol;
    setUserStepSymbols(updated);
    setFeedbackError(null);

    if (activeStepSlot < progression.steps.length - 1) {
      setActiveStepSlot(activeStepSlot + 1);
    }
  };

  const handleClearCurrentSlot = () => {
    const updated = [...userStepSymbols];
    updated[activeStepSlot] = '';
    setUserStepSymbols(updated);
    setFeedbackError(null);
  };

  const handleResetAllSlots = () => {
    setUserStepSymbols(new Array(progression.steps.length).fill(''));
    setActiveStepSlot(0);
    setFeedbackError(null);
  };

  const normalizeStepSymbol = (sym: string): string => {
    if (!sym) return '';
    let s = sym.trim();
    // Strip 5/3 and root 5
    if (s.endsWith('5/3')) s = s.slice(0, -3);
    else if (
      s === 'T5' || s === 't5' || s === 'S5' || s === 's5' || s === 'D5' || s === 'd5' ||
      s === 'I5' || s === 'i5' || s === 'IV5' || s === 'iv5' || s === 'V5' || s === 'v5' ||
      s === 'II5' || s === 'ii5' || s === 'VII5' || s === 'vii5' || s === 'VI5' || s === 'vi5' || s === 'III5' || s === 'iii5'
    ) {
      s = s.slice(0, -1);
    }

    // Map functional to Roman standard for comparison
    if (s.toUpperCase().startsWith('K6/4') || s.toUpperCase().startsWith('K64')) return 'I6/4';
    if (s.toUpperCase() === 'T' || s.toUpperCase() === 'I') return 'I';
    if (s.toUpperCase() === 'T6' || s.toUpperCase() === 'I6') return 'I6';
    if (s.toUpperCase() === 'T6/4' || s.toUpperCase() === 'I6/4') return 'I6/4';
    if (s.toUpperCase() === 'S' || s.toUpperCase() === 'IV') return 'IV';
    if (s.toUpperCase() === 'S6' || s.toUpperCase() === 'IV6') return 'IV6';
    if (s.toUpperCase() === 'S6/4' || s.toUpperCase() === 'IV6/4') return 'IV6/4';
    if (s.toUpperCase() === 'D' || s.toUpperCase() === 'V') return 'V';
    if (s.toUpperCase() === 'D6' || s.toUpperCase() === 'V6') return 'V6';
    if (s.toUpperCase() === 'D6/4' || s.toUpperCase() === 'V6/4') return 'V6/4';
    if (s.toUpperCase() === 'D7' || s.toUpperCase() === 'V7') return 'V7';
    if (s.toUpperCase() === 'D6/5' || s.toUpperCase() === 'V6/5') return 'V6/5';
    if (s.toUpperCase() === 'D4/3' || s.toUpperCase() === 'V4/3') return 'V4/3';
    if (s.toUpperCase() === 'D2' || s.toUpperCase() === 'V2') return 'V2';
    if (s.toUpperCase() === 'D9' || s.toUpperCase() === 'V9') return 'V9';
    if (s === 's#IV' || s === '#IV' || s === 'IV#') return '#IV';

    return s.toUpperCase();
  };

  const handleCheckUserProgression = () => {
    let isAllCorrect = true;
    const errors: number[] = [];

    progression.steps.forEach((step, idx) => {
      const userSym = userStepSymbols[idx];
      const normUser = normalizeStepSymbol(userSym);
      const normTarget = normalizeStepSymbol(step.symbol);

      if (normUser !== normTarget) {
        isAllCorrect = false;
        errors.push(idx + 1);
      }
    });

    if (isAllCorrect) {
      setIsCorrectGuess(true);
      setFeedbackError(null);
      handleTriggerReveal();
    } else {
      setIsCorrectGuess(false);
      setFeedbackError(`Ошибка в ${errors.length === 1 ? 'шаге' : 'шагах'} ${errors.join(', ')}. Попробуйте исправить или нажмите "Показать ответ".`);
    }
  };

  const currentTemplate = progression.template;

  const currentStepMidis =
    previewedStepIndex !== null && progression.steps[previewedStepIndex]
      ? progression.steps[previewedStepIndex].midisSATB
      : activePlayingMidis;

  const renderStepChordLabel = (step: typeof progression.steps[0]) => {
    if (currentNotation === 'letter') {
      return (
        <span className="font-mono font-black text-indigo-300">
          {getStepLetterChordSymbol(step.symbol, step.noteNamesSATB[0], progression.tonicNoteName, progression.scaleMode)}
        </span>
      );
    }
    if (currentNotation === 'roman') {
      const romanSym = convertSymbolToRomanDegree(step.symbol);
      return renderAnalyticalSymbol(romanSym);
    }
    return renderAnalyticalSymbol(step.symbol);
  };

  return (
    <div className="w-full flex flex-col gap-3">
      {/* Main Container Card */}
      <div className="w-full bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-3 sm:p-4 shadow-lg flex flex-col gap-3">
        
        {/* Top Control Bar: Category Tabs & View Mode */}
        {!isRevealed && (
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/70 pb-2.5">
            {/* Category Tabs */}
            <div className="flex flex-wrap items-center gap-1.5">
              {categories.map((cat) => {
                const isActive = currentCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleCategorySelect(cat.id)}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition cursor-pointer ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-950/80 border border-slate-800 rounded-lg p-0.5 text-xs font-medium">
              <button
                type="button"
                onClick={() => handleToggleViewMode('cards')}
                className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                  viewMode === 'cards'
                    ? 'bg-slate-800 text-white font-bold shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                🎴 Устный
              </button>
              <button
                type="button"
                onClick={() => handleToggleViewMode('test')}
                className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                  viewMode === 'test'
                    ? 'bg-slate-800 text-white font-bold shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                🧩 По шагам
              </button>
            </div>
          </div>
        )}

        {/* Tonality Key Selector, Catalog Button & Tuning Button in ONE Single Row */}
        <div className="flex items-center justify-between gap-1.5 sm:gap-2 bg-slate-950/70 border border-slate-800/80 rounded-xl p-1.5 sm:p-2 w-full">
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
            {/* Key Selector without "Тональность:" word */}
            <select
              value={currentKey}
              onChange={(e) => handleKeyChange(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-indigo-300 text-xs font-bold font-mono px-2 py-1 rounded-lg focus:outline-none focus:border-indigo-500 cursor-pointer shrink-0"
              title="Выбор опорной тоники"
            >
              {keyOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            {/* Tuning Cadence */}
            {onPlayCadence && (
              <button
                type="button"
                onClick={() => onPlayCadence(currentKey === 'random' ? 'C' : currentKey, progression.scaleMode)}
                className="flex items-center gap-1 px-2 sm:px-2.5 py-1 bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-500/40 text-emerald-300 rounded-lg text-[11px] font-semibold transition cursor-pointer active:scale-95 shadow-xs whitespace-nowrap shrink-0"
                title="Слушать кадансовую настройку в текущей тональности"
              >
                <Music className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Настройка</span>
              </button>
            )}
          </div>

          {/* Catalog of Progressions */}
          {onOpenProgressionCatalog && (
            <button
              type="button"
              onClick={onOpenProgressionCatalog}
              className="flex items-center gap-1 px-2 sm:px-2.5 py-1 bg-purple-950/50 hover:bg-purple-900/70 border border-purple-500/40 text-purple-200 rounded-lg text-[11px] font-semibold transition cursor-pointer active:scale-95 shadow-xs whitespace-nowrap shrink-0"
              title="Каталог классических оборотов от разных ступеней"
            >
              <BookOpen className="w-3.5 h-3.5 text-purple-400 shrink-0" />
              <span className="hidden min-[420px]:inline">Обороты по ступеням</span>
              <span className="inline min-[420px]:hidden">Обороты</span>
            </button>
          )}
        </div>

        {/* Progression Step Playback Preview Bar */}
        {!isRevealed && (
          <div className="flex flex-col gap-1.5 sm:gap-2">
            <div className="flex items-center justify-between text-xs text-slate-400 px-1">
              <span className="font-semibold flex items-center gap-1 text-slate-300">
                <Layers className="w-3.5 h-3.5 text-indigo-400" />
                <span>Шаги оборота ({progression.steps.length}):</span>
              </span>
            </div>

            <div className="flex items-stretch gap-1 sm:gap-2 w-full">
              {progression.steps.map((_step, idx) => {
                const isCurrentPlaying = activeStepIndex === idx;
                const isSelectedPreview = previewedStepIndex === idx;

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setPreviewedStepIndex(idx);
                      onPlayStep(idx);
                    }}
                    className={`flex-1 min-w-0 p-1.5 sm:p-2.5 rounded-xl border flex flex-col items-center justify-center gap-0.5 sm:gap-1 transition cursor-pointer text-center relative ${
                      isCurrentPlaying
                        ? 'bg-indigo-600 border-indigo-400 text-white ring-2 ring-indigo-400/80 shadow-lg scale-102'
                        : isSelectedPreview
                        ? 'bg-indigo-950/80 border-indigo-500 text-indigo-200 ring-1 ring-indigo-500'
                        : 'bg-slate-950/80 border-slate-800 text-slate-200 hover:bg-slate-800/80'
                    }`}
                  >
                    <span className="text-[9px] sm:text-[10px] text-slate-400 font-mono truncate w-full">
                      Шаг {idx + 1}
                    </span>
                    <span className="font-mono font-extrabold text-xs sm:text-sm md:text-base truncate w-full">
                      {isRevealed ? renderStepChordLabel(_step) : `Акк. ${idx + 1}`}
                    </span>
                    {isCurrentPlaying && (
                      <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5 sm:h-3 sm:w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 sm:h-3 sm:w-3 bg-indigo-500"></span>
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Global Isolated Voice Listening Bar (Буквы САДТ в одну строчку) */}
        {onPlayVoice && (
          <div className="flex items-center justify-between gap-2 bg-slate-950/80 border border-slate-800/80 rounded-xl px-3 py-2">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5 shrink-0">
              <Volume2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span>Партии:</span>
            </span>

            <div className="flex items-center gap-1.5 sm:gap-2 flex-1 justify-end max-w-xs">
              <button
                type="button"
                onClick={() => onPlayVoice(3)}
                disabled={isPlaying}
                className="flex-1 py-1.5 px-2.5 rounded-lg bg-purple-950/70 hover:bg-purple-900/90 border border-purple-500/40 text-purple-200 text-xs font-bold flex items-center justify-center transition cursor-pointer active:scale-95 disabled:opacity-50 shadow-xs"
                title="Сопрано (верхний голос)"
              >
                <span>С</span>
              </button>
              <button
                type="button"
                onClick={() => onPlayVoice(2)}
                disabled={isPlaying}
                className="flex-1 py-1.5 px-2.5 rounded-lg bg-amber-950/70 hover:bg-amber-900/90 border border-amber-500/40 text-amber-200 text-xs font-bold flex items-center justify-center transition cursor-pointer active:scale-95 disabled:opacity-50 shadow-xs"
                title="Альт"
              >
                <span>А</span>
              </button>
              <button
                type="button"
                onClick={() => onPlayVoice(1)}
                disabled={isPlaying}
                className="flex-1 py-1.5 px-2.5 rounded-lg bg-blue-950/70 hover:bg-blue-900/90 border border-blue-500/40 text-blue-200 text-xs font-bold flex items-center justify-center transition cursor-pointer active:scale-95 disabled:opacity-50 shadow-xs"
                title="Тенор"
              >
                <span>Т</span>
              </button>
              <button
                type="button"
                onClick={() => onPlayVoice(0)}
                disabled={isPlaying}
                className="flex-1 py-1.5 px-2.5 rounded-lg bg-emerald-950/70 hover:bg-emerald-900/90 border border-emerald-500/40 text-emerald-200 text-xs font-bold flex items-center justify-center transition cursor-pointer active:scale-95 disabled:opacity-50 shadow-xs"
                title="Бас (нижний голос)"
              >
                <span>Б</span>
              </button>
            </div>
          </div>
        )}

        {/* View Mode 1: Oral View */}
        {viewMode === 'cards' && !isRevealed && (
          <div className="w-full bg-slate-950/80 border border-slate-800/80 rounded-xl p-5 text-center flex flex-col items-center justify-center gap-3 animate-in fade-in">
            <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-400">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-200">
                Определите тип оборота и логику голосоведения на слух
              </h4>
              <p className="text-xs text-slate-400 max-w-md mt-1">
                Вслушайтесь в движение баса и сопрано, определите обозначения аккордов.
              </p>
            </div>
          </div>
        )}

        {/* View Mode 2: Step-by-Step Chord Assembly Builder */}
        {viewMode === 'test' && !isRevealed && (
          <div className="w-full bg-slate-950/90 border border-slate-800/90 rounded-xl p-4 flex flex-col gap-3.5 animate-in fade-in">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-indigo-400" />
                <span>Наберите гармонический оборот по шагам ({progression.steps.length} аккорда):</span>
              </span>
              <button
                type="button"
                onClick={handleResetAllSlots}
                className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1 transition"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Сбросить</span>
              </button>
            </div>

            {/* Step Slots Grid */}
            <div className="w-full overflow-x-auto pb-1">
              <div
                className="grid gap-2.5 min-w-full"
                style={{
                  gridTemplateColumns: `repeat(${progression.steps.length}, minmax(110px, 1fr))`,
                }}
              >
                {progression.steps.map((_step, idx) => {
                  const filledValue = userStepSymbols[idx];
                  const isActive = activeStepSlot === idx;

                  return (
                    <div key={idx} className="flex flex-col gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setPreviewedStepIndex(idx);
                          onPlayStep(idx);
                        }}
                        className="px-2 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:border-indigo-500/50 text-slate-400 hover:text-indigo-300 text-[11px] font-mono font-bold flex items-center justify-center gap-1 transition cursor-pointer"
                      >
                        <Volume2 className="w-3 h-3 text-indigo-400 shrink-0" />
                        <span>Шаг {idx + 1}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setActiveStepSlot(idx)}
                        className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1 transition cursor-pointer text-center relative ${
                          isActive
                            ? 'bg-indigo-950/90 border-indigo-400 text-white ring-2 ring-indigo-500 shadow-md'
                            : filledValue
                            ? 'bg-slate-900 border-indigo-500/50 text-indigo-200'
                            : 'bg-slate-950/80 border-slate-800 text-slate-500 hover:border-slate-700'
                        }`}
                      >
                        <span className="font-mono font-extrabold text-base sm:text-lg">
                          {filledValue ? renderAnalyticalSymbol(filledValue) : '?'}
                        </span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {feedbackError && (
              <div className="p-2.5 rounded-lg bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs font-medium flex items-center gap-2">
                <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{feedbackError}</span>
              </div>
            )}

            {/* Chord Palette by Function */}
            <div className="space-y-2 pt-1">
              <span className="text-[11px] font-bold text-slate-400">
                Выберите аккорд для Шага {activeStepSlot + 1}:
              </span>
              <div className="flex flex-col gap-2">
                {chordPalette.map((grp) => (
                  <div key={grp.group} className="flex flex-col sm:flex-row sm:items-center gap-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider min-w-[120px]">
                      {grp.group}
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {grp.chords.map((chordSym) => (
                        <button
                          key={chordSym}
                          type="button"
                          onClick={() => handlePickChordForStep(chordSym)}
                          className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-bold transition cursor-pointer active:scale-95 ${grp.color}`}
                        >
                          {renderAnalyticalSymbol(chordSym)}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Actions: Backspace & Verify */}
            <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={handleClearCurrentSlot}
                disabled={!userStepSymbols[activeStepSlot]}
                className="px-3 py-2 rounded-xl border border-slate-800 bg-slate-900 text-slate-300 hover:text-white disabled:opacity-40 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
              >
                <Delete className="w-3.5 h-3.5" />
                <span>Стереть шаг</span>
              </button>

              <button
                type="button"
                onClick={handleCheckUserProgression}
                disabled={userStepSymbols.some((s) => !s)}
                className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition active:scale-98 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Проверить оборот</span>
              </button>
            </div>
          </div>
        )}

        {/* Revealed Answer & SATB Scale Degree Voice Leading Breakdown */}
        {isRevealed && (
          <div className="w-full bg-slate-950/90 border border-slate-800 rounded-xl p-3.5 sm:p-4 flex flex-col gap-3.5 animate-in fade-in zoom-in-95 duration-150 shadow-xl">
            {/* Feedback header if Test mode */}
            {isCorrectGuess !== null && (
              <div
                className={`p-3 rounded-xl border flex items-center gap-2.5 text-xs font-bold ${
                  isCorrectGuess
                    ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200'
                    : 'bg-rose-950/80 border-rose-500 text-rose-200'
                }`}
              >
                {isCorrectGuess ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    <span>Верно! Вы точно собрали гармонический оборот по шагам!</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
                    <span>
                      Правильный оборот: {currentTemplate.categoryNameRu}
                    </span>
                  </>
                )}
              </div>
            )}

            {/* Progression Title with Formula Cloud Placed on the Left */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-slate-800 pb-3">
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                  {currentTemplate.categoryNameRu}
                </span>
                
                {/* Cloud with Scheme on the Left */}
                <div className="flex items-center gap-2">
                  <div className="font-mono font-black text-sm sm:text-base px-3 py-1 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 flex items-center gap-1.5 shadow-xs w-fit">
                    {progression.steps.map((s, idx) => (
                      <React.Fragment key={idx}>
                        {idx > 0 && <span className="text-slate-500 text-xs">—</span>}
                        {renderStepChordLabel(s)}
                      </React.Fragment>
                    ))}
                  </div>

                  <span className="text-xs font-mono text-slate-400 bg-slate-900 border border-slate-700 px-2 py-1 rounded-lg">
                    {progression.keyNameRu}
                  </span>
                </div>
              </div>
            </div>

            {/* Unified Clean Choral Voice Leading Table (САТБ) - Flattened & Simplified */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
              <div className="flex items-center justify-between px-3 py-2 bg-slate-950/80 border-b border-slate-800">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Таблица голосоведения (САТБ)</span>
                </span>
              </div>

              {/* Table Grid */}
              <div className="w-full">
                {/* Header Row: Chords by Step */}
                <div
                  className="grid border-b border-slate-800/80 bg-slate-950/50"
                  style={{
                    gridTemplateColumns: `64px repeat(${progression.steps.length}, 1fr)`,
                  }}
                >
                  <div className="p-2 text-[10px] font-mono font-bold text-slate-500 uppercase flex items-center justify-center border-r border-slate-800/80">
                    Партия
                  </div>
                  {progression.steps.map((step, stepIdx) => {
                    const isCurrentPlaying = activeStepIndex === stepIdx && isPlaying;
                    const isSelectedPreview = previewedStepIndex === stepIdx;
                    return (
                      <button
                        key={stepIdx}
                        type="button"
                        onClick={() => {
                          setPreviewedStepIndex(stepIdx);
                          onPlayStep(stepIdx);
                        }}
                        className={`p-1.5 sm:p-2 text-center transition cursor-pointer border-r last:border-r-0 border-slate-800/80 hover:bg-indigo-950/40 flex flex-col items-center justify-center gap-0.5 ${
                          isCurrentPlaying
                            ? 'bg-indigo-950/80 text-white ring-1 ring-inset ring-indigo-400'
                            : isSelectedPreview
                            ? 'bg-indigo-950/40 text-indigo-200'
                            : 'text-slate-300'
                        }`}
                        title={`Слушать аккорд: ${renderStepChordLabel(step)}`}
                      >
                        <span className="font-mono font-black text-xs sm:text-sm text-indigo-300">
                          {renderStepChordLabel(step)}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Voice Rows (Soprano, Alto, Tenor, Bass) */}
                {[
                  {
                    id: 'soprano',
                    letter: 'С',
                    name: 'Сопрано',
                    voiceIdx: 3 as const,
                    key: 'soprano' as const,
                    badgeClass: 'bg-purple-950/40 text-purple-300 hover:bg-purple-900/50',
                    degreeClass: 'text-purple-200',
                  },
                  {
                    id: 'alto',
                    letter: 'А',
                    name: 'Альт',
                    voiceIdx: 2 as const,
                    key: 'alto' as const,
                    badgeClass: 'bg-amber-950/40 text-amber-300 hover:bg-amber-900/50',
                    degreeClass: 'text-amber-200',
                  },
                  {
                    id: 'tenor',
                    letter: 'Т',
                    name: 'Тенор',
                    voiceIdx: 1 as const,
                    key: 'tenor' as const,
                    badgeClass: 'bg-blue-950/40 text-blue-300 hover:bg-blue-900/50',
                    degreeClass: 'text-blue-200',
                  },
                  {
                    id: 'bass',
                    letter: 'Б',
                    name: 'Бас',
                    voiceIdx: 0 as const,
                    key: 'bass' as const,
                    badgeClass: 'bg-emerald-950/50 text-emerald-300 hover:bg-emerald-900/60 font-bold',
                    degreeClass: 'text-emerald-200 font-black',
                  },
                ].map((voice) => (
                  <div
                    key={voice.id}
                    className="grid border-b border-slate-800/60 last:border-b-0 items-stretch"
                    style={{
                      gridTemplateColumns: `64px repeat(${progression.steps.length}, 1fr)`,
                    }}
                  >
                    {/* Voice header button: plays the entire voice melodic line */}
                    <button
                      type="button"
                      onClick={() => onPlayVoice?.(voice.voiceIdx)}
                      className={`p-1.5 sm:p-2 border-r border-slate-800/80 flex items-center justify-center gap-1 transition cursor-pointer ${voice.badgeClass}`}
                      title={`Слушать партию целиком: ${voice.name}`}
                    >
                      <div className="flex items-center gap-1 font-mono font-bold text-[11px] sm:text-xs">
                        <span className="w-4 h-4 rounded flex items-center justify-center bg-black/40 text-[9px]">
                          {voice.letter}
                        </span>
                        <span className="hidden sm:inline text-[10px] truncate">{voice.name}</span>
                      </div>
                    </button>

                    {/* Step Note Cells: clicking plays individual voice note */}
                    {progression.steps.map((step, stepIdx) => {
                      const roman = extractPureRomanDegree(step.voiceDegreesRu[voice.key]);
                      const noteName = step.noteNamesSATB[voice.voiceIdx];
                      const isCurrentPlaying = activeStepIndex === stepIdx && isPlaying;

                      return (
                        <button
                          key={stepIdx}
                          type="button"
                          onClick={() => {
                            if (onPlayStepVoice) {
                              onPlayStepVoice(stepIdx, voice.voiceIdx);
                            }
                          }}
                          className={`p-1 sm:p-2 border-r last:border-r-0 border-slate-800/50 hover:bg-slate-800/60 transition cursor-pointer flex flex-col items-center justify-center text-center font-mono ${
                            isCurrentPlaying ? 'bg-indigo-950/40' : ''
                          }`}
                          title={`Шаг ${stepIdx + 1}, ${voice.name}: ${roman} (${noteName})`}
                        >
                          <span className={`text-xs sm:text-sm ${voice.degreeClass}`}>
                            {roman}
                          </span>
                          <span className="text-[9px] sm:text-[10px] text-slate-400 font-medium">
                            {noteName}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            {/* Next Task Button */}
            <button
              type="button"
              onClick={handleNextTask}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition active:scale-98 cursor-pointer mt-1"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Следующий гармонический оборот</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
