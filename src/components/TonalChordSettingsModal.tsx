import React from 'react';
import { TONAL_DEGREES } from '../audio/tonalChords';
import { PlaybackSettings } from '../types';
import {
  X,
  CheckSquare,
  Square,
  Sparkles,
  Sliders,
  Check,
  RotateCcw,
  SlidersHorizontal,
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

  const handleToggleDegree = (id: string) => {
    let next: string[];
    if (currentAllowed.includes(id)) {
      if (currentAllowed.length <= 1) return; // Keep at least one
      next = currentAllowed.filter((degId) => degId !== id);
    } else {
      next = [...currentAllowed, id];
    }
    onSettingsChange({ tonalAllowedDegrees: next });
  };

  const handleSelectPreset = (preset: 'all' | 'main' | 'triads' | 'seventh_alt') => {
    if (preset === 'all') {
      onSettingsChange({ tonalAllowedDegrees: TONAL_DEGREES.map((d) => d.id) });
    } else if (preset === 'main') {
      onSettingsChange({ tonalAllowedDegrees: ['deg_I', 'deg_K64', 'deg_IV', 'deg_V', 'deg_V7'] });
    } else if (preset === 'triads') {
      onSettingsChange({ tonalAllowedDegrees: ['deg_I', 'deg_IV', 'deg_V', 'deg_II', 'deg_VI', 'deg_III'] });
    } else if (preset === 'seventh_alt') {
      onSettingsChange({
        tonalAllowedDegrees: [
          'deg_II7',
          'deg_II7_alt',
          'deg_S_alt',
          'deg_V7',
          'deg_D_add6',
          'deg_D9',
          'deg_VII',
        ],
      });
    }
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
                Настройка изучаемых аккордов
              </h2>
              <p className="text-xs text-slate-400">
                Выберите ступени и функции, которые будут генерироваться в викторине
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

        {/* Quick Presets Bar */}
        <div className="p-3 sm:p-4 bg-slate-950/40 border-b border-slate-800/80 flex flex-wrap items-center gap-1.5 shrink-0">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
            Наборы:
          </span>
          <button
            type="button"
            onClick={() => handleSelectPreset('all')}
            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 transition cursor-pointer"
          >
            Все ({TONAL_DEGREES.length})
          </button>
          <button
            type="button"
            onClick={() => handleSelectPreset('main')}
            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-950/80 hover:bg-indigo-900 text-indigo-200 border border-indigo-500/40 transition cursor-pointer"
          >
            Главные (T, S, D, K6/4)
          </button>
          <button
            type="button"
            onClick={() => handleSelectPreset('triads')}
            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-950/80 hover:bg-emerald-900 text-emerald-200 border border-emerald-500/40 transition cursor-pointer"
          >
            Трезвучия
          </button>
          <button
            type="button"
            onClick={() => handleSelectPreset('seventh_alt')}
            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-950/80 hover:bg-amber-900 text-amber-200 border border-amber-500/40 transition cursor-pointer"
          >
            Септаккорды & Альтерации
          </button>
        </div>

        {/* Degree Checkboxes list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
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
                  const label = isMinorActive ? deg.labelMinor : deg.labelMajor;
                  const nameRu = isMinorActive ? deg.nameMinorRu : deg.nameMajorRu;

                  return (
                    <button
                      key={deg.id}
                      type="button"
                      onClick={() => handleToggleDegree(deg.id)}
                      className={`flex items-start gap-2.5 p-2.5 rounded-xl border text-left transition cursor-pointer active:scale-[0.99] ${
                        isChecked
                          ? 'bg-indigo-950/40 border-indigo-500/60 text-white shadow-sm'
                          : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:bg-slate-800/50'
                      }`}
                    >
                      <div className="pt-0.5 text-indigo-400 shrink-0">
                        {isChecked ? (
                          <CheckSquare className="w-4 h-4 text-indigo-400" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-600" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-xs text-indigo-300">
                            {label}
                          </span>
                          <span className="text-[11px] font-semibold text-slate-200 truncate">
                            {nameRu}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
                          {isMinorActive ? deg.descMinorRu : deg.descMajorRu}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-400">
            Выбрано аккордов: <strong className="text-white font-mono">{currentAllowed.length}</strong> из {TONAL_DEGREES.length}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Готово</span>
          </button>
        </div>
      </div>
    </div>
  );
};
