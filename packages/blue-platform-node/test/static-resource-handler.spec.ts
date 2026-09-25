/**
 * @module blue-platform-node
 * @since 1.0.0
 * @author Jeff Rose
 */
// @vitest-environment node
import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import { mkdtemp, mkdir, writeFile, rm, chmod, symlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Route } from '@blue/router';
import { StaticResourceHandler } from '../src/static-resource-handler';
import { NODE_REQUEST_ATTRIBUTE, NODE_RESPONSE_ATTRIBUTE, type NodeRequest } from '../src/node-request';

/**
 * HTTP semantics of static serving (D-2/D-4/D-6): conditional GET (304),
 * single-range (206/416), cache headers, precompressed variants, SPA
 * fallback, directory listing, and HEAD.
 */

/** Minimal `ServerResponse`-shaped capture: writeHead/end for the handler. */
function memorySink() {
    const captured: { status: number; headers: Record<string, string | string[]>; body: unknown; completed: boolean } =
        {
            status: 200,
            headers: {},
            body: undefined,
            completed: false,
        };
    const lower = (name: string) => name.toLowerCase();
    const sink = {
        get headersSent() {
            return false;
        },
        setHeader(name: string, value: string | string[]): void {
            captured.headers[lower(name)] = value;
        },
        removeHeader(name: string): void {
            delete captured.headers[lower(name)];
        },
        writeHead(status: number, headers?: Record<string, string | string[]>): void {
            captured.status = status;
            if (headers) {
                for (const [name, value] of Object.entries(headers)) {
                    captured.headers[lower(name)] = value;
                }
            }
        },
        // Streamed payloads (SEC-8) arrive via write(); returns true so the
        // handler never waits for a drain that cannot come.
        write(chunk: string | Uint8Array): boolean {
            const piece = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk as string);
            captured.body = captured.body === undefined ? piece : Buffer.concat([captured.body as Buffer, piece]);
            return true;
        },
        destroy(): void {
            captured.completed = true;
        },
        end(body?: string | unknown): void {
            // A finalization without a body must not clobber chunks already
            // delivered via write() (streamed payloads).
            if (body !== undefined) {
                captured.body = body;
            }
            captured.completed = true;
        },
    };
    return { captured, sink };
}

let root: string;
let outsideDir: string;
const HTML_BODY = '<h1>index</h1>\n';
const JS_GZ = Buffer.from([0x1f, 0x8b, 0x08, 0x00, 0xaa, 0xbb, 0xcc, 0xdd, 0x00, 0x03, 0x73, 0x73, 0x96]);

// Root runs skip the chmod-based no-read proof: root bypasses DAC checks, so
// a 000 file stays readable and the test would not test anything.
const IS_ROOT = typeof process.getuid === 'function' && process.getuid() === 0;

beforeAll(async () => {
    root = await mkdtemp(join(tmpdir(), 'blue-static-handler-'));
    await writeFile(join(root, 'index.html'), HTML_BODY);
    await writeFile(join(root, 'app.js'), 'console.log(1);\n');
    await writeFile(join(root, 'app.js.gz'), JS_GZ);
    await mkdir(join(root, 'assets'));
    await writeFile(join(root, 'assets', 'index.html'), '<h1>assets index</h1>\n');
    await writeFile(join(root, 'assets', 'logo.png'), Buffer.from([0x89, 0x50, 0x4e, 0x47]));
    await mkdir(join(root, 'files'));
    await writeFile(join(root, 'files', 'notes.txt'), 'notes');
    // SEC-8: empty payloads must answer every Range with 416, never a 206.
    await writeFile(join(root, 'empty.txt'), '');
    // TST-3: dotfiles are outside the MIME allowlist.
    await writeFile(join(root, '.env'), 'SECRET=1');
    // TST-3: a symlink pointing outside the root must be refused.
    outsideDir = await mkdtemp(join(tmpdir(), 'blue-static-outside-'));
    await writeFile(join(outsideDir, 'leak.txt'), 'leaked');
    await symlink(join(outsideDir, 'leak.txt'), join(root, 'escape.lnk'));
});

afterAll(async () => {
    await rm(root, { recursive: true, force: true });
    await rm(outsideDir, { recursive: true, force: true });
});

