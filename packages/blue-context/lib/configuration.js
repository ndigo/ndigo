/**
 * @author Jeff Rose
 */
import '../node_modules/reflect-metadata/Reflect';
import { GenericApplicationContext } from './context';
import { AsEnvironmentAware, StandardEnvironment } from './environment';
import { AsResourceLoaderAware } from './resource';
import { Null, likeEnumerable, createNull } from '@blue/core';
import { pipe, split, uniq } from '@blue/util';
const { defineMetadata, defineProperty, getMetadata, getOwnPropertyDescriptor, hasMetadata } = Reflect, { isArray } = Array, CONFIG_CONSTRUCTOR = 'config:constructor', CONFIG_PROFILE = 'config:profile', CONFIG_PROPERTY = 'config:property', CONFIG_PROPERTY_SOURCE = 'config:property:source', CONFIG_ENTRY = 'config:entry', defineConfigurationMetadata = (target) => defineMetadata(CONFIG_CONSTRUCTOR, true, target), defineProfileMetadata = (value, target, propertyKey) => defineMetadata(CONFIG_PROFILE, isArray(value) ? value : value.split(','), target, propertyKey), definePropertyMetadata = (value, target, propertyKey) => defineMetadata(CONFIG_PROPERTY, value, target, propertyKey), definePropertySourceMetadata = (value, target) => {
    if (isArray(value)) {
        defineMetadata(CONFIG_PROPERTY_SOURCE, value, target);
    }
    else {
        throw new TypeError('value must be an array of JSON objects');
    }
}, defineEntryMetadata = (value, target, propertyKey) => defineMetadata(CONFIG_ENTRY, value, target, propertyKey), getProfileMetadata = (target, propertyKey) => getMetadata(CONFIG_PROFILE, target, propertyKey), getPropertyMetadata = (target, propertyKey) => getMetadata(CONFIG_PROPERTY, target, propertyKey), getPropertySourceMetadata = (target) => getMetadata(CONFIG_PROPERTY_SOURCE, target), getEntryMetadata = (target, propertyKey) => getMetadata(CONFIG_ENTRY, target, propertyKey), hasConfigurationMetadata = (target) => hasMetadata(CONFIG_CONSTRUCTOR, target), hasProfileMetadata = (target, propertyKey) => hasMetadata(CONFIG_PROFILE, target, propertyKey), hasPropertyMetadata = (target, propertyKey) => hasMetadata(CONFIG_PROPERTY, target, propertyKey), hasPropertySourceMetadata = (target) => hasMetadata(CONFIG_PROPERTY_SOURCE, target), hasEntryMetadata = (target, propertyKey) => hasMetadata(CONFIG_ENTRY, target, propertyKey), splitOnComma = split(','), toUniqueArray = pipe(splitOnComma, uniq);
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
export const configuration = (target) => {
    if (!hasConfigurationMetadata(target)) {
        defineConfigurationMetadata(target);
    }
    return target;
};
/**
 * @param {string} name
 * @returns {ClassDecorator}
 */
export const profile = (name) => (target, propertyKey, descriptor) => {
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
export const property = (path) => (target, propertyKey) => {
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
export const propertySource = (propertySource) => (target) => {
    let ps;
    if (likeEnumerable(propertySource)) {
        ps = createNull();
        propertySource.forEach((value, key) => (ps[key] = value));
    }
    else {
        ps = propertySource;
    }
    if (hasPropertySourceMetadata(target)) {
        const propertySources = getPropertySourceMetadata(target);
        propertySources.unshift(ps);
        definePropertySourceMetadata(propertySources, target);
    }
    else {
        definePropertySourceMetadata([ps], target);
    }
    return target;
};
/**
 */
export const entry = (targetOrKey, propertyKey, descriptor) => {
    // Called as a Function
    if (typeof targetOrKey === 'string') {
        return (target, propertyKey, descriptor) => {
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
    }
    else {
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
    environment;
    registry;
    constructor(registry, environment) {
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
    parse(candidates) {
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
            if (!hasProfileMetadata(configuration, key) ||
                this._isActiveProfile(getProfileMetadata(configuration, key))) {
                if (hasEntryMetadata(configuration, key)) {
                    const name = getEntryMetadata(configuration, key);
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
                const path = getPropertyMetadata(configuration, key), value = this.environment.getProperty(path);
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
    processPropertySource(propertySource) {
        this.environment.propertySources = propertySource;
    }
    /**
     * Process the given `@entry` decorator metadata.
     */
    processEntry(name, value) {
        this.registry.setValue(name, value());
    }
    /**
     * @private
     * @param {Array<external:string>} profiles
     * @returns {boolean} Whether or not the profiles provided are active
     */
    _isActiveProfile(profiles) {
        const activeProfiles = this.environment.activeProfiles, length = profiles.length;
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
export class ConfigurationProcessor extends AsResourceLoaderAware(AsEnvironmentAware(Null)) {
    environment;
    processEntryRegistry(registry) {
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
    #configurationParser;
    constructor(name) {
        super(name);
        this.#configurationParser = new ConfigurationParser(this, this.environment);
    }
    /**
     * @param {Object} configClass The configuration class
     */
    register(configClass) {
        this.#configurationParser.parse([configClass]);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlndXJhdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9jb25maWd1cmF0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOztHQUVHO0FBRUgsT0FBTywwQ0FBMEMsQ0FBQztBQUNsRCxPQUFPLEVBQUUseUJBQXlCLEVBQUUsTUFBTSxXQUFXLENBQUM7QUFDdEQsT0FBTyxFQUFlLGtCQUFrQixFQUFFLG1CQUFtQixFQUEyQixNQUFNLGVBQWUsQ0FBQztBQUU5RyxPQUFPLEVBQUUscUJBQXFCLEVBQUUsTUFBTSxZQUFZLENBQUM7QUFDbkQsT0FBTyxFQUFjLElBQUksRUFBYyxjQUFjLEVBQUUsVUFBVSxFQUFhLE1BQU0sWUFBWSxDQUFDO0FBQ2pHLE9BQU8sRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxNQUFNLFlBQVksQ0FBQztBQUkvQyxNQUFNLEVBQUUsY0FBYyxFQUFFLGNBQWMsRUFBRSxXQUFXLEVBQUUsd0JBQXdCLEVBQUUsV0FBVyxFQUFFLEdBQ3BGLE9BSUMsRUFDTCxFQUFFLE9BQU8sRUFBRSxHQUFHLEtBQUssRUFDbkIsa0JBQWtCLEdBQUcsb0JBQW9CLEVBQ3pDLGNBQWMsR0FBRyxnQkFBZ0IsRUFDakMsZUFBZSxHQUFHLGlCQUFpQixFQUNuQyxzQkFBc0IsR0FBRyx3QkFBd0IsRUFDakQsWUFBWSxHQUFHLGNBQWMsRUFDN0IsMkJBQTJCLEdBQUcsQ0FBQyxNQUFNLEVBQVEsRUFBRSxDQUFDLGNBQWMsQ0FBQyxrQkFBa0IsRUFBRSxJQUFJLEVBQUUsTUFBTSxDQUFDLEVBQ2hHLHFCQUFxQixHQUFHLENBQUMsS0FBd0IsRUFBRSxNQUFNLEVBQUUsV0FBNkIsRUFBUSxFQUFFLENBQzlGLGNBQWMsQ0FBQyxjQUFjLEVBQUUsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUs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