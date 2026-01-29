/**
 * @author Jeff Rose
 */
import '../node_modules/reflect-metadata/Reflect';
import { GenericApplicationContext } from './context';
import { AsEnvironmentAware, StandardEnvironment } from './environment';
import { AsResourceLoaderAware } from './resource';
import { Null, likeEnumerable, createNull } from '@blue/core';
import { pipe } from '@blue/util/function';
import { uniq } from '@blue/util/list';
import { split } from '@blue/util/string';
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlndXJhdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9jb25maWd1cmF0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOztHQUVHO0FBRUgsT0FBTywwQ0FBMEMsQ0FBQztBQUNsRCxPQUFPLEVBQUUseUJBQXlCLEVBQUUsTUFBTSxXQUFXLENBQUM7QUFDdEQsT0FBTyxFQUFlLGtCQUFrQixFQUFFLG1CQUFtQixFQUEyQixNQUFNLGVBQWUsQ0FBQztBQUU5RyxPQUFPLEVBQUUscUJBQXFCLEVBQUUsTUFBTSxZQUFZLENBQUM7QUFDbkQsT0FBTyxFQUFjLElBQUksRUFBYyxjQUFjLEVBQUUsVUFBVSxFQUFhLE1BQU0sWUFBWSxDQUFDO0FBQ2pHLE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQztBQUMzQyxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFDdkMsT0FBTyxFQUFFLEtBQUssRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBSTFDLE1BQU0sRUFBRSxjQUFjLEVBQUUsY0FBYyxFQUFFLFdBQVcsRUFBRSx3QkFBd0IsRUFBRSxXQUFXLEVBQUUsR0FDcEYsT0FJQyxFQUNMLEVBQUUsT0FBTyxFQUFFLEdBQUcsS0FBSyxFQUNuQixrQkFBa0IsR0FBRyxvQkFBb0IsRUFDekMsY0FBYyxHQUFHLGdCQUFnQixFQUNqQyxlQUFlLEdBQUcsaUJBQWlCLEVBQ25DLHNCQUFzQixHQUFHLHdCQUF3QixFQUNqRCxZQUFZLEdBQUcsY0FBYyxFQUM3QiwyQkFBMkIsR0FBRyxDQUFDLE1BQU0sRUFBUSxFQUFFLENBQUMsY0FBYyxDQUFDLGtCQUFrQixFQUFFLElBQUksRUFBRSxNQUFNLENBQUMsRUFDaEcscUJBQXFCLEdBQUcsQ0FBQyxLQUF3QixFQUFFLE1BQU0sRUFBRSxXQUE2QixFQUFRLEVBQUUsQ0FDOUYsY0FBYyxDQUFDLGNBQWMsRUFBRSxPQUFPLENBQUMsS0FBSyxDQUFDLENB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