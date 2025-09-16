import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',

  webServer: {
    command: 'bun run build && bun run preview --port 5173',
    port: 5173,
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
    env: {
      NODE_ENV: 'production',
    },
  },

  use: {
    baseURL: 'http://localhost:5173',
    serviceWorkers: 'block',
    trace: 'on-first-retry',
  },
});
