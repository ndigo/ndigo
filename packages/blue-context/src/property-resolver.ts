/**
 * @author Jeff Rose
 */

import { JSONValue, JSONObject, createNull } from '@blue/core';
import { keypathExpression } from '@blue/parser';
import { complement, isNil, like, path, pathSatisfies, reduce } from '@blue/util';

export interface PropertyResolver {
    getProperty(key: string, defaultValue?: JSONValue): JSONValue;
    getRequiredProperty(key: string): JSONValue;
    hasProperty(key: string): boolean;
}

export interface ConfigurablePropertyResolver extends PropertyResolver {
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
    pathIsDefined = (keypath: string[], obj: any): boolean => {
        const predicate = complement(isNil);
        return pathSatisfies(predicate, keypath, obj) as boolean;
    },
    linkPrototype = (current, next) => {
        setPrototypeOf(next, null);
        setPrototypeOf(current, next);
        return getPrototypeOf(current);
    },
    toPrototypeChain = (list: JSONObject[]): JSONObject => {
        const data: JSONObject = createNull();
        reduce(linkPrototype, data)(list);
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
}) as (value) => value is PropertyResolver;

/**
 * @implements module:context.PropertyResolver
 */
export class PrototypalPropertyResolver implements ConfigurablePropertyResolver {
    #propertySources: JSONObject[];
    readonly properties: JSONObject;

    /**
         */
    get propertySources(): JSONObject[] {
        return this.#propertySources;
    }

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
        /**
                 */

        this.propertySources = propertySources;
    }

    /**
         * @param {string} key
     * @param {module:core.JSONValue} [defaultValue]
     * @returns {module:core.JSONValue}
     */
    getProperty(key: string, defaultValue?: JSONValue): JSONValue {
        const parseResult = keypathExpression.run(key);
        if (!parseResult.isError) {
            // Type narrowing: parseResult is Ok<T, D> here
            const keypath = (parseResult as { isError: false; result: any; index: number; data: any }).result;
            return keypath ? (path(keypath, this.properties) ?? defaultValue) : defaultValue;
        }
        return defaultValue;
    }

    /**
         * @param {string} key
     * @returns {module:core.JSONValue}
     */
    getRequiredProperty(key: string): JSONValue {
        const value = this.getProperty(key);
        if (typeof value === 'undefined') {
            throw new Error(`Required property "${key}" missing`);
        }
        return value;
    }

    /**
         * @param {string} key
     * @returns {boolean}
     */
    hasProperty(key: string): boolean {
        const parseResult = keypathExpression.run(key);
        if (!parseResult.isError) {
            // Type narrowing: parseResult is Ok<T, D> here
            const keypath = (parseResult as { isError: false; result: any; index: number; data: any }).result;
            return keypath ? pathIsDefined(keypath, this.properties) : false;
        }
        return false;
    }
}
