import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Shield,
  Play,
  AlertCircle,
  Sparkles,
  Volume2,
  VolumeX,
  Fingerprint,
  FileSpreadsheet,
  User,
} from 'lucide-react';
import { sound } from '../utils/sound';
import { SheetSettingsModal } from './SheetSettingsModal';
import { getStoredGasUrl } from '../utils/sheetService';

interface StartScreenProps {
  onStartGame: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  playerName: string;
  onPlayerNameChange: (name: string) => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({
  onStartGame,
  soundEnabled,
  onToggleSound,
  playerName,
  onPlayerNameChange,
}) => {
  const [isSheetModalOpen, setIsSheetModalOpen] = useState(false);
  const [hasConfiguredSheet, setHasConfiguredSheet] = useState<boolean>(() => !!getStoredGasUrl());

  const handleStart = () => {
    sound.playOptionSelect();
    onStartGame();
  };

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

      {/* Top Header: Confidential Tag & Controls */}
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900/90 border border-zinc-800 text-[11px] font-mono tracking-widest text-amber-400">
          <Fingerprint className="w-3.5 h-3.5" />
          <span>TOP SECRET // INT-AGENT</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Google Sheet Settings Button */}
          <button
            id="btn-sheet-settings"
            onClick={() => {
              sound.playOptionSelect();
              setIsSheetModalOpen(true);
            }}
            className={`p-2 rounded-xl border transition-colors flex items-center gap-1.5 text-xs ${
              hasConfiguredSheet
                ? 'bg-emerald-950/60 border-emerald-600/50 text-emerald-300 hover:bg-emerald-900/60'
                : 'bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
            }`}
            title="구글 스프레드시트 연동 설정"
            aria-label="Google Sheet Settings"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span className="hidden sm:inline text-[11px]">
              {hasConfiguredSheet ? '시트 연결됨' : '시트 연동'}
            </span>
          </button>

          {/* Sound Toggle */}
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
            {soundEnabled ? (
              <Volume2 className="w-4 h-4" />
            ) : (
              <VolumeX className="w-4 h-4 text-zinc-600" />
            )}
          </button>
        </div>
      </div>

      {/* Central Hero Block */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="my-auto py-4 flex flex-col items-center text-center"
      >
        {/* Interrogation Room Graphic / Badge */}
        <div className="relative mb-5">
          <div className="w-22 h-22 sm:w-26 sm:h-26 rounded-3xl bg-gradient-to-b from-zinc-800 via-zinc-900 to-black border-2 border-amber-500/40 p-4 shadow-[0_0_35px_rgba(245,158,11,0.2)] flex items-center justify-center">
            {/* Stamp Graphic */}
            <div className="text-center">
              <Shield className="w-9 h-9 sm:w-11 sm:h-11 text-amber-400 mx-auto stroke-[1.5]" />
              <span className="block mt-1 text-[8px] font-mono font-bold tracking-widest text-amber-300 uppercase">
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
          className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-2"
        >
          Are you native?
        </h1>

        {/* 1-Line Rule Guide as specified in PRD Section 5 */}
        <div className="px-4 py-1.5 rounded-xl bg-zinc-900/90 border border-zinc-800 text-xs sm:text-sm font-medium text-amber-300 mb-4 shadow-sm max-w-sm">
          "원어민 색출 심문에서 정체 숨기고 생존하기"
        </div>

        {/* Target & Context Overview for 20-30s Adults (CEFR B1~B2) */}
        <p className="text-xs sm:text-sm text-zinc-400 max-w-xs leading-relaxed mb-4">
          시험 영어 문법은 통하지만 원어민은 절대 안 쓰는 <strong className="text-zinc-200">콩글리시·직역체</strong>를 피하세요.
          진짜 현지 구어체로 답해 5분간 심문관의 의심을 피해 살아남아야 합니다.
        </p>

        {/* User Name Input Card */}
        <div className="w-full max-w-xs mb-4">
          <div className="rounded-xl bg-zinc-900/90 border border-zinc-800 p-3 text-left shadow-md">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-semibold text-zinc-300 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-amber-400" />
                <span>요원 이름 (플레이어 이름)</span>
              </label>
              <span className="text-[10px] font-semibold text-rose-400 bg-rose-950/60 px-1.5 py-0.5 rounded border border-rose-800/40">
                필수 입력
              </span>
            </div>
            <div className="relative">
              <input
                id="player-name-input"
                type="text"
                value={playerName}
                onChange={(e) => onPlayerNameChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && playerName.trim()) {
                    handleStart();
                  }
                }}
                placeholder="이름 또는 닉네임을 입력하세요"
                maxLength={20}
                className={`w-full px-3.5 py-2.5 rounded-lg bg-black/70 border text-zinc-100 placeholder-zinc-500 text-xs sm:text-sm focus:outline-none transition-colors ${
                  !playerName.trim()
                    ? 'border-amber-500/50 focus:border-amber-400'
                    : 'border-emerald-500/60 focus:border-emerald-400'
                }`}
              />
            </div>
            {!playerName.trim() ? (
              <p className="text-[11px] text-amber-400/90 mt-1.5 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3 h-3 text-amber-400 shrink-0" />
                <span>이름을 입력해야 [게임 시작] 버튼이 활성화됩니다.</span>
              </p>
            ) : (
              <p className="text-[11px] text-emerald-400 mt-1.5 flex items-center gap-1">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>요원 승인 완료! 심문실에 입장할 수 있습니다.</span>
              </p>
            )}
          </div>
        </div>

