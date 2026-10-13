import { fireEvent, render, screen } from '@testing-library/react';
import { QuizProvider } from '../../state/QuizContext';
import { SettingsProvider } from '../../state/SettingsContext';
import { QuizMenuScreen } from './QuizMenuScreen';

function renderMenu() {
  return render(
    <SettingsProvider>
      <QuizProvider>
        <QuizMenuScreen />
      </QuizProvider>
    </SettingsProvider>,
  );
}

beforeEach(() => {
  localStorage.clear();
  window.location.hash = '#/quiz';
});

describe('QuizMenuScreen', () => {
  it('shows the available questions for the default rank', () => {
    renderMenu();
    expect(screen.getByRole('button', { name: '9th Kyū' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('Available questions: 2')).toBeInTheDocument();
  });

  it('selects the highest rank of a difficulty level', () => {
    renderMenu();
    fireEvent.click(screen.getByRole('button', { name: 'Advanced' }));
    expect(screen.getByRole('button', { name: '2nd Dan' })).toHaveAttribute('aria-pressed', 'true');
    const count = Number(screen.getByText(/^Available questions:/).textContent!.replace(/\D/g, ''));
    expect(count).toBeGreaterThan(2);
  });

  it('starts the quiz', () => {
    renderMenu();
    fireEvent.click(screen.getByRole('button', { name: 'Start Quiz' }));
    expect(window.location.hash).toBe('#/quiz/play');
  });
});
