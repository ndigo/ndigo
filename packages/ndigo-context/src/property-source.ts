/**
 * Named property source contract and `MapPropertySource`.
 */
import { JSONObject, JSONValue, createNull, getPath, KeypathConverter } from '@ndigo/core';
import { isNil } from '@ndigo/util/types';

const keypathConverter = new KeypathConverter();
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
    /**
     * The `Symbol.toStringTag` value for this instance.
     *
     * `Object.prototype.toString()` reads this symbol to render the
     * instance as `"[object <tag>]" ` (see MDN: Symbol.toStringTag).
     *
     * @returns The string "MapPropertySource".
     *
     * @example
     * console.log(Object.prototype.toString.call(instance)); // "[object MapPropertySource]"
     */
    get [Symbol.toStringTag](): string {
        return 'MapPropertySource';
    }

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

    /** Gets a property. @param key - The key. @returns The value. */
    getProperty(key: string): JSONValue | undefined {
        const keypath = keypathConverter.convert(key);
        if (!keypath) return undefined;
        return getPath(keypath, this.#properties) as JSONValue | undefined;
    }

    /** Whether a property exists. @param key - The key. @returns `true` when present. */
    containsProperty(key: string): boolean {
        const keypath = keypathConverter.convert(key);
        if (!keypath) return false;
        return !isNil(this.getProperty(key));
    }
}

/**
 * Normalizes dotted and bracketed keys (`server.port`, `items[0].title`)
 * into nested objects (`server: { port: ... }`, `items: [{ title }]`) so
 * keypath resolution can find them.
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
        const tokens = keypathConverter.convert(key);
        // Unparseable key: keep it literal (matches the previous behaviour for
        // keys that were neither dotted nor bracketed).
        if (!tokens) {
            out[key] = value;
            continue;
        }
        // Single token: assign directly.
        if (tokens.length === 1) {
            out[tokens[0]] = value;
            continue;
        }
        // Walk/create intermediate containers by token. Objects stay
        // null-prototype (prototype-pollution safety); numeric indices create
        // arrays. This is what adds bracket-key support to writes: a key such
        // as `items[0].title` now nests into `{ items: [{ title }] }`
        // instead of staying a literal property.
        let cursor: unknown = out;
        for (let index = 0; index < tokens.length - 1; index++) {
            const token = tokens[index];
            const nextToken = tokens[index + 1];
            const container = cursor as Record<PropertyKey, unknown>;
            const existing = container[token];
            let child: unknown;
            if (typeof nextToken === 'number') {
                child = Array.isArray(existing) ? existing : [];
                if (!Array.isArray(existing)) {
                    container[token] = child;
                }
            } else if (existing === null || typeof existing !== 'object') {
                child = createNull();
                container[token] = child;
            } else {
                child = existing;
            }
            cursor = child;
        }
        (cursor as Record<PropertyKey, unknown>)[tokens[tokens.length - 1]] = value;
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
