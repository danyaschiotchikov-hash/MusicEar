import React, { useState } from 'react';
import { Download, Smartphone, X, Check, HelpCircle } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [installing, setInstalling] = useState(false);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    setInstalling(true);
    try {
      await install();
    } finally {
      setInstalling(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-5 sm:p-6 text-slate-100 relative space-y-4">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title & Icon */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white shadow-md">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100">
              Установка на телефон / ПК
            </h3>
            <p className="text-xs text-slate-400">
              Работает автономно без интернета (PWA)
            </p>
          </div>
        </div>

        {/* Highlights */}
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3.5 space-y-2 text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span><strong>100% Офлайн-режим:</strong> работает в самолёте и без связи.</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span><strong>Рояль Yamaha:</strong> сэмплы кэшируются в память устройства.</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span><strong>Без браузерной строки:</strong> выглядит и ощущается как нативное приложение.</span>
          </div>
        </div>

        {/* Actions based on platform */}
        {isInstalled ? (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-center text-xs text-emerald-300">
            ✓ Приложение уже установлено на ваше устройство!
          </div>
        ) : isInstallable ? (
          <button
            onClick={handleInstallClick}
            disabled={installing}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>{installing ? 'Установка...' : 'Установить на устройство (в 1 клик)'}</span>
          </button>
        ) : isIOS ? (
          <div className="p-3.5 bg-slate-800/80 rounded-xl border border-slate-700 text-xs text-slate-300 space-y-1.5">
            <div className="font-semibold text-amber-300 flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4" />
              Инструкция для iPhone / iPad (Safari):
            </div>
            <p>1. Нажмите кнопку <strong>«Поделиться»</strong> (квадрат со стрелкой вверх внизу экрана).</p>
            <p>2. Пролистайте вниз и выберите <strong>«На экран "Домой"»</strong> (Add to Home Screen).</p>
            <p>3. Нажмите «Добавить» — появится иконка приложения с офлайн-доступом.</p>
          </div>
        ) : (
          <div className="p-3.5 bg-slate-800/80 rounded-xl border border-slate-700 text-xs text-slate-300 space-y-1.5">
            <div className="font-semibold text-indigo-300 flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4" />
              Установка через меню браузера Chrome / Android:
            </div>
            <p>1. Нажмите на три точки <strong>⋮</strong> в правом верхнем углу браузера.</p>
            <p>2. Выберите <strong>«Установить приложение»</strong> или <strong>«Добавить на главный экран»</strong>.</p>
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition"
        >
          Закрыть
        </button>
      </div>
    </div>
  );
};
