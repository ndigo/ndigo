/**
 * @author Jeff Rose
 */
import { both, complement, isNil, like, propSatisfies } from '@blue/util';
import { AsAware, likeAwareAnd } from '@blue/factory';
import { likePropertyResolver, PrototypalPropertyResolver, } from './property-resolver';
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
export class AbstractEnvironment {
    #propertyResolver;
    #activeProfiles;
    #defaultProfiles;
    get propertySources() {
        return this.#propertyResolver.propertySources;
    }
    set propertySources(propertySources) {
        this.#propertyResolver.propertySources = propertySources;
    }
    get [Symbol.toStringTag]() {
        return `Environment:${[...this.#activeProfiles].join(',')}`;
    }
    get activeProfiles() {
        return [...this.#activeProfiles];
    }
    set activeProfiles(profiles) {
        const activeProfiles = this.#activeProfiles;
        activeProfiles.size && activeProfiles.clear();
        profiles.forEach(activeProfiles.add, activeProfiles);
    }
    get defaultProfiles() {
        return [...this.#defaultProfiles];
    }
    set defaultProfiles(profiles) {
        const defaultProfiles = this.#defaultProfiles;
        defaultProfiles.size && defaultProfiles.clear();
        profiles.forEach(defaultProfiles.add, defaultProfiles);
    }
    constructor(propertySources = []) {
        this.#activeProfiles = new Set();
        this.#defaultProfiles = new Set();
        this.#propertyResolver = new PrototypalPropertyResolver(propertySources);
    }
    addActiveProfile(profile) {
        this.#activeProfiles.add(profile);
    }
    hasProperty(key) {
        return this.#propertyResolver.hasProperty(key);
    }
    getProperty(key, defaultValue) {
        return this.#propertyResolver.getProperty(key, defaultValue);
    }
    getRequiredProperty(key) {
        return this.#propertyResolver.getRequiredProperty(key);
    }
    merge(environment) {
        if (environment.propertySources.length) {
            const propertySources = this.propertySources.concat(environment.propertySources);
            this.propertySources = propertySources;
        }
        environment.activeProfiles.length &&
            environment.activeProfiles.forEach((profile) => this.addActiveProfile(profile));
        environment.defaultProfiles.length &&
            environment.defaultProfiles.forEach((profile) => this.defaultProfiles.push(profile));
    }
    _isActiveProfile(profile) {
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
export const AsEnvironmentAware = (superclass) => class extends AsAware(superclass) {
    environment;
    setEnvironment(environment) {
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
export const likeEnvironment = both(likePropertyResolver, like({ activeProfiles: Array, defaultProfiles: Array, addActiveProfile: Function }));
/**
 * @function module:context.likeEnvironmentAware
 * @param {*} value The value to be tested
 * @returns {external:boolean} Whether or not the `value` is {@linkcode module:context.EnvironmentAware|EnvironmentAware}
 */
export const likeEnvironmentAware = likeAwareAnd(like({ setEnvironment: Function }));
const hasEnvironmentProperty = propSatisfies(likeEnvironment, 'environment');
/**
 * @function module:context.likeEnvironmentSource
 * @param {*} value The value to be tested
 * @returns {external:boolean} Whether or not the `value` is {@linkcode module:context.EnvironmentSource|EnvironmentSource}
 */
export const likeEnvironmentSource = both(complement(isNil), hasEnvironmentProperty);
export class MockEnvironment extends AbstractEnvironment {
}
export class StandardEnvironment extends AbstractEnvironment {
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW52aXJvbm1lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvZW52aXJvbm1lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7O0dBRUc7QUFHSCxPQUFPLEVBQUUsSUFBSSxFQUFFLFVBQVUsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLGFBQWEsRUFBRSxNQUFNLFlBQVksQ0FBQztBQUMxRSxPQUFPLEVBQUUsT0FBTyxFQUFTLFlBQVksRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUM3RCxPQUFPLEVBRUgsb0JBQW9CLEVBRXBCLDBCQUEwQixHQUM3QixNQUFNLHFCQUFxQixDQUFDO0FBc0I3Qjs7Ozs7Ozs7O0dBU0c7QUFFSDs7Ozs7R0FLRztBQUVIOzs7O0dBSUc7QUFFSDs7O0dBR0c7QUFFSDs7O0dBR0c7QUFFSDs7R0FFRztBQUVIOztHQUVHO0FBRUgsTUFBTSxFQUFFLGNBQWMsRUFBRSxHQUFHLE9BQU8sQ0FBQztBQUVuQyxNQUFNLE9BQWdCLG1CQUFtQjtJQUNyQyxpQkFBaUIsQ0FBK0I7SUFDaEQsZUFBZSxDQUFjO0lBQzdCLGdCQUFnQixDQUFjO0lBRTlCLElBQUksZUFBZTtRQUNmLE9BQU8sSUFBSSxDQUFDLGlCQUFpQixDQUFDLGVBQWUsQ0FBQztJQUNsRCxDQUFDO0lBRUQsSUFBSSxlQUFlLENBQUMsZUFBZTtRQUMvQixJQUFJLENBQUMsaUJBQWlCLENBQUMsZUFBZSxHQUFHLGVBQWUsQ0FBQztJQUM3RCxDQUFDO0lBRUQsSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUM7UUFDcEIsT0FBTyxlQUFlLENBQUMsR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUM7SUFDaEUsQ0FBQztJQUVELElBQUksY0FBYztRQUNkLE9BQU8sQ0FBQyxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQztJQUNyQyxDQUFDO0lBRUQsSUFBSSxjQUFjLENBQUMsUUFBa0I7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