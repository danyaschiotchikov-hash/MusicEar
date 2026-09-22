import React, { useState, useCallback, useRef } from 'react';
import { PlaybackSettings } from '../types';
import { audioEngine } from '../audio/audioEngine';
import {
  SopranoInputNote,
  HarmonizationKey,
  SUPPORTED_KEYS,
  HarmonizationResult,
  autoHarmonizeMelody,
  calculateDegreeFromMidi,
  formatMidiToNoteName,
  NoteDurationType,
  HarmonizedStep,
  generateRandomHarmonizationTask,
  auditUserHarmonization,
  AuditErrorItem,
} from '../audio/harmonizationEngine';
import { VexFlowHarmonizationStaff } from './VexFlowHarmonizationStaff';
import { VexFlowDictationStaff, DictationNote } from './VexFlowDictationStaff';
import { VexFlowHarmonicTurnSnippet } from './VexFlowHarmonicTurnSnippet';
import {
  Music,
  Play,
  Square,
  Sparkles,
  RotateCcw,
  Plus,
  Trash2,
  CheckCircle2,
  Layers,
  Volume2,
  Sliders,
  ChevronRight,
  Info,
  Award,
  Target,
  AlertTriangle,
  RefreshCw,
  FileCheck,
} from 'lucide-react';

interface HarmonizationStudioProps {
  settings: PlaybackSettings;
  onSettingsChange?: (updated: Partial<PlaybackSettings>) => void;
}

// Initial default soprano melody (C Major: E4 - F4 - G4 - F4 - C4)
const DEFAULT_SOPRANO_MELODY: SopranoInputNote[] = [
  { id: 'def_1', midi: 64, noteName: 'E4', duration: 'q', isDotted: false, durationBeats: 1, measure: 1, beat: 1, isStrongBeat: true, degreeNum: 3, degreeRoman: 'III' },
  { id: 'def_2', midi: 65, noteName: 'F4', duration: 'q', isDotted: false, durationBeats: 1, measure: 1, beat: 2, isStrongBeat: false, degreeNum: 4, degreeRoman: 'IV' },
  { id: 'def_3', midi: 67, noteName: 'G4', duration: 'h', isDotted: false, durationBeats: 2, measure: 1, beat: 3, isStrongBeat: true, degreeNum: 5, degreeRoman: 'V' },
  { id: 'def_4', midi: 65, noteName: 'F4', duration: 'h', isDotted: false, durationBeats: 2, measure: 2, beat: 1, isStrongBeat: true, degreeNum: 4, degreeRoman: 'IV' },
  { id: 'def_5', midi: 60, noteName: 'C4', duration: 'w', isDotted: false, durationBeats: 4, measure: 2, beat: 3, isStrongBeat: false, degreeNum: 1, degreeRoman: 'I' },
];

