/**
 * TONAL INTERVAL RESOLUTION ENGINE
 * Deterministic harmonic resolution engine adhering to classical voice-leading rules
 * and academic music theory specifications.
 */

export type TonalScaleDegree = 'I' | 'II' | 'III' | 'IV' | 'V' | 'VI' | 'VII';

export interface VoiceLeadingMovement {
  fromDegree: TonalScaleDegree;
  fromNoteRu: string;
  fromMidi: number;
  toDegree: TonalScaleDegree;
  toNoteRu: string;
  toMidi: number;
  direction: 'STAY' | 'UP' | 'DOWN';
  semitones: number;
}

export interface IntervalResolutionResult {
  status: 'RESOLVED' | 'NO_ACTION';
  tonality: {
    tonicName: string;
    mode: 'major' | 'minor';
    keyNameRu: string;
  };
  inputInterval: {
    nameRu: string;
    lowerVoice: { degree: TonalScaleDegree; noteRu: string; midi: number };
    upperVoice: { degree: TonalScaleDegree; noteRu: string; midi: number };
  };
  appliedRules: string[];
  ruleSummaryRu: string;
  voiceLeading: {
    lowerVoiceMotion: VoiceLeadingMovement;
    upperVoiceMotion: VoiceLeadingMovement;
  };
  resolvedInterval?: {
    nameRu: string;
    lowerVoice: { degree: TonalScaleDegree; noteRu: string; midi: number };
    upperVoice: { degree: TonalScaleDegree; noteRu: string; midi: number };
    stability: 'STABLE';
  };
}

// Semitone offsets from tonic for natural major and natural minor
const MAJOR_SCALE_SEMITONES: Record<number, TonalScaleDegree> = {
  0: 'I',
  2: 'II',
  4: 'III',
  5: 'IV',
  7: 'V',
  9: 'VI',
  11: 'VII',
};

const MINOR_SCALE_SEMITONES: Record<number, TonalScaleDegree> = {
  0: 'I',
  2: 'II',
  3: 'III',
  5: 'IV',
  7: 'V',
  8: 'VI',
  10: 'VII', // Natural VII
  11: 'VII', // Harmonic VII
};

const STABLE_DEGREES: Set<TonalScaleDegree> = new Set(['I', 'III', 'V']);
const UNSTABLE_DEGREES: Set<TonalScaleDegree> = new Set(['II', 'IV', 'VI', 'VII']);

const RUSSIAN_NOTE_NAMES = ['До', 'Ре♭', 'Ре', 'Ми♭', 'Ми', 'Фа', 'Фа♯', 'Соль', 'Ля♭', 'Ля', 'Си♭', 'Си'];

function getNoteNameRu(midi: number): string {
  return RUSSIAN_NOTE_NAMES[((midi % 12) + 12) % 12];
}

function getDegreeIntervalName(semitones: number): string {
  const norm = ((semitones % 12) + 12) % 12;
  switch (norm) {
    case 0: return 'чистая прима';
    case 1: return 'малая секунда';
    case 2: return 'большая секунда';
    case 3: return 'малая терция';
    case 4: return 'большая терция';
    case 5: return 'чистая кварта';
    case 6: return 'тритон';
    case 7: return 'чистая квинта';
    case 8: return 'малая секста';
    case 9: return 'большая секста';
    case 10: return 'малая септима';
    case 11: return 'большая септима';
    default: return 'интервал';
  }
}

/**
 * Maps a MIDI pitch relative to the tonic to a scale degree.
 */
export function getScaleDegree(
  midi: number,
  tonicMidi: number,
  mode: 'major' | 'minor'
): { degree: TonalScaleDegree; isAltered: boolean } {
  const semitonesFromTonic = ((midi % 12) - (tonicMidi % 12) + 12) % 12;
  const scaleMap = mode === 'major' ? MAJOR_SCALE_SEMITONES : MINOR_SCALE_SEMITONES;

  if (scaleMap[semitonesFromTonic]) {
    return { degree: scaleMap[semitonesFromTonic], isAltered: false };
  }

  // Chromatic or altered notes mapped to nearest scale degree
  if (mode === 'major') {
    if (semitonesFromTonic === 8) return { degree: 'VI', isAltered: true }; // Harmonic VI-flat
    if (semitonesFromTonic === 1) return { degree: 'II', isAltered: true };
    if (semitonesFromTonic === 3) return { degree: 'III', isAltered: true };
    if (semitonesFromTonic === 6) return { degree: 'IV', isAltered: true };
    if (semitonesFromTonic === 10) return { degree: 'VII', isAltered: true };
  } else {
    if (semitonesFromTonic === 1) return { degree: 'II', isAltered: true };
    if (semitonesFromTonic === 4) return { degree: 'III', isAltered: true };
    if (semitonesFromTonic === 6) return { degree: 'IV', isAltered: true };
    if (semitonesFromTonic === 9) return { degree: 'VI', isAltered: true };
  }

  return { degree: 'I', isAltered: false };
}

