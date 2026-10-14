import { expect, type Page } from '@playwright/test';

/** Every main route of the app (quiz play is covered by quiz.spec.ts). */
export const ROUTES = [
  '#/kata',
  '#/kata/1?tab=moves',
  '#/kata/1?tab=overview',
  '#/kata/1?tab=history',
  '#/quiz',
  '#/vocabulary',
  '#/vocabulary/1',
  '#/about',
];

/** Widths from PLAN.md Phase 13 (phones, tablets, desktop). */
export const WIDTHS = [320, 375, 390, 430, 768, 834, 1024, 1366];

/** Same breakpoint as App.css: sidebar from 768px, tab bar below. */
export const SIDEBAR_MIN_WIDTH = 768;

export async function openRoute(page: Page, route: string) {
  await page.goto(`./${route}`);
  await expect(page.locator('h1').first()).toBeVisible();
}

/**
 * Elements that stick out past the right edge of the viewport and are not inside a
 * horizontally scrolling or clipping container. Returns short descriptions for the error message.
 */
export async function elementsOutsideViewport(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const width = document.documentElement.clientWidth;
    const clipped = (element: Element): boolean => {
      for (let parent = element.parentElement; parent && parent !== document.body; parent = parent.parentElement) {
        const overflowX = getComputedStyle(parent).overflowX;
        if (overflowX !== 'visible') return true;
      }
      return false;
    };
    const describe = (element: Element) =>
      `${element.tagName.toLowerCase()}.${[...element.classList].join('.')} "${(element.textContent ?? '').trim().slice(0, 30)}"`;
    const offenders: string[] = [];
    if (document.documentElement.scrollWidth > width) offenders.push(`page scrollWidth ${document.documentElement.scrollWidth} > ${width}`);
    for (const element of document.body.querySelectorAll('*')) {
      const rect = element.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) continue;
      if ((rect.right > width + 1 || rect.left < -1) && !clipped(element)) offenders.push(describe(element));
    }
    return offenders.slice(0, 10);
  });
}

/**
 * Controls that cannot be told apart from what is behind them: same background colour as the
 * nearest opaque ancestor and no visible border. This was the dark-mode bug fixed in Phase 13.
 */
export async function indistinguishable(page: Page, selector: string): Promise<string[]> {
  return page.evaluate((sel) => {
    const transparent = (color: string) => color === 'transparent' || /rgba\(.*,\s*0\)$/.test(color);
    const backgroundBehind = (element: Element): string => {
      for (let parent = element.parentElement; parent; parent = parent.parentElement) {
        const color = getComputedStyle(parent).backgroundColor;
        if (!transparent(color)) return color;
      }
      return getComputedStyle(document.documentElement).backgroundColor;
    };
    const result: string[] = [];
    for (const element of document.querySelectorAll(sel)) {
      const style = getComputedStyle(element);
      const behind = backgroundBehind(element);
      const ownBackground = transparent(style.backgroundColor) ? behind : style.backgroundColor;
      const hasBorder = parseFloat(style.borderTopWidth) > 0 && !transparent(style.borderTopColor) && style.borderTopColor !== behind;
      if (ownBackground === behind && !hasBorder) result.push(`${sel} "${(element.textContent ?? '').trim().slice(0, 30)}" on ${behind}`);
    }
    return result;
  }, selector);
}
