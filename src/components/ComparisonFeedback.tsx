import React, { useState } from 'react';
import { MusicItem, PlaybackSettings } from '../types';
import { audioEngine } from '../audio/audioEngine';
import { Play, Volume2, ArrowRight, Lightbulb, CheckCircle, XCircle, Sparkles } from 'lucide-react';

interface ComparisonFeedbackProps {
  chosenItem: MusicItem;
  targetItem: MusicItem;
  rootMidi: number;
  settings: PlaybackSettings;
  onContinue: () => void;
  onVisualNotes?: (midis: number[]) => void;
}

/**
 * Generates an empathic musical hint explaining the acoustic and theoretical distinction
 */
function getMusicalDifferenceHint(chosen: MusicItem, target: MusicItem): string {
  const isInterval = (cat: string) => cat === 'simple_intervals' || cat === 'characteristic_intervals';

  // If both are intervals
  if (isInterval(chosen.category) && isInterval(target.category)) {
    const chosenSemis = chosen.semitones?.[chosen.semitones.length - 1] ?? 0;
    const targetSemis = target.semitones?.[target.semitones.length - 1] ?? 0;
    const diff = Math.abs(chosenSemis - targetSemis);

    if (diff === 1) {
      if (chosenSemis > targetSemis) {
        return `Вы взяли интервал на 1 полутон шире. ${chosen.shortName} звучит светлее и шире, тогда как ${target.shortName} — более сжато.`;
      } else {
        return `Вы взяли интервал на 1 полутон уже. ${target.shortName} требует более широкого слухового охвата.`;
      }
    }

    if ((chosenSemis === 6 && targetSemis === 5) || (chosenSemis === 5 && targetSemis === 6)) {
      return 'Тритон (ув.4 / ум.5) звучит остро и напряженно, требуя разрешения, тогда как чистая кварта (ч.4) — устойчива и призывна.';
    }

    if ((chosenSemis === 6 && targetSemis === 7) || (chosenSemis === 7 && targetSemis === 6)) {
      return 'Чистая квинта (ч.5) — абсолютно пустотный и устойчивый консонанс, а тритон — остро диссонирует.';
    }
  }

  // If chords
  if (
    (chosen.category === 'triads' || chosen.category === 'seventh_chords') &&
    (target.category === 'triads' || target.category === 'seventh_chords')
  ) {
    if (chosen.id.includes('maj') && target.id.includes('min')) {
      return 'Обратите внимание на терцовый тон: у мажорного аккорда в основании лежит большая терция (светлое звучание), у минорного — малая (матовое/меланхоличное).';
    }
    if (chosen.id.includes('min') && target.id.includes('maj')) {
      return 'Услышьте окраску терции: в миноре она тяготеет вниз, а в мажоре звучит устойчиво и светло.';
    }
    if (target.id.includes('dim') || target.id.includes('half_dim')) {
      return 'Уменьшенные созвучия имеют характерную сжатость и неустойчивость за счет уменьшенной квинты (тритона).';
    }
    if (chosen.category === 'seventh_chords' && target.category === 'seventh_chords') {
      return 'Прислушайтесь к интервалу между басом и вершиной (септиме): малая септима звучит мягче, большая септима — с резким тяготением.';
    }
  }

  // Modes
  if (chosen.category === 'modes' && target.category === 'modes') {
    return 'У каждого лада есть свой характерный звук-индикатор (например, высокая VI ступень в дорийском или низкая II в фригийском).';
  }

  return `Сравните последовательно характер звучания и плотность фонизма между ${chosen.shortName} и ${target.shortName}.`;
}

