/**
 * @author Jeff Rose
 */
import { Destroyable } from './lifecycle';
import { Registry } from './registry';
import { Factory } from './factory';
export interface InitializationAwareProcessor {
    processAfterInitialization<T = any>(name: string, instance: T): T;
    processBeforeInitialization<T = any>(name: string, instance: T): T;
}
export interface ConstructionAwareProcessor {
    processAfterConstruction<T = any>(name: string, instance: T): boolean;
    processBeforeConstruction<T = any>(name: string, constructor: Function, argumentsList?: any[]): T | null;
    processProperties<T = any>(properties: PropertyDescriptorMap, name: string, instance: T): PropertyDescriptorMap;
}
export interface DestructionAwareProcessor {
    processBeforeDestruction<T extends Destroyable>(name: string, instance: T): void;
}
export interface EntryRegistryProcessor {
    processEntryRegistry(registry: Registry): void;
}
export interface FactoryPostProcessor {
    postProcessFactory(factory: Factory): void;
}
export type EntryProcessor = InitializationAwareProcessor | ConstructionAwareProcessor | DestructionAwareProcessor | EntryRegistryProcessor;
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
export declare const likeInitializationAwareProcessor: (value: any) => value is InitializationAwareProcessor;
/**
 * @param {*} value The value to be tested
 * @returns {boolean} Whether or not the `value` provided is a {@link ConstructionAwareProcessor|ConstructionAwareProcessor}.
 */
export declare const likeConstructionAwareProcessor: (value: any) => value is ConstructionAwareProcessor;
/**
 * @param {*} value The value to be tested
 * @returns {boolean} Whether or not the `value` provided is a {@link DestructionAwareProcessor|DestructionAwareProcessor}.
 */
export declare const likeDestructionAwareProcessor: (value: any) => value is DestructionAwareProcessor;
/**
 * @param {*} value The value to be tested
 * @returns {boolean} Whether or not the `value` provided is a {@link EntryRegistryProcessor|EntryRegistryProcessor}.
 */
export declare const likeEntryRegistryProcessor: (value: any) => value is EntryRegistryProcessor;
/**
 * @param {*} value The value to be tested
 * @returns {boolean} Whether or not the `value` provided is an {@link EntryProcessor|EntryProcessor}.
 */
export declare const likeEntryProcessor: (value: any) => value is EntryProcessor;
//# sourceMappingURL=entry-processor.d.ts.map