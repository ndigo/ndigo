/**
 * @author Jeff Rose
 */
import { Constructable } from '@blue/core';
import { Destroyable } from './lifecycle';
import { Aware } from './aware';
import { ContextToken } from './context-token';
import { Registry } from './registry';
import { PossibleScope, Scope, ScopedFactory } from './scope';
import { EntryProcessor } from './entry-processor';
/**
 * This interface is implemented by objects that hold a number of value definitions, each uniquely identified by a {@link string|string} name.
 *
 * The point of this approach is that the `Factory` is a central registry of application components and centralizes configuration.
 * `Factory` implementations should support the standard lifecycle as much as possible. The full set of initialization methods and their standard order is:
 * 1. NameAware's `setName`
 * 2. FactoryAware's `setFactory`
 * 3. EnvironmentAware's `setEnvironment`
 * 4. ApplicationEventEmitterAware's `setApplicationEventEmitter`
 * 5. ContentSourceAware's `setContentSource`
 * 6. ApplicationContextAware's `setApplicationContext`
 * 7. `processBeforeInitialization`
 * 8. `init`
 * 9. `processAfterInitialization`
 *
 * On refresh, `LifecycleProcessor#onRefresh` should start `SmartLifecycle` values in ascending phase order.
 *
 * On teardown, the full lifecycle should apply:
 * 1. `processBeforeDestruction`
 * 2. `destroy`
 * 3. `LifecycleProcessor#onClose` (stop `SmartLifecycle` values in descending phase order)
 * @see {@link NameAware}
 * @see {@link FactoryAware}
 * @see {@link EnvironmentAware}
 * @see {@link ApplicationEventEmitterAware}
 * @see {@link ContentSourceAware}
 * @see {@link ApplicationContextAware}
 */
export interface Factory {
    /**
     * Return an instance of the specified value.
     * @param name The name of the value.
     * @returns An instance of the value specified by the `name`.
     */
    getInstance<T = any>(name: string): T;
}
/**
 * Extends {@link Factory} to provide hierarchical factory capabilities.
 */
export interface HierarchicalFactory extends Factory {
    /**
     * The parent factory in the hierarchy.
     */
    readonly parent: Factory | null;
    /**
     * Determines whether this factory contains a value with the given name.
     * @param name The name of the value.
     * @returns `true` if this factory contains the value, `false` otherwise.
     */
    hasOwnValue(name: string): boolean;
}
/**
 * Extends {@link HierarchicalFactory} and {@link Registry} to provide configurable factory capabilities.
 */
export interface ConfigurableFactory extends HierarchicalFactory, Registry {
    /**
     * Adds an entry processor to the factory.
     * @param processor The entry processor to add.
     */
    addProcessor(processor: EntryProcessor): void;
    /**
     * Sets the parent factory.
     * @param parent The parent factory.
     */
    setParent(parent: Factory | null): void;
}
/**
 * Interface to be implemented by values that wish to be aware of their owning {@link Factory|Factory}.
 */
export interface FactoryAware extends Aware {
    /**
     * Setter that supplies the owning factory to the instance.
     * @param factory The factory that created this instance.
     */
    setFactory(factory: Factory): void;
}
/**
 * A mixin that adds {@link FactoryAware} capabilities to a class.
 * @template T The type of the constructor.
 * @param superclass The superclass to extend.
 * @returns A new class that extends the superclass and implements {@link FactoryAware}.
 */
export declare const AsFactoryAware: <T extends Constructable>(superclass: T) => Constructable<FactoryAware> & T;
/**
 * Determines whether or not the `value` provided is a {@link Factory}.
 * @param value The value to be tested.
 * @returns Whether or not the `value` provided is a {@link Factory}.
 */
export declare const likeFactory: (value: any) => value is Factory;
/**
 * Determines whether or not the `value` provided is {@link FactoryAware}.
 * @param value The value to be tested.
 * @returns Whether or not the `value` provided is {@link FactoryAware}.
 */
export declare const likeFactoryAware: (value: any) => value is FactoryAware;
/**
 * Determines whether or not the `value` provided is {@link HierarchicalFactory}.
 * @param value The value to be tested.
 * @returns Whether or not the `value` provided is {@link HierarchicalFactory}.
 */
export declare const likeHierarchicalFactory: (value: any) => boolean;
/**
 * Determines whether or not the `value` provided is {@link ConfigurableFactory}.
 * @param value The value to be tested.
 * @returns Whether or not the `value` provided is {@link ConfigurableFactory}.
 */
