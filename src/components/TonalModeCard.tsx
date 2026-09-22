import React, { useState, useMemo, useEffect } from 'react';
import { PlaybackSettings, TonalThemeId } from '../types';
import {
  SmartVoicingTask,
  getTonalChordResolutionRows,
  createProgressionFromTonalTask,
} from '../audio/solfegeHelper';
import {
  TONAL_DEGREES,
  POPULAR_TONAL_CHORDS,
  PopularTonalChordItem,
  TONAL_THEMES,
  getTonalThemeById,
  getChordLetterNotation,
} from '../audio/tonalChords';
import { ResolutionSchemeView, ResolutionVoiceRow } from './ResolutionSchemeView';
import { TONIC_NOTE_OPTIONS } from '../data/musicData';
import { TonalChordSettingsModal } from './TonalChordSettingsModal';
import { ProgressionGrandStaff } from './ProgressionGrandStaff';
import { audioEngine } from '../audio/audioEngine';
import {
  Volume2,
  Eye,
  SlidersHorizontal,
  Music,
  RotateCcw,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Target,
  Play,
  Layers,
  LayoutGrid,
} from 'lucide-react';

export interface TonalModeCardProps {
  task: SmartVoicingTask | null;
  settings: PlaybackSettings;
  activePlayingMidis: number[];
  onReveal: () => void;
  onSettingsChange?: (updated: Partial<PlaybackSettings>) => void;
  onPlayCadence: (tonic: string, mode: 'major' | 'minor') => void;
  onVisualNotes?: (midis: number[]) => void;
  onPreviewDegree?: (degreeId: string, voicingId?: string) => void;
  onNewTask?: () => void;
  onReplay?: (overrideStyle?: 'harmonic' | 'arpeggio') => void;
  onReplayAll?: (overrideStyle?: 'harmonic' | 'arpeggio') => void;
}

/**
 * Visual renderer for chord symbols with stacked fractional inversions (5/3, 6/4, 6/5, 4/3)
 * or subscript numbers (6, 7, 2).
 */
