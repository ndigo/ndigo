/**
 * @author Jeff Rose
 */
import { JSONValue, JSONObject } from '@blue/core';
export interface PropertyResolver {
    getProperty(key: string, defaultValue?: JSONValue): JSONValue;
    getRequiredProperty(key: string): JSONValue;
    hasProperty(key: string): boolean;
}
export interface ConfigurablePropertyResolver extends PropertyResolver {
    propertySources: JSONObject[];
}
/**
 * @param {*} value The value to be tested.
 * @returns {boolean} Whether or not the value is like a {@link PropertyResolver|PropertyResolver}.
 */
export declare const likePropertyResolver: (value: any) => value is PropertyResolver;
/**
 * @implements module:context.PropertyResolver
 */
export declare class PrototypalPropertyResolver implements ConfigurablePropertyResolver {
    #private;
    readonly properties: JSONObject;
    /**
     */
    get propertySources(): JSONObject[];
    set propertySources(propertySources: JSONObject[]);
    constructor(propertySources: JSONObject[]);
    /**
     * @param {string} key
     * @param {module:core.JSONValue} [defaultValue]
     * @returns {module:core.JSONValue}
     */
    getProperty(key: string, defaultValue?: JSONValue): JSONValue;
    /**
     * @param {string} key
     * @returns {module:core.JSONValue}
     */
    getRequiredProperty(key: string): JSONValue;
    /**
     * @param {string} key
     * @returns {boolean}
     */
    hasProperty(key: string): boolean;
}
//# sourceMappingURL=property-resolver.d.ts.map