/**
 * Production `like()` throughput.
 *
 * Measures the shipped implementation in three usage shapes: cached curried
 * predicate, two-argument immediate call, and fresh descriptor. The hand-written
 * `typeof` check is the floor, not a drop-in replacement.
 */
import { test } from 'vitest';
import like from '../src/type/like';
import { assertEquivalent, benchName, sink } from '../../../benchmarks/lib/verify';

const BATCH = 1_000;
const retain = sink;

const descriptor = { then: Function } as const;
const direct = like(descriptor);
const thenable = { then(): void {} };
const mismatch = { then: 42 };
const nil = null;

function handwritten(value: unknown): boolean {
    const record = value as { then?: unknown } | null;
    return record != null && typeof record.then === 'function';
}

test('like — cached curried predicate', async ({ bench }) => {
    assertEquivalent('like cached valid', direct(thenable), true);
    assertEquivalent('like cached null', direct(nil), false);
    assertEquivalent('like cached mismatch', direct(mismatch), false);
    await bench.compare(
        bench(benchName('like cached — valid', BATCH), () => {
            for (let i = 0; i < BATCH; i++) retain(direct(thenable));
        }),
        bench(benchName('like cached — null', BATCH), () => {
            for (let i = 0; i < BATCH; i++) retain(direct(nil));
        }),
        bench(benchName('like cached — mismatch', BATCH), () => {
            for (let i = 0; i < BATCH; i++) retain(direct(mismatch));
        }),
        bench(benchName('hand-written typeof — valid', BATCH), () => {
            for (let i = 0; i < BATCH; i++) retain(handwritten(thenable));
        })
    );
});

test('like — two-argument immediate call', async ({ bench }) => {
    assertEquivalent('like two-arg valid', like(descriptor, thenable), true);
    assertEquivalent('like two-arg null', like(descriptor, nil), false);
    await bench.compare(
        bench(benchName('like(descriptor, value) — valid', BATCH), () => {
            for (let i = 0; i < BATCH; i++) retain(like(descriptor, thenable));
        }),
        bench(benchName('like(descriptor, value) — null', BATCH), () => {
            for (let i = 0; i < BATCH; i++) retain(like(descriptor, nil));
        })
    );
});

test('like — fresh descriptor (cache miss)', async ({ bench }) => {
    const freshBatch = 100;
    await bench.compare(
        bench(benchName('fresh descriptor — valid', freshBatch), () => {
            for (let i = 0; i < freshBatch; i++) retain(like({ then: Function })(thenable));
        }),
        bench(benchName('fresh descriptor — null', freshBatch), () => {
            for (let i = 0; i < freshBatch; i++) retain(like({ then: Function })(nil));
        }),
        { time: 2_000, warmupTime: 500 }
    );
});
