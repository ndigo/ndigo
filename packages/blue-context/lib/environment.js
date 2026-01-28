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
 * Base class for {@link Environment|Environment} implementations.
 * @abstract
 * @implements module:context.Environment
 */
/**
 * @see module:context.AsEnvironmentAware
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
 * @param {*} value The value to be tested
 * @returns {boolean} Whether or not the `value` is {@link Environment|Environment}
 */
export const likeEnvironment = both(likePropertyResolver, like({ activeProfiles: Array, defaultProfiles: Array, addActiveProfile: Function }));
/**
 * @param {*} value The value to be tested
 * @returns {boolean} Whether or not the `value` is {@link EnvironmentAware|EnvironmentAware}
 */
export const likeEnvironmentAware = likeAwareAnd(like({ setEnvironment: Function }));
const hasEnvironmentProperty = propSatisfies(likeEnvironment, 'environment');
/**
 * @param {*} value The value to be tested
 * @returns {boolean} Whether or not the `value` is {@link EnvironmentSource|EnvironmentSource}
 */
export const likeEnvironmentSource = both(complement(isNil), hasEnvironmentProperty);
export class MockEnvironment extends AbstractEnvironment {
}
export class StandardEnvironment extends AbstractEnvironment {
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW52aXJvbm1lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvZW52aXJvbm1lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7O0dBRUc7QUFHSCxPQUFPLEVBQUUsSUFBSSxFQUFFLFVBQVUsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLGFBQWEsRUFBRSxNQUFNLFlBQVksQ0FBQztBQUMxRSxPQUFPLEVBQUUsT0FBTyxFQUFTLFlBQVksRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUM3RCxPQUFPLEVBRUgsb0JBQW9CLEVBRXBCLDBCQUEwQixHQUM3QixNQUFNLHFCQUFxQixDQUFDO0FBc0I3Qjs7Ozs7Ozs7R0FRRztBQUVIOzs7O0dBSUc7QUFFSDs7O0dBR0c7QUFFSDs7R0FFRztBQUVIOztHQUVHO0FBRUg7R0FDRztBQUVIO0dBQ0c7QUFFSCxNQUFNLEVBQUUsY0FBYyxFQUFFLEdBQUcsT0FBTyxDQUFDO0FBRW5DLE1BQU0sT0FBZ0IsbUJBQW1CO0lBQ3JDLGlCQUFpQixDQUErQjtJQUNoRCxlQUFlLENBQWM7SUFDN0IsZ0JBQWdCLENBQWM7SUFFOUIsSUFBSSxlQUFlO1FBQ2YsT0FBTyxJQUFJLENBQUMsaUJBQWlCLENBQUMsZUFBZSxDQUFDO0lBQ2xELENBQUM7SUFFRCxJQUFJLGVBQWUsQ0FBQyxlQUFlO1FBQy9CLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxlQUFlLEdBQUcsZUFBZSxDQUFDO0lBQzdELENBQUM7SUFFRCxJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQztRQUNwQixPQUFPLGVBQWUsQ0FBQyxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQztJQUNoRSxDQUFDO0lBRUQsSUFBSSxjQUFjO1FBQ2QsT0FBTyxDQUFDLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDO0lBQ3JDLENBQUM7SUFFRCxJQUFJLGNBQWMsQ0FBQyxRQUFrQjtRQUNqQyxN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