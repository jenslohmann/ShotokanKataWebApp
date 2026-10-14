import { expect, test } from '@playwright/test';
import { elementsOutsideViewport, indistinguishable, openRoute, ROUTES, SIDEBAR_MIN_WIDTH, WIDTHS } from './helpers';

// Replaces the manual "look at every screen at 320–1366 px in light and dark" check.
for (const colorScheme of ['light', 'dark'] as const) {
  test.describe(`${colorScheme} mode`, () => {
    test.use({ colorScheme });

    for (const width of WIDTHS) {
      test(`${width}px: no horizontal overflow, correct navigation`, async ({ page }) => {
        await page.setViewportSize({ width, height: 800 });
        for (const route of ROUTES) {
          await openRoute(page, route);
          expect(await elementsOutsideViewport(page), `${route} at ${width}px`).toEqual([]);
        }
        const wide = width >= SIDEBAR_MIN_WIDTH;
        await expect(page.locator('.sidebar')).toBeVisible({ visible: wide });
        await expect(page.locator('.tab-bar')).toBeVisible({ visible: !wide });
      });
    }

    test('phone landscape: no horizontal overflow', async ({ page }) => {
      await page.setViewportSize({ width: 844, height: 390 });
      for (const route of ROUTES) {
        await openRoute(page, route);
        expect(await elementsOutsideViewport(page), route).toEqual([]);
      }
    });

    test('quiz buttons stand out from their card', async ({ page }) => {
      await openRoute(page, '#/quiz');
      for (const selector of ['.quiz-menu__rank', '.quiz-menu__difficulty', '.quiz-menu__category']) {
        expect(await indistinguishable(page, selector)).toEqual([]);
      }
      await page.getByRole('button', { name: 'Start Quiz' }).click();
      await expect(page.locator('.answer-option').first()).toBeVisible();
      expect(await indistinguishable(page, '.answer-option')).toEqual([]);
    });

    test('selected segment differs from the segmented control track', async ({ page }) => {
      await openRoute(page, '#/kata/1?tab=moves');
      const colors = await page.evaluate(() => {
        const selected = document.querySelector('[role="tab"][aria-selected="true"]')!;
        return [getComputedStyle(selected).backgroundColor, getComputedStyle(selected.parentElement!).backgroundColor];
      });
      expect(colors[0]).not.toBe(colors[1]);
    });
  });
}
