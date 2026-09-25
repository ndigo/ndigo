/**
 * @module blue-platform-node
 * @since 1.0.0
 * @author Jeff Rose
 */
// @vitest-environment node
import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import { mkdtemp, mkdir, writeFile, symlink, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { StaticResourceResolver, statusForKind, negotiateEncoding } from '../src/static-resource-resolver';

/**
 * Security behavior of the shared static-resource resolver: parent
 * traversal, sibling-prefix, encoded traversal, absolute paths, escaping
 * symlinks, unknown extensions, and byte-for-byte binary round-trip.
 * Wave 2 additions: strong ETag metadata, precompressed variant negotiation
 * (D-3), and directory index/listing modes (D-7).
 */

let root: string;
let secretDir: string;
const JS_BODY = 'console.log("hello");\n';
const JS_GZ = Buffer.from([0x1f, 0x8b, 0x08, 0x00, 0xaa, 0xbb, 0xcc, 0xdd, 0x00, 0x03, 0x73, 0x73, 0x96]);
const JS_BR = Buffer.from([0x28, 0xb5, 0x2f, 0xfd, 0x04, 0x00, 0x00, 0x00, 0x00]);

beforeAll(async () => {
    root = await mkdtemp(join(tmpdir(), 'blue-static-'));
    secretDir = await mkdtemp(join(tmpdir(), 'blue-secret-'));
    await mkdir(join(root, 'assets'));
    await writeFile(join(root, 'assets', 'index.html'), '<h1>hello</h1>');
    await writeFile(join(root, 'assets', 'style.css'), 'body { color: red; }');
    await writeFile(
        join(root, 'pixel.png'),
        Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0xff, 0xfe])
    );
    await writeFile(join(secretDir, 'secret.txt'), 'TOP SECRET');
    // An escaping symlink inside the served tree.
    await symlink(join(secretDir, 'secret.txt'), join(root, 'assets', 'escape.lnk'));
    // A benign symlink that stays inside the base (must still resolve).
    await symlink(join(root, 'assets', 'index.html'), join(root, 'assets', 'alias.html'));
    // Precompressed variant twins (D-3) — real gzip/br magic so encodings are
    // distinguishable, bodies arbitrary (the resolver never decompresses).
    await writeFile(join(root, 'app.js'), JS_BODY);
    await writeFile(join(root, 'app.js.gz'), JS_GZ);
    await writeFile(join(root, 'app.js.br'), JS_BR);
    // Compressed-twin for a non-compressible type — must be ignored.
    await writeFile(join(root, 'pixel.png.gz'), JS_GZ);
    // Directory fixtures for index/listing (D-7).
    await mkdir(join(root, 'docs'));
    await writeFile(join(root, 'docs', 'a.txt'), 'alpha');
    await writeFile(join(root, 'docs', '<b>&"quote".txt'), 'escaped');
});

afterAll(async () => {
    await rm(root, { recursive: true, force: true });
    await rm(secretDir, { recursive: true, force: true });
});

const makeResolver = (): StaticResourceResolver => new StaticResourceResolver(root);

describe('StaticResourceResolver containment', () => {
    test('serves a file inside the base with correct MIME', async () => {
        const result = await makeResolver().resolve('/assets/index.html');
        expect(result.kind).toBe('ok');
        expect(result.data?.toString('utf-8')).toBe('<h1>hello</h1>');
        expect(result.contentType).toBe('text/html; charset=utf-8');
    });

    test('rejects parent traversal (`../`)', async () => {
        const result = await makeResolver().resolve('/assets/../../../etc/passwd');
        expect(['forbidden', 'not-found']).toContain(result.kind);
        expect(result.kind).not.toBe('ok');
    });

    test('rejects sibling-prefix escapes (e.g. a directory named `root-evil`)', async () => {
        // Construct a sibling directory whose name shares the base prefix.
        const sibling = `${root}-evil`;
        await mkdir(sibling, { recursive: true });
        try {
            await writeFile(join(sibling, 'leak.txt'), 'leaked');
            const result = await makeResolver().resolve(`/../${sibling.split('/').pop()}/leak.txt`);
            expect(result.kind).not.toBe('ok');
        } finally {
            await rm(sibling, { recursive: true, force: true });
        }
    });

    test('rejects percent-encoded traversal after decode', async () => {
        const result = await makeResolver().resolve('/assets/%2e%2e/%2e%2e/secret.txt');
        expect(result.kind).not.toBe('ok');
    });

    test('rejects absolute-path injection (never resolves outside the base)', async () => {
        const result = await makeResolver().resolve(join(secretDir, 'secret.txt'));
        expect(result.kind).not.toBe('ok');
        expect(result.data).toBeUndefined();
    });

    test('rejects an escaping symlink', async () => {
        const result = await makeResolver().resolve('/assets/escape.lnk');
        expect(['forbidden', 'not-found']).toContain(result.kind);
        expect(result.kind).not.toBe('ok');
    });

    test('follows a benign symlink that stays inside the base', async () => {
        const result = await makeResolver().resolve('/assets/alias.html');
        expect(result.kind).toBe('ok');
        expect(result.data?.toString('utf-8')).toBe('<h1>hello</h1>');
    });

    test('returns 404-kind for missing files', async () => {
        const result = await makeResolver().resolve('/assets/nope.html');
        expect(result.kind).toBe('not-found');
        expect(statusForKind(result.kind)).toBe(404);
    });

    test('forbidden kind maps to 403', () => {
        expect(statusForKind('forbidden')).toBe(403);
    });
});

