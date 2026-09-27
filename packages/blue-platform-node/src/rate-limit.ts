/**
 * @module blue-platform-node
 * @since 1.0.0
 * @author Jeff Rose
 */

/**
 * A route's rate-limit policy: at most `limit` requests per `windowMs`
 * per client key (SEC-6).
 */
export interface RateLimitPolicy {
    /** Maximum requests allowed within the window. Positive integer. */
    limit: number;
    /** Window length in milliseconds. Positive integer. */
    windowMs: number;
}

/**
 * The outcome of {@link RateLimiter.consume}.
 */
export interface RateLimitResult {
    /** Whether the request may proceed. */
    readonly allowed: boolean;
    /**
     * When denied: milliseconds until the current window resets (the
     * basis for the `Retry-After` header). `0` when allowed.
     */
    readonly retryAfterMs: number;
}

/**
 * Rate-limit backend contract. Implementations count request keys over
 * fixed windows; this is an integration point for distributed backends
 * (Redis) later — the in-memory reference implementation ships now.
 */
export interface RateLimiter {
    /** Backend identifier e.g. `'fixed-window'`, `'redis'`. */
    readonly kind: string;

    /**
     * Accounts one request for `key` under `policy`. Implementations MUST
     * fail loud (`RangeError`) on malformed policies and MUST be safe for
     * concurrent use.
     */
    consume(key: string, policy: RateLimitPolicy): RateLimitResult;
}

/**
 * Validates a {@link RateLimitPolicy} — shared by the `@rateLimit`
 * decorator (decoration-time) and the limiter (call-time).
 */
export function validateRateLimitPolicy(policy: RateLimitPolicy, where = 'rate limit policy'): void {
    if (!Number.isInteger(policy.limit) || policy.limit < 1) {
        throw new RangeError(`${where}: "limit" must be a positive integer, got ${String(policy.limit)}`);
    }
    if (!Number.isInteger(policy.windowMs) || policy.windowMs < 1) {
        throw new RangeError(`${where}: "windowMs" must be a positive integer, got ${String(policy.windowMs)}`);
    }
}

/**
 * In-memory fixed-window reference implementation: one counter per
 * (key, window) pair, sliding to a fresh window once `windowMs` elapses.
 *
 * Memory is bounded: expired buckets are swept opportunistically once the
 * map passes `maxEntries` (default 10 000).
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

    consume(key: string, policy: RateLimitPolicy): RateLimitResult {
        validateRateLimitPolicy(policy);
        const now = Date.now();
        const bucketKey = `${policy.windowMs}:${key}`;
        let bucket = this.#buckets.get(bucketKey);
        if (!bucket || bucket.windowStart + bucket.windowMs <= now) {
            bucket = { windowStart: now, windowMs: policy.windowMs, count: 0 };
            if (this.#buckets.size >= this.#maxEntries) this.#sweep(now);
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
