import { CHROMATIC_NOTES_UP } from '../data/musicData';
import { TonalThemeId } from '../types';

export interface ResolutionSchemeItem {
  toChord: string;
  formula: string;
  voiceLeadingRu: string;
  contextRu: string;
}

export interface TonalDegreeDefinition {
  id: string;
  degreeRoman: string;
  degreeNumber: number;
  labelMajor: string;
  labelMinor: string;
  nameMajorRu: string;
  nameMinorRu: string;
  functionGroup: string;
  functionalStrengthRu: string;
  harmonicRoleRu: string;
  usageMethodsRu: string;
  descMajorRu: string;
  descMinorRu: string;
  resolutionsScheme: ResolutionSchemeItem[];
}

export const TONAL_DEGREES: TonalDegreeDefinition[] = [
  // 1. ТОНИЧЕСКАЯ ГРУППА & КАДАНС (T)
  {
    id: 'deg_I',
    degreeRoman: 'I',
    degreeNumber: 1,
    labelMajor: 'I (T)',
    labelMinor: 'I (t)',
    nameMajorRu: 'I ступень — Тоника (T5/3, T6, T6/4)',
    nameMinorRu: 'I ступень — Тоника (t5/3, t6, t6/4)',
    functionGroup: 'Тоника (T)',
    functionalStrengthRu: 'Абсолютная устойчивость (центр ладового покоя)',
    harmonicRoleRu: 'Главная опора и гармонический фундамент тональности',
    usageMethodsRu: 'Применяется для экспонирования тональности, утверждения устоя и завершения автентических/плагальных каденций.',
    descMajorRu: 'Мажорное тоническое трезвучие. Гармонический центр и абсолютная точка покоя.',
    descMinorRu: 'Минорное тоническое трезвучие. Главный устой минорного лада.',
    resolutionsScheme: [
      {
        toChord: 'S (IV)',
        formula: 'T → S → D → T',
        voiceLeadingRu: 'Плавное голосоведение с сохранением общего звука I ступени в верхних голосах',
        contextRu: 'Полный функциональный каданс (T-S-D-T)',
      },
      {
        toChord: 'D6/4',
        formula: 'T → D6/4 → T6',
        voiceLeadingRu: 'Встречное движение баса (I-II-III) и сопрано (III-II-I); тенор держит общий звук V',
        contextRu: 'Восходящий проходящий оборот',
      },
      {
        toChord: 'S6/4',
        formula: 'T → S6/4 → T',
        voiceLeadingRu: 'Бас удерживается на I ступени, терция и квинта тоники делают вспомогательный шаг вверх',
        contextRu: 'Вспомогательный плагальный оборот',
      },
      {
        toChord: 'II6/5',
        formula: 'T → II6/5 → K6/4 → D7 → T',
        voiceLeadingRu: 'Переход в субдоминантовый квинтсекстаккорд перед каденцией',
        contextRu: 'Классический кадансовый оборот',
      },
    ],
  },
  {
    id: 'deg_K64',
    degreeRoman: 'K6/4',
    degreeNumber: 1,
    labelMajor: 'K6/4',
    labelMinor: 'k6/4',
    nameMajorRu: 'Кадансовый квартсекстаккорд (K6/4)',
    nameMinorRu: 'Кадансовый квартсекстаккорд (k6/4)',
    functionGroup: 'Тоника / Каданс',
    functionalStrengthRu: 'Сильное кадансовое бифункциональное напряжение (T/D)',
    harmonicRoleRu: 'Двойственная природа: тонические звуки на доминантовом басу',
    usageMethodsRu: 'Берется на сильную долю перед доминантой в формуле K6/4 -> D7 -> T, концентрируя кадансовую энергию.',
    descMajorRu: 'Тонический квартсекстаккорд на басу V ступени перед доминантой.',
    descMinorRu: 'Минорный кадансовый квартсекстаккорд на басу V ступени.',
    resolutionsScheme: [
      {
        toChord: 'V7 (D7)',
        formula: 'K6/4 → D7 → T',
        voiceLeadingRu: 'Задержания 8-7, 6-5, 4-3 разрешаются на ступень вниз на неизменном басу V ступени',
        contextRu: 'Главное классическое кадансовое разрешение',
      },
      {
        toChord: 'V (D5/3)',
        formula: 'K6/4 → D5/3 → T',
        voiceLeadingRu: 'Кварта и секста переходят на ступень вниз в терцию и квинту доминантового трезвучия',
        contextRu: 'Разрешение в доминантовое трезвучие',
      },
    ],
  },

  // 2. СУБДОМИНАНТОВАЯ ГРУППА (S)
  {
    id: 'deg_IV',
    degreeRoman: 'IV',
    degreeNumber: 4,
    labelMajor: 'IV (S)',
    labelMinor: 'IV (s)',
    nameMajorRu: 'IV ступень — Главная субдоминанта (S5/3, S6, S6/4)',
    nameMinorRu: 'IV ступень — Главная субдоминанта (s5/3, s6, s6/4)',
    functionGroup: 'Субдоминанта (S)',
    functionalStrengthRu: 'Мягкая преддоминантовая неустойчивость',
    harmonicRoleRu: 'Главный гармонический контраст к тонике',
    usageMethodsRu: 'Обеспечивает естественный уход от тонического покоя в развитие (T -> S -> D -> T) и плагальные обороты (S -> T).',
    descMajorRu: 'Главная субдоминанта мажора, движение от покоя в гармоническое развитие.',
    descMinorRu: 'Главная минорная субдоминанта, глубокий контраст с тоникой.',
    resolutionsScheme: [
      {
        toChord: 'K6/4',
        formula: 'S5/3 → K6/4 → D7 → T',
        voiceLeadingRu: 'Бас IV делает плавный шаг вверх в V; общий тон I удерживается',
        contextRu: 'Вход в каденцию через кадансовый квартсекстаккорд',
      },
      {
        toChord: 'V (D5/3)',
        formula: 'S5/3 → D5/3 → T',
        voiceLeadingRu: 'Противоположное движение: бас вверх (IV → V), три верхних голоса вниз на ближайшие тоны',
        contextRu: 'Прямое гармоническое соединение S и D',
      },
      {
        toChord: 'I (T)',
        formula: 'S → T',
        voiceLeadingRu: 'Плагальное разрешение: общий тон I на месте, VI и IV ступени идут плавно вниз',
        contextRu: 'Плагальная каденция ("Аминь")',
      },
    ],
  },
  {
    id: 'deg_II',
    degreeRoman: 'II',
    degreeNumber: 2,
    labelMajor: 'II',
    labelMinor: 'II°',
    nameMajorRu: 'II ступень — Трезвучие (II5/3, II6)',
    nameMinorRu: 'II ступень — Уменьшенное трезвучие (II°5/3, II°6)',
    functionGroup: 'Субдоминанта (S)',
    functionalStrengthRu: 'Умеренная субдоминантовая неустойчивость',
    harmonicRoleRu: 'Субдоминанта секстовой группы, развивающий аккорд',
    usageMethodsRu: 'Секстаккорд II6 применяется перед кадансовым K6/4 или доминантой как самое чистое кадансовое звено.',
    descMajorRu: 'Минорное трезвучие и секстаккорд II ступени.',
    descMinorRu: 'Уменьшенное трезвучие и секстаккорд II ступени минора.',
    resolutionsScheme: [
      {
        toChord: 'K6/4',
        formula: 'II6 → K6/4 → D7 → T',
        voiceLeadingRu: 'Секстаккорд II6 с удвоенным басом (IV ступень) плавно переходит в бас V ступени',
        contextRu: 'Нормативный вход в каденцию через II6',
      },
      {
        toChord: 'V7 (D7)',
        formula: 'II5/3 → V7 → T',
        voiceLeadingRu: 'Ход по квинтовому кругу: бас спускается на квинту вниз (II → V)',
        contextRu: 'Квинтовое функциональное движение (II - V - I)',
      },
    ],
  },
  {
    id: 'deg_II7',
    degreeRoman: 'II7',
    degreeNumber: 2,
    labelMajor: 'II7',
    labelMinor: 'IIø7',
    nameMajorRu: 'II ступень — Септаккорд (II7, II6/5, II4/3, II2)',
    nameMinorRu: 'II ступень — Полууменьшенный септаккорд (IIø7, IIø6/5, IIø4/3, IIø2)',
    functionGroup: 'Субдоминанта (S)',
    functionalStrengthRu: 'Сильная диссонантная субдоминантовая энергия',
    harmonicRoleRu: 'Ключевой преддоминантовый септаккорд (гармония II-V-I)',
    usageMethodsRu: 'Применяется в полных каденциях: квинтсекстаккорд II6/5 и секундаккорд II2 естественно разрешаются в K6/4 или D7.',
    descMajorRu: 'Малый минорный септаккорд II ступени и его обращения.',
    descMinorRu: 'Полууменьшенный септаккорд II ступени натурального и гармонического минора.',
    resolutionsScheme: [
      {
        toChord: 'K6/4 / D7',
        formula: 'II6/5 → K6/4 → D7 → T',
        voiceLeadingRu: 'Бас IV ступени делает шаг в V; септима (I ступень) удерживается на месте как общий тон кадансового аккорда',
        contextRu: 'Главная кадансовая формула с субдоминантовым септаккордом',
      },
      {
        toChord: 'V7 (D7)',
        formula: 'II2 → D7 → T',
        voiceLeadingRu: 'Секундаккорд II2: септима в басу (I ступень) спускается на секунду вниз в бас V ступени D7',
        contextRu: 'Плавное поступенное разрешение баса',
      },
      {
        toChord: 'D6/5',
        formula: 'II4/3 → D6/5 → T',
        voiceLeadingRu: 'Бас VI ступени плавно спускается на секунду в вводный тон VII ступени D6/5',
        contextRu: 'Проходящее соединение обращений',
      },
    ],
  },
  {
    id: 'deg_II7_alt',
    degreeRoman: 'II7альт',
    degreeNumber: 2,
    labelMajor: 'II7альт',
    labelMinor: 'II7альт',
    nameMajorRu: 'II ступень — Альтерированный септаккорд (II7b5, II4/3b5, DD7)',
    nameMinorRu: 'II ступень — Альтерированный септаккорд (II7b5, увел. терцквартаккорд, DD7)',
    functionGroup: 'Субдоминанта (S / DD)',
    functionalStrengthRu: 'Острая альтерированная неустойчивость высокой экспрессии',
    harmonicRoleRu: 'Двойная доминанта (DD) или альтерированная субдоминанта',
    usageMethodsRu: 'Обостряет тяготение к басу и тонам доминанты, звучит в кульминациях перед K6/4 или D7 с пониженной квинтой.',
    descMajorRu: 'Септаккорд II ступени с пониженной 5 ступенью (II7b5) или двойная доминанта (DD7).',
    descMinorRu: 'Альтерированный субдоминантовый септаккорд (дважды уменьшенный / увеличенный терцкварт).',
    resolutionsScheme: [
      {
        toChord: 'K6/4',
        formula: 'DD7 / II7b5 → K6/4 → D7 → T',
        voiceLeadingRu: 'Повышенная терция (#IV) и пониженная квинта (bVI) двусторонне охватывают квинту тональности V',
        contextRu: 'Кульминационный кадансовый вход двойной доминанты',
      },
      {
        toChord: 'V7 (D7)',
        formula: 'DD4/3 / II4/3b5 → D7',
        voiceLeadingRu: 'Прямой хроматический полутоновый переход альтераций в тоны доминанты',
        contextRu: 'Прямое альтерированное разрешение',
      },
    ],
  },
  {
    id: 'deg_S_alt',
    degreeRoman: 'Sальт',
    degreeNumber: 4,
    labelMajor: 'Sальт',
    labelMinor: 'Sальт',
    nameMajorRu: 'Альтерированная субдоминанта (IV# / N6 / sгарм)',
    nameMinorRu: 'Альтерированная субдоминанта (N6 Неаполитанский / s#IV)',
    functionGroup: 'Субдоминанта (S альт.)',
    functionalStrengthRu: 'Максимальная красочная альтерация и экспрессия',
    harmonicRoleRu: 'Неаполитанский секстаккорд (N6) или субдоминанта с #IV',
    usageMethodsRu: 'Неаполитанский аккорд N6 разрешается широким шагом в K6/4 или D7, создавая глубокий патетический колорит.',
    descMajorRu: 'Субдоминанта с повышенной IV ступенью (#IV), гармонический s или Неаполитанский аккорд.',
    descMinorRu: 'Неаполитанский секстаккорд (N6), повышенная IV ступень в миноре.',
    resolutionsScheme: [
      {
        toChord: 'k6/4 / D7',
        formula: 'N6 (Неаполитанский) → K6/4 → D7 → t',
        voiceLeadingRu: 'Неаполитанская bII ступень спускается на секунду вниз в I ступень или вводный тон VII#',
        contextRu: 'Патетическая романтическая каденция с неаполитанской гармонией',
      },
      {
        toChord: 'D5/3',
        formula: 's#IV → D5/3',
        voiceLeadingRu: 'Повышенная #IV ступень и VI ступень сходятся встречно на полутон в тон V',
        contextRu: 'Фригийский альтерированный полукаданс',
      },
    ],
  },

  // 3. ДОМИНАНТОВАЯ ГРУППА (D)
  {
    id: 'deg_V',
    degreeRoman: 'V',
    degreeNumber: 5,
    labelMajor: 'V (D5/3)',
    labelMinor: 'V (D5/3)',
    nameMajorRu: 'V ступень — Доминанта трезвучие (D5/3, D6, D6/4)',
    nameMinorRu: 'V ступень — Гармоническая доминанта (D5/3, D6, D6/4)',
    functionGroup: 'Доминанта (D)',
    functionalStrengthRu: 'Сильное автентическое тяготение к тоническому устою',
    harmonicRoleRu: 'Главная доминанта, содержащая вводный тон VII ступени',
    usageMethodsRu: 'Используется в половинных каденциях для остановки дыхания и в полных оборотах D -> T для утверждения лада.',
    descMajorRu: 'Мажорное доминантовое трезвучие с ярким тяготением в тонику.',
    descMinorRu: 'ВСЕГДА МАЖОРНАЯ доминанта с повышенной VII гармонической ступенью.',
    resolutionsScheme: [
      {
        toChord: 'I (T5/3)',
        formula: 'D5/3 → T5/3',
        voiceLeadingRu: 'Вводный тон VII идет строго вверх в I; квинта II идет в I или III; бас V скачком в I',
        contextRu: 'Главное автентическое разрешение',
      },
      {
        toChord: 'VI (Субмедианта)',
        formula: 'D5/3 → VI',
        voiceLeadingRu: 'Прерванный оборот: бас V идет на ступень вверх в VI, верхние голоса разрешаются как в тонику',
        contextRu: 'Прерванная каденция (эмоциональный перелом)',
      },
    ],
  },
  {
    id: 'deg_D_add6',
    degreeRoman: 'D+6',
    degreeNumber: 5,
    labelMajor: 'D+6',
    labelMinor: 'D+6',
    nameMajorRu: 'Доминанта с секстой (D+6 / D7+6)',
    nameMinorRu: 'Гармоническая доминанта с секстой (D+6 / D7+6)',
    functionGroup: 'Доминанта (D)',
    functionalStrengthRu: 'Изысканное романтическое доминантовое напряжение',
    harmonicRoleRu: 'Доминанта с заменой квинты на сексту (III ступень лада)',
    usageMethodsRu: 'Секста звучит как задержание, переходящее в квинту, либо разрешается нисходящим скачком в терцию тоники (Шопен, Рахманинов).',
    descMajorRu: 'Доминантовый аккорд с секстой вместо квинты (романтическое созвучие).',
    descMinorRu: 'Мажорная доминанта гармонического минора с секстой (III ступень минора).',
    resolutionsScheme: [
      {
        toChord: 'I (T)',
        formula: 'D+6 → I5/3 / I6',
        voiceLeadingRu: 'Секста (III ступень) разрешается нисходящим скачком на терцию в тонику или переходит в квинту',
        contextRu: 'Романтическое доминантовое разрешение (Шопен, Рахманинов)',
      },
      {
        toChord: 'V7 (D7)',
        formula: 'D+6 → D7 → T',
        voiceLeadingRu: 'Секста спускается в квинту или септиму доминанты перед классическим разрешением в тонику',
        contextRu: 'Внутридоминантовое задержание',
      },
    ],
  },
  {
    id: 'deg_V7',
    degreeRoman: 'V7',
    degreeNumber: 5,
    labelMajor: 'V7 (D7)',
    labelMinor: 'V7 (D7)',
    nameMajorRu: 'V ступень — Доминантсептаккорд (D7, D6/5, D4/3, D2)',
    nameMinorRu: 'V ступень — Гармонический D7 (D7, D6/5, D4/3, D2)',
    functionGroup: 'Доминанта (D)',
    functionalStrengthRu: 'Острый тритоновый диссонанс обязательного разрешения',
    harmonicRoleRu: 'Фундаментальный двигатель тонально-гармонической системы',
    usageMethodsRu: 'Образует тритон между терцией (VII ступень) и септимой (IV ступень), разрешающийся в устойчивую тоническую терцию (D7 -> T).',
    descMajorRu: 'Классический малый мажорный доминантсептаккорд и его обращения.',
    descMinorRu: 'ВСЕГДА МАЖОРНЫЙ доминантсептаккорд гармонического минора с вводным тоном.',
    resolutionsScheme: [
      {
        toChord: 'I (T неполн.)',
        formula: 'D7 → T5/3 (с утроенной примой)',
        voiceLeadingRu: 'Септима (IV) строго на ступень вниз в III; вводный тон (VII) строго вверх в I; квинта II в I',
        contextRu: 'Строгое каноническое автентическое разрешение D7',
      },
      {
        toChord: 'I (T5/3)',
        formula: 'D6/5 → T5/3 (полное)',
        voiceLeadingRu: 'Бас VII ступени (вводный тон) идет вверх в I; септима IV идет вниз в III',
        contextRu: 'Разрешение квинтсекстаккорда',
      },
      {
        toChord: 'I (T5/3)',
        formula: 'D4/3 → T5/3 (полное)',
        voiceLeadingRu: 'Бас II ступени идет в I или III; септима IV идет вниз в III',
        contextRu: 'Разрешение терцквартаккорда',
      },
      {
        toChord: 'I6 (T6)',
        formula: 'D2 → T6',
        voiceLeadingRu: 'Бас IV ступени (септима) строго спускается на ступень вниз в терцовый бас тонического секстаккорда',
        contextRu: 'Разрешение секундаккода в тонический секстаккорд',
      },
    ],
  },
  {
    id: 'deg_D9',
    degreeRoman: 'D9',
    degreeNumber: 5,
    labelMajor: 'D9',
    labelMinor: 'D7b9',
    nameMajorRu: 'Доминантнонаккорд (D9 / D7b9)',
    nameMinorRu: 'Гармонический доминантнонаккорд (D7b9)',
    functionGroup: 'Доминанта (D)',
    functionalStrengthRu: 'Предельная плотность доминантового напряжения',
    harmonicRoleRu: 'Пятизвучная доминанта с ноной (большой в мажоре, малой в миноре)',
    usageMethodsRu: 'Применяется в кульминациях симфонических и оперных фраз; нона плавно разрешается на ступень вниз в квинту или терцию.',
    descMajorRu: 'Большой или малый доминантнонаккорд (D9 в мажоре).',
    descMinorRu: 'Малый доминантнонаккорд (D7b9 с пониженной 9 ступенью в миноре).',
    resolutionsScheme: [
      {
        toChord: 'V7 (D7)',
        formula: 'D9 → D7 → T',
        voiceLeadingRu: 'Нона (VI в мажоре, bVI в миноре) плавно спускается на ступень вниз в квинту доминанты',
        contextRu: 'Внутридоминантовая подготовка перед каденцией',
      },
      {
        toChord: 'I (T5/3)',
        formula: 'D9 → T5/3',
        voiceLeadingRu: 'Прямое разрешение пятизвучия: нона спускается в квинту тоники',
        contextRu: 'Прямое симфоническое разрешение',
      },
    ],
  },
  {
    id: 'deg_VII',
    degreeRoman: 'VII',
    degreeNumber: 7,
    labelMajor: 'VII°',
    labelMinor: 'VII°7',
    nameMajorRu: 'VII ступень — Вводный аккорд (VII°5/3, VIIø7)',
    nameMinorRu: 'VII ступень — Уменьшенный вводный септаккорд (VII°7, VII°6/5, VII°4/3, VII°2)',
    functionGroup: 'Доминанта (VII°)',
    functionalStrengthRu: 'Максимальный симметричный тритоновый диссонанс',
    harmonicRoleRu: 'Бестониковая доминанта, вводный уменьшенный септаккорд',
    usageMethodsRu: 'В гармоническом миноре состоит из трех малых терций; разрешается прямо в тонику с удвоением терции (VII°7 -> t5/3) или через D6/5.',
    descMajorRu: 'Уменьшенное вводное созвучие и полууменьшенный септаккорд VII ступени.',
    descMinorRu: 'Драматичный уменьшенный вводный септаккорд гармонического минора (три малые терции).',
    resolutionsScheme: [
      {
        toChord: 't (с удвоенной терцией)',
        formula: 'VII°7 → t5/3',
        voiceLeadingRu: 'Все тяготеющие звуки разрешаются внутрь: септима bVI вниз в V, вводный тон VII# вверх в I, уменьшенная квинта IV вниз в III',
        contextRu: 'Разрешение уменьшенного вводного септаккорда прямо в тонику',
      },
      {
        toChord: 'D6/5',
        formula: 'VII°7 → D6/5 → T',
        voiceLeadingRu: 'Септима опускается на полтона, превращая созвучие в доминантовый квинтсекстаккорд',
        contextRu: 'Внутрифункциональный переход через доминанту',
      },
    ],
  },

  // 4. МЕДИАНТЫ И ПЕРЕМЕННЫЕ ФУНКЦИИ
  {
    id: 'deg_VI',
    degreeRoman: 'VI',
    degreeNumber: 6,
    labelMajor: 'VI',
    labelMinor: 'VI',
    nameMajorRu: 'VI ступень — Субмедианта (VI5/3, VI6)',
    nameMinorRu: 'VI ступень — Субмедианта (VI5/3, VI6)',
    functionGroup: 'Медианта (VI)',
    functionalStrengthRu: 'Мягкая бифункциональная переменность (T/S)',
    harmonicRoleRu: 'Основа прерванной каденции и параллельной тональности',
    usageMethodsRu: 'Применяется в прерванном обороте D7 -> VI вместо ожидаемой тоники, создавая эмоциональный перелом и расширяя форму.',
    descMajorRu: 'Параллельный минор к мажору, разрешение прерванного оборота (D7 -> VI).',
    descMinorRu: 'Мажорное трезвучие VI ступени, основа прерванной каденции минора (D7 -> VI).',
    resolutionsScheme: [
      {
        toChord: 'IV / II6',
        formula: 'VI → IV → K6/4 → D7 → T',
        voiceLeadingRu: 'Развитие из субмедианты через субдоминантовую группу к полной каденции',
        contextRu: 'Гармоническое развитие после прерванного оборота',
      },
      {
        toChord: 'VI (в прерванной каденции)',
        formula: 'D7 → VI',
        voiceLeadingRu: 'Бас на секунду вверх; удвоение терции в трезвучии VI ступени',
        contextRu: 'Прерванная каденция (D7 → VI)',
      },
    ],
  },
  {
    id: 'deg_III',
    degreeRoman: 'III',
    degreeNumber: 3,
    labelMajor: 'III',
    labelMinor: 'III',
    nameMajorRu: 'III ступень — Верхняя медианта (III5/3, III6)',
    nameMinorRu: 'III ступень — Параллельный мажор (III5/3, III6)',
    functionGroup: 'Медианта (III)',
    functionalStrengthRu: 'Слабая переменная функция (T/D)',
    harmonicRoleRu: 'Тоника параллельного мажора в натуральном миноре',
    usageMethodsRu: 'Используется в секвенциях, романтической пейзажной лирике и для модуляции в параллельную тональность.',
    descMajorRu: 'Слабая переменная функция между тоникой и доминантой.',
    descMinorRu: 'Мажорное трезвучие III ступени — тоника параллельного мажора.',
    resolutionsScheme: [
      {
        toChord: 'VI (Субмедианта)',
        formula: 'III → VI → II → V → T',
        voiceLeadingRu: 'Движение по квинтовому кругу через медианты к тонике',
        contextRu: 'Золотая секвенция (квинтовый круг)',
      },
      {
        toChord: 'IV (Субдоминанта)',
        formula: 'T → III → IV → D → T',
        voiceLeadingRu: 'Медиантовое расширение гармонии в романтическом складе',
        contextRu: 'Медиантовый оборот',
      },
    ],
  },
];

