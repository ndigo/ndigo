/**
 * @author Jeff Rose
 */

import { Constructable, FrameworkError, likeEnumerable, isPrimitive, entriesIterator } from '@blue/core';
import { Destroyable, Initializable, likeDestroyable, likeInitializable } from './lifecycle';
import { always, T } from '@blue/util/function';
import { cond } from '@blue/util/logic';
import { has } from '@blue/util/object';
import { equals } from '@blue/util/relation';
import { isConstructor, isFunction, isNumber, isString, like } from '@blue/util/types';
import { Aware, AsAware, likeAwareAnd, likeAware, likeNameAware } from './aware';
import { ContextToken } from './context-token';
import { Registry, RegistryProxyHandler } from './registry';
import { getScope, HashScope, PossibleScope, PrototypeScope, Scope, ScopedFactory, SingletonScope } from './scope';
import ScopeRegistry from './_scope-registry';
import {
    EntryProcessor,
    likeConstructionAwareProcessor,
    likeDestructionAwareProcessor,
    likeInitializationAwareProcessor,
} from './entry-processor';

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
    readonly parent: Factory;
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
    setParent(parent: Factory): void;
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

const { create, keys } = Object,
    { construct, defineProperty, deleteProperty } = Reflect;

/**
 * Returns the error message from an unknown error type.
 * @param e The unknown error.
 * @returns The error message as a string.
 */
const getErrorMessage = (e: unknown): string => {
    return e instanceof Error ? e.message : String(e);
};

/**
 * A mixin that adds {@link FactoryAware} capabilities to a class.
 * @template T The type of the constructor.
 * @param superclass The superclass to extend.
 * @returns A new class that extends the superclass and implements {@link FactoryAware}.
 */
export const AsFactoryAware = <T extends Constructable>(superclass: T): Constructable<FactoryAware> & T =>
    class extends AsAware(superclass) implements FactoryAware {
        /**
         * The factory that created this instance.
         */
        readonly factory: Factory;

        /**
         * Sets the factory that created this instance.
         * @param factory The factory instance.
         */
        setFactory(factory: Factory): void {
            defineProperty(this, 'factory', {
                get: () => factory,
                configurable: true,
                enumerable: false,
            });
        }
    };

/**
 * Determines whether or not the `value` provided is a {@link Factory}.
 * @param value The value to be tested.
 * @returns Whether or not the `value` provided is a {@link Factory}.
 */
export const likeFactory = like({ getInstance: Function }) as (value) => value is Factory;

/**
 * Determines whether or not the `value` provided is {@link FactoryAware}.
 * @param value The value to be tested.
 * @returns Whether or not the `value` provided is {@link FactoryAware}.
 */
export const likeFactoryAware = likeAwareAnd(like({ setFactory: Function })) as (value) => value is FactoryAware;

const _likeHierarchicalShape = like({ parent: true, hasOwnValue: Function });

/**
 * Determines whether or not the `value` provided is {@link HierarchicalFactory}.
 * @param value The value to be tested.
 * @returns Whether or not the `value` provided is {@link HierarchicalFactory}.
 */
export const likeHierarchicalFactory = (value) => likeFactory(value) && _likeHierarchicalShape(value);

const _likeConfigurableShape = like({ addProcessor: Function, setParent: Function });

/**
 * Determines whether or not the `value` provided is {@link ConfigurableFactory}.
 * @param value The value to be tested.
 * @returns Whether or not the `value` provided is {@link ConfigurableFactory}.
 */
export const likeConfigurableFactory = (value) => likeHierarchicalFactory(value) && _likeConfigurableShape(value);

/**
 * An abstract base class for implementing a {@link ConfigurableFactory} and {@link ScopedFactory}.
 */
export abstract class AbstractFactory implements ConfigurableFactory, ScopedFactory {
    /**
     * The parent factory in a hierarchical setup.
     */
    #parent: Factory;
    /**
     * The registry for managing different scopes.
     */
    #scopeRegistry: ScopeRegistry;

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
    get [Symbol.toStringTag](): string {
        return 'Factory';
    }

    /**
     * Returns the parent factory.
     * @returns The parent factory.
     */
    get parent(): Factory {
        return this.#parent;
    }

