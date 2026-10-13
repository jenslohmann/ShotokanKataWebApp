// Quiz types (Models/QuizQuestion.swift, Models/QuestionCategory.swift).

export type QuestionCategory =
  | 'history'
  | 'techniques'
  | 'sequences'
  | 'applications'
  | 'ranks'
  | 'kata_order'
  | 'terminology'
  | 'philosophy';

export const QUESTION_CATEGORIES: QuestionCategory[] = [
  'history',
  'techniques',
  'sequences',
  'applications',
  'ranks',
  'kata_order',
  'terminology',
  'philosophy',
];

export type QuestionType =
  | 'static_question'
  | 'kata_moves_count'
  | 'kata_kiai_selection'
  | 'kata_techniques'
  | 'kata_stances';

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[]; // empty for kiai selection
  correctAnswerIndex: number; // 0 for kiai selection (unused)
  category: QuestionCategory;
  type: QuestionType;
  requiredRank: string; // RankId
  explanation?: string;
  relatedKataNames?: string[];
  kataNumber?: number; // for kiai selection: which kata to display
  correctMoves?: number[]; // for kiai selection: sequence numbers with kiai
}

export type QuizAnswer = { kind: 'choice'; index: number | null } | { kind: 'kiai'; moves: number[] } | { kind: 'skipped' };

export interface QuizConfig {
  rank: string;
  category: QuestionCategory | null;
  numberOfQuestions: number;
  timed: boolean;
  timeLimitSec: number;
}

export const DEFAULT_QUIZ_CONFIG: QuizConfig = {
  rank: '9_kyu',
  category: null,
  numberOfQuestions: 10,
  timed: true,
  timeLimitSec: 600,
};
