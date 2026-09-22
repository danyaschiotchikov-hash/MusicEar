import React, { useState, useEffect } from 'react';
import { PlaybackSettings } from '../types';
import {
  RealizedProgression,
  ProgressionCategory,
  CLASSICAL_PROGRESSIONS,
  realizeProgression,
  getChordPitches,
} from '../audio/harmonicProgressions';
import { CHROMATIC_NOTES_UP } from '../data/musicData';
import { ProgressionGrandStaff } from './ProgressionGrandStaff';
import {
  Play,
  RefreshCw,
  Sparkles,
  CheckCircle2,
  XCircle,
  Eye,
  BookOpen,
  Music,
  Activity,
  Layers,
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

interface TaskFeedback {
  isChecked: boolean;
  isCorrect: boolean;
  sopranoErrors: string[];
  functionalErrors: string[];
  cadentialErrors: string[];
  correctAlternatives: { nameRu: string; categoryNameRu: string; symbols: string[] }[];
}

export function convertSymbolToRomanDegree(symbol: string): string {
  let s = symbol.trim();
  if (s.endsWith('5/3')) {
    s = s.slice(0, -3);
  } else if (
    s === 'T5' || s === 't5' || s === 'S5' || s === 's5' || s === 'D5' || s === 'd5' ||
    s === 'I5' || s === 'i5' || s === 'IV5' || s === 'iv5' || s === 'V5' || s === 'v5' ||
    s === 'II5' || s === 'ii5' || s === 'VII5' || s === 'vii5' || s === 'VI5' || s === 'vi5' || s === 'III5' || s === 'iii5'
  ) {
    s = s.slice(0, -1);
  }

  if (s.toUpperCase().startsWith('K6/4') || s.toUpperCase().startsWith('K64')) return 'I6/4';
  if (s === 'T' || s === 't') return 'I';
  if (s.startsWith('T') || s.startsWith('t')) return 'I' + s.slice(1);
  if (s === 'S' || s === 's') return 'IV';
  if (s.startsWith('s#IV')) return '#IV';
  if (s.startsWith('S') || s.startsWith('s')) return 'IV' + s.slice(1);
  if (s === 'D' || s === 'd') return 'V';
  if (s.startsWith('D') || s.startsWith('d')) return 'V' + s.slice(1);
  if (s === 'n6') return '♭II6';

  return s;
}

export function renderAnalyticalSymbol(symbol: string): React.ReactNode {
  let clean = symbol.trim();
  if (clean.endsWith('5/3')) clean = clean.slice(0, -3);
  else if (
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
        <span className="inline-flex flex-col text-[9px] leading-[0.85] font-extrabold mx-0.5 text-indigo-300">
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
        <span className="inline-flex flex-col text-[9px] leading-[0.85] font-extrabold mx-0.5 text-indigo-300">
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
        <span className="inline-flex flex-col text-[9px] leading-[0.85] font-extrabold mx-0.5 text-indigo-300">
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
        <sub className="text-[9px] font-extrabold ml-0.5 text-indigo-300">6</sub>
      </span>
    );
  }

  if (clean.endsWith('7')) {
    const base = clean.slice(0, -1);
    return (
      <span className="inline-flex items-baseline font-mono font-extrabold">
        <span>{base}</span>
        <sub className="text-[9px] font-extrabold ml-0.5 text-indigo-300">7</sub>
      </span>
    );
  }

  if (clean.endsWith('2')) {
    const base = clean.slice(0, -1);
    return (
      <span className="inline-flex items-baseline font-mono font-extrabold">
        <span>{base}</span>
        <sub className="text-[9px] font-extrabold ml-0.5 text-indigo-300">2</sub>
      </span>
    );
  }

  return <span className="font-mono font-extrabold">{clean}</span>;
}

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
    } else {
      chordQuality = '';
      if (s.includes('6/4') || s.includes('6')) hasInversion = true;
    }
  } else if (s.includes('II') || s.includes('ii')) {
    rootNote = getTransposedNote(cleanTonic, 2);
    chordQuality = isMinor ? 'dim' : 'm';
    if (s.includes('6')) hasInversion = true;
  } else if (s.includes('VII') || s.includes('vii')) {
    rootNote = getTransposedNote(cleanTonic, 11);
    chordQuality = 'dim';
    if (s.includes('6')) hasInversion = true;
  } else if (s.includes('VI') || s.includes('vi')) {
    rootNote = getTransposedNote(cleanTonic, isMinor ? 8 : 9);
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
  activeStepIndex,
  onPlayProgression,
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
  const [previewedStepIndex, setPreviewedStepIndex] = useState<number | null>(null);
  const [taskFeedback, setTaskFeedback] = useState<TaskFeedback | null>(null);

  useEffect(() => {
    if (progression) {
      setUserStepSymbols(new Array(progression.steps.length).fill(''));
      setActiveStepSlot(0);
      setFeedbackError(null);
      setLocalIsRevealed(false);
      setPreviewedStepIndex(null);
      setTaskFeedback(null);
    }
  }, [progression]);

  if (!progression) {
    return (
      <div className="w-full p-6 text-center bg-slate-900/40 rounded-xl border border-slate-800">
        <p className="text-slate-400 text-xs">Загрузка оборота...</p>
      </div>
    );
  }

  const isRevealed = Boolean(progression.revealed || localIsRevealed);
  const viewMode = settings.progressionViewMode ?? 'cards';
  const currentKey = settings.progressionRootNote ?? settings.tonalRootNote ?? 'C';
  const currentNotation = settings.progressionNotation ?? 'roman';

  const categories: { id: ProgressionCategory | 'all'; label: string }[] = [
    { id: 'all', label: 'Все' },
    { id: 'cadential', label: 'Кадансовые' },
    { id: 'passing', label: 'Проходящие' },
    { id: 'auxiliary', label: 'Вспомог.' },
    { id: 'deceptive', label: 'Прерванные' },
    { id: 'disjunct', label: 'Со скачками' },
    { id: 'altered', label: 'Альтерир.' },
    { id: 'modal', label: 'Модальные' },
    { id: 'sequence', label: 'Секвенции' },
    { id: 'ellipsis', label: 'Эллипсис' },
    { id: 'modern', label: 'Современные' },
  ];

  const keyOptions = [
    { value: 'C', label: 'C (До)' },
    { value: 'G', label: 'G (Соль)' },
    { value: 'D', label: 'D (Ре)' },
    { value: 'A', label: 'A (Ля)' },
    { value: 'E', label: 'E (Ми)' },
    { value: 'F', label: 'F (Фа)' },
    { value: 'Bb', label: 'B♭ (Си♭)' },
    { value: 'Es', label: 'E♭ (Ми♭)' },
    { value: 'random', label: '🎲 Случайно' },
  ];

  const activeCategories = settings.progressionCategories ?? [];

  const handleCategoryToggle = (catId: ProgressionCategory | 'all') => {
    if (catId === 'all') {
      const allCats: ProgressionCategory[] = ['cadential', 'passing', 'auxiliary', 'deceptive', 'disjunct', 'altered', 'modal', 'sequence', 'ellipsis', 'modern'];
      const areAllActive = activeCategories.length === 10;
      onSettingsChange?.({
        progressionCategories: areAllActive ? [] : allCats,
        progressionCategory: areAllActive ? undefined : 'all',
      });
    } else {
      let updated: ProgressionCategory[];
      if (activeCategories.includes(catId)) {
        updated = activeCategories.filter(c => c !== catId);
      } else {
        updated = [...activeCategories, catId];
      }
      onSettingsChange?.({
        progressionCategories: updated,
        progressionCategory: updated.length === 10 ? 'all' : undefined,
      });
    }
    onNewTask();
  };

  const handleToggleViewMode = (mode: 'cards' | 'test' | 'task') => {
    onSettingsChange?.({ progressionViewMode: mode });
    setUserStepSymbols(new Array(progression.steps.length).fill(''));
    setActiveStepSlot(0);
    setFeedbackError(null);
    setTaskFeedback(null);
  };

  const handleKeyChange = (newKey: string) => {
    onSettingsChange?.({ progressionRootNote: newKey });
    onNewTask();
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
    setPreviewedStepIndex(null);
    setTaskFeedback(null);
    onNewTask();
  };

  const getStepChordLabelText = (step: typeof progression.steps[0]): string => {
    if (currentNotation === 'letter') {
      return getStepLetterChordSymbol(step.symbol, step.noteNamesSATB[0], progression.tonicNoteName, progression.scaleMode);
    }
    if (currentNotation === 'roman') {
      return convertSymbolToRomanDegree(step.symbol);
    }
    return step.symbol;
  };

  const isMinorKey = progression.scaleMode === 'minor';
  const rawChordPalette = isMinorKey
    ? [
        {
          group: 'T',
          color: 'bg-cyan-950/40 border-cyan-800/50 text-cyan-300 hover:bg-cyan-900/60',
          chords: currentNotation === 'roman' ? ['I', 'I6', 'I6/4'] : ['t', 't6', 't6/4'],
        },
        {
          group: 'S',
          color: 'bg-amber-950/40 border-amber-800/50 text-amber-300 hover:bg-amber-900/60',
          chords: currentNotation === 'roman' 
            ? ['IV', 'IV6', 'IV6/4', 'II', 'II6', 'II7', 'II6/5', 'II4/3', 'II2'] 
            : ['s', 's6', 's6/4', 'ii', 'ii6', 'ii7', 'ii6/5', 'ii4/3', 'ii2'],
        },
        {
          group: 'D',
          color: 'bg-rose-950/40 border-rose-800/50 text-rose-300 hover:bg-rose-900/60',
          chords: currentNotation === 'roman' 
            ? ['V', 'V6', 'V6/4', 'V7', 'V6/5', 'V4/3', 'V2', 'v', 'v6', 'I6/4'] 
            : ['D', 'D6', 'D6/4', 'D7', 'D6/5', 'D4/3', 'D2', 'd', 'd6', 'k6/4'],
        },
        {
          group: 'Ступени',
          color: 'bg-teal-950/40 border-teal-800/50 text-teal-300 hover:bg-teal-900/60',
          chords: currentNotation === 'roman'
            ? ['VI', 'III', 'III6', 'VII6', 'VII7ум', 'VII6/5ум', 'VII4/3ум', 'VII2ум']
            : ['VI', 'III', 'III6', 'vii6', 'VII7ум', 'VII6/5ум', 'VII4/3ум', 'VII2ум'],
        },
        {
          group: 'Альт.',
          color: 'bg-purple-950/40 border-purple-800/50 text-purple-300 hover:bg-purple-900/60',
          chords: currentNotation === 'roman'
            ? ['♭II6', '♭II7', '♭VI', '♭VI7', 'V7#5', 'V7-5', 'It+6', 'Fr+6', 'Ger+6']
            : ['n6', '♭II7', 'bVI', '♭VI7', 'D7#5', 'D7-5', 'It+6', 'Fr+6', 'Ger+6'],
        },
      ]
    : [
        {
          group: 'T',
          color: 'bg-cyan-950/40 border-cyan-800/50 text-cyan-300 hover:bg-cyan-900/60',
          chords: currentNotation === 'roman' ? ['I', 'I6', 'I6/4'] : ['T', 'T6', 'T6/4'],
        },
        {
          group: 'S',
          color: 'bg-amber-950/40 border-amber-800/50 text-amber-300 hover:bg-amber-900/60',
          chords: currentNotation === 'roman' 
            ? ['IV', 'IV6', 'IV6/4', 'II', 'II6', 'II6/4', 'II7', 'II6/5', 'II4/3', 'II2'] 
            : ['S', 'S6', 'S6/4', 'II', 'II6', 'II6/4', 'II7', 'II6/5', 'II4/3', 'II2'],
        },
        {
          group: 'D',
          color: 'bg-rose-950/40 border-rose-800/50 text-rose-300 hover:bg-rose-900/60',
          chords: currentNotation === 'roman' 
            ? ['V', 'V6', 'V6/4', 'V7', 'V6/5', 'V4/3', 'V2', 'I6/4'] 
            : ['D', 'D6', 'D6/4', 'D7', 'D6/5', 'D4/3', 'D2', 'K6/4'],
        },
        {
          group: 'Ступени',
          color: 'bg-teal-950/40 border-teal-800/50 text-teal-300 hover:bg-teal-900/60',
          chords: currentNotation === 'roman'
            ? ['VI', 'III', 'III6', 'VII6', 'VII7ум', 'VII6/5ум', 'VII4/3ум', 'VII2ум']
            : ['VI', 'III', 'III6', 'VII6', 'VII7ум', 'VII6/5ум', 'VII4/3ум', 'VII2ум'],
        },
        {
          group: 'Альт.',
          color: 'bg-purple-950/40 border-purple-800/50 text-purple-300 hover:bg-purple-900/60',
          chords: currentNotation === 'roman'
            ? ['♭II6', '♭II7', '♭VI', '♭VI7', 'V7#5', 'V7-5', 'It+6', 'Fr+6', 'Ger+6']
            : ['N6', '♭II7', 'bVI', '♭VI7', 'D7#5', 'D7-5', 'It+6', 'Fr+6', 'Ger+6'],
        },
      ];

  const standardChordsSet = new Set(
    rawChordPalette.flatMap(grp => grp.chords.map(c => c.toUpperCase()))
  );
  const extraChords: string[] = [];
  progression.steps.forEach(step => {
    const sym = getStepChordLabelText(step);
    if (!standardChordsSet.has(sym.toUpperCase()) && !extraChords.includes(sym)) {
      extraChords.push(sym);
    }
  });

  const chordPalette = [...rawChordPalette];
  if (extraChords.length > 0) {
    chordPalette.push({
      group: 'Спец.',
      color: 'bg-indigo-950/40 border-indigo-800/50 text-indigo-300 hover:bg-indigo-900/60',
      chords: extraChords,
    });
  }

  const handlePickChordForStep = (symbol: string) => {
    const updated = [...userStepSymbols];
    updated[activeStepSlot] = symbol;
    setUserStepSymbols(updated);
    setFeedbackError(null);
    setTaskFeedback(null);

    if (activeStepSlot < progression.steps.length - 1) {
      setActiveStepSlot(activeStepSlot + 1);
    }
  };

  const normalizeStepSymbol = (sym: string): string => {
    if (!sym) return '';
    let s = sym.trim();
    if (s.endsWith('5/3')) s = s.slice(0, -3);
    else if (
      s === 'T5' || s === 't5' || s === 'S5' || s === 's5' || s === 'D5' || s === 'd5' ||
      s === 'I5' || s === 'i5' || s === 'IV5' || s === 'iv5' || s === 'V5' || s === 'v5' ||
      s === 'II5' || s === 'ii5' || s === 'VII5' || s === 'vii5' || s === 'VI5' || s === 'vi5' || s === 'III5' || s === 'iii5'
    ) {
      s = s.slice(0, -1);
    }

    const u = s.toUpperCase();
    if (u.startsWith('K6/4') || u.startsWith('K64')) return 'I6/4';
    if (u === 'T' || u === 'I') return 'I';
    if (u === 'T6' || u === 'I6') return 'I6';
    if (u === 'T6/4' || u === 'I6/4') return 'I6/4';
    if (u === 'S' || u === 'IV') return 'IV';
    if (u === 'S6' || u === 'IV6') return 'IV6';
    if (u === 'S6/4' || u === 'IV6/4') return 'IV6/4';
    if (u === 'D' || u === 'V') return 'V';
    if (u === 'D6' || u === 'V6') return 'V6';
    if (u === 'D6/4' || u === 'V6/4') return 'V6/4';
    if (u === 'D7' || u === 'V7') return 'V7';
    if (u === 'D6/5' || u === 'V6/5') return 'V6/5';
    if (u === 'D4/3' || u === 'V4/3') return 'V4/3';
    if (u === 'D2' || u === 'V2') return 'V2';

    return u;
  };

  const checkSopranoHarmonization = () => {
    const sopranoErrors: string[] = [];
    const functionalErrors: string[] = [];
    const cadentialErrors: string[] = [];
    
    const isMinor = progression.scaleMode === 'minor';
    const tonicMidi = 60 + (progression.tonicPitch % 12);

    progression.steps.forEach((step, idx) => {
      const userSym = userStepSymbols[idx];
      if (!userSym) return;

      const sopranoMidi = step.midisSATB[3];
      const { rootOffset, intervals } = getChordPitches(userSym, isMinor);
      const targetRootPitchClass = (tonicMidi + rootOffset) % 12;
      const sopranoPitchClass = sopranoMidi % 12;
      const chordPitchClasses = intervals.map(interval => (targetRootPitchClass + interval) % 12);

      const sopranoNoteName = CHROMATIC_NOTES_UP[sopranoPitchClass];

      if (!chordPitchClasses.includes(sopranoPitchClass)) {
        sopranoErrors.push(
          `Шаг ${idx + 1}: Сопрано «${sopranoNoteName}» не входит в аккорд «${userSym}».`
        );
      }
    });

    for (let i = 0; i < userStepSymbols.length - 1; i++) {
      const u1 = userStepSymbols[i].toUpperCase();
      const u2 = userStepSymbols[i + 1].toUpperCase();

      const isD1 = u1.includes('V') || u1.includes('D');
      const isS2 = u2.includes('IV') || u2.includes('S') || u2.includes('II');

      if (isD1 && isS2) {
        functionalErrors.push(
          `Шаг ${i + 1}→${i + 2}: Переход от D (${userStepSymbols[i]}) к S (${userStepSymbols[i + 1]}) нарушает гармонию.`
        );
      }
    }

    const targetSopranoPitches = progression.steps.map(s => s.midisSATB[3] % 12);
    const matchingProgressions: { nameRu: string; categoryNameRu: string; symbols: string[] }[] = [];
    
    CLASSICAL_PROGRESSIONS.forEach(tpl => {
      if (tpl.steps.length !== progression.steps.length) return;
      if (tpl.scaleMode !== 'both' && tpl.scaleMode !== progression.scaleMode) return;

      const realized = realizeProgression(tpl.id, progression.tonicNoteName, progression.scaleMode);
      
      let matchesSoprano = true;
      for (let i = 0; i < realized.steps.length; i++) {
        if (realized.steps[i].midisSATB[3] % 12 !== targetSopranoPitches[i]) {
          matchesSoprano = false;
          break;
        }
      }

      if (matchesSoprano) {
        matchingProgressions.push({
          nameRu: tpl.nameRu,
          categoryNameRu: tpl.categoryNameRu,
          symbols: realized.steps.map(s => getStepChordLabelText(s)),
        });
      }
    });

    const isCorrect = sopranoErrors.length === 0 && functionalErrors.length === 0 && cadentialErrors.length === 0;

    setTaskFeedback({
      isChecked: true,
      isCorrect,
      sopranoErrors,
      functionalErrors,
      cadentialErrors,
      correctAlternatives: matchingProgressions,
    });

    if (isCorrect) {
      handleTriggerReveal();
    }
  };

  const handleCheckUserProgression = () => {
    if (viewMode === 'task') {
      checkSopranoHarmonization();
      return;
    }

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
      setFeedbackError(null);
      handleTriggerReveal();
    } else {
      setFeedbackError(`Ошибка на шагах: ${errors.join(', ')}.`);
    }
  };

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
    <div className="w-full flex flex-col gap-2 select-none">
      {/* 1. Main Minimalist Card */}
      <div className="w-full bg-slate-900/60 border border-slate-800 rounded-xl p-2.5 sm:p-3 flex flex-col gap-2.5 shadow-sm">
        
        {/* Row 1: Unified Compact Header Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-1.5 pb-2 border-b border-slate-800/80">
          {/* Submodes Segmented Control */}
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-0.5 text-xs font-semibold">
            <button
              type="button"
              onClick={() => handleToggleViewMode('cards')}
              className={`px-2.5 py-1 rounded-md transition cursor-pointer text-[11px] ${
                viewMode === 'cards'
                  ? 'bg-indigo-600 text-white font-bold shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Обучение
            </button>
            <button
              type="button"
              onClick={() => handleToggleViewMode('test')}
              className={`px-2.5 py-1 rounded-md transition cursor-pointer text-[11px] ${
                viewMode === 'test'
                  ? 'bg-indigo-600 text-white font-bold shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Тест
            </button>
            <button
              type="button"
              onClick={() => handleToggleViewMode('task')}
              className={`px-2.5 py-1 rounded-md transition cursor-pointer text-[11px] ${
                viewMode === 'task'
                  ? 'bg-indigo-600 text-white font-bold shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Задача
            </button>
          </div>

          {/* Sound Actions: Play, Cadence, Style */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={onPlayProgression}
              disabled={isPlaying}
              className="flex items-center gap-1.5 px-3 py-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold rounded-lg transition cursor-pointer active:scale-95 shadow-xs"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{isPlaying ? 'Звучит...' : 'Слушать'}</span>
            </button>

            {onPlayCadence && (
              <button
                type="button"
                onClick={() => onPlayCadence(currentKey === 'random' ? 'C' : currentKey, progression.scaleMode)}
                className="px-2 py-1 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-lg text-xs font-medium transition cursor-pointer"
                title="Сыграть каданс настройки в тональности"
              >
                Настройка
              </button>
            )}

            {onSettingsChange && (
              <div className="flex items-center gap-1 bg-slate-950/70 border border-slate-800 p-0.5 rounded-lg">
                <button
                  type="button"
                  onClick={() => onSettingsChange({ style: 'arpeggio' })}
                  className={`flex items-center justify-center p-2 rounded-md text-xs sm:text-sm transition cursor-pointer ${
                    settings.style === 'arpeggio'
                      ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="Мелодически (арпеджио)"
                >
                  <Activity className="w-4 h-4 shrink-0" />
                </button>
                <button
                  type="button"
                  onClick={() => onSettingsChange({ style: 'harmonic' })}
                  className={`flex items-center justify-center p-2 rounded-md text-xs sm:text-sm transition cursor-pointer ${
                    settings.style === 'harmonic'
                      ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="Гармонически (одновременно)"
                >
                  <Layers className="w-4 h-4 shrink-0" />
                </button>
              </div>
            )}
          </div>

          {/* Key, Scale, and Voicing Options */}
          <div className="flex items-center gap-1">
            <select
              value={currentKey}
              onChange={(e) => handleKeyChange(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-indigo-300 text-[11px] font-bold font-mono px-1.5 py-1 rounded-lg cursor-pointer focus:outline-none"
            >
              {keyOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-0.5 text-[10px] font-semibold">
              <button
                type="button"
                onClick={() => {
                  onSettingsChange?.({ tonalScaleMode: 'major' });
                  onNewTask();
                }}
                className={`px-1.5 py-0.5 rounded transition cursor-pointer ${
                  settings.tonalScaleMode !== 'minor'
                    ? 'bg-indigo-600 text-white font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Маж
              </button>
              <button
                type="button"
                onClick={() => {
                  onSettingsChange?.({ tonalScaleMode: 'minor' });
                  onNewTask();
                }}
                className={`px-1.5 py-0.5 rounded transition cursor-pointer ${
                  settings.tonalScaleMode === 'minor'
                    ? 'bg-indigo-600 text-white font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Мин
              </button>
            </div>

            {/* Voicing */}
            <select
              value={settings.progressionSpacing ?? 'original'}
              onChange={(e) => onSettingsChange?.({ progressionSpacing: e.target.value as any })}
              className="bg-slate-950 border border-slate-800 text-emerald-400 text-[10px] font-bold px-1.5 py-1 rounded-lg cursor-pointer focus:outline-none hidden sm:inline-block"
              title="Расположение"
            >
              <option value="original">Оригинал</option>
              <option value="close">Тесное</option>
              <option value="open">Широкое</option>
            </select>

            {onOpenProgressionCatalog && (
              <button
                type="button"
                onClick={onOpenProgressionCatalog}
                className="flex items-center gap-1 px-2 py-1 bg-purple-950/60 hover:bg-purple-900/80 border border-purple-500/40 text-purple-200 rounded-lg text-xs font-medium transition cursor-pointer"
                title="Каталог оборотов"
              >
                <BookOpen className="w-3 h-3 text-purple-400" />
                <span className="hidden sm:inline">Каталог</span>
              </button>
            )}
          </div>

          {/* Action Button: Check / Reveal / Next */}
          <div className="flex items-center gap-1.5">
            {!isRevealed ? (
              <>
                {(viewMode === 'test' || viewMode === 'task') && (
                  <button
                    type="button"
                    onClick={handleCheckUserProgression}
                    disabled={userStepSymbols.some((s) => !s)}
                    className="flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-xs font-bold rounded-lg transition cursor-pointer active:scale-95 shadow-xs"
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Проверить</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleTriggerReveal}
                  className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-indigo-300 text-xs font-semibold rounded-lg transition cursor-pointer active:scale-95"
                >
                  <Eye className="w-3 h-3 text-indigo-400" />
                  <span>Ответ</span>
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={handleNextTask}
                className="flex items-center gap-1.5 px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg transition cursor-pointer active:scale-95 shadow-xs"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Дальше</span>
              </button>
            )}
          </div>
        </div>

        {/* Category Filter Chips Bar (Compact Single-Row Horizontal Scroll) */}
        <div className="flex items-center gap-1 overflow-x-auto py-0.5 scrollbar-none text-[11px]">
          {categories.map((cat) => {
            const isActive = cat.id === 'all'
              ? activeCategories.length === 10
              : activeCategories.includes(cat.id);
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleCategoryToggle(cat.id)}
                className={`px-2 py-0.5 rounded-md transition cursor-pointer whitespace-nowrap flex items-center gap-1 text-[10px] ${
                  isActive
                    ? 'bg-indigo-600/90 text-white font-bold'
                    : 'text-slate-400 hover:text-slate-200 bg-slate-950/70 hover:bg-slate-800/80 border border-slate-800/70'
                }`}
              >
                {isActive && cat.id !== 'all' && (
                  <span className="w-1 h-1 rounded-full bg-emerald-400" />
                )}
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Step Timeline & Interactive Cards */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-1.5 w-full">
          {progression.steps.map((step, idx) => {
            const isCurrentPlaying = activeStepIndex === idx && isPlaying;
            const isSelectedPreview = previewedStepIndex === idx;
            const isSlotActive = (viewMode === 'test' || viewMode === 'task') && !isRevealed && activeStepSlot === idx;
            const userSym = userStepSymbols[idx];

            return (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setPreviewedStepIndex(idx);
                  if (viewMode === 'test' || viewMode === 'task') {
                    setActiveStepSlot(idx);
                  }
                  onPlayStep(idx);
                }}
                className={`py-1.5 px-2 rounded-xl border text-center transition cursor-pointer flex flex-col items-center justify-center relative ${
                  isCurrentPlaying
                    ? 'bg-indigo-600 border-indigo-400 text-white font-bold ring-2 ring-indigo-400 shadow-md'
                    : isSlotActive
                    ? 'bg-indigo-950/90 border-indigo-500 text-white ring-1 ring-indigo-500'
                    : isSelectedPreview
                    ? 'bg-indigo-950/70 border-indigo-700/60 text-indigo-200'
                    : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:bg-slate-850'
                }`}
              >
                <span className="text-[9px] text-slate-500 font-mono">Шаг {idx + 1}</span>
                <span className="text-sm font-mono font-black mt-0.5">
                  {isRevealed
                    ? renderStepChordLabel(step)
                    : userSym
                    ? renderAnalyticalSymbol(userSym)
                    : '?'}
                </span>
                {isRevealed && (
                  <span className="text-[9px] text-slate-400 font-mono mt-0.5">
                    {step.noteNamesSATB[3]} / {step.noteNamesSATB[0]}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Solo Melodic Voice Listening (S, A, T, B) */}
        {onPlayVoice && (
          <div className="flex items-center justify-between gap-1.5 px-2 py-1 bg-slate-950/60 rounded-lg border border-slate-800/80 text-[11px]">
            <span className="text-slate-400 font-medium">Партии голосов:</span>
            <div className="flex items-center gap-1">
              {[
                { label: 'S Сопрано', idx: 3 as const, color: 'text-rose-400 hover:bg-rose-950/40 border-rose-900/40' },
                { label: 'A Альт', idx: 2 as const, color: 'text-amber-400 hover:bg-amber-950/40 border-amber-900/40' },
                { label: 'T Тенор', idx: 1 as const, color: 'text-emerald-400 hover:bg-emerald-950/40 border-emerald-900/40' },
                { label: 'B Бас', idx: 0 as const, color: 'text-purple-400 hover:bg-purple-950/40 border-purple-900/40' },
              ].map((v) => (
                <button
                  key={v.idx}
                  type="button"
                  onClick={() => onPlayVoice(v.idx)}
                  disabled={isPlaying}
                  className={`px-2 py-0.5 rounded border ${v.color} font-mono font-bold text-[10px] transition cursor-pointer disabled:opacity-40`}
                >
                  {v.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Interactive Builder Palette (in Test or Task Mode before Reveal) */}
        {(viewMode === 'test' || viewMode === 'task') && !isRevealed && (
          <div className="flex flex-col gap-1.5 p-2 bg-slate-950/80 border border-slate-800 rounded-xl">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>Выберите созвучие для Шага {activeStepSlot + 1}:</span>
              <button
                type="button"
                onClick={() => {
                  setUserStepSymbols(new Array(progression.steps.length).fill(''));
                  setTaskFeedback(null);
                  setFeedbackError(null);
                }}
                className="text-[10px] text-slate-500 hover:text-slate-300 cursor-pointer"
              >
                Сбросить
              </button>
            </div>

            {/* Chord palette groups */}
            <div className="flex flex-col gap-1">
              {chordPalette.map((grp) => (
                <div key={grp.group} className="flex items-center gap-1.5">
                  <span className="text-[10px] text-slate-500 font-bold w-12 shrink-0">{grp.group}:</span>
                  <div className="flex flex-wrap gap-1">
                    {grp.chords.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => handlePickChordForStep(c)}
                        className={`px-1.5 py-0.5 rounded border text-[11px] font-mono font-bold transition cursor-pointer ${grp.color}`}
                      >
                        {renderAnalyticalSymbol(c)}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {feedbackError && (
              <p className="text-[11px] text-rose-400 font-semibold mt-0.5">{feedbackError}</p>
            )}
          </div>
        )}

        {/* Task Educational Feedback Board */}
        {viewMode === 'task' && !isRevealed && taskFeedback && taskFeedback.isChecked && (
          <div className="p-2.5 bg-slate-950/90 border border-slate-800 rounded-xl text-xs">
            {taskFeedback.isCorrect ? (
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Гармонизация верна!</span>
              </div>
            ) : (
              <div className="flex flex-col gap-1 text-rose-300">
                <div className="flex items-center gap-2 font-bold text-rose-400">
                  <XCircle className="w-4 h-4" />
                  <span>Ошибки гармонизации:</span>
                </div>
                <div className="space-y-0.5 text-[11px] text-slate-300 pl-4">
                  {taskFeedback.sopranoErrors.map((e, i) => (
                    <div key={`s-${i}`}>• {e}</div>
                  ))}
                  {taskFeedback.functionalErrors.map((e, i) => (
                    <div key={`f-${i}`}>• {e}</div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Revealed Study Section: Compact Grand Staff & Explanation */}
        {isRevealed && (
          <div className="flex flex-col gap-2 animate-in fade-in duration-150">
            {/* Title & Formula Header */}
            <div className="p-2 bg-slate-950/70 border border-slate-800/80 rounded-xl flex items-center justify-between text-xs">
              <span className="font-bold text-slate-100">{progression.template.nameRu}</span>
              <div className="flex items-center gap-1 font-mono font-extrabold text-indigo-300 text-xs">
                {progression.steps.map((s, i) => (
                  <React.Fragment key={i}>
                    {i > 0 && <span className="text-slate-600 font-sans mx-0.5">—</span>}
                    {renderStepChordLabel(s)}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Compact Grand Staff */}
            <ProgressionGrandStaff
              progression={progression}
              activeStepIndex={isPlaying ? activeStepIndex : previewedStepIndex}
              onPlayStep={onPlayStep}
            />

            {/* Voice Leading Explanation if available */}
            {progression.template.voiceLeadingExplanationRu && (
              <p className="text-[11px] text-slate-400 leading-tight px-1">
                💡 <span className="text-slate-300 font-medium">Голосоведение:</span> {progression.template.voiceLeadingExplanationRu}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
