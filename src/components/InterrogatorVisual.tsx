import React from 'react';
import { Radio, Eye, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface InterrogatorVisualProps {
  mood?: 'neutral' | 'suspicious' | 'satisfied' | 'busted';
  interrogatorName?: string;
}

export const InterrogatorVisual: React.FC<InterrogatorVisualProps> = ({
  mood = 'neutral',
  interrogatorName = 'Agent Miller (FBI 언어분석관)',
}) => {
  return (
    <div
      id="interrogator-character-card"
      className="relative w-full rounded-2xl bg-gradient-to-b from-zinc-900 via-zinc-950 to-black border border-zinc-800/80 p-3 sm:p-4 overflow-hidden shadow-2xl"
    >
      {/* Overhead spotlight cone effect */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-32 bg-amber-200/5 blur-2xl rounded-full pointer-events-none" />

      {/* Background tape recorder/audio wave subtle graphic */}
      <div className="flex items-center justify-between border-b border-zinc-800/60 pb-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                mood === 'suspicious' || mood === 'busted' ? 'bg-rose-500' : 'bg-amber-400'
              }`}
            />
            <span
              className={`relative inline-flex rounded-full h-2 w-2 ${
                mood === 'suspicious' || mood === 'busted' ? 'bg-rose-500' : 'bg-amber-400'
              }`}
            />
          </span>
          <span className="text-[11px] font-mono tracking-wider uppercase text-zinc-400">
            REC // INT-ROOM #04
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 font-mono">
          <Radio className="w-3 h-3 text-zinc-400 animate-pulse" />
          <span>음성 분석기 가동 중</span>
        </div>
      </div>

      {/* Main Avatar & Inspector Persona */}
      <div className="flex items-center gap-3.5">
        {/* Character Portrait with Noir Lighting */}
        <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-zinc-900 border border-zinc-700/80 shrink-0 shadow-inner flex items-center justify-center">
          {/* Noir Detective Silhouette SVG */}
          <svg
            viewBox="0 0 100 100"
            className="w-full h-full text-zinc-200 drop-shadow-md"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Background spotlight */}
            <circle cx="50" cy="40" r="38" fill="#1e2124" />
            <path
              d="M50 8 L75 85 L25 85 Z"
              fill={
                mood === 'suspicious' || mood === 'busted'
                  ? 'rgba(244, 63, 94, 0.15)'
                  : mood === 'satisfied'
                  ? 'rgba(16, 185, 129, 0.12)'
                  : 'rgba(251, 191, 36, 0.08)'
              }
            />

            {/* Hat brim & crown (Fedora/Trenchcoat noir vibe) */}
            <path
              d="M32 34 C32 23, 40 18, 50 18 C60 18, 68 23, 68 34 Z"
              fill="#27272a"
            />
            <path
              d="M20 35 C32 30, 68 30, 80 35 C70 38, 30 38, 20 35 Z"
              fill="#18181b"
            />
            {/* Hat ribbon */}
            <path d="M33 32 Q50 30 67 32" stroke="#3f3f46" strokeWidth="2.5" />

            {/* Face in shadow */}
            <path
              d="M37 36 Q50 48 63 36 L61 58 Q50 68 39 58 Z"
              fill="#d4d4d8"
            />

            {/* Stern Eyes / Sunglasses */}
            <rect x="40" y="42" width="8" height="4" rx="1" fill="#09090b" />
            <rect x="52" y="42" width="8" height="4" rx="1" fill="#09090b" />
            <line x1="48" y1="44" x2="52" y2="44" stroke="#09090b" strokeWidth="1.5" />

            {/* Trench Coat Collars & Tie */}
            <path d="M22 96 L38 64 L50 78 L62 64 L78 96 Z" fill="#27272a" />
            <path d="M47 62 L53 62 L51 86 L49 86 Z" fill="#71717a" />
            {/* Collar folds */}
            <path d="M30 68 L44 80 L35 96" fill="#18181b" />
            <path d="M70 68 L56 80 L65 96" fill="#18181b" />

            {/* Badge on chest */}
            <polygon points="32,78 35,74 38,78 36,83 34,83" fill="#eab308" />
          </svg>

          {/* Reaction status icon badge */}
          <div className="absolute bottom-1 right-1">
            {mood === 'suspicious' && (
              <span className="p-1 rounded-full bg-rose-950/80 border border-rose-500/60 text-rose-400 block shadow-sm">
                <AlertTriangle className="w-3.5 h-3.5" />
              </span>
            )}
            {mood === 'busted' && (
              <span className="p-1 rounded-full bg-rose-600 border border-rose-400 text-white block animate-pulse">
                <AlertTriangle className="w-3.5 h-3.5" />
              </span>
            )}
            {mood === 'satisfied' && (
              <span className="p-1 rounded-full bg-emerald-950/80 border border-emerald-500/60 text-emerald-400 block shadow-sm">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </span>
            )}
            {mood === 'neutral' && (
              <span className="p-1 rounded-full bg-zinc-900/80 border border-zinc-700 text-zinc-400 block">
                <Eye className="w-3 h-3" />
              </span>
            )}
          </div>
        </div>

        {/* Name & Interrogation Status Line */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm font-bold text-zinc-100 truncate">
              {interrogatorName}
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-amber-300 font-mono">
              LEVEL 5
            </span>
          </div>

          <p className="text-[11px] sm:text-xs text-zinc-400 mt-0.5 leading-tight">
            {mood === 'suspicious' && (
              <span className="text-rose-400 font-medium">
                "방금 그 표현... 한국식 직역투의 냄새가 물씬 풍기는데?"
              </span>
            )}
            {mood === 'busted' && (
              <span className="text-rose-500 font-bold">
                "더 이상 들을 필요도 없다. 넌 100% 비원어민이야!"
              </span>
            )}
            {mood === 'satisfied' && (
              <span className="text-emerald-400 font-medium">
                "흠, 군더더기 없는 완벽한 원어민 구어체로군. 계속해봐."
              </span>
            )}
            {mood === 'neutral' && (
              <span className="text-zinc-400">
                "문법만 맞다고 원어민인 척할 순 없어. 솔직히 답해봐라."
              </span>
            )}
          </p>

          <div className="mt-2 flex items-center gap-2 text-[10px] text-zinc-500">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-zinc-600" />
            <span>표적: 문법은 맞으나 어색한 콩글리시 적발</span>
          </div>
        </div>
      </div>
    </div>
  );
};