        {/* 2 Quick Game Rules */}
        <div className="w-full max-w-xs space-y-2 text-left mb-6">
          <div className="flex items-center gap-2.5 p-2 rounded-xl bg-zinc-900/60 border border-zinc-800/80 text-xs">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="text-zinc-300">
              콩글리시 선택 시 <strong className="text-rose-400">의심도 +20</strong>, 원어민 표현은 <strong className="text-emerald-400">+0</strong>
            </span>
          </div>
          <div className="flex items-center gap-2.5 p-2 rounded-xl bg-zinc-900/60 border border-zinc-800/80 text-xs">
            <Sparkles className="w-4 h-4 text-rose-400 shrink-0" />
            <span className="text-zinc-300">
              의심도 <strong className="text-rose-400">60 도달 시</strong> 비원어민으로 발각되어 즉시 탈락
            </span>
          </div>
        </div>

        {/* Main [게임 시작] Button - Disabled until name is entered */}
        <button
          id="btn-start-game"
          onClick={handleStart}
          disabled={!playerName.trim()}
          className={`w-full max-w-xs py-3.5 sm:py-4 px-6 rounded-2xl font-bold text-base sm:text-lg transition-all flex items-center justify-center gap-2.5 ${
            playerName.trim()
              ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 active:scale-[0.98] text-zinc-950 shadow-[0_4px_25px_rgba(245,158,11,0.35)] cursor-pointer'
              : 'bg-zinc-800/80 text-zinc-500 border border-zinc-700/60 cursor-not-allowed opacity-60'
          }`}
        >
          <Play className={`w-5 h-5 ${playerName.trim() ? 'fill-current' : 'text-zinc-600'}`} />
          <span>
            {playerName.trim() ? '게임 시작 (심문실 입장)' : '이름을 먼저 입력해주세요'}
          </span>
        </button>
      </motion.div>

      {/* Bottom Footer info */}
      <div className="text-center py-2 text-[11px] text-zinc-500 font-mono flex items-center justify-center gap-2">
        <span>B1~B2 시험 영어 탈출 프로젝트</span>
        <span>•</span>
        <span>구글 시트 연동 지원</span>
      </div>

      {/* Sheet Settings Modal */}
      <SheetSettingsModal
        isOpen={isSheetModalOpen}
        onClose={() => setIsSheetModalOpen(false)}
        onSavedUrl={(url) => setHasConfiguredSheet(!!url)}
      />
    </div>
  );
};
