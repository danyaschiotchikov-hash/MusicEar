import { CHROMATIC_NOTES_UP } from '../data/musicData';

export interface SopranoMelodyNote {
  midi: number;
  noteName: string;         // e.g. "E4", "F4", "D4", "C4"
  degreeRoman: string;      // e.g. "III", "IV", "II", "I"
  degreeNum: number;        // e.g. 3, 4, 2, 1
  allowedChordIds: string[]; // Chords available for user selection
}

export interface MelodyHarmonizationTemplate {
  id: string;
  title: string;
  formula: string;
  keyRootNote: string;
  scaleMode: 'major' | 'minor';
  keyNameRu: string;
  usageContextRu: string;
  voiceLeadingExplanationRu: string;
  sopranoMelody: SopranoMelodyNote[];
  referenceChords: string[]; // Correct classical harmonization sequence
}

export interface VoiceLeadingIssue {
  stepIndex: number;
  type: 'wrong_chord' | 'parallel_fifth' | 'parallel_octave' | 'unresolved_leading_tone' | 'weak_cadence';
  severity: 'error' | 'warning';
  titleRu: string;
  descriptionRu: string;
}

export interface HarmonizationAnalysisResult {
  score: number;
  passed: boolean;
  issues: VoiceLeadingIssue[];
  summaryRu: string;
}

export const CHORD_NAMES_MAP: Record<string, string> = {
  T53: 'T5/3 (Тоническое трезвучие)',
  T6: 'T6 (Тонический секстаккорд)',
  T64: 'T6/4 (Тонический квартсекстаккорд)',
  S53: 'S5/3 (Субдоминантовое трезвучие)',
  S6: 'S6 (Субдоминантный секстаккорд)',
  S64: 'S6/4 (Субдоминантный квартсекстаккорд)',
  D53: 'D5/3 (Доминантное трезвучие)',
  D6: 'D6 (Доминантный секстаккорд)',
  D7: 'D7 (Доминантсептаккорд)',
  D65: 'D6/5 (Квинтсекстаккорд доминанты)',
  D43: 'D4/3 (Терцквартаккорд доминанты)',
  D2: 'D2 (Секундаккорд доминанты)',
  K64: 'K6/4 (Кадансовый квартсекстаккорд)',
  VI53: 'VI5/3 (Трезвучие VI ступени)',
  II6: 'II6 (Секстаккорд II ступени)',
  t53: 't5/3 (Минорное тоническое трезвучие)',
  t6: 't6 (Минорный тонический секстаккорд)',
  s53: 's5/3 (Минорное субдоминантное трезвучие)',
  s6: 's6 (Минорный субдоминантный секстаккорд)',
  d53: 'd5/3 (Минорная доминанта)',
  VII6: 'VII6 (Секстаккорд VII ступени)',
};

/**
 * Academic Classical Harmonization Templates (Тема 1–17 Гармонии)
 */
