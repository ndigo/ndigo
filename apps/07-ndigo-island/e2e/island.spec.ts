import { test, expect } from '@playwright/test';

/**
 * Reference-integration browser lane (WC-E): the real `ndigo-island` server,
 * the built client bundle, and a live Chromium. Covers what jsdom cannot —
 * the native form submission path and the rendered island.
 */

test.describe('ndigo-island reference integration', () => {
    test('serves the declarative shadow-root fallback and the default CSP before hydration', async ({ request }) => {
        const response = await request.get('/');
        expect(response.status()).toBe(200);
        const html = await response.text();

        // First paint is server-rendered into a real declarative shadow root,
        // before any script runs (ADR-69 D-3).
        expect(html).toContain('<template shadowrootmode="open">');
        expect(html).toContain('[first paint] The add-item form');
        expect(html).toContain('Server-rendered island');

        // The default CSP is enough now that no library icon fetch runs.
        const csp = response.headers()['content-security-policy'] ?? '';
        expect(csp).toContain("connect-src 'self'");
        expect(csp).not.toMatch(/connect-src[^;]*data:/);
    });

    test('hydrates the shell, posts an item, and receives it back over SSE with no page errors', async ({ page }) => {
        const pageErrors: string[] = [];
        page.on('pageerror', (error) => pageErrors.push(error.message));

        await page.goto('/');

        // Hydration replaced the server fallback in place.
        await expect(page.locator('todo-app p').filter({ hasText: '[hydrated on client]' })).toBeVisible();

        // Native controls contribute their value to the real form submission.
        await page.locator('todo-app input.nd-input').fill('Playwright posted this');
        await page.locator('todo-app button.nd-button').click();

        // The mutation round-trips: POST /items → store update → SSE push.
        await expect(page.locator('todo-app ul li').filter({ hasText: 'Playwright posted this' })).toBeVisible();

        expect(pageErrors).toEqual([]);
    });
});
