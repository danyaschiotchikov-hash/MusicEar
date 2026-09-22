import React, { useEffect, useRef, useState } from 'react';
import {
  Renderer,
  Stave,
  StaveNote,
  Voice,
  Formatter,
  StaveConnector,
  Accidental,
  Annotation,
  Stem,
  StaveTie,
} from 'vexflow';
import { RealizedProgression, identifyChordSeventh } from '../audio/harmonicProgressions';

interface ProgressionGrandStaffProps {
  progression: RealizedProgression;
  activeStepIndex?: number | null;
  onPlayStep?: (stepIndex: number) => void;
  showOnlySoprano?: boolean;
  userStepSymbols?: string[];
}

const FLAT_KEYS = new Set([
  'F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb',
  'Dm', 'Gm', 'Cm', 'Fm', 'Bbm', 'Ebm',
]);

function getVexKeyFromProgression(tonic: string, scaleMode: 'major' | 'minor'): string {
  let root = (tonic || 'C').trim();
  if (root === 'H') root = 'B';
  else if (root === 'B') root = 'Bb';
  else if (root.toLowerCase() === 'fis' || root === 'Fis') root = 'F#';
  else if (root.toLowerCase() === 'cis' || root === 'Cis') root = 'C#';
  else if (root.toLowerCase() === 'gis' || root === 'Gis') root = 'G#';
  else if (root.toLowerCase() === 'dis' || root === 'Dis') root = 'D#';
  else if (root.toLowerCase() === 'ais' || root === 'Ais') root = 'A#';
  else if (root.toLowerCase() === 'es' || root === 'Es') root = 'Eb';
  else if (root.toLowerCase() === 'as' || root === 'As') root = 'Ab';
  else if (root.toLowerCase() === 'des' || root === 'Des') root = 'Db';
  else if (root.toLowerCase() === 'ges' || root === 'Ges') root = 'Gb';

  let clean = root.charAt(0).toUpperCase();
  if (root.length > 1) {
    clean += root.slice(1);
  }

  const validVexMajor = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb'];
  const validVexMinor = ['Am', 'Em', 'Bm', 'F#m', 'C#m', 'G#m', 'Dm', 'Gm', 'Cm', 'Fm', 'Bbm', 'Ebm'];

  if (scaleMode === 'minor') {
    const candidate = `${clean}m`;
    return validVexMinor.includes(candidate) ? candidate : 'Am';
  }
  return validVexMajor.includes(clean) ? clean : 'C';
}

function midiToVexKey(midi: number, isFlat: boolean): string {
  const sharpMap = ['c', 'c#', 'd', 'd#', 'e', 'f', 'f#', 'g', 'g#', 'a', 'a#', 'b'];
  const flatMap = ['c', 'db', 'd', 'eb', 'e', 'f', 'gb', 'g', 'ab', 'a', 'bb', 'b'];
  const map = isFlat ? flatMap : sharpMap;
  const pc = ((midi % 12) + 12) % 12;
  const octave = Math.floor(midi / 12) - 1;
  const noteName = map[pc];
  return `${noteName}/${octave}`;
}

