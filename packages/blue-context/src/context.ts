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
export interface ApplicationContext
    extends ConfigurableFactory,
        ContentSource,
        Destroyable,
        EventEmitter,
        EnvironmentSource,
        ResourceLoader {
    /**
     * The timestamp when this context was created.
     */
    readonly createdTimestamp: number;
    /**
     * A read-only array of child contexts.
     */
    readonly children: readonly ApplicationContext[];
    /**
     * The unique identifier for this context.
     */
    readonly id: number;
    /**
     * Indicates if the context is currently active.
     */
    readonly isActive: boolean;
    /**
     * The name of this context.
     */
    readonly name: string;
    /**
     * The hierarchical path of this context within the application context tree.
     */
    readonly path: string;
    /**
     * The name of the theme associated with this context.
     */
    readonly themeName: string;

    /**
     * The parent context in the hierarchy.
     */
    parent: ApplicationContext | null;

    /**
     * The timestamp when this context was destroyed, if applicable.
     */
    destroyedTimestamp?: number;

    /**
     * Broadcasts an event to all direct and indirect children of this context.
     * @param type - The type of the event.
     * @param data - The data associated with the event.
     */
    broadcast(type: EventType, ...data: any[]): void;
    /**
     * Bubbles an event up the context hierarchy to all parent contexts.
     * @param type - The type of the event.
     * @param data - The data associated with the event.
     */
    bubble(type: EventType, ...data: any[]): void;
    /**
     * Closes this application context and all of its descendants, then destroys associated resources.
     *
     * **Sequence:**
     * 1. Emits `'context:close'` on the closing context.
     * 2. Recursively calls `close()` on each direct child (depth-first).
     * 3. Invokes `onClose()` on the lifecycle processor, if one is configured.
     * 4. Destroys all registered factory values via `_destroyValues()`.
     * 5. Removes this context from its parent's children list.
     * 6. Emits `'context:destroy'` and marks `destroyed = true`.
     *
     * Calling `close()` on an already-destroyed context is a safe no-op.
     */
    close(): void;
    /**
     * Retrieves a theme by name.
     * @param name - The optional name of the theme to retrieve. If not provided, the context's default theme is used.
     * @returns The requested theme.
     */
    getTheme(name?: string): Theme;
    /**
     * Checks if this context has a specific child context.
     * @param node - The application context to check for.
     * @returns True if the context is a child, false otherwise.
     */
    hasChild(node: ApplicationContext): boolean;
    /**
     * Creates a new child application context.
     * @param name - The optional name for the new child context.
     * @param data - Optional initial data for the child context.
     * @returns The newly created child application context.
     */
    newChild(name?: string, data?: JSONObject): ApplicationContext;
    /**
     * Activates the application context and runs the full initialization lifecycle.
     *
     * **Sequence:**
     * 1. Emits `'context:preparing'` — processors may register additional entries.
     * 2. Runs all registered {@link LifecycleProcessor} and {@link EntryRegistryProcessor} instances.
     * 3. Emits `'context:refresh'` — signals that the context is fully active.
     * 4. Sets `isActive` to `true`.
     *
     * Calling `refresh()` on an already-active context is a safe no-op.
     */
    refresh(): void;
    /**
     * Removes a child context from this context.
     * @param node - The child application context to remove.
     * @returns True if the child was successfully removed, false otherwise.
     */
    removeChild(node: ApplicationContext): boolean;
}

/**
 * Interface to be implemented by any object that wishes to be notified of the {@link ApplicationContext|ApplicationContext} that it runs in.
 *
 * Implementing this interface makes sense for example when an object requires access to a set of collaborating values.
 *
 * This interface can also be implemented if an object needs access to file resources, i.e. wants to call {@link ResourceLoader#getResource|getResource}, wants to emit an application event, or requires access to the {@link ContentSource|ContentSource}. However, it is preferable to implement the more specific {@link ResourceLoaderAware|ResourceLoaderAware}, {@link ApplicationEventEmitterAware|ApplicationEventEmitterAware} or {@link ContentSourceAware|ContentSourceAware} interface in such a specific scenario.
 *
 * {@link AsApplicationContextAware|AsApplicationContextAware} is a convenience mixin for application objects, implementing this interface.
 * @extends module:factory.Aware
 */
export interface ApplicationContextAware extends Aware {
    /**
     * Set the ApplicationContext that this object runs in. Normally this call will be used to initialize the object.
     *
     * Invoked after population of normal value properties but before an `init` callback.
     * @param applicationContext - The ApplicationContext to be used by this object.
     */
    setApplicationContext(applicationContext: ApplicationContext): void;
}