export const HarmonizationStudio: React.FC<HarmonizationStudioProps> = ({
  settings,
  onSettingsChange,
}) => {
  // Key and Meter state
  const [selectedKeyTonic, setSelectedKeyTonic] = useState<string>('C');
  const currentKey =
    SUPPORTED_KEYS.find((k) => k.tonic === selectedKeyTonic) || SUPPORTED_KEYS[0];
  const [meter, setMeter] = useState<string>('4/4');
  const [tempo, setTempo] = useState<number>(settings.tempo ? Math.round(settings.tempo * 60) : 80);

  // Note duration builder state
  const [selectedDuration, setSelectedDuration] = useState<NoteDurationType>('q');
  const [isDotted, setIsDotted] = useState<boolean>(false);

  // Soprano melody notes state
  const [sopranoNotes, setSopranoNotes] = useState<SopranoInputNote[]>(DEFAULT_SOPRANO_MELODY);

  // Harmonization Result
  const [harmonization, setHarmonization] = useState<HarmonizationResult | null>(() =>
    autoHarmonizeMelody(DEFAULT_SOPRANO_MELODY, SUPPORTED_KEYS[0])
  );

  // Active step playback highlight
  const [activeStepIndex, setActiveStepIndex] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const playbackTimeoutsRef = useRef<number[]>([]);

  // View mode: 'vexflow' | 'voices'
  const [scoreViewMode, setScoreViewMode] = useState<'vexflow' | 'color_voices'>('vexflow');

  // Mode: 'free' (свободный ввод) | 'task' (задача) | 'dictation' (диктант)
  const [studioTab, setStudioTab] = useState<'free' | 'task' | 'dictation'>('free');
  const [auditResults, setAuditResults] = useState<AuditErrorItem[] | null>(null);
  const [showReferenceHarmonization, setShowReferenceHarmonization] = useState<boolean>(false);
  const [userChords, setUserChords] = useState<string[]>(() =>
    new Array(DEFAULT_SOPRANO_MELODY.length).fill('')
  );

  // Dictation States
  const [dictationMeasures, setDictationMeasures] = useState<number>(4);
  const [dictationAllowedDurations, setDictationAllowedDurations] = useState<('h' | 'q' | '8' | '16')[]>(['h', 'q']);
  const [dictationType, setDictationType] = useState<'diatonic' | 'chromatic'>('diatonic');
  const [dictationMelody, setDictationMelody] = useState<DictationNote[]>([]);
  const [userGuessedMidis, setUserGuessedMidis] = useState<number[]>([]);
  const [dictationChecked, setDictationChecked] = useState<boolean>(false);
  const [showDictationAnswer, setShowDictationAnswer] = useState<boolean>(false);
  const [dictationPlaying, setDictationPlaying] = useState<boolean>(false);

  // Play Dictation Melody
  const playDictationMelody = useCallback((melodyToPlay: DictationNote[]) => {
    if (melodyToPlay.length === 0) return;
    
    // Stop any existing playback
    playbackTimeoutsRef.current.forEach((t) => window.clearTimeout(t));
    playbackTimeoutsRef.current = [];
    audioEngine.stopAll();
    setIsPlaying(false);
    setActiveStepIndex(null);
    setDictationPlaying(true);

    const secondsPerBeat = 60 / tempo;
    const ctx = audioEngine.getContext();
    const startTime = ctx.currentTime + 0.08;

    let accumulatedTime = 0;
    melodyToPlay.forEach((note) => {
      const stepDuration = secondsPerBeat * note.durationBeats;
      const stepStartTime = startTime + accumulatedTime;

      audioEngine.playSingleNote(note.midi, stepStartTime, stepDuration * 0.9, 1.2, settings);
      accumulatedTime += stepDuration;
    });

    const finishTimeout = window.setTimeout(() => {
      setDictationPlaying(false);
    }, accumulatedTime * 1000 + 100);
    playbackTimeoutsRef.current.push(finishTimeout);
  }, [tempo, settings]);

  // Generate new dictation melody based on current key, measures, meter, allowed durations, and diatonic/chromatic type
  const handleGenerateDictation = useCallback((
    measuresCount: number,
    allowedDurs: ('h' | 'q' | '8' | '16')[],
    type: 'diatonic' | 'chromatic'
  ) => {
    const pitchMap: Record<string, number> = {
      C: 0, 'C#': 1, Db: 1, D: 2, 'D#': 3, Eb: 3, E: 4,
      F: 5, 'F#': 6, Gb: 6, G: 7, 'G#': 8, Ab: 8, A: 9,
      'A#': 10, Bb: 10, B: 11,
    };
    const rootPitch = pitchMap[currentKey.rootNote] ?? 0;
    let baseMidi = 60 + rootPitch;
    if (baseMidi > 68) {
      baseMidi -= 12; // Shift down an octave to keep comfortable singing register
    }

    // Scale offsets for diatonic
    const scaleNotes = currentKey.mode === 'major'
      ? [0, 2, 4, 5, 7, 9, 11, 12, 14, 16] // Major (extended range)
      : [0, 2, 3, 5, 7, 8, 10, 12, 14, 15]; // Minor (extended range)

    const beatsMap: Record<string, number> = {
      'h': 2.0,
      'q': 1.0,
      '8': 0.5,
      '16': 0.25
    };

    // Parse meter
    const [beatsPerMeasure] = meter.split('/').map(Number);
    const measureBeatsTarget = beatsPerMeasure || 4;

    // Predefined beautiful, classical solfeggio rhythmic motifs for a single measure
    const patterns44: ('h' | 'q' | '8' | '16')[][] = [
      ['q', 'q', 'q', 'q'],
      ['q', 'q', '8', '8', 'q'],
      ['8', '8', 'q', 'q', 'q'],
      ['q', '8', '8', 'q', 'q'],
      ['h', 'q', 'q'],
      ['q', 'q', 'h'],
      ['h', 'h'],
      ['8', '8', '8', '8', 'q', 'q'],
      ['q', '8', '8', '8', '8', 'q'],
      ['8', '8', 'q', '8', '8', 'q'],
      ['h', '8', '8', 'q'],
      ['q', '8', '8', 'h'],
      ['q', 'q', '8', '16', '16', 'q'],
      ['q', '16', '16', '16', '16', 'q', 'q'],
      ['8', '16', '16', 'q', 'q', 'q'],
      ['q', 'q', 'q', '16', '16', '16', '16'],
      ['16', '16', '8', '16', '16', '8', 'h']
    ];

    const patterns34: ('h' | 'q' | '8' | '16')[][] = [
      ['q', 'q', 'q'],
      ['h', 'q'],
      ['q', 'h'],
      ['q', '8', '8', 'q'],
      ['8', '8', 'q', 'q'],
      ['q', 'q', '8', '8'],
      ['8', '8', '8', '8', 'q'],
      ['q', '8', '16', '16', 'q'],
      ['16', '16', '16', '16', 'q', 'q'],
      ['q', 'q', '8', '16', '16']
    ];

    const patterns24: ('h' | 'q' | '8' | '16')[][] = [
      ['q', 'q'],
      ['h'],
      ['8', '8', 'q'],
      ['q', '8', '8'],
      ['8', '8', '8', '8'],
      ['q', '8', '16', '16'],
      ['16', '16', '16', '16', 'q'],
      ['16', '16', '8', 'q'],
      ['16', '16', '16', '16', '16', '16', '16', '16']
    ];

    // Pick candidate patterns based on the current meter
    const masterPatterns = measureBeatsTarget === 4 
      ? patterns44 
      : measureBeatsTarget === 3 
        ? patterns34 
        : patterns24;

    // Filter patterns where every single duration is allowed by the user
    const validPatterns = masterPatterns.filter(pat => 
      pat.every(dur => allowedDurs.includes(dur))
    );

    // Dynamic fallback builder that strictly respects beat boundaries and grouping!
    // No offbeat half notes, no unpaired eighth/sixteenth notes.
    const generateFallbackMeasureRhythm = (): ('h' | 'q' | '8' | '16')[] => {
      const pat: ('h' | 'q' | '8' | '16')[] = [];
      let b = 0; // current beat index in the measure

      while (b < measureBeatsTarget) {
        const remaining = measureBeatsTarget - b;

        // Try half note starting on strong beats (beat 1 or 3 in 4/4, beat 1 in 3/4 or 2/4)
        const isStrongBeatForHalf = b === 0 || (measureBeatsTarget === 4 && b === 2);
        if (remaining >= 2.0 && isStrongBeatForHalf && allowedDurs.includes('h')) {
          if (Math.random() < 0.4) {
            pat.push('h');
            b += 2.0;
            continue;
          }
        }

        // Fill exactly 1 beat
        const options: ('h' | 'q' | '8' | '16')[][] = [];
        if (allowedDurs.includes('q')) {
          options.push(['q']);
        }
        if (allowedDurs.includes('8')) {
          options.push(['8', '8']);
        }
        if (allowedDurs.includes('16')) {
          options.push(['16', '16', '16', '16']);
          if (allowedDurs.includes('8')) {
            options.push(['8', '16', '16']);
            options.push(['16', '16', '8']);
          }
        }

        if (options.length > 0) {
          const chosen = options[Math.floor(Math.random() * options.length)];
          pat.push(...chosen);
        } else {
          pat.push('q');
        }
        b += 1.0;
      }
      return pat;
    };

    const selectPattern = (): ('h' | 'q' | '8' | '16')[] => {
      if (validPatterns.length > 0) {
        return validPatterns[Math.floor(Math.random() * validPatterns.length)];
      }
      return generateFallbackMeasureRhythm();
    };

    // Contrasting structural motifs
    const motif1 = selectPattern();
    const motif2 = selectPattern();

    // Resolving cadence pattern for structural balance (preferably ends on longer notes)
    const getCadencePattern = (): ('h' | 'q' | '8' | '16')[] => {
      const candidates = validPatterns.filter(pat => pat[pat.length - 1] === 'h');
      if (candidates.length > 0) {
        return candidates[Math.floor(Math.random() * candidates.length)];
      }
      if (allowedDurs.includes('h') && measureBeatsTarget >= 2) {
        if (measureBeatsTarget === 4) return ['h', 'h'];
        if (measureBeatsTarget === 3) return ['q', 'h'];
        return ['h'];
      }
      return selectPattern();
    };

    const cadenceMotif = getCadencePattern();

    // Combine into Period Form (A-B-A-C) for realistic phrasing
    const melodyRhythm: ('h' | 'q' | '8' | '16')[] = [];
    for (let m = 0; m < measuresCount; m++) {
      let measureRhythm: ('h' | 'q' | '8' | '16')[] = [];

      const positionInPeriod = m % 4;
      if (positionInPeriod === 0) {
        measureRhythm = motif1;
      } else if (positionInPeriod === 1) {
        measureRhythm = motif2;
      } else if (positionInPeriod === 2) {
        measureRhythm = motif1; // Repetition of initial theme for cohesion
      } else {
        const isFinalMeasure = m === measuresCount - 1;
        measureRhythm = isFinalMeasure ? cadenceMotif : motif2; // Cadential resolution
      }

      melodyRhythm.push(...measureRhythm);
    }

    const melody: DictationNote[] = [];

    // Scale Index tracking (start on I, III, or V)
    const startDegrees = [0, 2, 4]; // Tonic triad degrees of the scale
    let currentDegreeIdx = startDegrees[Math.floor(Math.random() * startDegrees.length)];
    let lastMidi = baseMidi + scaleNotes[currentDegreeIdx];

    let wasPreviousLeap = false;
    let previousLeapDirection = 0;

    melodyRhythm.forEach((dur, noteIdx) => {
      const isFirstNote = noteIdx === 0;
      const isLastNote = noteIdx === melodyRhythm.length - 1;
      const isSecondToLast = noteIdx === melodyRhythm.length - 2;

      let midi = lastMidi;

      if (isFirstNote) {
        midi = baseMidi + scaleNotes[currentDegreeIdx];
      } else if (isLastNote) {
        // Perfect authentic cadence resolution to tonic
        currentDegreeIdx = 0;
        midi = baseMidi + scaleNotes[currentDegreeIdx];
      } else if (isSecondToLast) {
        // Stepwise cadential neighbor resolving beautifully to tonic (II -> I or VII -> I)
        currentDegreeIdx = Math.random() > 0.5 ? 1 : 6;
        midi = baseMidi + scaleNotes[currentDegreeIdx];
      } else {
        let degreeStep = 0;

        // Apply Unstable Scale Degree Gravitational Resolutions (VII -> I, IV -> III, II -> I/III, VI -> V)
        const scaleDegree = currentDegreeIdx % 7;
        const rand = Math.random();

        if (scaleDegree === 6 && rand < 0.8) {
          // Leading tone VII resolves up to Tonic I
          degreeStep = 1;
          wasPreviousLeap = false;
        } else if (scaleDegree === 3 && rand < 0.8) {
          // Subdominant IV resolves down to Mediant III
          degreeStep = -1;
          wasPreviousLeap = false;
        } else if (scaleDegree === 1 && rand < 0.7) {
          // Supertonic II resolves to Tonic I or Mediant III
          degreeStep = Math.random() > 0.5 ? -1 : 1;
          wasPreviousLeap = false;
        } else if (scaleDegree === 5 && rand < 0.7) {
          // Submediant VI resolves down to Dominant V
          degreeStep = -1;
          wasPreviousLeap = false;
        } else if (wasPreviousLeap) {
          // Rule of Balance: stepwise counter-balance in the opposite direction after a larger leap
          degreeStep = previousLeapDirection > 0 
            ? -1 - Math.floor(Math.random() * 2) 
            : 1 + Math.floor(Math.random() * 2);
          wasPreviousLeap = false;
        } else {
          const isLeap = Math.random() < 0.2;
          if (isLeap) {
            const direction = Math.random() > 0.5 ? 1 : -1;
            degreeStep = direction * (3 + Math.floor(Math.random() * 2)); // Leap of a 3rd, 4th, or 5th
            wasPreviousLeap = true;
            previousLeapDirection = direction;
          } else {
            degreeStep = [-1, 0, 1][Math.floor(Math.random() * 3)]; // conjunct motion (stepwise)
          }
        }

        let targetDegreeIdx = (currentDegreeIdx + degreeStep) % scaleNotes.length;
        if (targetDegreeIdx < 0) targetDegreeIdx += scaleNotes.length;

        currentDegreeIdx = targetDegreeIdx;
        midi = baseMidi + scaleNotes[currentDegreeIdx];

        // Boundaries matching comfortable singing register (C4 - G5)
        while (midi < 60) midi += 12;
        while (midi > 79) midi -= 12;
      }

      // Chromatic passing/auxiliary tones (strictly in middle notes)
      if (type === 'chromatic' && !isFirstNote && !isLastNote && !isSecondToLast) {
        if (Math.random() < 0.2) {
          const alteration = Math.random() > 0.5 ? 1 : -1;
          midi += alteration;
        }
      }

      melody.push({
        midi,
        duration: dur,
        durationBeats: beatsMap[dur]
      });

      lastMidi = midi;
    });

    setDictationMelody(melody);
    setUserGuessedMidis([]);
    setDictationChecked(false);
    setShowDictationAnswer(false);
    setDictationPlaying(false);

    // Auto play
    setTimeout(() => {
      playDictationMelody(melody);
    }, 150);
  }, [currentKey, meter, playDictationMelody]);

  // Generate new task melody
  const handleGenerateTask = useCallback(() => {
    const taskNotes = generateRandomHarmonizationTask(currentKey, meter);
    setSopranoNotes(taskNotes);
    const result = autoHarmonizeMelody(taskNotes, currentKey);
    setHarmonization(result);
    setAuditResults(null);
    setShowReferenceHarmonization(false);
    setActiveStepIndex(0); // Select first note for training
    setUserChords(new Array(taskNotes.length).fill(''));
  }, [currentKey, meter]);

  // Audit user harmonization
  const handleAuditUser = useCallback(() => {
    if (!harmonization) return;

    if (studioTab === 'task') {
      const issues: AuditErrorItem[] = [];

      harmonization.steps.forEach((step, idx) => {
        const userChord = userChords[idx];
        const refStep = harmonization.steps[idx];

        if (!userChord) {
          issues.push({
            type: 'error',
            titleRu: `Пропуск гармонизации`,
            descriptionRu: `Нота №${idx + 1} (${step.sopranoNote.noteName}) не гармонизована. Пожалуйста, выберите подходящую функцию.`,
            measure: step.sopranoNote.measure,
          });
          return;
        }

        // Detect user functional group
        let userFunction: 'T' | 'S' | 'D' = 'T';
        if (['S5/3', 'S6', 'II6'].includes(userChord)) userFunction = 'S';
        if (['D5/3', 'D6', 'D7', 'K6/4'].includes(userChord)) userFunction = 'D';

        // Check if functional category matches reference solution
        if (userFunction !== refStep.function) {
          issues.push({
            type: 'warning',
            titleRu: `Несоответствие функции на шаге №${idx + 1}`,
            descriptionRu: `Вы выбрали ${userChord} (${userFunction === 'T' ? 'Тоника' : userFunction === 'S' ? 'Субдоминанта' : 'Доминанта'}), но для гармонического движения здесь рекомендуется функция ${refStep.function === 'T' ? 'Тоническая' : refStep.function === 'S' ? 'Субдоминантовая' : 'Доминантовая'} группа.`,
            measure: step.sopranoNote.measure,
          });
        }

        // Check Cadential K6/4 metric placement
        if (userChord === 'K6/4' && !step.sopranoNote.isStrongBeat) {
          issues.push({
            type: 'error',
            titleRu: `Метрическое положение K6/4`,
            descriptionRu: `Кадансовый квартсекстаккорд (K6/4) должен находиться на сильной доле такта для верного разрешения напряжения.`,
            measure: step.sopranoNote.measure,
          });
        }
      });

      // Cadence logic checks at the ending
      const lastIdx = harmonization.steps.length - 1;
      if (lastIdx >= 0) {
        const lastUserChord = userChords[lastIdx];
        if (lastUserChord && lastUserChord !== 'T5/3') {
          issues.push({
            type: 'warning',
            titleRu: `Несовершенный каданс`,
            descriptionRu: `Традиционно классическая тема должна завершаться устойчивой тоникой T5/3 в качестве финального разрешения.`,
            measure: harmonization.steps[lastIdx].sopranoNote.measure,
          });
        }

        if (lastIdx >= 1) {
          const preLastUserChord = userChords[lastIdx - 1];
          if (preLastUserChord && !['D5/3', 'D7', 'K6/4'].includes(preLastUserChord)) {
            issues.push({
              type: 'warning',
              titleRu: `Кадансовый оборот`,
              descriptionRu: `Перед заключительной тоникой в классическом кадансе рекомендуется использовать доминантовую группу (D5/3, D7 или K6/4).`,
              measure: harmonization.steps[lastIdx - 1].sopranoNote.measure,
            });
          }
        }
      }

      setAuditResults(issues);
    } else {
      // Free mode default voice leading audit
      const issues = auditUserHarmonization(harmonization.steps, currentKey);
      setAuditResults(issues);
    }
  }, [harmonization, userChords, studioTab, currentKey]);

  // Add note to soprano melody
  const handleAddNote = useCallback(
    (midi: number) => {
      const beatsPerMeasure = parseInt(meter.split('/')[0], 10) || 4;

      // Calculate measure and beat offset based on existing notes
      let totalBeats = 0;
      sopranoNotes.forEach((n) => {
        totalBeats += n.durationBeats;
      });

      const measure = Math.floor(totalBeats / beatsPerMeasure) + 1;
      const beat = (totalBeats % beatsPerMeasure) + 1;
      const isStrongBeat = beat === 1 || (beatsPerMeasure === 4 && beat === 3);

      let durationBeats = 1;
      if (selectedDuration === 'w') durationBeats = 4;
      else if (selectedDuration === 'h') durationBeats = 2;
      else if (selectedDuration === 'q') durationBeats = 1;
      else if (selectedDuration === '8') durationBeats = 0.5;
      if (isDotted) durationBeats *= 1.5;

      const degree = calculateDegreeFromMidi(midi, currentKey);

      const newNote: SopranoInputNote = {
        id: `note_${Date.now()}_${Math.random()}`,
        midi,
        noteName: formatMidiToNoteName(midi, currentKey),
        duration: selectedDuration,
        isDotted,
        durationBeats,
        measure,
        beat: Math.round(beat * 10) / 10,
        isStrongBeat,
        degreeNum: degree.degreeNum,
        degreeRoman: degree.degreeRoman,
      };

      const updated = [...sopranoNotes, newNote];
      setSopranoNotes(updated);
      setUserChords((prev) => [...prev, '']);

      // Audition note sound
      const now = audioEngine.getContext().currentTime;
      audioEngine.playSingleNote(midi, now, 0.8, 1.25, settings);

      // Re-harmonize automatically
      const res = autoHarmonizeMelody(updated, currentKey);
      setHarmonization(res);
    },
    [currentKey, meter, selectedDuration, isDotted, sopranoNotes, settings]
  );

  // Handle interactive piano key clicks based on active mode (free/task or dictation)
  const handlePianoKeyClick = useCallback((midi: number) => {
    // Play note audio instantly
    const now = audioEngine.getContext().currentTime;
    audioEngine.playSingleNote(midi, now, 0.8, 1.25, settings);

    if (studioTab === 'dictation') {
      if (userGuessedMidis.length < dictationMelody.length) {
        setUserGuessedMidis((prev) => [...prev, midi]);
      }
    } else {
      handleAddNote(midi);
    }
  }, [studioTab, userGuessedMidis, dictationMelody, handleAddNote, settings]);

  // Delete note
  const handleDeleteNote = (index: number) => {
    const updated = sopranoNotes.filter((_, i) => i !== index);
    setSopranoNotes(updated);
    setUserChords((prev) => prev.filter((_, i) => i !== index));
    if (updated.length > 0) {
      const res = autoHarmonizeMelody(updated, currentKey);
      setHarmonization(res);
    } else {
      setHarmonization(null);
    }
    setActiveStepIndex(null);
  };

  const handleClearMelody = () => {
    setSopranoNotes([]);
    setUserChords([]);
    setHarmonization(null);
    setActiveStepIndex(null);
    handleStopPlayback();
  };

  // Re-run harmonization when key changes
  const handleKeyChange = (newTonic: string) => {
    setSelectedKeyTonic(newTonic);
    const newKeyObj = SUPPORTED_KEYS.find((k) => k.tonic === newTonic) || SUPPORTED_KEYS[0];

    // Re-calculate degrees for existing notes
    const updated = sopranoNotes.map((n) => {
      const deg = calculateDegreeFromMidi(n.midi, newKeyObj);
      return {
        ...n,
        noteName: formatMidiToNoteName(n.midi, newKeyObj),
        degreeNum: deg.degreeNum,
        degreeRoman: deg.degreeRoman,
      };
    });
    setSopranoNotes(updated);

    if (updated.length > 0) {
      const res = autoHarmonizeMelody(updated, newKeyObj);
      setHarmonization(res);
    }
  };

  // Re-calculate notes when meter changes
  const handleMeterChange = (newMeter: string) => {
    setMeter(newMeter);
    const beatsPerMeasure = parseInt(newMeter.split('/')[0], 10) || 4;

    let accumulatedBeats = 0;
    const updated = sopranoNotes.map((n) => {
      const measure = Math.floor(accumulatedBeats / beatsPerMeasure) + 1;
      const beat = (accumulatedBeats % beatsPerMeasure) + 1;
      const isStrongBeat = beat === 1 || (beatsPerMeasure === 4 && beat === 3);

      accumulatedBeats += n.durationBeats;

      return {
        ...n,
        measure,
        beat: Math.round(beat * 10) / 10,
        isStrongBeat,
      };
    });

    setSopranoNotes(updated);
    if (updated.length > 0) {
      const res = autoHarmonizeMelody(updated, currentKey);
      setHarmonization(res);
    }
  };

  // Trigger manual harmonization
  const handleHarmonize = () => {
    if (sopranoNotes.length === 0) return;
    const res = autoHarmonizeMelody(sopranoNotes, currentKey);
    setHarmonization(res);
  };

  // Stop all playback
  const handleStopPlayback = () => {
    playbackTimeoutsRef.current.forEach((t) => window.clearTimeout(t));
    playbackTimeoutsRef.current = [];
    audioEngine.stopAll();
    setIsPlaying(false);
    setActiveStepIndex(null);
  };

  // Play SATB Harmonization
  const handlePlaySATB = () => {
    if (!harmonization || harmonization.steps.length === 0) return;
    handleStopPlayback();
    setIsPlaying(true);

    const secondsPerBeat = 60 / tempo;
    const ctx = audioEngine.getContext();
    const startTime = ctx.currentTime + 0.08;

    let accumulatedTime = 0;

    harmonization.steps.forEach((step, idx) => {
      const stepDuration = Math.max(0.5, step.sopranoNote.durationBeats * secondsPerBeat);
      const stepStartTime = startTime + accumulatedTime;

      // Schedule note highlight in UI
      const tId = window.setTimeout(() => {
        setActiveStepIndex(idx);
      }, accumulatedTime * 1000);
      playbackTimeoutsRef.current.push(tId);

      // Play 4 voices SATB
      const [bMidi, tMidi, aMidi, sMidi] = step.midisSATB;
      audioEngine.playSingleNote(bMidi, stepStartTime, stepDuration * 1.1, 1.25, settings);
      audioEngine.playSingleNote(tMidi, stepStartTime, stepDuration * 1.05, 1.05, settings);
      audioEngine.playSingleNote(aMidi, stepStartTime, stepDuration * 1.05, 1.1, settings);
      audioEngine.playSingleNote(sMidi, stepStartTime, stepDuration * 1.1, 1.35, settings);

      accumulatedTime += stepDuration;
    });

    const finishTimeout = window.setTimeout(() => {
      setIsPlaying(false);
      setActiveStepIndex(null);
    }, accumulatedTime * 1000 + 400);
    playbackTimeoutsRef.current.push(finishTimeout);
  };

  // Play Soprano melody only
  const handlePlayMelodyOnly = () => {
    if (sopranoNotes.length === 0) return;
    handleStopPlayback();
    setIsPlaying(true);

    const secondsPerBeat = 60 / tempo;
    const ctx = audioEngine.getContext();
    const startTime = ctx.currentTime + 0.08;

    let accumulatedTime = 0;

    sopranoNotes.forEach((note, idx) => {
      const stepDuration = Math.max(0.4, note.durationBeats * secondsPerBeat);
      const stepStartTime = startTime + accumulatedTime;

      const tId = window.setTimeout(() => {
        setActiveStepIndex(idx);
      }, accumulatedTime * 1000);
      playbackTimeoutsRef.current.push(tId);

      audioEngine.playSingleNote(note.midi, stepStartTime, stepDuration * 1.15, 1.35, settings);
      accumulatedTime += stepDuration;
    });

    const finishTimeout = window.setTimeout(() => {
      setIsPlaying(false);
      setActiveStepIndex(null);
    }, accumulatedTime * 1000 + 300);
    playbackTimeoutsRef.current.push(finishTimeout);
  };

  // Play single step SATB audition
  const handleAuditionStep = (index: number) => {
    if (!harmonization || !harmonization.steps[index]) return;
    setActiveStepIndex(index);
    const step = harmonization.steps[index];
    const ctx = audioEngine.getContext();
    const now = ctx.currentTime + 0.02;
    const [bMidi, tMidi, aMidi, sMidi] = step.midisSATB;

    audioEngine.playSingleNote(bMidi, now, 1.4, 1.25, settings);
    audioEngine.playSingleNote(tMidi, now, 1.4, 1.05, settings);
    audioEngine.playSingleNote(aMidi, now, 1.4, 1.1, settings);
    audioEngine.playSingleNote(sMidi, now, 1.4, 1.35, settings);
  };

  // Play a specific harmonic turn
  const handlePlayTurn = (startIndex: number, endIndex: number) => {
    if (!harmonization) return;
    handleStopPlayback();
    setIsPlaying(true);

    const secondsPerBeat = 60 / tempo;
    const ctx = audioEngine.getContext();
    const startTime = ctx.currentTime + 0.05;

    let accumulatedTime = 0;

    for (let i = startIndex; i <= endIndex; i++) {
      const step = harmonization.steps[i];
      if (!step) continue;
      const stepDuration = Math.max(0.5, step.sopranoNote.durationBeats * secondsPerBeat);
      const stepStartTime = startTime + accumulatedTime;

      const tId = window.setTimeout(() => {
        setActiveStepIndex(i);
      }, accumulatedTime * 1000);
      playbackTimeoutsRef.current.push(tId);

      const [bMidi, tMidi, aMidi, sMidi] = step.midisSATB;
      audioEngine.playSingleNote(bMidi, stepStartTime, stepDuration * 1.1, 1.25, settings);
      audioEngine.playSingleNote(tMidi, stepStartTime, stepDuration * 1.05, 1.05, settings);
      audioEngine.playSingleNote(aMidi, stepStartTime, stepDuration * 1.05, 1.1, settings);
      audioEngine.playSingleNote(sMidi, stepStartTime, stepDuration * 1.1, 1.35, settings);

      accumulatedTime += stepDuration;
    }

    const finishTimeout = window.setTimeout(() => {
      setIsPlaying(false);
      setActiveStepIndex(null);
    }, accumulatedTime * 1000 + 400);
    playbackTimeoutsRef.current.push(finishTimeout);
  };

  // Helper piano keys for soprano register: C4 (60) to G5 (79)
  const pianoKeys = [
    { midi: 60, name: 'C4', isBlack: false },
    { midi: 61, name: 'C#4', isBlack: true },
    { midi: 62, name: 'D4', isBlack: false },
    { midi: 63, name: 'D#4', isBlack: true },
    { midi: 64, name: 'E4', isBlack: false },
    { midi: 65, name: 'F4', isBlack: false },
    { midi: 66, name: 'F#4', isBlack: true },
    { midi: 67, name: 'G4', isBlack: false },
    { midi: 68, name: 'G#4', isBlack: true },
    { midi: 69, name: 'A4', isBlack: false },
    { midi: 70, name: 'A#4', isBlack: true },
    { midi: 71, name: 'B4', isBlack: false },
    { midi: 72, name: 'C5', isBlack: false },
    { midi: 73, name: 'C#5', isBlack: true },
    { midi: 74, name: 'D5', isBlack: false },
    { midi: 75, name: 'D#5', isBlack: true },
    { midi: 76, name: 'E5', isBlack: false },
    { midi: 77, name: 'F5', isBlack: false },
    { midi: 78, name: 'F#5', isBlack: true },
    { midi: 79, name: 'G5', isBlack: false },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-5 pb-24 text-slate-200">
      {/* Studio Header Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl backdrop-blur-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-indigo-950">
                <Music className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
                  Гармонизация мелодии
                </h1>
              </div>
            </div>
          </div>

          {/* Studio Mode Switcher Tabs */}
          <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
            <button
              onClick={() => {
                setStudioTab('free');
                setAuditResults(null);
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                studioTab === 'free'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Music className="w-3.5 h-3.5" />
              <span>Свободный ввод</span>
            </button>
            <button
              onClick={() => {
                setStudioTab('task');
                handleGenerateTask();
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                studioTab === 'task'
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Target className="w-3.5 h-3.5 text-amber-200" />
              <span>Задача</span>
            </button>
            <button
              onClick={() => {
                setStudioTab('dictation');
                handleGenerateDictation(dictationMeasures, dictationAllowedDurations, dictationType);
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                studioTab === 'dictation'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Volume2 className="w-3.5 h-3.5 text-emerald-200" />
              <span>Диктант</span>
            </button>
          </div>
        </div>

        {/* Configuration Bar: Key, Meter, Tempo */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
          {/* Key Selector */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Тональность
            </label>
            <select
              value={selectedKeyTonic}
              onChange={(e) => handleKeyChange(e.target.value)}
              className="bg-slate-950/80 border border-slate-700 text-xs font-bold text-amber-300 rounded-xl px-3 py-2 outline-none focus:border-indigo-500 cursor-pointer"
            >
              {SUPPORTED_KEYS.map((k) => (
                <option key={k.tonic} value={k.tonic}>
                  {k.keyNameRu}
                </option>
              ))}
            </select>
          </div>

          {/* Meter Selector */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Размер
            </label>
            <select
              value={meter}
              onChange={(e) => handleMeterChange(e.target.value)}
              className="bg-slate-950/80 border border-slate-700 text-xs font-bold text-slate-200 rounded-xl px-3 py-2 outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="4/4">4/4 (Четыре четверти)</option>
              <option value="3/4">3/4 (Три четверти)</option>
              <option value="2/4">2/4 (Две четверти)</option>
            </select>
          </div>

          {/* Tempo Slider */}
          <div className="flex flex-col gap-1">
            <div className="flex justify-between items-center text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              <span>Темп</span>
              <span className="text-indigo-400 font-mono font-bold">{tempo} BPM</span>
            </div>
            <input
              type="range"
              min={50}
              max={140}
              value={tempo}
              onChange={(e) => setTempo(parseInt(e.target.value, 10))}
              className="w-full accent-indigo-500 mt-1 cursor-pointer"
            />
          </div>

          {/* Score Engraver View Mode Toggle */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Вид нот
            </label>
            <div className="flex rounded-xl bg-slate-950/80 border border-slate-800 p-0.5 text-xs">
              <button
                onClick={() => setScoreViewMode('vexflow')}
                className={`flex-1 py-1.5 px-2 rounded-lg font-bold transition cursor-pointer ${
                  scoreViewMode === 'vexflow'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                VexFlow
              </button>
              <button
                onClick={() => setScoreViewMode('color_voices')}
                className={`flex-1 py-1.5 px-2 rounded-lg font-bold transition cursor-pointer ${
                  scoreViewMode === 'color_voices'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Цвета SATB
              </button>
            </div>
          </div>
        </div>
      </div>

      {studioTab !== 'dictation' && (
        <>
          {/* Task Challenge Control Bar (When in Task Mode) */}
          {studioTab === 'task' && (
        <div className="bg-amber-950/40 border border-amber-500/30 rounded-2xl p-4 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-amber-200 flex items-center gap-2">
                Режим задачи: Гармонизация темы
              </h3>
              <p className="text-xs text-amber-300/80">
                Задана сопрановая мелодия. Составьте гармонизацию и проверьте на ошибки голосоведения.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleGenerateTask}
              className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Сгенерировать мелодию
            </button>

            <button
              onClick={handleAuditUser}
              disabled={!harmonization || harmonization.steps.length === 0}
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md cursor-pointer"
            >
              <FileCheck className="w-3.5 h-3.5" /> Проверить
            </button>

            <button
              onClick={() => setShowReferenceHarmonization(!showReferenceHarmonization)}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center gap-1.5 border border-slate-700 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              {showReferenceHarmonization ? 'Скрыть эталон' : 'Вариант AI'}
            </button>
          </div>
        </div>
      )}

      {/* Audit Feedback Panel for Task Mode */}
      {studioTab === 'task' && auditResults !== null && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-2xl flex flex-col gap-3">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              {auditResults.length === 0 ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Результат проверки: Ошибок нет!
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4 text-amber-400" /> Найдено замечаний: {auditResults.length}
                </>
              )}
            </h3>
          </div>

          {auditResults.length === 0 ? (
            <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>Гармонизация выполнена безупречно! Нет параллельных квинт/октав, перекрещиваний и выходов за диапазоны.</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {auditResults.map((err, idx) => (
                <div
                  key={`audit_${idx}`}
                  className={`p-3 rounded-xl border text-xs flex flex-col gap-1 ${
                    err.type === 'error'
                      ? 'bg-rose-950/30 border-rose-800/50 text-rose-200'
                      : 'bg-amber-950/30 border-amber-800/50 text-amber-200'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold">
                    <span className="flex items-center gap-1.5">
                      {err.type === 'error' ? (
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                      ) : (
                        <Info className="w-3.5 h-3.5 text-amber-400" />
                      )}
                      {err.titleRu}
                    </span>
                    <span className="text-[10px] font-mono opacity-70">Такт {err.measure}</span>
                  </div>
                  <p className="text-[11px] opacity-90">{err.descriptionRu}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Melody Composer & Note Input Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5" /> Ввод мелодии сопрано:
            </span>
            <span className="text-[11px] text-slate-500">
              выберите длительность и кликните на ноту
            </span>
          </div>

          {/* Duration Selector Buttons */}
          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setSelectedDuration('w')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                selectedDuration === 'w' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="Целая нота (4 доли)"
            >
              <span className="text-sm font-serif">𝅝</span> Целая
            </button>

            <button
              onClick={() => setSelectedDuration('h')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                selectedDuration === 'h' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="Половинная нота (2 доли)"
            >
              <span className="text-sm font-serif">𝅗𝅥</span> Половинная
            </button>

            <button
              onClick={() => setSelectedDuration('q')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                selectedDuration === 'q' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="Четвертная нота (1 доля)"
            >
              <span className="text-sm font-serif">♩</span> Четверть
            </button>

            <button
              onClick={() => setSelectedDuration('8')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                selectedDuration === '8' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="Восьмая нота (0.5 доли)"
            >
              <span className="text-sm font-serif">♪</span> Восьмая
            </button>

            <div className="w-[1px] h-5 bg-slate-800 mx-0.5" />

            <button
              onClick={() => setIsDotted(!isDotted)}
              className={`px-2 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                isDotted ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Нота с точкой (+50% длительности)"
            >
              С точкой •
            </button>
          </div>
        </div>

        {/* Interactive Piano Keyboard for Soprano Notes (C4 - G5) */}
        <div className="flex flex-col gap-2">
          <div className="text-[11px] text-slate-400 flex items-center justify-between">
            <span>Клавиатура сопрано (нажмите клавишу для добавления в мелодию):</span>
            <span className="text-amber-400 font-mono text-[10px]">
              Диапазон сопрано: C4 (До) — G5 (Соль)
            </span>
          </div>

          <div className="w-full overflow-x-auto pb-1">
            <div className="flex justify-center items-start min-w-[580px] bg-slate-950 p-2.5 rounded-xl border border-slate-800 select-none">
              {pianoKeys.map((key) => (
                <button
                  key={key.midi}
                  onClick={() => handlePianoKeyClick(key.midi)}
                  title={`C4-G5 (MIDI ${key.midi})`}
                  className={`relative rounded-b-md transition active:scale-[0.97] cursor-pointer ${
                    key.isBlack
                      ? 'w-7 h-20 -mx-3.5 z-10 bg-slate-800 hover:bg-slate-700 border border-slate-900 shadow-md'
                      : 'w-10 h-28 bg-slate-200 hover:bg-white border border-slate-300 shadow-sm'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Soprano Notes Strip (Current Melody) */}
        <div className="flex flex-col gap-2 pt-2 border-t border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold text-slate-300">
              Текущая последовательность нот сопрано ({sopranoNotes.length} нот):
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleDeleteNote(sopranoNotes.length - 1)}
                disabled={sopranoNotes.length === 0}
                className="px-2.5 py-1 text-[11px] rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 transition cursor-pointer flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" /> Удалить последнюю
              </button>
              <button
                onClick={handleClearMelody}
                disabled={sopranoNotes.length === 0}
                className="px-2.5 py-1 text-[11px] rounded-lg bg-red-950/40 border border-red-800/40 hover:bg-red-900/40 disabled:opacity-40 text-red-300 transition cursor-pointer flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" /> Очистить
              </button>
            </div>
          </div>

          {sopranoNotes.length === 0 ? (
            <div className="p-6 text-center border border-dashed border-slate-800 rounded-xl text-slate-500 text-xs">
              Мелодия пуста. Нажмите клавиши на клавиатуре выше, чтобы составить сопрановую тему для гармонизации.
            </div>
          ) : (
            <div className="flex flex-wrap gap-2 items-center">
              {sopranoNotes.map((note, idx) => (
                <div
                  key={note.id}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition ${
                    activeStepIndex === idx
                      ? 'bg-sky-950/80 border-sky-400 text-sky-200 ring-2 ring-sky-400/40'
                      : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <span className="text-[10px] text-slate-500 font-mono">#{idx + 1}</span>
                  <span className="font-bold text-white">{note.noteName}</span>
                  <span className="px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-300 font-mono text-[10px]">
                    {note.degreeRoman}
                  </span>
                  <span className="text-[10px] text-amber-400">
                    {note.duration === 'w' && '𝅝 целая'}
                    {note.duration === 'h' && '𝅗𝅥 половинная'}
                    {note.duration === 'q' && '♩ четверть'}
                    {note.duration === '8' && '♪ восьмая'}
                    {note.isDotted && ' •'}
                  </span>
                  <button
                    onClick={() => handleDeleteNote(idx)}
                    className="ml-1 text-slate-500 hover:text-red-400 p-0.5 rounded cursor-pointer"
                    title="Удалить ноту"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Primary Harmonize Action Button */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800">
          <div className="flex items-center gap-2">
            <button
              onClick={handleHarmonize}
              disabled={sopranoNotes.length === 0}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 active:scale-[0.98] disabled:opacity-40 text-white font-bold text-xs sm:text-sm shadow-lg shadow-indigo-950/50 flex items-center gap-2 transition cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              Гармонизовать мелодию сопрано
            </button>

            {harmonization && (
              <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Готово ({harmonization.detectedTurns.length} оборотов найдено)
              </span>
            )}
          </div>

          {/* Audio Playback Controls */}
          <div className="flex items-center gap-2">
            {isPlaying ? (
              <button
                onClick={handleStopPlayback}
                className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-red-950 transition cursor-pointer"
              >
                <Square className="w-3.5 h-3.5 fill-current" /> Стоп
              </button>
            ) : (
              <>
                <button
                  onClick={handlePlayMelodyOnly}
                  disabled={sopranoNotes.length === 0}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current text-indigo-400" /> Только сопрано
                </button>

                <button
                  onClick={handlePlaySATB}
                  disabled={!harmonization || harmonization.steps.length === 0}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-950 transition cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current" /> Играть SATB
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Score Area */}
      {harmonization && harmonization.steps.length > 0 && (
        <div className="flex flex-col gap-4">
          {/* Score View Toggle: VexFlow Engraving or Color Voice Grid */}
          {scoreViewMode === 'vexflow' ? (
            <VexFlowHarmonizationStaff
              steps={harmonization.steps}
              detectedTurns={harmonization.detectedTurns}
              currentKey={currentKey}
              meter={meter}
              activeStepIndex={activeStepIndex}
              onSelectStep={handleAuditionStep}
              showTurnBrackets={true}
              onlySoprano={studioTab === 'task' && !showReferenceHarmonization}
              userChords={userChords}
            />
          ) : (
            /* Colored Voice SATB Visualizer */
            studioTab === 'task' && !showReferenceHarmonization ? (
              <div className="bg-[#0b0f19] border border-slate-800 rounded-2xl p-4 shadow-2xl flex flex-col items-center justify-center text-center p-6 gap-2">
                <Target className="w-6 h-6 text-amber-400 animate-pulse" />
                <h4 className="text-xs font-bold text-slate-200">Голоса SATB скрыты во время тренировки</h4>
                <p className="text-[11px] text-slate-400 max-w-md">
                  Подберите гармонические функции на панели ниже. Нажмите «Вариант AI» для подсказки.
                </p>
              </div>
            ) : (
              <div className="bg-[#0b0f19] border border-slate-800 rounded-2xl p-5 shadow-2xl flex flex-col gap-3">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
                <span className="font-bold text-slate-300">
                  4-голосная партитура SATB (с разделением голосов)
                </span>
                <div className="flex items-center gap-2 text-[11px]">
                  <span className="text-rose-400 font-bold">● Сопрано</span>
                  <span className="text-amber-400 font-bold">● Альт</span>
                  <span className="text-emerald-400 font-bold">● Тенор</span>
                  <span className="text-purple-400 font-bold">● Бас</span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2 pt-2">
                {harmonization.steps.map((step, idx) => {
                  const isActive = activeStepIndex === idx;
                  const [bMidi, tMidi, aMidi, sMidi] = step.midisSATB;
                  const [bName, tName, aName, sName] = step.noteNamesSATB;

                  return (
                    <div
                      key={`card-step-${idx}`}
                      onClick={() => handleAuditionStep(idx)}
                      className={`p-3 rounded-xl border flex flex-col gap-1.5 transition cursor-pointer ${
                        isActive
                          ? 'bg-sky-950/80 border-sky-400 ring-2 ring-sky-400/50'
                          : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px] pb-1 border-b border-slate-800">
                        <span className="text-slate-500 font-mono">#{idx + 1}</span>
                        <span className="font-serif font-bold text-white text-sm">
                          {step.chordSymbol}
                        </span>
                      </div>

                      {/* Voices Stack */}
                      <div className="flex flex-col gap-1 text-xs">
                        <div className="flex justify-between items-center text-rose-400">
                          <span className="text-[10px] uppercase font-bold">S</span>
                          <span className="font-bold">{sName}</span>
                        </div>
                        <div className="flex justify-between items-center text-amber-400">
                          <span className="text-[10px] uppercase font-bold">A</span>
                          <span>{aName}</span>
                        </div>
                        <div className="flex justify-between items-center text-emerald-400">
                          <span className="text-[10px] uppercase font-bold">T</span>
                          <span>{tName}</span>
                        </div>
                        <div className="flex justify-between items-center text-purple-400">
                          <span className="text-[10px] uppercase font-bold">B</span>
                          <span className="font-bold">{bName}</span>
                        </div>
                      </div>

                      <div className="pt-1 border-t border-slate-800 text-[10px] text-slate-400 text-center truncate">
                        {step.voiceDoublingRu}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )
          )}

          {/* Interactive Chord Selection Tool (Task Mode, Training) */}
          {studioTab === 'task' && !showReferenceHarmonization && activeStepIndex !== null && activeStepIndex !== undefined && activeStepIndex < sopranoNotes.length && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div>
                  <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                    <Music className="w-4 h-4 text-amber-400" /> Выберите аккорд для ноты #{activeStepIndex + 1} ({sopranoNotes[activeStepIndex].noteName})
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Назначьте гармоническую функцию выбранной ноте сопрано.
                  </p>
                </div>
                {userChords[activeStepIndex] && (
                  <span className="px-3 py-1 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold text-xs">
                    Выбрано: {userChords[activeStepIndex]}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Тоника (T) */}
                <div className="flex flex-col gap-2 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider">Тоника (T)</span>
                  <div className="flex flex-wrap gap-2">
                    {['T5/3', 'T6', 'VI'].map((sym) => (
                      <button
                        key={sym}
                        onClick={() => {
                          const updated = [...userChords];
                          updated[activeStepIndex] = sym;
                          setUserChords(updated);
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                          userChords[activeStepIndex] === sym
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
                        }`}
                      >
                        {sym}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Субдоминанта (S) */}
                <div className="flex flex-col gap-2 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">Субдоминанта (S)</span>
                  <div className="flex flex-wrap gap-2">
                    {['S5/3', 'S6', 'II6'].map((sym) => (
                      <button
                        key={sym}
                        onClick={() => {
                          const updated = [...userChords];
                          updated[activeStepIndex] = sym;
                          setUserChords(updated);
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                          userChords[activeStepIndex] === sym
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
                        }`}
                      >
                        {sym}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Доминанта (D) */}
                <div className="flex flex-col gap-2 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <span className="text-[11px] font-bold text-rose-400 uppercase tracking-wider">Доминанта (D)</span>
                  <div className="flex flex-wrap gap-2">
                    {['D5/3', 'D6', 'D7', 'K6/4'].map((sym) => (
                      <button
                        key={sym}
                        onClick={() => {
                          const updated = [...userChords];
                          updated[activeStepIndex] = sym;
                          setUserChords(updated);
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                          userChords[activeStepIndex] === sym
                            ? 'bg-rose-600 text-white'
                            : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
                        }`}
                      >
                        {sym}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Harmonic Turns Inspector & Detailed Explanations */}
          {harmonization.detectedTurns.length > 0 && (
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col gap-3">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="text-sm font-bold text-amber-300 flex items-center gap-2">
                  <Award className="w-4 h-4" /> Анализ найденных гармонических оборотов
                </h3>
                <span className="text-xs text-slate-400">
                  Всего распознано формул: {harmonization.detectedTurns.length}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {harmonization.detectedTurns.map((turn) => (
                  <div
                    key={turn.id}
                    className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between gap-3"
                  >
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="px-2 py-0.5 rounded bg-indigo-950/80 border border-indigo-500/30 text-indigo-300 font-semibold text-[11px]">
                          {turn.categoryRu}
                        </span>
                        <span className="font-mono text-slate-400 text-[11px]">
                          Такты {turn.startIndex + 1}–{turn.endIndex + 1}
                        </span>
                      </div>

                      <h4 className="font-bold text-white text-sm tracking-tight">
                        {turn.turnNameRu}
                      </h4>

                      <div className="text-sm font-serif font-black text-amber-300 bg-slate-900/90 px-2.5 py-1 rounded-lg border border-slate-800">
                        {turn.formulaRu}
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed pt-1">
                        {turn.explanationRu}
                      </p>
                    </div>

                    {/* VexFlow Score Snippet for this Harmonic Turn */}
                    <VexFlowHarmonicTurnSnippet
                      turn={turn}
                      turnSteps={harmonization.steps.slice(turn.startIndex, turn.endIndex + 1)}
                      currentKey={currentKey}
                      activeStepIndex={activeStepIndex}
                      onPlayStep={handleAuditionStep}
                    />

                    <button
                      onClick={() => handlePlayTurn(turn.startIndex, turn.endIndex)}
                      className="w-full py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 flex items-center justify-center gap-1.5 transition cursor-pointer"
                    >
                      <Play className="w-3 h-3 fill-current text-amber-400" /> Прослушать этот оборот (шаги {turn.startIndex + 1}–{turn.endIndex + 1})
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Academic Voice Leading Audit Checklist */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col gap-3">
            <h3 className="text-xs font-bold text-slate-300 flex items-center gap-2 pb-2 border-b border-slate-800">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Аудит голосоведения
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center gap-1.5 justify-center text-center">
                <span className="text-emerald-400 font-bold text-xs">✓</span>
                <span className="text-slate-300 text-[11px] font-medium">Без параллельных квинт/октав</span>
              </div>

              <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center gap-1.5 justify-center text-center">
                <span className="text-emerald-400 font-bold text-xs">✓</span>
                <span className="text-slate-300 text-[11px] font-medium">Разрешение D7</span>
              </div>

              <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center gap-1.5 justify-center text-center">
                <span className="text-emerald-400 font-bold text-xs">✓</span>
                <span className="text-slate-300 text-[11px] font-medium">Положение K6/4</span>
              </div>

              <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center gap-1.5 justify-center text-center">
                <span className="text-emerald-400 font-bold text-xs">✓</span>
                <span className="text-slate-300 text-[11px] font-medium">Движение баса</span>
              </div>
            </div>
          </div>
        </div>
      )}
        </>
      )}

      {/* Dictation Mode Workspace */}
      {studioTab === 'dictation' && (
        <div className="flex flex-col gap-4">
          {/* Controls Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-350">
            
            {/* Top row with Title and Main Actions */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300">
                  <Volume2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-200">Музыкальный диктант</h3>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => playDictationMelody(dictationMelody)}
                  disabled={dictationPlaying || dictationMelody.length === 0}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Play className="w-3 h-3 fill-current" />
                  {dictationPlaying ? 'Играет...' : 'Слушать'}
                </button>

                <button
                  onClick={() => handleGenerateDictation(dictationMeasures, dictationAllowedDurations, dictationType)}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1 transition cursor-pointer border border-slate-700"
                >
                  <RefreshCw className="w-3 h-3" />
                  Новый
                </button>

                <div className="w-[1px] h-5 bg-slate-800 mx-1" />

                <button
                  onClick={() => setDictationChecked(true)}
                  disabled={userGuessedMidis.length === 0}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs font-bold flex items-center gap-1 transition cursor-pointer"
                >
                  <FileCheck className="w-3 h-3" />
                  Проверить
                </button>

                <button
                  onClick={() => setShowDictationAnswer(!showDictationAnswer)}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition cursor-pointer border border-slate-700"
                >
                  {showDictationAnswer ? 'Скрыть' : 'Ответ'}
                </button>
              </div>
            </div>

            {/* Bottom row with configurations (Rhythm, Mode, Length) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              {/* Length in measures */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Длина диктанта (такты)</span>
                <div className="flex bg-slate-950 rounded-xl border border-slate-800 p-0.5">
                  {[4, 8, 16].map((meas) => (
                    <button
                      key={meas}
                      onClick={() => {
                        setDictationMeasures(meas);
                        handleGenerateDictation(meas, dictationAllowedDurations, dictationType);
                      }}
                      className={`flex-1 py-1.5 px-2 text-[11px] font-bold rounded-lg transition cursor-pointer ${
                        dictationMeasures === meas ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {meas} {meas === 4 ? 'такта' : 'тактов'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dictation Mode */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Тип мелодии</span>
                <div className="flex bg-slate-950 rounded-xl border border-slate-800 p-0.5">
                  <button
                    onClick={() => {
                      setDictationType('diatonic');
                      handleGenerateDictation(dictationMeasures, dictationAllowedDurations, 'diatonic');
                    }}
                    className={`flex-1 py-1.5 px-2 text-[11px] font-bold rounded-lg transition cursor-pointer ${
                      dictationType === 'diatonic' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Диатоническая
                  </button>
                  <button
                    onClick={() => {
                      setDictationType('chromatic');
                      handleGenerateDictation(dictationMeasures, dictationAllowedDurations, 'chromatic');
                    }}
                    className={`flex-1 py-1.5 px-2 text-[11px] font-bold rounded-lg transition cursor-pointer ${
                      dictationType === 'chromatic' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Хроматическая
                  </button>
                </div>
              </div>

              {/* Durations configured */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Включать длительности</span>
                <div className="flex flex-wrap gap-1.5 bg-slate-950/40 border border-slate-800 rounded-xl p-1.5 justify-around">
                  {[
                    { key: 'h', label: '𝅗𝅥 Половинные' },
                    { key: 'q', label: '♩ Четверти' },
                    { key: '8', label: '♪ Восьмые' },
                    { key: '16', label: '𝅘𝅥𝅯 Шестнадцатые' }
                  ].map((dur) => {
                    const isSelected = dictationAllowedDurations.includes(dur.key as any);
                    return (
                      <button
                        key={dur.key}
                        onClick={() => {
                          let updated: ('h' | 'q' | '8' | '16')[];
                          if (isSelected) {
                            if (dictationAllowedDurations.length <= 1) return; // Prevent empty list
                            updated = dictationAllowedDurations.filter(d => d !== dur.key);
                          } else {
                            updated = [...dictationAllowedDurations, dur.key as any];
                          }
                          setDictationAllowedDurations(updated);
                          handleGenerateDictation(dictationMeasures, updated, dictationType);
                        }}
                        className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer ${
                          isSelected 
                            ? 'bg-emerald-950/80 border border-emerald-500/50 text-emerald-300' 
                            : 'bg-slate-900 border border-slate-800 text-slate-500 hover:text-slate-300'
                        }`}
                      >
                        {dur.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

          </div>

          {/* Compact VexFlow Score Card */}
          <div className="bg-[#0b0f19]/90 border border-slate-800 rounded-2xl p-4 shadow-2xl flex flex-col gap-3">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-bold text-slate-300">
                Ноты на стане ({userGuessedMidis.length} из {dictationMelody.length}):
              </span>
              {userGuessedMidis.length > 0 && (
                <button
                  onClick={() => setUserGuessedMidis((prev) => prev.slice(0, -1))}
                  className="px-2 py-0.5 text-[10px] rounded bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1 cursor-pointer transition"
                >
                  <RotateCcw className="w-2.5 h-2.5" /> Стереть последнюю
                </button>
              )}
            </div>

            {/* Render the single staff score! */}
            <VexFlowDictationStaff
              dictationMelody={dictationMelody}
              userGuessedMidis={userGuessedMidis}
              dictationChecked={dictationChecked}
              showDictationAnswer={showDictationAnswer}
              currentKey={currentKey}
              meter={meter}
            />

            {/* Congratulations Banner if checked and perfectly correct! */}
            {dictationChecked && userGuessedMidis.length === dictationMelody.length && (
              <div className="mt-1 animate-in zoom-in-95 duration-200">
                {userGuessedMidis.every((m, idx) => m === dictationMelody[idx].midi) ? (
                  <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>✓ Отлично! Всё верно!</span>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-800/40 text-rose-300 text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>Есть ошибки. Подсказка: кнопка «Ответ»</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Piano Keyboard */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col gap-2">
            <div className="w-full overflow-x-auto pb-1">
              <div className="flex justify-center items-start min-w-[580px] bg-slate-950 p-2.5 rounded-xl border border-slate-800 select-none">
                {pianoKeys.map((key) => {
                  return (
                    <button
                      key={key.midi}
                      onClick={() => handlePianoKeyClick(key.midi)}
                      title={`${key.name}`}
                      className={`relative rounded-b-md transition active:scale-[0.97] cursor-pointer ${
                        key.isBlack
                          ? 'w-7 h-20 -mx-3.5 z-10 bg-slate-800 hover:bg-slate-700 border border-slate-900 shadow-md'
                          : 'w-10 h-28 bg-slate-200 hover:bg-white border border-slate-300 shadow-sm'
                      }`}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
