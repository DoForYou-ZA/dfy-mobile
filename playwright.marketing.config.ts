import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e/marketing-screenshots',
  fullyParallel: false,
  reporter: 'list',
  timeout: 60_000,
  use: {
    baseURL: 'http://127.0.0.1:8081',
    ...devices['iPhone 13'],
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  outputDir: 'test-results/marketing-screenshots',
  webServer: {
    command: 'npx expo start --web --port 8081 --clear',
    url: 'http://127.0.0.1:8081',
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    env: { CI: '1' },
  },
})