export declare const likeConfigurableFactory: (value: any) => boolean;
/**
 * An abstract base class for implementing a {@link ConfigurableFactory} and {@link ScopedFactory}.
 */
export declare abstract class AbstractFactory implements ConfigurableFactory, ScopedFactory {
    #private;
    /**
     * A list of entry processors applied to instances.
     */
    processors: EntryProcessor[];
    /**
     * Indicates if there are any construction-aware processors.
     */
    hasConstructionAwareProcessors: boolean;
    /**
     * Indicates if there are any destruction-aware processors.
     */
    hasDestructionAwareProcessors: boolean;
    /**
     * Indicates if there are any initialization-aware processors.
     */
    hasInitializationAwareProcessors: boolean;
    /**
     * Returns the string tag for this factory.
     * @returns Always 'Factory'.
     */
    get [Symbol.toStringTag](): string;
    /**
     * Returns the parent factory.
     * @returns The parent factory.
     */
    get parent(): Factory | null;
    /**
     * Creates a new AbstractFactory instance and initializes its scope registry and default scopes.
     */
    constructor();
    /**
     * Allows arbitrary properties to be added to the factory, which are then managed as values.
     */
    [key: string]: any;
    /**
     * Adds an entry processor to the factory.
     * @param processor The entry processor to add.
     */
    addProcessor(processor: EntryProcessor): void;
    /**
     * Destroys a value managed by the factory.
     * @param nameOrToken The name or ContextToken of the value to destroy.
     * @template T The type of the value.
     */
    destroyValue<T = any>(token: ContextToken<T>): void;
    destroyValue(name: string): void;
    /**
     * Returns an instance of the specified value.
     * @param name The name of the value.
     * @param argumentsList Optional arguments to pass to the constructor if the value is a constructor.
     * @returns An instance of the value.
     * @template T The type of the instance.
     */
    getInstance<T = any>(name: string, argumentsList?: any[]): T;
    /**
     * Retrieves a value from the factory, creating it if necessary.
     * @param nameOrToken The name or ContextToken of the value to retrieve.
     * @param argumentsList Optional arguments to pass to the constructor if the value is a constructor.
     * @returns The retrieved value.
     * @template T The type of the value.
     */
    getValue<T = any>(token: ContextToken<T>): T;
    getValue<T = any>(name: string, argumentsList?: any[]): T;
    /**
     * Destroys a scoped value.
     * @param scopeName The name of the scope.
     * @param valueName The name of the value within the scope.
     */
    destroyScopedValue(scopeName: PossibleScope, valueName: string): void;
    /**
     * Retrieves a scope by its name.
     * @param name The name of the scope.
     * @returns The Scope instance.
     */
    getScope(name: PossibleScope): Scope;
    /**
     * Returns an array of all registered scope names.
     * @returns An array of PossibleScope names.
     */
    getScopeNames(): PossibleScope[];
    /**
     * Checks if the factory has a constructor registered under the given name.
     * @param name The name of the constructor.
     * @returns `true` if a constructor is registered, `false` otherwise.
     */
    hasConstructor(name: string): boolean;
    /**
     * Checks if the factory has an instance registered under the given name.
     * @param name The name of the instance.
     * @returns `true` if an instance is registered, `false` otherwise.
     */
    hasInstance(name: string): boolean;
    /**
     * Checks if the factory has its own value (either an instance or a constructor) registered under the given name.
     * @param name The name of the value.
     * @returns `true` if this factory has its own value, `false` otherwise.
     */
    hasOwnValue(name: string): boolean;
    /**
     * Checks if the factory has a value (either an instance or a constructor) registered under the given name or token.
     * @param nameOrToken The name or ContextToken of the value.
     * @returns `true` if a value is registered, `false` otherwise.
     * @template T The type of the value.
     */
    hasValue<T = any>(token: ContextToken<T>): boolean;
    hasValue(name: string): boolean;
    /**
     * Registers a new scope with the factory.
     * @param name The name of the scope.
     * @param scope The Scope instance to register.
     */
    registerScope(name: PossibleScope, scope: Scope): void;
    /**
     * Sets the parent factory for this hierarchical factory.
     * @param parent The parent factory.
     */
    setParent(parent: Factory | null): void;
    /**
     * Sets a value (either a constructor or an instance) in the factory.
     * @param nameOrToken The name or ContextToken under which to register the value.
     * @param value The value to register.
     * @template T The type of the value.
     */
    setValue<T = any>(token: ContextToken<T>, value: T): void;
    setValue<T = any>(name: string, value: T): void;
    /**
     * Applies construction-aware processors after an instance has been constructed.
     * @param name The name of the instance.
     * @param instance The constructed instance.
     * @returns `true` if properties should be populated, `false` otherwise.
     * @template T The type of the instance.
     */
    protected _applyProcessorsAfterConstruction<T = any>(name: string, instance: T): boolean;
    /**
     * Applies initialization-aware processors after an instance has been initialized.
     * @param name The name of the instance.
     * @param instance The initialized instance.
     * @returns The processed instance.
     * @template T The type of the instance.
     */
    protected _applyProcessorsAfterInitialization<T>(name: string, instance: T): T;
    /**
     * Applies construction-aware processors before an instance is constructed.
     * @param name The name of the instance.
     * @param constructor The constructor function.
     * @param argumentsList Optional arguments to pass to the constructor.
     * @returns The instance to use, or `null` to proceed with default construction.
     * @template T The type of the instance.
     */
    protected _applyProcessorsBeforeConstruction<T = any>(name: string, constructor: Function, argumentsList?: any[]): T | null;
    /**
     * Applies destruction-aware processors before an instance is destroyed.
     * @param name The name of the instance.
     * @param instance The instance to be destroyed.
     */
    protected _applyProcessorsBeforeDestruction(name: string, instance: Destroyable): void;
    /**
     * Applies initialization-aware processors before an instance is initialized.
     * @param name The name of the instance.
     * @param instance The instance to be initialized.
     * @returns The processed instance.
     * @template T The type of the instance.
     */
    protected _applyProcessorsBeforeInitialization<T>(name: string, instance: T): T;
    /**
     * Configures an instance by populating properties, invoking aware callbacks, and initializing.
     * @param name The name of the instance.
     * @param instance The instance to configure.
     * @returns The configured instance.
     * @throws {FrameworkError} If configuration fails.
     * @template T The type of the instance.
     */
    protected _configure<T = any>(name: string, instance: T): T;
    /**
     * Creates a new instance from a registered constructor.
     * @param name The name of the constructor.
     * @param argumentsList Optional arguments to pass to the constructor.
     * @returns The newly created instance.
     * @throws {FrameworkError} If instance creation fails.
     * @template T The type of the instance.
     */
    protected _create<T = any>(name: string, argumentsList?: any[]): T;
    /**
     * Initializes an instance by applying initialization processors and invoking the `init` method if available.
     * @param name The name of the instance.
     * @param instance The instance to initialize.
     * @returns The initialized instance.
     * @template T The type of the instance.
     */
    protected _initialize<T>(name: string, instance: T): T;
    /**
     * Populates properties of an instance, applying construction-aware processors.
     * @param name The name of the instance.
     * @param instance The instance to populate.
     * @param properties Optional property descriptor map to apply.
     * @template T The type of the instance.
     */
    protected _populate<T = any>(name: string, instance: T, properties?: PropertyDescriptorMap): void;
    /**
     * Invokes aware callbacks on an instance.
     * @param name The name of the instance.
     * @param instance The instance to invoke callbacks on.
     * @returns The instance after aware callbacks have been invoked.
     */
    private _invokeAware;
    /**
     * Invokes the `init` method on an initializable instance.
     * @param name The name of the instance.
     * @param instance The initializable instance.
     * @throws {FrameworkError} If initialization fails.
     */
    private _invokeInit;
}
/**
 * A default implementation of {@link AbstractFactory}.
 * @extends AbstractFactory
 * @example
 * const factory = new DefaultFactory();
 * factory.setValue( 'foo', 123 );
 * factory.getValue( 'foo' );
 * //=> 123
 * factory.hasValue( 'foo' );
 * //=> true
 * factory.deleteValue( 'foo' );
 * factory.hasValue( 'foo' );
 * //=> false
 */
export declare class DefaultFactory extends AbstractFactory {
}
/**
 * A factory that uses a Proxy to allow direct property access for value manipulation.
 * @extends DefaultFactory
 * @implements {Record<string, any>}
 * @example
 * const factory = new ProxiedFactory();
 * factory.foo = 123;
 * 'foo' in factory;
 * //=> true
 * delete factory.foo
 * 'foo' in factory;
 * //=> false
 * @see {@link DefaultFactory}
 */
export declare class ProxiedFactory extends DefaultFactory implements Record<string, any> {
    /**
     * Allows arbitrary properties to be added to the factory, which are then managed as values.
     */
    [key: string]: any;
    /**
     * Creates a new ProxiedFactory instance.
     * @returns A Proxy that wraps the factory, allowing direct property access.
     */
    constructor();
}
