/**
 * @author Jeff Rose
 */
import { escalate } from '@blue/core';
import { likeContentSourceAware, likeContentSource } from '@blue/content';
import { allPass, like } from '@blue/util';
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udGV4dC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9jb250ZXh0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOztHQUVHO0FBRUgsT0FBTyxFQUE2QixRQUFRLEVBQUUsTUFBTSxZQUFZLENBQUM7QUFDakUsT0FBTyxFQUFpQixzQkFBc0IsRUFBRSxpQkFBaUIsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUN6RixPQUFPLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLFlBQVksQ0FBQztBQUMzQyxPQUFPLEVBQ0gsY0FBYyxFQUVkLGdDQUFnQyxFQUNoQyxnQkFBZ0IsR0FFbkIsTUFBTSxpQkFBaUIsQ0FBQztBQUN6QixPQUFPLEVBR0gsZUFBZSxFQUNmLFdBQVcsRUFDWCxZQUFZLEVBQ1osY0FBYyxFQUNkLG9CQUFvQixFQUVwQixZQUFZLEVBRVosT0FBTyxFQUNQLFNBQVMsR0FDWixNQUFNLGVBQWUsQ0FBQztBQUN2QixPQUFPLEVBRUgscUJBQXFCLEVBRXJCLG9CQUFvQixFQUNwQixtQkFBbUIsR0FFdEIsTUFBTSxlQUFlLENBQUM7QUFDdkIsT0FBTyxFQUFrQixrQkFBa0IsRUFBRSxzQkFBc0IsRUFBRSx1QkFBdUIsRUFBRSxNQUFNLFlBQVksQ0FBQztBQThCakg7Ozs7Ozs7Ozs7Ozs7Ozs7R0FnQkc7QUFFSDs7Ozs7Ozs7R0FRRztBQUVIOzs7OztHQUtHO0FBRUgsTUFBTSxFQUFFLGNBQWMsRUFBRSxHQUFHLE9BQU8sQ0FBQztBQUVuQyxJQUFJLElBQUksR0FBRyxDQUFDLENBQUM7QUFFYixNQUFNLENBQUMsTUFBTSxhQUFhLEdBQWtCLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0FBRXRFOzs7R0FHRztBQUNILE1BQU0sQ0FBQyxNQUFNLHNCQUFzQixHQUFHLE9BQU8sQ0FBQztJQUMxQyxpQkFBaUI7SUFDakIsZUFBZTtJQUNmLHFCQUFxQjtJQUNyQixnQkFBZ0I7SUFDaEIsV0FBVztJQUNYLFlBQVk7SUFD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