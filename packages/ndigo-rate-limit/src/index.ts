/**
 * Public API of `@ndigo/rate-limit` — fixed-window rate limiting
 * (shared-store seam).
 *
 * @example
 * ```ts
 * const limiter = new FixedWindowRateLimiter();
 * const result = await limiter.consume('client-1', { limit: 10, windowMs: 60_000 });
 * if (!result.allowed) console.log('retry after', result.retryAfterMs);
 * ```
 */

export {
    likeRateLimiter,
    likeRateLimiterAware,
    AsRateLimiterAware,
    validateRateLimitPolicy,
    type RateLimitPolicy,
    type RateLimitResult,
    type RateLimiter,
    type RateLimiterAware,
} from './rate-limiter';
export { FixedWindowRateLimiter } from './fixed-window-rate-limiter';
export { RATE_LIMITER } from './context-tokens';
