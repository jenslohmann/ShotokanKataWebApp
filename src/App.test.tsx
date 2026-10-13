import { act, render, screen } from '@testing-library/react';
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
