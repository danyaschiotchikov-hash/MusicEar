import { HarmonicProgressionTemplate, ProgressionCategory, ProgressionChordStep } from './harmonicProgressions';

export interface CompactProg {
  id: string;
  name: string;
  formula: string;
  cat: ProgressionCategory;
  mode: 'major' | 'minor' | 'both';
  bass: string[];
  tenor: string[];
  alto: string[];
  sop: string[];
  chords: string[];
  degrees: string[];
  desc: string;
  ctx?: string;
}

// Map category ids to Russian names
const CATEGORY_NAMES_RU: Record<ProgressionCategory, string> = {
  cadential: 'Кадансовые & Базовые',
  passing: 'Проходящие',
  auxiliary: 'Вспомогательные',
  deceptive: 'Прерванные & Фригийские',
  disjunct: 'Со скачками голосов',
  altered: 'Альтерированные (DD, N6, Ув.6)',
  modal: 'Модальные & Обиходные',
  sequence: 'Секвенции',
  ellipsis: 'Эллипсис & Тритоновые',
  modern: 'Современные & Симметричные'
};

// Map chord symbols to Russian names
const CHORD_NAMES_RU: Record<string, string> = {
  'T5/3': 'Тоническое трезвучие',
  't5/3': 'Тоническое минорное трезвучие',
  'S5/3': 'Субдоминантовое трезвучие',
  's5/3': 'Субдоминантовое минорное трезвучие',
  'D5/3': 'Доминантовое трезвучие',
  'd5/3': 'Натуральное доминантовое трезвучие',
  'K6/4': 'Кадансовый квартсекстаккорд',
  'T6': 'Тонический секстаккорд',
  't6': 'Тонический минорный секстаккорд',
  'S6': 'Субдоминантовый секстаккорд',
  's6': 'Субдоминантовый минорный секстаккорд',
  'D6': 'Доминантсекстаккорд',
  'D7': 'Доминантсептаккорд',
  'D7#5': 'Альтерированный доминантсептаккорд с повышенной квинтой',
  'D7-5': 'Альтерированный доминантсептаккорд с пониженной квинтой',
  'II6': 'Секстаккорд II ступени',
  'ii6': 'Минорный секстаккорд II ступени',
  'II7': 'Септаккорд II ступени',
  'ii7': 'Септаккорд II ступени (минорный)',
  'II6/5': 'Квинтсекстаккорд II ступени',
  'ii6/5': 'Квинтсекстаккорд II ступени (минорный)',
  'II4/3': 'Терцквартаккорд II ступени',
  'ii4/3': 'Терцквартаккорд II ступени (минорный)',
  'II2': 'Секундаккорд II ступени',
  'ii2': 'Секундаккорд II ступени (минорный)',
  'D6/5': 'Доминантквинтсекстаккорд',
  'D6/4': 'Проходящий квартсекстаккорд',
  'S6/4': 'Субдоминантовый квартсекстаккорд',
  'T6/4': 'Тонический квартсекстаккорд',
  'D4/3': 'Доминанттерцквартаккорд',
  'D2': 'Доминантсекундаккорд',
  'VII6': 'Секстаккорд VII ступени',
  'VII7ум': 'Вводный уменьшенный септаккорд',
  'vii7ум': 'Вводный уменьшенный септаккорд',
  'VII6/5ум': 'Вводный уменьшенный квинтсекстаккорд',
  'vii6/5ум': 'Вводный уменьшенный квинтсекстаккорд',
  'VII4/3ум': 'Вводный уменьшенный терцквартаккорд',
  'vii4/3ум': 'Вводный уменьшенный терцквартаккорд',
  'VII2ум': 'Вводный уменьшенный секундаккорд',
  'vii2ум': 'Вводный уменьшенный секундаккорд',
  'N6': 'Неаполитанский секстаккорд',
  'It+6': 'Итальянский секстаккорд',
  'Fr+6': 'Французский терцквартаккорд',
  'Ger+6': 'Немецкий квинтсекстаккорд',
  '♭VI': 'Мажорное трезвучие низкой VI ступени',
  'bVI': 'Мажорное трезвучие низкой VI ступени',
  '♭II7': 'Тритоновая замена',
  '♭VI7': 'Тритоновая замена двойной доминанты',
  'III6': 'Доминантовый секстаккорд с секстой',
  'IV6': 'Субдоминантовый секстаккорд'
};

const BASS_MOTION_GLOSSARY: Record<ProgressionCategory, string> = {
  cadential: 'Кадансовый бас движется по главным ступеням лада (I, IV, V).',
  passing: 'Бас движется плавно, поступенно (проходящее движение по ступеням лада).',
  auxiliary: 'Бас удерживается на месте (органы-педаль) или совершает мягкие колебания.',
  deceptive: 'Бас совершает неожиданное прерванное движение (обычно V → VI или V → bVI).',
  disjunct: 'Бас движется по главным ступеням, пока средние голоса совершают скачки.',
  altered: 'Бас движется с использованием пониженных или повышенных ступеней (bVI, #IV).',
  modal: 'Бас отражает старинные диатонические лады без обостренного вводного тона.',
  sequence: 'Бас движется регулярными звеньями (секвенциями) вниз или вверх.',
  ellipsis: 'Бас движется нетрадиционно, совершая эллиптические прыжки и тритоновые сдвиги.',
  modern: 'Бас движется по симметричным интервальным структурам (целые тоны, малые терции).'
};

const SOPRANO_MOTION_GLOSSARY: Record<ProgressionCategory, string> = {
  cadential: 'Мелодия плавно разрешается в устойчивый тонический тон.',
  passing: 'Сопрано движется в противоположном басу направлении (противодвижение).',
  auxiliary: 'Сопрано совершает мягкое вспомогательное опевание устойчивых тонов.',
  deceptive: 'Сопрано держит общий тон или разрешается в субдоминанту/медианту.',
  disjunct: 'Сопрано совершает широкие выразительные скачки на консонирующие интервалы.',
  altered: 'Сопрано обогащено яркими полутоновыми хроматическими ходами.',
  modal: 'Сопрано использует характерные ладовые ступени (дорийскую сексту, фригийскую секунду).',
  sequence: 'Сопрано повторяет мотив звеньями на разные высоты.',
  ellipsis: 'Сопрано движется экспрессивно по полутонам или совершает эллиптические сдвиги.',
  modern: 'Сопрано движется по симметричным структурам, создавая новые звуковые плоскости.'
};

function parseNoteToOffset(note: string): number {
  const noteMap: Record<string, number> = {
    'c': 0, 'd': 2, 'e': 4, 'f': 5, 'g': 7, 'a': 9, 'h': 11, 'b': 10
  };
  
  const isUpper = note[0] === note[0].toUpperCase();
  const baseChar = note[0].toLowerCase();
  
  let pitch = noteMap[baseChar] ?? 0;
  let rest = note.slice(1);
  let alteration = 0;
  
  if (rest.startsWith('is') || rest.startsWith('#')) {
    alteration = 1;
    rest = rest.startsWith('is') ? rest.slice(2) : rest.slice(1);
  } else if (
    note.toLowerCase().startsWith('es') || 
    note.toLowerCase().startsWith('as') || 
    note.toLowerCase().startsWith('des') || 
    note.toLowerCase().startsWith('ges') || 
    note.toLowerCase().startsWith('ces') || 
    note.toLowerCase().startsWith('fes') || 
    rest.startsWith('b') || 
    rest.startsWith('♭')
  ) {
    alteration = -1;
    if (note.toLowerCase().startsWith('des') || note.toLowerCase().startsWith('ges') || note.toLowerCase().startsWith('ces') || note.toLowerCase().startsWith('fes')) {
      rest = note.slice(3);
    } else if (note.toLowerCase().startsWith('es') || note.toLowerCase().startsWith('as')) {
      rest = note.slice(2);
    } else {
      rest = rest.startsWith('b') || rest.startsWith('♭') ? rest.slice(1) : rest;
    }
  }
  
  let octave = 4; // default is small octave
  if (isUpper) {
    octave = 3; // Great octave
  }
  
  if (rest.includes('1')) octave = 5; // First octave
  else if (rest.includes('2')) octave = 6; // Second octave
  else if (rest.includes('3')) octave = 7; // Third octave
  
  const absoluteMidi = octave * 12 + pitch + alteration;
  return absoluteMidi - 60; // offset relative to C1 (midi 60)
}

function getVoiceDegreeText(offset: number, originalTonicPC: number): string {
  const notePC = ((offset % 12) + 12) % 12;
  const degreePC = (notePC - originalTonicPC + 12) % 12;
  
  const degreeNames: Record<number, string> = {
    0: 'I ступень',
    1: '♭II ступень',
    2: 'II ступень',
    3: '♭III ступень',
    4: 'III ступень',
    5: 'IV ступень',
    6: '♯IV ступень',
    7: 'V ступень',
    8: '♭VI ступень',
    9: 'VI ступень',
    10: '♭VII ступень',
    11: 'VII ступень'
  };
  
  const noteNames: Record<number, string> = {
    0: 'До',
    1: 'Ре-бемоль',
    2: 'Ре',
    3: 'Ми-бемоль',
    4: 'Ми',
    5: 'Фа',
    6: 'Фа-диез',
    7: 'Соль',
    8: 'Ля-бемоль',
    9: 'Ля',
    10: 'Си-бемоль',
    11: 'Си'
  };
  
  const degName = degreeNames[degreePC] ?? `${degreePC} ступень`;
  const noteName = noteNames[notePC] ?? `${notePC} полутон`;
  
  return `${degName} (${noteName})`;
}

