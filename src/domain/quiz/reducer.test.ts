import { initialQuizState, quizReducer, type QuizAction, type QuizState } from './reducer';
import { DEFAULT_QUIZ_CONFIG, type QuizQuestion } from './types';

const choice = (id: string): QuizQuestion => ({
  id,
  question: id,
  options: ['a', 'b', 'c', 'd'],
  correctAnswerIndex: 0,
  category: 'terminology',
  type: 'static_question',
  requiredRank: '9_kyu',
});

const kiai: QuizQuestion = {
  id: 'kiai',
  question: 'kiai',
  options: [],
  correctAnswerIndex: 0,
  category: 'sequences',
  type: 'kata_kiai_selection',
  requiredRank: '8_kyu',
  kataNumber: 1,
  correctMoves: [9, 17],
};

function run(state: QuizState, ...actions: QuizAction[]): QuizState {
  return actions.reduce(quizReducer, state);
}

describe('quizReducer', () => {
  it('runs a full quiz', () => {
    const config = { ...DEFAULT_QUIZ_CONFIG, timed: false };
    let state = run(initialQuizState(), { type: 'START', questions: [choice('q1'), kiai, choice('q3')], config, now: 0 });
    expect(state.status).toBe('inProgress');

    state = run(state, { type: 'SUBMIT' });
    expect(state.revealed).toBe(false); // nothing selected yet

    state = run(state, { type: 'SELECT_OPTION', index: 2 }, { type: 'SUBMIT' }, { type: 'NEXT', now: 1000 });
    expect(state.index).toBe(1);

    state = run(state, { type: 'TOGGLE_MOVE', sequence: 17 }, { type: 'TOGGLE_MOVE', sequence: 9 }, { type: 'SUBMIT' });
    expect(state.answers[1]).toEqual({ kind: 'kiai', moves: [9, 17] });
    state = run(state, { type: 'NEXT', now: 2000 }, { type: 'SKIP', now: 12_400 });

    expect(state.status).toBe('completed');
    expect(state.result).toMatchObject({ total: 3, correct: 1, incorrect: 1, skipped: 1, passed: false, timeSpentSec: 12 });
    expect(state.result!.scorePercent).toBeCloseTo(100 / 3);
  });

  it('restores answers when going back', () => {
    const config = { ...DEFAULT_QUIZ_CONFIG, timed: false };
    let state = run(
      initialQuizState(),
      { type: 'START', questions: [choice('q1'), choice('q2')], config, now: 0 },
      { type: 'SELECT_OPTION', index: 3 },
      { type: 'SUBMIT' },
      { type: 'NEXT', now: 0 },
    );
    state = run(state, { type: 'PREVIOUS' });
    expect(state.index).toBe(0);
    expect(state.selectedIndex).toBe(3);
  });

  it('completes when the timer runs out', () => {
    const config = { ...DEFAULT_QUIZ_CONFIG, timed: true, timeLimitSec: 2 };
    let state = run(initialQuizState(), { type: 'START', questions: [choice('q1')], config, now: 0 });
    expect(state.timeRemainingSec).toBe(2);
    state = run(state, { type: 'TICK', now: 1000 });
    expect(state.status).toBe('inProgress');
    state = run(state, { type: 'TICK', now: 2000 });
    expect(state.status).toBe('completed');
  });

  it('pauses, ignores ticks while paused, and resumes', () => {
    const config = { ...DEFAULT_QUIZ_CONFIG, timeLimitSec: 60 };
    let state = run(initialQuizState(), { type: 'START', questions: [choice('q1')], config, now: 0 }, { type: 'PAUSE' });
    state = run(state, { type: 'TICK', now: 1000 });
    expect(state.timeRemainingSec).toBe(60);
    state = run(state, { type: 'RESUME' });
    expect(state.status).toBe('inProgress');
  });

  it('stays not started without questions and clamps config', () => {
    let state = run(initialQuizState(), { type: 'START', questions: [], config: DEFAULT_QUIZ_CONFIG, now: 0 });
    expect(state.status).toBe('notStarted');
    state = run(state, { type: 'SET_CONFIG', partial: { numberOfQuestions: 99, timeLimitSec: 10 } });
    expect(state.config.numberOfQuestions).toBe(50);
    expect(state.config.timeLimitSec).toBe(60);
  });
});
