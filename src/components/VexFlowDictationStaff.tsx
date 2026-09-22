import React, { useEffect, useRef, useState } from 'react';
import {
  Renderer,
  Stave,
  StaveNote,
  Voice,
  Formatter,
  Accidental,
  Barline,
  Beam,
} from 'vexflow';
import { HarmonizationKey } from '../audio/harmonizationEngine';

export interface DictationNote {
  midi: number;
  duration: 'h' | 'q' | '8' | '16';
  durationBeats: number;
}

interface VexFlowDictationStaffProps {
  dictationMelody: DictationNote[];
  userGuessedMidis: number[];
  dictationChecked: boolean;
  showDictationAnswer: boolean;
  currentKey: HarmonizationKey;
  meter: string;
}

function midiToVexKey(midi: number, accidentalType: '#' | 'b' = '#'): { key: string; accidental: string | null } {
  const sharpMap = ['c', 'c#', 'd', 'd#', 'e', 'f', 'f#', 'g', 'g#', 'a', 'a#', 'b'];
  const flatMap = ['c', 'db', 'd', 'eb', 'e', 'f', 'gb', 'g', 'ab', 'a', 'bb', 'b'];
  const map = accidentalType === 'b' ? flatMap : sharpMap;
  const pc = ((midi % 12) + 12) % 12;
  const octave = Math.floor(midi / 12) - 1;
  const noteStr = map[pc];
  let accidental: string | null = null;
  if (noteStr.includes('#')) accidental = '#';
  else if (noteStr.includes('b')) accidental = 'b';
  return { key: `${noteStr}/${octave}`, accidental };
}

