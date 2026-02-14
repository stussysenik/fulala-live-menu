import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    // Mobile-first: test on mobile viewports
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
      testIgnore: ['**/admin.spec.ts', '**/tv-portrait.spec.ts'],
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
      testIgnore: ['**/admin.spec.ts', '**/tv-portrait.spec.ts'],
    },

    // Tablet
    {
      name: 'Tablet',
      use: { ...devices['iPad (gen 7)'] },
      testIgnore: ['**/admin.spec.ts', '**/tv-portrait.spec.ts'],
    },

    // Desktop
    {
      name: 'Desktop Chrome',
      use: { ...devices['Desktop Chrome'] },
      testIgnore: ['**/admin.spec.ts', '**/tv-portrait.spec.ts'],
    },

    // TV (vertical 1080x1920, DPR 2 matches LG 43UR78003LK 4K panel)
    {
      name: 'TV Vertical',
      use: {
        viewport: { width: 1080, height: 1920 },
        deviceScaleFactor: 2,
      },
      testIgnore: ['**/admin.spec.ts', '**/tv-portrait.spec.ts'],
    },

    // TV Portrait (real TV output: 1920x1080 CSS, DPR 2, CSS rotation creates portrait)
    {
      name: 'TV Portrait',
      use: {
        viewport: { width: 1920, height: 1080 },
        deviceScaleFactor: 2,
      },
      testMatch: '**/tv-portrait.spec.ts',
    },

    // Admin panel (Desktop only — admin sets its own viewport via test.use)
    {
      name: 'Admin',
      use: { ...devices['Desktop Chrome'] },
      testMatch: '**/admin.spec.ts',
    },
  ],

  webServer: {
    command: 'bun run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
