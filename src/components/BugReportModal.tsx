import React, { useState } from 'react';
import { useActionTracker } from '../context/ActionTrackerContext.tsx';
import { AlertCircle, Bug, CheckCircle2, Clipboard, Loader2, X } from 'lucide-react';

interface BugReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SECTION_MAP: Record<string, string> = {
  'standard': 'Стандартный тест (Интервалы/Аккорды)',
  'oral': 'Слуховой диктант',
  'construction': 'Конструктор созвучий',
  'degree': 'Ступени в тональности',
  'tonal': 'Функциональный слух',
  'progression': 'Цепочки аккордов',
  'harmonization': 'Гармонизация сопрано',
  'pitch_memory': 'Калибровка высоты тона',
  'marathon': 'Марафон (Выживание)',
  'settings': 'Настройки звука/интерфейса',
  'general': 'Общие проблемы интерфейса'
};

export const BugReportModal: React.FC<BugReportModalProps> = ({ isOpen, onClose }) => {
  const { actions, currentSection, logAction } = useActionTracker();
  
  // Convert currentSection to mapped key if possible, else default to 'general'
  const defaultSection = Object.keys(SECTION_MAP).includes(currentSection) 
    ? currentSection 
    : 'general';

  const [selectedSection, setSelectedSection] = useState<string>(defaultSection);
  const [description, setDescription] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  // Sync selectedSection with currentSection when modal opens
  React.useEffect(() => {
    if (isOpen) {
      const mapped = Object.keys(SECTION_MAP).includes(currentSection) ? currentSection : 'general';
      setSelectedSection(mapped);
      setErrorMessage(null);
      setSuccessMessage(null);
      setDescription('');
    }
  }, [isOpen, currentSection]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      setErrorMessage('Пожалуйста, опишите возникшую проблему');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      // Log submission action
      logAction('Отправка баг-репорта');

      const response = await fetch('/api/bugs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description: description.trim(),
          currentSection: selectedSection,
          recentActions: actions,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Не удалось отправить баг-репорт');
      }

      setSuccessMessage('Баг-репорт успешно сохранен в базе данных! Спасибо за помощь.');
      setDescription('');
      logAction('Баг-репорт успешно отправлен');

      // Auto close after 2.5s
      setTimeout(() => {
        onClose();
      }, 2500);
    } catch (err: any) {
      console.error('Submit bug error:', err);
      setErrorMessage(err.message || 'Ошибка сети при отправке баг-репорта');
    } finally {
      setIsLoading(false);
    }
  };

  const copyLogsToClipboard = () => {
    const logStr = JSON.stringify({ currentSection: selectedSection, recentActions: actions }, null, 2);
    navigator.clipboard.writeText(logStr).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div 
        className="relative w-full max-w-lg bg-white dark:bg-[#1C1C1E] rounded-2xl border border-slate-100 dark:border-white/5 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-[#2C2C2E]/30">
          <div className="flex items-center gap-2 text-rose-500">
            <Bug className="w-5 h-5" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Сообщить об ошибке</h3>
          </div>
          <div className="flex items-center gap-2.5">
            <a
              href="/api/bugs/export"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold px-2.5 py-1.5 rounded-lg text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-950/30 hover:bg-emerald-100 dark:hover:bg-emerald-950/45 transition-colors cursor-pointer"
              title="Скачать все баг-репорты в формате CSV"
            >
              Экспорт CSV
            </a>
            <button 
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 dark:text-slate-500 hover:text-slate-700 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          {errorMessage && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/20 text-rose-500 border border-rose-100 dark:border-rose-950/40 rounded-xl flex items-start gap-2 text-sm">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-950/40 rounded-xl flex items-start gap-2 text-sm">
              <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-mono font-bold tracking-wider uppercase text-slate-400 dark:text-slate-500">
              Раздел приложения
            </label>
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="w-full bg-slate-50 dark:bg-[#2C2C2E] border border-slate-200 dark:border-white/5 rounded-xl px-3 py-2.5 text-sm text-slate-700 dark:text-slate-200 focus:outline-hidden focus:ring-1 focus:ring-rose-500"
            >
              {Object.entries(SECTION_MAP).map(([key, value]) => (
                <option key={key} value={key}>
                  {value}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono font-bold tracking-wider uppercase text-slate-400 dark:text-slate-500">
              Описание проблемы
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Опишите, что именно пошло не так, и как это повторить..."
              rows={4}
              maxLength={2000}
              className="w-full bg-slate-50 dark:bg-[#2C2C2E] border border-slate-200 dark:border-white/5 rounded-xl px-3 py-2.5 text-sm text-slate-700 dark:text-slate-200 focus:outline-hidden focus:ring-1 focus:ring-rose-500 placeholder-slate-400 resize-none"
            />
          </div>

          {/* Hidden/Collapsible Details section for Logs */}
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-white/5">
            <details className="group">
              <summary className="text-xs font-semibold cursor-pointer text-slate-500 dark:text-slate-400 select-none group-open:text-rose-500 flex items-center justify-between">
                <span>Просмотреть отправляемые логи (хлебные крошки)</span>
                <span className="text-[10px] bg-slate-100 dark:bg-[#2C2C2E] px-1.5 py-0.5 rounded-sm">
                  {actions.length} действий записано
                </span>
              </summary>
              <div className="mt-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-mono">Последние 10 действий пользователя</span>
                  <button
                    type="button"
                    onClick={copyLogsToClipboard}
                    className="text-[10px] flex items-center gap-1 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 bg-slate-100 dark:bg-[#2C2C2E] px-2 py-1 rounded-md"
                  >
                    <Clipboard className="w-3 h-3" />
                    {copied ? 'Скопировано!' : 'Копировать'}
                  </button>
                </div>
                <div className="max-h-40 overflow-y-auto bg-slate-950 text-emerald-400 font-mono text-[10px] p-3 rounded-xl border border-white/5 whitespace-pre-wrap leading-relaxed">
                  {JSON.stringify({ section: selectedSection, logs: actions }, null, 2)}
                </div>
              </div>
            </details>
          </div>

          {/* Footer Action Buttons */}
          <div className="flex items-center gap-3 pt-4 border-t border-slate-100 dark:border-white/5">
            <button
              type="button"
              disabled={isLoading}
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-slate-200 dark:border-white/5 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-semibold hover:bg-slate-50 dark:hover:bg-white/5 disabled:opacity-50"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={isLoading || !description.trim()}
              className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-sm font-semibold disabled:opacity-50 transition-colors shadow-xs"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Отправка...</span>
                </>
              ) : (
                <>
                  <Bug className="w-4 h-4" />
                  <span>Отправить отчет</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
