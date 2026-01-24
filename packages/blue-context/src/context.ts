/**
 * @author Jeff Rose
 */

import { JSONObject, Constructable, escalate } from '@blue/core';
import { ContentSource, likeContentSourceAware, likeContentSource } from '@blue/content';
import { allPass, like } from '@blue/util';
import {
    AsEventEmitter,
    EventEmitter,
    likeApplicationEventEmitterAware,
    likeEventEmitter,
    EventType,
} from './event-emitter';
import {
    ConfigurableFactory,
    Destroyable,
    likeDestroyable,
    likeFactory,
    likeRegistry,
    DefaultFactory,
    RegistryProxyHandler,
    InitializationAwareProcessor,
    likeAwareAnd,
    Aware,
    AsAware,
    likeAware,
} from '@blue/factory';
import {
    EnvironmentSource,
    likeEnvironmentSource,
    Environment,
    likeEnvironmentAware,
    StandardEnvironment,
    ConfigurableEnvironment,
} from './environment';
import { ResourceLoader, likeResourceLoader, AsModuleResourceLoader, likeResourceLoaderAware } from './resource';

export interface ApplicationContext
    extends ConfigurableFactory,
        ContentSource,
        Destroyable,
        EventEmitter,
        EnvironmentSource,
        ResourceLoader {
    readonly createdTimestamp: number;
    readonly id: number;
    readonly name: string;
    readonly path: string;

    parent: ApplicationContext;

    destroyedTimestamp?: number;
}

export interface ApplicationContextAware extends Aware {
    setApplicationContext(applicationContext: ApplicationContext): void;
}

export interface ConfigurableApplicationContext extends ApplicationContext {
    setEnvironment(environment: ConfigurableEnvironment): void;
    setId(id: number): void;
    setName(name: string): void;
    setParent(parent: ApplicationContext): void;
}

/**
 * Central interface to provide configuration for an application.
 * An ApplicationContext provides:
 * * Factory methods for accessing application components.
 * * The ability to load file resources in a generic fashion.
 * * The ability to emit events to registered listeners.
 * * The ability to resolve content.
 * * Inheritance from a parent context unless it is the root context.
 *
 * In addition to standard {@linkcode module:factory.Factory|Factory} lifecycle capabilities, `ApplicationContext` implementations detect and invoke {@linkcode module:context.ApplicationContextAware|ApplicationContextAware} values as well as {@linkcode module:context.ResourceLoaderAware|ResourceLoaderAware}.
 * @interface module:context.ApplicationContext
 * @extends module:factory.ConfigurableFactory
 * @extends module:content.ContentSource
 * @extends module:core.Destroyable
 * @extends module:context.EventEmitter
 * @extends module:context.EnvironmentSource
 * @extends module:context.ResourceLoader
 */

/**
 * Interface to be implemented by any object that wishes to be notified of the {@linkcode module:context.ApplicationContext|ApplicationContext} that it runs in.
 *
 * Implementing this interface makes sense for example when an object requires access to a set of collaborating values.
 *
 * This interface can also be implemented if an object needs access to file resources, i.e. wants to call {@linkcode module:context.ResourceLoader#getResource|getResource}, wants to emit an application event, or requires access to the {@linkcode module:context.ContentSource|ContentSource}. However, it is preferable to implement the more specific {@linkcode module:context.ResourceLoaderAware|ResourceLoaderAware}, {@linkcode module:context.ApplicationEventEmitterAware|ApplicationEventEmitterAware} or {@linkcode module:context.ContentSourceAware|ContentSourceAware} interface in such a specific scenario.
 *
 * {@linkcode module:context.AsApplicationContextAware|AsApplicationContextAware} is a convenience mixin for application objects, implementing this interface.
 * @interface module:context.ApplicationContextAware
 */

/**
 * Set the ApplicationContext that this object runs in. Normally this call will be used to initialize the object.
 *
 * Invoked after population of normal value properties but before an `init` callback.
 * @function module:context.ApplicationContextAware#setApplicationContext
 * @param {module:context.ApplicationContext} context The ApplicationContext to be used by this object.
 */

const { defineProperty } = Reflect;

let uuid = 0;

export const $ChildContext: unique symbol = Symbol('@@context/child');

/**
 * @function module:context.likeApplicationContext
 * @param {*} value The value to be tested
 * @returns {external:boolean} Whether or not the `value` is {@linkcode module:context.ApplicationContext|ApplicationContext}
 */
export const likeApplicationContext = allPass([
    likeContentSource,
    likeDestroyable,
    likeEnvironmentSource,
    likeEventEmitter,
    likeFactory,
    likeRegistry,
    likeResourceLoader,
]) as (value) => value is ApplicationContext;

/**
 * @function module:context.likeApplicationContextAware
 * @param {*} value The value to be tested
 * @returns {external:boolean} Whether or not the `value` is {@linkcode module:context.ApplicationContextAware|ApplicationContextAware}
 */
export const likeApplicationContextAware = likeAwareAnd(like({ setApplicationContext: Function })) as (
    value
) => value is ApplicationContextAware;

/**
 * @class module:context.GenericApplicationContext
 * @implements module:context.ConfigurableApplicationContext
 * @extends module:factory.DefaultFactory
 * @mixes module:context.AsEventEmitter
 * @mixes module:context.AsModuleResourceLoader
 */
