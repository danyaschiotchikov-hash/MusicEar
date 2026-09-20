import { AppStats, PlaybackSettings, TrainingMode } from '../types';
import { ALL_ITEMS } from '../data/musicData';

const DB_NAME = 'MusicalEarTrainerDB';
const DB_VERSION = 1;
const STORE_SETTINGS = 'settings';
const STORE_STATS = 'stats';

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
  tonalRootPositionOnly: true,
  tonalViewMode: 'grid',
  progressionCategory: 'all',
  progressionViewMode: 'cards',
  progressionNotation: 'roman',
  progressionRootNote: 'C',
  autoAdvanceOnCorrect: true,
  theme: 'dark',
  sustainConstructionRoot: false,
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
  mode: 'oral',
};

export const DEFAULT_STATS: AppStats = {
  totalTested: 0,
  totalCorrect: 0,
  items: {},
};

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject(new Error('IndexedDB not supported'));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_SETTINGS)) {
        db.createObjectStore(STORE_SETTINGS);
      }
      if (!db.objectStoreNames.contains(STORE_STATS)) {
        db.createObjectStore(STORE_STATS);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function loadAppState(): Promise<StoredAppState> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_SETTINGS, 'readonly');
      const store = tx.objectStore(STORE_SETTINGS);
      const req = store.get('app_state');
      req.onsuccess = () => {
        if (req.result) {
          // Merge with defaults in case new items were added
          const merged: StoredAppState = {
            settings: { ...DEFAULT_SETTINGS, ...req.result.settings },
            activeCategories: req.result.activeCategories || DEFAULT_ACTIVE_CATEGORIES,
            activeItemIds: req.result.activeItemIds || ALL_ITEMS.map((i) => i.id),
            mode: req.result.mode || 'standard',
          };
          resolve(merged);
        } else {
          resolve(DEFAULT_APP_STATE);
        }
      };
      req.onerror = () => resolve(DEFAULT_APP_STATE);
    });
  } catch (err) {
    // Fallback to localStorage
    console.warn('Using localStorage fallback for settings:', err);
    try {
      const saved = localStorage.getItem('musical_ear_trainer_state');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return DEFAULT_APP_STATE;
  }
}

export async function saveAppState(state: StoredAppState): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_SETTINGS, 'readwrite');
    tx.objectStore(STORE_SETTINGS).put(state, 'app_state');
  } catch (err) {
    console.warn('Saving to localStorage fallback:', err);
    try {
      localStorage.setItem('musical_ear_trainer_state', JSON.stringify(state));
    } catch {
      // ignore
    }
  }
}

export async function loadStats(): Promise<AppStats> {
  try {
    const db = await openDB();
    const idbResult = await new Promise<AppStats | null>((resolve) => {
      const tx = db.transaction(STORE_STATS, 'readonly');
      const store = tx.objectStore(STORE_STATS);
      const req = store.get('user_stats');
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    });

    if (idbResult && typeof idbResult.totalTested === 'number') {
      return idbResult;
    }
  } catch (err) {
    console.warn('IndexedDB loadStats error, using localStorage fallback:', err);
  }

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

  try {
    const db = await openDB();
    const tx = db.transaction(STORE_STATS, 'readwrite');
    tx.objectStore(STORE_STATS).put(stats, 'user_stats');
  } catch (err) {
    console.warn('IndexedDB saveStats error:', err);
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
