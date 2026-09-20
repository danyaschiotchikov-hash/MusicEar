import React, { useState } from 'react';
import { CATEGORIES, ALL_ITEMS } from '../data/musicData';
import { CategoryId } from '../types';
import {
  X,
  ListMusic,
  CheckSquare,
  Square,
  Check,
  ChevronDown,
  ChevronRight,
  Filter,
} from 'lucide-react';

interface CategorySelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeItemIds: string[];
  onToggleItem: (id: string) => void;
  onSelectAllCategory: (catId: CategoryId, select: boolean) => void;
  onSelectAllGlobal: (select: boolean) => void;
}

export const CategorySelectorModal: React.FC<CategorySelectorModalProps> = ({
  isOpen,
  onClose,
  activeItemIds,
  onToggleItem,
  onSelectAllCategory,
  onSelectAllGlobal,
}) => {
  const [expandedCats, setExpandedCats] = useState<Record<string, boolean>>({
    simple_intervals: true,
    characteristic_intervals: true,
    triads: true,
    seventh_chords: true,
    d7_inversions: true,
  });

  if (!isOpen) return null;

  const toggleCatExpand = (catId: string) => {
    setExpandedCats((prev) => ({ ...prev, [catId]: !prev[catId] }));
  };

  const totalItemsCount = ALL_ITEMS.length;
  const activeCount = activeItemIds.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Filter className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">
                Категории и элементы
              </h2>
              <p className="text-xs text-slate-400">
                Выбрано: <strong className="text-indigo-300">{activeCount}</strong> из {totalItemsCount} элементов
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition cursor-pointer"
            title="Закрыть"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Global Quick Action Buttons */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950/40 border-b border-slate-800/80 text-xs">
          <button
            type="button"
            onClick={() => onSelectAllGlobal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/20 text-indigo-200 border border-indigo-500/30 hover:bg-indigo-600/30 transition cursor-pointer font-medium"
          >
            <CheckSquare className="w-3.5 h-3.5 text-indigo-400" />
            <span>Выбрать все</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectAllGlobal(false)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/60 text-slate-300 border border-slate-700 hover:bg-slate-800 transition cursor-pointer font-medium"
          >
            <Square className="w-3.5 h-3.5 text-slate-400" />
            <span>Сбросить все</span>
          </button>
        </div>

        {/* Categories List Body */}
        <div className="p-4 overflow-y-auto space-y-3 font-sans max-h-[60vh] custom-scrollbar">
          {CATEGORIES.map((cat) => {
            const catItems = ALL_ITEMS.filter((i) => i.category === cat.id);
            if (catItems.length === 0) return null;

            const selectedCatItemsCount = catItems.filter((i) =>
              activeItemIds.includes(i.id)
            ).length;
            const isAllSelected = selectedCatItemsCount === catItems.length;
            const isSomeSelected = selectedCatItemsCount > 0 && !isAllSelected;
            const isExpanded = !!expandedCats[cat.id];

            return (
              <div
                key={cat.id}
                className="bg-slate-950/60 border border-slate-800/80 rounded-xl overflow-hidden transition"
              >
                {/* Category Header Row */}
                <div className="flex items-center justify-between p-3 bg-slate-900/50 hover:bg-slate-900/90 transition border-b border-slate-800/50">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <button
                      type="button"
                      onClick={() =>
                        onSelectAllCategory(cat.id as CategoryId, !isAllSelected)
                      }
                      className="p-1 rounded text-slate-300 hover:text-indigo-400 transition cursor-pointer shrink-0"
                      title={isAllSelected ? 'Снять выделение категории' : 'Выделить всю категорию'}
                    >
                      {isAllSelected ? (
                        <CheckSquare className="w-4 h-4 text-indigo-400" />
                      ) : isSomeSelected ? (
                        <div className="w-4 h-4 rounded bg-indigo-500/30 border border-indigo-400 flex items-center justify-center">
                          <div className="w-2 h-2 bg-indigo-400 rounded-sm" />
                        </div>
                      ) : (
                        <Square className="w-4 h-4 text-slate-500" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => toggleCatExpand(cat.id)}
                      className="flex items-center gap-2 text-left flex-1 min-w-0 cursor-pointer"
                    >
                      <span className="font-bold text-slate-200 text-xs sm:text-sm truncate">
                        {cat.name}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full shrink-0">
                        {selectedCatItemsCount}/{catItems.length}
                      </span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleCatExpand(cat.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition cursor-pointer"
                  >
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* Individual Items Grid */}
                {isExpanded && (
                  <div className="p-3 grid grid-cols-2 sm:grid-cols-3 gap-1.5 bg-slate-950/40">
                    {catItems.map((item) => {
                      const isChecked = activeItemIds.includes(item.id);

                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => onToggleItem(item.id)}
                          className={`flex items-center gap-2 p-2 rounded-lg text-left text-xs transition cursor-pointer border ${
                            isChecked
                              ? 'bg-indigo-950/80 border-indigo-500/50 text-indigo-200 font-semibold shadow-sm'
                              : 'bg-slate-900/60 border-slate-800/80 text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
                          }`}
                        >
                          <div
                            className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 ${
                              isChecked
                                ? 'bg-indigo-600 border-indigo-400 text-white'
                                : 'border-slate-600 bg-slate-950'
                            }`}
                          >
                            {isChecked && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                          </div>
                          <span className="truncate">{item.shortName || item.name}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg transition active:scale-95 cursor-pointer"
          >
            Готово
          </button>
        </div>
      </div>
    </div>
  );
};
