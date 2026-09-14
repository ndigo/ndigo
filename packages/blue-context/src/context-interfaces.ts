/**
 * @module blue-context
 * @since 1.0.0
 * @author Jeff Rose
 */
import { JSONObject } from '@blue/core';
import { ContentSource, Theme, ThemeResolver, likeContentSource } from '@blue/content';
import { like } from '@blue/util/types';
import { EventEmitter, likeEventEmitter, EventType } from './event-emitter';
import {
    ConfigurableFactory,
    Destroyable,
    likeDestroyable,
    likeFactory,
    likeRegistry,
    likeAwareAnd,
    Aware,
} from '@blue/factory';
import { EnvironmentSource, likeEnvironmentSource, ConfigurableEnvironment } from './environment';
import { ResourceLoader, likeResourceLoader } from './resource';

export interface ApplicationContext
    extends ConfigurableFactory, ContentSource, Destroyable, EventEmitter, EnvironmentSource, ResourceLoader {
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
    broadcast(type: EventType, ...data: unknown[]): void;
    /**
     * Bubbles an event up the context hierarchy to all parent contexts.
     * @param type - The type of the event.
     * @param data - The data associated with the event.
     */
    bubble(type: EventType, ...data: unknown[]): void;
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
     * 2. Runs all registered `LifecycleProcessor` and `EntryRegistryProcessor` instances.
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
 * This interface can also be implemented if an object needs access to file resources, i.e. wants to call {@link ResourceLoader#getResource|getResource}, wants to emit an application event, or requires access to the {@link ContentSource|ContentSource}. However, it is preferable to implement the more specific `ResourceLoaderAware`, `ApplicationEventEmitterAware` or `ContentSourceAware` interface in such a specific scenario.
 *
 * `AsApplicationContextAware` is a convenience mixin for application objects, implementing this interface.
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
     * Replaces the content source used by this context.
     */
    setContentSource(contentSource: ContentSource): void;
    /**
     * Replaces the environment used by this context.
     */
    setEnvironment(environment: ConfigurableEnvironment): void;
    /**
     * Updates the context identifier.
     */
    setId(id: number): void;
    /**
     * Updates the context name.
     */
    setName(name: string): void;
    /**
     * Reassigns the parent context and keeps the child list in sync.
     */
    setParent(parent: ApplicationContext): void;
    /**
     * Updates the default theme name.
     */
    setThemeName(themeName: string): void;
    /**
     * Overrides the theme resolver used by this context.
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
 * In addition to standard {@link Factory|Factory} lifecycle capabilities, `ApplicationContext` implementations detect and invoke `ApplicationContextAware` values as well as `ResourceLoaderAware`.
 */

/**
 * Interface to be implemented by any object that wishes to be notified of the {@link ApplicationContext|ApplicationContext} that it runs in.
 *
 * Implementing this interface makes sense for example when an object requires access to a set of collaborating values.
 *
 * This interface can also be implemented if an object needs access to file resources, i.e. wants to call {@link ResourceLoader#getResource|getResource}, wants to emit an application event, or requires access to the {@link ContentSource|ContentSource}. However, it is preferable to implement the more specific `ResourceLoaderAware`, `ApplicationEventEmitterAware` or `ContentSourceAware` interface in such a specific scenario.
 *
 * `AsApplicationContextAware` is a convenience mixin for application objects, implementing this interface.
 */

/**
 * Set the ApplicationContext that this object runs in. Normally this call will be used to initialize the object.
 *
 * Invoked after population of normal value properties but before an `init` callback.
 * @param {module:context.ApplicationContext} context The ApplicationContext to be used by this object.
 */

/**
 * Returns whether a value behaves like an application context.
 *
 * @param value - The value to test.
 * @returns `true` when the value looks like an application context.
 */
export const likeApplicationContext = ((value: unknown) =>
    likeContentSource(value) &&
    likeDestroyable(value) &&
    likeEnvironmentSource(value) &&
    likeEventEmitter(value) &&
    likeFactory(value) &&
    likeRegistry(value) &&
    likeResourceLoader(value)) as (value: unknown) => value is ApplicationContext;

/**
 * Returns whether a value can receive an application context.
 *
 * @param value - The value to test.
 * @returns `true` when the value looks like an application context aware.
 */
export const likeApplicationContextAware = likeAwareAnd(like({ setApplicationContext: Function })) as (
    value: unknown
) => value is ApplicationContextAware;

// GenericApplicationContext extends AsEventEmitter(AsModuleResourceLoader(DefaultFactory))
// which provides EventEmitter and ResourceLoader functionality via mixins.
// TypeScript 5.7 has stricter checking for mixin implementations, so we don't explicitly
// declare 'implements ConfigurableApplicationContext' here - the mixin chain provides it.
