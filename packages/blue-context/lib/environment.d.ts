/**
 * @author Jeff Rose
 */
import { Constructable, JSONValue, JSONObject } from '@blue/core';
import { Aware } from '@blue/factory';
import { PropertyResolver } from './property-resolver';
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
    merge(environment: Environment): any;
}
export declare abstract class AbstractEnvironment implements ConfigurableEnvironment {
    #private;
    get propertySources(): JSONObject[];
    set propertySources(propertySources: JSONObject[]);
    get [Symbol.toStringTag](): string;
    get activeProfiles(): string[];
    set activeProfiles(profiles: string[]);
    get defaultProfiles(): string[];
    set defaultProfiles(profiles: string[]);
    constructor(propertySources?: JSONObject[]);
    addActiveProfile(profile: string): void;
    hasProperty(key: string): boolean;
    getProperty(key: string, defaultValue?: JSONValue): JSONValue;
    getRequiredProperty(key: string): JSONValue;
    merge(environment: ConfigurableEnvironment): void;
    protected _isActiveProfile(profile: string): boolean;
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
export declare const AsEnvironmentAware: <T extends Constructable>(superclass: T) => Constructable<EnvironmentAware> & T;
/**
 * @param {*} value The value to be tested
 * @returns {boolean} Whether or not the `value` is {@link Environment|Environment}
 */
export declare const likeEnvironment: (value: any) => value is Environment;
/**
 * @param {*} value The value to be tested
 * @returns {boolean} Whether or not the `value` is {@link EnvironmentAware|EnvironmentAware}
 */
export declare const likeEnvironmentAware: (value: any) => value is EnvironmentAware;
/**
 * @param {*} value The value to be tested
 * @returns {boolean} Whether or not the `value` is {@link EnvironmentSource|EnvironmentSource}
 */
export declare const likeEnvironmentSource: (value: any) => value is EnvironmentSource;
export declare class MockEnvironment extends AbstractEnvironment {
}
export declare class StandardEnvironment extends AbstractEnvironment {
}
//# sourceMappingURL=environment.d.ts.map