import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from './App';

beforeEach(() => {
  window.location.hash = '';
});

it('shows the Kata section by default', () => {
  render(<App />);
  expect(screen.getByRole('heading', { level: 1, name: 'Kata' })).toBeInTheDocument();
});

it('navigates to the Quiz section via the tab link', async () => {
  const user = userEvent.setup();
  render(<App />);
  const [quizLink] = screen.getAllByRole('link', { name: 'Quiz' });
  await act(async () => {
    await user.click(quizLink);
  });
  expect(await screen.findByRole('heading', { level: 1, name: 'Quiz' })).toBeInTheDocument();
});

it('starts a quiz full screen and exits back to the quiz menu', async () => {
  window.location.hash = '#/quiz';
  render(<App />);
  await act(async () => {
    screen.getByRole('button', { name: 'Start Quiz' }).click();
  });
  expect(await screen.findByText('Question 1 of 2')).toBeInTheDocument();
  expect(screen.queryByRole('navigation')).not.toBeInTheDocument();

  await act(async () => {
    screen.getByRole('button', { name: 'Exit' }).click();
  });
  const dialog = screen.getByRole('dialog');
  await act(async () => {
    within(dialog).getByRole('button', { name: 'Exit' }).click();
  });
  expect(await screen.findByText('Available questions: 2')).toBeInTheDocument();
  expect(window.location.hash).toBe('#/quiz');
});
