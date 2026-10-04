/**
 * @module blue-redis
 * @since 1.0.0
 * @author Jeff Rose
 */

/** Validate JSON values without silently dropping fields or invoking getters/toJSON. */
function validate(value: unknown, ancestors: Set<object>, depth: number): void {
    if (value === null || typeof value === 'string' || typeof value === 'boolean') return;
    if (typeof value === 'number' && Number.isFinite(value) && !Object.is(value, -0)) return;
    if (typeof value !== 'object' || value === null || depth > 100 || ancestors.has(value)) {
        throw new TypeError('RedisCache: unsupported JSON value (including cycles, negative zero or excessive depth)');
    }
    const array = Array.isArray(value);
    const prototype = Object.getPrototypeOf(value);
    if (!array && prototype !== Object.prototype && prototype !== null) {
        throw new TypeError('RedisCache: only plain objects and arrays are supported');
    }
    if (array && prototype !== Array.prototype) {
        throw new TypeError('RedisCache: array subclasses are not supported');
    }
    const keys = Reflect.ownKeys(value);
    if (array && keys.length !== value.length + 1) {
        throw new TypeError('RedisCache: sparse arrays and extra array properties are not supported');
    }
    ancestors.add(value);
    try {
        for (const key of keys) {
            if (array && key === 'length') continue;
            if (typeof key !== 'string' || (array && !/^(0|[1-9][0-9]*)$/.test(key))) {
                throw new TypeError('RedisCache: symbol keys and extra array properties are not supported');
            }
            const descriptor = Object.getOwnPropertyDescriptor(value, key);
            if (descriptor === undefined || !descriptor.enumerable || !('value' in descriptor)) {
                throw new TypeError('RedisCache: accessors and non-enumerable properties are not supported');
            }
            validate(descriptor.value, ancestors, depth + 1);
        }
    } finally {
        ancestors.delete(value);
    }
}

/**
 * Serializes a cached value into the versioned envelope. `undefined` is
 * supported only as the whole cached value; every other value must be a
 * finite plain JSON value (cycles, accessors, non-enumerable or symbol keys,
 * negative zero and excessive depth are rejected).
 *
 * @param value - The value to persist.
 * @returns The envelope string stored in Redis.
 */
export function encode(value: unknown): string {
    if (value === undefined) return '["blue-cache",1,"undefined"]';
    validate(value, new Set(), 0);
    return JSON.stringify(['blue-cache', 1, 'value', value]);
}

/**
 * Deserializes a value from the versioned envelope. Corrupt or unknown
 * formats are errors, never cache misses — a poisoned entry must surface
 * rather than silently read as absent.
 *
 * @param payload - The envelope string read from Redis.
 * @returns The stored value.
 */
export function decode(payload: string): unknown {
    let envelope: unknown;
    try {
        envelope = JSON.parse(payload);
    } catch {
        throw new TypeError('RedisCache: corrupt serialization envelope');
    }
    if (Array.isArray(envelope) && envelope[0] === 'blue-cache' && envelope[1] === 1) {
        if (envelope.length === 3 && envelope[2] === 'undefined') return undefined;
        if (envelope.length === 4 && envelope[2] === 'value') {
            validate(envelope[3], new Set(), 0);
            return envelope[3];
        }
    }
    throw new TypeError('RedisCache: corrupt or unsupported serialization envelope');
}
