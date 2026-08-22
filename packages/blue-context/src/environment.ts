/**
 * @author Jeff Rose
 */

import { Constructable, JSONValue, JSONObject } from '@blue/core';
import { like, isNil } from '@blue/util/types';
import { AsAware, Aware, likeAwareAnd } from '@blue/factory';
import {
    ConfigurablePropertyResolver,
    likePropertyResolver,
    PropertyResolver,
    PrototypalPropertyResolver,
} from './property-resolver';

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
 * Environment variant that allows property source replacement and merging.
 */
export interface ConfigurableEnvironment extends Environment {
    /**
     * The ordered property sources used for resolution.
     */
    propertySources: JSONObject[];
    /**
     * Merges another environment into this one.
     *
     * @param environment - The environment to merge.
     */
    merge(environment: ConfigurableEnvironment): void;
}

/**
 * Interface representing the environment in which the current application is running.
 * Two key aspects of the application environment: **profiles** and **properties**.
 * A **profile** is a named, logical group of values to be registered with the container only if the given profile is **active**.
 * The role of the `Environment` with relation to profiles is in determining which profiles (if any) are currently {@link Environment#activeProfiles|active}, and which profiles (if any) should be {@link Environment#defaultProfiles|active by default}.
 * **Properties** may originate from a variety of sources. The role of the environment object with relation to properties is to provide a convenient interface for configuring property sources and resolving properties from them.
 * Values managed within an {@link ApplicationContext|ApplicationContext} may register to be {@link EnvironmentAware|EnvironmentAware} in order to get the profile state and resolve properties directly.
 * @extends module:context.PropertyResolver
 */

/**
 * The set of profiles explicitly made active for this environment. Profiles are used for creating logical groupings of bean definitions to be registered conditionally, for example based on deployment environment.
 * If no profiles have explicitly been specified as active, then any {@link Environment#defaultProfiles|default profiles} will be activated.
 * @see {@link Environment#defaultProfiles}
 */

/**
 * The set of profiles to be active by default when no active profiles have been set explicitly.
 * @see {@link Environment#activeProfiles}
 */

/**
 * @extends module:factory.Aware
 */

/**
 * @param {module:context.Environment} environment The {@link Environment|Environment} to be set.
 */

/**
 */

/**
 */

const { defineProperty } = Reflect;

/**
 * Base implementation for environments with profile and property-source support.
 */
export abstract class AbstractEnvironment implements ConfigurableEnvironment {
    #propertyResolver: ConfigurablePropertyResolver;
    #activeProfiles: Set<string>;
    #defaultProfiles: Set<string>;

    get propertySources(): JSONObject[] {
        return this.#propertyResolver.propertySources;
    }

    set propertySources(propertySources) {
        this.#propertyResolver.propertySources = propertySources;
    }

    get [Symbol.toStringTag](): string {
        return `Environment:${[...this.#activeProfiles].join(',')}`;
    }

    get activeProfiles(): string[] {
        return [...this.#activeProfiles];
    }

    set activeProfiles(profiles: string[]) {
        const activeProfiles = this.#activeProfiles;
        activeProfiles.size && activeProfiles.clear();
        profiles.forEach(activeProfiles.add, activeProfiles);
    }

    get defaultProfiles(): string[] {
        return [...this.#defaultProfiles];
    }

    set defaultProfiles(profiles: string[]) {
        const defaultProfiles = this.#defaultProfiles;
        defaultProfiles.size && defaultProfiles.clear();
        profiles.forEach(defaultProfiles.add, defaultProfiles);
    }

    constructor(propertySources: JSONObject[] = []) {
        this.#activeProfiles = new Set<string>();
        this.#defaultProfiles = new Set<string>();
        this.#propertyResolver = new PrototypalPropertyResolver(propertySources);
    }

    addActiveProfile(profile: string): void {
        this.#activeProfiles.add(profile);
    }

    addDefaultProfile(profile: string): void {
        this.#defaultProfiles.add(profile);
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

    merge(environment: ConfigurableEnvironment): void {
        if (environment.propertySources.length) {
            const propertySources = this.propertySources.concat(environment.propertySources);
            this.propertySources = propertySources;
        }
        environment.activeProfiles.length &&
            environment.activeProfiles.forEach((profile) => this.addActiveProfile(profile));
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
});

export const likeEnvironment = ((value: any) => likePropertyResolver(value) && _likeEnvironmentShape(value)) as (
    value: any
) => value is Environment;

/**
 * Returns whether a value can receive an environment.
 *
 * @param value - The value to test.
 * @returns `true` when the value looks like environment aware.
 */
export const likeEnvironmentAware = likeAwareAnd(like({ setEnvironment: Function })) as (
    value: any
) => value is EnvironmentAware;

const hasEnvironmentProperty = (value: any): boolean => likeEnvironment(value?.['environment']);

/**
 * Returns whether a value exposes an environment.
 *
 * @param value - The value to test.
 * @returns `true` when the value looks like an environment source.
 */
export const likeEnvironmentSource = ((value: any) => !isNil(value) && hasEnvironmentProperty(value)) as (
    value: any
) => value is EnvironmentSource;

/**
 * Environment implementation intended for tests.
 */
export class MockEnvironment extends AbstractEnvironment {}

/**
 * Default environment implementation used by application contexts.
 */
export class StandardEnvironment extends AbstractEnvironment {}
