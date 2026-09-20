import React, { useState } from 'react';
import {
  PlaybackSettings,
  CategoryId,
  TimbreType,
  PlaybackStyle,
  PlaybackDirection,
  AppStats,
} from '../types';
import { CATEGORIES, ALL_ITEMS, NOTE_NAMES, NOTE_NAMES_RU } from '../data/musicData';
import { downloadStandaloneHtmlFile } from '../utils/exportHtml';
import {
  X,
  Sliders,
  Music,
  Volume2,
  Loader2,
  RotateCcw,
  Music2,
  Layers,
  Activity,
  Zap,
  ChevronDown,
  ChevronRight,
  CheckSquare,
  Square,
  Check,
  Download,
  CheckCheck,
  SlidersHorizontal,
  Sun,
  Moon,
  Smartphone,
  Radio,
  BookOpen,
  BarChart3,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

interface LeftSettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  settings: PlaybackSettings;
  onSettingsChange: (updated: Partial<PlaybackSettings>) => void;
  activeItemIds: string[];
  onToggleItem: (id: string) => void;
  onSelectAllCategory: (catId: CategoryId, select: boolean) => void;
  onSelectAllGlobal: (select: boolean) => void;
  sampleStatus: { isLoaded: boolean; isLoading: boolean; progress: number };
  onLoadSamples: () => void;
  stats?: AppStats;
  onOpenStatsModal?: () => void;
  onOpenInstallModal?: () => void;
  onOpenCategoryModal?: () => void;
  onOpenProgressionCatalog?: () => void;
}

