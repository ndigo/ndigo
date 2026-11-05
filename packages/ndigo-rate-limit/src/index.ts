/**
 * Public API of `@ndigo/rate-limit` — fixed-window rate limiting (AD-33,
 * shared-store seam AD-79).
 *
 * @since 1.0.0
 * @author Jeff Rose
 */

export {
    likeRateLimiter,
    validateRateLimitPolicy,
    type RateLimitPolicy,
    type RateLimitResult,
    type RateLimiter,
} from './rate-limiter';
export { FixedWindowRateLimiter } from './fixed-window-rate-limiter';
export { RATE_LIMITER } from './context-tokens';
