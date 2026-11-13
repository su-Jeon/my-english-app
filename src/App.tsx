/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useCallback } from 'react';
import { getRandomSessionQuestions } from './data/questions';
import { GameSessionResult, Question, ScreenState, UserAnswerRecord } from './types';
import { StartScreen } from './components/StartScreen';
import { GameScreen } from './components/GameScreen';
import { ResultScreen } from './components/ResultScreen';
import { sound } from './utils/sound';
import {
  GameSheetPayload,
  getStoredGasUrl,
  getStoredPlayerName,
  sendGameResultToSheet,
  setStoredPlayerName,
} from './utils/sheetService';

export default function App() {
  const [screen, setScreen] = useState<ScreenState>('start');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [suspicion, setSuspicion] = useState<number>(0);
  const [history, setHistory] = useState<UserAnswerRecord[]>([]);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [gameResult, setGameResult] = useState<GameSessionResult | null>(null);

  // Player name for Google Sheet logging
  const [playerName, setPlayerName] = useState<string>(() => getStoredPlayerName() || '');
  const [gasUrl, setGasUrl] = useState<string>(() => getStoredGasUrl());

  // Sheet sync state
  const [sheetStatus, setSheetStatus] = useState<{
    loading: boolean;
    success?: boolean;
    playCount?: number;
    message?: string;
  }>({ loading: false });

  const handlePlayerNameChange = (name: string) => {
    setPlayerName(name);
    setStoredPlayerName(name);
  };

  // Start a new 5-question game session
  const handleStartGame = () => {
    const sessionQuestions = getRandomSessionQuestions(5);
    setQuestions(sessionQuestions);
    setCurrentQuestionIndex(0);
    setSuspicion(0);
    setHistory([]);
    setGameResult(null);
    setSheetStatus({ loading: false });
    setScreen('game');
  };

  // Toggle sound
  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    sound.enabled = next;
  };

  // Called when user selects an option
  const handleAnswerSelected = (record: UserAnswerRecord) => {
    const updatedSuspicion = suspicion + record.addedSuspicion;
    setSuspicion(updatedSuspicion);
    setHistory((prev) => [...prev, record]);
  };

  // Trigger Google Sheet save
  const triggerSheetSave = useCallback(
    async (
      res: GameSessionResult,
      name: string,
      targetUrl?: string
    ) => {
      const activeUrl = targetUrl || (import.meta.env.VITE_GOOGLE_SCRIPT_URL as string) || gasUrl;
      if (!activeUrl) {
        setSheetStatus({
          loading: false,
          success: false,
          message: 'VITE_GOOGLE_SCRIPT_URL이 설정되지 않았습니다.',
        });
        return;
      }

      setSheetStatus({ loading: true });

      try {
        // history 중 isNative가 false인 문항의 question.nativeCoreExp를 쉼표로 연결
        const wrongExpressions = res.history
          .filter((item) => !item.isNative)
          .map((item) => item.question.nativeCoreExp)
          .join(', ');

        const payload: GameSheetPayload = {
          name: name.trim() || '익명 요원',
          correct_count: res.nativeCount,
          wrong_count: res.konglishCount,
          final_suspicion: res.finalSuspicion,
          result: res.isBusted ? 'busted' : 'survived',
          questions_attempted: res.totalQuestionsAttempted,
          wrong_expressions: wrongExpressions,
        };

        const saveRes = await sendGameResultToSheet(payload, activeUrl);
        setSheetStatus({
          loading: false,
          success: saveRes.success,
          playCount: saveRes.playCount,
          message: saveRes.message,
        });
      } catch (err: unknown) {
        // 저장 실패해도 결과 화면은 정상적으로 보이도록 처리
        const error = err as Error;
        setSheetStatus({
          loading: false,
          success: false,
          message: `시트 저장 오류 (${error?.message || '네트워크 문제'})`,
        });
      }
    },
    [gasUrl]
  );

  // Called when user clicks "Next Question" or "Check Result"
  const handleNextQuestion = (isBusted: boolean) => {
    const updatedHistory = history;
    const nativeCount = updatedHistory.filter((h) => h.isNative).length;
    const konglishCount = updatedHistory.filter((h) => !h.isNative).length;

    // Check if busted (suspicion reached 60) or reached the end of 5 questions
    if (isBusted || suspicion >= 60 || currentQuestionIndex >= questions.length - 1) {
      const finalRes: GameSessionResult = {
        isBusted: isBusted || suspicion >= 60,
        finalSuspicion: suspicion,
        totalQuestionsAttempted: currentQuestionIndex + 1,
        nativeCount,
        konglishCount,
        history: updatedHistory,
        playerName: playerName.trim() || '익명 요원',
      };
      setGameResult(finalRes);
      setScreen('result');

      // Auto-save result to Google Sheet
      triggerSheetSave(finalRes, playerName);
    } else {
      // Proceed to next question
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handleRetrySheetSave = () => {
    if (gameResult) {
      triggerSheetSave(gameResult, playerName);
    }
  };

  const handleSheetUrlConfigured = (newUrl: string) => {
    setGasUrl(newUrl);
  };

  // Return to start screen
  const handleGoHome = () => {
    setScreen('start');
    setGameResult(null);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-amber-500 selection:text-black">
      <main className="flex-1 w-full max-w-lg mx-auto flex flex-col justify-center">
        {screen === 'start' && (
          <StartScreen
            onStartGame={handleStartGame}
            soundEnabled={soundEnabled}
            onToggleSound={handleToggleSound}
            playerName={playerName}
            onPlayerNameChange={handlePlayerNameChange}
          />
        )}

        {screen === 'game' && questions.length > 0 && (
          <GameScreen
            questions={questions}
            currentQuestionIndex={currentQuestionIndex}
            suspicion={suspicion}
            onAnswerSelected={handleAnswerSelected}
            onNextQuestion={handleNextQuestion}
          />
        )}

        {screen === 'result' && gameResult && (
          <ResultScreen
            result={gameResult}
            onRestart={handleStartGame}
            onHome={handleGoHome}
            sheetStatus={sheetStatus}
            onRetrySheetSave={handleRetrySheetSave}
            hasSheetUrl={!!gasUrl}
            onSheetUrlConfigured={handleSheetUrlConfigured}
          />
        )}
      </main>
    </div>
  );
}
