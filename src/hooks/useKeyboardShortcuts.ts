import { useEffect } from 'react';

interface KeyboardShortcutsOptions {
  onReplay: (style?: 'arpeggio' | 'harmonic') => void;
  onNewTask: () => void;
  onReveal?: () => void;
  disabled?: boolean;
}

/**
 * Global ergonomic keyboard shortcuts for ear training
 * Space / 'A' / 'ф' -> Replay current sound (arpeggio / default)
 * 'H' / 'р' -> Replay harmonic
 * 'N' / 'т' -> New task
 * 'R' / 'к' / Enter -> Reveal answer or Advance
 */
export function useKeyboardShortcuts({
  onReplay,
  onNewTask,
  onReveal,
  disabled = false,
}: KeyboardShortcutsOptions) {
  useEffect(() => {
    if (disabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLSelectElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target as HTMLElement)?.isContentEditable
      ) {
        return;
      }

      const keyLower = e.key.toLowerCase();

      if (e.code === 'Space') {
        e.preventDefault();
        onReplay('arpeggio');
      } else if (keyLower === 'h' || keyLower === 'р') {
        e.preventDefault();
        onReplay('harmonic');
      } else if (keyLower === 'n' || keyLower === 'т') {
        e.preventDefault();
        onNewTask();
      } else if (keyLower === 'r' || keyLower === 'к') {
        if (onReveal) {
          e.preventDefault();
          onReveal();
        }
      } else if (e.key === 'Enter') {
        if (onReveal) {
          e.preventDefault();
          onReveal();
        } else {
          e.preventDefault();
          onNewTask();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onReplay, onNewTask, onReveal, disabled]);
}
