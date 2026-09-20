import { CHROMATIC_NOTES_UP } from '../data/musicData';

export type ProgressionCategory = 'passing' | 'auxiliary' | 'phrygian' | 'cadential' | 'deceptive' | 'sequence';

export type ScaleDegreeCategory = 'all' | 'I' | 'II' | 'III' | 'IV' | 'V' | 'VI' | 'VII';

export interface ProgressionChordStep {
  symbol: string;               // e.g. "T5/3", "D6/4", "T6"
  degreeRoman: string;          // e.g. "I", "V", "I"
  nameRu: string;               // e.g. "Тоническое трезвучие"
  // SATB offsets from tonic (Bass, Tenor, Alto, Soprano) in semitones:
  // Base octave tonic is at index 0
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
}

/**
 * Classical Russian & European Conservatory SATB Harmonic Progressions
 * Strict 4-part voice leading without parallel fifths/octaves, proper resolution of 7ths & leading tones.
 */
export const CLASSICAL_PROGRESSIONS: HarmonicProgressionTemplate[] = [
  // =========================================================================
  // 1. ПРОХОДЯЩИЕ ОБОРОТЫ (Passing Turnarounds)
  // =========================================================================
  {
    id: 'prog_passing_t_d64_t6_maj',
    nameRu: 'Проходящий оборот T — D6/4 — T6 (мажор)',
    formula: 'T — D6/4 — T6',
    category: 'passing',
    categoryNameRu: 'Проходящий оборот',
    rootDegree: 'I',
    scaleMode: 'major',
    bassMotionRu: 'Восходящее плавное движение: I → II → III',
    sopranoMotionRu: 'Противоположное нисходящее движение: III → II → I',
    voiceLeadingExplanationRu: 'Классический проходящий оборот. Бас и сопрано движутся во встречном плавном движении (децима/секста). Тенор удерживает общий звук V ступени (органный пункт). D6/4 берется на слабой доле.',
    usageContextRu: 'Применяется для расширения тонической гармонии в экспозициях и развивающих разделах без остановки движения.',
    steps: [
      {
        symbol: 'T5/3',
        degreeRoman: 'I',
        nameRu: 'Тоническое трезвучие',
        satbOffsets: [-12, 7, 12, 16], // Bass I(0-12), Tenor V(7), Alto I(12), Soprano III(16)
        voiceDegreesRu: { soprano: 'III ступень', alto: 'I ступень', tenor: 'V ступень', bass: 'I ступень' },
      },
      {
        symbol: 'D6/4',
        degreeRoman: 'V',
        nameRu: 'Проходящий квартсекстаккорд',
        satbOffsets: [-10, 7, 11, 14], // Bass II(2-12), Tenor V(7), Alto VII(11), Soprano II(14)
        voiceDegreesRu: { soprano: 'II ступень', alto: 'VII ступень (вводный)', tenor: 'V ступень', bass: 'II ступень' },
      },
      {
        symbol: 'T6',
        degreeRoman: 'I',
        nameRu: 'Тонический секстаккорд',
        satbOffsets: [-8, 7, 12, 12], // Bass III(4-12), Tenor V(7), Alto I(12), Soprano I(12)
        voiceDegreesRu: { soprano: 'I ступень', alto: 'I ступень', tenor: 'V ступень', bass: 'III ступень' },
      },
    ],
  },
  {
    id: 'prog_passing_t6_d64_t_maj',
    nameRu: 'Нисходящий проходящий оборот T6 — D6/4 — T (мажор)',
    formula: 'T6 — D6/4 — T',
    category: 'passing',
    categoryNameRu: 'Проходящий оборот',
    rootDegree: 'I',
    scaleMode: 'major',
    bassMotionRu: 'Нисходящее плавное движение: III → II → I',
    sopranoMotionRu: 'Противоположное восходящее движение: I → II → III',
    voiceLeadingExplanationRu: 'Обратный ход проходящего оборота: бас плавно спускается от терции к приме тоники, сопрано поднимается. D6/4 выполняет функцию мягкой проходящей доминанты.',
    usageContextRu: 'Часто завершает построения или возвращает движение от секстаккорда к устойчивому трезвучию.',
    steps: [
      {
        symbol: 'T6',
        degreeRoman: 'I',
        nameRu: 'Тонический секстаккорд',
        satbOffsets: [-8, 7, 12, 12],
        voiceDegreesRu: { soprano: 'I ступень', alto: 'I ступень', tenor: 'V ступень', bass: 'III ступень' },
      },
      {
        symbol: 'D6/4',
        degreeRoman: 'V',
        nameRu: 'Проходящий квартсекстаккорд',
        satbOffsets: [-10, 7, 11, 14],
        voiceDegreesRu: { soprano: 'II ступень', alto: 'VII ступень', tenor: 'V ступень', bass: 'II ступень' },
      },
      {
        symbol: 'T5/3',
        degreeRoman: 'I',
        nameRu: 'Тоническое трезвучие',
        satbOffsets: [-12, 7, 12, 16],
        voiceDegreesRu: { soprano: 'III ступень', alto: 'I ступень', tenor: 'V ступень', bass: 'I ступень' },
      },
    ],
  },
  {
    id: 'prog_passing_s_t64_s6_maj',
    nameRu: 'Субдоминантовый проходящий оборот S — T6/4 — S6',
    formula: 'S — T6/4 — S6',
    category: 'passing',
    categoryNameRu: 'Проходящий оборот',
    rootDegree: 'IV',
    scaleMode: 'major',
    bassMotionRu: 'Восходящее движение в субдоминантовой сфере: IV → V → VI',
    sopranoMotionRu: 'Нисходящее противоположное движение сопрано к терции: VI → V → IV',
    voiceLeadingExplanationRu: 'Проходящий квартсекстаккорд тоники T6/4 на слабой доле между аккордами субдоминанты. Бас и сопрано в противоположном движении без параллелизмов. Тенор держит общий звук I ступени.',
    usageContextRu: 'Используется в середине музыкальных тем для динамического развития плагальной сферы.',
    steps: [
      {
        symbol: 'S5/3',
        degreeRoman: 'IV',
        nameRu: 'Субдоминантовое трезвучие',
        satbOffsets: [-7, 0, 12, 17], // Bass IV(5-12), Tenor I(0), Alto I(12), Soprano VI(17)
        voiceDegreesRu: { soprano: 'VI ступень', alto: 'I ступень', tenor: 'I ступень', bass: 'IV ступень' },
      },
      {
        symbol: 'T6/4',
        degreeRoman: 'I',
        nameRu: 'Проходящий квартсекстаккорд',
        satbOffsets: [-5, 0, 12, 16], // Bass V(7-12), Tenor I(0), Alto I(12), Soprano III(16)
        voiceDegreesRu: { soprano: 'III ступень', alto: 'I ступень', tenor: 'I ступень', bass: 'V ступень' },
      },
      {
        symbol: 'S6',
        degreeRoman: 'IV',
        nameRu: 'Субдоминантовый секстаккорд',
        satbOffsets: [-3, 0, 17, 17], // Bass VI(9-12), Tenor I(0), Alto IV(17), Soprano IV(17)
        voiceDegreesRu: { soprano: 'IV ступень', alto: 'IV ступень', tenor: 'I ступень', bass: 'VI ступень' },
      },
    ],
  },
  {
    id: 'prog_passing_t_vii6_t6_maj',
    nameRu: 'Проходящий оборот T — VII6 — T6',
    formula: 'T — VII6 — T6',
    category: 'passing',
    categoryNameRu: 'Проходящий оборот',
    rootDegree: 'I',
    scaleMode: 'major',
    bassMotionRu: 'Поступенное движение баса: I → II → III',
    sopranoMotionRu: 'Встречное движение сопрано: III → II → I',
    voiceLeadingExplanationRu: 'Проходящий секстаккорд VII ступени (VII6) с удвоением баса (II ступени), соединяющий T5/3 и T6. Звучит мягче, чем D6/4.',
    usageContextRu: 'Характерен для музыки Баха, Моцарта и Бетховена в строгом хоровом складе.',
    steps: [
      {
        symbol: 'T5/3',
        degreeRoman: 'I',
        nameRu: 'Тоническое трезвучие',
        satbOffsets: [-12, 4, 12, 16],
        voiceDegreesRu: { soprano: 'III ступень', alto: 'I ступень', tenor: 'III ступень', bass: 'I ступень' },
      },
      {
        symbol: 'VII6',
        degreeRoman: 'VII',
        nameRu: 'Проходящий секстаккорд VII ступени',
        satbOffsets: [-10, 5, 11, 14],
        voiceDegreesRu: { soprano: 'II ступень', alto: 'VII ступень', tenor: 'IV ступень', bass: 'II ступень' },
      },
      {
        symbol: 'T6',
        degreeRoman: 'I',
        nameRu: 'Тонический секстаккорд',
        satbOffsets: [-8, 7, 12, 12],
        voiceDegreesRu: { soprano: 'I ступень', alto: 'I ступень', tenor: 'V ступень', bass: 'III ступень' },
      },
    ],
  },

  // =========================================================================
  // 2. ВСПОМОГАТЕЛЬНЫЕ ОБОРОТЫ (Auxiliary Turnarounds)
  // =========================================================================
  {
    id: 'prog_aux_t_s64_t_maj',
    nameRu: 'Тонический вспомогательный оборот T — S6/4 — T',
    formula: 'T — S6/4 — T',
    category: 'auxiliary',
    categoryNameRu: 'Вспомогательный оборот',
    rootDegree: 'I',
    scaleMode: 'both',
    bassMotionRu: 'Выдержанный органчик баса на I ступени: I — I — I',
    sopranoMotionRu: 'Выдержанный тон или вспомогательный ход: III → IV → III',
    voiceLeadingExplanationRu: 'Бас и сопрано остаются на месте (или сопрано делает секундовый шаг). Терцовый и квинтовый тоны тоники делают шаг на секунду вверх к звукам субдоминанты и плавно возвращаются назад.',
    usageContextRu: 'Классическое "колыбельное" или молитвенное расширение тоники (Чайковский, Рахманинов, церковная музыка).',
    steps: [
      {
        symbol: 'T5/3',
        degreeRoman: 'I',
        nameRu: 'Тоническое трезвучие',
        satbOffsets: [-12, 4, 7, 12],
        voiceDegreesRu: { soprano: 'I ступень', alto: 'V ступень', tenor: 'III ступень', bass: 'I ступень' },
      },
      {
        symbol: 'S6/4',
        degreeRoman: 'IV',
        nameRu: 'Вспомогательный квартсекстаккорд',
        satbOffsets: [-12, 5, 9, 12], // S6/4 on tonic bass (F, A on C bass)
        voiceDegreesRu: { soprano: 'I ступень (общий)', alto: 'VI ступень', tenor: 'IV ступень', bass: 'I ступень (органный)' },
      },
      {
        symbol: 'T5/3',
        degreeRoman: 'I',
        nameRu: 'Тоническое трезвучие',
        satbOffsets: [-12, 4, 7, 12],
        voiceDegreesRu: { soprano: 'I ступень', alto: 'V ступень', tenor: 'III ступень', bass: 'I ступень' },
      },
    ],
  },
  {
    id: 'prog_aux_d_t64_d_maj',
    nameRu: 'Доминантовый вспомогательный оборот D — T6/4 — D',
    formula: 'D — T6/4 — D',
    category: 'auxiliary',
    categoryNameRu: 'Вспомогательный оборот',
    rootDegree: 'V',
    scaleMode: 'both',
    bassMotionRu: 'Органный пункт доминанты в басу: V — V — V',
    sopranoMotionRu: 'Вспомогательное опевание доминантовых тонов',
    voiceLeadingExplanationRu: 'Вспомогательный оборот на доминантовой педали. Бас V ступени удерживается, средние голоса временно образуют тонический квартсекстаккорд и возвращаются в доминанту.',
    usageContextRu: 'Звучит в предыктах перед репризой или генеральных кульминациях для нагнетания ожидания.',
    steps: [
      {
        symbol: 'D5/3',
        degreeRoman: 'V',
        nameRu: 'Доминантовое трезвучие',
        satbOffsets: [-5, 2, 7, 11], // Bass V, Tenor II, Alto V, Soprano VII
        voiceDegreesRu: { soprano: 'VII ступень', alto: 'V ступень', tenor: 'II ступень', bass: 'V ступень' },
      },
      {
        symbol: 'T6/4',
        degreeRoman: 'I',
        nameRu: 'Вспомогательный квартсекстаккорд тоники',
        satbOffsets: [-5, 4, 7, 12], // Bass V, Tenor III, Alto V, Soprano I
        voiceDegreesRu: { soprano: 'I ступень', alto: 'V ступень', tenor: 'III ступень', bass: 'V ступень' },
      },
      {
        symbol: 'D5/3',
        degreeRoman: 'V',
        nameRu: 'Доминантовое трезвучие',
        satbOffsets: [-5, 2, 7, 11],
        voiceDegreesRu: { soprano: 'VII ступень', alto: 'V ступень', tenor: 'II ступень', bass: 'V ступень' },
      },
    ],
  },
  {
    id: 'prog_aux_plagal_t_s_t',
    nameRu: 'Классический плагальный оборот T — S — T',
    formula: 'T — S — T',
    category: 'auxiliary',
    categoryNameRu: 'Вспомогательный оборот',
    rootDegree: 'I',
    scaleMode: 'both',
    bassMotionRu: 'Квартовое плагальное движение: I → IV → I',
    sopranoMotionRu: 'Удержание общего тона I ступени или ход III → IV → III',
    voiceLeadingExplanationRu: 'Мягкий плагальный оборот. Сохраняется общий тон I ступени в верхнем голосе, остальные голоса делают секундовый шаг вверх и возвращаются.',
    usageContextRu: 'Завершение произведений ("Аминь"), создание светлого или медитативного характера.',
    steps: [
      {
        symbol: 'T5/3',
        degreeRoman: 'I',
        nameRu: 'Тоника',
        satbOffsets: [-12, 4, 7, 12],
        voiceDegreesRu: { soprano: 'I ступень', alto: 'V ступень', tenor: 'III ступень', bass: 'I ступень' },
      },
      {
        symbol: 'S5/3',
        degreeRoman: 'IV',
        nameRu: 'Субдоминанта',
        satbOffsets: [-7, 5, 9, 12],
        voiceDegreesRu: { soprano: 'I ступень (общий)', alto: 'VI ступень', tenor: 'IV ступень', bass: 'IV ступень' },
      },
      {
        symbol: 'T5/3',
        degreeRoman: 'I',
        nameRu: 'Тоника',
        satbOffsets: [-12, 4, 7, 12],
        voiceDegreesRu: { soprano: 'I ступень', alto: 'V ступень', tenor: 'III ступень', bass: 'I ступень' },
      },
    ],
  },

  // =========================================================================
  // 3. ФРИГИЙСКИЕ ОБОРОТЫ (Phrygian Progressions)
  // =========================================================================
  {
    id: 'prog_phrygian_classic_min',
    nameRu: 'Фригийский оборот t — t6 — S6 — D (минор)',
    formula: 't — t6 — S6 — D',
    category: 'phrygian',
    categoryNameRu: 'Фригийский оборот',
    rootDegree: 'I',
    scaleMode: 'minor',
    bassMotionRu: 'Легендарный нисходящий тетрахорд: I → VII (нат.) → VI → V (Ля → Соль → Фа → Ми)',
    sopranoMotionRu: 'Восходяще-нисходящая арка: I → II → IV → III (с вводным тоном VII# в доминанте)',
    voiceLeadingExplanationRu: 'Классический фригийский оборот минора (lamento / chaconne). Бас шаг за шагом спускается от тоники к доминанте на полутон VI → V (фригийская секунда). Оборот завершается половинной каденцией на мажорной гармонической доминанте D.',
    usageContextRu: 'Скорбные, драматические или патетические темы барокко и романтизма (Бах "Passacaglia", Перселл "Dido\'s Lament", Шопен).',
    steps: [
      {
        symbol: 't5/3',
        degreeRoman: 'i',
        nameRu: 'Тоническое минорное трезвучие',
        satbOffsets: [-12, 3, 7, 12], // Bass I, Tenor III, Alto V, Soprano I
        voiceDegreesRu: { soprano: 'I ступень', alto: 'V ступень', tenor: 'III ступень', bass: 'I ступень' },
      },
      {
        symbol: 't6 (натур.)',
        degreeRoman: 'i6',
        nameRu: 'Тонический секстаккорд (натур. VII в басу)',
        satbOffsets: [-14, 3, 7, 14], // Bass VII nat (-2), Tenor III, Alto V, Soprano II
        voiceDegreesRu: { soprano: 'II ступень', alto: 'V ступень', tenor: 'III ступень', bass: 'VII натур. ступень' },
      },
      {
        symbol: 's6',
        degreeRoman: 'iv6',
        nameRu: 'Субдоминантовый секстаккорд',
        satbOffsets: [-16, 5, 8, 12], // Bass VI (-4 / 8), Tenor IV, Alto VI, Soprano I
        voiceDegreesRu: { soprano: 'I ступень', alto: 'VI ступень', tenor: 'IV ступень', bass: 'VI ступень' },
      },
      {
        symbol: 'D5/3 (гарм.)',
        degreeRoman: 'V',
        nameRu: 'Мажорная гармоническая доминанта',
        satbOffsets: [-17, 2, 7, 11], // Bass V (-5 / 7), Tenor II, Alto V, Soprano VII#
        voiceDegreesRu: { soprano: 'VII# вводный тон', alto: 'V ступень', tenor: 'II ступень', bass: 'V ступень' },
      },
    ],
  },
  {
    id: 'prog_phrygian_d6_min',
    nameRu: 'Фригийский оборот t — D6 — S6 — D',
    formula: 't — D6 — S6 — D',
    category: 'phrygian',
    categoryNameRu: 'Фригийский оборот',
    rootDegree: 'I',
    scaleMode: 'minor',
    bassMotionRu: 'Нисходящий бас: I → VII (нат. D6) → VI → V',
    sopranoMotionRu: 'Плавное голосоведение: I → II → IV → III',
    voiceLeadingExplanationRu: 'Разновидность фригийского оборота с натуральной минорной доминантой в виде секстаккорда на втором шаге (d6). Звучит прозрачно и строго в духе строгой полифонии.',
    usageContextRu: 'Основа старинных вариаций на бассо остинато (пассакалии, фолии).',
    steps: [
      {
        symbol: 't5/3',
        degreeRoman: 'i',
        nameRu: 'Минорная тоника',
        satbOffsets: [-12, 3, 7, 12],
        voiceDegreesRu: { soprano: 'I ступень', alto: 'V ступень', tenor: 'III ступень', bass: 'I ступень' },
      },
      {
        symbol: 'd6 (натур.)',
        degreeRoman: 'v6',
        nameRu: 'Натуральный доминантовый секстаккорд',
        satbOffsets: [-14, 2, 7, 14],
        voiceDegreesRu: { soprano: 'II ступень', alto: 'V ступень', tenor: 'II ступень', bass: 'VII натур. ступень' },
      },
      {
        symbol: 's6',
        degreeRoman: 'iv6',
        nameRu: 'Субдоминантовый секстаккорд',
        satbOffsets: [-16, 5, 8, 12],
        voiceDegreesRu: { soprano: 'I ступень', alto: 'VI ступень', tenor: 'IV ступень', bass: 'VI ступень' },
      },
      {
        symbol: 'D5/3',
        degreeRoman: 'V',
        nameRu: 'Гармоническая мажорная доминанта',
        satbOffsets: [-17, 2, 7, 11],
        voiceDegreesRu: { soprano: 'VII# вводный тон', alto: 'V ступень', tenor: 'II ступень', bass: 'V ступень' },
      },
    ],
  },
  {
    id: 'prog_phrygian_alt_s_min',
    nameRu: 'Фригийский полукаданс с s#IV (Sальт — D)',
    formula: 't — s#IV — D',
    category: 'phrygian',
    categoryNameRu: 'Фригийский оборот',
    rootDegree: 'I',
    scaleMode: 'minor',
    bassMotionRu: 'Полутоновое сжатие в басу: VI → V',
    sopranoMotionRu: 'Встречное полутоновое расширение: #IV → V',
    voiceLeadingExplanationRu: 'Острейший полукаданс с альтерированной субдоминантой (увеличенный терцкварт / итальянская секста). Звуки #IV и VI ступени с двух сторон в противоположном движении сходятся в октавный тон доминанты V.',
    usageContextRu: 'Кульминационные трагические полукаденции в сонатах и симфониях Бетховена, Брамса.',
    steps: [
      {
        symbol: 't5/3',
        degreeRoman: 'i',
        nameRu: 'Минорная тоника',
        satbOffsets: [-12, 3, 7, 12],
        voiceDegreesRu: { soprano: 'I ступень', alto: 'V ступень', tenor: 'III ступень', bass: 'I ступень' },
      },
      {
        symbol: 's#IV (Sальт)',
        degreeRoman: 'iv#',
        nameRu: 'Альтерированная субдоминанта (#IV ступень)',
        satbOffsets: [-16, 0, 6, 12], // Bass VI (-4), Tenor I, Alto #IV (+6), Soprano I
        voiceDegreesRu: { soprano: 'I ступень', alto: '#IV альтер. тон', tenor: 'I ступень', bass: 'VI ступень' },
      },
      {
        symbol: 'D5/3',
        degreeRoman: 'V',
        nameRu: 'Мажорная гармоническая доминанта',
        satbOffsets: [-17, 2, 7, 11],
        voiceDegreesRu: { soprano: 'VII# вводный тон', alto: 'V ступень', tenor: 'II ступень', bass: 'V ступень' },
      },
    ],
  },

  // =========================================================================
  // 4. ПОЛНЫЕ КАДАНСОВЫЕ ОБОРОТЫ (Complete Cadential Progressions)
  // =========================================================================
  {
    id: 'prog_cadence_full_t_s_k64_d7_t',
    nameRu: 'Полная функциональная каденция T — S — K6/4 — D7 — T',
    formula: 'T — S — K6/4 — D7 — T',
    category: 'cadential',
    categoryNameRu: 'Кадансовый оборот',
    rootDegree: 'I',
    scaleMode: 'both',
    bassMotionRu: 'Фундаментальный кадансовый бас: I → IV → V → V → I',
    sopranoMotionRu: 'Плавное голосоведение с разрешением септимы D7 вниз и вводного тона вверх',
    voiceLeadingExplanationRu: 'Главная каденция классической музыки. Охватывает все три функции (T - S - D - T). K6/4 на сильной доле концентрирует тонические задержания, разрешающиеся в D7, который полнозвучно разрешается в тонику.',
    usageContextRu: 'Завершение музыкальных периодов, частей симфоний, сонат и песен.',
    steps: [
      {
        symbol: 'T5/3',
        degreeRoman: 'I',
        nameRu: 'Тоника',
        satbOffsets: [-12, 4, 7, 12],
        voiceDegreesRu: { soprano: 'I ступень', alto: 'V ступень', tenor: 'III ступень', bass: 'I ступень' },
      },
      {
        symbol: 'S5/3',
        degreeRoman: 'IV',
        nameRu: 'Субдоминанта',
        satbOffsets: [-7, 5, 9, 12],
        voiceDegreesRu: { soprano: 'I ступень', alto: 'VI ступень', tenor: 'IV ступень', bass: 'IV ступень' },
      },
      {
        symbol: 'K6/4',
        degreeRoman: 'K6/4',
        nameRu: 'Кадансовый квартсекстаккорд',
        satbOffsets: [-5, 4, 7, 12], // Bass V, Tenor III, Alto V, Soprano I
        voiceDegreesRu: { soprano: 'I ступень', alto: 'V ступень', tenor: 'III ступень', bass: 'V ступень' },
      },
      {
        symbol: 'D7',
        degreeRoman: 'V7',
        nameRu: 'Доминантсептаккорд',
        satbOffsets: [-5, 2, 5, 11], // Bass V, Tenor II, Alto IV (7th), Soprano VII (leading tone)
        voiceDegreesRu: { soprano: 'VII вводный тон', alto: 'IV септима', tenor: 'II квинта', bass: 'V ступень' },
      },
      {
        symbol: 'T5/3 (неполн.)',
        degreeRoman: 'I',
        nameRu: 'Тоника с утроенной примой',
        satbOffsets: [-12, 0, 4, 12], // Bass I, Tenor I, Alto III, Soprano I
        voiceDegreesRu: { soprano: 'I ступень', alto: 'III терция', tenor: 'I прима', bass: 'I ступень' },
      },
    ],
  },
  {
    id: 'prog_cadence_ii65_k64_d7_t',
    nameRu: 'Каденция с квинтсекстаккордом II6/5 — K6/4 — D7 — T',
    formula: 'T — II6/5 — K6/4 — D7 — T',
    category: 'cadential',
    categoryNameRu: 'Кадансовый оборот',
    rootDegree: 'I',
    scaleMode: 'major',
    bassMotionRu: 'Кадансовый бас с шагом IV в субдоминанте: I → IV → V → V → I',
    sopranoMotionRu: 'Мелодический спуск от II ступени к разрешению',
    voiceLeadingExplanationRu: 'Квинтсекстаккорд II ступени II6/5 — самый употребительный преддоминантовый септаккорд. Бас IV ступени делает мягкий шаг в V ступень кадансового квартсекстаккорда.',
    usageContextRu: 'Золотой стандарт венской классики (Гайдн, Моцарт, Бетховен) в главных каденциях.',
    steps: [
      {
        symbol: 'T5/3',
        degreeRoman: 'I',
        nameRu: 'Тоника',
        satbOffsets: [-12, 4, 7, 12],
        voiceDegreesRu: { soprano: 'I ступень', alto: 'V ступень', tenor: 'III ступень', bass: 'I ступень' },
      },
      {
        symbol: 'II6/5',
        degreeRoman: 'II6/5',
        nameRu: 'Квинтсекстаккорд II ступени',
        satbOffsets: [-7, 2, 9, 14], // Bass IV(5), Tenor II(2), Alto VI(9), Soprano II(14)
        voiceDegreesRu: { soprano: 'II ступень', alto: 'VI ступень', tenor: 'II ступень', bass: 'IV ступень' },
      },
      {
        symbol: 'K6/4',
        degreeRoman: 'K6/4',
        nameRu: 'Кадансовый квартсекстаккорд',
        satbOffsets: [-5, 4, 7, 12],
        voiceDegreesRu: { soprano: 'I ступень', alto: 'V ступень', tenor: 'III ступень', bass: 'V ступень' },
      },
      {
        symbol: 'D7',
        degreeRoman: 'V7',
        nameRu: 'Доминантсептаккорд',
        satbOffsets: [-5, 2, 5, 11],
        voiceDegreesRu: { soprano: 'VII вводный тон', alto: 'IV септима', tenor: 'II квинта', bass: 'V ступень' },
      },
      {
        symbol: 'T5/3',
        degreeRoman: 'I',
        nameRu: 'Тоника',
        satbOffsets: [-12, 0, 4, 12],
        voiceDegreesRu: { soprano: 'I ступень', alto: 'III терция', tenor: 'I прима', bass: 'I ступень' },
      },
    ],
  },
  {
    id: 'prog_cadence_neapolitan_n6_min',
    nameRu: 'Неаполитанская каденция t — N6 — K6/4 — D7 — t',
    formula: 't — N6 — K6/4 — D7 — t',
    category: 'cadential',
    categoryNameRu: 'Кадансовый оборот',
    rootDegree: 'I',
    scaleMode: 'minor',
    bassMotionRu: 'Кадансовый бас с неаполитанской субдоминантой: I → IV → V → V → I',
    sopranoMotionRu: 'Характерный ход с пониженной II ступенью (bII): I → bII → I → VII# → I',
    voiceLeadingExplanationRu: 'Неаполитанский секстаккорд (N6) — мажорное трезвучие на пониженной II ступени минора (bII), взятое в обращении с басом IV ступени. Создает глубочайший романтический колорит и разрешается через кадансовый квартсекстаккорд.',
    usageContextRu: 'Драматические патетические каденции (Шопен "Ноктюрны", Бетховен "Лунная соната", Лист).',
    steps: [
      {
        symbol: 't5/3',
        degreeRoman: 'i',
        nameRu: 'Минорная тоника',
        satbOffsets: [-12, 3, 7, 12],
        voiceDegreesRu: { soprano: 'I ступень', alto: 'V ступень', tenor: 'III ступень', bass: 'I ступень' },
      },
      {
        symbol: 'N6 (Неаполитанский)',
        degreeRoman: 'bII6',
        nameRu: 'Неаполитанский секстаккорд (bII на басу IV)',
        satbOffsets: [-7, 1, 8, 13], // Bass IV(5), Tenor bII(1), Alto VI(8), Soprano bII(13)
        voiceDegreesRu: { soprano: 'bII пониженная ступень', alto: 'VI ступень', tenor: 'bII пониженная', bass: 'IV ступень' },
      },
      {
        symbol: 'k6/4',
        degreeRoman: 'k6/4',
        nameRu: 'Кадансовый квартсекстаккорд',
        satbOffsets: [-5, 3, 7, 12],
        voiceDegreesRu: { soprano: 'I ступень', alto: 'V ступень', tenor: 'III ступень', bass: 'V ступень' },
      },
      {
        symbol: 'D7',
        degreeRoman: 'V7',
        nameRu: 'Доминантсептаккорд',
        satbOffsets: [-5, 2, 5, 11],
        voiceDegreesRu: { soprano: 'VII# вводный тон', alto: 'IV септима', tenor: 'II квинта', bass: 'V ступень' },
      },
      {
        symbol: 't5/3',
        degreeRoman: 'i',
        nameRu: 'Минорная тоника',
        satbOffsets: [-12, 0, 3, 12],
        voiceDegreesRu: { soprano: 'I ступень', alto: 'III минорная терция', tenor: 'I прима', bass: 'I ступень' },
      },
    ],
  },

  // =========================================================================
  // 5. ОБОРОТЫ ОТ II СТУПЕНИ (II Degree Progressions)
  // =========================================================================
  {
    id: 'prog_turn_ii65_d7_t_maj',
    nameRu: 'Оборот от II ступени: II6/5 — D7 — T',
    formula: 'II6/5 — D7 — T',
    category: 'cadential',
    categoryNameRu: 'Оборот от II ступени',
    rootDegree: 'II',
    scaleMode: 'major',
    bassMotionRu: 'Шаг от субдоминантового баса к доминанте и тонике: IV → V → I',
    sopranoMotionRu: 'Плавный спуск II → VII → I',
    voiceLeadingExplanationRu: 'Квинтсекстаккорд II ступени напрямую переходит в доминантсептаккорд D7 с сохранением общих звуков.',
    usageContextRu: 'Широко применяется в сонатах Моцарта, симфониях Гайдна и романсах.',
    steps: [
      {
        symbol: 'II6/5',
        degreeRoman: 'II6/5',
        nameRu: 'Квинтсекстаккорд II ступени',
        satbOffsets: [-7, 2, 9, 14], // Bass IV, Tenor II, Alto VI, Soprano II
        voiceDegreesRu: { soprano: 'II ступень', alto: 'VI ступень', tenor: 'II ступень', bass: 'IV ступень' },
      },
      {
        symbol: 'D7',
        degreeRoman: 'V7',
        nameRu: 'Доминантсептаккорд',
        satbOffsets: [-5, 2, 5, 11], // Bass V, Tenor II, Alto IV, Soprano VII
        voiceDegreesRu: { soprano: 'VII вводный тон', alto: 'IV септима', tenor: 'II квинта', bass: 'V ступень' },
      },
      {
        symbol: 'T5/3',
        degreeRoman: 'I',
        nameRu: 'Тоническое трезвучие',
        satbOffsets: [-12, 0, 4, 12],
        voiceDegreesRu: { soprano: 'I ступень', alto: 'III терция', tenor: 'I прима', bass: 'I ступень' },
      },
    ],
  },
  {
    id: 'prog_turn_ii_v7_i_jazz',
    nameRu: 'Джазово-классическая каденция ii — V7 — I',
    formula: 'II — V7 — I',
    category: 'cadential',
    categoryNameRu: 'Оборот от II ступени',
    rootDegree: 'II',
    scaleMode: 'both',
    bassMotionRu: 'Квинтовый шаг баса: II → V → I',
    sopranoMotionRu: 'Линеарный спуск: VI → VII → I (или IV → IV → III)',
    voiceLeadingExplanationRu: 'Классический оборот II - V - I по квинтовому кругу. Самая популярная гармоническая формула в джазе и академической музыке.',
    usageContextRu: 'Основа джазовых стандартов, эстрадной гармонии и классических связок.',
    steps: [
      {
        symbol: 'II5/3',
        degreeRoman: 'II',
        nameRu: 'Трезвучие II ступени',
        satbOffsets: [-10, 2, 5, 9], // Bass II, Tenor II, Alto IV, Soprano VI
        voiceDegreesRu: { soprano: 'VI ступень', alto: 'IV ступень', tenor: 'II ступень', bass: 'II ступень' },
      },
      {
        symbol: 'D7',
        degreeRoman: 'V7',
        nameRu: 'Доминантсептаккорд',
        satbOffsets: [-5, 2, 5, 11], // Bass V, Tenor II, Alto IV, Soprano VII
        voiceDegreesRu: { soprano: 'VII вводный тон', alto: 'IV септима', tenor: 'II квинта', bass: 'V ступень' },
      },
      {
        symbol: 'T5/3',
        degreeRoman: 'I',
        nameRu: 'Тоническое трезвучие',
        satbOffsets: [-12, 0, 4, 12],
        voiceDegreesRu: { soprano: 'I ступень', alto: 'III терция', tenor: 'I прима', bass: 'I ступень' },
      },
    ],
  },

  // =========================================================================
  // 6. ОБОРОТЫ ОТ III СТУПЕНИ (III Degree Progressions)
  // =========================================================================
  {
    id: 'prog_turn_iii_vi_ii_v_t',
    nameRu: 'Медиантовый оборот по квартам: III — VI — II — V — T',
    formula: 'III — VI — II — V — T',
    category: 'sequence',
    categoryNameRu: 'Оборот от III ступени',
    rootDegree: 'III',
    scaleMode: 'major',
    bassMotionRu: 'Кварто-квинтовый ход от медианты: III → VI → II → V → I',
    sopranoMotionRu: 'Плавный нисходящий кантиленный голос',
    voiceLeadingExplanationRu: 'Оборот начинается с медиантового трезвучия III ступени и развивает кварто-квинтовую цепочку тяготений к тонике.',
    usageContextRu: 'Развивающие разделы разработок, секвенции в классицизме и романтизме.',
    steps: [
      {
        symbol: 'III5/3',
        degreeRoman: 'III',
        nameRu: 'Медиантовое трезвучие',
        satbOffsets: [-8, 4, 7, 11],
        voiceDegreesRu: { soprano: 'VII ступень', alto: 'V ступень', tenor: 'III ступень', bass: 'III ступень' },
      },
      {
        symbol: 'VI5/3',
        degreeRoman: 'VI',
        nameRu: 'Субмедианта (VI ступень)',
        satbOffsets: [-3, 0, 4, 9],
        voiceDegreesRu: { soprano: 'VI ступень', alto: 'III ступень', tenor: 'I ступень', bass: 'VI ступень' },
      },
      {
        symbol: 'II6/5',
        degreeRoman: 'II6/5',
        nameRu: 'Квинтсекстаккорд II ступени',
        satbOffsets: [-7, 2, 9, 14],
        voiceDegreesRu: { soprano: 'II ступень', alto: 'VI ступень', tenor: 'II ступень', bass: 'IV ступень' },
      },
      {
        symbol: 'D7',
        degreeRoman: 'V7',
        nameRu: 'Доминантсептаккорд',
        satbOffsets: [-5, 2, 5, 11],
        voiceDegreesRu: { soprano: 'VII вводный тон', alto: 'IV септима', tenor: 'II квинта', bass: 'V ступень' },
      },
      {
        symbol: 'T5/3',
        degreeRoman: 'I',
        nameRu: 'Тоника',
        satbOffsets: [-12, 0, 4, 12],
        voiceDegreesRu: { soprano: 'I ступень', alto: 'III терция', tenor: 'I прима', bass: 'I ступень' },
      },
    ],
  },

  // =========================================================================
  // 7. ОБОРОТЫ ОТ IV СТУПЕНИ (IV Degree Progressions)
  // =========================================================================
  {
    id: 'prog_turn_s_k64_d7_t',
    nameRu: 'Субдоминантовый каданс: S — K6/4 — D7 — T',
    formula: 'S — K6/4 — D7 — T',
    category: 'cadential',
    categoryNameRu: 'Оборот от IV ступени',
    rootDegree: 'IV',
    scaleMode: 'both',
    bassMotionRu: 'Движение баса от субдоминанты: IV → V → V → I',
    sopranoMotionRu: 'Разрешение VI → V → IV → III',
    voiceLeadingExplanationRu: 'Оборот начинается прямо с субдоминанты и через кадансовый квартсекстаккорд и D7 стремится к устойчивому завершению.',
    usageContextRu: 'Вторая половина музыкальных предложений, связующие партии.',
    steps: [
      {
        symbol: 'S5/3',
        degreeRoman: 'IV',
        nameRu: 'Субдоминанта',
        satbOffsets: [-7, 5, 9, 12],
        voiceDegreesRu: { soprano: 'I ступень', alto: 'VI ступень', tenor: 'IV ступень', bass: 'IV ступень' },
      },
      {
        symbol: 'K6/4',
        degreeRoman: 'K6/4',
        nameRu: 'Кадансовый квартсекстаккорд',
        satbOffsets: [-5, 4, 7, 12],
        voiceDegreesRu: { soprano: 'I ступень', alto: 'V ступень', tenor: 'III ступень', bass: 'V ступень' },
      },
      {
        symbol: 'D7',
        degreeRoman: 'V7',
        nameRu: 'Доминантсептаккорд',
        satbOffsets: [-5, 2, 5, 11],
        voiceDegreesRu: { soprano: 'VII вводный тон', alto: 'IV септима', tenor: 'II квинта', bass: 'V ступень' },
      },
      {
        symbol: 'T5/3',
        degreeRoman: 'I',
        nameRu: 'Тоника',
        satbOffsets: [-12, 0, 4, 12],
        voiceDegreesRu: { soprano: 'I ступень', alto: 'III терция', tenor: 'I прима', bass: 'I ступень' },
      },
    ],
  },
  {
    id: 'prog_turn_s_d7_t',
    nameRu: 'Быстрый полный оборот S — D7 — T',
    formula: 'S — D7 — T',
    category: 'cadential',
    categoryNameRu: 'Оборот от IV ступени',
    rootDegree: 'IV',
    scaleMode: 'both',
    bassMotionRu: 'Ход IV → V → I',
    sopranoMotionRu: 'Нисходящее движение к тонике',
    voiceLeadingExplanationRu: 'Компактный субдоминантово-доминантовый каданс без вспомогательных квартсекстаккордов.',
    usageContextRu: 'Быстрые темы, танцевальные формы (менуэты, скерцо, вальсы).',
    steps: [
      {
        symbol: 'S5/3',
        degreeRoman: 'IV',
        nameRu: 'Субдоминанта',
        satbOffsets: [-7, 5, 9, 12],
        voiceDegreesRu: { soprano: 'I ступень', alto: 'VI ступень', tenor: 'IV ступень', bass: 'IV ступень' },
      },
      {
        symbol: 'D7',
        degreeRoman: 'V7',
        nameRu: 'Доминантсептаккорд',
        satbOffsets: [-5, 2, 5, 11],
        voiceDegreesRu: { soprano: 'VII вводный тон', alto: 'IV септима', tenor: 'II квинта', bass: 'V ступень' },
      },
      {
        symbol: 'T5/3',
        degreeRoman: 'I',
        nameRu: 'Тоника',
        satbOffsets: [-12, 0, 4, 12],
        voiceDegreesRu: { soprano: 'I ступень', alto: 'III терция', tenor: 'I прима', bass: 'I ступень' },
      },
    ],
  },

  // =========================================================================
  // 8. ОБОРОТЫ ОТ V СТУПЕНИ (V Degree Progressions / Deceptive)
  // =========================================================================
  {
    id: 'prog_deceptive_d7_vi_maj',
    nameRu: 'Прерванный оборот: D7 — VI — S6 — D — T',
    formula: 'D7 — VI — S6 — D — T',
    category: 'deceptive',
    categoryNameRu: 'Прерванный оборот (от V)',
    rootDegree: 'V',
    scaleMode: 'major',
    bassMotionRu: 'Прерванный шаг в VI ступень: V → VI → IV → V → I',
    sopranoMotionRu: 'Вводный тон VII идет вверх в I ступень в трезвучии VI',
    voiceLeadingExplanationRu: 'Классический прерванный каданс. Доминанта вместо тоники разрешается в трезвучие VI ступени с удвоением терции (I ступени), продлевая развитие.',
    usageContextRu: 'Кульминации, создание драматической неожиданности перед генеральной каденцией.',
    steps: [
      {
        symbol: 'D7',
        degreeRoman: 'V7',
        nameRu: 'Доминантсептаккорд',
        satbOffsets: [-5, 2, 5, 11],
        voiceDegreesRu: { soprano: 'VII вводный тон', alto: 'IV септима', tenor: 'II квинта', bass: 'V ступень' },
      },
      {
        symbol: 'VI5/3',
        degreeRoman: 'VI',
        nameRu: 'Прерванное трезвучие VI ступени',
        satbOffsets: [-3, 0, 4, 12], // Bass VI, Tenor I, Alto III, Soprano I
        voiceDegreesRu: { soprano: 'I ступень (удвоение)', alto: 'III ступень', tenor: 'I ступень', bass: 'VI ступень' },
      },
      {
        symbol: 'S6',
        degreeRoman: 'IV6',
        nameRu: 'Субдоминантовый секстаккорд',
        satbOffsets: [-3, 0, 5, 12],
        voiceDegreesRu: { soprano: 'I ступень', alto: 'IV ступень', tenor: 'I ступень', bass: 'VI ступень' },
      },
      {
        symbol: 'D5/3',
        degreeRoman: 'V',
        nameRu: 'Доминанта',
        satbOffsets: [-5, 2, 7, 11],
        voiceDegreesRu: { soprano: 'VII вводный тон', alto: 'V ступень', tenor: 'II ступень', bass: 'V ступень' },
      },
      {
        symbol: 'T5/3',
        degreeRoman: 'I',
        nameRu: 'Окончательная тоника',
        satbOffsets: [-12, 0, 4, 12],
        voiceDegreesRu: { soprano: 'I ступень', alto: 'III терция', tenor: 'I прима', bass: 'I ступень' },
      },
    ],
  },
  {
    id: 'prog_turn_d_k64_d7_t',
    nameRu: 'Предыктовый оборот D — K6/4 — D7 — T',
    formula: 'D — K6/4 — D7 — T',
    category: 'cadential',
    categoryNameRu: 'Оборот от V ступени',
    rootDegree: 'V',
    scaleMode: 'both',
    bassMotionRu: 'Органный бас V ступени перед падением в тонику: V — V — V → I',
    sopranoMotionRu: 'Опевание тоники и вводного тона',
    voiceLeadingExplanationRu: 'Оборот начинается с доминанты на басу V, насыщается задержанием кадансового квартсекстаккорда и разрешается в D7 и T.',
    usageContextRu: 'Предыкты, ферматы перед каденциями в инструментальных концертах.',
    steps: [
      {
        symbol: 'D5/3',
        degreeRoman: 'V',
        nameRu: 'Доминанта',
        satbOffsets: [-5, 2, 7, 11],
        voiceDegreesRu: { soprano: 'VII вводный тон', alto: 'V ступень', tenor: 'II ступень', bass: 'V ступень' },
      },
      {
        symbol: 'K6/4',
        degreeRoman: 'K6/4',
        nameRu: 'Кадансовый квартсекстаккорд',
        satbOffsets: [-5, 4, 7, 12],
        voiceDegreesRu: { soprano: 'I ступень', alto: 'V ступень', tenor: 'III ступень', bass: 'V ступень' },
      },
      {
        symbol: 'D7',
        degreeRoman: 'V7',
        nameRu: 'Доминантсептаккорд',
        satbOffsets: [-5, 2, 5, 11],
        voiceDegreesRu: { soprano: 'VII вводный тон', alto: 'IV септима', tenor: 'II квинта', bass: 'V ступень' },
      },
      {
        symbol: 'T5/3',
        degreeRoman: 'I',
        nameRu: 'Тоника',
        satbOffsets: [-12, 0, 4, 12],
        voiceDegreesRu: { soprano: 'I ступень', alto: 'III терция', tenor: 'I прима', bass: 'I ступень' },
      },
    ],
  },

  // =========================================================================
  // 9. ОБОРОТЫ ОТ VI СТУПЕНИ (VI Degree Progressions)
  // =========================================================================
  {
    id: 'prog_turn_vi_ii6_k64_d7_t',
    nameRu: 'Оборот через субмедианту: VI — II6 — K6/4 — D7 — T',
    formula: 'VI — II6 — K6/4 — D7 — T',
    category: 'cadential',
    categoryNameRu: 'Оборот от VI ступени',
    rootDegree: 'VI',
    scaleMode: 'major',
    bassMotionRu: 'Шаг от VI ступени к субдоминантовому басу: VI → IV → V → V → I',
    sopranoMotionRu: 'Плавный мелодический рисунок',
    voiceLeadingExplanationRu: 'VI ступень открывает субдоминантовую группу и мягко перетекает в II6 и далее в полную каденцию.',
    usageContextRu: 'Лирические темы Шопена, Чайковского, Рахманинова.',
    steps: [
      {
        symbol: 'VI5/3',
        degreeRoman: 'VI',
        nameRu: 'Субмедианта (VI ступень)',
        satbOffsets: [-3, 0, 4, 9],
        voiceDegreesRu: { soprano: 'VI ступень', alto: 'III ступень', tenor: 'I ступень', bass: 'VI ступень' },
      },
      {
        symbol: 'II6',
        degreeRoman: 'II6',
        nameRu: 'Секстаккорд II ступени',
        satbOffsets: [-7, 2, 5, 14],
        voiceDegreesRu: { soprano: 'II ступень', alto: 'IV ступень', tenor: 'II ступень', bass: 'IV ступень' },
      },
      {
        symbol: 'K6/4',
        degreeRoman: 'K6/4',
        nameRu: 'Кадансовый квартсекстаккорд',
        satbOffsets: [-5, 4, 7, 12],
        voiceDegreesRu: { soprano: 'I ступень', alto: 'V ступень', tenor: 'III ступень', bass: 'V ступень' },
      },
      {
        symbol: 'D7',
        degreeRoman: 'V7',
        nameRu: 'Доминантсептаккорд',
        satbOffsets: [-5, 2, 5, 11],
        voiceDegreesRu: { soprano: 'VII вводный тон', alto: 'IV септима', tenor: 'II квинта', bass: 'V ступень' },
      },
      {
        symbol: 'T5/3',
        degreeRoman: 'I',
        nameRu: 'Тоника',
        satbOffsets: [-12, 0, 4, 12],
        voiceDegreesRu: { soprano: 'I ступень', alto: 'III терция', tenor: 'I прима', bass: 'I ступень' },
      },
    ],
  },

  // =========================================================================
  // 10. ОБОРОТЫ ОТ VII СТУПЕНИ (VII Degree Progressions / Leading Tone)
  // =========================================================================
  {
    id: 'prog_turn_vii6_t_maj',
    nameRu: 'Вводный оборот: VII6 — T',
    formula: 'VII6 — T',
    category: 'auxiliary',
    categoryNameRu: 'Оборот от VII ступени',
    rootDegree: 'VII',
    scaleMode: 'both',
    bassMotionRu: 'Шаг II → I или VII → I',
    sopranoMotionRu: 'Разрешение вводного тона VII# → I',
    voiceLeadingExplanationRu: 'Вводный секстаккорд VII6 выполняет функцию мягкой доминанты и разрешается в полное тоническое трезвучие.',
    usageContextRu: 'Строгий хоровой стиль, полифония Возрождения и Барокко.',
    steps: [
      {
        symbol: 'VII6',
        degreeRoman: 'VII6',
        nameRu: 'Вводный секстаккорд VII ступени',
        satbOffsets: [-10, 5, 11, 14], // Bass II, Tenor IV, Alto VII, Soprano II
        voiceDegreesRu: { soprano: 'II ступень', alto: 'VII ступень', tenor: 'IV ступень', bass: 'II ступень' },
      },
      {
        symbol: 'T5/3',
        degreeRoman: 'I',
        nameRu: 'Тоническое трезвучие',
        satbOffsets: [-12, 4, 7, 12],
        voiceDegreesRu: { soprano: 'I ступень', alto: 'V ступень', tenor: 'III ступень', bass: 'I ступень' },
      },
    ],
  },
  {
    id: 'prog_turn_vii7_t_maj',
    nameRu: 'Вводный септаккорд: VII7 — D6/5 — T',
    formula: 'VII7 — D6/5 — T',
    category: 'cadential',
    categoryNameRu: 'Оборот от VII ступени',
    rootDegree: 'VII',
    scaleMode: 'both',
    bassMotionRu: 'Бас VII → VII → I',
    sopranoMotionRu: 'Спуск от септимы VI к вводному тону и тонике',
    voiceLeadingExplanationRu: 'Уменьшенный или малый вводный септаккорд переходит во внутрифункциональный квинтсекстаккорд доминанты D6/5 и устойчиво разрешается в тонику.',
    usageContextRu: 'Драматические кульминации у Баха, Моцарта ("Реквием"), Бетховена.',
    steps: [
      {
        symbol: 'VII7',
        degreeRoman: 'VII7',
        nameRu: 'Вводный септаккорд VII ступени',
        satbOffsets: [-1, 2, 5, 9], // Bass VII, Tenor II, Alto IV, Soprano VI
        voiceDegreesRu: { soprano: 'VI ступень', alto: 'IV ступень', tenor: 'II ступень', bass: 'VII ступень' },
      },
      {
        symbol: 'D6/5',
        degreeRoman: 'V6/5',
        nameRu: 'Доминантовый квинтсекстаккорд',
        satbOffsets: [-1, 2, 5, 7], // Bass VII, Tenor II, Alto IV, Soprano V
        voiceDegreesRu: { soprano: 'V ступень', alto: 'IV септима', tenor: 'II квинта', bass: 'VII вводный тон' },
      },
      {
        symbol: 'T5/3',
        degreeRoman: 'I',
        nameRu: 'Полное тоническое трезвучие',
        satbOffsets: [-12, 0, 4, 12],
        voiceDegreesRu: { soprano: 'I ступень', alto: 'III терция', tenor: 'I прима', bass: 'I ступень' },
      },
    ],
  },

  // =========================================================================
  // 11. ЗОЛОТАЯ КВИНТОВАЯ СЕКВЕНЦИЯ (Circle of Fifths Golden Sequence)
  // =========================================================================
  {
    id: 'prog_circle_of_fifths_golden',
    nameRu: 'Золотая секвенция (квинтовый круг): I — IV — VII — III — VI — II — V — I',
    formula: 'I — IV — VII — III — VI — II — V — I',
    category: 'sequence',
    categoryNameRu: 'Квинтовая секвенция (Золотая)',
    rootDegree: 'I',
    scaleMode: 'both',
    bassMotionRu: 'Нисходящая квинтовая цепь: I → IV → VII → III → VI → II → V → I',
    sopranoMotionRu: 'Цепное плавное голосоведение через все ступени лада',
    voiceLeadingExplanationRu: 'Фундаментальная гармоническая секвенция европейской музыки (Бах, Вивальди "Времена года", Гендель). Проходит через трезвучия всех семи ступеней лада по нисходящим квинтам и восходящим квартам.',
    usageContextRu: 'Универсальная основа музыкального барокко, классических разработок, романтических тем и джаза.',
    steps: [
      {
        symbol: 'T5/3',
        degreeRoman: 'I',
        nameRu: 'I ступень (Тоника)',
        satbOffsets: [-12, 4, 7, 12],
        voiceDegreesRu: { soprano: 'I ступень', alto: 'V ступень', tenor: 'III ступень', bass: 'I ступень' },
      },
      {
        symbol: 'S5/3',
        degreeRoman: 'IV',
        nameRu: 'IV ступень (Субдоминанта)',
        satbOffsets: [-7, 5, 9, 12],
        voiceDegreesRu: { soprano: 'I ступень', alto: 'VI ступень', tenor: 'IV ступень', bass: 'IV ступень' },
      },
      {
        symbol: 'VII5/3',
        degreeRoman: 'VII',
        nameRu: 'VII ступень (Вводное трезвучие)',
        satbOffsets: [-1, 2, 5, 11],
        voiceDegreesRu: { soprano: 'VII ступень', alto: 'IV ступень', tenor: 'II ступень', bass: 'VII ступень' },
      },
      {
        symbol: 'III5/3',
        degreeRoman: 'III',
        nameRu: 'III ступень (Медианта)',
        satbOffsets: [-8, 4, 7, 11],
        voiceDegreesRu: { soprano: 'VII ступень', alto: 'V ступень', tenor: 'III ступень', bass: 'III ступень' },
      },
      {
        symbol: 'VI5/3',
        degreeRoman: 'VI',
        nameRu: 'VI ступень (Субмедианта)',
        satbOffsets: [-3, 0, 4, 9],
        voiceDegreesRu: { soprano: 'VI ступень', alto: 'III ступень', tenor: 'I ступень', bass: 'VI ступень' },
      },
      {
        symbol: 'II5/3',
        degreeRoman: 'II',
        nameRu: 'II ступень (Супертоника)',
        satbOffsets: [-10, 2, 5, 9],
        voiceDegreesRu: { soprano: 'VI ступень', alto: 'IV ступень', tenor: 'II ступень', bass: 'II ступень' },
      },
      {
        symbol: 'D5/3',
        degreeRoman: 'V',
        nameRu: 'V ступень (Доминанта)',
        satbOffsets: [-5, 2, 7, 11],
        voiceDegreesRu: { soprano: 'VII вводный тон', alto: 'V ступень', tenor: 'II ступень', bass: 'V ступень' },
      },
      {
        symbol: 'T5/3',
        degreeRoman: 'I',
        nameRu: 'I ступень (Итоговая тоника)',
        satbOffsets: [-12, 0, 4, 12],
        voiceDegreesRu: { soprano: 'I ступень', alto: 'III терция', tenor: 'I прима', bass: 'I ступень' },
      },
    ],
  },
];

