import React from 'react';
import { ShieldAlert, ShieldCheck } from 'lucide-react';

interface SuspicionGaugeProps {
  suspicion: number;
  maxSuspicion?: number;
  compact?: boolean;
}

export const SuspicionGauge: React.FC<SuspicionGaugeProps> = ({
  suspicion,
  maxSuspicion = 60,
  compact = false,
}) => {
  const percentage = Math.min(100, Math.round((suspicion / maxSuspicion) * 100));

  // Determine stage and color
  let barColor = 'bg-emerald-500';
  let badgeText = '안전 (Safe)';
  let badgeColor = 'text-emerald-400 border-emerald-500/30 bg-emerald-950/40';

  if (suspicion >= 60) {
    barColor = 'bg-rose-600 animate-pulse';
    badgeText = '발각 임박! (Busted)';
    badgeColor = 'text-rose-400 border-rose-500/50 bg-rose-950/60 animate-pulse';
  } else if (suspicion >= 40) {
    barColor = 'bg-amber-500';
    badgeText = '위험 경고 (Danger)';
    badgeColor = 'text-amber-400 border-amber-500/40 bg-amber-950/40';
  } else if (suspicion >= 20) {
    barColor = 'bg-yellow-500';
    badgeText = '주의 (Caution)';
    badgeColor = 'text-yellow-300 border-yellow-500/40 bg-yellow-950/30';
  }

  return (
    <div
      id="suspicion-gauge-container"
      className={`rounded-xl border border-zinc-800 bg-zinc-900/90 p-2.5 backdrop-blur-md shadow-lg ${
        compact ? 'w-full' : 'w-44 sm:w-52'
      }`}
    >
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <div className="flex items-center gap-1.5">
          {suspicion >= 40 ? (
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400 animate-bounce" />
          ) : (
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          )}
          <span className="text-[11px] font-semibold text-zinc-300 tracking-tight">
            심문관 의심도
          </span>
        </div>
        <span className="text-xs font-mono font-bold text-zinc-100">
          {suspicion}
          <span className="text-[10px] text-zinc-500 font-normal"> / {maxSuspicion}</span>
        </span>
      </div>

      {/* Progress Bar with step segments (0 -> 20 -> 40 -> 60) */}
      <div className="relative w-full h-2.5 bg-zinc-950 rounded-full overflow-hidden border border-zinc-800/80">
        <div
          className={`h-full transition-all duration-500 ease-out ${barColor}`}
          style={{ width: `${percentage}%` }}
        />
        {/* Threshold indicator lines at 20 and 40 */}
        <div className="absolute top-0 bottom-0 left-[33.33%] w-[1px] bg-zinc-800 pointer-events-none" />
        <div className="absolute top-0 bottom-0 left-[66.66%] w-[1px] bg-zinc-800 pointer-events-none" />
      </div>

      <div className="flex items-center justify-between mt-1 text-[10px]">
        <span className="text-zinc-500">60 도달 시 즉시 탈락</span>
        <span className={`px-1.5 py-0.5 rounded text-[9px] font-medium border ${badgeColor}`}>
          {badgeText}
        </span>
      </div>
    </div>
  );
};
