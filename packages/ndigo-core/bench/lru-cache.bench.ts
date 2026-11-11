/**
 * LRUCache throughput, with the `lru-cache` npm package as the external
 * comparator.
 *
 * Both caches are pre-filled before timing. One measured iteration performs
 * 1,000 logical operations; the `@ops=1000` suffix is normalized by the
 * benchmark runner. Recency semantics are verified before each comparison.
 */
import { LRUCache as NpmLRUCache } from 'lru-cache';
import { test } from 'vitest';
import { LRUCache } from '../src/_lru-cache';
import { assertEquivalent, benchName, sink } from '../../../benchmarks/lib/verify';

const CAPACITY = 64;
const BATCH = 1_000;
const keys = Array.from({ length: CAPACITY }, (_, index) => `key${index}`);

const ndigoHit = new LRUCache<string, number>(CAPACITY);
const npmHit = new NpmLRUCache<string, number>({ max: CAPACITY });
for (const key of keys) {
    ndigoHit.set(key, Number(key.slice(3)));
    npmHit.set(key, Number(key.slice(3)));
}

let ndigoCursor = 0;
let npmCursor = 0;
let ndigoEvictCursor = CAPACITY;
let npmEvictCursor = CAPACITY;

function verifyHit(): void {
    for (const key of keys) {
        assertEquivalent(`LRU hit ${key}`, ndigoHit.get(key), npmHit.get(key));
    }
}

function verifyEviction(): void {
    const ndigo = new LRUCache<string, number>(8);
    const npm = new NpmLRUCache<string, number>({ max: 8 });
    for (let i = 0; i < 20; i++) {
        ndigo.set(`evict${i}`, i);
        npm.set(`evict${i}`, i);
    }
    assertEquivalent('LRU eviction size', ndigo.size, npm.size);
    assertEquivalent('LRU eviction oldest', ndigo.has('evict0'), npm.has('evict0'));
    assertEquivalent('LRU eviction newest', ndigo.has('evict19'), npm.has('evict19'));
}

test('LRUCache.get — hit', async ({ bench }) => {
    verifyHit();
    await bench.compare(
        bench(benchName('ndigo LRUCache.get', BATCH), () => {
            for (let i = 0; i < BATCH; i++) sink(ndigoHit.get(keys[ndigoCursor++ % CAPACITY]));
        }),
        bench(benchName('lru-cache npm get', BATCH), () => {
            for (let i = 0; i < BATCH; i++) sink(npmHit.get(keys[npmCursor++ % CAPACITY]));
        })
    );
});

test('LRUCache.get — miss', async ({ bench }) => {
    assertEquivalent('LRU miss', ndigoHit.get('missing'), npmHit.get('missing'));
    await bench.compare(
        bench(benchName('ndigo LRUCache.get miss', BATCH), () => {
            for (let i = 0; i < BATCH; i++) sink(ndigoHit.get('missing'));
        }),
        bench(benchName('lru-cache npm get miss', BATCH), () => {
            for (let i = 0; i < BATCH; i++) sink(npmHit.get('missing'));
        })
    );
});

test('LRUCache.set — existing key', async ({ bench }) => {
    await bench.compare(
        bench(benchName('ndigo LRUCache.set existing', BATCH), () => {
            for (let i = 0; i < BATCH; i++) ndigoHit.set(keys[i % CAPACITY], i);
        }),
        bench(benchName('lru-cache npm set existing', BATCH), () => {
            for (let i = 0; i < BATCH; i++) npmHit.set(keys[i % CAPACITY], i);
        })
    );
});

test('LRUCache.set — eviction', async ({ bench }) => {
    verifyEviction();
    await bench.compare(
        bench(benchName('ndigo LRUCache.set evict', BATCH), () => {
            for (let i = 0; i < BATCH; i++) ndigoHit.set(`new${ndigoEvictCursor++}`, i);
        }),
        bench(benchName('lru-cache npm set evict', BATCH), () => {
            for (let i = 0; i < BATCH; i++) npmHit.set(`new${npmEvictCursor++}`, i);
        }),
        { time: 2_000, warmupTime: 500 }
    );
});
