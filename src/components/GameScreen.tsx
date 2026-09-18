import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Option, Question, UserAnswerRecord } from '../types';
import { SuspicionGauge } from './SuspicionGauge';
import { InterrogatorVisual } from './InterrogatorVisual';
import { sound } from '../utils/sound';
import { AlertTriangle, CheckCircle2, ChevronRight, HelpCircle } from 'lucide-react';

interface GameScreenProps {
  questions: Question[];
  currentQuestionIndex: number;
  suspicion: number;
  onAnswerSelected: (record: UserAnswerRecord) => void;
  onNextQuestion: (isBusted: boolean) => void;
}

export const GameScreen: React.FC<GameScreenProps> = ({
  questions,
  currentQuestionIndex,
  suspicion,
  onAnswerSelected,
  onNextQuestion,
}) => {
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];
  const questionNumberDisplay = `${currentQuestionIndex + 1}/${questions.length}`;

  // Find the selected option once chosen
  const selectedOption = currentQuestion.options.find(
    (opt) => opt.id === selectedOptionId
  );

  const isBustedAfterThis =
    hasAnswered &&
    selectedOption &&
    !selectedOption.isNative &&
    suspicion + 20 >= 60;

  const handleSelectOption = (option: Option) => {
    if (hasAnswered) return; // Prevent double taps

    setSelectedOptionId(option.id);
    setHasAnswered(true);

    const addedSuspicion = option.isNative ? 0 : 20;

    if (option.isNative) {
      sound.playNativeSuccess();
    } else {
      if (suspicion + addedSuspicion >= 60) {
        sound.playBusted();
      } else {
        sound.playKonglishAlarm();
      }
    }

    onAnswerSelected({
      questionId: currentQuestion.id,
      question: currentQuestion,
      selectedOption: option,
      isNative: option.isNative,
      addedSuspicion,
    });
  };

  const handleNextClick = () => {
    sound.playOptionSelect();
    const isBusted = !!(selectedOption && !selectedOption.isNative && suspicion >= 60);
    onNextQuestion(isBusted);
    setSelectedOptionId(null);
    setHasAnswered(false);
  };

  // Determine inspector visual mood
  let inspectorMood: 'neutral' | 'suspicious' | 'satisfied' | 'busted' = 'neutral';
  if (hasAnswered && selectedOption) {
    if (selectedOption.isNative) {
      inspectorMood = 'satisfied';
    } else if (suspicion >= 60) {
      inspectorMood = 'busted';
    } else {
      inspectorMood = 'suspicious';
    }
  }

  // Render response sentence with styled blank
  const renderSentenceWithBlank = () => {
    const template = currentQuestion.responseTemplate;
    const parts = template.split('______');

    return (
      <div className="text-base sm:text-lg font-medium text-zinc-200 leading-relaxed">
        {parts[0]}
        <span
          className={`inline-block min-w-28 sm:min-w-36 text-center px-2.5 py-0.5 mx-1 rounded border-b-2 font-bold transition-colors ${
            hasAnswered && selectedOption
              ? selectedOption.isNative
                ? 'bg-emerald-950/60 border-emerald-400 text-emerald-300'
                : 'bg-rose-950/60 border-rose-500 text-rose-300 line-through'
              : 'bg-zinc-800/80 border-amber-400 text-amber-300 animate-pulse'
          }`}
        >
          {selectedOption ? selectedOption.text : '빈칸 채우기'}
        </span>
        {parts[1]}
      </div>
    );
  };

  return (
    <div
      id="game-screen"
      className="relative flex flex-col justify-between min-h-[92vh] sm:min-h-[700px] max-w-md mx-auto px-3 sm:px-4 py-4 text-zinc-100 pb-8"
    >
      {/* Top Bar: Question Number (left) & Suspicion Gauge (right) */}
      <div className="flex items-start justify-between gap-3 mb-3">
        {/* Question Number (Left Top - "2/5" format as required) */}
        <div
          id="question-progress-indicator"
          className="rounded-xl border border-zinc-800 bg-zinc-900/90 px-3 py-2 shadow-md backdrop-blur-sm shrink-0"
        >
          <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block">
            심문 진행
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-lg sm:text-xl font-bold font-mono text-amber-400">
              {currentQuestionIndex + 1}
            </span>
            <span className="text-xs font-mono text-zinc-500">/ {questions.length}</span>
          </div>
        </div>

        {/* Suspicion Gauge (Right Top - Bar format) */}
        <SuspicionGauge suspicion={suspicion} maxSuspicion={60} />
      </div>

      {/* Interrogator Character Artwork (Top) */}
      <div className="mb-3">
        <InterrogatorVisual mood={inspectorMood} />
      </div>

      {/* Question Interrogation Card (Center) */}
      <div
        id="question-dialogue-card"
        className="rounded-2xl bg-zinc-900/90 border border-zinc-800 p-4 shadow-xl backdrop-blur-sm mb-4"
      >
        {/* Situation Category Badge & Context */}
        <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-zinc-800/80">
          <span className="px-2 py-0.5 rounded-full bg-amber-950/70 border border-amber-600/40 text-[11px] font-semibold text-amber-300">
            {currentQuestion.category}
          </span>
          <span className="text-xs text-zinc-400 font-medium truncate">
            {currentQuestion.situationTitle}
          </span>
        </div>

        {/* Inspector Question Dialogue Line */}
        <div className="flex items-start gap-2.5 mb-3 bg-zinc-950/60 p-3 rounded-xl border border-zinc-800/60">
          <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider shrink-0 mt-0.5">
            심문관:
          </span>
          <p className="text-xs sm:text-sm text-zinc-200 italic leading-relaxed">
            "{currentQuestion.interrogatorLine}"
          </p>
        </div>

        {/* Korean Speaker Intent Hint */}
        <div className="flex items-center gap-2 mb-3 px-2.5 py-1.5 rounded-lg bg-zinc-800/40 text-xs text-zinc-300">
          <HelpCircle className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
          <span>
            말하려는 우리말 의도:{' '}
            <strong className="text-amber-300 font-semibold">
              {currentQuestion.koreanIntent}
            </strong>
          </span>
        </div>

        {/* Response Sentence with Blank */}
        <div className="bg-black/40 p-3 rounded-xl border border-zinc-800/90">
          <span className="text-[10px] font-mono text-zinc-500 uppercase block mb-1">
            당신의 답변 (빈칸에 알맞은 표현을 고르세요):
          </span>
          {renderSentenceWithBlank()}
        </div>
      </div>

      {/* 4 Option Buttons (Stacked Vertically, >=44px touch targets) */}
      <div id="options-container" className="space-y-2.5 mb-4">
        {currentQuestion.options.map((option, index) => {
          const isSelected = selectedOptionId === option.id;
          const letterLabel = String.fromCharCode(65 + index); // A, B, C, D

          let buttonStyle =
            'bg-zinc-900/90 border-zinc-800 hover:border-zinc-700 active:bg-zinc-800 text-zinc-200';

          if (hasAnswered) {
            if (option.isNative) {
              buttonStyle =
                'bg-emerald-950/80 border-emerald-500 text-emerald-100 shadow-[0_0_15px_rgba(16,185,129,0.25)]';
            } else if (isSelected && !option.isNative) {
              buttonStyle =
                'bg-rose-950/80 border-rose-500 text-rose-100 shadow-[0_0_15px_rgba(244,63,94,0.25)]';
            } else {
              buttonStyle = 'bg-zinc-950/50 border-zinc-900 text-zinc-500 opacity-60';
            }
          }

          return (
            <button
              key={option.id}
              id={`option-btn-${index + 1}`}
              disabled={hasAnswered}
              onClick={() => handleSelectOption(option)}
              className={`w-full min-h-[52px] p-3 rounded-xl border text-left flex items-center justify-between gap-3 transition-all cursor-pointer font-medium text-xs sm:text-sm ${buttonStyle}`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono font-bold text-xs shrink-0 ${
                    hasAnswered && option.isNative
                      ? 'bg-emerald-500 text-black'
                      : hasAnswered && isSelected && !option.isNative
                      ? 'bg-rose-500 text-white'
                      : 'bg-zinc-800 text-zinc-300'
                  }`}
                >
                  {letterLabel}
                </span>
                <span className="break-words font-medium">{option.text}</span>
              </div>

              {hasAnswered && (
                <div className="shrink-0">
                  {option.isNative ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/90 px-2 py-0.5 rounded-full border border-emerald-600/50">
                      <CheckCircle2 className="w-3.5 h-3.5" /> 원어민 구어
                    </span>
                  ) : isSelected ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-400 bg-rose-950/90 px-2 py-0.5 rounded-full border border-rose-600/50">
                      <AlertTriangle className="w-3.5 h-3.5" /> 콩글리시 (+20)
                    </span>
                  ) : null}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Post-Choice Feedback & Nuance Explanation Drawer */}
      <AnimatePresence>
        {hasAnswered && selectedOption && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            id="explanation-feedback-drawer"
            className={`rounded-2xl p-4 border shadow-2xl backdrop-blur-md ${
              selectedOption.isNative
                ? 'bg-emerald-950/90 border-emerald-500/50'
                : 'bg-rose-950/90 border-rose-500/60'
            }`}
          >
            {/* Header of Feedback */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {selectedOption.isNative ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <span className="font-bold text-sm text-emerald-200">
                      원어민 구어체 정답! (의심도 변동 없음: +0)
                    </span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-5 h-5 text-rose-400 animate-bounce" />
                    <span className="font-bold text-sm text-rose-200">
                      콩글리시 적발! (의심도 +20 급상승)
                    </span>
                  </>
                )}
              </div>

              {isBustedAfterThis && (
                <span className="px-2 py-0.5 rounded bg-rose-600 text-white font-bold text-[10px] animate-pulse">
                  의심도 60 도달!
                </span>
              )}
            </div>

            {/* Explanation Body */}
            <div className="space-y-2 text-xs sm:text-sm text-zinc-200 bg-black/40 p-3 rounded-xl border border-white/10 mb-3">
              {!selectedOption.isNative && selectedOption.konglishOrigin && (
                <p className="text-rose-300 font-medium">
                  <span className="text-zinc-400">콩글리시 원인:</span> {selectedOption.konglishOrigin}
                </p>
              )}
              <p className="leading-relaxed">{selectedOption.explanation}</p>
              <div className="pt-2 border-t border-white/10 flex items-start gap-1.5">
                <span className="text-amber-400 font-bold shrink-0">💡 원어민 팁:</span>
                <span className="text-zinc-300">
                  <strong className="text-amber-300">"{currentQuestion.nativeCoreExp}"</strong> —{' '}
                  {currentQuestion.nativeNuanceTip}
                </span>
              </div>
            </div>

            {/* Next Question / Check Result Button */}
            <button
              id="btn-next-question"
              onClick={handleNextClick}
              className={`w-full py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg active:scale-[0.98] ${
                isBustedAfterThis
                  ? 'bg-rose-600 hover:bg-rose-500 text-white'
                  : currentQuestionIndex === questions.length - 1
                  ? 'bg-amber-500 hover:bg-amber-400 text-zinc-950'
                  : 'bg-zinc-100 hover:bg-white text-zinc-950'
              }`}
            >
              <span>
                {isBustedAfterThis
                  ? '심문 종료 (발각 결과 확인)'
                  : currentQuestionIndex === questions.length - 1
                  ? '최종 심문 결과 확인'
                  : '다음 심문 질문으로'}
              </span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
