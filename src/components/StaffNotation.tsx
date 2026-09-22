import React from 'react';

export interface NotationNote {
  midiOffset: number; // offset from root
  duration?: number;
  durationLabel?: '16th' | '8th' | 'dotted-8th' | 'quarter' | 'dotted-quarter' | 'half' | 'whole';
  name?: string;      // e.g. 'E4', 'G3'
  isTarget?: boolean; // highlight as studied interval / element
}

interface StaffNotationProps {
  rootMidi: number;
  notes: NotationNote[];
  activeMidi?: number | null;
  clef?: 'treble' | 'bass';
  title?: string;
  meter?: string; // e.g. '4/4', '3/4', '3/8', '2/4'
}

// Map MIDI note numbers to standard diatonic staff positions relative to middle C (C4 = 60).
// In Treble clef, line 1 (bottom) is E4, line 2 is G4, line 3 is B4, line 4 is D5, line 5 is F5.
// Middle C (C4 = 60) is on ledger line 1 below staff.
function getDiatonicStaffStep(midi: number): { step: number; acc: string; noteName: string } {
  const pitchClass = ((midi % 12) + 12) % 12;
  const octave = Math.floor(midi / 12) - 1;

  // Standard diatonic mapping with sharps for black keys
  const pitchMap: { [pc: number]: { diatonic: number; acc: string; name: string } } = {
    0: { diatonic: 0, acc: '', name: 'C' },
    1: { diatonic: 0, acc: '#', name: 'C♯' },
    2: { diatonic: 1, acc: '', name: 'D' },
    3: { diatonic: 2, acc: 'b', name: 'E♭' },
    4: { diatonic: 2, acc: '', name: 'E' },
    5: { diatonic: 3, acc: '', name: 'F' },
    6: { diatonic: 3, acc: '#', name: 'F♯' },
    7: { diatonic: 4, acc: '', name: 'G' },
    8: { diatonic: 5, acc: 'b', name: 'A♭' },
    9: { diatonic: 5, acc: '', name: 'A' },
    10: { diatonic: 6, acc: 'b', name: 'B♭' },
    11: { diatonic: 6, acc: '', name: 'B' },
  };

  const info = pitchMap[pitchClass] || { diatonic: 0, acc: '', name: 'C' };
  
  // Total diatonic step from C4 (diatonic index 0, octave 4)
  const totalDiatonicFromC4 = (octave - 4) * 7 + info.diatonic;
  
  // In treble clef, B4 (midi 71) is center line (y = step 0).
  // C4 is 6 diatonic steps below B4.
  const step = totalDiatonicFromC4 - 6;

  return {
    step,
    acc: info.acc,
    noteName: `${info.name}${octave}`,
  };
}

