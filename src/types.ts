export interface Option {
  id: string;
  text: string;
  isNative: boolean;
  explanation: string;
  konglishOrigin?: string; // Korean phrase or literal habit that caused this Konglish
}

export interface Question {
  id: string;
  category: string; // e.g., '직장/업무', '일상/약속', '식당/카페', '감정/상태', '쇼핑/서비스'
  situationTitle: string; // e.g., "야근 중 오늘 업무 마무리하기"
  interrogatorLine: string; // "It's past 9 PM and we're losing focus. Any suggestions?"
  koreanIntent: string; // 말하려는 우리말 의도: "오늘은 이쯤에서 마무리(퇴근)하죠."
  responseTemplate: string; // "I think we should ______."
  options: Option[];
  nativeCoreExp: string; // e.g. "call it a day"
  nativeNuanceTip: string; // 원어민 뉘앙스 핵심 팁
}

export interface UserAnswerRecord {
  questionId: string;
  question: Question;
  selectedOption: Option;
  isNative: boolean;
  addedSuspicion: number;
}

export type ScreenState = 'start' | 'game' | 'result';

export interface GameSessionResult {
  isBusted: boolean; // true if suspicion reached 60
  finalSuspicion: number; // 0, 20, 40, 60, etc.
  totalQuestionsAttempted: number;
  nativeCount: number;
  konglishCount: number;
  history: UserAnswerRecord[];
}
