import { expect, test } from '@playwright/test';
import { openRoute } from './helpers';
import { configureSequencesQuiz, playToEnd, setTimed } from './quizHelpers';

// Replaces the manual "play a full quiz, timed and untimed, with a kiai question" check.

test('untimed quiz at the default rank runs to the results', async ({ page }) => {
  await openRoute(page, '#/quiz');
  await expect(page.getByText('Available questions: 2')).toBeVisible();
  await setTimed(page, false);
  await page.getByRole('button', { name: 'Start Quiz' }).click();
  await expect(page).toHaveURL(/#\/quiz\/play$/);
  await expect(page.getByRole('timer')).toHaveCount(0);

  await playToEnd(page);

  await expect(page.getByText('Correct Answers', { exact: true })).toBeVisible();
  await expect(page.getByText('Rank Level')).toBeVisible();
  await page.getByRole('button', { name: 'Back to Main Menu' }).click();
  await expect(page).toHaveURL(/#\/kata$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Kata' })).toBeVisible();
});

test('timed 2nd Dan sequences quiz has a running timer, a kiai question and a skip', async ({ page }) => {
  await configureSequencesQuiz(page, true);
  await expect(page.getByText('10 minutes')).toBeVisible();
  await page.getByRole('button', { name: 'Start Quiz' }).click();

  const timer = page.getByRole('timer');
  await expect(timer).toHaveText(/\d+:\d\d/);
  const before = await timer.textContent();
  await expect(timer).not.toHaveText(before!, { timeout: 3_000 });

  const kiaiQuestions = await playToEnd(page, { skipFirst: true });

  expect(kiaiQuestions).toBeGreaterThan(0);
  await expect(page.getByText('Skipped Questions')).toBeVisible();
  await expect(page.getByText('Time Spent')).toBeVisible();
});

test('pause, resume and exit confirmation', async ({ page }) => {
  await openRoute(page, '#/quiz');
  await page.getByRole('button', { name: 'Start Quiz' }).click();

  await page.getByRole('button', { name: 'Pause' }).click();
  await expect(page.getByRole('heading', { name: 'Quiz Paused' })).toBeVisible();
  await page.getByRole('button', { name: 'Resume Quiz' }).click();
  await expect(page.getByText(/Question 1 of \d+/)).toBeVisible();

  await page.getByRole('button', { name: 'Exit' }).click();
  const dialog = page.getByRole('dialog', { name: 'Exit Quiz?' });
  await expect(dialog).toBeVisible();
  await dialog.getByRole('button', { name: 'Continue Quiz' }).click();
  await expect(dialog).toBeHidden();
  await expect(page).toHaveURL(/#\/quiz\/play$/);

  await page.getByRole('button', { name: 'Exit' }).click();
  await dialog.getByRole('button', { name: 'Exit' }).click();
  await expect(page).toHaveURL(/#\/quiz$/);
  await expect(page.getByRole('button', { name: 'Start Quiz' })).toBeVisible();
});
