import { MusicItem } from '../types';

export interface SolfegeStep {
  fromNote: string;
  toNote: string;
  intervalName: string;
  semitones: number;
}

export interface ConstructionBreakdown {
  notesMidi: number[];
  noteNames: string[];
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
    case 'd7_65':
      return `${rootTone} D6/5 (на VII ст.)`;
    case 'd7_43':
      return `${rootTone} D4/3 (на II ст.)`;
    case 'd7_2':
      return `${rootTone} D2 (на IV ст.)`;
    default:
      return `${item.name} от ${rootTone}`;
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

  const fullChordTitle = isChord
    ? getChordFullNameWithRoot(item, chordBaseNoteName)
    : item.category === 'simple_intervals' || item.category === 'characteristic_intervals'
    ? `${item.name} (${direction === 'down' ? 'вниз от' : 'от'} ${noteNames[0]})`
    : `${item.name} (от ${noteNames[0]})`;

  return {
    notesMidi,
    noteNames,
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
}

export function getCharacteristicResolution(
  item: MusicItem,
  notesMidi: number[],
  noteNames: string[],
  direction: 'up' | 'down'
): CharacteristicResolution | null {
  if (item.category !== 'characteristic_intervals') return null;

  const isUp = direction === 'up';
  const lowerNoteName = isUp ? noteNames[0] : noteNames[1];
  const upperNoteName = isUp ? noteNames[1] : noteNames[0];
  const lowerMidi = isUp ? notesMidi[0] : notesMidi[1];
  const upperMidi = isUp ? notesMidi[1] : notesMidi[0];

  const parsedLower = parseRootNote(lowerMidi, lowerNoteName);
  const parsedUpper = parseRootNote(upperMidi, upperNoteName);

  let tonality = '';
  let resolvedIntervalName = '';
  let resLowerName = '';
  let resUpperName = '';
  let vm1 = { from: '', degreeFrom: '', to: '', degreeTo: '' };
  let vm2 = { from: '', degreeFrom: '', to: '', degreeTo: '' };

  switch (item.id) {
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
        degreeFrom: 'VI ст.',
        to: resLowerName,
        degreeTo: 'V ст.',
      };
      vm2 = {
        from: upperNoteName,
        degreeFrom: 'VII♯ ст.',
        to: resUpperName,
        degreeTo: 'I ст.',
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
        degreeFrom: 'VII♯ ст.',
        to: resLowerName,
        degreeTo: 'I ст.',
      };
      vm2 = {
        from: upperNoteName,
        degreeFrom: 'VI ст.',
        to: resUpperName,
        degreeTo: 'V ст.',
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
        degreeFrom: 'VII♯ ст.',
        to: resLowerName,
        degreeTo: 'I ст.',
      };
      vm2 = {
        from: upperNoteName,
        degreeFrom: 'III ст.',
        to: resUpperName,
        degreeTo: 'III ст. (на месте)',
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
        degreeFrom: 'III ст.',
        to: resLowerName,
        degreeTo: 'III ст. (на месте)',
      };
      vm2 = {
        from: upperNoteName,
        degreeFrom: 'VII♯ ст.',
        to: resUpperName,
        degreeTo: 'I ст.',
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
        degreeFrom: 'IV ст.',
        to: resLowerName,
        degreeTo: 'III ст.',
      };
      vm2 = {
        from: upperNoteName,
        degreeFrom: 'VII ст.',
        to: resUpperName,
        degreeTo: 'I ст.',
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
        degreeFrom: 'VI ст.',
        to: resLowerName,
        degreeTo: 'V ст.',
      };
      vm2 = {
        from: upperNoteName,
        degreeFrom: 'II ст.',
        to: resUpperName,
        degreeTo: 'III ст.',
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
        degreeFrom: 'VII ст.',
        to: resLowerName,
        degreeTo: 'I ст.',
      };
      vm2 = {
        from: upperNoteName,
        degreeFrom: 'IV ст.',
        to: resUpperName,
        degreeTo: 'III ст.',
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
        degreeFrom: 'VII♯ ст.',
        to: resLowerName,
        degreeTo: 'I ст.',
      };
      vm2 = {
        from: upperNoteName,
        degreeFrom: 'IV ст.',
        to: resUpperName,
        degreeTo: 'III ст.',
      };
      break;
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