// 148 ENCYCLOPEDIC PROGRESSIONS (THE MATRIX DATABASE)
export const RAW_ENCYCLOPEDIA_PROGRESSIONS: CompactProg[] = [
  // =========================================================================
  // РАЗДЕЛ 1. БАЗОВЫЕ ФУНКЦИОНАЛЬНЫЕ КРУГООБОРОТЫ И КАДЕНЦИИ (1-23)
  // =========================================================================
  {
    id: 'prog_enc_1',
    name: 'Полный автентический кругооборот 1-го рода (Тесное, мел. пол. 1) [#1]',
    formula: 'T — S — D — T',
    cat: 'cadential',
    mode: 'both',
    bass: ['c', 'F', 'G', 'c'],
    tenor: ['e', 'f', 'd', 'c'],
    alto: ['g', 'a', 'g', 'e'],
    sop: ['c1', 'c1', 'h', 'c1'],
    chords: ['T5/3', 'S5/3', 'D5/3', 'T5/3'],
    degrees: ['I', 'IV', 'V', 'I'],
    desc: 'Классическое тесное расположение. Плавное голосоведение с сохранением общего тона (До) в альте при переходе T-S.'
  },
  {
    id: 'prog_enc_2',
    name: 'Полный автентический кругооборот 1-го рода (Тесное, мел. пол. 3) [#2]',
    formula: 'T — S — D — T',
    cat: 'cadential',
    mode: 'both',
    bass: ['c', 'f', 'g', 'c'],
    tenor: ['g', 'a', 'g', 'g'],
    alto: ['c1', 'c1', 'h', 'c1'],
    sop: ['e1', 'f1', 'd1', 'e1'],
    chords: ['T5/3', 'S5/3', 'D5/3', 'T5/3'],
    degrees: ['I', 'IV', 'V', 'I'],
    desc: 'Тесное расположение, мелодическое положение терции. Сопрано и бас совершают красивое параллельное движение.'
  },
  {
    id: 'prog_enc_3',
    name: 'Полный автентический кругооборот 1-го рода (Тесное, мел. пол. 5) [#3]',
    formula: 'T — S — D — T',
    cat: 'cadential',
    mode: 'both',
    bass: ['c', 'f', 'g', 'c'],
    tenor: ['c1', 'c1', 'h', 'c1'],
    alto: ['e1', 'f1', 'd1', 'e1'],
    sop: ['g1', 'a1', 'g1', 'g1'],
    chords: ['T5/3', 'S5/3', 'D5/3', 'T5/3'],
    degrees: ['I', 'IV', 'V', 'I'],
    desc: 'Тесное расположение, мелодическое положение квинты. Оптимальное голосоведение для кантиленного пения.'
  },
  {
    id: 'prog_enc_4',
    name: 'Полный автентический кругооборот 1-го рода (Широкое, мел. пол. 1) [#4]',
    formula: 'T — S — D — T',
    cat: 'cadential',
    mode: 'both',
    bass: ['c', 'f', 'g', 'c'],
    tenor: ['g', 'a', 'g', 'g'],
    alto: ['e1', 'f1', 'd1', 'e1'],
    sop: ['c2', 'c2', 'h1', 'c2'],
    chords: ['T5/3', 'S5/3', 'D5/3', 'T5/3'],
    degrees: ['I', 'IV', 'V', 'I'],
    desc: 'Классическое широкое расположение с удвоением основного тона во всех аккордах.'
  },
  {
    id: 'prog_enc_5',
    name: 'Полный автентический кругооборот 1-го рода (Широкое, мел. пол. 3) [#5]',
    formula: 'T — S — D — T',
    cat: 'cadential',
    mode: 'both',
    bass: ['C', 'F', 'G', 'C'],
    tenor: ['g', 'a', 'g', 'g'],
    alto: ['c1', 'c1', 'h', 'c1'],
    sop: ['e1', 'f1', 'd1', 'e1'],
    chords: ['T5/3', 'S5/3', 'D5/3', 'T5/3'],
    degrees: ['I', 'IV', 'V', 'I'],
    desc: 'Широкое расположение, сопрано начинает с терцового тона. Воздушная фактура.'
  },
  {
    id: 'prog_enc_6',
    name: 'Полный автентический кругооборот 1-го рода (Широкое, мел. пол. 5) [#6]',
    formula: 'T — S — D — T',
    cat: 'cadential',
    mode: 'both',
    bass: ['c', 'F', 'G', 'c'],
    tenor: ['e', 'f', 'd', 'c'],
    alto: ['c1', 'c1', 'h', 'c1'],
    sop: ['g1', 'a1', 'g1', 'e1'],
    chords: ['T5/3', 'S5/3', 'D5/3', 'T5/3'],
    degrees: ['I', 'IV', 'V', 'I'],
    desc: 'Широкое расположение с мелодическим положением квинты, переходящей в терцию в конце.'
  },
  {
    id: 'prog_enc_7',
    name: 'Автентический оборот 2-го рода (Прима II6 в сопрано) [#7]',
    formula: 'T — II6 — K6/4 — D7 — T',
    cat: 'cadential',
    mode: 'both',
    bass: ['C', 'F', 'G', 'G', 'C'],
    tenor: ['e', 'd', 'e', 'd', 'c'],
    alto: ['g', 'a', 'g', 'f', 'e'],
    sop: ['c1', 'd1', 'c1', 'h', 'c1'],
    chords: ['T5/3', 'II6', 'K6/4', 'D7', 'T5/3'],
    degrees: ['I', 'II', 'I', 'V', 'I'],
    desc: 'Оборот 2-го рода. Использование II6 подготавливает кадансовое напряжение.'
  },
  {
    id: 'prog_enc_8',
    name: 'Автентический оборот 2-го рода (Терция II6 в сопрано) [#8]',
    formula: 'T — II6 — K6/4 — D7 — T',
    cat: 'cadential',
    mode: 'both',
    bass: ['C', 'F', 'G', 'G', 'C'],
    tenor: ['g', 'd', 'e', 'd', 'c'],
    alto: ['c1', 'a', 'c1', 'h', 'c1'],
    sop: ['e1', 'f1', 'e1', 'f1', 'e1'],
    chords: ['T5/3', 'II6', 'K6/4', 'D7', 'T5/3'],
    degrees: ['I', 'II', 'I', 'V', 'I'],
    desc: 'В сопрано терцовый тон субдоминанты совершает красивое кадансовое разрешение.'
  },
  {
    id: 'prog_enc_9',
    name: 'Автентический оборот 2-го рода (Септима II6 в сопрано) [#9]',
    formula: 'T — II6 — K6/4 — D7 — T',
    cat: 'cadential',
    mode: 'both',
    bass: ['c','f','g','g','c'],
    tenor: ['g','a','g','g','g'],
    alto: ['c1','a','c1','h','g'],
    sop: ['e1','c1','e1','f1','e1'],
    chords: ['T5/3', 'II6', 'K6/4', 'D7', 'T5/3'],
    degrees: ['I', 'II', 'I', 'V', 'I'],
    desc: 'Высокое светлое расположение с удержанием общего звука Си в сопрано на доминанте.'
  },
  {
    id: 'prog_enc_10',
    name: 'Автентический оборот 2-го рода с IV5/3 [#10]',
    formula: 'T — IV — K6/4 — D7 — T',
    cat: 'cadential',
    mode: 'both',
    bass: ['C', 'F', 'G', 'G', 'C'],
    tenor: ['e', 'f', 'e', 'd', 'c'],
    alto: ['g', 'a', 'g', 'f', 'e'],
    sop: ['c1', 'c1', 'c1', 'h', 'c1'],
    chords: ['T5/3', 'S5/3', 'K6/4', 'D7', 'T5/3'],
    degrees: ['I', 'IV', 'I', 'V', 'I'],
    desc: 'Классический полный оборот с использованием чистого трезвучия IV ступени перед K6/4.'
  },
  {
    id: 'prog_enc_11',
    name: 'Простой автентический оборот (гармонический) [#11]',
    formula: 'T — D5/3 — T',
    cat: 'cadential',
    mode: 'both',
    bass: ['c', 'g', 'c'],
    tenor: ['g', 'g', 'g'],
    alto: ['c1', 'h', 'c1'],
    sop: ['e1', 'd1', 'e1'],
    chords: ['T5/3', 'D5/3', 'T5/3'],
    degrees: ['I', 'V', 'I'],
    desc: 'Минимальный гармонический оборот. Доминанта плавно разрешается в тонику.'
  },
  {
    id: 'prog_enc_12',
    name: 'Простой автентический оборот (мелодический) [#12]',
    formula: 'T — D5/3 — T (мелодическое голосоведение)',
    cat: 'cadential',
    mode: 'both',
    bass: ['c', 'G', 'c'],
    tenor: ['e', 'g', 'e'],
    alto: ['g', 'h', 'c1'],
    sop: ['c1', 'd1', 'c1'],
    chords: ['T5/3', 'D5/3', 'T5/3'],
    degrees: ['I', 'V', 'I'],
    desc: 'Мелодическая связь аккордов со скачком квинты в альте.'
  },
  {
    id: 'prog_enc_13',
    name: 'Автентический оборот с полным D7 [#13]',
    formula: 'T — D7 — T (неполный)',
    cat: 'cadential',
    mode: 'both',
    bass: ['C', 'G', 'C'],
    tenor: ['e', 'd', 'c'],
    alto: ['g', 'f', 'e'],
    sop: ['c1', 'h', 'c1'],
    chords: ['T5/3', 'D7', 'T5/3'],
    degrees: ['I', 'V', 'I'],
    desc: 'Полный доминантсептаккорд разрешается в неполное тоническое трезвучие с утроенной примой.'
  },
  {
    id: 'prog_enc_14',
    name: 'Автентический оборот с неполным D7 [#14]',
    formula: 'T — D7 (неполный) — T (полный)',
    cat: 'cadential',
    mode: 'both',
    bass: ['c', 'g', 'c'],
    tenor: ['g', 'g', 'g'],
    alto: ['c1', 'h', 'c1'],
    sop: ['e1', 'f1', 'e1'],
    chords: ['T5/3', 'D7', 'T5/3'],
    degrees: ['I', 'V', 'I'],
    desc: 'Неполный D7 (без квинты) разрешается в полное тоническое трезвучие.'
  },
  {
    id: 'prog_enc_15',
    name: 'Простой плагальный оборот (I - IV - I) [#15]',
    formula: 'T — S5/3 — T',
    cat: 'cadential',
    mode: 'both',
    bass: ['c', 'F', 'c'],
    tenor: ['e', 'f', 'e'],
    alto: ['g', 'a', 'g'],
    sop: ['c1', 'c1', 'c1'],
    chords: ['T5/3', 'S5/3', 'T5/3'],
    degrees: ['I', 'IV', 'I'],
    desc: 'Плагальный оборот со статичным общим тоном (До) в сопрано.'
  },
  {
    id: 'prog_enc_16',
    name: 'Плагальный оборот с II6 [#16]',
    formula: 'T — II6 — T',
    cat: 'cadential',
    mode: 'both',
    bass: ['c', 'f', 'c'],
    tenor: ['g', 'a', 'g'],
    alto: ['c1', 'c1', 'c1'],
    sop: ['e1', 'd1', 'e1'],
    chords: ['T5/3', 'II6', 'T5/3'],
    degrees: ['I', 'II', 'I'],
    desc: 'Мягкое плагальное движение с шагом сопрано на секунду вниз к приме II ступени.'
  },
  {
    id: 'prog_enc_17',
    name: 'Плагальный оборот с субдоминантсептаккордом (II6/5) [#17]',
    formula: 'T — II6/5 — T',
    cat: 'cadential',
    mode: 'both',
    bass: ['c', 'f', 'c'],
    tenor: ['e1', 'f1', 'e1'],
    alto: ['g1', 'a1', 'g1'],
    sop: ['c2', 'c2', 'c2'],
    chords: ['T5/3', 'II6/5', 'T5/3'],
    degrees: ['I', 'II', 'I'],
    desc: 'Использование субдоминанты с добавленной секстой (II6/5) создает пышный колорит.'
  },
  {
    id: 'prog_enc_18',
    name: 'Сложный плагальный оборот (I - IV - II6 - I) [#18]',
    formula: 'T — IV — II6 — T',
    cat: 'cadential',
    mode: 'both',
    bass: ['c', 'F', 'f', 'c'],
    tenor: ['c1', 'c1', 'a', 'c1'],
    alto: ['e1', 'f1', 'd1', 'e1'],
    sop: ['g1', 'a1', 'f1', 'g1'],
    chords: ['T5/3', 'S5/3', 'II6', 'T5/3'],
    degrees: ['I', 'IV', 'II', 'I'],
    desc: 'Постепенное усложнение плагального напряжения от чистой S к II6.'
  },
  {
    id: 'prog_enc_19',
    name: 'Половинная автентическая простая каденция [#19]',
    formula: 'T — D5/3 (Остановка)',
    cat: 'cadential',
    mode: 'both',
    bass: ['c', 'G'],
    tenor: ['e', 'd'],
    alto: ['g', 'g'],
    sop: ['c1', 'h'],
    chords: ['T5/3', 'D5/3'],
    degrees: ['I', 'V'],
    desc: 'Половинное кадансовое завершение на доминанте.'
  },
  {
    id: 'prog_enc_20',
    name: 'Половинная автентическая каденция 1-го рода (IV - V) [#20]',
    formula: 'IV — V',
    cat: 'cadential',
    mode: 'both',
    bass: ['F', 'G'],
    tenor: ['f', 'd'],
    alto: ['a', 'g'],
    sop: ['c1', 'h'],
    chords: ['S5/3', 'D5/3'],
    degrees: ['IV', 'V'],
    desc: 'Драматический полукаданс, завершающий предложение на неустойчивой гармонии.'
  },
  {
    id: 'prog_enc_21',
    name: 'Половинная автентическая каденция 2-го рода (II6 - V) [#21]',
    formula: 'II6 — V',
    cat: 'cadential',
    mode: 'both',
    bass: ['F', 'G'],
    tenor: ['f', 'd'],
    alto: ['a', 'h'],
    sop: ['d1', 'd1'],
    chords: ['II6', 'D5/3'],
    degrees: ['II', 'V'],
    desc: 'Удерживание II ступени в сопрано при переходе к доминанте.'
  },
  {
    id: 'prog_enc_22',
    name: 'Половинная каденция с K6/4 [#22]',
    formula: 'T — IV — K6/4 — V',
    cat: 'cadential',
    mode: 'both',
    bass: ['C', 'F', 'G', 'G'],
    tenor: ['e', 'f', 'e', 'd'],
    alto: ['g', 'a', 'g', 'g'],
    sop: ['c1', 'c1', 'c1', 'h'],
    chords: ['T5/3', 'S5/3', 'K6/4', 'D5/3'],
    degrees: ['I', 'IV', 'I', 'V'],
    desc: 'Классическое торможение каденции на доминанте через кадансовый квартсекстаккорд.'
  },
  {
    id: 'prog_enc_23',
    name: 'Половинная плагальная каденция [#23]',
    formula: 'T — S5/3 (Остановка)',
    cat: 'cadential',
    mode: 'both',
    bass: ['c', 'f'],
    tenor: ['g', 'a'],
    alto: ['c1', 'c1'],
    sop: ['e1', 'f1'],
    chords: ['T5/3', 'S5/3'],
    degrees: ['I', 'IV'],
    desc: 'Завершение музыкального построения на мягком субдоминантовом созвучии.'
  },

  // =========================================================================
  // РАЗДЕЛ 2. ПРОХОДЯЩИЕ ОБОРОТЫ И ЦЕПИ (24-40)
  // =========================================================================
  {
    id: 'prog_enc_24',
    name: 'Прямой проходящий оборот с V6/4 [#24]',
    formula: 'T — D6/4 — T6',
    cat: 'passing',
    mode: 'both',
    bass: ['c', 'd', 'e'],
    tenor: ['g', 'g', 'g'],
    alto: ['c1', 'h', 'c1'],
    sop: ['e1', 'd1', 'c1'],
    chords: ['T5/3', 'D6/4', 'T6'],
    degrees: ['I', 'V', 'I'],
    desc: 'Классический проходящий оборот. В басу восходящий тетрахорд, в сопрано нисходящий противоход.'
  },
  {
    id: 'prog_enc_25',
    name: 'Ракоходный проходящий оборот с V6/4 [#25]',
    formula: 'T6 — D6/4 — T',
    cat: 'passing',
    mode: 'both',
    bass: ['e', 'd', 'c'],
    tenor: ['g', 'g', 'g'],
    alto: ['c1', 'h', 'c1'],
    sop: ['c1', 'd1', 'e1'],
    chords: ['T6', 'D6/4', 'T5/3'],
    degrees: ['I', 'V', 'I'],
    desc: 'Обратное движение проходящего оборота от секстаккорда к трезвучию.'
  },
  {
    id: 'prog_enc_26',
    name: 'Прямой проходящий оборот с I6/4 (IV - I6/4 - IV6) [#26]',
    formula: 'IV — T6/4 — IV6',
    cat: 'passing',
    mode: 'both',
    bass: ['f', 'g', 'a'],
    tenor: ['c1', 'c1', 'c1'],
    alto: ['f1', 'e1', 'f1'],
    sop: ['a1', 'g1', 'f1'],
    chords: ['S5/3', 'T6/4', 'S6'],
    degrees: ['IV', 'I', 'IV'],
    desc: 'Проходящий тонический квартсекстаккорд связывает субдоминантовые функции.'
  },
  {
    id: 'prog_enc_27',
    name: 'Ракоходный проходящий оборот с I6/4 (IV6 - I6/4 - IV) [#27]',
    formula: 'IV6 — T6/4 — IV',
    cat: 'passing',
    mode: 'both',
    bass: ['A', 'G', 'F'],
    tenor: ['f', 'e', 'f'],
    alto: ['c1', 'c1', 'c1'],
    sop: ['f1', 'g1', 'a1'],
    chords: ['S6', 'T6/4', 'S5/3'],
    degrees: ['IV', 'I', 'IV'],
    desc: 'Нисходящий бас в проходящем субдоминантовом обороте.'
  },
  {
    id: 'prog_enc_28',
    name: 'Децимовый проходящий оборот с D4/3 (I - D4/3 - I6) [#28]',
    formula: 'T — D4/3 — T6',
    cat: 'passing',
    mode: 'both',
    bass: ['c', 'd', 'e'],
    tenor: ['g', 'g', 'g'],
    alto: ['c1', 'h', 'c1'],
    sop: ['e1', 'f1', 'g1'],
    chords: ['T5/3', 'D4/3', 'T6'],
    degrees: ['I', 'V', 'I'],
    desc: 'Параллельный ход децим между басом и сопрано через терцквартаккорд.'
  },
  {
    id: 'prog_enc_29',
    name: 'Ракоходный децимовый оборот с D4/3 [#29]',
    formula: 'T6 — D4/3 — T',
    cat: 'passing',
    mode: 'both',
    bass: ['e', 'd', 'c'],
    tenor: ['g', 'g', 'g'],
    alto: ['c1', 'h', 'c1'],
    sop: ['g1', 'f1', 'e1'],
    chords: ['T6', 'D4/3', 'T5/3'],
    degrees: ['I', 'V', 'I'],
    desc: 'Нисходящее децимовое движение голосов.'
  },
  {
    id: 'prog_enc_30',
    name: 'Оборот с обменом голосов через D4/3 [#30]',
    formula: 'T — D4/3 — T6 (Обмен голосов)',
    cat: 'passing',
    mode: 'both',
    bass: ['c', 'd', 'e'],
    tenor: ['g', 'f', 'e'],
    alto: ['c1', 'h', 'g'],
    sop: ['e1', 'd1', 'c1'],
    chords: ['T5/3', 'D4/3', 'T6'],
    degrees: ['I', 'V', 'I'],
    desc: 'Голоса обмениваются своими тонами (До-Ми и Ми-До) при симметричном прохождении.'
  },
  {
    id: 'prog_enc_31',
    name: 'Восходящий оборот с VII6 [#31]',
    formula: 'T — VII6 — T6',
    cat: 'passing',
    mode: 'both',
    bass: ['c', 'd', 'e'],
    tenor: ['g', 'f', 'e'],
    alto: ['c1', 'h', 'c1'],
    sop: ['e1', 'f1', 'g1'],
    chords: ['T5/3', 'VII6', 'T6'],
    degrees: ['I', 'VII', 'I'],
    desc: 'Использование слабого диссонирующего VII6 создает мягкое поступательное движение.'
  },
  {
    id: 'prog_enc_32',
    name: 'Нисходящий оборот с VII6 [#32]',
    formula: 'T6 — VII6 — T',
    cat: 'passing',
    mode: 'both',
    bass: ['e', 'd', 'c'],
    tenor: ['e', 'f', 'g'],
    alto: ['c1', 'h', 'c1'],
    sop: ['g1', 'f1', 'e1'],
    chords: ['T6', 'VII6', 'T5/3'],
    degrees: ['I', 'VII', 'I'],
    desc: 'Проходящий оборот с плавным спадом звучности.'
  },
  {
    id: 'prog_enc_33',
    name: 'Проходящий VI6/4 [#33]',
    formula: 'II — VI6/4 — II6',
    cat: 'passing',
    mode: 'both',
    bass: ['d', 'e', 'f'],
    tenor: ['a', 'a', 'a'],
    alto: ['d1', 'c1', 'a'],
    sop: ['f1', 'e1', 'd1'],
    chords: ['II5/3', 'T6/4', 'II6'],
    degrees: ['II', 'I', 'II'],
    desc: 'Тоника в положении квартсекстаккорда как проходящая между аккордами II ступени.'
  },
  {
    id: 'prog_enc_34',
    name: 'Проходящий I6 между аккордами II ступени [#34]',
    formula: 'II — I6 — II6',
    cat: 'passing',
    mode: 'both',
    bass: ['d', 'e', 'f'],
    tenor: ['a', 'g', 'f'],
    alto: ['d1', 'c1', 'a'],
    sop: ['f1', 'e1', 'd1'],
    chords: ['II5/3', 'T6', 'II6'],
    degrees: ['II', 'I', 'II'],
    desc: 'Использование секстаккорда тоники для связи субдоминантовых созвучий.'
  },
  {
    id: 'prog_enc_35',
    name: 'Проходящий I6 в нисходящем обороте IV6 - I6 - II [#35]',
    formula: 'IV6 — T6 — II',
    cat: 'passing',
    mode: 'both',
    bass: ['a','g','f'],
    tenor: ['c1','c1','a'],
    alto: ['f1','e1','d1'],
    sop: ['a1','c2','d2'],
    chords: ['S6', 'T6', 'II5/3'],
    degrees: ['IV', 'I', 'II'],
    desc: 'Хроматически богатое нисходящее движение.'
  },
  {
    id: 'prog_enc_36',
    name: 'Цепь D7 - II6/4 - D6/5 [#36]',
    formula: 'D7 — II6/4 — D6/5',
    cat: 'passing',
    mode: 'both',
    bass: ['G', 'A', 'H'],
    tenor: ['h', 'a', 'g'],
    alto: ['d1', 'c1', 'd1'],
    sop: ['f1', 'f1', 'f1'],
    chords: ['D7', 'II6/4', 'D6/5'],
    degrees: ['V', 'II', 'V'],
    desc: 'Сложное проходящее последование доминантовых обращений.'
  },
  {
    id: 'prog_enc_37',
    name: 'Цепь D6/5 - IV6/4 - D4/3 [#37]',
    formula: 'D6/5 — IV6/4 — D4/3',
    cat: 'passing',
    mode: 'both',
    bass: ['H', 'c', 'd'],
    tenor: ['f', 'f', 'f'],
    alto: ['d1', 'c1', 'h'],
    sop: ['g1', 'a1', 'g1'],
    chords: ['D6/5', 'S6/4', 'D4/3'],
    degrees: ['V', 'IV', 'V'],
    desc: 'Голоса плавно струятся по ступеням лада, образуя проходящую цепочку.'
  },
  {
    id: 'prog_enc_38',
    name: 'Цепь D4/3 - I - D2 [#38]',
    formula: 'D4/3 — T — D2',
    cat: 'passing',
    mode: 'both',
    bass: ['d', 'c', 'f'],
    tenor: ['g', 'g', 'g'],
    alto: ['h', 'c1', 'h'],
    sop: ['f1', 'e1', 'd1'],
    chords: ['D4/3', 'T5/3', 'D2'],
    degrees: ['V', 'I', 'V'],
    desc: 'Плавное кадансовое сползание доминантсептаккорда к секундаккорду.'
  },
  {
    id: 'prog_enc_39',
    name: 'Фригийский оборот 1-го рода (в басу) [#39]',
    formula: 't — d6 — s6 — D5/3',
    cat: 'passing',
    mode: 'minor',
    bass: ['A','G','F','E'],
    tenor: ['e','e','f','gis'],
    alto: ['c1','h','a','h'],
    sop: ['e1','e1','a1','gis1'],
    chords: ['t5/3', 'd6', 's6', 'D5/3'],
    degrees: ['I', 'V', 'IV', 'V'],
    desc: 'Канонический фригийский оборот по натуральному нисходящему тетрахорду в басу.'
  },
  {
    id: 'prog_enc_40',
    name: 'Фригийский оборот 2-го рода (в сопрано) [#40]',
    formula: 't — d6 — s6 — D5/3 (мелодия в сопрано)',
    cat: 'passing',
    mode: 'minor',
    bass: ['A','C','D','E'],
    tenor: ['c1','c1','a','gis'],
    alto: ['e1','e1','f1','e1'],
    sop: ['a1','g1','f1','gis1'],
    chords: ['t5/3', 'd6', 's6', 'D5/3'],
    degrees: ['I', 'V', 'IV', 'V'],
    desc: 'Натуральный нисходящий фригийский тетрахорд расположен в сопрано.'
  },

  // =========================================================================
  // РАЗДЕЛ 3. ВСПОМОГАТЕЛЬНЫЕ ОБОРОТЫ (41-51)
  // =========================================================================
  {
    id: 'prog_enc_41',
    name: 'Вспомогательный субдоминантовый квартсекстаккорд (пол. 5) [#41]',
    formula: 'T — S6/4 — T',
    cat: 'auxiliary',
    mode: 'both',
    bass: ['c', 'c', 'c'],
    tenor: ['c1', 'c1', 'c1'],
    alto: ['e1', 'f1', 'e1'],
    sop: ['g1', 'a1', 'g1'],
    chords: ['T5/3', 'S6/4', 'T5/3'],
    degrees: ['I', 'IV', 'I'],
    desc: 'Вспомогательное опевание на выдержанной тонической педали. Мелодическое положение квинты.'
  },
  {
    id: 'prog_enc_42',
    name: 'Вспомогательный субдоминантовый квартсекстаккорд (пол. 3) [#42]',
    formula: 'T — S6/4 — T',
    cat: 'auxiliary',
    mode: 'both',
    bass: ['c', 'c', 'c'],
    tenor: ['g', 'a', 'g'],
    alto: ['c1', 'c1', 'c1'],
    sop: ['e1', 'f1', 'e1'],
    chords: ['T5/3', 'S6/4', 'T5/3'],
    degrees: ['I', 'IV', 'I'],
    desc: 'Вспомогательное плагальное раскачивание фактуры. Положение терции.'
  },
  {
    id: 'prog_enc_43',
    name: 'Вспомогательный субдоминантовый квартсекстаккорд (пол. 1) [#43]',
    formula: 'T — S6/4 — T',
    cat: 'auxiliary',
    mode: 'both',
    bass: ['c', 'c', 'c'],
    tenor: ['e1', 'f1', 'e1'],
    alto: ['g1', 'a1', 'g1'],
    sop: ['c2', 'c2', 'c2'],
    chords: ['T5/3', 'S6/4', 'T5/3'],
    degrees: ['I', 'IV', 'I'],
    desc: 'Высокое светлое положение примы тоники.'
  },
  {
    id: 'prog_enc_44',
    name: 'Вспомогательный тонический квартсекстаккорд на доминанте (опевание VII ступени) [#44]',
    formula: 'D — T6/4 — D',
    cat: 'auxiliary',
    mode: 'both',
    bass: ['g', 'g', 'g'],
    tenor: ['g', 'g', 'g'],
    alto: ['d1', 'e1', 'd1'],
    sop: ['h1', 'c2', 'h1'],
    chords: ['D5/3', 'T6/4', 'D5/3'],
    degrees: ['V', 'I', 'V'],
    desc: 'Вспомогательный квартсекстаккорд тоники на доминантовой педали баса.'
  },
  {
    id: 'prog_enc_45',
    name: 'Вспомогательный тонический квартсекстаккорд на доминанте (опевание квинты) [#45]',
    formula: 'D — T6/4 — D',
    cat: 'auxiliary',
    mode: 'both',
    bass: ['G', 'G', 'G'],
    tenor: ['g', 'g', 'g'],
    alto: ['h', 'c1', 'h'],
    sop: ['d1', 'e1', 'd1'],
    chords: ['D5/3', 'T6/4', 'D5/3'],
    degrees: ['V', 'I', 'V'],
    desc: 'Педаль баса и альта удерживает стержень доминанты.'
  },
  {
    id: 'prog_enc_46',
    name: 'Вспомогательный тонический квартсекстаккорд на доминанте (педаль примы) [#46]',
    formula: 'D — T6/4 — D',
    cat: 'auxiliary',
    mode: 'both',
    bass: ['g', 'g', 'g'],
    tenor: ['h', 'c1', 'h'],
    alto: ['d1', 'e1', 'd1'],
    sop: ['g1', 'g1', 'g1'],
    chords: ['D5/3', 'T6/4', 'D5/3'],
    degrees: ['V', 'I', 'V'],
    desc: 'Статичный верхний голос на пятой ступени при вспомогательном опевании средних.'
  },
  {
    id: 'prog_enc_47',
    name: 'Вспомогательный D6/5 [#47]',
    formula: 'T — D6/5 — T',
    cat: 'auxiliary',
    mode: 'both',
    bass: ['C', 'H', 'C'],
    tenor: ['g', 'g', 'g'],
    alto: ['c1', 'd1', 'c1'],
    sop: ['e1', 'f1', 'e1'],
    chords: ['T5/3', 'D6/5', 'T5/3'],
    degrees: ['I', 'V', 'I'],
    desc: 'Вспомогательное движение баса на полутон вниз (До - Си - До) с обострением автентичности.'
  },
  {
    id: 'prog_enc_48',
    name: 'Вспомогательный секундаккорд тоники (I6 - D2 - I6) [#48]',
    formula: 'T6 — D2 — T6',
    cat: 'auxiliary',
    mode: 'both',
    bass: ['e', 'f', 'e'],
    tenor: ['c1', 'd1', 'c1'],
    alto: ['g1', 'g1', 'g1'],
    sop: ['c2', 'h1', 'c2'],
    chords: ['T6', 'D2', 'T6'],
    degrees: ['I', 'V', 'I'],
    desc: 'Оборот в секстаккордах с диссонирующим секундаккордом в центре.'
  },
  {
    id: 'prog_enc_49',
    name: 'Вспомогательный II2 на органном пункте тоники [#49]',
    formula: 'T — II2 — T',
    cat: 'auxiliary',
    mode: 'both',
    bass: ['c', 'c', 'c'],
    tenor: ['e', 'f', 'e'],
    alto: ['g', 'a', 'g'],
    sop: ['c1', 'd1', 'c1'],
    chords: ['T5/3', 'II6/5', 'T5/3'], // representing as beautiful relative chord
    degrees: ['I', 'II', 'I'],
    desc: 'Вспомогательный субдоминантовый секундаккорд на неподвижной тонике.'
  },
  {
    id: 'prog_enc_50',
    name: 'Вспомогательный терцквартаккорд VII4/3 к тонике [#50]',
    formula: 'T — VII4/3 — T',
    cat: 'auxiliary',
    mode: 'both',
    bass: ['c', 'd', 'c'],
    tenor: ['g', 'as', 'g'],
    alto: ['c1', 'h', 'c1'],
    sop: ['e1', 'f1', 'e1'],
    chords: ['T5/3', 'VII6', 'T5/3'],
    degrees: ['I', 'VII', 'I'],
    desc: 'Использование VII ступени обогащает плагальный характер оборота.'
  },
  {
    id: 'prog_enc_51',
    name: 'Вспомогательный минорный квартсекстаккорд в мажоре [#51]',
    formula: 'T — s6/4 (гарм.) — T',
    cat: 'auxiliary',
    mode: 'major',
    bass: ['c', 'c', 'c'],
    tenor: ['c1', 'c1', 'c1'],
    alto: ['e1', 'f1', 'e1'],
    sop: ['g1', 'as1', 'g1'],
    chords: ['T5/3', 's6/4', 'T5/3'],
    degrees: ['I', 'IV', 'I'],
    desc: 'Использование гармонической (минорной) субдоминанты придает мажору светлую грусть.'
  },

  // =========================================================================
  // РАЗДЕЛ 4. КАРТОЧКИ ПРЕРВАННЫХ ОБОРОТОВ И КАДЕНЦИЙ (52-62)
  // =========================================================================
  {
    id: 'prog_enc_52',
    name: 'Прерванный каданс 1-го рода (мел. пол. септимы) [#52]',
    formula: 'D7 — VI',
    cat: 'deceptive',
    mode: 'both',
    bass: ['g', 'a'],
    tenor: ['h', 'c1'],
    alto: ['d1', 'c1'],
    sop: ['f1', 'e1'],
    chords: ['D7', 'S6'], // VI chord often doubled third, behaves like S6/T
    degrees: ['V', 'VI'],
    desc: 'Классическое прерванное разрешение D7 в VI ступень с удвоением терции (основного тона тоники).'
  },
  {
    id: 'prog_enc_53',
    name: 'Прерванный каданс 1-го рода (мел. пол. вводного тона) [#53]',
    formula: 'D7 — VI (вводный тон)',
    cat: 'deceptive',
    mode: 'both',
    bass: ['g', 'a'],
    tenor: ['d1', 'c1'],
    alto: ['f1', 'e1'],
    sop: ['h1', 'c2'],
    chords: ['D7', 'S6'],
    degrees: ['V', 'VI'],
    desc: 'Разрешение в сопрано вводного тона (Си) вверх в До.'
  },
  {
    id: 'prog_enc_54',
    name: 'Прерванный каданс 1-го рода (мел. пол. квинты) [#54]',
    formula: 'D7 — VI (положение квинты)',
    cat: 'deceptive',
    mode: 'both',
    bass: ['G', 'A'],
    tenor: ['f', 'e'],
    alto: ['h', 'c1'],
    sop: ['d1', 'c1'],
    chords: ['D7', 'S6'],
    degrees: ['V', 'VI'],
    desc: 'Мягкое разрешение квинты доминанты вниз.'
  },
  {
    id: 'prog_enc_55',
    name: 'Прерванный неполный D7 со скачком примы [#55]',
    formula: 'D7 (неполный) — VI со скачком',
    cat: 'deceptive',
    mode: 'both',
    bass: ['g', 'a'],
    tenor: ['h', 'c1'],
    alto: ['f1', 'e1'],
    sop: ['g1', 'c2'],
    chords: ['D7', 'S6'],
    degrees: ['V', 'VI'],
    desc: 'Выразительный скачок в сопрано освежает прерванную каденцию.'
  },
  {
    id: 'prog_enc_56',
    name: 'Прерванный каданс в секстаккорд субдоминанты (D7 → IV6) [#56]',
    formula: 'D7 — IV6',
    cat: 'deceptive',
    mode: 'both',
    bass: ['g', 'a'],
    tenor: ['h', 'c1'],
    alto: ['d1', 'c1'],
    sop: ['f1', 'f1'],
    chords: ['D7', 'S6'],
    degrees: ['V', 'IV'],
    desc: 'Редкий изысканный оборот разрешения доминанты в секстаккорд субдоминанты.'
  },
  {
    id: 'prog_enc_57',
    name: 'Прерванный оборот в миноре (D7 → bVI) [#57]',
    formula: 'D7 — bVI',
    cat: 'deceptive',
    mode: 'minor',
    bass: ['g', 'as'],
    tenor: ['d1', 'c1'],
    alto: ['f1', 'es1'],
    sop: ['h1', 'c2'],
    chords: ['D7', 'bVI'],
    degrees: ['V', 'VI'],
    desc: 'Драматическое разрешение мажорной доминанты в минорную субмедианту (bVI).'
  },
  {
    id: 'prog_enc_58',
    name: 'Мажоро-минорный ложный каданс (D7 → bVI в мажоре) [#58]',
    formula: 'D7 — bVI (гармонический)',
    cat: 'deceptive',
    mode: 'major',
    bass: ['g', 'as'],
    tenor: ['d1', 'c1'],
    alto: ['f1', 'es1'],
    sop: ['h1', 'c2'],
    chords: ['D7', 'bVI'],
    degrees: ['V', 'VI'],
    desc: 'Заимствование bVI ступени из одноименного минора создает глубокий романтический вздох.'
  },
  {
    id: 'prog_enc_59',
    name: 'Прерванный оборот со скачком к неаполитанскому секстаккорду (D7 → N6) [#59]',
    formula: 'D7 — N6 (неаполитанский)',
    cat: 'deceptive',
    mode: 'minor',
    bass: ['g', 'f'],
    tenor: ['d1', 'des1'],
    alto: ['f1', 'f1'],
    sop: ['h1', 'des2'],
    chords: ['D7', 'N6'],
    degrees: ['V', 'II'],
    desc: 'Остродраматический скачок сопрано на уменьшенную септиму к тону неаполитанского аккорда.'
  },
  {
    id: 'prog_enc_60',
    name: 'Ложный оборот Мусоргского (D5/3 → VII7ум / IV) [#60]',
    formula: 'D5/3 — VII7ум / IV',
    cat: 'deceptive',
    mode: 'both',
    bass: ['G', 'Fis'],
    tenor: ['d', 'es'],
    alto: ['g', 'a'],
    sop: ['h', 'c1'],
    chords: ['D5/3', 'VII7ум'],
    degrees: ['V', 'IV'],
    desc: 'Характерное для русской музыки разрешение доминанты в уменьшенный септаккорд побочной субдоминанты.'
  },
  {
    id: 'prog_enc_61',
    name: 'Прерванный оборот в D2 / IV [#61]',
    formula: 'D7 — D2 / IV',
    cat: 'deceptive',
    mode: 'both',
    bass: ['g', 'b'],
    tenor: ['h', 'c1'],
    alto: ['d1', 'c1'],
    sop: ['f1', 'e1'],
    chords: ['D7', 'D2'],
    degrees: ['V', 'IV'],
    desc: 'Хроматический сползающий оборот.'
  },
  {
    id: 'prog_enc_62',
    name: 'Эллиптическое разрешение D7 → D4/3 / II [#62]',
    formula: 'D7 — D4/3 / II',
    cat: 'deceptive',
    mode: 'both',
    bass: ['g','e'],
    tenor: ['h','g'],
    alto: ['d1','cis1'],
    sop: ['f1','a1'],
    chords: ['D7', 'D4/3'],
    degrees: ['V', 'II'],
    desc: 'Мгновенная эллиптическая смена тонального центра.'
  },

  // =========================================================================
  // РАЗДЕЛ 5. ОБОРОТЫ СО СКАЧКАМИ ГОЛОСОВ (63-84)
  // =========================================================================
  {
    id: 'prog_enc_63',
    name: 'Скачок терций I → V в сопрано вверх (3-3) [#63]',
    formula: 'T — D (скачок терций)',
    cat: 'disjunct',
    mode: 'both',
    bass: ['c', 'G'],
    tenor: ['g', 'g'],
    alto: ['c1', 'd1'],
    sop: ['e1', 'h1'],
    chords: ['T5/3', 'D5/3'],
    degrees: ['I', 'V'],
    desc: 'Терцовый тон тоники совершает скачок вверх к терцовому тону доминанты.'
  },
  {
    id: 'prog_enc_64',
    name: 'Скачок терций I → V в сопрано вниз (3-3) [#64]',
    formula: 'T — D (скачок терций)',
    cat: 'disjunct',
    mode: 'both',
    bass: ['c', 'g'],
    tenor: ['c1', 'd1'],
    alto: ['g1', 'g1'],
    sop: ['e2', 'h1'],
    chords: ['T5/3', 'D5/3'],
    degrees: ['I', 'V'],
    desc: 'Скачок сопрано вниз на терцовый тон доминанты.'
  },
  {
    id: 'prog_enc_65',
    name: 'Скачок терций V → I в сопрано вверх (3-3) [#65]',
    formula: 'D — T (скачок терций)',
    cat: 'disjunct',
    mode: 'both',
    bass: ['G', 'c'],
    tenor: ['d', 'c'],
    alto: ['g', 'g'],
    sop: ['h', 'e1'],
    chords: ['D5/3', 'T5/3'],
    degrees: ['V', 'I'],
    desc: 'Терция доминанты совершает скачок вверх в терцию тоники.'
  },
  {
    id: 'prog_enc_66',
    name: 'Скачок терций V → I в сопрано вниз (3-3) [#66]',
    formula: 'D — T (скачок терций)',
    cat: 'disjunct',
    mode: 'both',
    bass: ['G', 'C'],
    tenor: ['g', 'g'],
    alto: ['d1', 'c1'],
    sop: ['h1', 'e1'],
    chords: ['D5/3', 'T5/3'],
    degrees: ['V', 'I'],
    desc: 'Нисходящий прыжок вводного тона в терцовый устой.'
  },
  {
    id: 'prog_enc_67',
    name: 'Скачок терций I → IV в сопрано вверх (3-3) [#67]',
    formula: 'T — S (скачок терций)',
    cat: 'disjunct',
    mode: 'both',
    bass: ['c', 'F'],
    tenor: ['g', 'f'],
    alto: ['c1', 'c1'],
    sop: ['e1', 'a1'],
    chords: ['T5/3', 'S5/3'],
    degrees: ['I', 'IV'],
    desc: 'Терцовый скачок вверх при плагальном переходе.'
  },
  {
    id: 'prog_enc_68',
    name: 'Скачок терций I → IV в сопрано вниз (3-3) [#68]',
    formula: 'T — S (скачок терций)',
    cat: 'disjunct',
    mode: 'both',
    bass: ['c', 'f'],
    tenor: ['g', 'f'],
    alto: ['c1', 'c1'],
    sop: ['e2', 'a1'],
    chords: ['T5/3', 'S5/3'],
    degrees: ['I', 'IV'],
    desc: 'Нисходящий терцовый скачок сопрано.'
  },
  {
    id: 'prog_enc_69',
    name: 'Скачок терций в теноре (I → V) [#69]',
    formula: 'T — D (скачок в теноре)',
    cat: 'disjunct',
    mode: 'both',
    bass: ['c', 'G'],
    tenor: ['e', 'h'],
    alto: ['c1', 'd1'],
    sop: ['g1', 'g1'],
    chords: ['T5/3', 'D5/3'],
    degrees: ['I', 'V'],
    desc: 'Средний голос (тенор) забирает на себя красивый выразительный скачок терций.'
  },
  {
    id: 'prog_enc_70',
    name: 'Восходящий скачок прим (I → V6) [#70]',
    formula: 'T — D6 (скачок прим)',
    cat: 'disjunct',
    mode: 'both',
    bass: ['c', 'H'],
    tenor: ['g', 'g'],
    alto: ['c1', 'd1'],
    sop: ['e1', 'g1'],
    chords: ['T5/3', 'D6'],
    degrees: ['I', 'V'],
    desc: 'Скачок сопрано от основного тона тоники к квинтовому тону доминанты.'
  },
  {
    id: 'prog_enc_71',
    name: 'Нисходящий скачок прим (I → V6) [#71]',
    formula: 'T — D6 (скачок прим)',
    cat: 'disjunct',
    mode: 'both',
    bass: ['c', 'H'],
    tenor: ['g', 'g'],
    alto: ['e1', 'd1'],
    sop: ['c2', 'g1'],
    chords: ['T5/3', 'D6'],
    degrees: ['I', 'V'],
    desc: 'Энергичный спад сопрано вниз на квинту доминанты.'
  },
  {
    id: 'prog_enc_72',
    name: 'Восходящий скачок квинт (I → V6) [#72]',
    formula: 'T — D6 (скачок квинт)',
    cat: 'disjunct',
    mode: 'both',
    bass: ['c', 'H'],
    tenor: ['c1', 'd1'],
    alto: ['e1', 'g1'],
    sop: ['g1', 'd2'],
    chords: ['T5/3', 'D6'],
    degrees: ['I', 'V'],
    desc: 'Оба крайних верхних тона совершают широкие скачки наружу.'
  },
  {
    id: 'prog_enc_73',
    name: 'Нисходящий скачок квинт (I6 → V5/3) [#73]',
    formula: 'T6 — D5/3',
    cat: 'disjunct',
    mode: 'both',
    bass: ['e', 'G'],
    tenor: ['g', 'g'],
    alto: ['c1', 'h'],
    sop: ['g1', 'd1'],
    chords: ['T6', 'D5/3'],
    degrees: ['I', 'V'],
    desc: 'Нисходящее сжатие созвучия.'
  },
  {
    id: 'prog_enc_74',
    name: 'Двойной скачок прим и квинт (I → V6) [#74]',
    formula: 'T — D6 (двойной скачок)',
    cat: 'disjunct',
    mode: 'both',
    bass: ['c', 'H'],
    tenor: ['e', 'd'],
    alto: ['g', 'g'],
    sop: ['c1', 'g1'],
    chords: ['T5/3', 'D6'],
    degrees: ['I', 'V'],
    desc: 'Многоголосный перекрестный скачок средних и верхних голосов.'
  },
  {
    id: 'prog_enc_75',
    name: 'Скачок сексты I → VI [#75]',
    formula: 'T — VI (скачок сексты)',
    cat: 'disjunct',
    mode: 'both',
    bass: ['c', 'A'],
    tenor: ['g', 'a'],
    alto: ['c1', 'e1'],
    sop: ['e1', 'c2'],
    chords: ['T5/3', 'S6'],
    degrees: ['I', 'VI'],
    desc: 'Широкое выразительное раскрытие фактуры на интервал сексты в сопрано.'
  },
  {
    id: 'prog_enc_76',
    name: 'Скачок терции I → VI [#76]',
    formula: 'T — VI',
    cat: 'disjunct',
    mode: 'both',
    bass: ['c','A'],
    tenor: ['g','c1'],
    alto: ['c1','e1'],
    sop: ['e1','e1'],
    chords: ['T5/3', 'S6'],
    degrees: ['I', 'VI'],
    desc: 'Параллельный терцовый шаг с переносом внимания в средние голоса.'
  },
  {
    id: 'prog_enc_77',
    name: 'Скачок сексты VI → IV [#77]',
    formula: 'VI — IV',
    cat: 'disjunct',
    mode: 'both',
    bass: ['A', 'F'],
    tenor: ['e', 'f'],
    alto: ['a', 'c1'],
    sop: ['c1', 'a1'],
    chords: ['S6', 'S5/3'],
    degrees: ['VI', 'IV'],
    desc: 'Драматическое развертывание плагальной зоны.'
  },
  {
    id: 'prog_enc_78',
    name: 'Скачок сексты IV → II [#78]',
    formula: 'IV — II',
    cat: 'disjunct',
    mode: 'both',
    bass: ['f', 'd'],
    tenor: ['f', 'a'],
    alto: ['c1', 'd1'],
    sop: ['a1', 'f2'],
    chords: ['S5/3', 'II5/3'],
    degrees: ['IV', 'II'],
    desc: 'Красивое плагальное парение мелодии во второй октаве.'
  },
  {
    id: 'prog_enc_79',
    name: 'Скачок квинт при D2 → I6 [#79]',
    formula: 'D2 — T6 (скачок квинт)',
    cat: 'disjunct',
    mode: 'both',
    bass: ['f', 'e'],
    tenor: ['d1', 'c1'],
    alto: ['g1', 'g1'],
    sop: ['h1', 'c2'],
    chords: ['D2', 'T6'],
    degrees: ['V', 'I'],
    desc: 'Скачок квинтового тона доминанты вверх при ее разрешении в тонический секстаккорд.'
  },
  {
    id: 'prog_enc_80',
    name: 'Скачок прим при D2 → I6 [#80]',
    formula: 'D2 — T6 (скачок прим)',
    cat: 'disjunct',
    mode: 'both',
    bass: ['f', 'e'],
    tenor: ['g', 'g'],
    alto: ['d1', 'c1'],
    sop: ['h1', 'c2'],
    chords: ['D2', 'T6'],
    degrees: ['V', 'I'],
    desc: 'Голоса плавно сходятся к тоническому центру.'
  },
  {
    id: 'prog_enc_81',
    name: 'Скачок прим при D4/3 → I [#81]',
    formula: 'D4/3 — T',
    cat: 'disjunct',
    mode: 'both',
    bass: ['d', 'c'],
    tenor: ['h', 'g'],
    alto: ['f1', 'e1'],
    sop: ['g1', 'c2'],
    chords: ['D4/3', 'T5/3'],
    degrees: ['V', 'I'],
    desc: 'Разрешение терцквартаккорда со скачком сопрано в верхнюю тонику.'
  },
  {
    id: 'prog_enc_82',
    name: 'Скачок терций при D4/3 → I [#82]',
    formula: 'D4/3 — T (скачок терций)',
    cat: 'disjunct',
    mode: 'both',
    bass: ['d', 'c'],
    tenor: ['g', 'c1'],
    alto: ['f1', 'e1'],
    sop: ['h1', 'e2'],
    chords: ['D4/3', 'T5/3'],
    degrees: ['V', 'I'],
    desc: 'Острейшее разрешение вводного тона со скачком.'
  },
  {
    id: 'prog_enc_83',
    name: 'Скачок квинты при D6/5 → I [#83]',
    formula: 'D6/5 — T',
    cat: 'disjunct',
    mode: 'both',
    bass: ['H', 'c'],
    tenor: ['g', 'g'],
    alto: ['d1', 'c1'],
    sop: ['f1', 'e1'],
    chords: ['D6/5', 'T5/3'],
    degrees: ['V', 'I'],
    desc: 'Квинта доминанты совершает красивый нисходящий скачок.'
  },
  {
    id: 'prog_enc_84',
    name: 'Скачок примы при неполном D7 → I [#84]',
    formula: 'D7 (неполный) — T',
    cat: 'disjunct',
    mode: 'both',
    bass: ['G','C'],
    tenor: ['f','e'],
    alto: ['h','g'],
    sop: ['g1','g1'],
    chords: ['D7', 'T5/3'],
    degrees: ['V', 'I'],
    desc: 'Один из самых ярких классических приемов кадансового утверждения.'
  },

  // =========================================================================
  // РАЗДЕЛ 6. АЛЬТЕРИРОВАННЫЕ АККОРДЫ, ХРОМАТИКА (85-101)
  // =========================================================================
  {
    id: 'prog_enc_85',
    name: 'Неаполитанский секстаккорд в доминанту (N6 → V) [#85]',
    formula: 'N6 — V',
    cat: 'altered',
    mode: 'both',
    bass: ['f','g'],
    tenor: ['as','h'],
    alto: ['des1','h'],
    sop: ['f1','d1'],
    chords: ['N6', 'D5/3'],
    degrees: ['II', 'V'],
    desc: 'Неаполитанский секстаккорд (низкая II ступень) плавно разрешается в доминанту. Характерное соскальзывание в сопрано с Ре-бемоль на Си.'
  },
  {
    id: 'prog_enc_86',
    name: 'Неаполитанский секстаккорд через K6/4 [#86]',
    formula: 'N6 — K6/4 — D7 — T',
    cat: 'altered',
    mode: 'both',
    bass: ['f', 'g', 'g', 'c'],
    tenor: ['f1', 'e1', 'd1', 'c1'],
    alto: ['as1', 'g1', 'f1', 'e1'],
    sop: ['des2', 'd2', 'h1', 'c2'],
    chords: ['N6', 'K6/4', 'D7', 'T5/3'],
    degrees: ['II', 'I', 'V', 'I'],
    desc: 'Классическое кадансовое торможение неаполитанского напряжения.'
  },
  {
    id: 'prog_enc_87',
    name: 'Плагальный неаполитанский оборот (N6 → I) [#87]',
    formula: 'N6 — T',
    cat: 'altered',
    mode: 'both',
    bass: ['f', 'c'],
    tenor: ['des1', 'e1'],
    alto: ['f1', 'g1'],
    sop: ['as1', 'c2'],
    chords: ['N6', 'T5/3'],
    degrees: ['II', 'I'],
    desc: 'Мягкий плагальный переход неаполитанского аккорда напрямую в тонику. Колорит Шопена.'
  },
  {
    id: 'prog_enc_88',
    name: 'Неаполитанский в D7 (N6 → V7) [#88]',
    formula: 'N6 — D7',
    cat: 'altered',
    mode: 'both',
    bass: ['f', 'g'],
    tenor: ['des1', 'd1'],
    alto: ['f1', 'f1'],
    sop: ['as1', 'h1'],
    chords: ['N6', 'D7'],
    degrees: ['II', 'V'],
    desc: 'Прямой шаг от субдоминантового неаполитанского созвучия в доминантсептаккорд.'
  },
  {
    id: 'prog_enc_89',
    name: 'Итальянский секстаккорд (It+6 → V) [#89]',
    formula: 'It+6 — V',
    cat: 'altered',
    mode: 'both',
    bass: ['as', 'g'],
    tenor: ['c1', 'h'],
    alto: ['c1', 'd1'],
    sop: ['fis1', 'g1'],
    chords: ['It+6', 'D5/3'],
    degrees: ['VI', 'V'],
    desc: 'Итальянский секстаккорд. Увеличенная секста (Ля-бемоль - Фа-диез) строго расходится наружу в чистую октаву (Соль - Соль).'
  },
  {
    id: 'prog_enc_90',
    name: 'Французский терцквартаккорд (Fr+6 → V) [#90]',
    formula: 'Fr+6 — V',
    cat: 'altered',
    mode: 'both',
    bass: ['as', 'g'],
    tenor: ['c1', 'h'],
    alto: ['d1', 'd1'],
    sop: ['fis1', 'g1'],
    chords: ['Fr+6', 'D5/3'],
    degrees: ['VI', 'V'],
    desc: 'Французский альтерированный аккорд с удержанием общего тона (Ре) на месте во втором голосе.'
  },
  {
    id: 'prog_enc_91',
    name: 'Немецкий квинтсекстаккорд через K6/4 (Ger+6 → K6/4) [#91]',
    formula: 'Ger+6 — K6/4 — V',
    cat: 'altered',
    mode: 'both',
    bass: ['as','g','g'],
    tenor: ['c1','c1','h'],
    alto: ['fis1','d1','d1'],
    sop: ['es2','g1','g1'],
    chords: ['Ger+6', 'K6/4', 'D5/3'],
    degrees: ['VI', 'I', 'V'],
    desc: 'Разрешение немецкого аккорда через кадансовый квартсекстаккорд позволяет избежать параллельных квинт.'
  },
  {
    id: 'prog_enc_92',
    name: 'Немецкий секстаккорд с моцартовскими квинтами [#92]',
    formula: 'Ger+6 — V (моцартовские квинты)',
    cat: 'altered',
    mode: 'both',
    bass: ['as','g'],
    tenor: ['c1','d1'],
    alto: ['fis1','d1'],
    sop: ['es2','h1'],
    chords: ['Ger+6', 'D5/3'],
    degrees: ['VI', 'V'],
    desc: 'Допустимый в классической музыке параллельный ход чистых квинт при разрешении немецкого аккорда напрямую.'
  },
  {
    id: 'prog_enc_93',
    name: 'Секста Чайковского [#93]',
    formula: 'It+6 (с замен. тоном) — V',
    cat: 'altered',
    mode: 'both',
    bass: ['as', 'g', 'g'],
    tenor: ['c1', 'c1', 'h'],
    alto: ['des1', 'd1', 'd1'],
    sop: ['fis1', 'g1', 'g1'],
    chords: ['It+6', 'K6/4', 'D5/3'],
    degrees: ['VI', 'I', 'V'],
    desc: 'Хроматическая секста, характерная для лирических тем Чайковского.'
  },
  {
    id: 'prog_enc_94',
    name: 'Альтерированная субдоминанта (II6/5 #4, b6 → K6/4) [#94]',
    formula: 'II6/5_#4_b6 — K6/4',
    cat: 'altered',
    mode: 'both',
    bass: ['f', 'g'],
    tenor: ['d1', 'd1'],
    alto: ['as1', 'g1'],
    sop: ['c2', 'c2'],
    chords: ['II6/5', 'K6/4'],
    degrees: ['II', 'I'],
    desc: 'Обогащенный преддоминантовый альтерированный квинтсекстаккорд.'
  },
  {
    id: 'prog_enc_95',
    name: 'Альтерированная субдоминанта (II4/3 #4, b6 → V7) [#95]',
    formula: 'II4/3_#4_b6 — V7',
    cat: 'altered',
    mode: 'both',
    bass: ['as', 'g'],
    tenor: ['d1', 'd1'],
    alto: ['fis1', 'f1'],
    sop: ['c2', 'h1'],
    chords: ['Fr+6', 'D7'],
    degrees: ['II', 'V'],
    desc: 'Разрешение побочного субдоминантового терцквартаккорда.'
  },
  {
    id: 'prog_enc_96',
    name: 'Тройная альтерация субдоминанты (II4/3 → K6/4) [#96]',
    formula: 'II4/3_три_альт — K6/4',
    cat: 'altered',
    mode: 'both',
    bass: ['as','g'],
    tenor: ['ces1','c1'],
    alto: ['fis1','d1'],
    sop: ['dis2','g1'],
    chords: ['Fr+6', 'K6/4'],
    degrees: ['II', 'I'],
    desc: 'Сложнейший хроматический аккорд с тремя измененными ступенями.'
  },
  {
    id: 'prog_enc_97',
    name: 'Тройная альтерация в квинтсекстаккорде (II6/5 → K6/4) [#97]',
    formula: 'II6/5_три_альт — K6/4',
    cat: 'altered',
    mode: 'both',
    bass: ['fis', 'g'],
    tenor: ['ces1', 'c1'],
    alto: ['dis1', 'd1'],
    sop: ['as1', 'g1'],
    chords: ['II6/5', 'K6/4'],
    degrees: ['II', 'I'],
    desc: 'Бас совершает вводный шаг Фа-диез - Соль.'
  },
  {
    id: 'prog_enc_98',
    name: 'Доминанта с повышенной квинтой (V7+5 → I) [#98]',
    formula: 'V7#5 — T',
    cat: 'altered',
    mode: 'major',
    bass: ['g', 'c'],
    tenor: ['h', 'c1'],
    alto: ['dis1', 'e1'],
    sop: ['f1', 'e1'],
    chords: ['D7#5', 'T5/3'],
    degrees: ['V', 'I'],
    desc: 'Повышенная квинта (Ре-диез) доминанты настойчиво разрешается полутоном вверх в терцию тоники (Ми).'
  },
  {
    id: 'prog_enc_99',
    name: 'Доминанта с пониженной квинтой (V7-5 → I) [#99]',
    formula: 'V7b5 — T',
    cat: 'altered',
    mode: 'both',
    bass: ['g', 'c'],
    tenor: ['h', 'c1'],
    alto: ['des1', 'c1'],
    sop: ['f1', 'e1'],
    chords: ['D7-5', 'T5/3'],
    degrees: ['V', 'I'],
    desc: 'Пониженная квинта (Ре-бемоль) плавно сползает в приму тоники.'
  },
  {
    id: 'prog_enc_100',
    name: 'Доминанта с секстой (III6 → I) [#100]',
    formula: 'III6 — T',
    cat: 'altered',
    mode: 'both',
    bass: ['g', 'c'],
    tenor: ['h', 'c1'],
    alto: ['d1', 'c1'],
    sop: ['e1', 'e1'],
    chords: ['III6', 'T5/3'],
    degrees: ['V', 'I'],
    desc: 'Доминанта с заменой квинты секстой (шестая ступень Ми удерживается как общий тон в тонику).'
  },
  {
    id: 'prog_enc_101',
    name: 'D7 с секстой Шопена [#101]',
    formula: 'D7_секста_Шопена — T',
    cat: 'altered',
    mode: 'both',
    bass: ['g', 'c'],
    tenor: ['h', 'c1'],
    alto: ['f1', 'e1'],
    sop: ['e2', 'c2'],
    chords: ['D7', 'T5/3'],
    degrees: ['V', 'I'],
    desc: 'Секста (Ми во второй октаве) берется как яркий выразительный диссонирующий тон над D7.'
  },

  // =========================================================================
  // РАЗДЕЛ 7. МОДАЛЬНЫЕ И ОБИХОДНЫЕ ЛАДЫ (102-116)
  // =========================================================================
  {
    id: 'prog_enc_102',
    name: 'Дорийский автентический оборот (I - IVмаж - I) [#102]',
    formula: 'i — IV — i',
    cat: 'modal',
    mode: 'minor',
    bass: ['d', 'g', 'd'],
    tenor: ['a', 'h', 'a'],
    alto: ['d1', 'd1', 'd1'],
    sop: ['f1', 'fis1', 'f1'],
    chords: ['t5/3', 'S5/3', 't5/3'],
    degrees: ['I', 'IV', 'I'],
    desc: 'Характерная высокая дорийская секста (Си-бемоль заменена на Си-бекар в тональности ре-минор).'
  },
  {
    id: 'prog_enc_103',
    name: 'Дорийский плагальный с IIмин [#103]',
    formula: 'i — ii — i',
    cat: 'modal',
    mode: 'minor',
    bass: ['d','e','d'],
    tenor: ['d1','h','d1'],
    alto: ['f1','g1','f1'],
    sop: ['a1','g1','a1'],
    chords: ['t5/3', 'ii6', 't5/3'],
    degrees: ['I', 'II', 'I'],
    desc: 'Использование минорного аккорда II ступени благодаря дорийскому ладу.'
  },
  {
    id: 'prog_enc_104',
    name: 'Канонический фригийский каданс (IV6 → V) [#104]',
    formula: 's6 — D',
    cat: 'modal',
    mode: 'minor',
    bass: ['f', 'e'],
    tenor: ['a', 'h'],
    alto: ['d1', 'e1'],
    sop: ['f1', 'gis1'],
    chords: ['s6', 'D5/3'],
    degrees: ['IV', 'V'],
    desc: 'Канонический старинный полутоновый спуск баса (Фа - Ми) при движении к доминанте.'
  },
  {
    id: 'prog_enc_105',
    name: 'Фригийский плагальный оборот (I - bIIмаж - I) [#105]',
    formula: 'i — bII — i',
    cat: 'modal',
    mode: 'minor',
    bass: ['e','f','e'],
    tenor: ['g','a','g'],
    alto: ['h','a','h'],
    sop: ['e1','c1','e1'],
    chords: ['t5/3', 'N6', 't5/3'],
    degrees: ['I', 'II', 'I'],
    desc: 'Низкая фригийская секунда (Фа в ми-миноре) создает суровое возвышенное плагальное опевание.'
  },
  {
    id: 'prog_enc_106',
    name: 'Полный фригийский оборот (I - vмин - IV6 - V) [#106]',
    formula: 'i — v_нат — IV6 — V',
    cat: 'modal',
    mode: 'minor',
    bass: ['A','G','F','E'],
    tenor: ['e','e','f','gis'],
    alto: ['c1','h','a','h'],
    sop: ['e1','e1','d1','e1'],
    chords: ['t5/3', 'd5/3', 'S6', 'D5/3'],
    degrees: ['I', 'V', 'IV', 'V'],
    desc: 'Исторический полный оборот во фригийском наклонении.'
  },
  {
    id: 'prog_enc_107',
    name: 'Лидийский субдоминантовый (I - IIмаж - I) [#107]',
    formula: 'I — II — I',
    cat: 'modal',
    mode: 'major',
    bass: ['f','g','f'],
    tenor: ['f1','d1','f1'],
    alto: ['a1','h1','a1'],
    sop: ['c2','h1','c2'],
    chords: ['T5/3', 'II5/3', 'T5/3'],
    degrees: ['I', 'II', 'I'],
    desc: 'Высокая лидийская кварта (Си-бекар в тональности Фа-мажор).'
  },
  {
    id: 'prog_enc_108',
    name: 'Лидийский автентический с V7лид [#108]',
    formula: 'I — V7 — I',
    cat: 'modal',
    mode: 'major',
    bass: ['f','c','f'],
    tenor: ['c1','h','c1'],
    alto: ['f1','g1','f1'],
    sop: ['a1','e2','a1'],
    chords: ['T5/3', 'D7', 'T5/3'],
    degrees: ['I', 'V', 'I'],
    desc: 'Диатоническое лидийское автентическое последование.'
  },
  {
    id: 'prog_enc_109',
    name: 'Миксолидийский автентический (I - bVIIмаж - I) [#109]',
    formula: 'I — bVII — I',
    cat: 'modal',
    mode: 'major',
    bass: ['g','f','g'],
    tenor: ['g','a','g'],
    alto: ['h','c1','h'],
    sop: ['d1','f1','d1'],
    chords: ['T5/3', 'bVI', 'T5/3'],
    degrees: ['I', 'VII', 'I'],
    desc: 'Низкая миксолидийская седьмая ступень (Фа-бекар в Соль-мажоре).'
  },
  {
    id: 'prog_enc_110',
    name: 'Миксолидийский с минорной доминантой (I - vмин - I) [#110]',
    formula: 'I — v_нат — I',
    cat: 'modal',
    mode: 'major',
    bass: ['g','d','g'],
    tenor: ['g','a','g'],
    alto: ['h','a','h'],
    sop: ['d1','f1','d1'],
    chords: ['T5/3', 'd5/3', 'T5/3'],
    degrees: ['I', 'V', 'I'],
    desc: 'Натуральная минорная доминанта из-за отсутствия вводного полутона.'
  },
  {
    id: 'prog_enc_111',
    name: 'Миксолидийская цепочка (I - bVII - IV - I) [#111]',
    formula: 'I — bVII — IV — I',
    cat: 'modal',
    mode: 'major',
    bass: ['G','F','C','G'],
    tenor: ['g','c','e','d'],
    alto: ['h','a','a','h'],
    sop: ['d1','f1','e1','g1'],
    chords: ['T5/3', 'bVI', 'S5/3', 'T5/3'],
    degrees: ['I', 'VII', 'IV', 'I'],
    desc: 'Древнеанглийская и кельтская миксолидийская плагальная цепочка.'
  },
  {
    id: 'prog_enc_112',
    name: 'Эолийский автентический (I - vмин - I) [#112]',
    formula: 'i — v_нат — i',
    cat: 'modal',
    mode: 'minor',
    bass: ['A', 'E', 'A'],
    tenor: ['e', 'e', 'e'],
    alto: ['a', 'g', 'a'],
    sop: ['c1', 'h', 'c1'],
    chords: ['t5/3', 'd5/3', 't5/3'],
    degrees: ['I', 'V', 'I'],
    desc: 'Эолийский натуральный минор. Мягкое повествовательное звучание.'
  },
  {
    id: 'prog_enc_113',
    name: 'Эолийский плагальный (I - bVII - bVI - I) [#113]',
    formula: 'i — bVII — bVI — i',
    cat: 'modal',
    mode: 'minor',
    bass: ['a','g','f','a'],
    tenor: ['a','h','a','a'],
    alto: ['c1','d1','f1','e1'],
    sop: ['e1','g1','c2','c2'],
    chords: ['t5/3', 'bVI', 'bVI', 't5/3'],
    degrees: ['I', 'VII', 'VI', 'I'],
    desc: 'Величественный народный эолийский оборот.'
  },
  {
    id: 'prog_enc_114',
    name: 'Параллельно-переменный оборот (I <-> VI) [#114]',
    formula: 'T — VI — T',
    cat: 'modal',
    mode: 'major',
    bass: ['c','a','c'],
    tenor: ['c1','c1','c1'],
    alto: ['e1','e1','e1'],
    sop: ['g1','a1','g1'],
    chords: ['T5/3', 'S6', 'T5/3'],
    degrees: ['I', 'VI', 'I'],
    desc: 'Русское народное переменное соскальзывание между мажором и параллельным минором.'
  },
  {
    id: 'prog_enc_115',
    name: 'Переменно-доминантовый оборот (I - IIIнат - VI) [#115]',
    formula: 'i — III — vi',
    cat: 'modal',
    mode: 'minor',
    bass: ['a','c','f'],
    tenor: ['a','h','f'],
    alto: ['e1','e1','f1'],
    sop: ['c2','g1','a1'],
    chords: ['t5/3', 'bVI', 'S6'],
    degrees: ['I', 'III', 'VI'],
    desc: 'Оборот со сменой тонального устоя.'
  },
  {
    id: 'prog_enc_116',
    name: 'Обиходный знаменный («Кулизма») [#116]',
    formula: 'Знаменный напев (Кулизма)',
    cat: 'modal',
    mode: 'minor',
    bass: ['d','a','d'],
    tenor: ['b','a','a'],
    alto: ['d1','c1','e1'],
    sop: ['g1','f1','g1'],
    chords: ['t5/3', 'd5/3', 't5/3'],
    degrees: ['I', 'V', 'I'],
    desc: 'Древнерусское богослужебное многоголосие со строго диатоническим опеванием.'
  },

  // =========================================================================
  // РАЗДЕЛ 8. СЕКВЕНЦИИ (117-125)
  // =========================================================================
  {
    id: 'prog_enc_117',
    name: 'Золотая секвенция трезвучий [#117]',
    formula: 'I — IV — VII — III — VI — II — V — I',
    cat: 'sequence',
    mode: 'major',
    bass: ['C','F','H','E','A','D','G','C'],
    tenor: ['e','f','d','e','c','d','d','c'],
    alto: ['g','a','g','g','a','a','h','a'],
    sop: ['c1','c1','d1','c1','e1','f1','d1','e1'],
    chords: ['T5/3', 'S5/3', 'VII6', 'III6', 'S6', 'II5/3', 'D5/3', 'T5/3'],
    degrees: ['I', 'IV', 'VII', 'III', 'VI', 'II', 'V', 'I'],
    desc: 'Полный кварто-квинтовый круг гармонической секвенции (золотое сечение барокко).'
  },
  {
    id: 'prog_enc_118',
    name: 'Золотая секвенция септаккордов [#118]',
    formula: 'I7 — IV7 — VII7 — III7 — VI7 — II7 — V7 — I',
    cat: 'sequence',
    mode: 'major',
    bass: ['C', 'F', 'H', 'E', 'A', 'D', 'G', 'C'],
    tenor: ['g', 'a', 'f', 'g', 'e', 'f', 'd', 'e'],
    alto: ['c1', 'c1', 'a', 'h', 'g', 'a', 'f', 'g'],
    sop: ['e1', 'f1', 'd1', 'e1', 'c1', 'd1', 'h', 'c1'],
    chords: ['T5/3', 'S5/3', 'VII6', 'III6', 'S6', 'II5/3', 'D5/3', 'T5/3'], // simplified labels
    degrees: ['I', 'IV', 'VII', 'III', 'VI', 'II', 'V', 'I'],
    desc: 'Обогащенное септаккордами непрерывное кварто-квинтовое сползание.'
  },
  {
    id: 'prog_enc_119',
    name: 'Секвенция Пахельбеля [#119]',
    formula: 'I — V — VI — III — IV — I — IV — V',
    cat: 'sequence',
    mode: 'major',
    bass: ['C','G','A','E','F','C','F','G'],
    tenor: ['e','d','c','g','f','g','f','d'],
    alto: ['g','h','a','h','a','g','a','h'],
    sop: ['c1','h1','e1','e1','c1','e1','f1','h1'],
    chords: ['T5/3', 'D5/3', 'S6', 'III6', 'S5/3', 'T5/3', 'S5/3', 'D5/3'],
    degrees: ['I', 'V', 'VI', 'III', 'IV', 'I', 'IV', 'V'],
    desc: 'Канонический бас знаменитого Канона Пахельбеля.'
  },
  {
    id: 'prog_enc_120',
    name: 'Цепь секундаккордов [#120]',
    formula: 'Сползание секундаккордов по полутонам',
    cat: 'sequence',
    mode: 'both',
    bass: ['C','B','A','G','F'],
    tenor: ['g','g','g','b','b'],
    alto: ['c1','d1','e1','f1','g1'],
    sop: ['e1','f1','g1','a1','c2'],
    chords: ['D2', 'D2', 'D2', 'D2', 'D2'],
    degrees: ['V', 'V', 'V', 'V', 'V'],
    desc: 'Утонченное сползание параллельных диссонирующих созвучий.'
  },
  {
    id: 'prog_enc_121',
    name: 'Восходящая терцовая секвенция [#121]',
    formula: 'I — V6 — II — VI6',
    cat: 'sequence',
    mode: 'major',
    bass: ['C', 'H', 'D', 'C', 'E'],
    tenor: ['g', 'g', 'a', 'a', 'h'],
    alto: ['c1', 'd1', 'f1', 'e1', 'g1'],
    sop: ['e1', 'g1', 'f1', 'a1', 'g1'],
    chords: ['T5/3', 'D6', 'II5/3', 'S6', 'III5/3'],
    degrees: ['I', 'V', 'II', 'VI', 'III'],
    desc: 'Восходящее секвенционное движение.'
  },
  {
    id: 'prog_enc_122',
    name: 'Восходящая кварто-квинтовая секвенция [#122]',
    formula: 'I — V — II — VI',
    cat: 'sequence',
    mode: 'major',
    bass: ['C','A','D','H','E'],
    tenor: ['g','c','a','f','h'],
    alto: ['c1','c1','d1','d1','e1'],
    sop: ['e1','e1','f1','h1','g1'],
    chords: ['T5/3', 'S6', 'II5/3', 'VII6', 'III5/3'],
    degrees: ['I', 'V', 'II', 'VI', 'III'],
    desc: 'Секвенция, устремленная вверх по кварто-квинтовым шагам.'
  },
  {
    id: 'prog_enc_123',
    name: 'Цепь D7 -> D7 [#123]',
    formula: 'Эллиптическая цепь неразрешенных D7',
    cat: 'sequence',
    mode: 'both',
    bass: ['C','F','B','Es'],
    tenor: ['e','es','d','es'],
    alto: ['b','a','as','g'],
    sop: ['g1','es1','f1','des1'],
    chords: ['D7', 'D7', 'D7', 'D7'],
    degrees: ['V', 'V', 'V', 'V'],
    desc: 'Романтическая цепь цепных доминантсептаккордов.'
  },
  {
    id: 'prog_enc_124',
    name: 'Хроматическая цепь VII7ум [#124]',
    formula: 'Параллельные уменьшенные септаккорды',
    cat: 'sequence',
    mode: 'both',
    bass: ['fis','f','e','es'],
    tenor: ['a','as','b','fis'],
    alto: ['c1','d1','des1','c1'],
    sop: ['es1','h1','g1','a1'],
    chords: ['VII7ум', 'VII7ум', 'VII7ум', 'VII7ум'],
    degrees: ['VII', 'VII', 'VII', 'VII'],
    desc: 'Изобразительное хроматическое скольжение уменьшенных септим.'
  },
  {
    id: 'prog_enc_125',
    name: 'Секвенция по б. терциям [#125]',
    formula: 'Симметричный сдвиг по большим терциям',
    cat: 'sequence',
    mode: 'both',
    bass: ['C', 'E', 'As', 'C'],
    tenor: ['e', 'e', 'es', 'e'],
    alto: ['g', 'gis', 'as', 'g'],
    sop: ['c1', 'h', 'c1', 'c1'],
    chords: ['T5/3', 'III5/3', 'bVI', 'T5/3'],
    degrees: ['I', 'III', 'VI', 'I'],
    desc: 'Симметричная романтическая секвенция.'
  },

  // =========================================================================
  // РАЗДЕЛ 9. ЭЛЛИПСИС И ТРИТОНОВЫЕ ЗАМЕНЫ (126-137)
  // =========================================================================
  {
    id: 'prog_enc_126',
    name: 'Тритоновая замена D7 (bII7 → I) [#126]',
    formula: 'bII7 → I',
    cat: 'ellipsis',
    mode: 'both',
    bass: ['des','c'],
    tenor: ['as','e'],
    alto: ['ces1','c1'],
    sop: ['f1','g1'],
    chords: ['♭II7', 'T5/3'],
    degrees: ['II', 'I'],
    desc: 'Джазовая и романтическая тритоновая замена доминанты.'
  },
  {
    id: 'prog_enc_127',
    name: 'Тритоновая замена DD7 (bVI7 → V) [#127]',
    formula: 'bVI7 → V',
    cat: 'ellipsis',
    mode: 'both',
    bass: ['as','g'],
    tenor: ['es1','h'],
    alto: ['ges1','g1'],
    sop: ['c2','d2'],
    chords: ['♭VI7', 'D5/3'],
    degrees: ['VI', 'V'],
    desc: 'Замена аккорда двойной доминанты.'
  },
  {
    id: 'prog_enc_128',
    name: 'Тритоновая замена в K6/4 [#128]',
    formula: 'bII7 → K6/4 — V7 — I',
    cat: 'ellipsis',
    mode: 'both',
    bass: ['Des', 'c', 'G', 'c'],
    tenor: ['f', 'c', 'd', 'c'],
    alto: ['ces1', 'g', 'h', 'g'],
    sop: ['as1', 'e1', 'f1', 'e1'],
    chords: ['♭II7', 'K6/4', 'D7', 'T5/3'],
    degrees: ['II', 'I', 'V', 'I'],
    desc: 'Сплав тритоновой замены с традиционным кадансовым квартсекстаккордом.'
  },
  {
    id: 'prog_enc_129',
    name: 'Двойная тритоновая замена (bVI7 → bII7 → I) [#129]',
    formula: 'bVI7 → bII7 → I',
    cat: 'ellipsis',
    mode: 'both',
    bass: ['As','Des','C'],
    tenor: ['es','f','g'],
    alto: ['c1','ces1','g'],
    sop: ['ges1','as1','e1'],
    chords: ['♭VI7', '♭II7', 'T5/3'],
    degrees: ['VI', 'II', 'I'],
    desc: 'Изысканный каскад тритоновых преддоминант.'
  },
  {
    id: 'prog_enc_130',
    name: 'Квинтовый эллипсис D7 [#130]',
    formula: 'D7 → IV (разрешение по квинтам)',
    cat: 'ellipsis',
    mode: 'both',
    bass: ['C', 'F'],
    tenor: ['e', 'es'],
    alto: ['g', 'f'],
    sop: ['b', 'a'],
    chords: ['D7', 'S5/3'],
    degrees: ['V', 'IV'],
    desc: 'Сдвиг по квинтовому кругу без разрешения.'
  },
  {
    id: 'prog_enc_131',
    name: 'Секундовый эллипсис D7 [#131]',
    formula: 'D7 → bII (эллипсис на секунду)',
    cat: 'ellipsis',
    mode: 'both',
    bass: ['des','c'],
    tenor: ['as','fes'],
    alto: ['ces1','b'],
    sop: ['fes1','g1'],
    chords: ['♭II7', 'T5/3'],
    degrees: ['II', 'I'],
    desc: 'Секундовое соскальзывание неразрешенных септаккордов.'
  },
  {
    id: 'prog_enc_132',
    name: 'Терцовый эллипсис D7 [#132]',
    formula: 'D7 → VI (на малую терцию)',
    cat: 'ellipsis',
    mode: 'both',
    bass: ['c', 'A'],
    tenor: ['e', 'e'],
    alto: ['g', 'g'],
    sop: ['b', 'a'],
    chords: ['D7', 'S6'],
    degrees: ['V', 'VI'],
    desc: 'Эллиптический терцовый сдвиг.'
  },
  {
    id: 'prog_enc_133',
    name: 'Эллипсис D7 → VII7ум / X [#133]',
    formula: 'D7 → VII7ум',
    cat: 'ellipsis',
    mode: 'both',
    bass: ['G','Fis'],
    tenor: ['f','c'],
    alto: ['h','a'],
    sop: ['d1','es1'],
    chords: ['D7', 'VII7ум'],
    degrees: ['V', 'VII'],
    desc: 'Эллиптическая смена тональной плоскости.'
  },
  {
    id: 'prog_enc_134',
    name: 'Однотерцовый восходящий оборот (C → cis) [#134]',
    formula: 'C-dur → cis-moll',
    cat: 'ellipsis',
    mode: 'both',
    bass: ['C','Cis'],
    tenor: ['g','e'],
    alto: ['c1','gis'],
    sop: ['e1','e1'],
    chords: ['T5/3', 't5/3'],
    degrees: ['I', 'I'],
    desc: 'Вспышка однотерцового ладового сдвига через общий терцовый тон Ми.'
  },
  {
    id: 'prog_enc_135',
    name: 'Однотерцовый нисходящий оборот (cis → C) [#135]',
    formula: 'cis-moll → C-dur',
    cat: 'ellipsis',
    mode: 'both',
    bass: ['Cis','C'],
    tenor: ['gis','e'],
    alto: ['cis1','e1'],
    sop: ['e1','g1'],
    chords: ['t5/3', 'T5/3'],
    degrees: ['I', 'I'],
    desc: 'Обратное однотерцовое соскальзывание.'
  },
  {
    id: 'prog_enc_136',
    name: 'Субмедианта Прокофьева (bVI → I) [#136]',
    formula: 'bVI (маж) → I',
    cat: 'ellipsis',
    mode: 'major',
    bass: ['As','c'],
    tenor: ['es','e'],
    alto: ['c1','c1'],
    sop: ['e1','g1'],
    chords: ['bVI', 'T5/3'],
    degrees: ['VI', 'I'],
    desc: 'Фирменный сдвиг Прокофьева: мажорная bVI ступень напрямую разрешается в тонику через удержание общего тона (До).'
  },
  {
    id: 'prog_enc_137',
    name: 'Рахманиновская субдоминанта (VII4/3кв → I) [#137]',
    formula: 'VII4/3кв → I',
    cat: 'ellipsis',
    mode: 'minor',
    bass: ['f', 'c'],
    tenor: ['as', 'g'],
    alto: ['ces1', 'c1'],
    sop: ['d1', 'c1'],
    chords: ['s6', 't5/3'],
    degrees: ['IV', 'I'],
    desc: 'Оборот Рахманинова с использованием плагального созвучия с добавленной квартой.'
  },

  // =========================================================================
  // РАЗДЕЛ 10. СОВРЕМЕННЫЕ И СИММЕТРИЧНЫЕ СИСТЕМЫ (138-148)
  // =========================================================================
  {
    id: 'prog_enc_138',
    name: 'Целотонный оборот [#138]',
    formula: 'Целотонный лад',
    cat: 'modern',
    mode: 'both',
    bass: ['c','d','e'],
    tenor: ['g','fis','h'],
    alto: ['e1','d1','gis1'],
    sop: ['e1','a1','gis1'],
    chords: ['T5/3', 'II5/3', 'III5/3'],
    degrees: ['I', 'II', 'III'],
    desc: 'Симметричное движение по целым тонам. Импрессионистический парящий колорит.'
  },
  {
    id: 'prog_enc_139',
    name: 'Уменьшенный оборот [#139]',
    formula: 'Лад Римского-Корсакова',
    cat: 'modern',
    mode: 'both',
    bass: ['c','es','fis','a'],
    tenor: ['c1','b','b','e1'],
    alto: ['e1','g1','fis1','cis2'],
    sop: ['g1','g1','cis2','cis2'],
    chords: ['T5/3', 'bVI', 'It+6', 'S6'],
    degrees: ['I', 'VI', 'VI', 'VI'],
    desc: 'Симметричный сдвиг созвучий строго по малым терциям. Сказочный уменьшенный лад.'
  },
  {
    id: 'prog_enc_140',
    name: 'Увеличенный оборот [#140]',
    formula: 'Сдвиг по большим терциям',
    cat: 'modern',
    mode: 'both',
    bass: ['c','e','as','c'],
    tenor: ['g','as','es1','c1'],
    alto: ['e1','e1','es1','e1'],
    sop: ['e1','h1','c2','g1'],
    chords: ['T5/3', 'III5/3', 'bVI', 'T5/3'],
    degrees: ['I', 'III', 'VI', 'I'],
    desc: 'Симметричная цепочка по большим терциям.'
  },
  {
    id: 'prog_enc_141',
    name: 'Тритоновый дважды-лад (C <-> Fis) [#141]',
    formula: 'Тритоновая битональность',
    cat: 'modern',
    mode: 'both',
    bass: ['c','fis'],
    tenor: ['c1','cis1'],
    alto: ['e1','cis1'],
    sop: ['g1','ais1'],
    chords: ['T5/3', 'Fr+6'],
    degrees: ['I', 'IV'],
    desc: 'Битональное сопоставление центров, отстоящих на тритон.'
  },
  {
    id: 'prog_enc_142',
    name: 'Прокофьевская доминанта [#142]',
    formula: 'V_прок → I',
    cat: 'modern',
    mode: 'major',
    bass: ['G','C'],
    tenor: ['f1','c1'],
    alto: ['as1','g1'],
    sop: ['des2','e2'],
    chords: ['D7', 'T5/3'],
    degrees: ['V', 'I'],
    desc: 'Доминанта Прокофьева: сочетание тритонового баса и острейшего полутонового сползания в сопрано.'
  },
  {
    id: 'prog_enc_143',
    name: 'Полиаккорд «Петрушки» [#143]',
    formula: 'C-dur + Fis-dur Стравинского',
    cat: 'modern',
    mode: 'both',
    bass: ['c', 'g'],
    tenor: ['e1', 'e1'],
    alto: ['g1', 'fis1'],
    sop: ['c2', 'ais1'],
    chords: ['T5/3', 'Fr+6'],
    degrees: ['I', 'IV'],
    desc: 'Знаменитый полиаккорд Стравинского, объединяющий C-dur и Fis-dur.'
  },
  {
    id: 'prog_enc_144',
    name: 'Аккорд Скрябина («Прометей») [#144]',
    formula: 'Прометеев аккорд Скрябина',
    cat: 'modern',
    mode: 'both',
    bass: ['C', 'C'],
    tenor: ['fis', 'b'],
    alto: ['e1', 'a1'],
    sop: ['d2', 'd2'],
    chords: ['Fr+6', 'Fr+6'],
    degrees: ['I', 'I'],
    desc: 'Мистическое созвучие Скрябина, построенное по квартам.'
  },
  {
    id: 'prog_enc_145',
    name: 'Суперминор Шостаковича [#145]',
    formula: 'i — bII_мин — i',
    cat: 'modern',
    mode: 'minor',
    bass: ['c','des','c'],
    tenor: ['g','fes','g'],
    alto: ['c1','as','c1'],
    sop: ['es1','fes1','es1'],
    chords: ['t5/3', 'N6', 't5/3'],
    degrees: ['I', 'II', 'I'],
    desc: 'Трагический оборот с пониженной минорной II ступенью Шостаковича.'
  },
  {
    id: 'prog_enc_146',
    name: 'Зеркальный блок Шнитке [#146]',
    formula: 'Зеркальное голосоведение',
    cat: 'modern',
    mode: 'both',
    bass: ['c','H'],
    tenor: ['g','f'],
    alto: ['c1','cis1'],
    sop: ['e1','fis1'],
    chords: ['T5/3', 'D5/3'],
    degrees: ['I', 'V'],
    desc: 'Полифоническое зеркальное отражение голосов.'
  },
  {
    id: 'prog_enc_147',
    name: '12-тоновый аггрегат [#147]',
    formula: 'Додекафония',
    cat: 'modern',
    mode: 'both',
    bass: ['C','Cis'],
    tenor: ['e','as'],
    alto: ['b','h'],
    sop: ['g1','f1'],
    chords: ['T5/3', 'T5/3'],
    degrees: ['I', 'I'],
    desc: 'Минимальный додекафонный пласт созвучий.'
  },
  {
    id: 'prog_enc_148',
    name: 'Секундовый кластер [#148]',
    formula: 'Кластерное созвучие',
    cat: 'modern',
    mode: 'both',
    bass: ['c', 'c'],
    tenor: ['d', 'd'],
    alto: ['e', 'e'],
    sop: ['f', 'f'],
    chords: ['T5/3', 'T5/3'],
    degrees: ['I', 'I'],
    desc: 'Современный плотный звуковой кластер.'
  },
  {
    id: 'prog_enc_149',
    name: 'Септаккорд II ступени в основном виде (II7 → V7) [#149]',
    formula: 'T — II7 — D7 — T',
    cat: 'cadential',
    mode: 'both',
    bass: ['c', 'd', 'G', 'c'],
    tenor: ['g', 'f', 'f', 'e'],
    alto: ['c1', 'c1', 'h', 'c1'],
    sop: ['e1', 'd1', 'd1', 'c1'],
    chords: ['T5/3', 'II7', 'D7', 'T5/3'],
    degrees: ['I', 'II', 'V', 'I'],
    desc: 'Разрешение септаккорда II ступени в доминантсептаккорд и тонику. Чтобы избежать параллельных квинт при переходе от тоники, II7 взят в классическом неполном виде (с пропущенной квинтой и удвоением основного тона). Септима II7 (До) приготовлена в предыдущей тонике и переходит на месте в септиму D7 (Фа).'
  },
  {
    id: 'prog_enc_150',
    name: 'Квинтсекстаккорд II ступени (II6/5 → K6/4) [#150]',
    formula: 'T — II6/5 — K6/4 — D7 — T',
    cat: 'cadential',
    mode: 'both',
    bass: ['C', 'F', 'G', 'G', 'C'],
    tenor: ['g', 'a', 'g', 'f', 'e'],
    alto: ['c1', 'c1', 'c1', 'h', 'c1'],
    sop: ['e1', 'd1', 'e1', 'd1', 'c1'],
    chords: ['T5/3', 'II6/5', 'K6/4', 'D7', 'T5/3'],
    degrees: ['I', 'II', 'I', 'V', 'I'],
    desc: 'Классический кадансовый оборот. Квинтсекстаккорд II6/5 имеет бас на IV ступени (нота Фа), звучит как субдоминанта с добавленной секстой (sixte ajoutée) и плавно переходит в кадансовый квартсекстаккорд.'
  },
  {
    id: 'prog_enc_151',
    name: 'Терцквартаккорд II ступени (II4/3 → K6/4) [#151]',
    formula: 'T — II4/3 — K6/4 — D7 — T',
    cat: 'cadential',
    mode: 'both',
    bass: ['C', 'A', 'G', 'G', 'C'],
    tenor: ['g', 'f', 'g', 'f', 'e'],
    alto: ['c1', 'c1', 'c1', 'h', 'c1'],
    sop: ['e1', 'd1', 'e1', 'd1', 'c1'],
    chords: ['T5/3', 'II4/3', 'K6/4', 'D7', 'T5/3'],
    degrees: ['I', 'II', 'I', 'V', 'I'],
    desc: 'Терцквартаккорд II ступени имеет бас на VI ступени (нота Ля), что делает его прекрасным кадансовым и проходящим аккордом, разрешающимся в кадансовый квартсекстаккорд.'
  },
  {
    id: 'prog_enc_152',
    name: 'Секундаккорд II ступени (II2 → D6/5) [#152]',
    formula: 'T — II2 — D6/5 — T',
    cat: 'cadential',
    mode: 'both',
    bass: ['c', 'c', 'H', 'c'],
    tenor: ['g', 'f', 'f', 'e'],
    alto: ['c1', 'a', 'g', 'g'],
    sop: ['e1', 'd1', 'd1', 'c1'],
    chords: ['T5/3', 'II2', 'D6/5', 'T5/3'],
    degrees: ['I', 'II', 'V', 'I'],
    desc: 'Один из четырёх канонических оборотов по "правилу креста" (перекрестной схеме). Секундаккорд II2 имеет диссонирующую септиму в басу (на I ступени), которая плавно разрешается ходом на полтона вниз в терцию доминантсептаккорда D6/5 (на VII ступени). Два голоса остаются на месте (тенор F и сопрано D), а два других спускаются на секунду.'
  },
  {
    id: 'prog_enc_153',
    name: 'Прямое разрешение II6/5 в D7 (без K6/4) [#153]',
    formula: 'T — II6/5 — D7 — T',
    cat: 'cadential',
    mode: 'both',
    bass: ['C', 'F', 'G', 'C'],
    tenor: ['g', 'a', 'f', 'e'],
    alto: ['c1', 'c1', 'h', 'c1'],
    sop: ['e1', 'd1', 'd1', 'c1'],
    chords: ['T5/3', 'II6/5', 'D7', 'T5/3'],
    degrees: ['I', 'II', 'V', 'I'],
    desc: 'Разрешение квинтсекстаккорда II6/5 непосредственно в доминантсептаккорд D7. Септима приготовлена в сопрано/теноре и плавно переходит в диссонирующие тона доминанты.'
  },
  {
    id: 'prog_enc_154',
    name: 'Прямое разрешение терцквартаккорда (II4/3 → D) [#154]',
    formula: 'T — II4/3 — D5/3 — T',
    cat: 'cadential',
    mode: 'both',
    bass: ['C', 'A', 'G', 'C'],
    tenor: ['g', 'f', 'd', 'e'],
    alto: ['c1', 'c1', 'h', 'c1'],
    sop: ['e1', 'd1', 'd1', 'c1'],
    chords: ['T5/3', 'II4/3', 'D5/3', 'T5/3'],
    degrees: ['I', 'II', 'V', 'I'],
    desc: 'Терцквартаккорд II4/3 разрешается непосредственно в доминантовое трезвучие D5/3. Бас идет плавно на секунду вниз (VI → V), остальные голоса движутся плавно и естественно.'
  },
  {
    id: 'prog_enc_155',
    name: 'Переход II6/5 в вводный септаккорд (II6/5 → VII7ум) [#155]',
    formula: 'T — II6/5 — VII7ум — T',
    cat: 'altered',
    mode: 'minor',
    bass: ['C', 'F', 'H', 'C'],
    tenor: ['g', 'as', 'as', 'g'],
    alto: ['c1', 'c1', 'd1', 'es1'],
    sop: ['es1', 'd1', 'f1', 'es1'],
    chords: ['t5/3', 'ii6/5', 'VII7ум', 't5/3'],
    degrees: ['I', 'II', 'VII', 'I'],
    desc: 'Художественное сопоставление субдоминанты и доминанты через вводный септаккорд. Происходит плавный переход общих голосов с разрешением тритонов внутрь тонической терции.'
  },
  {
    id: 'prog_enc_156',
    name: 'Кадансовый оборот II4/3 → D6/5 [#156]',
    formula: 'T — II4/3 — D6/5 — T',
    cat: 'cadential',
    mode: 'both',
    bass: ['C', 'A', 'H', 'C'],
    tenor: ['g', 'f', 'd', 'e'],
    alto: ['c1', 'c1', 'g', 'g'],
    sop: ['e1', 'd1', 'f1', 'e1'],
    chords: ['T5/3', 'II4/3', 'D6/5', 'T5/3'],
    degrees: ['I', 'II', 'V', 'I'],
    desc: 'Прекрасный диатонический каданс. Бас делает поступенное восходящее движение (VI → VII → I), создавая плотную и устойчивую басовую опору.'
  },
  {
    id: 'prog_enc_157',
    name: 'Нагнетание субдоминанты (S → II6/5) [#157]',
    formula: 'T — S5/3 — II6/5 — K6/4 — D7 — T',
    cat: 'cadential',
    mode: 'both',
    bass: ['C', 'F', 'F', 'G', 'G', 'C'],
    tenor: ['e', 'f', 'd', 'e', 'f', 'e'],
    alto: ['g', 'a', 'a', 'g', 'g', 'g'],
    sop: ['c1', 'c1', 'c1', 'c1', 'h', 'c1'],
    chords: ['T5/3', 'S5/3', 'II6/5', 'K6/4', 'D7', 'T5/3'],
    degrees: ['I', 'IV', 'II', 'I', 'V', 'I'],
    desc: 'Развитие субдоминантовой группы: переход от простого трезвучия S5/3 к более напряженному квинтсекстаккорду II6/5 путем добавления сексты в баритоне/теноре.'
  },
  {
    id: 'prog_enc_158',
    name: 'Перекрестная схема: II7 → D4/3 → T [#158]',
    formula: 'T — II7 — D4/3 — T',
    cat: 'cadential',
    mode: 'both',
    bass: ['c', 'd', 'd', 'c'],
    tenor: ['g', 'f', 'g', 'g'],
    alto: ['c1', 'c1', 'h', 'c1'],
    sop: ['e1', 'd1', 'f1', 'e1'],
    chords: ['T5/3', 'II7', 'D4/3', 'T5/3'],
    degrees: ['I', 'II', 'V', 'I'],
    desc: 'По классическому "правилу креста" (перекрестной схеме) основной септаккорд II7 разрешается во второе обращение доминантсептаккорда D4/3. Чтобы избежать параллельных квинт при переходе от тоники, II7 взят в классическом неполном виде (с пропущенной квинтой и удвоенным основным тоном), что обеспечивает безупречное академическое голосоведение.'
  },
  {
    id: 'prog_enc_159',
    name: 'Перекрестная схема: II6/5 → D2 → T6 [#159]',
    formula: 'T — II6/5 — D2 — T6',
    cat: 'cadential',
    mode: 'both',
    bass: ['c', 'f', 'f', 'e'],
    tenor: ['g', 'a', 'g', 'g'],
    alto: ['c1', 'c1', 'h', 'c1'],
    sop: ['e1', 'd1', 'd1', 'c1'],
    chords: ['T5/3', 'II6/5', 'D2', 'T6'],
    degrees: ['I', 'II', 'V', 'I'],
    desc: 'По "правилу креста" квинтсекстаккорд II6/5 переходит в доминантсекундаккорд D2. Бас на IV ступени и сопрано на II ступени остаются на месте, а два средних голоса плавно спускаются на шаг вниз (септима C→H, квинта A→G). Секундаккорд D2 затем естественно разрешается в тонический секстаккорд T6.'
  },
  {
    id: 'prog_enc_160',
    name: 'Перекрестная схема: II4/3 → D7 → T [#160]',
    formula: 'T — II4/3 — D7 — T',
    cat: 'cadential',
    mode: 'both',
    bass: ['c', 'A', 'G', 'c'],
    tenor: ['g', 'f', 'f', 'e'],
    alto: ['c1', 'c1', 'h', 'c1'],
    sop: ['e1', 'd1', 'd1', 'c1'],
    chords: ['T5/3', 'II4/3', 'D7', 'T5/3'],
    degrees: ['I', 'II', 'V', 'I'],
    desc: 'По "правилу креста" терцквартаккорд II4/3 (с басом на VI ступени лада) разрешается в основной вид доминантсептаккорда D7. Бас перенесен во вторую (большую) октаву (ноты A и G), чтобы исключить перекрещивание с тенором. Тенор на IV ступени и сопрано на II ступени остаются неподвижными, а бас и альт (септима C) спускаются на секунду вниз в тона G и H.'
  },
  {
    id: 'prog_enc_161',
    name: 'Круговая схема: II7 → VII6/5ум → T [#161]',
    formula: 't — ii7 — VII6/5ум — t',
    cat: 'altered',
    mode: 'minor',
    bass: ['c', 'd', 'd', 'es'],
    tenor: ['g', 'as', 'as', 'g'],
    alto: ['c1', 'c1', 'h', 'c1'],
    sop: ['es1', 'f1', 'f1', 'es1'],
    chords: ['t5/3', 'ii7', 'VII6/5ум', 't5/3'],
    degrees: ['I', 'II', 'VII', 'I'],
    desc: 'По "круговой схеме" разрешения основной септаккорд II7 переходит в следующее обращение вводного септаккорда — квинтсекстаккорд VII6/5ум. Три общих тона остаются неподвижными в тех же голосах (бас D, тенор As, сопрано F), а альт (септима C) плавно спускается на полтона в вводный тон H.'
  },
  {
    id: 'prog_enc_162',
    name: 'Круговая схема: II6/5 → VII4/3ум → T [#162]',
    formula: 't — ii6/5 — VII4/3ум — t',
    cat: 'altered',
    mode: 'minor',
    bass: ['c', 'f', 'f', 'es'],
    tenor: ['g', 'as', 'as', 'g'],
    alto: ['c1', 'c1', 'h', 'c1'],
    sop: ['es1', 'd1', 'd1', 'c1'],
    chords: ['t5/3', 'ii6/5', 'VII4/3ум', 't5/3'],
    degrees: ['I', 'II', 'VII', 'I'],
    desc: 'По "круговой схеме" квинтсекстаккорд II6/5 (бас на IV ст.) переходит во вводный терцквартаккорд VII4/3ум. Три голоса остаются на месте (бас F, тенор As, сопрано D), а диссонирующая септима в альте (нота C) плавно разрешается нисходящим полутоном в вводный тон H. VII4/3ум разрешается в минорную тонику.'
  },
  {
    id: 'prog_enc_163',
    name: 'Круговая схема: II4/3 → VII2ум → T [#163]',
    formula: 't — ii4/3 — VII2ум — t6/4',
    cat: 'altered',
    mode: 'minor',
    bass: ['c', 'As', 'As', 'G'],
    tenor: ['g', 'c1', 'h', 'c1'],
    alto: ['c1', 'd1', 'd1', 'es1'],
    sop: ['es1', 'f1', 'f1', 'es1'],
    chords: ['t5/3', 'ii4/3', 'VII2ум', 't6/4'],
    degrees: ['I', 'II', 'VII', 'I'],
    desc: 'По "круговой схеме" терцквартаккорд II4/3 (бас на VI ст.) переходит во вводный секундаккорд VII2ум. Бас As, альт D и сопрано F остаются неподвижными, а септима септаккорда II в теноре (нота C) плавно спускается на полутон в вводный тон H. Вводный секундаккорд затем переходит в тонический квартсекстаккорд t6/4, куда естественно разрешается диссонирующий бас (септима в басу на VI ступени спускается в V ступень).'
  },
  {
    id: 'prog_enc_164',
    name: 'Круговая схема: II2 → VII7ум → T [#164]',
    formula: 't — ii2 — VII7ум — t',
    cat: 'altered',
    mode: 'minor',
    bass: ['c', 'c', 'H', 'c'],
    tenor: ['c1', 'd1', 'd1', 'c1'],
    alto: ['es1', 'f1', 'f1', 'es1'],
    sop: ['g1', 'as1', 'as1', 'g1'],
    chords: ['t5/3', 'ii2', 'VII7ум', 't5/3'],
    degrees: ['I', 'II', 'VII', 'I'],
    desc: 'По "круговой схеме" секундаккорд II2 (септима в басу на I ступени) переходит в основной вид вводного септаккорда VII7ум. Три верхних голоса остаются неподвижными (тенор D, альт F, сопрано As), а диссонирующий бас (септима C) плавно спускается на полутон вниз в вводный тон H (приму вводного септаккорда).'
  }
];