export const VexFlowDictationStaff: React.FC<VexFlowDictationStaffProps> = ({
  dictationMelody,
  userGuessedMidis,
  dictationChecked,
  showDictationAnswer,
  currentKey,
  meter,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [renderError, setRenderError] = useState<string | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Clear previous SVG
    container.innerHTML = '';
    setRenderError(null);

    if (dictationMelody.length === 0) return;

    // Parse time signature (meter)
    const [beatsPerMeasureVal] = meter.split('/').map(Number);
    const beatsPerMeasure = beatsPerMeasureVal || 4;

    // Group dictation notes into measures
    const measures: {
      notes: DictationNote[];
      userNotes: (number | undefined)[];
      startIndex: number;
    }[] = [];

    let currentMeasureNotes: DictationNote[] = [];
    let currentMeasureUser: (number | undefined)[] = [];
    let accumulatedBeats = 0;
    let measureStartIdx = 0;

    dictationMelody.forEach((note, idx) => {
      currentMeasureNotes.push(note);
      currentMeasureUser.push(userGuessedMidis[idx]);
      accumulatedBeats += note.durationBeats;

      if (Math.abs(accumulatedBeats - beatsPerMeasure) < 0.01 || accumulatedBeats > beatsPerMeasure) {
        measures.push({
          notes: currentMeasureNotes,
          userNotes: currentMeasureUser,
          startIndex: measureStartIdx,
        });
        currentMeasureNotes = [];
        currentMeasureUser = [];
        accumulatedBeats = 0;
        measureStartIdx = idx + 1;
      }
    });

    if (currentMeasureNotes.length > 0) {
      measures.push({
        notes: currentMeasureNotes,
        userNotes: currentMeasureUser,
        startIndex: measureStartIdx,
      });
    }

    // Canvas size parameters
    const measuresPerSystem = 4;
    const numSystems = Math.ceil(measures.length / measuresPerSystem);

    const PIXELS_PER_BEAT = 50; // Every beat gets exactly 50px, ensuring perfect proportional spacing!
    const notesWidth = beatsPerMeasure * PIXELS_PER_BEAT;

    const keySigAccidentalsMap: Record<string, number> = {
      C: 0, Am: 0,
      G: 1, Em: 1, F: 1, Dm: 1,
      D: 2, Bm: 2, Bb: 2, Gm: 2,
      A: 3, 'F#m': 3, Eb: 3, Cm: 3,
    };
    const keySigAccidentals = keySigAccidentalsMap[currentKey.tonic] || 0;
    const keySigWidth = keySigAccidentals > 0 ? (keySigAccidentals * 12 + 10) : 0;

    // Calculate staveWidth for each measure to guarantee identical space for notes in all measures
    const staveWidths = measures.map((_, mIdx) => {
      const isFirstInSystem = mIdx % measuresPerSystem === 0;
      if (isFirstInSystem) {
        const isFirstSystem = mIdx < measuresPerSystem;
        const timeSigWidth = isFirstSystem ? 30 : 0;
        // Clef (35) + KeySig (keySigWidth) + TimeSig (timeSigWidth) + Left/Right Margin Buffer (30) + notesWidth
        return 35 + keySigWidth + timeSigWidth + 30 + notesWidth;
      } else {
        // Left/Right Margin Buffer (20) + notesWidth
        return 20 + notesWidth;
      }
    });

    // Calculate system widths and max system width to resize canvas properly
    const systemWidths: number[] = [];
    for (let sysIdx = 0; sysIdx < numSystems; sysIdx++) {
      let sysWidth = 10; // Left margin
      const startM = sysIdx * measuresPerSystem;
      const endM = Math.min(startM + measuresPerSystem, measures.length);
      for (let m = startM; m < endM; m++) {
        sysWidth += staveWidths[m];
      }
      sysWidth += 10; // Right margin
      systemWidths.push(sysWidth);
    }

    const maxSystemWidth = Math.max(...systemWidths, 680);
    const totalHeight = numSystems * 120 + 20;

    try {
      const renderer = new Renderer(container, Renderer.Backends.SVG);
      renderer.resize(maxSystemWidth, totalHeight);
      const context = renderer.getContext();

      context.setFont('Bravura, "Academic Music", serif', 14);
      context.setFillStyle('#cbd5e1'); // light slate
      context.setStrokeStyle('#475569'); // slate-600

      const keySigMap: Record<string, string> = {
        C: 'C', G: 'G', D: 'D', A: 'A', F: 'F', Bb: 'Bb', Eb: 'Eb',
        Am: 'Am', Em: 'Em', Dm: 'Dm', Gm: 'Gm', Cm: 'Cm',
      };
      const vexKeySig = keySigMap[currentKey.tonic] || 'C';

      let currentX = 10;
      let currentY = 10;

      for (let mIdx = 0; mIdx < measures.length; mIdx++) {
        const isFirstInSystem = mIdx % measuresPerSystem === 0;

        if (isFirstInSystem && mIdx > 0) {
          currentX = 10;
          currentY += 120;
        }

        const staveWidth = staveWidths[mIdx];
        const stave = new Stave(currentX, currentY, staveWidth);

        if (isFirstInSystem) {
          stave.addClef('treble');
          stave.addKeySignature(vexKeySig);
          // Only add time signature on the very first system
          if (mIdx === 0) {
            stave.addTimeSignature(meter);
          }
        }

        if (mIdx === measures.length - 1) {
          stave.setEndBarType(Barline.type.DOUBLE);
        }

        stave.setContext(context).draw();

        const measureData = measures[mIdx];
        const notes: StaveNote[] = [];
        const noteInfos: { note: StaveNote; startBeat: number; endBeat: number; isRest: boolean; duration: 'h' | 'q' | '8' | '16' }[] = [];
        let currentBeatPosition = 0;

        measureData.notes.forEach((note, nIdx) => {
          const correctMidi = note.midi;
          const guessedMidi = measureData.userNotes[nIdx];
          const isGuessed = guessedMidi !== undefined;
          const isShowingVerification = dictationChecked || showDictationAnswer;
          const correctDuration = note.duration;
          const isRest = !isGuessed && !showDictationAnswer;

          let stNote: StaveNote;

          if (!isGuessed) {
            if (showDictationAnswer) {
              const correctVex = midiToVexKey(correctMidi, currentKey.accidentalType);
              stNote = new StaveNote({
                keys: [correctVex.key],
                duration: correctDuration,
              });
              if (correctVex.accidental) {
                stNote.addModifier(new Accidental(correctVex.accidental), 0);
              }
              stNote.setStyle({ fillStyle: '#10b981', strokeStyle: '#10b981' });
            } else {
              // Rhythmic rest to help user see what rhythm is expected
              stNote = new StaveNote({
                keys: ['b/4'],
                duration: correctDuration + 'r',
              });
              stNote.setStyle({ fillStyle: '#334155', strokeStyle: '#334155' });
            }
          } else {
            const isCorrect = guessedMidi === correctMidi;

            if (isShowingVerification) {
              if (isCorrect) {
                const correctVex = midiToVexKey(correctMidi, currentKey.accidentalType);
                stNote = new StaveNote({
                  keys: [correctVex.key],
                  duration: correctDuration,
                });
                if (correctVex.accidental) {
                  stNote.addModifier(new Accidental(correctVex.accidental), 0);
                }
                stNote.setStyle({ fillStyle: '#10b981', strokeStyle: '#10b981' });
              } else {
                const guessedVex = midiToVexKey(guessedMidi, currentKey.accidentalType);
                const correctVex = midiToVexKey(correctMidi, currentKey.accidentalType);

                const chordNotes = [
                  { midi: guessedMidi, vex: guessedVex, isGuessed: true },
                  { midi: correctMidi, vex: correctVex, isGuessed: false },
                ].sort((a, b) => a.midi - b.midi);

                const keys = chordNotes.map(cn => cn.vex.key);
                stNote = new StaveNote({
                  keys,
                  duration: correctDuration,
                });

                chordNotes.forEach((cn, chordIdx) => {
                  if (cn.vex.accidental) {
                    stNote.addModifier(new Accidental(cn.vex.accidental), chordIdx);
                  }
                });

                chordNotes.forEach((cn, chordIdx) => {
                  const color = cn.isGuessed ? '#f43f5e' : '#10b981';
                  stNote.setKeyStyle(chordIdx, { fillStyle: color, strokeStyle: color });
                });
              }
            } else {
              const guessedVex = midiToVexKey(guessedMidi, currentKey.accidentalType);
              stNote = new StaveNote({
                keys: [guessedVex.key],
                duration: correctDuration,
              });

              if (guessedVex.accidental) {
                stNote.addModifier(new Accidental(guessedVex.accidental), 0);
              }
              stNote.setStyle({ fillStyle: '#cbd5e1', strokeStyle: '#cbd5e1' });
            }
          }

          notes.push(stNote);
          noteInfos.push({
            note: stNote,
            startBeat: currentBeatPosition,
            endBeat: currentBeatPosition + note.durationBeats,
            isRest: isRest,
            duration: correctDuration,
          });

          currentBeatPosition += note.durationBeats;
        });

        if (notes.length > 0) {
          const voice = new Voice({ numBeats: beatsPerMeasure, beatValue: 4 });
          voice.addTickables(notes);

          // We format the voice using exactly notesWidth, guaranteeing 100% consistent note spacing across staves!
          new Formatter().joinVoices([voice]).format([voice], notesWidth);
          voice.draw(context, stave);

          // Generate and draw custom beautiful beat-by-beat beams for eighth and sixteenth notes
          const beams: Beam[] = [];
          for (let b = 0; b < beatsPerMeasure; b++) {
            const beatNotes = noteInfos.filter(info => 
              info.startBeat >= b - 0.001 && 
              info.endBeat <= b + 1.001 && 
              (info.duration === '8' || info.duration === '16') && 
              !info.isRest
            );

            let currentGroup: StaveNote[] = [];
            for (let i = 0; i < beatNotes.length; i++) {
              const currentInfo = beatNotes[i];
              const prevInfo = beatNotes[i - 1];

              // Check if they are consecutive in time within the same beat boundary
              if (prevInfo && Math.abs(currentInfo.startBeat - prevInfo.endBeat) > 0.001) {
                if (currentGroup.length >= 2) {
                  beams.push(new Beam(currentGroup));
                }
                currentGroup = [];
              }
              currentGroup.push(currentInfo.note);
            }
            if (currentGroup.length >= 2) {
              beams.push(new Beam(currentGroup));
            }
          }

          beams.forEach((beam) => {
            beam.setContext(context).draw();
          });
        }

        currentX += staveWidth;
      }

    } catch (err: any) {
      console.error('Error rendering VexFlow Dictation staff:', err);
      setRenderError(err.message || 'Error rendering score');
    }
  }, [dictationMelody, userGuessedMidis, dictationChecked, showDictationAnswer, currentKey, meter]);

  return (
    <div className="w-full bg-slate-950/80 rounded-2xl border border-slate-800 p-2 sm:p-4 flex flex-col items-center justify-center">
      {renderError ? (
        <span className="text-rose-400 text-xs py-4 font-mono">Ошибка отрисовки: {renderError}</span>
      ) : (
        <div ref={containerRef} className="w-full overflow-x-auto flex justify-center scrollbar-thin scrollbar-thumb-slate-800" />
      )}
    </div>
  );
};
