import { ProgressionCategory } from './audio/harmonicProgressions';

export type CategoryId = 
  | 'simple_intervals'
  | 'characteristic_intervals'
  | 'triads'
  | 'seventh_chords'
  | 'd7_inversions'
  | 'scales'
  | 'modes';

export interface CategoryInfo {
  id: CategoryId;
  name: string;
  shortDesc: string;
  icon: string;
}

export interface MusicItem {
  id: string;
  name: string;
  shortName: string;
  category: CategoryId;
  semitones: number[]; // From root: 0 is root
  // For characteristic intervals with resolutions:
  resolutionSemitones?: number[];
  resolutionName?: string;
  hint?: string; // Alteration / characteristic scale step badge
  desc?: string;
  modeQuality?: 'мажор' | 'минор'; // Folk mode inclination badge
  forceAscendingOnly?: boolean; // For melodic major & minor
}

export type TimbreType = 'salamander' | 'triangle';
export type PlaybackStyle = 'arpeggio' | 'harmonic';
export type PlaybackDirection = 'up' | 'chain' | 'down' | 'random';
export type ThemeMode = 'dark' | 'light';

export type TonalThemeId = 
  | 'tsd_basics'       // 🌱 Главные трезвучия (T, S, D)
  | 'cadence_d7'       // 🎵 Каданс и D7 (T, S, D, K6/4, D7)
  | 'sextachords'      // 🎼 Секстаккорды (T6, S6, II6, D6)
  | 'd7_inversions'    // 🔥 Обращения D7 (D7, D6/5, D4/3, D2)
  | 'secondary'        // 🌟 Побочные ступени (II, VI)
  | 'leading_dim'      // ⚡ Вводные созвучия (VII, VII7)
  | 'all_popular'      // 💎 Все созвучия
  | 'custom';          // ⚙️ Свой выбор

export interface PlaybackSettings {
  timbre: TimbreType;
  tempo: number; // 0.2 - 1.8
  resonance: number; // 0.0 - 2.0
  decay: number; // 0.2 - 3.0
  volume: number; // 0.0 - 1.0
  style: PlaybackStyle;
  direction: PlaybackDirection;
  rootNote: string; // 'random' or 'C', 'C#', etc.
  tonalRootNote?: string; // 'C' by default, or 'random', 'D', etc.
  tonalScaleMode?: 'major' | 'minor' | 'any'; // 'major', 'minor', or 'any'
  tonalChordFilter?: 'all' | 'diatonic'; // 'all' or 'diatonic' (in key)
  tonalRootPositionOnly?: boolean; // only root position (5/3, 7) vs popular/all inversions
  tonalInversionsMode?: 'popular' | 'root_only' | 'all'; // 'popular' by default, or 'root_only' (5/3, 7), or 'all'
  tonalTheme?: TonalThemeId; // active tonal training theme/difficulty level
  tonalAllowedVoicings?: string[]; // allowed voicing IDs (e.g. ['v_T53', 'v_T6', 'v_K64', 'v_S53', 'v_S6', 'v_II6', 'v_D53', 'v_D6', 'v_D7', 'v_D65', 'v_D43', 'v_D2', ...])
  tonalAllowedDegrees?: string[]; // allowed degree IDs (e.g. ['deg_I', 'deg_IV', 'deg_V', 'deg_V7', ...])
  tonalViewMode?: 'grid' | 'cards'; // 'grid' (functional table) or 'cards' (oral-style single card)
  progressionCategory?: 'all' | ProgressionCategory;
  progressionCategories?: ProgressionCategory[];
  progressionViewMode?: 'cards' | 'test' | 'task'; // 'cards' (oral), 'test' (choice grid), 'task' (soprano harmonization)
  progressionNotation?: 'analytical' | 'roman' | 'letter'; // 'analytical' (T, D7, etc.), 'roman' (I, V7, etc.) or 'letter' (C, G7/B, etc.)
  progressionRootNote?: string; // 'C' by default, or 'G', 'D', 'random', etc.
  progressionSpacing?: 'original' | 'close' | 'open' | 'random';
  progressionMelodicPosition?: 'original' | 'octave' | 'third' | 'fifth' | 'random';
  autoAdvanceOnCorrect?: boolean; // auto-play new task when correct
  degreeAutoResolve?: boolean; // auto-play resolution to I degree on answer
  degreeType?: 'diatonic' | 'chromatic'; // 'diatonic' (7) or 'chromatic' (12)
  degreeRootNote?: string; // 'C' by default, or 'random', 'D', 'G', etc.
  degreeScaleMode?: 'major' | 'minor'; // 'major' by default, or 'minor'
  cadenceBeforeTask?: boolean; // auto-play key cadence before playing task note
  mnemonicMode?: 'none' | 'color_functions' | 'interval_name'; // mnemonic learning aid mode
  theme?: ThemeMode;
  sustainConstructionRoot?: boolean;
  tonalTiming?: number; // -1.0 to 1.5s (-: overlap, +: gap pause)
  spacedRepetitionEnabled?: boolean; // Smart Spaced Repetition adaptive task selection based on error statistics
  cardPalette?: 'indigo' | 'espresso' | 'emerald' | 'violet';
  twoNotesBalance?: number; // -1.0 to 1.0 (0 is balanced 50/50, <0 louder lower note, >0 louder upper note)
  twoNotesStyle?: 'harmonic' | 'arpeggio'; // playback style specifically for scale degree two-notes mode
  degreeSubMode?: 'cards' | 'marathon'; // practice cards vs marathon survival in scale degree mode
}

export type TrainingMode = 'standard' | 'oral' | 'construction' | 'degree' | 'tonal' | 'progression' | 'harmonization' | 'pitch_memory' | 'marathon';

export interface ItemStat {
  tested: number;
  correct: number;
  lastTested?: number;
}

export interface AppStats {
  totalTested: number;
  totalCorrect: number;
  items: Record<string, ItemStat>;
}

export interface CurrentTask {
  item: MusicItem;
  rootMidi: number;
  rootNoteName: string;
  revealed: boolean;
  userAnswerId: string | null;
  isCorrect: boolean | null;
  playedAt: number;
  constructionDirection?: 'up' | 'down';
  playedDirection?: 'up' | 'down';
}
