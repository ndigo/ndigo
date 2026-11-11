// oxlint-disable no-await-in-loop -- cache ops are sequential by contract; parallel calls change single-flight semantics.
/**
 * `@ndigo/cache` MemoryCache and memoize throughput.
 *
 * Operations are `async` (the cache contract is awaitable), so the rows
 * measure promise resolution cost too — that is the real cost of calling
 * `cache.get()` in application code.
 */
import { test } from 'vitest';
import { isCacheMiss, MemoryCache } from '../src/cache';
import { memoize } from '../src/memoize';
import { benchName, sink } from '../../../benchmarks/lib/verify';
const BATCH = 1_000;
const retain = sink;

test('MemoryCache — get hit / miss', async ({ bench }) => {
    const cache = new MemoryCache<number>();
    for (let i = 0; i < 32; i++) await cache.set(`k${i}`, i);
    let hitSum = 0;
    let missSum = 0;
    await bench.compare(
        bench(benchName('get hit', BATCH), async () => {
            for (let i = 0; i < BATCH; i++) {
                const v = await cache.get(`k${i % 32}`);
                hitSum += isCacheMiss(v) ? 0 : (v as number);
            }
            retain(hitSum);
        }),
        bench(benchName('get miss', BATCH), async () => {
            for (let i = 0; i < BATCH; i++) {
                const v = await cache.get(`nope-${i}`);
                if (isCacheMiss(v)) missSum++;
            }
            retain(missSum);
        })
    );
});

test('MemoryCache — set / delete / has', async ({ bench }) => {
    const cache = new MemoryCache<number>();
    await bench(benchName('set existing', BATCH), async () => {
        for (let i = 0; i < BATCH; i++) await cache.set('k', i);
        retain(await cache.size());
    }).run();
    const c2 = new MemoryCache<number>();
    await c2.set('k', 1);
    await bench(benchName('delete hit', BATCH), async () => {
        for (let i = 0; i < BATCH; i++) {
            await c2.set('k', 1);
            await c2.delete('k');
        }
        retain(1);
    }).run();
});

test('MemoryCache — LRU eviction under pressure', async ({ bench }) => {
    const cache = new MemoryCache<number>({ maxSize: 16, eviction: 'lru' });
    await bench(benchName('set evict', BATCH), async () => {
        for (let i = 0; i < BATCH; i++) await cache.set(`k${i % 64}`, i);
        retain(await cache.size());
    }).run();
});

test('memoize — hit vs miss', async ({ bench }) => {
    let calls = 0;
    const fn = async (n: number): Promise<number> => {
        calls++;
        return n * 2;
    };
    const memo = memoize(fn, { maxSize: 64 });
    await memo(1); // prime
    await bench.compare(
        bench(benchName('memoize hit', BATCH), async () => {
            for (let i = 0; i < BATCH; i++) retain(await memo(1));
        }),
        bench(benchName('memoize miss', BATCH), async () => {
            for (let i = 0; i < BATCH; i++) retain(await memo(i + 1000));
        })
    );
    retain(calls);
});