    /**
     * Creates a new AbstractFactory instance and initializes its scope registry and default scopes.
     */
    constructor() {
        this.#scopeRegistry = new ScopeRegistry();

        this.processors = [];
        defineProperty(this, 'hasConstructionAwareProcessors', {
            value: false,
            configurable: true,
            enumerable: false,
            writable: false,
        });
        defineProperty(this, 'hasDestructionAwareProcessors', {
            value: false,
            configurable: true,
            enumerable: false,
            writable: false,
        });
        defineProperty(this, 'hasInitializationAwareProcessors', {
            value: false,
            configurable: true,
            enumerable: false,
            writable: false,
        });

        this.registerScope('prototype', new PrototypeScope());
        this.registerScope('route', new HashScope());
        this.registerScope('hash', this.getScope('route'));
        this.registerScope('singleton', new SingletonScope());
    }

    /**
     * Adds an entry processor to the factory.
     * @param processor The entry processor to add.
     */
    addProcessor(processor: EntryProcessor): void {
        const index = this.processors.indexOf(processor);
        if (index !== -1) {
            this.processors.splice(index, 1);
        }
        if (!this.hasConstructionAwareProcessors && likeConstructionAwareProcessor(processor)) {
            defineProperty(this, 'hasConstructionAwareProcessors', {
                value: true,
                configurable: true,
                enumerable: false,
                writable: false,
            });
        }
        if (!this.hasDestructionAwareProcessors && likeDestructionAwareProcessor(processor)) {
            defineProperty(this, 'hasDestructionAwareProcessors', {
                value: true,
                configurable: true,
                enumerable: false,
                writable: false,
            });
        }
        if (!this.hasInitializationAwareProcessors && likeInitializationAwareProcessor(processor)) {
            defineProperty(this, 'hasInitializationAwareProcessors', {
                value: true,
                configurable: true,
                enumerable: false,
                writable: false,
            });
        }
        this.processors.push(processor);
    }

    /**
     * Destroys a value managed by the factory.
     * @param nameOrToken The name or ContextToken of the value to destroy.
     * @template T The type of the value.
     */
    destroyValue<T = any>(token: ContextToken<T>): void;
    destroyValue(name: string): void;
    destroyValue<T = any>(nameOrToken: string | ContextToken<T>): void {
        const name = typeof nameOrToken === 'string' ? nameOrToken : nameOrToken.description;

        if (!this.hasValue(name)) {
            return;
        }

        if (this.hasInstance(name)) {
            const value = this[name];
            if (likeDestroyable(value)) {
                this._applyProcessorsBeforeDestruction(name, value);
                value.destroy();
            }
            deleteProperty(this, name);
        }

        if (this.hasConstructor(name)) {
            const constructor = this[`$${name}`],
                scopeName = getScope(constructor) ?? 'singleton';

            this.destroyScopedValue(scopeName, name);
        }
    }

    /**
     * Returns an instance of the specified value.
     * @param name The name of the value.
     * @param argumentsList Optional arguments to pass to the constructor if the value is a constructor.
     * @returns An instance of the value.
     * @template T The type of the instance.
     */
    getInstance<T = any>(name: string, argumentsList: any[] = []): T {
        return this.hasConstructor(name) ? this._create<T>(name, argumentsList) : create(this[name]);
    }

    /**
     * Retrieves a value from the factory, creating it if necessary.
     * @param nameOrToken The name or ContextToken of the value to retrieve.
     * @param argumentsList Optional arguments to pass to the constructor if the value is a constructor.
     * @returns The retrieved value.
     * @template T The type of the value.
     */
    getValue<T = any>(token: ContextToken<T>): T;
    getValue<T = any>(name: string, argumentsList?: any[]): T;
    getValue<T = any>(nameOrToken: string | ContextToken<T>, argumentsList: any[] = []): T {
        const name = typeof nameOrToken === 'string' ? nameOrToken : nameOrToken.description;

        if (this.hasInstance(name)) {
            return this[name];
        }

        if (this.hasConstructor(name)) {
            const constructor = this[`$${name}`],
                scopeName = getScope(constructor) ?? 'singleton',
                scope = this.getScope(scopeName);

            const value = scope.getValue<T>(name, () => this._create<T>(name, argumentsList));

            if (scopeName === 'singleton') {
                defineProperty(this, name, {
                    value,
                    configurable: true,
                    enumerable: false,
                    writable: false,
                });
            }

            return value;
        }

        return this[name];
    }

