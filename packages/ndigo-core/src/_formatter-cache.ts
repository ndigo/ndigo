/**
 * Bounded caches for the expensive Intl formatter instances.
 */
import { stringComparator } from './comparable.js';

export const stringifyOptions = (options: object): string => {
    const entries = Object.entries(options).sort(([a], [b]) => stringComparator.compare(a, b));
    return JSON.stringify(entries);
};

// Module-level caches: Intl constructors are expensive and formatters are
// immutable after construction, so instances are shared per option set.
// Bounded: when the cap is exceeded the cache resets, so long-lived
// processes cannot grow it without limit (the locale half of the key is
// request-derived).
export const dateTimeCache = new Map<string, Intl.DateTimeFormat>();
export const numberCache = new Map<string, Intl.NumberFormat>();
export const relativeTimeCache = new Map<string, Intl.RelativeTimeFormat>();
export const listCache = new Map<string, Intl.ListFormat>();

/** Cap on concurrently cached formatter instances per Intl kind. */
const MAX_CACHED_FORMATTERS = 256;

/**
 * Returns the cached formatter for `key`, creating and caching it on a miss.
 *
 * @typeParam T - The Intl formatter type.
 * @param cache - The per-kind formatter cache.
 * @param key - The option-set cache key.
 * @param create - Builder for a fresh formatter.
 * @returns The cached (or freshly created) formatter.
 */
export function cachedFormatter<T>(cache: Map<string, T>, key: string, create: () => T): T {
    let formatter = cache.get(key);
    if (formatter === undefined) {
        formatter = create();
        if (cache.size >= MAX_CACHED_FORMATTERS) {
            cache.clear();
        }
        cache.set(key, formatter);
    }
    return formatter;
}
