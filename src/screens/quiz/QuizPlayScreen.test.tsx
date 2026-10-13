import { act, fireEvent, render, screen } from '@testing-library/react';
import { initialQuizState, quizReducer } from '../../domain/quiz/reducer';
import { STATIC_QUESTIONS } from '../../domain/quiz/staticQuestions';
import { DEFAULT_QUIZ_CONFIG, type QuizQuestion } from '../../domain/quiz/types';
import { QuizProvider } from '../../state/QuizContext';
import { SettingsProvider } from '../../state/SettingsContext';
import { QuizPlayScreen } from './QuizPlayScreen';

const KIAI: QuizQuestion = {
  id: 'kiai-test',
  question: 'Select the moves where the karateka should say kiai in Heian Shodan:',
  options: [],
  correctAnswerIndex: 0,
  category: 'sequences',
  type: 'kata_kiai_selection',
  requiredRank: '8_kyu',
  explanation: 'In Heian Shodan, kiai is performed on move 9 and move 17.',
  kataNumber: 1,
  correctMoves: [9, 17],
};

function renderQuiz(questions: QuizQuestion[]) {
  const config = { ...DEFAULT_QUIZ_CONFIG, timed: false };
  const state = quizReducer(initialQuizState(config), { type: 'START', questions, config, now: Date.now() });
  window.location.hash = '#/quiz/play';
  return render(
    <SettingsProvider>
      <QuizProvider initialState={state} pool={questions}>
        <QuizPlayScreen />
      </QuizProvider>
    </SettingsProvider>,
  );
}

beforeEach(() => {
  localStorage.clear();
});

describe('QuizPlayScreen', () => {
  it('plays multiple-choice questions to the end', () => {
    const [first, second] = STATIC_QUESTIONS;
    renderQuiz([first, second]);
    expect(screen.getByText('Question 1 of 2')).toBeInTheDocument();
    const submit = screen.getByRole('button', { name: 'Submit Answer' });
    expect(submit).toBeDisabled();

    fireEvent.click(screen.getByRole('button', { name: /Heian Shodan/ }));
    expect(submit).toBeEnabled();
    fireEvent.click(submit);
    expect(screen.getByText('Explanation')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Heian Shodan/ })).toHaveClass('answer-option--correct');

    fireEvent.click(screen.getByRole('button', { name: 'Next Question' }));
    expect(screen.getByText('Question 2 of 2')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Strength/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Submit Answer' }));
    fireEvent.click(screen.getByRole('button', { name: 'Finish Quiz' }));

    expect(screen.getByText('Quiz Complete!')).toBeInTheDocument();
    expect(screen.getByText('50% Score')).toBeInTheDocument();
    expect(screen.getByText('1/2')).toBeInTheDocument();
  });

  it('shows the correct kiai moves after a wrong answer', () => {
    renderQuiz([KIAI]);
    expect(screen.getAllByRole('button', { pressed: false }).length).toBeGreaterThan(20);
    const move9 = screen.getAllByText('9').find((el) => el.classList.contains('kiai-move__number'))!;
    fireEvent.click(move9.closest('button')!);
    fireEvent.click(screen.getByRole('button', { name: 'Submit Answer' }));
    expect(screen.getByText('Incorrect')).toBeInTheDocument();
    expect(screen.getByText('Correct answer: 9, 17')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Finish Quiz' })).toBeInTheDocument();
  });

  it('asks before exiting', () => {
    renderQuiz([STATIC_QUESTIONS[0]]);
    fireEvent.click(screen.getByRole('button', { name: 'Exit' }));
    expect(screen.getByText('Your progress will be lost if you exit now.')).toBeInTheDocument();
  });

  it('counts down in a timed quiz', () => {
    vi.useFakeTimers();
    const config = { ...DEFAULT_QUIZ_CONFIG, timed: true, timeLimitSec: 600 };
    const state = quizReducer(initialQuizState(config), {
      type: 'START',
      questions: [STATIC_QUESTIONS[0]],
      config,
      now: Date.now(),
    });
    render(
      <SettingsProvider>
        <QuizProvider initialState={state} pool={[STATIC_QUESTIONS[0]]}>
          <QuizPlayScreen />
        </QuizProvider>
      </SettingsProvider>,
    );
    expect(screen.getByRole('timer')).toHaveTextContent('10:00');
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(screen.getByRole('timer')).toHaveTextContent('9:57');
    vi.useRealTimers();
  });
});
