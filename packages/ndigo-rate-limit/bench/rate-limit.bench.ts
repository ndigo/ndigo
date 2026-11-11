// oxlint-disable no-await-in-loop -- consume is awaited sequentially to measure per-call cost.
/**
 * `@ndigo/rate-limit` FixedWindowRateLimiter throughput.
 *
 * `consume` is async; rows measure the full accounting path including
 * window rotation and the memory-bound sweep. Allowed and denied paths are
 * both measured.
 */
import { test } from 'vitest';
import { FixedWindowRateLimiter } from '../src/fixed-window-rate-limiter';
import { benchName, sink } from '../../../benchmarks/lib/verify';
const BATCH = 1_000;
const retain = sink;

test('FixedWindowRateLimiter — allowed consume', async ({ bench }) => {
    const limiter = new FixedWindowRateLimiter();
    const policy = { windowMs: 60_000, limit: 1_000_000 };
    await bench(benchName('consume allowed', BATCH), async () => {
        let allowed = 0;
        for (let i = 0; i < BATCH; i++) {
            const r = await limiter.consume(`user-${i % 64}`, policy);
            if (r.allowed) allowed++;
        }
        retain(allowed);
    }).run();
});

test('FixedWindowRateLimiter — denied consume (limit 1)', async ({ bench }) => {
    const limiter = new FixedWindowRateLimiter();
    const policy = { windowMs: 60_000, limit: 1 };
    await limiter.consume('hot', policy); // exhaust
    await bench(benchName('consume denied', BATCH), async () => {
        let denied = 0;
        for (let i = 0; i < BATCH; i++) {
            const r = await limiter.consume('hot', policy);
            if (!r.allowed) denied++;
        }
        retain(denied);
    }).run();
});

test('FixedWindowRateLimiter — distinct keys under cap', async ({ bench }) => {
    const limiter = new FixedWindowRateLimiter({ maxEntries: 10_000 });
    const policy = { windowMs: 60_000, limit: 100 };
    await bench(benchName('consume distinct keys', BATCH), async () => {
        let allowed = 0;
        for (let i = 0; i < BATCH; i++) {
            const r = await limiter.consume(`user-${i}`, policy);
            if (r.allowed) allowed++;
        }
        retain(allowed);
    }).run();
});