export const ComparisonFeedback: React.FC<ComparisonFeedbackProps> = ({
  chosenItem,
  targetItem,
  rootMidi,
  settings,
  onContinue,
  onVisualNotes,
}) => {
  const [playingState, setPlayingState] = useState<'idle' | 'chosen' | 'target' | 'sequence'>('idle');

  const hint = getMusicalDifferenceHint(chosenItem, targetItem);

  const handlePlayChosen = () => {
    setPlayingState('chosen');
    audioEngine.playItem(chosenItem, rootMidi, settings, onVisualNotes);
    setTimeout(() => setPlayingState('idle'), 1600);
  };

  const handlePlayTarget = () => {
    setPlayingState('target');
    audioEngine.playItem(targetItem, rootMidi, settings, onVisualNotes);
    setTimeout(() => setPlayingState('idle'), 1600);
  };

  const handlePlayComparison = () => {
    setPlayingState('sequence');
    audioEngine.playComparisonSequence(
      chosenItem,
      targetItem,
      rootMidi,
      settings,
      onVisualNotes,
      () => setPlayingState('idle')
    );
  };

  return (
    <div className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 sm:p-4 shadow-xl flex flex-col gap-3 animate-in fade-in zoom-in-98 duration-200">
      {/* Header with Empathy Badge */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-400">
            <Lightbulb className="w-4 h-4" />
          </span>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-slate-100 flex items-center gap-1.5">
              Момент для глубокого обучения: <span className="text-amber-300">Услышьте разницу</span>
            </h4>
            <p className="text-[11px] text-slate-400">
              Сравнение на слух помогает закрепить правильный слуховой образ
            </p>
          </div>
        </div>

        <button
          onClick={onContinue}
          className="py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
        >
          <span>Дальше</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Side by side comparison cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
        {/* Chosen Card */}
        <div className="bg-rose-950/20 border border-rose-900/40 rounded-xl p-2.5 sm:p-3 flex flex-col justify-between gap-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <div>
                <span className="text-[10px] uppercase font-bold text-rose-300">Ваш выбор</span>
                <div className="text-sm font-extrabold text-slate-100">{chosenItem.name}</div>
                <div className="text-[11px] text-rose-300/80 font-mono font-semibold">{chosenItem.shortName}</div>
              </div>
            </div>
          </div>

          <button
            onClick={handlePlayChosen}
            disabled={playingState !== 'idle'}
            className={`w-full py-1.5 px-2.5 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
              playingState === 'chosen'
                ? 'bg-rose-600 text-white border-rose-500 animate-pulse ring-2 ring-rose-400'
                : 'bg-slate-900/80 hover:bg-slate-800 text-slate-200 border-slate-700'
            }`}
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Слушать ваш ответ</span>
          </button>
        </div>

        {/* Target (Correct) Card */}
        <div className="bg-emerald-950/20 border border-emerald-900/40 rounded-xl p-2.5 sm:p-3 flex flex-col justify-between gap-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-300">Правильный ответ</span>
                <div className="text-sm font-extrabold text-slate-100">{targetItem.name}</div>
                <div className="text-[11px] text-emerald-300/80 font-mono font-semibold">{targetItem.shortName}</div>
              </div>
            </div>
          </div>

          <button
            onClick={handlePlayTarget}
            disabled={playingState !== 'idle'}
            className={`w-full py-1.5 px-2.5 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
              playingState === 'target'
                ? 'bg-emerald-600 text-white border-emerald-500 animate-pulse ring-2 ring-emerald-400'
                : 'bg-slate-900/80 hover:bg-slate-800 text-slate-200 border-slate-700'
            }`}
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Слушать правильный</span>
          </button>
        </div>
      </div>

      {/* Empathic musical insight */}
      <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-2.5 text-xs text-slate-300 flex items-start gap-2">
        <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed text-slate-300 text-[11px] sm:text-xs">
          {hint}
        </p>
      </div>

      {/* Sequential Playback Action */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
        <button
          onClick={handlePlayComparison}
          disabled={playingState !== 'idle'}
          className={`py-2 px-3.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition shadow-md cursor-pointer ${
            playingState === 'sequence'
              ? 'bg-indigo-600 text-white ring-2 ring-indigo-400 animate-pulse'
              : 'bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-500 hover:to-sky-500 text-white'
          }`}
        >
          <Volume2 className="w-4 h-4" />
          <span>{playingState === 'sequence' ? 'Воспроизведение (Ваш ➔ Правильный)...' : 'Сравнить оба подряд (A ➔ B)'}</span>
        </button>

        <button
          onClick={onContinue}
          className="py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs sm:text-sm transition cursor-pointer"
        >
          Понятно, дальше ➔
        </button>
      </div>
    </div>
  );
};
