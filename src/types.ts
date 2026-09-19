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
  forceAscendingOnly?: boolean; // For melodic major & minor
}

export type TimbreType = 'salamander' | 'triangle';
export type PlaybackStyle = 'arpeggio' | 'harmonic';
export type PlaybackDirection = 'up' | 'down' | 'random';
export type ThemeMode = 'dark' | 'light';

export interface PlaybackSettings {
  timbre: TimbreType;
  tempo: number; // 0.2 - 1.8
  resonance: number; // 0.0 - 2.0
  decay: number; // 0.2 - 3.0
  volume: number; // 0.0 - 1.0
  style: PlaybackStyle;
  direction: PlaybackDirection;
  rootNote: string; // 'random' or 'C', 'C#', etc.
  autoAdvanceOnCorrect?: boolean; // auto-play new task when correct
  theme?: ThemeMode;
  sustainConstructionRoot?: boolean;
}

export type TrainingMode = 'standard' | 'oral' | 'construction';

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
