import React, { useState, useMemo, useEffect } from 'react';
import {
  CLASSICAL_PROGRESSIONS,
  HarmonicProgressionTemplate,
  realizeProgression,
} from '../audio/harmonicProgressions';
import { PlaybackSettings } from '../types';
import { audioEngine } from '../audio/audioEngine';
import {
  X,
  BookOpen,
  Search,
  Volume2,
  ArrowRight,
  Layers,
} from 'lucide-react';
import { convertSymbolToRomanDegree } from './ProgressionModeCard';

interface ProgressionCatalogModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: PlaybackSettings;
  onSelectProgression: (template: HarmonicProgressionTemplate) => void;
}

const CATEGORIES: { key: string; labelRu: string }[] = [
  { key: 'all', labelRu: 'Все разделы' },
  { key: 'cadential', labelRu: '1. Кадансовые' },
  { key: 'passing', labelRu: '2. Проходящие' },
  { key: 'auxiliary', labelRu: '3. Вспомогательные' },
  { key: 'deceptive', labelRu: '4. Прерванные' },
  { key: 'disjunct', labelRu: '5. Со скачками' },
  { key: 'altered', labelRu: '6. Альтерированные' },
  { key: 'modal', labelRu: '7. Модальные' },
  { key: 'sequence', labelRu: '8. Секвенции' },
  { key: 'ellipsis', labelRu: '9. Эллипсис' },
  { key: 'modern', labelRu: '10. Современные' },
];

export const ProgressionCatalogModal: React.FC<ProgressionCatalogModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSelectProgression,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedMode, setSelectedMode] = useState<'all' | 'major' | 'minor'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewPlayingId, setPreviewPlayingId] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const filteredProgressions = useMemo(() => {
    return CLASSICAL_PROGRESSIONS.filter((item) => {
      if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
      if (selectedMode !== 'all') {
        if (item.scaleMode !== 'both' && item.scaleMode !== selectedMode) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = item.nameRu.toLowerCase().includes(q);
        const matchesFormula = item.formula.toLowerCase().includes(q);
        const matchesUsage = item.usageContextRu?.toLowerCase().includes(q);
        if (!matchesName && !matchesFormula && !matchesUsage) return false;
      }
      return true;
    });
  }, [selectedCategory, selectedMode, searchQuery]);

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
      () => setPreviewPlayingId(null)
    );
  };

  if (!isOpen) return null;

  const notation = settings.progressionNotation || 'analytical';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 animate-in fade-in duration-150">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-4xl max-h-[85vh] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col z-10 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/95 sticky top-0 z-20 shrink-0">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <span>Глоссарий оборотов</span>
              <span className="text-xs font-normal text-slate-400">
                ({filteredProgressions.length})
              </span>
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition cursor-pointer"
            title="Закрыть"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Minimalist Filters Bar */}
        <div className="p-3 border-b border-slate-800/80 bg-slate-950/60 space-y-2.5 shrink-0">
          {/* Category Sections (10 Sections) */}
          <div className="flex items-center gap-1 overflow-x-auto py-0.5 max-w-full">
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.key;
              return (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => setSelectedCategory(cat.key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer whitespace-nowrap ${
                    isSelected
                      ? 'bg-indigo-600 text-white font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 bg-slate-900/30'
                  }`}
                >
                  {cat.labelRu}
                </button>
              );
            })}
          </div>

          {/* Mode & Search Row */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-xs">
                <button
                  type="button"
                  onClick={() => setSelectedMode('all')}
                  className={`px-2 py-0.5 rounded transition ${selectedMode === 'all' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400'}`}
                >
                  Все
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedMode('major')}
                  className={`px-2 py-0.5 rounded transition ${selectedMode === 'major' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400'}`}
                >
                  Мажор
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedMode('minor')}
                  className={`px-2 py-0.5 rounded transition ${selectedMode === 'minor' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400'}`}
                >
                  Минор
                </button>
              </div>
            </div>

            {/* Search Input */}
            <div className="relative min-w-[180px] flex-1 max-w-xs">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Поиск по формуле..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 text-slate-200 text-xs pl-8 pr-3 py-1 rounded-lg focus:outline-none placeholder-slate-500"
              />
            </div>
          </div>
        </div>

        {/* Progressions List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {filteredProgressions.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              Обороты не найдены.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {filteredProgressions.map((prog) => {
                const isPlaying = previewPlayingId === prog.id;

                const renderedFormula = prog.steps
                  .map((s) => (notation === 'roman' ? convertSymbolToRomanDegree(s.symbol) : s.symbol.replace('/3', '')))
                  .join(' — ');

                return (
                  <div
                    key={prog.id}
                    className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3 flex flex-col justify-between gap-2 hover:border-slate-700 transition"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-indigo-300">
                          {renderedFormula}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {prog.categoryNameRu}
                        </span>
                      </div>

                      <h4 className="text-xs font-bold text-slate-200">
                        {prog.nameRu}
                      </h4>

                      {prog.voiceLeadingExplanationRu && (
                        <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                          {prog.voiceLeadingExplanationRu}
                        </p>
                      )}
                    </div>

                    {/* Buttons */}
                    <div className="flex items-center gap-2 pt-1.5 border-t border-slate-900">
                      <button
                        type="button"
                        onClick={() => handlePlayPreview(prog)}
                        disabled={isPlaying}
                        className="flex-1 py-1 px-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-lg text-xs font-medium flex items-center justify-center gap-1 transition cursor-pointer"
                      >
                        <Volume2 className="w-3 h-3 text-indigo-400" />
                        <span>{isPlaying ? 'Играет...' : 'Слушать'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          onSelectProgression(prog);
                          onClose();
                        }}
                        className="flex-1 py-1 px-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition cursor-pointer shadow-sm"
                      >
                        <span>Выбрать</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
