/**
 * Read and write helpers for parsed keypaths.
 */
import { KeypathToken } from './keypath-converter.js';

/**
 * Reads the value at `tokens` in `obj`, returning `undefined` when the path
 * is absent or leaves the object graph.
 *
 * @param tokens - The parsed keypath tokens.
 * @param obj - The root object to read from.
 * @returns The value at the path, or `undefined`.
 *
 * @example
 * ```ts
 * getPath(['user', 'name'], { user: { name: 'ndigo' } }); // 'ndigo'
 * ```
 */
export function getPath(tokens: KeypathToken[], obj: unknown): unknown {
    let value: unknown = obj;
    for (const token of tokens) {
        if (value === null || typeof value !== 'object') {
            return undefined;
        }
        value = (value as Record<PropertyKey, unknown>)[token];
    }
    return value;
}

/**
 * Sets `value` at `tokens` in `obj`, preserving class-instance prototypes
 * (mutating in place) and using immutable spread for plain and null-prototype
 * objects. Returns the (possibly new) root object.
 *
 * An empty token list replaces the root: `setPath([], value, obj)` returns
 * `value`.
 *
 * @param tokens - The parsed keypath tokens.
 * @param value - The value to set.
 * @param obj - The root object to update.
 * @returns The updated root object.
 *
 * @example
 * ```ts
 * setPath(['user', 'name'], 'ndigo', { user: { name: 'old' } });
 * ```
 */
export function setPath(tokens: KeypathToken[], value: unknown, obj: unknown): unknown {
    if (tokens.length === 0) return value;
    const head = tokens[0];
    const tail = tokens.slice(1);
    const current = (obj as Record<PropertyKey, unknown> | undefined)?.[head];
    const updatedChild = setPath(
        tail,
        value,
        tail.length > 0 && typeof tail[0] === 'number' ? (Array.isArray(current) ? current : []) : (current ?? {})
    );
    if (typeof head === 'number') {
        const arr = Array.isArray(obj) ? [...(obj as unknown[])] : [];
        arr[head] = updatedChild;
        return arr;
    }
    // Class instances (whole-source binding into a DTO target) keep their
    // prototype and identity: spread would flatten the instance into a plain
    // object and break `instanceof`. Plain and null-prototype objects keep the
    // immutable spread semantics.
    const proto = Object.getPrototypeOf(obj);
    if (proto === Object.prototype || proto === null) {
        return { ...(obj as object), [head]: updatedChild };
    }
    (obj as Record<PropertyKey, unknown>)[head] = updatedChild;
    return obj;
}
