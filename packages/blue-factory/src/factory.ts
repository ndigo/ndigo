/**
 * @author Jeff Rose
 */

import { /*Constructable,*/ likeEnumerable, isPrimitive, entriesIterator } from '@blue/core';
import { Destroyable, Initializable, likeDestroyable, likeInitializable } from './lifecycle';
import {
    always,
    both,
    cond,
    equals,
    has,
    identity,
    isConstructor,
    isFunction,
    isNumber,
    isString,
    like,
    T,
} from '@blue/util';
import { Aware, AsAware, likeAwareAnd, likeAware, likeNameAware } from './aware';
import { Registry, RegistryProxyHandler } from './registry';
import { defineScope, getScope, hasScope, PrototypeScope, SingletonScope } from './scope';
import {
    EntryProcessor,
    likeConstructionAwareProcessor,
    likeDestructionAwareProcessor,
    likeInitializationAwareProcessor,
} from './entry-processor';
import Entry from './entry';

export interface Factory {
    getInstance<T = any>(name: string): T;
}

export interface HierarchicalFactory extends Factory {
    readonly parent: Factory;
    hasOwnValue(name: string): boolean;
}

export interface ConfigurableFactory extends HierarchicalFactory, Registry {
    addProcessor(processor: EntryProcessor): void;
    setParent(parent: Factory): void;
}

export interface FactoryAware extends Aware {
    setFactory(factory: Factory): void;
}

/**
 * This interface is implemented by objects that hold a number of value definitions, each uniquely identified by a {@link external:string|string} name.
 *
 * The point of this approach is that the `Factory` is a central registry of application components and centralizes configuration.
 *! THIS NEEDS TO BE UPDATED. IT'S MISSING LIFECYCLE HOOKS.
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
 * On teardown, the follow lfecycle should apply:
 * 1. `processBeforeDestruction`
 * 2. `destroy`
 * @interface module:factory.Factory
 * @see {@link module:factory.NameAware}
 * @see {@link module:factory.FactoryAware}
 * @see {@link module:context.EnvironmentAware}
 * @see {@link module:context.ApplicationEventEmitterAware}
 * @see {@link module:content.ContentSourceAware}
 * @see {@link module:context.ApplicationContextAware}
 */

/**
 * Return an instance of the specified value.
 * @function module:factory.Factory#getInstance
 * @param {external:string} name The name of the value.
 * @returns {*} An instance of the value specified by the `name`.
 */

/**
 * @interface module:factory.HierarchicalFactory
 * @extends module:factory.Factory
 */

/**
 * @interface module:factory.ConfigurableFactory
 * @extends module:factory.HierarchicalFactory
 * @extends module:factory.Registry
 */

/**
 * Interface to be implemented by values that wish to be aware of their owning {@linkcode module:factory.Factory|Factory}.
 * @interface module:factory.FactoryAware
 */

/**
 * Setter that supplies the owning factory to the instance.
 * @function module:factory.FactoryAware#setFactory
 * @param {module:factory.Factory} factory
 */

const { create, keys } = Object,
    { construct, defineProperty, deleteProperty } = Reflect;

// TODO Use the @blue/core version once it updates -JBR
type Constructable<T = {}> = new (...args: any[]) => T;

/**
 * @mixin module:factory.AsFactoryAware
 * @implements module:factory.FactoryAware
 * @returns {module:factory.Constructable<module:factory.FactoryAware>}
 */
export const AsFactoryAware = <T extends Constructable>(superclass: T): Constructable<FactoryAware> & T =>
    class extends AsAware(superclass) implements FactoryAware {
        readonly factory: Factory;

        /**
         * @function module:factory.AsFactoryAware#setFactory
         * @param {module:factory.Factory} factory
         */
        setFactory(factory: Factory): void {
            /**
             * @member {module:factory.Factory} module:factory.AsFactoryAware#factory
             */
            defineProperty(this, 'factory', {
                get: () => factory,
                configurable: true,
                enumerable: false,
            });
        }
    };

/**
 * @function module:factory.likeFactory
 * @param {*} value The value to be tested
 * @returns {external:boolean} Whether or not the `value` provided is a {@linkcode module:factory.Factory|Factory}.
 */
export const likeFactory = like({ getInstance: Function }) as (value) => value is Factory;

/**
 * @function module:factory.likeFactoryAware
 * @param {*} value The value to be tested
 * @returns {external:boolean} Whether or not the `value` provided is {@linkcode module:factory.FactoryAware|FactoryAware}.
 */
export const likeFactoryAware = likeAwareAnd(like({ setFactory: Function })) as (value) => value is FactoryAware;

/**
 * @function module:factory.likeHierarchicalFactory
 * @param {*} value The value to be tested
 * @returns {external:boolean} Whether or not the `value` provided is {@linkcode module:factory.HierarchicalFactory|HierarchicalFactory}.
 */
export const likeHierarchicalFactory = both(likeFactory, like({ parent: true, hasOwnValue: Function }));

