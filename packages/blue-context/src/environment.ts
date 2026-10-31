/**
 * @module blue-context
 * @since 1.0.0
 * @author Jeff Rose
 */
import { Constructable, Null, JSONValue, JSONObject, evaluateProfileExpression } from '@blue/core';
import type { ProfileTerm } from '@blue/core';
import type { z } from 'zod';
import { like, isNil } from '@blue/util/types';
import { AsAware, Aware, likeAwareAnd } from '@blue/factory';
import { likePropertyResolver, PropertyResolver, PrototypalPropertyResolver } from './property-resolver';
import type { ResolverOptions } from './property-resolver';
import { MutablePropertySources } from './property-sources';
import { resolveSchemaConfig } from './schema-config';
import { AsEventEmitter, EventEmitter, EventType, EventHandlers } from './event-emitter';
import type { EnvironmentEvents } from './context-events';
import type { SecretDecryptor } from './secret-cipher';

/**
 * Event emitted by a {@link ConfigurableEnvironment} after `refresh()`
 * recomputes from its current sources (AD-29 D-1). Listeners read fresh
 * state; the event carries no payload.
 */
export const CONFIG_REFRESH_EVENT = 'config:refresh';

/**
 * Resolves properties and manages profile activation for an application environment.
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
     *   `(a | b) & c`) or a composed {@link ProfileTerm} (AD-34 D5).
     * @returns `true` when the expression matches.
     * @throws {IllegalStateError} On malformed expressions.
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
     * (AD-34 D3): object-shaped schemas read each key under `prefix`
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
     * lookup index and clears caches. Environment-scope only (AD-16 D3).
     */
    refresh(): void;
}

/**
 * Receives the current environment during initialization.
 */
export interface EnvironmentAware extends Aware {
    setEnvironment(environment: Environment): void;
}

/**
 * Provides access to the environment associated with a component.
 */
export interface EnvironmentSource {
    /**
     * The environment associated with the component.
     */
    readonly environment: Environment;
}

/**
 * Environment variant that exposes its property registry and merge operations.
 */
export interface ConfigurableEnvironment extends Environment, EventEmitter {
    /**
     * The ordered, named property source registry.
     */
    getPropertySources(): MutablePropertySources;
    /** Applies at-rest secret decryption to property lookups. */
    applySecretDecryptor(decryptor: SecretDecryptor): void;
    /** Merges property sources and profiles from another configurable environment. */
    merge(environment: ConfigurableEnvironment): void;
    on<K extends keyof EnvironmentEvents>(type: K, listener: (...payload: EnvironmentEvents[K]) => void): this;
    on(type: EventType | EventHandlers, listener?: Function): this;
    off<K extends keyof EnvironmentEvents>(type: K, listener: (...payload: EnvironmentEvents[K]) => void): this;
    off(type: EventType, listener: Function): this;
    emit<K extends keyof EnvironmentEvents>(type: K, ...payload: EnvironmentEvents[K]): boolean;
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

/**
 * The set of profiles explicitly made active for this environment. Profiles are used for creating logical groupings of entries to be registered conditionally, for example based on deployment environment.
 * If no profiles have explicitly been specified as active, then any {@link Environment#defaultProfiles|default profiles} will be activated.
 * @see {@link Environment#defaultProfiles}
 */

/**
 * The set of profiles to be active by default when no active profiles have been set explicitly.
 * @see {@link Environment#activeProfiles}
 */

/**
 * @param {module:context.Environment} environment The {@link Environment|Environment} to be set.
 */

const { defineProperty } = Reflect;

/**
 * Base implementation for environments with profile and property-source support.
 *
 * Environments are {@link EventEmitter} instances: `refresh()` emits
 * {@link CONFIG_REFRESH_EVENT} after recomputing from current sources, so
 * listeners (e.g. boot's `@refreshScope` rebinder, AD-29) observe config
 * changes.
 */
export abstract class AbstractEnvironment extends AsEventEmitter(Null) implements ConfigurableEnvironment {
    #propertyResolver: PrototypalPropertyResolver;
    #activeProfiles: Set<string>;
    #defaultProfiles: Set<string>;

