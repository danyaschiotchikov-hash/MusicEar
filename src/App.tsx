import React, { useState, useEffect, useCallback, useRef, useMemo, useTransition } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  CategoryId,
  CurrentTask,
  MusicItem,
  PlaybackSettings,
  TrainingMode,
  AppStats,
} from './types';
import { getRandomQuote } from './data/quotes';
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
import { ScaleDegreeModeCard } from './components/ScaleDegreeModeCard';
import { ProgressionModeCard } from './components/ProgressionModeCard';
import { MelodyHarmonizationModeCard } from './components/MelodyHarmonizationModeCard';
import { HarmonizationStudio } from './components/HarmonizationStudio';
import { PitchCalibrationCard } from './components/PitchCalibrationCard';
import {
  MelodyHarmonizationTemplate,
  buildSATBForChord,
} from './audio/melodyHarmonization';
import { PlaybackStyleDirectionBar } from './components/PlaybackStyleDirectionBar';
import { MarathonProgressBar } from './components/MarathonProgressBar';
import { CelebrationEffects } from './components/CelebrationEffects';
import { useMarathon } from './hooks/useMarathon';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { CategorySelectorModal } from './components/CategorySelectorModal';
import { StatsCounterWidget } from './components/StatsCounterWidget';
import { StatsModal } from './components/StatsModal';
import {
  generateSmartVoicingTask,
  SmartVoicingTask,
  getConstructionBreakdown,
  generateScaleDegreeTask,
  ScaleDegreeTask,
} from './audio/solfegeHelper';
import { resolveTonalInterval } from './audio/tonalIntervalResolution';
import { pickWeightedItem } from './utils/spacedRepetition';
import { getVoicingsForDegree, findVoicingById } from './audio/tonalChords';
import { realizeProgression, RealizedProgression, HarmonicProgressionTemplate, revoiceProgression } from './audio/harmonicProgressions';
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
  Target,
  BookOpen,
  Flame,
  Trophy,
  ArrowUp,
  ArrowDown,
  AlertCircle,
} from 'lucide-react';
import { PWAInstallModal } from './components/PWAInstallModal';
import { ProgressionCatalogModal } from './components/ProgressionCatalogModal';
import { ChangelogModal, CURRENT_CHANGELOG_VERSION } from './components/ChangelogModal';
import { AcademicAuditModal } from './components/AcademicAuditModal';
import { useActionTracker } from './context/ActionTrackerContext.tsx';

// Professional Anti-Slop responsive curve: ultra-responsive fast-out slow-in
export const ANTI_SLOP_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

