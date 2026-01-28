/**
 * @author Jeff Rose
 */
import { createNull } from '@blue/core';
import { keypathExpression } from '@blue/parser';
import { complement, isNil, like, path, pathSatisfies, reduce } from '@blue/util';
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
 * @param {*} value The value to be tested.
 * @returns {boolean} Whether or not the value is like a {@link PropertyResolver|PropertyResolver}.
 */
export const likePropertyResolver = like({
    getProperty: Function,
    getRequiredProperty: Function,
    hasProperty: Function,
});
/**
 * @implements module:context.PropertyResolver
 */
export class PrototypalPropertyResolver {
    #propertySources;
    properties;
    /**
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
         */
        this.propertySources = propertySources;
    }
    /**
     * @param {string} key
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
     * @param {string} key
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
     * @param {string} key
     * @returns {boolean}
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvcGVydHktcmVzb2x2ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvcHJvcGVydHktcmVzb2x2ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7O0dBRUc7QUFFSCxPQUFPLEVBQXlCLFVBQVUsRUFBRSxNQUFNLFlBQVksQ0FBQztBQUMvRCxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSxjQUFjLENBQUM7QUFDakQsT0FBTyxFQUFFLFVBQVUsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxhQUFhLEVBQUUsTUFBTSxFQUFFLE1BQU0sWUFBWSxDQUFDO0FBWWxGOztHQUVHO0FBRUg7Ozs7R0FJRztBQUVIOzs7OztHQUtHO0FBRUg7Ozs7O0dBS0c7QUFFSDs7R0FFRztBQUVILE1BQU0sRUFBRSxjQUFjLEVBQUUsY0FBYyxFQUFFLGNBQWMsRUFBRSxHQUFHLE9BQU8sRUFDOUQsYUFBYSxHQUFHLENBQUMsT0FBaUIsRUFBRSxHQUFRLEVBQVcsRUFBRTtJQUNyRCxNQUFNLFNBQVMsR0FBRyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDcEMsT0FBTyxhQUFhLENBQUMsU0FBUyxFQUFFLE9BQU8sRUFBRSxHQUFHLENBQVksQ0FBQztBQUM3RCxDQUFDLEVBQ0QsYUFBYSxHQUFHLENBQUMsT0FBTyxFQUFFLElBQUksRUFBRSxFQUFFO0lBQzlCLGNBQWMsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDM0IsY0FBYyxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQztJQUM5QixPQUFPLGNBQWMsQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUNuQyxDQUFDLEVBQ0QsZ0JBQWdCLEdBQUcsQ0FBQyxJQUFrQixFQUFjLEVBQUU7SUFDbEQsTUFBTSxJQUFJLEdBQWUsVUFBVSxFQUFFLENBQUM7SUFDdEMsTUFBTSxDQUFDLGFBQWEsRUFBRSxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUNsQyxP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