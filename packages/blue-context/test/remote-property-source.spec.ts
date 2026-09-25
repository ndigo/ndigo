/**
 * RemotePropertySource specs (AD-29 Wave 3, D-6..D-8): fetch-once, ETag /
 * body-text change gating, `optional` failure semantics, precedence-slot
 * anchoring, polling lifecycle (start/stop via the scheduler seam), and the
 * refresh-event loop.
 * @module blue-context
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { CONFIG_SERVER_SOURCE_NAME, RemotePropertySource } from '../src/remote-property-source';
import { CONFIG_REFRESH_EVENT, StandardEnvironment } from '../src/environment';

/** Builds a content-addressable fake fetch without global state. */
type fakeFetch = (
    url: string,
    init?: { headers?: Record<string, string> }
) => Promise<{
    ok: boolean;
    status: number;
    headers: { get(name: string): string | null };
    text(): Promise<string>;
}>;

const response = (status: number, body: string, etag: string | null = null) => ({
    ok: status >= 200 && status < 300,
    status,
    headers: {
        get: (name: string) => (name.toLowerCase() === 'etag' ? etag : null),
    },
    text: async () => body,
});

describe('RemotePropertySource (AD-29 D-6..D-8)', () => {
    let env: StandardEnvironment;
    let fetchImpl: ReturnType<typeof vi.fn<fakeFetch>>;

    beforeEach(() => {
        env = new StandardEnvironment();
        // The resolver index copies raw values at build; refresh() rebuilds.
        fetchImpl = vi.fn<fakeFetch>();
    });

    afterEach(() => {
        env = undefined as unknown as StandardEnvironment;
    });

    test('load() fetches and registers the source at the documented slot', async () => {
        fetchImpl.mockResolvedValue(response(200, '{"server":{"port":"8080"}}'));
        const source = new RemotePropertySource(env, {
            url: 'https://cfg.example/app.json',
            fetch: fetchImpl,
        });

        expect(await source.load()).toBe(true);
        expect(env.getProperty('server.port')).toBe('8080');

        const sources = env.getPropertySources();
        expect(sources.contains(CONFIG_SERVER_SOURCE_NAME)).toBe(true);
        // Anchored after systemEnvironment when present, else before application.
        expect(sources.toArray().map((s) => s.name)).toEqual([CONFIG_SERVER_SOURCE_NAME]);
    });

    test('anchors after systemEnvironment for Node-like environments', async () => {
        env.getPropertySources().addLast('systemEnvironment', {});
        env.getPropertySources().addLast('application', { app: 1 });
        fetchImpl.mockResolvedValue(response(200, '{"a":"b"}'));
        const source = new RemotePropertySource(env, {
            url: 'https://cfg.example/app.json',
            fetch: fetchImpl,
        });

        await source.load();

        const names = env
            .getPropertySources()
            .toArray()
            .map((s) => s.name);
        expect(names).toEqual(['systemEnvironment', CONFIG_SERVER_SOURCE_NAME, 'application']);
    });

    test('anchors before application when systemEnvironment is absent', async () => {
        env.getPropertySources().addLast('application', { app: 1 });
        env.getPropertySources().addLast('defaults', { d: 1 });
        fetchImpl.mockResolvedValue(response(200, '{"a":"b"}'));
        const source = new RemotePropertySource(env, {
            url: 'https://cfg.example/app.json',
            fetch: fetchImpl,
        });

        await source.load();

        const names = env
            .getPropertySources()
            .toArray()
            .map((s) => s.name);
        expect(names).toEqual([CONFIG_SERVER_SOURCE_NAME, 'application', 'defaults']);
    });

    test('re-fetch replaces the source IN PLACE (position preserved, version bumped)', async () => {
        fetchImpl.mockResolvedValue(response(200, '{"a":"1"}', 'etag-1'));
        const source = new RemotePropertySource(env, {
            url: 'https://cfg.example/app.json',
            fetch: fetchImpl,
        });
        await source.load();
        expect(env.getProperty('a')).toBe('1');
        const before = env
            .getPropertySources()
            .toArray()
            .map((s) => s.name);

        fetchImpl.mockReset();
        fetchImpl.mockResolvedValue(response(200, '{"a":"3"}', 'etag-2'));
        const changed = await source.load();
        expect(changed).toBe(true);
        expect(
            env
                .getPropertySources()
                .toArray()
                .map((s) => s.name)
        ).toEqual(before); // position kept
        expect(env.getProperty('a')).toBe('3');
    });

    test('304 (ETag match) triggers no re-merge and no refresh event', async () => {
        fetchImpl.mockResolvedValue(response(200, '{"a":"1"}', 'etag-1'));
        const source = new RemotePropertySource(env, {
            url: 'https://cfg.example/app.json',
            fetch: fetchImpl,
        });
        await source.load();
        expect(env.getProperty('a')).toBe('1');

        // Next poll: server says 304 via If-None-Match.
        fetchImpl.mockReset();
        fetchImpl.mockResolvedValue(response(304, '', 'etag-1'));
        // Observability: a refresh event fires only on real change.
        const refreshSpy = vi.fn();
        env.on(CONFIG_REFRESH_EVENT, refreshSpy);

        const changed = await source.load();
        expect(changed).toBe(false); // skipped — no re-merge
        expect(refreshSpy).not.toHaveBeenCalled();
        expect(env.getProperty('a')).toBe('1');
    });

    test('unchanged body (no ETag) triggers no re-merge and no refresh event', async () => {
        fetchImpl.mockResolvedValue(response(200, '{"a":"1"}'));
        const source = new RemotePropertySource(env, {
            url: 'https://cfg.example/app.json',
            fetch: fetchImpl,
        });
        await source.load();
        const refreshSpy = vi.fn();
        env.on(CONFIG_REFRESH_EVENT, refreshSpy);
        fetchImpl.mockResolvedValue(response(200, '{"a":"1"}')); // same body again

        const changed = await source.load();
        expect(changed).toBe(false); // skipped — unchanged body
        expect(refreshSpy).not.toHaveBeenCalled();
    });

    test('changed body (no ETag) re-merges and fires config:refresh', async () => {
        fetchImpl.mockResolvedValueOnce(response(200, '{"a":"1"}'));
        fetchImpl.mockResolvedValueOnce(response(200, '{"a":"2"}'));
        const source = new RemotePropertySource(env, {
            url: 'https://cfg.example/app.json',
            fetch: fetchImpl,
        });
        await source.load();

        const refreshSpy = vi.fn();
        env.on(CONFIG_REFRESH_EVENT, refreshSpy);

        const applied = await source.load();
        expect(applied).not.toBeNull();
        expect(env.getProperty('a')).toBe('2');
        expect(refreshSpy).toHaveBeenCalledTimes(1);
    });

    test('optional:true fetch failure at load skips (boot proceeds)', async () => {
        fetchImpl.mockResolvedValue(response(500, 'boom'));
        const source = new RemotePropertySource(env, {
            url: 'https://cfg.example/app.json',
            optional: true,
            fetch: fetchImpl,
        });

        expect(await source.load()).toBe(false);
        expect(env.getPropertySources().contains(CONFIG_SERVER_SOURCE_NAME)).toBe(false);
    });

    test('optional:false fetch failure at load throws naming the URL', async () => {
        fetchImpl.mockResolvedValue(response(503, 'down'));
        const source = new RemotePropertySource(env, {
            url: 'https://cfg.example/app.json',
            optional: false,
            fetch: fetchImpl,
        });

        const err = await source.load().then(
            () => null,
            (e: { message?: string }) => e
        );
        expect(err?.message).toMatch(/https:\/\/cfg.example\/app\.json/);
    });

    test('non-object JSON responses are rejected loudly when optional:false', async () => {
        fetchImpl.mockResolvedValue(response(200, '[1,2,3]'));
        const source = new RemotePropertySource(env, {
            url: 'https://cfg.example/app.json',
            optional: false,
            fetch: fetchImpl,
        });
        const err = await source.load().then(
            () => null,
            (e: { message?: string }) => e
        );
        expect(err?.message).toMatch(/must be a JSON object/);
        expect(err?.message).toMatch(/https:\/\/cfg\.example\/app\.json/);
    });

    test('malformed JSON is rejected loudly when optional:false', async () => {
        fetchImpl.mockResolvedValue(response(200, '{nope'));
        const source = new RemotePropertySource(env, {
            url: 'https://cfg.example/app.json',
            optional: false,
            fetch: fetchImpl,
        });
        const err = await source.load().then(
            () => null,
            (e: { message?: string }) => e
        );
        expect(err?.message).toMatch(/not valid JSON/);
        expect(err?.message).toMatch(/https:\/\/cfg\.example\/app\.json/);
    });

    test('malformed JSON at load with optional:true warns and skips (SEC-3 parse policy)', async () => {
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        try {
            fetchImpl.mockResolvedValue(response(200, '{nope'));
            const source = new RemotePropertySource(env, {
                url: 'https://cfg.example/app.json',
                optional: true,
                fetch: fetchImpl,
            });

            expect(await source.load()).toBe(false);
            expect(env.getPropertySources().contains(CONFIG_SERVER_SOURCE_NAME)).toBe(false);
            expect(warnSpy).toHaveBeenCalled();
        } finally {
            warnSpy.mockRestore();
        }
    });

    test('configured headers are sent on every request', async () => {
        fetchImpl.mockResolvedValue(response(200, '{"a":"1"}'));
        const source = new RemotePropertySource(env, {
            url: 'https://cfg.example/app.json',
            headers: { Authorization: 'Bearer tok' },
            fetch: fetchImpl,
        });
        await source.load();

        const [, init] = fetchImpl.mock.calls[0];
        expect((init as { headers?: Record<string, string> }).headers).toEqual({
            Authorization: 'Bearer tok',
        });
    });

    test('start()/stop() drive polling through the scheduler seam; stop cancels', async () => {
        vi.useFakeTimers();
        try {
            const scheduled: Array<{ callback: () => void; ms: number }> = [];
            const scheduler = {
                setInterval: vi.fn((callback: () => void, ms: number) => {
                    scheduled.push({ callback, ms });
                    return scheduled.length - 1;
                }),
                clearInterval: vi.fn(),
            };
            fetchImpl.mockResolvedValue(response(200, '{"a":"1"}'));
            const source = new RemotePropertySource(env, {
                url: 'https://cfg.example/app.json',
                pollMs: 5000,
                fetch: fetchImpl,
                scheduler,
            });
            await source.load();

            expect(source.started).toBe(false);
            source.start();
            expect(source.started).toBe(true);
            expect(scheduler.setInterval).toHaveBeenCalledWith(expect.any(Function), 5000);

            // Fire one poll: ETag-less unchanged body → no re-merge.
            fetchImpl.mockResolvedValue(response(200, '{"a":"1"}'));
            scheduled[0].callback();
            await vi.advanceTimersByTimeAsync(0);
            expect(env.getProperty('a')).toBe('1');

            // stop cancels the interval.
            source.stop();
            expect(scheduler.clearInterval).toHaveBeenCalledWith(0);
            expect(source.started).toBe(false);
        } finally {
            vi.useRealTimers();
        }
    });

    test('start() is a no-op when already started; throws without pollMs', async () => {
        fetchImpl.mockResolvedValue(response(200, '{"a":"1"}'));
        const source = new RemotePropertySource(env, {
            url: 'https://cfg.example/app.json',
            fetch: fetchImpl,
        });
        await source.load();

        expect(() => source.start()).toThrow(/no pollMs/);
        expect(source.started).toBe(false);
    });

    test('refresh() propagates remote changes to the resolved chain', async () => {
        env = new StandardEnvironment([], { index: 'flat' });
        env.getPropertySources().addLast('application', { server: { port: '1' } });
        fetchImpl.mockResolvedValue(response(200, '{"server":{"port":"8080"}}'));
        const source = new RemotePropertySource(env, {
            url: 'https://cfg.example/app.json',
            fetch: fetchImpl,
        });

        await source.load();
        expect(env.getProperty('server.port')).toBe('8080'); // configServer beats application
        expect(env.originOf('server')).toBe(CONFIG_SERVER_SOURCE_NAME);
    });

    describe('post-boot keep-last-good policy (SEC-2/SEC-3/SEC-12)', () => {
        test('poll HTTP failure keeps last-good: values unchanged, no refresh event, ETag consistent', async () => {
            vi.useFakeTimers();
            try {
                const scheduled: Array<{ callback: () => void; ms: number }> = [];
                const scheduler = {
                    setInterval: vi.fn((callback: () => void, ms: number) => {
                        scheduled.push({ callback, ms });
                        return scheduled.length - 1;
                    }),
                    clearInterval: vi.fn(),
                };
                fetchImpl.mockResolvedValue(response(200, '{"a":"1"}', 'etag-1'));
                const source = new RemotePropertySource(env, {
                    url: 'https://cfg.example/app.json',
                    pollMs: 5000,
                    fetch: fetchImpl,
                    scheduler,
                });
                await source.load();
                expect(env.getProperty('a')).toBe('1');
                source.start();

                // Next poll: server is down (500) — keep-last-good.
                fetchImpl.mockResolvedValue(response(500, 'boom'));
                const refreshSpy = vi.fn();
                env.on(CONFIG_REFRESH_EVENT, refreshSpy);
                const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
                try {
                    scheduled[0].callback();
                    await vi.advanceTimersByTimeAsync(0);

                    expect(env.getProperty('a')).toBe('1'); // last-good preserved
                    expect(refreshSpy).not.toHaveBeenCalled(); // no stale re-merge, no event
                    expect(warnSpy.mock.calls.length).toBeGreaterThan(0); // SEC-12 warn on keep-last-good
                } finally {
                    warnSpy.mockRestore();
                }

                // ETag/body stay consistent: the next request still sends the
                // last applied ETag, and an unchanged 200 body re-merges
                // nothing (body gate) until the server publishes a change.
                const [, init1] = fetchImpl.mock.calls[1];
                expect((init1 as { headers?: Record<string, string> }).headers).toEqual({
                    'If-None-Match': 'etag-1',
                });

                // Server recovers with a NEW document → values update.
                fetchImpl.mockResolvedValue(response(200, '{"a":"2"}', 'etag-2'));
                scheduled[0].callback();
                await vi.advanceTimersByTimeAsync(0);
                expect(env.getProperty('a')).toBe('2');
                expect(refreshSpy).toHaveBeenCalledTimes(1);
                source.stop();
            } finally {
                vi.useRealTimers();
            }
        });

        test('poll fetch rejection: no unhandled rejection, values kept, warn emitted', async () => {
            vi.useFakeTimers();
            try {
                const scheduled: Array<{ callback: () => void; ms: number }> = [];
                const scheduler = {
                    setInterval: vi.fn((callback: () => void, ms: number) => {
                        scheduled.push({ callback, ms });
                        return scheduled.length - 1;
                    }),
                    clearInterval: vi.fn(),
                };
                fetchImpl.mockResolvedValue(response(200, '{"a":"1"}'));
                const source = new RemotePropertySource(env, {
                    url: 'https://cfg.example/app.json',
                    pollMs: 5000,
                    fetch: fetchImpl,
                    scheduler,
                });
                await source.load();
                source.start();

                const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
                const refreshSpy = vi.fn();
                env.on(CONFIG_REFRESH_EVENT, refreshSpy);
                fetchImpl.mockRejectedValue(new Error('fetch failed: ECONNREFUSED'));
                try {
                    scheduled[0].callback(); // must NOT throw / reject unhandled
                    await vi.advanceTimersByTimeAsync(0);

                    expect(env.getProperty('a')).toBe('1'); // last-good preserved
                    expect(refreshSpy).not.toHaveBeenCalled();
                    expect(warnSpy).toHaveBeenCalled(); // SEC-12 observability
                } finally {
                    warnSpy.mockRestore();
                }
                source.stop();
            } finally {
                vi.useRealTimers();
            }
        });

        test('optional:true + fetch rejects at load → load resolves with warn (boot proceeds)', async () => {
            const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
            try {
                fetchImpl.mockRejectedValue(new Error('fetch failed: ECONNREFUSED'));
                const source = new RemotePropertySource(env, {
                    url: 'https://cfg.example/app.json',
                    optional: true,
                    fetch: fetchImpl,
                });

                expect(await source.load()).toBe(false);
                expect(env.getPropertySources().contains(CONFIG_SERVER_SOURCE_NAME)).toBe(false);
                expect(warnSpy).toHaveBeenCalled(); // warn-level skip
            } finally {
                warnSpy.mockRestore();
            }
        });

        test('optional:false + fetch rejects at load → load throws naming the URL', async () => {
            fetchImpl.mockRejectedValue(new Error('fetch failed: ECONNREFUSED'));
            const source = new RemotePropertySource(env, {
                url: 'https://cfg.example/app.json',
                optional: false,
                fetch: fetchImpl,
            });

            const err = await source.load().then(
                () => null,
                (e: { message?: string }) => e
            );
            expect(err?.message).toMatch(/https:\/\/cfg\.example\/app\.json/);
        });
    });

    describe('https scheme enforcement at construction (SEC-1)', () => {
        test('http:// URL with the DEFAULT fetch throws, naming the option variable', () => {
            // No injected `fetch` → `globalThis.fetch` would carry the token
            // over plaintext HTTP; the constructor must refuse up front.
            expect(
                () =>
                    new RemotePropertySource(env, {
                        url: 'http://cfg.example/app.json',
                    })
            ).toThrow(/url/);
            // ftp:// is equally refused.
            expect(
                () =>
                    new RemotePropertySource(env, {
                        url: 'ftp://cfg.example/app.json',
                    })
            ).toThrow(/url/);
        });

        test('injected fetch keeps the escape hatch (no scheme check)', async () => {
            // Custom fetch seam owns the transport — http:// is allowed.
            fetchImpl.mockResolvedValue(response(200, '{"a":"1"}'));
            const source = new RemotePropertySource(env, {
                url: 'http://cfg.example/app.json',
                fetch: fetchImpl,
            });
            expect(await source.load()).toBe(true);
            expect(env.getProperty('a')).toBe('1');
        });
    });

    describe('poll in-flight guard (ARC-4)', () => {
        test('a tick whose previous fetch is unresolved is skipped (single request)', async () => {
            vi.useFakeTimers();
            try {
                const scheduled: Array<{ callback: () => void; ms: number }> = [];
                const scheduler = {
                    setInterval: vi.fn((callback: () => void, ms: number) => {
                        scheduled.push({ callback, ms });
                        return scheduled.length - 1;
                    }),
                    clearInterval: vi.fn(),
                };
                fetchImpl.mockResolvedValue(response(200, '{"a":"1"}'));
                const source = new RemotePropertySource(env, {
                    url: 'https://cfg.example/app.json',
                    pollMs: 5000,
                    fetch: fetchImpl,
                    scheduler,
                });
                await source.load();
                const callsAfterLoad = fetchImpl.mock.calls.length;
                source.start();

                // First poll tick: the fetch hangs (slow server). A second
                // tick fires while it is unresolved — the in-flight guard
                // must skip it (no third request).
                let release: (() => void) | undefined;
                const deferred = new Promise<never>((resolve) => {
                    release = resolve;
                });
                fetchImpl.mockReturnValueOnce(deferred);
                scheduled[0].callback();
                await vi.advanceTimersByTimeAsync(0);
                await vi.advanceTimersByTimeAsync(5000); // second tick while unresolved
                expect(fetchImpl.mock.calls.length).toBe(callsAfterLoad + 1); // still only one request

                // The slow fetch resolves → its document applies.
                release?.();
                await vi.advanceTimersByTimeAsync(0);
                expect(fetchImpl.mock.calls.length).toBe(callsAfterLoad + 1);
                expect(env.getProperty('a')).toBe('1'); // unchanged body — no re-merge
                source.stop();
            } finally {
                vi.useRealTimers();
            }
        });
    });

    describe('configServer above defaults (ARC-2)', () => {
        test('with only defaults + configServer, defaults stays BELOW configServer and the remote value wins', async () => {
            env.getPropertySources().addLast('defaults', { server: { port: '8080' } });
            fetchImpl.mockResolvedValue(response(200, '{"server":{"port":"9090"}}'));
            const source = new RemotePropertySource(env, {
                url: 'https://cfg.example/app.json',
                fetch: fetchImpl,
            });

            await source.load();

            const names = env
                .getPropertySources()
                .toArray()
                .map((s) => s.name);
            expect(names).toEqual([CONFIG_SERVER_SOURCE_NAME, 'defaults']); // D-7 order preserved
            expect(env.getProperty('server.port')).toBe('9090'); // remote wins over defaults
        });
    });
});
