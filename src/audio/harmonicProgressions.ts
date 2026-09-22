import { CHROMATIC_NOTES_UP } from '../data/musicData';
import { compileEncyclopedicProgressions } from './encyclopediaData';

export type ProgressionCategory =
  | 'cadential'    // 1. Базовые & кадансовые
  | 'passing'      // 2. Проходящие
  | 'auxiliary'    // 3. Вспомогательные
  | 'deceptive'    // 4. Каденционные и прерванные
  | 'disjunct'     // 5. Обороты со скачками голосов
  | 'altered'      // 6. Альтерированные (DD, Ув.6, N6, секста Чайковского)
  | 'modal'        // 7. Модальные (дорийский, миксолидийский, лидийский, обиходные)
  | 'sequence'     // 8. Секвенции (золотая секвенция, цепи септаккордов)
  | 'ellipsis'     // 9. Эллипсис & тритоновые замены
  | 'modern';      // 10. Симметричные & современные (целотонные, Прокофьев, Шостакович)

export type ScaleDegreeCategory = 'all' | 'I' | 'II' | 'III' | 'IV' | 'V' | 'VI' | 'VII';

export interface ProgressionChordStep {
  symbol: string;               // e.g. "T5/3", "D6/4", "T6"
  degreeRoman: string;          // e.g. "I", "V", "I"
  nameRu: string;               // e.g. "Тоническое трезвучие"
  // SATB offsets from tonic (Bass, Tenor, Alto, Soprano) in semitones:
  // Base octave tonic is at index 0 (C4)
  satbOffsets: [number, number, number, number]; // [Bass, Tenor, Alto, Soprano]
  voiceDegreesRu: {
    soprano: string; // e.g. "III (Ми)"
    alto: string;    // e.g. "I (До)"
    tenor: string;   // e.g. "V (Соль)"
    bass: string;    // e.g. "I (До)"
  };
}

export interface HarmonicProgressionTemplate {
  id: string;
  nameRu: string;
  formula: string;
  category: ProgressionCategory;
  categoryNameRu: string;
  rootDegree?: 'I' | 'II' | 'III' | 'IV' | 'V' | 'VI' | 'VII';
  scaleMode: 'major' | 'minor' | 'both';
  bassMotionRu: string;
  sopranoMotionRu: string;
  voiceLeadingExplanationRu: string;
  usageContextRu: string;
  steps: ProgressionChordStep[];
  originalTonicPC?: number;
}

export interface RealizedProgressionStep {
  symbol: string;
  degreeRoman: string;
  nameRu: string;
  midisSATB: [number, number, number, number];
  noteNamesSATB: [string, string, string, string];
  voiceDegreesRu: {
    soprano: string;
    alto: string;
    tenor: string;
    bass: string;
  };
}

export interface RealizedProgression {
  template: HarmonicProgressionTemplate;
  tonicNoteName: string;
  tonicPitch: number;
  scaleMode: 'major' | 'minor';
  keyNameRu: string;
  revealed: boolean;
  voiceLeadingValidation: VoiceLeadingCheckResult;
  steps: RealizedProgressionStep[];
}

/**
 * Fundamental Encyclopedia of Classical, Romantic, and Modern Harmonic Progressions (10 Classes)
 * Strictly calculated SATB Voice-Leading offsets based on classical Conservatory rules.
 */
export const CLASSICAL_PROGRESSIONS: HarmonicProgressionTemplate[] = compileEncyclopedicProgressions();

/**
 * Format symbol prefix based on mode
 */
export function formatSymbolForMode(symbol: string, mode: 'major' | 'minor'): string {
  let clean = symbol.trim();
  if (mode === 'minor') {
    clean = clean
      .replace(/^T/, 't')
      .replace(/^S/, 's')
      .replace(/^D/, 'd')
      .replace(/^K/, 'k')
      .replace(/^VII/, 'vii')
      .replace(/^II/, 'ii')
      .replace(/^N/, 'n');
  } else {
    clean = clean
      .replace(/^t/, 'T')
      .replace(/^s/, 'S')
      .replace(/^d/, 'D')
      .replace(/^k/, 'K')
      .replace(/^vii/, 'VII')
      .replace(/^ii/, 'II')
      .replace(/^n/, 'N');
  }
  return clean;
}

export interface VoiceLeadingCheckResult {
  isValid: boolean;
  warnings: string[];
}

