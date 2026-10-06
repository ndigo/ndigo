/**
 * @module blue-boot
 * @since 1.0.0
 * @author Jeff Rose
 *
 * Peer-loading behavior of the TOON lazy decoder (AD-66): the optional
 * `@toon-format/toon` module must never be resolved for JSON-only loads,
 * and a missing/unusable peer must fail with an actionable message. The
 * `@toon-format/toon` module is MOCKED per test in this file — these tests
 * exercise the loader, not the decoder.
 */
import { describe, test, expect, vi } from 'vitest';
import { StandardEnvironment } from '@blue/context';
import { StandardConfigFileLoader } from '../src/config-file-loader';
import type { ConfigFileReader } from '../src/config-file-loader';

describe('TOON peer loading (AD-66)', () => {
    const files =
        (map: Record<string, string | null>): ConfigFileReader =>
        async (path) =>
            map[path] ?? null;

    const envWithProfiles = () => {
        const env = new StandardEnvironment();
        env.activeProfiles = [];
        return env;
    };

    test('JSON-only loads never resolve the optional peer', async () => {
        // A throwing mock makes any accidental resolve observable.
        vi.doMock('@toon-format/toon', () => {
            throw new Error('peer must not be loaded');
        });
        try {
            const env = envWithProfiles();
            const loader = new StandardConfigFileLoader({
                reader: files({ './application.json': '{"a": 1}' }),
            });

            await loader.load(env);

            expect(env.getProperty('a')).toBe(1);
        } finally {
            vi.doUnmock('@toon-format/toon');
        }
    });

    test('a missing peer fails with an actionable install hint', async () => {
        vi.doMock('@toon-format/toon', () => {
            throw new Error('simulated missing module');
        });
        try {
            const env = envWithProfiles();
            const loader = new StandardConfigFileLoader({
                reader: files({ './application.toon': 'a: 1' }),
            });

            await expect(loader.load(env)).rejects.toThrowError(
                /the optional "@toon-format\/toon" dependency is not installed[\s\S]*npm i @toon-format\/toon@4\.1\.1/
            );
        } finally {
            vi.doUnmock('@toon-format/toon');
        }
    });

    test('a peer without decode() reports a version-skew error', async () => {
        // decode exists but is not callable — vitest's own "missing export"
        // diagnostic would mask the loader's shape check otherwise.
        vi.doMock('@toon-format/toon', () => ({ decode: 42 }));
        try {
            const env = envWithProfiles();
            const loader = new StandardConfigFileLoader({
                reader: files({ './application.toon': 'a: 1' }),
            });

            await expect(loader.load(env)).rejects.toThrowError(/does not expose the expected decode\(\)/);
        } finally {
            vi.doUnmock('@toon-format/toon');
        }
    });

    test('a working peer is used through the lazy import', async () => {
        vi.doMock('@toon-format/toon', () => ({ decode: () => ({ peer: true }) }));
        try {
            const env = envWithProfiles();
            const loader = new StandardConfigFileLoader({
                reader: files({ './application.toon': 'a: 1' }),
            });

            await loader.load(env);

            expect(env.getProperty('peer')).toBe(true);
        } finally {
            vi.doUnmock('@toon-format/toon');
        }
    });
});
