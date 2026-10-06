/**
 * @module blue-factory
 * @since 1.0.0
 * @author Jeff Rose
 */
import {
    FrameworkError,
    likeEnumerable,
    isPrimitive,
    entriesIterator,
    isShared,
    getSharedOptions,
    satisfiesVersion,
} from '@blue/core';
import { Destroyable, Initializable, likeCloseable, likeDestroyable, likeInitializable } from './lifecycle';
import { isConstructor, isNumber, isString } from '@blue/util/types';
import { Aware, likeAware, likeNameAware } from './aware';
import { ContextToken } from './context-tokens';
import {
    getScope,
    HashScope,
    PossibleScope,
    PrototypeScope,
    RefreshScope,
    Scope,
    ScopedFactory,
    SingletonScope,
} from './scope';
import ScopeRegistry from './_scope-registry';
import {
    EntryProcessor,
    likeConstructionAwareProcessor,
    likeDestructionAwareProcessor,
    likeInitializationAwareProcessor,
} from './entry-processor';
import { Factory, ConfigurableFactory, FactoryAware, likeFactoryAware, getErrorMessage } from './factory-contract';
import { create, keys, construct, defineProperty, deleteProperty } from './factory-shared';
import { getLogger } from '@blue/log';

const logger = getLogger('blue-factory:abstract-factory');

/**
 * An abstract base class for implementing a {@link ConfigurableFactory} and {@link ScopedFactory}.
 */
export abstract class AbstractFactory implements ConfigurableFactory, ScopedFactory {
    /**
     * The parent factory in a hierarchical setup.
     */
    #parent: Factory | null = null;
    /**
     * The registry for managing different scopes.
     */
    #scopeRegistry!: ScopeRegistry;

    /**
     * A list of entry processors applied to instances.
     */
    processors!: EntryProcessor[];

    /**
     * Indicates if there are any construction-aware processors.
     */
    hasConstructionAwareProcessors!: boolean;
    /**
     * Indicates if there are any destruction-aware processors.
     */
    hasDestructionAwareProcessors!: boolean;
    /**
     * Indicates if there are any initialization-aware processors.
     */
    hasInitializationAwareProcessors!: boolean;

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
    get parent(): Factory | null {
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
        // AD-29 D-2: refresh-scoped beans re-create on environment refresh.
        // Registered by default so @refreshScope works with zero wiring; the
        // owning context wires the config:refresh event to scope.clear().
        this.registerScope('refresh', new RefreshScope());
    }

