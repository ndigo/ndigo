/**
 * @author Jeff Rose
 */
import { Destroyable } from './lifecycle';
import { Registry } from './registry';
import { Factory } from './factory';
export interface InitializationAwareProcessor {
    /**
     * Apply this {@link EntryProcessor} to the given new instance _before_ any initialization callbacks. The instance will already be populated with property values. The returned instance may be a wrapper around the original.
     *
     * The default implementation returns the given instance as-is.
     * @param name The name of instance
     * @param instance The instance
     * @returns The instance to use, either the original or a wrapped one; if `null`, no subsequent EntryProcessors will be invoked.
     */
    processAfterInitialization<T = any>(name: string, instance: T): T;
    /**
     * Apply this {@link EntryProcessor} to the given new instance _after_ any initialization callbacks. The instance will already be populated with property values. The returned instance may be a wrapper around the original.
     *
     * The default implementation returns the given instance as-is.
     * @param name The name of instance
     * @param instance The instance
     * @returns The instance to use, either the original or a wrapped one; if `null`, no subsequent EntryProcessors will be invoked.
     */
    processBeforeInitialization<T = any>(name: string, instance: T): T;
}
/**
 * Subinterface of {@link EntryProcessor} that adds a before-construction callback, and a callback after construction but before explicit properties are set.
 *
 * Typically used to suppress default construction for specific values.
 *
 * *Note:* This interface is mainly for internal use within the framework.
 */
export interface ConstructionAwareProcessor {
    /**
     * Perform operations after the instance has constructed, but before property population occurs.
     *
     * This is the ideal callback for performing custom field injection on the given instance.
     *
     * The default implementation returns `true`.
     * @param name The name of instance
     * @param instance The instance without properties having been set yet.
     * @returns `true` if properties should be set on the instance; `false` if property population should be skipped. Normal implementations should return `true`. Returning `false` will also prevent any subsequent ConstructionAwarePostProcessors being invoked on this instance.
     */
    processAfterConstruction<T = any>(name: string, instance: T): boolean;
    /**
     * Apply this EntryProcessor _before the target value gets constructed_. The returned value may be a proxy instead of the target instance, effectively supressing default construction.
     *
     * The default implementation returns `null`.
     * @param name The name of instance
     * @param constructor The constructor
     * @param argumentsList The list of arguments supplied to the `constructor`.
     * @returns The instance to expose instead of a default instance, or `null` to proceed with default construction.
     */
    processBeforeConstruction<T = any>(name: string, constructor: Function, argumentsList?: any[]): T | null;
    /**
     * Process the given property values before the factory applies them to the given instance.
     *
     * The default implementation returns the properties as-is.
     * @param properties The name of instance
     * @param name The name of instance
     * @param instance The instance without properties having been set yet.
     * @returns The property values to apply to the given instance.
     */
    processProperties<T = any>(properties: PropertyDescriptorMap, name: string, instance: T): PropertyDescriptorMap;
}
/**
 * Factory hook that allows for custom modification of new instances, e.g. checking for marker interfaces or wrapping them with proxies.
 */
export interface DestructionAwareProcessor {
    /**
     * Apply this EntryProcessor to the given instance before its destruction.
     * @param name The name of instance
     * @param instance The instance to be destroyed.
     */
    processBeforeDestruction<T extends Destroyable>(name: string, instance: T): void;
}
/**
 * Factory hook that allows for modification of an application context's values.
 */
export interface EntryRegistryProcessor {
    /**
     * Process the given registry.
     * @param registry The registry to process.
     */
    processEntryRegistry(registry: Registry): void;
}
/**
 * Factory hook that allows for custom modification of new instances, e.g. checking for marker interfaces or wrapping them with proxies.
 */
export interface FactoryPostProcessor {
    /**
     * Post-process the given factory.
     * @param factory The factory to post-process.
     */
    postProcessFactory(factory: Factory): void;
}
/**
 * A union type representing all possible entry processor interfaces.
 */
export type EntryProcessor = InitializationAwareProcessor | ConstructionAwareProcessor | DestructionAwareProcessor | EntryRegistryProcessor;
/**
 * Determines whether or not the `value` provided is an {@link InitializationAwareProcessor}.
 * @param value The value to be tested.
 * @returns Whether or not the `value` provided is an {@link InitializationAwareProcessor}.
 */
export declare const likeInitializationAwareProcessor: (value: any) => value is InitializationAwareProcessor;
/**
 * Determines whether or not the `value` provided is a {@link ConstructionAwareProcessor}.
 * @param value The value to be tested.
 * @returns Whether or not the `value` provided is a {@link ConstructionAwareProcessor}.
 */
export declare const likeConstructionAwareProcessor: (value: any) => value is ConstructionAwareProcessor;
/**
 * Determines whether or not the `value` provided is a {@link DestructionAwareProcessor}.
 * @param value The value to be tested.
 * @returns Whether or not the `value` provided is a {@link DestructionAwareProcessor}.
 */
export declare const likeDestructionAwareProcessor: (value: any) => value is DestructionAwareProcessor;
/**
 * Determines whether or not the `value` provided is an {@link EntryRegistryProcessor}.
 * @param value The value to be tested.
 * @returns Whether or not the `value` provided is an {@link EntryRegistryProcessor}.
 */
export declare const likeEntryRegistryProcessor: (value: any) => value is EntryRegistryProcessor;
/**
 * Determines whether or not the `value` provided is an {@link EntryProcessor}.
 * @param value The value to be tested.
 * @returns Whether or not the `value` provided is an {@link EntryProcessor}.
 */
export declare const likeEntryProcessor: (value: any) => value is EntryProcessor;