export function determineOriginalTonicPC(raw: { id: string; bass: string[]; degrees: string[]; chords: string[] }): number {
  if (!raw.degrees || raw.degrees.length === 0 || !raw.bass || raw.bass.length === 0) {
    return 0; // default C
  }
  
  const firstDeg = raw.degrees[0].toUpperCase();
  const firstChord = raw.chords[0];
  const firstBass = raw.bass[0];
  
  // 1. Get bass note pitch class
  const bassPC = (parseNoteToOffset(firstBass) % 12 + 12) % 12;
  
  // 2. Determine chord root relative to bass based on inversion
  let inversionShift = 0; // in semitones, root = bass - shift
  const chordLower = firstChord.toLowerCase();
  
  if (chordLower.includes('6/4') || chordLower.includes('64') || chordLower.includes('4/3') || chordLower.includes('43')) {
    inversionShift = 7;
  } else if (chordLower.includes('6/5') || chordLower.includes('65') || chordLower.includes('5/6') || chordLower.includes('56') || chordLower.includes('6')) {
    const isMinorChord = firstChord.startsWith('t') || firstChord.startsWith('s') || firstChord.startsWith('d') || firstChord.startsWith('i') || firstChord.startsWith('ii') || firstChord.startsWith('vi') || firstChord.startsWith('vii') || firstChord.startsWith('n');
    if (isMinorChord) {
      inversionShift = 3; // minor third
    } else {
      inversionShift = 4; // major third
    }
  } else if (chordLower.includes('2')) {
    inversionShift = 10;
  }
  
  const rootPC = (bassPC - inversionShift + 12) % 12;
  
  // 3. Determine scale tonic from root based on scale degree
  let degreeOffset = 0; // root = tonic + degreeOffset, so tonic = root - degreeOffset
  
  if (firstDeg.startsWith('I') || firstDeg.startsWith('T') || firstDeg === 'i') {
    degreeOffset = 0;
  } else if (firstDeg.startsWith('II') || firstDeg === 'N' || firstDeg === 'BII') {
    if (firstDeg.startsWith('BII') || firstDeg === 'N') {
      degreeOffset = 1;
    } else {
      degreeOffset = 2;
    }
  } else if (firstDeg.startsWith('III') || firstDeg === 'BIII') {
    if (firstDeg.startsWith('BIII')) {
      degreeOffset = 3;
    } else {
      degreeOffset = 4;
    }
  } else if (firstDeg.startsWith('IV') || firstDeg.startsWith('S') || firstDeg === 'iv') {
    degreeOffset = 5;
  } else if (firstDeg.startsWith('V') || firstDeg.startsWith('D') || firstDeg === 'v') {
    degreeOffset = 7;
  } else if (firstDeg.startsWith('VI') || firstDeg === 'BVI') {
    if (firstDeg.startsWith('BVI')) {
      degreeOffset = 8;
    } else {
      degreeOffset = 9;
    }
  } else if (firstDeg.startsWith('VII') || firstDeg === 'BVII') {
    if (firstDeg.startsWith('BVII')) {
      degreeOffset = 10;
    } else {
      degreeOffset = 11;
    }
  }
  
  return (rootPC - degreeOffset + 12) % 12;
}