    /**
     * Allows arbitrary properties to be added to the factory, which are then managed as values.
     */
    [key: string]: unknown;

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
     * @param token (the scope-entry key) The name or ContextToken of the value to destroy.
     * @template T The type of the value.
     */
    destroyValue<T = unknown>(token: ContextToken<T>): void;
    destroyValue(name: string): void;
    destroyValue<T = unknown>(nameOrToken: string | ContextToken<T>): void {
        const name = typeof nameOrToken === 'string' ? nameOrToken : nameOrToken.description;

        if (!this.hasValue(name)) {
            return;
        }

        if (this.hasInstance(name)) {
            const value = this[name];
            if (likeDestroyable(value)) {
                this._applyProcessorsBeforeDestruction(name, value);
                value.destroy();
            } else if (likeCloseable(value)) {
                value.close();
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
     * @param argumentsList (constructor arguments) Optional arguments to pass to the constructor if the value is a constructor.
     * @returns An instance of the value.
     * @template T The type of the instance.
     */
    getInstance<T = unknown>(name: string, argumentsList: unknown[] = []): T {
        const value = this[name];
        // Non-constructor values are stored directly under `name`.
        return this.hasConstructor(name) ? this._create<T>(name, argumentsList) : create(value as object | null);
    }

    /**
     * Retrieves a value from the factory, creating it if necessary.
     * @param token (the scope-entry key) The name or ContextToken of the value to retrieve.
     * @returns The retrieved value.
     * @template T The type of the value.
     */
    getValue<T = unknown>(token: ContextToken<T>): T;
    getValue<T = unknown>(name: string, argumentsList?: unknown[]): T;
    getValue<T = unknown>(nameOrToken: string | ContextToken<T>, argumentsList: unknown[] = []): T {
        const name = typeof nameOrToken === 'string' ? nameOrToken : nameOrToken.description;

        if (this.hasInstance(name)) {
            // The value was stored under `name` via `setValue<T>`, so it is `T`.
            return this[name] as T;
        }

        if (this.hasConstructor(name)) {
            const constructor = this[`$${name}`],
                scopeName = getScope(constructor) ?? 'singleton',
                scope = this.getScope(scopeName);

            const value = scope.getValue<T>(name, () => {
                const instance = this._create<T>(name, argumentsList);

                // CF-3 / AD-29 D-2: the scope's value factory runs only when a
                // new instance is created, so lifecycle teardown is registered
                // exactly once per instance (never on cache hits).
                this._registerRefreshDestructionCallback(scope, name, instance);
                return instance;
            });

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

        // Resolve from parent chain if not found locally
        if (this.#parent) {
            const value = (this.#parent as unknown as AbstractFactory).getValue<T>(name, argumentsList);
            this._checkVersion(nameOrToken, value);
            return value;
        }

        // Last resort: the value (if any) was stored under `name` via `setValue<T>`.
        return this[name] as T;
    }

    /**
     * Registers a destruction callback for a lifecycle-bearing value created
     * by the refresh scope, so the scope's `clear()` (environment
     * `config:refresh`, AD-29 D-2) runs `destroy()`/`close()` before discarding.
     *
     * Only the refresh scope opts in. `SingletonScope` also declares the hook,
     * but singleton values are torn down by {@link destroyValue} itself; a
     * factory-registered callback there would run `destroy()`/`close()` twice.
     * Prototype/hash values are never cached, so no scope outlives them.
     */
    private _registerRefreshDestructionCallback(scope: Scope, name: string, value: unknown): void {
        if (!(scope instanceof RefreshScope)) {
            return;
        }

        if (likeDestroyable(value)) {
            const destroyable = value;
            scope.registerDestructionCallback(name, () => destroyable.destroy());
        } else if (likeCloseable(value)) {
            const closeable = value;
            scope.registerDestructionCallback(name, () => closeable.close());
        }
    }

    /**
     * Checks the resolved value's version against the token's requiredVersion and warns on mismatch.
     */
    _checkVersion<T>(nameOrToken: string | ContextToken<T>, value: T): void {
        if (typeof nameOrToken === 'string') {
            return; // no version info without a token
        }

        const requiredVersion = nameOrToken.requiredVersion;
        if (!requiredVersion) {
            return;
        }

        const actualVersion = typeof value === 'function' ? getSharedOptions(value as Function)?.version : undefined;
        if (!actualVersion) {
            return;
        }

        // Warn if the actual version doesn't satisfy the token's required range.
        if (!satisfiesVersion(actualVersion, requiredVersion)) {
            logger.warn(
                `Dependency '${nameOrToken.description}' version ${actualVersion} does not satisfy ` +
                    `required range '${requiredVersion}'`
            );
        }
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
        return (
            Object.prototype.hasOwnProperty.call(this, name) || Object.prototype.hasOwnProperty.call(this, `$${name}`)
        );
    }

    /**
     * Checks if the factory has a value (either an instance or a constructor) registered under the given name or token.
     * @param token (the scope-entry key) The name or ContextToken of the value.
     * @returns `true` if a value is registered, `false` otherwise.
     * @template T The type of the value.
     */
    hasValue<T = unknown>(token: ContextToken<T>): boolean;
    hasValue(name: string): boolean;
    hasValue<T = unknown>(nameOrToken: string | ContextToken<T>): boolean {
        const name = typeof nameOrToken === 'string' ? nameOrToken : nameOrToken.description;
        return (
            this.hasInstance(name) ||
            this.hasConstructor(name) ||
            (this.#parent ? (this.#parent as unknown as AbstractFactory).hasValue(name) : false)
        );
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
    setParent(parent: Factory | null): void {
        this.#parent = parent;
    }

    /**
     * Sets a value (either a constructor or an instance) in the factory.
     * @param token (the scope-entry key) The name or ContextToken under which to register the value.
     * @param value The value to register.
     * @template T The type of the value.
     */
    setValue<T = unknown>(token: ContextToken<T>, value: T): void;
    setValue<T = unknown>(name: string, value: T): void;
    setValue<T = unknown>(nameOrToken: string | ContextToken<T>, value: T): void {
        const name = typeof nameOrToken === 'string' ? nameOrToken : nameOrToken.description;

        // Skip @shared beans in child factories — resolved from parent chain
        if (isConstructor(value) && isShared(value as Function) && this.#parent) {
            return;
        }

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

            const stored = this[name];

            if (likeEnumerable(stored)) {
                const alwaysName = () => name,
                    entries = entriesIterator(stored);

                for (const [key, entryValue] of entries) {
                    // Do not process an enumerable of primitives
                    if (isPrimitive(entryValue)) {
                        break;
                    }

                    let instanceName: string;
                    if (key === entryValue) {
                        // Simple Collection, e.g. Set, where entry is [ value, value ]
                        instanceName = alwaysName();
                    } else if (isNumber(key)) {
                        // Indexed Collection, e.g. Array, where entry is [ index, value ]
                        instanceName = `${name}[${String(key)}]`;
                    } else if (isString(key)) {
                        // Keyed Collection, e.g. Map, where entry is [ key, value ]
                        instanceName = String(key);
                    } else {
                        instanceName = alwaysName();
                    }

                    this._configure(instanceName, entryValue);
                }
            } else {
                this._configure(name, stored);
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
    protected _applyProcessorsAfterConstruction<T = unknown>(name: string, instance: T): boolean {
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
     * @param argumentsList (constructor arguments) Optional arguments to pass to the constructor.
     * @returns The instance to use, or `null` to proceed with default construction.
     * @template T The type of the instance.
     */
    protected _applyProcessorsBeforeConstruction<T = unknown>(
        name: string,
        constructor: Function,
        argumentsList: unknown[] = []
    ): T | null {
        let result: T | null = null;

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
    protected _configure<T = unknown>(name: string, instance: T): T {
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
     * @param argumentsList (constructor arguments) Optional arguments to pass to the constructor.
     * @returns The newly created instance.
     * @throws {FrameworkError} If instance creation fails.
     * @template T The type of the instance.
     */
    protected _create<T = unknown>(name: string, argumentsList: unknown[] = []): T {
        let instance: T | null = null;

        try {
            // `hasConstructor(name)` was verified by the caller, so `$${name}` holds a Function.
            const registered = this[`$${name}`];
            const constructor = typeof registered === 'function' ? registered : undefined;

            if (constructor) {
                instance = this._applyProcessorsBeforeConstruction<T>(name, constructor, argumentsList);

                if (!instance) {
                    instance = construct(constructor, argumentsList);
                }
            }
        } catch (e) {
            throw new FrameworkError(`Failed to create entry '${name}': ${getErrorMessage(e)}`);
        }

        return this._configure<T>(name, instance as T);
    }

    /**
     * Initializes an instance by applying initialization processors and invoking the `init` method if available.
     * Initialization is fail-loud: an `init()` failure propagates, so a half-initialized instance is never served.
     * @param name The name of the instance.
     * @param instance The instance to initialize.
     * @returns The initialized instance.
     * @throws {FrameworkError} If initialization fails.
     * @template T The type of the instance.
     */
    protected _initialize<T>(name: string, instance: T): T {
        instance = this._applyProcessorsBeforeInitialization(name, instance);

        if (likeInitializable(instance)) {
            this._invokeInit(name, instance);
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
    protected _populate<T = unknown>(name: string, instance: T, properties: PropertyDescriptorMap = {}): void {
        if (instance === null) {
            return;
        }

        let populateProperties = true,
            processedValue: T = instance,
            processedProperties: PropertyDescriptorMap | undefined,
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
            const props = processedProperties;
            keys(props).forEach(function (key) {
                defineProperty(processedValue as object, key, props[key]);
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
            (instance as FactoryAware).setFactory(this);
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
