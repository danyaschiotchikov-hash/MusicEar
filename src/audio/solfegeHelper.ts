import { MusicItem, AppStats } from '../types';
import { CHROMATIC_NOTES_UP } from '../data/musicData';
import { pickWeightedItem } from '../utils/spacedRepetition';
import {
  TONAL_DEGREES,
  TonalDegreeDefinition,
  getVoicingsForDegree,
  TonalChordVoicing,
  ResolutionSchemeItem,
  POPULAR_TONAL_CHORDS,
  PopularTonalChordItem,
  findVoicingById,
} from './tonalChords';
import {
  RealizedProgression,
  RealizedProgressionStep,
  HarmonicProgressionTemplate,
} from './harmonicProgressions';

export const RUSSIAN_NOTE_NAMES_BY_SEMITONE: Record<number, string> = {
  0: 'До',
  1: 'До♯ / Ре♭',
  2: 'Ре',
  3: 'Ми♭',
  4: 'Ми',
  5: 'Фа',
  6: 'Фа♯ / Соль♭',
  7: 'Соль',
  8: 'Ля♭',
  9: 'Ля',
  10: 'Си♭',
  11: 'Си',
};

// Anti-repetition sliding buffers to prevent repeating same scale degrees and chords
const recentDegreeIds: string[] = [];
const recentTwoNotesPairs: string[] = [];
const recentVoicingIds: string[] = [];

export interface SolfegeStep {
  fromNote: string;
  toNote: string;
  intervalName: string;
  semitones: number;
}

export interface ScaleDegreeTask {
  id: string;
  degreeRoman: string;
  degreeNumber: number | string;
  degreeNameRu: string;
  solfegeNameRu: string;
  functionRoleRu: string;
  stability: 'stable' | 'unstable';
  targetMidi: number;
  targetNoteName: string;
  tonicMidi: number;
  tonicNoteName: string;
  keyScaleMode: 'major' | 'minor';
  keyNameRu: string;
  resolutionMidi: number;
  resolutionPathMidis: number[];
  resolutionNoteName: string;
  resolutionNameRu: string;
  degreeType: 'diatonic' | 'chromatic';
  revealed: boolean;
  userAnswerId: string | null;
  userAnswerIds?: string[];
  isCorrect: boolean | null;
  incorrectAnswers?: string[];
  secondTargetMidi?: number;
  secondDegreeId?: string;
  secondDegreeNameRu?: string;
  isTwoNotes?: boolean;
}

