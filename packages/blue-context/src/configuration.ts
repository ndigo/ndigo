/**
 * @author Jeff Rose
 */

import '@tsmetadata/polyfill';
import { FrameworkError } from '@blue/core';
import { GenericApplicationContext } from './context';
import { Environment, AsEnvironmentAware, StandardEnvironment, ConfigurableEnvironment } from './environment';
import { EntryRegistryProcessor, Registry } from '@blue/factory';
import { AsResourceLoaderAware } from './resource';
import { Enumerable, Null, JSONObject, likeEnumerable, createNull, JSONValue } from '@blue/core';
import { pipe } from '@blue/util/function';
import { uniq } from '@blue/util/list';
import { split } from '@blue/util/string';

type ProfileMetadata = string[];

const { defineProperty, getOwnPropertyDescriptor } = Reflect,
    CONFIG_CONSTRUCTOR = 'config:constructor',
    CONFIG_PROFILE = 'config:profile',
    CONFIG_PROPERTY = 'config:property',
    CONFIG_PROPERTY_SOURCE = 'config:property:source',
    CONFIG_ENTRY = 'config:entry',
    splitOnComma = split(','),
    toUniqueArray = pipe(splitOnComma, uniq),
    // Helper to get metadata from a class constructor
    getMetadata = (target: any): Record<string, any> => {
        if (!target || typeof target !== 'function') {
            return {};
        }
        return (target as any)[Symbol.metadata] || {};
    },
    // Helper to get metadata from an instance
    getInstanceMetadata = (instance: any): Record<string, any> => {
        if (!instance || typeof instance !== 'object') {
            return {};
        }
        const constructor = instance.constructor;
        return getMetadata(constructor);
    },
    // Metadata getter functions
    hasConfigurationMetadata = (target): boolean => getMetadata(target)[CONFIG_CONSTRUCTOR] === true,
    hasProfileMetadata = (target, propertyKey?: string | symbol): boolean => {
        const metadata = getInstanceMetadata(target) || getMetadata(target);
        if (propertyKey) {
            return metadata[`${CONFIG_PROFILE}:${String(propertyKey)}`] !== undefined;
        }
        return metadata[CONFIG_PROFILE] !== undefined;
    },
    hasPropertyMetadata = (target, propertyKey: string | symbol): boolean => {
        const metadata = getInstanceMetadata(target) || getMetadata(target);
        return metadata[`${CONFIG_PROPERTY}:${String(propertyKey)}`] !== undefined;
    },
    hasPropertySourceMetadata = (target): boolean => getMetadata(target)[CONFIG_PROPERTY_SOURCE] !== undefined,
    hasEntryMetadata = (target, propertyKey: string | symbol): boolean => {
        const metadata = getInstanceMetadata(target) || getMetadata(target);
        return metadata[`${CONFIG_ENTRY}:${String(propertyKey)}`] !== undefined;
    },
    getProfileMetadata = (target, propertyKey?: string | symbol): ProfileMetadata => {
        const metadata = getInstanceMetadata(target) || getMetadata(target);
        if (propertyKey) {
            return metadata[`${CONFIG_PROFILE}:${String(propertyKey)}`];
        }
        return metadata[CONFIG_PROFILE];
    },
    getPropertyMetadata = (target, propertyKey: string | symbol): string => {
        const metadata = getInstanceMetadata(target) || getMetadata(target);
        return metadata[`${CONFIG_PROPERTY}:${String(propertyKey)}`];
    },
    getPropertySourceMetadata = (target): JSONObject[] => getMetadata(target)[CONFIG_PROPERTY_SOURCE],
    getEntryMetadata = (target, propertyKey: string | symbol): string => {
        const metadata = getInstanceMetadata(target) || getMetadata(target);
        return metadata[`${CONFIG_ENTRY}:${String(propertyKey)}`];
    };

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
 * @param target - The configuration class constructor.
 * @param context - The decorator context.
 * @returns The original class constructor.
 */
export function configuration<T extends new (...args: any[]) => any>(target: T, context: ClassDecoratorContext): T {
    context.metadata[CONFIG_CONSTRUCTOR] = true;
    return target;
}

/**
 * Marks a class or method as active only for the named profile(s).
 *
 * @param name - A comma-delimited list of profile names.
 * @returns A decorator that stores profile metadata.
 */
