// Quiz state machine (QuizViewModel.swift), as a pure reducer.
import type { QuestionCategory, QuizAnswer, QuizConfig, QuizQuestion } from './types';
import { DEFAULT_QUIZ_CONFIG } from './types';

export type QuizStatus = 'notStarted' | 'inProgress' | 'paused' | 'completed';

export interface QuizResult {
  total: number;
  correct: number;
  incorrect: number;
  skipped: number;
  timeSpentSec: number;
  scorePercent: number;
  passed: boolean;
  rank: string;
  category: QuestionCategory | null;
}

export interface QuizState {
  status: QuizStatus;
  config: QuizConfig;
  questions: QuizQuestion[];
  index: number;
  answers: QuizAnswer[];
  selectedIndex: number | null;
  selectedMoves: number[];
  revealed: boolean;
  timeRemainingSec: number;
  startedAt: number | null;
  finishedAt: number | null;
  result: QuizResult | null;
}

export type QuizAction =
  | { type: 'START'; questions: QuizQuestion[]; config: QuizConfig; now: number }
  | { type: 'SELECT_OPTION'; index: number }
  | { type: 'TOGGLE_MOVE'; sequence: number }
  | { type: 'SUBMIT' }
  | { type: 'NEXT'; now: number }
  | { type: 'PREVIOUS' }
  | { type: 'SKIP'; now: number }
  | { type: 'TICK'; now: number }
  | { type: 'SYNC_TIME'; remaining: number; now: number }
  | { type: 'PAUSE' }
  | { type: 'RESUME' }
  | { type: 'COMPLETE'; now: number }
  | { type: 'RESET' }
  | { type: 'SET_CONFIG'; partial: Partial<QuizConfig> };

export const PASS_PERCENT = 70;

export function initialQuizState(config: QuizConfig = DEFAULT_QUIZ_CONFIG): QuizState {
  return {
    status: 'notStarted',
    config,
    questions: [],
    index: 0,
    answers: [],
    selectedIndex: null,
    selectedMoves: [],
    revealed: false,
    timeRemainingSec: 0,
    startedAt: null,
    finishedAt: null,
    result: null,
  };
}

export function currentQuestion(state: QuizState): QuizQuestion | undefined {
  return state.questions[state.index];
}

export function isLastQuestion(state: QuizState): boolean {
  return state.index >= state.questions.length - 1;
}

export function canGoBack(state: QuizState): boolean {
  return state.index > 0 && !state.revealed;
}

export function hasAnswerSelected(state: QuizState): boolean {
  const question = currentQuestion(state);
  if (!question) return false;
  return question.type === 'kata_kiai_selection' ? state.selectedMoves.length > 0 : state.selectedIndex !== null;
}

type Outcome = 'correct' | 'incorrect' | 'skipped';

export function answerOutcome(question: QuizQuestion, answer: QuizAnswer | undefined): Outcome {
  if (!answer || answer.kind === 'skipped') return 'skipped';
  if (answer.kind === 'choice') {
    if (answer.index === null) return 'skipped';
    return answer.index === question.correctAnswerIndex ? 'correct' : 'incorrect';
  }
  const expected = new Set(question.correctMoves ?? []);
  const given = new Set(answer.moves);
  const same = expected.size === given.size && [...given].every((move) => expected.has(move));
  return same ? 'correct' : 'incorrect';
}

export function computeResult(state: QuizState, finishedAt: number): QuizResult {
  let correct = 0;
  let incorrect = 0;
  let skipped = 0;
  state.questions.forEach((question, i) => {
    const outcome = answerOutcome(question, state.answers[i]);
    if (outcome === 'correct') correct++;
    else if (outcome === 'incorrect') incorrect++;
    else skipped++;
  });
  const total = state.questions.length;
  const scorePercent = total ? (correct / total) * 100 : 0;
  return {
    total,
    correct,
    incorrect,
    skipped,
    timeSpentSec: state.startedAt === null ? 0 : Math.round((finishedAt - state.startedAt) / 1000),
    scorePercent,
    passed: scorePercent >= PASS_PERCENT,
    rank: state.config.rank,
    category: state.config.category,
  };
}

