import React from 'react';
import {
  TONAL_DEGREES,
  POPULAR_TONAL_CHORDS,
  TONAL_THEMES,
  getTonalThemeById,
  getChordLetterNotation,
} from '../audio/tonalChords';
import { PlaybackSettings, TonalThemeId } from '../types';
import { FormattedChordSymbol } from './TonalModeCard';
import {
  X,
  CheckSquare,
  Square,
  SlidersHorizontal,
  Layers,
  Type,
  Sparkles,
  BookOpen,
} from 'lucide-react';

interface TonalChordSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: PlaybackSettings;
  onSettingsChange: (updated: Partial<PlaybackSettings>) => void;
}

export const TonalChordSettingsModal: React.FC<TonalChordSettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSettingsChange,
}) => {
  if (!isOpen) return null;

  const currentAllowed = settings.tonalAllowedDegrees ?? TONAL_DEGREES.map((d) => d.id);
  const isMinorActive = settings.tonalScaleMode === 'minor';
  const rootOnly = settings.tonalRootPositionOnly ?? false;
  const currentNotation = settings.progressionNotation ?? 'roman';
  const currentTonic = (settings.tonalRootNote !== 'random' ? settings.tonalRootNote : 'C') || 'C';
  const activeThemeId = settings.tonalTheme ?? 'tsd_basics';

  const handleSelectTheme = (themeId: TonalThemeId) => {
    const themeDef = getTonalThemeById(themeId);
    if (themeId === 'custom') {
      onSettingsChange({
        tonalTheme: 'custom',
      });
      return;
    }
    onSettingsChange({
      tonalTheme: themeId,
      tonalAllowedVoicings: themeDef.voicingIds.length > 0 ? themeDef.voicingIds : undefined,
      tonalAllowedDegrees: themeDef.degreeIds.length > 0 ? themeDef.degreeIds : undefined,
      tonalRootPositionOnly: themeDef.rootPositionOnly,
      tonalInversionsMode: themeDef.rootPositionOnly ? 'root_only' : 'popular',
    });
  };

  const handleToggleDegree = (id: string) => {
    let next: string[];
    if (currentAllowed.includes(id)) {
      if (currentAllowed.length <= 1) return; // Keep at least one
      next = currentAllowed.filter((degId) => degId !== id);
    } else {
      next = [...currentAllowed, id];
    }
    onSettingsChange({
      tonalTheme: 'custom',
      tonalAllowedDegrees: next,
      tonalAllowedVoicings: undefined, // Reset explicit voicings when customizing degrees
    });
  };

  const functionalGroups = [
    {
      title: 'Тоника & Каданс (T)',
      badgeColor: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
      ids: ['deg_I', 'deg_K64'],
    },
    {
      title: 'Субдоминантовая группа (S)',
      badgeColor: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
      ids: ['deg_IV', 'deg_II', 'deg_II7', 'deg_II7_alt', 'deg_S_alt'],
    },
    {
      title: 'Доминантовая группа (D)',
      badgeColor: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
      ids: ['deg_V', 'deg_D_add6', 'deg_V7', 'deg_D9', 'deg_VII'],
    },
    {
      title: 'Медианты & Переменные функции',
      badgeColor: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
      ids: ['deg_VI', 'deg_III'],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-xl max-h-[90vh] bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-slate-950/60 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white leading-tight">
                Параметры тональности
              </h2>
              <p className="text-xs text-slate-400">
                Темы и изучаемые созвучия
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            aria-label="Закрыть"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          {/* Section: Themes & Difficulty Levels */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                Темы
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {TONAL_THEMES.filter((t) => t.id !== 'custom').map((theme) => {
                const isSelected = activeThemeId === theme.id;
                return (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => handleSelectTheme(theme.id)}
                    className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between gap-1 relative ${
                      isSelected
                        ? 'bg-indigo-950/80 border-indigo-500 text-white shadow-md shadow-indigo-950/50 ring-1 ring-indigo-500/50'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800/80 hover:text-white hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 w-full">
                      <span className="font-bold text-xs flex items-center gap-1.5 text-white">
                        <span>{theme.badge}</span>
                        <span>{theme.title}</span>
                      </span>
                      {isSelected && (
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 leading-snug line-clamp-2">
                      {theme.descRu}
                    </p>
                    <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 text-[10px] text-slate-400 font-mono">
                      <span>Сложность: {theme.difficultyRu}</span>
                      <span className="text-indigo-300 font-bold">{theme.hintRu}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dual Mode Selectors: Inversions & Notation */}
          <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            {/* Inversion Mode Toggle */}
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400 shrink-0" />
              <div>
                <span className="text-xs font-bold text-white block">
                  Обращения аккордов
                </span>
                <span className="text-[11px] text-slate-400 block">
                  {rootOnly ? 'Только 5/3 и 7' : 'Все популярные обращения'}
                </span>
              </div>
            </div>
            <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-0.5 shrink-0">
              <button
                type="button"
                onClick={() => onSettingsChange({ tonalRootPositionOnly: false, tonalInversionsMode: 'popular' })}
                className={`px-3 py-1 rounded-md text-xs font-bold transition cursor-pointer ${
                  !rootOnly
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                С обращениями
              </button>
              <button
                type="button"
                onClick={() => onSettingsChange({ tonalRootPositionOnly: true, tonalInversionsMode: 'root_only' })}
                className={`px-3 py-1 rounded-md text-xs font-bold transition cursor-pointer ${
                  rootOnly
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Только 5/3 и 7
              </button>
            </div>
          </div>

          {/* Notation Mode Selector Bar */}
          <div className="py-2 px-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Type className="w-4 h-4 text-purple-400 shrink-0" />
              <span className="text-xs font-semibold text-slate-300">
                Отображение:
              </span>
            </div>
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 shrink-0 text-xs">
              <button
                type="button"
                onClick={() => onSettingsChange({ progressionNotation: 'roman' })}
                className={`px-2.5 py-1 rounded-md transition cursor-pointer font-semibold ${
                  currentNotation === 'roman'
                    ? 'bg-purple-600/30 text-purple-200 border border-purple-500/50 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Ступени (I, IV, V)
              </button>
              <button
                type="button"
                onClick={() => onSettingsChange({ progressionNotation: 'analytical' })}
                className={`px-2.5 py-1 rounded-md transition cursor-pointer font-semibold ${
                  currentNotation === 'analytical'
                    ? 'bg-purple-600/30 text-purple-200 border border-purple-500/50 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Функции (T, S, D)
              </button>
              <button
                type="button"
                onClick={() => onSettingsChange({ progressionNotation: 'letter' })}
                className={`px-2.5 py-1 rounded-md transition cursor-pointer font-semibold ${
                  currentNotation === 'letter'
                    ? 'bg-purple-600/30 text-purple-200 border border-purple-500/50 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Буквы (C, G7)
              </button>
            </div>
          </div>

          {/* Section: Custom Degree Checkboxes list */}
          <div className="space-y-3 pt-2 border-t border-slate-800/80">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                Ручной выбор ступеней
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                {currentAllowed.length} / {TONAL_DEGREES.length} выбрано
              </span>
            </div>

            {functionalGroups.map((group) => (
              <div key={group.title} className="space-y-1.5">
                <div className="flex items-center justify-between pb-1">
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded border ${group.badgeColor}`}>
                    {group.title}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {group.ids.filter((id) => currentAllowed.includes(id)).length} / {group.ids.length}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {group.ids.map((degId) => {
                    const deg = TONAL_DEGREES.find((d) => d.id === degId);
                    if (!deg) return null;
                    const isChecked = currentAllowed.includes(deg.id);
                    const analLabel = isMinorActive ? deg.labelMinor : deg.labelMajor;
                    const nameRu = isMinorActive ? deg.nameMinorRu : deg.nameMajorRu;
                    const romanLabel = deg.degreeRoman || analLabel;

                    let primarySymbol = analLabel;
                    let secondarySymbol: string | null = romanLabel;

                    if (currentNotation === 'roman') {
                      primarySymbol = romanLabel;
                      secondarySymbol = analLabel !== romanLabel ? analLabel : null;
                    } else if (currentNotation === 'letter') {
                      const matchingVoicing = POPULAR_TONAL_CHORDS.find(
                        (c) => c.degreeId === deg.id && c.isRootPosition
                      ) || POPULAR_TONAL_CHORDS.find((c) => c.degreeId === deg.id);

                      if (matchingVoicing) {
                        primarySymbol = getChordLetterNotation(matchingVoicing.id, currentTonic, !isMinorActive);
                      }
                      secondarySymbol = analLabel;
                    }

                    return (
                      <button
                        key={deg.id}
                        type="button"
                        onClick={() => handleToggleDegree(deg.id)}
                        className={`flex items-center justify-between p-2 rounded-xl border transition cursor-pointer text-left ${
                          isChecked
                            ? 'bg-slate-800/90 border-slate-600 text-white shadow-xs'
                            : 'bg-slate-950/40 border-slate-800/80 text-slate-500 hover:bg-slate-900/60'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          {isChecked ? (
                            <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-600 shrink-0" />
                          )}
                          <div className="truncate">
                            <span className="font-bold text-xs text-white block truncate">
                              {nameRu}
                            </span>
                            <span className="text-[10px] text-slate-400 block truncate">
                              {deg.functionalStrengthRu}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0 ml-1.5 font-mono">
                          <FormattedChordSymbol
                            symbol={primarySymbol}
                            className={`text-xs font-bold ${
                              isChecked ? 'text-amber-300' : 'text-slate-500'
                            }`}
                          />
                          {secondarySymbol && (
                            <span className="text-[10px] text-slate-500">
                              ({secondarySymbol})
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <div className="text-[11px] text-slate-400 truncate">
            {activeThemeId === 'custom'
              ? 'Используется ручной набор ступеней'
              : `Выбрана тема: ${getTonalThemeById(activeThemeId).title}`}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white font-bold text-xs transition cursor-pointer shadow-md"
          >
            Готово
          </button>
        </div>
      </div>
    </div>
  );
};
