import React, { useState, useCallback, useRef, useEffect } from 'react';
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
  generateRandomHarmonizationTask,
  auditUserHarmonization,
  AuditErrorItem,
  getTonicPitchClass,
} from '../audio/harmonizationEngine';
import { DictationNote } from './VexFlowDictationStaff';
import { HarmonizationToolbar } from './harmonization/HarmonizationToolbar';
import { HarmonizationNoteInput } from './harmonization/HarmonizationNoteInput';
import { HarmonizationScoreCard } from './harmonization/HarmonizationScoreCard';
import { HarmonizationChordCard } from './harmonization/HarmonizationChordCard';
import { HarmonizationDictationSection } from './harmonization/HarmonizationDictationSection';

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

  // View mode: 'vexflow' | 'color_voices'
  const [scoreViewMode, setScoreViewMode] = useState<'vexflow' | 'color_voices'>('vexflow');

  // Mode: 'free' | 'task' | 'dictation'
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
  const [dictationPlaying, setDictationPlaying] = useState<boolean>(false);
  const [dictationChecked, setDictationChecked] = useState<boolean>(false);
  const [showDictationAnswer, setShowDictationAnswer] = useState<boolean>(false);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      playbackTimeoutsRef.current.forEach((t) => window.clearTimeout(t));
      audioEngine.stopAll();
    };
  }, []);

  // Stop all playback
  const handleStopPlayback = useCallback(() => {
    playbackTimeoutsRef.current.forEach((t) => window.clearTimeout(t));
    playbackTimeoutsRef.current = [];
    audioEngine.stopAll();
    setIsPlaying(false);
    setDictationPlaying(false);
    setActiveStepIndex(null);
  }, []);

  // Generate a random dictation melody
  const handleGenerateDictation = useCallback(
    (
      measuresCount: number = 4,
      allowedDurations: ('h' | 'q' | '8' | '16')[] = ['h', 'q'],
      type: 'diatonic' | 'chromatic' = 'diatonic'
    ) => {
      const beatsPerMeasure = parseInt(meter.split('/')[0], 10) || 4;
      const totalBeatsRequired = measuresCount * beatsPerMeasure;
      const notes: DictationNote[] = [];
      let accumulatedBeats = 0;

      const diatonicOffsets = currentKey.mode === 'major'
        ? [0, 2, 4, 5, 7, 9, 11, 12, 14]
        : [0, 2, 3, 5, 7, 8, 10, 11, 12, 14];

      const durationBeatValues: Record<'h' | 'q' | '8' | '16', number> = {
        h: 2,
        q: 1,
        '8': 0.5,
        '16': 0.25,
      };

      const rootMidi = 60 + getTonicPitchClass(currentKey);
      let prevOffset = 0;

      while (accumulatedBeats < totalBeatsRequired) {
        const remainingBeats = totalBeatsRequired - accumulatedBeats;
        const validDurs = allowedDurations.filter((d) => durationBeatValues[d] <= remainingBeats);

        let chosenDur: 'h' | 'q' | '8' | '16' = 'q';
        if (validDurs.length > 0) {
          chosenDur = validDurs[Math.floor(Math.random() * validDurs.length)];
        } else if (remainingBeats >= 0.5) {
          chosenDur = '8';
        } else {
          chosenDur = '16';
        }

        const durBeats = durationBeatValues[chosenDur];

        let midi: number;
        if (accumulatedBeats === 0) {
          midi = rootMidi;
          prevOffset = 0;
        } else if (accumulatedBeats + durBeats >= totalBeatsRequired) {
          midi = rootMidi;
        } else {
          if (type === 'diatonic') {
            const stepOptions = [-2, -1, 1, 2, 0, -3, 3];
            const delta = stepOptions[Math.floor(Math.random() * stepOptions.length)];
            const curIdx = diatonicOffsets.indexOf(prevOffset);
            const newIdx = Math.max(0, Math.min(diatonicOffsets.length - 1, (curIdx !== -1 ? curIdx : 0) + delta));
            prevOffset = diatonicOffsets[newIdx];
            midi = rootMidi + prevOffset;
          } else {
            const semitoneJump = [-2, -1, 1, 2, 3, -3][Math.floor(Math.random() * 6)];
            midi = Math.max(rootMidi - 2, Math.min(rootMidi + 16, rootMidi + prevOffset + semitoneJump));
            prevOffset = midi - rootMidi;
          }
        }

        notes.push({
          midi,
          duration: chosenDur,
          durationBeats: durBeats,
        });

        accumulatedBeats += durBeats;
      }

      setDictationMelody(notes);
      setUserGuessedMidis([]);
      setDictationChecked(false);
      setShowDictationAnswer(false);
    },
    [currentKey, meter]
  );

  // Play Dictation melody
  const playDictationMelody = useCallback(
    (melodyToPlay: DictationNote[]) => {
      if (melodyToPlay.length === 0) return;
      handleStopPlayback();
      setDictationPlaying(true);

      const secondsPerBeat = 60 / tempo;
      const ctx = audioEngine.getContext();
      const startTime = ctx.currentTime + 0.1;
      let accTime = 0;

      melodyToPlay.forEach((note) => {
        const dur = Math.max(0.35, note.durationBeats * secondsPerBeat);
        const noteStart = startTime + accTime;
        audioEngine.playSingleNote(note.midi, noteStart, dur * 0.95, 1.4, settings);
        accTime += dur;
      });

      const finishId = window.setTimeout(() => {
        setDictationPlaying(false);
      }, accTime * 1000 + 400);
      playbackTimeoutsRef.current.push(finishId);
    },
    [tempo, handleStopPlayback, settings]
  );

  // Auto-generate dictation on initial switch to dictation tab
  useEffect(() => {
    if (studioTab === 'dictation' && dictationMelody.length === 0) {
      handleGenerateDictation(dictationMeasures, dictationAllowedDurations, dictationType);
    }
  }, [studioTab, dictationMelody.length, dictationMeasures, dictationAllowedDurations, dictationType, handleGenerateDictation]);

  // Task generation
  const handleGenerateTask = useCallback(() => {
    handleStopPlayback();
    const taskNotes = generateRandomHarmonizationTask(currentKey, meter);
    setSopranoNotes(taskNotes);
    setUserChords(new Array(taskNotes.length).fill(''));
    const res = autoHarmonizeMelody(taskNotes, currentKey);
    setHarmonization(res);
    setAuditResults(null);
    setShowReferenceHarmonization(false);
  }, [currentKey, meter, handleStopPlayback]);

  // Audit user harmonization in task mode or free mode
  const handleAuditUser = useCallback(() => {
    if (!harmonization || harmonization.steps.length === 0) return;

    if (studioTab === 'task') {
      const issues: AuditErrorItem[] = [];

      harmonization.steps.forEach((step, idx) => {
        const userChord = userChords[idx];
        if (!userChord) {
          issues.push({
            type: 'warning',
            titleRu: `Не выбран аккорд на шаге ${idx + 1}`,
            descriptionRu: `Для ноты ${step.sopranoNote.noteName} (шаг ${idx + 1}) не указан аккорд.`,
            measure: step.sopranoNote.measure,
          });
        } else if (userChord !== step.chordSymbol) {
          issues.push({
            type: 'warning',
            titleRu: `Альтернативный выбор на шаге ${idx + 1}`,
            descriptionRu: `Вы указали ${userChord}, в эталонном решении рекомендован ${step.chordSymbol}.`,
            measure: step.sopranoNote.measure,
          });
        }
      });

      const lastIdx = harmonization.steps.length - 1;
      if (lastIdx >= 0) {
        const lastUserChord = userChords[lastIdx];
        if (lastUserChord && !lastUserChord.startsWith('T')) {
          issues.push({
            type: 'error',
            titleRu: `Отсутствие тоники в кадансе`,
            descriptionRu: `Заключительный аккорд мелодии должен быть тоническим (T5/3). Выбран ${lastUserChord}.`,
            measure: harmonization.steps[lastIdx].sopranoNote.measure,
          });
        }
      }

      setAuditResults(issues);
    } else {
      const issues = auditUserHarmonization(harmonization.steps, currentKey);
      setAuditResults(issues);
    }
  }, [harmonization, userChords, studioTab, currentKey]);

  // Add note to soprano melody
  const handleAddNote = useCallback(
    (midi: number) => {
      const beatsPerMeasure = parseInt(meter.split('/')[0], 10) || 4;
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

      const now = audioEngine.getContext().currentTime;
      audioEngine.playSingleNote(midi, now, 0.8, 1.25, settings);

      const res = autoHarmonizeMelody(updated, currentKey);
      setHarmonization(res);
    },
    [currentKey, meter, selectedDuration, isDotted, sopranoNotes, settings]
  );

  // Handle interactive piano key clicks based on active mode
  const handlePianoKeyClick = useCallback(
    (midi: number) => {
      const now = audioEngine.getContext().currentTime;
      audioEngine.playSingleNote(midi, now, 0.8, 1.25, settings);

      if (studioTab === 'dictation') {
        if (userGuessedMidis.length < dictationMelody.length) {
          setUserGuessedMidis((prev) => [...prev, midi]);
        }
      } else {
        handleAddNote(midi);
      }
    },
    [studioTab, userGuessedMidis, dictationMelody, handleAddNote, settings]
  );

  // Delete note
  const handleDeleteNote = useCallback(
    (index: number) => {
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
    },
    [sopranoNotes, currentKey]
  );

  // Clear melody
  const handleClearMelody = useCallback(() => {
    setSopranoNotes([]);
    setUserChords([]);
    setHarmonization(null);
    setActiveStepIndex(null);
    handleStopPlayback();
  }, [handleStopPlayback]);

  // Key Change
  const handleKeyChange = useCallback(
    (newTonic: string) => {
      setSelectedKeyTonic(newTonic);
      const newKeyObj = SUPPORTED_KEYS.find((k) => k.tonic === newTonic) || SUPPORTED_KEYS[0];

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
    },
    [sopranoNotes]
  );

  // Meter Change
  const handleMeterChange = useCallback(
    (newMeter: string) => {
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
    },
    [sopranoNotes, currentKey]
  );

  // Play SATB Harmonization
  const handlePlaySATB = useCallback(() => {
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

      const tId = window.setTimeout(() => {
        setActiveStepIndex(idx);
      }, accumulatedTime * 1000);
      playbackTimeoutsRef.current.push(tId);

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
  }, [harmonization, tempo, handleStopPlayback, settings]);

  // Play Soprano melody only
  const handlePlayMelodyOnly = useCallback(() => {
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
  }, [sopranoNotes, tempo, handleStopPlayback, settings]);

  // Audition single step
  const handleAuditionStep = useCallback(
    (index: number) => {
      if (!harmonization || !harmonization.steps[index]) return;
      const step = harmonization.steps[index];
      const now = audioEngine.getContext().currentTime;

      if (studioTab === 'task' && !showReferenceHarmonization) {
        audioEngine.playSingleNote(step.sopranoNote.midi, now, 0.9, 1.3, settings);
      } else {
        const [bMidi, tMidi, aMidi, sMidi] = step.midisSATB;
        audioEngine.playSingleNote(bMidi, now, 0.9, 1.25, settings);
        audioEngine.playSingleNote(tMidi, now, 0.9, 1.05, settings);
        audioEngine.playSingleNote(aMidi, now, 0.9, 1.1, settings);
        audioEngine.playSingleNote(sMidi, now, 0.9, 1.35, settings);
      }
      setActiveStepIndex(index);
    },
    [harmonization, studioTab, showReferenceHarmonization, settings]
  );

  // Set chord for step
  const handleSelectChordForStep = useCallback((stepIndex: number, chord: string) => {
    setUserChords((prev) => {
      const updated = [...prev];
      updated[stepIndex] = chord;
      return updated;
    });
  }, []);

  // Reset user chords
  const handleResetChords = useCallback(() => {
    setUserChords(new Array(sopranoNotes.length).fill(''));
    setAuditResults(null);
  }, [sopranoNotes.length]);

  return (
    <div className="w-full flex flex-col gap-3">
      {/* 1. Header Toolbar */}
      <HarmonizationToolbar
        studioTab={studioTab}
        onTabChange={(tab) => {
          setStudioTab(tab);
          handleStopPlayback();
        }}
        selectedKeyTonic={selectedKeyTonic}
        onKeyChange={handleKeyChange}
        meter={meter}
        onMeterChange={handleMeterChange}
        tempo={tempo}
        onTempoChange={(t) => {
          setTempo(t);
          onSettingsChange?.({ tempo: t / 60 });
        }}
        isPlaying={isPlaying}
        onPlaySATB={handlePlaySATB}
        onPlayMelodyOnly={handlePlayMelodyOnly}
        onStopPlayback={handleStopPlayback}
        onClearMelody={handleClearMelody}
        notesCount={sopranoNotes.length}
      />

      {/* 2. Free and Task Modes */}
      {studioTab !== 'dictation' && (
        <>
          {/* Block 1: Note Rendering (Score Notation Card) */}
          <HarmonizationScoreCard
            harmonization={harmonization}
            currentKey={currentKey}
            meter={meter}
            activeStepIndex={activeStepIndex}
            onAuditionStep={handleAuditionStep}
            scoreViewMode={scoreViewMode}
            onScoreViewModeChange={setScoreViewMode}
            studioTab={studioTab}
            userChords={userChords}
            showReferenceHarmonization={showReferenceHarmonization}
            sopranoNotes={sopranoNotes}
          />

          {/* Block 2: Chord Selection (Harmonic Analysis Card) */}
          <HarmonizationChordCard
            steps={harmonization?.steps || []}
            currentKey={currentKey}
            activeStepIndex={activeStepIndex}
            onAuditionStep={handleAuditionStep}
            userChords={userChords}
            onSelectChordForStep={handleSelectChordForStep}
            studioTab={studioTab}
            showReferenceHarmonization={showReferenceHarmonization}
            onToggleReference={() => setShowReferenceHarmonization((prev) => !prev)}
            onGenerateTask={studioTab === 'task' ? handleGenerateTask : undefined}
            onAuditUser={handleAuditUser}
            onResetChords={handleResetChords}
            auditResults={auditResults}
          />

          {/* Melody Composer & Piano Input Card */}
          <HarmonizationNoteInput
            currentKey={currentKey}
            selectedDuration={selectedDuration}
            onSelectDuration={setSelectedDuration}
            isDotted={isDotted}
            onToggleDotted={() => setIsDotted((prev) => !prev)}
            sopranoNotes={sopranoNotes}
            onAddNote={handleAddNote}
            onDeleteNote={handleDeleteNote}
            activeStepIndex={activeStepIndex}
          />
        </>
      )}

      {/* 3. Dictation Mode */}
      {studioTab === 'dictation' && (
        <HarmonizationDictationSection
          dictationMelody={dictationMelody}
          userGuessedMidis={userGuessedMidis}
          onSetUserGuessedMidis={setUserGuessedMidis}
          dictationPlaying={dictationPlaying}
          onPlayDictationMelody={playDictationMelody}
          onGenerateDictation={handleGenerateDictation}
          dictationMeasures={dictationMeasures}
          onSetDictationMeasures={setDictationMeasures}
          dictationAllowedDurations={dictationAllowedDurations}
          onSetDictationAllowedDurations={setDictationAllowedDurations}
          dictationType={dictationType}
          onSetDictationType={setDictationType}
          dictationChecked={dictationChecked}
          onSetDictationChecked={setDictationChecked}
          showDictationAnswer={showDictationAnswer}
          onToggleShowDictationAnswer={() => setShowDictationAnswer((prev) => !prev)}
          currentKey={currentKey}
          meter={meter}
          onPianoKeyClick={handlePianoKeyClick}
        />
      )}
    </div>
  );
};
