/**
 * Root-tooling lane for `package-surface.mjs` — the `packages/`
 * publishable-surface rule behind `manifest:check` (AD-86).
 *
 * Runs under `pnpm test:tooling` (`node --test` — no vitest, no nx). The name
 * deliberately escapes vitest's `*.test.*` glob.
 *
 * @since 1.0.0
 * @author Jeff Rose
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { surfaceViolations } from './package-surface.mjs';

void test('a packages/ directory without a manifest violates the surface rule', () => {
    const [violation] = surfaceViolations('ndigo-probe', null);
    assert.match(violation, /no package\.json/);
});

void test('a private package violates the surface rule', () => {
    const violations = surfaceViolations('ndigo-probe', { name: '@ndigo/probe', private: true });
    assert.equal(violations.length, 1);
    assert.match(violations[0], /"private": true/);
});

void test('a regular package passes', () => {
    assert.deepEqual(surfaceViolations('ndigo-probe', { name: '@ndigo/probe' }), []);
});
