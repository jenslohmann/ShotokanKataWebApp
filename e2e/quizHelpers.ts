import { expect, type Page } from '@playwright/test';
import { openRoute } from './helpers';

export const KIAI_INSTRUCTION = 'Tap the move numbers to select which moves have kiai';

export async function setTimed(page: Page, timed: boolean) {
  const toggle = page.getByRole('switch', { name: 'Timed Quiz' });
  if ((await toggle.getAttribute('aria-checked')) !== String(timed)) await toggle.click();
  await expect(toggle).toHaveAttribute('aria-checked', String(timed));
}

/** Answers every question (first option / first move) and returns how many kiai questions came up. */
export async function playToEnd(page: Page, { skipFirst = false } = {}): Promise<number> {
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

/** Opens the quiz menu at 2nd Dan, category Sequences, 30 questions — a pool that contains kiai questions. */
export async function configureSequencesQuiz(page: Page, timed: boolean) {
  await openRoute(page, '#/quiz');
  await page.getByRole('button', { name: '2nd Dan' }).click();
  await page.getByRole('button', { name: 'Sequences' }).click();
  await page.locator('.quiz-menu__range').first().fill('30');
  await setTimed(page, timed);
}

/** Skips questions until a kiai selection question is shown. */
export async function skipToKiaiQuestion(page: Page) {
  while (!(await page.getByText(KIAI_INSTRUCTION).isVisible())) {
    await expect(page.getByRole('heading', { name: 'Quiz Complete!' })).toBeHidden();
    await page.getByRole('button', { name: 'Skip Question' }).click();
  }
}
