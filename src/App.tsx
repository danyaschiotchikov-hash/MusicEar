import React, { useState, useEffect, useCallback, useRef, useMemo, useTransition } from 'react';
import {
  CategoryId,
  CurrentTask,
  MusicItem,
  PlaybackSettings,
  TrainingMode,
} from './types';
import {
  ALL_ITEMS,
  NOTE_NAMES,
  NOTE_NAMES_RU,
  CATEGORIES,
  CHROMATIC_NOTES_UP,
  CHROMATIC_NOTES_DOWN,
} from './data/musicData';
import {
  loadAppState,
  saveAppState,
  DEFAULT_SETTINGS,
  DEFAULT_ACTIVE_CATEGORIES,
} from './db/storage';
import { audioEngine } from './audio/audioEngine';
import { CategoryChips, QuickCategoryKey } from './components/CategoryChips';
import { LeftSettingsDrawer } from './components/LeftSettingsDrawer';
import { AnswerGrid } from './components/AnswerGrid';
import { OralModeCard } from './components/OralModeCard';
import { ConstructionModeCard } from './components/ConstructionModeCard';
import { PlaybackStyleDirectionBar } from './components/PlaybackStyleDirectionBar';
import {
  Play,
  RotateCcw,
  SlidersHorizontal,
  CheckCircle2,
  XCircle,
  Volume2,
  ListMusic,
  Eye,
  Sparkles,
} from 'lucide-react';