    /**
     * The ordered, named property source registry (Phase 0).
     *
     * Mutations (add/replace/remove) are picked up lazily on the next lookup,
     * so burst edits cost a single rebuild.
     *
     * @returns The live registry.
     */
    getPropertySources(): MutablePropertySources {
        return this.#propertyResolver.registry;
    }

    get [Symbol.toStringTag](): string {
        return `Environment:${[...this.#activeProfiles].join(',')}`;
    }

    get activeProfiles(): string[] {
        return [...this.#activeProfiles];
    }

    set activeProfiles(profiles: string[]) {
        const activeProfiles = this.#activeProfiles;
        // eslint-disable-next-line no-unused-expressions -- guarded call: clear only when the set is non-empty
        activeProfiles.size && activeProfiles.clear();
        profiles.forEach(activeProfiles.add, activeProfiles);
    }

    get defaultProfiles(): string[] {
        return [...this.#defaultProfiles];
    }

    set defaultProfiles(profiles: string[]) {
        const defaultProfiles = this.#defaultProfiles;
        // eslint-disable-next-line no-unused-expressions -- guarded call: clear only when the set is non-empty
        defaultProfiles.size && defaultProfiles.clear();
        profiles.forEach(defaultProfiles.add, defaultProfiles);
    }

    constructor(propertySources: JSONObject[] = [], options: ResolverOptions = {}) {
        super();
        this.#activeProfiles = new Set<string>();
        this.#defaultProfiles = new Set<string>();
        const sources = new MutablePropertySources();
        const length = propertySources.length;
        for (let index = 0; index < length; index++) {
            sources.addLast(`source:${index}`, propertySources[index]);
        }
        this.#propertyResolver = PrototypalPropertyResolver.create(sources, options);
    }

    addActiveProfile(profile: string): void {
        this.#activeProfiles.add(profile);
    }

    addDefaultProfile(profile: string): void {
        this.#defaultProfiles.add(profile);
    }

    /**
     * The effective active set: explicit profiles when present, else the
     * defaults (Spring parity — defaults gate only when nothing is explicit).
     */
    get activeProfilesOrDefaults(): string[] {
        return this.#activeProfiles.size ? [...this.#activeProfiles] : [...this.#defaultProfiles];
    }

    acceptsProfiles(expression: string | ProfileTerm): boolean {
        return evaluateProfileExpression(String(expression), new Set(this.activeProfilesOrDefaults));
    }

    hasProperty(key: string): boolean {
        return this.#propertyResolver.hasProperty(key);
    }

    getProperty(key: string, defaultValue?: JSONValue): JSONValue | undefined {
        return this.#propertyResolver.getProperty(key, defaultValue);
    }

    getRequiredProperty(key: string): JSONValue {
        return this.#propertyResolver.getRequiredProperty(key);
    }

    getPropertyAs<T>(
        key: string,
        targetType: (new (...args: never[]) => T) | (() => T) | T,
        defaultValue?: T
    ): T | undefined {
        return this.#propertyResolver.getPropertyAs(key, targetType, defaultValue);
    }

    getRequiredPropertyAs<T>(key: string, targetType: (new (...args: never[]) => T) | (() => T) | T): T {
        return this.#propertyResolver.getRequiredPropertyAs(key, targetType);
    }

    typedConfig<S extends z.ZodType>(prefix: string, schema: S): z.infer<S> | undefined {
        return resolveSchemaConfig(schema, prefix, this);
    }

    getRawProperty(key: string): JSONValue | undefined {
        return this.#propertyResolver.getRawProperty(key);
    }

    originOf(key: string): string | null {
        return this.#propertyResolver.originOf(key);
    }

    refresh(): void {
        this.#propertyResolver.refresh();
        // AD-29 D-1: emit AFTER the rebuild so listeners read fresh state.
        this.emit(CONFIG_REFRESH_EVENT);
    }

    /**
     * Applies at-rest secret decryption to this environment (AD-29 Wave 2).
     *
     * Rebuilds the resolver with the decryptor threaded through its options
     * (replace-not-mutate, AD-11 D1): existing sources and registry bindings
     * are preserved. Applying twice is idempotent — the last decryptor wins.
     *
     * @param decryptor - The secret decryptor (e.g. a `SecretSchemeRegistry`).
     */
    applySecretDecryptor(decryptor: SecretDecryptor): void {
        const options = this.#propertyResolver.options;
        const registry = this.#propertyResolver.registry;
        this.#propertyResolver = PrototypalPropertyResolver.create(registry, {
            ...options,
            secretDecryptor: decryptor,
        });
    }

