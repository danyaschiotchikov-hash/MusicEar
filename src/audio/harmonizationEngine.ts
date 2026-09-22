import { CHROMATIC_NOTES_UP } from '../data/musicData';

export type NoteDurationType = 'w' | 'h' | 'q' | '8';

export interface SopranoInputNote {
  id: string;
  midi: number;
  noteName: string;         // e.g. "E4", "F4"
  duration: NoteDurationType; // 'w' (whole), 'h' (half), 'q' (quarter), '8' (eighth)
  isDotted?: boolean;
  durationBeats: number;    // e.g. 1, 2, 0.5, 1.5, 4
  measure: number;          // 1-indexed
  beat: number;             // 1-indexed beat within measure
  isStrongBeat: boolean;    // true if on beat 1 or 3 in 4/4
  degreeNum: number;        // 1 to 7
  degreeRoman: string;      // e.g. "I", "II", "III", "IV", "V", "VI", "VII"
}

export interface HarmonizationKey {
  tonic: string;             // "C", "G", "D", "A", "F", "Bb", "Eb", "Am", "Em", "Dm", etc.
  rootNote: string;         // Note name without mode: "C", "G", "A"
  mode: 'major' | 'minor';
  keyNameRu: string;
  accidentalsCount: number;  // 0 to 7
  accidentalType: '#' | 'b';
}

export interface CandidateChordDef {
  chordId: string;
  symbol: string;           // e.g. "T5/3", "K6/4", "D7", "S6", "II6"
  romanNumeral: string;     // e.g. "I", "V6/4", "V7", "IV6", "ii6"
  nameRu: string;           // e.g. "Кадансовый квартсекстаккорд"
  function: 'T' | 'S' | 'D';
  sopranoFactor: '1' | '3' | '5' | '7'; // Which chord member soprano is
  bassDegree: number;       // Degree number in bass: 1, 2, 3, 4, 5, 6, 7
  bassDegreeAlteration?: number;
  weight: number;           // Natural affinity weight (higher = more idiomatic)
  requiresStrongBeat?: boolean; // e.g. K6/4
  requiresWeakBeat?: boolean;   // e.g. passing D6/4
}

export interface DetectedHarmonicTurn {
  id: string;
  turnNameRu: string;
  formulaRu: string;
  categoryRu: string;
  startIndex: number;
  endIndex: number;
  explanationRu: string;
  colorAccent: string;
}

export interface HarmonizedStep {
  index: number;
  sopranoNote: SopranoInputNote;
  chordId: string;
  chordSymbol: string;
  chordNameRu: string;
  degreeRoman: string;
  function: 'T' | 'S' | 'D';
  sopranoFactor: string;
  midisSATB: [number, number, number, number]; // [Bass, Tenor, Alto, Soprano]
  noteNamesSATB: [string, string, string, string];
  activeTurnBadge?: string;
  voiceDoublingRu: string;
}

export interface HarmonizationResult {
  steps: HarmonizedStep[];
  detectedTurns: DetectedHarmonicTurn[];
  key: HarmonizationKey;
  meter: string;
  voiceLeadingFeedback: string[];
  totalScore: number;
}

// ----------------------------------------------------------------------
// Supported Keys
// ----------------------------------------------------------------------
export const SUPPORTED_KEYS: HarmonizationKey[] = [
  { tonic: 'C', rootNote: 'C', mode: 'major', keyNameRu: 'До мажор (C-dur)', accidentalsCount: 0, accidentalType: '#' },
  { tonic: 'G', rootNote: 'G', mode: 'major', keyNameRu: 'Соль мажор (G-dur)', accidentalsCount: 1, accidentalType: '#' },
  { tonic: 'D', rootNote: 'D', mode: 'major', keyNameRu: 'Ре мажор (D-dur)', accidentalsCount: 2, accidentalType: '#' },
  { tonic: 'A', rootNote: 'A', mode: 'major', keyNameRu: 'Ля мажор (A-dur)', accidentalsCount: 3, accidentalType: '#' },
  { tonic: 'F', rootNote: 'F', mode: 'major', keyNameRu: 'Фа мажор (F-dur)', accidentalsCount: 1, accidentalType: 'b' },
  { tonic: 'Bb', rootNote: 'Bb', mode: 'major', keyNameRu: 'Си-бемоль мажор (B-dur)', accidentalsCount: 2, accidentalType: 'b' },
  { tonic: 'Eb', rootNote: 'Eb', mode: 'major', keyNameRu: 'Ми-бемоль мажор (Es-dur)', accidentalsCount: 3, accidentalType: 'b' },
  { tonic: 'Am', rootNote: 'A', mode: 'minor', keyNameRu: 'Ля минор (a-moll)', accidentalsCount: 0, accidentalType: '#' },
  { tonic: 'Em', rootNote: 'E', mode: 'minor', keyNameRu: 'Ми минор (e-moll)', accidentalsCount: 1, accidentalType: '#' },
  { tonic: 'Dm', rootNote: 'D', mode: 'minor', keyNameRu: 'Ре минор (d-moll)', accidentalsCount: 1, accidentalType: 'b' },
  { tonic: 'Gm', rootNote: 'G', mode: 'minor', keyNameRu: 'Соль минор (g-moll)', accidentalsCount: 2, accidentalType: 'b' },
  { tonic: 'Cm', rootNote: 'C', mode: 'minor', keyNameRu: 'До минор (c-moll)', accidentalsCount: 3, accidentalType: 'b' },
];

export const NOTE_PITCH_CLASS: Record<string, number> = {
  C: 0, 'C#': 1, Db: 1, D: 2, 'D#': 3, Eb: 3, E: 4,
  F: 5, 'F#': 6, Gb: 6, G: 7, 'G#': 8, Ab: 8, A: 9,
  'A#': 10, Bb: 10, B: 11,
};

const MAJOR_SCALE_INTERVALS = [0, 2, 4, 5, 7, 9, 11];
const HARMONIC_MINOR_SCALE_INTERVALS = [0, 2, 3, 5, 7, 8, 11];

