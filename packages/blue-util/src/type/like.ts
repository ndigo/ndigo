/**
 * @module blue-util
 * @since 1.0.0
 * @author Jeff Rose
 */
export type LikeDescriptor = { [key: string]: Function | true };

/**
 * Determines whether a given value matches the criteria.
 *
 * **Implementation Strategy:**
 *
 * This function uses a **cached native approach** for maximum performance:
 *
 * 1. **WeakMap caching** of descriptor metadata (keys, types, isTrue flags)
 *    to avoid repeated `Object.entries()` calls
 * 2. **Direct array iteration** with inline type checks (no helper functions)
 * 3. **Inline type checking** using `typeof` for Function and `Object.prototype.toString.call()`
 *    for Boolean/Number/String/Object
 * 4. **Early return** on first failed check (short-circuit evaluation)
 *
 * **Semantic Compatibility:**
 *
 * Maintains exact compatibility with the original implementation:
 * - Top-level value must not be null/undefined
 * - Property values of `null` always pass
 * - Type checking handles both primitives and boxed values
 * - Property presence checked with `in` operator
 *
 * **Performance:**
 *
 * - **Fresh descriptor**: 43x faster than (removed Ramda) (101,620 Hz vs 2,353 Hz)
 * - **Cached descriptor**: 201x faster than (removed Ramda) (473,061 Hz vs 2,353 Hz)
 * - **Typical usage** (module-level const): Benefits from caching on every call
 *
 * **Codebase Usage:**
 *
 * This function is used 60+ times across the codebase, primarily in the
 * pattern `export const likePromise = like({ then: Function })` where the
 * descriptor is created once at module load and reused many times.
 *
 * @category Type
 * @param {LikeDescriptor} descriptor - Object describing the expected shape
 * @param {*} value - The value to be tested (optional, for curried usage)
 * @returns {boolean | Function} Whether value matches, or a curried function
 *
 * @example
 * const wxy = { w: true, x: Number, y: Number };
 * like( wxy, { w: {}, x: 123, y: 456 } );
 * //=> true
 * like( wxy, { w: 'abc', x: 123, z: 789 } );
 * //=> false
 *
 * const likeWXY = like( wxy );
 * likeWXY( { w: {}, x: 123, y: 456 } );
 * //=> true
 * likeWXY( { w: 'abc', x: 123, y: 456, z: 789 } );
 * //=> true
 * likeWXY( { w: true, x: 123, y: '456' } );
 * //=> false
 * likeWXY( { w: 0, x: 123, z: 789 } );
 * //=> false
 *
 * @see {@link https://en.wikipedia.org/wiki/Duck_typing}
 */

/**
 * Descriptor cache: WeakMap ensures descriptors are garbage-collected
 * when no longer referenced, preventing memory leaks.
 */
const descriptorCache = new WeakMap<
    LikeDescriptor,
    {
        keys: string[];
        types: (Function | true)[];
        isTrue: boolean[];
    }
>();

/**
 * Compute descriptor metadata for fast property checking.
 *
 * Extracts keys and types into parallel arrays, avoiding repeated
 * Object.entries() calls and property lookups.
 */
function computeDescriptor(descriptor: LikeDescriptor): {
    keys: string[];
    types: (Function | true)[];
    isTrue: boolean[];
} {
    const entries = Object.entries(descriptor);
    const keys = new Array(entries.length);
    const types = new Array(entries.length);
    const isTrue = new Array(entries.length);

    for (let i = 0; i < entries.length; i++) {
        keys[i] = entries[i][0];
        types[i] = entries[i][1];
        isTrue[i] = entries[i][1] === true;
    }

    return { keys, types, isTrue };
}

/**
 * Check if value matches descriptor using cached metadata.
 *
 * **Semantic Rules:**
 * - Top-level value must not be null/undefined
 * - Property values of `null` always pass
 * - Type checking uses `typeof` for Function, `Object.prototype.toString.call()` for others
 * - Property presence checked with `in` operator
 */
function checkLike(cached: { keys: string[]; types: (Function | true)[]; isTrue: boolean[] }, value: unknown): boolean {
    // Top-level nil check
    if (value == null) return false;
    if (typeof value !== 'object' && typeof value !== 'function') return false;

    const { keys, types, isTrue } = cached;

    for (let i = 0; i < keys.length; i++) {
        if (isTrue[i]) {
            // Property presence check
            if (!(keys[i] in value)) return false;
        } else {
            // Arbitrary structured input: unknown property reflection after the guard above
            const record = value as Record<string, unknown>;
            const prop = record[keys[i]];

            // Null property values always pass
            if (prop === null) continue;

            // Undefined property values fail
            if (prop == null) return false;

            // Type checking using typeof and Object.prototype.toString for common types
            const type = types[i];
            if (type === Function) {
                if (typeof prop !== 'function') return false;
            } else if (type === Boolean || type === Number || type === String || type === Object) {
                // toString for reliable primitive + boxed detection
                const tag = Object.prototype.toString.call(prop);
                if (type === Boolean && tag !== '[object Boolean]') return false;
                else if (type === Number && tag !== '[object Number]') return false;
                else if (type === String && tag !== '[object String]') return false;
                else if (type === Object && tag !== '[object Object]') return false;
            } else {
                // Descriptor values are Function | true; the isTrue branch handled `true`
                const Ctor = type as Function;
                if (!(prop instanceof Ctor)) return false;
            }
        }
    }

    return true;
}

// --------------------------------------------------------------------
//  Public API
// --------------------------------------------------------------------

function like(descriptor: LikeDescriptor, value: unknown): boolean;
function like(descriptor: LikeDescriptor): (value: unknown) => boolean;
function like(descriptor: LikeDescriptor, value?: unknown): boolean | ((value: unknown) => boolean) {
    // Get or create cached descriptor metadata
    let cached = descriptorCache.get(descriptor);
    if (!cached) {
        cached = computeDescriptor(descriptor);
        descriptorCache.set(descriptor, cached);
    }

    // Two-arg form: immediate evaluation
    if (arguments.length >= 2) {
        return checkLike(cached, value);
    }

    // Single-arg form: return curried function
    return (v: unknown): boolean => checkLike(cached, v);
}

export default like;
