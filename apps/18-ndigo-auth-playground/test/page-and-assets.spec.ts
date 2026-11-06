/**
 * The page and its assets: the shell renders the whole mode catalog server-side,
 * the built client bundle is served under `/static/`, and `/health` is the boot
 * probe.
 *
 * `@ndigo/test`'s in-process dispatch carries the real `StaticController`, so the
 * bytes served here are the bytes a browser would get — including the bundle the
 * `test` script builds first.
 */
// @vitest-environment node
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import { MODE_CATALOG } from '../src/mode-catalog';
import { bootMockPlayground, type MockHarness } from './harness';

/** The built client bundle the server serves (`pnpm build:client` produces it). */
const BUNDLE = fileURLToPath(new URL('../dist/client.js', import.meta.url));

describe('the playground page, its bundle and the boot probe', () => {
    let harness: MockHarness;

    beforeAll(async () => {
        if (!existsSync(BUNDLE)) {
            throw new Error(`client bundle missing at ${BUNDLE} — run "pnpm build:client" (the test script does it)`);
        }
        harness = await bootMockPlayground({ oidcEnabled: false });
    });

    afterAll(() => {
        harness.close();
    });

    test('GET / renders the shell with every mode in the catalog', async () => {
        const res = await harness.http.get('/').exec();
        expect(res.response.status).toBe(200);
        expect(String(res.response.headers['content-type'])).toContain('text/html');
        const html = res.text();
        expect(html).toContain('Ndigo Auth Playground');
        for (const mode of MODE_CATALOG) {
            expect(html).toContain(mode.title);
            for (const endpoint of mode.endpoints) {
                expect(html).toContain(endpoint);
            }
        }
        // The interactive half is loaded as a module from the static controller.
        expect(html).toContain('/static/client.js');
    });

    test('GET /static/client.js serves the built bundle as JavaScript', async () => {
        const res = await harness.http.get('/static/client.js').exec();
        expect(res.response.status).toBe(200);
        expect(String(res.response.headers['content-type'])).toMatch(/javascript/);
        const body = res.text();
        expect(body.length).toBeGreaterThan(1_000);
        // Proof it is *this* app's client, not an empty chunk.
        expect(body).toContain('/auth/login');
        expect(body).toContain('/roles/socket');
    });

    test('GET /health answers 200 (the boot-smoke probe)', async () => {
        const res = await harness.http.get('/health').exec();
        expect(res.response.status).toBe(200);
        expect(res.json()).toMatchObject({ status: 'UP' });
    });

    test('an unknown path is a 404 problem document', async () => {
        const res = await harness.http.get('/no-such-thing').exec();
        expect(res.response.status).toBe(404);
        expect(res.json()).toMatchObject({ status: 404, type: 'urn:ndigo:not-found' });
    });
});
