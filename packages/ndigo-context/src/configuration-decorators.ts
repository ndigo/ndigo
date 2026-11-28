/**
 * Configuration class decorators: `@configuration`, `@property`, `@defaultValue`, `@nestedConfig`, `@propertySource`.
 */
import { Constructable, FrameworkError, JSONObject, JSONValue, createNull } from '@ndigo/core';
import { Enumerable, likeEnumerable } from '@ndigo/core';
import {
    CONFIG_CONSTRUCTOR,
    CONFIG_DEFAULT_VALUE,
    CONFIG_NESTED,
    CONFIG_PROPERTY,
    CONFIG_PROPERTY_SOURCE,
    CONFIG_PROPERTY_TYPE,
} from './_configuration-metadata.js';

/**
 * Indicates that a class declares one or more `entry` methods and may be processed to provide the method results at runtime. For example:
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
 * `configuration` classes are bootstrapped using the `MetadataConfigApplicationContext`.
 * ```javascript
 * const context = new MetadataConfigApplicationContext( 'foobar' );
 * context.register( FooBarConfig );
 * context.getValue( 'foo' ); // "foo"
 * ```
 * @see `MetadataConfigApplicationContext`
 * @param target - The configuration class constructor.
 * @param context - The decorator context.
 * @returns The original class constructor.
 *
 * @example
 * ```ts
 * @configuration
 * class AppConfig {
 *     @entry() greetingService() { return new GreetingService(); }
 * }
 * ```
 */
export function configuration<T extends Constructable<unknown>>(target: T, context: ClassDecoratorContext): T {
    context.metadata[CONFIG_CONSTRUCTOR] = true;
    return target;
}

/**
 * Binds a class field to a property path resolved from the environment.
 *
 * @param path - The property path to resolve.
 * @param propertyType - Optional type constructor.
 * @returns A field decorator that captures the path in metadata.
 *
 * @example
 * ```ts
 * class AppConfig {
 *     @property('server.port')
 *     port = 8080;
 * }
 * ```
 */
export function property(
    path: string,
    propertyType?:
        | Constructable<number>
        | Constructable<boolean>
        | Constructable<Date>
        | Constructable<string>
        | NumberConstructor
        | BooleanConstructor
        | StringConstructor
        | DateConstructor
        | string
) {
    return function (value: undefined, context: ClassFieldDecoratorContext) {
        if (context.kind !== 'field') {
            throw new FrameworkError('@property can only be applied to class fields');
        }

        // Store metadata
        context.metadata[`${CONFIG_PROPERTY}:${String(context.name)}`] = path;
        if (propertyType) {
            context.metadata[`${CONFIG_PROPERTY_TYPE}:${String(context.name)}`] = propertyType;
        }
    };
}

/**
 * Supplies the fallback value for a `@property` field when the property is
 * missing. The default is a raw string, converted through the same
 * ConversionService path as real property values.
 *
 * @param rawDefault - The default value (string; converted to the field type).
 * @returns A field decorator.
 *
 * @example
 * ```ts
 * @configurationProperties('server')
 * class ServerConfig {
 *     @property('port', Number) @defaultValue('8080') port!: number;
 * }
 * ```
 */
export function defaultValue(rawDefault: string) {
    return function (value: undefined, context: ClassFieldDecoratorContext) {
        if (context.kind !== 'field') {
            throw new FrameworkError('@defaultValue can only be applied to class fields');
        }
        context.metadata[`${CONFIG_DEFAULT_VALUE}:${String(context.name)}`] = rawDefault;
        return value;
    };
}

/**
 * Marks a `@property('prefix')` field as a nested configuration object: bind
 * recursively into this plain-class field under the property's keypath
 *. One prefix mechanism (`@property`), one recursion flag.
 *
 * @returns A field decorator.
 *
 * @param value - The field value.
 * @param context - The field decorator context.
 *
 * @example
 * ```ts
 * @configurationProperties('server')
 * class ServerConfig {
 * }
 * class DBConfig { @property('url') url!: string; } // binds server.db.url
 * ```
 */
export function nestedConfig(value: undefined, context: ClassFieldDecoratorContext): void {
    if (context.kind !== 'field') {
        throw new FrameworkError('@nestedConfig can only be applied to class fields');
    }
    context.metadata[`${CONFIG_NESTED}:${String(context.name)}`] = true;
}

/**
 * Adds a property source to a configuration class.
 *
 * @param source - The source object or enumerable of key/value pairs.
 * @returns A class decorator that prepends the source to metadata.
 *
 * @example
 * ```ts
 * @propertySource({ 'server.port': 8080 })
 * class AppConfig {}
 * ```
 */
export function propertySource(source: JSONObject | Enumerable<string, JSONValue>) {
    return function <T extends Constructable<unknown>>(target: T, context: ClassDecoratorContext): T {
        let ps: JSONObject;
        if (likeEnumerable(source)) {
            ps = createNull();
            source.forEach((value, key) => (ps[key] = value));
        } else {
            ps = source;
        }

        // Get existing sources or create new array
        const existing = (context.metadata[CONFIG_PROPERTY_SOURCE] as JSONObject[]) || [];
        existing.unshift(ps);
        context.metadata[CONFIG_PROPERTY_SOURCE] = existing;

        return target;
    };
}
