/**
 * @module blue-context
 * @since 1.0.0
 * @author Jeff Rose
 */
import '@tsmetadata/polyfill';
import { FrameworkError } from '@blue/core';
import { GenericApplicationContext, ApplicationContextAwareProcessor } from './context';
import { Environment, AsEnvironmentAware, StandardEnvironment, ConfigurableEnvironment } from './environment';
import { EntryRegistryProcessor, Registry } from '@blue/factory';
import { AsResourceLoaderAware } from './resource';
import { Enumerable, Null, JSONObject, likeEnumerable, createNull, JSONValue } from '@blue/core';
import { ContextToken, isContextToken } from '@blue/factory';
import { ProfileTerm } from './profile';

type ProfileMetadata = string[];

/**
 * Decorator-recorded metadata for an `@entry` method: the registry name and
 * the optional {@link ContextToken} the entry was declared with (AD-34 D1 —
 * tokens are the canonical bean handle; strings remain a compatibility and
 * data path).
 */
interface EntryMetadata {
    name: string;
    token?: ContextToken<unknown>;
}

const { defineProperty, getOwnPropertyDescriptor } = Reflect,
    CONFIG_CONSTRUCTOR = 'config:constructor',
    CONFIG_PROFILE = 'config:profile',
    CONFIG_PROPERTY = 'config:property',
    CONFIG_PROPERTY_SOURCE = 'config:property:source',
    CONFIG_DEFAULT_VALUE = 'config:defaultValue',
    CONFIG_NESTED = 'config:nested',
    CONFIG_PROPERTY_TYPE = 'config:propertyType',
    CONFIG_ENTRY = 'config:entry',
    toUniqueArray = (name: string): string[] => [...new Set(name.split(','))],
    // Helper to get metadata from a class constructor.
    // The decorator metadata store (Symbol.metadata) is dynamically typed at
    // runtime; the typed getters below assert the shapes their decorators wrote.
    getMetadata = (target: unknown): Record<string, unknown> => {
        if (!target || typeof target !== 'function') {
            return {};
        }
        return (target as { [Symbol.metadata]?: Record<string, unknown> })?.[Symbol.metadata] ?? {};
    },
    // Helper to get metadata from an instance
    getInstanceMetadata = (instance: unknown): Record<string, unknown> => {
        if (!instance || typeof instance !== 'object') {
            return {};
        }
        // Instances expose their class as `.constructor` (plain JS object shape)
        if (!('constructor' in instance)) {
            return {};
        }
        return getMetadata(instance.constructor);
    },
    // Metadata getter functions
    hasConfigurationMetadata = (target: unknown): boolean => getMetadata(target)[CONFIG_CONSTRUCTOR] === true,
    hasProfileMetadata = (target: unknown, propertyKey?: string | symbol): boolean => {
        const metadata = getInstanceMetadata(target) || getMetadata(target);
        if (propertyKey) {
            return metadata[`${CONFIG_PROFILE}:${String(propertyKey)}`] !== undefined;
        }
        return metadata[CONFIG_PROFILE] !== undefined;
    },
    hasPropertyMetadata = (target: unknown, propertyKey: string | symbol): boolean => {
        const metadata = getInstanceMetadata(target) || getMetadata(target);
        return metadata[`${CONFIG_PROPERTY}:${String(propertyKey)}`] !== undefined;
    },
    hasPropertySourceMetadata = (target: unknown): boolean => getMetadata(target)[CONFIG_PROPERTY_SOURCE] !== undefined,
    hasEntryMetadata = (target: unknown, propertyKey: string | symbol): boolean => {
        const metadata = getInstanceMetadata(target) || getMetadata(target);
        return metadata[`${CONFIG_ENTRY}:${String(propertyKey)}`] !== undefined;
    },
    getProfileMetadata = (target: unknown, propertyKey?: string | symbol): ProfileMetadata => {
        const metadata = getInstanceMetadata(target) || getMetadata(target);
        if (propertyKey) {
            // The decorator wrote an array of profile names under this key
            return metadata[`${CONFIG_PROFILE}:${String(propertyKey)}`] as ProfileMetadata;
        }
        return metadata[CONFIG_PROFILE] as ProfileMetadata;
    },
    getPropertyMetadata = (target: unknown, propertyKey: string | symbol): string => {
        const metadata = getInstanceMetadata(target) || getMetadata(target);
        // The decorator wrote the property path string under this key
        return metadata[`${CONFIG_PROPERTY}:${String(propertyKey)}`] as string;
    },
    getPropertySourceMetadata = (target: unknown): JSONObject[] => {
        // The decorator wrote the property source array under this key
        return getMetadata(target)[CONFIG_PROPERTY_SOURCE] as JSONObject[];
    },
    getEntryMetadataRecord = (target: unknown, propertyKey: string | symbol): EntryMetadata => {
        const metadata = getInstanceMetadata(target) || getMetadata(target);
        return metadata[`${CONFIG_ENTRY}:${String(propertyKey)}`] as EntryMetadata;
    };

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
 * `configuration` classes are bootstrapped using the {@link MetadataConfigApplicationContext|MetadataConfigApplicationContext}.
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
export function configuration<T extends new (...args: never[]) => unknown>(
    target: T,
    context: ClassDecoratorContext
): T {
    context.metadata[CONFIG_CONSTRUCTOR] = true;
    return target;
}

