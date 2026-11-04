/**
 * Fixed-window limiter contracts (AD-33, moved to `@ndigo/rate-limit` by
 * AD-79): per-(key, window) budgets, window slide, fail-loud policies,
 * and the SEC-2 memory bound.
 *
 * @module ndigo-rate-limit
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, test, expect } from 'vitest';
import { setTimeout as delay } from 'node:timers/promises';
import { FixedWindowRateLimiter } from '../src/fixed-window-rate-limiter';

describe('FixedWindowRateLimiter', () => {
    test('kind is fixed-window', () => {
        expect(new FixedWindowRateLimiter().kind).toBe('fixed-window');
    });

    test('allows requests up to the limit and denies the next', async () => {
        const limiter = new FixedWindowRateLimiter();
        const policy = { limit: 3, windowMs: 60_000 };
        expect((await limiter.consume('a', policy)).allowed).toBe(true);
        expect((await limiter.consume('a', policy)).allowed).toBe(true);
        expect((await limiter.consume('a', policy)).allowed).toBe(true);
        const denied = await limiter.consume('a', policy);
        expect(denied.allowed).toBe(false);
        expect(denied.retryAfterMs).toBeGreaterThan(0);
    });

    test('distinct keys are independent', async () => {
        const limiter = new FixedWindowRateLimiter();
        const policy = { limit: 1, windowMs: 60_000 };
        expect((await limiter.consume('a', policy)).allowed).toBe(true);
        expect((await limiter.consume('b', policy)).allowed).toBe(true);
        expect((await limiter.consume('a', policy)).allowed).toBe(false);
    });

    test('a new window resets the count', async () => {
        const limiter = new FixedWindowRateLimiter();
        const policy = { limit: 1, windowMs: 30 };
        expect((await limiter.consume('a', policy)).allowed).toBe(true);
        expect((await limiter.consume('a', policy)).allowed).toBe(false);
        await delay(40);
        expect((await limiter.consume('a', policy)).allowed).toBe(true);
    });

    test('invalid policies fail loud', async () => {
        const limiter = new FixedWindowRateLimiter();
        await expect(limiter.consume('a', { limit: 0, windowMs: 1000 })).rejects.toThrow(RangeError);
        await expect(limiter.consume('a', { limit: 1.5, windowMs: 1000 })).rejects.toThrow(RangeError);
        await expect(limiter.consume('a', { limit: 1, windowMs: -1 })).rejects.toThrow(RangeError);
    });

    test('at the cap with no expired buckets the oldest live bucket is evicted (SEC-2)', async () => {
        const limiter = new FixedWindowRateLimiter({ maxEntries: 3 });
        const policy = { limit: 1, windowMs: 60_000 };
        expect((await limiter.consume('a', policy)).allowed).toBe(true);
        expect((await limiter.consume('b', policy)).allowed).toBe(true);
        expect((await limiter.consume('c', policy)).allowed).toBe(true);
        // 'b' is live and over its budget.
        expect((await limiter.consume('b', policy)).allowed).toBe(false);
        // At the cap with zero expired buckets, a new key evicts the oldest
        // ('a') instead of growing the map past maxEntries.
        expect((await limiter.consume('d', policy)).allowed).toBe(true);
        // 'a' was evicted → fresh budget; 'd' is live → still denied.
        expect((await limiter.consume('a', policy)).allowed).toBe(true);
        expect((await limiter.consume('d', policy)).allowed).toBe(false);
    });

    test('a distinct-key flood never exceeds maxEntries and keeps insertion ~O(1) (SEC-2)', async () => {
        const limiter = new FixedWindowRateLimiter({ maxEntries: 64 });
        const policy = { limit: 1, windowMs: 60_000 };
        const started = Date.now();
        for (let i = 0; i < 5_000; i++) {
            // oxlint-disable-next-line no-await-in-loop -- sequential flood: each consume is the load being asserted.
            expect((await limiter.consume(`ip-${i}`, policy)).allowed).toBe(true);
        }
        // Every bucket from the first wave has long been evicted — an old key
        // gets a fresh budget (size never grew past maxEntries)…
        expect((await limiter.consume('ip-0', policy)).allowed).toBe(true);
        expect((await limiter.consume('ip-1', policy)).allowed).toBe(true);
        // …while the newest key is still live and over its budget.
        expect((await limiter.consume('ip-4999', policy)).allowed).toBe(false);
        expect(Date.now() - started).toBeLessThan(2_000);
    });
});