export const FormattedChordSymbol: React.FC<{
  symbol: string;
  className?: string;
}> = ({ symbol, className = '' }) => {
  const fracMatch = symbol.match(/^(.+?)(\d+)\/(\d+)$/);
  if (fracMatch) {
    const [, base, top, bottom] = fracMatch;
    return (
      <span className={`inline-flex items-center font-mono font-bold ${className}`}>
        <span>{base}</span>
        <span className="inline-flex flex-col text-[10px] sm:text-[11px] leading-[0.8] ml-0.5 tracking-tighter text-left select-none font-semibold">
          <span>{top}</span>
          <span>{bottom}</span>
        </span>
      </span>
    );
  }

  const singleMatch = symbol.match(/^([A-Za-z0-9#°ø♭]+?)(\d+)$/);
  if (singleMatch) {
    const [, base, digit] = singleMatch;
    return (
      <span className={`inline-flex items-baseline font-mono font-bold ${className}`}>
        <span>{base}</span>
        <sub className="text-[11px] sm:text-[12px] ml-0.5 font-bold leading-none select-none">{digit}</sub>
      </span>
    );
  }

  return <span className={`font-mono font-bold ${className}`}>{symbol}</span>;
};

export const TonalModeCard: React.FC<TonalModeCardProps> = ({
  task,
  settings,
  onReveal,
  onSettingsChange,
  onPlayCadence,
  onVisualNotes,
  onPreviewDegree,
  onNewTask,
  onReplay,
}) => {
  const [selectedGuessId, setSelectedGuessId] = useState<string | null>(null);
  const [auditionedId, setAuditionedId] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isTableView, setIsTableView] = useState<boolean>(false);
  const [activeStaffStepIndex, setActiveStaffStepIndex] = useState<number | null>(null);

  useEffect(() => {
    setSelectedGuessId(null);
    setAuditionedId(null);
    setActiveStaffStepIndex(null);
  }, [task?.chordNotesMidi, task?.degreeId, task?.voicingId]);

  const realizedProgression = useMemo(() => {
    if (!task) return null;
    return createProgressionFromTonalTask(task);
  }, [task]);

  const handlePlayStaffStep = (stepIdx: number) => {
    if (!realizedProgression || !realizedProgression.steps[stepIdx]) return;
    const step = realizedProgression.steps[stepIdx];
    setActiveStaffStepIndex(stepIdx);
    if (onVisualNotes) {
      onVisualNotes(step.midisSATB);
    }
    audioEngine.playProgressionStep(step.midisSATB, settings, () => {
      setActiveStaffStepIndex(null);
      if (onVisualNotes) {
        onVisualNotes([]);
      }
    });
  };

  const handlePlayResolutionSequence = () => {
    if (!realizedProgression || realizedProgression.steps.length < 2) return;
    audioEngine.stopAll();
    setActiveStaffStepIndex(0);
    if (onVisualNotes) onVisualNotes(realizedProgression.steps[0].midisSATB);

    audioEngine.playProgressionStep(realizedProgression.steps[0].midisSATB, settings, () => {
      window.setTimeout(() => {
        setActiveStaffStepIndex(1);
        if (onVisualNotes) onVisualNotes(realizedProgression.steps[1].midisSATB);
        audioEngine.playProgressionStep(realizedProgression.steps[1].midisSATB, settings, () => {
          setActiveStaffStepIndex(null);
          if (onVisualNotes) onVisualNotes([]);
        });
      }, 250);
    });
  };

  const resolutionRows: ResolutionVoiceRow[] = useMemo(() => {
    if (!task) return [];
    return getTonalChordResolutionRows(task);
  }, [task]);

  const isRevealed = task?.revealed ?? false;
  const currentScaleMode = settings.tonalScaleMode ?? 'major';
  const isMinorActive =
    currentScaleMode === 'minor' ||
    (currentScaleMode === 'any' && task?.keyScaleMode === 'minor');

  const rootOnly = settings.tonalRootPositionOnly ?? false;
  const currentNotation = settings.progressionNotation ?? 'roman';
  const effectiveTonic =
    task?.baseNoteName ||
    (settings.tonalRootNote !== 'random' ? settings.tonalRootNote : 'C') ||
    'C';

  const activeThemeId: TonalThemeId = settings.tonalTheme ?? 'tsd_basics';
  const currentThemeDef = useMemo(() => getTonalThemeById(activeThemeId), [activeThemeId]);

  const activeChords = useMemo(() => {
    if (activeThemeId === 'all_popular') {
      return rootOnly
        ? POPULAR_TONAL_CHORDS.filter((c) => c.isRootPosition)
        : POPULAR_TONAL_CHORDS;
    }

    if (activeThemeId === 'custom') {
      const allowedV = settings.tonalAllowedVoicings;
      const allowedD = settings.tonalAllowedDegrees;
      return POPULAR_TONAL_CHORDS.filter((c) => {
        if (rootOnly && !c.isRootPosition) return false;
        if (allowedV && allowedV.length > 0) return allowedV.includes(c.id);
        if (allowedD && allowedD.length > 0) return allowedD.includes(c.degreeId);
        return true;
      });
    }

    const themeChords = currentThemeDef.voicingIds
      .map((vid) => POPULAR_TONAL_CHORDS.find((c) => c.id === vid))
      .filter((c): c is PopularTonalChordItem => c !== undefined);

    if (rootOnly) {
      return themeChords.filter((c) => c.isRootPosition);
    }
    return themeChords;
  }, [activeThemeId, currentThemeDef, settings.tonalAllowedVoicings, settings.tonalAllowedDegrees, rootOnly]);

  const handleSelectTheme = (themeId: TonalThemeId) => {
    if (themeId === 'custom') {
      setIsSettingsOpen(true);
      return;
    }
    const themeDef = getTonalThemeById(themeId);
    onSettingsChange?.({
      tonalTheme: themeId,
      tonalAllowedVoicings: themeDef.voicingIds.length > 0 ? themeDef.voicingIds : undefined,
      tonalAllowedDegrees: themeDef.degreeIds.length > 0 ? themeDef.degreeIds : undefined,
      tonalRootPositionOnly: themeDef.rootPositionOnly,
      tonalInversionsMode: themeDef.rootPositionOnly ? 'root_only' : 'popular',
    });

    setTimeout(() => {
      onNewTask?.();
    }, 50);
  };

  const handleChordVoicingClick = (chord: PopularTonalChordItem) => {
    setAuditionedId(chord.id);

    if (!isRevealed) {
      setSelectedGuessId(chord.id);
      onReveal();
    }

    if (onPreviewDegree) {
      onPreviewDegree(chord.degreeId, chord.id);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (!isTableView && e.key >= '1' && e.key <= '9') {
        const idx = parseInt(e.key, 10) - 1;
        if (idx < activeChords.length) {
          e.preventDefault();
          handleChordVoicingClick(activeChords[idx]);
        }
        return;
      }

      if (e.code === 'Space' || e.key === 'Enter') {
        e.preventDefault();
        if (isRevealed) {
          onNewTask?.();
        } else {
          onReveal();
        }
        return;
      }

      if (e.key === 'r' || e.key === 'R' || e.key === 'к' || e.key === 'К') {
        e.preventDefault();
        onReplay?.();
        return;
      }

      if (e.key === 'c' || e.key === 'C' || e.key === 'с' || e.key === 'С') {
        e.preventDefault();
        onPlayCadence(effectiveTonic, isMinorActive ? 'minor' : 'major');
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isTableView, activeChords, isRevealed, effectiveTonic, isMinorActive, onNewTask, onReveal, onReplay, onPlayCadence]);

  const currentAllowed = settings.tonalAllowedDegrees ?? TONAL_DEGREES.map((d) => d.id);
  const currentAllowedVoicings = settings.tonalAllowedVoicings;

  const getChordDisplay = (chord: PopularTonalChordItem) => {
    const romanSym = isMinorActive ? chord.symbolRomanMinor : chord.symbolRomanMajor;
    const analSym = isMinorActive ? chord.symbolMinor : chord.symbolMajor;
    const letterSym = getChordLetterNotation(chord.id, effectiveTonic, !isMinorActive);
    const fullName = isMinorActive ? chord.nameMinorRu : chord.nameMajorRu;

    if (currentNotation === 'roman') {
      return {
        primary: romanSym,
        secondary: analSym !== romanSym ? analSym : null,
        fullName,
      };
    }
    if (currentNotation === 'letter') {
      return {
        primary: letterSym,
        secondary: analSym,
        fullName,
      };
    }
    return {
      primary: analSym,
      secondary: romanSym !== analSym ? romanSym : null,
      fullName,
    };
  };

  const functionalColumns = [
    {
      key: 'T',
      letter: 'T',
      name: 'Тоника',
      badgeClass: 'text-cyan-300 bg-cyan-950/60 border-cyan-800/30',
      colHeaderBg: 'bg-cyan-950/20 border-cyan-800/30 text-cyan-200',
    },
    {
      key: 'S',
      letter: 'S',
      name: 'Субдоминанта',
      badgeClass: 'text-amber-300 bg-amber-950/60 border-amber-800/30',
      colHeaderBg: 'bg-amber-950/20 border-amber-800/30 text-amber-200',
    },
    {
      key: 'D',
      letter: 'D',
      name: 'Доминанта',
      badgeClass: 'text-rose-300 bg-rose-950/60 border-rose-800/30',
      colHeaderBg: 'bg-rose-950/20 border-rose-800/30 text-rose-200',
    },
    {
      key: 'M',
      letter: 'M',
      name: 'Медианты',
      badgeClass: 'text-purple-300 bg-purple-950/60 border-purple-800/30',
      colHeaderBg: 'bg-purple-950/20 border-purple-800/30 text-purple-200',
    },
  ];

  if (!task) {
    return (
      <div className="w-full p-8 text-center bg-slate-900/40 rounded-2xl border border-white/10 backdrop-blur-xl">
        <p className="text-slate-400 text-xs sm:text-sm font-medium">Загрузка задания...</p>
      </div>
    );
  }

  const isGuessCorrect =
    selectedGuessId &&
    (task.voicingId === selectedGuessId ||
      (!POPULAR_TONAL_CHORDS.find((c) => c.id === selectedGuessId)?.isPopularInversion &&
        task.degreeId === POPULAR_TONAL_CHORDS.find((c) => c.id === selectedGuessId)?.degreeId &&
        task.isRootPosition));

  return (
    <div className="w-full flex flex-col gap-4 max-w-4xl mx-auto">
      {/* 1. APPLE HIG CONTROL HEADER BAR */}
      <div className="bg-slate-900/60 backdrop-blur-2xl border border-white/10 rounded-2xl p-4 shadow-xl space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Theme Selector & View Mode Segmented Pill */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <select
              value={activeThemeId}
              onChange={(e) => handleSelectTheme(e.target.value as TonalThemeId)}
              className="bg-slate-950/90 border border-white/10 text-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold focus:outline-none cursor-pointer transition shadow-inner hover:border-white/20"
            >
              {TONAL_THEMES.map((theme) => (
                <option key={theme.id} value={theme.id}>
                  {theme.title}
                </option>
              ))}
            </select>

            {/* iOS Segmented Pill View Switcher */}
            <div className="flex items-center bg-slate-950/80 border border-white/5 rounded-xl p-1 text-xs shadow-inner">
              <button
                type="button"
                onClick={() => setIsTableView(false)}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold ${
                  !isTableView
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Target className="w-3.5 h-3.5" />
                <span>Фокус</span>
              </button>
              <button
                type="button"
                onClick={() => setIsTableView(true)}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold ${
                  isTableView
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Все (T-S-D)</span>
              </button>
            </div>
          </div>

          {/* Tonality & Notation Pills */}
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={settings.tonalRootNote ?? 'C'}
              onChange={(e) => onSettingsChange?.({ tonalRootNote: e.target.value })}
              className="bg-slate-950/80 border border-white/10 text-amber-300 font-mono font-bold rounded-xl px-2.5 py-1.5 text-xs cursor-pointer focus:outline-none shadow-inner"
            >
              <option value="random">Случайная тоника</option>
              {TONIC_NOTE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            {/* Major / Minor Pill */}
            <div className="flex items-center bg-slate-950/80 border border-white/5 p-1 rounded-xl text-xs shadow-inner">
              <button
                type="button"
                onClick={() => onSettingsChange?.({ tonalScaleMode: 'major' })}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer text-xs font-semibold ${
                  currentScaleMode === 'major'
                    ? 'bg-slate-800 text-slate-100 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Мажор
              </button>
              <button
                type="button"
                onClick={() => onSettingsChange?.({ tonalScaleMode: 'minor' })}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer text-xs font-semibold ${
                  currentScaleMode === 'minor'
                    ? 'bg-slate-800 text-slate-100 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Минор
              </button>
            </div>

            {/* Inversions Pill */}
            <button
              type="button"
              onClick={() =>
                onSettingsChange?.({
                  tonalRootPositionOnly: !rootOnly,
                  tonalInversionsMode: !rootOnly ? 'root_only' : 'popular',
                })
              }
              className={`px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 shadow-inner ${
                !rootOnly
                  ? 'bg-indigo-950/50 border-indigo-500/40 text-indigo-300'
                  : 'bg-slate-950/80 border-white/10 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{!rootOnly ? 'С обращ.' : 'Только 5/3'}</span>
            </button>

            {/* Notation Pill */}
            <div className="flex items-center bg-slate-950/80 border border-white/5 p-1 rounded-xl text-xs shadow-inner">
              <button
                type="button"
                onClick={() => onSettingsChange?.({ progressionNotation: 'roman' })}
                className={`px-2 py-1 rounded-lg transition-all cursor-pointer text-xs font-semibold ${
                  currentNotation === 'roman'
                    ? 'bg-slate-800 text-slate-100'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                I-IV
              </button>
              <button
                type="button"
                onClick={() => onSettingsChange?.({ progressionNotation: 'analytical' })}
                className={`px-2 py-1 rounded-lg transition-all cursor-pointer text-xs font-semibold ${
                  currentNotation === 'analytical'
                    ? 'bg-slate-800 text-slate-100'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                T-S-D
              </button>
              <button
                type="button"
                onClick={() => onSettingsChange?.({ progressionNotation: 'letter' })}
                className={`px-2 py-1 rounded-lg transition-all cursor-pointer text-xs font-semibold ${
                  currentNotation === 'letter'
                    ? 'bg-slate-800 text-slate-100'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Буквы
              </button>
            </div>

            <button
              type="button"
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 rounded-xl bg-slate-950/80 hover:bg-slate-900 text-slate-400 hover:text-slate-200 border border-white/10 transition cursor-pointer shadow-inner"
              title="Настройки созвучий"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Pedagogical Hint Bar */}
        <div className="pt-2.5 border-t border-white/10 flex items-center justify-between text-xs text-slate-400 px-1">
          <span className="text-slate-300 font-medium">
            {currentThemeDef.descRu}
          </span>
          <span className="font-mono text-[11px] text-slate-400 shrink-0 ml-2">
            Тональность: <strong className="text-amber-300 font-bold">{task.keyNameRu}</strong>
          </span>
        </div>
      </div>

      {/* 2. MAIN INTERACTION GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 w-full items-start">
        {/* LEFT COLUMN: CHORDS SELECTION (FOCUSED OR TABLE) */}
        <div className="lg:col-span-7 xl:col-span-7 w-full bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-xl flex flex-col gap-3">
          {!isTableView ? (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <Target className="w-4 h-4 text-indigo-400" />
                  Созвучия темы: {currentThemeDef.title}
                </span>
                <span className="font-mono text-[11px] text-slate-500">
                  Клавиши: [1]–[{Math.min(activeChords.length, 9)}]
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {activeChords.map((chord, idx) => {
                  const display = getChordDisplay(chord);
                  const isTaskTarget =
                    task.voicingId === chord.id ||
                    (!chord.isPopularInversion && task.degreeId === chord.degreeId && task.isRootPosition);

                  const isPicked = selectedGuessId === chord.id;
                  const isTarget = isRevealed && isTaskTarget;
                  const isAuditioned = isRevealed && auditionedId === chord.id;

                  let cardStyle =
                    'border-white/10 hover:border-white/20 bg-slate-950/70 text-slate-200 hover:bg-slate-900/90 shadow-sm';
                  let tagBg = 'bg-slate-900 text-slate-400 border-white/5';

                  if (chord.functionGroup === 'T') {
                    tagBg = 'bg-cyan-950/50 text-cyan-300 border-cyan-800/40';
                  } else if (chord.functionGroup === 'S') {
                    tagBg = 'bg-amber-950/50 text-amber-300 border-amber-800/40';
                  } else if (chord.functionGroup === 'D') {
                    tagBg = 'bg-rose-950/50 text-rose-300 border-rose-800/40';
                  } else if (chord.functionGroup === 'M') {
                    tagBg = 'bg-purple-950/50 text-purple-300 border-purple-800/40';
                  }

                  if (isRevealed) {
                    if (isTarget) {
                      cardStyle =
                        'bg-emerald-950/80 border-emerald-500 text-emerald-100 ring-2 ring-emerald-500/50 shadow-md';
                    } else if (isPicked) {
                      cardStyle =
                        'bg-rose-950/80 border-rose-500 text-rose-200 ring-2 ring-rose-500/40';
                    } else if (isAuditioned) {
                      cardStyle =
                        'bg-indigo-950/80 border-indigo-400 text-indigo-200 ring-2 ring-indigo-500/40';
                    } else {
                      cardStyle = 'bg-slate-950/30 border-white/5 text-slate-500 opacity-40';
                    }
                  }

                  const stepShort = chord.bassStepRu ? chord.bassStepRu.replace(/\s*ст\.?/i, '') : '';

                  return (
                    <button
                      key={chord.id}
                      type="button"
                      onClick={() => handleChordVoicingClick(chord)}
                      className={`p-3.5 rounded-xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between gap-2 relative active:scale-98 ${cardStyle}`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-lg bg-slate-900/90 border border-white/10 text-[11px] font-mono font-bold flex items-center justify-center text-slate-400 shadow-inner">
                            {idx + 1}
                          </span>
                          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-lg border ${tagBg}`}>
                            {chord.functionGroup}
                          </span>
                        </div>

                        {chord.isPopularInversion && stepShort && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-lg bg-indigo-950/60 text-indigo-300 border border-indigo-800/40">
                            Бас: {stepShort}
                          </span>
                        )}
                      </div>

                      <div className="flex items-baseline justify-between pt-1">
                        <div>
                          <FormattedChordSymbol
                            symbol={display.primary}
                            className="text-xl font-bold text-amber-300 tracking-tight"
                          />
                          {display.secondary && (
                            <span className="text-xs text-slate-400 font-mono ml-2">
                              ({display.secondary})
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-slate-400 font-medium truncate max-w-[140px] text-right">
                          {display.fullName}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full items-start">
              {functionalColumns.map((col) => {
                const chordsInCol = POPULAR_TONAL_CHORDS.filter((c) => {
                  if (c.functionGroup !== col.key) return false;
                  if (rootOnly && !c.isRootPosition) return false;
                  return true;
                });

                const activeCount = chordsInCol.filter((c) => {
                  const degOk = currentAllowed.includes(c.degreeId);
                  const vOk = !currentAllowedVoicings || currentAllowedVoicings.includes(c.id);
                  return degOk && vOk;
                }).length;

                return (
                  <div
                    key={col.key}
                    className="w-full flex flex-col bg-slate-950/70 rounded-xl border border-white/10 p-2 gap-2 shadow-inner"
                  >
                    <div
                      className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg border ${col.colHeaderBg}`}
                    >
                      <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-lg border ${col.badgeClass}`}>
                        {col.letter}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400 font-bold">
                        {activeCount}
                      </span>
                    </div>

                    <div className="flex flex-col gap-1.5 w-full">
                      {chordsInCol.map((chord) => {
                        const display = getChordDisplay(chord);
                        const isTaskTarget =
                          task.voicingId === chord.id ||
                          (!chord.isPopularInversion && task.degreeId === chord.degreeId && task.isRootPosition);

                        const isPicked = selectedGuessId === chord.id;
                        const isTarget = isRevealed && isTaskTarget;
                        const isAuditioned = isRevealed && auditionedId === chord.id;

                        const isDegreeIncluded = currentAllowed.includes(chord.degreeId);
                        const isVoicingIncluded = !currentAllowedVoicings || currentAllowedVoicings.includes(chord.id);
                        const isIncluded = isDegreeIncluded && isVoicingIncluded;

                        let btnStyle =
                          'bg-slate-900/90 border-white/10 text-slate-200 hover:bg-slate-800 hover:border-white/20';

                        if (!isIncluded) {
                          btnStyle =
                            'bg-slate-950/30 border-white/5 text-slate-600 opacity-40 hover:opacity-75';
                        }

                        if (isRevealed) {
                          if (isTarget) {
                            btnStyle =
                              'bg-emerald-950/80 border-emerald-500 text-emerald-100 font-bold ring-2 ring-emerald-500/50 opacity-100 shadow-md';
                          } else if (isPicked) {
                            btnStyle =
                              'bg-rose-950/80 border-rose-500 text-rose-200 font-semibold opacity-100';
                          } else if (isAuditioned) {
                            btnStyle =
                              'bg-indigo-950/80 border-indigo-400 text-indigo-200 font-bold ring-2 ring-indigo-500/50 opacity-100';
                          } else {
                            btnStyle =
                              'bg-slate-950/40 border-white/5 text-slate-500 hover:bg-slate-800 hover:text-white';
                          }
                        }

                        const stepShort = chord.bassStepRu ? chord.bassStepRu.replace(/\s*ст\.?/i, '') : '';

                        return (
                          <button
                            key={chord.id}
                            type="button"
                            onClick={() => handleChordVoicingClick(chord)}
                            className={`w-full py-2 px-1.5 rounded-xl border flex flex-col items-center justify-center relative transition-all cursor-pointer shadow-sm active:scale-95 ${btnStyle}`}
                            title={`${display.fullName} (${chord.inversionTypeRu})`}
                          >
                            <FormattedChordSymbol
                              symbol={display.primary}
                              className="text-sm sm:text-base font-bold tracking-tight leading-none text-amber-300"
                            />
                            {chord.isPopularInversion && stepShort ? (
                              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-md bg-indigo-950/60 text-indigo-300 border border-indigo-800/40 leading-none mt-1 select-none">
                                {stepShort}
                              </span>
                            ) : null}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: ANSWER PANEL & EDUCATIONAL RESOLUTION */}
        <div className="lg:col-span-5 xl:col-span-5 w-full bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-xl flex flex-col gap-3">
          {isRevealed ? (
            <div className="w-full flex flex-col gap-3 animate-in fade-in duration-200">
              {/* Feedback Badge */}
              <div
                className={`p-3 rounded-xl border flex items-center justify-between text-xs shadow-sm ${
                  isGuessCorrect
                    ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-200'
                    : 'bg-indigo-950/50 border-indigo-500/40 text-indigo-200'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {isGuessCorrect ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  )}
                  <span className="font-bold text-sm">
                    {isGuessCorrect ? 'Верно!' : 'Правильный ответ:'}
                  </span>
                </div>
                {task.keyNameRu && (
                  <span className="font-mono font-bold text-amber-300 px-2.5 py-1 rounded-lg bg-black/30 border border-white/10">
                    {task.keyNameRu}
                  </span>
                )}
              </div>

              {/* Main Chord Identity Box */}
              <div className="p-3.5 bg-slate-950/80 border border-white/10 rounded-xl flex items-center justify-between shadow-inner">
                <div>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Созвучие в ладу:
                  </span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <FormattedChordSymbol
                      symbol={
                        currentNotation === 'roman'
                          ? (task.degreeRoman || task.functionSymbolRu)
                          : currentNotation === 'letter'
                          ? (task.voicingId ? getChordLetterNotation(task.voicingId, effectiveTonic, !isMinorActive) : task.chordName)
                          : (task.functionSymbolRu || task.degreeRoman)
                      }
                      className="text-2xl font-bold text-amber-300"
                    />
                    <span className="text-xs font-semibold text-slate-200">
                      {task.chordName}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[11px] font-mono font-semibold bg-slate-900 text-slate-300 border border-white/10 px-2.5 py-1 rounded-lg shadow-inner block">
                    {task.chordInversionRu}
                  </span>
                </div>
              </div>

              {/* Grand Staff Notation (САТБ) */}
              {realizedProgression && (
                <div className="flex flex-col gap-2 w-full">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                      <Music className="w-4 h-4 text-indigo-400" />
                      Партитура САТБ:
                    </span>
                    {realizedProgression.steps.length > 1 && (
                      <button
                        type="button"
                        onClick={handlePlayResolutionSequence}
                        className="px-2.5 py-1 rounded-xl bg-indigo-600/40 hover:bg-indigo-600/60 border border-indigo-500/40 text-indigo-200 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer shadow-md active:scale-95"
                        title="Воспроизвести созвучие и его разрешение в тонику"
                      >
                        <Play className="w-3 h-3 fill-indigo-300 text-indigo-300" />
                        <span>Разрешить</span>
                      </button>
                    )}
                  </div>

                  <ProgressionGrandStaff
                    progression={realizedProgression}
                    activeStepIndex={activeStaffStepIndex}
                    onPlayStep={handlePlayStaffStep}
                  />
                </div>
              )}

              {/* Resolution Scheme */}
              {resolutionRows.length > 0 && (
                <ResolutionSchemeView
                  title="Схема разрешения"
                  tonalityName={task.keyNameRu}
                  targetName={task.resolutionsScheme?.[0]?.formula}
                  rows={resolutionRows}
                />
              )}

              {/* Action Buttons Dock */}
              <div className="grid grid-cols-3 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => onPlayCadence(effectiveTonic, isMinorActive ? 'minor' : 'major')}
                  className="py-2.5 px-2 bg-slate-950/80 hover:bg-slate-900 border border-white/10 text-slate-200 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5 shadow-inner active:scale-95"
                >
                  <Music className="w-3.5 h-3.5 text-slate-400" />
                  <span>Каданс</span>
                </button>

                <button
                  type="button"
                  onClick={() => onReplay?.()}
                  className="py-2.5 px-2 bg-slate-950/80 hover:bg-slate-900 border border-white/10 text-slate-200 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5 shadow-inner active:scale-95"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                  <span>Повтор</span>
                </button>

                <button
                  type="button"
                  onClick={onNewTask}
                  className="py-2.5 px-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-lg flex items-center justify-center gap-1.5 active:scale-95"
                >
                  <span>Далее</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="w-full flex flex-col items-center justify-center text-center p-6 gap-4 min-h-[260px]">
              <div className="w-12 h-12 rounded-2xl bg-slate-950 border border-white/10 flex items-center justify-center text-indigo-400 shadow-inner">
                <Volume2 className="w-6 h-6 animate-pulse" />
              </div>

              <div className="space-y-1.5">
                <h4 className="text-sm font-bold text-slate-100">
                  Определите созвучие на слух
                </h4>
                <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
                  Выберите вариант созвучия слева или нажмите цифру на клавиатуре
                </p>
              </div>

              <div className="flex items-center gap-2 w-full max-w-xs pt-1">
                <button
                  type="button"
                  onClick={() => onPlayCadence(effectiveTonic, isMinorActive ? 'minor' : 'major')}
                  className="flex-1 py-2.5 px-3 bg-slate-950/80 hover:bg-slate-900 border border-white/10 text-slate-200 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5 shadow-inner active:scale-95"
                >
                  <Music className="w-3.5 h-3.5 text-slate-400" />
                  <span>Каданс</span>
                </button>

                <button
                  type="button"
                  onClick={() => onReplay?.()}
                  className="flex-1 py-2.5 px-3 bg-slate-950/80 hover:bg-slate-900 border border-white/10 text-slate-200 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5 shadow-inner active:scale-95"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                  <span>Повтор</span>
                </button>
              </div>

              <button
                type="button"
                onClick={onReveal}
                className="w-full max-w-xs py-2.5 px-3 bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-2 border border-white/10 shadow-inner active:scale-95"
              >
                <Eye className="w-3.5 h-3.5 text-slate-400" />
                <span>Показать ответ</span>
                <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 border border-white/10 text-slate-400 font-mono">
                  Enter
                </kbd>
              </button>
            </div>
          )}
        </div>
      </div>

      <TonalChordSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSettingsChange={(updated) => {
          onSettingsChange?.(updated);
          if (updated.tonalTheme && updated.tonalTheme !== activeThemeId) {
            setTimeout(() => onNewTask?.(), 50);
          }
        }}
      />
    </div>
  );
};
