/**
 * Shared dotted-keypath read for the nested-capable value sources (D-2).
 *
 * A nested-capable source (`body:value`, `request-session:value`,
 * `history-state:value`, `attribute:value`) supports both flat keys and
 * dotted traversal (`bodyValue('address.city')`). Exact key hits always win
 * (a literal `a.b` key in the source beats the walk); otherwise the key is
 * split on `.` and walked object by object, stopping at the first
 * non-traversable value. This is a read helper — it never constructs or
 * mutates, so it stays distinct from {@link DataBinder}.
 *
 * @module blue-dispatcher
 * @since 1.0.0
 * @author Jeff Rose
 */
import { isNil } from '@blue/util/types';

/**
 * Reads a value from a record by exact key or dotted keypath.
 *
 * @param source - The record to read from, or `undefined`.
 * @param key - The flat or dotted key (`'email'`, `'address.city'`).
 * @returns The value at the key, or `undefined` when the key is absent or
 *   the walk leaves the object graph.
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
    const tokens = key.split('.');
    let value: unknown = source;
    const length = tokens.length;
    for (let index = 0; index < length; index++) {
        const token = tokens[index];
        // Only plain objects are traversable — a nil or non-object value ends
        // the walk, as does a missing property.
        if (isNil(value) || typeof value !== 'object' || !Object.prototype.hasOwnProperty.call(value, token)) {
            return undefined;
        }
        value = (value as Record<string, unknown>)[token];
    }
    return value;
}
