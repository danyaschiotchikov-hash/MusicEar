import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, ArrowUpRight, ArrowDownRight, ArrowDownLeft, ArrowUpLeft, MoveRight } from 'lucide-react';

export interface ResolutionVoiceRow {
  voiceLabel?: string;
  fromNote: string; // e.g. 'Es'
  fromDegree?: string; // e.g. 'VI♭ ст.'
  toNote: string; // e.g. 'D'
  toDegree?: string; // e.g. 'V ст.'
  ruleNote?: string;
  isGivenNote?: boolean;
}

interface ResolutionSchemeViewProps {
  title?: string;
  tonalityName?: string;
  targetName?: string;
  rows: ResolutionVoiceRow[];
  givenNoteName?: string;
}

function getArrowSymbol(row: ResolutionVoiceRow) {
  const rule = row.ruleNote || '';
  if (rule.includes('↑') || rule.includes('вверх') || rule.includes('скачок') || rule.includes('вводный')) {
    return { symbol: '↗', label: 'вверх', color: 'text-indigo-400' };
  }
  if (rule.includes('↓') || rule.includes('вниз') || rule.includes('шаг') || rule.includes('септима')) {
    return { symbol: '↘', label: 'вниз', color: 'text-rose-400' };
  }
  return { symbol: '➔', label: 'на месте', color: 'text-emerald-400' };
}

