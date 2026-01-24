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
 * @interface module:context.PropertyResolver
 */

/**
 * Return whether the given property key is available for resolution.
 * @function module:context.PropertyResolver#hasProperty
 * @param {external:string} key The property name to resolve
 * @returns {external:boolean}
 */

/**
 * Return the property value associated with the given `key` or `defaultValue`, if provided, and the key cannot be resolved.
 * @function module:context.PropertyResolver#getProperty
 * @param {external:string} key The property name to resolve
 * @param {T} [defaultValue] The default value to return if no value is found
 * @returns {T}
 */

/**
 * Return the property value associated with the given `key` or throw an error if it cannot be resolved.
 * @function module:context.PropertyResolver#getRequiredProperty
 * @param {external:string} key The property name to resolve
 * @returns {T}
 * @throws {external:Error} If the property cannot be resolved.
 */

/**
 * @interface module:context.ConfigurablePropertyResolver
 * @extends module:context.PropertyResolver
 */

const { defineProperty, getPrototypeOf, setPrototypeOf } = Reflect,
    pathIsDefined = pathSatisfies(complement(isNil)),
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
 * @function module:context.likePropertyResolver
 * @param {*} value The value to be tested.
 * @return {external:boolean} Whether or not the value is like a {@linkcode module:context.PropertyResolver|PropertyResolver}.
 */
export const likePropertyResolver = like({
    getProperty: Function,
    getRequiredProperty: Function,
    hasProperty: Function,
}) as (value) => value is PropertyResolver;

/**
 * @class module:context.PrototypalPropertyResolver
 * @implements module:context.PropertyResolver
 */
export class PrototypalPropertyResolver implements ConfigurablePropertyResolver {
    #propertySources: JSONObject[];
    readonly properties: JSONObject;

    /**
     * @member {external:Array<module:core.JSONObject>} module:context.PrototypalPropertyResolver#propertySources
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
         * @member {module:core.JSONObject} module:context.PrototypalPropertyResolver#properties
         */

        this.propertySources = propertySources;
    }

    /**
     * @function module:context.PrototypalPropertyResolver#getProperty
     * @param {external:string} key
     * @param {module:core.JSONValue} [defaultValue]
     * @returns {module:core.JSONValue}
     */
    getProperty(key: string, defaultValue?: JSONValue): JSONValue {
        const keypath = keypathExpression.run(key).result;
        return keypath ? (path(keypath, this.properties) ?? defaultValue) : defaultValue;
    }

    /**
     * @function module:context.PrototypalPropertyResolver#getRequiredProperty
     * @param {external:string} key
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
     * @function module:context.PrototypalPropertyResolver#hasProperty
     * @param {external:string} key
     * @returns {external:boolean}
     */
    hasProperty(key: string): boolean {
        const keypath = keypathExpression.run(key).result;
        return keypath ? pathIsDefined(keypath, this.properties) : false;
    }
}
