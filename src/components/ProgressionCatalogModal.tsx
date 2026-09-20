import React, { useState, useMemo, useEffect } from 'react';
import {
  CLASSICAL_PROGRESSIONS,
  HarmonicProgressionTemplate,
  ScaleDegreeCategory,
  ProgressionCategory,
  realizeProgression,
} from '../audio/harmonicProgressions';
import { PlaybackSettings } from '../types';
import { audioEngine } from '../audio/audioEngine';
import {
  X,
  BookOpen,
  Play,
  CheckCircle,
  Sparkles,
  Layers,
  Search,
  Volume2,
  Filter,
  ArrowRight,
} from 'lucide-react';
import { convertSymbolToRomanDegree, renderAnalyticalSymbol } from './ProgressionModeCard';

interface ProgressionCatalogModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: PlaybackSettings;
  onSelectProgression: (template: HarmonicProgressionTemplate) => void;
}

const SCALE_DEGREES: { key: ScaleDegreeCategory; labelRu: string; descriptionRu: string }[] = [
  { key: 'all', labelRu: 'Все ступени', descriptionRu: 'Все доступные обороты классической гармонии' },
  { key: 'I', labelRu: 'I ступень', descriptionRu: 'Тоническая сфера: устойчивые, проходящие, кадансовые и плагальные' },
  { key: 'II', labelRu: 'II ступень', descriptionRu: 'Супертоника: II6/5, ii-V-I каденции, преддоминанта' },
  { key: 'III', labelRu: 'III ступень', descriptionRu: 'Медианта: терцовые шаги, кварто-квинтовые цепочки' },
  { key: 'IV', labelRu: 'IV ступень', descriptionRu: 'Субдоминанта: S — K6/4 — D7, проходящие в субдоминанте' },
  { key: 'V', labelRu: 'V ступень', descriptionRu: 'Доминанта: прерванные каденции D7 — VI, предыктовые обороты' },
  { key: 'VI', labelRu: 'VI ступень', descriptionRu: 'Субмедианта: VI — II6 — K6/4 — D7, лирические обороты' },
  { key: 'VII', labelRu: 'VII ступень', descriptionRu: 'Вводный тон: VII6 — T, вводный септаккорд VII7 — D6/5 — T' },
];

const CATEGORIES: { key: string; labelRu: string }[] = [
  { key: 'all', labelRu: 'Все категории' },
  { key: 'passing', labelRu: 'Проходящие' },
  { key: 'auxiliary', labelRu: 'Вспомогательные' },
  { key: 'phrygian', labelRu: 'Фригийские' },
  { key: 'cadential', labelRu: 'Кадансовые' },
  { key: 'deceptive', labelRu: 'Прерванные' },
  { key: 'sequence', labelRu: 'Секвенции' },
];

