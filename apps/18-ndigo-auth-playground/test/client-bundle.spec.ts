/**
 * Regression guard for the client half: the bundle the `test` script builds must
 * be valid JavaScript and must be *this* app's client.
 *
 * Vitest transforms TypeScript through esbuild, so a client bundle that ships
 * unparseable output (the Vite 8 / oxc decorator-passthrough failure
 * `06-ndigo-island` guards against) would leave every other test green. Parsing
 * the built file with Node as an ES module closes that hole.
 *
 * @module ndigo-auth-playground
 * @since 1.0.0
 * @author Jeff Rose
 */
// @vitest-environment node
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, test } from 'vitest';

/** The built client bundle (`vite build` output, served under `/static/`). */
const BUNDLE = fileURLToPath(new URL('../dist/client.js', import.meta.url));

describe('the built client bundle', () => {
    test('exists and parses as an ES module', () => {
        expect(existsSync(BUNDLE)).toBe(true);
        const check = spawnSync(process.execPath, ['--check', BUNDLE], { encoding: 'utf-8' });
        expect(check.status, check.stderr).toBe(0);
    });

    test('carries the auth matrix, not a stub', () => {
        const source = readFileSync(BUNDLE, 'utf-8');
        expect(source).toContain('/auth/login');
        expect(source).toContain('/auth/elevate');
        expect(source).toContain('/jwt/refresh');
        expect(source).toContain('/roles/socket');
        expect(source).toContain('/oidc/start');
        // The refresh flow and the close-code proof are wired in the bundle.
        expect(source).toContain('token_expired');
        expect(source).toContain('1008');
    });
});
