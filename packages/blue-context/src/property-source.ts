import { JSONObject, JSONValue, createNull, parseKeypath } from '@blue/core';
import { isNil } from '@blue/util/types';

/**
 * A named, ordered property source backed by a plain object.
 *
 * Instances are created through {@link wrapSource}, which captures the given
 * object into a null-prototype copy — registering a source never exposes the
 * live caller object, and remains safe even if the caller mutates it later.
 * Property values are resolved by keypath (`a.b.c`, `items[0].name`).
 *
 * @see module:context.PropertySources
 * @see module:context.ConfigurableEnvironment
 */
export interface PropertySource {
    /**
     * The stable name of this source, used as an anchor for reordering.
     */
    readonly name: string;
    /**
     * The captured property values of this source.
     */
    readonly properties: JSONObject;
    /**
     * Resolves a property from this source, or `undefined` when absent.
     *
     * @param key - The property name to resolve (keypath syntax).
     * @returns The resolved value, or `undefined`.
     */
    getProperty(key: string): JSONValue | undefined;
    /**
     * Returns whether a property resolves to a non-null value from this source.
     *
     * @param key - The property name to check (keypath syntax).
     * @returns `true` when the property is defined.
     */
    containsProperty(key: string): boolean;
}

/**
 * Default {@link PropertySource} implementation wrapping a captured object.
 */
export class MapPropertySource implements PropertySource {
    #name: string;
    #properties: JSONObject;

    /**
     * The stable name of this source.
     */
    get name(): string {
        return this.#name;
    }

    /**
     * The captured property values of this source.
     */
    get properties(): JSONObject {
        return this.#properties;
    }

    /**
     * Creates a property source over the given object.
     *
     * @param name - The stable source name.
     * @param properties - The property values backing this source.
     */
    constructor(name: string, properties: JSONObject) {
        this.#name = name;
        this.#properties = properties;
    }

    getProperty(key: string): JSONValue | undefined {
        const keypath = parseKeypath(key);
        if (!keypath) return undefined;
        let value: unknown = this.#properties;
        for (const token of keypath) {
            if (value === null || typeof value !== 'object') return undefined;
            // Narrowed object: index by the parsed token; structural cast only.
            value = (value as Record<number | string, unknown>)[token];
        }
        return value as JSONValue | undefined;
    }

    containsProperty(key: string): boolean {
        const keypath = parseKeypath(key);
        if (!keypath) return false;
        return !isNil(this.getProperty(key));
    }
}

/**
 * Normalizes Spring-style dotted keys (`server.port`) into nested objects
 * (`server: { port: ... }`) so keypath resolution can find them.
 *
 * Produces a null-prototype copy — registration stays immune to caller
 * mutation and prototype pollution. Nested keys win collision (whatever
 * entry is processed last); `__proto__`-named segments land as plain data
 * properties via the null-prototype target.
 *
 * @param source - The property values to capture.
 * @returns The normalized, captured property values.
 */
function nestDottedKeys(source: JSONObject): JSONObject {
    const out: JSONObject = createNull();
    for (const [key, value] of Object.entries(source)) {
        // Array-index paths (`items[0].name`) would be corrupted by nesting —
        // leave them literal (keypath resolution still handles them).
        if (!key.includes('.') || key.includes('[')) {
            out[key] = value;
            continue;
        }
        const segments = key.split('.');
        let cursor: JSONObject = out;
        for (let index = 0; index < segments.length - 1; index++) {
            const segment = segments[index];
            const existing = cursor[segment];
            if (existing === null || typeof existing !== 'object' || Array.isArray(existing)) {
                const next: JSONObject = createNull();
                cursor[segment] = next;
                cursor = next;
            } else {
                cursor = existing as JSONObject;
            }
        }
        cursor[segments[segments.length - 1]] = value;
    }
    return out;
}

/**
 * Creates a {@link PropertySource} that captures the given object.
 *
 * The object is copied into a null-prototype plain object, so registration is
 * immune to later caller mutation and to `__proto__`-named keys becoming
 * prototype pollution. Sources are replaced, not mutated.
 *
 * @param name - The stable source name (used as an anchor for reordering).
 * @param source - The property values to capture.
 * @returns The captured property source.
 */
export function wrapSource(name: string, source: JSONObject): PropertySource {
    return new MapPropertySource(name, nestDottedKeys(source));
}
