/**
 * @author Jeff Rose
 */
import { /*Constructable,*/ likeEnumerable, isPrimitive, entriesIterator } from '@blue/core';
import { likeDestroyable, likeInitializable } from './lifecycle';
import { always, both, cond, equals, has, isConstructor, isFunction, isNumber, isString, like, T, } from '@blue/util';
import { AsAware, likeAwareAnd, likeAware, likeNameAware } from './aware';
import { RegistryProxyHandler } from './registry';
import { likeConstructionAwareProcessor, likeDestructionAwareProcessor, likeInitializationAwareProcessor, } from './entry-processor';
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
 * @see {@link NameAware}
 * @see {@link FactoryAware}
 * @see {@link EnvironmentAware}
 * @see {@link ApplicationEventEmitterAware}
 * @see {@link ContentSourceAware}
 * @see {@link ApplicationContextAware}
 */
/**
 * Return an instance of the specified value.
 * @param {string} name The name of the value.
 * @returns {*} An instance of the value specified by the `name`.
 */
/**
 * @extends module:factory.Factory
 */
/**
 * @extends module:factory.HierarchicalFactory
 * @extends module:factory.Registry
 */
/**
 * Interface to be implemented by values that wish to be aware of their owning {@link Factory|Factory}.
 */
/**
 * Setter that supplies the owning factory to the instance.
 * @param {module:factory.Factory} factory
 */
const { create, keys } = Object, { construct, defineProperty, deleteProperty } = Reflect;
/**
 * @see module:factory.AsFactoryAware
 * @implements module:factory.FactoryAware
 * @returns {module:factory.Constructable<module:factory.FactoryAware>}
 */
export const AsFactoryAware = (superclass) => class extends AsAware(superclass) {
    factory;
    /**
     * @param {module:factory.Factory} factory
     */
    setFactory(factory) {
        /**
         */
        defineProperty(this, 'factory', {
            get: () => factory,
            configurable: true,
            enumerable: false,
        });
    }
};
/**
 * @param {*} value The value to be tested
 * @returns {boolean} Whether or not the `value` provided is a {@link Factory|Factory}.
 */
export const likeFactory = like({ getInstance: Function });
/**
 * @param {*} value The value to be tested
 * @returns {boolean} Whether or not the `value` provided is {@link FactoryAware|FactoryAware}.
 */
export const likeFactoryAware = likeAwareAnd(like({ setFactory: Function }));
/**
 * @param {*} value The value to be tested
 * @returns {boolean} Whether or not the `value` provided is {@link HierarchicalFactory|HierarchicalFactory}.
 */
export const likeHierarchicalFactory = both(likeFactory, like({ parent: true, hasOwnValue: Function }));
/**
 * @param {*} value The value to be tested
 * @returns {boolean} Whether or not the `value` provided is {@link ConfigurableFactory|ConfigurableFactory}.
 */
