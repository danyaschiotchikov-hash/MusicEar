import React, { useState } from 'react';
import { PlaybackSettings } from '../types';
import { NOTE_NAMES } from '../data/musicData';
import {
  getScaleDegreeChordsForStudy,
  ScaleDegreeStudyItem,
  ScaleDegreeInversionStudy,
} from '../audio/solfegeHelper';
import { audioEngine } from '../audio/audioEngine';
import {
  X,
  BookOpen,
  Volume2,
  Sparkles,
  Layers,
  ArrowRight,
  Music,
} from 'lucide-react';

interface ScaleDegreeStudyModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: PlaybackSettings;
  activeTonic: string;
  activeMode: 'major' | 'minor';
  onPlayCadence: (tonic: string, mode: 'major' | 'minor') => void;
  onVisualNotes?: (midis: number[]) => void;
}

export const ScaleDegreeStudyModal: React.FC<ScaleDegreeStudyModalProps> = ({
  isOpen,
  onClose,
  settings,
  activeTonic,
  activeMode,
  onPlayCadence,
  onVisualNotes,
}) => {
  const [selectedTonic, setSelectedTonic] = useState<string>(activeTonic === 'random' ? 'A' : activeTonic);
  const [selectedMode, setSelectedMode] = useState<'major' | 'minor'>(activeMode);
  const [playingItemId, setPlayingItemId] = useState<string | null>(null);

  if (!isOpen) return null;

  const chords: ScaleDegreeStudyItem[] = getScaleDegreeChordsForStudy(selectedTonic, selectedMode);

  const playInversionSound = (inv: ScaleDegreeInversionStudy, itemId: string) => {
    audioEngine.stopAll();
    setPlayingItemId(`${itemId}-${inv.symbol}`);
    const now = audioEngine.getContext().currentTime;
    const dur = 1.4 / settings.tempo;

    inv.notesMidi.forEach((m) => {
      audioEngine.playSingleNote(m, now, dur, 1.15, settings);
    });

    if (onVisualNotes) {
      onVisualNotes(inv.notesMidi);
    }

    window.setTimeout(() => {
      if (onVisualNotes) onVisualNotes([]);
      setPlayingItemId(null);
    }, dur * 1000);
  };

  const playArpeggioSound = (inv: ScaleDegreeInversionStudy, itemId: string) => {
    audioEngine.stopAll();
    setPlayingItemId(`${itemId}-${inv.symbol}-arp`);
    const now = audioEngine.getContext().currentTime;
    const step = 0.22 / settings.tempo;
    const noteDur = step * 1.5;

    const activeMidis: number[] = [];
    inv.notesMidi.forEach((m, idx) => {
      audioEngine.playSingleNote(m, now + idx * step, noteDur, 1.2, settings);
      window.setTimeout(() => {
        activeMidis.push(m);
        if (onVisualNotes) onVisualNotes([...activeMidis]);
      }, idx * step * 1000);
    });

    const totalDur = inv.notesMidi.length * step + 0.6;
    window.setTimeout(() => {
      if (onVisualNotes) onVisualNotes([]);
      setPlayingItemId(null);
    }, totalDur * 1000);
  };

  const keyTitle = `${selectedTonic} ${selectedMode === 'major' ? 'мажор (dur)' : 'минор (moll)'}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[92vh] bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-slate-900/95 sticky top-0 z-10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2">
                <span>Аккорды в тональности по ступеням</span>
              </h2>
              <p className="text-xs text-slate-400">
                Теория ладовых функций, состав аккордов и обращения
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition cursor-pointer"
            title="Закрыть справочник"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tonality Configuration Bar */}
        <div className="bg-slate-950/70 border-b border-slate-800/80 p-3 sm:px-5 flex flex-wrap items-center justify-between gap-3">
          {/* Tonic Selector & Mode Toggle */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-slate-300 font-semibold">
              <span>Тональность:</span>
              <select
                value={selectedTonic}
                onChange={(e) => setSelectedTonic(e.target.value)}
                className="bg-slate-900 border border-indigo-500/40 text-indigo-300 font-mono font-bold rounded-lg px-2.5 py-1 text-xs cursor-pointer hover:border-indigo-400 focus:outline-none"
              >
                {NOTE_NAMES.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>

            {/* Major / Minor Switch */}
            <div className="flex items-center gap-0.5 bg-slate-900 border border-slate-800 p-0.5 rounded-lg">
              <button
                type="button"
                onClick={() => setSelectedMode('major')}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition cursor-pointer ${
                  selectedMode === 'major'
                    ? 'bg-indigo-600 text-white font-bold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Мажор
              </button>
              <button
                type="button"
                onClick={() => setSelectedMode('minor')}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition cursor-pointer ${
                  selectedMode === 'minor'
                    ? 'bg-indigo-600 text-white font-bold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Минор
              </button>
            </div>
          </div>

          {/* Cadence Button */}
          <button
            type="button"
            onClick={() => onPlayCadence(selectedTonic, selectedMode)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 hover:text-white border border-indigo-500/40 rounded-xl text-xs font-semibold transition cursor-pointer active:scale-95 shadow-sm"
            title="Прослушать классическую каденцию настройки (T-S-D7-T)"
          >
            <Music className="w-3.5 h-3.5" />
            <span>Каденция настройки (T-S-D-T)</span>
          </button>
        </div>

        {/* Chords Content List */}
        <div className="p-3 sm:p-5 overflow-y-auto space-y-3.5 flex-1">
          <div className="text-xs text-slate-400 flex items-center justify-between pb-1 border-b border-slate-800/50">
            <span>
              Ступени и гармонические функции для <strong>{keyTitle}</strong>:
            </span>
            <span className="text-[11px] text-slate-500">7 основных ступеней</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {chords.map((chord) => {
              const functionColor =
                chord.functionGroup.includes('Тоника')
                  ? 'bg-blue-500/15 text-blue-300 border-blue-500/30'
                  : chord.functionGroup.includes('Субдоминанта')
                  ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                  : chord.functionGroup.includes('Доминанта')
                  ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                  : 'bg-purple-500/15 text-purple-300 border-purple-500/30';

              return (
                <div
                  key={chord.id}
                  className="bg-slate-950/60 border border-slate-800/90 rounded-xl p-3.5 flex flex-col justify-between space-y-2.5 hover:border-slate-700 transition"
                >
                  {/* Top Bar: Degree Badge, Symbol, Function */}
                  <div className="flex items-start justify-between gap-2 border-b border-slate-800/60 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-700 text-white font-serif font-black flex items-center justify-center text-sm shadow-inner">
                        {chord.degreeRoman}
                      </span>
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-slate-200">
                          {chord.degreeNameRu.split('—')[1]?.trim() || chord.degreeNameRu}
                        </h4>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {chord.symbol}
                        </span>
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${functionColor}`}
                    >
                      {chord.functionGroup}
                    </span>
                  </div>

                  {/* Notes of Root Chord */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[11px] text-slate-400 font-semibold">Ноты:</span>
                    {chord.notesNames.map((n, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-md bg-slate-900 text-emerald-300 font-mono font-bold text-xs border border-emerald-500/30"
                      >
                        {n}
                      </span>
                    ))}
                    <span className="text-[11px] text-slate-400 ml-auto italic">
                      ({chord.qualityRu})
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-300/90 leading-relaxed">
                    {chord.descriptionRu}
                  </p>

                  {/* Inversions and Listening Buttons */}
                  <div className="pt-2 border-t border-slate-800/60 space-y-1.5">
                    <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">
                      Виды и обращения:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {chord.inversions.map((inv, idx) => {
                        const isThisPlaying =
                          playingItemId === `${chord.id}-${inv.symbol}` ||
                          playingItemId === `${chord.id}-${inv.symbol}-arp`;

                        return (
                          <div
                            key={idx}
                            className="flex items-center gap-1 bg-slate-900/90 border border-slate-800 rounded-lg p-1 pr-1.5"
                          >
                            <span className="text-[11px] font-bold text-indigo-300 font-mono px-1">
                              {inv.symbol}
                            </span>
                            {/* Harmonic Play */}
                            <button
                              type="button"
                              onClick={() => playInversionSound(inv, chord.id)}
                              className={`p-1 rounded-md transition cursor-pointer ${
                                isThisPlaying
                                  ? 'bg-indigo-600 text-white animate-pulse'
                                  : 'text-slate-400 hover:text-emerald-300 hover:bg-slate-800'
                              }`}
                              title={`Прослушать ${inv.name} гармонически`}
                            >
                              <Volume2 className="w-3.5 h-3.5" />
                            </button>
                            {/* Arpeggio Play */}
                            <button
                              type="button"
                              onClick={() => playArpeggioSound(inv, chord.id)}
                              className="p-1 rounded-md text-slate-400 hover:text-indigo-300 hover:bg-slate-800 transition cursor-pointer"
                              title={`Прослушать ${inv.name} арпеджио`}
                            >
                              <Layers className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Подсказка: нажимайте на значок динамика для прослушивания аккордов.</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition cursor-pointer text-xs"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};