export const ProgressionCatalogModal: React.FC<ProgressionCatalogModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSelectProgression,
}) => {
  const [selectedDegree, setSelectedDegree] = useState<ScaleDegreeCategory>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedMode, setSelectedMode] = useState<'all' | 'major' | 'minor'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewPlayingId, setPreviewPlayingId] = useState<string | null>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Filter progressions
  const filteredProgressions = useMemo(() => {
    return CLASSICAL_PROGRESSIONS.filter((item) => {
      // Scale degree filter
      if (selectedDegree !== 'all' && item.rootDegree !== selectedDegree) {
        return false;
      }
      // Category filter
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }
      // Mode filter
      if (selectedMode !== 'all') {
        if (item.scaleMode !== 'both' && item.scaleMode !== selectedMode) {
          return false;
        }
      }
      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = item.nameRu.toLowerCase().includes(q);
        const matchesFormula = item.formula.toLowerCase().includes(q);
        const matchesUsage = item.usageContextRu?.toLowerCase().includes(q);
        const matchesVoice = item.voiceLeadingExplanationRu?.toLowerCase().includes(q);
        if (!matchesName && !matchesFormula && !matchesUsage && !matchesVoice) {
          return false;
        }
      }
      return true;
    });
  }, [selectedDegree, selectedCategory, selectedMode, searchQuery]);

  // Play preview of progression
  const handlePlayPreview = (template: HarmonicProgressionTemplate) => {
    setPreviewPlayingId(template.id);
    const realized = realizeProgression(
      template.id,
      'C',
      template.scaleMode === 'minor' ? 'minor' : 'major'
    );

    audioEngine.playProgressionTask(
      realized,
      settings,
      undefined,
      () => {
        setPreviewPlayingId(null);
      }
    );
  };

  if (!isOpen) return null;

  const notation = settings.progressionNotation || 'analytical';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 animate-in fade-in duration-150">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-5xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col z-10 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-slate-900/95 sticky top-0 z-20 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2">
                <span>Каталог гармонических оборотов</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {filteredProgressions.length} из {CLASSICAL_PROGRESSIONS.length}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Классические 4-голосные гармонические обороты от разных ступеней лада
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition cursor-pointer"
            title="Закрыть"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filters Bar */}
        <div className="p-3 sm:p-4 border-b border-slate-800/80 bg-slate-950/60 space-y-3 shrink-0">
          {/* Degree Selector Buttons */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold text-slate-300">Опорная ступень начала оборота:</span>
              <span className="text-[11px] text-indigo-300">
                {SCALE_DEGREES.find((d) => d.key === selectedDegree)?.descriptionRu}
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {SCALE_DEGREES.map((deg) => {
                const isSelected = selectedDegree === deg.key;
                const count = deg.key === 'all'
                  ? CLASSICAL_PROGRESSIONS.length
                  : CLASSICAL_PROGRESSIONS.filter((p) => p.rootDegree === deg.key).length;

                return (
                  <button
                    key={deg.key}
                    type="button"
                    onClick={() => setSelectedDegree(deg.key)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-md border border-indigo-400'
                        : 'bg-slate-850 hover:bg-slate-800 text-slate-300 border border-slate-800'
                    }`}
                  >
                    <span>{deg.labelRu}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                        isSelected ? 'bg-indigo-700 text-indigo-100' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Secondary Filters: Category, Mode, and Search */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <div className="flex flex-wrap items-center gap-2">
              {/* Category selector */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-slate-900 border border-slate-700 text-slate-200 text-xs font-medium px-3 py-1.5 rounded-xl focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.key} value={c.key}>
                    {c.labelRu}
                  </option>
                ))}
              </select>

              {/* Mode selector */}
              <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-0.5 text-xs font-medium">
                <button
                  type="button"
                  onClick={() => setSelectedMode('all')}
                  className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                    selectedMode === 'all'
                      ? 'bg-indigo-600 text-white font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Все лады
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedMode('major')}
                  className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                    selectedMode === 'major'
                      ? 'bg-indigo-600 text-white font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Мажор
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedMode('minor')}
                  className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                    selectedMode === 'minor'
                      ? 'bg-indigo-600 text-white font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Минор
                </button>
              </div>
            </div>

            {/* Search Input */}
            <div className="relative min-w-[200px] flex-1 sm:max-w-xs">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Поиск по формуле или названию..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-xs pl-8 pr-3 py-1.5 rounded-xl focus:outline-none focus:border-indigo-500 placeholder-slate-500"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Scrollable Progressions Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5">
          {filteredProgressions.length === 0 ? (
            <div className="py-12 text-center flex flex-col items-center justify-center gap-3">
              <Layers className="w-10 h-10 text-slate-600" />
              <h3 className="text-sm font-bold text-slate-300">Обороты не найдены</h3>
              <p className="text-xs text-slate-500 max-w-sm">
                Попробуйте выбрать другую ступень или сбросить фильтры поиска.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSelectedDegree('all');
                  setSelectedCategory('all');
                  setSelectedMode('all');
                  setSearchQuery('');
                }}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition cursor-pointer"
              >
                Сбросить все фильтры
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filteredProgressions.map((prog) => {
                const isPlaying = previewPlayingId === prog.id;

                // Format formula for display according to current notation
                const renderedFormula = prog.steps
                  .map((s) => {
                    if (notation === 'roman') {
                      return convertSymbolToRomanDegree(s.symbol);
                    }
                    return s.symbol.replace('/3', '');
                  })
                  .join(' → ');

                return (
                  <div
                    key={prog.id}
                    className="bg-slate-950/80 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 flex flex-col justify-between gap-3 transition shadow-sm hover:shadow-md group"
                  >
                    <div className="space-y-2.5">
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {/* Degree Badge */}
                          <span className="px-2 py-0.5 rounded-lg bg-indigo-950/80 text-indigo-300 border border-indigo-700/50 text-[10px] font-mono font-bold">
                            {prog.rootDegree || 'I'} ступень
                          </span>

                          {/* Category Badge */}
                          <span className="px-2 py-0.5 rounded-lg bg-slate-900 text-slate-300 border border-slate-800 text-[10px] font-semibold">
                            {prog.categoryNameRu}
                          </span>

                          {/* Mode Badge */}
                          <span
                            className={`px-2 py-0.5 rounded-lg border text-[10px] font-semibold ${
                              prog.scaleMode === 'major'
                                ? 'bg-amber-950/50 text-amber-300 border-amber-800/40'
                                : prog.scaleMode === 'minor'
                                ? 'bg-cyan-950/50 text-cyan-300 border-cyan-800/40'
                                : 'bg-emerald-950/50 text-emerald-300 border-emerald-800/40'
                            }`}
                          >
                            {prog.scaleMode === 'major'
                              ? 'Мажор'
                              : prog.scaleMode === 'minor'
                              ? 'Минор'
                              : 'Мажор / Минор'}
                          </span>
                        </div>

                        {/* Steps Count */}
                        <span className="text-[10px] font-mono text-slate-500 shrink-0">
                          {prog.steps.length} {prog.steps.length === 1 ? 'аккорд' : prog.steps.length < 5 ? 'аккорда' : 'аккордов'}
                        </span>
                      </div>

                      {/* Formula display */}
                      <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between gap-2">
                        <span className="font-mono font-extrabold text-sm sm:text-base text-indigo-200">
                          {renderedFormula}
                        </span>
                      </div>

                      {/* Title & Description */}
                      <div>
                        <h4 className="text-sm font-bold text-slate-200 group-hover:text-white transition">
                          {prog.nameRu}
                        </h4>
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed line-clamp-2">
                          {prog.voiceLeadingExplanationRu}
                        </p>
                      </div>

                      {/* Voice Leading Movements */}
                      <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                        <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800/60">
                          <span className="text-indigo-400 font-semibold block text-[10px]">Бас:</span>
                          <span className="text-slate-300">{prog.bassMotionRu}</span>
                        </div>
                        <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800/60">
                          <span className="text-purple-400 font-semibold block text-[10px]">Сопрано:</span>
                          <span className="text-slate-300">{prog.sopranoMotionRu}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 pt-2 border-t border-slate-900">
                      {/* Play Preview */}
                      <button
                        type="button"
                        onClick={() => handlePlayPreview(prog)}
                        disabled={isPlaying}
                        className={`flex-1 py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer active:scale-95 ${
                          isPlaying
                            ? 'bg-indigo-600 border-indigo-400 text-white animate-pulse'
                            : 'bg-slate-900 hover:bg-slate-850 border-slate-700 text-slate-200'
                        }`}
                      >
                        <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
                        <span>{isPlaying ? 'Играет...' : 'Прослушать'}</span>
                      </button>

                      {/* Select For Training */}
                      <button
                        type="button"
                        onClick={() => {
                          onSelectProgression(prog);
                          onClose();
                        }}
                        className="flex-1 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white border border-indigo-400/30 text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer shadow-sm"
                      >
                        <span>Выбрать</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 sm:p-4 border-t border-slate-800 bg-slate-900/95 shrink-0 flex items-center justify-between text-xs text-slate-400">
          <span>Нажмите «Выбрать», чтобы загрузить оборот в активный тренажёр</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition cursor-pointer"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};
