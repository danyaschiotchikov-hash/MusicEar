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
export type ThemeMode = 'dark' | 'light_warm' | 'light_slate' | 'light_sand' | 'light';

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
  tonalRootPositionOnly?: boolean; // only root position (5/3, 7) vs all inversions (default true)
  tonalAllowedDegrees?: string[]; // allowed degree IDs (e.g. ['deg_I', 'deg_IV', 'deg_V', 'deg_V7', ...])
  tonalViewMode?: 'grid' | 'cards'; // 'grid' (functional table) or 'cards' (oral-style single card)
  progressionCategory?: 'all' | 'passing' | 'auxiliary' | 'phrygian' | 'cadential' | 'deceptive' | 'sequence';
  progressionViewMode?: 'cards' | 'test'; // 'cards' (oral) or 'test' (choice grid)
  progressionNotation?: 'analytical' | 'roman' | 'letter'; // 'analytical' (T, D7, etc.), 'roman' (I, V7, etc.) or 'letter' (C, G7/B, etc.)
  progressionRootNote?: string; // 'C' by default, or 'G', 'D', 'random', etc.
  autoAdvanceOnCorrect?: boolean; // auto-play new task when correct
  theme?: ThemeMode;
  sustainConstructionRoot?: boolean;
  tonalTiming?: number; // -1.0 to 1.5s (-: overlap, +: gap pause)
}

export type TrainingMode = 'standard' | 'oral' | 'construction' | 'tonal' | 'progression';

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
