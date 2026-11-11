import { defineConfig } from '@playwright/test';
const baseURL = process.env.TEST_BASE_URL ?? 'http://localhost:3000';
export default defineConfig({
  testDir: './tests',
  use: { baseURL, launchOptions: { executablePath: process.env.CHROMIUM_PATH || undefined, args: ['--no-sandbox'] } },
  webServer: process.env.TEST_BASE_URL ? undefined : { command: 'npm run dev', url: baseURL, reuseExistingServer: !process.env.CI },
  workers: 1,
});