export const likeConfigurableFactory = both(likeHierarchicalFactory, like({ addProcessor: Function, setParent: Function }));
export class AbstractFactory {
    #parent;
    processors;
    hasConstructionAwareProcessors;
    hasDestructionAwareProcessors;
    hasInitializationAwareProcessors;
    get [Symbol.toStringTag]() {
        return 'Factory';
    }
    get parent() {
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
    addProcessor(processor) {
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
    destroyValue(name) {
        if (this.hasValue(name)) {
            const value = this.getValue(name);
            if (likeDestroyable(value)) {
                this._applyProcessorsBeforeDestruction(name, value);
                value.destroy();
            }
            deleteProperty(this, name);
        }
    }
    getInstance(name, argumentsList = []) {
        return this.hasConstructor(name) ? this._create(name, argumentsList) : create(this[name]);
    }
    getValue(name, argumentsList = []) {
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
    hasConstructor(name) {
        return `$${name}` in this;
    }
    hasInstance(name) {
        return name in this;
    }
    hasOwnValue(name) {
        return has(name, this) || has(`$${name}`, this);
    }
    hasValue(name) {
        return this.hasInstance(name) || this.hasConstructor(name);
    }
    setParent(parent) {
        this.#parent = parent;
    }
    setValue(name, value) {
        // Constructor
        if (isConstructor(value)) {
            defineProperty(this, `$${name}`, {
                value: value,
                configurable: true,
                enumerable: false,
                writable: false,
            });
            // Instance
        }
        else {
            defineProperty(this, name, {
                value: value,
                configurable: true,
                enumerable: true,
                writable: false,
            });
            if (likeEnumerable(this[name])) {
                const alwaysName = always(name), entries = entriesIterator(this[name]);
                for (const [key, value] of entries) {
                    // Do not process an enumerable of primitives
                    if (isPrimitive(value)) {
                        break;
                    }
                    const instanceName = cond([
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
            }
            else {
                this._configure(name, this[name]);
            }
        }
    }
    _applyProcessorsAfterConstruction(name, instance) {
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
    _applyProcessorsAfterInitialization(name, instance) {
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
    _applyProcessorsBeforeConstruction(name, constructor, argumentsList = []) {
        let result = null;
        if (this.hasConstructionAwareProcessors) {
            const length = this.processors.length;
            let index = 0;
            for (; index < length; index++) {
                const processor = this.processors[index];
                if (likeConstructionAwareProcessor(processor)) {
                    result = processor.processBeforeConstruction(name, constructor, argumentsList);
                    if (!result) {
                        return result;
                    }
                }
            }
        }
        return result;
    }
    _applyProcessorsBeforeDestruction(name, instance) {
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
    _applyProcessorsBeforeInitialization(name, instance) {
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
    _configure(name, instance) {
        try {
            this._populate(name, instance);
            if (likeAware(instance)) {
                instance = this._invokeAware(name, instance);
            }
            instance = this._initialize(name, instance);
        }
        catch (e) {
            // TODO Do proper error handling
            console.error(e);
        }
        return instance;
    }
    _create(name, argumentsList = []) {
        let constructor = this[`$${name}`], instance = null;
        try {
            instance = this._applyProcessorsBeforeConstruction(name, constructor, argumentsList);
            if (!instance && isFunction(constructor)) {
                instance = construct(constructor, argumentsList);
            }
        }
        catch (e) {
            // TODO Do proper error handling
            console.error(e);
        }
        return this._configure(name, instance);
    }
    _initialize(name, instance) {
        instance = this._applyProcessorsBeforeInitialization(name, instance);
        try {
            if (likeInitializable(instance)) {
                this._invokeInit(name, instance);
            }
        }
        catch (e) { }
        instance = this._applyProcessorsAfterInitialization(name, instance);
        return instance;
    }
    _populate(name, instance, properties = {}) {
        if (instance === null) {
            return;
        }
        let populateProperties = true, processedValue = instance, processedProperties, index;
        const { hasConstructionAwareProcessors } = this, length = this.processors.length;
        if (hasConstructionAwareProcessors) {
            populateProperties = this._applyProcessorsAfterConstruction(name, instance);
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
                defineProperty(processedValue, key, processedProperties[key]);
            });
    }
    _invokeAware(name, instance) {
        if (likeNameAware(instance)) {
            instance.setName(name);
        }
        if (likeFactoryAware(instance)) {
            instance.setFactory(this);
        }
        return instance;
    }
    _invokeInit(name, instance) {
        try {
            instance.init();
        }
        catch (e) {
            // TODO Do proper error handling
            console.error(e);
        }
    }
}
/**
 * @abstract
 * @implements module:factory.ConfigurableFactory
 */
/**
 */
/**
 * @param {module:factory.EntryProcessor} processor
 */
/**
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
export class DefaultFactory extends AbstractFactory {
}
/**
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
 * @see {@link DefaultFactory}
 */
export class ProxiedFactory extends DefaultFactory {
    constructor() {
        super();
        return new Proxy(this, new RegistryProxyHandler());
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmFjdG9yeS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9mYWN0b3J5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOztHQUVHO0FBRUgsT0FBTyxFQUFFLGtCQUFrQixDQUFDLGNBQWMsRUFBRSxXQUFXLEVBQUUsZUFBZSxFQUFFLE1BQU0sWUFBWSxDQUFDO0FBQzdGLE9BQU8sRUFBOEIsZUFBZSxFQUFFLGlCQUFpQixFQUFFLE1BQU0sYUFBYSxDQUFDO0FBQzdGLE9BQU8sRUFDSCxNQUFNLEVBQ04sSUFBSSxFQUNKLElBQUksRUFDSixNQUFNLEVBQ04sR0FBRyxFQUVILGFBQWEsRUFDYixVQUFVLEVBQ1YsUUFBUSxFQUNSLFFBQVEsRUFDUixJQUFJLEVBQ0osQ0FBQyxHQUNKLE1BQU0sWUFBWSxDQUFDO0FBQ3BCLE9BQU8sRUFBUyxPQUFPLEVBQUUsWUFBWSxFQUFFLFNBQVMsRUFBRSxhQUFhLEVBQUUsTUFBTSxTQUFTLENBQUM7QUFDakYsT0FBTyxFQUFZLG9CQUFvQixFQUFFLE1BQU0sWUFBWSxDQUFDO0FBRTVELE9BQU8sRUFFSCw4QkFBOEIsRUFDOUIsNkJBQTZCLEVBQzdCLGdDQUFnQyxHQUNuQyxNQUFNLG1CQUFtQixDQUFDO0FBcUIzQjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQXlCRztBQUVIOzs7O0dBSUc7QUFFSDs7R0FFRztBQUVIOzs7R0FHRztBQUVIOztHQUVHO0FBRUg7OztHQUdHO0FBRUgsTUFBTSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsR0FBRyxNQUFNLEVBQzNCLEVBQUUsU0FBUyxFQUFFLGNBQWMsRUFBRSxjQUFjLEVBQUUsR0FBRyxPQUFPLENBQUM7QUFLNUQ7Ozs7R0FJRztBQUNILE1BQU0sQ0FBQyxNQUFNLGNBQWMsR0FBRyxDQUEwQixVQUFhLEVBQW1DLEVBQUUsQ0FDdEcsS0FBTSxTQUFRLE9BQU8sQ0FBQyxVQUFVLENBQUM7SUFDcEIsT0FBTyxDQUFVO0lBRTFCOztPQUVHO0lBQ0gs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