    /**
     * Destroys a scoped value.
     * @param scopeName The name of the scope.
     * @param valueName The name of the value within the scope.
     */
    destroyScopedValue(scopeName: PossibleScope, valueName: string): void {
        this.#scopeRegistry.destroyScopedValue(scopeName, valueName);
    }

    /**
     * Retrieves a scope by its name.
     * @param name The name of the scope.
     * @returns The Scope instance.
     */
    getScope(name: PossibleScope): Scope {
        return this.#scopeRegistry.getScope(name);
    }

    /**
     * Returns an array of all registered scope names.
     * @returns An array of PossibleScope names.
     */
    getScopeNames(): PossibleScope[] {
        return this.#scopeRegistry.getScopeNames();
    }

    /**
     * Checks if the factory has a constructor registered under the given name.
     * @param name The name of the constructor.
     * @returns `true` if a constructor is registered, `false` otherwise.
     */
    hasConstructor(name: string): boolean {
        return `$${name}` in this;
    }

    /**
     * Checks if the factory has an instance registered under the given name.
     * @param name The name of the instance.
     * @returns `true` if an instance is registered, `false` otherwise.
     */
    hasInstance(name: string): boolean {
        return name in this;
    }

    /**
     * Checks if the factory has its own value (either an instance or a constructor) registered under the given name.
     * @param name The name of the value.
     * @returns `true` if this factory has its own value, `false` otherwise.
     */
    hasOwnValue(name: string): boolean {
        return has(name, this) || has(`$${name}`, this);
    }

    /**
     * Checks if the factory has a value (either an instance or a constructor) registered under the given name or token.
     * @param nameOrToken The name or ContextToken of the value.
     * @returns `true` if a value is registered, `false` otherwise.
     * @template T The type of the value.
     */
    hasValue<T = any>(token: ContextToken<T>): boolean;
    hasValue(name: string): boolean;
    hasValue<T = any>(nameOrToken: string | ContextToken<T>): boolean {
        const name = typeof nameOrToken === 'string' ? nameOrToken : nameOrToken.description;
        return this.hasInstance(name) || this.hasConstructor(name);
    }

    /**
     * Registers a new scope with the factory.
     * @param name The name of the scope.
     * @param scope The Scope instance to register.
     */
    registerScope(name: PossibleScope, scope: Scope): void {
        this.#scopeRegistry.registerScope(name, scope);
    }

    /**
     * Sets the parent factory for this hierarchical factory.
     * @param parent The parent factory.
     */
    setParent(parent: Factory): void {
        this.#parent = parent;
    }

    /**
     * Sets a value (either a constructor or an instance) in the factory.
     * @param nameOrToken The name or ContextToken under which to register the value.
     * @param value The value to register.
     * @template T The type of the value.
     */
    setValue<T = any>(token: ContextToken<T>, value: T): void;
    setValue<T = any>(name: string, value: T): void;
    setValue<T = any>(nameOrToken: string | ContextToken<T>, value: T): void {
        const name = typeof nameOrToken === 'string' ? nameOrToken : nameOrToken.description;

        // Constructor
        if (isConstructor(value)) {
            defineProperty(this, `$${name}`, {
                value: value,
                configurable: true,
                enumerable: false,
                writable: false,
            });
            // Instance
        } else {
            defineProperty(this, name, {
                value: value,
                configurable: true,
                enumerable: true,
                writable: false,
            });

            if (likeEnumerable(this[name])) {
                const alwaysName = always(name),
                    entries = entriesIterator(this[name]);

                for (const [key, value] of entries) {
                    // Do not process an enumerable of primitives
                    if (isPrimitive(value)) {
                        break;
                    }

                    const instanceName: string = cond([
                        // Simple Collection, e.g. Set, where entry is [ value, value ]
                        [equals(value), alwaysName],
                        // Indexed Collection, e.g. Array, where entry is [ index, value ]
                        [isNumber, () => `${name}[${String(key)}]`],
                        // Keyed Collection, e.g. Map, where entry is [ key, value ]
                        [isString, () => String(key)],
                        [T, alwaysName],
                    ])(key);

                    this._configure(instanceName, value);
                }
            } else {
                this._configure(name, this[name]);
            }
        }
    }

