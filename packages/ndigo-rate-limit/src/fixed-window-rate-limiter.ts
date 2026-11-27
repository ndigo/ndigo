/**
 * The default {@link RateLimiter}: in-process and single-node, moved to
 * `@ndigo/rate-limit`.
 *
 * Semantics deliberately mirror a one-node deployment: one counter per
 * (key, window) pair, sliding to a fresh window once `windowMs` elapses.
 * Budgets are **per instance** — the platform wires a single entry into
 * the default mapping, so one process shares one budget; replace the entry
 * with the Redis driver (`@ndigo/redis/rate-limit`) when more than one
 * process must share.
 *
 * Memory is bounded: expired buckets are swept once the map passes
 * `maxEntries` (default 10 000); at the cap with no expired buckets the
 * oldest bucket is evicted, so `size` never exceeds `maxEntries` and new
 * keys stay ~O(1) to insert. Redis-backed TTL windows need no
 * such machinery — the server expires keys itself.
 */
import { type RateLimitPolicy, type RateLimitResult, type RateLimiter, validateRateLimitPolicy } from './rate-limiter';

/**
 * In-memory fixed-window reference implementation: one counter per
 * (key, window) pair, sliding to a fresh window once `windowMs` elapses.
 *
 * @example
 * ```ts
 * const limiter = new FixedWindowRateLimiter();
 * const result = await limiter.consume('client-1', { limit: 10, windowMs: 60_000 });
 * ```
 */
export class FixedWindowRateLimiter implements RateLimiter {
    /**
     * The `Symbol.toStringTag` value for this instance.
     *
     * `Object.prototype.toString()` reads this symbol to render the
     * instance as `"[object <tag>]" ` (see MDN: Symbol.toStringTag).
     *
     * @returns The string "FixedWindowRateLimiter".
     *
     * @example
     * console.log(Object.prototype.toString.call(instance)); // "[object FixedWindowRateLimiter]"
     */
    get [Symbol.toStringTag](): string {
        return 'FixedWindowRateLimiter';
    }

    /** Backend identifier (`'fixed-window'`). */
    readonly kind = 'fixed-window';

    readonly #buckets = new Map<string, { windowStart: number; windowMs: number; count: number }>();
    readonly #maxEntries: number;

    /**
     * @param options - Optional `maxEntries` cap (default 10 000).
     *
     * @example
     * ```ts
     * const limiter = new FixedWindowRateLimiter({ maxEntries: 1000 });
     * ```
     */
    constructor(options: { maxEntries?: number } = {}) {
        this.#maxEntries = options.maxEntries ?? 10_000;
        if (!Number.isInteger(this.#maxEntries) || this.#maxEntries < 1) {
            throw new RangeError(
                `FixedWindowRateLimiter maxEntries must be a positive integer, got ${String(this.#maxEntries)}`
            );
        }
    }

    /**
     * Accounts one request for `key` under `policy`.
     *
     * @param key - The client key whose budget is consumed.
     * @param policy - The window and limit to enforce.
     * @returns Whether the request is allowed and, when denied, the wait before retry.
     *
     * @example
     * ```ts
     * const limiter = new FixedWindowRateLimiter();
     * const result = await limiter.consume('client-1', { limit: 10, windowMs: 60_000 });
     * if (!result.allowed) console.log('retry after', result.retryAfterMs);
     * ```
     */
    async consume(key: string, policy: RateLimitPolicy): Promise<RateLimitResult> {
        validateRateLimitPolicy(policy);
        const now = Date.now();
        const bucketKey = `${policy.windowMs}:${key}`;
        let bucket = this.#buckets.get(bucketKey);
        if (!bucket || bucket.windowStart + bucket.windowMs <= now) {
            if (this.#buckets.size >= this.#maxEntries) {
                this.#sweep(now);
                // The sweep reclaims only *expired* buckets; a flood of
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