export default function App() {
  const [, startTransition] = useTransition();

  // App Settings & Modes
  const [settings, setSettings] = useState<PlaybackSettings>(DEFAULT_SETTINGS);
  const [activeCategories, setActiveCategories] = useState<string[]>(DEFAULT_ACTIVE_CATEGORIES);
  const [activeItemIds, setActiveItemIds] = useState<string[]>(() => ALL_ITEMS.map((i) => i.id));
  const [mode, setMode] = useState<TrainingMode>('oral');

  // Task & Audio State
  const [currentTask, setCurrentTask] = useState<CurrentTask | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    text: string;
    type: 'idle' | 'playing' | 'correct' | 'wrong';
  }>({
    text: 'Нажмите «Новый звук», чтобы начать тренировку',
    type: 'idle',
  });

  // Collapsible Left Drawer State
  const [isLeftDrawerOpen, setIsLeftDrawerOpen] = useState(false);

  // Auto-advance timer ref
  const autoAdvanceTimerRef = useRef<number | null>(null);

  // Audio sample loading state
  const [sampleStatus, setSampleStatus] = useState(audioEngine.getSampleStatus());

  // Preload Salamander Grand samples
  const handleLoadSamples = useCallback(async () => {
    setSampleStatus({ isLoaded: false, isLoading: true, progress: 0 });
    const ok = await audioEngine.preloadSalamander((progress) => {
      setSampleStatus({ isLoaded: false, isLoading: true, progress });
    });
    setSampleStatus({ isLoaded: ok, isLoading: false, progress: ok ? 100 : 0 });
  }, []);

  // 1. Initial Load from IndexedDB
  useEffect(() => {
    async function init() {
      const savedState = await loadAppState();
      startTransition(() => {
        setSettings(savedState.settings);
        setActiveCategories(savedState.activeCategories);
        setActiveItemIds(savedState.activeItemIds);
        setMode(savedState.mode);
      });
      // Preload Salamander samples by default
      if (savedState.settings.timbre === 'salamander') {
        audioEngine.preloadSalamander((progress) => {
          setSampleStatus({ isLoaded: false, isLoading: true, progress });
        }).then((ok) => {
          setSampleStatus({ isLoaded: ok, isLoading: false, progress: ok ? 100 : 0 });
        });
      }
    }
    init();

    return () => {
      if (autoAdvanceTimerRef.current) clearTimeout(autoAdvanceTimerRef.current);
      audioEngine.stopAll();
    };
  }, []);

  // 2. Persist Settings to IndexedDB
  useEffect(() => {
    saveAppState({
      settings,
      activeCategories,
      activeItemIds,
      mode,
    });
  }, [settings, activeCategories, activeItemIds, mode]);

  // Derive root pitch based on user selection or random, ensuring comfortable hearing range
  const resolveRootMidi = useCallback(
    (rootPref: string, dir: 'up' | 'down' = 'up'): { midi: number; noteName: string } => {
      let semitone: number;
      let octave: number;

      const NOTE_LOOKUP: Record<string, number> = {
        'c': 0, 'cis': 1, 'des': 1, 'c#': 1, 'db': 1,
        'd': 2, 'dis': 3, 'es': 3, 'd#': 3, 'eb': 3,
        'e': 4,
        'f': 5, 'fis': 6, 'ges': 6, 'f#': 6, 'gb': 6,
        'g': 7, 'gis': 8, 'as': 8, 'g#': 8, 'ab': 8,
        'a': 9, 'ais': 10, 'b': 10, 'bb': 10, 'a#': 10,
        'h': 11,
      };

      if (!rootPref || rootPref === 'random') {
        semitone = Math.floor(Math.random() * 12);
      } else {
        const cleanPref = rootPref.split(/[\s(/]/)[0].toLowerCase();
        if (cleanPref in NOTE_LOOKUP) {
          semitone = NOTE_LOOKUP[cleanPref];
        } else {
          const parsed = parseInt(rootPref, 10);
          if (!isNaN(parsed) && parsed >= 0 && parsed <= 11) {
            semitone = parsed;
          } else {
            semitone = 0; // Default C
          }
        }
      }

      // Ensure notes are always clear and distinguishable (sweet spot MIDI 53..78):
      if (dir === 'down') {
        octave = semitone <= 4 ? 5 : 4;
      } else {
        octave = semitone >= 7 ? 3 : 4;
      }

      const midi = (octave + 1) * 12 + semitone;
      // Pure classical Latin solfege note name (e.g. C, Cis, Des, D, Dis, Es, etc.):
      const noteName = dir === 'down' ? CHROMATIC_NOTES_DOWN[semitone] : CHROMATIC_NOTES_UP[semitone];
      return { midi, noteName };
    },
    []
  );

  // Play full item for standard / oral mode
  const playCurrentTask = useCallback(
    (task: CurrentTask) => {
      audioEngine.stopAll();
      setIsPlaying(true);
      setStatusMessage({
        text: `Слушайте: опорный звук ${task.rootNoteName}...`,
        type: 'playing',
      });

      audioEngine.playItem(
        task.item,
        task.rootMidi,
        settings,
        (midis) => {
          if (midis.length === 0) {
            setIsPlaying(false);
            setStatusMessage({
              text: 'Определите созвучие и нажмите на карточку с ответом',
              type: 'idle',
            });
          }
        },
        task.playedDirection,
        mode === 'oral' && task.playedDirection === 'down'
      );
    },
    [settings, mode]
  );

  // New Question (Immediately interruptible on click!)
  const handleNewTask = useCallback(() => {
    // Clear any pending auto advance timer
    if (autoAdvanceTimerRef.current) {
      clearTimeout(autoAdvanceTimerRef.current);
      autoAdvanceTimerRef.current = null;
    }

    // Immediately cut off any previous audio
    audioEngine.stopAll();

    const pool = ALL_ITEMS.filter((i) => activeItemIds.includes(i.id));
    if (pool.length === 0) {
      setStatusMessage({
        text: 'Выберите хотя бы одну категорию или элемент!',
        type: 'idle',
      });
      return;
    }

    const randomItem = pool[Math.floor(Math.random() * pool.length)];

    // Determine direction deterministically for this task
    let taskDirection: 'up' | 'down' = 'up';
    if (randomItem.forceAscendingOnly) {
      taskDirection = 'up';
    } else if (mode === 'construction') {
      taskDirection = Math.random() > 0.5 ? 'up' : 'down';
    } else if (settings.direction === 'random') {
      taskDirection = Math.random() > 0.5 ? 'up' : 'down';
    } else {
      taskDirection = settings.direction === 'down' ? 'down' : 'up';
    }

    const { midi: rootMidi, noteName: rootNoteName } = resolveRootMidi(settings.rootNote, taskDirection);

    const newTask: CurrentTask = {
      item: randomItem,
      rootMidi,
      rootNoteName,
      revealed: false,
      userAnswerId: null,
      isCorrect: null,
      playedAt: Date.now(),
      playedDirection: taskDirection,
      constructionDirection: mode === 'construction' ? taskDirection : undefined,
    };

    setCurrentTask(newTask);

    if (mode === 'construction') {
      // Play only root reference tone
      setIsPlaying(true);
      setStatusMessage({
        text: `Опорный тон: ${rootNoteName}. Постройте ${taskDirection === 'up' ? 'вверх' : 'вниз'}: «${randomItem.name}»`,
        type: 'playing',
      });
      audioEngine.playRootOnly(
        rootMidi,
        settings,
        (midis) => {
          if (midis.length === 0) {
            setIsPlaying(false);
          }
        }
      );
    } else {
      audioEngine.stopDrone();
      playCurrentTask(newTask);
    }
  }, [activeItemIds, resolveRootMidi, settings, mode, playCurrentTask]);

  // Replay (Interrupts any ongoing playback immediately!)
  const handleReplay = useCallback(() => {
    if (!currentTask) return;
    if (autoAdvanceTimerRef.current) {
      clearTimeout(autoAdvanceTimerRef.current);
      autoAdvanceTimerRef.current = null;
    }
    audioEngine.stopAll();

    if (mode === 'construction') {
      if (currentTask.revealed) {
        setIsPlaying(true);
        setStatusMessage({ text: 'Воспроизведение построенного...', type: 'playing' });
        audioEngine.playItem(
          currentTask.item,
          currentTask.rootMidi,
          settings,
          (midis) => {
            if (midis.length === 0) setIsPlaying(false);
          },
          currentTask.constructionDirection || currentTask.playedDirection
        );
      } else {
        setIsPlaying(true);
        setStatusMessage({ text: `Опорный звук: ${currentTask.rootNoteName}`, type: 'playing' });
        audioEngine.playRootOnly(
          currentTask.rootMidi,
          settings,
          (midis) => {
            if (midis.length === 0) setIsPlaying(false);
          }
        );
      }
    } else {
      // Oral and standard modes:
      // If user selected up/down in settings, immediately reflect it in oral mode
      const targetDir = (settings.direction === 'up' || settings.direction === 'down')
        ? settings.direction
        : (currentTask.playedDirection || 'up');

      if (currentTask.playedDirection !== targetDir) {
        setCurrentTask((prev) => (prev ? { ...prev, playedDirection: targetDir } : null));
      }

      setIsPlaying(true);
      setStatusMessage({
        text: `Слушайте: созвучие от ${currentTask.rootNoteName} (${targetDir === 'down' ? 'вниз' : 'вверх'})...`,
        type: 'playing',
      });

      audioEngine.playItem(
        currentTask.item,
        currentTask.rootMidi,
        settings,
        (midis) => {
          if (midis.length === 0) {
            setIsPlaying(false);
            setStatusMessage({
              text: 'Определите созвучие и нажмите на карточку с ответом',
              type: 'idle',
            });
          }
        },
        targetDir,
        mode === 'oral' && targetDir === 'down'
      );
    }
  }, [currentTask, mode, settings, playCurrentTask]);

  // Audio Comparison handler: plays a specific item from the same root tone and direction
  const handlePlayComparison = useCallback(
    (itemToPlay: MusicItem) => {
      if (!currentTask) return;
      if (autoAdvanceTimerRef.current) {
        clearTimeout(autoAdvanceTimerRef.current);
        autoAdvanceTimerRef.current = null;
      }
      audioEngine.stopAll();
      setIsPlaying(true);
      setStatusMessage({
        text: `Звучание «${itemToPlay.name}» от ${currentTask.rootNoteName}`,
        type: 'playing',
      });
      audioEngine.playItem(
        itemToPlay,
        currentTask.rootMidi,
        settings,
        (midis) => {
          if (midis.length === 0) setIsPlaying(false);
        },
        currentTask.playedDirection
      );
    },
    [currentTask, settings]
  );

  // Construction Mode specific handlers
  const handleReplayRoot = useCallback(() => {
    if (!currentTask) return;
    audioEngine.stopAll();
    setIsPlaying(true);
    setStatusMessage({ text: `Опорный звук: ${currentTask.rootNoteName}`, type: 'playing' });
    audioEngine.playRootOnly(
      currentTask.rootMidi,
      settings,
      (midis) => {
        if (midis.length === 0) setIsPlaying(false);
      }
    );
  }, [currentTask, settings]);

  const handleUpdateSettings = useCallback((newSettings: Partial<PlaybackSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
    if (newSettings.direction && (newSettings.direction === 'up' || newSettings.direction === 'down')) {
      if (mode === 'oral') {
        setCurrentTask((prev) => (prev ? { ...prev, playedDirection: newSettings.direction as 'up' | 'down' } : null));
      }
    }
  }, [mode]);

  const handleConstructionReveal = useCallback(() => {
    if (!currentTask) return;
    audioEngine.stopAll();
    audioEngine.stopDrone();
    setCurrentTask((prev) => (prev ? { ...prev, revealed: true } : null));
    setIsPlaying(true);
    setStatusMessage({
      text: `Ответ: «${currentTask.item.name}» ${currentTask.constructionDirection === 'down' ? 'вниз' : 'вверх'} от ${currentTask.rootNoteName}`,
      type: 'idle',
    });
    audioEngine.playItem(
      currentTask.item,
      currentTask.rootMidi,
      settings,
      (midis) => {
        if (midis.length === 0) setIsPlaying(false);
      },
      currentTask.constructionDirection
    );
  }, [currentTask, settings]);

  // User submits answer in Standard mode
  const handleSelectAnswer = useCallback(
    (selectedItem: MusicItem) => {
      if (!currentTask || currentTask.userAnswerId !== null) return;

      const isCorrect = selectedItem.id === currentTask.item.id;

      setCurrentTask((prev) =>
        prev
          ? {
              ...prev,
              userAnswerId: selectedItem.id,
              isCorrect,
              revealed: true,
            }
          : null
      );

      if (isCorrect) {
        setStatusMessage({
          text: `Верно! Это «${currentTask.item.name}» (тоника: ${currentTask.rootNoteName})`,
          type: 'correct',
        });

        // Feature: Auto-advance to new task immediately if enabled (default: enabled)
        if (settings.autoAdvanceOnCorrect !== false) {
          if (autoAdvanceTimerRef.current) clearTimeout(autoAdvanceTimerRef.current);
          autoAdvanceTimerRef.current = window.setTimeout(() => {
            handleNewTask();
          }, 1100);
        }
      } else {
        setStatusMessage({
          text: `Ошибка! Правильный ответ: «${currentTask.item.name}» (тоника: ${currentTask.rootNoteName})`,
          type: 'wrong',
        });
      }
    },
    [currentTask, settings.autoAdvanceOnCorrect, handleNewTask]
  );

  // Oral mode reveal
  const handleOralReveal = useCallback(() => {
    if (!currentTask) return;
    setCurrentTask((prev) => (prev ? { ...prev, revealed: true } : null));
    setStatusMessage({
      text: `Ответ: «${currentTask.item.name}» (тоника: ${currentTask.rootNoteName})`,
      type: 'idle',
    });
  }, [currentTask]);

  // Oral mode self score
  const handleOralSelfScore = useCallback(
    (isCorrect: boolean) => {
      if (!currentTask || currentTask.userAnswerId !== null) return;
      setCurrentTask((prev) =>
        prev
          ? {
              ...prev,
              userAnswerId: isCorrect ? currentTask.item.id : 'oral_wrong',
              isCorrect,
            }
          : null
      );
      setStatusMessage({
        text: isCorrect ? `Зачтено как верно!` : `Зачтено как ошибка. Тренируйтесь дальше!`,
        type: isCorrect ? 'correct' : 'wrong',
      });

      if (isCorrect && settings.autoAdvanceOnCorrect !== false) {
        if (autoAdvanceTimerRef.current) clearTimeout(autoAdvanceTimerRef.current);
        autoAdvanceTimerRef.current = window.setTimeout(() => {
          handleNewTask();
        }, 1100);
      }
    },
    [currentTask, settings.autoAdvanceOnCorrect, handleNewTask]
  );

  // Mapping for the 5 Quick Access Categories
  const QUICK_CATEGORY_MAP: Record<QuickCategoryKey, CategoryId[]> = useMemo(
    () => ({
      simple_intervals: ['simple_intervals'],
      characteristic_intervals: ['characteristic_intervals'],
      triads: ['triads'],
      seventh_chords: ['seventh_chords', 'd7_inversions'],
      scales: ['scales', 'modes'],
    }),
    []
  );

  // Multi-select toggle for the 5 Quick Access categories
  const handleToggleQuickCategory = useCallback(
    (key: QuickCategoryKey) => {
      const targetCategories = QUICK_CATEGORY_MAP[key];
      const categoryItemIds = ALL_ITEMS.filter((i) => targetCategories.includes(i.category)).map((i) => i.id);

      setActiveItemIds((prev) => {
        const allSelected = categoryItemIds.length > 0 && categoryItemIds.every((id) => prev.includes(id));
        if (allSelected) {
          // Deselect, but ensure at least 1 item remains in active pool
          const remaining = prev.filter((id) => !categoryItemIds.includes(id));
          return remaining.length > 0 ? remaining : prev;
        } else {
          // Multi-select: add this category to active items
          return Array.from(new Set([...prev, ...categoryItemIds]));
        }
      });

      setActiveCategories((prev) => {
        const allIn = targetCategories.every((c) => prev.includes(c));
        if (allIn) {
          const remaining = prev.filter((c) => !targetCategories.includes(c as CategoryId));
          return remaining.length > 0 ? remaining : prev;
        } else {
          return Array.from(new Set([...prev, ...targetCategories]));
        }
      });
    },
    [QUICK_CATEGORY_MAP]
  );

  // Compute which of the 5 quick categories are currently selected
  const selectedQuickCategories = useMemo<QuickCategoryKey[]>(() => {
    const keys: QuickCategoryKey[] = [];
    for (const [key, targetCategories] of Object.entries(QUICK_CATEGORY_MAP)) {
      const categoryItemIds = ALL_ITEMS.filter((i) => targetCategories.includes(i.category)).map((i) => i.id);
      if (categoryItemIds.length > 0 && categoryItemIds.some((id) => activeItemIds.includes(id))) {
        keys.push(key as QuickCategoryKey);
      }
    }
    return keys;
  }, [QUICK_CATEGORY_MAP, activeItemIds]);

  // Backward-compatible preset handler for AnswerGrid
  const handleEnablePreset = useCallback((preset: 'intervals' | 'chords' | 'scales' | 'all') => {
    let catIds: CategoryId[] = [];
    if (preset === 'intervals') {
      catIds = ['simple_intervals', 'characteristic_intervals'];
    } else if (preset === 'chords') {
      catIds = ['triads', 'seventh_chords', 'd7_inversions'];
    } else if (preset === 'scales') {
      catIds = ['scales', 'modes'];
    } else {
      catIds = CATEGORIES.map((c) => c.id);
    }
    const itemIds = ALL_ITEMS.filter((i) => catIds.includes(i.category)).map((i) => i.id);
    setActiveCategories(catIds);
    setActiveItemIds(itemIds);
  }, []);

  // Item toggle in SettingsModal
  const handleToggleItem = useCallback((id: string) => {
    setActiveItemIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  }, []);

  // Category bulk toggle in SettingsModal
  const handleSelectAllCategory = useCallback((catId: CategoryId, select: boolean) => {
    const catItemIds = ALL_ITEMS.filter((i) => i.category === catId).map((i) => i.id);
    setActiveItemIds((prev) => {
      if (select) {
        return Array.from(new Set([...prev, ...catItemIds]));
      } else {
        return prev.filter((id) => !catItemIds.includes(id));
      }
    });
    setActiveCategories((prev) => {
      if (select) {
        return prev.includes(catId) ? prev : [...prev, catId];
      } else {
        return prev.filter((c) => c !== catId);
      }
    });
  }, []);

  // Global bulk toggle in SettingsModal
  const handleSelectAllGlobal = useCallback((select: boolean) => {
    if (select) {
      setActiveItemIds(ALL_ITEMS.map((i) => i.id));
      setActiveCategories(CATEGORIES.map((c) => c.id));
    } else {
      setActiveItemIds([]);
      setActiveCategories([]);
    }
  }, []);

  // Stop continuous drone when switching away from construction mode
  useEffect(() => {
    if (mode !== 'construction') {
      audioEngine.stopDrone();
    }
  }, [mode]);

  // Apply light or dark theme class to root html document
  useEffect(() => {
    if (settings.theme === 'light') {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    }
  }, [settings.theme]);

  // Keyboard shortcut listener (Space = replay, N = new)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement) return;

      if (e.code === 'Space') {
        e.preventDefault();
        handleReplay();
      } else if (e.key === 'n' || e.key === 'N' || e.key === 'т' || e.key === 'Т') {
        handleNewTask();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleReplay, handleNewTask]);

  const isLight = settings.theme === 'light';

  return (
    <div className={`min-h-screen ${isLight ? 'light light-mode bg-slate-100 text-slate-900' : 'dark bg-slate-950 text-slate-100'} flex flex-col items-center justify-start p-2 sm:p-4 select-none font-sans transition-colors duration-200`}>
      <div className="w-full max-w-5xl flex flex-col gap-2.5 sm:gap-3">
        {/* Top Control Bar: Left Settings Drawer Trigger + Mode Switcher */}
        <div className="w-full bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-xl p-1.5 flex items-center justify-between gap-1.5 shadow-sm">
          {/* Collapsible Left Settings Drawer Button (Icon only) */}
          <button
            onClick={() => setIsLeftDrawerOpen(true)}
            className="flex items-center justify-center p-2 bg-indigo-600/20 hover:bg-indigo-600/30 active:scale-95 text-indigo-300 hover:text-indigo-200 border border-indigo-500/40 rounded-lg transition cursor-pointer shrink-0 shadow-sm"
            title="Настройки"
            aria-label="Настройки"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>

          <div className="h-5 w-px bg-slate-800 shrink-0" />

          {/* Training Mode Switcher Tabs */}
          <div className="flex-1 flex items-center gap-1">
            <button
              onClick={() => setMode('standard')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
                mode === 'standard'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-950 font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <ListMusic className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate whitespace-nowrap">Тест</span>
              <span className="hidden sm:inline">(Варианты)</span>
            </button>

            <button
              onClick={() => setMode('oral')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
                mode === 'oral'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-950 font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <Eye className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate whitespace-nowrap">Устный</span>
            </button>

            <button
              onClick={() => setMode('construction')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
                mode === 'construction'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-950 font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate whitespace-nowrap">Построение</span>
              <span className="hidden md:inline">от ноты</span>
            </button>
          </div>
        </div>

        {/* Quick Sets Bar (5 buttons with multi-select support) */}
        <CategoryChips
          selectedCategories={selectedQuickCategories}
          onToggleCategory={handleToggleQuickCategory}
        />

        {/* Style & Direction Toggles for Oral and Construction Modes (Right under categories) */}
        {(mode === 'oral' || mode === 'construction') && (
          <PlaybackStyleDirectionBar
            settings={settings}
            onSettingsChange={handleUpdateSettings}
          />
        )}

        {/* Status Message - only shown in Standard Test mode */}
        {mode === 'standard' && (
          <div className="w-full bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-xl p-2 sm:p-2.5 shadow-md flex items-center justify-between gap-2">
            <div
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg border transition-all text-xs font-semibold min-h-[38px] ${
                statusMessage.type === 'correct'
                  ? 'bg-emerald-950/70 border-emerald-500/80 text-emerald-200 shadow-sm'
                  : statusMessage.type === 'wrong'
                  ? 'bg-rose-950/70 border-rose-500/80 text-rose-200 shadow-sm'
                  : statusMessage.type === 'playing'
                  ? 'bg-indigo-950/70 border-indigo-500/80 text-indigo-200 animate-pulse'
                  : 'bg-slate-950/60 border-slate-800 text-slate-300'
              }`}
            >
              {statusMessage.type === 'correct' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
              {statusMessage.type === 'wrong' && <XCircle className="w-4 h-4 text-rose-400 shrink-0" />}
              {statusMessage.type === 'playing' && <Volume2 className="w-4 h-4 text-indigo-400 shrink-0 animate-bounce" />}
              <span className="truncate">{statusMessage.text}</span>
            </div>
          </div>
        )}

        {/* Primary Interactive Training Zone */}
        <main className="w-full pb-36 sm:pb-40">
          {mode === 'standard' && (
            <AnswerGrid
              activeItemIds={activeItemIds}
              currentTask={currentTask}
              onSelectAnswer={handleSelectAnswer}
              disabled={false}
              onEnablePreset={handleEnablePreset}
              onPlayComparison={handlePlayComparison}
            />
          )}

          {mode === 'oral' && (
            <OralModeCard
              currentTask={currentTask}
              settings={settings}
              onReveal={handleOralReveal}
              onReplay={handleReplay}
            />
          )}

          {mode === 'construction' && (
            <ConstructionModeCard
              currentTask={currentTask}
              settings={settings}
              onReveal={handleConstructionReveal}
              onReplayRoot={handleReplayRoot}
              onReplayFull={handleConstructionReveal}
            />
          )}
        </main>
      </div>

      {/* Fixed Bottom Action Dock (Always pinned in one place at the bottom of the screen) */}
      <div className="fixed bottom-0 left-0 right-0 z-30 pointer-events-none flex justify-center p-2.5 sm:p-4 bg-gradient-to-t from-slate-950 via-slate-950/95 to-transparent pt-8 fixed-bottom-dock">
        <div className="w-full max-w-xl pointer-events-auto flex flex-col gap-2">
          {/* Row 1: "Показать ответ" / "Проверить построение" in Oral and Construction modes */}
          {mode === 'oral' && (
            !currentTask?.revealed ? (
              <button
                type="button"
                onClick={handleOralReveal}
                disabled={!currentTask}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-500 active:scale-[0.99] disabled:opacity-40 text-white font-bold text-sm sm:text-base rounded-2xl shadow-lg shadow-indigo-950/50 border border-indigo-400/40 transition cursor-pointer"
                title="Показать ответ"
              >
                <Eye className="w-4 h-4 shrink-0" />
                <span>Показать ответ</span>
              </button>
            ) : (
              <div className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-emerald-950/70 border border-emerald-500/50 rounded-2xl text-emerald-300 text-xs font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Ответ показан в карточке</span>
              </div>
            )
          )}

          {mode === 'construction' && (
            !currentTask?.revealed ? (
              <button
                type="button"
                onClick={handleConstructionReveal}
                disabled={!currentTask}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-500 active:scale-[0.99] disabled:opacity-40 text-white font-bold text-sm sm:text-base rounded-2xl shadow-lg shadow-indigo-950/50 border border-indigo-400/40 transition cursor-pointer"
                title="Проверить построение"
              >
                <Eye className="w-4 h-4 shrink-0" />
                <span>Проверить построение</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleConstructionReveal}
                disabled={!currentTask}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] disabled:opacity-40 text-white font-bold text-sm sm:text-base rounded-2xl shadow-lg shadow-emerald-950/50 border border-emerald-400/40 transition cursor-pointer"
                title="Слушать построенное еще раз"
              >
                <RotateCcw className="w-4 h-4 shrink-0" />
                <span>Слушать построенное</span>
              </button>
            )
          )}

          {/* Row 2: "Новый звук" (flex-1) + "Повтор" (compact single-symbol icon button) */}
          <div className="w-full flex items-center gap-2">
            <button
              type="button"
              onClick={handleNewTask}
              className="flex-1 flex items-center justify-center gap-2 py-3 sm:py-3.5 px-4 bg-gradient-to-r from-indigo-600 via-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 active:scale-[0.99] text-white font-bold text-sm sm:text-base rounded-2xl shadow-xl shadow-indigo-950/60 border border-indigo-400/30 transition cursor-pointer"
              title="Новое задание (Горячая клавиша: N)"
            >
              <Play className="w-4 h-4 fill-current shrink-0" />
              <span>Новый звук</span>
              <kbd className="hidden sm:inline-block ml-1 text-[10px] px-1.5 py-0.5 rounded bg-white/20 text-white font-mono leading-none">
                N
              </kbd>
            </button>

            <button
              type="button"
              onClick={handleReplay}
              disabled={!currentTask}
              className="w-13 sm:w-14 py-3 sm:py-3.5 flex items-center justify-center bg-slate-900 hover:bg-slate-800 active:scale-95 disabled:opacity-40 text-indigo-400 hover:text-indigo-300 rounded-2xl border border-slate-700/80 shadow-lg transition cursor-pointer shrink-0"
              title="Повторить звучание (Горячая клавиша: Пробел)"
              aria-label="Повтор"
            >
              <RotateCcw className="w-5 h-5 shrink-0" />
            </button>
          </div>
        </div>
      </div>

      {/* Collapsible Left Settings Drawer (All Sound Parameters, Categories, Items, and Export) */}
      <LeftSettingsDrawer
        isOpen={isLeftDrawerOpen}
        onClose={() => setIsLeftDrawerOpen(false)}
        settings={settings}
        onSettingsChange={(newSettings) => setSettings((prev) => ({ ...prev, ...newSettings }))}
        activeItemIds={activeItemIds}
        onToggleItem={handleToggleItem}
        onSelectAllCategory={handleSelectAllCategory}
        onSelectAllGlobal={handleSelectAllGlobal}
        sampleStatus={sampleStatus}
        onLoadSamples={handleLoadSamples}
      />
    </div>
  );
}
