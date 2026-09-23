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
  Download,
  SlidersHorizontal,
  Sun,
  Moon,
  Smartphone,
  BookOpen,
  BarChart3,
  CheckCircle2,
  FileCheck2,
  History,
  Check,
  ChevronRight,
  Radio,
  Timer,
  Activity,
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

// Apple HIG iOS-style toggle switch
const AppleToggle: React.FC<{
  checked: boolean;
  onChange: (checked: boolean) => void;
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
}> = ({ checked, onChange, title, subtitle, icon }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    onClick={() => onChange(!checked)}
    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-800/40 active:bg-slate-800/60 transition cursor-pointer text-left select-none group"
  >
    <div className="flex items-center gap-2.5 min-w-0 pr-3">
      {icon && <div className="shrink-0">{icon}</div>}
      <div className="flex flex-col min-w-0">
        <span className="text-xs font-semibold text-slate-200 group-hover:text-white transition">
          {title}
        </span>
        {subtitle && (
          <span className="text-[11px] text-slate-400 leading-tight mt-0.5">
            {subtitle}
          </span>
        )}
      </div>
    </div>
    <div
      className={`relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors duration-200 ease-in-out border border-transparent ${
        checked ? 'bg-indigo-600' : 'bg-slate-800'
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out mt-0.5 ml-0.5 ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </div>
  </button>
);

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
      cadenceBeforeTask: false,
    });
  };

  if (!isOpen) return null;

  const totalTested = stats?.totalTested ?? 0;
  const totalCorrect = stats?.totalCorrect ?? 0;
  const accuracyPercent = totalTested > 0 ? Math.round((totalCorrect / totalTested) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex animate-in fade-in duration-150">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Slide-out Drawer */}
      <div className="relative w-full max-w-sm sm:max-w-md bg-slate-900 border-r border-slate-800 shadow-2xl flex flex-col h-full z-10 animate-in slide-in-from-left duration-200">
        {/* Apple HIG Navigation Bar Header */}
        <div className="flex items-center justify-between p-3.5 sm:p-4 border-b border-slate-800 bg-slate-900/95 sticky top-0 z-10 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
              <SlidersHorizontal className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100 tracking-tight">
                Настройки
              </h2>
              <p className="text-[11px] text-slate-400">
                Параметры звука, методики и гармонии
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition cursor-pointer"
            title="Закрыть настройки"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-3.5 sm:p-4 space-y-4 text-xs">
          {/* Quick Stats Banner (at the top of drawer) */}
          {stats && (
            <div
              onClick={() => {
                onOpenStatsModal?.();
                onClose();
              }}
              className="bg-slate-950/80 rounded-2xl border border-slate-800 p-3 flex items-center justify-between cursor-pointer hover:border-indigo-500/50 transition group"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-500/15 text-indigo-400">
                  <BarChart3 className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-semibold text-slate-200 text-xs block group-hover:text-indigo-300 transition">
                    Статистика тренировки
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {totalTested} вопросов · {totalCorrect} верно ({accuracyPercent}%)
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-slate-300 transition" />
            </div>
          )}

          {/* SECTION 1: LIBRARY & ELEMENTS */}
          <div className="space-y-1.5">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 px-1">
              Элементы и библиотека
            </span>
            <div className="bg-slate-950/70 rounded-2xl border border-slate-800 p-3 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-100 block text-xs">
                    Активные созвучия
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Интервалы, аккорды, гаммы и лады
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono text-[11px] font-bold border border-indigo-500/30">
                  {activeItemIds.length} / {ALL_ITEMS.length}
                </span>
              </div>
              {onOpenCategoryModal && (
                <button
                  type="button"
                  onClick={() => {
                    onOpenCategoryModal();
                    onClose();
                  }}
                  className="w-full mt-1 py-2 px-3 bg-indigo-600 hover:bg-indigo-500 active:scale-[0.99] text-white font-semibold rounded-xl transition cursor-pointer flex items-center justify-center gap-2 shadow-xs"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>Выбрать изучаемые элементы</span>
                </button>
              )}
            </div>
          </div>

          {/* SECTION 2: AUDIO & PLAYBACK */}
          <div className="space-y-1.5">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 px-1">
              Звук и воспроизведение
            </span>
            <div className="bg-slate-950/70 rounded-2xl border border-slate-800 p-3 space-y-3">
              {/* Instrument Timbre */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-200 font-medium flex items-center gap-1.5 text-xs">
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
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleTimbreChange('salamander')}
                    className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                      settings.timbre === 'salamander'
                        ? 'bg-indigo-600/20 border-indigo-500 text-indigo-100 font-bold ring-1 ring-indigo-500/40'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <span className="block text-xs font-semibold">Рояль Yamaha</span>
                    <span className="text-[10px] text-slate-400">Сэмплы Salamander</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTimbreChange('triangle')}
                    className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                      settings.timbre === 'triangle'
                        ? 'bg-indigo-600/20 border-indigo-500 text-indigo-100 font-bold ring-1 ring-indigo-500/40'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <span className="block text-xs font-semibold">Синтезатор</span>
                    <span className="text-[10px] text-slate-400">Синтез полифонии</span>
                  </button>
                </div>
              </div>

              {/* Sliders */}
              <div className="space-y-3 pt-1 border-t border-slate-800/80">
                {/* Volume Slider */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-slate-300 text-xs">
                    <span className="flex items-center gap-1.5">
                      <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                      Громкость
                    </span>
                    <span className="font-mono text-emerald-400 font-bold text-xs">
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
                    className="w-full cursor-pointer accent-emerald-500 h-1.5 bg-slate-800 rounded-lg"
                  />
                </div>

                {/* Tempo Slider */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-slate-300 text-xs">
                    <span className="flex items-center gap-1.5">
                      <Timer className="w-3.5 h-3.5 text-indigo-400" />
                      Скорость арпеджио
                    </span>
                    <span className="font-mono text-indigo-400 font-bold text-xs">
                      {settings.tempo.toFixed(2)}×
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.2"
                    max="1.8"
                    step="0.05"
                    value={settings.tempo}
                    onChange={(e) => onSettingsChange({ tempo: parseFloat(e.target.value) })}
                    className="w-full cursor-pointer accent-indigo-500 h-1.5 bg-slate-800 rounded-lg"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>0.2× Медленно</span>
                    <span>1.0× Эталон</span>
                    <span>1.8× Быстро</span>
                  </div>
                </div>

                {/* Resonance / Overlap */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-slate-300 text-xs">
                    <span className="flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-cyan-400" />
                      Педаль (сустейн и наслоение)
                    </span>
                    <span className="font-mono text-cyan-400 font-bold text-xs">
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
                    className="w-full cursor-pointer accent-cyan-500 h-1.5 bg-slate-800 rounded-lg"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>0.0 Сухо</span>
                    <span>1.0 Умеренно</span>
                    <span>2.0 Полный резонанс</span>
                  </div>
                </div>

                {/* Decay */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-slate-300 text-xs">
                    <span>Затухание нот</span>
                    <span className="font-mono text-violet-400 font-bold text-xs">
                      {settings.decay.toFixed(2)} с
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.2"
                    max="3.0"
                    step="0.05"
                    value={settings.decay}
                    onChange={(e) => onSettingsChange({ decay: parseFloat(e.target.value) })}
                    className="w-full cursor-pointer accent-violet-500 h-1.5 bg-slate-800 rounded-lg"
                  />
                </div>
              </div>

              {/* Reset Sound Defaults */}
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={handleResetToDefaults}
                  className="flex items-center gap-1.5 text-[11px] text-slate-400 hover:text-slate-200 transition cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Сбросить звук к стандартам</span>
                </button>
              </div>
            </div>
          </div>

          {/* SECTION 3: PRACTICE & METHODOLOGY */}
          <div className="space-y-1.5">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 px-1">
              Обучение и методика
            </span>
            <div className="bg-slate-950/70 rounded-2xl border border-slate-800 p-1.5 flex flex-col divide-y divide-slate-800/60">
              {/* Spaced Repetition (SRS) */}
              <AppleToggle
                checked={settings.spacedRepetitionEnabled ?? true}
                onChange={(checked) => onSettingsChange({ spacedRepetitionEnabled: checked })}
                title="Умный адаптивный повтор (SRS)"
                subtitle="Чаще предлагает проблемные элементы для закрепления"
                icon={<Sparkles className="w-4 h-4 text-amber-400" />}
              />

              {/* Auto Advance */}
              <AppleToggle
                checked={settings.autoAdvanceOnCorrect ?? true}
                onChange={(checked) => onSettingsChange({ autoAdvanceOnCorrect: checked })}
                title="Автопереход при верном ответе"
                subtitle="Автоматически воспроизводить новое задание через секунду"
                icon={<CheckCircle2 className="w-4 h-4 text-emerald-400" />}
              />

              {/* Cadence before scale degree task */}
              <AppleToggle
                checked={settings.cadenceBeforeTask ?? false}
                onChange={(checked) => onSettingsChange({ cadenceBeforeTask: checked })}
                title="Каденция перед ступенью"
                subtitle="Настраивать слух каденцией D7 → T перед звучанием ступени"
                icon={<Radio className="w-4 h-4 text-indigo-400" />}
              />
            </div>
          </div>

          {/* SECTION 4: HARMONY & NOTATION */}
          <div className="space-y-1.5">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 px-1">
              Гармония и нотация
            </span>
            <div className="bg-slate-950/70 rounded-2xl border border-slate-800 p-3 space-y-2.5">
              <span className="text-slate-300 font-medium block text-xs">
                Стиль подписи аккордов в оборотах:
              </span>
              <div className="grid grid-cols-1 gap-1.5">
                <button
                  type="button"
                  onClick={() => onSettingsChange({ progressionNotation: 'roman' })}
                  className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex items-center justify-between ${
                    (settings.progressionNotation ?? 'roman') === 'roman'
                      ? 'bg-indigo-600/20 border-indigo-500 text-indigo-100 font-bold ring-1 ring-indigo-500/40'
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
                      ? 'bg-indigo-600/20 border-indigo-500 text-indigo-100 font-bold ring-1 ring-indigo-500/40'
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
                      ? 'bg-indigo-600/20 border-indigo-500 text-indigo-100 font-bold ring-1 ring-indigo-500/40'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-850'
                  }`}
                >
                  <div>
                    <span className="block text-xs font-semibold">Буквенная: C, G7/B, Am</span>
                    <span className="text-[10px] text-slate-400">Эстрадно-джазовые буквенные аккорды</span>
                  </div>
                  {settings.progressionNotation === 'letter' && (
                    <Check className="w-4 h-4 text-indigo-400 shrink-0" />
                  )}
                </button>
              </div>

              {onOpenProgressionCatalog && (
                <button
                  type="button"
                  onClick={() => {
                    onOpenProgressionCatalog();
                    onClose();
                  }}
                  className="w-full mt-2 py-2 px-3 bg-purple-950/50 hover:bg-purple-900/70 text-purple-200 border border-purple-500/30 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  <span>Каталог 4-голосных оборотов</span>
                </button>
              )}
            </div>
          </div>

          {/* SECTION 5: APPEARANCE */}
          <div className="space-y-1.5">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 px-1">
              Оформление
            </span>
            <div className="bg-slate-950/70 rounded-2xl border border-slate-800 p-3 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-200 flex items-center gap-1.5 text-xs">
                  {settings.theme === 'light' ? (
                    <Sun className="w-4 h-4 text-amber-400" />
                  ) : (
                    <Moon className="w-4 h-4 text-indigo-400" />
                  )}
                  <span>Тема интерфейса</span>
                </span>
                <span className="text-[11px] font-medium text-slate-400">
                  {settings.theme === 'light' ? 'Светлая бумага' : 'Studio Dark'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                <button
                  type="button"
                  onClick={() => onSettingsChange({ theme: 'dark' })}
                  className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs font-semibold transition cursor-pointer border ${
                    settings.theme !== 'light'
                      ? 'bg-slate-800 text-slate-100 border-slate-700 shadow-xs'
                      : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  <Moon className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Studio Dark</span>
                </button>
                <button
                  type="button"
                  onClick={() => onSettingsChange({ theme: 'light' })}
                  className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs font-semibold transition cursor-pointer border ${
                    settings.theme === 'light'
                      ? 'bg-slate-800 text-slate-100 border-slate-700 shadow-xs'
                      : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span>Светлая бумага</span>
                </button>
              </div>
            </div>
          </div>

          {/* SECTION 6: TOOLS & OFFLINE */}
          <div className="space-y-1.5">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 px-1">
              Инструменты и автономность
            </span>
            <div className="bg-slate-950/70 rounded-2xl border border-slate-800 p-2 space-y-1">
              {onOpenInstallModal && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenInstallModal();
                  }}
                  className="w-full p-2.5 rounded-xl hover:bg-slate-900 text-left transition cursor-pointer flex items-center justify-between group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-indigo-500/15 text-indigo-400">
                      <Smartphone className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-semibold text-slate-200 text-xs block group-hover:text-indigo-300">
                        Установка PWA на телефон
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Полноэкранный запуск без интернета
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-slate-300" />
                </button>
              )}

              <button
                type="button"
                onClick={downloadStandaloneHtmlFile}
                className="w-full p-2.5 rounded-xl hover:bg-slate-900 text-left transition cursor-pointer flex items-center justify-between group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-sky-500/15 text-sky-400">
                    <Download className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-semibold text-slate-200 text-xs block group-hover:text-sky-300">
                      Экспорт автономного HTML
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Запуск тренажёра локально в браузере
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-slate-300" />
              </button>

              {onOpenAcademicAuditModal && (
                <button
                  type="button"
                  onClick={() => {
                    onOpenAcademicAuditModal();
                    onClose();
                  }}
                  className="w-full p-2.5 rounded-xl hover:bg-slate-900 text-left transition cursor-pointer flex items-center justify-between group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-400">
                      <FileCheck2 className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-semibold text-slate-200 text-xs block group-hover:text-emerald-300">
                        Академический аудит теории
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Автоматическая верификация правил
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-slate-300" />
                </button>
              )}

              {onOpenChangelogModal && (
                <button
                  type="button"
                  onClick={() => {
                    onOpenChangelogModal();
                    onClose();
                  }}
                  className="w-full p-2.5 rounded-xl hover:bg-slate-900 text-left transition cursor-pointer flex items-center justify-between group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-amber-500/15 text-amber-400">
                      <History className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-semibold text-slate-200 text-xs block group-hover:text-amber-300">
                        Журнал обновлений
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
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="p-3.5 border-t border-slate-800 bg-slate-900/95 shrink-0 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            Сохраняется автоматически
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-xs"
          >
            Готово
          </button>
        </div>
      </div>
    </div>
  );
};