export function checkVoiceLeading(
  steps: { midisSATB: [number, number, number, number] }[]
): VoiceLeadingCheckResult {
  const warnings: string[] = [];

  for (let s = 0; s < steps.length; s++) {
    const [b, t, a, sop] = steps[s].midisSATB;
    if (b > t || t > a || a > sop) {
      warnings.push(`Шаг ${s + 1}: Перекрещивание голосов (Бас <= Тенор <= Альт <= Сопрано).`);
    }
  }

  for (let s = 0; s < steps.length - 1; s++) {
    const satb1 = steps[s].midisSATB;
    const satb2 = steps[s + 1].midisSATB;

    const dirs = satb1.map((m1, i) => Math.sign(satb2[i] - m1));
    const isMoving = satb1.map((m1, i) => satb2[i] !== m1);

    if (dirs[0] !== 0 && dirs[0] === dirs[1] && dirs[1] === dirs[2] && dirs[2] === dirs[3]) {
      warnings.push(`Переход ${s + 1}→${s + 2}: Все 4 голоса движутся в одну сторону.`);
    }

    // Voice overlapping check (пересечение голосов при переходе)
    const [b1, t1, a1, sop1] = satb1;
    const [b2, t2, a2, sop2] = satb2;

    if (t2 > a1) {
      warnings.push(`Переход ${s + 1}→${s + 2}: Пересечение голосов (Тенор пошел выше прошлого звука Альта).`);
    }
    if (t2 < b1) {
      warnings.push(`Переход ${s + 1}→${s + 2}: Пересечение голосов (Тенор пошел ниже прошлого звука Баса).`);
    }
    if (a2 > sop1) {
      warnings.push(`Переход ${s + 1}→${s + 2}: Пересечение голосов (Альт пошел выше прошлого звука Сопрано).`);
    }
    if (a2 < t1) {
      warnings.push(`Переход ${s + 1}→${s + 2}: Пересечение голосов (Альт пошел ниже прошлого звука Тенора).`);
    }
    if (sop2 < a1) {
      warnings.push(`Переход ${s + 1}→${s + 2}: Пересечение голосов (Сопрано пошло ниже прошлого звука Альта).`);
    }
    if (b2 > t1) {
      warnings.push(`Переход ${s + 1}→${s + 2}: Пересечение голосов (Бас пошел выше прошлого звука Тенора).`);
    }

    for (let i = 0; i < 4; i++) {
      for (let j = i + 1; j < 4; j++) {
        if (isMoving[i] && isMoving[j]) {
          const interval1 = (satb1[j] - satb1[i] + 120) % 12;
          const interval2 = (satb2[j] - satb2[i] + 120) % 12;

          if (interval1 === 7 && interval2 === 7) {
            warnings.push(`Переход ${s + 1}→${s + 2}: Параллельные квинты между голосами.`);
          }
          if (interval1 === 0 && interval2 === 0) {
            warnings.push(`Переход ${s + 1}→${s + 2}: Параллельные октавы/унисоны между голосами.`);
          }
        }
      }
    }
  }

  return {
    isValid: warnings.length === 0,
    warnings,
  };
}