export function profile(name: string) {
    return function (target: any, context: ClassDecoratorContext | ClassMethodDecoratorContext) {
        const profiles = toUniqueArray(name);

        if (context.kind === 'class') {
            context.metadata[CONFIG_PROFILE] = profiles;
        } else if (context.kind === 'method') {
            // Store method-level metadata with method name as key
            context.metadata[`${CONFIG_PROFILE}:${String(context.name)}`] = profiles;
        }

        return target;
    };
}

/**
 * Binds a class field to a property path resolved from the environment.
 *
 * @param path - The property path to resolve.
 * @returns A field decorator that captures the path in metadata.
 */
export function property(path: string) {
    return function (value: undefined, context: ClassFieldDecoratorContext) {
        if (context.kind !== 'field') {
            throw new FrameworkError('@property can only be applied to class fields');
        }

        // Store metadata
        context.metadata[`${CONFIG_PROPERTY}:${String(context.name)}`] = path;

        // Return initializer that sets up the property
        context.addInitializer(function (this: any) {
            // The property will be set to null by the ConfigurationParser
            // when it resolves the property value from sources
            defineProperty(this, context.name, {
                value: null,
                configurable: true,
                enumerable: true,
                writable: false,
            });
        });
    };
}

/**
 * Adds a property source to a configuration class.
 *
 * @param propertySource - The source object or enumerable of key/value pairs.
 * @returns A class decorator that prepends the source to metadata.
 */
export function propertySource(propertySource: JSONObject | Enumerable<string, JSONValue>) {
    return function <T extends new (...args: any[]) => any>(target: T, context: ClassDecoratorContext): T {
        let ps: JSONObject;
        if (likeEnumerable(propertySource)) {
            ps = createNull();
            propertySource.forEach((value, key) => (ps[key] = value));
        } else {
            ps = propertySource;
        }

        // Get existing sources or create new array
        const existing = (context.metadata[CONFIG_PROPERTY_SOURCE] as JSONObject[]) || [];
        existing.unshift(ps);
        context.metadata[CONFIG_PROPERTY_SOURCE] = existing;

        return target;
    };
}

/**
 * Marks a method as a configuration entry factory.
 *
 * Can be used as `@entry()`, `@entry('customName')`, or legacy `@entry`.
 *
 * @param nameOrTarget - Entry name or the decorated method target.
 * @param maybeContext - Decorator context for legacy usage.
 * @returns A method decorator or the legacy decorator result.
 */
function createEntryDecorator(entryName?: string) {
    return function (target: any, context: ClassMethodDecoratorContext) {
        if (context.kind !== 'method') {
            throw new FrameworkError('@entry can only be applied to methods');
        }

        context.metadata[`${CONFIG_ENTRY}:${String(context.name)}`] = entryName ?? String(context.name);

        // Make the method enumerable so it can be found by for...in loops
        context.addInitializer(function (this: any) {
            const descriptor =
                getOwnPropertyDescriptor(this, context.name) ||
                getOwnPropertyDescriptor(Object.getPrototypeOf(this), context.name);
            if (descriptor && !descriptor.enumerable) {
                defineProperty(Object.getPrototypeOf(this), context.name, {
                    ...descriptor,
                    enumerable: true,
                });
            }
        });

        return target;
    };
}

/**
 * Marks a method as a configuration entry factory.
 *
 * @param nameOrTarget - Entry name or the decorated method target.
 * @param maybeContext - Decorator context for legacy usage.
 * @returns A decorator when called with a name, or the legacy decorator result.
 */
export function entry(nameOrTarget?: string | any, maybeContext?: ClassMethodDecoratorContext): any {
    // @entry('customName')
    if (typeof nameOrTarget === 'string') {
        return createEntryDecorator(nameOrTarget);
    }

    // @entry (no parentheses) legacy usage support
    if (typeof maybeContext === 'object' && maybeContext !== null) {
        return createEntryDecorator()(nameOrTarget, maybeContext);
    }

    // @entry()
    return createEntryDecorator();
}

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
    /**
     * The environment used for resolving properties.
     */
    environment: Environment;

    /**
     * Processes configuration classes registered as entry registries.
     *
     * @param registry - The registry to process.
     */
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
     * Registers a configuration class for metadata-driven initialization.
     *
     * @param configClass - The configuration class to parse.
     */
    register(configClass): void {
        this.#configurationParser.parse([configClass]);
    }
}
