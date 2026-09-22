import { useState, useCallback } from 'react';
import { PlaybackSettings } from '../types';

export interface CelebrationState {
  active: boolean;
  type: 'level_up' | 'new_record' | 'milestone';
  levelNumber?: number;
  levelTitle?: string;
  streakCount?: number;
}

const LEVEL_TITLES = [
  '',
  'Новичок',
  'Слушатель',
  'Практик',
  'Знаток',
  'Эксперт',
  'Мастер',
  'Грандмастер',
];

export function useMarathon(playFanfare?: (settings: PlaybackSettings) => void) {
  const [marathonStreak, setMarathonStreak] = useState<number>(0);
  const [isNewRecord, setIsNewRecord] = useState<boolean>(false);
  const [marathonBestStreak, setMarathonBestStreak] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('solfege_marathon_best_streak');
      return saved ? parseInt(saved, 10) || 0 : 0;
    } catch {
      return 0;
    }
  });

  const [celebrationState, setCelebrationState] = useState<CelebrationState>({
    active: false,
    type: 'milestone',
  });

  const handleCorrectMarathonAnswer = useCallback(
    (settings: PlaybackSettings) => {
      setMarathonStreak((prev) => {
        const next = prev + 1;
        const newLvl = Math.min(7, Math.floor(next / 10) + 1);

        // Level Up milestone celebration on 10, 20, 30, 40...
        if (next > 0 && next % 10 === 0) {
          setCelebrationState({
            active: true,
            type: 'level_up',
            levelNumber: newLvl,
            levelTitle: LEVEL_TITLES[newLvl] || 'Мастер',
            streakCount: next,
          });
          if (playFanfare) playFanfare(settings);
        }

        setMarathonBestStreak((best) => {
          if (next > best) {
            setIsNewRecord(true);
            if (next >= 5 && next % 5 === 0 && next % 10 !== 0) {
              setCelebrationState({
                active: true,
                type: 'new_record',
                streakCount: next,
              });
              if (playFanfare) playFanfare(settings);
            }
            setTimeout(() => setIsNewRecord(false), 3000);
            try {
              localStorage.setItem('solfege_marathon_best_streak', String(next));
            } catch {
              // Ignore persistence errors
            }
            return next;
          }
          return best;
        });

        return next;
      });
    },
    [playFanfare]
  );

  const handleWrongMarathonAnswer = useCallback(() => {
    setMarathonStreak(0);
  }, []);

  const handleResetMarathon = useCallback(() => {
    setMarathonStreak(0);
    setIsNewRecord(false);
  }, []);

  const closeCelebration = useCallback(() => {
    setCelebrationState((prev) => ({ ...prev, active: false }));
  }, []);

  return {
    marathonStreak,
    marathonBestStreak,
    isNewRecord,
    celebrationState,
    handleCorrectMarathonAnswer,
    handleWrongMarathonAnswer,
    handleResetMarathon,
    closeCelebration,
  };
}
