import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { openRoute, ROUTES } from './helpers';

// Automated accessibility audit of every screen in light and dark mode.
// Colour contrast is not checked yet: the iOS system colours copied by the plan (secondary text,
// some badges) fall below WCAG AA. See PROGRESS.md "Open questions".
for (const colorScheme of ['light', 'dark'] as const) {
  test.describe(`${colorScheme} mode`, () => {
    test.use({ colorScheme });

    for (const route of ROUTES) {
      test(`axe: ${route}`, async ({ page }) => {
        await openRoute(page, route);
        const results = await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
          .disableRules(['color-contrast'])
          .analyze();
        const violations = results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).slice(0, 5).join(', ')}`);
        expect(violations).toEqual([]);
      });
    }
  });
}
