/**
 * @author Jeff Rose
 */
import 'reflect-metadata';
import { both, complement, either, isNil, propIs, propSatisfies } from '@blue/util';
const ERROR_HANDLER = 'error:handler', ERROR_MAPPING = 'error:mapping', { assign } = Object, { defineMetadata, deleteMetadata, getMetadata, getOwnPropertyDescriptor, hasMetadata } = Reflect, hasFunction = propIs(Function), defineErrorHandler = (target) => defineMetadata(ERROR_HANDLER, true, target), defineErrorMapping = (value, target, propertyKey) => defineMetadata(ERROR_MAPPING, value, target, propertyKey), deleteErrorHandler = (target) => deleteMetadata(ERROR_HANDLER, target), deleteErrorMapping = (target, propertyKey) => deleteMetadata(ERROR_MAPPING, target, propertyKey), getErrorHandler = (target) => getMetadata(ERROR_HANDLER, target), getErrorMapping = (target, propertyKey) => getMetadata(ERROR_MAPPING, target, propertyKey), hasErrorHandler = (target) => hasMetadata(ERROR_HANDLER, target), hasErrorMapping = (target, propertyKey) => hasMetadata(ERROR_MAPPING, target, propertyKey), eh = (target) => defineErrorHandler(target), em = (errorClass = Error) => (target, propertyKey, descriptor) => {
    defineErrorMapping(Array.isArray(errorClass) ? errorClass : [errorClass], target, propertyKey);
    if (!descriptor) {
        descriptor = getOwnPropertyDescriptor(target, propertyKey);
    }
    descriptor.enumerable = true;
    return descriptor;
};
/**
 * @param {Error} errorClass
 * @returns {Function}
 */
/**
 */
export const errorHandler = assign(eh, {
    /**
     * @param {*} target
     */
    define: defineErrorHandler,
    /**
     * @param {*} target
     */
    delete: deleteErrorHandler,
    /**
     * @param {*} target
     * @returns {boolean}
     */
    get: getErrorHandler,
    /**
     * @param {*} target
     * @returns {boolean} Whether or not the `target` is defined as an error handler.
     */
    has: hasErrorHandler,
});
const isDefined = complement(isNil), hasConstructor = hasFunction('constructor'), constructorIsErrorHandler = propSatisfies(hasErrorHandler, 'constructor');
export const likeErrorHandler = both(isDefined, either(hasErrorHandler, both(hasConstructor, constructorIsErrorHandler)));
/**
 * @param {Error} errorClass
 * @returns {Function}
 */
/**
 */
