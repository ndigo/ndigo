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
export declare const AsEnvironmentAware: <T extends Constructable>(superclass: T) => Constructable<EnvironmentAware> & T;
/**
 * @function module:context.likeEnvironment
 * @param {*} value The value to be tested
 * @returns {external:boolean} Whether or not the `value` is {@linkcode module:context.Environment|Environment}
 */
export declare const likeEnvironment: (value: any) => value is Environment;
/**
 * @function module:context.likeEnvironmentAware
 * @param {*} value The value to be tested
 * @returns {external:boolean} Whether or not the `value` is {@linkcode module:context.EnvironmentAware|EnvironmentAware}
 */
export declare const likeEnvironmentAware: (value: any) => value is EnvironmentAware;
/**
 * @function module:context.likeEnvironmentSource
 * @param {*} value The value to be tested
 * @returns {external:boolean} Whether or not the `value` is {@linkcode module:context.EnvironmentSource|EnvironmentSource}
 */
export declare const likeEnvironmentSource: (value: any) => value is EnvironmentSource;
export declare class MockEnvironment extends AbstractEnvironment {
}
export declare class StandardEnvironment extends AbstractEnvironment {
}
//# sourceMappingURL=environment.d.ts.map