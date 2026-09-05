import { IllegalStateError, JSONValue, JSONObject, createNull, parseKeypath } from '@blue/core';
import type { KeypathToken } from '@blue/core';
import { like, isNil } from '@blue/util/types';

/**
 * Resolves property values from a configured set of sources.
 */
export interface PropertyResolver {
    /**
     * Resolves a property value, falling back to a default when missing.
     *
     * @param key - The property name to resolve.
     * @param defaultValue - The value to return when no property is found.
     * @returns The resolved property value or the default value.
     */
    getProperty(key: string, defaultValue?: JSONValue): JSONValue | undefined;
    /**
     * Returns the resolved property value or throws when missing.
     *
     * @param key - The property name to resolve.
     * @returns The resolved property value.
     * @throws {IllegalStateError} When the property cannot be resolved.
     */
    getRequiredProperty(key: string): JSONValue;
    /**
     * Returns whether a property key can be resolved.
     *
     * @param key - The property name to resolve.
     * @returns `true` when the property exists.
     */
    hasProperty(key: string): boolean;
}

/**
 * Property resolver that exposes mutable property sources.
 */
export interface ConfigurablePropertyResolver extends PropertyResolver {
    /**
     * The ordered set of property sources used during resolution.
     */
    propertySources: JSONObject[];
}

/**
 * Interface for resolving properties against any underlying source.
 */

/**
 * Return whether the given property key is available for resolution.
 * @param {string} key The property name to resolve
 * @returns {boolean}
 */

/**
 * Return the property value associated with the given `key` or `defaultValue`, if provided, and the key cannot be resolved.
 * @param {string} key The property name to resolve
 * @param {T} [defaultValue] The default value to return if no value is found
 * @returns {T}
 */

/**
 * Return the property value associated with the given `key` or throw an error if it cannot be resolved.
 * @param {string} key The property name to resolve
 * @returns {T}
 * @throws {Error} If the property cannot be resolved.
 */

/**
 * @extends module:context.PropertyResolver
 */

const { defineProperty, getPrototypeOf, setPrototypeOf } = Reflect,
    pathIsDefined = (keypath: KeypathToken[], obj: any): boolean => {
        const value = keypath.reduce((acc: any, k) => acc?.[k], obj);
        return !isNil(value);
    },
    linkPrototype = (current: any, next: any) => {
        setPrototypeOf(next, null);
        setPrototypeOf(current, next);
        return getPrototypeOf(current);
    },
    toPrototypeChain = (list: JSONObject[]): JSONObject => {
        const data: JSONObject = createNull();
        list.reduce(linkPrototype, data);
        return data;
    };

/**
 * @param {*} value The value to be tested.
 * @returns {boolean} Whether or not the value is like a {@link PropertyResolver|PropertyResolver}.
 */
export const likePropertyResolver = like({
    getProperty: Function,
    getRequiredProperty: Function,
    hasProperty: Function,
}) as (value: any) => value is PropertyResolver;

/**
 * Property resolver that layers sources through a prototype chain for lookup.
 */
export class PrototypalPropertyResolver implements ConfigurablePropertyResolver {
    #propertySources!: JSONObject[];
    readonly properties!: JSONObject;

    /**
     * The ordered set of configured property sources.
     */
    get propertySources(): JSONObject[] {
        return this.#propertySources;
    }

    /**
     * Replaces the property sources and rebuilds the prototype chain used for lookups.
     *
     * @param propertySources - The new property sources.
     */
    set propertySources(propertySources) {
        this.#propertySources = propertySources;
        defineProperty(this, 'properties', {
            value: propertySources.length === 1 ? propertySources[0] : toPrototypeChain(propertySources),
            configurable: true,
            enumerable: false,
            writable: false,
        });
    }

    constructor(propertySources: JSONObject[]) {
        this.propertySources = propertySources;
    }

    /**
     * Resolves a property value from the configured sources.
     *
     * @param key - The property name to resolve.
     * @param defaultValue - The value to return when the property is missing.
     * @returns The resolved property value or the default value.
     */
    getProperty(key: string, defaultValue?: JSONValue): JSONValue | undefined {
        const keypath = parseKeypath(key);
        if (!keypath) return defaultValue ?? undefined;
        const value = keypath.reduce((acc: any, k) => acc?.[k], this.properties as any);
        return value ?? (defaultValue === undefined ? undefined : defaultValue);
    }

    /**
     * Resolves a required property value.
     *
     * @param key - The property name to resolve.
     * @returns The resolved property value.
     * @throws {IllegalStateError} When the property cannot be resolved.
     */
    getRequiredProperty(key: string): JSONValue {
        const value = this.getProperty(key);
        if (typeof value === 'undefined') {
            throw new IllegalStateError(`Required property "${key}" missing`);
        }
        return value;
    }

    /**
     * Returns whether the property can be resolved.
     *
     * @param key - The property name to resolve.
     * @returns `true` when the property exists.
     */
    hasProperty(key: string): boolean {
        const keypath = parseKeypath(key);
        return keypath ? pathIsDefined(keypath, this.properties) : false;
    }
}
