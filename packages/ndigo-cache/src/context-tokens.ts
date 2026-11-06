/**
 * Type-safe bean handles for the shared cache contracts (AD-34 D1).
 */
import { ContextToken } from '@ndigo/factory';
import type { CacheManager } from './cache-manager';

/**
 * Token for the shared {@link CacheManager} bean. The Node platform
 * auto-configuration registers the entry; consumers resolve it without a
 * string: `context.getValue(CACHE_MANAGER)`.
 */
export const CACHE_MANAGER = new ContextToken<CacheManager>('cacheManager');
