import React from 'react';
import { Flame, Trophy, RotateCcw, Zap } from 'lucide-react';
import { CurrentTask } from '../types';

interface MarathonProgressBarProps {
  marathonStreak: number;
  marathonBestStreak: number;
  isNewRecord: boolean;
  statusMessage: { text: string; type: 'idle' | 'playing' | 'correct' | 'wrong' };
  currentTask: CurrentTask | null;
  isPlaying: boolean;
  onReset: () => void;
}

const LEVEL_CONFIG = [
  { level: 1, title: 'Новичок', icon: '🌱' },
  { level: 2, title: 'Слушатель', icon: '🎧' },
  { level: 3, title: 'Практик', icon: '🎼' },
  { level: 4, title: 'Знаток', icon: '🌟' },
  { level: 5, title: 'Эксперт', icon: '💎' },
  { level: 6, title: 'Мастер', icon: '🔥' },
  { level: 7, title: 'Грандмастер', icon: '👑' },
];

export const MarathonProgressBar: React.FC<MarathonProgressBarProps> = ({
  marathonStreak,
  marathonBestStreak,
  isNewRecord,
  onReset,
}) => {
  const currentLevelNumber = Math.min(7, Math.floor(marathonStreak / 10) + 1);
  const currentLevelConfig = LEVEL_CONFIG[currentLevelNumber - 1] || LEVEL_CONFIG[0];
  const streakInLevel = marathonStreak % 10;
  const isLevelMilestone = marathonStreak > 0 && streakInLevel === 0;

  return (
    <div
      className={`w-full bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-xl px-4 py-3 shadow-xs flex items-center justify-between gap-3 transition-all ${
        isNewRecord ? 'ring-2 ring-amber-400/80' : ''
      }`}
    >
      {/* Left: Level & Streak */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-300 shrink-0">
          <span className="text-sm">{currentLevelConfig.icon}</span>
          <span>{currentLevelConfig.title}</span>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-black text-amber-300 shrink-0">
          <Flame
            className={`w-4 h-4 text-amber-400 fill-amber-400 ${
              isNewRecord ? 'animate-bounce' : marathonStreak > 0 ? 'animate-pulse' : ''
            }`}
          />
          <span>
            Серия: <span className="text-white font-black">{marathonStreak}</span>
          </span>
        </div>
      </div>

      {/* Center: Minimal Segmented Progress */}
      <div className="hidden sm:flex items-center gap-1.5 flex-1 max-w-[200px] px-2">
        <div className="w-full h-2 bg-slate-950/80 rounded-full p-0.5 border border-slate-800 flex gap-0.5 overflow-hidden">
          {Array.from({ length: 10 }).map((_, index) => {
            const isFilled = streakInLevel > index || isLevelMilestone;
            return (
              <div
                key={index}
                className={`flex-1 h-full rounded-[1px] transition-all ${
                  isFilled ? 'bg-amber-400' : 'bg-slate-800/40'
                }`}
              />
            );
          })}
        </div>
      </div>

      {/* Right: Record & Reset */}
      <div className="flex items-center gap-2 shrink-0">
        <div className="flex items-center gap-1 text-xs font-medium text-slate-400">
          <Trophy className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="font-bold text-amber-300">{marathonBestStreak}</span>
        </div>

        {marathonStreak > 0 && (
          <button
            type="button"
            onClick={onReset}
            className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 rounded-md transition cursor-pointer"
            title="Сбросить серию"
            aria-label="Сбросить серию"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