export const errorMapping = assign(em, {
    /**
     * @param {*} value
     * @param {*} target
     * @param {string|external:symbol} propertyKey
     */
    define: defineErrorMapping,
    /**
     * @param {*} target
     * @param {string|external:symbol} propertyKey
     */
    delete: deleteErrorMapping,
    /**
     * @param {*} target
     * @param {string|external:symbol} propertyKey
     * @returns {Array<module:core.Constructable<external:Error>>}
     */
    get: getErrorMapping,
    /**
     * @param {*} target
     * @param {string|external:symbol} propertyKey
     * @returns {boolean} Whether or not the `target` and `propertyKey` is defined as an error mapping.
     */
    has: hasErrorMapping,
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXJyb3ItbWFwcGluZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9lcnJvci1tYXBwaW5nLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOztHQUVHO0FBRUgsT0FBTyxrQkFBa0IsQ0FBQztBQUUxQixPQUFPLEVBQUUsSUFBSSxFQUFFLFVBQVUsRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxhQUFhLEVBQUUsTUFBTSxZQUFZLENBQUM7QUFFcEYsTUFBTSxhQUFhLEdBQUcsZUFBZSxFQUNqQyxhQUFhLEdBQUcsZUFBZSxFQUMvQixFQUFFLE1BQU0sRUFBRSxHQUFHLE1BQU0sRUFDbkIsRUFBRSxjQUFjLEVBQUUsY0FBYyxFQUFFLFdBQVcsRUFBRSx3QkFBd0IsRUFBRSxXQUFXLEVBQUUsR0FBRyxPQUFPLEVBQ2hHLFdBQVcsR0FBRyxNQUFNLENBQUMsUUFBUSxDQUFDLEVBQzlCLGtCQUFrQixHQUFHLENBQUMsTUFBTSxFQUFRLEVBQUUsQ0FBQyxjQUFjLENBQUMsYUFBYSxFQUFFLElBQUksRUFBRSxNQUFNLENBQUMsRUFDbEYsa0JBQWtCLEdBQUcsQ0FBQyxLQUFLLEVBQUUsTUFBTSxFQUFFLFdBQTRCLEVBQVEsRUFBRSxDQUN2RSxjQUFjLENBQUMsYUFBYSxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsV0FBVyxDQUFDLEVBQzdELGtCQUFrQixHQUFHLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQyxjQUFjLENBQUMsYUFBYSxFQUFFLE1BQU0sQ0FBQyxFQUN0RSxrQkFBa0IsR0FBRyxDQUFDLE1BQU0sRUFBRSxXQUE0QixFQUFFLEVBQUUsQ0FBQyxjQUFjLENBQUMsYUFBYSxFQUFFLE1BQU0sRUFBRSxXQUFXLENBQUMsRUFDakgsZUFBZSxHQUFHLENBQUMsTUFBTSxFQUFXLEVBQUUsQ0FBQyxXQUFXLENBQUMsYUFBYSxFQUFFLE1BQU0sQ0FBQyxFQUN6RSxlQUFlLEdBQUcsQ0FBQyxNQUFNLEVBQUUsV0FBNEIsRUFBMEIsRUFBRSxDQUMvRSxXQUFXLENBQUMsYUFBYSxFQUFFLE1BQU0sRUFBRSxXQUFXLENBQUMsRUFDbkQsZUFBZSxHQUFHLENBQUMsTUFBTSxFQUFXLEVBQUUsQ0FBQyxXQUFXLENBQUMsYUFBYSxFQUFFLE1BQU0sQ0FBQyxFQUN6RSxlQUFlLEdBQUcsQ0FBQyxNQUFNLEVBQUUsV0FBNEIsRUFBVyxFQUFFLENBQ2hFLFdBQVcsQ0FBQyxhQUFhLEVBQUUsTUFBTSxFQUFFLFdBQVcsQ0FBQyxFQUNuRCxFQUFFLEdBQUcsQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLGtCQUFrQixDQUFDLE1BQU0sQ0FBQyxFQUMzQyxFQUFFLEdBQ0UsQ0FBQyxhQUE0RCxLQUFLLEVBQUUsRUFBRSxDQUN0RSxDQUFDLE1BQU0sRUFBRSxXQUE0QixFQUFFLFVBQThCLEVBQXNCLEVBQUU7SUFDekYsa0JBQWtCLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxFQUFFLE1BQU0sRUFBRSxXQUFXLENBQUMsQ0FBQztJQUMvRixJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7UUFDZCxVQUFVLEdBQUcsd0JBQXdCLENBQUMsTUFBTSxFQUFFLFdBQVcsQ0FBQyxDQUFDO0lBQy9ELENBQUM7SUFDRCxVQUFVLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQztJQUM3QixPQUFPLFVBQVUsQ0FBQztBQUN0QixDQUFDLENBQUM7QUFFVjs7O0dBR0c7QUFFSDtHQUNHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sWUFBWSxHQUFHLE1BQU0sQ0FBQyxFQUFFLEVBQUU7SUFDbkM7O09BRUc7SUFDSCxNQUFNLEVBQUUsa0JBQWtCO0lBQzFCOztPQUVHO0lBQ0gsTUFBTSxFQUFFLGtCQUFrQjtJQUMxQjs7O09BR0c7SUFDSCxHQUFHLEVBQUUsZUFBZTtJQUNwQjs7O09BR0c7SUFDSCxHQUFHLEVBQUUsZUFBZTtDQUN2QixDQUFDLENBQUM7QUFFSCxNQUFNLFNBQVMsR0FBRyxVQUFVLENBQUMsS0FBSyxDQUFDLEVBQy9CLGNBQWMsR0FBRyxXQUFXLENBQUMsYUFBYSxDQUFDLEVBQzNDLHlCQUF5QixHQUFHLGFBQWEsQ0FBQyxlQUFlLEVBQUUsYUFBYSxDQUFDLENBQUM7QUFFOUUsTUFBTSxDQUFDLE1BQU0sZ0JBQWdCLEdBQUcsSUFBSSxDQUNoQyxTQUFTLEVBQ1QsTUFBTSxDQUFDLGVBQWUsRUFBRSxJQUFJLENBQUMsY0FBYyxFQUFFLHlCQUF5QixDQUFDLENBQUMsQ0FDM0UsQ0FBQztBQUVGOzs7R0FHRztBQUVIO0dBQ0c7QUFDSCxNQUFNLENBQUMsTUFBTSxZQUFZLEdBQUcsTUFBTSxDQUFDLEVBQUUsRUFBRTtJQUNuQzs7OztPQUlHO0lBQ0gsTUFBTSxFQUFFLGtCQUFrQjtJQUMxQjs7O09BR0c7SUFDSCxNQUFNLEVBQUUsa0JBQWtCO0lBQzFCOzs7O09BSUc7SUFDSCxHQUFHLEVBQUUsZUFBZTtJQUNwQjs7OztPQUlHO0lBQ0gsR0FBRyxFQUFFLGVBQWU7Q0FDdkIsQ0FBQyxDQUFDIn0=