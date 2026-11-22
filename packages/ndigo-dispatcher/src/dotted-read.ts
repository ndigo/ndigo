/**
 * Shared dotted-keypath read for the nested-capable value sources (D-2).
 *
 * A nested-capable source (`body:value`, `request-session:value`,
 * `history-state:value`, `attribute:value`) supports both flat keys and
 * dotted traversal (`bodyValue('address.city')`). Exact key hits always win
 * (a literal `a.b` key in the source beats the walk); otherwise the key is
 * key is split on `.` and walked object by object, stopping at the first
 * non-traversable value. This is a read helper — it never constructs or
 * mutates, so it stays distinct from {@link DataBinder}.
 *
 * Grammar boundary: this walk supports dot-separated keys ONLY — bracketed
 * paths (`items[0].name`) belong to the {@link parseKeypath} grammar in
 * \@ndigo/core (DataBinder's keypath family). A dotted source key that needs
 * array indexing should use a DataBinder-bound source instead.
 */
import { getPath } from '@ndigo/core';

/**
 * Reads a value from a record by exact key or dotted keypath.
 *
 * @param source - The record to read from, or `undefined`.
 * @param key - The flat or dotted key (`'email'`, `'address.city'`).
 * @returns The value at the key, or `undefined` when the key is absent or
 *   the walk leaves the object graph.
 *
 * @example
 * ```ts
 * const value = readDottedValue(source, 'address.city');
 * ```
 */
export function readDottedValue(source: Record<string, unknown> | undefined, key: string): unknown {
    if (!source) {
        return undefined;
    }
    if (Object.prototype.hasOwnProperty.call(source, key)) {
        return source[key];
    }
    if (!key.includes('.')) {
        return undefined;
    }
    // Delegate the walk to core's getPath (property access, non-traversable
    // intermediates yield undefined). Exact-key and dot-only guards above
    // preserve readDottedValue's contract.
    return getPath(key.split('.'), source);
}
