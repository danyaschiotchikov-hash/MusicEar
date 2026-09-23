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
import {
  HarmonizedStep,
  DetectedHarmonicTurn,
  HarmonizationKey,
} from '../audio/harmonizationEngine';

interface VexFlowHarmonicTurnSnippetProps {
  turn: DetectedHarmonicTurn;
  turnSteps: HarmonizedStep[];
  currentKey: HarmonizationKey;
  activeStepIndex?: number | null;
  onPlayStep?: (globalStepIndex: number) => void;
}

// Convert MIDI pitch to VexFlow key format
function midiToVexKey(midi: number, accidentalType: '#' | 'b' = '#'): string {
  const sharpMap = ['c', 'c#', 'd', 'd#', 'e', 'f', 'f#', 'g', 'g#', 'a', 'a#', 'b'];
  const flatMap = ['c', 'db', 'd', 'eb', 'e', 'f', 'gb', 'g', 'ab', 'a', 'bb', 'b'];
  const map = accidentalType === 'b' ? flatMap : sharpMap;
  const pc = ((midi % 12) + 12) % 12;
  const octave = Math.floor(midi / 12) - 1;
  return `${map[pc]}/${octave}`;
}

// Map key to Vexflow key signature string
function getVexKeySignature(key: HarmonizationKey): string {
  const map: Record<string, string> = {
    C: 'C', G: 'G', D: 'D', A: 'A', F: 'F', Bb: 'Bb', Eb: 'Eb',
    Am: 'Am', Em: 'Em', Dm: 'Dm', Gm: 'Gm', Cm: 'Cm',
  };
  return map[key?.tonic] || 'C';
}

