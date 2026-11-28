/**
 * Base environment implementation with profiles and property sources.
 */
import { Constructable, Null, JSONObject, JSONValue, evaluateProfileExpression } from '@ndigo/core';
import type { ProfileTerm } from '@ndigo/core';
import type { z } from 'zod';
import { AsEventEmitter } from './event-emitter.js';
import { PrototypalPropertyResolver } from './property-resolver.js';
import type { ResolverOptions } from './property-resolver.js';
import { MutablePropertySources } from './property-sources.js';
import { resolveSchemaConfig } from './schema-config.js';
import type { SecretDecryptor } from './secret-cipher.js';
import { CONFIG_REFRESH_EVENT } from './environment-types.js';
import type { ConfigurableEnvironment } from './environment-types.js';

/**
 * Base implementation for environments with profile and property-source support.
 *
 * Environments are `EventEmitter` instances: `refresh()` emits
 * {@link CONFIG_REFRESH_EVENT} after recomputing from current sources, so
 * listeners (e.g. boot's `@refreshScope` rebinder) observe config
 * changes.
 *
 * @example
 * ```ts
 * const env = new StandardEnvironment([new MapPropertySource('app', { 'server.port': '8080' })]);
 * env.getProperty('server.port'); // '8080'
 * env.acceptsProfiles('dev'); // false
 * ```
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

    /** String tag for this environment. */
    get [Symbol.toStringTag](): string {
        return `Environment:${[...this.#activeProfiles].join(',')}`;
    }

    /** The explicitly active profiles. */
    get activeProfiles(): string[] {
        return [...this.#activeProfiles];
    }

    /** Sets the active profiles. */
    set activeProfiles(profiles: string[]) {
        const activeProfiles = this.#activeProfiles;
        // eslint-disable-next-line no-unused-expressions -- guarded call: clear only when the set is non-empty
        activeProfiles.size && activeProfiles.clear();
        profiles.forEach(activeProfiles.add, activeProfiles);
    }

    /** The default profiles. */
    get defaultProfiles(): string[] {
        return [...this.#defaultProfiles];
    }

    /** Sets the default profiles. */
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

    /**
     * Adds a profile to the active set.
     *
     * @param profile - The profile name.
     */
    addActiveProfile(profile: string): void {
        this.#activeProfiles.add(profile);
    }

    /**
     * Adds a profile to the default set.
     *
     * @param profile - The profile name.
     */
    addDefaultProfile(profile: string): void {
        this.#defaultProfiles.add(profile);
    }

    /**
     * The effective active set: explicit profiles when present, else the
     * defaults (reference parity — defaults gate only when nothing is explicit).
     */
    get activeProfilesOrDefaults(): string[] {
        return this.#activeProfiles.size ? [...this.#activeProfiles] : [...this.#defaultProfiles];
    }

    /**
     * Evaluates a profile expression against the active/default set.
     *
     * @param expression - The profile expression.
     * @returns Whether the expression matches.
     */
    acceptsProfiles(expression: string | ProfileTerm): boolean {
        return evaluateProfileExpression(String(expression), new Set(this.activeProfilesOrDefaults));
    }

    /**
     * Whether the environment resolves `key`.
     *
     * @param key - The property key.
     * @returns Whether a value exists.
     */
    hasProperty(key: string): boolean {
        return this.#propertyResolver.hasProperty(key);
    }

    /**
     * Resolves a property value.
     *
     * @param key - The property key.
     * @param defaultValue - Value returned when the key is absent.
     * @returns The resolved value, or `defaultValue`.
     */
    getProperty(key: string, defaultValue?: JSONValue): JSONValue | undefined {
        return this.#propertyResolver.getProperty(key, defaultValue);
    }

    /**
     * Resolves a property, throwing when absent.
     *
     * @param key - The property key.
     * @returns The resolved value.
     * @throws When the key has no value.
     */
    getRequiredProperty(key: string): JSONValue {
        return this.#propertyResolver.getRequiredProperty(key);
    }

    /**
     * Resolves and converts a property value.
     *
     * @param key - The property key.
     * @param targetType - The conversion target type.
     * @param defaultValue - Value returned when the key is absent.
     * @returns The converted value, or `defaultValue`.
     */
    getPropertyAs<T>(key: string, targetType: Constructable<T> | (() => T) | T, defaultValue?: T): T | undefined {
        return this.#propertyResolver.getPropertyAs(key, targetType, defaultValue);
    }

    /**
     * Resolves and converts a property, throwing when absent.
     *
     * @param key - The property key.
     * @param targetType - The conversion target type.
     * @returns The converted value.
     * @throws When the key has no value or conversion fails.
     */
    getRequiredPropertyAs<T>(key: string, targetType: Constructable<T> | (() => T) | T): T {
        return this.#propertyResolver.getRequiredPropertyAs(key, targetType);
    }

    /**
     * Resolves a Zod-schema configuration subtree.
     *
     * @param prefix - The property prefix.
     * @param schema - The Zod schema to validate against.
     * @returns The validated configuration, or `undefined` when absent.
     */
    typedConfig<S extends z.ZodType>(prefix: string, schema: S): z.infer<S> | undefined {
        return resolveSchemaConfig(schema, prefix, this);
    }

    /**
     * Resolves the raw stored value of a property.
     *
     * @param key - The property key.
     * @returns The raw value, or `undefined`.
     */
    getRawProperty(key: string): JSONValue | undefined {
        return this.#propertyResolver.getRawProperty(key);
    }

    /**
     * Returns the source name that last set `key`.
     *
     * @param key - The property key.
     * @returns The origin source name, or `null`.
     */
    originOf(key: string): string | null {
        return this.#propertyResolver.originOf(key);
    }

    /**
     * Rebuilds the resolver and emits the refresh event.
     *
     * @returns Nothing; listeners are notified as a side effect.
     */
    refresh(): void {
        this.#propertyResolver.refresh();
        // emit AFTER the rebuild so listeners read fresh state.
        this.emit(CONFIG_REFRESH_EVENT);
    }

    /**
     * Applies at-rest secret decryption to this environment.
     *
     * Rebuilds the resolver with the decryptor threaded through its options
     * (replace-not-mutate): existing sources and registry bindings
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

    /**
     * Merges another environment's property sources, preserving precedence.
     *
     * @param environment - The environment to merge.
     * @returns Nothing; sources are appended.
     */
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

    /** Whether a profile is active. @param profile - The profile. @returns `true` when active. */
    protected _isActiveProfile(profile: string): boolean {
        return this.#activeProfiles.has(profile);
    }
}
