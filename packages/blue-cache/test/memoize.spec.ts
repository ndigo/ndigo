/**
 * @module blue-cache
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, test, expect, vi } from 'vitest';
import { memoize } from '../src/memoize';
import { serializeCacheKeyStrict } from '../src/keys';

describe('memoize', () => {
    test('caches results by serialized arguments', () => {
        let calls = 0;
        const add = memoize((a: number, b: number) => {
            calls += 1;
            return a + b;
        });
        expect(add(1, 2)).toBe(3);
        expect(add(1, 2)).toBe(3);
        expect(add(2, 1)).toBe(3); // different key → recomputes
        expect(calls).toBe(2);
    });

    test('returns sync results directly (no promise wrapping in sync mode)', () => {
        let calls = 0;
        const double = memoize((x: number) => {
            calls += 1;
            return x * 2;
        });
        const first = double(2);
        const second = double(2);
        expect(typeof first).toBe('number');
        expect(first).toBe(4);
        expect(second).toBe(first);
        expect(calls).toBe(1);
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
        expect(p1).toBe(p2); // same in-flight promise while pending
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

    test('respects maxSize eviction on the memo store', () => {
        const calls: Record<string, number> = {};
        const keyed = memoize(
            (k: string) => {
                calls[k] = (calls[k] ?? 0) + 1;
                return `${k}-${calls[k]}`;
            },
            { maxSize: 2 }
        );
        keyed('a');
        keyed('b');
        expect(keyed('a')).toBe('a-1'); // cached
        keyed('c'); // evicts b (LRU: a was promoted by the hit)
        expect(keyed('b')).toBe('b-2'); // recomputed after eviction
        expect(calls['a']).toBe(1);
        expect(calls['b']).toBe(2);
        expect(calls['c']).toBe(1);
    });

    test('honors a custom key function over the arguments', () => {
        let calls = 0;
        const byId = memoize(
            (value: { id: number; extra: string }) => {
                calls += 1;
                return value.id;
            },
            { key: (value: { id: number }) => `id:${value.id}` }
        );
        byId({ id: 1, extra: 'x' });
        byId({ id: 1, extra: 'y' }); // same key
        const result = byId({ id: 2, extra: 'z' });
        expect(result).toBe(2);
        expect(calls).toBe(2);
    });

    test('does not share state between memoized instances', () => {
        let calls = 0;
        const make = () =>
            memoize((x: number) => {
                calls += 1;
                return x;
            });
        const a = make();
        a(1);
        const b = make();
        expect(b(1)).toBe(1);
        expect(calls).toBe(2);
    });

    test('opt-in strict key distinguishes undefined from null (M1)', () => {
        let calls = 0;
        const fn = memoize(
            (a: unknown) => {
                calls += 1;
                return a;
            },
            { key: serializeCacheKeyStrict }
        );
        expect(fn(undefined)).toBeUndefined();
        expect(fn(null)).toBeNull(); // distinct key under strict → recomputed, not collapsed
        expect(calls).toBe(2);
    });
});
