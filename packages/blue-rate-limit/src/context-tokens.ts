/**
 * Context tokens for the `@blue/rate-limit` beans (AD-79 D-2).
 *
 * @module blue-rate-limit
 * @since 1.0.0
 * @author Jeff Rose
 */
import { ContextToken } from '@blue/factory';
import type { RateLimiter } from './rate-limiter';

/**
 * Token for the application context's shared {@link RateLimiter} bean —
 * `NodeAutoConfiguration` registers the in-process default under it; apps
 * needing a shared store override the bean (e.g. with the
 * `@blue/redis/rate-limit` driver).
 */
export const RATE_LIMITER = new ContextToken<RateLimiter>('rateLimiter');
