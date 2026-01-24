/**
 * @author Jeff Rose
 */
import { anyPass, like } from '@blue/util';
/**
 * Factory hook that allows for custom modification of new instances, e.g. checking for marker interfaces or wrapping them with proxies.
 * @interface module:factory.InitializationAwareProcessor
 */
/**
 * Apply this {@link module:factory.EntryProcessor} to the given new instance _before_ any initialization callbacks. The instance will already be populated with property values. The returned instance may be a wrapper around the original.
 *
 * The default implementation returns the given instance as-is.
 * @function module:factory.InitializationAwareProcessor#processBeforeInitialization
 * @param {external:string} name The name of instance
 * @param {T} instance The instance
 * @returns {T} The instance to use, either the original or a wrapped one; if `null`, no subsequent EntryProcessors will be invoked.
 */
/**
 * Apply this {@link module:factory.EntryProcessor} to the given new instance _after_ any initialization callbacks. The instance will already be populated with property values. The returned instance may be a wrapper around the original.
 *
 * The default implementation returns the given instance as-is.
 * @function module:factory.InitializationAwareProcessor#processAfterInitialization
 * @param {external:string} name The name of instance
 * @param {T} instance The instance
 * @returns {T}
 */
/**
 * Subinterface of {@link module:factory.EntryProcessor} that adds a before-construction callback, and a callback after construction but before explicit properties are set.
 *
 * Typically used to suppress default construction for specific values.
 *
 * *Note:* This interface is mainly for internal use within the framework.
 * @interface module:factory.ConstructionAwareProcessor
 */
/**
 * Apply this EntryProcessor _before the target value gets constructed_. The returned value may be a proxy instead of the target instance, effectively supressing default construction.
 *
 * The default implementation returns `null`.
 * @function module:factory.ConstructionAwareProcessor#processBeforeConstruction
 * @param {external:string} name The name of instance
 * @param {external:Function} constructor The constructor
 * @param {external:Array} [argumentsList=[]] The list of arguments supplied to the `constructor`.
 * @returns {T | null} The instance to expose instead of a default instance, or `null` to proceed with default construction.
 */
/**
 * Perform operations after the instance has constructed, but before property population occurs.
 *
 * This is the ideal callback for performing custom field injection on the given instance.
 *
 * The default implementation returns `true`.
 * @function module:factory.ConstructionAwareProcessor#processAfterConstruction
 * @param {external:string} name The name of instance
 * @param {T} instance The instance without properties having been set yet.
 * @returns {external:boolean} `true` if properties should be set on the instance; `false` if property population should be skipped. Normal implementations should return `true`. Returning `false` will also prevent any subsequent ConstructionAwarePostProcessors being invoked on this instance.
 */
/**
 * Process the given property values before the factory applies them to the given instance.
 *
 * The default implementation returns the properties as-is.
 * @function module:factory.ConstructionAwareProcessor#processProperties
 * @param {external:PropertyDescriptorMap} properties The name of instance
 * @param {external:string} name The name of instance
 * @param {T} instance The instance without properties having been set yet.
 * @returns {external:PropertyDescriptorMap} The property values to apply to the given instance.
 */
/**
 * Factory hook that allows for custom modification of new instances, e.g. checking for marker interfaces or wrapping them with proxies.
 * @interface module:factory.DestructionAwareProcessor
 */
/**
 * Apply this EntryProcessor to the given instance before its destruction.
 * @function module:factory.DestructionAwareProcessor#processBeforeDestruction
 * @param {external:string} name The name of instance
 * @param {T} instance The instance to be destroyed.
 */
/**
 * Factory hook that allows for modification of an application context's values.
 * @interface module:factory.EntryRegistryProcessor
 */
/**
 * @function module:factory.EntryRegistryProcessor#processEntryRegistry
 * @param {module:factory.Registry} registry
 */
/**
 * @interface module:factory.FactoryPostProcessor
 */
/**
 * @function module:factory.FactoryPostProcessor#postProcessFactory
 * @param {module:Factory.Factory} factory
 */
/**
 * @typedef {module:factory.InitializationAwareProcessor | module:factory.ConstructionAwareProcessor | module:factory.DestructionAwareProcessor | module:factory.EntryRegistryProcessor} module:factory.EntryProcessor
 */
/**
 * @function module:factory.likeInitializationAwareProcessor
 * @param {*} value The value to be tested
 * @returns {external:boolean} Whether or not the `value` provided is an {@linkcode module:factory.InitializationAwareProcessor|InitializationAwareProcessor}.
 */
export const likeInitializationAwareProcessor = like({
    processAfterInitialization: Function,
    processBeforeInitialization: Function,
});
/**
 * @function module:factory.likeConstructionAwareProcessor
 * @param {*} value The value to be tested
 * @returns {external:boolean} Whether or not the `value` provided is a {@linkcode module:factory.ConstructionAwareProcessor|ConstructionAwareProcessor}.
 */