/**
 * Marks a class or method as active only for the named profile(s).
 *
 * @param expressions - Profile name(s) for which the decorated target stays
 *   active (`@profile('prod')` or `@profile('a', 'b')` for either-of).
 *   Composed {@link ProfileTerm} expressions (AD-34 D5) are accepted and
 *   coerced to their canonical string.
 * @returns A decorator that stores profile metadata.
 */
export function profile(...expressions: Array<string | ProfileTerm>) {
    // Generic target keeps the decorator's return type assignable to the
    // decorated class/method (TS1270 would reject a bare `Function` return).
    return function <M extends Function>(target: M, context: ClassDecoratorContext | ClassMethodDecoratorContext): M {
        const profiles = toUniqueArray(expressions.map(String).join(','));

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
export function property(
    path: string,
    propertyType?:
        | (new (...args: never[]) => number)
        | (new (...args: never[]) => boolean)
        | (new (...args: never[]) => Date)
        | (new (...args: never[]) => string)
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
 * ConversionService path as real property values (AD-15 D2).
 *
 * @param rawDefault - The default value (string; converted to the field type).
 * @returns A field decorator.
 *
 * @example
 * ```ts
 * @configurationProperties('server')
 * class ServerConfig {
 *     @property('port') @defaultValue('8080') port!: number;
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
 * (AD-15 D3). One prefix mechanism (`@property`), one recursion flag.
 *
 * @returns A field decorator.
 *
 * @example
 * ```ts
 * @configurationProperties('server')
 * class ServerConfig {
 *     @property('port') @defaultValue('8080') port!: number;
 *     @property('db') @nested db!: DbConfig;
 * }
 * class DbConfig { @property('url') url!: string; } // binds server.db.url
 * ```
 */
export function nested(value: undefined, context: ClassFieldDecoratorContext): void {
    if (context.kind !== 'field') {
        throw new FrameworkError('@nested can only be applied to class fields');
    }
    context.metadata[`${CONFIG_NESTED}:${String(context.name)}`] = true;
}

/**
 * Adds a property source to a configuration class.
 *
 * @param source - The source object or enumerable of key/value pairs.
 * @returns A class decorator that prepends the source to metadata.
 */
export function propertySource(source: JSONObject | Enumerable<string, JSONValue>) {
    return function <T extends new (...args: never[]) => unknown>(target: T, context: ClassDecoratorContext): T {
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

/**
 * Marks a method as a configuration entry factory.
 *
 * Can be used as `@entry()`, `@entry('customName')`, or legacy the `entry` decorator.
 *
 * @param nameOrTarget - Entry name or the decorated method target.
 * @param maybeContext - Decorator context for legacy usage.
 * @returns A method decorator or the legacy decorator result.
 */
function createEntryDecorator(entryName?: string | ContextToken<unknown>) {
    // Generic target keeps the decorator's return type assignable to the
    // decorated method (TS1270 would reject a bare `Function` return).
    return function <M extends Function>(target: M, context: ClassMethodDecoratorContext): M {
        if (context.kind !== 'method') {
            throw new FrameworkError('@entry can only be applied to methods');
        }

        // Token-declared entries register under the token's description (the
        // registry's backing key), so `getValue(TOKEN)` and `getValue('name')`
        // agree — AD-34 D1: the token is the handle, the string stays an alias.
        let name: string;
        let token: ContextToken<unknown> | undefined;
        if (isContextToken(entryName)) {
            token = entryName;
            name = entryName.description;
        } else {
            name = entryName ?? String(context.name);
        }
        const metadata: EntryMetadata = { name, token };
        context.metadata[`${CONFIG_ENTRY}:${String(context.name)}`] = metadata;

        // Make the method enumerable so it can be found by for...in loops
        context.addInitializer(function (this: unknown) {
            // `this` is the decorated method's instance (runtime-provided).
            // Walk the entire prototype chain: on a subclassed configuration
            // the `@entry` method descriptor lives on the *base* class's
            // prototype, not the instance or its immediate prototype
            // (FOLLOW-1). Mark it enumerable where it is actually declared so
            // the parser's `for...in` discovers inherited factories too.
            let owner: object | null = this as object;
            while (owner !== null) {
                const descriptor = getOwnPropertyDescriptor(owner, context.name);
                if (descriptor) {
                    if (!descriptor.enumerable) {
                        defineProperty(owner, context.name, {
                            ...descriptor,
                            enumerable: true,
                        });
                    }
                    break;
                }
                owner = Object.getPrototypeOf(owner) as object | null;
            }
        });

        return target;
    };
}

/**
 * A method decorator that marks a configuration entry factory.
 */
type EntryDecorator = <M extends Function>(target: M, context: ClassMethodDecoratorContext) => M;

/**
 * Marks a method as a configuration entry factory.
 *
 * Can be used as `@entry()`, `@entry('customName')`, or legacy the `entry` decorator.
 *
 * @param nameOrTarget - Entry name or the decorated method target.
 * @param maybeContext - Decorator context for legacy usage.
 * @returns A method decorator when called with a name, or the legacy decorator result.
 */
// Overloads keep each usage's return type assignable to the decorated method
// (a bare `Function` return would trip TS1270 on the `@entry` legacy form).
export function entry<M extends Function>(nameOrTarget: M, maybeContext: ClassMethodDecoratorContext): M;
export function entry(nameOrTarget: string | ContextToken<unknown>): EntryDecorator;
export function entry(): EntryDecorator;
export function entry<M extends Function>(
    nameOrTarget?: string | ContextToken<unknown> | M,
    maybeContext?: ClassMethodDecoratorContext
): M | EntryDecorator {
    // @entry('customName') / @entry(TOKEN)
    if (typeof nameOrTarget === 'string' || isContextToken(nameOrTarget)) {
        return createEntryDecorator(nameOrTarget);
    }

    // @entry (no parentheses) legacy usage support
    if (typeof maybeContext === 'object' && maybeContext !== null) {
        return createEntryDecorator()(nameOrTarget as M, maybeContext);
    }

    // @entry()
    return createEntryDecorator();
}

/**
 * Parses a `configuration` class definition.
 * @see {@link MetadataConfigApplicationContext}
 */
class ConfigurationParser {
    readonly environment!: Environment;
    readonly registry!: Registry;

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

    parse(candidates: unknown[]) {
        const length = candidates.length;
        let index = 0;
        for (; index < length; index++) {
            const configClass = candidates[index];
            if (hasConfigurationMetadata(configClass)) {
                if (!hasProfileMetadata(configClass) || this._isActiveProfile(getProfileMetadata(configClass))) {
                    // Candidates are decorated configuration classes (containers
                    // such as registries are skipped by the metadata check above)
                    const config = new (configClass as new (...args: never[]) => object)();
                    if (hasPropertySourceMetadata(configClass)) {
                        const sources = getPropertySourceMetadata(configClass);
                        this.processPropertySource(sources);
                        this.processProperty(config);
                    }

                    this.processConfiguration(config);
                }
            }
        }
    }

    /**
     * Process the given the `configuration` decorator decorator metadata.
     */
    processConfiguration(config: object) {
        // Config instances are plain decorated classes: iterate via string keys
        const entries: Record<string, unknown> = config as Record<string, unknown>;
        for (const key in entries) {
            if (!hasProfileMetadata(config, key) || this._isActiveProfile(getProfileMetadata(config, key))) {
                if (hasEntryMetadata(config, key)) {
                    const metadata: EntryMetadata = getEntryMetadataRecord(config, key);
                    this.processEntry(metadata.token ?? metadata.name, (entries[key] as Function).bind(config));
                }
            }
        }
    }

    /**
     * Process the given `@property` decorator metadata.
     */
    processProperty(config: object) {
        // Config instances are plain decorated classes: iterate via string keys
        const properties: Record<string, unknown> = config as Record<string, unknown>;
        for (const key in properties) {
            if (hasPropertyMetadata(config, key)) {
                const path = getPropertyMetadata(config, key),
                    value = this.environment.getProperty(path);
                defineProperty(config, key, {
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
    processPropertySource(sources: JSONObject[]) {
        (this.environment as ConfigurableEnvironment).propertySources = sources;
    }

    /**
     * Process the given the `entry` decorator decorator metadata.
     */
    processEntry(nameOrToken: string | ContextToken<unknown>, value: () => unknown) {
        const result = value();
        // Overload dispatch: `setValue` is overloaded on `string` vs
        // `ContextToken<T>` — the union needs the typeof narrowing.
        if (typeof nameOrToken === 'string') {
            this.registry.setValue(nameOrToken, result);
        } else {
            this.registry.setValue(nameOrToken, result);
        }
    }

    /**
     * @private
     * @param {Array<string>} expressions The profile expressions (OR across entries).
     * @returns {boolean} Whether any expression is accepted by the environment.
     */
    private _isActiveProfile(expressions: string[]): boolean {
        for (const expression of expressions) {
            if (this.environment.acceptsProfiles(expression)) {
                return true;
            }
        }
        return false;
    }
}

/**
 * A {@link EntryRegistryProcessor|EntryRegistryProcessor} used for processing of `configuration` classes.
 * This processor should be prioritized as it is important that any `entry` methods declared in the the `configuration` decorator classes have their values registered before any other `EntryProcessor` executes.
 */
export class ConfigurationProcessor
    extends AsResourceLoaderAware(AsEnvironmentAware(Null))
    implements EntryRegistryProcessor
{
    /**
     * The environment used for resolving properties.
     */
    environment!: Environment;

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
 */
export class MetadataConfigApplicationContext extends GenericApplicationContext {
    #configurationParser: ConfigurationParser | null = null;

    constructor(name: string) {
        super(name);
        // Register the ApplicationContextAwareProcessor before any @entry
        // configs are parsed, so entry-created aware beans receive context
        // injection when they are eagerly configured in register().
        // (refresh()/_prepareFactory() also guard against duplicates.)
        if (!this.processors.some((p) => p instanceof ApplicationContextAwareProcessor)) {
            this.addProcessor(new ApplicationContextAwareProcessor(this));
        }
    }

    /**
     * Parses configuration classes against the CURRENT environment.
     *
     * The parser is created lazily per use: `ApplicationBuilder` prepares
     * (profiles, property sources) and replaces the environment before
     * registration, so a parser captured at construction would evaluate
     * `@profile` gates and `@propertySource` against a stale environment.
     *
     * @returns The parser bound to the current environment.
     */
    #parser(): ConfigurationParser {
        this.#configurationParser ??= new ConfigurationParser(this, this.environment);
        return this.#configurationParser;
    }

    /**
     * Registers a configuration class for metadata-driven initialization.
     *
     * @param configClass - The configuration class to parse.
     */
    register(configClass: unknown): void {
        this.#parser().parse([configClass]);
    }
}