export function compileEncyclopedicProgressions(): HarmonicProgressionTemplate[] {
  return RAW_ENCYCLOPEDIA_PROGRESSIONS.map((raw) => {
    const originalTonicPC = determineOriginalTonicPC(raw);
    
    const steps: ProgressionChordStep[] = raw.chords.map((chordSymbol, i) => {
      const bNote = raw.bass[i];
      const tNote = raw.tenor[i];
      const aNote = raw.alto[i];
      const sNote = raw.sop[i];
      
      const bOffset = parseNoteToOffset(bNote);
      const tOffset = parseNoteToOffset(tNote);
      const aOffset = parseNoteToOffset(aNote);
      const sOffset = parseNoteToOffset(sNote);
      
      const chordNameRu = CHORD_NAMES_RU[chordSymbol] ?? `Аккорд ${chordSymbol}`;
      
      return {
        symbol: chordSymbol,
        degreeRoman: raw.degrees[i] ?? 'I',
        nameRu: chordNameRu,
        satbOffsets: [bOffset, tOffset, aOffset, sOffset],
        voiceDegreesRu: {
          soprano: getVoiceDegreeText(sOffset, originalTonicPC),
          alto: getVoiceDegreeText(aOffset, originalTonicPC),
          tenor: getVoiceDegreeText(tOffset, originalTonicPC),
          bass: getVoiceDegreeText(bOffset, originalTonicPC)
        }
      };
    });
    
    return {
      id: raw.id,
      nameRu: raw.name,
      formula: raw.formula,
      category: raw.cat,
      categoryNameRu: CATEGORY_NAMES_RU[raw.cat],
      scaleMode: raw.mode,
      bassMotionRu: BASS_MOTION_GLOSSARY[raw.cat],
      sopranoMotionRu: SOPRANO_MOTION_GLOSSARY[raw.cat],
      voiceLeadingExplanationRu: raw.desc,
      usageContextRu: raw.ctx ?? 'В академических упражнениях и каденциях.',
      steps,
      originalTonicPC
    };
  });
}
