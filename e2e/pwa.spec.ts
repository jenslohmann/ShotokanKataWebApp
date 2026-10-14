import { expect, test } from '@playwright/test';
import { openRoute } from './helpers';

// Replaces the manual DevTools → Application → Offline check.

test('manifest is linked and complete', async ({ page, request }) => {
  await openRoute(page, '#/kata');
  const href = await page.locator('link[rel="manifest"]').getAttribute('href');
  const manifest = await (await request.get(href!)).json();
  expect(manifest.name).toBe('Shōtōkan Kata');
  expect(manifest.display).toBe('standalone');
  const sizes = manifest.icons.map((icon: { sizes: string }) => icon.sizes);
  expect(sizes).toEqual(expect.arrayContaining(['192x192', '512x512']));
  for (const icon of manifest.icons) expect((await request.get(icon.src)).ok()).toBe(true);
});

test('app works offline after the first visit', async ({ page, context }) => {
  await openRoute(page, '#/kata');
  // Wait until the service worker has installed and controls the page.
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
    if (!navigator.serviceWorker.controller) {
      await new Promise((resolve) => navigator.serviceWorker.addEventListener('controllerchange', resolve, { once: true }));
    }
  });

  await context.setOffline(true);
  await page.reload();
  await expect(page.locator('.kata-row').first()).toBeVisible();

  // Other sections work offline too (data is bundled).
  await page.goto('./#/vocabulary/1');
  await expect(page.getByText('Definition')).toBeVisible();
  await page.goto('./#/quiz');
  await expect(page.getByRole('button', { name: 'Start Quiz' })).toBeVisible();
});
