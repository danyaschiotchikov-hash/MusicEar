import React, { useEffect, useRef, useState } from 'react';
import {
  Renderer,
  Stave,
  StaveNote,
  Voice,
  Formatter,
  StaveConnector,
  Accidental,
  Stem,
  StaveTie,
  BarlineType,
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

function formatChordNotation(sym: string): string {
  if (!sym) return '';
  return sym
    .replace(/5\/3/g, '')
    .replace(/6\/4/g, '⁶/₄')
    .replace(/6\/5/g, '⁶/₅')
    .replace(/4\/3/g, '⁴/₃')
    .replace(/6/g, '₆')
    .replace(/7/g, '₇')
    .replace(/2/g, '₂');
}

function getRomanDegreeNotation(sym: string): string {
  if (!sym) return '';
  const s = sym.trim();
  if (/^K6\/?4/i.test(s) || /^I6\/?4/i.test(s)) return 'I⁶/₄';
  if (/^T5\/?3/i.test(s) || s === 'T' || s === 't' || s === 'I5/3' || s === 'I') return 'I';
  if (/^T6/i.test(s)) return 'I₆';
  if (/^S6\/?4/i.test(s) || /^IV6\/?4/i.test(s)) return 'IV⁶/₄';
  if (/^S6/i.test(s) || /^IV6/i.test(s)) return 'IV₆';
  if (/^S5\/?3/i.test(s) || s === 'S' || s === 's' || s === 'IV') return 'IV';
  if (/^D7/i.test(s) || /^V7/i.test(s)) return 'V₇';
  if (/^D6\/?5/i.test(s) || /^V6\/?5/i.test(s)) return 'V⁶/₅';
  if (/^D4\/?3/i.test(s) || /^V4\/?3/i.test(s)) return 'V⁴/₃';
  if (/^D2/i.test(s) || /^V2/i.test(s)) return 'V₂';
  if (/^D6/i.test(s) || /^V6/i.test(s)) return 'V₆';
  if (/^D5\/?3/i.test(s) || s === 'D' || s === 'd' || s === 'V') return 'V';
  if (/^II6\/?5/i.test(s)) return 'II⁶/₅';
  if (/^II4\/?3/i.test(s)) return 'II⁴/₃';
  if (/^II2/i.test(s)) return 'II₂';
  if (/^II6/i.test(s)) return 'II₆';
  if (/^II7/i.test(s)) return 'II₇';
  if (/^II/i.test(s)) return 'II';
  if (/^VII7/i.test(s)) return 'VII₇';
  if (/^VII6\/?5/i.test(s)) return 'VII⁶/₅';
  if (/^VII/i.test(s)) return 'VII';
  if (/^VI/i.test(s)) return 'VI';
  if (/^III/i.test(s)) return 'III';
  if (/^N6/i.test(s) || /^♭II6/i.test(s)) return '♭II₆';
  return formatChordNotation(s);
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
      const stepWidth = Math.max(64, Math.min(92, Math.floor(360 / stepsCount)));
      const startX = 64;
      const endPadding = 24;
      const calculatedWidth = Math.max(340, startX + stepsCount * stepWidth + endPadding);
      const totalHeight = 216;

      const renderer = new Renderer(container, Renderer.Backends.SVG);
      renderer.resize(calculatedWidth, totalHeight);
      const context = renderer.getContext();

      context.setFont('Bravura, "Academic Music", serif', 11);
      context.setFillStyle('#cbd5e1');
      context.setStrokeStyle('#64748b');

      // Stave position: startX 28 gives ample space for the brace accolade without clipping
      const staveX = 28;
      const topStaveY = 14;
      // Distance of 122 eliminates stem collisions between alto and tenor
      const bottomStaveY = 120;
      const staveWidth = calculatedWidth - 46;

      const topStave = new Stave(staveX, topStaveY, staveWidth);
      topStave.addClef('treble');
      topStave.addKeySignature(vexKey);
      topStave.setEndBarType(BarlineType.END);
      topStave.setDefaultLedgerLineStyle({ strokeStyle: '#94a3b8', lineWidth: 0.9 });
      topStave.setContext(context).draw();

      const bottomStave = new Stave(staveX, bottomStaveY, staveWidth);
      bottomStave.addClef('bass');
      bottomStave.addKeySignature(vexKey);
      bottomStave.setEndBarType(BarlineType.END);
      bottomStave.setDefaultLedgerLineStyle({ strokeStyle: '#94a3b8', lineWidth: 0.9 });
      bottomStave.setContext(context).draw();

      // Curly Brace Accolade
      const brace = new StaveConnector(topStave, bottomStave);
      brace.setType(StaveConnector.type.BRACE);
      brace.setContext(context).draw();

      // Left barline
      const leftLine = new StaveConnector(topStave, bottomStave);
      leftLine.setType(StaveConnector.type.SINGLE_LEFT);
      leftLine.setContext(context).draw();

      // Final Double Barline across staves
      const rightLine = new StaveConnector(topStave, bottomStave);
      rightLine.setType(StaveConnector.type.BOLD_DOUBLE_RIGHT);
      rightLine.setContext(context).draw();

      const sopranoNotes: StaveNote[] = [];
      const altoNotes: StaveNote[] = [];
      const tenorNotes: StaveNote[] = [];
      const bassNotes: StaveNote[] = [];

      steps.forEach((step, idx) => {
        const [bMidi, tMidi, aMidi, sMidi] = step.midisSATB;
        const isActive = activeStepIndex === idx;

        const sKey = midiToVexKey(sMidi, isFlat);
        const sNote = new StaveNote({
          clef: 'treble',
          keys: [sKey],
          duration: 'q',
          stemDirection: Stem.UP,
        });
        sNote.setLedgerLineStyle({ strokeStyle: '#94a3b8', lineWidth: 0.9 });

        if (showOnlySoprano) {
          const bRest = new StaveNote({
            clef: 'bass',
            keys: ['d/3'],
            duration: 'qr',
          });

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
          aNote.setLedgerLineStyle({ strokeStyle: '#94a3b8', lineWidth: 0.9 });

          const tNote = new StaveNote({
            clef: 'bass',
            keys: [tKey],
            duration: 'q',
            stemDirection: Stem.UP,
          });
          tNote.setLedgerLineStyle({ strokeStyle: '#94a3b8', lineWidth: 0.9 });

          const bNote = new StaveNote({
            clef: 'bass',
            keys: [bKey],
            duration: 'q',
            stemDirection: Stem.DOWN,
          });
          bNote.setLedgerLineStyle({ strokeStyle: '#94a3b8', lineWidth: 0.9 });

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
          const isFilled = currentFill && currentFill !== 'none';

          if (isFilled) {
            // Noteheads, accidentals, clefs, flags, rests: Keep pure fill with NO artificial outline stroke!
            el.setAttribute('fill', '#f1f5f9');
            el.removeAttribute('stroke');
            el.removeAttribute('stroke-width');
          } else {
            // Stave lines, barlines, stems: Crisp, thin classical lines
            if (currentStroke === '#f8fafc' || currentStroke === '#ffffff') {
              el.setAttribute('stroke', '#cbd5e1');
            } else {
              el.setAttribute('stroke', '#94a3b8');
            }
            el.setAttribute('stroke-width', '0.85');
          }
        });

        // Render chord labels under the bottom stave strictly as scale degrees (ступени) + functions
        const degreeBaselineY = bottomStaveY + 52;
        const funcBaselineY = bottomStaveY + 66;

        steps.forEach((step, idx) => {
          const refNote = sopranoNotes[idx] || bassNotes[idx];
          if (!refNote) return;
          const noteX = refNote.getAbsoluteX();
          const rawChordLabel = userStepSymbols?.[idx] || step.symbol;
          const degreeText = getRomanDegreeNotation(rawChordLabel);
          const funcText = formatChordNotation(rawChordLabel);

          // 1. Primary scale degree label (e.g. I, IV₆, I⁶/₄, V₇)
          const degEl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          degEl.setAttribute('x', String(noteX));
          degEl.setAttribute('y', String(degreeBaselineY));
          degEl.setAttribute('text-anchor', 'middle');
          degEl.setAttribute('fill', '#c7d2fe');
          degEl.setAttribute('font-size', '13px');
          degEl.setAttribute('font-family', 'Georgia, "Times New Roman", serif');
          degEl.style.fontWeight = '500';
          degEl.textContent = degreeText;
          svgEl.appendChild(degEl);

          // 2. Functional label (e.g. T, S₆, K⁶/₄, D₇) if distinguishable
          if (funcText && funcText !== degreeText) {
            const funcEl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            funcEl.setAttribute('x', String(noteX));
            funcEl.setAttribute('y', String(funcBaselineY));
            funcEl.setAttribute('text-anchor', 'middle');
            funcEl.setAttribute('fill', '#94a3b8');
            funcEl.setAttribute('font-size', '10px');
            funcEl.setAttribute('font-family', '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif');
            funcEl.style.fontWeight = '400';
            funcEl.textContent = `(${funcText})`;
            svgEl.appendChild(funcEl);
          }
        });

        // Ensure all music text (clefs, keys) are elegant, natural, and never bold
        svgEl.querySelectorAll('text').forEach((textNode) => {
          if (!textNode.hasAttribute('fill')) {
            textNode.setAttribute('fill', '#e2e8f0');
          }
          textNode.style.fontWeight = '400';
        });
      }
    } catch (err: unknown) {
      console.error('VexFlow Progression rendering error:', err);
      setRenderError(err instanceof Error ? err.message : String(err));
    }
  }, [progression, steps, activeStepIndex, showOnlySoprano, userStepSymbols, vexKey, isFlat]);

  return (
    <div className="w-full select-none flex flex-col items-center">
      {renderError && (
        <div className="w-full p-2 mb-1 bg-red-950/40 border border-red-800/50 rounded-lg text-[11px] text-red-300">
          Ошибка отрисовки: {renderError}
        </div>
      )}

      {/* Clean VexFlow Score */}
      <div className="w-full flex justify-center py-0.5 overflow-x-auto">
        <div ref={containerRef} className="w-full flex justify-center" />
      </div>
    </div>
  );
});
