/**
 * The default {@link RateLimiter}: in-process and single-node (AD-33
 * Wave 3, moved to `@ndigo/rate-limit` by AD-79).
 *
 * Semantics deliberately mirror a one-node deployment: one counter per
 * (key, window) pair, sliding to a fresh window once `windowMs` elapses.
 * Budgets are **per instance** — the platform wires a single bean into
 * the default mapping, so one process shares one budget; replace the bean
 * with the Redis driver (`@ndigo/redis/rate-limit`) when more than one
 * process must share (AD-79).
 *
 * Memory is bounded: expired buckets are swept once the map passes
 * `maxEntries` (default 10 000); at the cap with no expired buckets the
 * oldest bucket is evicted, so `size` never exceeds `maxEntries` and new
 * keys stay ~O(1) to insert (SEC-2). Redis-backed TTL windows need no
 * such machinery — the server expires keys itself.
 *
 * @since 1.0.0
 * @author Jeff Rose
 */
import { type RateLimitPolicy, type RateLimitResult, type RateLimiter, validateRateLimitPolicy } from './rate-limiter';

/**
 * In-memory fixed-window reference implementation: one counter per
 * (key, window) pair, sliding to a fresh window once `windowMs` elapses.
 */
export class FixedWindowRateLimiter implements RateLimiter {
    readonly kind = 'fixed-window';

    readonly #buckets = new Map<string, { windowStart: number; windowMs: number; count: number }>();
    readonly #maxEntries: number;

    constructor(options: { maxEntries?: number } = {}) {
        this.#maxEntries = options.maxEntries ?? 10_000;
        if (!Number.isInteger(this.#maxEntries) || this.#maxEntries < 1) {
            throw new RangeError(
                `FixedWindowRateLimiter maxEntries must be a positive integer, got ${String(this.#maxEntries)}`
            );
        }
    }

    async consume(key: string, policy: RateLimitPolicy): Promise<RateLimitResult> {
        validateRateLimitPolicy(policy);
        const now = Date.now();
        const bucketKey = `${policy.windowMs}:${key}`;
        let bucket = this.#buckets.get(bucketKey);
        if (!bucket || bucket.windowStart + bucket.windowMs <= now) {
            if (this.#buckets.size >= this.#maxEntries) {
                this.#sweep(now);
                // SEC-2: the sweep reclaims only *expired* buckets; a flood of
                // live distinct keys would otherwise grow the map without
                // bound and turn every new key into an O(n) no-op sweep —
                // the limiter itself becoming a DoS amplifier. Rate-limit
                // state is a cache, not durable accounting: at the cap the
                // oldest bucket is evicted deterministically, keeping the
                // documented memory bound and insertion ~O(1).
                if (this.#buckets.size >= this.#maxEntries) {
                    const oldest = this.#buckets.keys().next();
                    if (!oldest.done) {
                        this.#buckets.delete(oldest.value as string);
                    }
                }
            }
            bucket = { windowStart: now, windowMs: policy.windowMs, count: 0 };
            this.#buckets.set(bucketKey, bucket);
        }
        bucket.count += 1;
        if (bucket.count > policy.limit) {
            return { allowed: false, retryAfterMs: bucket.windowStart + policy.windowMs - now };
        }
        return { allowed: true, retryAfterMs: 0 };
    }

    #sweep(now: number): void {
        for (const [bucketKey, bucket] of this.#buckets) {
            if (bucket.windowStart + bucket.windowMs <= now) {
                this.#buckets.delete(bucketKey);
            }
        }
    }
}
