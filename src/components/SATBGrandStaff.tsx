import React from 'react';
import {
  MelodyHarmonizationTemplate,
  buildSATBForChord,
} from '../audio/melodyHarmonization';
import { identifyChordSeventh } from '../audio/harmonicProgressions';

interface SATBGrandStaffProps {
  template: MelodyHarmonizationTemplate;
  userChords: (string | null)[];
  activeStepIndex?: number | null;
}

interface KeyAccidental {
  note: 'F' | 'C' | 'G' | 'D' | 'A' | 'E' | 'B';
  type: '#' | 'b';
  trebleY: number;
  bassY: number;
}

function getKeySignatureAccidentals(keyRoot: string, scaleMode: 'major' | 'minor'): KeyAccidental[] {
  const keyMap: Record<string, KeyAccidental[]> = {
    C_major: [],
    A_minor: [],
    G_major: [{ note: 'F', type: '#', trebleY: 34, bassY: 132 }],
    E_minor: [{ note: 'F', type: '#', trebleY: 34, bassY: 132 }],
    F_major: [{ note: 'B', type: 'b', trebleY: 50, bassY: 148 }],
    D_minor: [{ note: 'B', type: 'b', trebleY: 50, bassY: 148 }],
    D_major: [
      { note: 'F', type: '#', trebleY: 34, bassY: 132 },
      { note: 'C', type: '#', trebleY: 46, bassY: 144 },
    ],
    B_minor: [
      { note: 'F', type: '#', trebleY: 34, bassY: 132 },
      { note: 'C', type: '#', trebleY: 46, bassY: 144 },
    ],
    'B#_major': [
      { note: 'B', type: 'b', trebleY: 50, bassY: 148 },
      { note: 'E', type: 'b', trebleY: 38, bassY: 136 },
    ],
    G_minor: [
      { note: 'B', type: 'b', trebleY: 50, bassY: 148 },
      { note: 'E', type: 'b', trebleY: 38, bassY: 136 },
    ],
  };

  const key = `${keyRoot}_${scaleMode}`;
  return keyMap[key] || [];
}

function getMidiDiatonicY(midi: number): {
  yTreble: number;
  yBass: number;
  inTreble: boolean;
  ledgerLines: number[];
  accidental: string | null;
} {
  const octave = Math.floor(midi / 12) - 1;
  const pitchClass = ((midi % 12) + 12) % 12;

  const pitchMap: Record<number, { diatonic: number; acc: string | null }> = {
    0: { diatonic: 0, acc: null },
    1: { diatonic: 0, acc: '♯' },
    2: { diatonic: 1, acc: null },
    3: { diatonic: 2, acc: '♭' },
    4: { diatonic: 2, acc: null },
    5: { diatonic: 3, acc: null },
    6: { diatonic: 3, acc: '♯' },
    7: { diatonic: 4, acc: null },
    8: { diatonic: 5, acc: '♭' },
    9: { diatonic: 5, acc: null },
    10: { diatonic: 6, acc: '♭' },
    11: { diatonic: 6, acc: null },
  };

  const info = pitchMap[pitchClass] ?? { diatonic: 0, acc: null };
  const distFromC4 = (octave - 4) * 7 + info.diatonic;

  const yTreble = 50 - (distFromC4 - 6) * 4;
  const yBass = 160 - (distFromC4 - (-6)) * 4;
  const inTreble = distFromC4 >= -2;

  const ledgerLines: number[] = [];
  if (inTreble) {
    if (distFromC4 <= 0) {
      for (let d = 0; d >= distFromC4; d -= 2) {
        if (d <= 0) ledgerLines.push(50 - (d - 6) * 4);
      }
    } else if (distFromC4 >= 12) {
      for (let d = 12; d <= distFromC4; d += 2) {
        ledgerLines.push(50 - (d - 6) * 4);
      }
    }
  } else {
    if (distFromC4 >= 0) {
      for (let d = 0; d <= distFromC4; d += 2) {
        ledgerLines.push(160 - (d - (-6)) * 4);
      }
    } else if (distFromC4 <= -12) {
      for (let d = -12; d >= distFromC4; d -= 2) {
        ledgerLines.push(160 - (d - (-6)) * 4);
      }
    }
  }

  return { yTreble, yBass, inTreble, ledgerLines, accidental: info.acc };
}