export const ProgressionGrandStaff: React.FC<ProgressionGrandStaffProps> = React.memo(({
  progression,
  activeStepIndex,
  onPlayStep,
  showOnlySoprano = false,
  userStepSymbols,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [renderError, setRenderError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'vexflow' | 'voices'>('vexflow');

  const steps = progression?.steps || [];
  const vexKey = getVexKeyFromProgression(progression.tonicNoteName, progression.scaleMode);
  const isFlat = FLAT_KEYS.has(vexKey);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.innerHTML = '';
    setRenderError(null);

    if (steps.length === 0) return;

    try {
      const stepsCount = steps.length;
      const stepWidth = Math.max(62, Math.min(88, Math.floor(340 / stepsCount)));
      const startX = 58;
      const endPadding = 24;
      const calculatedWidth = Math.max(330, startX + stepsCount * stepWidth + endPadding);
      const totalHeight = 195;

      const renderer = new Renderer(container, Renderer.Backends.SVG);
      renderer.resize(calculatedWidth, totalHeight);
      const context = renderer.getContext();

      context.setFont('Bravura, "Academic Music", serif', 11);
      context.setFillStyle('#cbd5e1');
      context.setStrokeStyle('#64748b');

      const topStaveY = 12;
      const bottomStaveY = 98;
      const staveWidth = calculatedWidth - 18;

      const topStave = new Stave(8, topStaveY, staveWidth);
      topStave.addClef('treble');
      topStave.addKeySignature(vexKey);
      topStave.setDefaultLedgerLineStyle({ strokeStyle: '#f8fafc', lineWidth: 1.2 });
      topStave.setContext(context).draw();

      const bottomStave = new Stave(8, bottomStaveY, staveWidth);
      bottomStave.addClef('bass');
      bottomStave.addKeySignature(vexKey);
      bottomStave.setDefaultLedgerLineStyle({ strokeStyle: '#f8fafc', lineWidth: 1.2 });
      bottomStave.setContext(context).draw();

      const brace = new StaveConnector(topStave, bottomStave);
      brace.setType(StaveConnector.type.BRACE);
      brace.setContext(context).draw();

      const leftLine = new StaveConnector(topStave, bottomStave);
      leftLine.setType(StaveConnector.type.SINGLE_LEFT);
      leftLine.setContext(context).draw();

      const rightLine = new StaveConnector(topStave, bottomStave);
      rightLine.setType(StaveConnector.type.DOUBLE);
      rightLine.setContext(context).draw();

      const sopranoNotes: StaveNote[] = [];
      const altoNotes: StaveNote[] = [];
      const tenorNotes: StaveNote[] = [];
      const bassNotes: StaveNote[] = [];

      steps.forEach((step, idx) => {
        const [bMidi, tMidi, aMidi, sMidi] = step.midisSATB;
        const isActive = activeStepIndex === idx;

        const nextStep = steps[idx + 1];
        const seventhInfo = !showOnlySoprano
          ? identifyChordSeventh(step.symbol, step.midisSATB, nextStep ? nextStep.midisSATB : undefined)
          : null;

        const sKey = midiToVexKey(sMidi, isFlat);
        const sNote = new StaveNote({
          clef: 'treble',
          keys: [sKey],
          duration: 'q',
          stemDirection: Stem.UP,
        });
        sNote.setLedgerLineStyle({ strokeStyle: '#f8fafc', lineWidth: 1.6 });

        if (showOnlySoprano) {
          const bRest = new StaveNote({
            clef: 'bass',
            keys: ['d/3'],
            duration: 'qr',
          });

          const chordLabel = userStepSymbols?.[idx] || '?';
          const chordAnnot = new Annotation(chordLabel);
          chordAnnot.setVerticalJustification(Annotation.VerticalJustify.BOTTOM);
          chordAnnot.setFont({ family: 'serif', size: 10, weight: 'bold' });
          bRest.addModifier(chordAnnot, 0);

          if (isActive) {
            sNote.setStyle({ fillStyle: '#38bdf8', strokeStyle: '#38bdf8' });
            bRest.setStyle({ fillStyle: '#38bdf8', strokeStyle: '#38bdf8' });
          }

          sopranoNotes.push(sNote);
          bassNotes.push(bRest);
        } else {
          const aKey = midiToVexKey(aMidi, isFlat);
          const tKey = midiToVexKey(tMidi, isFlat);
          const bKey = midiToVexKey(bMidi, isFlat);

          const aNote = new StaveNote({
            clef: 'treble',
            keys: [aKey],
            duration: 'q',
            stemDirection: Stem.DOWN,
          });
          aNote.setLedgerLineStyle({ strokeStyle: '#f8fafc', lineWidth: 1.6 });

          const tNote = new StaveNote({
            clef: 'bass',
            keys: [tKey],
            duration: 'q',
            stemDirection: Stem.UP,
          });
          tNote.setLedgerLineStyle({ strokeStyle: '#f8fafc', lineWidth: 1.6 });

          const bNote = new StaveNote({
            clef: 'bass',
            keys: [bKey],
            duration: 'q',
            stemDirection: Stem.DOWN,
          });
          bNote.setLedgerLineStyle({ strokeStyle: '#f8fafc', lineWidth: 1.6 });

          const chordAnnot = new Annotation(step.symbol);
          chordAnnot.setVerticalJustification(Annotation.VerticalJustify.BOTTOM);
          chordAnnot.setFont({ family: 'serif', size: 10, weight: 'bold' });
          bNote.addModifier(chordAnnot, 0);

          if (seventhInfo) {
            const badgeText = seventhInfo.resolution
              ? `7${seventhInfo.resolution.arrowSymbol}`
              : '7';
            const seventhAnnot = new Annotation(badgeText);
            seventhAnnot.setVerticalJustification(Annotation.VerticalJustify.TOP);
            seventhAnnot.setFont({ family: 'monospace', size: 8.5, weight: 'bold' });

            if (seventhInfo.voiceIndex === 3) {
              sNote.addModifier(seventhAnnot, 0);
            } else if (seventhInfo.voiceIndex === 2) {
              aNote.addModifier(seventhAnnot, 0);
            } else if (seventhInfo.voiceIndex === 1) {
              tNote.addModifier(seventhAnnot, 0);
            } else {
              bNote.addModifier(seventhAnnot, 0);
            }
          }

          if (isActive) {
            const activeStyle = { fillStyle: '#38bdf8', strokeStyle: '#38bdf8' };
            sNote.setStyle(activeStyle);
            aNote.setStyle(activeStyle);
            tNote.setStyle(activeStyle);
            bNote.setStyle(activeStyle);
          }

          sopranoNotes.push(sNote);
          altoNotes.push(aNote);
          tenorNotes.push(tNote);
          bassNotes.push(bNote);
        }
      });

      const sopranoVoice = new Voice({
        numBeats: stepsCount,
        beatValue: 4,
      }).setMode(Voice.Mode.SOFT);
      sopranoVoice.addTickables(sopranoNotes);

      const bassVoice = new Voice({
        numBeats: stepsCount,
        beatValue: 4,
      }).setMode(Voice.Mode.SOFT);
      bassVoice.addTickables(bassNotes);

      let altoVoice: Voice | null = null;
      let tenorVoice: Voice | null = null;

      if (!showOnlySoprano) {
        altoVoice = new Voice({
          numBeats: stepsCount,
          beatValue: 4,
        }).setMode(Voice.Mode.SOFT);
        altoVoice.addTickables(altoNotes);

        tenorVoice = new Voice({
          numBeats: stepsCount,
          beatValue: 4,
        }).setMode(Voice.Mode.SOFT);
        tenorVoice.addTickables(tenorNotes);
      }

      try {
        if (showOnlySoprano) {
          Accidental.applyAccidentals([sopranoVoice], vexKey);
          Accidental.applyAccidentals([bassVoice], vexKey);
        } else if (altoVoice && tenorVoice) {
          Accidental.applyAccidentals([sopranoVoice, altoVoice], vexKey);
          Accidental.applyAccidentals([tenorVoice, bassVoice], vexKey);
        }
      } catch {
        // Fallback
      }

      const formatter = new Formatter();
      if (showOnlySoprano) {
        formatter.joinVoices([sopranoVoice]).joinVoices([bassVoice]);
        formatter.format([sopranoVoice, bassVoice], calculatedWidth - startX - endPadding);
        sopranoVoice.draw(context, topStave);
        bassVoice.draw(context, bottomStave);
      } else if (altoVoice && tenorVoice) {
        formatter.joinVoices([sopranoVoice, altoVoice]).joinVoices([tenorVoice, bassVoice]);
        formatter.format([sopranoVoice, altoVoice, tenorVoice, bassVoice], calculatedWidth - startX - endPadding);
        sopranoVoice.draw(context, topStave);
        altoVoice.draw(context, topStave);
        tenorVoice.draw(context, bottomStave);
        bassVoice.draw(context, bottomStave);
      }

      const ties: StaveTie[] = [];
      for (let i = 0; i < steps.length - 1; i++) {
        const curStep = steps[i];
        const nextStep = steps[i + 1];
        const [b1, t1, a1, s1] = curStep.midisSATB;
        const [b2, t2, a2, s2] = nextStep.midisSATB;

        if (s1 === s2 && sopranoNotes[i] && sopranoNotes[i + 1]) {
          const tie = new StaveTie({
            firstNote: sopranoNotes[i],
            lastNote: sopranoNotes[i + 1],
          });
          tie.setDirection(Stem.DOWN);
          tie.setStyle({ fillStyle: '#93c5fd', strokeStyle: '#93c5fd' });
          ties.push(tie);
        }

        if (!showOnlySoprano) {
          if (a1 === a2 && altoNotes[i] && altoNotes[i + 1]) {
            const tie = new StaveTie({
              firstNote: altoNotes[i],
              lastNote: altoNotes[i + 1],
            });
            tie.setDirection(Stem.DOWN);
            tie.setStyle({ fillStyle: '#93c5fd', strokeStyle: '#93c5fd' });
            ties.push(tie);
          }

          if (t1 === t2 && tenorNotes[i] && tenorNotes[i + 1]) {
            const tie = new StaveTie({
              firstNote: tenorNotes[i],
              lastNote: tenorNotes[i + 1],
            });
            tie.setDirection(Stem.UP);
            tie.setStyle({ fillStyle: '#93c5fd', strokeStyle: '#93c5fd' });
            ties.push(tie);
          }

          if (b1 === b2 && bassNotes[i] && bassNotes[i + 1]) {
            const tie = new StaveTie({
              firstNote: bassNotes[i],
              lastNote: bassNotes[i + 1],
            });
            tie.setDirection(Stem.UP);
            tie.setStyle({ fillStyle: '#93c5fd', strokeStyle: '#93c5fd' });
            ties.push(tie);
          }
        }
      }

      ties.forEach((tie) => {
        try {
          tie.setContext(context).draw();
        } catch {
          // Graceful fallback
        }
      });

      const svgEl = container.querySelector('svg');
      if (svgEl) {
        svgEl.style.maxWidth = `${Math.min(calculatedWidth, 420)}px`;
        svgEl.style.width = '100%';
        svgEl.style.height = 'auto';
        svgEl.style.margin = '0 auto';
        svgEl.style.display = 'block';

        svgEl.querySelectorAll('path, rect, line').forEach((node) => {
          const el = node as SVGElement;
          const currentStroke = el.getAttribute('stroke');
          const currentFill = el.getAttribute('fill');

          if (currentStroke === '#f8fafc' || currentStroke === '#ffffff') {
            el.setAttribute('stroke', '#ffffff');
            el.setAttribute('stroke-width', '1.2');
            el.setAttribute('stroke-linecap', 'round');
          } else if (currentStroke === '#000000' || currentStroke === 'black' || !currentStroke) {
            el.setAttribute('stroke', '#cbd5e1');
            el.setAttribute('stroke-width', '1.1');
          } else if (currentStroke === '#64748b') {
            el.setAttribute('stroke', '#94a3b8');
            el.setAttribute('stroke-width', '1.1');
          }

          if (currentFill === '#000000' || currentFill === 'black') {
            el.setAttribute('fill', '#f1f5f9');
          }
        });

        svgEl.querySelectorAll('text').forEach((textNode) => {
          textNode.setAttribute('fill', '#e2e8f0');
          textNode.style.fontWeight = '500';
        });
      }
    } catch (err: unknown) {
      console.error('VexFlow Progression rendering error:', err);
      setRenderError(err instanceof Error ? err.message : String(err));
    }
  }, [progression, steps, activeStepIndex, showOnlySoprano, userStepSymbols, vexKey, isFlat]);

  return (
    <div className="w-full bg-slate-950/70 border border-slate-800/80 rounded-xl p-2 sm:p-2.5 shadow-sm select-none flex flex-col items-center">
      {/* Ultra Compact Info Header */}
      <div className="w-full flex items-center justify-between gap-2 pb-1.5 mb-1 border-b border-slate-800/60 text-[11px]">
        <div className="flex items-center gap-2">
          <span className="text-slate-300 font-semibold flex items-center gap-1">
            <span>Тональность:</span>
            <strong className="text-amber-300 font-mono font-bold">{progression.keyNameRu}</strong>
          </span>
          {showOnlySoprano && (
            <span className="px-1.5 py-0.2 bg-rose-950/70 border border-rose-500/40 text-rose-300 text-[9px] rounded font-bold">
              Сопрано
            </span>
          )}
        </div>

        {/* View Toggle */}
        <div className="flex items-center bg-slate-900 p-0.5 rounded-md border border-slate-800 text-[10px]">
          <button
            type="button"
            onClick={() => setViewMode('vexflow')}
            className={`px-2 py-0.5 rounded font-medium transition cursor-pointer ${
              viewMode === 'vexflow'
                ? 'bg-indigo-600 text-white font-bold shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Ноты
          </button>
          <button
            type="button"
            onClick={() => setViewMode('voices')}
            className={`px-2 py-0.5 rounded font-medium transition cursor-pointer ${
              viewMode === 'voices'
                ? 'bg-indigo-600 text-white font-bold shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            САТБ
          </button>
        </div>
      </div>

      {renderError && (
        <div className="w-full p-2 mb-1 bg-red-950/40 border border-red-800/50 rounded-lg text-[11px] text-red-300">
          Ошибка отрисовки: {renderError}
        </div>
      )}

      {/* View 1: Compact VexFlow Score */}
      {viewMode === 'vexflow' ? (
        <div className="w-full flex justify-center py-0.5 overflow-x-auto">
          <div ref={containerRef} className="w-full flex justify-center" />
        </div>
      ) : (
        /* View 2: Compact Voices Matrix */
        <div className="w-full my-1 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-1.5">
          {steps.map((step, idx) => {
            const isActive = activeStepIndex === idx;
            const [bName, tName, aName, sName] = step.noteNamesSATB;

            return (
              <div
                key={`voice-box-${idx}`}
                onClick={() => onPlayStep?.(idx)}
                className={`p-1.5 rounded-lg border flex flex-col gap-0.5 transition cursor-pointer text-[10px] ${
                  isActive
                    ? 'bg-sky-950/80 border-sky-400 ring-1 ring-sky-400/50'
                    : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex justify-between items-center pb-0.5 border-b border-slate-800/80 font-mono">
                  <span className="text-slate-500">#{idx + 1}</span>
                  <span className="font-bold text-white text-xs">{step.symbol}</span>
                </div>
                <div className="flex justify-between text-rose-300 font-bold pt-0.5">
                  <span>S:</span> <span>{sName}</span>
                </div>
                {!showOnlySoprano && (
                  <>
                    <div className="flex justify-between text-amber-300">
                      <span>A:</span> <span>{aName}</span>
                    </div>
                    <div className="flex justify-between text-emerald-300">
                      <span>T:</span> <span>{tName}</span>
                    </div>
                    <div className="flex justify-between text-purple-300 font-bold">
                      <span>B:</span> <span>{bName}</span>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Subtle compact voice color indicators */}
      <div className="w-full flex items-center justify-center gap-3 pt-1 border-t border-slate-800/50 text-[9px] text-slate-400 font-medium">
        <span className="text-rose-400">● S (Сопрано)</span>
        {!showOnlySoprano && (
          <>
            <span className="text-amber-400">● A (Альт)</span>
            <span className="text-emerald-400">● T (Тенор)</span>
            <span className="text-purple-400">● B (Бас)</span>
            <span className="text-amber-300 font-mono">7↓ септима</span>
          </>
        )}
      </div>
    </div>
  );
});
