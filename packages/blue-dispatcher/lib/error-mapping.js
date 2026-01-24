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
 * @function module:dispatcher.errorHandler
 * @param {external:Error} errorClass
 * @returns {external:Function}
 */
/**
 * @const {external:ClassDecorator} module:dispatcher.errorHandler(2)
 */
export const errorHandler = assign(eh, {
    /**
     * @function module:dispatcher.errorHandler.define
     * @param {*} target
     */
    define: defineErrorHandler,
    /**
     * @function module:dispatcher.errorHandler.delete
     * @param {*} target
     */
    delete: deleteErrorHandler,
    /**
     * @function module:dispatcher.errorHandler.get
     * @param {*} target
     * @returns {external:boolean}
     */
    get: getErrorHandler,
    /**
     * @function module:dispatcher.errorHandler.has
     * @param {*} target
     * @returns {external:boolean} Whether or not the `target` is defined as an error handler.
     */
    has: hasErrorHandler,
});
const isDefined = complement(isNil), hasConstructor = hasFunction('constructor'), constructorIsErrorHandler = propSatisfies(hasErrorHandler, 'constructor');
export const likeErrorHandler = both(isDefined, either(hasErrorHandler, both(hasConstructor, constructorIsErrorHandler)));
/**
 * @function module:dispatcher.errorMapping
 * @param {external:Error} errorClass
 * @returns {external:Function}
 */
/**
 * @const {external:ClassDecorator} module:dispatcher.errorMapping(2)
 */