export function generateScaleDegreeTask(
  tonalRootPref: string = 'C',
  tonalModePref: 'major' | 'minor' | 'any' = 'major',
  degreeTypePref: 'diatonic' | 'chromatic' = 'diatonic',
  stats?: AppStats,
  spacedRepetitionEnabled: boolean = true,
  isTwoNotes: boolean = false
): ScaleDegreeTask {
  const NOTE_LOOKUP: Record<string, number> = {
    'c': 0, 'cis': 1, 'des': 1, 'd': 2, 'dis': 3, 'es': 3, 'e': 4,
    'f': 5, 'fis': 6, 'ges': 6, 'g': 7, 'gis': 8, 'as': 8, 'a': 9,
    'ais': 10, 'b': 10, 'h': 11,
  };

  let tonicPitchClass = 0;
  if (tonalRootPref === 'random' || !tonalRootPref) {
    tonicPitchClass = Math.floor(Math.random() * 12);
  } else {
    const clean = tonalRootPref.toLowerCase().split(/[\s(/]/)[0];
    tonicPitchClass = NOTE_LOOKUP[clean] ?? 0;
  }

  let mode: 'major' | 'minor' = 'major';
  if (tonalModePref === 'any') {
    mode = Math.random() > 0.5 ? 'major' : 'minor';
  } else if (tonalModePref === 'minor') {
    mode = 'minor';
  }

  const tonicMidi = 60 + tonicPitchClass;
  const tonicNoteName = CHROMATIC_NOTES_UP[tonicPitchClass];
  const keyNameRu = `${tonicNoteName} ${mode === 'major' ? 'мажор' : 'минор'}`;

  const thirdSemitones = mode === 'major' ? 4 : 3;
  const sixthSemitones = mode === 'major' ? 9 : 8;

  const diatonicDegrees = [
    {
      id: 'deg_I',
      roman: 'I',
      num: '1',
      semitones: 0,
      solfege: 'До',
      nameRu: 'I ступень — Тоника',
      roleRu: 'Главная ладовая опора',
      stability: 'stable' as const,
      pathSemitones: [0],
      resText: 'I (Тоника)',
    },
    {
      id: 'deg_II',
      roman: 'II',
      num: '2',
      semitones: 2,
      solfege: 'Ре',
      nameRu: 'II ступень — Вводный тон',
      roleRu: 'Разрешается по ступеням вниз в I',
      stability: 'unstable' as const,
      pathSemitones: [2, 0],
      resText: 'II → I',
    },
    {
      id: 'deg_III',
      roman: 'III',
      num: '3',
      semitones: thirdSemitones,
      solfege: mode === 'major' ? 'Ми' : 'Ми-бемоль',
      nameRu: 'III ступень — Медианта',
      roleRu: 'Задает ладовую окраску',
      stability: 'stable' as const,
      pathSemitones: [thirdSemitones, 2, 0],
      resText: 'III → II → I',
    },
    {
      id: 'deg_IV',
      roman: 'IV',
      num: '4',
      semitones: 5,
      solfege: 'Фа',
      nameRu: 'IV ступень — Субдоминанта',
      roleRu: 'Разрешается по ступеням вниз в I',
      stability: 'unstable' as const,
      pathSemitones: [5, thirdSemitones, 2, 0],
      resText: 'IV → III → II → I',
    },
    {
      id: 'deg_V',
      roman: 'V',
      num: '5',
      semitones: 7,
      solfege: 'Соль',
      nameRu: 'V ступень — Доминанта',
      roleRu: 'Квинтовая опора',
      stability: 'stable' as const,
      pathSemitones: [7, sixthSemitones, 11, 12],
      resText: 'V → VI → VII → I',
    },
    {
      id: 'deg_VI',
      roman: 'VI',
      num: '6',
      semitones: sixthSemitones,
      solfege: mode === 'major' ? 'Ля' : 'Ля-бемоль',
      nameRu: 'VI ступень — Верхняя медианта',
      roleRu: 'Разрешается по ступеням вверх в I',
      stability: 'unstable' as const,
      pathSemitones: [sixthSemitones, 11, 12],
      resText: 'VI → VII → I',
    },
    {
      id: 'deg_VII',
      roman: 'VII',
      num: '7',
      semitones: 11,
      solfege: 'Си',
      nameRu: 'VII ступень — Вводный тон',
      roleRu: 'Разрешается по ступеням вверх в I',
      stability: 'unstable' as const,
      pathSemitones: [11, 12],
      resText: 'VII → I',
    },
  ];

  const chromaticDegrees = [
    {
      id: 'deg_I',
      roman: 'I',
      num: '1',
      semitones: 0,
      solfege: 'До',
      nameRu: 'I ступень — Тоника',
      roleRu: 'Главная опора',
      stability: 'stable' as const,
      pathSemitones: [0],
      resText: 'I',
    },
    {
      id: 'deg_bII',
      roman: '♭II',
      num: '♭2',
      semitones: 1,
      solfege: 'До♯ / Ре♭',
      nameRu: '♭II ступень (Низкая II)',
      roleRu: 'Разрешается в I ступень',
      stability: 'unstable' as const,
      pathSemitones: [1, 0],
      resText: '♭II → I',
    },
    {
      id: 'deg_II',
      roman: 'II',
      num: '2',
      semitones: 2,
      solfege: 'Ре',
      nameRu: 'II ступень',
      roleRu: 'Разрешается по ступеням вниз в I',
      stability: 'unstable' as const,
      pathSemitones: [2, 0],
      resText: 'II → I',
    },
    {
      id: 'deg_bIII',
      roman: mode === 'major' ? '♭III' : 'III',
      num: mode === 'major' ? '♭3' : '3',
      semitones: 3,
      solfege: 'Ми♭',
      nameRu: mode === 'major' ? '♭III (Низкая III)' : 'III ступень (Минор)',
      roleRu: mode === 'major' ? 'Разрешается через III в I' : 'Устойчивая ступень (вниз в I)',
      stability: mode === 'major' ? ('unstable' as const) : ('stable' as const),
      pathSemitones: mode === 'major' ? [3, 4, 2, 0] : [3, 2, 0],
      resText: mode === 'major' ? '♭III → III → II → I' : 'III → II → I',
    },
    {
      id: 'deg_III',
      roman: mode === 'major' ? 'III' : '♯III',
      num: mode === 'major' ? '3' : '♯3',
      semitones: 4,
      solfege: 'Ми',
      nameRu: mode === 'major' ? 'III ступень (Мажор)' : '♯III (Высокая III)',
      roleRu: mode === 'major' ? 'Устойчивая ступень (вниз в I)' : 'Разрешается через III в I',
      stability: mode === 'major' ? ('stable' as const) : ('unstable' as const),
      pathSemitones: mode === 'major' ? [4, 2, 0] : [4, 3, 2, 0],
      resText: mode === 'major' ? 'III → II → I' : '♯III → III → II → I',
    },
    {
      id: 'deg_IV',
      roman: 'IV',
      num: '4',
      semitones: 5,
      solfege: 'Фа',
      nameRu: 'IV ступень',
      roleRu: 'Разрешается по ступеням вниз в I',
      stability: 'unstable' as const,
      pathSemitones: [5, thirdSemitones, 2, 0],
      resText: 'IV → III → II → I',
    },
    {
      id: 'deg_bV',
      roman: '♭V / ♯IV',
      num: '♯4/♭5',
      semitones: 6,
      solfege: 'Фа♯ / Соль♭',
      nameRu: '♯IV / ♭V ступень (Тритон)',
      roleRu: 'Разрешается через V вверх в I',
      stability: 'unstable' as const,
      pathSemitones: [6, 7, sixthSemitones, 11, 12],
      resText: '♯IV → V → VI → VII → I',
    },
    {
      id: 'deg_V',
      roman: 'V',
      num: '5',
      semitones: 7,
      solfege: 'Соль',
      nameRu: 'V ступень — Доминанта',
      roleRu: 'Разрешается по ступеням вверх в I',
      stability: 'stable' as const,
      pathSemitones: [7, sixthSemitones, 11, 12],
      resText: 'V → VI → VII → I',
    },
    {
      id: 'deg_bVI',
      roman: mode === 'major' ? '♭VI' : 'VI',
      num: mode === 'major' ? '♭6' : '6',
      semitones: 8,
      solfege: 'Ля♭',
      nameRu: mode === 'major' ? '♭VI (Низкая VI)' : 'VI ступень (Минор)',
      roleRu: 'Разрешается через V и дальше вверх в I',
      stability: mode === 'major' ? ('unstable' as const) : ('unstable' as const),
      pathSemitones: mode === 'major' ? [8, 7, 9, 11, 12] : [8, 11, 12],
      resText: mode === 'major' ? '♭VI → V → VI → VII → I' : 'VI → VII → I',
    },
    {
      id: 'deg_VI',
      roman: mode === 'major' ? 'VI' : '♯VI',
      num: mode === 'major' ? '6' : '♯6',
      semitones: 9,
      solfege: 'Ля',
      nameRu: mode === 'major' ? 'VI ступень (Мажор)' : '♯VI (Высокая VI)',
      roleRu: 'Разрешается по ступеням вверх в I',
      stability: 'unstable' as const,
      pathSemitones: [9, 11, 12],
      resText: 'VI → VII → I',
    },
    {
      id: 'deg_bVII',
      roman: '♭VII',
      num: '♭7',
      semitones: 10,
      solfege: 'Си♭',
      nameRu: '♭VII ступень',
      roleRu: 'Разрешается по ступеням вверх в I',
      stability: 'unstable' as const,
      pathSemitones: [10, 11, 12],
      resText: '♭VII → VII → I',
    },
    {
      id: 'deg_VII',
      roman: 'VII',
      num: '7',
      semitones: 11,
      solfege: 'Си',
      nameRu: 'VII ступень',
      roleRu: 'Разрешается по ступеням вверх в I',
      stability: 'unstable' as const,
      pathSemitones: [11, 12],
      resText: 'VII → I',
    },
  ];

  const degreesList = degreeTypePref === 'chromatic' ? chromaticDegrees : diatonicDegrees;
  const chosen = pickWeightedItem(
    degreesList,
    (d) => d.id,
    stats,
    spacedRepetitionEnabled,
    recentDegreeIds
  );

  // Update recent single degrees history
  recentDegreeIds.push(chosen.id);
  if (recentDegreeIds.length > 5) {
    recentDegreeIds.shift();
  }

  const targetMidi = tonicMidi + chosen.semitones;
  const targetNoteName = CHROMATIC_NOTES_UP[((targetMidi % 12) + 12) % 12];

  let secondTargetMidi: number | undefined;
  let secondDegreeId: string | undefined;
  let secondDegreeNameRu: string | undefined;

  if (isTwoNotes) {
    const available = degreesList.filter((d) => d.id !== chosen.id);
    // Filter out pair combinations seen recently
    const nonRecentAvailable = available.filter((d) => {
      const pairKey = [chosen.id, d.id].sort().join('+');
      return !recentTwoNotesPairs.includes(pairKey);
    });

    const candidatePool = nonRecentAvailable.length > 0 ? nonRecentAvailable : available;
    const chosen2 = candidatePool[Math.floor(Math.random() * candidatePool.length)] || degreesList[0];
    secondTargetMidi = tonicMidi + chosen2.semitones;
    secondDegreeId = chosen2.id;
    secondDegreeNameRu = chosen2.nameRu;

    // Record pair in history
    const pairKey = [chosen.id, chosen2.id].sort().join('+');
    recentTwoNotesPairs.push(pairKey);
    if (recentTwoNotesPairs.length > 8) {
      recentTwoNotesPairs.shift();
    }
  }

  const resolutionPathMidis = chosen.pathSemitones.map((s) => tonicMidi + s);
  const resolutionMidi = resolutionPathMidis[resolutionPathMidis.length - 1] ?? tonicMidi;
  const resolutionNoteName = CHROMATIC_NOTES_UP[((resolutionMidi % 12) + 12) % 12];
  const resolutionNameRu = chosen.resText;
  const targetNoteRu = RUSSIAN_NOTE_NAMES_BY_SEMITONE[((targetMidi % 12) + 12) % 12] ?? chosen.solfege;

  return {
    id: chosen.id,
    degreeRoman: chosen.roman,
    degreeNumber: chosen.num,
    degreeNameRu: chosen.nameRu,
    solfegeNameRu: targetNoteRu,
    functionRoleRu: chosen.roleRu,
    stability: chosen.stability,
    targetMidi,
    targetNoteName,
    secondTargetMidi,
    secondDegreeId,
    secondDegreeNameRu,
    isTwoNotes,
    tonicMidi,
    tonicNoteName,
    keyScaleMode: mode,
    keyNameRu,
    resolutionMidi,
    resolutionPathMidis,
    resolutionNoteName,
    resolutionNameRu,
    degreeType: degreeTypePref,
    revealed: false,
    userAnswerId: null,
    userAnswerIds: [],
    isCorrect: null,
  };
}

export interface ConstructionBreakdown {
  notesMidi: number[];
  noteNames: string[];
  degreeLabels: string[];
  steps: SolfegeStep[];
  chordBaseNoteName: string;
  chordBaseMidi: number;
  direction: 'up' | 'down';
  totalSpan: number;
  fullChordTitle: string;
}

export const BASE_LETTERS = ['C', 'D', 'E', 'F', 'G', 'A', 'H'];
export const NATURAL_SEMITONES = [0, 2, 4, 5, 7, 9, 11];

/**
 * Extracts base diatonic letter index (0..6: C, D, E, F, G, A, H)
 * and accidental shift (-2..+2) from note name or MIDI.
 */
export function parseRootNote(
  rootMidi: number,
  rootNoteName?: string
): { baseLetter: number; accidental: number } {
  if (rootNoteName) {
    const clean = rootNoteName.split(/[\s(/]/)[0].trim();
    const lower = clean.toLowerCase();

    // Specific European note names:
    if (lower === 'b') return { baseLetter: 6, accidental: -1 }; // B = H-flat (Си-бемоль)
    if (lower === 'heses' || lower === 'bb') return { baseLetter: 6, accidental: -2 };
    if (lower === 'h') return { baseLetter: 6, accidental: 0 };
    if (lower === 'his') return { baseLetter: 6, accidental: 1 };
    if (lower === 'hisis') return { baseLetter: 6, accidental: 2 };

    if (lower === 'as') return { baseLetter: 5, accidental: -1 };
    if (lower === 'asas') return { baseLetter: 5, accidental: -2 };
    if (lower === 'es') return { baseLetter: 2, accidental: -1 };
    if (lower === 'eses') return { baseLetter: 2, accidental: -2 };

    // Standard Latin note names with -is and -es:
    if (lower.startsWith('c')) {
      if (lower === 'cisis' || lower === 'c##') return { baseLetter: 0, accidental: 2 };
      if (lower === 'cis' || lower === 'c#') return { baseLetter: 0, accidental: 1 };
      if (lower === 'ceses' || lower === 'cbb') return { baseLetter: 0, accidental: -2 };
      if (lower === 'ces' || lower === 'cb') return { baseLetter: 0, accidental: -1 };
      return { baseLetter: 0, accidental: 0 };
    }
    if (lower.startsWith('d')) {
      if (lower === 'disis' || lower === 'd##') return { baseLetter: 1, accidental: 2 };
      if (lower === 'dis' || lower === 'd#') return { baseLetter: 1, accidental: 1 };
      if (lower === 'deses' || lower === 'dbb') return { baseLetter: 1, accidental: -2 };
      if (lower === 'des' || lower === 'db') return { baseLetter: 1, accidental: -1 };
      return { baseLetter: 1, accidental: 0 };
    }
    if (lower.startsWith('e')) {
      if (lower === 'eisis' || lower === 'e##') return { baseLetter: 2, accidental: 2 };
      if (lower === 'eis' || lower === 'e#') return { baseLetter: 2, accidental: 1 };
      if (lower === 'eses' || lower === 'ebb') return { baseLetter: 2, accidental: -2 };
      if (lower === 'es' || lower === 'eb') return { baseLetter: 2, accidental: -1 };
      return { baseLetter: 2, accidental: 0 };
    }
    if (lower.startsWith('f')) {
      if (lower === 'fisis' || lower === 'f##') return { baseLetter: 3, accidental: 2 };
      if (lower === 'fis' || lower === 'f#') return { baseLetter: 3, accidental: 1 };
      if (lower === 'feses' || lower === 'fbb') return { baseLetter: 3, accidental: -2 };
      if (lower === 'fes' || lower === 'fb') return { baseLetter: 3, accidental: -1 };
      return { baseLetter: 3, accidental: 0 };
    }
    if (lower.startsWith('g')) {
      if (lower === 'gisis' || lower === 'g##') return { baseLetter: 4, accidental: 2 };
      if (lower === 'gis' || lower === 'g#') return { baseLetter: 4, accidental: 1 };
      if (lower === 'geses' || lower === 'gbb') return { baseLetter: 4, accidental: -2 };
      if (lower === 'ges' || lower === 'gb') return { baseLetter: 4, accidental: -1 };
      return { baseLetter: 4, accidental: 0 };
    }
    if (lower.startsWith('a')) {
      if (lower === 'aisis' || lower === 'a##') return { baseLetter: 5, accidental: 2 };
      if (lower === 'ais' || lower === 'a#') return { baseLetter: 5, accidental: 1 };
      if (lower === 'asas' || lower === 'abb') return { baseLetter: 5, accidental: -2 };
      if (lower === 'as' || lower === 'ab') return { baseLetter: 5, accidental: -1 };
      return { baseLetter: 5, accidental: 0 };
    }

    // Legacy Russian letter fallback
    const ruLetters = ['до', 'ре', 'ми', 'фа', 'соль', 'ля', 'си'];
    for (let i = 0; i < ruLetters.length; i++) {
      if (lower.startsWith(ruLetters[i])) {
        const rest = lower.slice(ruLetters[i].length);
        let accidental = 0;
        if (rest.includes('𝄪') || rest.includes('##')) accidental = 2;
        else if (rest.includes('♯') || rest.includes('#')) accidental = 1;
        else if (rest.includes('𝄫') || rest.includes('bb')) accidental = -2;
        else if (rest.includes('♭') || rest.includes('b')) accidental = -1;
        return { baseLetter: i, accidental };
      }
    }
  }

  // Fallback to pitch class standard mapping
  const pitchClass = ((rootMidi % 12) + 12) % 12;
  switch (pitchClass) {
    case 0: return { baseLetter: 0, accidental: 0 }; // C
    case 1: return { baseLetter: 0, accidental: 1 }; // Cis
    case 2: return { baseLetter: 1, accidental: 0 }; // D
    case 3: return { baseLetter: 2, accidental: -1 }; // Es
    case 4: return { baseLetter: 2, accidental: 0 }; // E
    case 5: return { baseLetter: 3, accidental: 0 }; // F
    case 6: return { baseLetter: 3, accidental: 1 }; // Fis
    case 7: return { baseLetter: 4, accidental: 0 }; // G
    case 8: return { baseLetter: 5, accidental: -1 }; // As
    case 9: return { baseLetter: 5, accidental: 0 }; // A
    case 10: return { baseLetter: 6, accidental: -1 }; // B
    case 11: return { baseLetter: 6, accidental: 0 }; // H
    default: return { baseLetter: 0, accidental: 0 };
  }
}

/**
 * Returns the exact diatonic degree step distance (1 = second, 2 = third, etc.)
 * for each consecutive pair of notes in an item.
 */
export function getItemDiatonicSteps(item: MusicItem): number[] {
  // Simple intervals: the interval number gives the degree distance!
  if (item.category === 'simple_intervals') {
    switch (item.id) {
      case 'm2':
      case 'b2':
        return [1]; // секунда = 1 шаг буквы
      case 'm3':
      case 'b3':
        return [2]; // терция = 2 шага буквы
      case 'ch4':
      case 'tritone':
        return [3]; // кварта = 3 шага буквы (ув.4)
      case 'ch5':
        return [4]; // квинта = 4 шага буквы
      case 'm6':
      case 'b6':
        return [5]; // секста = 5 шагов буквы
      case 'm7':
      case 'b7':
        return [6]; // септима = 6 шагов буквы
      case 'ch8':
        return [7]; // октава = 7 шагов буквы
      default:
        return [1];
    }
  }

  // Characteristic intervals
  if (item.category === 'characteristic_intervals') {
    switch (item.id) {
      case 'char_uv2':
        return [1]; // ув.2 = секунда (1 шаг)
      case 'char_um7':
        return [6]; // ум.7 = септима (6 шагов)
      case 'char_um4':
        return [3]; // ум.4 = кварта (3 шага)
      case 'char_uv5':
        return [4]; // ув.5 = квинта (4 шага)
      case 'char_uv4_b6':
      case 'char_uv4_m6':
      case 'char_uv4_tritone':
        return [3]; // ув.4 = кварта (3 шага)
      case 'char_um5_b3':
      case 'char_um5_m3':
      case 'char_um5_tritone':
        return [4]; // ум.5 = квинта (4 шага)
      default:
        return [1];
    }
  }

  // Triads and inversions:
  if (item.category === 'triads') {
    switch (item.id) {
      case 'triad_maj':
      case 'triad_min':
      case 'triad_aug':
      case 'triad_dim':
        return [2, 2]; // терция + терция
      case 'triad_maj6':
      case 'triad_min6':
        return [2, 3]; // терция + кварта
      case 'triad_maj64':
      case 'triad_min64':
        return [3, 2]; // кварта + терция
      default:
        return [2, 2];
    }
  }

  // Seventh chords:
  if (item.category === 'seventh_chords') {
    return [2, 2, 2]; // терция + терция + терция
  }

  // D7 Inversions:
  if (item.category === 'd7_inversions') {
    switch (item.id) {
      case 'd7':
        return [2, 2, 2]; // терция + терция + терция
      case 'd7_65':
        return [2, 2, 1]; // терция + терция + секунда
      case 'd7_43':
        return [2, 1, 2]; // терция + секунда + терция
      case 'd7_2':
        return [1, 2, 2]; // секунда + терция + терция
      default:
        return [2, 2, 1];
    }
  }

  // Pentatonics:
  if (item.id === 'mode_pentatonic_maj') {
    return [1, 1, 2, 1];
  }
  if (item.id === 'mode_pentatonic_min') {
    return [2, 1, 1, 2];
  }

  // All 7-step and 8-step scales/modes:
  const count = item.semitones.length - 1;
  return Array(count).fill(1);
}

/**
 * Formats a note name with strict musical spelling:
 * The letter is determined by the diatonic degree; accidentals (♯, ♭, 𝄪, 𝄫)
 * are calculated by the difference between actual pitch class and natural pitch class.
 */
export function formatDiatonicNote(letterIdx: number, pitchClass: number): string {
  const normLetter = ((letterIdx % 7) + 7) % 7;
  const naturalSemitone = NATURAL_SEMITONES[normLetter];

  let diff = (pitchClass - naturalSemitone + 12) % 12;
  if (diff > 6) diff -= 12;

  switch (normLetter) {
    case 0: // C
      if (diff === 0) return 'C';
      if (diff === 1) return 'Cis';
      if (diff === 2) return 'Cisis';
      if (diff === -1) return 'Ces';
      if (diff === -2) return 'Ceses';
      break;
    case 1: // D
      if (diff === 0) return 'D';
      if (diff === 1) return 'Dis';
      if (diff === 2) return 'Disis';
      if (diff === -1) return 'Des';
      if (diff === -2) return 'Deses';
      break;
    case 2: // E
      if (diff === 0) return 'E';
      if (diff === 1) return 'Eis';
      if (diff === 2) return 'Eisis';
      if (diff === -1) return 'Es';
      if (diff === -2) return 'Eses';
      break;
    case 3: // F
      if (diff === 0) return 'F';
      if (diff === 1) return 'Fis';
      if (diff === 2) return 'Fisis';
      if (diff === -1) return 'Fes';
      if (diff === -2) return 'Feses';
      break;
    case 4: // G
      if (diff === 0) return 'G';
      if (diff === 1) return 'Gis';
      if (diff === 2) return 'Gisis';
      if (diff === -1) return 'Ges';
      if (diff === -2) return 'Geses';
      break;
    case 5: // A
      if (diff === 0) return 'A';
      if (diff === 1) return 'Ais';
      if (diff === 2) return 'Aisis';
      if (diff === -1) return 'As';
      if (diff === -2) return 'Asas';
      break;
    case 6: // H (German / European Solfege)
      if (diff === 0) return 'H';
      if (diff === 1) return 'His';
      if (diff === 2) return 'Hisis';
      if (diff === -1) return 'B';
      if (diff === -2) return 'Heses';
      break;
  }
  return BASE_LETTERS[normLetter];
}

/**
 * Names an interval based on the diatonic degree step and semitone count.
 */
export function getIntervalNameByStep(letterStep: number, semitones: number): string {
  const normStep = ((letterStep % 7) + 7) % 7;
  const s = Math.abs(semitones);

  if (normStep === 1) {
    if (s === 1) return 'м.2';
    if (s === 2) return 'б.2';
    if (s === 3) return 'ув.2';
    if (s === 0) return 'ум.2';
    return `${s} пт`;
  }
  if (normStep === 2) {
    if (s === 2) return 'ум.3';
    if (s === 3) return 'м.3';
    if (s === 4) return 'б.3';
    if (s === 5) return 'ув.3';
    return `${s} пт`;
  }
  if (normStep === 3) {
    if (s === 4) return 'ум.4';
    if (s === 5) return 'ч.4';
    if (s === 6) return 'ув.4 (тритон)';
    return `${s} пт`;
  }
  if (normStep === 4) {
    if (s === 6) return 'ум.5 (тритон)';
    if (s === 7) return 'ч.5';
    if (s === 8) return 'ув.5';
    return `${s} пт`;
  }
  if (normStep === 5) {
    if (s === 7) return 'ум.6';
    if (s === 8) return 'м.6';
    if (s === 9) return 'б.6';
    if (s === 10) return 'ув.6';
    return `${s} пт`;
  }
  if (normStep === 6) {
    if (s === 9) return 'ум.7';
    if (s === 10) return 'м.7';
    if (s === 11) return 'б.7';
    return `${s} пт`;
  }
  if (normStep === 0 || normStep === 7) {
    if (s === 12) return 'ч.8';
    if (s === 0) return 'ч.1';
  }

  return `${s} пт`;
}

/**
 * Calculates the exact note sequence for playback and display.
 * When playing 'down', intervals are reversed so the harmonic structure
 * is identical to the chord/scale, but descending from rootMidi.
 */
export function calculateItemNotes(
  item: MusicItem,
  rootMidi: number,
  direction: 'up' | 'down'
): number[] {
  if (direction === 'up' || item.forceAscendingOnly) {
    return item.semitones.map((s) => rootMidi + s);
  }

  // Calculate adjacent intervals between consecutive notes from bottom to top:
  const intervals: number[] = [];
  for (let i = 0; i < item.semitones.length - 1; i++) {
    intervals.push(item.semitones[i + 1] - item.semitones[i]);
  }

  // Reverse intervals to descend from the given root note:
  const reversedIntervals = [...intervals].reverse();

  const notes: number[] = [rootMidi];
  let currentMidi = rootMidi;
  for (const interval of reversedIntervals) {
    currentMidi -= interval;
    notes.push(currentMidi);
  }

  return notes;
}

/**
 * Determines the true tertian root (прима, основной тон) of a chord/inversion.
 * E.g. for a minor 6/4 starting on F# upward: [F#, B, D], root is B (Си).
 */
export function getChordRootNoteName(
  item: MusicItem,
  noteNames: string[],
  direction: 'up' | 'down'
): string {
  const isUp = direction === 'up' || item.forceAscendingOnly;

  switch (item.id) {
    // 5/3 triads: root position
    case 'triad_maj':
    case 'triad_min':
    case 'triad_aug':
    case 'triad_dim':
      return isUp ? noteNames[0] : noteNames[noteNames.length - 1];

    // 6 sextaccords (1st inversion, root is 6th above bass):
    // Ascending [3rd, 5th, Root] -> noteNames[2]
    // Descending [Root, 5th, 3rd] -> noteNames[0]
    case 'triad_maj6':
    case 'triad_min6':
      return isUp ? noteNames[2] : noteNames[0];

    // 6/4 quartsextaccords (2nd inversion, root is 4th above bass, tertian start):
    // Ascending [5th, Root, 3rd] -> noteNames[1]
    // Descending [3rd, Root, 5th] -> noteNames[1]
    case 'triad_maj64':
    case 'triad_min64':
      return noteNames[1];

    // Root-position seventh chords:
    case 'seventh_mb7':
    case 'seventh_bb7':
    case 'seventh_bm7':
    case 'seventh_mm7':
    case 'seventh_mum7':
    case 'seventh_umum7':
    case 'seventh_bum7':
    case 'seventh_buv7':
      return isUp ? noteNames[0] : noteNames[noteNames.length - 1];

    // D7 Inversions:
    // D6/5: [3rd (VII), 5th (II), 7th (IV), Root (V)]
    // Ascending: noteNames[3] (Root)
    // Descending: noteNames[0] (Root)
    case 'd7_65':
      return isUp ? noteNames[3] : noteNames[0];

    // D4/3: [5th (II), 7th (IV), Root (V), 3rd (VII)]
    // Ascending: noteNames[2] (Root)
    // Descending: noteNames[1] (Root)
    case 'd7_43':
      return isUp ? noteNames[2] : noteNames[1];

    // D2: [7th (IV), Root (V), 3rd (VII), 5th (II)]
    // Ascending: noteNames[1] (Root)
    // Descending: noteNames[2] (Root)
    case 'd7_2':
      return isUp ? noteNames[1] : noteNames[2];

    default:
      return isUp ? noteNames[0] : noteNames[noteNames.length - 1];
  }
}

/**
 * Formats the full chord name with its tertian root tone (основной тон).
 * E.g. "Си минорный квартсекстаккорд (М6/4)", "Соль D6/5 (на VII ст.)".
 */
export function getChordFullNameWithRoot(item: MusicItem, rootTone: string): string {
  switch (item.id) {
    case 'triad_maj':
      return `${rootTone} мажорное трезвучие (Б5/3)`;
    case 'triad_min':
      return `${rootTone} минорное трезвучие (М5/3)`;
    case 'triad_aug':
      return `${rootTone} увеличенное трезвучие (Ув5/3)`;
    case 'triad_dim':
      return `${rootTone} уменьшенное трезвучие (Ум5/3)`;
    case 'triad_maj6':
      return `${rootTone} мажорный секстаккорд (Б6)`;
    case 'triad_min6':
      return `${rootTone} минорный секстаккорд (М6)`;
    case 'triad_maj64':
      return `${rootTone} мажорный квартсекстаккорд (Б6/4)`;
    case 'triad_min64':
      return `${rootTone} минорный квартсекстаккорд (М6/4)`;
    case 'seventh_mb7':
      return `${rootTone} малый мажорный септаккорд (D7)`;
    case 'seventh_bb7':
      return `${rootTone} большой мажорный септаккорд (ББ7)`;
    case 'seventh_bm7':
      return `${rootTone} большой минорный септаккорд (БМ7)`;
    case 'seventh_mm7':
      return `${rootTone} малый минорный септаккорд (ММ7)`;
    case 'seventh_mum7':
      return `${rootTone} малый уменьшенный септаккорд (МУм7)`;
    case 'seventh_umum7':
      return `${rootTone} уменьшенный септаккорд (УмУм7)`;
    case 'seventh_bum7':
      return `${rootTone} большой уменьшенный септаккорд (Бум7)`;
    case 'seventh_buv7':
      return `${rootTone} большой увеличенный септаккорд (Був7)`;
    case 'd7':
      return `${rootTone} D7 (на V)`;
    case 'd7_65':
      return `${rootTone} D6/5 (на VII)`;
    case 'd7_43':
      return `${rootTone} D4/3 (на II)`;
    case 'd7_2':
      return `${rootTone} D2 (на IV)`;
    default:
      return `${item.name} от ${rootTone}`;
  }
}

export function getItemDegreeLabels(item: MusicItem, noteCount: number, direction: 'up' | 'down'): string[] {
  const isUp = direction === 'up';

  // Scales & Modes:
  if (item.category === 'scales' || item.category === 'modes') {
    const specialMap: Record<string, Record<number, string>> = {
      mode_dorian: { 6: 'VI♯' },
      mode_phrygian: { 2: 'II♭' },
      mode_lydian: { 4: 'IV♯' },
      mode_mixolydian: { 7: 'VII♭' },
      mode_locrian: { 2: 'II♭', 5: 'V♭' },
      scale_harm_maj: { 6: 'VI♭' },
      scale_mel_maj: { 6: 'VI♭', 7: 'VII♭' },
      scale_harm_min: { 7: 'VII♯' },
      scale_mel_min: { 6: 'VI♯', 7: 'VII♯' },
      scale_double_harm_maj: { 2: 'II♭', 6: 'VI♭' },
      scale_double_harm_min: { 4: 'IV♯', 7: 'VII♯' },
    };

    const specials = specialMap[item.id] || {};

    const romanAsc = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'];
    const romanNumAsc = [1, 2, 3, 4, 5, 6, 7, 8];

    const romanDesc = ['I', 'VII', 'VI', 'V', 'IV', 'III', 'II', 'I'];
    const romanNumDesc = [1, 7, 6, 5, 4, 3, 2, 1];

    if (isUp) {
      return romanNumAsc.slice(0, noteCount).map((num, i) => specials[num] || romanAsc[i]);
    } else {
      return romanNumDesc.slice(0, noteCount).map((num, i) => specials[num] || romanDesc[i]);
    }
  }

  // Triads:
  if (item.category === 'triads') {
    switch (item.id) {
      case 'triad_maj6':
      case 'triad_min6':
        return isUp ? ['3 (терция)', '5 (квинта)', '1 (прима)'] : ['1 (прима)', '5 (квинта)', '3 (терция)'];
      case 'triad_maj64':
      case 'triad_min64':
        return isUp ? ['5 (квинта)', '1 (прима)', '3 (терция)'] : ['3 (терция)', '1 (прима)', '5 (квинта)'];
      default:
        return isUp ? ['1 (прима)', '3 (терция)', '5 (квинта)'] : ['5 (квинта)', '3 (терция)', '1 (прима)'];
    }
  }

  // Seventh chords:
  if (item.category === 'seventh_chords') {
    return isUp
      ? ['1 (прима)', '3 (терция)', '5 (квинта)', '7 (септима)']
      : ['7 (септима)', '5 (квинта)', '3 (терция)', '1 (прима)'];
  }

  // D7 Inversions:
  if (item.category === 'd7_inversions') {
    switch (item.id) {
      case 'd7_65':
        return isUp
          ? ['3 (терция)', '5 (квинта)', '7 (септима)', '1 (прима)']
          : ['1 (прима)', '7 (септима)', '5 (квинта)', '3 (терция)'];
      case 'd7_43':
        return isUp
          ? ['5 (квинта)', '7 (септима)', '1 (прима)', '3 (терция)']
          : ['3 (терция)', '1 (прима)', '7 (септима)', '5 (квинта)'];
      case 'd7_2':
        return isUp
          ? ['7 (септима)', '1 (прима)', '3 (терция)', '5 (квинта)']
          : ['5 (квинта)', '3 (терция)', '1 (прима)', '7 (септима)'];
      default:
        return isUp
          ? ['1 (прима)', '3 (терция)', '5 (квинта)', '7 (септима)']
          : ['7 (септима)', '5 (квинта)', '3 (терция)', '1 (прима)'];
    }
  }

  // Simple and characteristic intervals:
  if (isUp) {
    return ['1-й звук', '2-й звук'];
  } else {
    return ['1-й звук', '2-й звук'];
  }
}

/**
 * Generates detailed solfège breakdown of the construction for the UI.
 * Follows strict diatonic spelling and provides the chord root tone name.
 */
export function getConstructionBreakdown(
  item: MusicItem,
  rootMidi: number,
  direction: 'up' | 'down',
  rootNoteName?: string
): ConstructionBreakdown {
  const rootInfo = parseRootNote(rootMidi, rootNoteName);
  let currentLetter = rootInfo.baseLetter;
  let currentMidi = rootMidi;

  // Semitone steps between consecutive notes:
  const semitoneSteps: number[] = [];
  for (let i = 0; i < item.semitones.length - 1; i++) {
    semitoneSteps.push(item.semitones[i + 1] - item.semitones[i]);
  }
  const letterSteps = getItemDiatonicSteps(item);

  const notesMidi: number[] = [rootMidi];
  const noteNames: string[] = [formatDiatonicNote(currentLetter, ((currentMidi % 12) + 12) % 12)];
  const steps: SolfegeStep[] = [];

  const isUp = direction === 'up' || item.forceAscendingOnly;

  if (isUp) {
    for (let i = 0; i < semitoneSteps.length; i++) {
      const lStep = letterSteps[i] ?? 1;
      const sStep = semitoneSteps[i];
      const prevLetter = currentLetter;
      const prevName = noteNames[noteNames.length - 1];

      currentLetter = (currentLetter + lStep) % 7;
      currentMidi += sStep;

      const nextName = formatDiatonicNote(currentLetter, ((currentMidi % 12) + 12) % 12);
      notesMidi.push(currentMidi);
      noteNames.push(nextName);

      steps.push({
        fromNote: prevName,
        toNote: nextName,
        intervalName: getIntervalNameByStep(lStep, sStep),
        semitones: sStep,
      });
    }
  } else {
    // Descending direction: reverse the interval steps!
    const revSemiSteps = [...semitoneSteps].reverse();
    const revLetterSteps = [...letterSteps].reverse();

    for (let i = 0; i < revSemiSteps.length; i++) {
      const lStep = revLetterSteps[i] ?? 1;
      const sStep = revSemiSteps[i];
      const prevName = noteNames[noteNames.length - 1];

      currentLetter = (currentLetter - lStep + 700) % 7;
      currentMidi -= sStep;

      const nextName = formatDiatonicNote(currentLetter, ((currentMidi % 12) + 12) % 12);
      notesMidi.push(currentMidi);
      noteNames.push(nextName);

      steps.push({
        fromNote: prevName,
        toNote: nextName,
        intervalName: getIntervalNameByStep(lStep, sStep),
        semitones: sStep,
      });
    }
  }

  const isChord = ['triads', 'seventh_chords', 'd7_inversions'].includes(item.category);
  // True tertian root for chords, or base note for intervals/scales:
  const chordBaseNoteName = isChord
    ? getChordRootNoteName(item, noteNames, direction)
    : isUp
    ? noteNames[0]
    : noteNames[noteNames.length - 1];
  const chordRootIndex = noteNames.indexOf(chordBaseNoteName);
  const chordBaseMidi = chordRootIndex !== -1 ? notesMidi[chordRootIndex] : Math.min(...notesMidi);
  const totalSpan = Math.max(...notesMidi) - Math.min(...notesMidi);

  const degreeLabels = getItemDegreeLabels(item, noteNames.length, direction);

  const fullChordTitle = isChord
    ? getChordFullNameWithRoot(item, chordBaseNoteName)
    : item.name;

  return {
    notesMidi,
    noteNames,
    degreeLabels,
    steps,
    chordBaseNoteName,
    chordBaseMidi,
    direction,
    totalSpan,
    fullChordTitle,
  };
}

export interface CharacteristicResolution {
  tonality: string;
  resolvedIntervalName: string;
  resolvedNotesString: string;
  voiceMovements: {
    from: string;
    degreeFrom: string;
    to: string;
    degreeTo: string;
  }[];
  isTritoneDouble?: boolean;
  uv4Resolution?: CharacteristicResolution;
  um5Resolution?: CharacteristicResolution;
}

export function getCharacteristicResolution(
  item: MusicItem,
  notesMidi: number[],
  noteNames: string[],
  direction: 'up' | 'down'
): CharacteristicResolution | null {
  if (
    item.category !== 'characteristic_intervals' &&
    item.category !== 'd7_inversions' &&
    item.id !== 'seventh_mb7' &&
    item.id !== 'tritone'
  ) {
    return null;
  }

  const isUp = direction === 'up';
  const lowerNoteName = isUp ? noteNames[0] : noteNames[noteNames.length - 1];
  const upperNoteName = isUp ? noteNames[noteNames.length - 1] : noteNames[0];
  const lowerMidi = isUp ? notesMidi[0] : notesMidi[notesMidi.length - 1];
  const upperMidi = isUp ? notesMidi[notesMidi.length - 1] : notesMidi[0];

  const parsedLower = parseRootNote(lowerMidi, lowerNoteName);
  const parsedUpper = parseRootNote(upperMidi, upperNoteName);

  let tonality = '';
  let resolvedIntervalName = '';
  let resLowerName = '';
  let resUpperName = '';
  let vm1 = { from: '', degreeFrom: '', to: '', degreeTo: '' };
  let vm2 = { from: '', degreeFrom: '', to: '', degreeTo: '' };

  switch (item.id) {
    // -------------------------------------------------------------
    // D7 AND D7 INVERSIONS:
    // -------------------------------------------------------------
    case 'seventh_mb7': {
      // D7: V, VII, II, IV -> Т5/3
      const bassIdx = isUp ? 0 : 3;
      const parsedBass = parseRootNote(notesMidi[bassIdx], noteNames[bassIdx]);
      const tonicLetter = (parsedBass.baseLetter + 3) % 7;
      const tonicMidi = notesMidi[bassIdx] + 5;
      const tonicName = formatDiatonicNote(tonicLetter, ((tonicMidi % 12) + 12) % 12);

      const mediantLetter = (tonicLetter + 2) % 7;
      const mediantMidi = tonicMidi + 4;
      const mediantName = formatDiatonicNote(mediantLetter, ((mediantMidi % 12) + 12) % 12);

      tonality = `${tonicName} мажор / ${tonicName} минор`;
      resolvedIntervalName = 'Т5/3 / Т3';

      const vmD7 = isUp
        ? [
            { from: noteNames[0], degreeFrom: 'V', to: tonicName, degreeTo: 'I' },
            { from: noteNames[1], degreeFrom: 'VII', to: tonicName, degreeTo: 'I' },
            { from: noteNames[2], degreeFrom: 'II', to: tonicName, degreeTo: 'I' },
            { from: noteNames[3], degreeFrom: 'IV', to: mediantName, degreeTo: 'III' },
          ]
        : [
            { from: noteNames[3], degreeFrom: 'V', to: tonicName, degreeTo: 'I' },
            { from: noteNames[2], degreeFrom: 'VII', to: tonicName, degreeTo: 'I' },
            { from: noteNames[1], degreeFrom: 'II', to: tonicName, degreeTo: 'I' },
            { from: noteNames[0], degreeFrom: 'IV', to: mediantName, degreeTo: 'III' },
          ];

      return {
        tonality,
        resolvedIntervalName,
        resolvedNotesString: `${tonicName} — ${tonicName} — ${mediantName}`,
        voiceMovements: vmD7,
      };
    }

    case 'd7_65': {
      // D6/5 (на VII): VII, II, IV, V -> Т5/3
      const bassIdx = isUp ? 0 : 3;
      const parsedBass = parseRootNote(notesMidi[bassIdx], noteNames[bassIdx]);
      const tonicLetter = (parsedBass.baseLetter + 1) % 7;
      const tonicMidi = notesMidi[bassIdx] + 1;
      const tonicName = formatDiatonicNote(tonicLetter, ((tonicMidi % 12) + 12) % 12);

      const mediantLetter = (tonicLetter + 2) % 7;
      const mediantMidi = tonicMidi + 4;
      const mediantName = formatDiatonicNote(mediantLetter, ((mediantMidi % 12) + 12) % 12);

      const domLetter = (tonicLetter + 4) % 7;
      const domMidi = tonicMidi + 7;
      const domName = formatDiatonicNote(domLetter, ((domMidi % 12) + 12) % 12);

      tonality = `${tonicName} мажор / ${tonicName} минор`;
      resolvedIntervalName = 'Т5/3';

      const vm65 = isUp
        ? [
            { from: noteNames[0], degreeFrom: 'VII', to: tonicName, degreeTo: 'I' },
            { from: noteNames[1], degreeFrom: 'II', to: tonicName, degreeTo: 'I' },
            { from: noteNames[2], degreeFrom: 'IV', to: mediantName, degreeTo: 'III' },
            { from: noteNames[3], degreeFrom: 'V', to: domName, degreeTo: 'V' },
          ]
        : [
            { from: noteNames[3], degreeFrom: 'VII', to: tonicName, degreeTo: 'I' },
            { from: noteNames[2], degreeFrom: 'II', to: tonicName, degreeTo: 'I' },
            { from: noteNames[1], degreeFrom: 'IV', to: mediantName, degreeTo: 'III' },
            { from: noteNames[0], degreeFrom: 'V', to: domName, degreeTo: 'V' },
          ];

      return {
        tonality,
        resolvedIntervalName,
        resolvedNotesString: `${tonicName} — ${mediantName} — ${domName} — ${tonicName}`,
        voiceMovements: vm65,
      };
    }

    case 'd7_43': {
      // D4/3 (на II): II, IV, V, VII -> Т5/3
      const bassIdx = isUp ? 0 : 3;
      const parsedBass = parseRootNote(notesMidi[bassIdx], noteNames[bassIdx]);
      const tonicLetter = (parsedBass.baseLetter - 1 + 7) % 7;
      const tonicMidi = notesMidi[bassIdx] - 2;
      const tonicName = formatDiatonicNote(tonicLetter, ((tonicMidi % 12) + 12) % 12);

      const mediantLetter = (tonicLetter + 2) % 7;
      const mediantMidi = tonicMidi + 4;
      const mediantName = formatDiatonicNote(mediantLetter, ((mediantMidi % 12) + 12) % 12);

      const domLetter = (tonicLetter + 4) % 7;
      const domMidi = tonicMidi + 7;
      const domName = formatDiatonicNote(domLetter, ((domMidi % 12) + 12) % 12);

      tonality = `${tonicName} мажор / ${tonicName} минор`;
      resolvedIntervalName = 'Т5/3';

      const vm43 = isUp
        ? [
            { from: noteNames[0], degreeFrom: 'II', to: tonicName, degreeTo: 'I' },
            { from: noteNames[1], degreeFrom: 'IV', to: mediantName, degreeTo: 'III' },
            { from: noteNames[2], degreeFrom: 'V', to: domName, degreeTo: 'V' },
            { from: noteNames[3], degreeFrom: 'VII', to: tonicName, degreeTo: 'I' },
          ]
        : [
            { from: noteNames[3], degreeFrom: 'II', to: tonicName, degreeTo: 'I' },
            { from: noteNames[2], degreeFrom: 'IV', to: mediantName, degreeTo: 'III' },
            { from: noteNames[1], degreeFrom: 'V', to: domName, degreeTo: 'V' },
            { from: noteNames[0], degreeFrom: 'VII', to: tonicName, degreeTo: 'I' },
          ];

      return {
        tonality,
        resolvedIntervalName,
        resolvedNotesString: `${tonicName} — ${mediantName} — ${domName} — ${tonicName}`,
        voiceMovements: vm43,
      };
    }

    case 'd7_2': {
      // D2 (на IV): IV, V, VII, II -> Т6
      const bassIdx = isUp ? 0 : 3;
      const parsedBass = parseRootNote(notesMidi[bassIdx], noteNames[bassIdx]);
      const tonicLetter = (parsedBass.baseLetter - 3 + 7) % 7;
      const tonicMidi = notesMidi[bassIdx] - 5;
      const tonicName = formatDiatonicNote(tonicLetter, ((tonicMidi % 12) + 12) % 12);

      const mediantLetter = (tonicLetter + 2) % 7;
      const mediantMidi = tonicMidi + 4;
      const mediantName = formatDiatonicNote(mediantLetter, ((mediantMidi % 12) + 12) % 12);

      const domLetter = (tonicLetter + 4) % 7;
      const domMidi = tonicMidi + 7;
      const domName = formatDiatonicNote(domLetter, ((domMidi % 12) + 12) % 12);

      tonality = `${tonicName} мажор / ${tonicName} минор`;
      resolvedIntervalName = 'Т6';

      const vm2 = isUp
        ? [
            { from: noteNames[0], degreeFrom: 'IV', to: mediantName, degreeTo: 'III' },
            { from: noteNames[1], degreeFrom: 'V', to: domName, degreeTo: 'V' },
            { from: noteNames[2], degreeFrom: 'VII', to: tonicName, degreeTo: 'I' },
            { from: noteNames[3], degreeFrom: 'II', to: tonicName, degreeTo: 'I' },
          ]
        : [
            { from: noteNames[3], degreeFrom: 'IV', to: mediantName, degreeTo: 'III' },
            { from: noteNames[2], degreeFrom: 'V', to: domName, degreeTo: 'V' },
            { from: noteNames[1], degreeFrom: 'VII', to: tonicName, degreeTo: 'I' },
            { from: noteNames[0], degreeFrom: 'II', to: tonicName, degreeTo: 'I' },
          ];

      return {
        tonality,
        resolvedIntervalName,
        resolvedNotesString: `${mediantName} — ${domName} — ${tonicName} — ${tonicName}`,
        voiceMovements: vm2,
      };
    }

    // -------------------------------------------------------------
    // CHARACTERISTIC INTERVALS:
    // -------------------------------------------------------------
    case 'char_uv2': {
      // Lower: VI, Upper: VII# -> ч.4
      const resLowerLetter = (parsedLower.baseLetter - 1 + 7) % 7;
      const resLowerMidi = lowerMidi - 1;
      resLowerName = formatDiatonicNote(resLowerLetter, ((resLowerMidi % 12) + 12) % 12);

      const resUpperLetter = (parsedUpper.baseLetter + 1) % 7;
      const resUpperMidi = upperMidi + 1;
      resUpperName = formatDiatonicNote(resUpperLetter, ((resUpperMidi % 12) + 12) % 12);

      tonality = `${resUpperName} минор (гарм.) / ${resUpperName} мажор (гарм.)`;
      resolvedIntervalName = 'ч.4';

      vm1 = {
        from: lowerNoteName,
        degreeFrom: 'VI',
        to: resLowerName,
        degreeTo: 'V',
      };
      vm2 = {
        from: upperNoteName,
        degreeFrom: 'VII♯',
        to: resUpperName,
        degreeTo: 'I',
      };
      break;
    }

    case 'char_um7': {
      // Lower: VII#, Upper: VI -> ч.5
      const resLowerLetter = (parsedLower.baseLetter + 1) % 7;
      const resLowerMidi = lowerMidi + 1;
      resLowerName = formatDiatonicNote(resLowerLetter, ((resLowerMidi % 12) + 12) % 12);

      const resUpperLetter = (parsedUpper.baseLetter - 1 + 7) % 7;
      const resUpperMidi = upperMidi - 1;
      resUpperName = formatDiatonicNote(resUpperLetter, ((resUpperMidi % 12) + 12) % 12);

      tonality = `${resLowerName} минор (гарм.) / ${resLowerName} мажор (гарм.)`;
      resolvedIntervalName = 'ч.5';

      vm1 = {
        from: lowerNoteName,
        degreeFrom: 'VII♯',
        to: resLowerName,
        degreeTo: 'I',
      };
      vm2 = {
        from: upperNoteName,
        degreeFrom: 'VI',
        to: resUpperName,
        degreeTo: 'V',
      };
      break;
    }

    case 'char_um4': {
      // Lower: VII#, Upper: III -> м.3
      const resLowerLetter = (parsedLower.baseLetter + 1) % 7;
      const resLowerMidi = lowerMidi + 1;
      resLowerName = formatDiatonicNote(resLowerLetter, ((resLowerMidi % 12) + 12) % 12);
      resUpperName = upperNoteName;

      tonality = `${resLowerName} минор (гарм.)`;
      resolvedIntervalName = 'м.3';

      vm1 = {
        from: lowerNoteName,
        degreeFrom: 'VII♯',
        to: resLowerName,
        degreeTo: 'I',
      };
      vm2 = {
        from: upperNoteName,
        degreeFrom: 'III',
        to: resUpperName,
        degreeTo: 'III',
      };
      break;
    }

    case 'char_uv5': {
      // Lower: III, Upper: VII# -> б.6
      resLowerName = lowerNoteName;
      const resUpperLetter = (parsedUpper.baseLetter + 1) % 7;
      const resUpperMidi = upperMidi + 1;
      resUpperName = formatDiatonicNote(resUpperLetter, ((resUpperMidi % 12) + 12) % 12);

      tonality = `${resUpperName} минор (гарм.)`;
      resolvedIntervalName = 'б.6';

      vm1 = {
        from: lowerNoteName,
        degreeFrom: 'III',
        to: resLowerName,
        degreeTo: 'III',
      };
      vm2 = {
        from: upperNoteName,
        degreeFrom: 'VII♯',
        to: resUpperName,
        degreeTo: 'I',
      };
      break;
    }

    case 'char_uv4_b6': {
      // ув.4 в мажоре: IV -> III, VII -> I -> б.6
      const resLowerLetter = (parsedLower.baseLetter - 1 + 7) % 7;
      const resLowerMidi = lowerMidi - 1;
      resLowerName = formatDiatonicNote(resLowerLetter, ((resLowerMidi % 12) + 12) % 12);

      const resUpperLetter = (parsedUpper.baseLetter + 1) % 7;
      const resUpperMidi = upperMidi + 1;
      resUpperName = formatDiatonicNote(resUpperLetter, ((resUpperMidi % 12) + 12) % 12);

      tonality = `${resUpperName} мажор`;
      resolvedIntervalName = 'б.6';

      vm1 = {
        from: lowerNoteName,
        degreeFrom: 'IV',
        to: resLowerName,
        degreeTo: 'III',
      };
      vm2 = {
        from: upperNoteName,
        degreeFrom: 'VII',
        to: resUpperName,
        degreeTo: 'I',
      };
      break;
    }

    case 'char_uv4_m6': {
      // ув.4 в миноре: VI -> V, II -> III -> м.6
      const resLowerLetter = (parsedLower.baseLetter - 1 + 7) % 7;
      const resLowerMidi = lowerMidi - 1;
      resLowerName = formatDiatonicNote(resLowerLetter, ((resLowerMidi % 12) + 12) % 12);

      const resUpperLetter = (parsedUpper.baseLetter + 1) % 7;
      const resUpperMidi = upperMidi + 1;
      resUpperName = formatDiatonicNote(resUpperLetter, ((resUpperMidi % 12) + 12) % 12);

      const tonicLetter = (parsedLower.baseLetter + 2) % 7;
      const tonicMidi = lowerMidi + 4;
      const tonicName = formatDiatonicNote(tonicLetter, ((tonicMidi % 12) + 12) % 12);

      tonality = `${tonicName} минор`;
      resolvedIntervalName = 'м.6';

      vm1 = {
        from: lowerNoteName,
        degreeFrom: 'VI',
        to: resLowerName,
        degreeTo: 'V',
      };
      vm2 = {
        from: upperNoteName,
        degreeFrom: 'II',
        to: resUpperName,
        degreeTo: 'III',
      };
      break;
    }

    case 'char_um5_b3': {
      // ум.5 в мажоре: VII -> I, IV -> III -> б.3
      const resLowerLetter = (parsedLower.baseLetter + 1) % 7;
      const resLowerMidi = lowerMidi + 1;
      resLowerName = formatDiatonicNote(resLowerLetter, ((resLowerMidi % 12) + 12) % 12);

      const resUpperLetter = (parsedUpper.baseLetter - 1 + 7) % 7;
      const resUpperMidi = upperMidi - 1;
      resUpperName = formatDiatonicNote(resUpperLetter, ((resUpperMidi % 12) + 12) % 12);

      tonality = `${resLowerName} мажор`;
      resolvedIntervalName = 'б.3';

      vm1 = {
        from: lowerNoteName,
        degreeFrom: 'VII',
        to: resLowerName,
        degreeTo: 'I',
      };
      vm2 = {
        from: upperNoteName,
        degreeFrom: 'IV',
        to: resUpperName,
        degreeTo: 'III',
      };
      break;
    }

    case 'char_um5_m3': {
      // ум.5 в миноре: VII# -> I, IV -> III -> м.3
      const resLowerLetter = (parsedLower.baseLetter + 1) % 7;
      const resLowerMidi = lowerMidi + 1;
      resLowerName = formatDiatonicNote(resLowerLetter, ((resLowerMidi % 12) + 12) % 12);

      const resUpperLetter = (parsedUpper.baseLetter - 1 + 7) % 7;
      const resUpperMidi = upperMidi - 1;
      resUpperName = formatDiatonicNote(resUpperLetter, ((resUpperMidi % 12) + 12) % 12);

      tonality = `${resLowerName} минор (гарм.)`;
      resolvedIntervalName = 'м.3';

      vm1 = {
        from: lowerNoteName,
        degreeFrom: 'VII♯',
        to: resLowerName,
        degreeTo: 'I',
      };
      vm2 = {
        from: upperNoteName,
        degreeFrom: 'IV',
        to: resUpperName,
        degreeTo: 'III',
      };
      break;
    }

    case 'tritone': {
      // 1. Calculate ув.4: bottom.letter, top.letter = bottom.letter + 3
      const uv4BottomLetter = parsedLower.baseLetter;
      const uv4TopLetter = (parsedLower.baseLetter + 3) % 7;
      const uv4BottomNote = formatDiatonicNote(uv4BottomLetter, ((lowerMidi % 12) + 12) % 12);
      const uv4TopNote = formatDiatonicNote(uv4TopLetter, ((upperMidi % 12) + 12) % 12);

      const uv4ResLowerLetter = (uv4BottomLetter - 1 + 7) % 7;
      const uv4ResLowerMidi = lowerMidi - 1;
      const uv4ResLowerNote = formatDiatonicNote(uv4ResLowerLetter, ((uv4ResLowerMidi % 12) + 12) % 12);

      const uv4ResUpperLetter = (uv4TopLetter + 1) % 7;
      const uv4ResUpperMidi = upperMidi + 1;
      const uv4ResUpperNote = formatDiatonicNote(uv4ResUpperLetter, ((uv4ResUpperMidi % 12) + 12) % 12);

      const uv4Resolution: CharacteristicResolution = {
        tonality: `Разрешение как ув.4 (расширение в сексту)`,
        resolvedIntervalName: 'секста (б.6 / м.6)',
        resolvedNotesString: `${uv4ResLowerNote} — ${uv4ResUpperNote}`,
        voiceMovements: [
          { from: uv4BottomNote, degreeFrom: 'ув.4', to: uv4ResLowerNote, degreeTo: 'VI/III' },
          { from: uv4TopNote, degreeFrom: 'ув.4', to: uv4ResUpperNote, degreeTo: 'I' },
        ],
      };

      // 2. Calculate ум.5: bottom.letter, top.letter = bottom.letter + 4
      const um5BottomLetter = parsedLower.baseLetter;
      const um5TopLetter = (parsedLower.baseLetter + 4) % 7;
      const um5BottomNote = formatDiatonicNote(um5BottomLetter, ((lowerMidi % 12) + 12) % 12);
      const um5TopNote = formatDiatonicNote(um5TopLetter, ((upperMidi % 12) + 12) % 12);

      const um5ResLowerLetter = (um5BottomLetter + 1) % 7;
      const um5ResLowerMidi = lowerMidi + 1;
      const um5ResLowerNote = formatDiatonicNote(um5ResLowerLetter, ((um5ResLowerMidi % 12) + 12) % 12);

      const um5ResUpperLetter = (um5TopLetter - 1 + 7) % 7;
      const um5ResUpperMidi = upperMidi - 1;
      const um5ResUpperNote = formatDiatonicNote(um5ResUpperLetter, ((um5ResUpperMidi % 12) + 12) % 12);

      const um5Resolution: CharacteristicResolution = {
        tonality: `Разрешение как ум.5 (сужение в терцию)`,
        resolvedIntervalName: 'терция (б.3 / м.3)',
        resolvedNotesString: `${um5ResLowerNote} — ${um5ResUpperNote}`,
        voiceMovements: [
          { from: um5BottomNote, degreeFrom: 'ум.5', to: um5ResLowerNote, degreeTo: 'I' },
          { from: um5TopNote, degreeFrom: 'ум.5', to: um5ResUpperNote, degreeTo: 'III' },
        ],
      };

      return {
        tonality: 'Разрешение тритона',
        resolvedIntervalName: 'Двойное разрешение',
        resolvedNotesString: `${uv4ResLowerNote}-${uv4ResUpperNote} / ${um5ResLowerNote}-${um5ResUpperNote}`,
        voiceMovements: [],
        isTritoneDouble: true,
        uv4Resolution,
        um5Resolution,
      };
    }

    default:
      return null;
  }

  return {
    tonality,
    resolvedIntervalName,
    resolvedNotesString: `${resLowerName} — ${resUpperName}`,
    voiceMovements: [vm1, vm2],
  };
}

export interface VoiceDegreeRow {
  voiceName: string;
  midi: number;
  noteNameWithOctave: string;
  noteName: string;
  degreeRoman: string;
  degreeNameRu: string;
  roleInChordRu?: string;
  semitonesFromTonic: number;
}

export function getVoiceScaleDegrees(
  midisSortedAsc: number[],
  tonicPitch: number,
  scaleMode: 'major' | 'minor',
  chordRootMidi?: number
): VoiceDegreeRow[] {
  const count = midisSortedAsc.length;
  let voiceNames = ['Бас', 'Тенор', 'Альт', 'Сопрано'];
  if (count === 3) {
    voiceNames = ['Бас', 'Тенор / Альт', 'Сопрано'];
  } else if (count === 2) {
    voiceNames = ['Нижний голос (Бас)', 'Верхний голос (Сопрано)'];
  } else if (count > 4) {
    voiceNames = ['Бас', 'Тенор', 'Альт II', 'Альт I', 'Сопрано'];
  }

  const isMaj = scaleMode === 'major';

  return midisSortedAsc.map((midi, idx) => {
    const pitch = ((midi % 12) + 12) % 12;
    const semitonesFromTonic = ((pitch - tonicPitch) % 12 + 12) % 12;
    const noteName = CHROMATIC_NOTES_UP[pitch];
    const octave = Math.floor(midi / 12) - 1;
    const noteNameWithOctave = `${noteName}${octave}`;

    let degreeRoman = 'I';
    let degreeNameRu = 'I ступень (тоника)';

    if (isMaj) {
      switch (semitonesFromTonic) {
        case 0: degreeRoman = 'I'; degreeNameRu = 'I ступень'; break;
        case 1: degreeRoman = '♭II'; degreeNameRu = '♭II ступень'; break;
        case 2: degreeRoman = 'II'; degreeNameRu = 'II ступень'; break;
        case 3: degreeRoman = '♭III'; degreeNameRu = '♭III ступень'; break;
        case 4: degreeRoman = 'III'; degreeNameRu = 'III ступень'; break;
        case 5: degreeRoman = 'IV'; degreeNameRu = 'IV ступень'; break;
        case 6: degreeRoman = '♯IV'; degreeNameRu = '♯IV ступень'; break;
        case 7: degreeRoman = 'V'; degreeNameRu = 'V ступень'; break;
        case 8: degreeRoman = '♭VI'; degreeNameRu = '♭VI ступень'; break;
        case 9: degreeRoman = 'VI'; degreeNameRu = 'VI ступень'; break;
        case 10: degreeRoman = '♭VII'; degreeNameRu = '♭VII ступень'; break;
        case 11: degreeRoman = 'VII'; degreeNameRu = 'VII ступень'; break;
      }
    } else {
      switch (semitonesFromTonic) {
        case 0: degreeRoman = 'I'; degreeNameRu = 'I ступень'; break;
        case 1: degreeRoman = '♭II'; degreeNameRu = '♭II ступень'; break;
        case 2: degreeRoman = 'II'; degreeNameRu = 'II ступень'; break;
        case 3: degreeRoman = 'III'; degreeNameRu = 'III ступень'; break;
        case 4: degreeRoman = '♮III'; degreeNameRu = '♮III ступень'; break;
        case 5: degreeRoman = 'IV'; degreeNameRu = 'IV ступень'; break;
        case 6: degreeRoman = '♯IV'; degreeNameRu = '♯IV ступень'; break;
        case 7: degreeRoman = 'V'; degreeNameRu = 'V ступень'; break;
        case 8: degreeRoman = 'VI'; degreeNameRu = 'VI ступень'; break;
        case 9: degreeRoman = '♮VI'; degreeNameRu = '♮VI ступень'; break;
        case 10: degreeRoman = 'VII'; degreeNameRu = 'VII ступень'; break;
        case 11: degreeRoman = 'VII♯'; degreeNameRu = 'VII♯ ступень'; break;
      }
    }

    let roleInChordRu: string | undefined;
    if (chordRootMidi !== undefined) {
      const rootPitch = ((chordRootMidi % 12) + 12) % 12;
      const diff = ((pitch - rootPitch) % 12 + 12) % 12;
      if (diff === 0) roleInChordRu = 'Прима';
      else if (diff === 3 || diff === 4) roleInChordRu = 'Терция';
      else if (diff === 6 || diff === 7 || diff === 8) roleInChordRu = 'Квинта';
      else if (diff === 9 || diff === 10 || diff === 11) roleInChordRu = 'Септима';
      else if (diff === 2) roleInChordRu = 'Нона';
      else roleInChordRu = 'Секста';
    }

    return {
      voiceName: voiceNames[idx] ?? `Голос ${idx + 1}`,
      midi,
      noteNameWithOctave,
      noteName,
      degreeRoman,
      degreeNameRu,
      roleInChordRu,
      semitonesFromTonic,
    };
  });
}

export interface SmartVoicingTask {
  baseMidi: number;
  baseNoteName: string;
  chordName: string;
  chordQuality: 'major' | 'minor' | 'diminished' | 'augmented' | 'dominant';
  chordQualityRu: string;
  chordRootMidi: number;
  chordRootNoteName: string;
  chordInversionRu: string;
  chordNotesMidi: number[];
  chordNoteNames: string[];
  baseRoleRu: string;
  enclosureTypeRu: string;
  harmonicContextRu: string;
  chordNoteRoles: Record<number, string>;
  isDiatonic?: boolean;
  revealed: boolean;

  // Rich Tonal context & Scale Degree information
  keyTonicNoteName: string;
  keyScaleMode: 'major' | 'minor';
  keyNameRu: string;
  degreeId: string;
  degreeRoman: string;
  degreeLabelRu: string;
  degreeNameRu: string;
  functionGroup: string;
  functionalStrengthRu: string;
  harmonicRoleRu: string;
  usageMethodsRu: string;
  functionSymbolRu: string;
  degreeExplanationRu: string;
  isRootPosition: boolean;
  voicingId?: string;
  resolutionsScheme?: ResolutionSchemeItem[];
  voicesBottomToTop: VoiceDegreeRow[];
}

export interface ScaleDegreeInversionStudy {
  name: string;
  symbol: string;
  notesNames: string[];
  notesMidi: number[];
}

export interface ScaleDegreeStudyItem {
  id: string;
  degreeRoman: string;
  degreeNumber: number;
  degreeNameRu: string;
  symbol: string;
  chordNameRu: string;
  functionGroup: string;
  quality: 'major' | 'minor' | 'diminished' | 'augmented' | 'dominant';
  qualityRu: string;
  notesNames: string[];
  notesMidi: number[];
  inversions: ScaleDegreeInversionStudy[];
  descriptionRu: string;
}

/**
 * Returns comprehensive reference data of all scale degree chords in the chosen key.
 */
export function getScaleDegreeChordsForStudy(
  tonicNoteName: string,
  scaleMode: 'major' | 'minor'
): ScaleDegreeStudyItem[] {
  const offsets: Record<string, number> = {
    C: 0, 'C#': 1, 'C♯': 1, Cis: 1, Des: 1, 'Cis / Des': 1,
    D: 2, 'D#': 3, 'D♯': 3, Dis: 3, Es: 3, 'Dis / Es': 3,
    E: 4, F: 5,
    'F#': 6, 'F♯': 6, Fis: 6, Ges: 6, 'Fis / Ges': 6,
    G: 7, 'G#': 8, 'G♯': 8, Gis: 8, As: 8, 'Gis / As': 8,
    A: 9, 'A#': 10, 'A♯': 10, Ais: 10, 'B♭': 10, Bb: 10, 'Ais / B': 10,
    H: 11, B: 11,
  };

  const tonicPitch = offsets[tonicNoteName] ?? 9;
  const baseTonicMidi = 60 + ((tonicPitch - 0) % 12);
  const isMaj = scaleMode === 'major';

  return TONAL_DEGREES.map((deg) => {
    const voicings = getVoicingsForDegree(deg.id, isMaj, tonicNoteName);
    const rootVoicing = voicings.find((v) => v.isRootPosition) ?? voicings[0];
    const rootNotesMidi = rootVoicing.semitonesFromTonic.map((s) => baseTonicMidi + s);
    const rootNotesNames = rootNotesMidi.map((m) => CHROMATIC_NOTES_UP[((m % 12) + 12) % 12]);

    const inversionsList: ScaleDegreeInversionStudy[] = voicings.map((v) => ({
      name: v.inversionName,
      symbol: v.functionSymbolRu,
      notesNames: v.semitonesFromTonic.map((s) => CHROMATIC_NOTES_UP[(tonicPitch + s) % 12]),
      notesMidi: v.semitonesFromTonic.map((s) => baseTonicMidi + s),
    }));

    return {
      id: deg.id,
      degreeRoman: deg.degreeRoman,
      degreeNumber: deg.degreeNumber,
      degreeNameRu: isMaj ? deg.nameMajorRu : deg.nameMinorRu,
      symbol: voicings.map((v) => v.functionSymbolRu).join(', '),
      chordNameRu: `${rootNotesNames[0]} (${isMaj ? deg.labelMajor : deg.labelMinor})`,
      functionGroup: deg.functionGroup,
      quality: rootVoicing.chordQuality,
      qualityRu: rootVoicing.chordQualityRu,
      notesNames: rootNotesNames,
      notesMidi: rootNotesMidi,
      inversions: inversionsList,
      descriptionRu: isMaj ? deg.descMajorRu : deg.descMinorRu,
    };
  });
}

/**
 * Generates a Tonal Ear Training task with Smart Voicing math.
 * Generates degree-based chords honoring all harmonic rules:
 * - In minor: Dominant (V, V7, D+6) is ALWAYS major harmonic!
 * - Supports degree filtering (I, II, III, IV, S_alt, V, V7, D+6, VI, VII) and root position only toggle.
 */
export function generateSmartVoicingTask(
  fixedBaseNote?: string,
  chordFilterMode: 'all' | 'diatonic' = 'all',
  scaleModeSetting: 'major' | 'minor' | 'any' = 'major',
  rootPositionOnly: boolean = false,
  allowedDegrees?: string[],
  allowedVoicings?: string[],
  stats?: AppStats,
  spacedRepetitionEnabled: boolean = true
): SmartVoicingTask {
  // 1. Base note selection: default to 'A' (A4 = MIDI 69)
  const effectiveBase = fixedBaseNote ?? 'A';
  let baseMidi = 69;
  let baseNoteName = 'A';

  const offsets: Record<string, number> = {
    C: 0, 'C#': 1, 'C♯': 1, Cis: 1, Des: 1, 'Cis / Des': 1,
    D: 2, 'D#': 3, 'D♯': 3, Dis: 3, Es: 3, 'Dis / Es': 3,
    E: 4, F: 5,
    'F#': 6, 'F♯': 6, Fis: 6, Ges: 6, 'Fis / Ges': 6,
    G: 7, 'G#': 8, 'G♯': 8, Gis: 8, As: 8, 'Gis / As': 8,
    A: 9, 'A#': 10, 'A♯': 10, Ais: 10, 'B♭': 10, Bb: 10, 'Ais / B': 10,
    H: 11, B: 11,
  };

  if (effectiveBase !== 'random') {
    const offset = offsets[effectiveBase] ?? 9;
    baseMidi = 60 + offset;
    baseNoteName = CHROMATIC_NOTES_UP[offset];
  } else {
    baseMidi = 55 + Math.floor(Math.random() * 13);
    baseNoteName = CHROMATIC_NOTES_UP[baseMidi % 12];
  }

  const tonicPitch = offsets[baseNoteName] ?? (baseMidi % 12);

  // Determine active key scale mode
  let effectiveScaleMode: 'major' | 'minor' = 'major';
  if (scaleModeSetting === 'minor') {
    effectiveScaleMode = 'minor';
  } else if (scaleModeSetting === 'any') {
    effectiveScaleMode = Math.random() < 0.5 ? 'major' : 'minor';
  }

  const isMaj = effectiveScaleMode === 'major';
  const keyNameRu = isMaj
    ? `${baseNoteName}-dur (${baseNoteName} мажор)`
    : `${baseNoteName}-moll (${baseNoteName} минор)`;

  // Determine the active pool of popular chords matching active settings
  let activePool = POPULAR_TONAL_CHORDS;

  // If explicit allowedVoicings are provided (from active theme or custom selection), respect them directly
  if (allowedVoicings && allowedVoicings.length > 0) {
    const vFiltered = POPULAR_TONAL_CHORDS.filter((c) => allowedVoicings.includes(c.id));
    if (vFiltered.length > 0) {
      activePool = vFiltered;
    }
  } else {
    // In root-only mode: only chords where isRootPosition === true
    if (rootPositionOnly) {
      activePool = activePool.filter((c) => c.isRootPosition);
    }

    // Filter by allowedDegrees if provided
    if (allowedDegrees && allowedDegrees.length > 0) {
      const degFiltered = activePool.filter((c) => allowedDegrees.includes(c.degreeId));
      if (degFiltered.length > 0) {
        activePool = degFiltered;
      }
    }
  }

  if (activePool.length === 0) {
    activePool = rootPositionOnly
      ? POPULAR_TONAL_CHORDS.filter((c) => c.isRootPosition)
      : POPULAR_TONAL_CHORDS;
  }

  // 2. Build candidate voicings for all active chords
  interface Candidate {
    degreeId: string;
    degreeRoman: string;
    degreeLabelRu: string;
    degreeNameRu: string;
    functionGroup: string;
    functionalStrengthRu: string;
    harmonicRoleRu: string;
    usageMethodsRu: string;
    functionSymbolRu: string;
    degreeExplanationRu: string;
    chordQuality: 'major' | 'minor' | 'diminished' | 'augmented' | 'dominant';
    chordQualityRu: string;
    inversionName: string;
    isRootPosition: boolean;
    voicingId: string;
    chordNotesMidi: number[];
    rootMidi: number;
    resolutionsScheme: ResolutionSchemeItem[];
    score: number;
  }

  const chordCandidatesMap = new Map<string, Candidate[]>();

  for (const item of activePool) {
    const v = findVoicingById(item.id, isMaj, baseNoteName);
    if (!v) continue;

    const degDef = TONAL_DEGREES.find((d) => d.id === item.degreeId);
    const candidatesForChord: Candidate[] = [];

    // Check octave placements (octave 3, 4, 5)
    for (let oct = 3; oct <= 5; oct++) {
      const baseOctaveMidi = oct * 12 + tonicPitch;
      const notesMidi = v.semitonesFromTonic.map((s) => baseOctaveMidi + s);
      const minMidi = Math.min(...notesMidi);
      const maxMidi = Math.max(...notesMidi);

      // Comfortable middle register piano listening range: D3 (50) to C6 (84)
      // Completely eliminates low, muddy bass notes in octave 2 (< 50)
      if (minMidi < 50 || maxMidi > 84) continue;

      let score = 100;
      const isStrictlyInside = minMidi < baseMidi && baseMidi < maxMidi;
      const matchesBass = baseMidi === minMidi;
      const matchesSoprano = baseMidi === maxMidi;
      const matchesAny = notesMidi.includes(baseMidi);

      if (isStrictlyInside) {
        score += 80;
      } else if (matchesBass || matchesSoprano) {
        score += 50;
      } else if (matchesAny) {
        score += 30;
      }

      // Center voicing comfortably in the middle register (MIDI 62..65, D4..F4)
      const avgMidi = notesMidi.reduce((a, b) => a + b, 0) / notesMidi.length;
      score -= Math.abs(avgMidi - 63) * 2.5;
      score -= (maxMidi - minMidi) * 0.5;

      candidatesForChord.push({
        degreeId: v.degreeId,
        degreeRoman: v.degreeRoman,
        degreeLabelRu: degDef ? (isMaj ? degDef.labelMajor : degDef.labelMinor) : v.degreeLabelRu,
        degreeNameRu: degDef ? (isMaj ? degDef.nameMajorRu : degDef.nameMinorRu) : v.degreeNameRu,
        functionGroup: degDef ? degDef.functionGroup : (item.functionGroup === 'T' ? 'Тоника (T)' : item.functionGroup === 'S' ? 'Субдоминанта (S)' : item.functionGroup === 'D' ? 'Доминанта (D)' : 'Медианты (M)'),
        functionalStrengthRu: degDef ? degDef.functionalStrengthRu : '',
        harmonicRoleRu: degDef ? degDef.harmonicRoleRu : '',
        usageMethodsRu: degDef ? degDef.usageMethodsRu : '',
        functionSymbolRu: v.functionSymbolRu,
        degreeExplanationRu: v.degreeExplanationRu,
        chordQuality: v.chordQuality,
        chordQualityRu: v.chordQualityRu,
        inversionName: v.inversionName,
        isRootPosition: v.isRootPosition,
        voicingId: v.id,
        chordNotesMidi: notesMidi,
        rootMidi: notesMidi[0],
        resolutionsScheme: degDef?.resolutionsScheme || [],
        score,
      });
    }

    if (candidatesForChord.length > 0) {
      candidatesForChord.sort((a, b) => b.score - a.score);
      chordCandidatesMap.set(item.id, candidatesForChord);
    }
  }

  // Pick a chord from the active chords using Spaced Repetition if available
  const availableVoicingIds = Array.from(chordCandidatesMap.keys());
  let chosen: Candidate;

  if (availableVoicingIds.length > 0) {
    const chosenVoicingId = pickWeightedItem(
      availableVoicingIds,
      (id) => id,
      stats,
      spacedRepetitionEnabled,
      recentVoicingIds
    );

    recentVoicingIds.push(chosenVoicingId);
    if (recentVoicingIds.length > 5) {
      recentVoicingIds.shift();
    }

    const topPicks = chordCandidatesMap.get(chosenVoicingId)!;
    // Pick the best octave (or randomly among the top 2 octaves)
    chosen = topPicks[Math.floor(Math.random() * Math.min(2, topPicks.length))];
  } else {
    // Ultimate fallback to tonic triad
    chosen = {
      degreeId: 'deg_I',
      degreeRoman: 'I',
      degreeLabelRu: isMaj ? 'I (T)' : 'I (t)',
      degreeNameRu: isMaj ? 'I ступень — Тоника (T5/3)' : 'I ступень — Тоника (t5/3)',
      functionGroup: 'Тоника (T)',
      functionalStrengthRu: 'Абсолютная устойчивость',
      harmonicRoleRu: 'Главная опора лада',
      usageMethodsRu: 'Утверждает тонику в начале и конце музыкальных фраз.',
      functionSymbolRu: isMaj ? 'T5/3' : 't5/3',
      degreeExplanationRu: `Тонический аккорд в ${keyNameRu}`,
      chordQuality: (isMaj ? 'major' : 'minor') as 'major' | 'minor',
      chordQualityRu: isMaj ? 'Мажорное трезвучие' : 'Минорное трезвучие',
      inversionName: isMaj ? 'Основной вид (T5/3)' : 'Основной вид (t5/3)',
      isRootPosition: true,
      voicingId: 'v_T53',
      chordNotesMidi: isMaj ? [baseMidi, baseMidi + 4, baseMidi + 7] : [baseMidi, baseMidi + 3, baseMidi + 7],
      rootMidi: baseMidi,
      resolutionsScheme: TONAL_DEGREES[0]?.resolutionsScheme || [],
      score: 100,
    };
  }

  const chordNotesMidi = chosen.chordNotesMidi;
  const chordNoteNames = chordNotesMidi.map((m) => CHROMATIC_NOTES_UP[((m % 12) + 12) % 12]);
  const chordRootPitch = ((chosen.rootMidi % 12) + 12) % 12;
  const chordRootNoteName = CHROMATIC_NOTES_UP[chordRootPitch];

  // Determine role of base note relative to chord
  const semitonesFromRoot = ((baseMidi - chosen.rootMidi) % 12 + 12) % 12;
  let baseRoleRu = 'Внутри созвучия (между голосами)';
  let harmonicContextRu = 'Гармоническое окружение базового тона';
  const chordNoteRoles: Record<number, string> = {};

  chordNotesMidi.forEach((m) => {
    const p = ((m % 12) + 12) % 12;
    const diff = ((p - chordRootPitch) % 12 + 12) % 12;
    if (diff === 0) chordNoteRoles[m] = '1 (Прима / корень)';
    else if (diff === 3 || diff === 4) chordNoteRoles[m] = '3 (Терция)';
    else if (diff === 6 || diff === 7 || diff === 8) chordNoteRoles[m] = '5 (Квинта)';
    else if (diff === 9 || diff === 10 || diff === 11) chordNoteRoles[m] = '7 (Септима)';
    else chordNoteRoles[m] = '6 (Секста)';
  });

  if (semitonesFromRoot === 0) {
    baseRoleRu = 'Прима (основной устойчивый тон созвучия)';
    harmonicContextRu = 'Базовая нота является тоническим фундаментом созвучия';
  } else if (semitonesFromRoot === 4) {
    baseRoleRu = 'Большая терция (мажорный ладовый тон)';
    harmonicContextRu = 'Базовая нота задает светлое мажорное наклонение';
  } else if (semitonesFromRoot === 3) {
    baseRoleRu = 'Малая терция (минорный ладовый тон)';
    harmonicContextRu = 'Базовая нота задает глубокое минорное наклонение';
  } else if (semitonesFromRoot === 7) {
    baseRoleRu = 'Чистая квинта (гармоническая опора)';
    harmonicContextRu = 'Базовая нота служит квинтовой опорой созвучия';
  } else if (semitonesFromRoot === 6) {
    baseRoleRu = 'Тритон (уменьшенная квинта / вводный интервал)';
    harmonicContextRu = 'Базовая нота создает острое ладовое тяготение';
  } else if (semitonesFromRoot === 10 || semitonesFromRoot === 11) {
    baseRoleRu = 'Септима (доминантовый диссонанс)';
    harmonicContextRu = 'Базовая нота тяготеет в терцию тонического разрешения';
  } else {
    baseRoleRu = 'Гармонический ладовый тон (обхват созвучием)';
    harmonicContextRu = 'Базовая нота окружена плотным гармоническим полем';
  }

  const minMidi = Math.min(...chordNotesMidi);
  const maxMidi = Math.max(...chordNotesMidi);
  let enclosureTypeRu = 'Базовая нота плотно зажата между голосами аккорда';
  if (baseMidi === minMidi) {
    enclosureTypeRu = 'Базовая нота сливается с басом созвучия';
  } else if (baseMidi === maxMidi) {
    enclosureTypeRu = 'Базовая нота сливается с мелодической вершиной (сопрано)';
  } else if (chordNotesMidi.includes(baseMidi)) {
    enclosureTypeRu = 'Базовая нота резонирует в среднем голосе аккорда';
  }

  const chordFullName = `${chosen.functionSymbolRu} (${chosen.chordQualityRu})`;

  // Voices sorted ascending (Bass -> Soprano)
  const sortedMidis = [...chordNotesMidi].sort((a, b) => a - b);
  const voicesBottomToTop = getVoiceScaleDegrees(
    sortedMidis,
    tonicPitch,
    effectiveScaleMode,
    chosen.rootMidi
  );

  return {
    baseMidi,
    baseNoteName,
    chordName: chordFullName,
    chordQuality: chosen.chordQuality,
    chordQualityRu: chosen.chordQualityRu,
    chordRootMidi: chosen.rootMidi,
    chordRootNoteName,
    chordInversionRu: chosen.inversionName,
    chordNotesMidi,
    chordNoteNames,
    baseRoleRu,
    enclosureTypeRu,
    harmonicContextRu,
    chordNoteRoles,
    isDiatonic: true,
    revealed: false,
    keyTonicNoteName: baseNoteName,
    keyScaleMode: effectiveScaleMode,
    keyNameRu,
    degreeId: chosen.degreeId,
    degreeRoman: chosen.degreeRoman,
    degreeLabelRu: chosen.degreeLabelRu,
    degreeNameRu: chosen.degreeNameRu,
    functionGroup: chosen.functionGroup,
    functionalStrengthRu: chosen.functionalStrengthRu,
    harmonicRoleRu: chosen.harmonicRoleRu,
    usageMethodsRu: chosen.usageMethodsRu,
    functionSymbolRu: chosen.functionSymbolRu,
    degreeExplanationRu: chosen.degreeExplanationRu,
    isRootPosition: chosen.isRootPosition,
    voicingId: chosen.voicingId,
    resolutionsScheme: chosen.resolutionsScheme,
    voicesBottomToTop,
  };
}

export function getTonalChordResolutionRows(task: SmartVoicingTask): {
  voiceLabel: string;
  fromNote: string;
  fromDegree: string;
  toNote: string;
  toDegree: string;
  ruleNote: string;
}[] {
  if (!task.voicesBottomToTop || task.voicesBottomToTop.length === 0) return [];

  const satbNames = ['Бас (Б)', 'Тенор (Т)', 'Альт (А)', 'Сопрано (С)'];
  const voices = task.voicesBottomToTop;

  // Extract clean degree names (e.g., 'I', 'II', 'IV', 'VI', 'VII')
  const cleanDegrees = voices.map((v) => v.degreeRoman.replace(/[^\wIVX]/g, ''));
  const hasDegreeVI = cleanDegrees.includes('VI');

  return voices.map((v, idx) => {
    const label = voices.length === 4 ? satbNames[idx] : `Голос ${idx + 1}`;
    const cleanDegree = v.degreeRoman.replace(/[^\wIVX]/g, '');

    let toDegree = 'I';
    let semitoneShift = 0;
    let ruleNote = '';

    if (cleanDegree === 'VII') {
      toDegree = 'I';
      semitoneShift = 1;
      ruleNote = 'вводный тон ↑ в I';
    } else if (cleanDegree === 'IV') {
      toDegree = 'III';
      semitoneShift = -1;
      ruleNote = 'септима / IV ст. ↓ в III';
    } else if (cleanDegree === 'II') {
      if (hasDegreeVI) {
        // Strict Voice Leading Rule:
        // When both II and VI degrees are present (e.g. II7, II4/3, II6/5, VII7, VII4/3),
        // VI resolves DOWN to V (6 -> 5).
        // To eliminate parallel fifths (II/VI -> I/V), degree II MUST resolve UP to III (+2 semitones)!
        toDegree = 'III';
        semitoneShift = 2;
        ruleNote = 'шаг ↑ в III (избежание параллельных квинт)';
      } else {
        if (idx === 0) {
          // Bass on II step (e.g. D4/3) -> resolves UP to III (T6)
          toDegree = 'III';
          semitoneShift = 2;
          ruleNote = 'бас II ст. ↑ в III (в Т6)';
        } else {
          toDegree = 'I';
          semitoneShift = -2;
          ruleNote = 'плавный шаг ↓ в I';
        }
      }
    } else if (cleanDegree === 'VI') {
      toDegree = 'V';
      semitoneShift = task.keyScaleMode === 'minor' ? -1 : -2;
      ruleNote = 'VI ст. ↓ в V';
    } else if (cleanDegree === 'V') {
      if (idx === 0) {
        toDegree = 'I';
        semitoneShift = 5;
        ruleNote = 'скачок баса в I';
      } else {
        toDegree = 'V';
        semitoneShift = 0;
        ruleNote = 'общий тон V ст.';
      }
    } else if (cleanDegree === 'III') {
      toDegree = 'III';
      semitoneShift = 0;
      ruleNote = 'устойчивый тон III ст.';
    } else {
      toDegree = 'I';
      semitoneShift = 0;
      ruleNote = 'общий тон (тоника)';
    }

    const fromMidi = v.midi;
    const toMidi = fromMidi + semitoneShift;
    const toNoteName = CHROMATIC_NOTES_UP[((toMidi % 12) + 12) % 12];

    return {
      voiceLabel: label,
      fromNote: v.noteNameWithOctave,
      fromDegree: v.degreeRoman,
      toNote: toNoteName,
      toDegree,
      ruleNote,
    };
  });
}

function resolveVoiceMidi(
  midi: number,
  tonicPitch: number,
  isMaj: boolean,
  isBass: boolean,
  isK64Target: boolean
): number {
  const pitch = ((midi % 12) + 12) % 12;
  const semitonesFromTonic = ((pitch - tonicPitch) % 12 + 12) % 12;

  // Specific classical resolution for Cadential 6/4 (K6/4 -> D7 / D5/3)
  if (isK64Target) {
    if (isBass || semitonesFromTonic === 7) {
      // Bass on V remains stationary on V
      return midi;
    }
    if (semitonesFromTonic === 0) {
      // Degree I (fourth above bass) steps down to VII (leading tone)
      return midi - 1;
    }
    if (semitonesFromTonic === 4 || semitonesFromTonic === 3) {
      // Degree III (sixth above bass) steps down to II
      return midi - (isMaj ? 2 : 1);
    }
    return midi;
  }

  if (isBass) {
    // Bass voice leading
    if (semitonesFromTonic === 7) {
      // V degree -> jumps to I
      return midi >= 53 ? midi - 7 : midi + 5;
    }
    if (semitonesFromTonic === 11) {
      // VII degree (e.g. D6/5, VII7) -> steps up to I
      return midi + 1;
    }
    if (semitonesFromTonic === 2) {
      // II degree (e.g. D4/3, II6) -> steps up to III (T6)
      return midi + (isMaj ? 2 : 1);
    }
    if (semitonesFromTonic === 5) {
      // IV degree (e.g. D2, S5/3) -> steps down to III (T6)
      return midi - (isMaj ? 1 : 2);
    }
    if (semitonesFromTonic === 8 || semitonesFromTonic === 9) {
      // VI degree (e.g. VI5/3) -> resolves to I
      return midi - semitonesFromTonic;
    }
    // Default bass resolves to nearest tonic root
    return midi - semitonesFromTonic;
  }

  // Upper voices (Tenor, Alto, Soprano)
  if (semitonesFromTonic === 11) {
    // VII degree (leading tone) -> steps up to I
    return midi + 1;
  }
  if (semitonesFromTonic === 5) {
    // IV degree (7th of D7 or S) -> steps down to III
    return midi - (isMaj ? 1 : 2);
  }
  if (semitonesFromTonic === 2) {
    // II degree -> steps down to I
    return midi - 2;
  }
  if (semitonesFromTonic === 8 || semitonesFromTonic === 9) {
    // VI degree -> steps down to V
    return midi - (isMaj ? 2 : 1);
  }
  if (semitonesFromTonic === 7) {
    // V degree -> stays on V (common tone)
    return midi;
  }
  if (semitonesFromTonic === 4 || semitonesFromTonic === 3) {
    // III degree -> stays on III (common tone)
    return midi;
  }
  if (semitonesFromTonic === 0) {
    // I degree -> stays on I (common tone)
    return midi;
  }
  return midi - semitonesFromTonic;
}

/**
 * Transforms a SmartVoicingTask into a RealizedProgression for VexFlow rendering
 * in ProgressionGrandStaff.
 */
export function createProgressionFromTonalTask(task: SmartVoicingTask): RealizedProgression {
  const isMaj = task.keyScaleMode === 'major';
  const tonicPitch = ((task.baseMidi % 12) + 12) % 12;

  // 1. Determine Step 0 SATB midis:
  const rawMidis = [...task.chordNotesMidi].sort((a, b) => a - b);
  let midisSATB0: [number, number, number, number];

  if (rawMidis.length === 4) {
    midisSATB0 = [rawMidis[0], rawMidis[1], rawMidis[2], rawMidis[3]];
  } else if (rawMidis.length === 3) {
    const [b, m, s] = rawMidis;
    let doubled = b + 12;
    if (task.voicingId === 'v_K64') {
      // In 6/4 (cadential 6/4), double the 5th (bass)
      doubled = b + 12;
    } else if (task.isRootPosition) {
      // In root position 5/3 triads, double the root:
      const rootPitch = ((task.chordRootMidi % 12) + 12) % 12;
      if (((b % 12) + 12) % 12 === rootPitch) {
        doubled = b + 12;
      } else if (((m % 12) + 12) % 12 === rootPitch) {
        doubled = m > 64 ? m - 12 : m + 12;
      } else {
        doubled = s > 67 ? s - 12 : s + 12;
      }
    } else {
      doubled = b + 12;
    }
    const notes4 = [...rawMidis, doubled].sort((a, b) => a - b);
    midisSATB0 = [notes4[0], notes4[1], notes4[2], notes4[3]];
  } else if (rawMidis.length > 4) {
    midisSATB0 = [rawMidis[0], rawMidis[1], rawMidis[2], rawMidis[rawMidis.length - 1]];
  } else {
    const b = rawMidis[0] ?? 48;
    midisSATB0 = [b, b + 7, b + 12, b + 16];
  }

  // Ensure bass is seated in classical bass register (MIDI <= 55, G3 or lower)
  if (midisSATB0[0] >= 57) {
    midisSATB0[0] -= 12;
  }

  const getNoteNameWithOctave = (midi: number) => {
    const pitch = ((midi % 12) + 12) % 12;
    const noteName = CHROMATIC_NOTES_UP[pitch];
    const octave = Math.floor(midi / 12) - 1;
    return `${noteName}${octave}`;
  };

  const getDegreeRoman = (m: number) => {
    const p = ((m % 12) + 12) % 12;
    const diff = ((p - tonicPitch) % 12 + 12) % 12;
    const majDegs = ['I', 'bII', 'II', 'bIII', 'III', 'IV', '#IV', 'V', 'bVI', 'VI', 'bVII', 'VII'];
    const minDegs = ['I', 'bII', 'II', 'III', 'III', 'IV', '#IV', 'V', 'VI', 'VI', 'VII', 'VII'];
    return isMaj ? majDegs[diff] : minDegs[diff];
  };

  const step0: RealizedProgressionStep = {
    symbol: task.functionSymbolRu || task.chordName,
    degreeRoman: task.degreeRoman || 'I',
    nameRu: task.chordName,
    midisSATB: midisSATB0,
    noteNamesSATB: [
      getNoteNameWithOctave(midisSATB0[0]),
      getNoteNameWithOctave(midisSATB0[1]),
      getNoteNameWithOctave(midisSATB0[2]),
      getNoteNameWithOctave(midisSATB0[3]),
    ],
    voiceDegreesRu: {
      soprano: getDegreeRoman(midisSATB0[3]),
      alto: getDegreeRoman(midisSATB0[2]),
      tenor: getDegreeRoman(midisSATB0[1]),
      bass: getDegreeRoman(midisSATB0[0]),
    },
  };

  // 2. Determine Step 1 (Classical Resolution):
  const isAlreadyTonicTriad =
    task.isRootPosition &&
    (task.degreeId === 'deg_I' || task.functionSymbolRu === 'T5/3' || task.functionSymbolRu === 't5/3');

  const steps: RealizedProgressionStep[] = [step0];

  if (!isAlreadyTonicTriad) {
    const isK64 = task.voicingId === 'v_K64' || task.functionSymbolRu.includes('K6/4') || task.functionSymbolRu.includes('k6/4');
    const resMidisSATB: [number, number, number, number] = [
      resolveVoiceMidi(midisSATB0[0], tonicPitch, isMaj, true, isK64),
      resolveVoiceMidi(midisSATB0[1], tonicPitch, isMaj, false, isK64),
      resolveVoiceMidi(midisSATB0[2], tonicPitch, isMaj, false, isK64),
      resolveVoiceMidi(midisSATB0[3], tonicPitch, isMaj, false, isK64),
    ];

    let targetSymbol = isMaj ? 'T5/3' : 't5/3';
    if (isK64) {
      targetSymbol = task.resolutionsScheme?.[0]?.formula || 'D7';
    } else if (task.functionSymbolRu === 'D2' || task.functionSymbolRu === 'VII2') {
      targetSymbol = isMaj ? 'T6' : 't6';
    } else if (task.resolutionsScheme?.[0]?.formula) {
      targetSymbol = task.resolutionsScheme[0].formula;
    }

    const step1: RealizedProgressionStep = {
      symbol: targetSymbol,
      degreeRoman: isK64 ? 'V' : 'I',
      nameRu: isK64
        ? 'Доминанта (D)'
        : isMaj
        ? 'Тоническое трезвучие'
        : 'Тоническое минорное трезвучие',
      midisSATB: resMidisSATB,
      noteNamesSATB: [
        getNoteNameWithOctave(resMidisSATB[0]),
        getNoteNameWithOctave(resMidisSATB[1]),
        getNoteNameWithOctave(resMidisSATB[2]),
        getNoteNameWithOctave(resMidisSATB[3]),
      ],
      voiceDegreesRu: {
        soprano: getDegreeRoman(resMidisSATB[3]),
        alto: getDegreeRoman(resMidisSATB[2]),
        tenor: getDegreeRoman(resMidisSATB[1]),
        bass: getDegreeRoman(resMidisSATB[0]),
      },
    };

    steps.push(step1);
  }

  const dummyTemplate: HarmonicProgressionTemplate = {
    id: `tonal_${task.voicingId || 'chord'}`,
    nameRu: task.chordName,
    formula: task.functionSymbolRu || task.chordName,
    category: 'cadential',
    categoryNameRu: 'Тональное созвучие',
    scaleMode: task.keyScaleMode,
    bassMotionRu: task.chordInversionRu || 'Басовый голос',
    sopranoMotionRu: 'Мелодическое положение',
    voiceLeadingExplanationRu: task.degreeExplanationRu || '',
    usageContextRu: task.usageMethodsRu || '',
    steps: [],
  };

  return {
    template: dummyTemplate,
    tonicNoteName: task.keyTonicNoteName,
    tonicPitch,
    scaleMode: task.keyScaleMode,
    keyNameRu: task.keyNameRu,
    revealed: true,
    voiceLeadingValidation: {
      isValid: true,
      warnings: [],
    },
    steps,
  };
}


