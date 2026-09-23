import { AppStats, PlaybackSettings, TrainingMode } from '../types';
import { ALL_ITEMS } from '../data/musicData';

export interface StoredAppState {
  settings: PlaybackSettings;
  activeCategories: string[];
  activeItemIds: string[];
  mode: TrainingMode;
}

export const DEFAULT_SETTINGS: PlaybackSettings = {
  timbre: 'salamander',
  tempo: 0.5,
  resonance: 2.0,
  decay: 2.5,
  volume: 0.85,
  style: 'harmonic',
  direction: 'random',
  rootNote: 'random',
  tonalRootNote: 'C',
  tonalScaleMode: 'major',
  tonalChordFilter: 'diatonic',
  tonalRootPositionOnly: false,
  tonalInversionsMode: 'popular',
  tonalTheme: 'tsd_basics',
  tonalAllowedVoicings: ['v_T53', 'v_S53', 'v_D53'],
  tonalAllowedDegrees: ['deg_I', 'deg_IV', 'deg_V'],
  tonalViewMode: 'cards',
  progressionCategory: undefined,
  progressionCategories: [],
  progressionViewMode: 'cards',
  progressionNotation: 'roman',
  progressionRootNote: 'C',
  progressionSpacing: 'random',
  progressionMelodicPosition: 'random',
  autoAdvanceOnCorrect: true,
  cadenceBeforeTask: false,
  degreeSubMode: 'marathon',
  degreeRootNote: 'C',
  degreeScaleMode: 'major',
  theme: 'dark',
  sustainConstructionRoot: false,
  spacedRepetitionEnabled: true,
  cardPalette: 'indigo',
};

export const DEFAULT_ACTIVE_CATEGORIES: string[] = [
  'simple_intervals',
  'characteristic_intervals',
  'triads',
  'seventh_chords',
  'd7_inversions',
  'scales',
  'modes',
];

export const DEFAULT_APP_STATE: StoredAppState = {
  settings: DEFAULT_SETTINGS,
  activeCategories: DEFAULT_ACTIVE_CATEGORIES,
  activeItemIds: ALL_ITEMS.map((item) => item.id),
  mode: 'marathon',
};

export const DEFAULT_STATS: AppStats = {
  totalTested: 0,
  totalCorrect: 0,
  items: {},
};

// Database disabled temporarily as requested for maximum speed and zero IO lag
export async function loadAppState(): Promise<StoredAppState> {
  try {
    const saved = localStorage.getItem('musical_ear_trainer_state');
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        settings: { ...DEFAULT_SETTINGS, ...parsed.settings },
        activeCategories: parsed.activeCategories || DEFAULT_ACTIVE_CATEGORIES,
        activeItemIds: parsed.activeItemIds || ALL_ITEMS.map((i) => i.id),
        mode: parsed.mode || 'marathon',
      };
    }
  } catch {
    // ignore
  }
  return DEFAULT_APP_STATE;
}

export async function saveAppState(state: StoredAppState): Promise<void> {
  try {
    localStorage.setItem('musical_ear_trainer_state', JSON.stringify(state));
  } catch {
    // ignore
  }
}

export async function loadStats(): Promise<AppStats> {
  try {
    const saved = localStorage.getItem('musical_ear_trainer_stats');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && typeof parsed.totalTested === 'number') {
        return parsed;
      }
    }
  } catch {
    // ignore
  }
  return DEFAULT_STATS;
}

export async function saveStats(stats: AppStats): Promise<void> {
  try {
    localStorage.setItem('musical_ear_trainer_stats', JSON.stringify(stats));
  } catch {
    // ignore
  }
}

export async function resetStatsInDB(): Promise<AppStats> {
  const fresh: AppStats = {
    totalTested: 0,
    totalCorrect: 0,
    items: {},
  };
  await saveStats(fresh);
  return fresh;
}