export function getTonicPitchClass(key: HarmonizationKey): number {
  return NOTE_PITCH_CLASS[key.rootNote] ?? 0;
}

export function getScaleIntervals(key: HarmonizationKey): number[] {
  return key.mode === 'major' ? MAJOR_SCALE_INTERVALS : HARMONIC_MINOR_SCALE_INTERVALS;
}

export function calculateDegreeFromMidi(midi: number, key: HarmonizationKey): { degreeNum: number; degreeRoman: string } {
  const tonicPc = getTonicPitchClass(key);
  const pc = ((midi % 12) - tonicPc + 12) % 12;
  const intervals = getScaleIntervals(key);

  const romanNumerals = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];
  for (let i = 0; i < intervals.length; i++) {
    if (intervals[i] === pc) {
      return { degreeNum: i + 1, degreeRoman: romanNumerals[i] };
    }
  }
  // Nearest approximation for chromatic alterations
  return { degreeNum: 1, degreeRoman: 'I' };
}

export function formatMidiToNoteName(midi: number, key: HarmonizationKey): string {
  const noteLettersSharp = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const noteLettersFlat = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
  const letters = key.accidentalType === 'b' ? noteLettersFlat : noteLettersSharp;
  const pc = ((midi % 12) + 12) % 12;
  const octave = Math.floor(midi / 12) - 1;
  return `${letters[pc]}${octave}`;
}