export interface PopularTonalChordItem {
  id: string; // e.g. 'v_T53', 'v_T6', 'v_D65'
  degreeId: string; // e.g. 'deg_I', 'deg_V7'
  functionGroup: 'T' | 'S' | 'D' | 'M';
  symbolMajor: string; // e.g. 'T6'
  symbolMinor: string; // e.g. 't6'
  symbolRomanMajor: string; // e.g. 'I6'
  symbolRomanMinor: string; // e.g. 'i6'
  nameMajorRu: string; // e.g. 'Тонический секстаккорд (T6)'
  nameMinorRu: string; // e.g. 'Тонический секстаккорд (t6)'
  inversionTypeRu: string; // e.g. 'Секстаккорд (бас на III ст.)'
  bassStepRu: string; // 'I ст.', 'III ст.', 'IV ст.', 'V ст.', 'VII ст.'
  isRootPosition: boolean; // false for inversions, true for 5/3 and 7
  isPopularInversion: boolean; // true for famous inversions
}

export const POPULAR_TONAL_CHORDS: PopularTonalChordItem[] = [
  // 1. Тоника & Каданс (T)
  {
    id: 'v_T53',
    degreeId: 'deg_I',
    functionGroup: 'T',
    symbolMajor: 'T5/3',
    symbolMinor: 't5/3',
    symbolRomanMajor: 'I5/3',
    symbolRomanMinor: 'i5/3',
    nameMajorRu: 'Тоническое трезвучие (T5/3)',
    nameMinorRu: 'Тоническое трезвучие (t5/3)',
    inversionTypeRu: 'Основной вид (бас на I ст.)',
    bassStepRu: 'I ст.',
    isRootPosition: true,
    isPopularInversion: false,
  },
  {
    id: 'v_T6',
    degreeId: 'deg_I',
    functionGroup: 'T',
    symbolMajor: 'T6',
    symbolMinor: 't6',
    symbolRomanMajor: 'I6',
    symbolRomanMinor: 'i6',
    nameMajorRu: 'Тонический секстаккорд (T6)',
    nameMinorRu: 'Тонический секстаккорд (t6)',
    inversionTypeRu: 'Секстаккорд (бас на III ст.)',
    bassStepRu: 'III ст.',
    isRootPosition: false,
    isPopularInversion: true,
  },
  {
    id: 'v_T64',
    degreeId: 'deg_I',
    functionGroup: 'T',
    symbolMajor: 'T6/4',
    symbolMinor: 't6/4',
    symbolRomanMajor: 'I6/4',
    symbolRomanMinor: 'i6/4',
    nameMajorRu: 'Тонический квартсекстаккорд (T6/4)',
    nameMinorRu: 'Тонический квартсекстаккорд (t6/4)',
    inversionTypeRu: 'Квартсекстаккорд (бас на V ст.)',
    bassStepRu: 'V ст.',
    isRootPosition: false,
    isPopularInversion: true,
  },
  {
    id: 'v_K64',
    degreeId: 'deg_K64',
    functionGroup: 'T',
    symbolMajor: 'K6/4',
    symbolMinor: 'k6/4',
    symbolRomanMajor: 'K6/4',
    symbolRomanMinor: 'k6/4',
    nameMajorRu: 'Кадансовый квартсекстаккорд (K6/4)',
    nameMinorRu: 'Кадансовый квартсекстаккорд (k6/4)',
    inversionTypeRu: 'Кадансовый оборот (бас на V ст.)',
    bassStepRu: 'V ст.',
    isRootPosition: true,
    isPopularInversion: true,
  },

  // 2. Субдоминанта (S)
  {
    id: 'v_S53',
    degreeId: 'deg_IV',
    functionGroup: 'S',
    symbolMajor: 'S5/3',
    symbolMinor: 's5/3',
    symbolRomanMajor: 'IV5/3',
    symbolRomanMinor: 'iv5/3',
    nameMajorRu: 'Субдоминантовое трезвучие (S5/3)',
    nameMinorRu: 'Субдоминантовое трезвучие (s5/3)',
    inversionTypeRu: 'Основной вид (бас на IV ст.)',
    bassStepRu: 'IV ст.',
    isRootPosition: true,
    isPopularInversion: false,
  },
  {
    id: 'v_S6',
    degreeId: 'deg_IV',
    functionGroup: 'S',
    symbolMajor: 'S6',
    symbolMinor: 's6',
    symbolRomanMajor: 'IV6',
    symbolRomanMinor: 'iv6',
    nameMajorRu: 'Субдоминантовый секстаккорд (S6)',
    nameMinorRu: 'Субдоминантовый секстаккорд (s6)',
    inversionTypeRu: 'Секстаккорд (бас на VI ст.)',
    bassStepRu: 'VI ст.',
    isRootPosition: false,
    isPopularInversion: true,
  },
  {
    id: 'v_S64',
    degreeId: 'deg_IV',
    functionGroup: 'S',
    symbolMajor: 'S6/4',
    symbolMinor: 's6/4',
    symbolRomanMajor: 'IV6/4',
    symbolRomanMinor: 'iv6/4',
    nameMajorRu: 'Субдоминантовый квартсекстаккорд (S6/4)',
    nameMinorRu: 'Субдоминантовый квартсекстаккорд (s6/4)',
    inversionTypeRu: 'Квартсекстаккорд (бас на I ст.)',
    bassStepRu: 'I ст.',
    isRootPosition: false,
    isPopularInversion: true,
  },
  {
    id: 'v_s53',
    degreeId: 'deg_S_alt',
    functionGroup: 'S',
    symbolMajor: 's5/3',
    symbolMinor: 's5/3',
    symbolRomanMajor: 'iv5/3',
    symbolRomanMinor: 'iv5/3',
    nameMajorRu: 'Гармоническая минорная субдоминанта (s5/3)',
    nameMinorRu: 'Минорная субдоминанта (s5/3)',
    inversionTypeRu: 'Основной вид (бас на IV ст.)',
    bassStepRu: 'IV ст.',
    isRootPosition: true,
    isPopularInversion: false,
  },
  {
    id: 'v_II53',
    degreeId: 'deg_II',
    functionGroup: 'S',
    symbolMajor: 'II5/3',
    symbolMinor: 'II°5/3',
    symbolRomanMajor: 'II5/3',
    symbolRomanMinor: 'ii°5/3',
    nameMajorRu: 'Трезвучие II ступени (II5/3)',
    nameMinorRu: 'Уменьшенное трезвучие II ст. (II°5/3)',
    inversionTypeRu: 'Основной вид (бас на II ст.)',
    bassStepRu: 'II ст.',
    isRootPosition: true,
    isPopularInversion: false,
  },
  {
    id: 'v_II6',
    degreeId: 'deg_II',
    functionGroup: 'S',
    symbolMajor: 'II6',
    symbolMinor: 'II°6',
    symbolRomanMajor: 'II6',
    symbolRomanMinor: 'ii°6',
    nameMajorRu: 'Секстаккорд II ступени (II6)',
    nameMinorRu: 'Уменьшенный секстаккорд II ст. (II°6)',
    inversionTypeRu: 'Секстаккорд (бас на IV ст.)',
    bassStepRu: 'IV ст.',
    isRootPosition: false,
    isPopularInversion: true,
  },
  {
    id: 'v_II7',
    degreeId: 'deg_II7',
    functionGroup: 'S',
    symbolMajor: 'II7',
    symbolMinor: 'IIø7',
    symbolRomanMajor: 'II7',
    symbolRomanMinor: 'iiø7',
    nameMajorRu: 'Септаккорд II ступени (II7)',
    nameMinorRu: 'Полууменьшенный септаккорд (IIø7)',
    inversionTypeRu: 'Основной вид (бас на II ст.)',
    bassStepRu: 'II ст.',
    isRootPosition: true,
    isPopularInversion: false,
  },
  {
    id: 'v_II65',
    degreeId: 'deg_II7',
    functionGroup: 'S',
    symbolMajor: 'II6/5',
    symbolMinor: 'IIø6/5',
    symbolRomanMajor: 'II6/5',
    symbolRomanMinor: 'iiø6/5',
    nameMajorRu: 'Квинтсекстаккорд II ступени (II6/5)',
    nameMinorRu: 'Полууменьшенный квинтсекстаккорд (IIø6/5)',
    inversionTypeRu: 'Квинтсекстаккорд (бас на IV ст.)',
    bassStepRu: 'IV ст.',
    isRootPosition: false,
    isPopularInversion: true,
  },
  {
    id: 'v_II43',
    degreeId: 'deg_II7',
    functionGroup: 'S',
    symbolMajor: 'II4/3',
    symbolMinor: 'IIø4/3',
    symbolRomanMajor: 'II4/3',
    symbolRomanMinor: 'iiø4/3',
    nameMajorRu: 'Терцквартаккорд II ступени (II4/3)',
    nameMinorRu: 'Полууменьшенный терцквартаккорд (IIø4/3)',
    inversionTypeRu: 'Терцквартаккорд (бас на VI ст.)',
    bassStepRu: 'VI ст.',
    isRootPosition: false,
    isPopularInversion: true,
  },
  {
    id: 'v_II2',
    degreeId: 'deg_II7',
    functionGroup: 'S',
    symbolMajor: 'II2',
    symbolMinor: 'IIø2',
    symbolRomanMajor: 'II2',
    symbolRomanMinor: 'iiø2',
    nameMajorRu: 'Секундаккорд II ступени (II2)',
    nameMinorRu: 'Полууменьшенный секундаккорд (IIø2)',
    inversionTypeRu: 'Секундаккорд (бас на I ст.)',
    bassStepRu: 'I ст.',
    isRootPosition: false,
    isPopularInversion: true,
  },
  {
    id: 'v_N6',
    degreeId: 'deg_S_alt',
    functionGroup: 'S',
    symbolMajor: 'N6',
    symbolMinor: 'N6',
    symbolRomanMajor: 'II♭6',
    symbolRomanMinor: 'II♭6',
    nameMajorRu: 'Неаполитанский секстаккорд (N6)',
    nameMinorRu: 'Неаполитанский секстаккорд (N6)',
    inversionTypeRu: 'Секстаккорд пониженной II ст. (бас IV)',
    bassStepRu: 'IV ст.',
    isRootPosition: false,
    isPopularInversion: true,
  },

  // 3. Доминанта (D)
  {
    id: 'v_D53',
    degreeId: 'deg_V',
    functionGroup: 'D',
    symbolMajor: 'D5/3',
    symbolMinor: 'D5/3',
    symbolRomanMajor: 'V5/3',
    symbolRomanMinor: 'V5/3',
    nameMajorRu: 'Доминантовое трезвучие (D5/3)',
    nameMinorRu: 'Гармоническая доминанта (D5/3)',
    inversionTypeRu: 'Основной вид (бас на V ст.)',
    bassStepRu: 'V ст.',
    isRootPosition: true,
    isPopularInversion: false,
  },
  {
    id: 'v_D6',
    degreeId: 'deg_V',
    functionGroup: 'D',
    symbolMajor: 'D6',
    symbolMinor: 'D6',
    symbolRomanMajor: 'V6',
    symbolRomanMinor: 'V6',
    nameMajorRu: 'Доминантовый секстаккорд (D6)',
    nameMinorRu: 'Доминантовый секстаккорд (D6)',
    inversionTypeRu: 'Секстаккорд (вводный тон VII в басу)',
    bassStepRu: 'VII ст.',
    isRootPosition: false,
    isPopularInversion: true,
  },
  {
    id: 'v_D64',
    degreeId: 'deg_V',
    functionGroup: 'D',
    symbolMajor: 'D6/4',
    symbolMinor: 'D6/4',
    symbolRomanMajor: 'V6/4',
    symbolRomanMinor: 'V6/4',
    nameMajorRu: 'Доминантовый квартсекстаккорд (D6/4)',
    nameMinorRu: 'Доминантовый квартсекстаккорд (D6/4)',
    inversionTypeRu: 'Квартсекстаккорд (бас на II ст.)',
    bassStepRu: 'II ст.',
    isRootPosition: false,
    isPopularInversion: true,
  },
  {
    id: 'v_D7',
    degreeId: 'deg_V7',
    functionGroup: 'D',
    symbolMajor: 'D7',
    symbolMinor: 'D7',
    symbolRomanMajor: 'V7',
    symbolRomanMinor: 'V7',
    nameMajorRu: 'Доминантсептаккорд (D7)',
    nameMinorRu: 'Гармонический D7 в миноре',
    inversionTypeRu: 'Основной вид (бас на V ст.)',
    bassStepRu: 'V ст.',
    isRootPosition: true,
    isPopularInversion: false,
  },
  {
    id: 'v_D65',
    degreeId: 'deg_V7',
    functionGroup: 'D',
    symbolMajor: 'D6/5',
    symbolMinor: 'D6/5',
    symbolRomanMajor: 'V6/5',
    symbolRomanMinor: 'V6/5',
    nameMajorRu: 'Доминантовый квинтсекстаккорд (D6/5)',
    nameMinorRu: 'Квинтсекстаккорд D7 в миноре (D6/5)',
    inversionTypeRu: 'Квинтсекстаккорд (вводный тон VII в басу)',
    bassStepRu: 'VII ст.',
    isRootPosition: false,
    isPopularInversion: true,
  },
  {
    id: 'v_D43',
    degreeId: 'deg_V7',
    functionGroup: 'D',
    symbolMajor: 'D4/3',
    symbolMinor: 'D4/3',
    symbolRomanMajor: 'V4/3',
    symbolRomanMinor: 'V4/3',
    nameMajorRu: 'Доминантовый терцквартаккорд (D4/3)',
    nameMinorRu: 'Терцквартаккорд D7 в миноре (D4/3)',
    inversionTypeRu: 'Терцквартаккорд (бас на II ст.)',
    bassStepRu: 'II ст.',
    isRootPosition: false,
    isPopularInversion: true,
  },
  {
    id: 'v_D2',
    degreeId: 'deg_V7',
    functionGroup: 'D',
    symbolMajor: 'D2',
    symbolMinor: 'D2',
    symbolRomanMajor: 'V2',
    symbolRomanMinor: 'V2',
    nameMajorRu: 'Доминантовый секундаккорд (D2)',
    nameMinorRu: 'Секундаккорд D7 в миноре (D2)',
    inversionTypeRu: 'Секундаккорд (септима / IV ст. в басу)',
    bassStepRu: 'IV ст.',
    isRootPosition: false,
    isPopularInversion: true,
  },
  {
    id: 'v_deg_D_add6_D_6',
    degreeId: 'deg_D_add6',
    functionGroup: 'D',
    symbolMajor: 'D+6',
    symbolMinor: 'D+6',
    symbolRomanMajor: 'V+6',
    symbolRomanMinor: 'V+6',
    nameMajorRu: 'Доминанта с секстой (D+6)',
    nameMinorRu: 'Доминанта с секстой (D+6)',
    inversionTypeRu: 'Основной вид с секстой',
    bassStepRu: 'V ст.',
    isRootPosition: true,
    isPopularInversion: false,
  },
  {
    id: 'v_deg_D_add6_D7_6',
    degreeId: 'deg_D_add6',
    functionGroup: 'D',
    symbolMajor: 'D7+6',
    symbolMinor: 'D7+6',
    symbolRomanMajor: 'V7+6',
    symbolRomanMinor: 'V7+6',
    nameMajorRu: 'Доминантсептаккорд с секстой (D7+6)',
    nameMinorRu: 'Доминантсептаккорд с секстой (D7+6)',
    inversionTypeRu: 'Доминантсептаккорд с секстой',
    bassStepRu: 'V ст.',
    isRootPosition: true,
    isPopularInversion: false,
  },
  {
    id: 'v_deg_D9_D9',
    degreeId: 'deg_D9',
    functionGroup: 'D',
    symbolMajor: 'D9',
    symbolMinor: 'D7♭9',
    symbolRomanMajor: 'V9',
    symbolRomanMinor: 'V7♭9',
    nameMajorRu: 'Большой доминантнонанаккорд (D9)',
    nameMinorRu: 'Малый доминантнонанаккорд (D7♭9)',
    inversionTypeRu: 'Основной вид (бас на V ст.)',
    bassStepRu: 'V ст.',
    isRootPosition: true,
    isPopularInversion: false,
  },
  {
    id: 'v_VII53',
    degreeId: 'deg_VII',
    functionGroup: 'D',
    symbolMajor: 'VII°5/3',
    symbolMinor: 'VII°5/3',
    symbolRomanMajor: 'VII°5/3',
    symbolRomanMinor: 'vii°5/3',
    nameMajorRu: 'Уменьшенное трезвучие VII ст. (VII°5/3)',
    nameMinorRu: 'Уменьшенное трезвучие VII ст. (VII°5/3)',
    inversionTypeRu: 'Основной вид (бас на VII ст.)',
    bassStepRu: 'VII ст.',
    isRootPosition: true,
    isPopularInversion: false,
  },
  {
    id: 'v_VII7',
    degreeId: 'deg_VII',
    functionGroup: 'D',
    symbolMajor: 'VIIø7',
    symbolMinor: 'VII°7',
    symbolRomanMajor: 'VIIø7',
    symbolRomanMinor: 'vii°7',
    nameMajorRu: 'Вводный септаккорд (VIIø7)',
    nameMinorRu: 'Уменьшенный вводный септаккорд (VII°7)',
    inversionTypeRu: 'Основной вид (вводный тон VII в басу)',
    bassStepRu: 'VII ст.',
    isRootPosition: true,
    isPopularInversion: false,
  },
  {
    id: 'v_VII65',
    degreeId: 'deg_VII',
    functionGroup: 'D',
    symbolMajor: 'VIIø6/5',
    symbolMinor: 'VII°6/5',
    symbolRomanMajor: 'VIIø6/5',
    symbolRomanMinor: 'vii°6/5',
    nameMajorRu: 'Вводный квинтсекстаккорд (VIIø6/5)',
    nameMinorRu: 'Ум. вводный квинтсекстаккорд (VII°6/5)',
    inversionTypeRu: 'Квинтсекстаккорд (бас на II ст.)',
    bassStepRu: 'II ст.',
    isRootPosition: false,
    isPopularInversion: true,
  },
  {
    id: 'v_VII43',
    degreeId: 'deg_VII',
    functionGroup: 'D',
    symbolMajor: 'VIIø4/3',
    symbolMinor: 'VII°4/3',
    symbolRomanMajor: 'VIIø4/3',
    symbolRomanMinor: 'vii°4/3',
    nameMajorRu: 'Вводный терцквартаккорд (VIIø4/3)',
    nameMinorRu: 'Ум. вводный терцквартаккорд (VII°4/3)',
    inversionTypeRu: 'Терцквартаккорд (бас на IV ст.)',
    bassStepRu: 'IV ст.',
    isRootPosition: false,
    isPopularInversion: true,
  },
  {
    id: 'v_VII2',
    degreeId: 'deg_VII',
    functionGroup: 'D',
    symbolMajor: 'VIIø2',
    symbolMinor: 'VII°2',
    symbolRomanMajor: 'VIIø2',
    symbolRomanMinor: 'vii°2',
    nameMajorRu: 'Вводный секундаккорд (VIIø2)',
    nameMinorRu: 'Ум. вводный секундаккорд (VII°2)',
    inversionTypeRu: 'Секундаккорд (бас на VI ст.)',
    bassStepRu: 'VI ст.',
    isRootPosition: false,
    isPopularInversion: true,
  },
  {
    id: 'v_deg_II7_alt_DD7',
    degreeId: 'deg_II7_alt',
    functionGroup: 'D',
    symbolMajor: 'DD7',
    symbolMinor: 'DD7',
    symbolRomanMajor: 'DD7',
    symbolRomanMinor: 'DD7',
    nameMajorRu: 'Двойная доминанта (DD7)',
    nameMinorRu: 'Двойная доминанта (DD7)',
    inversionTypeRu: 'Септаккорд II высокой ступени (бас II♯)',
    bassStepRu: 'II♯ ст.',
    isRootPosition: true,
    isPopularInversion: false,
  },

  // 4. Медианты (M)
  {
    id: 'v_VI53',
    degreeId: 'deg_VI',
    functionGroup: 'M',
    symbolMajor: 'VI5/3',
    symbolMinor: 'VI5/3',
    symbolRomanMajor: 'VI5/3',
    symbolRomanMinor: 'VI5/3',
    nameMajorRu: 'Трезвучие VI ступени (VI5/3)',
    nameMinorRu: 'Субмедианта / Прерванный каданс (VI5/3)',
    inversionTypeRu: 'Основной вид (бас на VI ст.)',
    bassStepRu: 'VI ст.',
    isRootPosition: true,
    isPopularInversion: false,
  },
  {
    id: 'v_VI6',
    degreeId: 'deg_VI',
    functionGroup: 'M',
    symbolMajor: 'VI6',
    symbolMinor: 'VI6',
    symbolRomanMajor: 'VI6',
    symbolRomanMinor: 'VI6',
    nameMajorRu: 'Секстаккорд VI ступени (VI6)',
    nameMinorRu: 'Секстаккорд VI ступени (VI6)',
    inversionTypeRu: 'Секстаккорд (тоника I в басу)',
    bassStepRu: 'I ст.',
    isRootPosition: false,
    isPopularInversion: true,
  },
  {
    id: 'v_III53',
    degreeId: 'deg_III',
    functionGroup: 'M',
    symbolMajor: 'III5/3',
    symbolMinor: 'III5/3',
    symbolRomanMajor: 'III5/3',
    symbolRomanMinor: 'III5/3',
    nameMajorRu: 'Верхняя медианта (III5/3)',
    nameMinorRu: 'Параллельный мажор (III5/3)',
    inversionTypeRu: 'Основной вид (бас на III ст.)',
    bassStepRu: 'III ст.',
    isRootPosition: true,
    isPopularInversion: false,
  },
  {
    id: 'v_III6',
    degreeId: 'deg_III',
    functionGroup: 'M',
    symbolMajor: 'III6',
    symbolMinor: 'III6',
    symbolRomanMajor: 'III6',
    symbolRomanMinor: 'III6',
    nameMajorRu: 'Секстаккорд III ступени (III6)',
    nameMinorRu: 'Секстаккорд III ступени (III6)',
    inversionTypeRu: 'Секстаккорд (бас на V ст.)',
    bassStepRu: 'V ст.',
    isRootPosition: false,
    isPopularInversion: true,
  },
];