export const LeftSettingsDrawer: React.FC<LeftSettingsDrawerProps> = ({
  isOpen,
  onClose,
  settings,
  onSettingsChange,
  activeItemIds,
  onToggleItem,
  onSelectAllCategory,
  onSelectAllGlobal,
  sampleStatus,
  onLoadSamples,
  stats,
  onOpenStatsModal,
  onOpenInstallModal,
  onOpenCategoryModal,
  onOpenProgressionCatalog,
}) => {
  // Accordion sections state
  const [openSections, setOpenSections] = useState<{
    soundParams: boolean;
    progressionParams: boolean;
    tonalParams: boolean;
    categories: boolean;
    export: boolean;
  }>({
    soundParams: true,
    progressionParams: true,
    tonalParams: true,
    categories: true,
    export: false,
  });

  // Expanded categories inside the categories section
  const [expandedCats, setExpandedCats] = useState<Record<string, boolean>>({
    simple_intervals: true,
    triads: true,
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const toggleCatExpand = (catId: string) => {
    setExpandedCats((prev) => ({ ...prev, [catId]: !prev[catId] }));
  };

  const handleTimbreChange = (val: TimbreType) => {
    onSettingsChange({ timbre: val });
    if (val === 'salamander' && !sampleStatus.isLoaded && !sampleStatus.isLoading) {
      onLoadSamples();
    }
  };

  const handleResetToDefaults = () => {
    onSettingsChange({
      timbre: 'salamander',
      tempo: 0.5,
      resonance: 2.0,
      decay: 2.5,
      volume: 0.85,
      style: 'arpeggio',
      direction: 'up',
      rootNote: 'random',
      autoAdvanceOnCorrect: true,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex animate-in fade-in duration-150">
      {/* Dark overlay backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Slide-out Left Drawer */}
      <div className="relative w-full max-w-sm sm:max-w-md bg-slate-900 border-r border-slate-800 shadow-2xl flex flex-col h-full z-10 animate-in slide-in-from-left duration-200">
        {/* Drawer Header */}
        <div className="flex items-center justify-between p-3.5 sm:p-4 border-b border-slate-800 bg-slate-900/95 sticky top-0 z-10 shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <SlidersHorizontal className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100">
                Настройки и параметры
              </h2>
              <p className="text-[10px] text-slate-400">
                Выбрано элементов: {activeItemIds.length} из {ALL_ITEMS.length}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition cursor-pointer"
            title="Закрыть"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Accordion Body */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 text-xs">
          {/* Top Categories and Elements Selection Button */}
          {onOpenCategoryModal && (
            <button
              type="button"
              onClick={() => {
                onOpenCategoryModal();
                onClose();
              }}
              className="w-full px-3.5 py-3 bg-indigo-600/25 hover:bg-indigo-600/35 text-indigo-200 hover:text-white border border-indigo-500/50 rounded-xl transition cursor-pointer text-xs font-bold flex items-center justify-center gap-2 shrink-0 shadow-md active:scale-98 whitespace-nowrap"
            >
              <SlidersHorizontal className="w-4 h-4 text-indigo-400" />
              <span>Категории и элементы ({activeItemIds.length})</span>
            </button>
          )}

          {/* Statistics Progress & Summary Section */}
          {stats && (
            <div className="bg-slate-950/60 rounded-xl border border-slate-800/80 p-3 flex flex-col gap-2.5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <BarChart3 className="w-4 h-4 text-indigo-400" />
                  <span>Статистика тренировки</span>
                </span>
                <span className="text-[11px] font-mono text-indigo-300 font-bold">
                  {stats.totalTested > 0
                    ? `${Math.round((stats.totalCorrect / stats.totalTested) * 100)}%`
                    : '0%'}
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                <div
                  className={`h-full transition-all duration-300 ${
                    stats.totalTested > 0
                      ? Math.round((stats.totalCorrect / stats.totalTested) * 100) >= 80
                        ? 'bg-emerald-500'
                        : Math.round((stats.totalCorrect / stats.totalTested) * 100) >= 50
                        ? 'bg-amber-500'
                        : 'bg-rose-500'
                      : 'bg-slate-800'
                  }`}
                  style={{
                    width: `${
                      stats.totalTested > 0
                        ? Math.round((stats.totalCorrect / stats.totalTested) * 100)
                        : 0
                    }%`,
                  }}
                />
              </div>

              {/* Counter badges */}
              <div className="flex items-center justify-between text-[11px] font-mono pt-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400 flex items-center gap-0.5 font-bold">
                    <CheckCircle2 className="w-3 h-3" />
                    {stats.totalCorrect} верно
                  </span>
                  <span className="text-rose-400 flex items-center gap-0.5 font-bold">
                    <XCircle className="w-3 h-3" />
                    {Math.max(0, stats.totalTested - stats.totalCorrect)} ошибок
                  </span>
                </div>
                <span className="text-slate-400">Всего: {stats.totalTested}</span>
              </div>

              {/* Action Button: Open Detailed Stats Modal */}
              {onOpenStatsModal && (
                <button
                  type="button"
                  onClick={() => {
                    onOpenStatsModal();
                    onClose();
                  }}
                  className="w-full mt-1 py-1.5 px-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-indigo-300 hover:text-indigo-200 border border-slate-700/80 text-[11px] font-semibold transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <BarChart3 className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Открыть полный отчёт</span>
                </button>
              )}
            </div>
          )}

          {/* Theme Selector Section */}
          <div className="bg-slate-950/60 rounded-xl border border-slate-800/80 p-2.5 sm:p-3 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-200 flex items-center gap-1.5 text-xs">
                {settings.theme === 'dark' || !settings.theme ? (
                  <Moon className="w-4 h-4 text-indigo-400" />
                ) : (
                  <Sun className="w-4 h-4 text-amber-400" />
                )}
                <span>Тема оформления</span>
              </span>
              <span className="text-[10px] font-medium text-slate-400">
                {settings.theme === 'dark' || !settings.theme
                  ? 'Тёмная'
                  : settings.theme === 'light_slate'
                  ? 'Мягкий Slate'
                  : settings.theme === 'light_sand'
                  ? 'Песочная'
                  : 'Тёплая бумага'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {/* Dark */}
              <button
                type="button"
                onClick={() => onSettingsChange({ theme: 'dark' })}
                className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition cursor-pointer gap-1 ${
                  settings.theme === 'dark' || !settings.theme
                    ? 'bg-indigo-950/80 border-indigo-500 text-indigo-200 font-bold ring-1 ring-indigo-500/60 shadow-sm'
                    : 'bg-slate-900/90 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-850'
                }`}
                title="Глубокая тёмная тема"
              >
                <div className="w-4 h-4 rounded-full bg-slate-950 border border-slate-700 shadow-inner flex items-center justify-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                </div>
                <span className="text-[10px] font-medium leading-tight">🌌 Тёмная</span>
              </button>

              {/* Warm Paper */}
              <button
                type="button"
                onClick={() => onSettingsChange({ theme: 'light_warm' })}
                className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition cursor-pointer gap-1 ${
                  settings.theme === 'light_warm' || settings.theme === 'light'
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold ring-1 ring-amber-500/60 shadow-sm'
                    : 'bg-slate-900/90 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-850'
                }`}
                title="Тёплый кремовый оттенок бумаги"
              >
                <div className="w-4 h-4 rounded-full bg-[#f7f5ee] border border-[#dcd6c5] shadow-inner flex items-center justify-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                </div>
                <span className="text-[10px] font-medium leading-tight">📜 Тёплая бумага</span>
              </button>

              {/* Soft Slate */}
              <button
                type="button"
                onClick={() => onSettingsChange({ theme: 'light_slate' })}
                className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition cursor-pointer gap-1 ${
                  settings.theme === 'light_slate'
                    ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300 font-bold ring-1 ring-indigo-500/60 shadow-sm'
                    : 'bg-slate-900/90 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-850'
                }`}
                title="Современный дымчато-серый оттенок"
              >
                <div className="w-4 h-4 rounded-full bg-[#f1f5f9] border border-[#cbd5e1] shadow-inner flex items-center justify-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-700" />
                </div>
                <span className="text-[10px] font-medium leading-tight">🏛️ Мягкий Slate</span>
              </button>

              {/* Sand Linen */}
              <button
                type="button"
                onClick={() => onSettingsChange({ theme: 'light_sand' })}
                className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition cursor-pointer gap-1 ${
                  settings.theme === 'light_sand'
                    ? 'bg-amber-600/20 border-amber-600 text-amber-200 font-bold ring-1 ring-amber-600/60 shadow-sm'
                    : 'bg-slate-900/90 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-850'
                }`}
                title="Натуральный льняно-песочный оттенок"
              >
                <div className="w-4 h-4 rounded-full bg-[#f4f1e6] border border-[#ded7c4] shadow-inner flex items-center justify-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-800" />
                </div>
                <span className="text-[10px] font-medium leading-tight">🏖️ Песочная</span>
              </button>
            </div>
          </div>

          {/* 1. Sound Parameters Section */}
          <div className="bg-slate-950/60 rounded-xl border border-slate-800/80 overflow-hidden">
            <button
              onClick={() => toggleSection('soundParams')}
              className="w-full flex items-center justify-between p-3 text-left font-semibold text-slate-200 hover:bg-slate-900/60 transition cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-indigo-400" />
                <span>Звук и темп</span>
              </div>
              {openSections.soundParams ? (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-slate-400" />
              )}
            </button>

            {openSections.soundParams && (
              <div className="p-3 pt-0 border-t border-slate-800/50 space-y-3 pt-2">
                {/* Timbre */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300 font-medium flex items-center gap-1">
                      <Music className="w-3.5 h-3.5 text-indigo-400" />
                      Тембр
                    </span>
                    {sampleStatus.isLoading && (
                      <span className="text-[10px] text-amber-400 flex items-center gap-1 animate-pulse">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        {sampleStatus.progress}%
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleTimbreChange('salamander')}
                      className={`p-2 rounded-lg border text-left transition cursor-pointer ${
                        settings.timbre === 'salamander'
                          ? 'bg-indigo-600/20 border-indigo-500/60 text-indigo-100 font-bold'
                          : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}
                    >
                      <span className="block text-[11px]">🎼 Рояль Yamaha</span>
                      <span className="text-[9px] text-slate-500">Salamander HQ</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleTimbreChange('triangle')}
                      className={`p-2 rounded-lg border text-left transition cursor-pointer ${
                        settings.timbre === 'triangle'
                          ? 'bg-indigo-600/20 border-indigo-500/60 text-indigo-100 font-bold'
                          : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}
                    >
                      <span className="block text-[11px]">🎹 Синтезатор</span>
                      <span className="text-[9px] text-slate-500">Полифонический</span>
                    </button>
                  </div>
                </div>

                {/* Sliders: Tempo, Resonance, Decay, Volume */}
                <div className="space-y-2.5 pt-1">
                  {/* Tempo */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-slate-300 text-[11px]">
                      <span>⏱️ Темп</span>
                      <span className="font-mono text-indigo-400 font-bold">{settings.tempo.toFixed(2)}x</span>
                    </div>
                    <input
                      type="range"
                      min="0.2"
                      max="1.8"
                      step="0.05"
                      value={settings.tempo}
                      onChange={(e) => onSettingsChange({ tempo: parseFloat(e.target.value) })}
                      className="w-full cursor-pointer accent-indigo-500 h-1.5"
                    />
                  </div>

                  {/* Resonance */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-slate-300 text-[11px]">
                      <span>🌊 Наслоение / Резонанс</span>
                      <span className="font-mono text-cyan-400 font-bold">{settings.resonance.toFixed(2)}</span>
                    </div>
                    <input
                      type="range"
                      min="0.0"
                      max="2.0"
                      step="0.05"
                      value={settings.resonance}
                      onChange={(e) => onSettingsChange({ resonance: parseFloat(e.target.value) })}
                      className="w-full cursor-pointer accent-cyan-500 h-1.5"
                    />
                  </div>

                  {/* Decay */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-slate-300 text-[11px]">
                      <span>📉 Длина хвоста (затухание)</span>
                      <span className="font-mono text-violet-400 font-bold">{settings.decay.toFixed(2)}s</span>
                    </div>
                    <input
                      type="range"
                      min="0.2"
                      max="3.0"
                      step="0.05"
                      value={settings.decay}
                      onChange={(e) => onSettingsChange({ decay: parseFloat(e.target.value) })}
                      className="w-full cursor-pointer accent-violet-500 h-1.5"
                    />
                  </div>

                  {/* Volume */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-slate-300 text-[11px]">
                      <span className="flex items-center gap-1">
                        <Volume2 className="w-3 h-3 text-emerald-400" />
                        Громкость
                      </span>
                      <span className="font-mono text-emerald-400 font-bold">{Math.round(settings.volume * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0.0"
                      max="1.0"
                      step="0.05"
                      value={settings.volume}
                      onChange={(e) => onSettingsChange({ volume: parseFloat(e.target.value) })}
                      className="w-full cursor-pointer accent-emerald-500 h-1.5"
                    />
                  </div>

                  {/* Auto-advance on correct answer */}
                  <div className="pt-2 pb-1 border-t border-slate-800/60">
                    <label className="flex items-center justify-between cursor-pointer gap-2 select-none group">
                      <div className="space-y-0.5">
                        <span className="text-slate-200 font-semibold text-xs block group-hover:text-indigo-300 transition">
                          Играть новый сразу при верном ответе
                        </span>
                        <span className="text-slate-400 text-[10px] block">
                          Автоматически запускать следующий звук при успехе
                        </span>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.autoAdvanceOnCorrect ?? true}
                        onChange={(e) => onSettingsChange({ autoAdvanceOnCorrect: e.target.checked })}
                        className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-slate-900 cursor-pointer accent-indigo-600 shrink-0"
                      />
                    </label>
                  </div>
                </div>

                <div className="pt-1 flex justify-end">
                  <button
                    onClick={handleResetToDefaults}
                    className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200 transition cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Сбросить по умолчанию</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 2. Harmonic Progressions & Notation Section */}
          <div className="bg-slate-950/60 rounded-xl border border-slate-800/80 overflow-hidden">
            <button
              onClick={() => toggleSection('progressionParams')}
              className="w-full flex items-center justify-between p-3 text-left font-semibold text-slate-200 hover:bg-slate-900/60 transition cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-400" />
                <span>Гармония и нотация</span>
              </div>
              {openSections.progressionParams ? (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-slate-400" />
              )}
            </button>

            {openSections.progressionParams && (
              <div className="p-3 pt-0 border-t border-slate-800/50 space-y-3 pt-2">
                {/* Notation Mode Selector */}
                <div className="space-y-1.5">
                  <span className="text-slate-300 font-medium block text-xs">
                    Отображение аккордов:
                  </span>
                  <div className="grid grid-cols-1 gap-1.5">
                    <button
                      type="button"
                      onClick={() => onSettingsChange({ progressionNotation: 'roman' })}
                      className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex items-center justify-between ${
                        (settings.progressionNotation ?? 'roman') === 'roman'
                          ? 'bg-indigo-600/25 border-indigo-500 text-indigo-100 font-bold ring-1 ring-indigo-500/50'
                          : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-850'
                      }`}
                    >
                      <div>
                        <span className="block text-xs font-semibold">Ступени: I, IV, V, I6/4 (По умолчанию)</span>
                        <span className="text-[10px] text-slate-400">Римская ступенная нотация</span>
                      </div>
                      {(settings.progressionNotation ?? 'roman') === 'roman' && (
                        <Check className="w-4 h-4 text-indigo-400 shrink-0" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => onSettingsChange({ progressionNotation: 'analytical' })}
                      className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex items-center justify-between ${
                        settings.progressionNotation === 'analytical'
                          ? 'bg-indigo-600/25 border-indigo-500 text-indigo-100 font-bold ring-1 ring-indigo-500/50'
                          : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-850'
                      }`}
                    >
                      <div>
                        <span className="block text-xs font-semibold">Функции: T, S, D, K6/4</span>
                        <span className="text-[10px] text-slate-400">Аналитическая функциональная гармония</span>
                      </div>
                      {settings.progressionNotation === 'analytical' && (
                        <Check className="w-4 h-4 text-indigo-400 shrink-0" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => onSettingsChange({ progressionNotation: 'letter' })}
                      className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex items-center justify-between ${
                        settings.progressionNotation === 'letter'
                          ? 'bg-indigo-600/25 border-indigo-500 text-indigo-100 font-bold ring-1 ring-indigo-500/50'
                          : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-850'
                      }`}
                    >
                      <div>
                        <span className="block text-xs font-semibold">Буквенная: C, G7/B, Am</span>
                        <span className="text-[10px] text-slate-400">Буквенно-цифровые аккорды</span>
                      </div>
                      {settings.progressionNotation === 'letter' && (
                        <Check className="w-4 h-4 text-indigo-400 shrink-0" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Open Progression Catalog Button */}
                {onOpenProgressionCatalog && (
                  <button
                    type="button"
                    onClick={() => {
                      onOpenProgressionCatalog();
                      onClose();
                    }}
                    className="w-full py-2.5 px-3 bg-purple-950/70 hover:bg-purple-900/90 text-purple-200 border border-purple-500/40 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-sm active:scale-98"
                  >
                    <BookOpen className="w-4 h-4 text-purple-400 shrink-0" />
                    <span>Каталог оборотов по ступеням</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* 4. Standalone Export Section */}
          <div className="bg-slate-950/60 rounded-xl border border-slate-800/80 overflow-hidden">
            <button
              onClick={() => toggleSection('export')}
              className="w-full flex items-center justify-between p-3 text-left font-semibold text-slate-200 hover:bg-slate-900/60 transition cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Download className="w-4 h-4 text-sky-400" />
                <span>Экспорт и PWA</span>
              </div>
              {openSections.export ? (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-slate-400" />
              )}
            </button>

            {openSections.export && (
              <div className="p-3 pt-0 border-t border-slate-800/50 space-y-2.5 pt-2">
                {/* PWA Phone Install */}
                {onOpenInstallModal && (
                  <div className="p-2.5 rounded-lg bg-indigo-950/60 border border-indigo-500/40 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-indigo-300 font-bold">
                      <Smartphone className="w-3.5 h-3.5" />
                      <span>Установка на телефон (PWA)</span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-tight">
                      Добавьте как приложение на главный экран. Работает офлайн без интернета.
                    </p>
                    <button
                      onClick={() => {
                        onClose();
                        onOpenInstallModal();
                      }}
                      className="w-full py-1.5 px-2.5 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-semibold rounded-md shadow-sm transition text-center cursor-pointer"
                    >
                      Установить приложение
                    </button>
                  </div>
                )}

                <p className="text-[11px] text-slate-400 leading-snug">
                  Или скачайте приложение одним HTML-файлом:
                </p>
                <button
                  onClick={downloadStandaloneHtmlFile}
                  className="w-full flex items-center justify-center gap-1.5 py-2 bg-slate-800 hover:bg-slate-750 active:scale-95 text-slate-200 border border-slate-700 font-semibold rounded-lg shadow-sm transition cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Скачать .html файл</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-900/95 shrink-0 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            Настройки сохраняются автоматически
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg transition cursor-pointer"
          >
            Готово
          </button>
        </div>
      </div>
    </div>
  );
};
