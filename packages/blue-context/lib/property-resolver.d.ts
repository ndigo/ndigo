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
 * @function module:context.likePropertyResolver
 * @param {*} value The value to be tested.
 * @return {external:boolean} Whether or not the value is like a {@linkcode module:context.PropertyResolver|PropertyResolver}.
 */
export declare const likePropertyResolver: (value: any) => value is PropertyResolver;
/**
 * @class module:context.PrototypalPropertyResolver
 * @implements module:context.PropertyResolver
 */
export declare class PrototypalPropertyResolver implements ConfigurablePropertyResolver {
    #private;
    readonly properties: JSONObject;
    /**
     * @member {external:Array<module:core.JSONObject>} module:context.PrototypalPropertyResolver#propertySources
     */
    get propertySources(): JSONObject[];
    set propertySources(propertySources: JSONObject[]);
    constructor(propertySources: JSONObject[]);
    /**
     * @function module:context.PrototypalPropertyResolver#getProperty
     * @param {external:string} key
     * @param {module:core.JSONValue} [defaultValue]
     * @returns {module:core.JSONValue}
     */
    getProperty(key: string, defaultValue?: JSONValue): JSONValue;
    /**
     * @function module:context.PrototypalPropertyResolver#getRequiredProperty
     * @param {external:string} key
     * @returns {module:core.JSONValue}
     */
    getRequiredProperty(key: string): JSONValue;
    /**
     * @function module:context.PrototypalPropertyResolver#hasProperty
     * @param {external:string} key
     * @returns {external:boolean}
     */
    hasProperty(key: string): boolean;
}
//# sourceMappingURL=property-resolver.d.ts.map