export const likeConstructionAwareProcessor = like({
    processAfterConstruction: Function,
    processBeforeConstruction: Function,
    processProperties: Function,
});
/**
 * @function module:factory.likeDestructionAwareProcessor
 * @param {*} value The value to be tested
 * @returns {external:boolean} Whether or not the `value` provided is a {@linkcode module:factory.DestructionAwareProcessor|DestructionAwareProcessor}.
 */
export const likeDestructionAwareProcessor = like({ processBeforeDestruction: Function });
/**
 * @function module:factory.likeEntryRegistryProcessor
 * @param {*} value The value to be tested
 * @returns {external:boolean} Whether or not the `value` provided is a {@linkcode module:factory.EntryRegistryProcessor|EntryRegistryProcessor}.
 */
export const likeEntryRegistryProcessor = like({ processEntryRegistry: Function });
/**
 * @function module:factory.likeEntryProcessor
 * @param {*} value The value to be tested
 * @returns {external:boolean} Whether or not the `value` provided is an {@linkcode module:factory.EntryProcessor|EntryProcessor}.
 */
export const likeEntryProcessor = anyPass([
    likeConstructionAwareProcessor,
    likeInitializationAwareProcessor,
    likeDestructionAwareProcessor,
    likeEntryRegistryProcessor,
]);
/*
export class InjectDecoratorEntryProcessor extends AsFactoryAware( Null ) implements ConstructionAwareProcessor {
    processAfterConstruction<T = any>( name: string, instance: T ): boolean {
        return true;
    }

    processBeforeConstruction<T = any>( name: string, constructor: Function, argumentsList?: any[] ): T {
        return null;
    }

    processProperties<T = any>( properties: PropertyDescriptorMap, name: string, instance: T ): PropertyDescriptorMap {
        return properties;
    }

    processAfterInitialization<T>( name: string, instance: T ): T {
        return instance;
    }

    processBeforeInitialization<T>( name: string, instance: T ): T {
        return instance;
    }
}
*/
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW50cnktcHJvY2Vzc29yLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2VudHJ5LXByb2Nlc3Nvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7R0FFRztBQUdILE9BQU8sRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sWUFBWSxDQUFDO0FBaUMzQzs7O0dBR0c7QUFFSDs7Ozs7Ozs7R0FRRztBQUVIOzs7Ozs7OztHQVFHO0FBRUg7Ozs7Ozs7R0FPRztBQUVIOzs7Ozs7Ozs7R0FTRztBQUVIOzs7Ozs7Ozs7O0dBVUc7QUFFSDs7Ozs7Ozs7O0dBU0c7QUFFSDs7O0dBR0c7QUFFSDs7Ozs7R0FLRztBQUVIOzs7R0FHRztBQUVIOzs7R0FHRztBQUVIOztHQUVHO0FBRUg7OztHQUdHO0FBRUg7O0dBRUc7QUFFSDs7OztHQUlHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sZ0NBQWdDLEdBQUcsSUFBSSxDQUFDO0lBQ2pELDBCQUEwQixFQUFFLFFBQVE7SUFDcEMsMkJBQTJCLEVBQUUsUUFBUTtDQUN4QyxDQUFxRCxDQUFDO0FBRXZEOzs7O0dBSUc7QUFDSCxNQUFNLENBQUMsTUFBTSw4QkFBOEIsR0FBRyxJQUFJLENBQUM7SUFDL0Msd0JBQXdCLEVBQUUsUUFBUTtJQUNsQyx5QkFBeUIsRUFBRSxRQUFRO0lBQ25DLGlCQUFpQixFQUFFLFFBQVE7Q0FDOUIsQ0FBbUQsQ0FBQztBQUNyRDs7OztHQUlHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sNkJBQTZCLEdBQUcsSUFBSSxDQUFDLEVBQUUsd0JBQXdCLEVBQUUsUUFBUSxFQUFFLENBRWpELENBQUM7QUFFeEM7Ozs7R0FJRztBQUNILE1BQU0sQ0FBQyxNQUFNLDBCQUEwQixHQUFHLElBQUksQ0FBQyxFQUFFLG9CQUFvQixFQUFFLFFBQVEsRUFBRSxDQUU3QyxDQUFDO0FBRXJDOzs7O0dBSUc7QUFDSCxNQUFNLENBQUMsTUFBTSxrQkFBa0IsR0FBRyxPQUFPLENBQUM7SUFDdEMsOEJBQThCO0lBQzlCLGdDQUFnQztJQUNoQyw2QkFBNkI7SUFDN0IsMEJBQTBCO0NBQzdCLENBQXVDLENBQUM7QUFFekM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7RUFzQkUifQ==