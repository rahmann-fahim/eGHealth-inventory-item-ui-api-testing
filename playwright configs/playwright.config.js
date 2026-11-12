
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',

  // Run tests sequentially
  fullyParallel: false,
  workers: 1,

  // Do not retry failed tests locally
  retries: 0,

  // HTML report
  reporter: 'html',

  // Shared browser settings
  use: {
    baseURL: 'http://192.168.10.99',
    headless: false,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  // Run only on Google Chrome
  projects: [
    {
      name: 'Chrome',
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome',
      },
    },
  ],
});
