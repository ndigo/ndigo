/**
 * View cache sizing and collision-free cache keys.
 */
/**
 * Upper bound on cached views. View names can be request-derived (default
 * route names, path extensions), so an unbounded cache is a memory-growth
 * vector; insertion-ordered FIFO eviction keeps the cache bounded without
 * changing observable resolution for a fixed name set.
 */
export const MAX_VIEW_CACHE_ENTRIES = 1024;

export { BoundedCache } from '@ndigo/core';

/**
 * Builds an unambiguous cache key for a view name/language pair.
 *
 * The key MUST distinguish every distinct pair: a naive
 * `\${name}_\${language}` join collides — `('user_en', 'US')` and
 * `('user', 'en_US')` both yield `user_en_US` — and would serve the first
 * resolved view for the second pair. JSON-encoding the tuple preserves the
 * `_` characters inside each component while keeping them separate.
 *
 * @param name - The view name.
 * @param language - Optional language/locale hint.
 * @returns A collision-free cache key.
 *
 * @example
 * ```ts
 * createViewCacheKey();
 * ```
 */
export function createViewCacheKey(name: string, language?: unknown): string {
    return JSON.stringify([name, language == null ? '' : String(language)]);
}
