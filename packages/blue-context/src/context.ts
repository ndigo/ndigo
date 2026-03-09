/**
 * @author Jeff Rose
 */

import { JSONObject, Constructable, direct, escalate } from '@blue/core';
import {
    ContentSource,
    StaticContentSource,
    Theme,
    ThemeResolver,
    StaticThemeResolver,
    likeContentSourceAware,
    likeContentSource,
} from '@blue/content';
import { allPass } from '@blue/util/logic';
import { like } from '@blue/util/types';
import {
    AsEventEmitter,
    EventEmitter,
    likeApplicationEventEmitterAware,
    likeEventEmitter,
    EventType,
} from './event-emitter';
import {
    ConfigurableFactory,
    DefaultLifecycleProcessor,
    Destroyable,
    LifecycleProcessor,
    likeDestroyable,
    likeEntryRegistryProcessor,
    likeFactory,
    likeRegistry,
    DefaultFactory,
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
    readonly children: readonly ApplicationContext[];
    readonly id: number;
    readonly isActive: boolean;
    readonly name: string;
    readonly path: string;
    readonly themeName: string;

    parent: ApplicationContext;

    destroyedTimestamp?: number;

    broadcast(type: EventType, ...data: any[]): void;
    bubble(type: EventType, ...data: any[]): void;
    close(): void;
    getTheme(name?: string): Theme;
    hasChild(node: ApplicationContext): boolean;
    newChild(name?: string, data?: JSONObject): ApplicationContext;
    refresh(): void;
    removeChild(node: ApplicationContext): boolean;
}

export interface ApplicationContextAware extends Aware {
    setApplicationContext(applicationContext: ApplicationContext): void;
}

export interface ConfigurableApplicationContext extends ApplicationContext {
    setContentSource(contentSource: ContentSource): void;
    setEnvironment(environment: ConfigurableEnvironment): void;
    setId(id: number): void;
    setName(name: string): void;
    setParent(parent: ApplicationContext): void;
    setThemeName(themeName: string): void;
    setThemeResolver(themeResolver: ThemeResolver): void;
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

const { defineProperty, ownKeys } = Reflect;

let uuid = 0;

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
]) as (value) => value is ApplicationContext;

/**
 * @param {*} value The value to be tested
 * @returns {boolean} Whether or not the `value` is {@link ApplicationContextAware|ApplicationContextAware}
 */
