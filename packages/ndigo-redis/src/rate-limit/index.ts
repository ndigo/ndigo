/**
 * Shared-store rate limiting (AD-79): {@link RedisRateLimiter} — the
 * Redis-backed fixed-window driver for the `@ndigo/rate-limit` SPI.
 */

export { RedisRateLimiter, type RedisRateLimiterOptions } from './redis-rate-limiter';
