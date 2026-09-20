import React from 'react';

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

function getArrowInfo(row: ResolutionVoiceRow): { symbol: string; title: string; dir: 'up' | 'down' | 'flat' } {
  const rule = row.ruleNote || '';
  if (rule.includes('↑') || rule.includes('вверх') || rule.includes('скачок') || rule.includes('вводный')) {
    return { symbol: '↗', title: 'Движение вверх', dir: 'up' };
  }
  if (rule.includes('↓') || rule.includes('вниз') || rule.includes('шаг') || rule.includes('септима')) {
    return { symbol: '↘', title: 'Движение вниз', dir: 'down' };
  }
  return { symbol: '➔', title: 'Прямой переход', dir: 'flat' };
}

export const ResolutionSchemeView: React.FC<ResolutionSchemeViewProps> = ({
  title = 'Схема разрешения',
  tonalityName,
  targetName,
  rows,
  givenNoteName,
}) => {
  if (!rows || rows.length === 0) return null;

  return (
    <div className="w-full space-y-2.5 pt-1 animate-in fade-in duration-200">
      {/* Title & Tonality / Target Badges */}
      <div className="flex flex-wrap items-center justify-center gap-2 font-mono text-xs text-center">
        {tonalityName && (
          <span className="bg-amber-500/15 border border-amber-500/40 text-amber-300 font-bold px-3 py-1 rounded-xl shadow-xs flex items-center gap-1.5">
            <span className="text-amber-400/70 font-sans text-[11px]">Лад:</span>
            <span>{tonalityName}</span>
          </span>
        )}

        {targetName && (
          <span className="bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 font-bold px-3 py-1 rounded-xl shadow-xs flex items-center gap-1.5">
            <span className="text-emerald-400/70 font-sans text-[11px]">В:</span>
            <span>{targetName}</span>
          </span>
        )}
      </div>

      {/* Voice Resolution Rows */}
      <div className="flex flex-col items-center gap-1.5 w-full max-w-sm mx-auto">
        <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider text-center w-full">
          {title}:
        </div>

        {rows.map((row, idx) => {
          const arrow = getArrowInfo(row);
          const isGiven = row.isGivenNote || (givenNoteName && row.fromNote === givenNoteName);
          const cleanFromDegree = row.fromDegree ? row.fromDegree.replace(/\s*ст\.?$/i, '') : '';
          const cleanToDegree = row.toDegree ? row.toDegree.replace(/\s*ст\.?$/i, '') : '';

          return (
            <div
              key={idx}
              className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl font-mono text-xs sm:text-sm font-bold shadow-xs transition-all ${
                isGiven
                  ? 'bg-amber-950/40 border border-amber-500/50'
                  : 'bg-slate-950/80 border border-slate-800/90 hover:border-slate-700/80'
              }`}
            >
              {/* Left Column: Unresolved Voice (Degree + Note) */}
              <div className="flex items-center gap-2 min-w-[100px]">
                {cleanFromDegree && (
                  <span className="text-amber-400/90 font-extrabold text-[11px] sm:text-xs min-w-[32px] text-left truncate">
                    {cleanFromDegree}
                  </span>
                )}
                <span
                  className={`min-w-[38px] h-8 px-2 flex items-center justify-center rounded-lg font-black text-xs sm:text-sm shadow-inner shrink-0 ${
                    isGiven
                      ? 'bg-amber-950/80 border border-amber-500/60 text-amber-200'
                      : 'bg-amber-950/90 border border-amber-500/60 text-amber-200'
                  }`}
                >
                  {row.fromNote}
                </span>
              </div>

              {/* Center Column: Smooth Glowing Resolution Vector */}
              <div className="flex items-center justify-center shrink-0 px-2">
                <span
                  className={`text-base sm:text-lg font-black shrink-0 transition-transform ${
                    arrow.dir === 'up'
                      ? 'text-indigo-400'
                      : arrow.dir === 'down'
                      ? 'text-purple-400'
                      : 'text-emerald-400'
                  }`}
                  title={arrow.title}
                >
                  {arrow.symbol}
                </span>
              </div>

              {/* Right Column: Resolved Voice (Note + Degree) */}
              <div className="flex items-center justify-end gap-2 min-w-[100px]">
                <span className="min-w-[38px] h-8 px-2 flex items-center justify-center rounded-lg bg-emerald-950/90 border border-emerald-500/60 text-emerald-200 font-extrabold text-xs sm:text-sm shadow-inner shrink-0">
                  {row.toNote}
                </span>
                {cleanToDegree && (
                  <span className="text-emerald-400/90 font-extrabold text-[11px] sm:text-xs min-w-[32px] text-right truncate">
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


