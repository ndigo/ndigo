/**
 * @author Jeff Rose
 */
import '../node_modules/reflect-metadata/Reflect';
import { GenericApplicationContext } from './context';
import { Environment } from './environment';
import { EntryRegistryProcessor, Registry } from '@blue/factory';
import { Enumerable, Null, JSONObject, JSONValue } from '@blue/core';
/**
 * Indicates that a class declares one or more {@link @entry|@entry} methods and may be processed to provide the method results at runtime. For example:
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
 * {@link @configuration|@configuration} classes are bootstrapped using the {@link MetadataConfigApplicationContext|MetadataConfigApplicationContext}.
 * ```javascript
 * const context = new MetadataConfigApplicationContext( 'foobar' );
 * context.register( FooBarConfig );
 * context.getValue( 'foo' ); // "foo"
 * ```
 * @see {@link MetadataConfigApplicationContext|MetadataConfigApplicationContext}
 */
export declare const configuration: ClassDecorator;
/**
 * @param {string} name
 * @returns {ClassDecorator}
 */
export declare const profile: (name: string) => (target: any, propertyKey?: string | symbol, descriptor?: TypedPropertyDescriptor<any>) => any;
/**
 * @param {string} path
 * @returns {ClassDecorator}
 */
export declare const property: (path: string) => PropertyDecorator;
/**
 * @param {module:core.JSONObject | module:core.Enumerable<external:string,module:core.JSONValue>} propertySource
 * @returns {ClassDecorator}
 */
export declare const propertySource: (propertySource: JSONObject | Enumerable<string, JSONValue>) => ClassDecorator;
/**
 */
export declare const entry: (targetOrKey: Object | string, propertyKey?: string | symbol, descriptor?: TypedPropertyDescriptor<any>) => any;
declare const ConfigurationProcessor_base: import("@blue/core").Constructable<import("./resource").ResourceLoaderAware> & import("@blue/core").Constructable<import("./environment").EnvironmentAware> & typeof Null;
/**
 * A {@link EntryRegistryProcessor|EntryRegistryProcessor} used for processing of {@link @configuration|@configuration} classes.
 * This processor should be prioritized as it is important that any {@link @entry|@entry} methods declared in the `@configuration` classes have their values registered before any other {@link EntryProcessor|EntryProcessor} executes.
 * @see module:context.AsEnvironmentAware
 * @see module:context.AsResourceLoaderAware
 * @implements module:factory.EntryRegistryProcessor
 * @implements module:context.EnvironmentAware
 * @implements module:context.ResourceLoaderAware
 */
export declare class ConfigurationProcessor extends ConfigurationProcessor_base implements EntryRegistryProcessor {
    environment: Environment;
    processEntryRegistry(registry: Registry): void;
}
/**
 * @extends module:context.GenericApplicationContext
 */
export declare class MetadataConfigApplicationContext extends GenericApplicationContext {
    #private;
    constructor(name: string);
    /**
     * @param {Object} configClass The configuration class
     */
    register(configClass: any): void;
}
export {};
//# sourceMappingURL=configuration.d.ts.map