/**
 * @author Jeff Rose
 */
import { createNull } from '@blue/core';
import { keypathExpression } from '@blue/parser';
import { complement, isNil, like, path, pathSatisfies, reduce } from '@blue/util';
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
const { defineProperty, getPrototypeOf, setPrototypeOf } = Reflect, pathIsDefined = (keypath, obj) => {
    const predicate = complement(isNil);
    return pathSatisfies(predicate, keypath, obj);
}, linkPrototype = (current, next) => {
    setPrototypeOf(next, null);
    setPrototypeOf(current, next);
    return getPrototypeOf(current);
}, toPrototypeChain = (list) => {
    const data = createNull();
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
});
/**
 * @class module:context.PrototypalPropertyResolver
 * @implements module:context.PropertyResolver
 */
export class PrototypalPropertyResolver {
    #propertySources;
    properties;
    /**
     * @member {external:Array<module:core.JSONObject>} module:context.PrototypalPropertyResolver#propertySources
     */
    get propertySources() {
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
    constructor(propertySources) {
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
    getProperty(key, defaultValue) {
        const parseResult = keypathExpression.run(key);
        if (!parseResult.isError) {
            // Type narrowing: parseResult is Ok<T, D> here
            const keypath = parseResult.result;
            return keypath ? (path(keypath, this.properties) ?? defaultValue) : defaultValue;
        }
        return defaultValue;
    }
    /**
     * @function module:context.PrototypalPropertyResolver#getRequiredProperty
     * @param {external:string} key
     * @returns {module:core.JSONValue}
     */
    getRequiredProperty(key) {
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
    hasProperty(key) {
        const parseResult = keypathExpression.run(key);
        if (!parseResult.isError) {
            // Type narrowing: parseResult is Ok<T, D> here
            const keypath = parseResult.result;
            return keypath ? pathIsDefined(keypath, this.properties) : false;
        }
        return false;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvcGVydHktcmVzb2x2ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvcHJvcGVydHktcmVzb2x2ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7O0dBRUc7QUFFSCxPQUFPLEVBQXlCLFVBQVUsRUFBRSxNQUFNLFlBQVksQ0FBQztBQUMvRCxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSxjQUFjLENBQUM7QUFDakQsT0FBTyxFQUFFLFVBQVUsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxhQUFhLEVBQUUsTUFBTSxFQUFFLE1BQU0sWUFBWSxDQUFDO0FBWWxGOzs7R0FHRztBQUVIOzs7OztHQUtHO0FBRUg7Ozs7OztHQU1HO0FBRUg7Ozs7OztHQU1HO0FBRUg7OztHQUdHO0FBRUgsTUFBTSxFQUFFLGNBQWMsRUFBRSxjQUFjLEVBQUUsY0FBYyxFQUFFLEdBQUcsT0FBTyxFQUM5RCxhQUFhLEdBQUcsQ0FBQyxPQUFpQixFQUFFLEdBQVEsRUFBVyxFQUFFO0lBQ3JELE1BQU0sU0FBUyxHQUFHLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUNwQyxPQUFPLGFBQWEsQ0FBQyxTQUFTLEVBQUUsT0FBTyxFQUFFLEdBQUcsQ0FBWSxDQUFDO0FBQzdELENBQUMsRUFDRCxhQUFhLEdBQUcsQ0FBQyxPQUFPLEVBQUUsSUFBSSxFQUFFLEVBQUU7SUFDOUIsY0FBYyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztJQUMzQixjQUFjLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQzlCLE9BQU8sY0FBYyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQ25DLENBQUMsRUFDRCxnQkFBZ0IsR0FBRyxDQUFDLElBQWtCLEVBQWMsRUFBRTtJQUNsRCxNQUFNLElBQUksR0FBZSxVQUFVLEVBQUUsQ0FBQztJQUN0QyxNQUFNLENBQUMsYUFBYSxFQUFFLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO0lB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