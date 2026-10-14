import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { openRoute, ROUTES } from './helpers';
import { configureSequencesQuiz, playToEnd, setTimed, skipToKiaiQuestion } from './quizHelpers';

interface ContrastData {
  fgColor: string;
  bgColor: string;
  contrastRatio: number;
  expectedContrastRatio: string;
}

/** Runs axe (WCAG 2.1 A/AA, incl. colour contrast) and returns one line per failing element. */
async function audit(page: Page): Promise<string[]> {
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
  return results.violations.flatMap((violation) =>
    violation.nodes.map((node) => {
      const contrast = node.any.find((check) => check.id === 'color-contrast')?.data as ContrastData | undefined;
      const detail = contrast
        ? ` (${contrast.fgColor} on ${contrast.bgColor}: ${contrast.contrastRatio}, needs ${contrast.expectedContrastRatio})`
        : '';
      return `${violation.id}: ${node.target.join(' ')}${detail}`;
    }),
  );
}

async function startDefaultQuiz(page: Page) {
  await openRoute(page, '#/quiz');
  await setTimed(page, true);
  await page.getByRole('button', { name: 'Start Quiz' }).click();
}

/** Screens that are only reachable by interaction (quiz states, sheets, dialogs). */
const STATES: { name: string; reach(page: Page): Promise<void> }[] = [
  {
    name: 'kata filter sheet',
    reach: async (page) => {
      await openRoute(page, '#/kata');
      await page.getByRole('button', { name: 'More' }).click();
      await expect(page.getByRole('dialog', { name: 'Filters' })).toBeVisible();
      await page.getByRole('dialog').getByRole('button', { name: /Black Belt/ }).click();
    },
  },
  {
    name: 'vocabulary sheet',
    reach: async (page) => {
      await openRoute(page, '#/kata/1?tab=moves');
      await page.locator('.vocab-link').first().click();
      await expect(page.getByRole('dialog')).toBeVisible();
    },
  },
  {
    name: 'quiz question (selected, timed)',
    reach: async (page) => {
      await startDefaultQuiz(page);
      await page.locator('.answer-option').first().click();
    },
  },
  {
    name: 'quiz answer revealed',
    reach: async (page) => {
      await startDefaultQuiz(page);
      await page.locator('.answer-option').first().click();
      await page.getByRole('button', { name: 'Submit Answer' }).click();
      await expect(page.locator('.answer-option--correct')).toBeVisible();
    },
  },
  {
    name: 'quiz kiai question revealed',
    reach: async (page) => {
      await configureSequencesQuiz(page, false);
      await page.getByRole('button', { name: 'Start Quiz' }).click();
      await skipToKiaiQuestion(page);
      await page.locator('.kiai-move').first().click();
      await page.getByRole('button', { name: 'Submit Answer' }).click();
      await expect(page.getByText(/^(Correct!|Incorrect)$/)).toBeVisible();
    },
  },
  {
    name: 'quiz paused',
    reach: async (page) => {
      await startDefaultQuiz(page);
      await page.getByRole('button', { name: 'Pause' }).click();
      await expect(page.getByRole('heading', { name: 'Quiz Paused' })).toBeVisible();
    },
  },
  {
    name: 'quiz exit dialog',
    reach: async (page) => {
      await startDefaultQuiz(page);
      await page.getByRole('button', { name: 'Exit' }).click();
      await expect(page.getByRole('dialog', { name: 'Exit Quiz?' })).toBeVisible();
    },
  },
  {
    name: 'quiz results (with skipped, category)',
    reach: async (page) => {
      await configureSequencesQuiz(page, false);
      await page.getByRole('button', { name: 'Start Quiz' }).click();
      await playToEnd(page, { skipFirst: true });
    },
  },
];

// Accessibility audit of every screen and state in light and dark mode.
for (const colorScheme of ['light', 'dark'] as const) {
  test.describe(`${colorScheme} mode`, () => {
    test.use({ colorScheme });

    for (const route of ROUTES) {
      test(`axe: ${route}`, async ({ page }) => {
        await openRoute(page, route);
        expect(await audit(page)).toEqual([]);
      });
    }

    for (const state of STATES) {
      test(`axe: ${state.name}`, async ({ page }) => {
        await state.reach(page);
        expect(await audit(page)).toEqual([]);
      });
    }
  });
}
