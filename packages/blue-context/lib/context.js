/**
 * @author Jeff Rose
 */
import { escalate } from '@blue/core';
import { likeContentSourceAware, likeContentSource } from '@blue/content';
import { allPass } from '@blue/util/logic';
import { like } from '@blue/util/types';
import { AsEventEmitter, likeApplicationEventEmitterAware, likeEventEmitter, } from './event-emitter';
import { likeDestroyable, likeFactory, likeRegistry, DefaultFactory, RegistryProxyHandler, likeAwareAnd, AsAware, likeAware, } from '@blue/factory';
import { likeEnvironmentSource, likeEnvironmentAware, StandardEnvironment, } from './environment';
import { likeResourceLoader, AsModuleResourceLoader, likeResourceLoaderAware } from './resource';
/**
 * Central interface to provide configuration for an application.
 * An ApplicationContext provides:
 * * Factory methods for accessing application components.
 * * The ability to load file resources in a generic fashion.
 * * The ability to emit events to registered listeners.
 * * The ability to resolve content.
 * * Inheritance from a parent context unless it is the root context.
 *
 * In addition to standard {@link Factory|Factory} lifecycle capabilities, `ApplicationContext` implementations detect and invoke {@link ApplicationContextAware|ApplicationContextAware} values as well as {@link ResourceLoaderAware|ResourceLoaderAware}.
 * @extends module:factory.ConfigurableFactory
 * @extends module:content.ContentSource
 * @extends module:core.Destroyable
 * @extends module:context.EventEmitter
 * @extends module:context.EnvironmentSource
 * @extends module:context.ResourceLoader
 */
/**
 * Interface to be implemented by any object that wishes to be notified of the {@link ApplicationContext|ApplicationContext} that it runs in.
 *
 * Implementing this interface makes sense for example when an object requires access to a set of collaborating values.
 *
 * This interface can also be implemented if an object needs access to file resources, i.e. wants to call {@link ResourceLoader#getResource|getResource}, wants to emit an application event, or requires access to the {@link ContentSource|ContentSource}. However, it is preferable to implement the more specific {@link ResourceLoaderAware|ResourceLoaderAware}, {@link ApplicationEventEmitterAware|ApplicationEventEmitterAware} or {@link ContentSourceAware|ContentSourceAware} interface in such a specific scenario.
 *
 * {@link AsApplicationContextAware|AsApplicationContextAware} is a convenience mixin for application objects, implementing this interface.
 */
/**
 * Set the ApplicationContext that this object runs in. Normally this call will be used to initialize the object.
 *
 * Invoked after population of normal value properties but before an `init` callback.
 * @param {module:context.ApplicationContext} context The ApplicationContext to be used by this object.
 */
const { defineProperty } = Reflect;
let uuid = 0;
export const $ChildContext = Symbol('@@context/child');
/**
 * @param {*} value The value to be tested
 * @returns {boolean} Whether or not the `value` is {@link ApplicationContext|ApplicationContext}
 */
export const likeApplicationContext = allPass([
    likeContentSource,
    likeDestroyable,
    likeEnvironmentSource,
    likeEventEmitter,
    likeFactory,
    likeRegistry,
    likeResourceLoader,
]);
/**
 * @param {*} value The value to be tested
 * @returns {boolean} Whether or not the `value` is {@link ApplicationContextAware|ApplicationContextAware}
 */
export const likeApplicationContextAware = likeAwareAnd(like({ setApplicationContext: Function }));
/**
 * @implements module:context.ConfigurableApplicationContext
 * @extends module:factory.DefaultFactory
 * @see module:context.AsEventEmitter
 * @see module:context.AsModuleResourceLoader
 */
