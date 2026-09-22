import React, { useState, useCallback } from 'react';
import { PlaybackSettings } from '../types';
import { audioEngine } from '../audio/audioEngine';
import { NOTE_NAMES, NOTE_NAMES_RU } from '../data/musicData';

interface InteractivePianoKeyboardProps {
  settings: PlaybackSettings;
  baseMidi: number | null;
  chordMidis: number[];
  revealed: boolean;
  activePlayingMidis?: number[];
  chordNoteRoles?: Record<number, string>;
  onKeyPlay?: (midi: number) => void;
  startMidi?: number; // default 48 (C3)
  endMidi?: number;   // default 72 (C5)
}

interface KeyData {
  midi: number;
  noteName: string;
  isBlack: boolean;
  whiteIndex: number;
  labelRu: string;
  octave: number;
}

export const InteractivePianoKeyboard: React.FC<InteractivePianoKeyboardProps> = ({
  settings,
  baseMidi,
  chordMidis,
  revealed,
  activePlayingMidis = [],
  chordNoteRoles = {},
  onKeyPlay,
  startMidi = 48, // C3
  endMidi = 72,   // C5
}) => {
  const [pressedMidi, setPressedMidi] = useState<number | null>(null);

  // Generate 2 octaves of keys from startMidi to endMidi
  const keys = React.useMemo(() => {
    const list: KeyData[] = [];
    let currentWhiteIndex = 0;

    for (let m = startMidi; m <= endMidi; m++) {
      const pitchClass = ((m % 12) + 12) % 12;
      const isBlack = [1, 3, 6, 8, 10].includes(pitchClass);
      const noteName = NOTE_NAMES[pitchClass];
      const labelRu = NOTE_NAMES_RU[pitchClass];
      const octave = Math.floor(m / 12) - 1;

      list.push({
        midi: m,
        noteName,
        isBlack,
        whiteIndex: isBlack ? -1 : currentWhiteIndex,
        labelRu,
        octave,
      });

      if (!isBlack) {
        currentWhiteIndex++;
      }
    }
    return { keyList: list, totalWhiteKeys: currentWhiteIndex };
  }, [startMidi, endMidi]);

  const handleKeyTouch = useCallback(
    (midi: number, e: React.SyntheticEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setPressedMidi(midi);

      // Play note instantly via audio engine
      const ctx = audioEngine.getContext();
      audioEngine.playSingleNote(midi, ctx.currentTime, 1.2, 1.1, settings);

      if (onKeyPlay) {
        onKeyPlay(midi);
      }

      window.setTimeout(() => {
        setPressedMidi((prev) => (prev === midi ? null : prev));
      }, 350);
    },
    [settings, onKeyPlay]
  );

  const whiteKeys = keys.keyList.filter((k) => !k.isBlack);
  const blackKeys = keys.keyList.filter((k) => k.isBlack);

  return (
    <div className="w-full flex flex-col items-center select-none">
      {/* Piano Stage Container */}
      <div className="w-full max-w-3xl overflow-x-auto pb-1 no-scrollbar [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div
          className="relative h-32 sm:h-36 md:h-40 rounded-2xl p-2 sm:p-2.5 bg-slate-950 border border-slate-800/90 shadow-2xl flex mx-auto justify-center min-w-[540px]"
          style={{ userSelect: 'none' }}
        >
          {/* White Keys Row */}
          <div className="flex w-full h-full relative">
            {whiteKeys.map((k) => {
              const isBase = baseMidi === k.midi;
              const isChord = revealed && chordMidis.includes(k.midi);
              const isPlaying =
                pressedMidi === k.midi ||
                (revealed ? activePlayingMidis.includes(k.midi) : (isBase && activePlayingMidis.includes(k.midi)));
              const role = chordNoteRoles[k.midi];

              let keyStyle = 'piano-white-key bg-slate-100 text-slate-800 border-slate-300 hover:bg-slate-200';
              if (isPlaying) {
                keyStyle = 'bg-indigo-500 text-white border-indigo-400 shadow-lg shadow-indigo-500/50 ring-2 ring-indigo-300 z-10 font-black';
              } else if (isBase && isChord) {
                keyStyle = 'bg-cyan-400 text-slate-950 border-cyan-300 shadow-lg shadow-cyan-500/50 ring-2 ring-cyan-200 z-10 font-black';
              } else if (isBase) {
                keyStyle = 'bg-sky-400 text-slate-950 border-sky-300 shadow-lg shadow-sky-500/50 ring-2 ring-sky-200 z-10 font-black';
              } else if (isChord) {
                keyStyle = 'bg-emerald-400 text-slate-950 border-emerald-300 shadow-lg shadow-emerald-500/50 ring-2 ring-emerald-200 z-10 font-black';
              }

              return (
                <button
                  key={k.midi}
                  type="button"
                  onMouseDown={(e) => handleKeyTouch(k.midi, e)}
                  onTouchStart={(e) => handleKeyTouch(k.midi, e)}
                  className={`piano-white-key flex-1 h-full rounded-b-lg border-r last:border-r-0 flex flex-col justify-end pb-2 items-center transition-all active:scale-[0.98] cursor-pointer relative shadow-sm ${keyStyle}`}
                  title={`${k.noteName}${k.octave} (${k.labelRu})`}
                />
              );
            })}
          </div>

          {/* Black Keys Layer */}
          <div className="absolute inset-x-2 sm:inset-x-2.5 top-2 sm:top-2.5 h-20 sm:h-22 md:h-24 pointer-events-none flex">
            {whiteKeys.map((wKey, idx) => {
              // Find if there's a black key right after this white key
              const bKey = blackKeys.find((b) => b.midi === wKey.midi + 1);
              if (!bKey || idx === whiteKeys.length - 1) {
                return <div key={wKey.midi} className="flex-1 h-full pointer-events-none" />;
              }

              const isBase = baseMidi === bKey.midi;
              const isChord = revealed && chordMidis.includes(bKey.midi);
              const isPlaying =
                pressedMidi === bKey.midi ||
                (revealed ? activePlayingMidis.includes(bKey.midi) : (isBase && activePlayingMidis.includes(bKey.midi)));

              let keyStyle = 'piano-black-key bg-slate-900 border-slate-700 hover:bg-slate-800';
              if (isPlaying) {
                keyStyle = 'bg-indigo-500 border-indigo-300 shadow-xl shadow-indigo-500/60 ring-2 ring-indigo-200 z-20';
              } else if (isBase && isChord) {
                keyStyle = 'bg-cyan-400 border-cyan-200 shadow-xl shadow-cyan-500/60 ring-2 ring-cyan-100 z-20';
              } else if (isBase) {
                keyStyle = 'bg-sky-400 border-sky-200 shadow-xl shadow-sky-500/60 ring-2 ring-sky-100 z-20';
              } else if (isChord) {
                keyStyle = 'bg-emerald-400 border-emerald-200 shadow-xl shadow-emerald-500/60 ring-2 ring-emerald-100 z-20';
              }

              return (
                <div key={wKey.midi} className="flex-1 h-full relative pointer-events-none">
                  <button
                    type="button"
                    onMouseDown={(e) => handleKeyTouch(bKey.midi, e)}
                    onTouchStart={(e) => handleKeyTouch(bKey.midi, e)}
                    className={`piano-black-key absolute top-0 -right-[32%] sm:-right-[35%] w-[64%] sm:w-[70%] h-full rounded-b-md border shadow-lg flex flex-col justify-end pb-2 items-center transition-all active:scale-[0.98] cursor-pointer pointer-events-auto z-10 ${keyStyle}`}
                    title={`${bKey.noteName}${bKey.octave}`}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
