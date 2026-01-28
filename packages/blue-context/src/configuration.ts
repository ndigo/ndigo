/**
 * @author Jeff Rose
 */

import '../node_modules/reflect-metadata/Reflect';
import { GenericApplicationContext } from './context';
import { Environment, AsEnvironmentAware, StandardEnvironment, ConfigurableEnvironment } from './environment';
import { EntryRegistryProcessor, Registry } from '@blue/factory';
import { AsResourceLoaderAware } from './resource';
import { Enumerable, Null, JSONObject, likeEnumerable, createNull, JSONValue } from '@blue/core';
import { pipe, split, uniq } from '@blue/util';

type ProfileMetadata = string[];

const { defineMetadata, defineProperty, getMetadata, getOwnPropertyDescriptor, hasMetadata } =
        Reflect as typeof Reflect & {
            defineMetadata: (metadataKey: any, metadataValue: any, target: any, propertyKey?: string | symbol) => void;
            getMetadata: (metadataKey: any, target: any, propertyKey?: string | symbol) => any;
            hasMetadata: (metadataKey: any, target: any, propertyKey?: string | symbol) => boolean;
        },
    { isArray } = Array,
    CONFIG_CONSTRUCTOR = 'config:constructor',
    CONFIG_PROFILE = 'config:profile',
    CONFIG_PROPERTY = 'config:property',
    CONFIG_PROPERTY_SOURCE = 'config:property:source',
    CONFIG_ENTRY = 'config:entry',
    defineConfigurationMetadata = (target): void => defineMetadata(CONFIG_CONSTRUCTOR, true, target),
    defineProfileMetadata = (value: string | string[], target, propertyKey?: string | symbol): void =>
        defineMetadata(CONFIG_PROFILE, isArray(value) ? value : value.split(','), target, propertyKey),
    definePropertyMetadata = (value: string, target, propertyKey: string | symbol) =>
        defineMetadata(CONFIG_PROPERTY, value, target, propertyKey),
    definePropertySourceMetadata = (value: JSONObject[], target): void => {
        if (isArray(value)) {
            defineMetadata(CONFIG_PROPERTY_SOURCE, value, target);
        } else {
            throw new TypeError('value must be an array of JSON objects');
        }
    },
    defineEntryMetadata = (value, target, propertyKey: string | symbol): void =>
        defineMetadata(CONFIG_ENTRY, value, target, propertyKey),
    getProfileMetadata = (target, propertyKey?: string | symbol): ProfileMetadata =>
        getMetadata(CONFIG_PROFILE, target, propertyKey),
    getPropertyMetadata = (target, propertyKey: string | symbol): string =>
        getMetadata(CONFIG_PROPERTY, target, propertyKey),
    getPropertySourceMetadata = (target): JSONObject[] => getMetadata(CONFIG_PROPERTY_SOURCE, target),
    getEntryMetadata = (target, propertyKey: string | symbol): string => getMetadata(CONFIG_ENTRY, target, propertyKey),
    hasConfigurationMetadata = (target): boolean => hasMetadata(CONFIG_CONSTRUCTOR, target),
    hasProfileMetadata = (target, propertyKey?: string | symbol): boolean =>
        hasMetadata(CONFIG_PROFILE, target, propertyKey),
    hasPropertyMetadata = (target, propertyKey: string | symbol): boolean =>
        hasMetadata(CONFIG_PROPERTY, target, propertyKey),
    hasPropertySourceMetadata = (target): boolean => hasMetadata(CONFIG_PROPERTY_SOURCE, target),
    hasEntryMetadata = (target, propertyKey: string | symbol): boolean =>
        hasMetadata(CONFIG_ENTRY, target, propertyKey),
    splitOnComma = split(','),
    toUniqueArray = pipe(splitOnComma, uniq);

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
export const configuration: ClassDecorator = <TFunction extends Function>(target: TFunction): TFunction | void => {
    if (!hasConfigurationMetadata(target)) {
        defineConfigurationMetadata(target);
    }
    return target;
};

/**
 * @param {string} name
 * @returns {ClassDecorator}
 */
export const profile =
    (name: string) => (target, propertyKey?: string | symbol, descriptor?: TypedPropertyDescriptor<any>) => {
        defineProfileMetadata(toUniqueArray(name), target, propertyKey);
        if (propertyKey && !descriptor) {
            descriptor = getOwnPropertyDescriptor(target, propertyKey);
        }
        return propertyKey ? descriptor : target;
    };

/**
 * @param {string} path
 * @returns {ClassDecorator}
 */
export const property =
    (path: string): PropertyDecorator =>
    (target: Object, propertyKey: string | symbol): void => {
        definePropertyMetadata(path, target, propertyKey);
        defineProperty(target, propertyKey, {
            value: null,
            configurable: true,
            enumerable: true,
            writable: false,
        });
    };

/**
 * @param {module:core.JSONObject | module:core.Enumerable<external:string,module:core.JSONValue>} propertySource
 * @returns {ClassDecorator}
 */
export const propertySource =
    (propertySource: JSONObject | Enumerable<string, JSONValue>): ClassDecorator =>
    <TFunction extends Function>(target: TFunction) => {
        let ps: JSONObject;
        if (likeEnumerable(propertySource)) {
            ps = createNull();
            propertySource.forEach((value, key) => (ps[key] = value));
        } else {
            ps = propertySource;
        }
        if (hasPropertySourceMetadata(target)) {
            const propertySources = getPropertySourceMetadata(target);
            propertySources.unshift(ps);
            definePropertySourceMetadata(propertySources, target);
        } else {
            definePropertySourceMetadata([ps], target);
        }
        return target;
    };

