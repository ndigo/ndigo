/**
 * @author Jeff Rose
 */
import { anyPass, like } from '@blue/util';
/**
 * Factory hook that allows for custom modification of new instances, e.g. checking for marker interfaces or wrapping them with proxies.
 */
/**
 * Apply this {@link EntryProcessor} to the given new instance _before_ any initialization callbacks. The instance will already be populated with property values. The returned instance may be a wrapper around the original.
 *
 * The default implementation returns the given instance as-is.
 * @param {string} name The name of instance
 * @param {T} instance The instance
 * @returns {T} The instance to use, either the original or a wrapped one; if `null`, no subsequent EntryProcessors will be invoked.
 */
/**
 * Apply this {@link EntryProcessor} to the given new instance _after_ any initialization callbacks. The instance will already be populated with property values. The returned instance may be a wrapper around the original.
 *
 * The default implementation returns the given instance as-is.
 * @param {string} name The name of instance
 * @param {T} instance The instance
 * @returns {T}
 */
/**
 * Subinterface of {@link EntryProcessor} that adds a before-construction callback, and a callback after construction but before explicit properties are set.
 *
 * Typically used to suppress default construction for specific values.
 *
 * *Note:* This interface is mainly for internal use within the framework.
 */
/**
 * Apply this EntryProcessor _before the target value gets constructed_. The returned value may be a proxy instead of the target instance, effectively supressing default construction.
 *
 * The default implementation returns `null`.
 * @param {string} name The name of instance
 * @param {Function} constructor The constructor
 * @param {Array} [argumentsList=[]] The list of arguments supplied to the `constructor`.
 * @returns {T | null} The instance to expose instead of a default instance, or `null` to proceed with default construction.
 */
/**
 * Perform operations after the instance has constructed, but before property population occurs.
 *
 * This is the ideal callback for performing custom field injection on the given instance.
 *
 * The default implementation returns `true`.
 * @param {string} name The name of instance
 * @param {T} instance The instance without properties having been set yet.
 * @returns {boolean} `true` if properties should be set on the instance; `false` if property population should be skipped. Normal implementations should return `true`. Returning `false` will also prevent any subsequent ConstructionAwarePostProcessors being invoked on this instance.
 */
/**
 * Process the given property values before the factory applies them to the given instance.
 *
 * The default implementation returns the properties as-is.
 * @param {PropertyDescriptorMap} properties The name of instance
 * @param {string} name The name of instance
 * @param {T} instance The instance without properties having been set yet.
 * @returns {PropertyDescriptorMap} The property values to apply to the given instance.
 */
/**
 * Factory hook that allows for custom modification of new instances, e.g. checking for marker interfaces or wrapping them with proxies.
 */
/**
 * Apply this EntryProcessor to the given instance before its destruction.
 * @param {string} name The name of instance
 * @param {T} instance The instance to be destroyed.
 */
/**
 * Factory hook that allows for modification of an application context's values.
 */
/**
 * @param {module:factory.Registry} registry
 */
/**
 */
/**
 * @param {module:Factory.Factory} factory
 */
/**
 * @typedef {module:factory.InitializationAwareProcessor | module:factory.ConstructionAwareProcessor | module:factory.DestructionAwareProcessor | module:factory.EntryRegistryProcessor} module:factory.EntryProcessor
 */
/**
 * @param {*} value The value to be tested
 * @returns {boolean} Whether or not the `value` provided is an {@link InitializationAwareProcessor|InitializationAwareProcessor}.
 */
export const likeInitializationAwareProcessor = like({
    processAfterInitialization: Function,
    processBeforeInitialization: Function,
});
/**
 * @param {*} value The value to be tested
 * @returns {boolean} Whether or not the `value` provided is a {@link ConstructionAwareProcessor|ConstructionAwareProcessor}.
 */
export const likeConstructionAwareProcessor = like({
    processAfterConstruction: Function,
    processBeforeConstruction: Function,
    processProperties: Function,
});
/**
 * @param {*} value The value to be tested
 * @returns {boolean} Whether or not the `value` provided is a {@link DestructionAwareProcessor|DestructionAwareProcessor}.
 */
export const likeDestructionAwareProcessor = like({ processBeforeDestruction: Function });
/**
 * @param {*} value The value to be tested
 * @returns {boolean} Whether or not the `value` provided is a {@link EntryRegistryProcessor|EntryRegistryProcessor}.
 */
export const likeEntryRegistryProcessor = like({ processEntryRegistry: Function });
/**
 * @param {*} value The value to be tested
 * @returns {boolean} Whether or not the `value` provided is an {@link EntryProcessor|EntryProcessor}.
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW50cnktcHJvY2Vzc29yLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2VudHJ5LXByb2Nlc3Nvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7R0FFRztBQUdILE9BQU8sRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sWUFBWSxDQUFDO0FBaUMzQzs7R0FFRztBQUVIOzs7Ozs7O0dBT0c7QUFFSDs7Ozs7OztHQU9HO0FBRUg7Ozs7OztHQU1HO0FBRUg7Ozs7Ozs7O0dBUUc7QUFFSDs7Ozs7Ozs7O0dBU0c7QUFFSDs7Ozs7Ozs7R0FRRztBQUVIOztHQUVHO0FBRUg7Ozs7R0FJRztBQUVIOztHQUVHO0FBRUg7O0dBRUc7QUFFSDtHQUNHO0FBRUg7O0dBRUc7QUFFSDs7R0FFRztBQUVIOzs7R0FHRztBQUNILE1BQU0sQ0FBQyxNQUFNLGdDQUFnQyxHQUFHLElBQUksQ0FBQztJQUNqRCwwQkFBMEIsRUFBRSxRQUFRO0lBQ3BDLDJCQUEyQixFQUFFLFFBQVE7Q0FDeEMsQ0FBcUQsQ0FBQztBQUV2RDs7O0dBR0c7QUFDSCxNQUFNLENBQUMsTUFBTSw4QkFBOEIsR0FBRyxJQUFJLENBQUM7SUFDL0Msd0JBQXdCLEVBQUUsUUFBUTtJQUNsQyx5QkFBeUIsRUFBRSxRQUFRO0lBQ25DLGlCQUFpQixFQUFFLFFBQVE7Q0FDOUIsQ0FBbUQsQ0FBQztBQUNyRDs7O0dBR0c7QUFDSCxNQUFNLENBQUMsTUFBTSw2QkFBNkIsR0FBRyxJQUFJLENBQUMsRUFBRSx3QkFBd0IsRUFBRSxRQUFRLEVBQUUsQ0FFakQsQ0FBQztBQUV4Qzs7O0dBR0c7QUFDSCxNQUFNLENBQUMsTUFBTSwwQkFBMEIsR0FBRyxJQUFJLENBQUMsRUFBRSxvQkFBb0IsRUFBRSxRQUFRLEVBQUUsQ0FFN0MsQ0FBQztBQUVyQzs7O0dBR0c7QUFDSCxNQUFNLENBQUMsTUFBTSxrQkFBa0IsR0FBRyxPQUFPLENBQUM7SUFDdEMsOEJBQThCO0lBQzlCLGdDQUFnQztJQUNoQyw2QkFBNkI7SUFDN0IsMEJBQTBCO0NBQzdCLENBQXVDLENBQUM7QUFFekM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7RUFzQkUifQ==