export const SATBGrandStaff: React.FC<SATBGrandStaffProps> = ({
  template,
  userChords,
  activeStepIndex,
}) => {
  const stepsCount = template.sopranoMelody.length;
  const keyAccidentals = getKeySignatureAccidentals(template.keyRootNote, template.scaleMode);

  const startX = 75 + keyAccidentals.length * 11;
  const measureWidth = Math.max(55, Math.min(85, (720 - startX) / stepsCount));
  const totalWidth = startX + stepsCount * measureWidth + 20;
  const totalHeight = 210;

  const satbSteps = template.sopranoMelody.map((step, idx) => {
    const chordId = userChords[idx] || step.allowedChordIds[0];
    const [bass, tenor, alto, soprano] = buildSATBForChord(
      step.midi,
      chordId,
      template.keyRootNote,
      template.scaleMode
    );
    return { bass, tenor, alto, soprano, chordId, stepIndex: idx };
  });

  return (
    <div className="w-full overflow-x-auto bg-slate-950 border border-slate-800/90 rounded-xl p-3 shadow-xl select-none flex flex-col items-center">
      <svg
        viewBox={`0 0 ${totalWidth} ${totalHeight}`}
        className="w-full h-auto"
        style={{ minWidth: `${Math.min(totalWidth, 380)}px`, maxHeight: '220px' }}
      >
        {/* SVG Marker Definitions for Resolution Arrows */}
        <defs>
          <marker
            id="arrow-seventh-satb"
            viewBox="0 0 10 10"
            refX="7"
            refY="5"
            markerWidth="5"
            markerHeight="5"
            orient="auto"
          >
            <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#fbbf24" />
          </marker>
        </defs>

        <rect
          x="2"
          y="2"
          width={totalWidth - 4}
          height={totalHeight - 4}
          rx="10"
          fill="#0b0f19"
          stroke="#1e293b"
          strokeWidth="1.2"
        />

        <line x1="24" y1="34" x2="24" y2="176" stroke="#94a3b8" strokeWidth="1.6" strokeLinecap="round" />
        <path
          d="M 24 34 C 18 34, 16 50, 20 105 C 16 160, 18 176, 24 176 C 20 176, 14 150, 18 105 C 14 60, 20 34, 24 34 Z"
          fill="#94a3b8"
          opacity="0.85"
        />

        {/* --- TREBLE STAFF LINES --- Dark Mode */}
        {[34, 42, 50, 58, 66].map((y, i) => (
          <line key={`treble-line-${i}`} x1="24" y1={y} x2={totalWidth - 16} y2={y} stroke="#334155" strokeWidth="1.0" strokeLinecap="round" />
        ))}

        {/* --- BASS STAFF LINES --- Dark Mode */}
        {[144, 152, 160, 168, 176].map((y, i) => (
          <line key={`bass-line-${i}`} x1="24" y1={y} x2={totalWidth - 16} y2={y} stroke="#334155" strokeWidth="1.0" strokeLinecap="round" />
        ))}

        <g transform="translate(28, 26) scale(0.55)">
          <path
            d="M 17 65 C 13 65 10 62 10 58 C 10 52 16 48 23 48 C 32 48 37 54 37 62 C 37 72 26 80 14 78 C 6 77 0 69 0 59 C 0 46 11 34 23 23 C 25 21 27 18 28 15 C 29 11 29 4 25 0 C 23 3 22 7 22 11 C 22 17 24 23 23 29 C 18 36 9 46 9 58 C 9 63 12 67 17 67 Z"
            fill="#cbd5e1"
            opacity="0.95"
          />
          <circle cx="17.5" cy="62" r="3" fill="#cbd5e1" />
        </g>

        <g transform="translate(28, 122) scale(0.52)">
          <path
            d="M 4 12 C 4 6 9 2 15 2 C 22 2 27 7 27 14 C 27 22 18 28 12 34 L 10 36 C 18 32 26 26 26 18 C 26 12 21 8 16 8 C 12 8 8 11 8 15 C 8 18 10 20 13 20 C 16 20 18 18 18 15 C 18 13 16 11 14 11"
            fill="#cbd5e1"
          />
          <circle cx="6" cy="10" r="3.5" fill="#cbd5e1" />
          <circle cx="28" cy="8" r="2" fill="#cbd5e1" />
          <circle cx="28" cy="18" r="2" fill="#cbd5e1" />
        </g>

        {keyAccidentals.map((acc, i) => (
          <g key={`key-acc-${i}`}>
            <text x={56 + i * 10} y={acc.trebleY + 4} fontSize="12" fill="#cbd5e1" fontWeight="normal">
              {acc.type === '#' ? '♯' : '♭'}
            </text>
            <text x={56 + i * 10} y={acc.bassY + 4} fontSize="12" fill="#cbd5e1" fontWeight="normal">
              {acc.type === '#' ? '♯' : '♭'}
            </text>
          </g>
        ))}

        {/* Ties (ligas) for common tones */}
        {satbSteps.slice(1).map((step, idxPlusOne) => {
          const idx = idxPlusOne + 1;
          const prevStep = satbSteps[idx - 1];
          const currStep = step;

          const xPrev = startX + (idx - 1) * measureWidth + measureWidth / 2;
          const xCurr = startX + idx * measureWidth + measureWidth / 2;

          const xStart = xPrev + 4;
          const xEnd = xCurr - 4;
          const xMid = (xStart + xEnd) / 2;

          const ties: React.ReactNode[] = [];

          if (prevStep.soprano === currStep.soprano) {
            const pos = getMidiDiatonicY(currStep.soprano);
            const y = pos.yTreble;
            ties.push(
              <path
                key={`tie-s-${idx}`}
                d={`M ${xStart} ${y} Q ${xMid} ${y - 6} ${xEnd} ${y}`}
                fill="none"
                stroke="#fb7185"
                strokeWidth="1.6"
                strokeLinecap="round"
                opacity="0.9"
              />
            );
          }

          if (prevStep.alto === currStep.alto) {
            const pos = getMidiDiatonicY(currStep.alto);
            const y = pos.yTreble;
            ties.push(
              <path
                key={`tie-a-${idx}`}
                d={`M ${xStart} ${y} Q ${xMid} ${y + 6} ${xEnd} ${y}`}
                fill="none"
                stroke="#fbbf24"
                strokeWidth="1.6"
                strokeLinecap="round"
                opacity="0.9"
              />
            );
          }

          if (prevStep.tenor === currStep.tenor) {
            const pos = getMidiDiatonicY(currStep.tenor);
            const y = pos.yBass;
            ties.push(
              <path
                key={`tie-t-${idx}`}
                d={`M ${xStart} ${y} Q ${xMid} ${y - 6} ${xEnd} ${y}`}
                fill="none"
                stroke="#34d399"
                strokeWidth="1.6"
                strokeLinecap="round"
                opacity="0.9"
              />
            );
          }

          if (prevStep.bass === currStep.bass) {
            const pos = getMidiDiatonicY(currStep.bass);
            const y = pos.yBass;
            ties.push(
              <path
                key={`tie-b-${idx}`}
                d={`M ${xStart} ${y} Q ${xMid} ${y + 6} ${xEnd} ${y}`}
                fill="none"
                stroke="#a78bfa"
                strokeWidth="1.6"
                strokeLinecap="round"
                opacity="0.9"
              />
            );
          }

          return <g key={`ties-group-${idx}`}>{ties}</g>;
        })}

        {satbSteps.map((stepData, idx) => {
          const x = startX + idx * measureWidth + measureWidth / 2;
          const barX = startX + (idx + 1) * measureWidth;
          const isActive = activeStepIndex === idx;

          const sopranoPos = getMidiDiatonicY(stepData.soprano);
          const altoPos = getMidiDiatonicY(stepData.alto);
          const tenorPos = getMidiDiatonicY(stepData.tenor);
          const bassPos = getMidiDiatonicY(stepData.bass);

          const stemLength = 20;

          // Identify 7th chord and its resolution
          const nextStep = satbSteps[idx + 1];
          const seventhInfo = identifyChordSeventh(
            stepData.chordId,
            [stepData.bass, stepData.tenor, stepData.alto, stepData.soprano],
            nextStep ? [nextStep.bass, nextStep.tenor, nextStep.alto, nextStep.soprano] : undefined
          );

          let seventhY: number | null = null;
          let nextSeventhY: number | null = null;
          if (seventhInfo) {
            if (seventhInfo.voiceIndex === 3) {
              seventhY = sopranoPos.yTreble;
              if (nextStep) nextSeventhY = getMidiDiatonicY(nextStep.soprano).yTreble;
            } else if (seventhInfo.voiceIndex === 2) {
              seventhY = altoPos.yTreble;
              if (nextStep) nextSeventhY = getMidiDiatonicY(nextStep.alto).yTreble;
            } else if (seventhInfo.voiceIndex === 1) {
              seventhY = tenorPos.yBass;
              if (nextStep) nextSeventhY = getMidiDiatonicY(nextStep.tenor).yBass;
            } else if (seventhInfo.voiceIndex === 0) {
              seventhY = bassPos.yBass;
              if (nextStep) nextSeventhY = getMidiDiatonicY(nextStep.bass).yBass;
            }
          }

          const nextX = startX + (idx + 1) * measureWidth + measureWidth / 2;

          return (
            <g key={`satb-step-${idx}`}>
              {isActive && (
                <rect
                  x={x - measureWidth / 2 + 2}
                  y="18"
                  width={measureWidth - 4}
                  height="154"
                  rx="6"
                  fill="#6366f1"
                  fillOpacity="0.22"
                  stroke="#818cf8"
                  strokeWidth="1.5"
                />
              )}

              <text x={x} y="26" fontSize="10" fill={userChords[idx] ? '#a5b4fc' : '#94a3b8'} fontWeight="500" textAnchor="middle" fontFamily="monospace">
                {userChords[idx] || '?'}
              </text>

              {/* 1. SOPRANO */}
              {sopranoPos.ledgerLines.map((ly, li) => (
                <line key={`s-ledg-${li}`} x1={x - 10} y1={ly} x2={x + 10} y2={ly} stroke="#475569" strokeWidth="1.2" strokeLinecap="round" />
              ))}
              {sopranoPos.accidental && (
                <text x={x - 12} y={sopranoPos.yTreble + 3.5} fontSize="11" fill="#fb7185" fontWeight="normal">
                  {sopranoPos.accidental}
                </text>
              )}
              <ellipse cx={x} cy={sopranoPos.yTreble} rx="4" ry="3" fill="#f43f5e" stroke="#fda4af" strokeWidth="0.8" transform={`rotate(-20 ${x} ${sopranoPos.yTreble})`} />
              <line x1={x + 3.2} y1={sopranoPos.yTreble} x2={x + 3.2} y2={sopranoPos.yTreble - stemLength} stroke="#fb7185" strokeWidth="1.2" strokeLinecap="round" />

              {/* 2. ALTO */}
              {altoPos.ledgerLines.map((ly, li) => (
                <line key={`a-ledg-${li}`} x1={x - 10} y1={ly} x2={x + 10} y2={ly} stroke="#475569" strokeWidth="1.2" strokeLinecap="round" />
              ))}
              {altoPos.accidental && (
                <text x={x - 12} y={altoPos.yTreble + 3.5} fontSize="11" fill="#fbbf24" fontWeight="normal">
                  {altoPos.accidental}
                </text>
              )}
              <ellipse cx={x} cy={altoPos.yTreble} rx="4" ry="3" fill="#f59e0b" stroke="#fde68a" strokeWidth="0.8" transform={`rotate(-20 ${x} ${altoPos.yTreble})`} />
              <line x1={x - 3.2} y1={altoPos.yTreble} x2={x - 3.2} y2={altoPos.yTreble + stemLength} stroke="#fbbf24" strokeWidth="1.2" strokeLinecap="round" />

              {/* 3. TENOR */}
              {tenorPos.ledgerLines.map((ly, li) => (
                <line key={`t-ledg-${li}`} x1={x - 10} y1={ly} x2={x + 10} y2={ly} stroke="#475569" strokeWidth="1.2" strokeLinecap="round" />
              ))}
              {tenorPos.accidental && (
                <text x={x - 12} y={tenorPos.yBass + 3.5} fontSize="11" fill="#34d399" fontWeight="normal">
                  {tenorPos.accidental}
                </text>
              )}
              <ellipse cx={x} cy={tenorPos.yBass} rx="4" ry="3" fill="#10b981" stroke="#6ee7b7" strokeWidth="0.8" transform={`rotate(-20 ${x} ${tenorPos.yBass})`} />
              <line x1={x + 3.2} y1={tenorPos.yBass} x2={x + 3.2} y2={tenorPos.yBass - stemLength} stroke="#34d399" strokeWidth="1.2" strokeLinecap="round" />

              {/* 4. BASS */}
              {bassPos.ledgerLines.map((ly, li) => (
                <line key={`b-ledg-${li}`} x1={x - 10} y1={ly} x2={x + 10} y2={ly} stroke="#475569" strokeWidth="1.2" strokeLinecap="round" />
              ))}
              {bassPos.accidental && (
                <text x={x - 12} y={bassPos.yBass + 3.5} fontSize="11" fill="#a78bfa" fontWeight="normal">
                  {bassPos.accidental}
                </text>
              )}
              <ellipse cx={x} cy={bassPos.yBass} rx="4" ry="3" fill="#8b5cf6" stroke="#c4b5fd" strokeWidth="0.8" transform={`rotate(-20 ${x} ${bassPos.yBass})`} />
              <line x1={x - 3.2} y1={bassPos.yBass} x2={x - 3.2} y2={bassPos.yBass + stemLength} stroke="#a78bfa" strokeWidth="1.2" strokeLinecap="round" />

              {/* --- SEVENTH BADGE & RESOLUTION ARROW --- */}
              {seventhInfo && seventhY !== null && (
                <g className="seventh-annotation" pointerEvents="none">
                  {/* Badge '7' or '7↓' / '7↑' next to the seventh note */}
                  <rect
                    x={x + 7}
                    y={seventhY - 7}
                    width={seventhInfo.resolution ? 18 : 13}
                    height="14"
                    rx="3.5"
                    fill="#78350f"
                    fillOpacity="0.85"
                    stroke="#f59e0b"
                    strokeWidth="1.0"
                  />
                  <text
                    x={x + 7 + (seventhInfo.resolution ? 9 : 6.5)}
                    y={seventhY + 3}
                    fontSize="9.5"
                    fontWeight="500"
                    fill="#fef08a"
                    textAnchor="middle"
                    fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
                  >
                    {seventhInfo.resolution ? `7${seventhInfo.resolution.arrowSymbol}` : '7'}
                  </text>

                  {/* Directional Resolution Trajectory Line to Next Chord */}
                  {nextStep && nextSeventhY !== null && (
                    <path
                      d={`M ${x + 14} ${seventhY} Q ${(x + nextX) / 2} ${(seventhY + nextSeventhY) / 2 + (seventhInfo.resolution?.direction === 'down' ? 6 : -6)} ${nextX - 8} ${nextSeventhY}`}
                      fill="none"
                      stroke="#fbbf24"
                      strokeWidth="1.6"
                      strokeDasharray="3 2"
                      markerEnd="url(#arrow-seventh-satb)"
                      opacity="0.95"
                    />
                  )}
                </g>
              )}

              {idx < stepsCount - 1 && (
                <line x1={barX} y1="34" x2={barX} y2="156" stroke="#334155" strokeWidth="1" />
              )}
            </g>
          );
        })}

        <line x1={totalWidth - 20} y1="34" x2={totalWidth - 20} y2="156" stroke="#475569" strokeWidth="1" />
        <line x1={totalWidth - 16} y1="34" x2={totalWidth - 16} y2="156" stroke="#94a3b8" strokeWidth="2.5" />
      </svg>

      <div className="flex items-center justify-center gap-4 pt-2 text-[10px] font-semibold text-slate-300">
        <span className="flex items-center gap-1.5 text-rose-400">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block ring-2 ring-rose-500/30" /> S (Сопрано)
        </span>
        <span className="flex items-center gap-1.5 text-amber-400">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block ring-2 ring-amber-500/30" /> A (Альт)
        </span>
        <span className="flex items-center gap-1.5 text-emerald-400">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block ring-2 ring-emerald-500/30" /> T (Тенор)
        </span>
        <span className="flex items-center gap-1.5 text-purple-400">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block ring-2 ring-purple-500/30" /> B (Бас)
        </span>
        <span className="flex items-center gap-1.5 text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-600/40">
          <span className="px-1 py-0.2 bg-amber-900/80 border border-amber-500/70 text-amber-200 font-mono text-[9px] rounded font-bold">7↓</span> Септима и направление разрешения
        </span>
      </div>
    </div>
  );
};