// ----------------------------------------------------------------------
// Candidate Chords by Soprano Scale Degree
// ----------------------------------------------------------------------
export function getCandidateChordsForDegree(
  degreeNum: number,
  isStrongBeat: boolean,
  isLastNote: boolean,
  isSecondToLast: boolean,
  key: HarmonizationKey
): CandidateChordDef[] {
  const isMaj = key.mode === 'major';
  const prefixT = isMaj ? 'T' : 't';
  const prefixS = isMaj ? 'S' : 's';
  const prefixD = 'D'; // Harmonized in harmonic mode (major dominant)

  const list: CandidateChordDef[] = [];

  switch (degreeNum) {
    case 1: // I degree (Tonic)
      list.push(
        { chordId: 'T53', symbol: `${prefixT}5/3`, romanNumeral: isMaj ? 'I' : 'i', nameRu: 'Тоническое трезвучие', function: 'T', sopranoFactor: '1', bassDegree: 1, weight: isLastNote ? 100 : 30 },
        { chordId: 'T6', symbol: `${prefixT}6`, romanNumeral: isMaj ? 'I6' : 'i6', nameRu: 'Тонический секстаккорд', function: 'T', sopranoFactor: '1', bassDegree: 3, weight: isLastNote ? 5 : 20 },
        { chordId: 'VI53', symbol: 'VI5/3', romanNumeral: 'VI', nameRu: 'Трезвучие VI ступени', function: 'T', sopranoFactor: '3', bassDegree: 6, weight: 12 },
        { chordId: 'S64', symbol: `${prefixS}6/4`, romanNumeral: isMaj ? 'IV6/4' : 'iv6/4', nameRu: 'Вспомогательный S6/4', function: 'S', sopranoFactor: '5', bassDegree: 1, weight: 8, requiresWeakBeat: true }
      );
      break;

    case 2: // II degree (Supertonic)
      list.push(
        { chordId: 'D7', symbol: 'D7', romanNumeral: 'V7', nameRu: 'Доминантсептаккорд', function: 'D', sopranoFactor: '5', bassDegree: 5, weight: isSecondToLast ? 90 : 25 },
        { chordId: 'D53', symbol: 'D5/3', romanNumeral: 'V', nameRu: 'Доминантное трезвучие', function: 'D', sopranoFactor: '5', bassDegree: 5, weight: isSecondToLast ? 75 : 20 },
        { chordId: 'D43', symbol: 'D4/3', romanNumeral: 'V4/3', nameRu: 'Терцквартаккорд доминанты', function: 'D', sopranoFactor: '5', bassDegree: 2, weight: 18 },
        { chordId: 'D64', symbol: 'D6/4', romanNumeral: 'V6/4', nameRu: 'Проходящий квартсекстаккорд D', function: 'D', sopranoFactor: '5', bassDegree: 2, weight: 16, requiresWeakBeat: true },
        { chordId: 'II6', symbol: 'II6', romanNumeral: isMaj ? 'ii6' : 'ii°6', nameRu: 'Секстаккорд II ступени', function: 'S', sopranoFactor: '1', bassDegree: 4, weight: 22 },
        { chordId: 'VII6', symbol: 'VII6', romanNumeral: 'vii°6', nameRu: 'Секстаккорд VII ступени', function: 'D', sopranoFactor: '3', bassDegree: 2, weight: 10 }
      );
      break;

    case 3: // III degree (Mediant)
      list.push(
        { chordId: 'T53', symbol: `${prefixT}5/3`, romanNumeral: isMaj ? 'I' : 'i', nameRu: 'Тоническое трезвучие', function: 'T', sopranoFactor: '3', bassDegree: 1, weight: isLastNote ? 60 : 30 },
        { chordId: 'T6', symbol: `${prefixT}6`, romanNumeral: isMaj ? 'I6' : 'i6', nameRu: 'Тонический секстаккорд', function: 'T', sopranoFactor: '3', bassDegree: 3, weight: 22 },
        { chordId: 'VI53', symbol: 'VI5/3', romanNumeral: 'VI', nameRu: 'Трезвучие VI ступени', function: 'T', sopranoFactor: '5', bassDegree: 6, weight: 10 }
      );
      break;

    case 4: // IV degree (Subdominant)
      list.push(
        { chordId: 'S53', symbol: `${prefixS}5/3`, romanNumeral: isMaj ? 'IV' : 'iv', nameRu: 'Субдоминантовое трезвучие', function: 'S', sopranoFactor: '1', bassDegree: 4, weight: 25 },
        { chordId: 'S6', symbol: `${prefixS}6`, romanNumeral: isMaj ? 'IV6' : 'iv6', nameRu: 'Субдоминантный секстаккорд', function: 'S', sopranoFactor: '1', bassDegree: 6, weight: 25 },
        { chordId: 'II6', symbol: 'II6', romanNumeral: isMaj ? 'ii6' : 'ii°6', nameRu: 'Секстаккорд II ступени', function: 'S', sopranoFactor: '3', bassDegree: 4, weight: 28 },
        { chordId: 'D7', symbol: 'D7', romanNumeral: 'V7', nameRu: 'Доминантсептаккорд (септима в сопрано)', function: 'D', sopranoFactor: '7', bassDegree: 5, weight: isSecondToLast ? 85 : 20 },
        { chordId: 'D65', symbol: 'D6/5', romanNumeral: 'V6/5', nameRu: 'Квинтсекстаккорд доминанты', function: 'D', sopranoFactor: '7', bassDegree: 7, weight: 18 },
        { chordId: 'D43', symbol: 'D4/3', romanNumeral: 'V4/3', nameRu: 'Терцквартаккорд доминанты', function: 'D', sopranoFactor: '7', bassDegree: 2, weight: 16 },
        { chordId: 'D2', symbol: 'D2', romanNumeral: 'V2', nameRu: 'Секундаккорд доминанты', function: 'D', sopranoFactor: '7', bassDegree: 4, weight: 14 }
      );
      break;

    case 5: // V degree (Dominant)
      list.push(
        { chordId: 'K64', symbol: 'K6/4', romanNumeral: isMaj ? 'Cad6/4' : 'cad6/4', nameRu: 'Кадансовый квартсекстаккорд', function: 'D', sopranoFactor: '1', bassDegree: 5, weight: isStrongBeat ? 80 : 10, requiresStrongBeat: true },
        { chordId: 'D53', symbol: 'D5/3', romanNumeral: 'V', nameRu: 'Доминантное трезвучие', function: 'D', sopranoFactor: '1', bassDegree: 5, weight: 25 },
        { chordId: 'D7', symbol: 'D7', romanNumeral: 'V7', nameRu: 'Доминантсептаккорд', function: 'D', sopranoFactor: '1', bassDegree: 5, weight: isSecondToLast ? 75 : 22 },
        { chordId: 'T53', symbol: `${prefixT}5/3`, romanNumeral: isMaj ? 'I' : 'i', nameRu: 'Тоническое трезвучие', function: 'T', sopranoFactor: '5', bassDegree: 1, weight: 24 },
        { chordId: 'T64', symbol: `${prefixT}6/4`, romanNumeral: isMaj ? 'I6/4' : 'i6/4', nameRu: 'Проходящий тонический 6/4', function: 'T', sopranoFactor: '5', bassDegree: 5, weight: 12, requiresWeakBeat: true }
      );
      break;

    case 6: // VI degree (Submediant)
      list.push(
        { chordId: 'S53', symbol: `${prefixS}5/3`, romanNumeral: isMaj ? 'IV' : 'iv', nameRu: 'Субдоминантовое трезвучие', function: 'S', sopranoFactor: '3', bassDegree: 4, weight: 26 },
        { chordId: 'S6', symbol: `${prefixS}6`, romanNumeral: isMaj ? 'IV6' : 'iv6', nameRu: 'Субдоминантный секстаккорд', function: 'S', sopranoFactor: '3', bassDegree: 6, weight: 22 },
        { chordId: 'II6', symbol: 'II6', romanNumeral: isMaj ? 'ii6' : 'ii°6', nameRu: 'Секстаккорд II ступени', function: 'S', sopranoFactor: '5', bassDegree: 4, weight: 24 },
        { chordId: 'VI53', symbol: 'VI5/3', romanNumeral: 'VI', nameRu: 'Трезвучие VI ступени', function: 'T', sopranoFactor: '1', bassDegree: 6, weight: 15 }
      );
      break;

    case 7: // VII degree (Leading tone)
      list.push(
        { chordId: 'D53', symbol: 'D5/3', romanNumeral: 'V', nameRu: 'Доминантное трезвучие', function: 'D', sopranoFactor: '3', bassDegree: 5, weight: 30 },
        { chordId: 'D7', symbol: 'D7', romanNumeral: 'V7', nameRu: 'Доминантсептаккорд', function: 'D', sopranoFactor: '3', bassDegree: 5, weight: isSecondToLast ? 90 : 35 },
        { chordId: 'D6', symbol: 'D6', romanNumeral: 'V6', nameRu: 'Доминантный секстаккорд', function: 'D', sopranoFactor: '3', bassDegree: 7, weight: 20 },
        { chordId: 'D65', symbol: 'D6/5', romanNumeral: 'V6/5', nameRu: 'Квинтсекстаккорд доминанты', function: 'D', sopranoFactor: '3', bassDegree: 7, weight: 22 },
        { chordId: 'VII6', symbol: 'VII6', romanNumeral: 'vii°6', nameRu: 'Секстаккорд VII ступени', function: 'D', sopranoFactor: '1', bassDegree: 2, weight: 12 }
      );
      break;
  }

  return list;
}

// ----------------------------------------------------------------------
// Canonical Harmonic Turn Patterns to Detect and Reward
// ----------------------------------------------------------------------
export interface HarmonicTurnPattern {
  id: string;
  nameRu: string;
  formulaRu: string;
  categoryRu: string;
  explanationRu: string;
  colorAccent: string;
  chordSequence: string[]; // e.g. ['K64', 'D7', 'T53']
}

