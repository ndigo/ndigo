/**
 * The rate-limit backend contract (AD-33 Wave 3, shared-store follow-up
 * AD-79): fixed-window budgets per client key, enforced as **429 +
 * `Retry-After`** by the platform interceptor.
 *
 * The SPI is **async** (AD-39): backends decide where the counters live —
 * the in-process reference implementation ships here, the shared-store
 * Redis driver in `@ndigo/redis/rate-limit`. The enforcement metadata
 * (`@rateLimit`, `RATE_LIMIT_KEY`) and the `RateLimitInterceptor` live in
 * `@ndigo/platform-node`.
 *
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
 * fixed windows; the in-memory reference (single process) and the Redis
 * driver (shared store, multi-process — AD-79) implement the same
 * semantics.
 */
export interface RateLimiter {
    /** Backend identifier e.g. `'fixed-window'`, `'redis'`. */
    readonly kind: string;

    /**
     * Accounts one request for `key` under `policy`. Implementations MUST
     * fail loud (`RangeError`) on malformed policies and MUST be safe for
     * concurrent use. The async signature is deliberate (AD-39): a shared
     * backend resolves its counter over a network hop.
     */
    consume(key: string, policy: RateLimitPolicy): Promise<RateLimitResult>;
}

/**
 * Structural type guard for {@link RateLimiter} — used where a bean or
 * option is resolved by shape instead of the {@link context-tokens.RATE_LIMITER | RATE_LIMITER} token.
 */
export function likeRateLimiter(value: unknown): value is RateLimiter {
    return (
        value !== null &&
        typeof value === 'object' &&
        typeof (value as Partial<RateLimiter>).kind === 'string' &&
        typeof (value as Partial<RateLimiter>).consume === 'function'
    );
}

/**
 * Validates a {@link RateLimitPolicy} — shared by the `@rateLimit`
 * decorator (decoration-time) and every limiter (call-time).
 */
export function validateRateLimitPolicy(policy: RateLimitPolicy, where = 'rate limit policy'): void {
    if (!Number.isInteger(policy.limit) || policy.limit < 1) {
        throw new RangeError(`${where}: "limit" must be a positive integer, got ${String(policy.limit)}`);
    }
    if (!Number.isInteger(policy.windowMs) || policy.windowMs < 1) {
        throw new RangeError(`${where}: "windowMs" must be a positive integer, got ${String(policy.windowMs)}`);
    }
}
