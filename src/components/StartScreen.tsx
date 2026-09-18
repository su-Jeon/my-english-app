import React from 'react';
import { motion } from 'motion/react';
import { Shield, Play, AlertCircle, Sparkles, Volume2, VolumeX, Fingerprint } from 'lucide-react';
import { sound } from '../utils/sound';

interface StartScreenProps {
  onStartGame: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({
  onStartGame,
  soundEnabled,
  onToggleSound,
}) => {
  return (
    <div
      id="start-screen"
      className="relative flex flex-col justify-between min-h-[90vh] sm:min-h-[640px] max-w-md mx-auto px-4 py-6 text-zinc-100"
    >
      {/* Background Ambience: Spotlight & Noir Grid */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-96 bg-amber-500/10 blur-[100px] rounded-full" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-rose-600/10 blur-[120px] rounded-full" />
        <div className="absolute inset-0 bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:20px_20px] opacity-30" />
      </div>

      {/* Top Header: Confidential Tag & Sound Toggle */}
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900/90 border border-zinc-800 text-[11px] font-mono tracking-widest text-amber-400">
          <Fingerprint className="w-3.5 h-3.5" />
          <span>TOP SECRET // INTERROGATION PROTOCOL</span>
        </div>

        <button
          id="sound-toggle-btn"
          onClick={() => {
            sound.playOptionSelect();
            onToggleSound();
          }}
          className="p-2 rounded-xl bg-zinc-900/80 border border-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
          title={soundEnabled ? '효과음 켜짐' : '효과음 꺼짐'}
          aria-label="Sound Toggle"
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-zinc-600" />}
        </button>
      </div>

      {/* Central Hero Block */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="my-auto py-6 flex flex-col items-center text-center"
      >
        {/* Interrogation Room Graphic / Badge */}
        <div className="relative mb-6">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-b from-zinc-800 via-zinc-900 to-black border-2 border-amber-500/40 p-4 shadow-[0_0_35px_rgba(245,158,11,0.2)] flex items-center justify-center">
            {/* Stamp Graphic */}
            <div className="text-center">
              <Shield className="w-10 h-10 sm:w-12 sm:h-12 text-amber-400 mx-auto stroke-[1.5]" />
              <span className="block mt-1 text-[9px] font-mono font-bold tracking-widest text-amber-300 uppercase">
                SUSPECT VERIFIED
              </span>
            </div>
          </div>
          <span className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-rose-950 border border-rose-600/60 text-[10px] font-bold font-mono text-rose-300 uppercase whitespace-nowrap shadow-md">
            비원어민 색출 작전
          </span>
        </div>

        {/* Title Logo */}
        <h1
          id="app-title-logo"
          className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-3"
        >
          Are you native?
        </h1>

        {/* 1-Line Rule Guide as specified in PRD Section 5 */}
        <div className="px-4 py-2 rounded-xl bg-zinc-900/90 border border-zinc-800 text-sm font-medium text-amber-300 mb-5 shadow-sm max-w-sm">
          "원어민 색출 심문에서 정체 숨기고 생존하기"
        </div>

        {/* Target & Context Overview for 20-30s Adults (CEFR B1~B2) */}
        <p className="text-xs sm:text-sm text-zinc-400 max-w-xs leading-relaxed mb-6">
          시험 영어 문법은 통하지만 원어민은 절대 안 쓰는 <strong className="text-zinc-200">콩글리시·직역체</strong>를 피하세요. 
          진짜 현지 구어체로 답해 5분간 심문관의 의심을 피해 살아남아야 합니다.
        </p>

        {/* 3 Quick Game Rules */}
        <div className="w-full max-w-xs space-y-2 text-left mb-8">
          <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 text-xs">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="text-zinc-300">
              콩글리시 선택 시 <strong className="text-rose-400">의심도 +20</strong>, 원어민 표현은 <strong className="text-emerald-400">+0</strong>
            </span>
          </div>
          <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 text-xs">
            <Sparkles className="w-4 h-4 text-rose-400 shrink-0" />
            <span className="text-zinc-300">
              의심도 <strong className="text-rose-400">60 도달 시</strong> 비원어민으로 발각되어 즉시 탈락
            </span>
          </div>
        </div>

        {/* Main [게임 시작] Button (Large, centered, high touch-target) */}
        <button
          id="btn-start-game"
          onClick={() => {
            sound.playOptionSelect();
            onStartGame();
          }}
          className="w-full max-w-xs py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 active:scale-[0.98] text-zinc-950 font-bold text-base sm:text-lg shadow-[0_4px_25px_rgba(245,158,11,0.35)] transition-all flex items-center justify-center gap-2.5 cursor-pointer"
        >
          <Play className="w-5 h-5 fill-current" />
          <span>게임 시작 (심문실 입장)</span>
        </button>
      </motion.div>

      {/* Bottom Footer info */}
      <div className="text-center py-2 text-[11px] text-zinc-500 font-mono">
        B1~B2 시험 영어 탈출 프로젝트 • 5분 표현 감별 게임
      </div>
    </div>
  );
};