export const CANONICAL_TURN_PATTERNS: HarmonicTurnPattern[] = [
  {
    id: 'full_cadence_k64_d7_t',
    nameRu: 'Полный кадансовый оборот с K6/4',
    formulaRu: 'K6/4 → D7 → T5/3',
    categoryRu: 'Кадансовые обороты',
    explanationRu: 'Вершина классического формообразования. K6/4 на сильном времени задерживает тонику на доминантовом басу и разрешается в D7 с последующим переходом в устойчивую тонику.',
    colorAccent: 'amber',
    chordSequence: ['K64', 'D7', 'T53'],
  },
  {
    id: 'subdominant_cadence_s_k64_d7_t',
    nameRu: 'Развернутый каданс со связкой S — K6/4',
    formulaRu: 'S6 → K6/4 → D7 → T5/3',
    categoryRu: 'Кадансовые обороты',
    explanationRu: 'Полный классический гармонический цикл T — S — D — T. Субдоминанта подготавливает появление K6/4, далее разрешающегося через D7 в тонику.',
    colorAccent: 'amber',
    chordSequence: ['S6', 'K64', 'D7', 'T53'],
  },
  {
    id: 'ii6_cadence',
    nameRu: 'Превосходная каденция с II6',
    formulaRu: 'II6 → K6/4 → D7 → T5/3',
    categoryRu: 'Кадансовые обороты',
    explanationRu: 'Секстаккорд II ступени создает ярчайшее субдоминантовое тяготение перед K6/4 благодаря басовому удвоению IV ступени.',
    colorAccent: 'amber',
    chordSequence: ['II6', 'K64', 'D7', 'T53'],
  },
  {
    id: 'authentic_d7_t',
    nameRu: 'Автентический оборот D7 → T',
    formulaRu: 'D7 → T5/3',
    categoryRu: 'Автентические обороты',
    explanationRu: 'Ключевой оборот европейской гармонии: напряженный тритон D7 (IV–VII) разрешается с противоположным движением в тоническую терцию и приму.',
    colorAccent: 'rose',
    chordSequence: ['D7', 'T53'],
  },
  {
    id: 'passing_t_d64_t6',
    nameRu: 'Проходящий оборот T — D6/4 — T6',
    formulaRu: 'T5/3 → D6/4 → T6',
    categoryRu: 'Проходящие обороты',
    explanationRu: 'Плавное поступенное движение баса (I — II — III) встречает противоположное движение в сопрано (III — II — I). В D6/4 обязательно удваивается бас.',
    colorAccent: 'emerald',
    chordSequence: ['T53', 'D64', 'T6'],
  },
  {
    id: 'passing_t6_d64_t',
    nameRu: 'Нисходящий проходящий оборот T6 — D6/4 — T',
    formulaRu: 'T6 → D6/4 → T5/3',
    categoryRu: 'Проходящие обороты',
    explanationRu: 'Нисходящее поступенное движение баса (III — II — I) с противоположным восходящим движением в верхнем голосе (I — II — III).',
    colorAccent: 'emerald',
    chordSequence: ['T6', 'D64', 'T53'],
  },
  {
    id: 'passing_t_d43_t6',
    nameRu: 'Проходящий терцквартаккорд D4/3',
    formulaRu: 'T5/3 → D4/3 → T6',
    categoryRu: 'Проходящие обороты',
    explanationRu: 'Обращение доминантсептаккорда на II ступени баса плавно соединяет T5/3 и T6. Септима D4/3 плавно разрешается на секунду вниз.',
    colorAccent: 'emerald',
    chordSequence: ['T53', 'D43', 'T6'],
  },
  {
    id: 'auxiliary_t_s64_t',
    nameRu: 'Вспомогательный плагальный оборот T — S6/4 — T',
    formulaRu: 'T5/3 → S6/4 → T5/3',
    categoryRu: 'Вспомогательные обороты',
    explanationRu: 'Бас остается неподвижным на тонике (I ст.), а средние голоса опевают аккордовые тона вспомогательными секундами 5–6–5 и 3–4–3.',
    colorAccent: 'sky',
    chordSequence: ['T53', 'S64', 'T53'],
  },
  {
    id: 'plagal_t_s_t',
    nameRu: 'Плагальный оборот T — S — T',
    formulaRu: 'T5/3 → S5/3 → T5/3',
    categoryRu: 'Плагальные обороты',
    explanationRu: 'Мягкий, умиротворяющий церковно-хоровой оборот, широко применяемый в кодах и дополнениях после генерального каданса.',
    colorAccent: 'sky',
    chordSequence: ['T53', 'S53', 'T53'],
  },
  {
    id: 'deceptive_cadence_d7_vi',
    nameRu: 'Прерванный каданс D7 → VI',
    formulaRu: 'D7 → VI5/3',
    categoryRu: 'Прерванные обороты',
    explanationRu: 'Внезапный драматический поворот вместо ожидаемой тоники: бас поднимается на секунду вверх V → VI, вводный тон идет в I ст., септима вниз, а в VI5/3 удваивается терция.',
    colorAccent: 'purple',
    chordSequence: ['D7', 'VI53'],
  },
  {
    id: 'subdominant_group_s_ii6',
    nameRu: 'Субдоминантовый комплекс S → II6',
    formulaRu: 'S5/3 → II6',
    categoryRu: 'Субдоминантовые обороты',
    explanationRu: 'Обогащение субдоминантовой группы с переходом основного трезвучия в секстаккорд II ступени с удвоением баса.',
    colorAccent: 'teal',
    chordSequence: ['S53', 'II6'],
  },
];

