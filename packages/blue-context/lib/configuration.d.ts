/**
 * @author Jeff Rose
 */
import '../node_modules/reflect-metadata/Reflect';
import { GenericApplicationContext } from './context';
import { Environment } from './environment';
import { EntryRegistryProcessor, Registry } from '@blue/factory';
import { Enumerable, JSONObject, JSONValue } from '@blue/core';
/**
 * Indicates that a class declares one or more {@linkcode module:context.@entry|@entry} methods and may be processed to provide the method results at runtime. For example:
 * ```javascript
 * &#064;Configuration
 * class FooBarConfig {
 *  &#064;Value
 *  foo(){
 *      return 'foo';
 *  }
 *  &#064;Value
 *  bar(){
 *      return new Bar();
 *  }
 * }
 * ```
 * {@linkcode module:context.@configuration|@configuration} classes are bootstrapped using the {@linkcode module:context.MetadataConfigApplicationContext|MetadataConfigApplicationContext}.
 * ```javascript
 * const context = new MetadataConfigApplicationContext( 'foobar' );
 * context.register( FooBarConfig );
 * context.getValue( 'foo' ); // "foo"
 * ```
 * @const {external:ClassDecorator} module:context.@configuration
 * @see {@linkcode module:context.MetadataConfigApplicationContext|MetadataConfigApplicationContext}
 */
export declare const configuration: ClassDecorator;
/**
 * @function module:context.@profile
 * @param {external:string} name
 * @returns {external:ClassDecorator}
 */
export declare const profile: (name: string) => (target: any, propertyKey?: string | symbol, descriptor?: TypedPropertyDescriptor<any>) => any;
/**
 * @function module:context.@property
 * @param {external:string} path
 * @returns {external:ClassDecorator}
 */
export declare const property: (path: string) => PropertyDecorator;
/**
 * @function module:context.@propertySource
 * @param {module:core.JSONObject | module:core.Enumerable<external:string,module:core.JSONValue>} propertySource
 * @returns {external:ClassDecorator}
 */
export declare const propertySource: (propertySource: JSONObject | Enumerable<string, JSONValue>) => ClassDecorator;
/**
 * @const {external:MethodDecorator | external:Function} module:context.@entry
 */
export declare const entry: (targetOrKey: Object | string, propertyKey?: string | symbol, descriptor?: TypedPropertyDescriptor<any>) => any;
declare const ConfigurationProcessor_base: any;
/**
 * @classdesc
 * A {@linkcode module:factory.EntryRegistryProcessor|EntryRegistryProcessor} used for processing of {@linkcode module:context.@configuration|@configuration} classes.
 * This processor should be prioritized as it is important that any {@linkcode module:context.@entry|@entry} methods declared in the `@configuration` classes have their values registered before any other {@linkcode module:factory.EntryProcessor|EntryProcessor} executes.
 * @class module:context.ConfigurationProcessor
 * @mixes module:context.AsEnvironmentAware
 * @mixes module:context.AsResourceLoaderAware
 * @implements module:factory.EntryRegistryProcessor
 * @implements module:context.EnvironmentAware
 * @implements module:context.ResourceLoaderAware
 */
export declare class ConfigurationProcessor extends ConfigurationProcessor_base implements EntryRegistryProcessor {
    environment: Environment;
    processEntryRegistry(registry: Registry): void;
}
/**
 * @class module:context.MetadataConfigApplicationContext
 * @extends module:context.GenericApplicationContext
 */
export declare class MetadataConfigApplicationContext extends GenericApplicationContext {
    #private;
    constructor(name: string);
    /**
     * @function module:context.MetadataConfigApplicationContext#register
     * @param {Object} configClass The configuration class
     */
    register(configClass: any): void;
}
export {};
//# sourceMappingURL=configuration.d.ts.map