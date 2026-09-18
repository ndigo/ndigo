/**
 * @module blue-cache
 * @since 1.0.0
 * @author Jeff Rose
 */

/**
 * Stable string key for an argument list (memoization and `@cached` default
 * key semantics): JSON serialization of the argument array.
 *
 * Semantics are JSON's: `undefined` and `null` collapse, object key
 * insertion order is significant (`{a:1,b:2}` ≠ `{b:2,a:1}`), and circular
 * structures throw (a programming error that surfaces loudly rather than
 * producing colliding keys).
 *
 * @param args - The method/function arguments.
 * @returns The cache key.
 */
export function serializeCacheKey(...args: unknown[]): string {
    return JSON.stringify(args);
}

/**
 * Narrower for thenable values (Promises and Promise-likes).
 *
 * @param value - The value to test.
 * @returns Whether the value exposes a `then` method.
 */
export const isPromiseLike = (value: unknown): value is PromiseLike<unknown> =>
    value !== null &&
    (typeof value === 'object' || typeof value === 'function') &&
    typeof (value as PromiseLike<unknown>).then === 'function';
