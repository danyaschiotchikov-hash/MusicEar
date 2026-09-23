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
  Dot,
  Stem,
  StaveTie,
} from 'vexflow';
import {
  HarmonizedStep,
  DetectedHarmonicTurn,
  HarmonizationKey,
} from '../audio/harmonizationEngine';

interface VexFlowHarmonizationStaffProps {
  steps: HarmonizedStep[];
  detectedTurns: DetectedHarmonicTurn[];
  currentKey: HarmonizationKey;
  meter?: string;
  activeStepIndex?: number | null;
  onSelectStep?: (index: number) => void;
  showTurnBrackets?: boolean;
  onlySoprano?: boolean;
  userChords?: string[];
}

// Convert MIDI pitch to VexFlow key format: 'c/4', 'f#/4', 'bb/4'
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

// Map key to Vexflow key signature string
function getVexKeySignature(key: HarmonizationKey): string {
  const map: Record<string, string> = {
    C: 'C', G: 'G', D: 'D', A: 'A', F: 'F', Bb: 'Bb', Eb: 'Eb',
    Am: 'Am', Em: 'Em', Dm: 'Dm', Gm: 'Gm', Cm: 'Cm',
  };
  return map[key.tonic] || 'C';
}

export const VexFlowHarmonizationStaff: React.FC<VexFlowHarmonizationStaffProps> = React.memo(({
  steps,
  detectedTurns,
  currentKey,
  meter = '4/4',
  activeStepIndex,
  onSelectStep,
  showTurnBrackets = true,
  onlySoprano = false,
  userChords = [],
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [renderError, setRenderError] = useState<string | null>(null);
  const [stepXCoords, setStepXCoords] = useState<number[]>([]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Clear previous SVG
    container.innerHTML = '';
    setRenderError(null);

    const noteCount = steps.length;
    const stepWidth = 92;
    const startX = 65;
    const endPadding = 45;
    const calculatedWidth = Math.max(680, startX + Math.max(noteCount, 4) * stepWidth + endPadding);
    const totalHeight = 340;

    try {
      const renderer = new Renderer(container, Renderer.Backends.SVG);
      renderer.resize(calculatedWidth, totalHeight);
      const context = renderer.getContext();

      // Configure high-contrast styling for dark theme
      context.setFont('Bravura, "Academic Music", serif', 14);
      context.setFillStyle('#cbd5e1'); // light slate
      context.setStrokeStyle('#64748b'); // medium slate

      // 1. Create Staves: Treble (top) and Bass (bottom) with generous vertical spacing
      // to eliminate stem overlaps between Alto (down) and Tenor (up)
      const topStaveY = 32;
      const bottomStaveY = 176;
      const staveWidth = calculatedWidth - 30;

      const topStave = new Stave(15, topStaveY, staveWidth);
      topStave.addClef('treble');
      topStave.addKeySignature(getVexKeySignature(currentKey));
      topStave.addTimeSignature(meter);
      topStave.setDefaultLedgerLineStyle({ strokeStyle: '#e2e8f0', lineWidth: 1.2 });
      topStave.setContext(context).draw();

      const bottomStave = new Stave(15, bottomStaveY, staveWidth);
      bottomStave.addClef('bass');
      bottomStave.addKeySignature(getVexKeySignature(currentKey));
      bottomStave.addTimeSignature(meter);
      bottomStave.setDefaultLedgerLineStyle({ strokeStyle: '#e2e8f0', lineWidth: 1.2 });
      bottomStave.setContext(context).draw();

      // Connect staves with Grand Staff brace and line connectors
      const brace = new StaveConnector(topStave, bottomStave);
      brace.setType(StaveConnector.type.BRACE);
      brace.setContext(context).draw();

      const leftLine = new StaveConnector(topStave, bottomStave);
      leftLine.setType(StaveConnector.type.SINGLE_LEFT);
      leftLine.setContext(context).draw();

      const rightLine = new StaveConnector(topStave, bottomStave);
      rightLine.setType(StaveConnector.type.SINGLE_RIGHT);
      rightLine.setContext(context).draw();

      // Note arrays for SATB voices
      const sopranoNotes: StaveNote[] = [];
      const altoNotes: StaveNote[] = [];
      const tenorNotes: StaveNote[] = [];
      const bassNotes: StaveNote[] = [];

      if (steps.length > 0) {
        // 2. Build Vexflow StaveNotes with academic voice stem directions:
        // Soprano (Treble, stem UP), Alto (Treble, stem DOWN)
        // Tenor (Bass, stem UP), Bass (Bass, stem DOWN)

        steps.forEach((step, idx) => {
          const [bMidi, tMidi, aMidi, sMidi] = step.midisSATB;

          // Treble: Alto + Soprano
          const altoInfo = midiToVexKey(aMidi, currentKey.accidentalType);
          const sopranoInfo = midiToVexKey(sMidi, currentKey.accidentalType);

          // Bass: Bass + Tenor
          const bassInfo = midiToVexKey(bMidi, currentKey.accidentalType);
          const tenorInfo = midiToVexKey(tMidi, currentKey.accidentalType);

          // Default to quarter note 'q' for optimal legibility
          const durationStr = step.sopranoNote.duration || 'q';

          // Soprano: Treble Clef, Stem UP
          const sNote = new StaveNote({
            clef: 'treble',
            keys: [sopranoInfo.key],
            duration: durationStr,
            stemDirection: Stem.UP,
          });
          sNote.setLedgerLineStyle({ strokeStyle: '#e2e8f0', lineWidth: 1.1 });

          // Alto: Treble Clef, Stem DOWN
          const aNote = new StaveNote({
            clef: 'treble',
            keys: [onlySoprano ? 'b/4' : altoInfo.key],
            duration: onlySoprano ? (durationStr + 'r') : durationStr,
            stemDirection: Stem.DOWN,
          });
          aNote.setLedgerLineStyle({ strokeStyle: '#e2e8f0', lineWidth: 1.1 });

          // Tenor: Bass Clef, Stem UP
          const tNote = new StaveNote({
            clef: 'bass',
            keys: [onlySoprano ? 'd/3' : tenorInfo.key],
            duration: onlySoprano ? (durationStr + 'r') : durationStr,
            stemDirection: Stem.UP,
          });
          tNote.setLedgerLineStyle({ strokeStyle: '#e2e8f0', lineWidth: 1.1 });

          // Bass: Bass Clef, Stem DOWN
          const bNote = new StaveNote({
            clef: 'bass',
            keys: [onlySoprano ? 'd/3' : bassInfo.key],
            duration: onlySoprano ? (durationStr + 'r') : durationStr,
            stemDirection: Stem.DOWN,
          });
          bNote.setLedgerLineStyle({ strokeStyle: '#e2e8f0', lineWidth: 1.1 });

          // Add accidentals if any
          if (sopranoInfo.accidental) {
            sNote.addModifier(new Accidental(sopranoInfo.accidental), 0);
          }
          if (!onlySoprano && altoInfo.accidental) {
            aNote.addModifier(new Accidental(altoInfo.accidental), 0);
          }
          if (!onlySoprano && tenorInfo.accidental) {
            tNote.addModifier(new Accidental(tenorInfo.accidental), 0);
          }
          if (!onlySoprano && bassInfo.accidental) {
            bNote.addModifier(new Accidental(bassInfo.accidental), 0);
          }

          // Dots if dotted note
          if (step.sopranoNote.isDotted) {
            try {
              Dot.buildAndAttach([sNote, aNote, tNote, bNote], { all: true });
            } catch {
              // Safe fallback
            }
          }

          // Highlight active step
          if (activeStepIndex === idx) {
            const activeStyle = { fillStyle: '#38bdf8', strokeStyle: '#38bdf8' }; // bright sky blue
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

        // 3. Format and render 4 polyphonic SATB voices
        let totalBeats = 0;
        steps.forEach((step) => {
          totalBeats += step.sopranoNote.durationBeats;
        });

        const sopranoVoice = new Voice({
          numBeats: totalBeats || 4,
          beatValue: 4,
        }).setMode(Voice.Mode.SOFT);
        sopranoVoice.addTickables(sopranoNotes);

        const altoVoice = new Voice({
          numBeats: totalBeats || 4,
          beatValue: 4,
        }).setMode(Voice.Mode.SOFT);
        altoVoice.addTickables(altoNotes);

        const tenorVoice = new Voice({
          numBeats: totalBeats || 4,
          beatValue: 4,
        }).setMode(Voice.Mode.SOFT);
        tenorVoice.addTickables(tenorNotes);

        const bassVoice = new Voice({
          numBeats: totalBeats || 4,
          beatValue: 4,
        }).setMode(Voice.Mode.SOFT);
        bassVoice.addTickables(bassNotes);

        const formatter = new Formatter();
        formatter.joinVoices([sopranoVoice, altoVoice]).joinVoices([tenorVoice, bassVoice]);
        formatter.format([sopranoVoice, altoVoice, tenorVoice, bassVoice], calculatedWidth - startX - endPadding);

        sopranoVoice.draw(context, topStave);
        altoVoice.draw(context, topStave);
        tenorVoice.draw(context, bottomStave);
        bassVoice.draw(context, bottomStave);

        // 4. Render ties for notes that remain in the same voice across consecutive chords
        const ties: StaveTie[] = [];
        for (let i = 0; i < steps.length - 1; i++) {
          const [b1, t1, a1, s1] = steps[i].midisSATB;
          const [b2, t2, a2, s2] = steps[i + 1].midisSATB;

          // Soprano: stationary note tie
          if (s1 === s2 && sopranoNotes[i] && sopranoNotes[i + 1]) {
            const tie = new StaveTie({
              firstNote: sopranoNotes[i],
              lastNote: sopranoNotes[i + 1],
            });
            tie.setDirection(Stem.DOWN);
            tie.setStyle({ fillStyle: '#93c5fd', strokeStyle: '#93c5fd' });
            ties.push(tie);
          }

          // Alto: stationary note tie
          if (a1 === a2 && altoNotes[i] && altoNotes[i + 1]) {
            const tie = new StaveTie({
              firstNote: altoNotes[i],
              lastNote: altoNotes[i + 1],
            });
            tie.setDirection(Stem.DOWN);
            tie.setStyle({ fillStyle: '#93c5fd', strokeStyle: '#93c5fd' });
            ties.push(tie);
          }

          // Tenor: stationary note tie
          if (t1 === t2 && tenorNotes[i] && tenorNotes[i + 1]) {
            const tie = new StaveTie({
              firstNote: tenorNotes[i],
              lastNote: tenorNotes[i + 1],
            });
            tie.setDirection(Stem.UP);
            tie.setStyle({ fillStyle: '#93c5fd', strokeStyle: '#93c5fd' });
            ties.push(tie);
          }

          // Bass: stationary note tie
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
      }

      // 5. Adjust SVG styling: refine stroke colors, line weights, and text crispness
      const svgEl = container.querySelector('svg');
      if (svgEl) {
        svgEl.style.width = '100%';
        svgEl.style.height = 'auto';
        svgEl.style.display = 'block';

        // Apply clean slate colors and non-bold stroke weights to SVG paths
        svgEl.querySelectorAll('path, rect, line').forEach((node) => {
          const el = node as SVGElement;
          const currentStroke = el.getAttribute('stroke');
          const currentFill = el.getAttribute('fill');
          const isFilled = currentFill && currentFill !== 'none';

          if (isFilled) {
            // Pure fill for noteheads and symbols with NO artificial outline stroke
            el.setAttribute('fill', '#f1f5f9');
            el.removeAttribute('stroke');
            el.removeAttribute('stroke-width');
          } else {
            // Stave lines, stems, barlines: crisp, thin classical lines
            if (currentStroke === '#f8fafc' || currentStroke === '#ffffff') {
              el.setAttribute('stroke', '#cbd5e1');
            } else {
              el.setAttribute('stroke', '#94a3b8');
            }
            el.setAttribute('stroke-width', '0.85');
          }
        });

        // Ensure text elements (clefs, time signatures, barlines) are elegant and not overly bold
        svgEl.querySelectorAll('text').forEach((textNode) => {
          textNode.setAttribute('fill', '#f8fafc');
          textNode.style.fontWeight = '400';
        });

        // 6. Draw Chord Signatures aligned on a single straight horizontal baseline
        steps.forEach((step, idx) => {
          const bNote = bassNotes[idx];
          if (bNote && svgEl) {
            const x = bNote.getAbsoluteX();
            const isActive = activeStepIndex === idx;
            const displaySymbol = onlySoprano ? (userChords[idx] || '?') : step.chordSymbol;

            const textEl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            textEl.setAttribute('x', x.toString());
            textEl.setAttribute('y', '292'); // Single fixed baseline Y for all chord signatures
            textEl.setAttribute('text-anchor', 'middle');
            
            let color = '#f8fafc';
            if (isActive) {
              color = '#38bdf8'; // active sky blue
            } else if (onlySoprano) {
              color = userChords[idx] ? '#fbbf24' : '#64748b'; // amber if customized, slate if empty
            }
            textEl.setAttribute('fill', color);
            textEl.setAttribute('font-family', 'Georgia, "Times New Roman", serif');
            textEl.setAttribute('font-size', '13px');
            textEl.style.fontWeight = '500';
            textEl.textContent = displaySymbol;
            svgEl.appendChild(textEl);
          }
        });

        // 7. Draw Measure Bar Lines (тактовые черты) and Final Double Bar Line across the Grand Staff
        if (steps.length > 0 && bassNotes.length > 0 && svgEl) {
          const barTopY = topStaveY;
          const barBottomY = bottomStaveY + 40;

          for (let i = 1; i < steps.length; i++) {
            const prevStep = steps[i - 1];
            const curStep = steps[i];
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

          // End double bar line
          const lastX = bassNotes[bassNotes.length - 1].getAbsoluteX() + 35;
          const endLine1 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
          endLine1.setAttribute('x1', lastX.toString());
          endLine1.setAttribute('y1', barTopY.toString());
          endLine1.setAttribute('x2', lastX.toString());
          endLine1.setAttribute('y2', barBottomY.toString());
          endLine1.setAttribute('stroke', '#cbd5e1');
          endLine1.setAttribute('stroke-width', '1.2');
          svgEl.appendChild(endLine1);

          const endLine2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
          endLine2.setAttribute('x1', (lastX + 4).toString());
          endLine2.setAttribute('y1', barTopY.toString());
          endLine2.setAttribute('x2', (lastX + 4).toString());
          endLine2.setAttribute('y2', barBottomY.toString());
          endLine2.setAttribute('stroke', '#f8fafc');
          endLine2.setAttribute('stroke-width', '3');
          svgEl.appendChild(endLine2);
        }

        // Extract note coordinates for smooth highlight animation
        const coords = bassNotes.map((n) => n.getAbsoluteX());
        setStepXCoords(coords);
      }
    } catch (err: unknown) {
      console.error('VexFlow rendering error:', err);
      setRenderError(err instanceof Error ? err.message : String(err));
    }
  }, [steps, detectedTurns, currentKey, meter, activeStepIndex]);

  return (
    <div className="w-full flex flex-col items-center select-none">
      {/* VexFlow Score Card Container */}
      <div className="w-full bg-[#0b0f19] border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-2xl overflow-x-auto relative scrollbar-thin scrollbar-thumb-slate-700">
        {/* Header Badges */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-2 border-b border-slate-800/80 text-xs">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-indigo-950/70 border border-indigo-500/40 text-indigo-300 font-bold tracking-wide">
              VexFlow Grand Staff (SATB)
            </span>
            <span className="text-slate-400">
              Тональность: <strong className="text-amber-300">{currentKey.keyNameRu}</strong>
            </span>
            <span className="text-slate-400">
              Размер: <strong className="text-slate-200">{meter}</strong>
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-rose-500 mr-0.5" /> Сопрано
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-500 ml-1.5 mr-0.5" /> Альт
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 ml-1.5 mr-0.5" /> Тенор
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-purple-500 ml-1.5 mr-0.5" /> Бас
          </div>
        </div>

        {/* Render Error Alert */}
        {renderError && (
          <div className="p-3 mb-3 bg-red-950/40 border border-red-800/50 rounded-lg text-xs text-red-300">
            Ошибка отрисовки нот: {renderError}
          </div>
        )}

        {/* VexFlow SVG Container */}
        <div className="min-w-[640px] flex justify-center py-2 relative">
          <div
            ref={containerRef}
            className="relative"
          />
          {/* Smooth Highlight Cursor Overlay */}
          {activeStepIndex !== null && activeStepIndex !== undefined && stepXCoords[activeStepIndex] !== undefined && (
            <div
              className="absolute pointer-events-none border border-sky-400 bg-sky-400/10 shadow-[0_0_16px_rgba(56,189,248,0.35)] transition-all duration-300 ease-out"
              style={{
                left: `${stepXCoords[activeStepIndex] + 2}px`, // Aligns with the note position
                top: '24px',
                width: '34px',
                marginLeft: '-17px',
                height: '242px',
                borderRadius: '8px',
              }}
            />
          )}
        </div>

        {/* Interactive Clickable Chord Selection Strip Under Score */}
        {steps.length > 0 && (
          <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-col gap-2">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Шаги гармонизации (нажмите на аккорд для прослушивания)</span>
              <span className="text-slate-500 text-[10px]">Всего тактов/шагов: {steps.length}</span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {steps.map((step, idx) => {
                const isActive = activeStepIndex === idx;
                const turn = detectedTurns.find((t) => idx >= t.startIndex && idx <= t.endIndex);

                let badgeColor = 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-700/60';
                if (turn) {
                  if (turn.colorAccent === 'amber') {
                    badgeColor = 'bg-amber-950/40 border-amber-500/40 text-amber-300 hover:bg-amber-900/40';
                  } else if (turn.colorAccent === 'emerald') {
                    badgeColor = 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/40';
                  } else if (turn.colorAccent === 'rose') {
                    badgeColor = 'bg-rose-950/40 border-rose-500/40 text-rose-300 hover:bg-rose-900/40';
                  } else if (turn.colorAccent === 'sky') {
                    badgeColor = 'bg-sky-950/40 border-sky-500/40 text-sky-300 hover:bg-sky-900/40';
                  } else if (turn.colorAccent === 'purple') {
                    badgeColor = 'bg-purple-950/40 border-purple-500/40 text-purple-300 hover:bg-purple-900/40';
                  }
                }

                if (isActive) {
                  badgeColor = 'bg-sky-600 border-sky-400 text-white shadow-lg shadow-sky-950 ring-2 ring-sky-400/50';
                }

                return (
                  <button
                    key={`step-btn-${idx}`}
                    onClick={() => onSelectStep?.(idx)}
                    className={`px-2.5 py-1.5 rounded-xl border text-xs font-bold transition flex flex-col items-center gap-0.5 cursor-pointer min-w-[54px] ${badgeColor}`}
                    title={`${step.chordNameRu} (${step.degreeRoman})`}
                  >
                    <span className="text-[10px] opacity-70 font-normal">#{idx + 1}</span>
                    <span className="text-sm font-serif font-black">{step.chordSymbol}</span>
                    <span className="text-[9px] opacity-75 font-mono">{step.degreeRoman}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Harmonic Turns Overlays / Badges */}
        {showTurnBrackets && detectedTurns.length > 0 && (
          <div className="mt-4 pt-3 border-t border-slate-800/80">
            <div className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <span>🎯 Обнаруженные гармонические обороты в нотах:</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {detectedTurns.map((turn) => {
                let colorClass = 'border-amber-500/30 bg-amber-950/20 text-amber-300';
                if (turn.colorAccent === 'emerald') colorClass = 'border-emerald-500/30 bg-emerald-950/20 text-emerald-300';
                if (turn.colorAccent === 'rose') colorClass = 'border-rose-500/30 bg-rose-950/20 text-rose-300';
                if (turn.colorAccent === 'sky') colorClass = 'border-sky-500/30 bg-sky-950/20 text-sky-300';
                if (turn.colorAccent === 'purple') colorClass = 'border-purple-500/30 bg-purple-950/20 text-purple-300';

                return (
                  <div
                    key={turn.id}
                    className={`p-2.5 rounded-xl border flex flex-col gap-1 transition ${colorClass}`}
                  >
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="truncate">{turn.turnNameRu}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900/60 font-mono">
                        Шаги {turn.startIndex + 1}–{turn.endIndex + 1}
                      </span>
                    </div>

                    <div className="text-xs font-serif font-black tracking-wide text-white/90">
                      {turn.formulaRu}
                    </div>

                    <p className="text-[11px] text-slate-300/80 leading-relaxed">
                      {turn.explanationRu}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
});