export const VexFlowHarmonicTurnSnippet: React.FC<VexFlowHarmonicTurnSnippetProps> = ({
  turn,
  turnSteps,
  currentKey,
  activeStepIndex,
  onPlayStep,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [renderError, setRenderError] = useState<string | null>(null);

  const vexKey = getVexKeySignature(currentKey);
  const isFlat = currentKey?.accidentalType === 'b';

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Clear previous SVG
    container.innerHTML = '';
    setRenderError(null);

    if (turnSteps.length === 0) return;

    try {
      const stepCount = turnSteps.length;
      // Compact step widths for neat PC rendering
      const stepWidth = Math.max(64, Math.min(88, Math.floor(220 / stepCount)));
      const startX = 54;
      const endPadding = 26;
      const calculatedWidth = Math.max(260, startX + stepCount * stepWidth + endPadding);
      const totalHeight = 240;

      const renderer = new Renderer(container, Renderer.Backends.SVG);
      renderer.resize(calculatedWidth, totalHeight);
      const context = renderer.getContext();

      context.setFont('Bravura, "Academic Music", serif', 11);
      context.setFillStyle('#cbd5e1');
      context.setStrokeStyle('#64748b');

      // Staves: Treble & Bass with increased gap to prevent voice stems from colliding
      const topStaveY = 16;
      const bottomStaveY = 120;
      const staveWidth = calculatedWidth - 16;

      const topStave = new Stave(8, topStaveY, staveWidth);
      topStave.addClef('treble');
      topStave.addKeySignature(vexKey);
      topStave.setDefaultLedgerLineStyle({ strokeStyle: '#e2e8f0', lineWidth: 1.1 });
      topStave.setContext(context).draw();

      const bottomStave = new Stave(8, bottomStaveY, staveWidth);
      bottomStave.addClef('bass');
      bottomStave.addKeySignature(vexKey);
      bottomStave.setDefaultLedgerLineStyle({ strokeStyle: '#e2e8f0', lineWidth: 1.1 });
      bottomStave.setContext(context).draw();

      // Connectors
      const brace = new StaveConnector(topStave, bottomStave);
      brace.setType(StaveConnector.type.BRACE);
      brace.setContext(context).draw();

      const leftLine = new StaveConnector(topStave, bottomStave);
      leftLine.setType(StaveConnector.type.SINGLE_LEFT);
      leftLine.setContext(context).draw();

      const rightLine = new StaveConnector(topStave, bottomStave);
      rightLine.setType(StaveConnector.type.DOUBLE);
      rightLine.setContext(context).draw();

      // SATB notes for snippet with academic stem directions:
      // Soprano (Treble, stem UP), Alto (Treble, stem DOWN)
      // Tenor (Bass, stem UP), Bass (Bass, stem DOWN)
      const sopranoNotes: StaveNote[] = [];
      const altoNotes: StaveNote[] = [];
      const tenorNotes: StaveNote[] = [];
      const bassNotes: StaveNote[] = [];

      turnSteps.forEach((step, relIdx) => {
        const globalIdx = turn.startIndex + relIdx;
        const isActive = activeStepIndex === globalIdx;
        const [bMidi, tMidi, aMidi, sMidi] = step.midisSATB;

        const aKey = midiToVexKey(aMidi, isFlat ? 'b' : '#');
        const sKey = midiToVexKey(sMidi, isFlat ? 'b' : '#');
        const bKey = midiToVexKey(bMidi, isFlat ? 'b' : '#');
        const tKey = midiToVexKey(tMidi, isFlat ? 'b' : '#');

        // Soprano Note (Treble, Quarter, Stem UP)
        const sNote = new StaveNote({
          clef: 'treble',
          keys: [sKey],
          duration: 'q',
          stemDirection: Stem.UP,
        });
        sNote.setLedgerLineStyle({ strokeStyle: '#e2e8f0', lineWidth: 1.1 });

        // Alto Note (Treble, Quarter, Stem DOWN)
        const aNote = new StaveNote({
          clef: 'treble',
          keys: [aKey],
          duration: 'q',
          stemDirection: Stem.DOWN,
        });
        aNote.setLedgerLineStyle({ strokeStyle: '#e2e8f0', lineWidth: 1.1 });

        // Tenor Note (Bass, Quarter, Stem UP)
        const tNote = new StaveNote({
          clef: 'bass',
          keys: [tKey],
          duration: 'q',
          stemDirection: Stem.UP,
        });
        tNote.setLedgerLineStyle({ strokeStyle: '#e2e8f0', lineWidth: 1.1 });

        // Bass Note (Bass, Quarter, Stem DOWN)
        const bNote = new StaveNote({
          clef: 'bass',
          keys: [bKey],
          duration: 'q',
          stemDirection: Stem.DOWN,
        });
        bNote.setLedgerLineStyle({ strokeStyle: '#e2e8f0', lineWidth: 1.1 });

        // Native VexFlow Annotation for chord label under the chord
        const chordAnn = new Annotation(step.chordSymbol);
        chordAnn.setVerticalJustification(Annotation.VerticalJustify.BOTTOM);
        chordAnn.setJustification(Annotation.HorizontalJustify.CENTER);
        chordAnn.setFont({
          family: 'Georgia, "Times New Roman", serif',
          size: 12,
          weight: 'normal',
        });
        chordAnn.setStyle({
          fillStyle: isActive ? '#38bdf8' : '#f8fafc',
          strokeStyle: isActive ? '#38bdf8' : '#f8fafc',
        });
        bNote.addModifier(chordAnn, 0);

        // Active note highlighting
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
      });

      // Voices with 1 beat per quarter note
      const sopranoVoice = new Voice({
        numBeats: stepCount,
        beatValue: 4,
      }).setMode(Voice.Mode.SOFT);
      sopranoVoice.addTickables(sopranoNotes);

      const altoVoice = new Voice({
        numBeats: stepCount,
        beatValue: 4,
      }).setMode(Voice.Mode.SOFT);
      altoVoice.addTickables(altoNotes);

      const tenorVoice = new Voice({
        numBeats: stepCount,
        beatValue: 4,
      }).setMode(Voice.Mode.SOFT);
      tenorVoice.addTickables(tenorNotes);

      const bassVoice = new Voice({
        numBeats: stepCount,
        beatValue: 4,
      }).setMode(Voice.Mode.SOFT);
      bassVoice.addTickables(bassNotes);

      try {
        Accidental.applyAccidentals([sopranoVoice, altoVoice], vexKey);
        Accidental.applyAccidentals([tenorVoice, bassVoice], vexKey);
      } catch {
        // Fallback
      }

      const formatter = new Formatter();
      formatter.joinVoices([sopranoVoice, altoVoice]).joinVoices([tenorVoice, bassVoice]);
      formatter.format([sopranoVoice, altoVoice, tenorVoice, bassVoice], calculatedWidth - startX - endPadding);

      // Align all chord annotations along a uniform horizontal baseline under the chords
      const stemTips = bassNotes.map((n) => {
        const ext = n.getStem()?.getExtents();
        return ext ? ext.topY : (n.getYs()[0] || 0);
      });
      const maxStemTip = Math.max(...stemTips, 0);

      bassNotes.forEach((n, idx) => {
        const diff = (maxStemTip - stemTips[idx]) / 10;
        const mods = n.getModifiers().filter((m) => m instanceof Annotation) as Annotation[];
        mods.forEach((m) => {
          const currentLine = (m as unknown as { textLine: number }).textLine || 0;
          m.setTextLine(currentLine + diff);
        });
      });

      sopranoVoice.draw(context, topStave);
      altoVoice.draw(context, topStave);
      tenorVoice.draw(context, bottomStave);
      bassVoice.draw(context, bottomStave);

      // Render ties for notes that remain in the same voice across consecutive chords
      const ties: StaveTie[] = [];
      for (let i = 0; i < turnSteps.length - 1; i++) {
        const [b1, t1, a1, s1] = turnSteps[i].midisSATB;
        const [b2, t2, a2, s2] = turnSteps[i + 1].midisSATB;

        if (s1 === s2 && sopranoNotes[i] && sopranoNotes[i + 1]) {
          const tie = new StaveTie({
            firstNote: sopranoNotes[i],
            lastNote: sopranoNotes[i + 1],
          });
          tie.setDirection(Stem.DOWN);
          tie.setStyle({ fillStyle: '#93c5fd', strokeStyle: '#93c5fd' });
          ties.push(tie);
        }
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

      ties.forEach((tie) => {
        try {
          tie.setContext(context).draw();
        } catch {
          // Fallback
        }
      });

      // Style SVG with controlled maxWidth to prevent oversized upscale on PC
      const svgEl = container.querySelector('svg');
      if (svgEl) {
        svgEl.style.maxWidth = `${Math.min(calculatedWidth, 310)}px`;
        svgEl.style.width = '100%';
        svgEl.style.height = 'auto';
        svgEl.style.margin = '0 auto';
        svgEl.style.display = 'block';

        svgEl.querySelectorAll('path, rect, line').forEach((node) => {
          const el = node as SVGElement;
          const currentStroke = el.getAttribute('stroke');
          const currentFill = el.getAttribute('fill');
          const isFilled = currentFill && currentFill !== 'none';

          if (isFilled) {
            el.setAttribute('fill', '#f1f5f9');
            el.removeAttribute('stroke');
            el.removeAttribute('stroke-width');
          } else {
            if (currentStroke === '#f8fafc' || currentStroke === '#ffffff') {
              el.setAttribute('stroke', '#cbd5e1');
            } else {
              el.setAttribute('stroke', '#94a3b8');
            }
            el.setAttribute('stroke-width', '0.85');
          }
        });

        svgEl.querySelectorAll('text').forEach((textNode) => {
          if (!textNode.hasAttribute('fill')) {
            textNode.setAttribute('fill', '#f8fafc');
          }
          textNode.style.fontWeight = '400';
        });

        // Draw Measure Bar Lines (тактовые черты) in snippet
        if (turnSteps.length > 0 && bassNotes.length > 0 && svgEl) {
          const barTopY = topStaveY;
          const barBottomY = bottomStaveY + 40;

          for (let i = 1; i < turnSteps.length; i++) {
            const prevStep = turnSteps[i - 1];
            const curStep = turnSteps[i];
            if (curStep.sopranoNote.measure !== prevStep.sopranoNote.measure) {
              const prevX = bassNotes[i - 1].getAbsoluteX();
              const curX = bassNotes[i].getAbsoluteX();
              const barX = (prevX + curX) / 2;

              const lineEl = document.createElementNS('http://www.w3.org/2000/svg', 'line');
              lineEl.setAttribute('x1', barX.toString());
              lineEl.setAttribute('y1', barTopY.toString());
              lineEl.setAttribute('x2', barX.toString());
              lineEl.setAttribute('y2', barBottomY.toString());
              lineEl.setAttribute('stroke', '#cbd5e1');
              lineEl.setAttribute('stroke-width', '1.5');
              svgEl.appendChild(lineEl);
            }
          }
        }
      }
    } catch (err: unknown) {
      console.error('VexFlow snippet error:', err);
      setRenderError(err instanceof Error ? err.message : String(err));
    }
  }, [turn, turnSteps, currentKey, vexKey, isFlat, activeStepIndex]);

  return (
    <div className="w-full bg-slate-950/90 border border-slate-800/80 rounded-xl p-2 flex flex-col gap-1.5">
      {renderError && (
        <div className="p-2 bg-red-950/50 border border-red-800 text-[11px] text-red-300 rounded">
          {renderError}
        </div>
      )}

      {/* VexFlow Snippet Canvas (constrained and centered on desktop) */}
      <div
        ref={containerRef}
        className="w-full overflow-x-auto flex justify-center scrollbar-none py-0.5"
      />

      {/* Step Chords Clickable Buttons */}
      <div className="flex items-center justify-center gap-1 pt-1 border-t border-slate-800/60">
        {turnSteps.map((step, relIdx) => {
          const globalIdx = turn.startIndex + relIdx;
          const isActive = activeStepIndex === globalIdx;

          return (
            <button
              key={`turn-step-btn-${globalIdx}`}
              type="button"
              onClick={() => onPlayStep?.(globalIdx)}
              className={`px-2 py-0.5 rounded-md border text-[11px] font-mono transition cursor-pointer flex items-center gap-1 ${
                isActive
                  ? 'bg-sky-500 text-white border-sky-400 font-bold shadow-sm shadow-sky-950'
                  : 'bg-slate-900 border-slate-700/80 text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
              title={`Такт ${globalIdx + 1}: ${step.chordNameRu} (${step.degreeRoman})`}
            >
              <span className="text-[9px] text-slate-400">#{globalIdx + 1}</span>
              <strong className="font-serif">{step.chordSymbol}</strong>
            </button>
          );
        })}
      </div>
    </div>
  );
};