export const StaffNotation: React.FC<StaffNotationProps> = React.memo(({
  rootMidi,
  notes,
  activeMidi,
  meter = '4/4',
}) => {
  // SVG Dimensions
  const height = 115;
  const staffLineGap = 9; // distance between lines
  // Staff lines 1 to 5 (from top to bottom: Line 5 to Line 1)
  // Center line (Line 3, B4) is at yCenter:
  const yCenter = 56;
  const yLine5 = yCenter - 2 * staffLineGap; // 38
  const yLine4 = yCenter - staffLineGap;     // 47
  const yLine3 = yCenter;                    // 56
  const yLine2 = yCenter + staffLineGap;     // 65
  const yLine1 = yCenter + 2 * staffLineGap; // 74

  // Horizontal layout
  const startX = 66; // after clef & meter
  const noteSpacing = Math.max(34, Math.min(50, (500 - startX - 30) / Math.max(1, notes.length)));
  const width = Math.max(360, startX + notes.length * noteSpacing + 36);

  return (
    <div className="w-full overflow-x-auto select-none py-1 flex flex-col items-center">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full max-w-full h-auto drop-shadow-sm font-sans"
        style={{ minWidth: `${Math.min(width, 360)}px`, maxHeight: '115px' }}
      >
        {/* Background plate */}
        <rect
          x="2"
          y="6"
          width={width - 4}
          height={height - 12}
          rx="8"
          fill="#0b0f19"
          stroke="#1e293b"
          strokeWidth="1.2"
        />

        {/* 5 Staff Lines */}
        {[yLine5, yLine4, yLine3, yLine2, yLine1].map((y, idx) => (
          <line
            key={`staff-${idx}`}
            x1="16"
            y1={y}
            x2={width - 16}
            y2={y}
            stroke="#334155"
            strokeWidth="1.35"
            strokeLinecap="round"
          />
        ))}

        {/* Initial Bar Line */}
        <line
          x1="18"
          y1={yLine5}
          x2="18"
          y2={yLine1}
          stroke="#475569"
          strokeWidth="1.5"
        />

        {/* Final Double Bar Line */}
        <line
          x1={width - 22}
          y1={yLine5}
          x2={width - 22}
          y2={yLine1}
          stroke="#475569"
          strokeWidth="1.2"
        />
        <line
          x1={width - 18}
          y1={yLine5}
          x2={width - 18}
          y2={yLine1}
          stroke="#94a3b8"
          strokeWidth="2.5"
        />

        {/* Stylized Treble Clef (G Clef) */}
        <g transform="translate(23, 27) scale(0.65)">
          <path
            d="M 17 65 C 13 65 10 62 10 58 C 10 52 16 48 23 48 C 32 48 37 54 37 62 C 37 72 26 80 14 78 C 6 77 0 69 0 59 C 0 46 11 34 23 23 C 25 21 27 18 28 15 C 29 11 29 4 25 0 C 23 3 22 7 22 11 C 22 17 24 23 23 29 C 18 36 9 46 9 58 C 9 63 12 67 17 67 Z"
            fill="#cbd5e1"
            opacity="0.95"
          />
          <circle cx="17.5" cy="62" r="3.2" fill="#cbd5e1" />
        </g>

        {/* Time Signature */}
        <text
          x="50"
          y={yLine4 + 2}
          textAnchor="middle"
          fontSize="11"
          fontWeight="bold"
          fill="#cbd5e1"
          fontFamily="serif"
        >
          {meter.split('/')[0] || '4'}
        </text>
        <text
          x="50"
          y={yLine2 + 2}
          textAnchor="middle"
          fontSize="11"
          fontWeight="bold"
          fill="#cbd5e1"
          fontFamily="serif"
        >
          {meter.split('/')[1] || '4'}
        </text>

        {/* Notes */}
        {notes.map((note, index) => {
          const midi = rootMidi + note.midiOffset;
          const { step, acc, noteName } = getDiatonicStaffStep(midi);

          // Note Y coordinate: each diatonic step shifts by staffLineGap / 2
          const noteY = yCenter - step * (staffLineGap / 2);
          const noteX = startX + index * noteSpacing + 12;

          const isActive = activeMidi === midi;
          const isTarget = note.isTarget ?? (index < 2);

          // Calculate Ledger Lines
          const ledgerLines: number[] = [];
          if (step <= -6) {
            for (let s = -6; s >= step; s -= 2) {
              ledgerLines.push(yCenter - s * (staffLineGap / 2));
            }
          }
          if (step >= 6) {
            for (let s = 6; s <= step; s += 2) {
              ledgerLines.push(yCenter - s * (staffLineGap / 2));
            }
          }

          // Stem direction: notes on middle line or higher (step >= 0) stem down (left side)
          const stemDown = step >= 0;
          const stemHeight = 24;
          const stemX = stemDown ? noteX - 5.5 : noteX + 5.5;
          const stemY1 = noteY;
          const stemY2 = stemDown ? noteY + stemHeight : noteY - stemHeight;

          // Note duration flags / aesthetics
          const isHollow = note.durationLabel === 'half' || note.durationLabel === 'whole';
          const isWhole = note.durationLabel === 'whole';
          const hasFlag = note.durationLabel === '8th' || note.durationLabel === 'dotted-8th' || note.durationLabel === '16th';
          const is16th = note.durationLabel === '16th';
          const hasDot = note.durationLabel === 'dotted-8th' || note.durationLabel === 'dotted-quarter';

          // Note color styling
          const headFill = isHollow
            ? (isActive ? '#38bdf8' : '#0b0f19')
            : isActive
            ? '#38bdf8'
            : isTarget
            ? '#f59e0b'
            : '#f1f5f9';

          const headStroke = isActive
            ? '#7dd3fc'
            : isTarget
            ? '#fde68a'
            : '#e2e8f0';

          return (
            <g key={`note-${index}-${midi}`} className="transition-all duration-150">
              {/* Ledger Lines */}
              {ledgerLines.map((ly, lidx) => (
                <line
                  key={`ledger-${index}-${lidx}`}
                  x1={noteX - 11}
                  y1={ly}
                  x2={noteX + 11}
                  y2={ly}
                  stroke="#475569"
                  strokeWidth="2.0"
                  strokeLinecap="round"
                />
              ))}

              {/* Target Element Halo / Pulse */}
              {isTarget && (
                <circle
                  cx={noteX}
                  cy={noteY}
                  r="10"
                  fill="#f59e0b"
                  opacity={isActive ? '0.45' : '0.2'}
                />
              )}

              {/* Accidental (# or b) */}
              {acc === '#' && (
                <text
                  x={noteX - 11}
                  y={noteY + 4}
                  textAnchor="middle"
                  fontSize="12"
                  fontWeight="bold"
                  fill={isTarget ? '#fbbf24' : '#f1f5f9'}
                  fontFamily="serif"
                >
                  ♯
                </text>
              )}
              {acc === 'b' && (
                <text
                  x={noteX - 10}
                  y={noteY + 3}
                  textAnchor="middle"
                  fontSize="12"
                  fontWeight="bold"
                  fill={isTarget ? '#fbbf24' : '#f1f5f9'}
                  fontFamily="serif"
                >
                  ♭
                </text>
              )}

              {/* Notehead (slanted ellipse) */}
              <ellipse
                cx={noteX}
                cy={noteY}
                rx="6"
                ry="4.2"
                transform={`rotate(-22, ${noteX}, ${noteY})`}
                fill={headFill}
                stroke={headStroke}
                strokeWidth={isHollow ? '2' : '1'}
              />

              {/* Dot for dotted notes */}
              {hasDot && (
                <circle
                  cx={noteX + 8.5}
                  cy={noteY - 1}
                  r="1.8"
                  fill={isTarget ? '#fbbf24' : '#f1f5f9'}
                />
              )}

              {/* Note Stem (unless whole note) */}
              {!isWhole && (
                <line
                  x1={stemX}
                  y1={stemY1}
                  x2={stemX}
                  y2={stemY2}
                  stroke={isActive ? '#38bdf8' : isTarget ? '#fbbf24' : '#cbd5e1'}
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              )}

              {/* Flag for 8th / 16th notes */}
              {hasFlag && !isWhole && (
                <path
                  d={
                    stemDown
                      ? `M ${stemX} ${stemY2} Q ${stemX + 6} ${stemY2 - 8} ${stemX + 7} ${stemY2 - 14}`
                      : `M ${stemX} ${stemY2} Q ${stemX + 6} ${stemY2 + 8} ${stemX + 7} ${stemY2 + 14}`
                  }
                  fill="none"
                  stroke={isActive ? '#38bdf8' : isTarget ? '#fbbf24' : '#cbd5e1'}
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              )}
              {is16th && !isWhole && (
                <path
                  d={
                    stemDown
                      ? `M ${stemX} ${stemY2 - 5} Q ${stemX + 6} ${stemY2 - 13} ${stemX + 7} ${stemY2 - 19}`
                      : `M ${stemX} ${stemY2 + 5} Q ${stemX + 6} ${stemY2 + 13} ${stemX + 7} ${stemY2 + 19}`
                  }
                  fill="none"
                  stroke={isActive ? '#38bdf8' : isTarget ? '#fbbf24' : '#cbd5e1'}
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              )}

              {/* Target Element Tag beneath first note */}
              {isTarget && index === 0 && (
                <text
                  x={noteX + noteSpacing * 0.45}
                  y={yLine1 + 18}
                  textAnchor="middle"
                  fontSize="8.5"
                  fontWeight="bold"
                  fill="#fbbf24"
                >
                  [изучаемый интервал]
                </text>
              )}

              {/* Note name indicator below */}
              <text
                x={noteX}
                y={height - 8}
                textAnchor="middle"
                fontSize="8"
                fill={isActive ? '#38bdf8' : isTarget ? '#fbbf24' : '#94a3b8'}
                fontWeight={isActive || isTarget ? 'bold' : 'normal'}
                fontFamily="monospace"
              >
                {note.name || noteName}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
});