/**
 * Resolves a two-voice tonal interval according to academic harmony rules.
 */
export function resolveTonalInterval(
  noteMidiA: number,
  noteMidiB: number,
  tonicMidi: number,
  tonicName: string,
  mode: 'major' | 'minor'
): IntervalResolutionResult {
  // Sort voices into lower and upper
  const lowerMidi = Math.min(noteMidiA, noteMidiB);
  const upperMidi = Math.max(noteMidiA, noteMidiB);

  const lowerDegreeInfo = getScaleDegree(lowerMidi, tonicMidi, mode);
  const upperDegreeInfo = getScaleDegree(upperMidi, tonicMidi, mode);

  const dLower = lowerDegreeInfo.degree;
  const dUpper = upperDegreeInfo.degree;

  const lowerNoteRu = getNoteNameRu(lowerMidi);
  const upperNoteRu = getNoteNameRu(upperMidi);

  const semitonesSpan = upperMidi - lowerMidi;
  const intervalNameRu = getDegreeIntervalName(semitonesSpan);
  const keyNameRu = `${tonicName} ${mode === 'major' ? 'мажор' : 'минор'}`;

  const inputInterval = {
    nameRu: intervalNameRu,
    lowerVoice: { degree: dLower, noteRu: lowerNoteRu, midi: lowerMidi },
    upperVoice: { degree: dUpper, noteRu: upperNoteRu, midi: upperMidi },
  };

  const isLowerStable = STABLE_DEGREES.has(dLower);
  const isUpperStable = STABLE_DEGREES.has(dUpper);

  // Both voices in S_stable: NO_RESOLUTION_NEEDED
  if (isLowerStable && isUpperStable) {
    return {
      status: 'NO_ACTION',
      tonality: { tonicName, mode, keyNameRu },
      inputInterval,
      appliedRules: ['STABLE_CONSONANCE_NO_ACTION'],
      ruleSummaryRu: 'Оба звука устойчивы (I, III, V). Разрешение не требуется.',
      voiceLeading: {
        lowerVoiceMotion: {
          fromDegree: dLower,
          fromNoteRu: lowerNoteRu,
          fromMidi: lowerMidi,
          toDegree: dLower,
          toNoteRu: lowerNoteRu,
          toMidi: lowerMidi,
          direction: 'STAY',
          semitones: 0,
        },
        upperVoiceMotion: {
          fromDegree: dUpper,
          fromNoteRu: upperNoteRu,
          fromMidi: upperMidi,
          toDegree: dUpper,
          toNoteRu: upperNoteRu,
          toMidi: upperMidi,
          direction: 'STAY',
          semitones: 0,
        },
      },
    };
  }

  // Get target tonic/mediant/dominant semitone delta relative to note
  const getPitchOffsetToDegree = (
    currentMidi: number,
    targetDegree: TonalScaleDegree,
    preferredDirection: 'UP' | 'DOWN' | 'NEAREST' = 'NEAREST'
  ): number => {
    let targetOffsetInOctave = 0;
    if (mode === 'major') {
      if (targetDegree === 'I') targetOffsetInOctave = 0;
      else if (targetDegree === 'III') targetOffsetInOctave = 4;
      else if (targetDegree === 'V') targetOffsetInOctave = 7;
    } else {
      if (targetDegree === 'I') targetOffsetInOctave = 0;
      else if (targetDegree === 'III') targetOffsetInOctave = 3;
      else if (targetDegree === 'V') targetOffsetInOctave = 7;
    }

    const currentOffsetInOctave = ((currentMidi % 12) - (tonicMidi % 12) + 12) % 12;
    let diff = targetOffsetInOctave - currentOffsetInOctave;

    if (preferredDirection === 'UP') {
      if (diff <= 0) diff += 12;
      return diff;
    }
    if (preferredDirection === 'DOWN') {
      if (diff >= 0) diff -= 12;
      return diff;
    }

    // Nearest
    if (diff > 6) diff -= 12;
    if (diff < -6) diff += 12;
    return diff;
  };

  let targetLowerDegree: TonalScaleDegree = dLower;
  let targetUpperDegree: TonalScaleDegree = dUpper;
  let targetLowerMidi = lowerMidi;
  let targetUpperMidi = upperMidi;
  const appliedRules: string[] = [];
  let ruleSummaryRu = '';

  // Rule 4.1: Anchor Stable Voice (exactly one voice in S_stable)
  if (isLowerStable && !isUpperStable) {
    appliedRules.push('RULE_4.1_ANCHOR_STABLE_VOICE');
    targetLowerDegree = dLower;
    targetLowerMidi = lowerMidi; // Fixed

    // Unstable moves by V_default: II -> I, IV -> III, VI -> V, VII -> I
    if (dUpper === 'II') {
      targetUpperDegree = 'I';
      targetUpperMidi = upperMidi + getPitchOffsetToDegree(upperMidi, 'I', 'DOWN');
    } else if (dUpper === 'IV') {
      targetUpperDegree = 'III';
      targetUpperMidi = upperMidi + getPitchOffsetToDegree(upperMidi, 'III', 'DOWN');
    } else if (dUpper === 'VI') {
      targetUpperDegree = 'V';
      targetUpperMidi = upperMidi + getPitchOffsetToDegree(upperMidi, 'V', 'DOWN');
    } else if (dUpper === 'VII') {
      targetUpperDegree = 'I';
      targetUpperMidi = upperMidi + getPitchOffsetToDegree(upperMidi, 'I', 'UP');
    }
    ruleSummaryRu = `Устойчивый нижний тон (${dLower}) удерживается на месте, неустойчивый (${dUpper}) переходит в ближайший устой.`;
  } else if (!isLowerStable && isUpperStable) {
    appliedRules.push('RULE_4.1_ANCHOR_STABLE_VOICE');
    targetUpperDegree = dUpper;
    targetUpperMidi = upperMidi; // Fixed

    if (dLower === 'II') {
      targetLowerDegree = 'I';
      targetLowerMidi = lowerMidi + getPitchOffsetToDegree(lowerMidi, 'I', 'DOWN');
    } else if (dLower === 'IV') {
      targetLowerDegree = 'III';
      targetLowerMidi = lowerMidi + getPitchOffsetToDegree(lowerMidi, 'III', 'DOWN');
    } else if (dLower === 'VI') {
      targetLowerDegree = 'V';
      targetLowerMidi = lowerMidi + getPitchOffsetToDegree(lowerMidi, 'V', 'DOWN');
    } else if (dLower === 'VII') {
      targetLowerDegree = 'I';
      targetLowerMidi = lowerMidi + getPitchOffsetToDegree(lowerMidi, 'I', 'UP');
    }
    ruleSummaryRu = `Устойчивый верхний тон (${dUpper}) удерживается на месте, неустойчивый (${dLower}) переходит в ближайший устой.`;
  } else {
    // Both in S_unstable
    // Rule 4.2: Anti-Parallelism Filter (Conflict Case: II - VI)
    if (dLower === 'II' && dUpper === 'VI') {
      appliedRules.push('RULE_4.2_ANTI_PARALLELISM_FILTER');
      // Override: II -> III (up), VI -> V (down) to prevent parallel fifths
      targetLowerDegree = 'III';
      targetLowerMidi = lowerMidi + getPitchOffsetToDegree(lowerMidi, 'III', 'UP');
      targetUpperDegree = 'V';
      targetUpperMidi = upperMidi + getPitchOffsetToDegree(upperMidi, 'V', 'DOWN');
      ruleSummaryRu = 'Квинта II–VI: во избежание параллельных чистых квинт нижний голос идёт вверх (II→III), верхний вниз (VI→V).';
    }
    // Rule 4.5: Tritones (IV - VII or VII - IV)
    else if (dLower === 'IV' && dUpper === 'VII') {
      appliedRules.push('RULE_4.5_TRITONE_AUGMENTED_FOURTH');
      // Augmented 4th: Divergent motion (IV -> III down, VII -> I up -> Sixth)
      targetLowerDegree = 'III';
      targetLowerMidi = lowerMidi + getPitchOffsetToDegree(lowerMidi, 'III', 'DOWN');
      targetUpperDegree = 'I';
      targetUpperMidi = upperMidi + getPitchOffsetToDegree(upperMidi, 'I', 'UP');
      ruleSummaryRu = 'Увеличенная кварта (ув.4): расходящееся движение в сексту (IV→III, VII→I).';
    } else if (dLower === 'VII' && dUpper === 'IV') {
      appliedRules.push('RULE_4.5_TRITONE_DIMINISHED_FIFTH');
      // Diminished 5th: Convergent motion (VII -> I up, IV -> III down -> Third)
      targetLowerDegree = 'I';
      targetLowerMidi = lowerMidi + getPitchOffsetToDegree(lowerMidi, 'I', 'UP');
      targetUpperDegree = 'III';
      targetUpperMidi = upperMidi + getPitchOffsetToDegree(upperMidi, 'III', 'DOWN');
      ruleSummaryRu = 'Уменьшенная квинта (ум.5): сходящееся движение в терцию (VII→I, IV→III).';
    }
    // Rule 4.3: Dissonance Seconds (e.g. VI - VII)
    else if (semitonesSpan <= 3 && (dLower === 'VI' && dUpper === 'VII')) {
      appliedRules.push('RULE_4.3_DIVERGENT_SECONDS');
      targetLowerDegree = 'V';
      targetLowerMidi = lowerMidi + getPitchOffsetToDegree(lowerMidi, 'V', 'DOWN');
      targetUpperDegree = 'I';
      targetUpperMidi = upperMidi + getPitchOffsetToDegree(upperMidi, 'I', 'UP');
      ruleSummaryRu = 'Секунда неустоев: расходящееся движение в кварту V–I (VI→V, VII→I).';
    }
    // Rule 4.3: Dissonance Sevenths (e.g. VII - VI)
    else if (semitonesSpan >= 9 && semitonesSpan <= 11 && (dLower === 'VII' && dUpper === 'VI')) {
      appliedRules.push('RULE_4.3_CONVERGENT_SEVENTHS');
      targetLowerDegree = 'I';
      targetLowerMidi = lowerMidi + getPitchOffsetToDegree(lowerMidi, 'I', 'UP');
      targetUpperDegree = 'V';
      targetUpperMidi = upperMidi + getPitchOffsetToDegree(upperMidi, 'V', 'DOWN');
      ruleSummaryRu = 'Септима неустоев: сходящееся встречное движение в квинту I–V (VII→I, VI→V).';
    }
    // Rule 4.4: Unstable Consonances
    else if (dLower === 'II' && dUpper === 'IV') {
      appliedRules.push('RULE_4.4_PARALLEL_DESCENT');
      targetLowerDegree = 'I';
      targetLowerMidi = lowerMidi + getPitchOffsetToDegree(lowerMidi, 'I', 'DOWN');
      targetUpperDegree = 'III';
      targetUpperMidi = upperMidi + getPitchOffsetToDegree(upperMidi, 'III', 'DOWN');
      ruleSummaryRu = 'Терция II–IV: плавное параллельное нисходящее сползание в тоническую терцию I–III.';
    } else if (dLower === 'IV' && dUpper === 'VI') {
      appliedRules.push('RULE_4.4_PARALLEL_DESCENT');
      targetLowerDegree = 'III';
      targetLowerMidi = lowerMidi + getPitchOffsetToDegree(lowerMidi, 'III', 'DOWN');
      targetUpperDegree = 'V';
      targetUpperMidi = upperMidi + getPitchOffsetToDegree(upperMidi, 'V', 'DOWN');
      ruleSummaryRu = 'Терция IV–VI: плавное параллельное нисходящее сползание в терцию III–V.';
    } else if (dLower === 'VI' && dUpper === 'IV') {
      appliedRules.push('RULE_4.4_PARALLEL_DESCENT');
      targetLowerDegree = 'V';
      targetLowerMidi = lowerMidi + getPitchOffsetToDegree(lowerMidi, 'V', 'DOWN');
      targetUpperDegree = 'III';
      targetUpperMidi = upperMidi + getPitchOffsetToDegree(upperMidi, 'III', 'DOWN');
      ruleSummaryRu = 'Секста VI–IV: параллельное нисходящее движение в сексту V–III.';
    } else if (dLower === 'IV' && dUpper === 'II') {
      appliedRules.push('RULE_4.4_PARALLEL_DESCENT');
      targetLowerDegree = 'III';
      targetLowerMidi = lowerMidi + getPitchOffsetToDegree(lowerMidi, 'III', 'DOWN');
      targetUpperDegree = 'I';
      targetUpperMidi = upperMidi + getPitchOffsetToDegree(upperMidi, 'I', 'DOWN');
      ruleSummaryRu = 'Секста IV–II: параллельное нисходящее движение в сексту III–I.';
    }
    // Rule 4.4: Exceptions (VII - II or II - VII)
    else if (dLower === 'VII' && dUpper === 'II') {
      appliedRules.push('RULE_4.4_CONTRARY_UNISON');
      targetLowerDegree = 'I';
      targetLowerMidi = lowerMidi + getPitchOffsetToDegree(lowerMidi, 'I', 'UP');
      targetUpperDegree = 'I';
      targetUpperMidi = upperMidi + getPitchOffsetToDegree(upperMidi, 'I', 'DOWN');
      ruleSummaryRu = 'Терция VII–II: встречное движение неустоев в приму I–I (VII→I вверх, II→I вниз).';
    } else if (dLower === 'II' && dUpper === 'VII') {
      appliedRules.push('RULE_4.4_CONTRARY_OCTAVE');
      targetLowerDegree = 'I';
      targetLowerMidi = lowerMidi + getPitchOffsetToDegree(lowerMidi, 'I', 'DOWN');
      targetUpperDegree = 'I';
      targetUpperMidi = upperMidi + getPitchOffsetToDegree(upperMidi, 'I', 'UP');
      ruleSummaryRu = 'Септима II–VII: расходящееся движение в чистую октаву I–I (II→I вниз, VII→I вверх).';
    } else {
      // Default natural gravitational vectors:
      appliedRules.push('DEFAULT_GRAVITATIONAL_VECTORS');
      const resolveByVector = (deg: TonalScaleDegree, midi: number) => {
        if (deg === 'II') return { deg: 'I' as TonalScaleDegree, midi: midi + getPitchOffsetToDegree(midi, 'I', 'DOWN') };
        if (deg === 'IV') return { deg: 'III' as TonalScaleDegree, midi: midi + getPitchOffsetToDegree(midi, 'III', 'DOWN') };
        if (deg === 'VI') return { deg: 'V' as TonalScaleDegree, midi: midi + getPitchOffsetToDegree(midi, 'V', 'DOWN') };
        if (deg === 'VII') return { deg: 'I' as TonalScaleDegree, midi: midi + getPitchOffsetToDegree(midi, 'I', 'UP') };
        return { deg, midi };
      };

      const resLower = resolveByVector(dLower, lowerMidi);
      const resUpper = resolveByVector(dUpper, upperMidi);
      targetLowerDegree = resLower.deg;
      targetLowerMidi = resLower.midi;
      targetUpperDegree = resUpper.deg;
      targetUpperMidi = resUpper.midi;
      ruleSummaryRu = `Ладовые тяготения: ${dLower}→${targetLowerDegree}, ${dUpper}→${targetUpperDegree}.`;
    }
  }

  // Voice movements
  const lowerDiff = targetLowerMidi - lowerMidi;
  const upperDiff = targetUpperMidi - upperMidi;

  const lowerMotion: VoiceLeadingMovement = {
    fromDegree: dLower,
    fromNoteRu: lowerNoteRu,
    fromMidi: lowerMidi,
    toDegree: targetLowerDegree,
    toNoteRu: getNoteNameRu(targetLowerMidi),
    toMidi: targetLowerMidi,
    direction: lowerDiff === 0 ? 'STAY' : lowerDiff > 0 ? 'UP' : 'DOWN',
    semitones: Math.abs(lowerDiff),
  };

  const upperMotion: VoiceLeadingMovement = {
    fromDegree: dUpper,
    fromNoteRu: upperNoteRu,
    fromMidi: upperMidi,
    toDegree: targetUpperDegree,
    toNoteRu: getNoteNameRu(targetUpperMidi),
    toMidi: targetUpperMidi,
    direction: upperDiff === 0 ? 'STAY' : upperDiff > 0 ? 'UP' : 'DOWN',
    semitones: Math.abs(upperDiff),
  };

  const resSemitonesSpan = Math.abs(targetUpperMidi - targetLowerMidi);
  const resIntervalNameRu = getDegreeIntervalName(resSemitonesSpan);

  return {
    status: 'RESOLVED',
    tonality: { tonicName, mode, keyNameRu },
    inputInterval,
    appliedRules,
    ruleSummaryRu,
    voiceLeading: {
      lowerVoiceMotion: lowerMotion,
      upperVoiceMotion: upperMotion,
    },
    resolvedInterval: {
      nameRu: resIntervalNameRu,
      lowerVoice: {
        degree: targetLowerDegree,
        noteRu: getNoteNameRu(targetLowerMidi),
        midi: targetLowerMidi,
      },
      upperVoice: {
        degree: targetUpperDegree,
        noteRu: getNoteNameRu(targetUpperMidi),
        midi: targetUpperMidi,
      },
      stability: 'STABLE',
    },
  };
}