export const errorMapping = assign(em, {
    /**
     * @function module:dispatcher.errorMapping.define
     * @param {*} value
     * @param {*} target
     * @param {external:string|external:symbol} propertyKey
     */
    define: defineErrorMapping,
    /**
     * @function module:dispatcher.errorMapping.delete
     * @param {*} target
     * @param {external:string|external:symbol} propertyKey
     */
    delete: deleteErrorMapping,
    /**
     * @function module:dispatcher.errorMapping.get
     * @param {*} target
     * @param {external:string|external:symbol} propertyKey
     * @returns {external:Array<module:core.Constructable<external:Error>>}
     */
    get: getErrorMapping,
    /**
     * @function module:dispatcher.errorMapping.has
     * @param {*} target
     * @param {external:string|external:symbol} propertyKey
     * @returns {external:boolean} Whether or not the `target` and `propertyKey` is defined as an error mapping.
     */
    has: hasErrorMapping,
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXJyb3ItbWFwcGluZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9lcnJvci1tYXBwaW5nLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOztHQUVHO0FBRUgsT0FBTyxrQkFBa0IsQ0FBQztBQUUxQixPQUFPLEVBQUUsSUFBSSxFQUFFLFVBQVUsRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxhQUFhLEVBQUUsTUFBTSxZQUFZLENBQUM7QUFFcEYsTUFBTSxhQUFhLEdBQUcsZUFBZSxFQUNqQyxhQUFhLEdBQUcsZUFBZSxFQUMvQixFQUFFLE1BQU0sRUFBRSxHQUFHLE1BQU0sRUFDbkIsRUFBRSxjQUFjLEVBQUUsY0FBYyxFQUFFLFdBQVcsRUFBRSx3QkFBd0IsRUFBRSxXQUFXLEVBQUUsR0FBRyxPQUFPLEVBQ2hHLFdBQVcsR0FBRyxNQUFNLENBQUMsUUFBUSxDQUFDLEVBQzlCLGtCQUFrQixHQUFHLENBQUMsTUFBTSxFQUFRLEVBQUUsQ0FBQyxjQUFjLENBQUMsYUFBYSxFQUFFLElBQUksRUFBRSxNQUFNLENBQUMsRUFDbEYsa0JBQWtCLEdBQUcsQ0FBQyxLQUFLLEVBQUUsTUFBTSxFQUFFLFdBQTRCLEVBQVEsRUFBRSxDQUN2RSxjQUFjLENBQUMsYUFBYSxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsV0FBVyxDQUFDLEVBQzdELGtCQUFrQixHQUFHLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQyxjQUFjLENBQUMsYUFBYSxFQUFFLE1BQU0sQ0FBQyxFQUN0RSxrQkFBa0IsR0FBRyxDQUFDLE1BQU0sRUFBRSxXQUE0QixFQUFFLEVBQUUsQ0FBQyxjQUFjLENBQUMsYUFBYSxFQUFFLE1BQU0sRUFBRSxXQUFXLENBQUMsRUFDakgsZUFBZSxHQUFHLENBQUMsTUFBTSxFQUFXLEVBQUUsQ0FBQyxXQUFXLENBQUMsYUFBYSxFQUFFLE1BQU0sQ0FBQyxFQUN6RSxlQUFlLEdBQUcsQ0FBQyxNQUFNLEVBQUUsV0FBNEIsRUFBMEIsRUFBRSxDQUMvRSxXQUFXLENBQUMsYUFBYSxFQUFFLE1BQU0sRUFBRSxXQUFXLENBQUMsRUFDbkQsZUFBZSxHQUFHLENBQUMsTUFBTSxFQUFXLEVBQUUsQ0FBQyxXQUFXLENBQUMsYUFBYSxFQUFFLE1BQU0sQ0FBQyxFQUN6RSxlQUFlLEdBQUcsQ0FBQyxNQUFNLEVBQUUsV0FBNEIsRUFBVyxFQUFFLENBQ2hFLFdBQVcsQ0FBQyxhQUFhLEVBQUUsTUFBTSxFQUFFLFdBQVcsQ0FBQyxFQUNuRCxFQUFFLEdBQUcsQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLGtCQUFrQixDQUFDLE1BQU0sQ0FBQyxFQUMzQyxFQUFFLEdBQ0UsQ0FBQyxhQUE0RCxLQUFLLEVBQUUsRUFBRSxDQUN0RSxDQUFDLE1BQU0sRUFBRSxXQUE0QixFQUFFLFVBQThCLEVBQXNCLEVBQUU7SUFDekYsa0JBQWtCLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxFQUFFLE1BQU0sRUFBRSxXQUFXLENBQUMsQ0FBQztJQUMvRixJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7UUFDZCxVQUFVLEdBQUcsd0JBQXdCLENBQUMsTUFBTSxFQUFFLFdBQVcsQ0FBQyxDQUFDO0lBQy9ELENBQUM7SUFDRCxVQUFVLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQztJQUM3QixPQUFPLFVBQVUsQ0FBQztBQUN0QixDQUFDLENBQUM7QUFFVjs7OztHQUlHO0FBRUg7O0dBRUc7QUFDSCxNQUFNLENBQUMsTUFBTSxZQUFZLEdBQUcsTUFBTSxDQUFDLEVBQUUsRUFBRTtJQUNuQzs7O09BR0c7SUFDSCxNQUFNLEVBQUUsa0JBQWtCO0lBQzFCOzs7T0FHRztJQUNILE1BQU0sRUFBRSxrQkFBa0I7SUFDMUI7Ozs7T0FJRztJQUNILEdBQUcsRUFBRSxlQUFlO0lBQ3BCOzs7O09BSUc7SUFDSCxHQUFHLEVBQUUsZUFBZTtDQUN2QixDQUFDLENBQUM7QUFFSCxNQUFNLFNBQVMsR0FBRyxVQUFVLENBQUMsS0FBSyxDQUFDLEVBQy9CLGNBQWMsR0FBRyxXQUFXLENBQUMsYUFBYSxDQUFDLEVBQzNDLHlCQUF5QixHQUFHLGFBQWEsQ0FBQyxlQUFlLEVBQUUsYUFBYSxDQUFDLENBQUM7QUFFOUUsTUFBTSxDQUFDLE1BQU0sZ0JBQWdCLEdBQUcsSUFBSSxDQUNoQyxTQUFTLEVBQ1QsTUFBTSxDQUFDLGVBQWUsRUFBRSxJQUFJLENBQUMsY0FBYyxFQUFFLHlCQUF5QixDQUFDLENBQUMsQ0FDM0UsQ0FBQztBQUVGOzs7O0dBSUc7QUFFSDs7R0FFRztBQUNILE1BQU0sQ0FBQyxNQUFNLFlBQVksR0FBRyxNQUFNLENBQUMsRUFBRSxFQUFFO0lBQ25DOzs7OztPQUtHO0lBQ0gsTUFBTSxFQUFFLGtCQUFrQjtJQUMxQjs7OztPQUlHO0lBQ0gsTUFBTSxFQUFFLGtCQUFrQjtJQUMxQjs7Ozs7T0FLRztJQUNILEdBQUcsRUFBRSxlQUFlO0lBQ3BCOzs7OztPQUtHO0lBQ0gsR0FBRyxFQUFFLGVBQWU7Q0FDdkIsQ0FBQyxDQUFDIn0=