export const likeApplicationContextAware = likeAwareAnd(like({ setApplicationContext: Function })) as (
    value
) => value is ApplicationContextAware;

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
    #children: GenericApplicationContext[];
    #contentSource: ContentSource;
    #customThemeResolver: boolean;
    #environment: Environment;
    #id: number;
    #isActive: boolean;
    #lifecycleProcessor: LifecycleProcessor;
    #name: string;
    #parent: ApplicationContext;
    #themeName: string;
    #themeResolver: ThemeResolver;

    createdTimestamp: number;
    destroyed: boolean;
    destroyedTimestamp?: number;

    get environment(): Environment {
        if (!this.#environment) {
            this.#environment = this._createEnvironment();
        }
        return this.#environment;
    }

    get contentSource(): ContentSource {
        return this.#contentSource;
    }

    get children(): readonly ApplicationContext[] {
        return this.#children;
    }

    get id(): number {
        return this.#id;
    }

    get isActive(): boolean {
        return this.#isActive;
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

    get themeName(): string {
        return this.#themeName;
    }

    constructor(name?: string, data?: JSONObject) {
        super();

        this.#contentSource = new StaticContentSource();
        this.#children = [];
        this.#customThemeResolver = false;
        this.#environment = null;
        this.#isActive = false;
        this.#lifecycleProcessor = null;
        this.#name = name ?? null;
        this.#parent = null;
        this.#themeName = 'default';
        this.#themeResolver = null;

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

    broadcast(type: EventType, ...data: any[]): void {
        direct<any>(
            this as any,
            (targetContext: ApplicationContext) => {
                targetContext.emit(type, ...data);
            },
            true
        );
    }

    bubble(type: EventType, ...data: any[]): void {
        escalate<ApplicationContext>(this, (parentContext) => parentContext.emit(type, ...data), true);
    }

    close(): void {
        if (this.destroyed) {
            return;
        }

        this.emit('context:close', this);

        for (const child of [...this.#children]) {
            child.close();
        }

        this.#lifecycleProcessor?.onClose(this);
        this._destroyValues();

        if (this.parent instanceof GenericApplicationContext) {
            this.parent.removeChild(this);
        }

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

        this.#isActive = false;
        this.emit('context:destroy', this);

        for (const eventType of this.eventTypes()) {
            const listeners = this.listeners(eventType);
            for (const listener of listeners) {
                this.off(eventType, listener);
            }
        }
    }

    destroy(): void {
        this.close();
    }

    getContent(key: string, language: string): string {
        const value = this.#contentSource?.getContent(key, language);

        if (value !== key || !this.parent) {
            return value;
        }

        return this.parent.getContent(key, language);
    }

    getTheme(name?: string): Theme {
        if (!this.#themeResolver) {
            this.#themeResolver = this._createThemeResolver();
        }

        return this.#themeResolver.getTheme(name || this.#themeName);
    }

    hasChild(node: ApplicationContext): boolean {
        return this.#children.includes(node as GenericApplicationContext);
    }

    newChild(name?: string, data?: JSONObject): ApplicationContext {
        const child = new GenericApplicationContext(name, data);
        child.setParent(this);
        return child;
    }

    refresh(): void {
        if (this.#isActive) {
            return;
        }

        this.emit('context:preparing', this);

        this._prepareFactory();
        this._postProcessFactory();
        this._invokeRegistryProcessors();
        this._finishFactoryInitialization();
        this._onRefresh();

        if (!this.#lifecycleProcessor) {
            this.#lifecycleProcessor = new DefaultLifecycleProcessor();
        }

        this.#lifecycleProcessor.onRefresh(this);
        this.#isActive = true;
        this.emit('context:refresh', this);
    }

    removeChild(node: ApplicationContext): boolean {
        const index = this.#children.indexOf(node as GenericApplicationContext);

        if (index === -1) {
            return false;
        }

        this.#children.splice(index, 1);
        return true;
    }

    setContentSource(contentSource: ContentSource): void {
        this.#contentSource = contentSource;

        if (!this.#customThemeResolver) {
            this.#themeResolver = null;
        }
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
        if (this.#parent instanceof GenericApplicationContext) {
            this.#parent.removeChild(this);
        }

        this.#parent = parent;

        if (parent instanceof GenericApplicationContext && !parent.hasChild(this)) {
            parent.#children.push(this);
        }

        defineProperty(this, 'root', {
            value: this._resolveRoot(),
            configurable: true,
            enumerable: false,
            writable: false,
        });
    }

    setThemeName(themeName: string): void {
        this.#themeName = themeName;
    }

    setThemeResolver(themeResolver: ThemeResolver): void {
        this.#customThemeResolver = true;
        this.#themeResolver = themeResolver;
    }

    protected _createEnvironment(): Environment {
        return new StandardEnvironment();
    }

    protected _createThemeResolver(): ThemeResolver {
        return new StaticThemeResolver(
            [
                {
                    name: this.#themeName,
                    contentSource: this.#contentSource,
                },
            ],
            this.#themeName
        );
    }

    protected _destroyValues(): void {
        const constructorKeys: string[] = [];

        for (const key of ownKeys(this)) {
            if (typeof key !== 'string') {
                continue;
            }

            if (key.startsWith('$')) {
                constructorKeys.push(key.slice(1));
            }
        }

        for (const key of constructorKeys) {
            key && this.destroyValue(key);
        }
    }

    protected _finishFactoryInitialization(): void {
        for (const key of ownKeys(this)) {
            if (typeof key !== 'string' || !key.startsWith('$')) {
                continue;
            }

            const name = key.slice(1);

            if (name && this.hasValue(name)) {
                this.getValue(name);
            }
        }
    }

    protected _onRefresh(): void {}

    protected _postProcessFactory(): void {}

    protected _prepareFactory(): void {
        const hasAwareProcessor = this.processors.some(
            (processor) => processor instanceof ApplicationContextAwareProcessor
        );

        if (!hasAwareProcessor) {
            this.addProcessor(new ApplicationContextAwareProcessor(this));
        }
    }

    protected _invokeRegistryProcessors(): void {
        const { processors } = this;
        const length = processors.length;

        for (let index = 0; index < length; index++) {
            const processor = processors[index];

            if (likeEntryRegistryProcessor(processor)) {
                processor.processEntryRegistry(this);
            }
        }
    }

    private _resolveRoot(): ApplicationContext {
        let root: ApplicationContext = this;

        while (root.parent) {
            root = root.parent;
        }

        return root;
    }
}

/**
 * @implements external:Record
 * @extends module:context.GenericApplicationContext
 */
export class ProxiedGenericApplicationContext extends GenericApplicationContext implements Record<string, any> {
    [key: string]: any;

    constructor(name: string, data?: JSONObject) {
        super(name, data);

        const target = this;

        return new Proxy(this, {
            deleteProperty(_t, key: PropertyKey): boolean {
                try {
                    target.destroyValue(key as string);
                    return true;
                } catch {
                    return false;
                }
            },
            get(_t, key: PropertyKey): any {
                const value = target.getValue(key as string);
                return typeof value === 'function' ? value.bind(target) : value;
            },
            has(_t, key: PropertyKey): boolean {
                return target.hasValue(key as string);
            },
            set(_t, key: PropertyKey, value: any): boolean {
                try {
                    target.setValue(key as string, value);
                    return true;
                } catch {
                    return false;
                }
            },
        });
    }
}

/**
 * @see module:context.AsApplicationContextAware
 * @implements module:context.ApplicationContextAware
 */
export const AsApplicationContextAware = <T extends Constructable>(
    superclass: T
): Constructable<ApplicationContextAware> & T =>
    class extends AsAware(superclass) implements ApplicationContextAware {
        readonly applicationContext: ApplicationContext;

        /**
         * @param {module:context.ApplicationContext} applicationContext The application context to be set.
         */
        setApplicationContext(applicationContext: ApplicationContext): void {
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
export class ApplicationContextAwareProcessor implements InitializationAwareProcessor {
    readonly applicationContext: ApplicationContext;

    constructor(applicationContext: ApplicationContext) {
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