export interface RealizedProgression {
  template: HarmonicProgressionTemplate;
  tonicNoteName: string;
  tonicPitch: number; // 0..11
  scaleMode: 'major' | 'minor';
  keyNameRu: string;
  revealed?: boolean;
  voiceLeadingValidation?: VoiceLeadingCheckResult;
  steps: {
    symbol: string;
    degreeRoman: string;
    nameRu: string;
    midisSATB: [number, number, number, number]; // [Bass, Tenor, Alto, Soprano]
    noteNamesSATB: [string, string, string, string]; // [Bass, Tenor, Alto, Soprano]
    voiceDegreesRu: {
      soprano: string;
      alto: string;
      tenor: string;
      bass: string;
    };
  }[];
}

export function formatSymbolForMode(symbol: string, mode: 'major' | 'minor'): string {
  let clean = symbol.replace('5/3', '5');
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

/**
 * Generate a realized harmonic progression transposed to given tonic
 */
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

export function realizeProgression(
  templateId?: string,
  preferredTonic: string = 'C',
  preferredMode: 'major' | 'minor' | 'any' = 'major',
  categoryFilter?: 'all' | ProgressionCategory
): RealizedProgression {
  // Resolve tonic pitch
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

  // Filter available templates
  let pool = CLASSICAL_PROGRESSIONS;
  if (categoryFilter && categoryFilter !== 'all') {
    pool = pool.filter((p) => p.category === categoryFilter);
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

  // Base tonic MIDI: anchor around C4 (60)
  const baseTonicMidi = 60 + tonicPitch;

  const realizedSteps = template.steps.map((s) => {
    // For minor mode adjustments if template is 'both' and mode is 'minor':
    const isMinor = effectiveMode === 'minor';
    const satbMidis: [number, number, number, number] = [
      baseTonicMidi + s.satbOffsets[0],
      baseTonicMidi + s.satbOffsets[1],
      baseTonicMidi + s.satbOffsets[2],
      baseTonicMidi + s.satbOffsets[3],
    ];

    // If both mode and in minor: adjust third offsets (semitones 4 -> 3)
    if (isMinor && template.scaleMode === 'both') {
      for (let i = 0; i < 4; i++) {
        const offset = s.satbOffsets[i];
        const pitchClass = (offset % 12 + 12) % 12;
        if (pitchClass === 4) { // Major 3rd -> Minor 3rd
          satbMidis[i] -= 1;
        } else if (pitchClass === 9) { // Major 6th -> Minor 6th (in S6/4)
          satbMidis[i] -= 1;
        }
      }
    }

    const noteNames: [string, string, string, string] = [
      CHROMATIC_NOTES_UP[((satbMidis[0] % 12) + 12) % 12],
      CHROMATIC_NOTES_UP[((satbMidis[1] % 12) + 12) % 12],
      CHROMATIC_NOTES_UP[((satbMidis[2] % 12) + 12) % 12],
      CHROMATIC_NOTES_UP[((satbMidis[3] % 12) + 12) % 12],
    ];

    const formattedSymbol = formatSymbolForMode(s.symbol, effectiveMode);

    return {
      symbol: formattedSymbol,
      degreeRoman: s.degreeRoman,
      nameRu: s.nameRu,
      midisSATB: satbMidis,
      noteNamesSATB: noteNames,
      voiceDegreesRu: s.voiceDegreesRu,
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
