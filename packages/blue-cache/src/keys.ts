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
 * **Collision classes** — values JSON merges map to one key, which can serve
 * the wrong cached entry:
 * - `undefined` and `null` collapse (`[undefined]` and `[null]` are equal)
 * - object key insertion order is significant (see above)
 *
 * Callers that must not merge these should pass {@link serializeCacheKeyStrict}
 * as the `key:` option of {@link memoize} / the `@cached` decorator.
 *
 * @param args - The method/function arguments.
 * @returns The cache key.
 */
export function serializeCacheKey(...args: unknown[]): string {
    return JSON.stringify(args);
}

/**
 * Type-preserving alternative to {@link serializeCacheKey}: each argument is
 * tagged with its kind before serialization, so values that `JSON` silently
 * merges are keyed distinctly. This resolves the `[undefined]`/`[null]`
 * collision (M1) and makes primitive types explicit.
 *
 * Semantics vs {@link serializeCacheKey}:
 * - `undefined` and `null` are distinct (`[undefined]` ≠ `[null]`)
 * - primitives carry their type (`1` ≠ `"1"` ≠ `true`; `NaN`/`Infinity` stable)
 * - objects/arrays fall back to `JSON.stringify`, tagged as such (object key
 *   order remains significant — canonicalise caller-side if that matters)
 * - circular structures throw, matching {@link serializeCacheKey}
 *
 * The per-argument tags are non-null strings, so wrapping them in an array and
 * serializing never reintroduces JSON's undefined/`null` collapse.
 *
 * Use this via the `key:` option of {@link memoize} / the `@cached` decorator
 * when the default's JSON semantics would be a footgun.
 *
 * @param args - The method/function arguments.
 * @returns The cache key.
 */
export function serializeCacheKeyStrict(...args: unknown[]): string {
    return JSON.stringify(args.map(tagValue));
}

/**
 * Tags a single argument with its kind so distinct values never collide after
 * serialization. Returns a non-null, non-empty string for every input (so the
 * outer `JSON.stringify` in {@link serializeCacheKeyStrict} cannot collapse it).
 */
function tagValue(value: unknown): string {
    if (value === undefined) {
        return 'undef';
    }
    if (value === null) {
        return 'null';
    }
    switch (typeof value) {
        case 'string':
            return `s:${JSON.stringify(value)}`;
        case 'number':
            return `n:${String(value)}`;
        case 'boolean':
            return `b:${value ? '1' : '0'}`;
        case 'bigint':
            return `bi:${value.toString()}`;
        case 'symbol':
            return `sy:(${value.description ?? ''})`;
        case 'function':
            return `f:${value.name || 'fn'}`;
        default:
            // object / any other reference type
            return `o:${JSON.stringify(value)}`;
    }
}
