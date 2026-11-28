/**
 * Environment contracts, profile types, and the refresh event.
 */
import type { ProfileTerm } from '@ndigo/core';
import type { z } from 'zod';
import type { Aware } from '@ndigo/factory';
import type { EventEmitter, EventHandlers, EventType } from './event-emitter.js';
import type { EnvironmentEvents } from './context-events.js';
import type { MutablePropertySources } from './property-sources.js';
import type { PropertyResolver } from './property-resolver.js';
import type { SecretDecryptor } from './secret-cipher.js';

export const CONFIG_REFRESH_EVENT = 'config:refresh';

/**
 * Resolves properties and manages profile activation for an application environment.
 *
 * @example
 * ```ts
 * const env: Environment = new StandardEnvironment();
 * env.setActiveProfiles('prod');
 * ```
 */
export interface Environment extends PropertyResolver {
    /**
     * The explicitly active profiles.
     */
    activeProfiles: string[];
    /**
     * The default profiles used when no active profile is configured.
     */
    defaultProfiles: string[];

    /**
     * Adds a profile to the active set.
     *
     * @param profile - The profile name.
     */
    addActiveProfile(profile: string): void;
    /**
     * Adds a profile to the default set.
     *
     * @param profile - The profile name.
     */
    addDefaultProfile(profile: string): void;
    /**
     * Evaluates a profile expression against the effective active set
     * (explicit profiles, or defaults when none are explicit).
     *
     * @param expression - The profile expression (`dev`, `!prod`, `a & b`,
     * `(a | b) & c`) or a composed {@link ProfileTerm}.
     * @returns `true` when the expression matches.
     * @throws On malformed expressions.
     */
    acceptsProfiles(expression: string | ProfileTerm): boolean;
    /**
     * Returns the name of the source that won the given property key, or
     * `null` when unknown or the active index retains no origins.
     *
     * @param key - The property key (top-level granularity).
     * @returns The winning source name, or `null`.
     */
    originOf(key: string): string | null;
    /**
     * Resolves a schema-typed configuration value from this environment
     * object-shaped schemas read each key under `prefix`
     * (`server.port` for `('server', z.object({ port: ... }))`); coercion,
     * defaults and required checks follow the schema. A missing required key
     * throws the zod error; an absent value with no default yields
     * `undefined`.
     *
     * @param prefix - Property prefix (the keypath when the schema is a
     *   top-level scalar).
     * @param schema - The zod schema describing the value.
     * @returns The parsed typed value, or `undefined` when absent.
     */
    typedConfig<S extends z.ZodType>(prefix: string, schema: S): z.infer<S> | undefined;
    /**
     * Recomputes the environment from its current sources: rebuilds the
     * lookup index and clears caches. Environment-scope only.
     */
    refresh(): void;
}

/**
 * Receives the current environment during initialization.
 *
 * @example
 * ```ts
 * const aware: EnvironmentAware = new OrderService();
 * aware.setEnvironment(environment);
 * ```
 */
export interface EnvironmentAware extends Aware {
    /** Captures the environment. @param environment - The environment. */
    setEnvironment(environment: Environment): void;
}

/**
 * Provides access to the environment associated with a component.
 *
 * @example
 * ```ts
 * const source: EnvironmentSource = new OrderComponent();
 * const env = source.environment;
 * ```
 */
export interface EnvironmentSource {
    /**
     * The environment associated with the component.
     */
    readonly environment: Environment;
}

/**
 * Environment variant that exposes its property registry and merge operations.
 *
 * @example
 * ```ts
 * const env: ConfigurableEnvironment = new StandardEnvironment();
 * env.addPropertySource(new MapPropertySource('defaults', { 'a': 1 }));
 * ```
 */
export interface ConfigurableEnvironment extends Environment, EventEmitter {
    /**
     * The ordered, named property source registry.
     */
    getPropertySources(): MutablePropertySources;
    /** Applies at-rest secret decryption to property lookups. @param decryptor - The decryptor. */
    applySecretDecryptor(decryptor: SecretDecryptor): void;
    /** Merges property sources and profiles from another configurable environment. @param environment - The other environment. */
    merge(environment: ConfigurableEnvironment): void;
    /** Registers a typed listener. @param type - Event type. @param listener - Listener. @returns This. */
    on<K extends keyof EnvironmentEvents>(type: K, listener: (...payload: EnvironmentEvents[K]) => void): this;
    /** Registers a listener. @param type - Event type. @param listener - Listener. @returns This. */
    on(type: EventType | EventHandlers, listener?: Function): this;
    /** Removes a typed listener. @param type - Event type. @param listener - Listener. @returns This. */
    off<K extends keyof EnvironmentEvents>(type: K, listener: (...payload: EnvironmentEvents[K]) => void): this;
    /** Removes a listener. @param type - Event type. @param listener - Listener. @returns This. */
    off(type: EventType, listener: Function): this;
    /** Emits a typed event. @param type - Event type. @param payload - Payload. @returns Whether a listener ran. */
    emit<K extends keyof EnvironmentEvents>(type: K, ...payload: EnvironmentEvents[K]): boolean;
    /** Emits an event. @param type - Event type. @param data - Data. @returns Whether a listener ran. */
    emit(type: EventType, ...data: unknown[]): boolean;
}
/**
 * Interface representing the environment in which the current application is running.
 * Two key aspects of the application environment: **profiles** and **properties**.
 * A **profile** is a named, logical group of values to be registered with the container only if the given profile is **active**.
 * The role of the `Environment` with relation to profiles is in determining which profiles (if any) are currently {@link Environment#activeProfiles|active}, and which profiles (if any) should be {@link Environment#defaultProfiles|active by default}.
 * **Properties** may originate from a variety of sources. The role of the environment object with relation to properties is to provide a convenient interface for configuring property sources and resolving properties from them.
 * Values managed within an {@link ApplicationContext|ApplicationContext} may register to be {@link EnvironmentAware|EnvironmentAware} in order to get the profile state and resolve properties directly.
 */
