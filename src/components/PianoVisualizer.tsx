import React from 'react';

interface PianoVisualizerProps {
  activeMidis: number[];
  revealedMidis?: number[];
  rootMidi?: number;
}

// 2 octaves from C3 (48) to C5 (72)
const START_MIDI = 48;
const END_MIDI = 72;

export const PianoVisualizer: React.FC<PianoVisualizerProps> = ({
  activeMidis,
  revealedMidis = [],
  rootMidi,
}) => {
  const isBlackKey = (midi: number) => {
    const note = midi % 12;
    return [1, 3, 6, 8, 10].includes(note);
  };

  const keys: { midi: number; isBlack: boolean }[] = [];
  for (let m = START_MIDI; m <= END_MIDI; m++) {
    keys.push({ midi: m, isBlack: isBlackKey(m) });
  }

  // Count white keys to calculate exact percentages for black keys positioning
  const whiteKeys = keys.filter((k) => !k.isBlack);

  return (
    <div className="w-full bg-slate-950/60 border border-slate-800/80 rounded-2xl p-2.5 sm:p-3 shadow-inner">
      <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5 px-1">
        <span className="font-medium text-slate-400">Визуализация клавиш (C3 - C5):</span>
        <div className="flex items-center gap-3 text-[10px]">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block shadow-sm shadow-indigo-500/50" />
            Звучит
          </span>
          {rootMidi && (
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block shadow-sm shadow-amber-400/50" />
              Тоника
            </span>
          )}
        </div>
      </div>

      <div className="relative h-14 sm:h-18 w-full select-none flex">
        {/* White keys */}
        {whiteKeys.map((k) => {
          const isPlaying = activeMidis.includes(k.midi);
          const isRevealed = revealedMidis.includes(k.midi);
          const isRoot = rootMidi === k.midi;

          let bgClass = 'piano-white-key bg-slate-200 border-slate-400 hover:bg-slate-100';
          if (isPlaying) {
            bgClass = 'bg-indigo-500 border-indigo-400 shadow-lg shadow-indigo-500/60 ring-2 ring-indigo-300 animate-pulse';
          } else if (isRevealed) {
            bgClass = 'bg-emerald-400 border-emerald-300 shadow-md shadow-emerald-400/40';
          } else if (isRoot) {
            bgClass = 'bg-amber-200 border-amber-400';
          }

          return (
            <div
              key={k.midi}
              className={`piano-white-key flex-1 border-r last:border-r-0 rounded-b-md transition-all duration-150 relative ${bgClass}`}
            >
              {isPlaying && (
                <div className="absolute inset-x-0 bottom-0 top-1/2 bg-gradient-to-t from-indigo-600/60 to-transparent rounded-b-md pointer-events-none" />
              )}
              {isRoot && (
                <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-amber-600" />
              )}
            </div>
          );
        })}

        {/* Black keys overlaid on top */}
        <div className="absolute inset-0 pointer-events-none flex">
          {whiteKeys.map((wk, idx) => {
            // Check if there is a black key immediately above this white key
            const nextMidi = wk.midi + 1;
            const hasBlack = isBlackKey(nextMidi) && nextMidi <= END_MIDI;
            const isPlayingBlack = activeMidis.includes(nextMidi);

            return (
              <div key={wk.midi} className="flex-1 relative h-full">
                {hasBlack && (
                  <div
                    className={`piano-black-key absolute top-0 right-[-28%] w-[56%] h-[62%] rounded-b-md z-10 border transition-all duration-150 ${
                      isPlayingBlack
                        ? 'bg-indigo-500 border-indigo-300 shadow-lg shadow-indigo-500/70 ring-2 ring-indigo-200 animate-pulse'
                        : revealedMidis.includes(nextMidi)
                        ? 'bg-emerald-400 border-emerald-300 shadow-md shadow-emerald-400/40'
                        : rootMidi === nextMidi
                        ? 'bg-amber-500 border-amber-400'
                        : 'piano-black-key bg-slate-900 border-slate-700'
                    }`}
                  >
                    {isPlayingBlack && (
                      <div className="absolute inset-0 bg-gradient-to-t from-indigo-300/40 to-transparent rounded-b-md" />
                    )}
                    {rootMidi === nextMidi && (
                      <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-amber-300" />
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