/** Routes an HTTP request at the handler, returning the captured response. */
async function serve(
    path: string,
    options?: ConstructorParameters<typeof StaticResourceHandler>[1],
    method = 'GET',
    headers: Record<string, string> = {}
): Promise<{ status: number; headers: Record<string, string | string[]>; body: unknown }> {
    const { captured, sink } = memorySink();
    const req = { headers, body: {}, cookies: {}, session: {} } as NodeRequest;
    const route = {
        method,
        path,
        attributes: {
            [NODE_REQUEST_ATTRIBUTE]: req,
            [NODE_RESPONSE_ATTRIBUTE]: sink,
        },
        data: {},
        params: {},
        raw: path,
        id: 't',
        length: 0,
    } as unknown as Route;
    await new StaticResourceHandler(root, options).handle(route, path.replace(/^\/+/, ''));
    return { status: captured.status, headers: captured.headers, body: captured.body };
}

describe('StaticResourceHandler — plain + conditional GET (D-2)', () => {
    test('serves 200 with validators and the default Cache-Control', async () => {
        const res = await serve('/app.js');
        expect(res.status).toBe(200);
        expect(res.headers['content-type']).toBe('text/javascript; charset=utf-8');
        expect(res.headers['etag']).toMatch(/^"/);
        expect(res.headers['last-modified']).toBeDefined();
        expect(res.headers['cache-control']).toBe('public, max-age=3600');
        expect(res.headers['accept-ranges']).toBe('bytes');
    });

    test('cacheControl: null omits the header; a custom value is honored', async () => {
        expect((await serve('/app.js', { cacheControl: null })).headers['cache-control']).toBeUndefined();
        expect((await serve('/app.js', { cacheControl: 'public, max-age=60' })).headers['cache-control']).toBe(
            'public, max-age=60'
        );
    });

    test('If-None-Match matching the ETag → 304 echoing the validators, no body', async () => {
        const first = await serve('/app.js');
        const etag = String(first.headers['etag']);

        const res = await serve('/app.js', undefined, 'GET', { 'if-none-match': etag });
        expect(res.status).toBe(304);
        expect(res.body).toBeUndefined();
        expect(res.headers['etag']).toBe(etag);
        expect(res.headers['last-modified']).toBeDefined();
    });

    test('If-None-Match mismatch → 200', async () => {
        const res = await serve('/app.js', undefined, 'GET', { 'if-none-match': '"deadbeef-0"' });
        expect(res.status).toBe(200);
    });

    test('If-None-Match: * → 304; weak W/ prefixes compare equal', async () => {
        expect((await serve('/app.js', undefined, 'GET', { 'if-none-match': '*' })).status).toBe(304);
        const etag = String((await serve('/app.js')).headers['etag']);
        expect((await serve('/app.js', undefined, 'GET', { 'if-none-match': `W/${etag}` })).status).toBe(304);
    });

    test('If-Modified-Since within the same second → 304; older → 200', async () => {
        const lastModified = String((await serve('/app.js')).headers['last-modified']);

        expect((await serve('/app.js', undefined, 'GET', { 'if-modified-since': lastModified })).status).toBe(304);
        const stale = new Date(Date.parse(lastModified) - 60_000).toUTCString();
        expect((await serve('/app.js', undefined, 'GET', { 'if-modified-since': stale })).status).toBe(200);
    });
});

describe('StaticResourceHandler — Range (D-4)', () => {
    const body = 'console.log(1);\n'; // 15 bytes

    test('bytes=0-3 → 206 with Content-Range and sliced bytes', async () => {
        const res = await serve('/app.js', undefined, 'GET', { range: 'bytes=0-3' });
        expect(res.status).toBe(206);
        expect(res.headers['content-range']).toBe(`bytes 0-3/${body.length}`);
        expect(res.headers['content-length']).toBe('4');
        expect((res.body as Buffer).toString('utf-8')).toBe(body.slice(0, 4));
    });

    test('open-ended and suffix ranges resolve', async () => {
        const start = await serve('/app.js', undefined, 'GET', { range: 'bytes=5-' });
        expect(start.status).toBe(206);
        expect(start.headers['content-range']).toBe(`bytes 5-${body.length - 1}/${body.length}`);

        const suffix = await serve('/app.js', undefined, 'GET', { range: 'bytes=-4' });
        expect(suffix.status).toBe(206);
        expect((suffix.body as Buffer).toString('utf-8')).toBe(body.slice(-4));
    });

    test('unsatisfiable range → 416 with Content-Range: bytes */N', async () => {
        const res = await serve('/app.js', undefined, 'GET', { range: 'bytes=999-' });
        expect(res.status).toBe(416);
        expect(res.headers['content-range']).toBe(`bytes */${body.length}`);
    });

    test('multi-range and malformed Range are ignored (plain 200)', async () => {
        const results = await Promise.all(
            ['bytes=0-1,5-6', 'bytes=bananas', 'chunked=0-1'].map((range) =>
                serve('/app.js', undefined, 'GET', { range })
            )
        );
        for (const res of results) {
            expect(res.status).toBe(200);
            expect(res.headers['content-range']).toBeUndefined();
        }
    });

    test('range applies to the precompressed variant bytes', async () => {
        const res = await serve('/app.js', undefined, 'GET', { range: 'bytes=0-1', 'accept-encoding': 'gzip' });
        expect(res.status).toBe(206);
        expect(res.headers['content-encoding']).toBe('gzip');
        expect(res.headers['content-range']).toBe(`bytes 0-1/${JS_GZ.length}`);
    });
});

describe('StaticResourceHandler — variants + Vary (D-3)', () => {
    test('Accept-Encoding: gzip serves the variant with Content-Encoding + Vary', async () => {
        const res = await serve('/app.js', undefined, 'GET', { 'accept-encoding': 'gzip' });
        expect(res.status).toBe(200);
        expect(res.headers['content-encoding']).toBe('gzip');
        expect(res.headers['vary']).toBe('Accept-Encoding');
        expect(res.body).toEqual(JS_GZ);
    });

    test('identity serves the original but still varies (cache correctness)', async () => {
        const res = await serve('/app.js', undefined, 'GET', { 'accept-encoding': 'identity' });
        expect(res.headers['content-encoding']).toBeUndefined();
        expect(res.headers['vary']).toBe('Accept-Encoding');
        expect((res.body as Buffer).toString('utf-8')).toBe('console.log(1);\n');
    });

    test('non-compressible types omit Vary and never encode', async () => {
        const res = await serve('/assets/logo.png', undefined, 'GET', { 'accept-encoding': 'gzip' });
        expect(res.headers['content-encoding']).toBeUndefined();
        expect(res.headers['vary']).toBeUndefined();
    });
});

describe('StaticResourceHandler — directories, listing, SPA (D-6/D-7)', () => {
    test('directory requests serve the index file by default', async () => {
        const res = await serve('/assets/');
        expect(res.status).toBe(200);
        expect(String(res.body)).toBe('<h1>assets index</h1>\n');
    });

    test('listDirectories renders the escaped listing for index-less dirs', async () => {
        const res = await serve('/files', { listDirectories: true });
        expect(res.status).toBe(200);
        expect(String(res.body)).toContain('<a href="notes.txt">notes.txt</a>');
    });

    test('without listDirectories and no index → 404 problem document', async () => {
        const res = await serve('/assets', { indexNames: ['nope.html'] });
        expect(res.status).toBe(404);
        expect(res.headers['content-type']).toBe('application/problem+json');
    });

    test('SPA fallback serves the base index only for HTML-accepting GET', async () => {
        const fallback = (headers: Record<string, string> = {}) =>
            serve('/some/client/route', { spaFallback: true }, 'GET', headers);

        expect((await fallback({ accept: 'text/html' })).status).toBe(200);
        expect((await fallback()).status).toBe(200); // no Accept → HTML assumed
        const nonHtml = await fallback({ accept: 'application/json' });
        expect(nonHtml.status).toBe(404);
        expect(nonHtml.headers['content-type']).toBe('application/problem+json');
    });

    test('SPA fallback never shadows an existing file', async () => {
        const res = await serve('/app.js', { spaFallback: true }, 'GET', { accept: 'text/html' });
        expect(res.status).toBe(200);
        expect(res.headers['content-type']).toBe('text/javascript; charset=utf-8');
    });

    test('spaFallback off keeps 404s', async () => {
        expect((await serve('/some/client/route', {}, 'GET', { accept: 'text/html' })).status).toBe(404);
    });
});

describe('StaticResourceHandler — HEAD + method guard (D-8)', () => {
    test('HEAD returns headers and Content-Length but no body', async () => {
        const res = await serve('/app.js', undefined, 'HEAD');
        expect(res.status).toBe(200);
        expect(res.headers['content-length']).toBe('16'); // 'console.log(1);\n'
        expect(res.body).toBeUndefined();
    });

    test('HEAD honors conditional revalidation (304)', async () => {
        const etag = String((await serve('/app.js')).headers['etag']);
        expect((await serve('/app.js', undefined, 'HEAD', { 'if-none-match': etag })).status).toBe(304);
    });

    test('non-GET/HEAD methods → 405 problem document', async () => {
        const res = await serve('/app.js', undefined, 'POST');
        expect(res.status).toBe(405);
        expect(res.headers['content-type']).toBe('application/problem+json');
    });
});

describe('StaticResourceHandler — streaming + stat-only serving (SEC-8)', () => {
    test('serves the streamed body with a stat-derived Content-Length', async () => {
        const res = await serve('/app.js');
        expect(res.status).toBe(200);
        expect(res.headers['content-length']).toBe('16'); // 'console.log(1);\n'
        expect((res.body as Buffer).toString('utf-8')).toBe('console.log(1);\n');
    });

    test('maxFileSizeBytes rejects oversized files at stat time → 403', async () => {
        expect((await serve('/app.js', { maxFileSizeBytes: 4 })).status).toBe(403);
        expect((await serve('/app.js', { maxFileSizeBytes: 4 })).headers['content-type']).toBe(
            'application/problem+json'
        );
        expect((await serve('/app.js', { maxFileSizeBytes: 100 })).status).toBe(200);
        // The cap also guards the precompressed variant.
        expect((await serve('/app.js', { maxFileSizeBytes: 4 }, 'GET', { 'accept-encoding': 'gzip' })).status).toBe(
            403
        );
    });

    test('empty file serves 200 with Content-Length 0', async () => {
        const res = await serve('/empty.txt');
        expect(res.status).toBe(200);
        expect(res.headers['content-length']).toBe('0');
    });

    test('empty file + any byte range → 416 with Content-Range: bytes */0, never 206', async () => {
        const responses = await Promise.all(
            ['bytes=0-0', 'bytes=0-', 'bytes=-4', 'bytes=999-'].map((range) =>
                serve('/empty.txt', undefined, 'GET', { range })
            )
        );
        for (const res of responses) {
            expect(res.status).toBe(416);
            expect(res.headers['content-range']).toBe('bytes */0');
        }
    });

    test.skipIf(IS_ROOT)('304 and HEAD are answered from stat alone — the file is never opened', async () => {
        const etag = String((await serve('/app.js')).headers['etag']);
        await chmod(join(root, 'app.js'), 0o000);
        try {
            // Old whole-file-buffering behavior read every request: an
            // unreadable file made HEAD/304 fail with 500. Stat-only
            // serving answers both from metadata.
            const head = await serve('/app.js', undefined, 'HEAD');
            expect(head.status).toBe(200);
            expect(head.headers['content-length']).toBe('16');
            expect(head.body).toBeUndefined();

            const revalidated = await serve('/app.js', undefined, 'GET', { 'if-none-match': etag });
            expect(revalidated.status).toBe(304);
            expect(revalidated.body).toBeUndefined();
        } finally {
            await chmod(join(root, 'app.js'), 0o644);
        }
    });
});

describe('StaticResourceHandler — traversal regression matrix (TST-3)', () => {
    test('literal ../ is WHATWG-collapsed by the URL layer → 404; raw containment → 403', async () => {
        // The adapter's `new URL()` eliminates dot segments before routing
        // (node-http-server-adapter #buildUrl); emulate that collapse, then
        // confirm the collapsed path has nothing to serve inside the root.
        const collapsed = new URL('http://local/static/../../etc/passwd').pathname;
        expect((await serve(collapsed)).status).toBe(404);
        // Defense in depth: a raw `..` sequence that ever reached the
        // resolver is rejected outright by path containment.
        expect((await serve('/assets/../../../etc/passwd')).status).toBe(403);
    });

    test('percent-encoded traversal is inert (no decode step) → 404', async () => {
        // `%2e%2e` is a literal directory name; nothing percent-decodes it.
        const res = await serve('/assets/%2e%2e/%2e%2e/secret.txt');
        expect(res.status).toBe(404);
    });

    test('backslash traversal stays literal on POSIX → 404', async () => {
        // `\` is a legal filename character here, never a path separator.
        expect((await serve('/assets\\..\\..\\secret.txt')).status).toBe(404);
    });

    test('NUL byte in the path → 404 (fs rejects, classified not-found)', async () => {
        expect((await serve('/assets/\0secret.txt')).status).toBe(404);
    });

    test('double-encoded traversal (%252e) is a literal filename → 404', async () => {
        expect((await serve('/assets/%252e%252e/secret.txt')).status).toBe(404);
    });

    test('symlink pointing outside the root → 403', async () => {
        const res = await serve('/escape.lnk');
        expect(res.status).toBe(403);
        expect(res.headers['content-type']).toBe('application/problem+json');
    });

    test('dotfile (.env) is outside the MIME allowlist → 403', async () => {
        const res = await serve('/.env');
        expect(res.status).toBe(403);
        expect(res.headers['content-type']).toBe('application/problem+json');
    });
});
