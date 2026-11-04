/**
 * PWB-REV-001: the `@ndigo/platform-web` barrel must be importable outside a
 * DOM. It previously threw at import time because `locale.ts` eagerly read
 * `document.cookie`; this spec exercises the whole barrel in a Node
 * environment, where `document`/`window`/`navigator` are absent.
 *
 * @vitest-environment node
 * @module ndigo-platform-web
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, expect, test } from 'vitest';

describe('@ndigo/platform-web barrel (non-DOM import)', () => {
    // Cold barrel import on a loaded CI runner can exceed the 5s default
    // (observed 2026-10-30, first fully-run lane — platform-web + telemetry-web).
    test('is importable with no DOM globals', async () => {
        expect(typeof document).toBe('undefined');
        expect(typeof window).toBe('undefined');

        const barrel = await import('../src/index');

        // A representative slice of the barrel resolved (not just didn't throw).
        expect(typeof barrel.Cookies.get).toBe('function');
        expect(typeof barrel.changeLocale).toBe('function');
        expect(typeof barrel.HashRouter).toBe('function');
        expect(typeof barrel.BrowserRouter).toBe('function');
        expect(typeof barrel.RetryOnOfflineInterceptor).toBe('function');
    }, 30_000);

    test('cookie reads outside a DOM return undefined instead of throwing', async () => {
        const { Cookies } = await import('../src/cookies');

        expect(Cookies.get('lang')).toBeUndefined();
        expect(Cookies.getJSON('prefs')).toBeUndefined();
    });

    test('the locale signal defaults outside a DOM without touching cookies', async () => {
        const { currentLocale } = await import('../src/locale');

        expect(currentLocale.value).toBe('en-US');
    });
});
