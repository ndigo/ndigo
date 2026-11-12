/**
 * Context tokens for the `@ndigo/rate-limit` entries (AD-79 D-2).
 */
import { ContextToken } from '@ndigo/factory';
import type { RateLimiter } from './rate-limiter';

/**
 * Token for the application context's shared {@link RateLimiter} entry —
 * `NodeAutoConfiguration` registers the in-process default under it; apps
 * needing a shared store override the entry (e.g. with the
 * `@ndigo/redis/rate-limit` driver).
 */
export const RATE_LIMITER = new ContextToken<RateLimiter>('rateLimiter');