export const HARMONIZATION_TEMPLATES: MelodyHarmonizationTemplate[] = [
  {
    id: 'c_major_classic_4',
    title: 'Полный автентический каданс (C-dur)',
    formula: 'T5/3 — S6 — K6/4 — D7 — T5/3',
    keyRootNote: 'C',
    scaleMode: 'major',
    keyNameRu: 'До мажор',
    usageContextRu: 'Классическая кадансовая формула с применением K6/4 на сильной доле и D7 с неполной тоникой.',
    voiceLeadingExplanationRu: 'В S6 удваивается прима IV ст. В K6/4 удваивается бас V ст. Октава и терция K6/4 плавно опускаются на секунду вниз в септиму и терцию D7.',
    sopranoMelody: [
      { midi: 64, noteName: 'E4', degreeRoman: 'III', degreeNum: 3, allowedChordIds: ['T53', 'T6', 'VI53'] },
      { midi: 65, noteName: 'F4', degreeRoman: 'IV', degreeNum: 4, allowedChordIds: ['S6', 'S53', 'II6'] },
      { midi: 67, noteName: 'G4', degreeRoman: 'V', degreeNum: 5, allowedChordIds: ['K64', 'T53', 'D53'] },
      { midi: 65, noteName: 'F4', degreeRoman: 'IV', degreeNum: 4, allowedChordIds: ['D7', 'D65', 'S53'] },
      { midi: 60, noteName: 'C4', degreeRoman: 'I', degreeNum: 1, allowedChordIds: ['T53', 'VI53'] },
    ],
    referenceChords: ['T53', 'S6', 'K64', 'D7', 'T53'],
  },
  {
    id: 'c_major_passing_d64',
    title: 'Проходящий оборот T — D6/4 — T6 (C-dur)',
    formula: 'T5/3 — D6/4 — T6 — S5/3 — D7 — T5/3',
    keyRootNote: 'C',
    scaleMode: 'major',
    keyNameRu: 'До мажор',
    usageContextRu: 'Проходящий D6/4 соединяет T5/3 и T6. Бас плавно поднимается I — II — III, а сопрано идет навстречу III — II — I.',
    voiceLeadingExplanationRu: 'В D6/4 обязательно удваивается бас (квинта аккорда). Тенор удерживает общий звук V ст.',
    sopranoMelody: [
      { midi: 64, noteName: 'E4', degreeRoman: 'III', degreeNum: 3, allowedChordIds: ['T53', 'T6'] },
      { midi: 62, noteName: 'D4', degreeRoman: 'II', degreeNum: 2, allowedChordIds: ['D64', 'D53', 'D7'] },
      { midi: 60, noteName: 'C4', degreeRoman: 'I', degreeNum: 1, allowedChordIds: ['T6', 'T53'] },
      { midi: 65, noteName: 'F4', degreeRoman: 'IV', degreeNum: 4, allowedChordIds: ['S53', 'S6', 'II6'] },
      { midi: 62, noteName: 'D4', degreeRoman: 'II', degreeNum: 2, allowedChordIds: ['D7', 'D53'] },
      { midi: 60, noteName: 'C4', degreeRoman: 'I', degreeNum: 1, allowedChordIds: ['T53'] },
    ],
    referenceChords: ['T53', 'D64', 'T6', 'S53', 'D7', 'T53'],
  },
  {
    id: 'a_minor_phrygian_5',
    title: 'Фригийский каданс (a-moll)',
    formula: 't5/3 — s6 — t6 — D7 — t5/3',
    keyRootNote: 'A',
    scaleMode: 'minor',
    keyNameRu: 'Ля минор',
    usageContextRu: 'Фригийский оборот в миноре с нисходящим движением баса по верхнему тетрахорду I — VIIнат — VI — V.',
    voiceLeadingExplanationRu: 'Вводный тон VII# в D7 строго разрешается вверх в I ст. Септима D7 (IV ст.) разрешается на секунду вниз в III ст.',
    sopranoMelody: [
      { midi: 69, noteName: 'A4', degreeRoman: 'I', degreeNum: 1, allowedChordIds: ['t53', 't6', 's6'] },
      { midi: 71, noteName: 'B4', degreeRoman: 'II', degreeNum: 2, allowedChordIds: ['s6', 's53', 'II6'] },
      { midi: 72, noteName: 'C5', degreeRoman: 'III', degreeNum: 3, allowedChordIds: ['t6', 't53'] },
      { midi: 68, noteName: 'G#4', degreeRoman: 'VII#', degreeNum: 7, allowedChordIds: ['D7', 'D53', 'D6'] },
      { midi: 69, noteName: 'A4', degreeRoman: 'I', degreeNum: 1, allowedChordIds: ['t53'] },
    ],
    referenceChords: ['t53', 's6', 't6', 'D7', 't53'],
  },
  {
    id: 'g_major_deceptive_6',
    title: 'Прерванный оборот D7 — VI (G-dur)',
    formula: 'T5/3 — S6 — K6/4 — D7 — VI5/3 — S6 — D7 — T5/3',
    keyRootNote: 'G',
    scaleMode: 'major',
    keyNameRu: 'Соль мажор',
    usageContextRu: 'Прерванное разрешение D7 в трезвучие VI ступени с последующим расширением каденции.',
    voiceLeadingExplanationRu: 'При разрешении D7 в VI5/3 бас шагает V — VI ст., а в трезвучии VI СТРОГО УДВАИВАЕТСЯ ТЕРЦИЯ (тоника лада). Удвоение примы запрещено.',
    sopranoMelody: [
      { midi: 67, noteName: 'G4', degreeRoman: 'I', degreeNum: 1, allowedChordIds: ['T53', 'T6'] },
      { midi: 72, noteName: 'C5', degreeRoman: 'IV', degreeNum: 4, allowedChordIds: ['S6', 'S53'] },
      { midi: 71, noteName: 'B4', degreeRoman: 'III', degreeNum: 3, allowedChordIds: ['K64', 'T6'] },
      { midi: 69, noteName: 'A4', degreeRoman: 'II', degreeNum: 2, allowedChordIds: ['D7', 'D53'] },
      { midi: 67, noteName: 'G4', degreeRoman: 'I', degreeNum: 1, allowedChordIds: ['VI53', 'T53'] },
      { midi: 72, noteName: 'C5', degreeRoman: 'IV', degreeNum: 4, allowedChordIds: ['S6', 'S53'] },
      { midi: 69, noteName: 'A4', degreeRoman: 'II', degreeNum: 2, allowedChordIds: ['D7', 'D53'] },
      { midi: 67, noteName: 'G4', degreeRoman: 'I', degreeNum: 1, allowedChordIds: ['T53'] },
    ],
    referenceChords: ['T53', 'S6', 'K64', 'D7', 'VI53', 'S6', 'D7', 'T53'],
  },
  {
    id: 'f_major_ii6_cadence',
    title: 'Превосходная каденция с II6 (F-dur)',
    formula: 'T5/3 — II6 — K6/4 — D7 — T5/3',
    keyRootNote: 'F',
    scaleMode: 'major',
    keyNameRu: 'Фа мажор',
    usageContextRu: 'Секстаккорд II ступени создает сильнейшее субдоминантовое напряжение перед кадансовым K6/4.',
    voiceLeadingExplanationRu: 'В II6 удваивается басовый звук (IV ступень). Движение голосов плавно подводит к K6/4 на басу V ст.',
    sopranoMelody: [
      { midi: 65, noteName: 'F4', degreeRoman: 'I', degreeNum: 1, allowedChordIds: ['T53', 'T6'] },
      { midi: 67, noteName: 'G4', degreeRoman: 'II', degreeNum: 2, allowedChordIds: ['II6', 'S53', 'S6'] },
      { midi: 69, noteName: 'A4', degreeRoman: 'III', degreeNum: 3, allowedChordIds: ['K64', 'T6'] },
      { midi: 67, noteName: 'G4', degreeRoman: 'II', degreeNum: 2, allowedChordIds: ['D7', 'D53'] },
      { midi: 65, noteName: 'F4', degreeRoman: 'I', degreeNum: 1, allowedChordIds: ['T53'] },
    ],
    referenceChords: ['T53', 'II6', 'K64', 'D7', 'T53'],
  },
];

