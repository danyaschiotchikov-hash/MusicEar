import React, { useState } from 'react';
import {
  PlaybackSettings,
  CategoryId,
  TimbreType,
  AppStats,
} from '../types';
import { ALL_ITEMS } from '../data/musicData';
import { downloadStandaloneHtmlFile } from '../utils/exportHtml';
import {
  X,
  Sliders,
  Music,
  Volume2,
  Loader2,
  RotateCcw,
  Layers,
  Sparkles,
  ChevronDown,
  ChevronRight,
  Check,
  Download,
  SlidersHorizontal,
  Sun,
  Moon,
  Smartphone,
  BookOpen,
  BarChart3,
  CheckCircle2,
  XCircle,
  FileCheck2,
  History,
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
  onOpenChangelogModal?: () => void;
  onOpenAcademicAuditModal?: () => void;
}

export const LeftSettingsDrawer: React.FC<LeftSettingsDrawerProps> = ({
  isOpen,
  onClose,
  settings,
  onSettingsChange,
  activeItemIds,
  sampleStatus,
  onLoadSamples,
  stats,
  onOpenStatsModal,
  onOpenInstallModal,
  onOpenCategoryModal,
  onOpenProgressionCatalog,
  onOpenChangelogModal,
  onOpenAcademicAuditModal,
}) => {
  // Accordion state
  const [openSections, setOpenSections] = useState<{
    soundParams: boolean;
    progressionParams: boolean;
    toolsAndOffline: boolean;
  }>({
    soundParams: true,
    progressionParams: true,
    toolsAndOffline: false,
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
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
      autoAdvanceOnCorrect: true,
      spacedRepetitionEnabled: true,
    });
  };

  if (!isOpen) return null;

  const totalTested = stats?.totalTested ?? 0;
  const totalCorrect = stats?.totalCorrect ?? 0;
  const accuracyPercent = totalTested > 0 ? Math.round((totalCorrect / totalTested) * 100) : 0;

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
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <SlidersHorizontal className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100">
                Настройки приложения
              </h2>
              <p className="text-[11px] text-slate-400">
                Параметры звучания, гармонии и интерфейса
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

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3.5 text-xs">
          {/* 1. Elements Selection Card */}
          {onOpenCategoryModal && (
            <div className="bg-slate-950/60 rounded-xl border border-indigo-500/30 p-3 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-100 block text-xs">
                    Библиотека созвучий
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Интервалы, аккорды, ступени и лады
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono text-[11px] font-bold border border-indigo-500/30">
                  {activeItemIds.length} / {ALL_ITEMS.length}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  onOpenCategoryModal();
                  onClose();
                }}
                className="w-full mt-1 py-2 px-3 bg-indigo-600 hover:bg-indigo-500 active:scale-[0.99] text-white font-semibold rounded-lg transition cursor-pointer flex items-center justify-center gap-2 shadow-sm"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Настроить элементы тренировки</span>
              </button>
            </div>
          )}

          {/* 2. Theme Selector Section */}
          <div className="bg-slate-950/60 rounded-xl border border-slate-800/80 p-2.5 sm:p-3 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-200 flex items-center gap-1.5 text-xs">
                {settings.theme === 'light' ? (
                  <Sun className="w-4 h-4 text-amber-400" />
                ) : (
                  <Moon className="w-4 h-4 text-indigo-400" />
                )}
                <span>Тема оформления</span>
              </span>
              <span className="text-[10px] font-medium text-slate-400">
                {settings.theme === 'light' ? 'Светлая (Бумага)' : 'Studio Dark'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-1.5 pt-0.5">
              <button
                type="button"
                onClick={() => onSettingsChange({ theme: 'dark' })}
                className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-semibold transition cursor-pointer border ${
                  settings.theme !== 'light'
                    ? 'bg-slate-800 text-slate-100 border-slate-700 shadow-xs'
                    : 'bg-slate-950/70 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                <Moon className="w-3.5 h-3.5 text-indigo-400" />
                <span>Studio Dark</span>
              </button>
              <button
                type="button"
                onClick={() => onSettingsChange({ theme: 'light' })}
                className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-semibold transition cursor-pointer border ${
                  settings.theme === 'light'
                    ? 'bg-slate-800 text-slate-100 border-slate-700 shadow-xs'
                    : 'bg-slate-950/70 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span>Светлая</span>
              </button>
            </div>
          </div>

          {/* 3. Sound & Playback Section */}
          <div className="bg-slate-950/60 rounded-xl border border-slate-800/80 overflow-hidden">
            <button
              onClick={() => toggleSection('soundParams')}
              className="w-full flex items-center justify-between p-3 text-left font-semibold text-slate-200 hover:bg-slate-900/60 transition cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-indigo-400" />
                <span>Звук и воспроизведение</span>
              </div>
              {openSections.soundParams ? (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-slate-400" />
              )}
            </button>

            {openSections.soundParams && (
              <div className="p-3 pt-0 border-t border-slate-800/50 space-y-3 pt-2.5">
                {/* Timbre selector */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300 font-medium flex items-center gap-1">
                      <Music className="w-3.5 h-3.5 text-indigo-400" />
                      Тембр инструмента
                    </span>
                    {sampleStatus.isLoading && (
                      <span className="text-[10px] text-amber-400 flex items-center gap-1 animate-pulse font-mono">
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
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <span className="block text-[11px]">🎼 Рояль Yamaha</span>
                      <span className="text-[9px] text-slate-500">Salamander Grand HQ</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleTimbreChange('triangle')}
                      className={`p-2 rounded-lg border text-left transition cursor-pointer ${
                        settings.timbre === 'triangle'
                          ? 'bg-indigo-600/20 border-indigo-500/60 text-indigo-100 font-bold'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <span className="block text-[11px]">🎹 Синтезатор</span>
                      <span className="text-[9px] text-slate-500">Полифонический</span>
                    </button>
                  </div>
                </div>

                {/* Sliders: Tempo, Volume, Resonance, Decay */}
                <div className="space-y-2.5 pt-1">
                  {/* Tempo */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-slate-300 text-[11px]">
                      <span>⏱️ Темп воспроизведения</span>
                      <span className="font-mono text-indigo-400 font-bold bg-indigo-950/60 px-1.5 py-0.5 rounded">
                        {settings.tempo.toFixed(2)}x
                      </span>
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
                    <div className="flex justify-between text-[9px] text-slate-500">
                      <span>0.2x Медленно</span>
                      <span>1.0x Норма</span>
                      <span>1.8x Быстро</span>
                    </div>
                  </div>

                  {/* Volume */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-slate-300 text-[11px]">
                      <span className="flex items-center gap-1">
                        <Volume2 className="w-3 h-3 text-emerald-400" />
                        Громкость звука
                      </span>
                      <span className="font-mono text-emerald-400 font-bold bg-emerald-950/60 px-1.5 py-0.5 rounded">
                        {Math.round(settings.volume * 100)}%
                      </span>
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

                  {/* Resonance / Overlap */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-slate-300 text-[11px]">
                      <span>🌊 Наслоение звуков (педаль)</span>
                      <span className="font-mono text-cyan-400 font-bold bg-cyan-950/60 px-1.5 py-0.5 rounded">
                        {settings.resonance.toFixed(2)}
                      </span>
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
                    <div className="flex justify-between text-[9px] text-slate-500">
                      <span>0.0 Сухо</span>
                      <span>1.0 Умеренно</span>
                      <span>2.0 Шлейф</span>
                    </div>
                  </div>

                  {/* Decay */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-slate-300 text-[11px]">
                      <span>📉 Длина затухания</span>
                      <span className="font-mono text-violet-400 font-bold bg-violet-950/60 px-1.5 py-0.5 rounded">
                        {settings.decay.toFixed(2)}s
                      </span>
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

                  {/* Auto-advance on correct answer */}
                  <div className="pt-2 pb-1 border-t border-slate-800/60">
                    <label className="flex items-center justify-between cursor-pointer gap-2 select-none group">
                      <div className="space-y-0.5">
                        <span className="text-slate-200 font-semibold text-xs block group-hover:text-indigo-300 transition">
                          Играть следующий при верном ответе
                        </span>
                        <span className="text-slate-400 text-[10px] block">
                          Автоматически запускать новое созвучие при успехе
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

                  {/* Spaced Repetition (Умный повтор) */}
                  <div className="pt-2 pb-1 border-t border-slate-800/60">
                    <label className="flex items-center justify-between cursor-pointer gap-2 select-none group">
                      <div className="space-y-0.5">
                        <span className="text-slate-200 font-semibold text-xs flex items-center gap-1.5 group-hover:text-indigo-300 transition">
                          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                          Умный интервальный повтор (SRS)
                        </span>
                        <span className="text-slate-400 text-[10px] block">
                          Чаще предлагает элементы с ошибками, закрепляя слабые места
                        </span>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.spacedRepetitionEnabled ?? true}
                        onChange={(e) => onSettingsChange({ spacedRepetitionEnabled: e.target.checked })}
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
                    <span>Сбросить звук по умолчанию</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 4. Harmonic Progressions & Notation Section */}
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
              <div className="p-3 pt-0 border-t border-slate-800/50 space-y-3 pt-2.5">
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
                        <span className="block text-xs font-semibold">Ступени: I, IV, V, I₆/₄</span>
                        <span className="text-[10px] text-slate-400">Римская ступенная нотация (стандарт училищ)</span>
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
                        <span className="block text-xs font-semibold">Функции: T, S, D, K₆/₄</span>
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

          {/* 5. Statistics Summary Card */}
          {stats && (
            <div className="bg-slate-950/60 rounded-xl border border-slate-800/80 p-3 flex flex-col gap-2.5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <BarChart3 className="w-4 h-4 text-indigo-400" />
                  <span>Статистика тренировки</span>
                </span>
                <span className="text-[11px] font-mono text-indigo-300 font-bold">
                  {accuracyPercent}%
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                <div
                  className={`h-full transition-all duration-300 ${
                    totalTested > 0
                      ? accuracyPercent >= 80
                        ? 'bg-emerald-500'
                        : accuracyPercent >= 50
                        ? 'bg-amber-500'
                        : 'bg-rose-500'
                      : 'bg-slate-800'
                  }`}
                  style={{
                    width: `${totalTested > 0 ? accuracyPercent : 0}%`,
                  }}
                />
              </div>

              {/* Counter badges */}
              <div className="flex items-center justify-between text-[11px] font-mono pt-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400 flex items-center gap-0.5 font-bold">
                    <CheckCircle2 className="w-3 h-3" />
                    {totalCorrect} верно
                  </span>
                  <span className="text-rose-400 flex items-center gap-0.5 font-bold">
                    <XCircle className="w-3 h-3" />
                    {Math.max(0, totalTested - totalCorrect)} ошибок
                  </span>
                </div>
                <span className="text-slate-400">Всего: {totalTested}</span>
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

          {/* 6. Tools, Offline and Academic Section */}
          <div className="bg-slate-950/60 rounded-xl border border-slate-800/80 overflow-hidden">
            <button
              onClick={() => toggleSection('toolsAndOffline')}
              className="w-full flex items-center justify-between p-3 text-left font-semibold text-slate-200 hover:bg-slate-900/60 transition cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Download className="w-4 h-4 text-sky-400" />
                <span>Инструменты и офлайн</span>
              </div>
              {openSections.toolsAndOffline ? (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-slate-400" />
              )}
            </button>

            {openSections.toolsAndOffline && (
              <div className="p-3 pt-0 border-t border-slate-800/50 space-y-2.5 pt-2.5">
                {/* PWA Phone Install */}
                {onOpenInstallModal && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenInstallModal();
                    }}
                    className="w-full p-2.5 rounded-xl bg-indigo-950/40 hover:bg-indigo-900/50 border border-indigo-500/30 text-left transition cursor-pointer flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400">
                        <Smartphone className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-bold text-slate-200 text-xs block group-hover:text-indigo-300">
                          Установка PWA на телефон
                        </span>
                        <span className="text-[10px] text-slate-400">
                          Работает офлайн как отдельное приложение
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-slate-300" />
                  </button>
                )}

                {/* Standalone HTML download */}
                <button
                  onClick={downloadStandaloneHtmlFile}
                  className="w-full p-2.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-left transition cursor-pointer flex items-center justify-between group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-sky-500/20 text-sky-400">
                      <Download className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-slate-200 text-xs block group-hover:text-sky-300">
                        Скачать автономный .html
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Полная копия для запуска без сервера
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-slate-300" />
                </button>

                {/* Academic Audit Dashboard Modal Button */}
                {onOpenAcademicAuditModal && (
                  <button
                    type="button"
                    onClick={() => {
                      onOpenAcademicAuditModal();
                      onClose();
                    }}
                    className="w-full p-2.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-left transition cursor-pointer flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                        <FileCheck2 className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-bold text-slate-200 text-xs block group-hover:text-emerald-300">
                          Академический аудит & авто-солвер
                        </span>
                        <span className="text-[10px] text-slate-400">
                          Верификация теории и голосоведения
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-slate-300" />
                  </button>
                )}

                {/* Academic Changelog / Corrections Modal Button */}
                {onOpenChangelogModal && (
                  <button
                    type="button"
                    onClick={() => {
                      onOpenChangelogModal();
                      onClose();
                    }}
                    className="w-full p-2.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-left transition cursor-pointer flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
                        <History className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-bold text-slate-200 text-xs block group-hover:text-amber-300">
                          Журнал обновлений и исправлений
                        </span>
                        <span className="text-[10px] text-slate-400">
                          История академических правок
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-slate-300" />
                  </button>
                )}
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
            className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg transition cursor-pointer shadow-sm"
          >
            Готово
          </button>
        </div>
      </div>
    </div>
  );
};
