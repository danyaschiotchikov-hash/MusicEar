import React, { useState } from 'react';
import {
  PlaybackSettings,
  CategoryId,
  TimbreType,
  PlaybackStyle,
  PlaybackDirection,
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
}) => {
  // Accordion sections state
  const [openSections, setOpenSections] = useState<{
    soundParams: boolean;
    categories: boolean;
    export: boolean;
  }>({
    soundParams: true,
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
          {/* Theme Selector Section (Sun and Moon icons) */}
          <div className="bg-slate-950/60 rounded-xl border border-slate-800/80 p-2.5 sm:p-3 flex items-center justify-between gap-2">
            <span className="font-semibold text-slate-200 flex items-center gap-1.5">
              {settings.theme === 'light' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-400" />
              )}
              <span>Тема оформления</span>
            </span>

            <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-0.5 sm:p-1 rounded-xl">
              <button
                type="button"
                onClick={() => onSettingsChange({ theme: 'light' })}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  settings.theme === 'light'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Светлая тема"
                aria-label="Светлая тема"
              >
                <Sun className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Светлая</span>
              </button>
              <button
                type="button"
                onClick={() => onSettingsChange({ theme: 'dark' })}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  settings.theme !== 'light'
                    ? 'bg-indigo-600/30 text-indigo-200 border border-indigo-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Тёмная тема"
                aria-label="Тёмная тема"
              >
                <Moon className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span>Тёмная</span>
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
                <span>Параметры звука и темпа</span>
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

                {/* Style & Direction */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <span className="text-slate-400 text-[11px] block">Стиль</span>
                    <select
                      value={settings.style}
                      onChange={(e) => onSettingsChange({ style: e.target.value as PlaybackStyle })}
                      className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-2 py-1.5 text-xs font-medium cursor-pointer"
                    >
                      <option value="arpeggio">Арпеджио</option>
                      <option value="harmonic">Гармонически</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <span className="text-slate-400 text-[11px] block">Направление</span>
                    <select
                      value={settings.direction}
                      onChange={(e) => onSettingsChange({ direction: e.target.value as PlaybackDirection })}
                      className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-2 py-1.5 text-xs font-medium cursor-pointer"
                    >
                      <option value="up">⬆️ Снизу вверх</option>
                      <option value="down">⬇️ Сверху вниз</option>
                      <option value="random">🔀 Случайно</option>
                    </select>
                  </div>
                </div>

                {/* Root Note */}
                <div className="space-y-1">
                  <span className="text-slate-400 text-[11px] block">Опорная нота (Тоника)</span>
                  <select
                    value={settings.rootNote}
                    onChange={(e) => onSettingsChange({ rootNote: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-2 py-1.5 text-xs font-medium cursor-pointer"
                  >
                    <option value="random">🎲 Случайный тон</option>
                    {NOTE_NAMES.map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
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

          {/* 3. Detailed Categories & Items Accordion */}
          <div className="bg-slate-950/60 rounded-xl border border-slate-800/80 overflow-hidden">
            <button
              onClick={() => toggleSection('categories')}
              className="w-full flex items-center justify-between p-3 text-left font-semibold text-slate-200 hover:bg-slate-900/60 transition cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-400" />
                <span>Категории и элементы ({activeItemIds.length}/{ALL_ITEMS.length})</span>
              </div>
              {openSections.categories ? (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-slate-400" />
              )}
            </button>

            {openSections.categories && (
              <div className="p-3 pt-0 border-t border-slate-800/50 space-y-2.5 pt-2">
                {/* Global Toggle Buttons */}
                <div className="flex items-center justify-between pb-1 border-b border-slate-800/60">
                  <button
                    onClick={() => onSelectAllGlobal(true)}
                    className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <CheckCheck className="w-3 h-3" />
                    <span>Выбрать всё</span>
                  </button>
                  <button
                    onClick={() => onSelectAllGlobal(false)}
                    className="text-[11px] text-rose-400 hover:text-rose-300 font-semibold cursor-pointer"
                  >
                    Снять всё
                  </button>
                </div>

                {/* Sub-accordion for each Category */}
                <div className="space-y-2">
                  {CATEGORIES.map((cat) => {
                    const catItems = ALL_ITEMS.filter((i) => i.category === cat.id);
                    const enabledCount = catItems.filter((i) => activeItemIds.includes(i.id)).length;
                    const isAllCatEnabled = enabledCount === catItems.length && catItems.length > 0;
                    const isExpanded = !!expandedCats[cat.id];

                    return (
                      <div
                        key={cat.id}
                        className="bg-slate-900/80 rounded-lg border border-slate-800/90 overflow-hidden"
                      >
                        {/* Category Header Row */}
                        <div className="flex items-center justify-between p-2 hover:bg-slate-850 transition">
                          <button
                            type="button"
                            onClick={() => onSelectAllCategory(cat.id, !isAllCatEnabled)}
                            className="flex items-center gap-1.5 text-left cursor-pointer flex-1"
                          >
                            <div className="text-slate-400">
                              {isAllCatEnabled ? (
                                <CheckSquare className="w-3.5 h-3.5 text-indigo-400" />
                              ) : enabledCount > 0 ? (
                                <Check className="w-3.5 h-3.5 text-amber-400" />
                              ) : (
                                <Square className="w-3.5 h-3.5 text-slate-600" />
                              )}
                            </div>
                            <span className="text-xs font-semibold text-slate-200">
                              {cat.name}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              ({enabledCount}/{catItems.length})
                            </span>
                          </button>

                          <button
                            type="button"
                            onClick={() => toggleCatExpand(cat.id)}
                            className="p-1 text-slate-400 hover:text-slate-200 transition cursor-pointer"
                          >
                            {isExpanded ? (
                              <ChevronDown className="w-3.5 h-3.5" />
                            ) : (
                              <ChevronRight className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>

                        {/* Collapsible Items List */}
                        {isExpanded && (
                          <div className="p-2 pt-1 border-t border-slate-800/60 bg-slate-950/40 space-y-1">
                            {catItems.map((item) => {
                              const isChecked = activeItemIds.includes(item.id);
                              return (
                                <label
                                  key={item.id}
                                  className={`flex items-center justify-between p-1.5 rounded-md cursor-pointer transition text-[11px] ${
                                    isChecked
                                      ? 'bg-indigo-950/30 text-slate-200'
                                      : 'text-slate-400 hover:bg-slate-900/60'
                                  }`}
                                >
                                  <div className="flex items-center gap-1.5 flex-1 pr-1 truncate">
                                    <input
                                      type="checkbox"
                                      checked={isChecked}
                                      onChange={() => onToggleItem(item.id)}
                                      className="rounded text-indigo-500 focus:ring-0 cursor-pointer accent-indigo-500"
                                    />
                                    <span className="truncate">{item.name}</span>
                                  </div>
                                  {item.hint && (
                                    <span className="text-[9px] font-mono text-slate-400 bg-slate-800/80 px-1 py-0.2 rounded shrink-0">
                                      {item.hint}
                                    </span>
                                  )}
                                </label>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
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
                <span>Автономная версия (HTML)</span>
              </div>
              {openSections.export ? (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-slate-400" />
              )}
            </button>

            {openSections.export && (
              <div className="p-3 pt-0 border-t border-slate-800/50 space-y-2 pt-2">
                <p className="text-[11px] text-slate-400 leading-snug">
                  Скачайте приложение одним HTML-файлом. Работает в любом браузере офлайн без интернета и серверов.
                </p>
                <button
                  onClick={downloadStandaloneHtmlFile}
                  className="w-full flex items-center justify-center gap-1.5 py-2 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-semibold rounded-lg shadow-sm transition cursor-pointer"
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
