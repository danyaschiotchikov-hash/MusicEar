import React, { useState } from 'react';
import { CategoryId } from '../types';
import { CATEGORIES, ALL_ITEMS } from '../data/musicData';
import { X, Check, CheckSquare, Square, Search, Sparkles } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeItemIds: string[];
  onToggleItem: (id: string) => void;
  onSelectAllCategory: (catId: CategoryId, select: boolean) => void;
  onSelectAllGlobal: (select: boolean) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  activeItemIds,
  onToggleItem,
  onSelectAllCategory,
  onSelectAllGlobal,
}) => {
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-slate-900/90 sticky top-0 z-10">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              Выбор элементов для тренировки
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Включено: <span className="text-indigo-400 font-semibold font-mono">{activeItemIds.length}</span> из {ALL_ITEMS.length} элементов
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar: Search and Bulk Actions */}
        <div className="p-3 sm:px-5 bg-slate-950/50 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-2.5">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Поиск по названию, ступени или формуле..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-800/80 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onSelectAllGlobal(true)}
              className="px-2.5 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 rounded-lg text-xs font-medium transition cursor-pointer"
            >
              Включить всё ({ALL_ITEMS.length})
            </button>
            <button
              onClick={() => onSelectAllGlobal(false)}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition cursor-pointer"
            >
              Снять всё
            </button>
          </div>
        </div>

        {/* Scrollable list of categories and items */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-6">
          {CATEGORIES.map((cat) => {
            const catItems = ALL_ITEMS.filter((i) => i.category === cat.id);
            const filteredItems = catItems.filter((item) => {
              if (!search.trim()) return true;
              const q = search.toLowerCase();
              return (
                item.name.toLowerCase().includes(q) ||
                item.shortName.toLowerCase().includes(q) ||
                (item.hint && item.hint.toLowerCase().includes(q)) ||
                (item.desc && item.desc.toLowerCase().includes(q))
              );
            });

            if (filteredItems.length === 0) return null;

            const enabledCount = catItems.filter((i) => activeItemIds.includes(i.id)).length;
            const isAllCatEnabled = enabledCount === catItems.length;

            return (
              <div
                key={cat.id}
                className="bg-slate-950/40 rounded-xl border border-slate-800/80 p-3.5 space-y-3"
              >
                {/* Category Header with direct category checkbox toggle */}
                <div className="flex items-center justify-between border-b border-slate-800/60 pb-2.5">
                  <button
                    type="button"
                    onClick={() => onSelectAllCategory(cat.id, !isAllCatEnabled)}
                    className="flex items-center gap-2 text-left group cursor-pointer"
                  >
                    <div className="p-1 rounded-md bg-slate-900 border border-slate-800 group-hover:border-indigo-500/50 transition">
                      {isAllCatEnabled ? (
                        <CheckSquare className="w-4 h-4 text-indigo-400" />
                      ) : enabledCount > 0 ? (
                        <Check className="w-4 h-4 text-amber-400" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-600" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-xs sm:text-sm font-bold text-slate-200 group-hover:text-indigo-300 transition">
                        {cat.name}
                      </h3>
                      <p className="text-[10px] text-slate-400">{cat.shortDesc}</p>
                    </div>
                  </button>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onSelectAllCategory(cat.id, !isAllCatEnabled)}
                      className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold cursor-pointer px-2 py-1 rounded bg-slate-900/60 border border-slate-800"
                    >
                      {isAllCatEnabled ? 'Отключить' : 'Включить'}
                      <span className="text-[10px] text-slate-400 font-mono">
                        ({enabledCount}/{catItems.length})
                      </span>
                    </button>
                  </div>
                </div>

                {/* Grid of items */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {filteredItems.map((item) => {
                    const isChecked = activeItemIds.includes(item.id);
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => onToggleItem(item.id)}
                        className={`flex items-start gap-2.5 p-2.5 rounded-lg border text-left transition cursor-pointer ${
                          isChecked
                            ? 'bg-indigo-950/40 border-indigo-600/50 text-indigo-100'
                            : 'bg-slate-900/50 border-slate-800/80 text-slate-400 hover:border-slate-700 hover:text-slate-300'
                        }`}
                      >
                        <div className="mt-0.5 shrink-0">
                          {isChecked ? (
                            <CheckSquare className="w-4 h-4 text-indigo-400" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-600" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-semibold text-xs truncate text-slate-200">
                              {item.shortName}
                            </span>
                            {item.hint && (
                              <span className="shrink-0 text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono border border-amber-500/30">
                                {item.hint}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 truncate mt-0.5">
                            {item.name}
                          </p>
                          {item.desc && (
                            <p className="text-[10px] text-slate-500 truncate mt-0.5">
                              {item.desc}
                            </p>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 border-t border-slate-800 bg-slate-900/90 flex justify-between items-center">
          <span className="text-xs text-slate-400">
            {activeItemIds.length === 0 ? (
              <span className="text-rose-400 font-medium">
                ⚠️ Выберите хотя бы 1 элемент для тренировки!
              </span>
            ) : (
              `Активно для тренировки: ${activeItemIds.length} элементов`
            )}
          </span>
          <button
            onClick={onClose}
            disabled={activeItemIds.length === 0}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-xl shadow-lg shadow-indigo-950 transition cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Готово</span>
          </button>
        </div>
      </div>
    </div>
  );
};
