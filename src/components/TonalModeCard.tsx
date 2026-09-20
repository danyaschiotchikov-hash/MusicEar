import React, { useState, useMemo } from 'react';
import { PlaybackSettings } from '../types';
import { SmartVoicingTask, getTonalChordResolutionRows } from '../audio/solfegeHelper';
import { TONAL_DEGREES } from '../audio/tonalChords';
import { TonalChordSettingsModal } from './TonalChordSettingsModal';
import { ResolutionSchemeView, ResolutionVoiceRow } from './ResolutionSchemeView';
import { TONIC_NOTE_OPTIONS } from '../data/musicData';
import {
  Music,
  Volume2,
  Settings,
  Sparkles,
} from 'lucide-react';

interface TonalModeCardProps {
  task: SmartVoicingTask | null;
  settings: PlaybackSettings;
  activePlayingMidis: number[];
  onReveal: () => void;
  onSettingsChange?: (updated: Partial<PlaybackSettings>) => void;
  onPlayCadence: (tonic: string, mode: 'major' | 'minor') => void;
  onVisualNotes?: (midis: number[]) => void;
  onPreviewDegree?: (degreeId: string) => void;
}

export const TonalModeCard: React.FC<TonalModeCardProps> = ({
  task,
  settings,
  onReveal,
  onSettingsChange,
  onPlayCadence,
  onPreviewDegree,
}) => {
  const [selectedDegreeGuess, setSelectedDegreeGuess] = useState<string | null>(null);
  const [auditionedDegreeId, setAuditionedDegreeId] = useState<string | null>(null);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  const resolutionRows: ResolutionVoiceRow[] = useMemo(() => {
    if (!task) return [];
    return getTonalChordResolutionRows(task);
  }, [task]);

  if (!task) {
    return (
      <div className="w-full p-8 text-center bg-slate-900/40 rounded-2xl border border-slate-800">
        <p className="text-slate-400 text-sm">Загрузка задания...</p>
      </div>
    );
  }

  const isRevealed = task.revealed;

  const currentScaleMode = settings.tonalScaleMode ?? 'major';
  const isMinorActive =
    currentScaleMode === 'minor' ||
    (currentScaleMode === 'any' && task.keyScaleMode === 'minor');

  const handleDegreeClick = (degId: string) => {
    setAuditionedDegreeId(degId);

    if (!isRevealed) {
      setSelectedDegreeGuess(degId);
      onReveal();
    }

    if (onPreviewDegree) {
      onPreviewDegree(degId);
    }
  };

  const handleCalibrationClick = () => {
    const effectiveTonic = task.baseNoteName || (settings.tonalRootNote ?? 'C');
    const effectiveMode =
      currentScaleMode === 'minor'
        ? 'minor'
        : currentScaleMode === 'major'
        ? 'major'
        : task.keyScaleMode || 'major';

    onPlayCadence(effectiveTonic, effectiveMode);
  };

  const currentAllowed = settings.tonalAllowedDegrees ?? TONAL_DEGREES.map((d) => d.id);

  const functionGroups = [
    {
      title: 'T — Тоника',
      badgeClass: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
      ids: ['deg_I', 'deg_K64'],
    },
    {
      title: 'S — Субдоминанта',
      badgeClass: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      ids: ['deg_IV', 'deg_II', 'deg_II7', 'deg_II7_alt', 'deg_S_alt'],
    },
    {
      title: 'D — Доминанта',
      badgeClass: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
      ids: ['deg_V', 'deg_V7', 'deg_VII', 'deg_D_add6', 'deg_D9'],
    },
    {
      title: 'Медианты',
      badgeClass: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
      ids: ['deg_VI', 'deg_III'],
    },
  ];

  return (
    <div className="w-full flex flex-col items-center gap-3">
      {/* Main Container Card */}
      <div className="w-full bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-3 sm:p-4 shadow-xl flex flex-col gap-3">
        {/* Top Minimal Single-Line Toolbar */}
        <div className="w-full flex items-center justify-between gap-1.5 sm:gap-2 border-b border-slate-800/70 pb-2 overflow-x-auto no-scrollbar [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Tonic Picker with Separated Enharmonics */}
            <select
              value={settings.tonalRootNote ?? 'C'}
              onChange={(e) => onSettingsChange?.({ tonalRootNote: e.target.value })}
              className="bg-slate-950 border border-slate-700 text-indigo-300 font-mono font-bold rounded-lg px-2 py-1 text-xs cursor-pointer focus:outline-none focus:border-indigo-500 shrink-0"
              title="Выбор тоники"
            >
              <option value="random">🎲 Случайно</option>
              {TONIC_NOTE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            {/* Mode Segments (Major / Minor / Any) - Compact */}
            <div className="flex items-center bg-slate-950/80 border border-slate-800 p-0.5 rounded-lg text-[11px] sm:text-xs font-semibold shrink-0">
              <button
                type="button"
                onClick={() => onSettingsChange?.({ tonalScaleMode: 'major' })}
                className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md transition cursor-pointer ${
                  currentScaleMode === 'major'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Мажор
              </button>
              <button
                type="button"
                onClick={() => onSettingsChange?.({ tonalScaleMode: 'minor' })}
                className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md transition cursor-pointer ${
                  currentScaleMode === 'minor'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Минор
              </button>
              <button
                type="button"
                onClick={() => onSettingsChange?.({ tonalScaleMode: 'any' })}
                className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md transition cursor-pointer ${
                  currentScaleMode === 'any'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Любой
              </button>
            </div>

            {/* Cadence Tuning Button - Compact */}
            <button
              type="button"
              onClick={handleCalibrationClick}
              className="flex items-center gap-1 px-2.5 py-1 bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-500/40 text-emerald-300 rounded-lg text-[11px] sm:text-xs font-semibold transition cursor-pointer active:scale-95 whitespace-nowrap shrink-0"
              title="Слушать кадансовую настройку в тональности"
            >
              <Music className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Настройка</span>
            </button>
          </div>

          {/* Right Action: Settings - Compact */}
          <button
            type="button"
            onClick={() => setIsSettingsModalOpen(true)}
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-950/70 hover:bg-slate-800 border border-slate-700/80 text-slate-300 text-[11px] sm:text-xs font-semibold transition cursor-pointer whitespace-nowrap shrink-0"
            title="Выбор активных аккордов"
          >
            <Settings className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span>Аккорды ({currentAllowed.length})</span>
          </button>
        </div>

        {/* Function Groups & Chord Buttons */}
        <div className="w-full space-y-2.5 pt-1">
          {functionGroups.map((grp) => {
            const groupDegrees = grp.ids
              .map((id) => TONAL_DEGREES.find((d) => d.id === id))
              .filter((d): d is NonNullable<typeof d> => Boolean(d));

            return (
              <div key={grp.title} className="w-full flex flex-col gap-1.5">
                <div className="flex items-center gap-2 px-1">
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${grp.badgeClass}`}>
                    {grp.title}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 w-full">
                  {groupDegrees.map((deg) => {
                    const label = isMinorActive ? deg.labelMinor : deg.labelMajor;
                    const nameRu = isMinorActive ? deg.nameMinorRu : deg.nameMajorRu;
                    const isPicked = selectedDegreeGuess === deg.id;
                    const isTarget = isRevealed && task.degreeId === deg.id;
                    const isAuditioned = isRevealed && auditionedDegreeId === deg.id;
                    const isIncluded = currentAllowed.includes(deg.id);

                    let btnStyle = 'bg-slate-950/70 border-slate-800 text-slate-200 hover:bg-slate-800/80 hover:border-slate-700';

                    if (!isIncluded) {
                      btnStyle = 'bg-slate-950/30 border-slate-800/40 text-slate-600 opacity-50';
                    }

                    if (isRevealed) {
                      if (isTarget) {
                        btnStyle = 'bg-emerald-950/90 border-emerald-500 text-emerald-200 font-bold ring-2 ring-emerald-500/70 shadow-lg shadow-emerald-950/50 opacity-100';
                      } else if (isPicked) {
                        btnStyle = 'bg-rose-950/90 border-rose-500 text-rose-200 font-semibold opacity-100';
                      } else if (isAuditioned) {
                        btnStyle = 'bg-indigo-950/90 border-indigo-400 text-indigo-200 font-bold ring-2 ring-indigo-500/70 opacity-100';
                      } else {
                        btnStyle = 'bg-slate-950/50 border-slate-800/60 text-slate-400 hover:bg-slate-800/80 hover:text-white';
                      }
                    }

                    return (
                      <button
                        key={deg.id}
                        type="button"
                        onClick={() => handleDegreeClick(deg.id)}
                        className={`py-2 px-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between transition cursor-pointer active:scale-95 ${btnStyle}`}
                        title={nameRu}
                      >
                        <span className="font-mono font-bold text-xs sm:text-sm">{label}</span>
                        {isAuditioned && <Volume2 className="w-3.5 h-3.5 text-indigo-400 animate-pulse shrink-0 ml-1" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Revealed Answer & Voice Breakdown */}
        {isRevealed && (
          <div className="w-full bg-slate-950/90 border border-slate-800 rounded-xl p-3.5 sm:p-4 text-left space-y-3 animate-in fade-in zoom-in-95 duration-150 shadow-lg mt-2">
            {/* Header: Chord & Inversion & Roman Degree */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="font-bold text-amber-300 font-mono bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-lg text-xs sm:text-sm">
                  {task.functionSymbolRu || task.degreeRoman}
                </span>
                <h3 className="text-sm sm:text-base font-extrabold text-white">
                  {task.chordName}
                </h3>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-md">
                  {task.chordInversionRu}
                </span>
                {task.keyNameRu && (
                  <span className="text-xs font-mono text-slate-300 bg-slate-900 border border-slate-700 px-2 py-0.5 rounded-md">
                    {task.keyNameRu}
                  </span>
                )}
              </div>
            </div>

            {/* Voice stack (Soprano -> Alto -> Tenor -> Bass) */}
            <div className="flex flex-col gap-1 w-full max-w-sm mx-auto pt-1">
              {task.voicesBottomToTop && task.voicesBottomToTop.length > 0 ? (
                [...task.voicesBottomToTop].reverse().map((v, vIdx) => {
                  const isBass = vIdx === task.voicesBottomToTop.length - 1;
                  const isBase = v.midi === task.baseMidi;

                  return (
                    <div
                      key={vIdx}
                      className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl font-bold font-mono text-xs sm:text-sm border shadow-xs ${
                        isBass
                          ? 'bg-amber-950/70 text-amber-200 border-amber-500/50'
                          : isBase
                          ? 'bg-indigo-950/70 text-indigo-100 border-indigo-400/50'
                          : 'bg-slate-900/90 text-white border-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-amber-400 text-xs font-mono font-black">
                          {v.degreeRoman}
                        </span>
                        <span className="text-[11px] font-sans font-medium text-slate-400">
                          {v.voiceName}
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-100 text-xs font-bold">
                        {v.noteNameWithOctave}
                      </span>
                    </div>
                  );
                })
              ) : (
                <div className="flex flex-wrap items-center justify-center gap-1.5 font-mono text-xs text-slate-300">
                  <span>{task.chordNotesMidi.join(' - ')}</span>
                </div>
              )}
            </div>

            {/* Resolution Scheme */}
            {resolutionRows.length > 0 && (
              <ResolutionSchemeView
                title="Схема разрешения в тональности"
                tonalityName={task.keyNameRu}
                targetName={task.resolutionsScheme?.[0]?.formula}
                rows={resolutionRows}
              />
            )}
          </div>
        )}
      </div>

      {/* Tonal Chord Selection Settings Modal */}
      <TonalChordSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={settings}
        onSettingsChange={(updated) => onSettingsChange?.(updated)}
      />
    </div>
  );
};
