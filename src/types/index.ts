export type QuestionType = 'multiple_choice' | 'flashcard' | 'identification';
export type QuestionDifficulty = 'easy' | 'medium' | 'hard';
export type GenerationDifficulty = 'easy' | 'medium' | 'hard' | 'mixed';
export type GenerationQuestionType = 'multiple_choice' | 'flashcard' | 'identification' | 'mixed';

export type StudyRating = 'again' | 'hard' | 'good' | 'easy';

export interface SpacedRepetitionData {
  easeFactor: number; // default 2.5
  interval: number; // interval in days
  repetition: number; // consecutive correct reviews
  lastReviewedDate: string | null; // ISO string
  nextReviewDate: string; // ISO string
}

export interface Question {
  id: string;
  type: QuestionType;
  difficulty: QuestionDifficulty;
  prompt: string;
  answer: string;
  explanation: string;
  options?: string[]; // exactly 4 for multiple_choice
  acceptableAnswers?: string[]; // for identification
  topic?: string;
  spacedRepetition: SpacedRepetitionData;
  mastered: boolean;
  mistakeCount: number;
  correctCount: number;
}

export interface Deck {
  id: string;
  title: string;
  subject: string;
  description?: string;
  sourceNotes?: string;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  lastStudiedAt?: string; // ISO string
  questions: Question[];
}

export interface StudySession {
  id: string;
  deckId: string;
  deckTitle: string;
  mode: 'quiz' | 'flashcards' | 'mistakes' | 'spaced_repetition';
  startedAt: string;
  completedAt: string;
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  accuracy: number;
  mistakeQuestionIds: string[];
}

export interface StreakData {
  currentStreak: number;
  lastStudyDate: string | null; // YYYY-MM-DD
  bestStreak: number;
}

export interface AppSettings {
  theme: 'light' | 'dark';
  animationsEnabled: boolean;
  streak: StreakData;
}

export interface GenerateQuestionsRequest {
  deckTitle: string;
  subject: string;
  notes: string;
  count: number;
  difficulty: GenerationDifficulty;
  questionType: GenerationQuestionType;
}

export interface EvaluateAnswerRequest {
  prompt: string;
  expectedAnswer: string;
  acceptableAnswers?: string[];
  userAnswer: string;
}

export interface EvaluateAnswerResponse {
  isCorrect: boolean;
  feedback: string;
}