// GenericApplicationContext extends AsEventEmitter(AsModuleResourceLoader(DefaultFactory))
// which provides EventEmitter and ResourceLoader functionality via mixins.
// TypeScript 5.7 has stricter checking for mixin implementations, so we don't explicitly
// declare 'implements ConfigurableApplicationContext' here - the mixin chain provides it.
export class GenericApplicationContext extends AsEventEmitter(AsModuleResourceLoader(DefaultFactory)) {
    #environment;
    #id;
    #name;
    #parent;
    createdTimestamp;
    destroyed;
    destroyedTimestamp;
    get environment() {
        if (!this.#environment) {
            this.#environment = this._createEnvironment();
        }
        return this.#environment;
    }
    get id() {
        return this.#id;
    }
    get name() {
        return this.#name;
    }
    get parent() {
        return this.#parent;
    }
    get path() {
        const path = [];
        let ctx = this;
        this.name && path.unshift(this.name);
        while (ctx.parent) {
            ctx = ctx.parent;
            path.unshift(ctx.name);
        }
        return path.join('/');
    }
    constructor(name, data) {
        super();
        this.#environment = null;
        this.#name = name ?? null;
        this.#parent = null;
        this.setId(++uuid);
        defineProperty(this, 'createdTimestamp', {
            value: Date.now(),
            configurable: true,
            enumerable: false,
            writable: false,
        });
        defineProperty(this, 'root', {
            value: this,
            configurable: true,
            enumerable: false,
            writable: false,
        });
        defineProperty(this, 'destroyed', {
            value: false,
            configurable: true,
            enumerable: false,
            writable: false,
        });
        defineProperty(this, 'destroyedTimestamp', {
            value: -1,
            configurable: true,
            enumerable: false,
            writable: false,
        });
        if (data) {
            for (const key in data) {
                // setValue comes from DefaultFactory mixin
                this.setValue(key, data[key]);
            }
        }
    }
    /*
    broadcast( type: EventType, ...data: any[] ): void {
        direct<ApplicationContext>( this, ( parentContext ) => parentContext.emit( type, ...data ), true );
    }
    */
    bubble(type, ...data) {
        escalate(this, (parentContext) => parentContext.emit(type, ...data), true);
    }
    destroy() {
        if (!this.destroyed) {
            defineProperty(this, 'destroyed', {
                value: true,
                configurable: true,
                enumerable: false,
                writable: false,
            });
            defineProperty(this, 'destroyedTimestamp', {
                value: Date.now(),
                configurable: true,
                enumerable: false,
                writable: false,
            });
            // Destroy things
        }
    }
    getContent(key, language) {
        throw new Error('Method not implemented.');
    }
    setEnvironment(environment) {
        this.#environment = environment;
    }
    setId(id) {
        this.#id = id;
    }
    setName(name) {
        this.#name = name;
    }
    setParent(parent) {
        this.#parent = parent;
    }
    _createEnvironment() {
        return new StandardEnvironment();
    }
}
/**
 * @implements external:Record
 * @extends module:context.GenericApplicationContext
 */
export class ProxiedGenericApplicationContext extends GenericApplicationContext {
    constructor(name, data) {
        super(name, data);
        return new Proxy(this, new RegistryProxyHandler());
    }
}
/**
 * @see module:context.AsApplicationContextAware
 * @implements module:context.ApplicationContextAware
 */
export const AsApplicationContextAware = (superclass) => class extends AsAware(superclass) {
    applicationContext;
    /**
     * @param {module:context.ApplicationContext} applicationContext The application context to be set.
     */
    setApplicationContext(applicationContext) {
        /**
         * @readonly
         */
        defineProperty(this, 'applicationContext', {
            value: applicationContext,
            configurable: true,
            enumerable: false,
            writable: false,
        });
    }
};
/**
 * Create a new ApplicationContextAwareProcessor for the given context.
 * An {@link InitializationAwareProcessor|InitializationAwareProcessor} implementation that passes the ApplicationContext to value that implement the {@link EnvironmentAware|EnvironmentAware}, {@link ResourceLoaderAware|ResourceLoaderAware}, {@link ApplicationEventEmitterAware|ApplicationEventEmitterAware}, {@link ContentSourceAware|ContentSourceAware}, and/or {@link ApplicationContextAware|ApplicationContextAware} interfaces.
 *
 * Implemented interfaces are satisfied in order of their mention above.
 * @implements module:factory.InitializationAwareProcessor
 * @param {module:context.ApplicationContext} applicationContext
 * @see {@link EnvironmentAware}
 * @see {@link ResourceLoaderAware}
 * @see {@link ApplicationEventEmitterAware}
 * @see {@link ContentSourceAware}
 * @see {@link ApplicationContextAware}
 */