    /**
     * Applies construction-aware processors after an instance has been constructed.
     * @param name The name of the instance.
     * @param instance The constructed instance.
     * @returns `true` if properties should be populated, `false` otherwise.
     * @template T The type of the instance.
     */
    protected _applyProcessorsAfterConstruction<T = any>(name: string, instance: T): boolean {
        let populateProperties = true;

        if (this.hasConstructionAwareProcessors) {
            const length = this.processors.length;
            let index = 0;
            for (; index < length; index++) {
                const processor = this.processors[index];
                if (likeConstructionAwareProcessor(processor)) {
                    populateProperties = processor.processAfterConstruction(name, instance);
                    if (!populateProperties) {
                        break;
                    }
                }
            }
        }

        return populateProperties;
    }

    /**
     * Applies initialization-aware processors after an instance has been initialized.
     * @param name The name of the instance.
     * @param instance The initialized instance.
     * @returns The processed instance.
     * @template T The type of the instance.
     */
    protected _applyProcessorsAfterInitialization<T>(name: string, instance: T): T {
        let result = instance;

        if (this.hasInitializationAwareProcessors) {
            const length = this.processors.length;
            let index = 0;
            for (; index < length; index++) {
                const processor = this.processors[index];
                if (likeInitializationAwareProcessor(processor)) {
                    const processed = processor.processAfterInitialization(name, result);
                    if (!processed) {
                        return result;
                    }
                    result = processed;
                }
            }
        }

        return result;
    }

    /**
     * Applies construction-aware processors before an instance is constructed.
     * @param name The name of the instance.
     * @param constructor The constructor function.
     * @param argumentsList Optional arguments to pass to the constructor.
     * @returns The instance to use, or `null` to proceed with default construction.
     * @template T The type of the instance.
     */
    protected _applyProcessorsBeforeConstruction<T = any>(
        name: string,
        constructor: Function,
        argumentsList: any[] = []
    ): T | null {
        let result: T = null;

        if (this.hasConstructionAwareProcessors) {
            const length = this.processors.length;
            let index = 0;
            for (; index < length; index++) {
                const processor = this.processors[index];
                if (likeConstructionAwareProcessor(processor)) {
                    result = processor.processBeforeConstruction<T>(name, constructor, argumentsList);
                    if (!result) {
                        return result;
                    }
                }
            }
        }

        return result;
    }

    /**
     * Applies destruction-aware processors before an instance is destroyed.
     * @param name The name of the instance.
     * @param instance The instance to be destroyed.
     */
    protected _applyProcessorsBeforeDestruction(name: string, instance: Destroyable): void {
        if (this.hasDestructionAwareProcessors) {
            const length = this.processors.length;
            let index = 0;
            for (; index < length; index++) {
                const processor = this.processors[index];
                if (likeDestructionAwareProcessor(processor)) {
                    processor.processBeforeDestruction(name, instance);
                }
            }
        }
    }

    /**
     * Applies initialization-aware processors before an instance is initialized.
     * @param name The name of the instance.
     * @param instance The instance to be initialized.
     * @returns The processed instance.
     * @template T The type of the instance.
     */
    protected _applyProcessorsBeforeInitialization<T>(name: string, instance: T): T {
        let result = instance;
        if (this.hasInitializationAwareProcessors) {
            const length = this.processors.length;
            let index = 0;
            for (; index < length; index++) {
                const processor = this.processors[index];
                if (likeInitializationAwareProcessor(processor)) {
                    const processed = processor.processBeforeInitialization(name, result);
                    if (!processed) {
                        return result;
                    }
                    result = processed;
                }
            }
        }

        return result;
    }

    /**
     * Configures an instance by populating properties, invoking aware callbacks, and initializing.
     * @param name The name of the instance.
     * @param instance The instance to configure.
     * @returns The configured instance.
     * @throws {FrameworkError} If configuration fails.
     * @template T The type of the instance.
     */
    protected _configure<T = any>(name: string, instance: T): T {
        try {
            this._populate<T>(name, instance);
            if (likeAware(instance)) {
                instance = this._invokeAware(name, instance) as T & Aware;
            }
            instance = this._initialize<T>(name, instance);
        } catch (e) {
            throw new FrameworkError(`Failed to configure entry '${name}': ${getErrorMessage(e)}`);
        }

        return instance;
    }

