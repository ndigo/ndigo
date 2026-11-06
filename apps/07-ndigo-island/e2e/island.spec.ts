import { test, expect } from '@playwright/test';

/**
 * Reference-integration browser lane (WC-E): the real `ndigo-island` server,
 * the built client bundle, and a live Chromium. Covers what jsdom cannot —
 * the FACE submission path (the jsdom shim only fakes form participation) and
 * the CSP behaviour of the adopted library's runtime icon fetch (SEC-C).
 */

/** Console errors a forbidden CSP fetch would raise. */
const cspError = /content security policy|refused to connect|violates the following/i;

test.describe('ndigo-island reference integration', () => {
    test('serves the declarative shadow-root fallback and the widened CSP before hydration', async ({ request }) => {
        const response = await request.get('/');
        expect(response.status()).toBe(200);
        const html = await response.text();

        // First paint is server-rendered into a real declarative shadow root,
        // before any script runs (ADR-69 D-3).
        expect(html).toContain('<template shadowrootmode="open">');
        expect(html).toContain('[first paint] The add-item form');
        expect(html).toContain('Server-rendered island');

        // SEC-C: `data:` is admitted for the Web Awesome clear-icon fetch.
        const csp = response.headers()['content-security-policy'] ?? '';
        expect(csp).toContain("connect-src 'self' data:");
    });

    test('hydrates the shell, posts an item, and receives it back over SSE with no page errors', async ({ page }) => {
        const pageErrors: string[] = [];
        page.on('pageerror', (error) => pageErrors.push(error.message));

        await page.goto('/');

        // Hydration replaced the server fallback in place.
        await expect(page.locator('todo-app p').filter({ hasText: '[hydrated on client]' })).toBeVisible();

        // FACE controls contribute their value to the real form submission.
        await page.locator('todo-app wa-input input').fill('Playwright posted this');
        await page.locator('todo-app wa-button').click();

        // The mutation round-trips: POST /items → store update → SSE push.
        await expect(page.locator('todo-app ul li').filter({ hasText: 'Playwright posted this' })).toBeVisible();

        expect(pageErrors).toEqual([]);
    });

    test('the clear affordance works with no CSP console errors (SEC-C)', async ({ page }) => {
        const consoleErrors: string[] = [];
        page.on('console', (message) => {
            if (message.type() === 'error') {
                consoleErrors.push(message.text());
            }
        });
        const pageErrors: string[] = [];
        page.on('pageerror', (error) => pageErrors.push(error.message));

        await page.goto('/');
        const input = page.locator('todo-app wa-input input');
        await input.fill('typing…');

        // `with-clear` reveals the library's clear button once the field is
        // non-empty; its `data:` icon must load without a CSP violation.
        const clearButton = page.locator('todo-app wa-input [part="clear-button"]');
        await expect(clearButton).toBeVisible();
        await clearButton.click();
        await expect(input).toHaveValue('');

        expect(consoleErrors.filter((text) => cspError.test(text))).toEqual([]);
        expect(pageErrors).toEqual([]);
    });
});