describe('StaticResourceResolver binary safety', () => {
    test('round-trips PNG bytes byte-for-byte', async () => {
        const result = await makeResolver().resolve('/pixel.png');
        expect(result.kind).toBe('ok');
        expect(result.contentType).toBe('image/png');
        expect([...(result.data ?? [])]).toEqual([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0xff, 0xfe]);
    });

    test('denies extensions outside the MIME allowlist', async () => {
        await writeFile(join(root, 'run.sh'), '#!/bin/sh\n');
        const result = await makeResolver().resolve('/run.sh');
        expect(result.kind).toBe('forbidden');
    });

    test('denies directory listing attempts', async () => {
        const result = await makeResolver().resolve('/assets');
        expect(result.kind).toBe('not-found');
    });
});

describe('StaticResourceResolver metadata + variants (D-2/D-3)', () => {
    test('serves files with size, mtime and a strong ETag', async () => {
        const result = await makeResolver().resolve('/app.js');
        expect(result.kind).toBe('ok');
        expect(result.size).toBe(Buffer.byteLength(JS_BODY));
        expect(result.mtimeMs).toBeGreaterThan(0);
        expect(result.etag).toMatch(/^"[0-9a-f]+-[0-9a-f]+"$/);
    });

    test('negotiates a .gz variant via Accept-Encoding and marks it encoded', async () => {
        const result = await makeResolver().resolve('/app.js', { acceptEncoding: 'gzip' });
        expect(result.kind).toBe('ok');
        expect(result.encoding).toBe('gzip');
        expect(result.data).toEqual(JS_GZ);
        expect(result.size).toBe(JS_GZ.length);
        expect(result.etag).toMatch(/-gzip"$/);
    });

    test('serves the .br variant and prefers it over gzip on ties', async () => {
        const result = await makeResolver().resolve('/app.js', { acceptEncoding: 'br, gzip' });
        expect(result.encoding).toBe('br');
        expect(result.data).toEqual(JS_BR);
    });

    test('honors q-values: gzip wins when br is excluded', async () => {
        const result = await makeResolver().resolve('/app.js', { acceptEncoding: 'br;q=0, gzip;q=1' });
        expect(result.encoding).toBe('gzip');
    });

    test('no Accept-Encoding serves the original', async () => {
        const result = await makeResolver().resolve('/app.js');
        expect(result.encoding).toBeUndefined();
        expect(result.data?.toString('utf-8')).toBe(JS_BODY);
    });

    test('originals mark compressible types variant-aware (Vary driver)', async () => {
        expect((await makeResolver().resolve('/app.js')).variantAware).toBe(true);
        expect((await makeResolver().resolve('/assets/style.css')).variantAware).toBe(true);
    });

    test('non-compressible types ignore twin files entirely', async () => {
        const result = await makeResolver().resolve('/pixel.png', { acceptEncoding: 'gzip' });
        expect(result.encoding).toBeUndefined();
        expect(result.contentType).toBe('image/png');
    });

    test('missing variant falls back to the original', async () => {
        const result = await makeResolver().resolve('/assets/style.css', { acceptEncoding: 'gzip' });
        expect(result.encoding).toBeUndefined();
        expect(result.data?.toString('utf-8')).toBe('body { color: red; }');
    });

    test('negotiateEncoding parses q-values and identity', () => {
        expect(negotiateEncoding(undefined)).toBeNull();
        expect(negotiateEncoding('gzip')).toBe('gzip');
        expect(negotiateEncoding('br, gzip')).toBe('br');
        expect(negotiateEncoding('gzip;q=1, br;q=0.5')).toBe('gzip');
        expect(negotiateEncoding('gzip;q=0')).toBeNull();
        expect(negotiateEncoding('identity')).toBeNull();
        expect(negotiateEncoding('*')).toBe('br');
    });
});

describe('StaticResourceResolver directory modes (D-7)', () => {
    test('without options a directory stays not-found', async () => {
        expect((await makeResolver().resolve('/docs')).kind).toBe('not-found');
    });

    test('indexNames resolve a directory through its index file', async () => {
        const result = await makeResolver().resolve('/docs', { indexNames: ['index.html', 'a.txt'] });
        expect(result.kind).toBe('ok');
        expect(result.data?.toString('utf-8')).toBe('alpha');
        expect(result.contentType).toBe('text/plain; charset=utf-8');
    });

    test('no matching index and no listing option → not-found', async () => {
        const result = await makeResolver().resolve('/docs', { indexNames: ['index.html'] });
        expect(result.kind).toBe('not-found');
    });

    test('listDirectories renders an escaped, relative-href listing', async () => {
        const result = await makeResolver().resolve('/docs', { listDirectories: true });
        expect(result.kind).toBe('ok');
        const html = result.data?.toString('utf-8') ?? '';
        expect(result.contentType).toBe('text/html; charset=utf-8');
        // Entries link relatively and are HTML-escaped.
        expect(html).toContain('<a href="a.txt">a.txt</a>');
        expect(html).toContain('<a href="&lt;b&gt;&amp;&quot;quote&quot;.txt">');
        expect(html).not.toContain('<b>');
        // Parent link, but only off the root.
        expect(html).toContain('Parent Directory');
    });

    test('root listing has no parent entry', async () => {
        const html = (await makeResolver().resolve('/', { listDirectories: true })).data?.toString('utf-8') ?? '';
        expect(html).toContain('pixel.png');
        expect(html).not.toContain('Parent Directory');
    });

    test('listings carry no validators (generated payloads)', async () => {
        const result = await makeResolver().resolve('/docs', { listDirectories: true });
        expect(result.etag).toBeUndefined();
        expect(result.mtimeMs).toBeUndefined();
    });
});