// ----------------------------------------------------------------------
// Voice Leading Realizer for SATB
// ----------------------------------------------------------------------
export function realizeSATBStep(
  sopranoMidi: number,
  chordDef: CandidateChordDef,
  key: HarmonizationKey,
  prevSATB?: [number, number, number, number]
): [number, number, number, number] {
  const tonicPc = getTonicPitchClass(key);
  const isMaj = key.mode === 'major';

  // Base offsets relative to tonic for each chord
  const chordOffsetsMap: Record<string, { bass: number; pitchClasses: number[]; defaultDoubling: 'bass' | 'root' | 'third' | 'fifth' }> = {
    T53: { bass: 0, pitchClasses: [0, isMaj ? 4 : 3, 7], defaultDoubling: 'root' },
    T6: { bass: isMaj ? 4 : 3, pitchClasses: [0, isMaj ? 4 : 3, 7], defaultDoubling: 'root' },
    T64: { bass: 7, pitchClasses: [0, isMaj ? 4 : 3, 7], defaultDoubling: 'bass' },
    S53: { bass: 5, pitchClasses: [5, isMaj ? 9 : 8, 0], defaultDoubling: 'root' },
    S6: { bass: isMaj ? 9 : 8, pitchClasses: [5, isMaj ? 9 : 8, 0], defaultDoubling: 'root' },
    S64: { bass: 0, pitchClasses: [5, isMaj ? 9 : 8, 0], defaultDoubling: 'bass' },
    D53: { bass: 7, pitchClasses: [7, 11, 2], defaultDoubling: 'root' },
    D6: { bass: 11, pitchClasses: [7, 11, 2], defaultDoubling: 'root' },
    D64: { bass: 2, pitchClasses: [7, 11, 2], defaultDoubling: 'bass' },
    D7: { bass: 7, pitchClasses: [7, 11, 2, 5], defaultDoubling: 'root' },
    D65: { bass: 11, pitchClasses: [7, 11, 2, 5], defaultDoubling: 'root' },
    D43: { bass: 2, pitchClasses: [7, 11, 2, 5], defaultDoubling: 'root' },
    D2: { bass: 5, pitchClasses: [7, 11, 2, 5], defaultDoubling: 'root' },
    K64: { bass: 7, pitchClasses: [7, 0, isMaj ? 4 : 3], defaultDoubling: 'bass' },
    VI53: { bass: isMaj ? 9 : 8, pitchClasses: [isMaj ? 9 : 8, 0, isMaj ? 4 : 3], defaultDoubling: 'third' }, // Double third in VI
    II6: { bass: 5, pitchClasses: [5, isMaj ? 9 : 8, 2], defaultDoubling: 'bass' }, // Double bass in II6
    VII6: { bass: 2, pitchClasses: [2, 5, 11], defaultDoubling: 'bass' },
  };

  const info = chordOffsetsMap[chordDef.chordId] || chordOffsetsMap['T53'];

  // 1. Calculate Bass (Range: E2 - C4, MIDI 40 - 60)
  const bassTargetPc = (tonicPc + info.bass) % 12;
  let bassMidi = 48 + ((bassTargetPc - (48 % 12) + 12) % 12);
  if (bassMidi > 58) bassMidi -= 12;
  if (bassMidi < 40) bassMidi += 12;

  // 2. Tenor and Alto: Fill remaining chord members smoothly
  const sopranoPc = ((sopranoMidi % 12) + 12) % 12;
  const targetPcs = info.pitchClasses.map((p) => (tonicPc + p) % 12);

  // Remaining pitch classes to distribute in Tenor and Alto
  const neededPcs = [...targetPcs];

  // Candidates for Tenor (C3 - G4, MIDI 48 - 67)
  // Candidates for Alto (G3 - D5, MIDI 55 - 74)
  let bestTenor = 55;
  let bestAlto = 60;
  let minCost = Infinity;

  // If there's a previous chord, optimize for minimum voice displacement and no voice crossing
  for (let tMidi = 48; tMidi <= 65; tMidi++) {
    if (tMidi <= bassMidi) continue;
    const tPc = tMidi % 12;
    if (!targetPcs.includes(tPc)) continue;

    for (let aMidi = 55; aMidi <= 72; aMidi++) {
      if (aMidi <= tMidi || aMidi >= sopranoMidi) continue;
      const aPc = aMidi % 12;
      if (!targetPcs.includes(aPc)) continue;

      // Check pitch class completeness: chord should contain all needed notes if possible
      const presentPcs = new Set([bassTargetPc, tPc, aPc, sopranoPc]);
      let missingPenalty = 0;
      targetPcs.forEach((p) => {
        if (!presentPcs.has(p)) missingPenalty += 30;
      });

      // Displacement cost from previous chord
      let displacement = 0;
      let parallelPenalty = 0;
      if (prevSATB) {
        const [prevB, prevT, prevA, prevS] = prevSATB;
        displacement =
          Math.abs(tMidi - prevT) * 1.5 +
          Math.abs(aMidi - prevA) * 1.5 +
          Math.abs(bassMidi - prevB) * 1.0;

        // Check parallel 5ths and octaves
        const prevIntervalTB = (prevT - prevB) % 12;
        const curIntervalTB = (tMidi - bassMidi) % 12;
        if ((prevIntervalTB === 7 && curIntervalTB === 7) || (prevIntervalTB === 0 && curIntervalTB === 0)) {
          parallelPenalty += 150;
        }

        const prevIntervalAB = (prevA - prevB) % 12;
        const curIntervalAB = (aMidi - bassMidi) % 12;
        if ((prevIntervalAB === 7 && curIntervalAB === 7) || (prevIntervalAB === 0 && curIntervalAB === 0)) {
          parallelPenalty += 150;
        }

        const prevIntervalSB = (prevS - prevB) % 12;
        const curIntervalSB = (sopranoMidi - bassMidi) % 12;
        if ((prevIntervalSB === 7 && curIntervalSB === 7) || (prevIntervalSB === 0 && curIntervalSB === 0)) {
          parallelPenalty += 200;
        }
      }

      const totalCost = displacement + missingPenalty + parallelPenalty;
      if (totalCost < minCost) {
        minCost = totalCost;
        bestTenor = tMidi;
        bestAlto = aMidi;
      }
    }
  }

  // Fallback if no clean interval combination found
  if (minCost === Infinity) {
    bestTenor = Math.max(bassMidi + 5, 52);
    bestAlto = Math.min(sopranoMidi - 4, 64);
  }

  return [bassMidi, bestTenor, bestAlto, sopranoMidi];
}

