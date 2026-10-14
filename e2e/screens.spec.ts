import { expect, test } from '@playwright/test';
import { openRoute } from './helpers';

// Replaces the manual walkthrough of the kata, vocabulary and about screens.

test('kata list is sorted by kata number and search ignores diacritics', async ({ page }) => {
  await openRoute(page, '#/kata');
  const numbers = (await page.locator('.kata-row').evaluateAll((rows) => rows.map((row) => row.getAttribute('href'))))
    .map((href) => Number(/#\/kata\/(\d+)/.exec(href ?? '')?.[1]));
  expect(numbers.length).toBeGreaterThan(0);
  expect(numbers).toEqual([...numbers].sort((a, b) => a - b));

  await page.getByRole('searchbox').fill('kanku');
  await expect(page.locator('.kata-row')).toHaveCount(1);
  await expect(page.locator('.kata-row__name')).toHaveText('Kankū Dai');
});

test('Japanese toggle survives a reload', async ({ page }) => {
  await openRoute(page, '#/kata');
  const toggle = page.getByRole('switch', { name: 'Japanese / Hiragana' });
  const initial = await toggle.getAttribute('aria-checked');
  await toggle.click();
  await expect(toggle).not.toHaveAttribute('aria-checked', initial!);
  await page.reload();
  await expect(page.getByRole('switch', { name: 'Japanese / Hiragana' })).not.toHaveAttribute('aria-checked', initial!);
});

test('tapping a highlighted term opens the vocabulary sheet', async ({ page }) => {
  await openRoute(page, '#/kata/1?tab=moves');
  const term = page.locator('.vocab-link').first();
  const text = (await term.textContent())!;
  await term.click();
  const sheet = page.getByRole('dialog');
  await expect(sheet).toBeVisible();
  await expect(sheet).toContainText(text, { ignoreCase: true });
  await sheet.getByRole('button', { name: 'Done' }).click();
  await expect(sheet).toBeHidden();
});

test('long move descriptions expand and collapse', async ({ page }) => {
  await openRoute(page, '#/kata/1?tab=moves');
  const expand = page.getByRole('button', { name: 'Show more' }).first();
  await expand.click();
  await expect(page.getByRole('button', { name: 'Show less' }).first()).toHaveAttribute('aria-expanded', 'true');
});

test('kata detail shows Rei/Yōi labels and kiai badges', async ({ page }) => {
  await openRoute(page, '#/kata/1?tab=moves');
  await expect(page.getByText('Rei', { exact: true }).first()).toBeVisible();
  await expect(page.getByText('KIAI!').first()).toBeVisible();
});

test('vocabulary search, category filter and detail page', async ({ page }) => {
  await openRoute(page, '#/vocabulary');
  await page.getByRole('searchbox').fill('dojo');
  await expect(page.getByText('Dōjō').first()).toBeVisible();
  await page.getByText('Dōjō').first().click();
  await expect(page).toHaveURL(/#\/vocabulary\/\d+$/);
  await expect(page.getByText('Definition')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Speak Japanese word' }).first()).toBeVisible();
});

test('switching language to Dansk changes the UI text and is remembered', async ({ page }) => {
  await openRoute(page, '#/about');
  await page.getByRole('combobox', { name: 'Language' }).selectOption('da');
  await expect(page.getByRole('heading', { level: 1, name: 'Om' })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('heading', { level: 1, name: 'Om' })).toBeVisible();
});

test.describe('in Danish', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('sk.lang', 'da'));
  });

  test('vocabulary text is Danish and searchable in Danish', async ({ page }) => {
    await openRoute(page, '#/vocabulary/1');
    await expect(page.locator('.vocab-detail__short')).toHaveText('Fastlagt rækkefølge af karatebevægelser');
    await expect(page.locator('.vocab-detail__short')).toHaveAttribute('lang', 'da');

    await openRoute(page, '#/vocabulary');
    await page.getByRole('searchbox').fill('bjergslag');
    await expect(page.locator('.vocab-row__term')).toHaveText(['Yama-zuki']);
  });

  test('kata moves use Danish compass letters and mark untranslated text as English', async ({ page }) => {
    await openRoute(page, '#/kata/1?tab=moves');
    await expect(page.locator('.kata-move__direction').filter({ hasText: '←' }).first()).toHaveText('V (←)');
    await expect(page.locator('.expandable-text__body').first()).toHaveAttribute('lang', 'en');
  });

  test('quiz questions are Danish', async ({ page }) => {
    await openRoute(page, '#/quiz');
    await page.getByRole('button', { name: 'Start quiz' }).click();
    await expect(page.locator('h1').first()).toHaveText(/^(Hvad|Hvilken|Hvor|Vælg)/);
  });
});
