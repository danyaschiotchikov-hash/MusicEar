import { AppStats, ItemStat, CategoryId, MusicItem } from '../types';

export type MasteryLevel = 'struggling' | 'learning' | 'mastered' | 'untested';

export interface ItemMasteryInfo {
  item: MusicItem;
  stat: ItemStat;
  accuracy: number;
  level: MasteryLevel;
  levelLabelRu: string;
  weight: number;
}

export interface SpacedRepetitionOverview {
  totalItems: number;
  testedItemsCount: number;
  strugglingCount: number;
  learningCount: number;
  masteredCount: number;
  untestedCount: number;
  masteryPercentage: number;
  strugglingItems: ItemMasteryInfo[];
  recommendedReviewItems: ItemMasteryInfo[];
}

/**
 * Calculates adaptive probability weight for an item based on error history and recency.
 * - Items with high error rate (< 60% accuracy) receive high priority (3x - 7x).
 * - Untested items receive an exploratory priority (2.5x).
 * - Well-mastered items (>= 88% accuracy, 4+ repetitions) are spaced out (0.25x - 0.4x).
 * - Items tested very recently (< 45 sec) receive a short cooldown so user doesn't get the same item back-to-back.
 */
export function calculateItemWeight(
  itemId: string,
  stat?: ItemStat,
  now: number = Date.now()
): number {
  if (!stat || stat.tested === 0) {
    // Untested: healthy exploratory weight
    return 2.5;
  }

  const { tested, correct, lastTested } = stat;
  const errorRate = Math.max(0, (tested - correct) / tested);
  const accuracy = Math.min(1, Math.max(0, correct / tested));

  let baseWeight = 1.0;

  if (accuracy < 0.5) {
    // Critical struggle: strongly boost selection
    baseWeight = 4.5 + errorRate * 3.0; // 4.5 .. 7.5
  } else if (accuracy < 0.75) {
    // Moderate struggle
    baseWeight = 2.5 + errorRate * 2.5; // 2.5 .. 3.75
  } else if (accuracy < 0.88 || tested < 4) {
    // Learning phase / consolidating
    baseWeight = 1.3 + (1 - accuracy) * 1.2; // 1.3 .. 1.6
  } else {
    // Mastered: spaced maintenance
    baseWeight = Math.max(0.2, 0.25 + (1 - accuracy) * 0.5); // 0.25 .. 0.31
  }

  // Recency cooldown / Spacing maintenance curve
  let recencyFactor = 1.0;
  if (lastTested) {
    const elapsedMs = now - lastTested;
    if (elapsedMs < 25_000) {
      // Immediate repetition prevention (under 25s)
      recencyFactor = 0.15;
    } else if (elapsedMs < 60_000) {
      // Short cooldown (under 1 min)
      recencyFactor = 0.5;
    } else if (elapsedMs > 5 * 60_000) {
      // Spaced reminder bonus for items not seen in > 5 minutes
      recencyFactor = 1.25;
    }
  }

  return Math.max(0.1, baseWeight * recencyFactor);
}

/**
 * Weighted random selector based on Spaced Repetition weights.
 */
export function pickWeightedItem<T>(
  items: T[],
  getStatId: (item: T) => string,
  stats?: AppStats,
  enabled: boolean = true
): T {
  if (items.length === 0) {
    throw new Error('Cannot pick from empty item pool');
  }

  if (items.length === 1 || !enabled || !stats) {
    return items[Math.floor(Math.random() * items.length)];
  }

  const now = Date.now();
  const weights = items.map((item) => {
    const id = getStatId(item);
    const stat = stats.items[id];
    return calculateItemWeight(id, stat, now);
  });

  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  if (totalWeight <= 0) {
    return items[Math.floor(Math.random() * items.length)];
  }

  let randomVal = Math.random() * totalWeight;
  for (let i = 0; i < items.length; i++) {
    randomVal -= weights[i];
    if (randomVal <= 0) {
      return items[i];
    }
  }

  return items[items.length - 1];
}

/**
 * Categorizes an item into a mastery tier.
 */
export function getItemMasteryLevel(stat?: ItemStat): { level: MasteryLevel; labelRu: string } {
  if (!stat || stat.tested === 0) {
    return { level: 'untested', labelRu: 'Не изучено' };
  }
  const accuracy = stat.correct / stat.tested;
  if (stat.tested >= 2 && accuracy < 0.65) {
    return { level: 'struggling', labelRu: 'Требует повторения' };
  }
  if (stat.tested >= 4 && accuracy >= 0.88) {
    return { level: 'mastered', labelRu: 'Освоено' };
  }
  return { level: 'learning', labelRu: 'В процессе' };
}

/**
 * Computes full Spaced Repetition overview for all music items.
 */
export function getSpacedRepetitionOverview(
  stats: AppStats,
  allItems: MusicItem[]
): SpacedRepetitionOverview {
  const now = Date.now();
  const masteryList: ItemMasteryInfo[] = allItems.map((item) => {
    const stat = stats.items[item.id] || { tested: 0, correct: 0 };
    const accuracy = stat.tested > 0 ? stat.correct / stat.tested : 0;
    const { level, labelRu } = getItemMasteryLevel(stat);
    const weight = calculateItemWeight(item.id, stat, now);

    return {
      item,
      stat,
      accuracy,
      level,
      levelLabelRu: labelRu,
      weight,
    };
  });

  const strugglingItems = masteryList
    .filter((m) => m.level === 'struggling')
    .sort((a, b) => a.accuracy - b.accuracy || b.stat.tested - a.stat.tested);

  const learningItems = masteryList.filter((m) => m.level === 'learning');
  const masteredItems = masteryList.filter((m) => m.level === 'mastered');
  const untestedItems = masteryList.filter((m) => m.level === 'untested');

  const testedCount = masteryList.filter((m) => m.stat.tested > 0).length;
  const masteryPercentage =
    testedCount > 0 ? Math.round((masteredItems.length / allItems.length) * 100) : 0;

  // Recommended review queue: struggling first, then learning with lowest accuracy, then untested
  const recommendedReviewItems = [
    ...strugglingItems,
    ...learningItems.sort((a, b) => a.accuracy - b.accuracy),
    ...untestedItems.slice(0, 5),
  ];

  return {
    totalItems: allItems.length,
    testedItemsCount: testedCount,
    strugglingCount: strugglingItems.length,
    learningCount: learningItems.length,
    masteredCount: masteredItems.length,
    untestedCount: untestedItems.length,
    masteryPercentage,
    strugglingItems,
    recommendedReviewItems,
  };
}
