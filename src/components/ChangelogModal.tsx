import React, { useEffect, useState } from 'react';
import { X, Sparkles, CheckCircle2, ShieldCheck, HelpCircle, Music, Wrench } from 'lucide-react';

interface ChangelogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CURRENT_CHANGELOG_VERSION = '2026-09-21-academic-audit-v1';

export function ChangelogModal({ isOpen, onClose }: ChangelogModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" 
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden z-10 animate-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-950/60 border border-indigo-500/30 text-indigo-400 rounded-lg">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">Свежие исправления и обновления</h2>
              <p className="text-xs text-slate-400">Академический контроль качества базы SATB</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable list */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Welcome Intro */}
          <div className="p-4 bg-emerald-950/20 border border-emerald-500/20 rounded-xl space-y-1">
            <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              <span>База проверена и обновлена</span>
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              На основе ваших отчетов об ошибках и академического аудита мы исправили неточности в голосоведении и улучшили отображение партитур.
            </p>
          </div>

          {/* Core Updates list */}
          <div className="space-y-4">

            {/* Fix 0: Academic Audit 10 Potential Errors */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest px-1.5 py-0.5 rounded bg-emerald-900/40 text-emerald-300 border border-emerald-500/20">
                  Академический аудит
                </span>
                <span className="text-[11px] font-mono text-slate-500">21 сен 2026</span>
              </div>
              <h4 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Исправлено 10 потенциальных ошибок в гармониях</span>
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed pl-5">
                Проведена масштабная автоматизированная проверка контрпункта всей энциклопедии. Ниже представлены первые 10 исправленных классических оборотов:
              </p>
              <ul className="text-xs text-slate-400 leading-relaxed pl-5 list-disc space-y-2 mt-1">
                <li>
                  <strong>#1 и #6 (Автентические кругообороты)</strong>: Исправлены пересечения баса с тенором на переходе 1→2 (бас понижен с <code className="text-slate-300">f</code> до правильного <code className="text-emerald-400">F</code>).
                </li>
                <li>
                  <strong>#7 (Оборот 2-го рода с примой II6)</strong>: Устранены параллельные октавы между альтом и басом при переходе 2→3 за счет тонкого перераспределения ступеней.
                </li>
                <li>
                  <strong>#8 (Оборот 2-го рода с терцией II6)</strong>: Устранены скрытые октавные параллелизмы при связке T-II6 путем оптимизации начального расположения аккорда.
                </li>
                <li>
                  <strong>#12 (Простой автентический оборот)</strong>: Исправлено одновременное движение всех голосов в одну сторону и пересечение баса на шаге 1→2 (<code className="text-slate-300">g</code> в басу заменено на <code className="text-emerald-400">G</code>).
                </li>
                <li>
                  <strong>#13 (Автентический оборот с полным D7)</strong>: Устранено перекрещивание голосов (тенор находился выше альта), обеспечено идеальное плавное разрешение в неполную тонику.
                </li>
                <li>
                  <strong>#15 (Простой плагальный оборот)</strong>: Ликвидировано пересечение баса с тенором на шаге 1→2 путем перемещения баса в правильную октаву (<code className="text-slate-300">f</code> → <code className="text-emerald-400">F</code>).
                </li>
                <li>
                  <strong>#18 (Сложный плагальный оборот)</strong>: Исправлено одновременное движение всех 4 голосов вниз при разрешении; верхние голоса направлены плавно вверх в богатое широкое созвучие.
                </li>
                <li>
                  <strong>#21 (Половинная каденция 2-го рода)</strong>: Исправлены параллельные октавы между басом и тенором при шаге <code className="text-slate-300">F</code> → <code className="text-slate-300">G</code> за счет изменения хода тенора на нисходящий к квинте доминанты.
                </li>
                <li>
                  <strong>#27 (Ракоходный проходящий оборот)</strong>: Предотвращено пересечение голосов на стыке II и III аккордов (бас плавно перенесен из малой октавы в большую: <code className="text-slate-300">f</code> → <code className="text-emerald-400">F</code>).
                </li>
              </ul>
            </div>

            <hr className="border-slate-800" />
            
            {/* Fix 1: Ties */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest px-1.5 py-0.5 rounded bg-pink-900/40 text-pink-300 border border-pink-500/20">
                  Визуализация
                </span>
                <span className="text-[11px] font-mono text-slate-500">21 сен 2026</span>
              </div>
              <h4 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                <Music className="w-4 h-4 text-pink-400" />
                <span>Автоматические лиги для удержанных звуков</span>
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed pl-5">
                Если в каком-либо из голосов (S, A, T, B) нота остается на одной высоте при смене аккорда, теперь рисуется <strong>плавная соединительная лига</strong>. Это помогает мгновенно считывать общее голосоведение и удержанные тона.
              </p>
            </div>

            <hr className="border-slate-800" />

            {/* Fix 2: Voice Leading */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest px-1.5 py-0.5 rounded bg-amber-900/40 text-amber-300 border border-amber-500/20">
                  Голосоведение
                </span>
                <span className="text-[11px] font-mono text-slate-500">21 сен 2026</span>
              </div>
              <h4 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-amber-400" />
                <span>Академическая чистка кадансовых оборотов</span>
              </h4>
              <ul className="text-xs text-slate-400 leading-relaxed pl-5 list-disc space-y-1.5">
                <li>
                  <strong>Коррекция баса</strong> в кадансах <code className="text-amber-300">#150 - #157</code>. Басовые голоса перемещены в правильную октаву, исключив пересечения с тенором и слишком низкий диапазон.
                </li>
                <li>
                  <strong>Устранение перекрещивания</strong> в обороте <code className="text-amber-300">prog_enc_153</code> (разрешение II6/5 в D7). Партии альта и тенора изящно скорректированы.
                </li>
                <li>
                  <strong>Удаление параллелизмов</strong> в обороте <code className="text-amber-300">prog_enc_156</code> (II4/3 → D6/5). Исправлены недопустимые параллельные квинты и октавы.
                </li>
              </ul>
            </div>

            <hr className="border-slate-800" />

            {/* Fix 3: Feedback Form */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest px-1.5 py-0.5 rounded bg-blue-900/40 text-blue-300 border border-blue-500/20">
                  Интерфейс
                </span>
                <span className="text-[11px] font-mono text-slate-500">21 сен 2026</span>
              </div>
              <h4 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                <Wrench className="w-4 h-4 text-blue-400" />
                <span>Облегченная отправка ошибок</span>
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed pl-5">
                Поле ввода Email полностью убрано для экономии времени. Форма адаптирована для мгновенной отправки любого количества неточностей подряд без блокировок экрана.
              </p>
            </div>

          </div>

        </div>

        {/* Footer */}
        <div className="p-5 border-t border-slate-800 bg-slate-950/40 flex items-center justify-between shrink-0">
          <p className="text-[10px] text-slate-500 leading-tight">
            Спасибо, что помогаете делать<br />Сольфеджио SATB совершеннее!
          </p>
          <button
            onClick={onClose}
            className="py-2 px-5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg transition active:scale-[0.98] cursor-pointer"
          >
            Отлично, понятно!
          </button>
        </div>

      </div>
    </div>
  );
}
