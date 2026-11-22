/**
 * Public API of `@ndigo/cache` — cache stores, managers, and `@cached`.
 *
 * Provides cache stores, eviction policies, and the `@cached` decorator for
 * memoizing method results.
 *
 * @example
 * ```ts
 * const cache = new MemoryCache<number>({ maxSize: 128 });
 * cache.set('a', 1);
 * cache.get('a'); // 1
 * ```
 */
export * from './cache';
export * from './cache-name';
export * from './cache-manager';
export * from './cached';
export * from './keys';
export * from './memoize';
export * from './context-tokens';