export class ApplicationContextAwareProcessor {
    applicationContext;
    constructor(applicationContext) {
        /**
         * @readonly
         */
        defineProperty(this, 'applicationContext', {
            value: applicationContext,
            configurable: true,
            enumerable: false,
            writable: false,
        });
    }
    processAfterInitialization(name, value) {
        return value;
    }
    processBeforeInitialization(name, value) {
        if (likeAware(value)) {
            const { applicationContext } = this;
            likeEnvironmentAware(value) && value.setEnvironment(applicationContext.environment);
            likeResourceLoaderAware(value) && value.setResourceLoader(applicationContext);
            likeApplicationEventEmitterAware(value) && value.setApplicationEventEmitter(applicationContext);
            likeContentSourceAware(value) && value.setContentSource(applicationContext);
            likeApplicationContextAware(value) && value.setApplicationContext(applicationContext);
        }
        return value;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udGV4dC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9jb250ZXh0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOztHQUVHO0FBRUgsT0FBTyxFQUE2QixRQUFRLEVBQUUsTUFBTSxZQUFZLENBQUM7QUFDakUsT0FBTyxFQUFpQixzQkFBc0IsRUFBRSxpQkFBaUIsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUN6RixPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sa0JBQWtCLENBQUM7QUFDM0MsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLGtCQUFrQixDQUFDO0FBQ3hDLE9BQU8sRUFDSCxjQUFjLEVBRWQsZ0NBQWdDLEVBQ2hDLGdCQUFnQixHQUVuQixNQUFNLGlCQUFpQixDQUFDO0FBQ3pCLE9BQU8sRUFHSCxlQUFlLEVBQ2YsV0FBVyxFQUNYLFlBQVksRUFDWixjQUFjLEVBQ2Qsb0JBQW9CLEVBRXBCLFlBQVksRUFFWixPQUFPLEVBQ1AsU0FBUyxHQUNaLE1BQU0sZUFBZSxDQUFDO0FBQ3ZCLE9BQU8sRUFFSCxxQkFBcUIsRUFFckIsb0JBQW9CLEVBQ3BCLG1CQUFtQixHQUV0QixNQUFNLGVBQWUsQ0FBQztBQUN2QixPQUFPLEVBQWtCLGtCQUFrQixFQUFFLHNCQUFzQixFQUFFLHVCQUF1QixFQUFFLE1BQU0sWUFBWSxDQUFDO0FBOEJqSDs7Ozs7Ozs7Ozs7Ozs7OztHQWdCRztBQUVIOzs7Ozs7OztHQVFHO0FBRUg7Ozs7O0dBS0c7QUFFSCxNQUFNLEVBQUUsY0FBYyxFQUFFLEdBQUcsT0FBTyxDQUFDO0FBRW5DLElBQUksSUFBSSxHQUFHLENBQUMsQ0FBQztBQUViLE1BQU0sQ0FBQyxNQUFNLGFBQWEsR0FBa0IsTUFBTSxDQUFDLGlCQUFpQixDQUFDLENBQUM7QUFFdEU7OztHQUdHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sc0JBQXNCLEdBQUcsT0FBTyxDQUFDO0lBQzFDLGlCQUFpQjtJQUNqQixlQUFlO0lBQ2YscUJBQXFCO0lB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