export function spellClassicalNoteName(noteMidi: number, tonicName: string, isMinor: boolean): string {
  const notePC = ((noteMidi % 12) + 12) % 12;
  const LETTERS = ['C', 'D', 'E', 'F', 'G', 'A', 'H'];
  
  const LETTER_NATURAL_PCS: Record<string, number> = {
    'C': 0, 'D': 2, 'E': 4, 'F': 5, 'G': 7, 'A': 9, 'H': 11
  };

  const cleanTonic = (tonicName || 'C').trim().replace(/\d+/g, '');
  let tonicLetter = 'C';
  if (cleanTonic.startsWith('C') || cleanTonic.startsWith('c')) tonicLetter = 'C';
  else if (cleanTonic.startsWith('D') || cleanTonic.startsWith('d')) tonicLetter = 'D';
  else if (cleanTonic.startsWith('E') || cleanTonic.startsWith('e')) tonicLetter = 'E';
  else if (cleanTonic.startsWith('F') || cleanTonic.startsWith('f')) tonicLetter = 'F';
  else if (cleanTonic.startsWith('G') || cleanTonic.startsWith('g')) tonicLetter = 'G';
  else if (cleanTonic.startsWith('A') || cleanTonic.startsWith('a')) tonicLetter = 'A';
  else if (cleanTonic.startsWith('H') || cleanTonic.startsWith('h') || cleanTonic.startsWith('B') || cleanTonic.startsWith('b')) tonicLetter = 'H';

  const tonicLetterIdx = LETTERS.indexOf(tonicLetter);
  
  const NOTE_LOOKUP_PITCHES: Record<string, number> = {
    'C': 0, 'Cis': 1, 'Des': 1, 'C#': 1,
    'D': 2, 'Dis': 3, 'Es': 3, 'D#': 3,
    'E': 4,
    'F': 5, 'Fis': 6, 'Ges': 6, 'F#': 6,
    'G': 7, 'Gis': 8, 'As': 8, 'G#': 8,
    'A': 9, 'Ais': 10, 'B': 10, 'H': 11, 'Ces': 11, 'His': 0
  };
  const tonicPC = NOTE_LOOKUP_PITCHES[cleanTonic] ?? 0;
  const offset = (notePC - tonicPC + 12) % 12;

  const majorMap: Record<number, { degree: number; alt: number }> = {
    0: { degree: 1, alt: 0 },   // I
    1: { degree: 2, alt: -1 },  // ♭II
    2: { degree: 2, alt: 0 },   // II
    3: { degree: 3, alt: -1 },  // ♭III
    4: { degree: 3, alt: 0 },   // III
    5: { degree: 4, alt: 0 },   // IV
    6: { degree: 4, alt: 1 },   // ♯IV
    7: { degree: 5, alt: 0 },   // V
    8: { degree: 6, alt: -1 },  // ♭VI
    9: { degree: 6, alt: 0 },   // VI
    10: { degree: 7, alt: -1 }, // ♭VII
    11: { degree: 7, alt: 0 }    // VII
  };

  const minorMap: Record<number, { degree: number; alt: number }> = {
    0: { degree: 1, alt: 0 },   // I
    1: { degree: 2, alt: -1 },  // ♭II (Neapolitan)
    2: { degree: 2, alt: 0 },   // II
    3: { degree: 3, alt: 0 },   // III
    4: { degree: 3, alt: 1 },   // ♯III
    5: { degree: 4, alt: 0 },   // IV
    6: { degree: 4, alt: 1 },   // ♯IV
    7: { degree: 5, alt: 0 },   // V
    8: { degree: 6, alt: 0 },   // VI
    9: { degree: 6, alt: 1 },   // ♯VI (dorian)
    10: { degree: 7, alt: 0 },  // ♭VII (natural)
    11: { degree: 7, alt: 1 }   // ♯VII (harmonic)
  };

  const map = isMinor ? minorMap : majorMap;
  const { degree, alt } = map[offset] ?? { degree: 1, alt: 0 };

  const targetLetterIdx = (tonicLetterIdx + degree - 1) % 7;
  const targetLetter = LETTERS[targetLetterIdx];
  const naturalPC = LETTER_NATURAL_PCS[targetLetter];

  const diff = (notePC - naturalPC + 18) % 12 - 6;

  if (diff === 0) return targetLetter;
  if (diff === 1) return targetLetter + 'is';
  if (diff === 2) return targetLetter + 'isis';
  if (diff === -1) {
    if (targetLetter === 'A') return 'As';
    if (targetLetter === 'E') return 'Es';
    if (targetLetter === 'H') return 'B';
    return targetLetter + 'es';
  }
  if (diff === -2) {
    if (targetLetter === 'H') return 'Heses';
    return targetLetter + 'eses';
  }
  return targetLetter;
}

export function getDynamicVoiceDegreeText(
  noteMidi: number,
  tonicPitch: number,
  isMinor: boolean,
  tonicName: string
): string {
  const notePC = ((noteMidi % 12) + 12) % 12;
  const degreePC = (notePC - (tonicPitch % 12) + 12) % 12;

  const majorDegrees: Record<number, string> = {
    0: 'I', 1: '♭II', 2: 'II', 3: '♭III', 4: 'III', 5: 'IV',
    6: '♯IV', 7: 'V', 8: '♭VI', 9: 'VI', 10: '♭VII', 11: 'VII'
  };

  const minorDegrees: Record<number, string> = {
    0: 'I', 1: '♭II', 2: 'II', 3: 'III', 4: '♯III', 5: 'IV',
    6: '♯IV', 7: 'V', 8: 'VI', 9: '♯VI', 10: 'VII', 11: '♯VII'
  };

  const degreeSymbols = isMinor ? minorDegrees : majorDegrees;
  const degSym = degreeSymbols[degreePC] ?? `${degreePC}`;
  
  const noteName = spellClassicalNoteName(noteMidi, tonicName, isMinor);
  
  const RU_NOTE_NAMES: Record<string, string> = {
    'C': 'До', 'Cis': 'До-диез', 'Des': 'Ре-бемоль',
    'D': 'Ре', 'Dis': 'Ре-диез', 'Es': 'Ми-бемоль',
    'E': 'Ми', 'Eis': 'Ми-диез',
    'F': 'Фа', 'Fis': 'Фа-диез', 'Ges': 'Соль-бемоль',
    'G': 'Соль', 'Gis': 'Соль-диез', 'As': 'Ля-бемоль',
    'A': 'Ля', 'Ais': 'Ля-диез', 'B': 'Си-бемоль',
    'H': 'Си', 'His': 'Си-диез', 'Ces': 'До-бемоль'
  };
  
  const ruName = RU_NOTE_NAMES[noteName] ?? noteName;
  return `${degSym} (${ruName})`;
}

