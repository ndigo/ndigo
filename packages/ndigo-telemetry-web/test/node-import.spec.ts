/**
 * PWB-REV-001: `@ndigo/telemetry-web` statically imports `@ndigo/platform-web`
 * (via `RouterInstrumentation`), so it inherited the barrel's import-time
 * `document.cookie` failure. This spec imports the whole barrel outside a DOM
 * to guard the chain.
 *
 * @vitest-environment node
 * @module ndigo-telemetry-web
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, expect, test } from 'vitest';

describe('@ndigo/telemetry-web barrel (non-DOM import)', () => {
    // Cold barrel import on a loaded CI runner can exceed the 5s default
    // (observed 2026-10-30, first fully-run lane — platform-web + telemetry-web).
    test('is importable with no DOM globals', async () => {
        expect(typeof document).toBe('undefined');
        expect(typeof window).toBe('undefined');

        const barrel = await import('../src/index');

        expect(typeof barrel.configureBrowserTelemetry).toBe('function');
        expect(typeof barrel.RouterInstrumentation).toBe('function');
        expect(typeof barrel.WebSocketClientInstrumentation).toBe('function');
    }, 30_000);
});