// ----------------------------------------------------------------------
// Dynamic Programming Harmonization Solver
// ----------------------------------------------------------------------
export function autoHarmonizeMelody(
  sopranoNotes: SopranoInputNote[],
  key: HarmonizationKey
): HarmonizationResult {
  if (sopranoNotes.length === 0) {
    return {
      steps: [],
      detectedTurns: [],
      key,
      meter: '4/4',
      voiceLeadingFeedback: [],
      totalScore: 100,
    };
  }

  const n = sopranoNotes.length;

  // Step 1: Collect candidates for each note
  const candidatesPerStep: CandidateChordDef[][] = [];
  for (let i = 0; i < n; i++) {
    const note = sopranoNotes[i];
    const isLast = i === n - 1;
    const isSecondToLast = i === n - 2;
    const candidates = getCandidateChordsForDegree(
      note.degreeNum,
      note.isStrongBeat,
      isLast,
      isSecondToLast,
      key
    );
    candidatesPerStep.push(candidates);
  }

  // Step 2: Dynamic programming Viterbi search
  // dp[step][candidateIndex] = { score, prevCandidateIndex }
  interface DPNode {
    score: number;
    prevIndex: number;
    satb: [number, number, number, number];
  }

  const dp: DPNode[][] = [];

  // Initialize step 0
  dp[0] = [];
  for (let c = 0; c < candidatesPerStep[0].length; c++) {
    const chord = candidatesPerStep[0][c];
    const satb = realizeSATBStep(sopranoNotes[0].midi, chord, key);
    let initialScore = chord.weight;
    // Prefer tonic at start
    if (chord.function === 'T') initialScore += 40;
    dp[0].push({ score: initialScore, prevIndex: -1, satb });
  }

  // Transitions for steps 1..n-1
  for (let i = 1; i < n; i++) {
    dp[i] = [];
    const curCandidates = candidatesPerStep[i];
    const prevCandidates = candidatesPerStep[i - 1];

    for (let c = 0; c < curCandidates.length; c++) {
      const curChord = curCandidates[c];
      let bestScore = -Infinity;
      let bestPrevIndex = 0;
      let bestSATB: [number, number, number, number] = [48, 55, 60, sopranoNotes[i].midi];

      for (let p = 0; p < prevCandidates.length; p++) {
        const prevChord = prevCandidates[p];
        const prevNode = dp[i - 1][p];

        const satb = realizeSATBStep(sopranoNotes[i].midi, curChord, key, prevNode.satb);

        // Transition evaluation
        let transitionScore = curChord.weight;

        // Functional progression rules:
        // T -> S is good (+25)
        // S -> D is great (+35)
        // D -> T is canonical (+40)
        // S -> K6/4 is great (+45)
        // K6/4 -> D7 is exceptional (+60)
        // D -> S is forbidden in classical harmony (-80) unless within sequence
        if (prevChord.function === 'T' && curChord.function === 'S') transitionScore += 25;
        else if (prevChord.function === 'S' && curChord.function === 'D') transitionScore += 35;
        else if (prevChord.function === 'D' && curChord.function === 'T') transitionScore += 40;
        else if (prevChord.chordId === 'K64' && curChord.chordId.startsWith('D')) transitionScore += 65;
        else if (prevChord.chordId.startsWith('S') && curChord.chordId === 'K64') transitionScore += 45;
        else if (prevChord.chordId === 'II6' && curChord.chordId === 'K64') transitionScore += 55;
        else if (prevChord.chordId === 'D7' && curChord.chordId === 'VI53') transitionScore += 50; // Deceptive
        else if (prevChord.function === 'D' && curChord.function === 'S') transitionScore -= 80; // D -> S forbidden

        // Check parallel octaves/fifths penalty from SATB
        const [pB, pT, pA, pS] = prevNode.satb;
        const [cB, cT, cA, cS] = satb;

        // Parallel 8ves between Bass and Soprano
        if (pS - pB === 12 && cS - cB === 12) transitionScore -= 150;
        // Parallel 5ths
        if ((pS - pB) % 12 === 7 && (cS - cB) % 12 === 7) transitionScore -= 150;

        // Reward contrary motion between Bass and Soprano
        const bassDelta = cB - pB;
        const sopranoDelta = cS - pS;
        if (bassDelta * sopranoDelta < 0) transitionScore += 15; // contrary motion

        const totalPathScore = prevNode.score + transitionScore;
        if (totalPathScore > bestScore) {
          bestScore = totalPathScore;
          bestPrevIndex = p;
          bestSATB = satb;
        }
      }

      dp[i].push({ score: bestScore, prevIndex: bestPrevIndex, satb: bestSATB });
    }
  }

  // Backtrack optimal path
  let bestLastIndex = 0;
  let maxScore = -Infinity;
  for (let c = 0; c < dp[n - 1].length; c++) {
    if (dp[n - 1][c].score > maxScore) {
      maxScore = dp[n - 1][c].score;
      bestLastIndex = c;
    }
  }

  const chosenPath: { candidate: CandidateChordDef; satb: [number, number, number, number] }[] = [];
  let curIndex = bestLastIndex;
  for (let i = n - 1; i >= 0; i--) {
    chosenPath[i] = {
      candidate: candidatesPerStep[i][curIndex],
      satb: dp[i][curIndex].satb,
    };
    curIndex = dp[i][curIndex].prevIndex;
  }

  // Step 3: Pattern matching for Harmonic Turns
  const chordSequence = chosenPath.map((p) => p.candidate.chordId);
  const detectedTurns: DetectedHarmonicTurn[] = [];

  for (const pattern of CANONICAL_TURN_PATTERNS) {
    const pLen = pattern.chordSequence.length;
    for (let i = 0; i <= chordSequence.length - pLen; i++) {
      let match = true;
      for (let k = 0; k < pLen; k++) {
        if (chordSequence[i + k] !== pattern.chordSequence[k]) {
          match = false;
          break;
        }
      }
      if (match) {
        detectedTurns.push({
          id: `${pattern.id}_${i}`,
          turnNameRu: pattern.nameRu,
          formulaRu: pattern.formulaRu,
          categoryRu: pattern.categoryRu,
          startIndex: i,
          endIndex: i + pLen - 1,
          explanationRu: pattern.explanationRu,
          colorAccent: pattern.colorAccent,
        });
      }
    }
  }

  // Step 4: Assemble Harmonized Steps
  const steps: HarmonizedStep[] = chosenPath.map((item, idx) => {
    const note = sopranoNotes[idx];
    const candidate = item.candidate;
    const [bMidi, tMidi, aMidi, sMidi] = item.satb;

    // Doubling rule explanation
    let voiceDoublingRu = 'Удвоена прима';
    if (candidate.chordId === 'K64' || candidate.chordId === 'D64' || candidate.chordId === 'S64' || candidate.chordId === 'II6') {
      voiceDoublingRu = 'Удвоен бас (классическое правило)';
    } else if (candidate.chordId === 'VI53') {
      voiceDoublingRu = 'Удвоена терция (тонический звук)';
    } else if (candidate.chordId === 'D7') {
      voiceDoublingRu = 'Все 4 звука аккорда (без удвоений)';
    }

    // Check if this step is part of any detected turn
    const turn = detectedTurns.find((t) => idx >= t.startIndex && idx <= t.endIndex);

    return {
      index: idx,
      sopranoNote: note,
      chordId: candidate.chordId,
      chordSymbol: candidate.symbol,
      chordNameRu: candidate.nameRu,
      degreeRoman: candidate.romanNumeral,
      function: candidate.function,
      sopranoFactor: candidate.sopranoFactor,
      midisSATB: [bMidi, tMidi, aMidi, sMidi],
      noteNamesSATB: [
        formatMidiToNoteName(bMidi, key),
        formatMidiToNoteName(tMidi, key),
        formatMidiToNoteName(aMidi, key),
        formatMidiToNoteName(sMidi, key),
      ],
      activeTurnBadge: turn ? turn.formulaRu : undefined,
      voiceDoublingRu,
    };
  });

  // Step 5: Voice leading feedback
  const voiceLeadingFeedback: string[] = [];
  if (detectedTurns.length > 0) {
    voiceLeadingFeedback.push(`Обнаружено академических оборотов: ${detectedTurns.length} (${detectedTurns.map((t) => t.turnNameRu).join(', ')})`);
  }
  voiceLeadingFeedback.push('Гармонизация выполнена по правилам академического голосоведения (плавность средних голосов, разрешение вводных тонов и септим).');

  return {
    steps,
    detectedTurns,
    key,
    meter: '4/4',
    voiceLeadingFeedback,
    totalScore: Math.min(100, Math.max(75, Math.round(maxScore / n))),
  };
}