/**
 * Builds rigorous 4-part classical SATB voicing for any chord step
 */
export function buildSATBForChord(
  sopranoMidi: number,
  chordId: string,
  keyRoot: string,
  scaleMode: 'major' | 'minor'
): [number, number, number, number] {
  const NOTE_LOOKUP: Record<string, number> = {
    C: 0, 'C#': 1, D: 2, 'D#': 3, E: 4, F: 5,
    'F#': 6, G: 7, 'G#': 8, A: 9, 'A#': 10, B: 11, 'Bb': 10, 'Es': 3,
  };
  const tonicPitch = NOTE_LOOKUP[keyRoot] ?? 0;
  const isMaj = scaleMode === 'major';

  // Classical bass/tenor/alto interval offsets relative to tonic
  const chordMap: Record<string, { bass: number; tenor: number; alto: number }> = {
    T53: { bass: 0, tenor: 0, alto: isMaj ? 4 : 3 },
    T6: { bass: isMaj ? 4 : 3, tenor: 0, alto: 7 },
    T64: { bass: 7, tenor: 0, alto: isMaj ? 4 : 3 },
    S53: { bass: 5, tenor: 5, alto: isMaj ? 9 : 8 },
    S6: { bass: isMaj ? 9 : 8, tenor: 5, alto: 0 },
    S64: { bass: 0, tenor: 5, alto: isMaj ? 9 : 8 },
    D53: { bass: 7, tenor: 7, alto: 11 },
    D6: { bass: 11, tenor: 7, alto: 2 },
    D64: { bass: 2, tenor: 7, alto: 11 },
    D7: { bass: 7, tenor: 2, alto: 5 },
    D65: { bass: 11, tenor: 2, alto: 5 },
    D43: { bass: 2, tenor: 5, alto: 11 },
    D2: { bass: 5, tenor: 11, alto: 2 },
    K64: { bass: 7, tenor: 0, alto: isMaj ? 4 : 3 },
    VI53: { bass: isMaj ? 9 : 8, tenor: 0, alto: isMaj ? 4 : 3 }, // Double third (tonic)
    II6: { bass: 5, tenor: 2, alto: isMaj ? 9 : 8 },              // Double bass (IV st)
    t53: { bass: 0, tenor: 0, alto: 3 },
    t6: { bass: 3, tenor: 0, alto: 7 },
    s53: { bass: 5, tenor: 5, alto: 8 },
    s6: { bass: 8, tenor: 5, alto: 0 },
  };

  const offsets = chordMap[chordId] || chordMap['T53'];

  // Bass voice (F2 - D4: MIDI 41 - 62)
  let bassMidi = 48 + ((tonicPitch + offsets.bass) % 12);
  while (bassMidi < 41) bassMidi += 12;
  while (bassMidi > 58) bassMidi -= 12;

  // Tenor voice (C3 - G4: MIDI 48 - 67)
  let tenorMidi = 55 + ((tonicPitch + offsets.tenor) % 12);
  while (tenorMidi <= bassMidi) tenorMidi += 12;
  while (tenorMidi > sopranoMidi - 4) tenorMidi -= 12;

  // Alto voice (G3 - D5: MIDI 55 - 74)
  let altoMidi = 60 + ((tonicPitch + offsets.alto) % 12);
  while (altoMidi <= tenorMidi) altoMidi += 12;
  while (altoMidi >= sopranoMidi) altoMidi -= 12;

  if (altoMidi <= tenorMidi) {
    altoMidi = Math.floor((tenorMidi + sopranoMidi) / 2);
  }

  return [bassMidi, tenorMidi, altoMidi, sopranoMidi];
}

