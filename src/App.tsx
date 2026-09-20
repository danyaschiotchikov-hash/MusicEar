import React, { useState, useEffect, useCallback, useRef, useMemo, useTransition } from 'react';
import {
  CategoryId,
  CurrentTask,
  MusicItem,
  PlaybackSettings,
  TrainingMode,
  AppStats,
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
  loadStats,
  saveStats,
  resetStatsInDB,
  DEFAULT_SETTINGS,
  DEFAULT_ACTIVE_CATEGORIES,
  DEFAULT_STATS,
} from './db/storage';
import { audioEngine } from './audio/audioEngine';
import { CategoryChips, QuickCategoryKey } from './components/CategoryChips';
import { LeftSettingsDrawer } from './components/LeftSettingsDrawer';
import { AnswerGrid } from './components/AnswerGrid';
import { OralModeCard } from './components/OralModeCard';
import { ConstructionModeCard } from './components/ConstructionModeCard';
import { TonalModeCard } from './components/TonalModeCard';
import { ProgressionModeCard } from './components/ProgressionModeCard';
import { PlaybackStyleDirectionBar } from './components/PlaybackStyleDirectionBar';
import { CategorySelectorModal } from './components/CategorySelectorModal';
import { StatsCounterWidget } from './components/StatsCounterWidget';
import { StatsModal } from './components/StatsModal';
import { generateSmartVoicingTask, SmartVoicingTask, getConstructionBreakdown } from './audio/solfegeHelper';
import { getVoicingsForDegree } from './audio/tonalChords';
import { realizeProgression, RealizedProgression, HarmonicProgressionTemplate } from './audio/harmonicProgressions';
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
  Smartphone,
  Radio,
  Music,
  Layers,
  GitBranch,
  BookOpen,
} from 'lucide-react';
import { PWAInstallModal } from './components/PWAInstallModal';
import { ProgressionCatalogModal } from './components/ProgressionCatalogModal';

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

  // Tonal Mode State
  const [tonalTask, setTonalTask] = useState<SmartVoicingTask | null>(null);
  const [tonalTiming, setTonalTiming] = useState<number>(-0.5);
  const [tonalActiveMidis, setTonalActiveMidis] = useState<number[]>([]);

  // Progression Mode State
  const [progressionTask, setProgressionTask] = useState<RealizedProgression | null>(null);
  const [progressionActiveStepIndex, setProgressionActiveStepIndex] = useState<number>(-1);
  const [progressionActiveMidis, setProgressionActiveMidis] = useState<number[]>([]);

  // Collapsible Left Drawer State
  const [isLeftDrawerOpen, setIsLeftDrawerOpen] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isProgressionCatalogOpen, setIsProgressionCatalogOpen] = useState(false);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);

  // Stats persistence state
  const [stats, setStats] = useState<AppStats>(DEFAULT_STATS);

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
      const savedStats = await loadStats();
      startTransition(() => {
        setSettings(savedState.settings);
        setActiveCategories(savedState.activeCategories);
        setActiveItemIds(savedState.activeItemIds);
        setMode(savedState.mode);
        setStats(savedStats);
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

  // Tonal Mode Handlers
  const handlePlayKeyCadence = useCallback(
    (tonicNote: string, scaleMode: 'major' | 'minor') => {
      audioEngine.stopAll();
      setIsPlaying(true);
      setStatusMessage({
        text: `Настройка на тональность: ${tonicNote} ${scaleMode === 'major' ? 'мажор' : 'минор'} (T-S-D-T)...`,
        type: 'playing',
      });

      const offsets: Record<string, number> = {
        C: 0, 'C#': 1, 'C♯': 1, Cis: 1, Des: 1, 'Cis / Des': 1,
        D: 2, 'D#': 3, 'D♯': 3, Dis: 3, Es: 3, 'Dis / Es': 3,
        E: 4, F: 5,
        'F#': 6, 'F♯': 6, Fis: 6, Ges: 6, 'Fis / Ges': 6,
        G: 7, 'G#': 8, 'G♯': 8, Gis: 8, As: 8, 'Gis / As': 8,
        A: 9, 'A#': 10, 'A♯': 10, Ais: 10, 'B♭': 10, Bb: 10, 'Ais / B': 10,
        H: 11, B: 11,
      };
      const pitch = offsets[tonicNote] ?? 9;

      audioEngine.playKeyCadence(
        pitch,
        scaleMode,
        settings,
        (midis) => {
          setTonalActiveMidis(midis);
        },
        () => {
          setTonalActiveMidis([]);
          setIsPlaying(false);
          setStatusMessage({
            text: `Тональность ${tonicNote} ${scaleMode === 'major' ? 'мажор' : 'минор'} настроена.`,
            type: 'idle',
          });
        }
      );
    },
    [settings]
  );

  const handleNewTonalTask = useCallback(() => {
    audioEngine.stopAll();
    const task = generateSmartVoicingTask(
      settings.tonalRootNote ?? 'C',
      settings.tonalChordFilter ?? 'diatonic',
      settings.tonalScaleMode ?? 'major',
      settings.tonalRootPositionOnly ?? false,
      settings.tonalAllowedDegrees
    );
    setTonalTask(task);
    setIsPlaying(true);
    setStatusMessage({
      text: `Слушайте: базовая нота ${task.baseNoteName} и созвучие...`,
      type: 'playing',
    });
    audioEngine.playTonalTask(
      task.baseMidi,
      task.chordNotesMidi,
      tonalTiming,
      settings,
      (midis) => {
        setTonalActiveMidis(midis);
        if (midis.length === 0) setIsPlaying(false);
      }
    );
  }, [settings, tonalTiming]);

  const handleReplayTonalAll = useCallback((overrideStyle?: 'harmonic' | 'arpeggio') => {
    if (!tonalTask) return;
    audioEngine.stopAll();
    setIsPlaying(true);
    setStatusMessage({
      text: `Повтор: базовая нота ${tonalTask.baseNoteName} и созвучие...`,
      type: 'playing',
    });
    const effectiveSettings = overrideStyle ? { ...settings, style: overrideStyle } : settings;
    audioEngine.playTonalTask(
      tonalTask.baseMidi,
      tonalTask.chordNotesMidi,
      tonalTiming,
      effectiveSettings,
      (midis) => {
        setTonalActiveMidis(midis);
        if (midis.length === 0) setIsPlaying(false);
      }
    );
  }, [tonalTask, tonalTiming, settings]);

  const handlePlayTonalBaseOnly = useCallback(() => {
    if (!tonalTask) return;
    audioEngine.stopAll();
    setIsPlaying(true);
    const now = audioEngine.getContext().currentTime;
    audioEngine.playSingleNote(tonalTask.baseMidi, now, 1.3, 1.25, settings);
    setTonalActiveMidis([tonalTask.baseMidi]);
    window.setTimeout(() => {
      setTonalActiveMidis([]);
      setIsPlaying(false);
    }, 1300);
  }, [tonalTask, settings]);

  const handlePlayTonalChordOnly = useCallback(() => {
    if (!tonalTask) return;
    setIsPlaying(true);
    audioEngine.playTonalChordOnly(
      tonalTask.chordNotesMidi,
      tonalTask.baseMidi,
      settings,
      (midis) => setTonalActiveMidis(midis),
      () => setIsPlaying(false)
    );
  }, [tonalTask, settings]);

  const handleTonalReveal = useCallback(() => {
    setTonalTask((prev) => (prev ? { ...prev, revealed: true } : null));
  }, []);

  const handlePreviewTonalDegree = useCallback((degreeId: string) => {
    if (!tonalTask) return;
    audioEngine.stopAll();
    setIsPlaying(true);

    const isMaj = tonalTask.keyScaleMode === 'major';
    const tonicName = tonalTask.baseNoteName;
    const voicings = getVoicingsForDegree(degreeId, isMaj, tonicName);
    if (!voicings || voicings.length === 0) return;

    // Pick root position if settings.tonalRootPositionOnly or first voicing
    const targetVoicing = settings.tonalRootPositionOnly
      ? (voicings.find((v) => v.isRootPosition) ?? voicings[0])
      : voicings[0];

    const tonicPitch = ((tonalTask.baseMidi % 12) + 12) % 12;
    // Calculate target average tessitura from the original played task chord
    const targetAvgMidi = tonalTask.chordNotesMidi.length > 0
      ? tonalTask.chordNotesMidi.reduce((a, b) => a + b, 0) / tonalTask.chordNotesMidi.length
      : tonalTask.baseMidi;

    // Pick the octave that best matches the heard task tessitura while staying on piano
    let bestMidis: number[] = [];
    let bestDiff = Infinity;

    for (let oct = 3; oct <= 5; oct++) {
      const baseOctaveMidi = oct * 12 + tonicPitch;
      const candidateMidis = targetVoicing.semitonesFromTonic.map((s) => baseOctaveMidi + s);
      const minM = Math.min(...candidateMidis);
      const maxM = Math.max(...candidateMidis);
      if (minM < 46 || maxM > 82) continue;

      const avgM = candidateMidis.reduce((a, b) => a + b, 0) / candidateMidis.length;
      const diff = Math.abs(avgM - targetAvgMidi);
      if (diff < bestDiff) {
        bestDiff = diff;
        bestMidis = candidateMidis;
      }
    }

    if (bestMidis.length === 0) {
      const fallbackOctaveMidi = 4 * 12 + tonicPitch;
      bestMidis = targetVoicing.semitonesFromTonic.map((s) => fallbackOctaveMidi + s);
    }

    const midis = bestMidis;
    const now = audioEngine.getContext().currentTime;

    if (settings.style === 'arpeggio') {
      const step = 0.22 / settings.tempo;
      const noteDur = step * 1.5;
      const active: number[] = [];
      midis.forEach((m, idx) => {
        audioEngine.playSingleNote(m, now + idx * step, noteDur, 1.15, settings);
        window.setTimeout(() => {
          active.push(m);
          setTonalActiveMidis([...active]);
        }, idx * step * 1000);
      });
      const totalDur = midis.length * step + 0.8;
      window.setTimeout(() => {
        setTonalActiveMidis([]);
        setIsPlaying(false);
      }, totalDur * 1000);
    } else {
      for (const m of midis) {
        audioEngine.playSingleNote(m, now, 1.8, 1.1, settings);
      }
      setTonalActiveMidis(midis);
      window.setTimeout(() => {
        setTonalActiveMidis([]);
        setIsPlaying(false);
      }, 1800);
    }
  }, [tonalTask, settings]);

  const handleTonalTimingChange = useCallback((newTiming: number) => {
    setTonalTiming(newTiming);
  }, []);

  // Progression Mode Handlers
  const handleNewProgressionTask = useCallback(() => {
    audioEngine.stopAll();
    const task = realizeProgression(
      undefined,
      settings.progressionRootNote ?? settings.tonalRootNote ?? 'C',
      settings.tonalScaleMode ?? 'major',
      settings.progressionCategory ?? 'all'
    );
    setProgressionTask(task);
    setProgressionActiveStepIndex(-1);
    setProgressionActiveMidis([]);
    setIsPlaying(true);
    setStatusMessage({
      text: `Слушайте: оборот в тональности ${task.keyNameRu}...`,
      type: 'playing',
    });
    audioEngine.playProgressionTask(
      task,
      settings,
      (stepIdx, midis) => {
        setProgressionActiveStepIndex(stepIdx);
        setProgressionActiveMidis(midis);
      },
      () => {
        setProgressionActiveStepIndex(-1);
        setProgressionActiveMidis([]);
        setIsPlaying(false);
      }
    );
  }, [settings]);

  const handleProgressionReveal = useCallback(() => {
    setProgressionTask((prev) => (prev ? { ...prev, revealed: true } : null));
  }, []);

  const handleReplayProgressionTask = useCallback((overrideStyle?: 'harmonic' | 'arpeggio') => {
    if (!progressionTask) return;
    audioEngine.stopAll();
    setIsPlaying(true);
    setStatusMessage({
      text: `Повтор оборота в тональности ${progressionTask.keyNameRu}...`,
      type: 'playing',
    });
    const effectiveSettings = overrideStyle ? { ...settings, style: overrideStyle } : settings;
    audioEngine.playProgressionTask(
      progressionTask,
      effectiveSettings,
      (stepIdx, midis) => {
        setProgressionActiveStepIndex(stepIdx);
        setProgressionActiveMidis(midis);
      },
      () => {
        setProgressionActiveStepIndex(-1);
        setProgressionActiveMidis([]);
        setIsPlaying(false);
      }
    );
  }, [progressionTask, settings]);

  const handlePlayProgressionStep = useCallback(
    (stepIdx: number) => {
      if (!progressionTask || !progressionTask.steps[stepIdx]) return;
      audioEngine.stopAll();
      setIsPlaying(true);
      const step = progressionTask.steps[stepIdx];
      setProgressionActiveStepIndex(stepIdx);
      setProgressionActiveMidis([...step.midisSATB]);
      audioEngine.playProgressionStep(step.midisSATB, settings, () => {
        setProgressionActiveStepIndex(-1);
        setProgressionActiveMidis([]);
        setIsPlaying(false);
      });
    },
    [progressionTask, settings]
  );

  const handlePlayProgressionVoice = useCallback(
    (voiceIdx: 0 | 1 | 2 | 3) => {
      if (!progressionTask) return;
      audioEngine.stopAll();
      setIsPlaying(true);
      const voiceNames = ['Бас', 'Тенор', 'Альт', 'Сопрано'];
      setStatusMessage({
        text: `Прослушивание голоса: ${voiceNames[voiceIdx]}...`,
        type: 'playing',
      });
      audioEngine.playProgressionVoice(
        progressionTask,
        voiceIdx,
        settings,
        (stepIdx, midi) => {
          setProgressionActiveStepIndex(stepIdx);
          setProgressionActiveMidis(midi > 0 ? [midi] : []);
        },
        () => {
          setProgressionActiveStepIndex(-1);
          setProgressionActiveMidis([]);
          setIsPlaying(false);
        }
      );
    },
    [progressionTask, settings]
  );

  const handlePlayProgressionStepVoice = useCallback(
    (stepIdx: number, voiceIdx: 0 | 1 | 2 | 3) => {
      if (!progressionTask || !progressionTask.steps[stepIdx]) return;
      audioEngine.stopAll();
      setIsPlaying(true);
      const midi = progressionTask.steps[stepIdx].midisSATB[voiceIdx];
      setProgressionActiveStepIndex(stepIdx);
      setProgressionActiveMidis([midi]);
      audioEngine.playSingleVoiceNote(midi, settings, () => {
        setProgressionActiveStepIndex(-1);
        setProgressionActiveMidis([]);
        setIsPlaying(false);
      });
    },
    [progressionTask, settings]
  );

  const handleSelectProgressionFromCatalog = useCallback(
    (template: HarmonicProgressionTemplate) => {
      const key = settings.progressionRootNote ?? settings.tonalRootNote ?? 'C';
      const targetMode = template.scaleMode === 'minor' ? 'minor' : 'major';
      const realized = realizeProgression(template.id, key === 'random' ? 'C' : key, targetMode);
      setProgressionTask(realized);
      setMode('progression');
      setStatusMessage({
        text: `Оборот: ${template.nameRu}`,
        type: 'idle',
      });
      // Immediately play the chosen progression
      setIsPlaying(true);
      audioEngine.playProgressionTask(
        realized,
        settings,
        (stepIdx: number, midis: number[]) => {
          setProgressionActiveStepIndex(stepIdx);
          setProgressionActiveMidis(midis);
        },
        () => {
          setProgressionActiveStepIndex(-1);
          setProgressionActiveMidis([]);
          setIsPlaying(false);
        }
      );
    },
    [settings]
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

    if (mode === 'tonal') {
      handleNewTonalTask();
      return;
    }

    if (mode === 'progression') {
      handleNewProgressionTask();
      return;
    }

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
    } else if (settings.direction === 'chain' || settings.direction === 'random') {
      taskDirection = Math.random() > 0.5 ? 'up' : 'down';
    } else {
      taskDirection = settings.direction === 'down' ? 'down' : 'up';
    }

    let rootMidi: number;
    let rootNoteName: string;

    const isChainMode = settings.direction === 'chain';

    if (isChainMode && currentTask) {
      const prevBreakdown = getConstructionBreakdown(
        currentTask.item,
        currentTask.rootMidi,
        currentTask.constructionDirection || currentTask.playedDirection || 'up',
        currentTask.rootNoteName
      );
      if (prevBreakdown.notesMidi && prevBreakdown.notesMidi.length > 0) {
        let lastMidi = prevBreakdown.notesMidi[prevBreakdown.notesMidi.length - 1];
        let lastNoteName = prevBreakdown.noteNames[prevBreakdown.noteNames.length - 1];
        while (lastMidi > 80) lastMidi -= 12;
        while (lastMidi < 48) lastMidi += 12;
        rootMidi = lastMidi;
        rootNoteName = lastNoteName;
      } else {
        const resolved = resolveRootMidi(settings.rootNote, taskDirection);
        rootMidi = resolved.midi;
        rootNoteName = resolved.noteName;
      }
    } else {
      const resolved = resolveRootMidi(settings.rootNote, taskDirection);
      rootMidi = resolved.midi;
      rootNoteName = resolved.noteName;
    }

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
      const isChainActive = isChainMode && currentTask !== null;
      setStatusMessage({
        text: `${isChainActive ? 'Цепочка: о' : 'О'}порный тон ${rootNoteName}. Постройте ${taskDirection === 'up' ? 'вверх' : 'вниз'}: «${randomItem.name}»`,
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
  const handleReplay = useCallback((overrideStyle?: 'harmonic' | 'arpeggio') => {
    if (autoAdvanceTimerRef.current) {
      clearTimeout(autoAdvanceTimerRef.current);
      autoAdvanceTimerRef.current = null;
    }
    audioEngine.stopAll();

    const effectiveSettings = overrideStyle ? { ...settings, style: overrideStyle } : settings;

    if (mode === 'tonal') {
      handleReplayTonalAll(overrideStyle);
      return;
    }

    if (mode === 'progression') {
      handleReplayProgressionTask(overrideStyle);
      return;
    }

    if (!currentTask) return;

    if (mode === 'construction') {
      if (currentTask.revealed) {
        setIsPlaying(true);
        setStatusMessage({ text: 'Воспроизведение построенного...', type: 'playing' });
        audioEngine.playItem(
          currentTask.item,
          currentTask.rootMidi,
          effectiveSettings,
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
          effectiveSettings,
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
        effectiveSettings,
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
  }, [currentTask, mode, settings, handleReplayTonalAll, handleReplayProgressionTask]);

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

  // Helper to record an answer in statistics and persist immediately to IndexedDB/localStorage
  const recordAnswer = useCallback((itemId: string, isCorrect: boolean) => {
    setStats((prev) => {
      const existingItem = prev.items[itemId] || { tested: 0, correct: 0 };
      const updated: AppStats = {
        totalTested: prev.totalTested + 1,
        totalCorrect: prev.totalCorrect + (isCorrect ? 1 : 0),
        items: {
          ...prev.items,
          [itemId]: {
            tested: existingItem.tested + 1,
            correct: existingItem.correct + (isCorrect ? 1 : 0),
          },
        },
      };
      saveStats(updated);
      return updated;
    });
  }, []);

  const handleResetStats = useCallback(async () => {
    const fresh = await resetStatsInDB();
    setStats(fresh);
  }, []);

  // User submits answer in Standard mode
  const handleSelectAnswer = useCallback(
    (selectedItem: MusicItem) => {
      if (!currentTask || currentTask.userAnswerId !== null) return;

      const isCorrect = selectedItem.id === currentTask.item.id;

      // Update local statistics storage
      recordAnswer(currentTask.item.id, isCorrect);

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
    [currentTask, recordAnswer, settings.autoAdvanceOnCorrect, handleNewTask]
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

      // Update local statistics storage
      recordAnswer(currentTask.item.id, isCorrect);

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
    [currentTask, recordAnswer, settings.autoAdvanceOnCorrect, handleNewTask]
  );

  // Mapping for the 7 Quick Access Categories
  const QUICK_CATEGORY_MAP: Record<QuickCategoryKey, CategoryId[]> = useMemo(
    () => ({
      simple_intervals: ['simple_intervals'],
      characteristic_intervals: ['characteristic_intervals'],
      triads: ['triads'],
      seventh_chords: ['seventh_chords'],
      d7_inversions: ['d7_inversions'],
      scales: ['scales'],
      modes: ['modes'],
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

  const handleSwitchMode = useCallback((newMode: TrainingMode) => {
    if (autoAdvanceTimerRef.current) clearTimeout(autoAdvanceTimerRef.current);
    audioEngine.stopAll();
    audioEngine.stopDrone();
    setIsPlaying(false);
    setMode(newMode);

    if (newMode === 'construction') {
      setSettings((prev) => ({ ...prev, direction: 'random', style: 'arpeggio' }));
    } else if (newMode === 'oral' || newMode === 'standard') {
      setSettings((prev) => ({ ...prev, direction: 'random' }));
    }
  }, []);

  // Stop continuous drone & all sounds when switching modes
  useEffect(() => {
    audioEngine.stopAll();
    if (mode !== 'construction') {
      audioEngine.stopDrone();
    }
    if (mode === 'tonal' && !tonalTask) {
      handleNewTonalTask();
    }
    if (mode === 'progression' && !progressionTask) {
      handleNewProgressionTask();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const currentTheme = settings.theme || 'dark';
  const isLight = currentTheme === 'light' || currentTheme.startsWith('light');
  
  let themeVariantClass = 'dark bg-slate-950 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black text-slate-100';
  if (currentTheme === 'light_warm' || currentTheme === 'light') {
    themeVariantClass = 'light light-mode theme-warm text-slate-900';
  } else if (currentTheme === 'light_slate') {
    themeVariantClass = 'light light-mode theme-slate text-slate-900';
  } else if (currentTheme === 'light_sand') {
    themeVariantClass = 'light light-mode theme-sand text-slate-900';
  }

  return (
    <div className={`min-h-screen ${themeVariantClass} flex flex-col items-center justify-start p-2 sm:p-4 select-none font-sans transition-colors duration-200`}>
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
          <div className="flex-1 flex items-center gap-1 min-w-0">
            <button
              onClick={() => handleSwitchMode(mode === 'standard' ? 'standard' : 'oral')}
              className={`flex-1 flex items-center justify-center gap-1 py-1.5 px-1.5 sm:px-2 rounded-lg text-xs font-semibold transition cursor-pointer min-w-0 ${
                mode === 'oral' || mode === 'standard'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-950 font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
              title="Элементы (интервалы, аккорды, гаммы, лады на слух)"
            >
              <Music className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate whitespace-nowrap hidden min-[360px]:inline">Элементы</span>
            </button>

            <button
              onClick={() => handleSwitchMode('construction')}
              className={`flex-1 flex items-center justify-center gap-1 py-1.5 px-1.5 sm:px-2 rounded-lg text-xs font-semibold transition cursor-pointer min-w-0 ${
                mode === 'construction'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-950 font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
              title="Построение элементов от звука вверх и вниз"
            >
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate whitespace-nowrap hidden min-[360px]:inline">Построение</span>
            </button>

            <button
              onClick={() => handleSwitchMode('tonal')}
              className={`flex-1 flex items-center justify-center gap-1 py-1.5 px-1.5 sm:px-2 rounded-lg text-xs font-semibold transition cursor-pointer min-w-0 ${
                mode === 'tonal'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-950 font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
              title="Тональность (ступени и аккорды в ладу)"
            >
              <Radio className="w-3.5 h-3.5 shrink-0 text-indigo-300" />
              <span className="truncate whitespace-nowrap hidden min-[360px]:inline">Тональность</span>
            </button>

            <button
              onClick={() => handleSwitchMode('progression')}
              className={`flex-1 flex items-center justify-center gap-1 py-1.5 px-1.5 sm:px-2 rounded-lg text-xs font-semibold transition cursor-pointer min-w-0 ${
                mode === 'progression'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-950 font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
              title="Гармония (4-голосные гармонические обороты)"
            >
              <GitBranch className="w-3.5 h-3.5 shrink-0 text-indigo-300" />
              <span className="truncate whitespace-nowrap hidden min-[360px]:inline">Гармония</span>
            </button>
          </div>

          <div className="h-5 w-px bg-slate-800 shrink-0" />

          {/* Quick Phone Install PWA button (Icon on mobile) */}
          <button
            onClick={() => setIsInstallModalOpen(true)}
            className="flex items-center justify-center p-2 sm:px-2.5 sm:py-1.5 bg-indigo-950/70 hover:bg-indigo-900/80 active:scale-95 text-indigo-300 hover:text-indigo-100 border border-indigo-500/40 rounded-lg transition cursor-pointer shrink-0 text-xs font-semibold shadow-sm"
            title="Установить приложение на телефон (PWA)"
            aria-label="Установить PWA"
          >
            <Smartphone className="w-4 h-4 text-indigo-400 shrink-0" />
            <span className="hidden md:inline ml-1">Установить</span>
          </button>
        </div>

        {/* Quick Sets Bar */}
        {mode !== 'tonal' && mode !== 'progression' && (
          <div className="w-full">
            <CategoryChips
              selectedCategories={selectedQuickCategories}
              onToggleCategory={handleToggleQuickCategory}
            />
          </div>
        )}

        {/* Style & Direction Toggles for Standard, Oral and Construction Modes */}
        {(mode === 'standard' || mode === 'oral' || mode === 'construction') && (
          <PlaybackStyleDirectionBar
            settings={settings}
            onSettingsChange={handleUpdateSettings}
            mode={mode}
            onSwitchMode={handleSwitchMode}
          />
        )}

        {/* Status Message - only shown in Standard Test mode when giving feedback */}
        {mode === 'standard' && statusMessage.type !== 'idle' && (
          <div className="w-full bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-xl p-2 sm:p-2.5 shadow-md flex items-center justify-between gap-2">
            <div
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg border transition-all text-xs font-semibold min-h-[38px] ${
                statusMessage.type === 'correct'
                  ? 'bg-emerald-950/70 border-emerald-500/80 text-emerald-200 shadow-sm'
                  : statusMessage.type === 'wrong'
                  ? 'bg-rose-950/70 border-rose-500/80 text-rose-200 shadow-sm'
                  : 'bg-indigo-950/70 border-indigo-500/80 text-indigo-200 animate-pulse'
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

          {mode === 'tonal' && (
            <TonalModeCard
              task={tonalTask}
              settings={settings}
              activePlayingMidis={tonalActiveMidis}
              onReveal={handleTonalReveal}
              onSettingsChange={handleUpdateSettings}
              onPlayCadence={handlePlayKeyCadence}
              onVisualNotes={(midis) => {
                setTonalActiveMidis(midis);
              }}
              onPreviewDegree={handlePreviewTonalDegree}
            />
          )}

          {mode === 'progression' && (
            <ProgressionModeCard
              progression={progressionTask}
              settings={settings}
              isPlaying={isPlaying}
              activePlayingMidis={progressionActiveMidis}
              activeStepIndex={progressionActiveStepIndex}
              onPlayProgression={handleReplayProgressionTask}
              onPlayStep={handlePlayProgressionStep}
              onPlayVoice={handlePlayProgressionVoice}
              onPlayStepVoice={handlePlayProgressionStepVoice}
              onNewTask={handleNewProgressionTask}
              onSettingsChange={handleUpdateSettings}
              onPlayCadence={handlePlayKeyCadence}
              onReveal={handleProgressionReveal}
              onOpenProgressionCatalog={() => setIsProgressionCatalogOpen(true)}
            />
          )}
        </main>
      </div>

      {/* Fixed Bottom Action Dock (Always pinned in one place at the bottom of the screen) */}
      <div className="fixed bottom-0 left-0 right-0 z-30 pointer-events-none flex justify-center p-2.5 sm:p-4 bg-gradient-to-t from-slate-950 via-slate-950/95 to-transparent pt-8 fixed-bottom-dock">
        <div className="w-full max-w-xl pointer-events-auto flex flex-col gap-2">
          {/* Row 1: "Показать ответ" / "Проверить построение" in Oral, Construction, and Tonal modes */}
          {mode === 'oral' && (
            !currentTask?.revealed ? (
              <button
                type="button"
                onClick={handleOralReveal}
                disabled={!currentTask}
                className="w-full h-12 sm:h-13 flex items-center justify-center gap-2 px-4 bg-indigo-600 hover:bg-indigo-500 active:scale-[0.99] disabled:opacity-40 text-white font-bold text-sm sm:text-base rounded-2xl shadow-lg shadow-indigo-950/50 border border-indigo-400/40 transition cursor-pointer"
                title="Показать ответ"
              >
                <Eye className="w-4 h-4 shrink-0" />
                <span>Показать ответ</span>
              </button>
            ) : (
              <div className="w-full h-12 sm:h-13 flex items-center justify-center gap-2 px-4 bg-emerald-950/70 border border-emerald-500/50 rounded-2xl text-emerald-300 text-xs sm:text-sm font-semibold">
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
                className="w-full h-12 sm:h-13 flex items-center justify-center gap-2 px-4 bg-indigo-600 hover:bg-indigo-500 active:scale-[0.99] disabled:opacity-40 text-white font-bold text-sm sm:text-base rounded-2xl shadow-lg shadow-indigo-950/50 border border-indigo-400/40 transition cursor-pointer"
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
                className="w-full h-12 sm:h-13 flex items-center justify-center gap-2 px-4 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] disabled:opacity-40 text-white font-bold text-sm sm:text-base rounded-2xl shadow-lg shadow-emerald-950/50 border border-emerald-400/40 transition cursor-pointer"
                title="Слушать построенное еще раз"
              >
                <RotateCcw className="w-4 h-4 shrink-0" />
                <span>Слушать построенное</span>
              </button>
            )
          )}

          {mode === 'tonal' && (
            <div className="w-full flex items-center gap-2">
              {!tonalTask?.revealed ? (
                <button
                  type="button"
                  onClick={handleTonalReveal}
                  disabled={!tonalTask}
                  className="flex-1 h-12 sm:h-13 flex items-center justify-center gap-2 px-4 bg-indigo-600 hover:bg-indigo-500 active:scale-[0.99] disabled:opacity-40 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-lg shadow-indigo-950/50 border border-indigo-400/40 transition cursor-pointer"
                  title="Показать теоретический анализ и ответ"
                >
                  <Eye className="w-4 h-4 shrink-0" />
                  <span>Показать ответ</span>
                </button>
              ) : (
                <div className="flex-1 h-12 sm:h-13 flex items-center justify-center gap-2 px-3 bg-emerald-950/70 border border-emerald-500/50 rounded-2xl text-emerald-300 text-xs sm:text-sm font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Ответ показан на клавиатуре</span>
                </div>
              )}
            </div>
          )}

          {mode === 'progression' && (
            <div className="w-full flex items-center gap-2">
              {!progressionTask?.revealed ? (
                <button
                  type="button"
                  onClick={handleProgressionReveal}
                  disabled={!progressionTask}
                  className="flex-1 h-12 sm:h-13 flex items-center justify-center gap-2 px-4 bg-indigo-600 hover:bg-indigo-500 active:scale-[0.99] disabled:opacity-40 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-lg shadow-indigo-950/50 border border-indigo-400/40 transition cursor-pointer"
                  title="Показать правильный ответ и голосоведение"
                >
                  <Eye className="w-4 h-4 shrink-0" />
                  <span>Показать ответ</span>
                </button>
              ) : (
                <div className="flex-1 h-12 sm:h-13 flex items-center justify-center gap-2 px-3 bg-emerald-950/70 border border-emerald-500/50 rounded-2xl text-emerald-300 text-xs sm:text-sm font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Ответ показан в карточке</span>
                </div>
              )}
            </div>
          )}

          {/* Row 2: "Новый звук" / "Новый оборот" (flex-1) + 2 small Replay buttons (Harmonic & Arpeggio) */}
          <div className="w-full flex items-center gap-2">
            <button
              type="button"
              onClick={handleNewTask}
              className="flex-1 h-12 sm:h-13 flex items-center justify-center gap-2 px-4 bg-gradient-to-r from-indigo-600 via-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 active:scale-[0.99] text-white font-bold text-sm sm:text-base rounded-2xl shadow-xl shadow-indigo-950/60 border border-indigo-400/30 transition cursor-pointer"
              title="Новое задание (Горячая клавиша: N)"
            >
              <Play className="w-4 h-4 fill-current shrink-0" />
              <span>{mode === 'progression' ? 'Новый оборот' : 'Новый звук'}</span>
              <kbd className="hidden sm:inline-block ml-1 text-[10px] px-1.5 py-0.5 rounded bg-white/20 text-white font-mono leading-none">
                N
              </kbd>
            </button>

            {/* Repeat Harmonic Button (Left) */}
            <button
              type="button"
              onClick={() => handleReplay('harmonic')}
              disabled={mode === 'progression' ? !progressionTask : mode === 'tonal' ? !tonalTask : !currentTask}
              className="w-12 sm:w-14 h-12 sm:h-13 flex items-center justify-center bg-slate-900 hover:bg-slate-800 active:scale-95 disabled:opacity-40 text-indigo-300 hover:text-white rounded-2xl border border-slate-700/80 shadow-lg transition cursor-pointer shrink-0"
              title="Повторить гармонически (вместе)"
              aria-label="Повторить гармонически"
            >
              <Layers className="w-5 h-5 shrink-0" />
            </button>

            {/* Repeat Arpeggio Button (Right) */}
            <button
              type="button"
              onClick={() => handleReplay('arpeggio')}
              disabled={mode === 'progression' ? !progressionTask : mode === 'tonal' ? !tonalTask : !currentTask}
              className="w-12 sm:w-14 h-12 sm:h-13 flex items-center justify-center bg-slate-900 hover:bg-slate-800 active:scale-95 disabled:opacity-40 text-indigo-400 hover:text-indigo-300 rounded-2xl border border-slate-700/80 shadow-lg transition cursor-pointer shrink-0"
              title="Повторить арпеджио (по звукам, Горячая клавиша: Пробел)"
              aria-label="Повторить арпеджио"
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
        stats={stats}
        onOpenStatsModal={() => setIsStatsModalOpen(true)}
        onOpenInstallModal={() => setIsInstallModalOpen(true)}
        onOpenCategoryModal={() => setIsCategoryModalOpen(true)}
        onOpenProgressionCatalog={() => setIsProgressionCatalogOpen(true)}
      />

      {/* Detailed Statistics Modal */}
      <StatsModal
        isOpen={isStatsModalOpen}
        onClose={() => setIsStatsModalOpen(false)}
        stats={stats}
        onResetStats={handleResetStats}
      />

      {/* PWA Phone Install Modal */}
      <PWAInstallModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
      />

      {/* Categories & Elements Modal */}
      <CategorySelectorModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        activeItemIds={activeItemIds}
        onToggleItem={handleToggleItem}
        onSelectAllCategory={handleSelectAllCategory}
        onSelectAllGlobal={handleSelectAllGlobal}
      />

      {/* Harmonic Progression Catalog Modal */}
      <ProgressionCatalogModal
        isOpen={isProgressionCatalogOpen}
        onClose={() => setIsProgressionCatalogOpen(false)}
        settings={settings}
        onSelectProgression={handleSelectProgressionFromCatalog}
      />
    </div>
  );
}
