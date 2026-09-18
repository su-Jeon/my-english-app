/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { getRandomSessionQuestions } from './data/questions';
import { GameSessionResult, Question, ScreenState, UserAnswerRecord } from './types';
import { StartScreen } from './components/StartScreen';
import { GameScreen } from './components/GameScreen';
import { ResultScreen } from './components/ResultScreen';
import { sound } from './utils/sound';

export default function App() {
  const [screen, setScreen] = useState<ScreenState>('start');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [suspicion, setSuspicion] = useState<number>(0);
  const [history, setHistory] = useState<UserAnswerRecord[]>([]);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [gameResult, setGameResult] = useState<GameSessionResult | null>(null);

  // Start a new 5-question game session
  const handleStartGame = () => {
    const sessionQuestions = getRandomSessionQuestions(5);
    setQuestions(sessionQuestions);
    setCurrentQuestionIndex(0);
    setSuspicion(0);
    setHistory([]);
    setGameResult(null);
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
      };
      setGameResult(finalRes);
      setScreen('result');
    } else {
      // Proceed to next question
      setCurrentQuestionIndex((prev) => prev + 1);
    }
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
          />
        )}
      </main>
    </div>
  );
}
