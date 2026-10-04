/**
 * @module blue-cache
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, test, expect, vi } from 'vitest';
import { memoize } from '../src/memoize';
import { serializeCacheKeyStrict } from '../src/keys';

describe('memoize', () => {
    test('caches results by serialized arguments', async () => {
        let calls = 0;
        const add = memoize((a: number, b: number) => {
            calls += 1;
            return a + b;
        });
        expect(await add(1, 2)).toBe(3);
        expect(await add(1, 2)).toBe(3);
        expect(await add(2, 1)).toBe(3); // different key → recomputes
        expect(calls).toBe(2);
    });

    test('coalesces concurrent async calls for the same key (single-flight)', async () => {
        let calls = 0;
        let release!: (value: string) => void;
        const gate = new Promise<string>((resolve) => {
            release = resolve;
        });
        const load = memoize(async (_id: string) => {
            calls += 1;
            return gate;
        });
        const p1 = load('a');
        const p2 = load('a');
        release('done');
        expect(await p1).toBe('done');
        expect(await p2).toBe('done');
        expect(calls).toBe(1);
    });

    test('caches the settled async value (no re-invocation after settle)', async () => {
        let calls = 0;
        const load = memoize(async (id: string) => {
            calls += 1;
            return `v${id}`;
        });
        expect(await load('a')).toBe('va');
        expect(await load('a')).toBe('va');
        expect(calls).toBe(1);
    });

    test('never caches rejections — a failed call is retried', async () => {
        let calls = 0;
        const load = memoize(async () => {
            calls += 1;
            if (calls === 1) {
                throw new Error('boom');
            }
            return 'ok';
        });
        await expect(load()).rejects.toThrow('boom');
        expect(await load()).toBe('ok');
        expect(await load()).toBe('ok'); // now cached
        expect(calls).toBe(2);
    });

    test('applies the ttl to memoized entries', async () => {
        let calls = 0;
        const load = memoize(
            async () => {
                calls += 1;
                return `v${calls}`;
            },
            { ttl: 10_000 }
        );
        vi.useFakeTimers({ toFake: ['Date'] });
        try {
            expect(await load()).toBe('v1');
            expect(await load()).toBe('v1');
            vi.advanceTimersByTime(10_001);
            expect(await load()).toBe('v2');
            expect(calls).toBe(2);
        } finally {
            vi.useRealTimers();
        }
    });

    test('respects maxSize eviction on the memo store', async () => {
        const calls: Record<string, number> = {};
        const keyed = memoize(
            (k: string) => {
                calls[k] = (calls[k] ?? 0) + 1;
                return `${k}-${calls[k]}`;
            },
            { maxSize: 2 }
        );
        expect(await keyed('a')).toBe('a-1');
        expect(await keyed('b')).toBe('b-1');
        expect(await keyed('a')).toBe('a-1'); // cached
        expect(await keyed('c')).toBe('c-1'); // evicts b (LRU: a was promoted by the hit)
        expect(await keyed('b')).toBe('b-2'); // recomputed after eviction
        expect(calls['a']).toBe(1);
        expect(calls['b']).toBe(2);
        expect(calls['c']).toBe(1);
    });

    test('honors a custom key function over the arguments', async () => {
        let calls = 0;
        const byId = memoize(
            (value: { id: number; extra: string }) => {
                calls += 1;
                return value.id;
            },
            { key: (value: { id: number }) => `id:${value.id}` }
        );
        expect(await byId({ id: 1, extra: 'x' })).toBe(1);
        expect(await byId({ id: 1, extra: 'y' })).toBe(1); // same key
        expect(await byId({ id: 2, extra: 'z' })).toBe(2);
        expect(calls).toBe(2);
    });

    test('does not share state between memoized instances', async () => {
        let calls = 0;
        const make = () =>
            memoize((x: number) => {
                calls += 1;
                return x;
            });
        const a = make();
        expect(await a(1)).toBe(1);
        const b = make();
        expect(await b(1)).toBe(1);
        expect(calls).toBe(2);
    });

    test('opt-in strict key distinguishes undefined from null (M1)', async () => {
        let calls = 0;
        const fn = memoize(
            (a: unknown) => {
                calls += 1;
                return a;
            },
            { key: serializeCacheKeyStrict }
        );
        expect(await fn(undefined)).toBeUndefined();
        expect(await fn(null)).toBeNull(); // distinct key under strict → recomputed, not collapsed
        expect(calls).toBe(2);
    });
});