/**
 * Mutable application-context variant used during configuration.
 */
export interface ConfigurableApplicationContext extends ApplicationContext {
    /**
     * Replaces the content source used for theme and content lookups.
     *
     * @param contentSource - The new content source.
     */
    setContentSource(contentSource: ContentSource): void;
    /**
     * Replaces the environment used by this context.
     *
     * @param environment - The new environment.
     */
    setEnvironment(environment: ConfigurableEnvironment): void;
    /**
     * Updates the context identifier.
     *
     * @param id - The new identifier.
     */
    setId(id: number): void;
    /**
     * Updates the context name.
     *
     * @param name - The new name.
     */
    setName(name: string): void;
    /**
     * Reassigns the parent context.
     *
     * @param parent - The new parent context.
     */
    setParent(parent: ApplicationContext): void;
    /**
     * Updates the default theme name.
     *
     * @param themeName - The new theme name.
     */
    setThemeName(themeName: string): void;
    /**
     * Overrides the theme resolver used by this context.
     *
     * @param themeResolver - The new theme resolver.
     */
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
 * Returns whether a value behaves like an application context.
 *
 * @param value - The value to test.
 * @returns `true` when the value looks like an application context.
 */
export const likeApplicationContext = ((value: any) =>
    likeContentSource(value) &&
    likeDestroyable(value) &&
    likeEnvironmentSource(value) &&
    likeEventEmitter(value) &&
    likeFactory(value) &&
    likeRegistry(value) &&
    likeResourceLoader(value)) as (value: any) => value is ApplicationContext;

/**
 * Returns whether a value can receive an application context.
 *
 * @param value - The value to test.
 * @returns `true` when the value looks like application-context aware.
 */
export const likeApplicationContextAware = likeAwareAnd(like({ setApplicationContext: Function })) as (
    value: any
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
/**
 * Default application context implementation used throughout the package.
 */
export class GenericApplicationContext extends AsEventEmitter(AsModuleResourceLoader(DefaultFactory)) {
    #children: GenericApplicationContext[];
    #contentSource: ContentSource;
    #customThemeResolver: boolean;
    #environment: Environment | null;
    #id!: number;
    #isActive: boolean;
    #lifecycleProcessor: LifecycleProcessor | null;
    #name: string;
    #parent: ApplicationContext | null;
    #themeName: string;
    #themeResolver: ThemeResolver | null;

    createdTimestamp!: number;
    destroyed!: boolean;
    destroyedTimestamp?: number;

    /**
     * The lazily created environment for this context.
     */
    get environment(): Environment {
        if (!this.#environment) {
            this.#environment = this._createEnvironment();
        }
        return this.#environment;
    }

    /**
     * The content source used to resolve theme content.
     */
    get contentSource(): ContentSource {
        return this.#contentSource;
    }

    /**
     * The direct child contexts.
     */
    get children(): readonly ApplicationContext[] {
        return this.#children;
    }

    /**
     * The stable identifier assigned at construction.
     */
    get id(): number {
        return this.#id;
    }

    /**
     * Indicates whether the context has been refreshed and not yet closed.
     */
    get isActive(): boolean {
        return this.#isActive;
    }

    /**
     * The configured context name.
     */
    get name(): string {
        return this.#name;
    }

    /**
     * The current parent context.
     */
    get parent(): ApplicationContext | null {
        return this.#parent;
    }

    /**
     * The slash-delimited hierarchy path from the root to this context.
     */
    get path(): string {
        const path: string[] = [];
        let ctx: ApplicationContext = this;

        this.name && path.unshift(this.name);

        while (ctx.parent) {
            ctx = ctx.parent;
            path.unshift(ctx.name);
        }

        return path.join('/');
    }

    /**
     * The default theme name associated with this context.
     */
    get themeName(): string {
        return this.#themeName;
    }

    /**
     * Creates a new application context.
     *
     * @param name - The optional context name.
     * @param data - Optional initial values to register.
     */
    constructor(name?: string, data?: JSONObject) {
        super();

        this.#contentSource = new StaticContentSource();
        this.#children = [];
        this.#customThemeResolver = false;
        this.#environment = null;
        this.#isActive = false;
        this.#lifecycleProcessor = null;
        this.#name = name ?? '';
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

    /**
     * Broadcasts an event to all descendants.
     *
     * @param type - The event type.
     * @param data - Event payload values.
     */
    broadcast(type: EventType, ...data: any[]): void {
        direct<any>(
            this as any,
            (targetContext: ApplicationContext) => {
                targetContext.emit(type, ...data);
            },
            true
        );
    }

    /**
     * Emits an event to parent contexts.
     *
     * @param type - The event type.
     * @param data - Event payload values.
     */
    bubble(type: EventType, ...data: any[]): void {
        escalate<ApplicationContext>(this, (parentContext) => parentContext.emit(type, ...data), true);
    }

    /**
     * Closes the context and all descendants.
     */
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

    /**
     * Releases this context's resources.
     */
    destroy(): void {
        this.close();
    }

    /**
     * Resolves content locally and then delegates to the parent if needed.
     *
     * @param key - The content key.
     * @param language - The language identifier.
     * @returns The resolved content.
     */
    getContent(key: string, language: string): string {
        const value = this.#contentSource?.getContent(key, language);

        if (value !== key || !this.parent) {
            return value;
        }

        return this.parent.getContent(key, language);
    }

    /**
     * Resolves a theme by name or the default theme.
     *
     * @param name - Optional theme name.
     * @returns The resolved theme.
     */
    getTheme(name?: string): Theme {
        if (!this.#themeResolver) {
            this.#themeResolver = this._createThemeResolver();
        }

        return this.#themeResolver.getTheme(name || this.#themeName);
    }

    /**
     * Returns whether the given context is a direct child.
     *
     * @param node - The context to test.
     * @returns `true` when the context is a direct child.
     */
    hasChild(node: ApplicationContext): boolean {
        return this.#children.includes(node as GenericApplicationContext);
    }

    /**
     * Creates and attaches a child context.
     *
     * @param name - Optional child name.
     * @param data - Optional initial child data.
     * @returns The created child context.
     */
    newChild(name?: string, data?: JSONObject): ApplicationContext {
        const child = new GenericApplicationContext(name, data);
        child.setParent(this);
        return child;
    }

    /**
     * Initializes the context lifecycle if it is not already active.
     */
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

    /**
     * Removes a child from the direct child list.
     *
     * @param node - The child context to remove.
     * @returns `true` when the child was removed.
     */
    removeChild(node: ApplicationContext): boolean {
        const index = this.#children.indexOf(node as GenericApplicationContext);

        if (index === -1) {
            return false;
        }

        this.#children.splice(index, 1);
        return true;
    }

    /**
     * Replaces the content source used by this context.
     *
     * @param contentSource - The new content source.
     */
    setContentSource(contentSource: ContentSource): void {
        this.#contentSource = contentSource;

        if (!this.#customThemeResolver) {
        this.#themeResolver = null;
        }
    }

    /**
     * Replaces the environment used by this context.
     *
     * @param environment - The new environment.
     */
    setEnvironment(environment: ConfigurableEnvironment): void {
        this.#environment = environment;
    }

    /**
     * Updates the identifier assigned to this context.
     *
     * @param id - The new identifier.
     */
    setId(id: number): void {
        this.#id = id;
    }

    /**
     * Updates the context name.
     *
     * @param name - The new name.
     */
    setName(name: string): void {
        this.#name = name;
    }

    /**
     * Reassigns the parent context and keeps the child list in sync.
     *
     * @param parent - The new parent context.
     */
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

    /**
     * Updates the default theme name.
     *
     * @param themeName - The new theme name.
     */
    setThemeName(themeName: string): void {
        this.#themeName = themeName;
    }

    /**
     * Overrides the theme resolver used by this context.
     *
     * @param themeResolver - The new theme resolver.
     */
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
/**
 * Application context proxy that exposes values as dynamic object properties.
 */
export class ProxiedGenericApplicationContext extends GenericApplicationContext implements Record<string, any> {
    [key: string]: any;

    /**
     * Creates a proxied context that forwards property access to values.
     *
     * @param name - The context name.
     * @param data - Optional initial values.
     */
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
 * @param superclass - The base class to extend.
 */
export const AsApplicationContextAware = <T extends Constructable>(
    superclass: T
): Constructable<ApplicationContextAware> & T =>
    class extends AsAware(superclass) implements ApplicationContextAware {
    readonly applicationContext?: ApplicationContext;

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
    readonly applicationContext!: ApplicationContext;

    /**
     * Creates a processor bound to a specific application context.
     *
     * @param applicationContext - The context to inject into aware values.
     */
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

    /**
     * Returns the value unchanged after initialization.
     *
     * @param name - The bean name.
     * @param value - The initialized value.
     * @returns The same value.
     */
    processAfterInitialization<T = any>(name: string, value: T): T {
        return value;
    }

    /**
     * Injects the application context into aware values before initialization.
     *
     * @param name - The bean name.
     * @param value - The value to initialize.
     * @returns The same value.
     */
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
