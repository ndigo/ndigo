/**
 * @author Jeff Rose
 */

import { Constructable, JSONValue, JSONObject } from '@blue/core';
import { both, complement } from '@blue/util/logic';
import { propSatisfies } from '@blue/util/logic';
import { like, isNil } from '@blue/util/types';
import { AsAware, Aware, likeAwareAnd } from '@blue/factory';
import {
    ConfigurablePropertyResolver,
    likePropertyResolver,
    PropertyResolver,
    PrototypalPropertyResolver,
} from './property-resolver';

export interface Environment extends PropertyResolver {
    activeProfiles: string[];
    defaultProfiles: string[];

    addActiveProfile(profile: string): void;
}

export interface EnvironmentAware extends Aware {
    setEnvironment(environment: Environment): void;
}

export interface EnvironmentSource {
    readonly environment: Environment;
}

export interface ConfigurableEnvironment extends Environment {
    propertySources: JSONObject[];
    merge(environment: Environment);
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

    hasProperty(key: string): boolean {
        return this.#propertyResolver.hasProperty(key);
    }

    getProperty(key: string, defaultValue?: JSONValue): JSONValue {
        return this.#propertyResolver.getProperty(key, defaultValue);
    }

    getRequiredProperty(key: string): JSONValue {
        return this.#propertyResolver.getRequiredProperty(key);
    }

    merge(environment: ConfigurableEnvironment) {
        if (environment.propertySources.length) {
            const propertySources = this.propertySources.concat(environment.propertySources);
            this.propertySources = propertySources;
        }
        environment.activeProfiles.length &&
            environment.activeProfiles.forEach((profile) => this.addActiveProfile(profile));
        environment.defaultProfiles.length &&
            environment.defaultProfiles.forEach((profile) => this.defaultProfiles.push(profile));
    }

    protected _isActiveProfile(profile: string): boolean {
        return this.#activeProfiles.has(profile);
    }
}

/**
 * Base class for {@link Environment|Environment} implementations.
 * @abstract
 * @implements module:context.Environment
 */

/**
 * @see module:context.AsEnvironmentAware
 * @implements module:context.EnvironmentAware
 * @returns {module:context.Constructable<module:context.EnvironmentAware>}
 */
export const AsEnvironmentAware = <T extends Constructable>(superclass: T): Constructable<EnvironmentAware> & T =>
    class extends AsAware(superclass) implements EnvironmentAware {
        readonly environment: Environment;

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
 * @param {*} value The value to be tested
 * @returns {boolean} Whether or not the `value` is {@link Environment|Environment}
 */
export const likeEnvironment = both(
    likePropertyResolver,
    like({ activeProfiles: Array, defaultProfiles: Array, addActiveProfile: Function })
) as (value) => value is Environment;

/**
 * @param {*} value The value to be tested
 * @returns {boolean} Whether or not the `value` is {@link EnvironmentAware|EnvironmentAware}
 */
export const likeEnvironmentAware = likeAwareAnd(like({ setEnvironment: Function })) as (
    value
) => value is EnvironmentAware;

const hasEnvironmentProperty = propSatisfies(likeEnvironment, 'environment');

/**
 * @param {*} value The value to be tested
 * @returns {boolean} Whether or not the `value` is {@link EnvironmentSource|EnvironmentSource}
 */
export const likeEnvironmentSource = both(complement(isNil), hasEnvironmentProperty) as (
    value
) => value is EnvironmentSource;

export class MockEnvironment extends AbstractEnvironment {}

export class StandardEnvironment extends AbstractEnvironment {}