/**
 * Calculates letter notation (e.g. C, C/E, G7/B, Dm7/F) for any popular tonal chord in any key.
 */
export function getChordLetterNotation(
  voicingId: string,
  tonicName: string,
  isMajor: boolean
): string {
  const pitchMap: Record<string, number> = {
    C: 0, 'C#': 1, 'C♯': 1, Cis: 1, Des: 1, 'Cis / Des': 1,
    D: 2, 'D#': 3, 'D♯': 3, Dis: 3, Es: 3, 'Dis / Es': 3,
    E: 4, F: 5,
    'F#': 6, 'F♯': 6, Fis: 6, Ges: 6, 'Fis / Ges': 6,
    G: 7, 'G#': 8, 'G♯': 8, Gis: 8, As: 8, 'Gis / As': 8,
    A: 9, 'A#': 10, 'A♯': 10, Ais: 10, 'B♭': 10, Bb: 10, 'Ais / B': 10,
    H: 11, B: 11,
  };

  const tonicPitch = pitchMap[tonicName] ?? 0;

  // Use flat naming if key typically uses flats
  const flatKeys = ['F', 'B', 'Bb', 'Es', 'As', 'Des', 'Ces', 'd', 'g', 'c', 'f', 'b', 'es'];
  const useFlats =
    flatKeys.some((k) => tonicName.toLowerCase().startsWith(k.toLowerCase())) ||
    tonicName.includes('b') ||
    tonicName.includes('es') ||
    tonicName.includes('Des');

  const sharpNotes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const flatNotes = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
  const noteList = useFlats ? flatNotes : sharpNotes;

  const noteAt = (semitones: number) => {
    const pitch = (tonicPitch + semitones + 120) % 12;
    return noteList[pitch];
  };

  if (isMajor) {
    switch (voicingId) {
      case 'v_T53': return `${noteAt(0)}`;
      case 'v_T6': return `${noteAt(0)}/${noteAt(4)}`;
      case 'v_T64': return `${noteAt(0)}/${noteAt(7)}`;
      case 'v_K64': return `${noteAt(0)}/${noteAt(7)} (K)`;
      case 'v_S53': return `${noteAt(5)}`;
      case 'v_S6': return `${noteAt(5)}/${noteAt(9)}`;
      case 'v_S64': return `${noteAt(5)}/${noteAt(0)}`;
      case 'v_s53': return `${noteAt(5)}m`;
      case 'v_II53': return `${noteAt(2)}m`;
      case 'v_II6': return `${noteAt(2)}m/${noteAt(5)}`;
      case 'v_II7': return `${noteAt(2)}m7`;
      case 'v_II65': return `${noteAt(2)}m7/${noteAt(5)}`;
      case 'v_II43': return `${noteAt(2)}m7/${noteAt(9)}`;
      case 'v_II2': return `${noteAt(2)}m7/${noteAt(0)}`;
      case 'v_N6': return `${noteAt(1)}/${noteAt(5)}`;
      case 'v_D53': return `${noteAt(7)}`;
      case 'v_D6': return `${noteAt(7)}/${noteAt(11)}`;
      case 'v_D64': return `${noteAt(7)}/${noteAt(2)}`;
      case 'v_D7': return `${noteAt(7)}7`;
      case 'v_D65': return `${noteAt(7)}7/${noteAt(11)}`;
      case 'v_D43': return `${noteAt(7)}7/${noteAt(2)}`;
      case 'v_D2': return `${noteAt(7)}7/${noteAt(5)}`;
      case 'v_deg_D_add6_D_6': return `${noteAt(7)}+6`;
      case 'v_deg_D_add6_D7_6': return `${noteAt(7)}7+6`;
      case 'v_deg_D9_D9': return `${noteAt(7)}9`;
      case 'v_deg_D9_D7b9': return `${noteAt(7)}7(♭9)`;
      case 'v_VII53': return `${noteAt(11)}°`;
      case 'v_VII7': return `${noteAt(11)}ø7`;
      case 'v_VII65': return `${noteAt(11)}ø7/${noteAt(2)}`;
      case 'v_VII43': return `${noteAt(11)}ø7/${noteAt(5)}`;
      case 'v_VII2': return `${noteAt(11)}ø7/${noteAt(9)}`;
      case 'v_deg_II7_alt_DD7': return `${noteAt(2)}7`;
      case 'v_VI53': return `${noteAt(9)}m`;
      case 'v_VI6': return `${noteAt(9)}m/${noteAt(0)}`;
      case 'v_III53': return `${noteAt(4)}m`;
      case 'v_III6': return `${noteAt(4)}m/${noteAt(7)}`;
      default: return `${noteAt(0)}`;
    }
  } else {
    // Minor
    switch (voicingId) {
      case 'v_T53': return `${noteAt(0)}m`;
      case 'v_T6': return `${noteAt(0)}m/${noteAt(3)}`;
      case 'v_T64': return `${noteAt(0)}m/${noteAt(7)}`;
      case 'v_K64': return `${noteAt(0)}m/${noteAt(7)} (k)`;
      case 'v_S53': return `${noteAt(5)}m`;
      case 'v_S6': return `${noteAt(5)}m/${noteAt(8)}`;
      case 'v_S64': return `${noteAt(5)}m/${noteAt(0)}`;
      case 'v_s53': return `${noteAt(5)}m`;
      case 'v_II53': return `${noteAt(2)}°`;
      case 'v_II6': return `${noteAt(2)}°/${noteAt(5)}`;
      case 'v_II7': return `${noteAt(2)}ø7`;
      case 'v_II65': return `${noteAt(2)}ø7/${noteAt(5)}`;
      case 'v_II43': return `${noteAt(2)}ø7/${noteAt(8)}`;
      case 'v_II2': return `${noteAt(2)}ø7/${noteAt(0)}`;
      case 'v_N6': return `${noteAt(1)}/${noteAt(5)}`;
      case 'v_D53': return `${noteAt(7)}`;
      case 'v_D6': return `${noteAt(7)}/${noteAt(11)}`;
      case 'v_D64': return `${noteAt(7)}/${noteAt(2)}`;
      case 'v_D7': return `${noteAt(7)}7`;
      case 'v_D65': return `${noteAt(7)}7/${noteAt(11)}`;
      case 'v_D43': return `${noteAt(7)}7/${noteAt(2)}`;
      case 'v_D2': return `${noteAt(7)}7/${noteAt(5)}`;
      case 'v_deg_D_add6_D_6': return `${noteAt(7)}+6`;
      case 'v_deg_D_add6_D7_6': return `${noteAt(7)}7+6`;
      case 'v_deg_D9_D7b9': return `${noteAt(7)}7(♭9)`;
      case 'v_VII53': return `${noteAt(11)}°`;
      case 'v_VII7': return `${noteAt(11)}°7`;
      case 'v_VII65': return `${noteAt(11)}°7/${noteAt(2)}`;
      case 'v_VII43': return `${noteAt(11)}°7/${noteAt(5)}`;
      case 'v_VII2': return `${noteAt(11)}°7/${noteAt(8)}`;
      case 'v_deg_II7_alt_DD7': return `${noteAt(2)}7`;
      case 'v_VI53': return `${noteAt(8)}`;
      case 'v_VI6': return `${noteAt(8)}/${noteAt(0)}`;
      case 'v_III53': return `${noteAt(3)}`;
      case 'v_III6': return `${noteAt(3)}/${noteAt(7)}`;
      default: return `${noteAt(0)}m`;
    }
  }
}