/**
 * Validates harmonization against classical 4-part rules
 */
export function validateHarmonization(
  template: MelodyHarmonizationTemplate,
  userChords: (string | null)[]
): HarmonizationAnalysisResult {
  const issues: VoiceLeadingIssue[] = [];
  let score = 100;

  const unassigned = userChords.filter((c) => !c).length;
  if (unassigned > 0) {
    score -= unassigned * 20;
    issues.push({
      stepIndex: userChords.findIndex((c) => !c),
      type: 'wrong_chord',
      severity: 'error',
      titleRu: 'Неполная гармонизация',
      descriptionRu: `Осталось невыбранных аккордов: ${unassigned}. Выберите аккорд для каждого такта.`,
    });
  }

  template.sopranoMelody.forEach((step, idx) => {
    const userChord = userChords[idx];
    if (!userChord) return;

    if (!step.allowedChordIds.includes(userChord)) {
      score -= 15;
      issues.push({
        stepIndex: idx,
        type: 'wrong_chord',
        severity: 'warning',
        titleRu: `Нетипичный аккорд в такте ${idx + 1}`,
        descriptionRu: `Нота сопрано ${step.noteName} (${step.degreeRoman} ст.) редко гармонизуется функцией ${CHORD_NAMES_MAP[userChord] || userChord}.`,
      });
    }
  });

  const lastIdx = userChords.length - 1;
  const lastChord = userChords[lastIdx];
  const penultChord = userChords[lastIdx - 1];

  if (lastChord && lastChord !== 'T53' && lastChord !== 't53') {
    score -= 15;
    issues.push({
      stepIndex: lastIdx,
      type: 'weak_cadence',
      severity: 'error',
      titleRu: 'Незавершенная каденция',
      descriptionRu: 'Заключительный такт должен заканчиваться на тоническое трезвучие (T5/3 или t5/3).',
    });
  }

  if (penultChord && !['D53', 'D7', 'D65', 'K64'].includes(penultChord)) {
    score -= 10;
    issues.push({
      stepIndex: Math.max(0, lastIdx - 1),
      type: 'weak_cadence',
      severity: 'warning',
      titleRu: 'Слабый доминантовый предподготовка',
      descriptionRu: 'Перед заключительной тоникой должна звучать доминанта (D5/3, D7) или кадансовый квартсекстаккорд K6/4.',
    });
  }

  // Voice leading check for parallel 5ths/8ves
  for (let i = 0; i < userChords.length - 1; i++) {
    const c1 = userChords[i];
    const c2 = userChords[i + 1];
    if (!c1 || !c2) continue;

    const satb1 = buildSATBForChord(template.sopranoMelody[i].midi, c1, template.keyRootNote, template.scaleMode);
    const satb2 = buildSATBForChord(template.sopranoMelody[i + 1].midi, c2, template.keyRootNote, template.scaleMode);

    const int1 = Math.abs(satb1[3] - satb1[0]) % 12;
    const int2 = Math.abs(satb2[3] - satb2[0]) % 12;

    if (int1 === 7 && int2 === 7) {
      score -= 15;
      issues.push({
        stepIndex: i,
        type: 'parallel_fifth',
        severity: 'error',
        titleRu: `Параллельные квинты (такты ${i + 1}–${i + 2})`,
        descriptionRu: 'Параллельные квинты между басом и сопрано строго запрещены в классической гармонии.',
      });
    }

    if (int1 === 0 && int2 === 0) {
      score -= 15;
      issues.push({
        stepIndex: i,
        type: 'parallel_octave',
        severity: 'error',
        titleRu: `Параллельные октавы (такты ${i + 1}–${i + 2})`,
        descriptionRu: 'Параллельные октавы между крайними голосами обедняют 4-голосную фактуру.',
      });
    }
  }

  const finalScore = Math.max(0, score);
  return {
    score: finalScore,
    passed: finalScore >= 80,
    issues,
    summaryRu:
      finalScore >= 90
        ? 'Отличная гармонизация! Все правила каденции и голосоведения соблюдены.'
        : finalScore >= 70
        ? 'Хорошая гармонизация с небольшими недочетами.'
        : 'Гармонизация содержит ошибки голосоведения или каденции.',
  };
}
