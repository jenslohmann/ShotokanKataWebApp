import { expect, test, type Page } from '@playwright/test';
import { openRoute } from './helpers';

// Replaces the manual "play a full quiz, timed and untimed, with a kiai question" check.

const KIAI_INSTRUCTION = 'Tap the move numbers to select which moves have kiai';

async function setTimed(page: Page, timed: boolean) {
  const toggle = page.getByRole('switch', { name: 'Timed Quiz' });
  if ((await toggle.getAttribute('aria-checked')) !== String(timed)) await toggle.click();
  await expect(toggle).toHaveAttribute('aria-checked', String(timed));
}

/** Answers every question (first option / first move) and returns how many kiai questions came up. */
async function playToEnd(page: Page, { skipFirst = false } = {}): Promise<number> {
  let kiaiQuestions = 0;
  let first = true;
  const complete = page.getByRole('heading', { name: 'Quiz Complete!' });
  while (!(await complete.isVisible())) {
    await expect(page.getByRole('button', { name: 'Skip Question' })).toBeVisible();
    if (first && skipFirst) {
      first = false;
      await page.getByRole('button', { name: 'Skip Question' }).click();
      continue;
    }
    first = false;
    if (await page.getByText(KIAI_INSTRUCTION).isVisible()) {
      kiaiQuestions++;
      await page.locator('.kiai-move').first().click();
      await page.getByRole('button', { name: 'Submit Answer' }).click();
      await expect(page.getByText(/^(Correct!|Incorrect)$/)).toBeVisible();
      await expect(page.locator('.kiai-move .kiai-badge').first()).toBeVisible();
    } else {
      await page.locator('.answer-option').first().click();
      await page.getByRole('button', { name: 'Submit Answer' }).click();
      await expect(page.locator('.answer-option--correct')).toBeVisible();
    }
    await page.getByRole('button', { name: /^(Next Question|Finish Quiz)$/ }).click();
  }
  return kiaiQuestions;
}

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
  await openRoute(page, '#/quiz');
  await page.getByRole('button', { name: '2nd Dan' }).click();
  await page.getByRole('button', { name: 'Sequences' }).click();
  await page.locator('.quiz-menu__range').first().fill('30');
  await setTimed(page, true);
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