export function realizeProgression(
  templateId?: string,
  preferredTonic: string = 'C',
  preferredMode: 'major' | 'minor' | 'any' = 'major',
  categoryFilter?: 'all' | ProgressionCategory | ProgressionCategory[]
): RealizedProgression {
  const NOTE_LOOKUP: Record<string, number> = {
    'c': 0, 'cis': 1, 'des': 1, 'c#': 1,
    'd': 2, 'dis': 3, 'es': 3, 'd#': 3,
    'e': 4,
    'f': 5, 'fis': 6, 'ges': 6, 'f#': 6,
    'g': 7, 'gis': 8, 'as': 8, 'g#': 8,
    'a': 9, 'ais': 10, 'b': 10, 'bb': 10,
    'h': 11,
  };

  let tonicPitch = 0;
  if (preferredTonic && preferredTonic !== 'random') {
    const clean = preferredTonic.toLowerCase().split(/[\s(/]/)[0];
    if (clean in NOTE_LOOKUP) {
      tonicPitch = NOTE_LOOKUP[clean];
    }
  } else if (preferredTonic === 'random') {
    tonicPitch = Math.floor(Math.random() * 12);
  }

  const tonicNoteName = CHROMATIC_NOTES_UP[tonicPitch];

  let pool = CLASSICAL_PROGRESSIONS;
  if (categoryFilter && categoryFilter !== 'all') {
    if (Array.isArray(categoryFilter)) {
      pool = pool.filter((p) => categoryFilter.includes(p.category));
    } else {
      pool = pool.filter((p) => p.category === categoryFilter);
    }
  }

  if (templateId) {
    const found = CLASSICAL_PROGRESSIONS.find((p) => p.id === templateId);
    if (found) pool = [found];
  } else if (preferredMode !== 'any') {
    const modeFiltered = pool.filter((p) => p.scaleMode === preferredMode || p.scaleMode === 'both');
    if (modeFiltered.length > 0) {
      pool = modeFiltered;
    }
  }

  const template = pool[Math.floor(Math.random() * pool.length)] ?? CLASSICAL_PROGRESSIONS[0];
  const effectiveMode: 'major' | 'minor' =
    template.scaleMode === 'both'
      ? (preferredMode === 'minor' ? 'minor' : 'major')
      : template.scaleMode;

  const keyNameRu = effectiveMode === 'major'
    ? `${tonicNoteName}-dur (${tonicNoteName} мажор)`
    : `${tonicNoteName}-moll (${tonicNoteName} минор)`;

  const origTonic = template.originalTonicPC ?? 0;
  const shift = (tonicPitch - origTonic + 24) % 12;

  const realizedSteps = template.steps.map((s) => {
    const isMinor = effectiveMode === 'minor';
    const satbMidis: [number, number, number, number] = [
      60 + s.satbOffsets[0] + shift,
      60 + s.satbOffsets[1] + shift,
      60 + s.satbOffsets[2] + shift,
      60 + s.satbOffsets[3] + shift,
    ];

    if (isMinor && template.scaleMode === 'both') {
      for (let i = 0; i < 4; i++) {
        const offset = s.satbOffsets[i];
        const pitchClass = (offset % 12 + 12) % 12;
        if (pitchClass === 4) {
          satbMidis[i] -= 1; // Major 3rd -> Minor 3rd
        } else if (pitchClass === 9) {
          satbMidis[i] -= 1; // Major 6th -> Minor 6th
        }
      }
    }

    const noteNames: [string, string, string, string] = [
      spellClassicalNoteName(satbMidis[0], tonicNoteName, isMinor),
      spellClassicalNoteName(satbMidis[1], tonicNoteName, isMinor),
      spellClassicalNoteName(satbMidis[2], tonicNoteName, isMinor),
      spellClassicalNoteName(satbMidis[3], tonicNoteName, isMinor),
    ];

    const dynamicVoiceDegreesRu = {
      bass: getDynamicVoiceDegreeText(satbMidis[0], tonicPitch, isMinor, tonicNoteName),
      tenor: getDynamicVoiceDegreeText(satbMidis[1], tonicPitch, isMinor, tonicNoteName),
      alto: getDynamicVoiceDegreeText(satbMidis[2], tonicPitch, isMinor, tonicNoteName),
      soprano: getDynamicVoiceDegreeText(satbMidis[3], tonicPitch, isMinor, tonicNoteName),
    };

    const formattedSymbol = formatSymbolForMode(s.symbol, effectiveMode);

    return {
      symbol: formattedSymbol,
      degreeRoman: s.degreeRoman,
      nameRu: s.nameRu,
      midisSATB: satbMidis,
      noteNamesSATB: noteNames,
      voiceDegreesRu: dynamicVoiceDegreesRu,
    };
  });

  const voiceLeadingValidation = checkVoiceLeading(realizedSteps);

  return {
    template,
    tonicNoteName,
    tonicPitch,
    scaleMode: effectiveMode,
    keyNameRu,
    revealed: false,
    voiceLeadingValidation,
    steps: realizedSteps,
  };
}

export function getChordPitches(symbol: string, isMinor: boolean): { rootOffset: number; intervals: number[] } {
  const s = symbol.trim();
  const sLower = s.toLowerCase();
  
  let rootOffset = 0;
  let intervals = [0, 4, 7]; // default major triad

  if (sLower.includes('iv') || sLower.startsWith('s')) {
    rootOffset = 5; // Subdominant (IV)
    intervals = isMinor ? [0, 3, 7] : [0, 4, 7];
  } else if (sLower.startsWith('ii') || sLower.includes('ii')) {
    rootOffset = 2; // Supertonic (II)
    intervals = isMinor ? [0, 3, 6] : [0, 3, 7]; // II is diminished in minor, minor in major
    if (sLower.includes('7') || sLower.includes('6/5') || sLower.includes('4/3') || sLower.includes('2') || sLower.includes('65') || sLower.includes('43')) {
      intervals = isMinor ? [0, 3, 6, 9] : [0, 3, 6, 10]; // II7
    }
  } else if (sLower.startsWith('vii') || sLower.includes('vii')) {
    rootOffset = isMinor ? 10 : 11; // ♭VII in natural minor, VII in major
    if (sLower.includes('vii#') || (sLower.includes('vii') && isMinor)) {
      rootOffset = 11;
    }
    intervals = [0, 3, 6]; // VII is diminished
    if (sLower.includes('7')) {
      intervals = isMinor ? [0, 3, 6, 9] : [0, 3, 6, 10];
    }
  } else if (sLower.startsWith('v') || sLower.startsWith('d')) {
    rootOffset = 7; // Dominant (V)
    intervals = [0, 4, 7]; // Dominant is always major triad
    if (sLower.includes('7') || sLower.includes('6/5') || sLower.includes('4/3') || sLower.includes('2') || sLower.includes('65') || sLower.includes('43')) {
      intervals = [0, 4, 7, 10]; // Dominant 7th
    }
  } else if (sLower.startsWith('vi') || sLower.includes('vi')) {
    rootOffset = isMinor ? 8 : 9; // VI (♭VI in minor, VI in major)
    intervals = isMinor ? [0, 4, 7] : [0, 3, 7]; // VI is major in minor, minor in major
  } else if (sLower.startsWith('iii') || sLower.includes('iii')) {
    rootOffset = isMinor ? 3 : 4; // III (♭III in minor, III in major)
    intervals = isMinor ? [0, 4, 7] : [0, 3, 7]; // III is major in minor, minor in major
  } else if (sLower.startsWith('n6') || sLower.startsWith('n') || sLower.includes('bii') || sLower.includes('♭ii')) {
    rootOffset = 1; // Neapolitan ♭II (Des)
    intervals = [0, 4, 7]; // Neapolitan is a major triad
  } else {
    rootOffset = 0;
    intervals = isMinor ? [0, 3, 7] : [0, 4, 7];
  }

  if (sLower.startsWith('n') || sLower.includes('neapol') || sLower.includes('♭ii') || sLower.includes('bii')) {
    rootOffset = 1;
    intervals = [0, 4, 7];
  }

  return { rootOffset, intervals };
}

export function revoiceProgression(
  prog: RealizedProgression,
  spacing: 'original' | 'close' | 'open' | 'random',
  melodicPosition: 'original' | 'octave' | 'third' | 'fifth' | 'random'
): RealizedProgression {
  let effectiveSpacing = spacing;
  if (spacing === 'random') {
    const options: ('original' | 'close' | 'open')[] = ['original', 'close', 'open'];
    effectiveSpacing = options[Math.floor(Math.random() * options.length)];
  }

  let effectiveMelodicPosition = melodicPosition;
  if (melodicPosition === 'random') {
    const options: ('original' | 'octave' | 'third' | 'fifth')[] = ['original', 'octave', 'third', 'fifth'];
    effectiveMelodicPosition = options[Math.floor(Math.random() * options.length)];
  }

  if (effectiveSpacing === 'original' && effectiveMelodicPosition === 'original') {
    return prog;
  }

  const stepsCount = prog.steps.length;
  if (stepsCount === 0) return prog;

  const isMinor = prog.scaleMode === 'minor';

  // Step candidate generator
  const stepCandidates: [number, number, number, number][][] = [];

  for (let s = 0; s < stepsCount; s++) {
    const orig = prog.steps[s].midisSATB;
    const [B] = orig;
    const pcs = new Set(orig.map((m) => ((m % 12) + 12) % 12));
    const bMidi = B;
    const bPC = ((bMidi % 12) + 12) % 12;

    const candidates: [number, number, number, number][] = [];
    const tenorMin = 48; // c
    const tenorMax = 69; // a1
    const altoMin = 55;  // g
    const altoMax = 76;  // e2
    const sopMin = 60;   // c1
    const sopMax = 84;   // c3

    const tOpts: number[] = [];
    const aOpts: number[] = [];
    const sOpts: number[] = [];

    for (let m = tenorMin; m <= tenorMax; m++) if (pcs.has(m % 12)) tOpts.push(m);
    for (let m = altoMin; m <= altoMax; m++) if (pcs.has(m % 12)) aOpts.push(m);
    for (let m = sopMin; m <= sopMax; m++) if (pcs.has(m % 12)) sOpts.push(m);

    for (const t of tOpts) {
      if (t < bMidi) continue;
      if (t - bMidi > 24) continue;
      for (const a of aOpts) {
        if (a < t) continue;
        if (a - t > 12) continue;
        for (const sop of sOpts) {
          if (sop < a) continue;
          if (sop - a > 12) continue;

          const usedPcs = new Set([bMidi % 12, t % 12, a % 12, sop % 12]);
          if (usedPcs.size < pcs.size) continue;

          // Step 0 constraints
          if (s === 0) {
            if (effectiveSpacing === 'close' && (sop - a > 5 || a - t > 5)) continue;
            if (effectiveSpacing === 'open' && (sop - a < 5 || a - t < 5)) continue;
            if (effectiveMelodicPosition === 'octave' && sop % 12 !== bPC) continue;
            if (
              effectiveMelodicPosition === 'third' &&
              sop % 12 !== (bPC + 4) % 12 &&
              sop % 12 !== (bPC + 3) % 12
            ) continue;
            if (effectiveMelodicPosition === 'fifth' && sop % 12 !== (bPC + 7) % 12) continue;
          }

          candidates.push([bMidi, t, a, sop]);
        }
      }
    }

    if (candidates.length === 0) {
      candidates.push(orig);
    }
    stepCandidates.push(candidates);
  }

  // Branch-and-bound search for smooth classical voice leading
  let bestPath: [number, number, number, number][] | null = null;
  let bestScore = Infinity;

  function search(stepIdx: number, currentPath: [number, number, number, number][], currentScore: number) {
    if (currentScore >= bestScore) return;

    if (stepIdx === stepsCount) {
      const fullRes = checkVoiceLeading(currentPath.map((m) => ({ midisSATB: m })));
      if (fullRes.isValid && currentScore < bestScore) {
        bestScore = currentScore;
        bestPath = currentPath;
      }
      return;
    }

    const prev = currentPath[currentPath.length - 1];
    const opts = stepCandidates[stepIdx];

    const scoredOpts: { opt: [number, number, number, number]; score: number }[] = [];
    for (const opt of opts) {
      let score = 0;
      if (prev) {
        const transRes = checkVoiceLeading([
          { midisSATB: prev },
          { midisSATB: opt },
        ]);
        if (!transRes.isValid) continue;

        const bassDir = Math.sign(opt[0] - prev[0]);
        for (let v = 1; v <= 3; v++) {
          const diff = Math.abs(opt[v] - prev[v]);
          score += diff;
          // Reward common tones
          if (diff === 0) score -= 2;
          // Penalize moving in same direction as bass
          if (bassDir !== 0 && Math.sign(opt[v] - prev[v]) === bassDir) {
            score += 4;
          }
        }
      }
      scoredOpts.push({ opt, score });
    }

    scoredOpts.sort((a, b) => a.score - b.score);

    for (const { opt, score } of scoredOpts) {
      search(stepIdx + 1, [...currentPath, opt], currentScore + score);
      if (bestPath && bestScore <= 10) break; // Optimal voice-leading solution reached
    }
  }

  search(0, [], 0);

  // Fallback to original pristine textbook progression if no defect-free path exists
  if (!bestPath) {
    return prog;
  }

  const newSteps = prog.steps.map((origStep, idx) => {
    const midisSATB = bestPath![idx];
    const noteNames: [string, string, string, string] = [
      spellClassicalNoteName(midisSATB[0], prog.tonicNoteName, isMinor),
      spellClassicalNoteName(midisSATB[1], prog.tonicNoteName, isMinor),
      spellClassicalNoteName(midisSATB[2], prog.tonicNoteName, isMinor),
      spellClassicalNoteName(midisSATB[3], prog.tonicNoteName, isMinor),
    ];
    const dynamicVoiceDegreesRu = {
      bass: getDynamicVoiceDegreeText(midisSATB[0], prog.tonicPitch, isMinor, prog.tonicNoteName),
      tenor: getDynamicVoiceDegreeText(midisSATB[1], prog.tonicPitch, isMinor, prog.tonicNoteName),
      alto: getDynamicVoiceDegreeText(midisSATB[2], prog.tonicPitch, isMinor, prog.tonicNoteName),
      soprano: getDynamicVoiceDegreeText(midisSATB[3], prog.tonicPitch, isMinor, prog.tonicNoteName),
    };
    return {
      ...origStep,
      midisSATB,
      noteNamesSATB: noteNames,
      voiceDegreesRu: dynamicVoiceDegreesRu,
    };
  });

  return {
    ...prog,
    steps: newSteps,
    voiceLeadingValidation: checkVoiceLeading(newSteps),
  };
}

export interface DatabaseConflict {
  templateId: string;
  progressionName: string;
  category: string;
  key: 'major' | 'minor';
  type: string;
  description: string;
  severity: 'high' | 'warning';
}

export interface SeventhDetectionResult {
  voiceIndex: number; // 0: Bass, 1: Tenor, 2: Alto, 3: Soprano
  voiceName: 'Бас' | 'Тенор' | 'Альт' | 'Сопрано';
  pitchMidi: number;
  pitchClass: number;
  isSeventhChord: boolean;
  resolution?: {
    nextVoiceMidi: number;
    deltaSemitones: number;
    direction: 'down' | 'up' | 'same';
    arrowSymbol: '↓' | '↑' | '→' | '↘' | '↗';
    isExpectedMovement: boolean;
  };
}

export function identifyChordSeventh(
  symbol: string,
  midisSATB: [number, number, number, number],
  nextMidisSATB?: [number, number, number, number]
): SeventhDetectionResult | null {
  const sym = symbol.toUpperCase();
  const isSeventh = /7|6\/5|4\/3|(?<!6\/)2|65|43/.test(symbol);
  if (!isSeventh) return null;

  const pcs = midisSATB.map((m) => ((m % 12) + 12) % 12);
  let rootPC: number | null = null;
  if (sym.includes('♭II') || sym.includes('BII')) rootPC = 1;
  else if (sym.includes('♭VI') || sym.includes('BVI')) rootPC = 8;
  else if (sym.includes('VII')) rootPC = 11;
  else if (sym.includes('D') || sym.includes('V')) rootPC = 7;
  else if (sym.includes('II')) rootPC = 2;
  else if (sym.includes('VI')) rootPC = 9;
  else if (sym.includes('IV') || sym.includes('S')) rootPC = 5;
  else if (sym.includes('I') || sym.includes('T')) rootPC = 0;

  let voiceIdx = -1;
  if (rootPC !== null) {
    const targetPCs = [(rootPC + 10) % 12, (rootPC + 9) % 12, (rootPC + 11) % 12];
    for (const t of targetPCs) {
      const idx = pcs.findIndex((p) => p === t);
      if (idx !== -1) {
        voiceIdx = idx;
        break;
      }
    }
  }

  if (voiceIdx === -1) {
    for (let r = 0; r < 4; r++) {
      for (let v = 0; v < 4; v++) {
        if (r !== v) {
          const interval = (pcs[v] - pcs[r] + 12) % 12;
          if (interval === 10 || interval === 9) {
            voiceIdx = v;
            break;
          }
        }
      }
      if (voiceIdx !== -1) break;
    }
  }

  if (voiceIdx === -1) return null;

  const voiceNames: ('Бас' | 'Тенор' | 'Альт' | 'Сопрано')[] = ['Бас', 'Тенор', 'Альт', 'Сопрано'];
  let resolution: SeventhDetectionResult['resolution'] = undefined;

  if (nextMidisSATB) {
    const currM = midisSATB[voiceIdx];
    const nextM = nextMidisSATB[voiceIdx];
    const delta = nextM - currM;
    const direction = delta < 0 ? 'down' : delta > 0 ? 'up' : 'same';
    const arrowSymbol = delta < 0 ? '↓' : delta > 0 ? '↑' : '→';
    resolution = {
      nextVoiceMidi: nextM,
      deltaSemitones: delta,
      direction,
      arrowSymbol,
      isExpectedMovement: delta <= 0 || sym.includes('4/3') || sym.includes('♭II') || sym.includes('♭VI'),
    };
  }

  return {
    voiceIndex: voiceIdx,
    voiceName: voiceNames[voiceIdx],
    pitchMidi: midisSATB[voiceIdx],
    pitchClass: pcs[voiceIdx],
    isSeventhChord: true,
    resolution,
  };
}

export function runDatabaseAudit(): DatabaseConflict[] {
  const conflicts: DatabaseConflict[] = [];

  for (const template of CLASSICAL_PROGRESSIONS) {
    const modes: ('major' | 'minor')[] = [];
    if (template.scaleMode === 'major' || template.scaleMode === 'both') modes.push('major');
    if (template.scaleMode === 'minor' || template.scaleMode === 'both') modes.push('minor');

    for (const mode of modes) {
      const shift = 0; // standard C
      const effectiveMode = mode;
      
      const steps = template.steps.map((s) => {
        const isMinor = effectiveMode === 'minor';
        const satbMidis: [number, number, number, number] = [
          60 + s.satbOffsets[0] + shift,
          60 + s.satbOffsets[1] + shift,
          60 + s.satbOffsets[2] + shift,
          60 + s.satbOffsets[3] + shift,
        ];

        if (isMinor && template.scaleMode === 'both') {
          for (let i = 0; i < 4; i++) {
            const offset = s.satbOffsets[i];
            const pitchClass = (offset % 12 + 12) % 12;
            if (pitchClass === 4) {
              satbMidis[i] -= 1; // Major 3rd -> Minor 3rd
            } else if (pitchClass === 9) {
              satbMidis[i] -= 1; // Major 6th -> Minor 6th
            }
          }
        }
        return { midisSATB: satbMidis, symbol: s.symbol };
      });

      // 1. Voice leading checks
      const vlResult = checkVoiceLeading(steps);
      for (const warning of vlResult.warnings) {
        let type = 'voice_crossing';
        if (warning.includes('Все 4 голоса')) type = 'all_moving_same_direction';
        else if (warning.includes('Пересечение голосов')) type = 'overlapping';
        else if (warning.includes('Параллельные')) type = 'parallel_octaves_fifths';

        conflicts.push({
          templateId: template.id,
          progressionName: template.nameRu,
          category: template.categoryNameRu,
          key: mode,
          type,
          description: warning,
          severity: type === 'parallel_octaves_fifths' || type === 'voice_crossing' ? 'high' : 'warning'
        });
      }

      // 2. Harmonic seventh voice leading checks
      for (let s = 0; s < steps.length - 1; s++) {
        const sym = steps[s].symbol.toUpperCase();
        const nextStep = steps[s + 1];
        const seventhInfo = identifyChordSeventh(sym, steps[s].midisSATB, nextStep.midisSATB);

        if (seventhInfo && seventhInfo.resolution) {
          const move = seventhInfo.resolution.deltaSemitones;

          // Legitimate upward resolutions recognized by classical and modern theory:
          // 1. Passing D4/3 in parallel tenths with bass (e.g. #28: C/E -> D/F -> E/G)
          const isPassingTenths = (sym.includes('4/3') || template.category === 'passing') && move > 0;
          // 2. Ellipsis (chords connecting directly to other dissonant chords without tonic resolution)
          const isEllipsis = template.category === 'ellipsis';
          // 3. Sequences (parallel descending/ascending secondary chords)
          const isSequence = template.category === 'sequence';
          // 4. Tritone substitutions and altered chords (where altered degrees resolve according to chromatic voice leading)
          const isAlteredOrTritone = template.category === 'altered' || sym.includes('♭II') || sym.includes('BII') || sym.includes('♭VI') || sym.includes('BVI') || template.nameRu.includes('Тритон');
          // 5. Connection between two seventh chords (e.g. II6/5 -> VII7)
          const nextIsSeventh = /7|6\/5|4\/3|(?<!6\/)2/.test(nextStep.symbol);

          if (move > 0 && !isPassingTenths && !isEllipsis && !isSequence && !isAlteredOrTritone && !nextIsSeventh) {
            conflicts.push({
              templateId: template.id,
              progressionName: template.nameRu,
              category: template.categoryNameRu,
              key: mode,
              type: 'unresolved_seventh',
              description: `Шаг ${s + 1} (${steps[s].symbol}) -> Шаг ${s + 2} (${steps[s + 1].symbol}): Септима в голосе ${seventhInfo.voiceName} движется вверх (+${move} полут.).`,
              severity: 'warning'
            });
          }
        }
      }
    }
  }

  return conflicts;
}
