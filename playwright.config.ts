import { defineConfig, devices } from '@playwright/test';

// Browser tests (e2e/) run against the production build served by `vite preview`, so the
// service worker and offline mode are real. They use the locally installed Google Chrome.
const PORT = 4173;

export default defineConfig({
  testDir: './e2e',
  testMatch: '**/*.spec.ts',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: `http://localhost:${PORT}/`,
    channel: 'chrome',
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'phone', use: { ...devices['Desktop Chrome'], channel: 'chrome', viewport: { width: 390, height: 844 }, hasTouch: true } },
  ],
  webServer: {
    command: `npm run build && npm run preview -- --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}/`,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
