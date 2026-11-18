/**
 * The rate-limit backend contract (shared-store follow-up):
 * fixed-window budgets per client key, enforced as **429 +
 * `Retry-After`** by the platform interceptor.
 *
 * The SPI is **async**: backends decide where the counters live —
 * the in-process reference implementation ships here, the shared-store
 * Redis driver in `@ndigo/redis/rate-limit`. The enforcement metadata
 * (`@rateLimit`, `RATE_LIMIT_KEY`) and the `RateLimitInterceptor` live in
 * `@ndigo/platform-node`.
 */
import { like } from '@ndigo/util/types';
// oxlint-disable-next-line typescript/no-explicit-any -- TS2545 requires mixin superclass ctors to be exactly `...args: any[]`; no erasable alternative.
type Constructable<T = {}> = new (...args: any[]) => T;
import { Aware, AsAware, likeAwareAnd } from '@ndigo/factory';

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
 * driver (shared store, multi-process) implement the same
 * semantics.
 */
export interface RateLimiter {
    /** Backend identifier e.g. `'fixed-window'`, `'redis'`. */
    readonly kind: string;

    /**
     * Accounts one request for `key` under `policy`. Implementations MUST
     * fail loud (`RangeError`) on malformed policies and MUST be safe for
     * concurrent use. The async signature is deliberate: a shared
     * backend resolves its counter over a network hop.
     *
     * @param key - The client key whose budget is consumed.
     * @param policy - The window and limit to enforce.
     * @returns Whether the request may proceed and, when denied, the wait before retry.
     *
     * @example
     * ```ts
     * const result = await limiter.consume('client-1', { limit: 10, windowMs: 60_000 });
     * ```
     */
    consume(key: string, policy: RateLimitPolicy): Promise<RateLimitResult>;
}

/**
 * Structural type guard for {@link RateLimiter} — used where an entry or
 * option is resolved by shape instead of the {@link "context-tokens".RATE_LIMITER | RATE_LIMITER} token.
 *
 * @param value - The candidate value to inspect.
 * @returns `true` when the value implements the limiter contract.
 *
 * @example
 * ```ts
 * if (likeRateLimiter(candidate)) {
 *     await candidate.consume('client-1', policy);
 * }
 * ```
 */
export function likeRateLimiter(value: unknown): value is RateLimiter {
    return like({ kind: String, consume: Function })(value);
}

/**
 * Validates a {@link RateLimitPolicy} — shared by the `@rateLimit`
 * decorator (decoration-time) and every limiter (call-time).
 *
 * @param policy - The policy to validate.
 * @param where - Label used in the thrown error (defaults to `"rate limit policy"`).
 * @returns Nothing; throws on an invalid policy.
 * @throws When `limit` or `windowMs` is not a positive integer.
 *
 * @example
 * ```ts
 * validateRateLimitPolicy({ limit: 100, windowMs: 60_000 });
 * ```
 */
export interface RateLimiterAware extends Aware {
    setRateLimiter(rateLimiter: RateLimiter): void;
}

export const AsRateLimiterAware = <T extends Constructable>(superclass: T): Constructable<RateLimiterAware> & T =>
    class extends AsAware(superclass) implements RateLimiterAware {
        rateLimiter: RateLimiter | null = null;
        setRateLimiter(rateLimiter: RateLimiter): void {
            Reflect.defineProperty(this, 'rateLimiter', {
                value: rateLimiter,
                configurable: true,
                enumerable: false,
                writable: false,
            });
        }
    };

export const likeRateLimiterAware = likeAwareAnd(like({ setRateLimiter: Function })) as (
    value: unknown
) => value is RateLimiterAware;

export function validateRateLimitPolicy(policy: RateLimitPolicy, where = 'rate limit policy'): void {
    if (!Number.isInteger(policy.limit) || policy.limit < 1) {
        throw new RangeError(`${where}: "limit" must be a positive integer, got ${String(policy.limit)}`);
    }
    if (!Number.isInteger(policy.windowMs) || policy.windowMs < 1) {
        throw new RangeError(`${where}: "windowMs" must be a positive integer, got ${String(policy.windowMs)}`);
    }
}
