/**
 * Unit spec for the `ndigo update` manifest boundary (issue #144): a
 * manifest is a trust boundary whose values flow into `package.json` and
 * then `pnpm install`, so every non-conforming shape — wrong envelope,
 * out-of-scope names, non-string values, and alias/tag/range specs — is
 * rejected as `invalid` with a concrete reason instead of reaching the
 * disk or crashing with a TypeError.
 */
import { describe, test, expect } from 'vitest';
import { mkdtemp, rm, writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { likeVersionManifest, readVersionManifest } from '../src/commands/_version-manifest';

async function withDir(fn: (dir: string) => Promise<void>): Promise<void> {
    const dir = await mkdtemp('ndigo-version-manifest-');
    try {
        await fn(dir);
    } finally {
        await rm(dir, { recursive: true, force: true });
    }
}

async function writeManifest(dir: string, body: string): Promise<string> {
    await writeFile(join(dir, 'manifest.json'), body, 'utf8');
    return join(dir, 'manifest.json');
}

describe('likeVersionManifest (structural/duck-typing check)', () => {
    test('accepts the exact-pin contract', () => {
        expect(likeVersionManifest({ packages: { '@ndigo/core': '1.2.3', '@ndigo/orm': '0.0.1-beta.1' } })).toBe(true);
        expect(likeVersionManifest({ packages: {} })).toBe(true);
    });

    test('rejects every escape hatch out of exact pins', () => {
        // npm alias specs install an arbitrary package under the @ndigo/* name
        // (issue #144, SEC-001): values must be plain pins, nothing else.
        expect(likeVersionManifest({ packages: { '@ndigo/core': 'npm:@evil/companion@^1' } })).toBe(false);
        expect(likeVersionManifest({ packages: { '@ndigo/core': 'github:evil/repo' } })).toBe(false);
        expect(likeVersionManifest({ packages: { '@ndigo/core': 'https://evil.example/x.tgz' } })).toBe(false);
        expect(likeVersionManifest({ packages: { '@ndigo/core': 'file:../evil' } })).toBe(false);
        // Dist-tags are moving targets; ranges make the literal check dishonest.
        expect(likeVersionManifest({ packages: { '@ndigo/core': 'next' } })).toBe(false);
        expect(likeVersionManifest({ packages: { '@ndigo/core': '^1.0.0' } })).toBe(false);
        expect(likeVersionManifest({ packages: { '@ndigo/core': '~1.0.0' } })).toBe(false);
    });

    test('rejects wrong envelopes and out-of-scope names', () => {
        expect(likeVersionManifest(null)).toBe(false);
        expect(likeVersionManifest('manifest')).toBe(false);
        expect(likeVersionManifest([])).toBe(false);
        expect(likeVersionManifest({})).toBe(false); // no `packages`
        expect(likeVersionManifest({ packages: 'nope' })).toBe(false);
        expect(likeVersionManifest({ packages: { evil: '1.0.0' } })).toBe(false);
        expect(likeVersionManifest({ packages: { '@ndigo/upPER': '1.0.0' } })).toBe(false);
        expect(likeVersionManifest({ packages: { '@ndigo/core': 1 } })).toBe(false);
    });
});

describe('readVersionManifest states', () => {
    test('absent file reports missing, broken JSON reports invalid', async () => {
        await withDir(async (dir) => {
            const absent = readVersionManifest(join(dir, 'nope.json'));
            expect(absent).toStrictEqual({ kind: 'absent', path: join(dir, 'nope.json') });

            const path = await writeManifest(dir, '{ not json');
            const invalid = readVersionManifest(path);
            expect(invalid.kind).toBe('invalid');
            expect((invalid as { reason: string }).reason).toContain('not valid JSON');
        });
    });

    test('shape violations name the first offending entry', async () => {
        await withDir(async (dir) => {
            const path = await writeManifest(dir, '{}');
            const lookup = readVersionManifest(path);
            expect(lookup.kind).toBe('invalid');
            expect((lookup as { reason: string }).reason).toContain("'packages' must be an object");

            const named = readVersionManifest(await writeManifest(dir, '{"packages":{"@ndigo/core":"^1.0.0"}}'));
            expect(named.kind).toBe('invalid');
            expect((named as { reason: string }).reason).toContain('not an exact version pin');

            const scoped = readVersionManifest(await writeManifest(dir, '{"packages":{"evil":"1.0.0"}}'));
            expect((scoped as { reason: string }).reason).toContain('not an @ndigo/* package name');
        });
    });

    test('a conforming manifest is returned whole', async () => {
        await withDir(async (dir) => {
            await mkdir(dir, { recursive: true });
            const path = await writeManifest(dir, '{"packages":{"@ndigo/core":"1.2.3","@ndigo/log":"0.0.1"}}');
            const lookup = readVersionManifest(path);
            expect(lookup).toStrictEqual({
                kind: 'valid',
                path,
                manifest: { packages: { '@ndigo/core': '1.2.3', '@ndigo/log': '0.0.1' } },
            });
        });
    });
});