export interface TonalChordVoicing {
  id: string;
  degreeId: string;
  degreeRoman: string;
  degreeLabelRu: string;
  degreeNameRu: string;
  functionSymbolRu: string;
  degreeExplanationRu: string;
  chordQuality: 'major' | 'minor' | 'diminished' | 'augmented' | 'dominant';
  chordQualityRu: string;
  inversionName: string;
  isRootPosition: boolean;
  isPopularInversion?: boolean;
  semitonesFromTonic: number[];
}

function computeVoicingIdAndPopularFlag(v: { functionSymbolRu: string; degreeId: string; isRootPosition: boolean }): { id: string; isPopularInversion: boolean } {
  const sym = v.functionSymbolRu;
  if (sym.includes('K6/4') || sym.includes('k6/4')) return { id: 'v_K64', isPopularInversion: true };
  if (sym === 'T6' || sym === 't6') return { id: 'v_T6', isPopularInversion: true };
  if (sym === 'T6/4' || sym === 't6/4') return { id: 'v_T64', isPopularInversion: true };
  if (sym === 'T5/3' || sym === 't5/3') return { id: 'v_T53', isPopularInversion: false };

  if (sym === 'S6' || sym === 's6') return { id: 'v_S6', isPopularInversion: true };
  if (sym === 'S6/4' || sym === 's6/4') return { id: 'v_S64', isPopularInversion: false };
  if (sym === 'S5/3' || sym === 's5/3') return { id: 'v_S53', isPopularInversion: false };

  if (sym === 'II6' || sym === 'II°6') return { id: 'v_II6', isPopularInversion: true };
  if (sym === 'II5/3' || sym === 'II°5/3') return { id: 'v_II53', isPopularInversion: false };
  if (sym === 'II6/5' || sym === 'IIø6/5') return { id: 'v_II65', isPopularInversion: true };
  if (sym === 'II4/3' || sym === 'IIø4/3') return { id: 'v_II43', isPopularInversion: false };
  if (sym === 'II2' || sym === 'IIø2') return { id: 'v_II2', isPopularInversion: false };
  if (sym === 'II7' || sym === 'IIø7') return { id: 'v_II7', isPopularInversion: false };

  if (sym === 'N6') return { id: 'v_N6', isPopularInversion: true };
  if (sym === 'N5/3') return { id: 'v_N53', isPopularInversion: false };

  if (sym === 'D6/5') return { id: 'v_D65', isPopularInversion: true };
  if (sym === 'D4/3') return { id: 'v_D43', isPopularInversion: true };
  if (sym === 'D2') return { id: 'v_D2', isPopularInversion: true };
  if (sym === 'D7') return { id: 'v_D7', isPopularInversion: false };
  if (sym === 'D6') return { id: 'v_D6', isPopularInversion: true };
  if (sym === 'D6/4') return { id: 'v_D64', isPopularInversion: false };
  if (sym === 'D5/3') return { id: 'v_D53', isPopularInversion: false };

  if (sym.includes('VII°6/5') || sym.includes('VIIø6/5') || sym.includes('VII6/5')) return { id: 'v_VII65', isPopularInversion: true };
  if (sym.includes('VII°4/3') || sym.includes('VIIø4/3')) return { id: 'v_VII43', isPopularInversion: false };
  if (sym.includes('VII°2') || sym.includes('VIIø2')) return { id: 'v_VII2', isPopularInversion: false };
  if (sym.includes('VII7') || sym.includes('VIIø7') || sym.includes('VII°7')) return { id: 'v_VII7', isPopularInversion: false };
  if (sym.includes('VII5/3') || sym.includes('VII°5/3')) return { id: 'v_VII53', isPopularInversion: false };

  if (sym === 'VI6') return { id: 'v_VI6', isPopularInversion: true };
  if (sym === 'VI5/3') return { id: 'v_VI53', isPopularInversion: false };

  if (sym === 'III6') return { id: 'v_III6', isPopularInversion: false };
  if (sym === 'III5/3') return { id: 'v_III53', isPopularInversion: false };

  // Fallback
  return {
    id: `v_${v.degreeId}_${sym.replace(/[^a-zA-Z0-9]/g, '_')}`,
    isPopularInversion: !v.isRootPosition,
  };
}

