/**
 * Context tokens for the `@ndigo/rate-limit` beans (AD-79 D-2).
 */
import { ContextToken } from '@ndigo/factory';
import type { RateLimiter } from './rate-limiter';

/**
 * Token for the application context's shared {@link RateLimiter} bean —
 * `NodeAutoConfiguration` registers the in-process default under it; apps
 * needing a shared store override the bean (e.g. with the
 * `@ndigo/redis/rate-limit` driver).
 */
export const RATE_LIMITER = new ContextToken<RateLimiter>('rateLimiter');