function complete(state: QuizState, now: number): QuizState {
  if (state.status === 'completed' || state.status === 'notStarted') return state;
  return { ...state, status: 'completed', revealed: false, finishedAt: now, result: computeResult(state, now) };
}

/** Move to question `index` and load its stored answer into the selection. */
function goTo(state: QuizState, index: number): QuizState {
  const answer = state.answers[index];
  return {
    ...state,
    index,
    revealed: false,
    selectedIndex: answer?.kind === 'choice' ? answer.index : null,
    selectedMoves: answer?.kind === 'kiai' ? [...answer.moves] : [],
  };
}

function withAnswer(state: QuizState, answer: QuizAnswer): QuizAnswer[] {
  const answers = [...state.answers];
  answers[state.index] = answer;
  return answers;
}

function clampConfig(config: QuizConfig): QuizConfig {
  return {
    ...config,
    numberOfQuestions: Math.min(50, Math.max(1, Math.round(config.numberOfQuestions))),
    timeLimitSec: Math.max(60, config.timeLimitSec),
  };
}

export function quizReducer(state: QuizState, action: QuizAction): QuizState {
  const active = state.status === 'inProgress';
  switch (action.type) {
    case 'START': {
      if (action.questions.length === 0) return { ...initialQuizState(action.config) };
      return {
        ...initialQuizState(action.config),
        status: 'inProgress',
        questions: action.questions,
        answers: action.questions.map(() => ({ kind: 'skipped' })),
        timeRemainingSec: action.config.timed ? action.config.timeLimitSec : 0,
        startedAt: action.now,
      };
    }
    case 'SELECT_OPTION':
      if (!active || state.revealed) return state;
      return { ...state, selectedIndex: action.index, answers: withAnswer(state, { kind: 'choice', index: action.index }) };
    case 'TOGGLE_MOVE': {
      if (!active || state.revealed) return state;
      const has = state.selectedMoves.includes(action.sequence);
      const selectedMoves = has
        ? state.selectedMoves.filter((move) => move !== action.sequence)
        : [...state.selectedMoves, action.sequence];
      return { ...state, selectedMoves };
    }
    case 'SUBMIT': {
      if (!active || state.revealed || !hasAnswerSelected(state)) return state;
      const question = currentQuestion(state)!;
      const answer: QuizAnswer =
        question.type === 'kata_kiai_selection'
          ? { kind: 'kiai', moves: [...state.selectedMoves].sort((a, b) => a - b) }
          : { kind: 'choice', index: state.selectedIndex };
      return { ...state, revealed: true, answers: withAnswer(state, answer) };
    }
    case 'NEXT':
      if (!active || !state.revealed) return state;
      return isLastQuestion(state) ? complete(state, action.now) : goTo(state, state.index + 1);
    case 'PREVIOUS':
      if (!active || !canGoBack(state)) return state;
      return goTo(state, state.index - 1);
    case 'SKIP': {
      if (!active) return state;
      const skipped = { ...state, answers: withAnswer(state, { kind: 'skipped' }) };
      return isLastQuestion(state) ? complete(skipped, action.now) : goTo(skipped, state.index + 1);
    }
    case 'TICK': {
      if (!active || !state.config.timed) return state;
      const timeRemainingSec = Math.max(0, state.timeRemainingSec - 1);
      const next = { ...state, timeRemainingSec };
      return timeRemainingSec === 0 ? complete(next, action.now) : next;
    }
    case 'SYNC_TIME': {
      if (!active || !state.config.timed) return state;
      const timeRemainingSec = Math.max(0, Math.ceil(action.remaining));
      const next = { ...state, timeRemainingSec };
      return timeRemainingSec === 0 ? complete(next, action.now) : next;
    }
    case 'PAUSE':
      return active ? { ...state, status: 'paused' } : state;
    case 'RESUME':
      return state.status === 'paused' ? { ...state, status: 'inProgress' } : state;
    case 'COMPLETE':
      return complete(state, action.now);
    case 'RESET':
      return initialQuizState(state.config);
    case 'SET_CONFIG':
      return { ...state, config: clampConfig({ ...state.config, ...action.partial }) };
  }
}
