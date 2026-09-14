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
import { StaticResourceResolver, statusForKind } from '../src/static-resource-resolver';

/**
 * Security behavior of the shared static-resource resolver: parent
 * traversal, sibling-prefix, encoded traversal, absolute paths, escaping
 * symlinks, unknown extensions, and byte-for-byte binary round-trip.
 */

let root: string;
let secretDir: string;

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
