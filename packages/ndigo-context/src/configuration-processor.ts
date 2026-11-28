/**
 * Processes `@configuration` entry registries.
 */
import { Constructable, Null, JSONObject, getProfileCondition } from '@ndigo/core';
import { ContextToken, EntryRegistryProcessor, Registry } from '@ndigo/factory';
import { ApplicationContextAwareProcessor, GenericApplicationContext } from './context.js';
import { AsEnvironmentAware, StandardEnvironment } from './environment.js';
import type { ConfigurableEnvironment, Environment } from './environment.js';
import { AsResourceLoaderAware } from './resource.js';
import {
    defineProperty,
    getEntryMetadataRecord,
    getPropertyMetadata,
    getPropertySourceMetadata,
    hasConfigurationMetadata,
    hasEntryMetadata,
    hasPropertyMetadata,
    hasPropertySourceMetadata,
    type EntryMetadata,
} from './_configuration-metadata.js';

/**
 * Parses a `configuration` class definition.
 * @see {@link MetadataConfigApplicationContext}
 */
class ConfigurationParser {
    /**
     * The `Symbol.toStringTag` value for this instance.
     *
     * `Object.prototype.toString()` reads this symbol to render the
     * instance as `"[object <tag>]" ` (see MDN: Symbol.toStringTag).
     *
     * @returns The string "ConfigurationParser".
     *
     * @example
     * console.log(Object.prototype.toString.call(instance)); // "[object ConfigurationParser]"
     */
    get [Symbol.toStringTag](): string {
        return 'ConfigurationParser';
    }

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
                const condition = getProfileCondition(configClass);
                if (condition === undefined || this.environment.acceptsProfiles(condition)) {
                    // Candidates are decorated configuration classes (containers
                    // such as registries are skipped by the metadata check above)
                    const config = new (configClass as Constructable<object>)();
                    if (hasPropertySourceMetadata(configClass)) {
                        this.processPropertySource(configClass, getPropertySourceMetadata(configClass));
                    }

                    // Bind `@property` fields even without
                    // `@propertySource` — the environment is always a valid
                    // resolution source; the decorator alone declares intent.
                    this.processProperty(config);
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
            const condition = getProfileCondition(config, key);
            if (condition === undefined || this.environment.acceptsProfiles(condition)) {
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
     * Sources from this configuration receive the highest available precedence.
     *
     * Names are namespaced by declaring class + source index. The old
     * bare `source:${index}` name collided across config classes (and with the
     * environment's own constructor sources), so a later class silently
     * replaced an earlier one. Registry names are unique per class now.
     *
     * @param sourceClass - The configuration class that declared the sources.
     * @param sources - The source objects, in declaration order.
     */
    processPropertySource(sourceClass: unknown, sources: JSONObject[]) {
        const propertySources = (this.environment as ConfigurableEnvironment).getPropertySources();
        const className = (sourceClass as { name?: string }).name ?? 'anonymous';
        for (let index = sources.length - 1; index >= 0; index--) {
            propertySources.addFirst(`source:${className}:${index}`, sources[index]);
        }
    }

    /**
     * Process the given the `entry` decorator decorator metadata.
     */
    processEntry(nameOrToken: string | ContextToken<unknown>, value: () => unknown) {
        // The former if/else arms were identical. Tokens are keyed by
        // `description` (the `Registry` contract), so narrow once and register
        // through the string overload.
        const name = typeof nameOrToken === 'string' ? nameOrToken : nameOrToken.description;
        this.registry.setValue(name, value());
    }
}

/**
 * A {@link EntryRegistryProcessor|EntryRegistryProcessor} used for processing of `configuration` classes.
 * This processor should be prioritized as it is important that any `entry` methods declared in the the `configuration` decorator classes have their values registered before any other `EntryProcessor` executes.
 *
 * @example
 * ```ts
 * const processor = new ConfigurationProcessor();
 * processor.processEntryRegistry(metadataConfigApplicationContext);
 * ```
 */
export class ConfigurationProcessor
    extends AsResourceLoaderAware(AsEnvironmentAware(Null))
    implements EntryRegistryProcessor
{
    /**
     * The `Symbol.toStringTag` value for this instance.
     *
     * `Object.prototype.toString()` reads this symbol to render the
     * instance as `"[object <tag>]" ` (see MDN: Symbol.toStringTag).
     *
     * @returns The string "ConfigurationProcessor".
     *
     * @example
     * console.log(Object.prototype.toString.call(instance)); // "[object ConfigurationProcessor]"
     */
    get [Symbol.toStringTag](): string {
        return 'ConfigurationProcessor';
    }

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
 * Application context that parses `@configuration` classes and registers
 * their `@entry` values.
 *
 * @example
 * ```ts
 * const ctx = new MetadataConfigApplicationContext('app');
 * ctx.register(AppConfig);
 * ctx.refresh();
 * ```
 */
export class MetadataConfigApplicationContext extends GenericApplicationContext {
    /**
     * The `Symbol.toStringTag` value for this instance.
     *
     * `Object.prototype.toString()` reads this symbol to render the
     * instance as `"[object <tag>]" ` (see MDN: Symbol.toStringTag).
     *
     * @returns The string "MetadataConfigApplicationContext".
     *
     * @example
     * console.log(Object.prototype.toString.call(instance)); // "[object MetadataConfigApplicationContext]"
     */
    get [Symbol.toStringTag](): string {
        return 'MetadataConfigApplicationContext';
    }

    constructor(name?: string) {
        super(name);
        // Register the ApplicationContextAwareProcessor before any @entry
        // configs are parsed, so entry-created aware entries receive context
        // injection when they are eagerly configured in register().
        // (refresh()/_prepareFactory() also guard against duplicates.)
        if (!this.processors.some((p) => p instanceof ApplicationContextAwareProcessor)) {
            this.addProcessor(new ApplicationContextAwareProcessor(this));
        }
    }

    /**
     * Registers a configuration class for metadata-driven initialization.
     *
     * Parsing runs against the environment current at this call: a fresh
     * `ConfigurationParser` is created per registration. Callers may replace
     * the environment between registrations (`setEnvironment`), so a memoized
     * parser would evaluate `@whenProfile` gates, `@propertySource` and
     * `@property` binding against a stale environment.
     *
     * @param configClass - The configuration class to parse.
     */
    register(configClass: unknown): void {
        new ConfigurationParser(this, this.environment).parse([configClass]);
    }
}
