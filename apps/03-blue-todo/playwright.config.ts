import { defineConfig } from '@playwright/test';

export default defineConfig({
    testDir: './e2e',
    // CI uploads `apps/03-blue-todo/playwright-report`, so the html reporter must
    // actually emit it (TOL-F10); `list` keeps the console transcript.
    reporter: [['list'], ['html', { open: 'never' }]],
    fullyParallel: true,
    retries: 0,
    use: {
        baseURL: 'http://127.0.0.1:4173',
        trace: 'retain-on-failure',
    },
    webServer: {
        command: 'pnpm --filter @blue/todo preview --host 127.0.0.1 --port 4173',
        port: 4173,
        reuseExistingServer: !process.env.CI,
        timeout: 120000,
    },
});