type RawTonalChordVoicing = Omit<TonalChordVoicing, 'id' | 'isPopularInversion'> & {
  id?: string;
  isPopularInversion?: boolean;
};

export function getVoicingsForDegree(
  degreeId: string,
  isMajor: boolean,
  tonicNoteName: string
): TonalChordVoicing[] {
  const voicings: RawTonalChordVoicing[] = [];

  switch (degreeId) {
    case 'deg_I':
      if (isMajor) {
        voicings.push(
          {
            degreeId,
            degreeRoman: 'I',
            degreeLabelRu: 'I (T)',
            degreeNameRu: 'I ступень — Тоника (T5/3)',
            functionSymbolRu: 'T5/3',
            degreeExplanationRu: `Тоническое мажорное трезвучие ${tonicNoteName} dur в основном виде`,
            chordQuality: 'major',
            chordQualityRu: 'Мажорное трезвучие',
            inversionName: 'Основной вид (T5/3)',
            isRootPosition: true,
            semitonesFromTonic: [0, 4, 7],
          },
          {
            degreeId,
            degreeRoman: 'I',
            degreeLabelRu: 'I (T)',
            degreeNameRu: 'I ступень — Тоника (T6)',
            functionSymbolRu: 'T6',
            degreeExplanationRu: `Тонический секстаккорд ${tonicNoteName} dur (терция в басу)`,
            chordQuality: 'major',
            chordQualityRu: 'Мажорный секстаккорд',
            inversionName: 'Секстаккорд (T6)',
            isRootPosition: false,
            semitonesFromTonic: [4, 7, 12],
          },
          {
            degreeId,
            degreeRoman: 'I',
            degreeLabelRu: 'I (T)',
            degreeNameRu: 'I ступень — Тоника (T6/4)',
            functionSymbolRu: 'T6/4',
            degreeExplanationRu: `Тонический квартсекстаккорд ${tonicNoteName} dur (квинта в басу)`,
            chordQuality: 'major',
            chordQualityRu: 'Мажорный квартсекстаккорд',
            inversionName: 'Квартсекстаккорд (T6/4)',
            isRootPosition: false,
            semitonesFromTonic: [7, 12, 16],
          }
        );
      } else {
        voicings.push(
          {
            degreeId,
            degreeRoman: 'I',
            degreeLabelRu: 'I (t)',
            degreeNameRu: 'I ступень — Тоника (t5/3)',
            functionSymbolRu: 't5/3',
            degreeExplanationRu: `Тоническое минорное трезвучие ${tonicNoteName} moll в основном виде`,
            chordQuality: 'minor',
            chordQualityRu: 'Минорное трезвучие',
            inversionName: 'Основной вид (t5/3)',
            isRootPosition: true,
            semitonesFromTonic: [0, 3, 7],
          },
          {
            degreeId,
            degreeRoman: 'I',
            degreeLabelRu: 'I (t)',
            degreeNameRu: 'I ступень — Тоника (t6)',
            functionSymbolRu: 't6',
            degreeExplanationRu: `Тонический секстаккорд ${tonicNoteName} moll`,
            chordQuality: 'minor',
            chordQualityRu: 'Минорный секстаккорд',
            inversionName: 'Секстаккорд (t6)',
            isRootPosition: false,
            semitonesFromTonic: [3, 7, 12],
          },
          {
            degreeId,
            degreeRoman: 'I',
            degreeLabelRu: 'I (t)',
            degreeNameRu: 'I ступень — Тоника (t6/4)',
            functionSymbolRu: 't6/4',
            degreeExplanationRu: `Тонический квартсекстаккорд ${tonicNoteName} moll`,
            chordQuality: 'minor',
            chordQualityRu: 'Минорный квартсекстаккорд',
            inversionName: 'Квартсекстаккорд (t6/4)',
            isRootPosition: false,
            semitonesFromTonic: [7, 12, 15],
          }
        );
      }
      break;

    case 'deg_K64':
      // Cadential 6/4 (Кадансовый квартсекстаккорд: бас на V ступени)
      if (isMajor) {
        voicings.push({
          degreeId,
          degreeRoman: 'K6/4',
          degreeLabelRu: 'K6/4',
          degreeNameRu: 'Кадансовый квартсекстаккорд (K6/4)',
          functionSymbolRu: 'K6/4',
          degreeExplanationRu: `Тонический квартсекстаккорд на басу V ступени перед доминантой в ${tonicNoteName} dur`,
          chordQuality: 'major',
          chordQualityRu: 'Кадансовый квартсекстаккорд',
          inversionName: 'Кадансовый (K6/4)',
          isRootPosition: true,
          semitonesFromTonic: [7, 12, 16, 19],
        });
      } else {
        voicings.push({
          degreeId,
          degreeRoman: 'k6/4',
          degreeLabelRu: 'k6/4',
          degreeNameRu: 'Минорный кадансовый квартсекстаккорд (k6/4)',
          functionSymbolRu: 'k6/4',
          degreeExplanationRu: `Минорный тонический квартсекстаккорд на басу V ступени в ${tonicNoteName} moll`,
          chordQuality: 'minor',
          chordQualityRu: 'Минорный кадансовый квартсекстаккорд',
          inversionName: 'Кадансовый (k6/4)',
          isRootPosition: true,
          semitonesFromTonic: [7, 12, 15, 19],
        });
      }
      break;

    case 'deg_II':
      if (isMajor) {
        voicings.push(
          {
            degreeId,
            degreeRoman: 'II',
            degreeLabelRu: 'II',
            degreeNameRu: 'II ступень — Трезвучие (II5/3)',
            functionSymbolRu: 'II5/3',
            degreeExplanationRu: `Минорное трезвучие II ступени в ${tonicNoteName} dur`,
            chordQuality: 'minor',
            chordQualityRu: 'Минорное трезвучие',
            inversionName: 'Трезвучие (II5/3)',
            isRootPosition: true,
            semitonesFromTonic: [2, 5, 9],
          },
          {
            degreeId,
            degreeRoman: 'II',
            degreeLabelRu: 'II',
            degreeNameRu: 'II ступень — Секстаккорд (II6)',
            functionSymbolRu: 'II6',
            degreeExplanationRu: `Секстаккорд II ступени (наиболее употребительный субдоминантовый аккорд)`,
            chordQuality: 'minor',
            chordQualityRu: 'Минорный секстаккорд',
            inversionName: 'Секстаккорд (II6)',
            isRootPosition: false,
            semitonesFromTonic: [5, 9, 14],
          }
        );
      } else {
        voicings.push(
          {
            degreeId,
            degreeRoman: 'II',
            degreeLabelRu: 'II°',
            degreeNameRu: 'II ступень — Уменьшенное трезвучие (II°5/3)',
            functionSymbolRu: 'II°5/3',
            degreeExplanationRu: `Уменьшенное трезвучие II ступени в ${tonicNoteName} moll`,
            chordQuality: 'diminished',
            chordQualityRu: 'Уменьшенное трезвучие',
            inversionName: 'Ум. трезвучие (II°5/3)',
            isRootPosition: true,
            semitonesFromTonic: [2, 5, 8],
          },
          {
            degreeId,
            degreeRoman: 'II',
            degreeLabelRu: 'II°',
            degreeNameRu: 'II ступень — Секстаккорд (II°6)',
            functionSymbolRu: 'II°6',
            degreeExplanationRu: `Уменьшенный секстаккорд II ступени (IV ступень в басу)`,
            chordQuality: 'diminished',
            chordQualityRu: 'Уменьшенный секстаккорд',
            inversionName: 'Секстаккорд (II°6)',
            isRootPosition: false,
            semitonesFromTonic: [5, 8, 14],
          }
        );
      }
      break;

    case 'deg_II7':
      // Second Degree Seventh Chord (II7)
      if (isMajor) {
        voicings.push(
          {
            degreeId,
            degreeRoman: 'II7',
            degreeLabelRu: 'II7',
            degreeNameRu: 'II ступень — Септаккорд (II7)',
            functionSymbolRu: 'II7',
            degreeExplanationRu: `Малый минорный септаккорд II ступени в ${tonicNoteName} dur`,
            chordQuality: 'minor',
            chordQualityRu: 'Малый минорный септаккорд (II7)',
            inversionName: 'Септаккорд (II7)',
            isRootPosition: true,
            semitonesFromTonic: [2, 5, 9, 12],
          },
          {
            degreeId,
            degreeRoman: 'II7',
            degreeLabelRu: 'II7',
            degreeNameRu: 'II ступень — Квинтсекстаккорд (II6/5)',
            functionSymbolRu: 'II6/5',
            degreeExplanationRu: `Квинтсекстаккорд II ступени с басом на IV ступени`,
            chordQuality: 'minor',
            chordQualityRu: 'Квинтсекстаккорд (II6/5)',
            inversionName: 'Квинтсекстаккорд (II6/5)',
            isRootPosition: false,
            semitonesFromTonic: [5, 9, 12, 14],
          },
          {
            degreeId,
            degreeRoman: 'II7',
            degreeLabelRu: 'II7',
            degreeNameRu: 'II ступень — Терцквартаккорд (II4/3)',
            functionSymbolRu: 'II4/3',
            degreeExplanationRu: `Терцквартаккорд II ступени с басом на VI ступени`,
            chordQuality: 'minor',
            chordQualityRu: 'Терцквартаккорд (II4/3)',
            inversionName: 'Терцквартаккорд (II4/3)',
            isRootPosition: false,
            semitonesFromTonic: [9, 12, 14, 17],
          },
          {
            degreeId,
            degreeRoman: 'II7',
            degreeLabelRu: 'II7',
            degreeNameRu: 'II ступень — Секундаккорд (II2)',
            functionSymbolRu: 'II2',
            degreeExplanationRu: `Секундаккорд II ступени с басом на тонике I`,
            chordQuality: 'minor',
            chordQualityRu: 'Секундаккорд (II2)',
            inversionName: 'Секундаккорд (II2)',
            isRootPosition: false,
            semitonesFromTonic: [12, 14, 17, 21],
          }
        );
      } else {
        voicings.push(
          {
            degreeId,
            degreeRoman: 'IIø7',
            degreeLabelRu: 'IIø7',
            degreeNameRu: 'II ступень — Полууменьшенный септаккорд (IIø7)',
            functionSymbolRu: 'IIø7',
            degreeExplanationRu: `Полууменьшенный септаккорд II ступени в ${tonicNoteName} moll`,
            chordQuality: 'diminished',
            chordQualityRu: 'Полууменьшенный септаккорд (IIø7)',
            inversionName: 'Септаккорд (IIø7)',
            isRootPosition: true,
            semitonesFromTonic: [2, 5, 8, 12],
          },
          {
            degreeId,
            degreeRoman: 'IIø7',
            degreeLabelRu: 'IIø7',
            degreeNameRu: 'II ступень — Полууменьшенный квинтсекстаккорд (IIø6/5)',
            functionSymbolRu: 'IIø6/5',
            degreeExplanationRu: `Полууменьшенный квинтсекстаккорд (бас на IV ступени)`,
            chordQuality: 'diminished',
            chordQualityRu: 'Квинтсекстаккорд (IIø6/5)',
            inversionName: 'Квинтсекстаккорд (IIø6/5)',
            isRootPosition: false,
            semitonesFromTonic: [5, 8, 12, 14],
          },
          {
            degreeId,
            degreeRoman: 'IIø7',
            degreeLabelRu: 'IIø7',
            degreeNameRu: 'II ступень — Полууменьшенный терцквартаккорд (IIø4/3)',
            functionSymbolRu: 'IIø4/3',
            degreeExplanationRu: `Полууменьшенный терцквартаккорд (бас на VI ступени)`,
            chordQuality: 'diminished',
            chordQualityRu: 'Терцквартаккорд (IIø4/3)',
            inversionName: 'Терцквартаккорд (IIø4/3)',
            isRootPosition: false,
            semitonesFromTonic: [8, 12, 14, 17],
          },
          {
            degreeId,
            degreeRoman: 'IIø7',
            degreeLabelRu: 'IIø7',
            degreeNameRu: 'II ступень — Полууменьшенный секундаккорд (IIø2)',
            functionSymbolRu: 'IIø2',
            degreeExplanationRu: `Полууменьшенный секундаккорд (бас на I ступени)`,
            chordQuality: 'diminished',
            chordQualityRu: 'Секундаккорд (IIø2)',
            inversionName: 'Секундаккорд (IIø2)',
            isRootPosition: false,
            semitonesFromTonic: [12, 14, 17, 20],
          }
        );
      }
      break;

    case 'deg_II7_alt':
      // Altered II7 (Альтерированный септаккорд II ступени)
      if (isMajor) {
        voicings.push(
          {
            degreeId,
            degreeRoman: 'II7альт',
            degreeLabelRu: 'II7альт',
            degreeNameRu: 'II ступень — Септаккорд с пониженной квинтой (II7b5)',
            functionSymbolRu: 'II7b5',
            degreeExplanationRu: `Альтерированный септаккорд II ступени с пониженной VI гармонической ступенью в ${tonicNoteName} dur`,
            chordQuality: 'diminished',
            chordQualityRu: 'Септаккорд с пониженной квинтой (II7b5)',
            inversionName: 'Основной вид (II7b5)',
            isRootPosition: true,
            semitonesFromTonic: [2, 5, 8, 12],
          },
          {
            degreeId,
            degreeRoman: 'II7альт',
            degreeLabelRu: 'II7альт',
            degreeNameRu: 'II ступень — Альтерированный терцквартаккорд (II4/3b5)',
            functionSymbolRu: 'II4/3b5',
            degreeExplanationRu: `Мягкий альтерированный терцквартаккорд с басом на пониженной VI ступени`,
            chordQuality: 'diminished',
            chordQualityRu: 'Терцквартаккорд (II4/3b5)',
            inversionName: 'Терцквартаккорд (II4/3b5)',
            isRootPosition: false,
            semitonesFromTonic: [8, 12, 14, 17],
          },
          {
            degreeId,
            degreeRoman: 'II7альт',
            degreeLabelRu: 'II7альт',
            degreeNameRu: 'Двойная доминанта (DD7 / II#3)',
            functionSymbolRu: 'DD7',
            degreeExplanationRu: `Доминанта к доминанте (септаккорд II ступени с повышенной терцией #IV)`,
            chordQuality: 'dominant',
            chordQualityRu: 'Двойная доминанта (DD7)',
            inversionName: 'Двойная доминанта (DD7)',
            isRootPosition: true,
            semitonesFromTonic: [2, 6, 9, 12],
          }
        );
      } else {
        voicings.push(
          {
            degreeId,
            degreeRoman: 'II7альт',
            degreeLabelRu: 'II7альт',
            degreeNameRu: 'II ступень — Дважды уменьшенный септаккорд (II7b5)',
            functionSymbolRu: 'II7b5',
            degreeExplanationRu: `Дважды уменьшенный субдоминантовый септаккорд в ${tonicNoteName} moll`,
            chordQuality: 'diminished',
            chordQualityRu: 'Дважды уменьшенный септаккорд',
            inversionName: 'Основной вид (II7b5)',
            isRootPosition: true,
            semitonesFromTonic: [2, 5, 8, 11],
          },
          {
            degreeId,
            degreeRoman: 'II7альт',
            degreeLabelRu: 'II7альт',
            degreeNameRu: 'Увеличенный терцквартаккорд (II4/3b5 / Французский шестой)',
            functionSymbolRu: 'II4/3b5',
            degreeExplanationRu: `Увеличенный терцквартаккорд с ярким звуковым тяготением в доминанту`,
            chordQuality: 'dominant',
            chordQualityRu: 'Увеличенный терцквартаккорд',
            inversionName: 'Увел. терцквартаккорд (II4/3b5)',
            isRootPosition: false,
            semitonesFromTonic: [8, 12, 14, 18],
          },
          {
            degreeId,
            degreeRoman: 'II7альт',
            degreeLabelRu: 'II7альт',
            degreeNameRu: 'Двойная доминанта в миноре (DD7 ум.5)',
            functionSymbolRu: 'DD7(b5)',
            degreeExplanationRu: `Септаккорд двойной доминанты с уменьшенной квинтой в миноре`,
            chordQuality: 'dominant',
            chordQualityRu: 'Двойная доминанта (DD7)',
            inversionName: 'Двойная доминанта (DD7)',
            isRootPosition: true,
            semitonesFromTonic: [2, 6, 8, 12],
          }
        );
      }
      break;

    case 'deg_III':
      if (isMajor) {
        voicings.push(
          {
            degreeId,
            degreeRoman: 'III',
            degreeLabelRu: 'III',
            degreeNameRu: 'III ступень — Верхняя медианта (III5/3)',
            functionSymbolRu: 'III5/3',
            degreeExplanationRu: `Минорное трезвучие III ступени в ${tonicNoteName} dur`,
            chordQuality: 'minor',
            chordQualityRu: 'Минорное трезвучие',
            inversionName: 'Основной вид (III5/3)',
            isRootPosition: true,
            semitonesFromTonic: [4, 7, 11],
          },
          {
            degreeId,
            degreeRoman: 'III',
            degreeLabelRu: 'III',
            degreeNameRu: 'III ступень — Секстаккорд (III6)',
            functionSymbolRu: 'III6',
            degreeExplanationRu: `Секстаккорд III ступени`,
            chordQuality: 'minor',
            chordQualityRu: 'Минорный секстаккорд',
            inversionName: 'Секстаккорд (III6)',
            isRootPosition: false,
            semitonesFromTonic: [7, 11, 16],
          }
        );
      } else {
        voicings.push(
          {
            degreeId,
            degreeRoman: 'III',
            degreeLabelRu: 'III',
            degreeNameRu: 'III ступень — Параллельный мажор (III5/3)',
            functionSymbolRu: 'III5/3',
            degreeExplanationRu: `Мажорное трезвучие III ступени (тоника параллельного мажора) в ${tonicNoteName} moll`,
            chordQuality: 'major',
            chordQualityRu: 'Мажорное трезвучие',
            inversionName: 'Основной вид (III5/3)',
            isRootPosition: true,
            semitonesFromTonic: [3, 7, 10],
          },
          {
            degreeId,
            degreeRoman: 'III',
            degreeLabelRu: 'III',
            degreeNameRu: 'III ступень — Секстаккорд (III6)',
            functionSymbolRu: 'III6',
            degreeExplanationRu: `Секстаккорд III ступени минора`,
            chordQuality: 'major',
            chordQualityRu: 'Мажорный секстаккорд',
            inversionName: 'Секстаккорд (III6)',
            isRootPosition: false,
            semitonesFromTonic: [7, 10, 15],
          }
        );
      }
      break;

    case 'deg_IV':
      if (isMajor) {
        voicings.push(
          {
            degreeId,
            degreeRoman: 'IV',
            degreeLabelRu: 'IV (S)',
            degreeNameRu: 'IV ступень — Субдоминанта (S5/3)',
            functionSymbolRu: 'S5/3',
            degreeExplanationRu: `Главное субдоминантовое мажорное трезвучие ${tonicNoteName} dur`,
            chordQuality: 'major',
            chordQualityRu: 'Мажорное трезвучие',
            inversionName: 'Основной вид (S5/3)',
            isRootPosition: true,
            semitonesFromTonic: [5, 9, 12],
          },
          {
            degreeId,
            degreeRoman: 'IV',
            degreeLabelRu: 'IV (S)',
            degreeNameRu: 'IV ступень — Секстаккорд (S6)',
            functionSymbolRu: 'S6',
            degreeExplanationRu: `Субдоминантовый секстаккорд (VI ступень в басу)`,
            chordQuality: 'major',
            chordQualityRu: 'Мажорный секстаккорд',
            inversionName: 'Секстаккорд (S6)',
            isRootPosition: false,
            semitonesFromTonic: [9, 12, 17],
          },
          {
            degreeId,
            degreeRoman: 'IV',
            degreeLabelRu: 'IV (S)',
            degreeNameRu: 'IV ступень — Квартсекстаккорд (S6/4)',
            functionSymbolRu: 'S6/4',
            degreeExplanationRu: `Субдоминантовый квартсекстаккорд`,
            chordQuality: 'major',
            chordQualityRu: 'Мажорный квартсекстаккорд',
            inversionName: 'Квартсекстаккорд (S6/4)',
            isRootPosition: false,
            semitonesFromTonic: [12, 17, 21],
          }
        );
      } else {
        voicings.push(
          {
            degreeId,
            degreeRoman: 'IV',
            degreeLabelRu: 'IV (s)',
            degreeNameRu: 'IV ступень — Субдоминанта (s5/3)',
            functionSymbolRu: 's5/3',
            degreeExplanationRu: `Главное субдоминантовое минорное трезвучие ${tonicNoteName} moll`,
            chordQuality: 'minor',
            chordQualityRu: 'Минорное трезвучие',
            inversionName: 'Основной вид (s5/3)',
            isRootPosition: true,
            semitonesFromTonic: [5, 8, 12],
          },
          {
            degreeId,
            degreeRoman: 'IV',
            degreeLabelRu: 'IV (s)',
            degreeNameRu: 'IV ступень — Секстаккорд (s6)',
            functionSymbolRu: 's6',
            degreeExplanationRu: `Минорный субдоминантовый секстаккорд`,
            chordQuality: 'minor',
            chordQualityRu: 'Минорный секстаккорд',
            inversionName: 'Секстаккорд (s6)',
            isRootPosition: false,
            semitonesFromTonic: [8, 12, 17],
          },
          {
            degreeId,
            degreeRoman: 'IV',
            degreeLabelRu: 'IV (s)',
            degreeNameRu: 'IV ступень — Квартсекстаккорд (s6/4)',
            functionSymbolRu: 's6/4',
            degreeExplanationRu: `Минорный субдоминантовый квартсекстаккорд`,
            chordQuality: 'minor',
            chordQualityRu: 'Минорный квартсекстаккорд',
            inversionName: 'Квартсекстаккорд (s6/4)',
            isRootPosition: false,
            semitonesFromTonic: [12, 17, 20],
          }
        );
      }
      break;

    case 'deg_S_alt':
      if (isMajor) {
        voicings.push(
          {
            degreeId,
            degreeRoman: 'Sальт',
            degreeLabelRu: 'Sальт',
            degreeNameRu: 'Альтерированная субдоминанта (IV#5/3)',
            functionSymbolRu: 'IV#5/3',
            degreeExplanationRu: `Субдоминанта с повышенной IV ступенью (#IV) в ${tonicNoteName} dur`,
            chordQuality: 'diminished',
            chordQualityRu: 'Уменьшенное созвучие (#IV)',
            inversionName: 'Ум. трезвучие от #IV',
            isRootPosition: true,
            semitonesFromTonic: [6, 9, 12],
          },
          {
            degreeId,
            degreeRoman: 'Sальт',
            degreeLabelRu: 'Sальт',
            degreeNameRu: 'Гармоническая минорная субдоминанта (sгарм)',
            functionSymbolRu: 'sгарм',
            degreeExplanationRu: `Минорная субдоминанта с пониженной VI ступенью в мажоре`,
            chordQuality: 'minor',
            chordQualityRu: 'Минорная субдоминанта в мажоре',
            inversionName: 'Минорная S в мажоре (s5/3)',
            isRootPosition: true,
            semitonesFromTonic: [5, 8, 12],
          }
        );
      } else {
        voicings.push(
          {
            degreeId,
            degreeRoman: 'Sальт',
            degreeLabelRu: 'Sальт',
            degreeNameRu: 'Неаполитанский секстаккорд (N6 / IIb6)',
            functionSymbolRu: 'N6',
            degreeExplanationRu: `Знаменитый неаполитанский мажорный секстаккорд пониженной II ступени в ${tonicNoteName} moll`,
            chordQuality: 'major',
            chordQualityRu: 'Мажорный неаполитанский секстаккорд',
            inversionName: 'Неаполитанский секстаккорд (N6)',
            isRootPosition: false,
            semitonesFromTonic: [5, 8, 13],
          },
          {
            degreeId,
            degreeRoman: 'Sальт',
            degreeLabelRu: 'Sальт',
            degreeNameRu: 'Неаполитанское трезвучие (N5/3 / IIb)',
            functionSymbolRu: 'N5/3',
            degreeExplanationRu: `Мажорное трезвучие пониженной II ступени`,
            chordQuality: 'major',
            chordQualityRu: 'Мажорное трезвучие (IIb)',
            inversionName: 'Неаполитанское трезвучие (N5/3)',
            isRootPosition: true,
            semitonesFromTonic: [1, 5, 8],
          },
          {
            degreeId,
            degreeRoman: 'Sальт',
            degreeLabelRu: 'Sальт',
            degreeNameRu: 'Субдоминанта с повышенной IV ступенью (s#IV)',
            functionSymbolRu: 's#IV',
            degreeExplanationRu: `Альтерированная субдоминанта с #IV ступенью`,
            chordQuality: 'diminished',
            chordQualityRu: 'Уменьшенное созвучие (#IV)',
            inversionName: 'Ум. созвучие (#IV)',
            isRootPosition: true,
            semitonesFromTonic: [6, 8, 12],
          }
        );
      }
      break;

    case 'deg_V':
      // Dominant triad (always major in minor harmonic)
      voicings.push(
        {
          degreeId,
          degreeRoman: 'V',
          degreeLabelRu: 'V (D5/3)',
          degreeNameRu: isMajor ? 'V ступень — Доминанта трезвучие (D5/3)' : 'V ступень — Гармоническая мажорная доминанта (D5/3)',
          functionSymbolRu: 'D5/3',
          degreeExplanationRu: isMajor
            ? `Главное мажорное доминантовое трезвучие ${tonicNoteName} dur`
            : `Мажорная гармоническая доминанта с повышенной VII ступенью (вводным тоном) в ${tonicNoteName} moll`,
          chordQuality: 'major',
          chordQualityRu: 'Мажорное трезвучие (D)',
          inversionName: 'Основной вид (D5/3)',
          isRootPosition: true,
          semitonesFromTonic: [7, 11, 14],
        },
        {
          degreeId,
          degreeRoman: 'V',
          degreeLabelRu: 'V (D5/3)',
          degreeNameRu: 'V ступень — Доминантовый секстаккорд (D6)',
          functionSymbolRu: 'D6',
          degreeExplanationRu: `Доминантовый секстаккорд (вводный тон VII ступени в басу)`,
          chordQuality: 'major',
          chordQualityRu: 'Мажорный секстаккорд (D6)',
          inversionName: 'Секстаккорд (D6)',
          isRootPosition: false,
          semitonesFromTonic: [11, 14, 19],
        },
        {
          degreeId,
          degreeRoman: 'V',
          degreeLabelRu: 'V (D5/3)',
          degreeNameRu: 'V ступень — Доминантовый квартсекстаккорд (D6/4)',
          functionSymbolRu: 'D6/4',
          degreeExplanationRu: `Доминантовый квартсекстаккорд (II ступень в басу)`,
          chordQuality: 'major',
          chordQualityRu: 'Мажорный квартсекстаккорд',
          inversionName: 'Квартсекстаккорд (D6/4)',
          isRootPosition: false,
          semitonesFromTonic: [14, 19, 23],
        }
      );
      break;

    case 'deg_V7':
      // Dominant Seventh (D7) - always major-minor 7th with leading tone
      voicings.push(
        {
          degreeId,
          degreeRoman: 'V7',
          degreeLabelRu: 'V7 (D7)',
          degreeNameRu: isMajor ? 'V ступень — Доминантсептаккорд (D7)' : 'V ступень — Гармонический D7 в миноре',
          functionSymbolRu: 'D7',
          degreeExplanationRu: isMajor
            ? `Классический доминантсептаккорд ${tonicNoteName} dur в основном виде`
            : `Гармонический доминантсептаккорд в ${tonicNoteName} moll с повышенной VII ступенью`,
          chordQuality: 'dominant',
          chordQualityRu: 'Доминантсептаккорд (D7)',
          inversionName: 'Септаккорд (D7)',
          isRootPosition: true,
          semitonesFromTonic: [7, 11, 14, 17],
        },
        {
          degreeId,
          degreeRoman: 'V7',
          degreeLabelRu: 'V7 (D7)',
          degreeNameRu: 'V ступень — Квинтсекстаккорд (D6/5)',
          functionSymbolRu: 'D6/5',
          degreeExplanationRu: `Доминантовый квинтсекстаккорд (бас на VII ступени / вводном тоне)`,
          chordQuality: 'dominant',
          chordQualityRu: 'Квинтсекстаккорд (D6/5)',
          inversionName: 'Квинтсекстаккорд (D6/5)',
          isRootPosition: false,
          semitonesFromTonic: [11, 14, 17, 19],
        },
        {
          degreeId,
          degreeRoman: 'V7',
          degreeLabelRu: 'V7 (D7)',
          degreeNameRu: 'V ступень — Терцквартаккорд (D4/3)',
          functionSymbolRu: 'D4/3',
          degreeExplanationRu: `Доминантовый терцквартаккорд (бас на II ступени)`,
          chordQuality: 'dominant',
          chordQualityRu: 'Терцквартаккорд (D4/3)',
          inversionName: 'Терцквартаккорд (D4/3)',
          isRootPosition: false,
          semitonesFromTonic: [14, 17, 19, 23],
        },
        {
          degreeId,
          degreeRoman: 'V7',
          degreeLabelRu: 'V7 (D7)',
          degreeNameRu: 'V ступень — Секундаккорд (D2)',
          functionSymbolRu: 'D2',
          degreeExplanationRu: `Доминантовый секундаккорд (бас на IV ступени / септиме аккорда)`,
          chordQuality: 'dominant',
          chordQualityRu: 'Секундаккорд (D2)',
          inversionName: 'Секундаккорд (D2)',
          isRootPosition: false,
          semitonesFromTonic: [17, 19, 23, 26],
        }
      );
      break;

    case 'deg_D_add6':
      // Dominant with 6th
      if (isMajor) {
        voicings.push(
          {
            degreeId,
            degreeRoman: 'D+6',
            degreeLabelRu: 'D+6',
            degreeNameRu: 'Доминанта с секстой (D+6)',
            functionSymbolRu: 'D+6',
            degreeExplanationRu: `Доминантовое созвучие с секстой вместо квинты (V, VII, III) в ${tonicNoteName} dur`,
            chordQuality: 'major',
            chordQualityRu: 'Доминанта с секстой',
            inversionName: 'Основной вид (D+6)',
            isRootPosition: true,
            semitonesFromTonic: [7, 11, 16],
          },
          {
            degreeId,
            degreeRoman: 'D+6',
            degreeLabelRu: 'D+6',
            degreeNameRu: 'Доминантсептаккорд с секстой (D7+6)',
            functionSymbolRu: 'D7+6',
            degreeExplanationRu: `Доминантсептаккорд с добавленной секстой III ступени`,
            chordQuality: 'dominant',
            chordQualityRu: 'Доминантсептаккорд с секстой',
            inversionName: 'D7 с секстой (D7+6)',
            isRootPosition: true,
            semitonesFromTonic: [7, 11, 16, 17],
          }
        );
      } else {
        voicings.push(
          {
            degreeId,
            degreeRoman: 'D+6',
            degreeLabelRu: 'D+6',
            degreeNameRu: 'Гармоническая доминанта с секстой (D+6)',
            functionSymbolRu: 'D+6',
            degreeExplanationRu: `Мажорная доминанта с секстой (III ступень минора) в ${tonicNoteName} moll`,
            chordQuality: 'major',
            chordQualityRu: 'Гармоническая доминанта с секстой',
            inversionName: 'Основной вид (D+6)',
            isRootPosition: true,
            semitonesFromTonic: [7, 11, 15],
          },
          {
            degreeId,
            degreeRoman: 'D+6',
            degreeLabelRu: 'D+6',
            degreeNameRu: 'Гармонический D7 с секстой (D7+6)',
            functionSymbolRu: 'D7+6',
            degreeExplanationRu: `Мажорный D7 в миноре с секстой III ступени`,
            chordQuality: 'dominant',
            chordQualityRu: 'D7 с секстой в миноре',
            inversionName: 'D7 с секстой (D7+6)',
            isRootPosition: true,
            semitonesFromTonic: [7, 11, 15, 17],
          }
        );
      }
      break;

    case 'deg_D9':
      // Dominant Ninth Chord (D9 / D7b9)
      if (isMajor) {
        voicings.push(
          {
            degreeId,
            degreeRoman: 'D9',
            degreeLabelRu: 'D9',
            degreeNameRu: 'Большой доминантнонаккорд (D9)',
            functionSymbolRu: 'D9',
            degreeExplanationRu: `Большой доминантнонаккорд в ${tonicNoteName} dur (V, VII, II, IV, VI)`,
            chordQuality: 'dominant',
            chordQualityRu: 'Доминантнонаккорд (D9)',
            inversionName: 'Основной вид (D9)',
            isRootPosition: true,
            semitonesFromTonic: [7, 11, 14, 17, 21],
          },
          {
            degreeId,
            degreeRoman: 'D9',
            degreeLabelRu: 'D9',
            degreeNameRu: 'Малый доминантнонаккорд (D7b9 в мажоре)',
            functionSymbolRu: 'D7b9',
            degreeExplanationRu: `Доминантнонаккорд с пониженной 9 ступенью (гармонический мажор)`,
            chordQuality: 'dominant',
            chordQualityRu: 'Доминантнонаккорд (D7b9)',
            inversionName: 'Основной вид (D7b9)',
            isRootPosition: true,
            semitonesFromTonic: [7, 11, 14, 17, 20],
          }
        );
      } else {
        voicings.push(
          {
            degreeId,
            degreeRoman: 'D7b9',
            degreeLabelRu: 'D7b9',
            degreeNameRu: 'Гармонический доминантнонаккорд (D7b9)',
            functionSymbolRu: 'D7b9',
            degreeExplanationRu: `Малый доминантнонаккорд гармонического минора с вводным тоном в ${tonicNoteName} moll`,
            chordQuality: 'dominant',
            chordQualityRu: 'Доминантнонаккорд (D7b9)',
            inversionName: 'Основной вид (D7b9)',
            isRootPosition: true,
            semitonesFromTonic: [7, 11, 14, 17, 20],
          }
        );
      }
      break;

    case 'deg_VI':
      if (isMajor) {
        voicings.push(
          {
            degreeId,
            degreeRoman: 'VI',
            degreeLabelRu: 'VI',
            degreeNameRu: 'VI ступень — Нижняя медианта (VI5/3)',
            functionSymbolRu: 'VI5/3',
            degreeExplanationRu: `Минорное трезвучие VI ступени в ${tonicNoteName} dur (параллельный минор)`,
            chordQuality: 'minor',
            chordQualityRu: 'Минорное трезвучие',
            inversionName: 'Основной вид (VI5/3)',
            isRootPosition: true,
            semitonesFromTonic: [9, 12, 16],
          },
          {
            degreeId,
            degreeRoman: 'VI',
            degreeLabelRu: 'VI',
            degreeNameRu: 'VI ступень — Секстаккорд (VI6)',
            functionSymbolRu: 'VI6',
            degreeExplanationRu: `Секстаккорд VI ступени`,
            chordQuality: 'minor',
            chordQualityRu: 'Минорный секстаккорд',
            inversionName: 'Секстаккорд (VI6)',
            isRootPosition: false,
            semitonesFromTonic: [12, 16, 21],
          }
        );
      } else {
        voicings.push(
          {
            degreeId,
            degreeRoman: 'VI',
            degreeLabelRu: 'VI',
            degreeNameRu: 'VI ступень — Субмедианта минора (VI5/3)',
            functionSymbolRu: 'VI5/3',
            degreeExplanationRu: `Мажорное трезвучие VI ступени в ${tonicNoteName} moll (аккорд прерванной каденции)`,
            chordQuality: 'major',
            chordQualityRu: 'Мажорное трезвучие',
            inversionName: 'Основной вид (VI5/3)',
            isRootPosition: true,
            semitonesFromTonic: [8, 12, 15],
          },
          {
            degreeId,
            degreeRoman: 'VI',
            degreeLabelRu: 'VI',
            degreeNameRu: 'VI ступень — Секстаккорд (VI6)',
            functionSymbolRu: 'VI6',
            degreeExplanationRu: `Мажорный секстаккорд VI ступени минора`,
            chordQuality: 'major',
            chordQualityRu: 'Мажорный секстаккорд',
            inversionName: 'Секстаккорд (VI6)',
            isRootPosition: false,
            semitonesFromTonic: [12, 15, 20],
          }
        );
      }
      break;

    case 'deg_VII':
      if (isMajor) {
        voicings.push(
          {
            degreeId,
            degreeRoman: 'VII',
            degreeLabelRu: 'VII°',
            degreeNameRu: 'VII ступень — Уменьшенное трезвучие (VII°5/3)',
            functionSymbolRu: 'VII°5/3',
            degreeExplanationRu: `Уменьшенное трезвучие VII ступени в ${tonicNoteName} dur`,
            chordQuality: 'diminished',
            chordQualityRu: 'Уменьшенное трезвучие',
            inversionName: 'Ум. трезвучие (VII°5/3)',
            isRootPosition: true,
            semitonesFromTonic: [11, 14, 17],
          },
          {
            degreeId,
            degreeRoman: 'VII',
            degreeLabelRu: 'VIIø7',
            degreeNameRu: 'VII ступень — Малый вводный септаккорд (VIIø7)',
            functionSymbolRu: 'VIIø7',
            degreeExplanationRu: `Малый полууменьшенный вводный септаккорд в мажоре`,
            chordQuality: 'diminished',
            chordQualityRu: 'Полууменьшенный септаккорд',
            inversionName: 'Септаккорд (VIIø7)',
            isRootPosition: true,
            semitonesFromTonic: [11, 14, 17, 21],
          },
          {
            degreeId,
            degreeRoman: 'VII',
            degreeLabelRu: 'VIIø7',
            degreeNameRu: 'VII ступень — Вводный квинтсекстаккорд (VIIø6/5)',
            functionSymbolRu: 'VIIø6/5',
            degreeExplanationRu: `Вводный квинтсекстаккорд в мажоре (бас на II ступени)`,
            chordQuality: 'diminished',
            chordQualityRu: 'Квинтсекстаккорд (VIIø6/5)',
            inversionName: 'Квинтсекстаккорд (VIIø6/5)',
            isRootPosition: false,
            semitonesFromTonic: [14, 17, 21, 23],
          }
        );
      } else {
        voicings.push(
          {
            degreeId,
            degreeRoman: 'VII',
            degreeLabelRu: 'VII°7',
            degreeNameRu: 'VII ступень — Уменьшенный вводный септаккорд (VII°7)',
            functionSymbolRu: 'VII°7',
            degreeExplanationRu: `Гармонический уменьшенный вводный септаккорд в ${tonicNoteName} moll (3 малые терции)`,
            chordQuality: 'diminished',
            chordQualityRu: 'Уменьшенный вводный септаккорд',
            inversionName: 'Септаккорд (VII°7)',
            isRootPosition: true,
            semitonesFromTonic: [11, 14, 17, 20],
          },
          {
            degreeId,
            degreeRoman: 'VII',
            degreeLabelRu: 'VII°7',
            degreeNameRu: 'VII ступень — Квинтсекстаккорд (VII°6/5)',
            functionSymbolRu: 'VII°6/5',
            degreeExplanationRu: `Уменьшенный квинтсекстаккорд (бас на II ступени)`,
            chordQuality: 'diminished',
            chordQualityRu: 'Квинтсекстаккорд (VII°6/5)',
            inversionName: 'Квинтсекстаккорд (VII°6/5)',
            isRootPosition: false,
            semitonesFromTonic: [14, 17, 20, 23],
          },
          {
            degreeId,
            degreeRoman: 'VII',
            degreeLabelRu: 'VII°7',
            degreeNameRu: 'VII ступень — Терцквартаккорд (VII°4/3)',
            functionSymbolRu: 'VII°4/3',
            degreeExplanationRu: `Уменьшенный терцквартаккорд (бас на IV ступени)`,
            chordQuality: 'diminished',
            chordQualityRu: 'Терцквартаккорд (VII°4/3)',
            inversionName: 'Терцквартаккорд (VII°4/3)',
            isRootPosition: false,
            semitonesFromTonic: [17, 20, 23, 26],
          },
          {
            degreeId,
            degreeRoman: 'VII',
            degreeLabelRu: 'VII°7',
            degreeNameRu: 'VII ступень — Секундаккорд (VII°2)',
            functionSymbolRu: 'VII°2',
            degreeExplanationRu: `Уменьшенный секундаккорд (бас на VI ступени)`,
            chordQuality: 'diminished',
            chordQualityRu: 'Секундаккорд (VII°2)',
            inversionName: 'Секундаккорд (VII°2)',
            isRootPosition: false,
            semitonesFromTonic: [20, 23, 26, 29],
          }
        );
      }
      break;
  }

  return voicings.map((v) => {
    const meta = computeVoicingIdAndPopularFlag(v);
    return {
      ...v,
      id: meta.id,
      isPopularInversion: meta.isPopularInversion,
    };
  });
}

