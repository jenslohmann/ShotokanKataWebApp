import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, type Dispatch, type ReactNode } from 'react';
import { ALL_KATA } from '../domain/kata';
import { generateAllQuestions, pickQuizQuestions, questionsFor } from '../domain/quiz/generate';
import { initialQuizState, quizReducer, type QuizAction, type QuizState } from '../domain/quiz/reducer';
import type { QuizQuestion } from '../domain/quiz/types';
import { navigate, useRoute } from '../router/useRoute';
import { useLang } from './SettingsContext';

export interface QuizContextValue {
  state: QuizState;
  dispatch: Dispatch<QuizAction>;
  availableCount: number;
  startQuiz(): void;
}

const QuizContext = createContext<QuizContextValue | null>(null);

interface QuizProviderProps {
  children: ReactNode;
  /** For tests: start from a given state / question pool. */
  initialState?: QuizState;
  pool?: QuizQuestion[];
}

export function QuizProvider({ children, initialState, pool: poolOverride }: QuizProviderProps) {
  const [state, dispatch] = useReducer(quizReducer, initialState ?? initialQuizState());
  // Generated once per app session (random technique/stance picks differ between sessions, like iOS).
  // Questions are generated in the UI language; a running quiz keeps the language it started in.
  const lang = useLang();
  const pool = useMemo(() => poolOverride ?? generateAllQuestions(ALL_KATA, Math.random, lang), [poolOverride, lang]);
  const availableCount = questionsFor(pool, state.config.rank, state.config.category).length;

  const startQuiz = useCallback(() => {
    const questions = pickQuizQuestions(pool, state.config, Math.random);
    if (questions.length === 0) return;
    dispatch({ type: 'START', questions, config: state.config, now: Date.now() });
    navigate({ name: 'quizPlay' });
  }, [pool, state.config]);

  // Leaving the full-screen quiz (browser back, Exit, Done, …) ends the quiz.
  const route = useRoute();
  const previousRoute = useRef(route.name);
  useEffect(() => {
    if (previousRoute.current === 'quizPlay' && route.name !== 'quizPlay') dispatch({ type: 'RESET' });
    previousRoute.current = route.name;
  }, [route.name]);

  const value = useMemo(() => ({ state, dispatch, availableCount, startQuiz }), [state, availableCount, startQuiz]);
  return <QuizContext.Provider value={value}>{children}</QuizContext.Provider>;
}

export function useQuiz(): QuizContextValue {
  const value = useContext(QuizContext);
  if (!value) throw new Error('useQuiz must be used inside QuizProvider');
  return value;
}
