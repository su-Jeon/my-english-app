import React, { useState } from 'react';
import { motion } from 'motion/react';
import { GameSessionResult, UserAnswerRecord } from '../types';
import { SuspicionGauge } from './SuspicionGauge';
import { sound } from '../utils/sound';
import {
  RotateCcw,
  Home,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  ShieldAlert,
  Award,
  BookOpen,
  Share2,
  Check,
} from 'lucide-react';

interface ResultScreenProps {
  result: GameSessionResult;
  onRestart: () => void;
  onHome: () => void;
}

export const ResultScreen: React.FC<ResultScreenProps> = ({
  result,
  onRestart,
  onHome,
}) => {
  const [filterMode, setFilterMode] = useState<'wrong' | 'all'>('wrong');
  const [copied, setCopied] = useState(false);

  const { isBusted, finalSuspicion, history, nativeCount, konglishCount } = result;

  // Filtered items
  const wrongItems = history.filter((item) => !item.isNative);
  const displayItems = filterMode === 'wrong' && wrongItems.length > 0 ? wrongItems : history;

  const handleShare = () => {
    sound.playOptionSelect();
    const text = isBusted
      ? `[Are you native?] 심문관에게 콩글리시가 발각되었습니다! 🚨 의심도: ${finalSuspicion}/60`
      : `[Are you native?] 심문관을 완벽히 속이고 생존 성공! 🕵️‍♂️ 최종 의심도: ${finalSuspicion}/60`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      id="result-screen"
      className="relative flex flex-col justify-between min-h-[92vh] max-w-md mx-auto px-4 py-5 text-zinc-100 pb-12"
    >
      {/* Background Ambience */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div
          className={`absolute top-0 left-1/2 -translate-x-1/2 w-80 h-80 blur-[100px] rounded-full ${
            isBusted ? 'bg-rose-600/15' : 'bg-emerald-500/15'
          }`}
        />
      </div>

      <div>
        {/* Top Header Card: Outcome & Verdict Stamp */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className={`rounded-3xl p-5 border text-center relative overflow-hidden shadow-2xl mb-4 ${
            isBusted
              ? 'bg-gradient-to-b from-rose-950/80 to-zinc-950 border-rose-500/50'
              : 'bg-gradient-to-b from-emerald-950/80 to-zinc-950 border-emerald-500/50'
          }`}
        >
          {/* Status Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold tracking-wider uppercase mb-3 border">
            {isBusted ? (
              <span className="text-rose-400 bg-rose-950/80 border-rose-600/50 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4" /> VERDICT: BUSTED (발각)
              </span>
            ) : (
              <span className="text-emerald-400 bg-emerald-950/80 border-emerald-600/50 flex items-center gap-1.5">
                <Award className="w-4 h-4" /> VERDICT: SURVIVED (생존 성공)
              </span>
            )}
          </div>

          {/* Big Result Heading */}
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
            {isBusted ? (
              <span className="text-rose-400">비원어민 발각! 탈락</span>
            ) : (
              <span className="text-emerald-400">심문 통과! 생존 성공</span>
            )}
          </h2>

          <p className="text-xs sm:text-sm text-zinc-300 max-w-xs mx-auto leading-relaxed mb-4">
            {isBusted
              ? '심문관의 날카로운 귀에 콩글리시 표현이 포착되었습니다. 의심도가 60에 도달하여 정체가 들통났습니다.'
              : '원어민 특유의 자연스러운 구어 표현으로 의심을 피했습니다. 완벽한 위장 잠입 성공입니다!'}
          </p>

          {/* Suspicion Meter in Result Card */}
          <div className="bg-black/50 p-3 rounded-2xl border border-white/10 max-w-xs mx-auto mb-3">
            <div className="flex items-center justify-between mb-1 text-xs">
              <span className="text-zinc-400 font-medium">최종 의심도</span>
              <span
                className={`font-mono font-bold text-sm ${
                  isBusted ? 'text-rose-400' : 'text-emerald-400'
                }`}
              >
                {finalSuspicion} / 60
              </span>
            </div>
            <SuspicionGauge suspicion={finalSuspicion} maxSuspicion={60} compact />
          </div>

          {/* Quick Score Chips */}
          <div className="flex items-center justify-center gap-3 text-xs">
            <span className="px-2.5 py-1 rounded-lg bg-emerald-950/60 border border-emerald-600/30 text-emerald-300 font-medium">
              원어민 구어 선택: <strong>{nativeCount}</strong>개
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-rose-950/60 border border-rose-600/30 text-rose-300 font-medium">
              콩글리시 선택: <strong>{konglishCount}</strong>개
            </span>
          </div>
        </motion.div>

        {/* Learning Review Section (내가 고른 콩글리시 -> 원어민 표현 비교) */}
        <div id="review-section" className="space-y-3 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-zinc-200">
                표현 복습 노트 ({wrongItems.length > 0 ? `${wrongItems.length}개 콩글리시 교정` : '전 문항 정답!'})
              </h3>
            </div>

            {/* Filter Toggle */}
            {wrongItems.length > 0 && wrongItems.length < history.length && (
              <div className="flex items-center rounded-lg bg-zinc-900 border border-zinc-800 p-0.5 text-[11px]">
                <button
                  onClick={() => setFilterMode('wrong')}
                  className={`px-2 py-0.5 rounded-md font-medium transition-colors ${
                    filterMode === 'wrong'
                      ? 'bg-amber-500 text-black'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  틀린 문항만 ({wrongItems.length})
                </button>
                <button
                  onClick={() => setFilterMode('all')}
                  className={`px-2 py-0.5 rounded-md font-medium transition-colors ${
                    filterMode === 'all'
                      ? 'bg-amber-500 text-black'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  전체 ({history.length})
                </button>
              </div>
            )}
          </div>

          {/* Perfect Score Celebration if no wrong items */}
          {wrongItems.length === 0 && (
            <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-1.5" />
              <p className="text-sm font-bold text-emerald-300">
                대단합니다! 단 하나의 콩글리시도 쓰지 않았습니다.
              </p>
              <p className="text-xs text-zinc-400 mt-1">
                모든 일상 상황에서 완벽한 원어민 구어체를 구사하셨습니다.
              </p>
            </div>
          )}

          {/* Comparison Cards: [내가 고른 콩글리시] -> [원어민 표현] */}
          <div className="space-y-3">
            {displayItems.map((record: UserAnswerRecord, index: number) => {
              const nativeOption = record.question.options.find((o) => o.isNative);

              return (
                <div
                  key={record.questionId}
                  id={`review-item-${index + 1}`}
                  className={`rounded-2xl p-3.5 border transition-all ${
                    record.isNative
                      ? 'bg-zinc-900/60 border-zinc-800'
                      : 'bg-zinc-900/90 border-rose-600/40 shadow-md'
                  }`}
                >
                  {/* Context Header */}
                  <div className="flex items-center justify-between text-[11px] mb-2 pb-1.5 border-b border-zinc-800">
                    <span className="font-semibold text-amber-300">
                      [{record.question.category}] {record.question.situationTitle}
                    </span>
                    <span
                      className={`font-mono text-[10px] px-1.5 py-0.5 rounded ${
                        record.isNative
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/40'
                          : 'bg-rose-950 text-rose-300 border border-rose-700/40'
                      }`}
                    >
                      {record.isNative ? '정답 (+0)' : '콩글리시 (+20)'}
                    </span>
                  </div>

                  {/* Dialogue prompt reminder */}
                  <p className="text-xs text-zinc-400 italic mb-2.5">
                    "{record.question.interrogatorLine}"
                  </p>

                  {/* Core Side-by-Side Comparison Box */}
                  <div className="rounded-xl bg-black/50 p-2.5 border border-zinc-800 space-y-2 mb-2">
                    {/* User's choice */}
                    <div className="flex items-start gap-2 text-xs">
                      <span className="text-zinc-500 font-medium shrink-0 mt-0.5">
                        내가 고른 답:
                      </span>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span
                          className={`font-semibold px-2 py-0.5 rounded ${
                            record.isNative
                              ? 'bg-emerald-950 text-emerald-300'
                              : 'bg-rose-950 text-rose-300 line-through'
                          }`}
                        >
                          "{record.selectedOption.text}"
                        </span>
                        {!record.isNative && (
                          <span className="text-[10px] text-rose-400 font-mono">
                            (의심도 +20)
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Arrow / Native Replacement */}
                    {!record.isNative && nativeOption && (
                      <div className="flex items-start gap-2 text-xs pt-1.5 border-t border-zinc-800/80">
                        <span className="text-emerald-400 font-bold shrink-0 flex items-center gap-1 mt-0.5">
                          <ArrowRight className="w-3.5 h-3.5" /> 원어민 표현:
                        </span>
                        <span className="font-bold text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-600/40">
                          "{nativeOption.text}"
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Explanatory Nuance */}
                  <div className="text-[11px] sm:text-xs text-zinc-300 space-y-1">
                    {!record.isNative && record.selectedOption.konglishOrigin && (
                      <p className="text-rose-300/90 font-medium">
                        • {record.selectedOption.konglishOrigin}
                      </p>
                    )}
                    <p className="text-zinc-400 leading-relaxed">
                      {record.selectedOption.explanation}
                    </p>
                    <p className="text-amber-300/90 font-medium pt-1">
                      💡 원어민 팁: {record.question.nativeNuanceTip}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Action Buttons: [다시 하기] and [처음으로] */}
      <div className="space-y-2.5 pt-2">
        <button
          id="btn-restart-game"
          onClick={() => {
            sound.playOptionSelect();
            onRestart();
          }}
          className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 active:scale-[0.98] text-zinc-950 font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>새로운 심문 다시 하기 (5문제 재도전)</span>
        </button>

        <div className="grid grid-cols-2 gap-2">
          <button
            id="btn-go-home"
            onClick={() => {
              sound.playOptionSelect();
              onHome();
            }}
            className="py-3 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 active:scale-[0.98] text-zinc-300 font-medium text-xs sm:text-sm flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Home className="w-4 h-4 text-zinc-400" />
            <span>처음으로</span>
          </button>

          <button
            id="btn-share-result"
            onClick={handleShare}
            className="py-3 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 active:scale-[0.98] text-zinc-300 font-medium text-xs sm:text-sm flex items-center justify-center gap-1.5 cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400">결과 복사됨!</span>
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4 text-zinc-400" />
                <span>결과 공유하기</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