/**
 * @function module:factory.likeConfigurableFactory
 * @param {*} value The value to be tested
 * @returns {external:boolean} Whether or not the `value` provided is {@linkcode module:factory.ConfigurableFactory|ConfigurableFactory}.
 */
export const likeConfigurableFactory = both(
    likeHierarchicalFactory,
    like({ addProcessor: Function, setParent: Function })
);

export abstract class AbstractFactory implements ConfigurableFactory {
    #parent: Factory;

    processors: EntryProcessor[];

    hasConstructionAwareProcessors: boolean;
    hasDestructionAwareProcessors: boolean;
    hasInitializationAwareProcessors: boolean;

    get [Symbol.toStringTag](): string {
        return 'Factory';
    }

    get parent(): Factory {
        return this.#parent;
    }

    constructor() {
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
    }

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

    destroyValue(name: string): void {
        if (this.hasValue(name)) {
            const value = this.getValue(name);
            if (likeDestroyable(value)) {
                this._applyProcessorsBeforeDestruction(name, value);
                value.destroy();
            }
            deleteProperty(this, name);
        }
    }

    getInstance<T = any>(name: string, argumentsList: any[] = []): T {
        return this.hasConstructor(name) ? this._create<T>(name, argumentsList) : create(this[name]);
    }

    getValue<T = any>(name: string, argumentsList: any[] = []): T {
        if (!this.hasInstance(name) && this.hasConstructor(name)) {
            defineProperty(this, name, {
                value: this._create(name, argumentsList),
                configurable: true,
                enumerable: false,
                writable: false,
            });
        }

        return this[name];
    }

    hasConstructor(name: string): boolean {
        return `$${name}` in this;
    }

    hasInstance(name: string): boolean {
        return name in this;
    }

    hasOwnValue(name: string): boolean {
        return has(name, this) || has(`$${name}`, this);
    }

    hasValue(name: string): boolean {
        return this.hasInstance(name) || this.hasConstructor(name);
    }

    setParent(parent: Factory): void {
        this.#parent = parent;
    }

    setValue<T = any>(name: string, value: T): void {
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
                        [isString, identity],
                        [T, alwaysName],
                    ])(key);

                    this._configure(instanceName, value);
                }
            } else {
                this._configure(name, this[name]);
            }
        }
    }

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

    protected _configure<T = any>(name: string, instance: T): T {
        try {
            this._populate<T>(name, instance);
            if (likeAware(instance)) {
                instance = this._invokeAware(name, instance) as T & Aware;
            }
            instance = this._initialize<T>(name, instance);
        } catch (e) {
            // TODO Do proper error handling
            console.error(e);
        }

        return instance;
    }

    protected _create<T = any>(name: string, argumentsList: any[] = []): T {
        let constructor: Function = this[`$${name}`],
            instance: T = null;

        try {
            instance = this._applyProcessorsBeforeConstruction<T>(name, constructor, argumentsList);

            if (!instance && isFunction(constructor)) {
                instance = construct(constructor, argumentsList);
            }
        } catch (e) {
            // TODO Do proper error handling
            console.error(e);
        }

        return this._configure<T>(name, instance);
    }

    protected _initialize<T>(name: string, instance: T): T {
        instance = this._applyProcessorsBeforeInitialization(name, instance);

        try {
            if (likeInitializable(instance)) {
                this._invokeInit(name, instance);
            }
        } catch (e) {}

        instance = this._applyProcessorsAfterInitialization(name, instance);

        return instance;
    }

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

        // TODO Add better handling of empty processedProperties
        processedProperties &&
            keys(processedProperties).forEach(function (key) {
                defineProperty(processedValue as unknown as object, key, processedProperties[key]);
            });
    }

    private _invokeAware(name: string, instance: Aware): Aware {
        if (likeNameAware(instance)) {
            instance.setName(name);
        }
        if (likeFactoryAware(instance)) {
            instance.setFactory(this);
        }
        return instance;
    }

    private _invokeInit(name: string, instance: Initializable): void {
        try {
            instance.init();
        } catch (e) {
            // TODO Do proper error handling
            console.error(e);
        }
    }
}

/**
 * @abstract
 * @class module:factory.AbstractFactory
 * @implements module:factory.ConfigurableFactory
 */

/**
 * @member {external:Array<module:factory.EntryProcessor>} module:factory.AbstractFactory#processors
 */

/**
 * @function module:factory.AbstractFactory#addProcessor
 * @param {module:factory.EntryProcessor} processor
 */

/**
 * @class module:factory.DefaultFactory
 * @extends module:factory.AbstractFactory
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
 * @class module:factory.ProxiedFactory
 * @extends module:factory.DefaultFactory
 * @implements external:Record
 * @example
 * const factory = new ProxiedFactory();
 * factory.foo = 123;
 * 'foo' in factory;
 * //=> true
 * delete factory.foo
 * 'foo' in factory;
 * //=> false
 * @see {@link module:factory.DefaultFactory}
 */
export class ProxiedFactory extends DefaultFactory implements Record<string, any> {
    [key: string]: any;

    constructor() {
        super();
        return new Proxy(this, new RegistryProxyHandler<this>());
    }
}