    merge(environment: ConfigurableEnvironment): void {
        const sources = this.getPropertySources();
        for (const source of environment.getPropertySources()) {
            // Preserve precedence when merging a source with a colliding name.
            sources.addLast(sources.contains(source.name) ? `${source.name}:merged` : source.name, source.properties);
        }
        // eslint-disable-next-line no-unused-expressions -- guarded dispatch: merge profiles only when present
        environment.activeProfiles.length &&
            environment.activeProfiles.forEach((profile) => this.addActiveProfile(profile));
        // eslint-disable-next-line no-unused-expressions -- guarded dispatch: merge profiles only when present
        environment.defaultProfiles.length &&
            environment.defaultProfiles.forEach((profile) => this.addDefaultProfile(profile));
    }

    protected _isActiveProfile(profile: string): boolean {
        return this.#activeProfiles.has(profile);
    }
}

/**
 * Base class for {@link Environment|Environment} implementations.
 */

/**
 * @see module:context.AsEnvironmentAware
 */
export const AsEnvironmentAware = <T extends Constructable>(superclass: T): Constructable<EnvironmentAware> & T =>
    class extends AsAware(superclass) implements EnvironmentAware {
        readonly environment!: Environment;

        /**
         * Captures the environment on the instance.
         *
         * @param environment - The environment to assign.
         */
        setEnvironment(environment: Environment): void {
            defineProperty(this, 'environment', {
                value: environment,
                configurable: true,
                enumerable: false,
                writable: false,
            });
        }
    };

/**
 * Returns whether a value behaves like an environment.
 *
 * @param value - The value to test.
 * @returns `true` when the value looks like an environment.
 */
const _likeEnvironmentShape = like({
    activeProfiles: Array,
    defaultProfiles: Array,
    addActiveProfile: Function,
    addDefaultProfile: Function,
    acceptsProfiles: Function,
    originOf: Function,
    refresh: Function,
});

export const likeEnvironment = ((value: unknown) => likePropertyResolver(value) && _likeEnvironmentShape(value)) as (
    value: unknown
) => value is Environment;

/**
 * Returns whether a value can receive an environment.
 *
 * @param value - The value to test.
 * @returns `true` when the value looks like environment aware.
 */
export const likeEnvironmentAware = likeAwareAnd(like({ setEnvironment: Function })) as (
    value: unknown
) => value is EnvironmentAware;

const hasEnvironmentProperty = (value: unknown): boolean =>
    likeEnvironment((value as Record<PropertyKey, unknown>)?.['environment']);

/**
 * Returns whether a value exposes an environment.
 *
 * @param value - The value to test.
 * @returns `true` when the value looks like an environment source.
 */
export const likeEnvironmentSource = ((value: unknown) => !isNil(value) && hasEnvironmentProperty(value)) as (
    value: unknown
) => value is EnvironmentSource;

/**
 * Environment implementation intended for tests.
 */
export class MockEnvironment extends AbstractEnvironment {}

/**
 * Default environment implementation used by application contexts.
 */
export class StandardEnvironment extends AbstractEnvironment {}
