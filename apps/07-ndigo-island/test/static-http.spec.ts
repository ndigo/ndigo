// @vitest-environment node
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { beforeEach, afterEach, describe, test, expect } from 'vitest';
import { configuration, entry } from '@ndigo/context';
import { bootApp, MockHTTP } from '@ndigo/test';
import { StaticController } from '@ndigo/platform-node';

/**
 * Static HTTP semantics e2e (AD-28) through the real dispatcher: the
 * `StaticController` catch-all serves nested paths, conditional GETs return
 * 304, Range returns 206/416, variants compress, and SPA fallback resolves
 * client routes. The island demo serves its built `dist/`; this suite boots a
 * fixture directory instead.
 */

const BODY = 'console.log("island");\n'; // 21 bytes

/** Boots an app whose static controller serves the given fixture dir. */
function bootStatic(dir: string): { mockHTTP: MockHTTP; close: () => void } {
    @configuration
    class StaticFixtureConfiguration {
        @entry()
        staticController() {
            return new StaticController(dir);
        }
    }
    const app = bootApp([StaticFixtureConfiguration]);
    return { mockHTTP: new MockHTTP(app), close: app.close };
}

describe('ndigo-island static HTTP semantics (AD-28)', () => {
    let mockHTTP: MockHTTP;
    let close: () => void;
    let dir: string;

    beforeEach(async () => {
        dir = await mkdtemp(join(tmpdir(), 'ndigo-island-static-'));
        await mkdir(join(dir, 'assets'));
        await writeFile(join(dir, 'app.js'), BODY);
        await writeFile(join(dir, 'app.js.gz'), Buffer.from([0x1f, 0x8b, 0x08, 0x00, 0x0a, 0x0b, 0x0c, 0x0d]));
        await writeFile(join(dir, 'assets', 'deep.txt'), 'nested');
        await writeFile(join(dir, 'index.html'), '<h1>spa</h1>');
        const booted = bootStatic(dir);
        mockHTTP = booted.mockHTTP;
        close = booted.close;
    });

    afterEach(async () => {
        close();
        await rm(dir, { recursive: true, force: true });
    });

    test('the catch-all route serves nested paths (/static/assets/deep.txt)', async () => {
        const res = await mockHTTP.get('/static/assets/deep.txt').exec();
        expect(res.response.status).toBe(200);
        expect(res.text()).toBe('nested');
    });

    test('conditional GET: first 200 with ETag, revalidation → 304', async () => {
        const first = await mockHTTP.get('/static/app.js').exec();
        expect(first.response.status).toBe(200);
        const etag = String(first.response.headers['etag']);
        expect(etag).toMatch(/^"/);

        const again = await mockHTTP.get('/static/app.js').headers({ 'if-none-match': etag }).exec();
        expect(again.response.status).toBe(304);
        expect(again.response.headers['etag']).toBe(etag);
    });

    test('Range: bytes=0-3 → 206 with Content-Range and sliced bytes', async () => {
        const res = await mockHTTP.get('/static/app.js').headers({ range: 'bytes=0-3' }).exec();
        expect(res.response.status).toBe(206);
        expect(res.response.headers['content-range']).toBe(`bytes 0-3/${Buffer.byteLength(BODY)}`);
        expect(res.text()).toBe(BODY.slice(0, 4));
    });

    test('unsatisfiable Range → 416 with Content-Range: bytes */N', async () => {
        const res = await mockHTTP.get('/static/app.js').headers({ range: 'bytes=999-' }).exec();
        expect(res.response.status).toBe(416);
        expect(res.response.headers['content-range']).toBe(`bytes */${Buffer.byteLength(BODY)}`);
    });

    test('Accept-Encoding: gzip serves the precompressed variant', async () => {
        const res = await mockHTTP.get('/static/app.js').headers({ 'accept-encoding': 'gzip' }).exec();
        expect(res.response.status).toBe(200);
        expect(res.response.headers['content-encoding']).toBe('gzip');
        expect(res.response.headers['vary']).toBe('Accept-Encoding');
    });

    test('empty file + any byte range → 416 with Content-Range: bytes */0', async () => {
        await writeFile(join(dir, 'empty.txt'), '');
        const responses = await Promise.all(
            ['bytes=0-0', 'bytes=-4'].map((range) => mockHTTP.get('/static/empty.txt').headers({ range }).exec())
        );
        for (const res of responses) {
            expect(res.response.status).toBe(416);
            expect(res.response.headers['content-range']).toBe('bytes */0');
        }
    });

    test('traversal attempts never serve: encoded → 404, dotfile + raw .. → 403', async () => {
        await writeFile(join(dir, '.env'), 'SECRET=1');
        // Percent-encoded traversal is inert (nothing decodes request paths).
        expect((await mockHTTP.get('/static/%2e%2e/secret.txt').exec()).response.status).toBe(404);
        // Dotfiles sit outside the MIME allowlist.
        expect((await mockHTTP.get('/static/.env').exec()).response.status).toBe(403);
        // Raw `..` is refused by resolver containment.
        expect((await mockHTTP.get('/static/../nope.txt').exec()).response.status).toBe(403);
    });
});