export function findVoicingById(
  voicingId: string,
  isMajor: boolean,
  tonicName: string
): TonalChordVoicing | undefined {
  const targetItem = POPULAR_TONAL_CHORDS.find((p) => p.id === voicingId);
  if (targetItem) {
    const degreeVoicings = getVoicingsForDegree(targetItem.degreeId, isMajor, tonicName);
    const found = degreeVoicings.find((v) => v.id === voicingId);
    if (found) return found;
  }
  for (const deg of TONAL_DEGREES) {
    const degreeVoicings = getVoicingsForDegree(deg.id, isMajor, tonicName);
    const found = degreeVoicings.find((v) => v.id === voicingId);
    if (found) return found;
  }
  return undefined;
}

export interface TonalThemeDefinition {
  id: TonalThemeId;
  title: string;
  shortTitle: string;
  badge: string;
  difficulty: 'beginner' | 'easy' | 'medium' | 'advanced' | 'all' | 'custom';
  difficultyRu: string;
  voicingIds: string[];
  degreeIds: string[];
  rootPositionOnly: boolean;
  hintRu: string;
  descRu: string;
}

export const TONAL_THEMES: TonalThemeDefinition[] = [
  {
    id: 'tsd_basics',
    title: 'Главные трезвучия (T – S – D)',
    shortTitle: 'Т – С – Д',
    badge: '🌱 Старт',
    difficulty: 'beginner',
    difficultyRu: 'Начальный',
    voicingIds: ['v_T53', 'v_S53', 'v_D53'],
    degreeIds: ['deg_I', 'deg_IV', 'deg_V'],
    rootPositionOnly: true,
    hintRu: '3 базовых созвучия',
    descRu: 'Главные устои лада: устойчивая тоника (T), мягкий отход субдоминанты (S) и острое тяготение доминанты (D).',
  },
  {
    id: 'cadence_d7',
    title: 'Каданс и D7',
    shortTitle: 'Каданс и D7',
    badge: '🎵 База',
    difficulty: 'easy',
    difficultyRu: 'Базовый',
    voicingIds: ['v_T53', 'v_K64', 'v_S53', 'v_D53', 'v_D7'],
    degreeIds: ['deg_I', 'deg_K64', 'deg_IV', 'deg_V', 'deg_V7'],
    rootPositionOnly: false,
    hintRu: '5 главных созвучий',
    descRu: 'Классическая гармоническая основа: кадансовый квартсекстаккорд K6/4 и яркий доминантсептаккорд D7.',
  },
  {
    id: 'sextachords',
    title: 'Секстаккорды трезвучий',
    shortTitle: 'Секстаккорды',
    badge: '🎼 Секстаккорды',
    difficulty: 'medium',
    difficultyRu: 'Средний',
    voicingIds: ['v_T53', 'v_T6', 'v_S53', 'v_S6', 'v_D53', 'v_D6', 'v_II6'],
    degreeIds: ['deg_I', 'deg_IV', 'deg_II', 'deg_V'],
    rootPositionOnly: false,
    hintRu: '7 созвучий с терцовым басом',
    descRu: 'Обращения трезвучий. Учитесь слышать терцовый бас: T6 (III ст.), S6 (VI ст.), II6 (IV ст.), D6 (VII ст.).',
  },
  {
    id: 'd7_inversions',
    title: 'Обращения D7',
    shortTitle: 'Обращения D7',
    badge: '🔥 D7 и обращ.',
    difficulty: 'advanced',
    difficultyRu: 'Продвинутый',
    voicingIds: ['v_T53', 'v_D7', 'v_D65', 'v_D43', 'v_D2'],
    degreeIds: ['deg_I', 'deg_V7'],
    rootPositionOnly: false,
    hintRu: '5 доминантовых созвучий',
    descRu: 'Полная семья D7: основной вид (бас V), квинтсекстаккорд D6/5 (бас VII), терцквартаккорд D4/3 (бас II) и секундаккорд D2 (бас IV).',
  },
  {
    id: 'secondary',
    title: 'Побочные ступени (II и VI)',
    shortTitle: 'Побочные (II, VI)',
    badge: '🌟 Побочные',
    difficulty: 'advanced',
    difficultyRu: 'Продвинутый',
    voicingIds: ['v_T53', 'v_II53', 'v_II6', 'v_S53', 'v_D53', 'v_VI53', 'v_K64'],
    degreeIds: ['deg_I', 'deg_II', 'deg_IV', 'deg_V', 'deg_VI', 'deg_K64'],
    rootPositionOnly: false,
    hintRu: '7 созвучий',
    descRu: 'Субдоминанта II ступени и прерванный каданс VI ступени в классическом функциональном контексте.',
  },
  {
    id: 'leading_dim',
    title: 'Вводные септаккорды (VII)',
    shortTitle: 'Вводные (VII)',
    badge: '⚡ Вводные',
    difficulty: 'advanced',
    difficultyRu: 'Сложный',
    voicingIds: ['v_T53', 'v_D7', 'v_VII53', 'v_VII7', 'v_VII65', 'v_VII43', 'v_VII2'],
    degreeIds: ['deg_I', 'deg_V7', 'deg_VII'],
    rootPositionOnly: false,
    hintRu: '7 созвучий',
    descRu: 'Острые уменьшенные и полууменьшенные вводные септаккорды VII ступени и их обращения.',
  },
  {
    id: 'all_popular',
    title: 'Все созвучия курса',
    shortTitle: 'Все созвучия',
    badge: '💎 Полный курс',
    difficulty: 'all',
    difficultyRu: 'Все созвучия',
    voicingIds: POPULAR_TONAL_CHORDS.map((c) => c.id),
    degreeIds: TONAL_DEGREES.map((d) => d.id),
    rootPositionOnly: false,
    hintRu: '35 созвучий',
    descRu: 'Полная палитра классической функциональной гармонии и обращений.',
  },
  {
    id: 'custom',
    title: 'Свой выбор',
    shortTitle: 'Свой выбор',
    badge: '⚙️ Кастом',
    difficulty: 'custom',
    difficultyRu: 'Свой выбор',
    voicingIds: [],
    degreeIds: [],
    rootPositionOnly: false,
    hintRu: 'Индивидуальный набор',
    descRu: 'Ступени и обращения, выбранные пользователем в расширенных настройках.',
  },
];

export function getTonalThemeById(id?: TonalThemeId): TonalThemeDefinition {
  if (!id) return TONAL_THEMES[0];
  const found = TONAL_THEMES.find((t) => t.id === id);
  return found || TONAL_THEMES[0];
}