// ----------------------------------------------------------------------
// Task Generator for Challenge Mode ("Задача")
// ----------------------------------------------------------------------
export function generateRandomHarmonizationTask(key: HarmonizationKey, meter: string = '4/4'): SopranoInputNote[] {
  const tonicPc = getTonicPitchClass(key);
  const intervals = getScaleIntervals(key);

  // Pick a base MIDI for degree 1 near C4/C5 octave (60 + tonicPc)
  let baseMidiDegree1 = 60 + tonicPc;
  if (baseMidiDegree1 > 67) baseMidiDegree1 -= 12;

  // Preset degree sequences for academic tasks
  const degreePatterns = [
    [3, 4, 5, 4, 2, 1],       // III - IV - V - IV - II - I
    [1, 3, 2, 5, 6, 5, 1],    // I - III - II - V - VI - V - I
    [5, 4, 3, 2, 1],          // V - IV - III - II - I
    [3, 2, 1, 4, 2, 1],       // III - II - I - IV - II - I
    [1, 4, 5, 6, 5, 1],       // I - IV - V - VI - V - I
  ];

  const chosenDegrees = degreePatterns[Math.floor(Math.random() * degreePatterns.length)];
  const beatsPerMeasure = parseInt(meter.split('/')[0], 10) || 4;

  let currentMeasure = 1;
  let currentBeat = 1;

  return chosenDegrees.map((degNum, idx) => {
    const semitonesFromTonic = intervals[degNum - 1];
    let midi = baseMidiDegree1 + semitonesFromTonic;
    if (midi < 60) midi += 12;

    const isLast = idx === chosenDegrees.length - 1;
    const isPenultimate = idx === chosenDegrees.length - 2;

    let duration: NoteDurationType = 'q';
    let durationBeats = 1;

    if (isLast) {
      duration = 'w';
      durationBeats = 4;
    } else if (isPenultimate) {
      duration = 'h';
      durationBeats = 2;
    }

    const measure = currentMeasure;
    const beat = currentBeat;
    const isStrongBeat = beat === 1 || beat === 3;

    currentBeat += durationBeats;
    while (currentBeat > beatsPerMeasure) {
      currentBeat -= beatsPerMeasure;
      currentMeasure += 1;
    }

    const degObj = calculateDegreeFromMidi(midi, key);

    return {
      id: `task_note_${idx}_${Date.now()}`,
      midi,
      noteName: formatMidiToNoteName(midi, key),
      duration,
      durationBeats,
      measure,
      beat: Math.round(beat * 10) / 10,
      isStrongBeat,
      degreeNum: degObj.degreeNum,
      degreeRoman: degObj.degreeRoman,
    };
  });
}

// ----------------------------------------------------------------------
// Classical Voice-Leading Rule Auditor for User Harmonization
// ----------------------------------------------------------------------
export interface AuditErrorItem {
  type: 'error' | 'warning';
  measure: number;
  titleRu: string;
  descriptionRu: string;
}