// GenericApplicationContext extends AsEventEmitter(AsModuleResourceLoader(DefaultFactory))
// which provides EventEmitter and ResourceLoader functionality via mixins.
// TypeScript 5.7 has stricter checking for mixin implementations, so we don't explicitly
// declare 'implements ConfigurableApplicationContext' here - the mixin chain provides it.
export class GenericApplicationContext extends AsEventEmitter(AsModuleResourceLoader(DefaultFactory)) {
    #environment: Environment;
    #id: number;
    #name: string;
    #parent: ApplicationContext;

    createdTimestamp: number;
    destroyed: boolean;
    destroyedTimestamp?: number;

    get environment(): Environment {
        if (!this.#environment) {
            this.#environment = this._createEnvironment();
        }
        return this.#environment;
    }

    get id(): number {
        return this.#id;
    }

    get name(): string {
        return this.#name;
    }

    get parent(): ApplicationContext {
        return this.#parent;
    }

    get path(): string {
        const path: string[] = [];
        let ctx = this as unknown as ApplicationContext;

        this.name && path.unshift(this.name);

        while (ctx.parent) {
            ctx = ctx.parent;
            path.unshift(ctx.name);
        }

        return path.join('/');
    }

    constructor(name?: string, data?: JSONObject) {
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
                (this as any).setValue(key, data[key]);
            }
        }
    }

    /*
    broadcast( type: EventType, ...data: any[] ): void {
        direct<ApplicationContext>( this, ( parentContext ) => parentContext.emit( type, ...data ), true );
    }
    */

    bubble(type: EventType, ...data: any[]): void {
        escalate<ApplicationContext>(this, (parentContext) => parentContext.emit(type, ...data), true);
    }

    destroy(): void {
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

    getContent(key: string, language: string): string {
        throw new Error('Method not implemented.');
    }

    setEnvironment(environment: ConfigurableEnvironment): void {
        this.#environment = environment;
    }

    setId(id: number): void {
        this.#id = id;
    }

    setName(name: string): void {
        this.#name = name;
    }

    setParent(parent: ApplicationContext): void {
        this.#parent = parent;
    }

    protected _createEnvironment(): Environment {
        return new StandardEnvironment();
    }
}

/**
 * @class module:context.ProxiedGenericApplicationContext
 * @implements external:Record
 * @extends module:context.GenericApplicationContext
 */
export class ProxiedGenericApplicationContext extends GenericApplicationContext implements Record<string, any> {
    [key: string]: any;

    constructor(name: string, data?: JSONObject) {
        super(name, data);
        return new Proxy(this, new RegistryProxyHandler<this>());
    }
}

/**
 * @mixin module:context.AsApplicationContextAware
 * @implements module:context.ApplicationContextAware
 */
export const AsApplicationContextAware = <T extends Constructable>(
    superclass: T
): Constructable<ApplicationContextAware> & T =>
    class extends AsAware(superclass) implements ApplicationContextAware {
        readonly applicationContext: ApplicationContext;

        /**
         * @function module:context.AsApplicationContextAware#setApplicationContext
         * @param {module:context.ApplicationContext} applicationContext The application context to be set.
         */
        setApplicationContext(applicationContext: ApplicationContext): void {
            /**
             * @readonly
             * @member {module:context.ApplicationContext} module:context.AsApplicationContextAware#applicationContext
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
 * @classdesc
 * An {@linkcode module:factory.InitializationAwareProcessor|InitializationAwareProcessor} implementation that passes the ApplicationContext to value that implement the {@linkcode module:context.EnvironmentAware|EnvironmentAware}, {@linkcode module:context.ResourceLoaderAware|ResourceLoaderAware}, {@linkcode module:context.ApplicationEventEmitterAware|ApplicationEventEmitterAware}, {@linkcode module:context.ContentSourceAware|ContentSourceAware}, and/or {@linkcode module:context.ApplicationContextAware|ApplicationContextAware} interfaces.
 *
 * Implemented interfaces are satisfied in order of their mention above.
 * @class module:context.ApplicationContextAwareProcessor
 * @implements module:factory.InitializationAwareProcessor
 * @param {module:context.ApplicationContext} applicationContext
 * @see {@link module:context.EnvironmentAware}
 * @see {@link module:context.ResourceLoaderAware}
 * @see {@link module:context.ApplicationEventEmitterAware}
 * @see {@link module:context.ContentSourceAware}
 * @see {@link module:context.ApplicationContextAware}
 */
export class ApplicationContextAwareProcessor implements InitializationAwareProcessor {
    readonly applicationContext: ApplicationContext;

    constructor(applicationContext: ApplicationContext) {
        /**
         * @readonly
         * @member {module:context.ApplicationContext} module:context.ApplicationContextAwareProcessor#applicationContext
         */
        defineProperty(this, 'applicationContext', {
            value: applicationContext,
            configurable: true,
            enumerable: false,
            writable: false,
        });
    }

    processAfterInitialization<T = any>(name: string, value: T): T {
        return value;
    }

    processBeforeInitialization<T = any>(name: string, value: T): T {
        if (likeAware(value)) {
            const { applicationContext } = this;
            likeEnvironmentAware(value) && value.setEnvironment(applicationContext.environment);
            likeResourceLoaderAware(value) && value.setResourceLoader(applicationContext);
            likeApplicationEventEmitterAware(value) && value.setApplicationEventEmitter(applicationContext);
            likeContentSourceAware(value) && (value as any).setContentSource(applicationContext);
            likeApplicationContextAware(value) && value.setApplicationContext(applicationContext);
        }

        return value;
    }
}
