import { CHROMATIC_NOTES_UP } from '../data/musicData';

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

export interface TonalChordVoicing {
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
  semitonesFromTonic: number[];
}

export function getVoicingsForDegree(
  degreeId: string,
  isMajor: boolean,
  tonicNoteName: string
): TonalChordVoicing[] {
  const voicings: TonalChordVoicing[] = [];

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

  return voicings;
}