export function auditUserHarmonization(
  steps: HarmonizedStep[],
  key: HarmonizationKey
): AuditErrorItem[] {
  const issues: AuditErrorItem[] = [];

  if (steps.length === 0) return issues;

  // Voice names: 0 = Bass, 1 = Tenor, 2 = Alto, 3 = Soprano
  const voiceNames = ['Бас', 'Тенор', 'Альт', 'Сопрано'];

  for (let i = 0; i < steps.length; i++) {
    const cur = steps[i];
    const [b, t, a, s] = cur.midisSATB;
    const m = cur.sopranoNote.measure;

    // 1. Voice Crossing
    if (b >= t) {
      issues.push({
        type: 'error',
        measure: m,
        titleRu: 'Перекрещивание голосов (Бас / Тенор)',
        descriptionRu: `Доля ${i + 1}: Бас (${cur.noteNamesSATB[0]}) выше или равен Тенору (${cur.noteNamesSATB[1]}).`,
      });
    }
    if (t >= a) {
      issues.push({
        type: 'error',
        measure: m,
        titleRu: 'Перекрещивание голосов (Тенор / Альт)',
        descriptionRu: `Доля ${i + 1}: Тенор (${cur.noteNamesSATB[1]}) выше или равен Альту (${cur.noteNamesSATB[2]}).`,
      });
    }
    if (a >= s) {
      issues.push({
        type: 'error',
        measure: m,
        titleRu: 'Перекрещивание голосов (Альт / Сопрано)',
        descriptionRu: `Доля ${i + 1}: Альт (${cur.noteNamesSATB[2]}) выше или равен Сопрано (${cur.noteNamesSATB[3]}).`,
      });
    }

    // 2. Wide spacing between upper adjacent voices (> 12 semitones)
    if (s - a > 12) {
      issues.push({
        type: 'warning',
        measure: m,
        titleRu: 'Широкое расположение между Сопрано и Альтом',
        descriptionRu: `Доля ${i + 1}: Расстояние превышает октаву (${s - a} полутонов).`,
      });
    }
    if (a - t > 12) {
      issues.push({
        type: 'warning',
        measure: m,
        titleRu: 'Широкое расположение между Альтом и Тенором',
        descriptionRu: `Доля ${i + 1}: Расстояние превышает октаву (${a - t} полутонов).`,
      });
    }

    // 3. Voice ranges
    if (s < 60 || s > 81) {
      issues.push({
        type: 'warning',
        measure: m,
        titleRu: 'Выход Сопрано за диапазон',
        descriptionRu: `Доля ${i + 1}: Нота ${cur.noteNamesSATB[3]} вне классического диапазона сопрано (C4–A5).`,
      });
    }
    if (b < 36 || b > 64) {
      issues.push({
        type: 'warning',
        measure: m,
        titleRu: 'Выход Баса за диапазон',
        descriptionRu: `Доля ${i + 1}: Нота ${cur.noteNamesSATB[0]} вне классического диапазона баса (C2–E4).`,
      });
    }

    // Consecutive voice leading checks with next step
    if (i < steps.length - 1) {
      const next = steps[i + 1];
      const satb1 = cur.midisSATB;
      const satb2 = next.midisSATB;

      // Check parallel 5ths and 8ves across all 6 pairs
      const pairs: [number, number][] = [
        [0, 1], [0, 2], [0, 3], [1, 2], [1, 3], [2, 3],
      ];

      for (const [v1, v2] of pairs) {
        const p1_val1 = satb1[v1];
        const p1_val2 = satb1[v2];
        const p2_val1 = satb2[v1];
        const p2_val2 = satb2[v2];

        const interval1 = Math.abs(p1_val2 - p1_val1) % 12;
        const interval2 = Math.abs(p2_val2 - p2_val1) % 12;

        const delta1 = p2_val1 - p1_val1;
        const delta2 = p2_val2 - p1_val2;

        // Parallel movement in same direction
        if (delta1 !== 0 && delta2 !== 0 && Math.sign(delta1) === Math.sign(delta2)) {
          // Parallel Octaves / Unisons
          if (interval1 === 0 && interval2 === 0) {
            issues.push({
              type: 'error',
              measure: next.sopranoNote.measure,
              titleRu: `Параллельные октавы (${voiceNames[v1]} — ${voiceNames[v2]})`,
              descriptionRu: `Переход ${i + 1} -> ${i + 2}: Запрещенное параллельное движение в октаву.`,
            });
          }
          // Parallel Fifths
          if (interval1 === 7 && interval2 === 7) {
            issues.push({
              type: 'error',
              measure: next.sopranoNote.measure,
              titleRu: `Параллельные квинты (${voiceNames[v1]} — ${voiceNames[v2]})`,
              descriptionRu: `Переход ${i + 1} -> ${i + 2}: Запрещенное параллельное движение в квинту.`,
            });
          }
        }
      }

      // Check D -> T leading tone resolution in soprano
      if (cur.function === 'D' && next.function === 'T') {
        const tonicPc = getTonicPitchClass(key);
        const leadingTonePc = (tonicPc + 11) % 12;
        if ((cur.midisSATB[3] % 12) === leadingTonePc) {
          if ((next.midisSATB[3] % 12) !== tonicPc) {
            issues.push({
              type: 'warning',
              measure: next.sopranoNote.measure,
              titleRu: 'Неразрешенный вводный тон в Сопрано',
              descriptionRu: `Вводный 7-й тон должен разрешаться вверх в тонику.`,
            });
          }
        }
      }
    }
  }

  return issues;
}

// ----------------------------------------------------------------------
// Classical Presets for Instant Loading
// ----------------------------------------------------------------------
export interface MelodyHarmonizationPreset {
  id: string;
  title: string;
  keyTonic: string;
  meter: string;
  description: string;
  notes: { midi: number; duration: NoteDurationType; isDotted?: boolean }[];
}

export const CLASSICAL_MELODY_PRESETS: MelodyHarmonizationPreset[] = [
  {
    id: 'c_major_cadence',
    title: 'Классическая кадансовая мелодия (C-dur)',
    keyTonic: 'C',
    meter: '4/4',
    description: 'Академическая тема с ходом III — IV — V — IV — I, идеально гармонизующаяся через S6 — K6/4 — D7 — T.',
    notes: [
      { midi: 64, duration: 'q' }, // E4 (III)
      { midi: 65, duration: 'q' }, // F4 (IV)
      { midi: 67, duration: 'h' }, // G4 (V)
      { midi: 65, duration: 'h' }, // F4 (IV)
      { midi: 60, duration: 'w' }, // C4 (I)
    ],
  },
];