    /**
     * Creates a new instance from a registered constructor.
     * @param name The name of the constructor.
     * @param argumentsList Optional arguments to pass to the constructor.
     * @returns The newly created instance.
     * @throws {FrameworkError} If instance creation fails.
     * @template T The type of the instance.
     */
    protected _create<T = any>(name: string, argumentsList: any[] = []): T {
        let constructor: Function = this[`$${name}`],
            instance: T = null;

        try {
            instance = this._applyProcessorsBeforeConstruction<T>(name, constructor, argumentsList);

            if (!instance && isFunction(constructor)) {
                instance = construct(constructor, argumentsList);
            }
        } catch (e) {
            throw new FrameworkError(`Failed to create entry '${name}': ${getErrorMessage(e)}`);
        }

        return this._configure<T>(name, instance);
    }

    /**
     * Initializes an instance by applying initialization processors and invoking the `init` method if available.
     * @param name The name of the instance.
     * @param instance The instance to initialize.
     * @returns The initialized instance.
     * @template T The type of the instance.
     */
    protected _initialize<T>(name: string, instance: T): T {
        instance = this._applyProcessorsBeforeInitialization(name, instance);

        try {
            if (likeInitializable(instance)) {
                this._invokeInit(name, instance);
            }
        } catch (e) {
            console.warn(`[Factory] Failed to initialize entry '${name}':`, e);
        }

        instance = this._applyProcessorsAfterInitialization(name, instance);

        return instance;
    }

    /**
     * Populates properties of an instance, applying construction-aware processors.
     * @param name The name of the instance.
     * @param instance The instance to populate.
     * @param properties Optional property descriptor map to apply.
     * @template T The type of the instance.
     */
    protected _populate<T = any>(name: string, instance: T, properties: PropertyDescriptorMap = {}): void {
        if (instance === null) {
            return;
        }

        let populateProperties = true,
            processedValue: T = instance,
            processedProperties: PropertyDescriptorMap,
            index: number;
        const { hasConstructionAwareProcessors } = this,
            length = this.processors.length;

        if (hasConstructionAwareProcessors) {
            populateProperties = this._applyProcessorsAfterConstruction<T>(name, instance);
        }
        if (!populateProperties) {
            return;
        }

        if (hasConstructionAwareProcessors) {
            index = 0;
            for (; index < length; index++) {
                const processor = this.processors[index];
                if (likeConstructionAwareProcessor(processor)) {
                    processedProperties = processor.processProperties(properties, name, processedValue);
                }
            }
        }

        if (processedProperties) {
            keys(processedProperties).forEach(function (key) {
                defineProperty(processedValue as unknown as object, key, processedProperties[key]);
            });
        }
    }

    /**
     * Invokes aware callbacks on an instance.
     * @param name The name of the instance.
     * @param instance The instance to invoke callbacks on.
     * @returns The instance after aware callbacks have been invoked.
     */
    private _invokeAware(name: string, instance: Aware): Aware {
        if (likeNameAware(instance)) {
            instance.setName(name);
        }
        if (likeFactoryAware(instance)) {
            instance.setFactory(this);
        }
        return instance;
    }

    /**
     * Invokes the `init` method on an initializable instance.
     * @param name The name of the instance.
     * @param instance The initializable instance.
     * @throws {FrameworkError} If initialization fails.
     */
    private _invokeInit(name: string, instance: Initializable): void {
        try {
            instance.init();
        } catch (e) {
            throw new FrameworkError(`Initialization failed for entry '${name}': ${getErrorMessage(e)}`);
        }
    }
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
export class DefaultFactory extends AbstractFactory {}

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
export class ProxiedFactory extends DefaultFactory implements Record<string, any> {
    /**
     * Allows arbitrary properties to be added to the factory, which are then managed as values.
     */
    [key: string]: any;

    /**
     * Creates a new ProxiedFactory instance.
     * @returns A Proxy that wraps the factory, allowing direct property access.
     */
    constructor() {
        super();
        return new Proxy(this, new RegistryProxyHandler<this>());
    }
}