export const ResolutionSchemeView: React.FC<ResolutionSchemeViewProps> = ({
  title = 'Схема разрешения',
  tonalityName,
  targetName,
  rows,
  givenNoteName,
}) => {
  if (!rows || rows.length === 0) return null;

  const isInterval = rows.length === 2;

  if (isInterval) {
    const bottomRow = rows[0];
    const topRow = rows[1];

    const cleanFromDegBottom = bottomRow.fromDegree ? bottomRow.fromDegree.replace(/\s*ст\.?$/i, '') : '';
    const cleanToDegBottom = bottomRow.toDegree ? bottomRow.toDegree.replace(/\s*ст\.?$/i, '') : '';
    const cleanFromDegTop = topRow.fromDegree ? topRow.fromDegree.replace(/\s*ст\.?$/i, '') : '';
    const cleanToDegTop = topRow.toDegree ? topRow.toDegree.replace(/\s*ст\.?$/i, '') : '';

    const topArrow = getArrowSymbol(topRow);
    const bottomArrow = getArrowSymbol(bottomRow);

    // Determine if it is expanding outwards, contracting inwards, or parallel
    // (e.g. ув.4 expands outwards, ум.5 contracts inwards)
    const isOutwards = topArrow.symbol === '↗' && bottomArrow.symbol === '↘';
    const isInwards = topArrow.symbol === '↘' && bottomArrow.symbol === '↗';
    let resolutionType = 'Разрешение';
    if (isOutwards) {
      resolutionType = 'Расширение наружу';
    } else if (isInwards) {
      resolutionType = 'Сужение внутрь';
    }

    return (
      <div className="w-full space-y-2 pt-1 animate-in fade-in duration-200">
        {/* Title & Badges */}
        <div className="flex flex-col items-center gap-1.5 text-center">
          {title && (
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
              {title}
            </span>
          )}
          <div className="flex flex-wrap items-center justify-center gap-1.5 font-mono text-xs">
            {tonalityName && (
              <span className="bg-amber-500/10 border border-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded-lg flex items-center gap-1 text-[11px]">
                <span className="text-amber-400/60 font-sans text-[10px]">Лад:</span>
                <span>{tonalityName}</span>
              </span>
            )}
            {targetName && (
              <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-lg flex items-center gap-1 text-[11px]">
                <span className="text-emerald-400/60 font-sans text-[10px]">Цель:</span>
                <span>{targetName}</span>
              </span>
            )}
          </div>
        </div>

        {/* Clean Unified Card Visualization */}
        <div className="w-full max-w-sm mx-auto bg-slate-950/50 border border-white/10 rounded-2xl p-3 flex items-center justify-between gap-3 shadow-inner">
          {/* Left: Unresolved */}
          <div className="flex-1 flex flex-col items-center gap-1.5">
            <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Исходный</span>
            <div className="flex flex-col gap-1 w-full">
              <div className="flex items-center justify-between px-2 py-1 bg-slate-900/80 rounded-lg border border-white/5">
                <span className="text-[10px] font-bold text-amber-400 font-mono">{cleanFromDegTop}</span>
                <span className="text-xs font-bold text-amber-200 font-mono">{topRow.fromNote}</span>
              </div>
              <div className="flex items-center justify-between px-2 py-1 bg-slate-900/80 rounded-lg border border-white/5">
                <span className="text-[10px] font-bold text-amber-400 font-mono">{cleanFromDegBottom}</span>
                <span className="text-xs font-bold text-amber-200 font-mono">{bottomRow.fromNote}</span>
              </div>
            </div>
          </div>

          {/* Center Vector */}
          <div className="flex flex-col items-center justify-center shrink-0 px-2 gap-1">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest text-center">
              {resolutionType}
            </span>
            <div className="flex items-center text-indigo-400 font-bold">
              ➔
            </div>
          </div>

          {/* Right: Resolved */}
          <div className="flex-1 flex flex-col items-center gap-1.5">
            <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Разрешение</span>
            <div className="flex flex-col gap-1 w-full">
              <div className="flex items-center justify-between px-2 py-1 bg-slate-900/80 rounded-lg border border-white/5">
                <span className="text-xs font-bold text-emerald-200 font-mono">{topRow.toNote}</span>
                <span className="text-[10px] font-bold text-emerald-400 font-mono">{cleanToDegTop}</span>
              </div>
              <div className="flex items-center justify-between px-2 py-1 bg-slate-900/80 rounded-lg border border-white/5">
                <span className="text-xs font-bold text-emerald-200 font-mono">{bottomRow.toNote}</span>
                <span className="text-[10px] font-bold text-emerald-400 font-mono">{cleanToDegBottom}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Fallback beautiful iOS list style for more complex chords (triads, seventh chords)
  return (
    <div className="w-full space-y-2 pt-1 animate-in fade-in duration-200">
      <div className="flex flex-wrap items-center justify-center gap-1.5 font-mono text-xs text-center">
        {tonalityName && (
          <span className="bg-amber-500/10 border border-amber-500/30 text-amber-300 font-bold px-2.5 py-0.5 rounded-lg shadow-xs flex items-center gap-1 text-[11px]">
            <span className="text-amber-400/60 font-sans text-[10px]">Лад:</span>
            <span>{tonalityName}</span>
          </span>
        )}

        {targetName && (
          <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-bold px-2.5 py-0.5 rounded-lg shadow-xs flex items-center gap-1 text-[11px]">
            <span className="text-emerald-400/60 font-sans text-[10px]">В:</span>
            <span>{targetName}</span>
          </span>
        )}
      </div>

      <div className="flex flex-col items-center gap-1.5 w-full max-w-[270px] sm:max-w-[285px] mx-auto">
        <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider text-center w-full">
          {title}:
        </div>

        {rows.map((row, idx) => {
          const arrow = getArrowSymbol(row);
          const isGiven = row.isGivenNote || (givenNoteName && row.fromNote === givenNoteName);
          const cleanFromDegree = row.fromDegree ? row.fromDegree.replace(/\s*ст\.?$/i, '') : '';
          const cleanToDegree = row.toDegree ? row.toDegree.replace(/\s*ст\.?$/i, '') : '';

          return (
            <div
              key={idx}
              className={`w-full flex items-center justify-between gap-1.5 px-2.5 py-1.5 rounded-lg font-mono text-xs font-bold shadow-xs transition-all ${
                isGiven
                  ? 'bg-amber-950/30 border border-amber-500/40'
                  : 'bg-slate-950/80 border border-slate-850 hover:border-slate-800'
              }`}
            >
              <div className="flex items-center gap-1.5 min-w-[68px]">
                {cleanFromDegree && (
                  <span className="text-amber-400/90 font-black text-[10px] sm:text-[11px] min-w-[24px] text-left truncate">
                    {cleanFromDegree}
                  </span>
                )}
                <span className="min-w-[30px] h-7 px-1.5 flex items-center justify-center rounded-md bg-amber-950/80 border border-amber-500/40 text-amber-200 font-black text-xs">
                  {row.fromNote}
                </span>
              </div>

              <div className="flex items-center justify-center shrink-0 px-1">
                <span className={`text-sm sm:text-base font-black shrink-0 ${arrow.color}`}>
                  {arrow.symbol}
                </span>
              </div>

              <div className="flex items-center justify-end gap-1.5 min-w-[68px]">
                <span className="min-w-[30px] h-7 px-1.5 flex items-center justify-center rounded-md bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 font-black text-xs">
                  {row.toNote}
                </span>
                {cleanToDegree && (
                  <span className="text-emerald-400/90 font-black text-[10px] sm:text-[11px] min-w-[24px] text-right truncate">
                    {cleanToDegree}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
