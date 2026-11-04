import { defineConfig } from '@playwright/test';

/**
 * The reference-integration browser lane (WC-E): drives the real `ndigo-island`
 * server — the same process production runs (`pnpm start`, which is
 * `tsx src/index.ts`) — on a dedicated port so it never collides with the
 * default `3200` dev server. `test:e2e` builds the client bundle first; the
 * server serves it under `/static/`.
 *
 * Mirrors `apps/03-ndigo-todo/playwright.config.ts` (reporter, trace, CI reuse).
 */
export default defineConfig({
    testDir: './e2e',
    // CI uploads `apps/06-ndigo-island/playwright-report`, so the html reporter must
    // actually emit it; `list` keeps the console transcript.
    reporter: [['list'], ['html', { open: 'never' }]],
    fullyParallel: true,
    retries: 0,
    use: {
        baseURL: 'http://127.0.0.1:3280',
        trace: 'retain-on-failure',
    },
    webServer: {
        command: 'pnpm start',
        // A dedicated port (never the default 3200) plus the workspace's
        // "verify deps before run" guard disabled, so the lane starts the app
        // directly rather than attempting a lockfile install.
        env: { PORT: '3280', npm_config_verify_deps_before_run: 'false' },
        port: 3280,
        reuseExistingServer: !process.env.CI,
        timeout: 120000,
    },
});