/**
 */
export const entry = (
    targetOrKey: Object | string,
    propertyKey?: string | symbol,
    descriptor?: TypedPropertyDescriptor<any>
): any => {
    // Called as a Function
    if (typeof targetOrKey === 'string') {
        return (
            target: Object,
            propertyKey: string | symbol,
            descriptor: TypedPropertyDescriptor<any>
        ): TypedPropertyDescriptor<any> | void => {
            defineEntryMetadata(targetOrKey, target, propertyKey);
            if (!descriptor) {
                descriptor = getOwnPropertyDescriptor(target, propertyKey);
            }
            if (!descriptor.enumerable) {
                descriptor.enumerable = true;
            }
            return descriptor;
        };
        // Called as a Decorator
    } else {
        defineEntryMetadata(propertyKey, targetOrKey, propertyKey);
        if (!descriptor) {
            descriptor = getOwnPropertyDescriptor(targetOrKey, propertyKey);
        }
        if (!descriptor.enumerable) {
            descriptor.enumerable = true;
        }
        return descriptor;
    }
};

/**
 * Parses a {@link @configuration|@configuration} class definition.
 * @see {@link MetadataConfigApplicationContext}
 */
class ConfigurationParser {
    readonly environment: Environment;
    readonly registry: Registry;

    constructor(registry: Registry, environment: Environment) {
        defineProperty(this, 'registry', {
            value: registry,
            configurable: true,
            enumerable: false,
            writable: false,
        });
        defineProperty(this, 'environment', {
            value: environment,
            configurable: true,
            enumerable: false,
            writable: false,
        });
    }

    parse(candidates: any[]) {
        const length = candidates.length;
        let index = 0;
        for (; index < length; index++) {
            const configClass = candidates[index];
            if (hasConfigurationMetadata(configClass)) {
                if (!hasProfileMetadata(configClass) || this._isActiveProfile(getProfileMetadata(configClass))) {
                    const config = new configClass();
                    if (hasPropertySourceMetadata(configClass)) {
                        const propertySource = getPropertySourceMetadata(configClass);
                        this.processPropertySource(propertySource);
                        this.processProperty(config);
                    }

                    this.processConfiguration(config);
                }
            }
        }
    }

    /**
     * Process the given `@configuration` decorator metadata.
     */
    processConfiguration(configuration) {
        for (const key in configuration) {
            if (
                !hasProfileMetadata(configuration, key) ||
                this._isActiveProfile(getProfileMetadata(configuration, key))
            ) {
                if (hasEntryMetadata(configuration, key)) {
                    const name: string = getEntryMetadata(configuration, key);
                    this.processEntry(name, configuration[key].bind(configuration));
                }
            }
        }
    }

    /**
     * Process the given `@property` decorator metadata.
     */
    processProperty(configuration) {
        for (const key in configuration) {
            if (hasPropertyMetadata(configuration, key)) {
                const path = getPropertyMetadata(configuration, key),
                    value = this.environment.getProperty(path);
                defineProperty(configuration, key, {
                    value: value,
                    configurable: true,
                    enumerable: false,
                    writable: false,
                });
            }
        }
    }

    /**
     * Process the given `@propertySource` decorator metadata.
     */
    processPropertySource(propertySource: JSONObject[]) {
        (this.environment as ConfigurableEnvironment).propertySources = propertySource;
    }

    /**
     * Process the given `@entry` decorator metadata.
     */
    processEntry(name: string, value: () => any) {
        this.registry.setValue(name, value());
    }

    /**
     * @private
     * @param {Array<external:string>} profiles
     * @returns {boolean} Whether or not the profiles provided are active
     */
    private _isActiveProfile(profiles: string[]): boolean {
        const activeProfiles = this.environment.activeProfiles,
            length = profiles.length;
        let index = 0;
        for (; index < length; index++) {
            if (activeProfiles.indexOf(profiles[index]) !== -1) {
                return true;
            }
        }
        return false;
    }
}

/**
 * A {@link EntryRegistryProcessor|EntryRegistryProcessor} used for processing of {@link @configuration|@configuration} classes.
 * This processor should be prioritized as it is important that any {@link @entry|@entry} methods declared in the `@configuration` classes have their values registered before any other {@link EntryProcessor|EntryProcessor} executes.
 * @see module:context.AsEnvironmentAware
 * @see module:context.AsResourceLoaderAware
 * @implements module:factory.EntryRegistryProcessor
 * @implements module:context.EnvironmentAware
 * @implements module:context.ResourceLoaderAware
 */
export class ConfigurationProcessor
    extends AsResourceLoaderAware(AsEnvironmentAware(Null))
    implements EntryRegistryProcessor
{
    environment: Environment;

    processEntryRegistry(registry: Registry): void {
        if (!this.environment) {
            this.environment = new StandardEnvironment();
        }

        const parser = new ConfigurationParser(registry, this.environment);
        parser.parse([registry]);
    }
}

/**
 * @extends module:context.GenericApplicationContext
 */
export class MetadataConfigApplicationContext extends GenericApplicationContext {
    #configurationParser: ConfigurationParser;

    constructor(name: string) {
        super(name);
        this.#configurationParser = new ConfigurationParser(this, this.environment);
    }

    /**
     * @param {Object} configClass The configuration class
     */
    register(configClass): void {
        this.#configurationParser.parse([configClass]);
    }
}