export default function App() {
  const [, startTransition] = useTransition();

  // Stats persistence state & Auto-advance ref
  const [stats, setStats] = useState<AppStats>(DEFAULT_STATS);
  const autoAdvanceTimerRef = useRef<number | null>(null);

  // App Settings & Modes
  const [settings, setSettings] = useState<PlaybackSettings>(DEFAULT_SETTINGS);
  const [activeCategories, setActiveCategories] = useState<string[]>(DEFAULT_ACTIVE_CATEGORIES);
  const [activeItemIds, setActiveItemIds] = useState<string[]>(() => ALL_ITEMS.map((i) => i.id));
  const [mode, setMode] = useState<TrainingMode>('oral');

  const { currentSection, setCurrentSection, logAction } = useActionTracker();

  // Synchronize TrainingMode changes into ActionTracker
  useEffect(() => {
    setCurrentSection(mode);
  }, [mode, setCurrentSection]);

  // Marathon Gamification & Celebration Engine
  const {
    marathonStreak,
    marathonBestStreak,
    isNewRecord,
    celebrationState,
    handleCorrectMarathonAnswer,
    handleWrongMarathonAnswer,
    handleResetMarathon: resetMarathonState,
    closeCelebration,
  } = useMarathon(useCallback((st) => audioEngine.playCelebrationFanfare(st), []));

  // Emotional Design: Empathetic A/B Comparison state on mistake
  const [lastWrongAnswer, setLastWrongAnswer] = useState<{
    chosenItem: MusicItem;
    targetItem: MusicItem;
    rootMidi: number;
  } | null>(null);

  // Task & Audio State
  const [currentTask, setCurrentTask] = useState<CurrentTask | null>(null);
  const [constructionStepCount, setConstructionStepCount] = useState<number>(1);
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

  // Scale Degree Mode State
  const [degreeTask, setDegreeTask] = useState<ScaleDegreeTask | null>(null);
  const [isDroneActive, setIsDroneActive] = useState(false);
  const [degreeMarathonStreak, setDegreeMarathonStreak] = useState<number>(0);
  const [degreeMarathonBestStreak, setDegreeMarathonBestStreak] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('solfege_degree_marathon_best');
      return saved ? Number(saved) : 0;
    } catch {
      return 0;
    }
  });
  const [degreeIsTwoNotes, setDegreeIsTwoNotes] = useState<boolean>(false);

  // Progression Mode State
  const [progressionTask, setProgressionTask] = useState<RealizedProgression | null>(null);
  const [progressionActiveStepIndex, setProgressionActiveStepIndex] = useState<number>(-1);
  const [progressionActiveMidis, setProgressionActiveMidis] = useState<number[]>([]);

  // Reference for anti-repetition item history in standard mode
  const recentItemIdsRef = useRef<string[]>([]);
  const degreeCadenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  // Ensure application produces no automatic sounds on first load/visit
  const isFirstAppLoadRef = useRef(true);

  // Key Cadence playback for Tonal and Scale Degree modes
  const handlePlayKeyCadence = useCallback(
    (tonicNote: string, scaleMode: 'major' | 'minor', onAfterFinish?: () => void) => {
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
          if (onAfterFinish) {
            onAfterFinish();
          } else {
            setIsPlaying(false);
            setStatusMessage({
              text: `Тональность ${tonicNote} ${scaleMode === 'major' ? 'мажор' : 'минор'} настроена.`,
              type: 'idle',
            });
          }
        }
      );
    },
    [settings]
  );

  // Scale Degree Handlers
  const handleNewDegreeTask = useCallback(
    (forceCadence = false, overrideTwoNotes?: boolean, playAudio = true) => {
      if (autoAdvanceTimerRef.current) {
        clearTimeout(autoAdvanceTimerRef.current);
        autoAdvanceTimerRef.current = null;
      }
      if (degreeCadenceTimerRef.current) {
        clearTimeout(degreeCadenceTimerRef.current);
        degreeCadenceTimerRef.current = null;
      }
      audioEngine.stopAll();
      const effectiveTwoNotes = overrideTwoNotes !== undefined ? overrideTwoNotes : degreeIsTwoNotes;
      const task = generateScaleDegreeTask(
        settings.degreeRootNote ?? settings.tonalRootNote ?? 'C',
        settings.degreeScaleMode ?? settings.tonalScaleMode ?? 'major',
        settings.degreeType ?? 'diatonic',
        stats,
        settings.spacedRepetitionEnabled ?? true,
        effectiveTwoNotes
      );
      setDegreeTask(task);

      if (!playAudio) {
        setIsPlaying(false);
        setStatusMessage({
          text: `Тональность ${task.keyNameRu}. Нажмите «Слушать», чтобы начать.`,
          type: 'idle',
        });
        return;
      }

      setIsPlaying(true);
      setStatusMessage({
        text: effectiveTwoNotes
          ? `Слушайте: 2 ступени в тональности ${task.keyNameRu}...`
          : `Слушайте: ступень в тональности ${task.keyNameRu}...`,
        type: 'playing',
      });

      const playNotes = (startTime: number) => {
        const isArpeggio = settings.twoNotesStyle === 'arpeggio' || settings.style === 'arpeggio';
        const balance = settings.twoNotesBalance ?? 0;
        if (task.isTwoNotes && task.secondTargetMidi) {
          audioEngine.playTwoNotes(
            task.targetMidi,
            task.secondTargetMidi,
            startTime,
            2.6,
            1.25,
            settings,
            isArpeggio,
            balance
          );
          window.setTimeout(() => setIsPlaying(false), isArpeggio ? 3200 : 2600);
        } else {
          audioEngine.playSingleNote(task.targetMidi, startTime, 2.4, 1.25, settings);
          window.setTimeout(() => setIsPlaying(false), 2400);
        }
      };

      const now = audioEngine.getContext().currentTime + 0.05;

      // Check if tuning cadence should be played before task note (e.g. when forced on key change or cadence enabled)
      const playCadence = forceCadence || settings.cadenceBeforeTask === true;
      if (playCadence) {
        // Play tonic cadence (D7 -> T) cleanly; once it resolves, pause musically 300ms, then play task notes
        handlePlayKeyCadence(task.tonicNoteName, task.keyScaleMode, () => {
          degreeCadenceTimerRef.current = setTimeout(() => {
            const noteNow = audioEngine.getContext().currentTime + 0.05;
            playNotes(noteNow);
          }, 300);
        });
      } else {
        playNotes(now);
      }
    },
    [settings, stats, degreeIsTwoNotes, handlePlayKeyCadence]
  );

  const handleToggleDegreeTwoNotes = useCallback(
    (val: boolean) => {
      setDegreeIsTwoNotes(val);
      handleNewDegreeTask(false, val);
    },
    [handleNewDegreeTask]
  );

  const handlePlayDegreeTaskNote = useCallback(() => {
    if (!degreeTask) return;
    audioEngine.stopAll();
    setIsPlaying(true);
    const now = audioEngine.getContext().currentTime + 0.05;
    const isArpeggio = settings.twoNotesStyle === 'arpeggio' || settings.style === 'arpeggio';
    const balance = settings.twoNotesBalance ?? 0;
    if (degreeTask.isTwoNotes && degreeTask.secondTargetMidi) {
      if (degreeTask.revealed) {
        // When answer is revealed in 2 sounds mode: resolve both sounds according to rules of interval resolution WITHOUT PAUSE
        const resolution = resolveTonalInterval(
          degreeTask.targetMidi,
          degreeTask.secondTargetMidi,
          degreeTask.tonicMidi,
          degreeTask.keyNameRu ? degreeTask.keyNameRu.split(' ')[0] : degreeTask.tonicNoteName,
          degreeTask.keyScaleMode === 'minor' ? 'minor' : 'major'
        );

        if (resolution && resolution.status === 'RESOLVED' && resolution.resolvedInterval) {
          // Play initial interval (0.75s)
          audioEngine.playChord([degreeTask.targetMidi, degreeTask.secondTargetMidi], now, 0.75, 1.2, settings);
          // Play resolved interval immediately at now + 0.75s (no pause!)
          const resolveTime = now + 0.75;
          audioEngine.playChord(
            [resolution.resolvedInterval.lowerVoice.midi, resolution.resolvedInterval.upperVoice.midi],
            resolveTime,
            1.3,
            1.25,
            settings
          );
          window.setTimeout(() => setIsPlaying(false), 2100);
          return;
        }
      }

      audioEngine.playTwoNotes(
        degreeTask.targetMidi,
        degreeTask.secondTargetMidi,
        now,
        2.6,
        1.25,
        settings,
        isArpeggio,
        balance
      );
      window.setTimeout(() => setIsPlaying(false), isArpeggio ? 3200 : 2600);
    } else {
      audioEngine.playSingleNote(degreeTask.targetMidi, now, 2.4, 1.25, settings);
      window.setTimeout(() => setIsPlaying(false), 2400);
    }
  }, [degreeTask, settings]);

  const handlePlayDegreeResolution = useCallback(() => {
    if (!degreeTask) return 0;
    setIsPlaying(true);

    const fullPath =
      degreeTask.resolutionPathMidis && degreeTask.resolutionPathMidis.length > 0
        ? degreeTask.resolutionPathMidis
        : [degreeTask.targetMidi, degreeTask.resolutionMidi];

    // Do NOT repeat the target note (fullPath[0])
    const steps = fullPath.slice(1);
    if (steps.length === 0) return 0.5;

    const now = audioEngine.getContext().currentTime + 0.05;
    const stepDuration = 0.30;

    steps.forEach((midi, idx) => {
      const isLast = idx === steps.length - 1;
      const startTime = now + idx * stepDuration;
      // Legato overlap: duration is longer than stepDuration (0.55s vs 0.30s)
      const duration = isLast ? 0.9 : 0.55;
      const velocity = isLast ? 1.25 : 1.1;
      audioEngine.playSingleNote(midi, startTime, duration, velocity, settings);
    });

    const totalDurationSec = steps.length * stepDuration + 0.8;
    window.setTimeout(() => setIsPlaying(false), totalDurationSec * 1000);
    return totalDurationSec;
  }, [degreeTask, settings]);

  const handleSelectDegreeAnswer = useCallback(
    (selectedDegreeId: string, selectedSemitone?: number, keyMidi?: number) => {
      if (!degreeTask || degreeTask.revealed) return;

      const isTwoNotes = degreeTask.isTwoNotes && Boolean(degreeTask.secondDegreeId);
      const targetIds = isTwoNotes ? [degreeTask.id, degreeTask.secondDegreeId!] : [degreeTask.id];
      const currentGuessed = degreeTask.userAnswerIds || [];

      // Calculate target semitones from tonic
      const targetSemitones = [
        ((degreeTask.targetMidi % 12) - (degreeTask.tonicMidi % 12) + 12) % 12,
        ...(isTwoNotes && degreeTask.secondTargetMidi !== undefined
          ? [((degreeTask.secondTargetMidi % 12) - (degreeTask.tonicMidi % 12) + 12) % 12]
          : []),
      ];

      // Match check: by ID or relative semitone offset
      const isMatchById = targetIds.includes(selectedDegreeId);
      const isMatchBySemitone = selectedSemitone !== undefined && targetSemitones.includes(selectedSemitone);
      const isCorrectMatch = isMatchById || isMatchBySemitone;

      let matchedTargetId = selectedDegreeId;
      if (!isMatchById && isMatchBySemitone) {
        const firstSemitone = ((degreeTask.targetMidi % 12) - (degreeTask.tonicMidi % 12) + 12) % 12;
        if (selectedSemitone === firstSemitone) {
          matchedTargetId = degreeTask.id;
        } else if (degreeTask.secondDegreeId) {
          matchedTargetId = degreeTask.secondDegreeId;
        }
      }

      if (isCorrectMatch) {
        if (currentGuessed.includes(matchedTargetId)) return; // already guessed this note

        const updatedGuessed = [...currentGuessed, matchedTargetId];
        const allGuessed = targetIds.every((id) => updatedGuessed.includes(id));

        if (allGuessed) {
          const alreadyHadIncorrects = (degreeTask.incorrectAnswers && degreeTask.incorrectAnswers.length > 0);

          setDegreeTask((prev) =>
            prev ? { ...prev, revealed: true, userAnswerIds: updatedGuessed, userAnswerId: matchedTargetId, isCorrect: !alreadyHadIncorrects } : null
          );

          // Update marathon streak
          if (!alreadyHadIncorrects) {
            setDegreeMarathonStreak((prevStreak) => {
              const nextStreak = prevStreak + 1;
              setDegreeMarathonBestStreak((prevBest) => {
                const newBest = Math.max(prevBest, nextStreak);
                try {
                  localStorage.setItem('solfege_degree_marathon_best', String(newBest));
                } catch {
                  // ignore
                }
                return newBest;
              });
              return nextStreak;
            });
          }

          setStats((prev) => {
            const itemStat = prev.items[degreeTask.id] || { tested: 0, correct: 0 };
            const updatedItems = {
              ...prev.items,
              [degreeTask.id]: {
                tested: itemStat.tested + 1,
                correct: itemStat.correct + (alreadyHadIncorrects ? 0 : 1),
                lastTested: Date.now(),
              },
            };
            const updatedStats = {
              totalTested: prev.totalTested + 1,
              totalCorrect: prev.totalCorrect + (alreadyHadIncorrects ? 0 : 1),
              items: updatedItems,
            };
            saveStats(updatedStats);
            return updatedStats;
          });

          setStatusMessage({
            text: 'Верно! Это ' + degreeTask.degreeNameRu + (degreeTask.secondDegreeNameRu ? ` и ${degreeTask.secondDegreeNameRu}` : ''),
            type: 'correct',
          });

          const shouldResolve = settings.degreeAutoResolve !== false;

          if (degreeTask.secondTargetMidi) {
            // In 2-notes mode, resolve both sounds according to rules of interval resolution WITHOUT PAUSE!
            audioEngine.stopAll();
            setIsPlaying(true);
            const now = audioEngine.getContext().currentTime + 0.05;

            const resolution = resolveTonalInterval(
              degreeTask.targetMidi,
              degreeTask.secondTargetMidi,
              degreeTask.tonicMidi,
              degreeTask.keyNameRu ? degreeTask.keyNameRu.split(' ')[0] : degreeTask.tonicNoteName,
              degreeTask.keyScaleMode === 'minor' ? 'minor' : 'major'
            );

            if (resolution && resolution.status === 'RESOLVED' && resolution.resolvedInterval) {
              // 1. Initial 2 sounds
              audioEngine.playChord([degreeTask.targetMidi, degreeTask.secondTargetMidi], now, 0.75, 1.2, settings);
              // 2. Resolved interval starts immediately at now + 0.75s (no pause!)
              const resolveTime = now + 0.75;
              audioEngine.playChord(
                [resolution.resolvedInterval.lowerVoice.midi, resolution.resolvedInterval.upperVoice.midi],
                resolveTime,
                1.3,
                1.25,
                settings
              );

              if (autoAdvanceTimerRef.current) clearTimeout(autoAdvanceTimerRef.current);
              autoAdvanceTimerRef.current = window.setTimeout(() => {
                setIsPlaying(false);
                handleNewDegreeTask();
              }, 2250);
            } else {
              // Stable interval, no resolution needed
              audioEngine.playChord([degreeTask.targetMidi, degreeTask.secondTargetMidi], now, 1.1, 1.25, settings);
              if (autoAdvanceTimerRef.current) clearTimeout(autoAdvanceTimerRef.current);
              autoAdvanceTimerRef.current = window.setTimeout(() => {
                setIsPlaying(false);
                handleNewDegreeTask();
              }, 1400);
            }
          } else if (shouldResolve) {
            audioEngine.stopAll();
            setIsPlaying(true);
            const now = audioEngine.getContext().currentTime + 0.05;
            audioEngine.playSingleNote(degreeTask.targetMidi, now, 0.85, 1.25, settings);

            window.setTimeout(() => {
              const resSec = handlePlayDegreeResolution();
              if (autoAdvanceTimerRef.current) clearTimeout(autoAdvanceTimerRef.current);
              autoAdvanceTimerRef.current = window.setTimeout(() => {
                handleNewDegreeTask();
              }, Math.max(800, resSec * 1000 + 400));
            }, 850);
          } else {
            handlePlayDegreeTaskNote();
            if (autoAdvanceTimerRef.current) clearTimeout(autoAdvanceTimerRef.current);
            autoAdvanceTimerRef.current = window.setTimeout(() => {
              handleNewDegreeTask();
            }, 1800);
          }
        } else {
          // First note of 2-note mode guessed correctly
          setDegreeTask((prev) => (prev ? { ...prev, userAnswerIds: updatedGuessed } : null));
          setStatusMessage({ text: '✓ Первый звук угадан! Найдите второй звук на клавиатуре.', type: 'correct' });

          const playedMidi = keyMidi ?? (selectedSemitone !== undefined ? degreeTask.tonicMidi + selectedSemitone : undefined);
          if (playedMidi !== undefined) {
            audioEngine.stopAll();
            setIsPlaying(true);
            const now = audioEngine.getContext().currentTime + 0.05;
            audioEngine.playSingleNote(playedMidi, now, 0.75, 1.2, settings);
            window.setTimeout(() => setIsPlaying(false), 750);
          }
        }
      } else {
        // Wrong answer: reset marathon streak
        setDegreeMarathonStreak(0);

        setDegreeTask((prev) => {
          if (!prev) return null;
          const currentIncorrects = prev.incorrectAnswers || [];
          if (currentIncorrects.includes(selectedDegreeId)) return prev;
          return {
            ...prev,
            incorrectAnswers: [...currentIncorrects, selectedDegreeId],
          };
        });

        const playedMidi = keyMidi ?? (selectedSemitone !== undefined ? degreeTask.tonicMidi + selectedSemitone : undefined);
        if (playedMidi !== undefined) {
          audioEngine.stopAll();
          setIsPlaying(true);
          const now = audioEngine.getContext().currentTime + 0.05;
          audioEngine.playSingleNote(playedMidi, now, 0.65, 1.1, settings);
          window.setTimeout(() => setIsPlaying(false), 650);
        }

        setStatusMessage({
          text: 'Неверно! Послушайте этот звук и попробуйте другую клавишу.',
          type: 'wrong',
        });
      }
    },
    [degreeTask, settings, handleNewDegreeTask, handlePlayDegreeResolution, handlePlayDegreeTaskNote]
  );

  const handleToggleDrone = useCallback(() => {
    if (isDroneActive) {
      audioEngine.stopDrone();
      setIsDroneActive(false);
    } else if (degreeTask) {
      audioEngine.startContinuousDrone(degreeTask.tonicMidi, settings.volume);
      setIsDroneActive(true);
    }
  }, [isDroneActive, degreeTask, settings]);

  const handleResetDegreeMarathon = useCallback(() => {
    setDegreeMarathonStreak(0);
  }, []);

  const handleSetTonalActiveMidis = useCallback((midis: number[]) => {
    setTonalActiveMidis(midis);
  }, []);

  const handleOpenProgressionCatalog = useCallback(() => {
    setIsProgressionCatalogOpen(true);
  }, []);

  // Collapsible Left Drawer State
  const [isLeftDrawerOpen, setIsLeftDrawerOpen] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isProgressionCatalogOpen, setIsProgressionCatalogOpen] = useState(false);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const [isChangelogOpen, setIsChangelogOpen] = useState(false);
  const [isAcademicAuditOpen, setIsAcademicAuditOpen] = useState(false);

  const handleCloseChangelog = useCallback(() => {
    setIsChangelogOpen(false);
    try {
      localStorage.setItem('harmony_changelog_seen_version', CURRENT_CHANGELOG_VERSION);
    } catch (e) {
      console.error(e);
    }
  }, []);

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
        const loadedItemIds = [...savedState.activeItemIds];
        if (
          savedState.activeCategories.includes('d7_inversions') &&
          !loadedItemIds.includes('d7')
        ) {
          loadedItemIds.push('d7');
        }
        setActiveItemIds(loadedItemIds);
        setMode(savedState.mode);
        setStats(savedStats);
      });
      // Preload Salamander samples by default (deferred to avoid blocking initial render)
      if (savedState.settings.timbre === 'salamander') {
        window.setTimeout(() => {
          audioEngine.preloadSalamander((progress) => {
            setSampleStatus({ isLoaded: false, isLoading: true, progress });
          }).then((ok) => {
            setSampleStatus({ isLoaded: ok, isLoading: false, progress: ok ? 100 : 0 });
          });
        }, 300);
      }
    }
    init();

    return () => {
      if (autoAdvanceTimerRef.current) clearTimeout(autoAdvanceTimerRef.current);
      audioEngine.stopAll();
    };
  }, []);

  // 1b. Automatically show the latest academic and visual corrections on first entry
  useEffect(() => {
    try {
      const seenVersion = localStorage.getItem('harmony_changelog_seen_version');
      if (seenVersion !== CURRENT_CHANGELOG_VERSION) {
        setIsChangelogOpen(true);
      }
    } catch (e) {
      console.error(e);
    }
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
  const handleNewTonalTask = useCallback((playAudio = true) => {
    audioEngine.stopAll();
    const task = generateSmartVoicingTask(
      settings.tonalRootNote ?? 'C',
      settings.tonalChordFilter ?? 'diatonic',
      settings.tonalScaleMode ?? 'major',
      settings.tonalRootPositionOnly ?? false,
      settings.tonalAllowedDegrees,
      settings.tonalAllowedVoicings,
      stats,
      settings.spacedRepetitionEnabled ?? true
    );
    setTonalTask(task);

    if (!playAudio) {
      setIsPlaying(false);
      setStatusMessage({
        text: 'Тональность настроена. Нажмите «Слушать», чтобы воспроизвести созвучие.',
        type: 'idle',
      });
      return;
    }

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
  }, [settings, tonalTiming, stats]);

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

  const handlePlayTonalChordOnly = useCallback((overrideStyle?: 'harmonic' | 'arpeggio') => {
    if (!tonalTask) return;
    audioEngine.stopAll();
    setIsPlaying(true);
    setStatusMessage({
      text: `Повтор созвучия (${overrideStyle === 'arpeggio' ? 'арпеджио' : 'гармонически'})...`,
      type: 'playing',
    });
    const effectiveSettings = overrideStyle ? { ...settings, style: overrideStyle } : settings;
    audioEngine.playTonalChordOnly(
      tonalTask.chordNotesMidi,
      tonalTask.baseMidi,
      effectiveSettings,
      (midis) => setTonalActiveMidis(midis),
      () => setIsPlaying(false)
    );
  }, [tonalTask, settings]);

  const handleTonalReveal = useCallback(() => {
    setTonalTask((prev) => (prev ? { ...prev, revealed: true } : null));
  }, []);

  const handlePreviewTonalDegree = useCallback((degreeId: string, voicingId?: string) => {
    if (!tonalTask) return;
    audioEngine.stopAll();
    setIsPlaying(true);

    const isMaj = tonalTask.keyScaleMode === 'major';
    const tonicName = tonalTask.baseNoteName;
    const voicings = getVoicingsForDegree(degreeId, isMaj, tonicName);
    if (!voicings || voicings.length === 0) return;

    let targetVoicing = voicingId
      ? (voicings.find((v) => v.id === voicingId) || findVoicingById(voicingId, isMaj, tonicName))
      : undefined;

    if (!targetVoicing) {
      targetVoicing = settings.tonalRootPositionOnly
        ? (voicings.find((v) => v.isRootPosition) ?? voicings[0])
        : voicings[0];
    }

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
  const handleNewProgressionTask = useCallback((playAudio = true) => {
    audioEngine.stopAll();
    const task = realizeProgression(
      undefined,
      settings.progressionRootNote ?? settings.tonalRootNote ?? 'C',
      settings.tonalScaleMode ?? 'major',
      settings.progressionCategories ?? 'all'
    );
    const revoiced = revoiceProgression(
      task,
      settings.progressionSpacing ?? 'original',
      settings.progressionMelodicPosition ?? 'original'
    );
    setProgressionTask(revoiced);
    setProgressionActiveStepIndex(-1);
    setProgressionActiveMidis([]);

    if (!playAudio) {
      setIsPlaying(false);
      setStatusMessage({
        text: `Оборот: «${revoiced.template.nameRu}» (${revoiced.keyNameRu}). Нажмите «Слушать».`,
        type: 'idle',
      });
      return;
    }

    setIsPlaying(true);
    setStatusMessage({
      text: `Слушайте: оборот в тональности ${revoiced.keyNameRu}...`,
      type: 'playing',
    });
    audioEngine.playProgressionTask(
      revoiced,
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

  const handleSelectProgressionTemplate = useCallback(
    (templateId: string) => {
      audioEngine.stopAll();
      const task = realizeProgression(
        templateId,
        settings.progressionRootNote ?? settings.tonalRootNote ?? 'C',
        settings.tonalScaleMode ?? 'major',
        settings.progressionCategories ?? 'all'
      );
      const revoiced = revoiceProgression(
        task,
        settings.progressionSpacing ?? 'original',
        settings.progressionMelodicPosition ?? 'original'
      );
      setProgressionTask(revoiced);
      setProgressionActiveStepIndex(-1);
      setProgressionActiveMidis([]);
      setIsPlaying(true);
      setStatusMessage({
        text: `Оборот: «${revoiced.template.nameRu}» (${revoiced.keyNameRu})`,
        type: 'playing',
      });
      audioEngine.playProgressionTask(
        revoiced,
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
    },
    [settings]
  );

  const handlePlayHarmonizationMelodyOnly = useCallback(
    (template: MelodyHarmonizationTemplate) => {
      audioEngine.stopAll();
      setIsPlaying(true);
      const notes = template.sopranoMelody.map((s) => s.midi);
      audioEngine.playMidiSequence(notes, 0.55 / settings.tempo, settings, () => {
        setIsPlaying(false);
      });
    },
    [settings]
  );

  const handlePlayHarmonizationSATB = useCallback(
    (template: MelodyHarmonizationTemplate, chordSequence: string[]) => {
      audioEngine.stopAll();
      setIsPlaying(true);

      const stepsData: [number, number, number, number][] = template.sopranoMelody.map((s, idx) => {
        const chordId = chordSequence[idx] || s.allowedChordIds[0];
        return buildSATBForChord(s.midi, chordId, template.keyRootNote, template.scaleMode);
      });

      let currentStep = 0;
      const playStepSeq = () => {
        if (currentStep >= stepsData.length) {
          setIsPlaying(false);
          return;
        }
        const satb = stepsData[currentStep];
        audioEngine.playProgressionStep(satb, settings, () => {
          currentStep++;
          setTimeout(playStepSeq, 100);
        });
      };

      playStepSeq();
    },
    [settings]
  );

  const handlePlayStepSATB = useCallback(
    (
      sopranoMidi: number,
      chordId: string,
      keyRoot: string,
      scaleMode: 'major' | 'minor'
    ) => {
      audioEngine.stopAll();
      setIsPlaying(true);
      const satb = buildSATBForChord(sopranoMidi, chordId, keyRoot, scaleMode);
      audioEngine.playProgressionStep(satb, settings, () => {
        setIsPlaying(false);
      });
    },
    [settings]
  );

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
      const revoiced = revoiceProgression(
        realized,
        settings.progressionSpacing ?? 'original',
        settings.progressionMelodicPosition ?? 'original'
      );
      setProgressionTask(revoiced);
      setMode('progression');
      setStatusMessage({
        text: `Оборот: ${template.nameRu}`,
        type: 'idle',
      });
      // Immediately play the chosen progression
      setIsPlaying(true);
      audioEngine.playProgressionTask(
        revoiced,
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
  const handleNewTask = useCallback((playAudio = true) => {
    // Clear any pending auto advance timer
    if (autoAdvanceTimerRef.current) {
      clearTimeout(autoAdvanceTimerRef.current);
      autoAdvanceTimerRef.current = null;
    }

    // Immediately cut off any previous audio
    audioEngine.stopAll();

    if (mode === 'degree') {
      handleNewDegreeTask(false, undefined, playAudio);
      return;
    }

    if (mode === 'tonal') {
      handleNewTonalTask(playAudio);
      return;
    }

    if (mode === 'progression') {
      handleNewProgressionTask(playAudio);
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

    const randomItem = pickWeightedItem(
      pool,
      (i) => i.id,
      stats,
      settings.spacedRepetitionEnabled ?? true,
      recentItemIdsRef.current
    );

    // Save chosen item to anti-repetition history
    recentItemIdsRef.current.push(randomItem.id);
    if (recentItemIdsRef.current.length > 5) {
      recentItemIdsRef.current.shift();
    }

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
    setLastWrongAnswer(null);

    if (!playAudio) {
      setIsPlaying(false);
      setStatusMessage({
        text: 'Нажмите «Слушать» или «Новый звук», чтобы начать тренировку',
        type: 'idle',
      });
      return;
    }

    if (mode === 'marathon') {
      setStatusMessage({
        text: getRandomQuote(),
        type: 'idle',
      });
    }

    if (mode === 'construction') {
      setConstructionStepCount(1);
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
  }, [activeItemIds, resolveRootMidi, settings, mode, playCurrentTask, currentTask, stats, handleNewDegreeTask, handleNewTonalTask, handleNewProgressionTask]);

  // Replay (Interrupts any ongoing playback immediately!)
  const handleReplay = useCallback((overrideStyle?: 'harmonic' | 'arpeggio') => {
    if (autoAdvanceTimerRef.current) {
      clearTimeout(autoAdvanceTimerRef.current);
      autoAdvanceTimerRef.current = null;
    }
    audioEngine.stopAll();

    const effectiveSettings = overrideStyle ? { ...settings, style: overrideStyle } : settings;

    if (mode === 'degree') {
      handlePlayDegreeTaskNote();
      return;
    }

    if (mode === 'tonal') {
      handlePlayTonalChordOnly(overrideStyle);
      return;
    }

    if (mode === 'progression') {
      handleReplayProgressionTask(overrideStyle);
      return;
    }

    if (!currentTask) return;

    if (mode === 'construction') {
      const direction = currentTask.constructionDirection || 'up';
      const breakdown = getConstructionBreakdown(
        currentTask.item,
        currentTask.rootMidi,
        direction,
        currentTask.rootNoteName
      );
      const count = currentTask.revealed
        ? breakdown.notesMidi.length
        : Math.max(1, constructionStepCount);
      const notesToPlay = breakdown.notesMidi.slice(0, count);
      const style = overrideStyle || settings.style || 'arpeggio';

      if (style === 'harmonic') {
        setIsPlaying(true);
        setStatusMessage({
          text: `Гармонически: тоны 1..${notesToPlay.length} из ${breakdown.notesMidi.length}`,
          type: 'playing',
        });
        const now = audioEngine.getContext().currentTime + 0.05;
        const noteDur = 1.2;
        notesToPlay.forEach((midi) => {
          audioEngine.playSingleNote(midi, now, noteDur, 1.0, settings);
        });
        window.setTimeout(() => setIsPlaying(false), 1200);
      } else {
        setIsPlaying(true);
        setStatusMessage({
          text: `Арпеджио: тоны 1..${notesToPlay.length} из ${breakdown.notesMidi.length}`,
          type: 'playing',
        });
        const now = audioEngine.getContext().currentTime + 0.05;
        const stepTime = 0.35 / settings.tempo;
        const noteDur = 0.8;
        notesToPlay.forEach((midi, idx) => {
          const isLast = idx === notesToPlay.length - 1;
          audioEngine.playSingleNote(midi, now + idx * stepTime, noteDur, 1.2, settings, true, isLast);
        });
        const totalTime = notesToPlay.length * stepTime + 0.8;
        window.setTimeout(() => setIsPlaying(false), totalTime * 1000);
      }
      return;
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
  }, [currentTask, mode, settings, constructionStepCount, handlePlayTonalChordOnly, handleReplayTonalAll, handleReplayProgressionTask]);

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
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      
      if (
        'progressionRootNote' in newSettings ||
        'tonalScaleMode' in newSettings ||
        'progressionSpacing' in newSettings ||
        'progressionMelodicPosition' in newSettings
      ) {
        setProgressionTask((prevProg) => {
          if (!prevProg) return null;
          const newRoot = updated.progressionRootNote ?? updated.tonalRootNote ?? prevProg.tonicNoteName;
          const newMode = updated.tonalScaleMode ?? prevProg.scaleMode;
          const restoredTask = realizeProgression(
            prevProg.template.id,
            newRoot,
            newMode,
            updated.progressionCategories ?? 'all'
          );
          return revoiceProgression(
            restoredTask,
            updated.progressionSpacing ?? 'original',
            updated.progressionMelodicPosition ?? 'original'
          );
        });
      }
      
      return updated;
    });
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
    const direction = currentTask.constructionDirection || 'up';
    const breakdown = getConstructionBreakdown(
      currentTask.item,
      currentTask.rootMidi,
      direction,
      currentTask.rootNoteName
    );
    setConstructionStepCount(breakdown.noteNames.length);
    setCurrentTask((prev) => (prev ? { ...prev, revealed: true } : null));
    setIsPlaying(true);
    setStatusMessage({
      text: `Ответ: «${currentTask.item.name}» ${direction === 'down' ? 'вниз' : 'вверх'} от ${currentTask.rootNoteName}`,
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

  const handleConstructionStepNext = useCallback(() => {
    if (!currentTask || !currentTask.item) return;
    audioEngine.stopAll();
    audioEngine.stopDrone();

    const direction = currentTask.constructionDirection || 'up';
    const breakdown = getConstructionBreakdown(
      currentTask.item,
      currentTask.rootMidi,
      direction,
      currentTask.rootNoteName
    );
    const totalNotes = breakdown.notesMidi.length;
    if (totalNotes === 0) return;

    const nextStep = Math.min(totalNotes, constructionStepCount + 1);
    setConstructionStepCount(nextStep);

    const isFull = nextStep >= totalNotes;
    if (isFull && !currentTask.revealed) {
      setCurrentTask((prev) => (prev ? { ...prev, revealed: true } : null));
    }

    const newMidi = breakdown.notesMidi[nextStep - 1];
    const newNoteName = breakdown.noteNames[nextStep - 1] || '';

    setIsPlaying(true);
    setStatusMessage({
      text: `Добавлен тон ${nextStep} из ${totalNotes}: «${newNoteName}»`,
      type: 'playing',
    });

    const now = audioEngine.getContext().currentTime + 0.05;
    const noteDur = 0.8;

    audioEngine.playSingleNote(newMidi, now, noteDur, 1.2, settings);

    window.setTimeout(() => setIsPlaying(false), noteDur * 1000);
  }, [currentTask, constructionStepCount, settings]);

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
            lastTested: Date.now(),
          },
        },
      };
      saveStats(updated);
      return updated;
    });
  }, []);

  const handlePracticeStruggling = useCallback((strugglingIds: string[]) => {
    if (strugglingIds.length === 0) return;
    setActiveItemIds(strugglingIds);
    const cats = Array.from(
      new Set(ALL_ITEMS.filter((i) => strugglingIds.includes(i.id)).map((i) => i.category))
    );
    setActiveCategories(cats);
    setStatusMessage({
      text: `Загружено ${strugglingIds.length} сложных элементов для повторения. Нажмите «Новый звук»!`,
      type: 'idle',
    });
  }, []);

  const handleResetStats = useCallback(async () => {
    const fresh = await resetStatsInDB();
    setStats(fresh);
  }, []);

  const handleResetMarathon = useCallback(() => {
    resetMarathonState();
    setStatusMessage({
      text: 'Серия сброшена. Начните марафон заново!',
      type: 'idle',
    });
  }, [resetMarathonState]);

  // User submits answer in Standard or Marathon mode
  const handleSelectAnswer = useCallback(
    (selectedItem: MusicItem) => {
      if (!currentTask || currentTask.userAnswerId !== null) return;

      const isCorrect = selectedItem.id === currentTask.item.id;

      // Log answer submission action
      logAction(`Выбран ответ: ${selectedItem.name} (${isCorrect ? 'Верно' : 'Неверно'})`);

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
        setLastWrongAnswer(null);
        handleCorrectMarathonAnswer(settings);

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
        handleWrongMarathonAnswer();
        setLastWrongAnswer({
          chosenItem: selectedItem,
          targetItem: currentTask.item,
          rootMidi: currentTask.rootMidi,
        });

        setStatusMessage({
          text: `Ошибка! Правильный ответ: «${currentTask.item.name}» (тоника: ${currentTask.rootNoteName})`,
          type: 'wrong',
        });
      }
    },
    [currentTask, recordAnswer, settings, handleNewTask]
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
          // Deselect
          return prev.filter((id) => !categoryItemIds.includes(id));
        } else {
          // Multi-select: add this category to active items
          return Array.from(new Set([...prev, ...categoryItemIds]));
        }
      });

      setActiveCategories((prev) => {
        const allIn = targetCategories.every((c) => prev.includes(c));
        if (allIn) {
          return prev.filter((c) => !targetCategories.includes(c as CategoryId));
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
    if (degreeCadenceTimerRef.current) {
      clearTimeout(degreeCadenceTimerRef.current);
      degreeCadenceTimerRef.current = null;
    }
    audioEngine.stopAll();
    audioEngine.stopDrone();
    setIsPlaying(false);
    setMode(newMode);

    if (newMode === 'construction') {
      setSettings((prev) => ({ ...prev, direction: 'random', style: 'arpeggio' }));
    } else if (newMode === 'oral' || newMode === 'standard' || newMode === 'marathon') {
      setSettings((prev) => ({ ...prev, direction: 'random' }));
    }
  }, []);

  // Stop continuous drone & all sounds when switching modes
  useEffect(() => {
    audioEngine.stopAll();
    audioEngine.stopCalibrationTone();
    if (degreeCadenceTimerRef.current) {
      clearTimeout(degreeCadenceTimerRef.current);
      degreeCadenceTimerRef.current = null;
    }
    if (mode !== 'construction' && mode !== 'degree') {
      audioEngine.stopDrone();
      setIsDroneActive(false);
    }
    const isInitialLoad = isFirstAppLoadRef.current;
    const shouldPlaySound = !isInitialLoad;

    if (mode === 'degree') {
      handleNewDegreeTask(true, undefined, shouldPlaySound);
    }
    if (mode === 'tonal' && !tonalTask) {
      handleNewTonalTask(shouldPlaySound);
    }
    if (mode === 'progression' && !progressionTask) {
      handleNewProgressionTask(shouldPlaySound);
    }
    if ((mode === 'standard' || mode === 'marathon') && !currentTask) {
      handleNewTask(shouldPlaySound);
    }

    if (isFirstAppLoadRef.current) {
      window.setTimeout(() => {
        isFirstAppLoadRef.current = false;
      }, 500);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  // Global zero-latency AudioContext unlocker on first user gesture
  useEffect(() => {
    const unlockAudio = () => {
      audioEngine.getContext();
      window.removeEventListener('pointerdown', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
      window.removeEventListener('touchstart', unlockAudio);
    };
    window.addEventListener('pointerdown', unlockAudio, { passive: true });
    window.addEventListener('keydown', unlockAudio, { passive: true });
    window.addEventListener('touchstart', unlockAudio, { passive: true });
    return () => {
      window.removeEventListener('pointerdown', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
      window.removeEventListener('touchstart', unlockAudio);
    };
  }, []);

  // Ergonomic Global Keyboard Shortcuts
  useKeyboardShortcuts({
    onReplay: handleReplay,
    onNewTask: handleNewTask,
    onReveal:
      mode === 'oral'
        ? handleOralReveal
        : mode === 'construction'
        ? handleConstructionReveal
        : mode === 'tonal'
        ? handleTonalReveal
        : mode === 'progression'
        ? handleProgressionReveal
        : undefined,
  });

  // Dynamically apply dark / light theme class to root html document
  useEffect(() => {
    const isLight = settings.theme === 'light';
    if (isLight) {
      document.documentElement.classList.add('light', 'light-mode');
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light', 'light-mode');
    }
  }, [settings.theme]);

  const themeVariantClass =
    settings.theme === 'light'
      ? 'light-mode bg-[#F5EBDD] text-[#413333]'
      : 'dark bg-slate-950 text-slate-100';

  return (
    <div className={`min-h-screen ${themeVariantClass} flex flex-col items-center justify-start p-2 sm:p-4 select-none font-sans transition-colors duration-150`}>
      <div 
        className={`w-full ${mode === 'tonal' || mode === 'progression' ? 'max-w-6xl' : 'max-w-5xl'} flex flex-col gap-2.5 sm:gap-3`}
      >
        {/* Top Navigation Bar: Settings Drawer Button + Title + Statistics Widget at the VERY TOP */}
        <header className="w-full flex items-center justify-between gap-2 bg-slate-900/90 border border-slate-800/80 rounded-2xl px-3 py-2 shadow-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Settings Trigger */}
            <button
              onClick={() => setIsLeftDrawerOpen(true)}
              className="flex items-center justify-center p-2 sm:p-2.5 bg-slate-950/80 hover:bg-slate-800 active:scale-95 text-slate-200 border border-slate-800 rounded-xl transition cursor-pointer shrink-0 shadow-xs"
              title="Настройки тренажера"
              aria-label="Настройки"
            >
              <SlidersHorizontal className="w-4 h-4 text-indigo-400" />
            </button>

            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs sm:text-sm font-bold text-slate-100 tracking-tight truncate">
                  Сольфеджио & Гармония
                </span>
                <span className="hidden sm:inline-block text-[10px] px-1.5 py-0.2 rounded-md bg-indigo-500/20 text-indigo-300 font-mono font-semibold border border-indigo-500/30">
                  PRO
                </span>
              </div>
              <span className="text-[10px] sm:text-[11px] text-slate-400 truncate">
                Слуховой тренажёр
              </span>
            </div>
          </div>

          {/* Statistics Counter Widget at the VERY top */}
          <StatsCounterWidget
            stats={stats}
            onClick={() => setIsStatsModalOpen(true)}
          />
        </header>

        {/* Training Mode Switcher Bar */}
        <div className="w-full flex items-center gap-2">
          {/* General Cloud Container for Mode Switcher */}
          <div className="flex-1 bg-slate-900/90 border border-slate-800/80 rounded-xl p-1.5 flex items-center justify-between gap-1.5 shadow-xs">
            {/* Training Mode Switcher Tabs */}
            <div className="flex-1 flex items-center gap-1 overflow-x-auto scrollbar-none py-0.5 min-w-0">
            <button
              onClick={() => handleSwitchMode(mode === 'standard' || mode === 'marathon' ? mode : 'oral')}
              className={`flex-1 flex items-center justify-center gap-1 py-1.5 px-1.5 sm:px-2 rounded-md text-[11px] sm:text-xs font-semibold transition cursor-pointer whitespace-nowrap min-w-0 ${
                mode === 'oral' || mode === 'standard' || mode === 'marathon'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
              title="Элементы (интервалы, аккорды, гаммы, лады на слух)"
            >
              <Music className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden lg:inline">Элементы</span>
            </button>

            <button
              onClick={() => handleSwitchMode('degree')}
              className={`flex-1 flex items-center justify-center gap-1 py-1.5 px-1.5 sm:px-2 rounded-md text-[11px] sm:text-xs font-semibold transition cursor-pointer whitespace-nowrap min-w-0 ${
                mode === 'degree'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
              title="Ступени (слуховое угадывание ступеней в ладу)"
            >
              <Radio className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden lg:inline">Ступени</span>
            </button>

            <button
              onClick={() => handleSwitchMode('construction')}
              className={`flex-1 flex items-center justify-center gap-1 py-1.5 px-1.5 sm:px-2 rounded-md text-[11px] sm:text-xs font-semibold transition cursor-pointer whitespace-nowrap min-w-0 ${
                mode === 'construction'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
              title="Построение элементов от звука вверх и вниз"
            >
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden lg:inline">Построение</span>
            </button>

            <button
              onClick={() => handleSwitchMode('tonal')}
              className={`flex-1 flex items-center justify-center gap-1 py-1.5 px-1.5 sm:px-2 rounded-md text-[11px] sm:text-xs font-semibold transition cursor-pointer whitespace-nowrap min-w-0 ${
                mode === 'tonal'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
              title="Тональность (функции и аккорды в ладу)"
            >
              <Layers className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden lg:inline">Тональность</span>
            </button>

            <button
              onClick={() => handleSwitchMode('progression')}
              className={`flex-1 flex items-center justify-center gap-1 py-1.5 px-1.5 sm:px-2 rounded-md text-[11px] sm:text-xs font-semibold transition cursor-pointer whitespace-nowrap min-w-0 ${
                mode === 'progression'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
              title="Обороты (4-голосные гармонические обороты)"
            >
              <GitBranch className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden lg:inline">Обороты</span>
            </button>

            <button
              onClick={() => handleSwitchMode('harmonization')}
              className={`flex-1 flex items-center justify-center gap-1 py-1.5 px-1.5 sm:px-2 rounded-md text-[11px] sm:text-xs font-semibold transition cursor-pointer whitespace-nowrap min-w-0 ${
                mode === 'harmonization'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
              title="Гармонизация мелодии (подбор аккордов к мелодии)"
            >
              <ListMusic className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden lg:inline">Гармонизация</span>
            </button>

            <button
              onClick={() => handleSwitchMode('pitch_memory')}
              className={`flex-1 flex items-center justify-center gap-1 py-1.5 px-1.5 sm:px-2 rounded-md text-[11px] sm:text-xs font-semibold transition cursor-pointer whitespace-nowrap min-w-0 ${
                mode === 'pitch_memory'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
              title="Калибровка Ля (абсолютная память высоты 440 Гц)"
            >
              <Target className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden lg:inline">Калибровка</span>
            </button>
          </div>
        </div>
      </div>

        {/* Quick Sets Bar */}
        {mode !== 'tonal' && mode !== 'progression' && mode !== 'pitch_memory' && mode !== 'harmonization' && mode !== 'degree' && (
          <div className="w-full">
            <CategoryChips
              selectedCategories={selectedQuickCategories}
              onToggleCategory={handleToggleQuickCategory}
            />
          </div>
        )}

        {/* Style & Direction Toggles for Standard, Oral, Marathon and Construction Modes */}
        {(mode === 'standard' || mode === 'oral' || mode === 'marathon' || mode === 'construction') && (
          <PlaybackStyleDirectionBar
            settings={settings}
            onSettingsChange={handleUpdateSettings}
            mode={mode}
            onSwitchMode={handleSwitchMode}
          />
        )}

        {/* Marathon Mode: Interactive gamified level progress bar and streak tracker */}
        {mode === 'marathon' && (
          <MarathonProgressBar
            marathonStreak={marathonStreak}
            marathonBestStreak={marathonBestStreak}
            isNewRecord={isNewRecord}
            statusMessage={statusMessage}
            currentTask={currentTask}
            isPlaying={isPlaying}
            onReset={handleResetMarathon}
          />
        )}



        {/* Status Message - only shown in Standard Test mode when giving feedback */}
        <AnimatePresence mode="wait">
          {mode === 'standard' && !lastWrongAnswer && statusMessage.type !== 'idle' && statusMessage.type !== 'playing' && (
            <motion.div
              key={`${statusMessage.type}-${statusMessage.text}`}
              initial={{ opacity: 0, y: -6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.98 }}
              transition={{ duration: 0.2, ease: ANTI_SLOP_EASE }}
              className="w-full bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-xl p-2 sm:p-2.5 shadow-md flex items-center justify-between gap-2"
            >
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
                {(statusMessage.type as string) === 'playing' && <Volume2 className="w-4 h-4 text-indigo-400 shrink-0 animate-bounce" />}
                <span className="truncate">{statusMessage.text}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Primary Interactive Training Zone with Anti-Slop Smooth Bezier Transitions */}
        <main className={`w-full ${mode === 'pitch_memory' ? 'pb-4' : (mode === 'progression' ? 'pb-16 sm:pb-20' : (mode === 'standard' || mode === 'marathon' ? 'pb-24 sm:pb-28' : 'pb-36 sm:pb-40'))}`}>
          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, y: 8, scale: 0.992 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.992 }}
              transition={{ duration: 0.22, ease: ANTI_SLOP_EASE }}
              className="w-full"
            >
              {(mode === 'standard' || mode === 'marathon') && (
                <AnswerGrid
                  activeItemIds={activeItemIds}
                  currentTask={currentTask}
                  onSelectAnswer={handleSelectAnswer}
                  disabled={false}
                  onEnablePreset={handleEnablePreset}
                  onPlayComparison={handlePlayComparison}
                  onNewTask={handleNewTask}
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

              {mode === 'degree' && (
                <ScaleDegreeModeCard
                  task={degreeTask}
                  settings={settings}
                  isPlaying={isPlaying}
                  activePlayingMidis={[]}
                  onPlayTaskNote={handlePlayDegreeTaskNote}
                  onPlayCadence={handlePlayKeyCadence}
                  onPlayResolution={handlePlayDegreeResolution}
                  onSelectAnswer={handleSelectDegreeAnswer}
                  onNewTask={handleNewDegreeTask}
                  onSettingsChange={handleUpdateSettings}
                  onToggleDrone={handleToggleDrone}
                  isDroneActive={isDroneActive}
                  degreeMarathonStreak={degreeMarathonStreak}
                  degreeMarathonBestStreak={degreeMarathonBestStreak}
                  isNewRecord={degreeMarathonStreak > 0 && degreeMarathonStreak === degreeMarathonBestStreak}
                  onResetMarathon={handleResetDegreeMarathon}
                  isTwoNotes={degreeIsTwoNotes}
                  onToggleTwoNotes={handleToggleDegreeTwoNotes}
                />
              )}

              {mode === 'construction' && (
                <ConstructionModeCard
                  currentTask={currentTask}
                  settings={settings}
                  constructionStepCount={constructionStepCount}
                  onReveal={handleConstructionReveal}
                  onReplayRoot={handleReplayRoot}
                  onReplayFull={handleConstructionReveal}
                  onStepNext={handleConstructionStepNext}
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
                  onVisualNotes={handleSetTonalActiveMidis}
                  onPreviewDegree={handlePreviewTonalDegree}
                  onNewTask={handleNewTonalTask}
                  onReplay={handlePlayTonalChordOnly}
                  onReplayAll={handleReplayTonalAll}
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
                  onOpenProgressionCatalog={handleOpenProgressionCatalog}
                  onSelectSpecificProgression={handleSelectProgressionTemplate}
                />
              )}

              {mode === 'harmonization' && (
                <HarmonizationStudio
                  settings={settings}
                  onSettingsChange={handleUpdateSettings}
                />
              )}

              {mode === 'pitch_memory' && (
                <PitchCalibrationCard
                  settings={settings}
                  onSettingsChange={handleUpdateSettings}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Fixed Bottom Action Dock (Always pinned in one place at the bottom of the screen) */}
      {mode !== 'pitch_memory' && mode !== 'degree' && mode !== 'harmonization' && (
        <div className="fixed bottom-0 left-0 right-0 z-30 pointer-events-none flex justify-center p-2.5 sm:p-4 bg-gradient-to-t from-slate-950 via-slate-950/90 to-transparent pt-6 fixed-bottom-dock">
          <div className="w-full max-w-xl pointer-events-auto flex flex-col gap-1.5">
            {/* Row 1: "Показать ответ" / "Проверить построение" in Oral, Construction, and Tonal modes */}
            {mode === 'oral' && (
              !currentTask?.revealed ? (
                <button
                  type="button"
                  onClick={handleOralReveal}
                  disabled={!currentTask}
                  className="w-full h-11 sm:h-12 flex items-center justify-center gap-2 px-4 bg-indigo-600 hover:bg-indigo-500 active:scale-[0.99] disabled:opacity-40 text-white font-semibold text-xs sm:text-sm rounded-lg shadow-sm border border-indigo-500 transition cursor-pointer"
                  title="Показать ответ (Горячая клавиша: Enter или R)"
                >
                  <Eye className="w-4 h-4 shrink-0" />
                  <span>Показать ответ</span>
                  <kbd className="hidden sm:inline-block ml-1 text-[10px] px-1.5 py-0.5 rounded bg-white/20 text-white font-mono leading-none">
                    Enter
                  </kbd>
                </button>
              ) : (
                <div className="w-full h-11 sm:h-12 flex items-center justify-center gap-2 px-4 bg-emerald-950/60 border border-emerald-500/70 rounded-lg text-emerald-200 text-xs sm:text-sm font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Ответ показан в карточке</span>
                </div>
              )
            )}

            {mode === 'construction' && (
              <div className="w-full flex items-center gap-1.5">
                {!currentTask?.revealed ? (
                  <button
                    type="button"
                    onClick={handleConstructionReveal}
                    disabled={!currentTask}
                    className="flex-1 h-11 sm:h-12 flex items-center justify-center gap-2 px-4 bg-indigo-600 hover:bg-indigo-500 active:scale-[0.99] disabled:opacity-40 text-white font-semibold text-xs sm:text-sm rounded-lg shadow-sm border border-indigo-500 transition cursor-pointer"
                    title="Проверить построение (Горячая клавиша: Enter или R)"
                  >
                    <Eye className="w-4 h-4 shrink-0" />
                    <span>Проверить построение</span>
                    <kbd className="hidden sm:inline-block ml-1 text-[10px] px-1.5 py-0.5 rounded bg-white/20 text-white font-mono leading-none">
                      Enter
                    </kbd>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleConstructionReveal}
                    disabled={!currentTask}
                    className="flex-1 h-11 sm:h-12 flex items-center justify-center gap-2 px-4 bg-slate-800 hover:bg-slate-700 active:scale-[0.99] disabled:opacity-40 text-slate-100 font-semibold text-xs sm:text-sm rounded-lg shadow-sm border border-slate-700 transition cursor-pointer"
                    title="Слушать построенное еще раз"
                  >
                    <RotateCcw className="w-4 h-4 shrink-0" />
                    <span>Слушать построенное</span>
                  </button>
                )}

                {/* Step-by-Step Add Note Button */}
                <button
                  type="button"
                  onClick={handleConstructionStepNext}
                  disabled={!currentTask}
                  className="w-11 sm:w-12 h-11 sm:h-12 flex items-center justify-center rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 shadow-sm transition cursor-pointer shrink-0 relative active:scale-95"
                  title={
                    (currentTask?.constructionDirection || 'up') === 'up'
                      ? 'Добавить следующий звук вверх (+1 нота)'
                      : 'Добавить следующий звук вниз (+1 нота)'
                  }
                  aria-label="Добавить следующий звук"
                >
                  {(currentTask?.constructionDirection || 'up') === 'up' ? (
                    <ArrowUp className="w-4 h-4 stroke-[2.5] shrink-0" />
                  ) : (
                    <ArrowDown className="w-4 h-4 stroke-[2.5] shrink-0" />
                  )}
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-500 text-[10px] font-bold text-white">
                    +
                  </span>
                </button>
              </div>
            )}

            {mode === 'tonal' && (
              <div className="w-full flex items-center gap-1.5">
                {!tonalTask?.revealed ? (
                  <button
                    type="button"
                    onClick={handleTonalReveal}
                    disabled={!tonalTask}
                    className="flex-1 h-11 sm:h-12 flex items-center justify-center gap-2 px-4 bg-indigo-600 hover:bg-indigo-500 active:scale-[0.99] disabled:opacity-40 text-white font-semibold text-xs sm:text-sm rounded-lg shadow-sm border border-indigo-500 transition cursor-pointer"
                    title="Показать теоретический анализ и ответ (Горячая клавиша: Enter или R)"
                  >
                    <Eye className="w-4 h-4 shrink-0" />
                    <span>Показать ответ</span>
                    <kbd className="hidden sm:inline-block ml-1 text-[10px] px-1.5 py-0.5 rounded bg-white/20 text-white font-mono leading-none">
                      Enter
                    </kbd>
                  </button>
                ) : (
                  <div className="flex-1 h-11 sm:h-12 flex items-center justify-center gap-2 px-3 bg-emerald-950/60 border border-emerald-500/70 rounded-lg text-emerald-200 text-xs sm:text-sm font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Ответ показан на клавиатуре</span>
                  </div>
                )}

                {/* Spacer aligning with Repeat Harmonic below */}
                <div className="w-11 sm:w-12 shrink-0 pointer-events-none" />

                {/* Tuning button: identical size/style */}
                <button
                  type="button"
                  onClick={() => {
                    const effectiveMode = settings.tonalScaleMode === 'minor'
                      ? 'minor'
                      : settings.tonalScaleMode === 'major'
                      ? 'major'
                      : tonalTask?.keyScaleMode || 'major';
                    const effectiveTonic = tonalTask?.baseNoteName || (settings.tonalRootNote !== 'random' ? settings.tonalRootNote : 'C') || 'C';
                    handlePlayKeyCadence(effectiveTonic, effectiveMode);
                  }}
                  className="w-11 sm:w-12 h-11 sm:h-12 flex items-center justify-center bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 rounded-lg border border-slate-700 shadow-sm transition cursor-pointer shrink-0"
                  title="Настройка в тональности (каденция D7 → T)"
                  aria-label="Настройка тональности"
                >
                  <Music className="w-4 h-4 shrink-0" />
                </button>
              </div>
            )}

            {mode === 'progression' && (
              <div className="w-full flex items-center gap-1.5">
                {!progressionTask?.revealed ? (
                  <button
                    type="button"
                    onClick={handleProgressionReveal}
                    disabled={!progressionTask}
                    className="flex-1 h-11 sm:h-12 flex items-center justify-center gap-2 px-4 bg-indigo-600 hover:bg-indigo-500 active:scale-[0.99] disabled:opacity-40 text-white font-semibold text-xs sm:text-sm rounded-lg shadow-sm border border-indigo-500 transition cursor-pointer"
                    title="Показать правильный ответ и голосоведение (Горячая клавиша: Enter или R)"
                  >
                    <Eye className="w-4 h-4 shrink-0" />
                    <span>Показать ответ</span>
                    <kbd className="hidden sm:inline-block ml-1 text-[10px] px-1.5 py-0.5 rounded bg-white/20 text-white font-mono leading-none">
                      Enter
                    </kbd>
                  </button>
                ) : (
                  <div className="flex-1 h-11 sm:h-12 flex items-center justify-center gap-2 px-3 bg-emerald-950/60 border border-emerald-500/70 rounded-lg text-emerald-200 text-xs sm:text-sm font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Ответ показан в карточке</span>
                  </div>
                )}
              </div>
            )}

            {/* Row 2: "Новый звук" / "Новый оборот" + 2 Replay buttons */}
            <div className="w-full flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleNewTask()}
                className="flex-1 h-11 sm:h-12 flex items-center justify-center gap-2 px-4 bg-indigo-600 hover:bg-indigo-500 active:scale-[0.99] text-white font-semibold text-xs sm:text-sm rounded-lg shadow-sm border border-indigo-500 transition cursor-pointer"
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
                className="w-11 sm:w-12 h-11 sm:h-12 flex items-center justify-center bg-slate-800 hover:bg-slate-700 active:scale-95 disabled:opacity-40 text-slate-200 hover:text-white rounded-lg border border-slate-700 shadow-sm transition cursor-pointer shrink-0 group relative"
                title="Повторить гармонически (вместе, Горячая клавиша: H)"
                aria-label="Повторить гармонически"
              >
                <Layers className="w-4 h-4 shrink-0" />
                <kbd className="hidden md:inline-block absolute -bottom-1 -right-1 text-[8px] px-1 py-0.2 rounded bg-slate-900 border border-slate-700 text-slate-400 font-mono leading-tight">
                  H
                </kbd>
              </button>

              {/* Repeat Arpeggio Button (Right) */}
              <button
                type="button"
                onClick={() => handleReplay('arpeggio')}
                disabled={mode === 'progression' ? !progressionTask : mode === 'tonal' ? !tonalTask : !currentTask}
                className="w-11 sm:w-12 h-11 sm:h-12 flex items-center justify-center bg-slate-800 hover:bg-slate-700 active:scale-95 disabled:opacity-40 text-slate-200 hover:text-white rounded-lg border border-slate-700 shadow-sm transition cursor-pointer shrink-0 group relative"
                title="Повторить арпеджио (по звукам, Горячая клавиша: Пробел)"
                aria-label="Повторить арпеджио"
              >
                <RotateCcw className="w-4 h-4 shrink-0" />
                <kbd className="hidden md:inline-block absolute -bottom-1 -right-1 text-[8px] px-1 py-0.2 rounded bg-slate-900 border border-slate-700 text-slate-400 font-mono leading-tight">
                  ␣
                </kbd>
              </button>
            </div>
          </div>
        </div>
      )}

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
        onOpenChangelogModal={() => setIsChangelogOpen(true)}
        onOpenAcademicAuditModal={() => setIsAcademicAuditOpen(true)}
      />

      {/* Detailed Statistics Modal */}
      <StatsModal
        isOpen={isStatsModalOpen}
        onClose={() => setIsStatsModalOpen(false)}
        stats={stats}
        onResetStats={handleResetStats}
        onPracticeStruggling={handlePracticeStruggling}
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

      {/* Automatical Recent Fixes & Updates Changelog Modal */}
      <ChangelogModal
        isOpen={isChangelogOpen}
        onClose={handleCloseChangelog}
      />

      {/* Academic Audit Dashboard Modal */}
      <AcademicAuditModal
        isOpen={isAcademicAuditOpen}
        onClose={() => setIsAcademicAuditOpen(false)}
        settings={settings}
      />



      {/* Emotional Design: Celebrations & Confetti Particles Overlay */}
      <CelebrationEffects
        active={celebrationState.active}
        type={celebrationState.type}
        levelNumber={celebrationState.levelNumber}
        levelTitle={celebrationState.levelTitle}
        streakCount={celebrationState.streakCount}
        onClose={closeCelebration}
      />
    </div>
  );
}
