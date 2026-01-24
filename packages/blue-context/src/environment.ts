/**
 * @author Jeff Rose
 */

import { Constructable, JSONValue, JSONObject } from '@blue/core';
import { both, complement, isNil, like, propSatisfies } from '@blue/util';
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
 * The role of the `Environment` with relation to profiles is in determining which profiles (if any) are currently {@link module:context.Environment#activeProfiles|active}, and which profiles (if any) should be {@link module:context.Environment#defaultProfiles|active by default}.
 * **Properties** may originate from a variety of sources. The role of the environment object with relation to properties is to provide a convenient interface for configuring property sources and resolving properties from them.
 * Values managed within an {@linkcode module:context.ApplicationContext|ApplicationContext} may register to be {@linkcode module:context.EnvironmentAware|EnvironmentAware} in order to get the profile state and resolve properties directly.
 * @interface module:context.Environment
 * @extends module:context.PropertyResolver
 */

/**
 * The set of profiles explicitly made active for this environment. Profiles are used for creating logical groupings of bean definitions to be registered conditionally, for example based on deployment environment.
 * If no profiles have explicitly been specified as active, then any {@link module:context.Environment#defaultProfiles|default profiles} will be activated.
 * @member {external:Array<external:string>} module:context.Environment#activeProfiles
 * @see {@link module:context.Environment#defaultProfiles}
 */

/**
 * The set of profiles to be active by default when no active profiles have been set explicitly.
 * @member {external:Array<external:string>} module:context.Environment#defaultProfiles
 * @see {@link module:context.Environment#activeProfiles}
 */

/**
 * @interface module:context.EnvironmentAware
 * @extends module:factory.Aware
 */

/**
 * @function module:context.EnvironmentAware#setEnvironment
 * @param {module:context.Environment} environment The {@linkcode module:context.Environment|Environment} to be set.
 */

/**
 * @interface module:context.EnvironmentSource
 */

/**
 * @member {module:context.Environment} module:context.EnvironmentSource#environment
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
 * Base class for {@linkcode module:context.Environment|Environment} implementations.
 * @abstract
 * @class module:context.AbstractEnvironment
 * @implements module:context.Environment
 */

/**
 * @mixin module:context.AsEnvironmentAware
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
 * @function module:context.likeEnvironment
 * @param {*} value The value to be tested
 * @returns {external:boolean} Whether or not the `value` is {@linkcode module:context.Environment|Environment}
 */
export const likeEnvironment = both(
    likePropertyResolver,
    like({ activeProfiles: Array, defaultProfiles: Array, addActiveProfile: Function })
) as (value) => value is Environment;

/**
 * @function module:context.likeEnvironmentAware
 * @param {*} value The value to be tested
 * @returns {external:boolean} Whether or not the `value` is {@linkcode module:context.EnvironmentAware|EnvironmentAware}
 */
export const likeEnvironmentAware = likeAwareAnd(like({ setEnvironment: Function })) as (
    value
) => value is EnvironmentAware;

const hasEnvironmentProperty = propSatisfies(likeEnvironment, 'environment');

/**
 * @function module:context.likeEnvironmentSource
 * @param {*} value The value to be tested
 * @returns {external:boolean} Whether or not the `value` is {@linkcode module:context.EnvironmentSource|EnvironmentSource}
 */
export const likeEnvironmentSource = both(complement(isNil), hasEnvironmentProperty) as (
    value
) => value is EnvironmentSource;

export class MockEnvironment extends AbstractEnvironment {}

export class StandardEnvironment extends AbstractEnvironment {}
