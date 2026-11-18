/**
 * Public API of `@ndigo/rate-limit` — fixed-window rate limiting
 * (shared-store seam).
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
