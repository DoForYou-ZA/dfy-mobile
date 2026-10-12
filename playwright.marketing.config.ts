import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e/marketing-screenshots',
  fullyParallel: false,
  reporter: 'list',
  timeout: 60_000,
  use: {
    baseURL: 'http://127.0.0.1:8081',
    ...devices['iPhone 13'],
    // The iPhone preset defaults to WebKit, but CI installs Chromium only.
    // Keep the iPhone viewport/touch emulation while using the installed browser.
    browserName: 'chromium',
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    screenshot: 'only-on-failure',
    trace: 'off',
  },
  outputDir: 'test-results/marketing-screenshots',
  webServer: {
    // The local proxy serves Expo and forwards only /api/v1 to the fixed staging API.
    // This keeps browser API calls same-origin, avoiding staging CORS restrictions.
    command: 'node scripts/marketing-proxy.mjs',
    url: 'http://127.0.0.1:8081/',
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    env: { CI: '1' },
  },
})
