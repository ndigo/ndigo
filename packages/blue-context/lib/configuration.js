/**
 * @author Jeff Rose
 */
import '../node_modules/reflect-metadata/Reflect';
import { GenericApplicationContext } from './context';
import { AsEnvironmentAware, StandardEnvironment } from './environment';
import { AsResourceLoaderAware } from './resource';
import { Null, likeEnumerable, createNull } from '@blue/core';
import { pipe, split, uniq } from '@blue/util';
const { defineMetadata, defineProperty, getMetadata, getOwnPropertyDescriptor, hasMetadata, } = Reflect, { isArray } = Array, CONFIG_CONSTRUCTOR = 'config:constructor', CONFIG_PROFILE = 'config:profile', CONFIG_PROPERTY = 'config:property', CONFIG_PROPERTY_SOURCE = 'config:property:source', CONFIG_ENTRY = 'config:entry', defineConfigurationMetadata = (target) => defineMetadata(CONFIG_CONSTRUCTOR, true, target), defineProfileMetadata = (value, target, propertyKey) => defineMetadata(CONFIG_PROFILE, isArray(value) ? value : value.split(','), target, propertyKey), definePropertyMetadata = (value, target, propertyKey) => defineMetadata(CONFIG_PROPERTY, value, target, propertyKey), definePropertySourceMetadata = (value, target) => {
    if (isArray(value)) {
        defineMetadata(CONFIG_PROPERTY_SOURCE, value, target);
    }
    else {
        throw new TypeError('value must be an array of JSON objects');
    }
}, defineEntryMetadata = (value, target, propertyKey) => defineMetadata(CONFIG_ENTRY, value, target, propertyKey), getProfileMetadata = (target, propertyKey) => getMetadata(CONFIG_PROFILE, target, propertyKey), getPropertyMetadata = (target, propertyKey) => getMetadata(CONFIG_PROPERTY, target, propertyKey), getPropertySourceMetadata = (target) => getMetadata(CONFIG_PROPERTY_SOURCE, target), getEntryMetadata = (target, propertyKey) => getMetadata(CONFIG_ENTRY, target, propertyKey), hasConfigurationMetadata = (target) => hasMetadata(CONFIG_CONSTRUCTOR, target), hasProfileMetadata = (target, propertyKey) => hasMetadata(CONFIG_PROFILE, target, propertyKey), hasPropertyMetadata = (target, propertyKey) => hasMetadata(CONFIG_PROPERTY, target, propertyKey), hasPropertySourceMetadata = (target) => hasMetadata(CONFIG_PROPERTY_SOURCE, target), hasEntryMetadata = (target, propertyKey) => hasMetadata(CONFIG_ENTRY, target, propertyKey), splitOnComma = split(','), toUniqueArray = pipe(splitOnComma, uniq);
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
export const configuration = (target) => {
    if (!hasConfigurationMetadata(target)) {
        defineConfigurationMetadata(target);
    }
    return target;
};
/**
 * @function module:context.@profile
 * @param {external:string} name
 * @returns {external:ClassDecorator}
 */
export const profile = (name) => (target, propertyKey, descriptor) => {
    defineProfileMetadata(toUniqueArray(name), target, propertyKey);
    if (propertyKey && !descriptor) {
        descriptor = getOwnPropertyDescriptor(target, propertyKey);
    }
    return propertyKey ? descriptor : target;
};
/**
 * @function module:context.@property
 * @param {external:string} path
 * @returns {external:ClassDecorator}
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
 * @function module:context.@propertySource
 * @param {module:core.JSONObject | module:core.Enumerable<external:string,module:core.JSONValue>} propertySource
 * @returns {external:ClassDecorator}
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
 * @const {external:MethodDecorator | external:Function} module:context.@entry
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
 * @classdesc
 * Parses a {@linkcode module:context.@configuration|@configuration} class definition.
 * @class module:context~ConfigurationClassParser
 * @see {@link module:context.MetadataConfigApplicationContext}
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
     * @function module:context~ConfigurationClassParser#processConfiguration
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
     * @function module:context~ConfigurationClassParser#processProperty
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
     * @function module:context~ConfigurationClassParser#processPropertySource
     */
    processPropertySource(propertySource) {
        this.environment.propertySources = propertySource;
    }
    /**
     * Process the given `@entry` decorator metadata.
     * @function module:context~ConfigurationClassParser#processValue
     */
    processEntry(name, value) {
        this.registry.setValue(name, value());
    }
    /**
     * @private
     * @function module:context~ConfigurationClassParser#_isActiveProfile
     * @param {external:Array<external:string>} profiles
     * @returns {external:boolean} Whether or not the profiles provided are active
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
 * @class module:context.MetadataConfigApplicationContext
 * @extends module:context.GenericApplicationContext
 */
export class MetadataConfigApplicationContext extends GenericApplicationContext {
    #configurationParser;
    constructor(name) {
        super(name);
        this.#configurationParser = new ConfigurationParser(this, this.environment);
    }
    /**
     * @function module:context.MetadataConfigApplicationContext#register
     * @param {Object} configClass The configuration class
     */
    register(configClass) {
        this.#configurationParser.parse([configClass]);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlndXJhdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9jb25maWd1cmF0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOztHQUVHO0FBRUgsT0FBTywwQ0FBMEMsQ0FBQztBQUNsRCxPQUFPLEVBQUUseUJBQXlCLEVBQUUsTUFBTSxXQUFXLENBQUM7QUFDdEQsT0FBTyxFQUFlLGtCQUFrQixFQUFFLG1CQUFtQixFQUEyQixNQUFNLGVBQWUsQ0FBQztBQUU5RyxPQUFPLEVBQUUscUJBQXFCLEVBQUUsTUFBTSxZQUFZLENBQUM7QUFDbkQsT0FBTyxFQUFjLElBQUksRUFBYyxjQUFjLEVBQUUsVUFBVSxFQUFhLE1BQU0sWUFBWSxDQUFDO0FBQ2pHLE9BQU8sRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxNQUFNLFlBQVksQ0FBQztBQUkvQyxNQUFNLEVBQ0UsY0FBYyxFQUNkLGNBQWMsRUFDZCxXQUFXLEVBQ1gsd0JBQXdCLEVBQ3hCLFdBQVcsR0FDZCxHQUFHLE9BSUgsRUFDRCxFQUFFLE9BQU8sRUFBRSxHQUFHLEtBQUssRUFDbkIsa0JBQWtCLEdBQUcsb0JBQW9CLEVBQ3pDLGNBQWMsR0FBRyxnQkFBZ0IsRUFDakMsZUFBZSxHQUFHLGlCQUFpQixFQUNuQyxzQkFBc0IsR0FBRyx3QkFBd0IsRUFDakQsWUFBWSxHQUFHLGNBQWMsRUFDN0IsMkJBQTJCLEdBQUcsQ0FBQyxNQUFNLEVBQVEsRUFBRSxDQUFDLGNBQWMsQ0FBQyxrQkFBa0IsRUFBRSxJQUFJLEVBQUUsTUFBTSxDQUFDLEVBQ2hHLHFCQUFxQixHQUFHLENBQUMsS0FBd0IsRUFBRSxNQUFNLEVBQUUsV0FBNkIsRUFBUSxFQUFFLENBQzlGLGNBQWMsQ0FBQyxjQUFjLEVBQUUsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsTUFBTSxFQUFFLFdBQVcsQ0FBQyxFQUNsRyxzQkFBc0IsR0FBRyxDQUFDLEtBQWEsRUFBRSxNQUFNLEVBQUUsV0FBNEIsRUFBRSxFQUFFLENBQzdFLGNBQWMsQ0FBQyxlQUFlLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxXQUFXLENBQUMsRUFDL0QsNEJBQTRCLEdBQUcsQ0FBQyxLQUFtQixFQUFFLE1BQU0sRUFBUSxFQUFFO0lBQ2pFLElBQUksT0FBTyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUM7UUFDakIsY0FBYyxDQUFDLHNCQUFzQixFQUFFLEtBQUssRUFBRSxNQUFNLENBQUMsQ0FBQztJQUMxRCxDQUFDO1NBQU0sQ0FBQztRQUNKLE1BQU0sSUFBSSxTQUFTLENBQUMsd0NBQXdDLENBQUMsQ0FBQztJQUNsRSxDQUFDO0FBQ0wsQ0FBQyxFQUNELG1CQUFtQixHQUFHLENBQUMsS0FBSyxFQUFFLE1BQU0sRUFBRSxXQUE0QixFQUFRLEVBQUUsQ0FDeEUsY0FBYyxDQUFDLFlBQVksRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLFdBQVcsQ0FBQyxFQUM1RCxrQkFBa0IsR0FBRyxDQUFDLE1BQU0sRUFBRSxXQUE2QixFQUFtQixFQUFFLENBQzVFLFdBQVcsQ0FBQyxjQUFjLEVBQUUsTUFBTSxFQUFFLFdBQVcsQ0FBQyxFQUNwRCxtQkFBbUIsR0FBRyxDQUFDLE1BQU0sRUFBRSxXQUE0QixFQUFVLEVBQUUsQ0FDbkUsV0FBVyxDQUFDLGVBQWUsRUFBRSxNQUFNLEVBQUUsV0FBVyxDQUFDLEVBQ3JELHlCQUF5QixHQUFHLENBQUMsTUFBTSxFQUFnQixFQUFFLENBQUMsV0FBVyxDQUFDLHNCQUFzQixFQUFFLE1BQU0sQ0FBQyxFQUNqRyxnQkFBZ0IsR0FBRyxDQUFDLE1BQU0sRUFBRSxXQUE0QixFQUFVLEVBQUUsQ0FBQyxXQUFXLENBQUMsWUFBWSxFQUFFLE1BQU0sRUFBRSxXQUFXLENBQUMsRUFDbkgsd0JBQXdCLEdBQUcsQ0FBQyxNQUFNLEVBQVcsRUFBRSxDQUFDLFdBQVcsQ0FBQyxrQkFBa0IsRUFBRSxNQUFNLENBQUMsRUFDdkYsa0JBQWtCLEdBQUcsQ0FBQyxNQUFNLEVBQUUsV0FBNkIsRUFBVyxFQUFFLENBQ3BFLFdBQVcsQ0FBQyxjQUFjLEVBQUUsTUFBTSxFQUFFLFdBQVcsQ0FBQyxFQUNwRCxtQkFBbUIsR0FBRyxDQUFDLE1BQU0sRUFBRSxXQUE0QixFQUFXLEVBQUUsQ0FDcEUsV0FBVyxDQUFDLGVBQWUsRUFBRSxNQUFNLEVBQUUsV0FBVyxDQUFDLEVBQ3JELHlCQUF5QixHQUFHLENBQUMsTUFBTSxFQUFXLEVBQUUsQ0FBQyxXQUFXLENBQUMsc0JBQXNCLEVBQUUsTUFBTSxDQUFDLEVBQzVGLGdCQUFnQixHQUFHLENBQUMsTUFBTSxFQUFFLFdBQTRCLEVBQVcsRUFBRSxDQUNqRSxXQUFXLENBQUMsWUFBWSxFQUFFLE1BQU0sRUFBRSxXQUFXLENBQUMsRUFDbEQsWUFBWSxHQUFHLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFDekIsYUFBYSxHQUFHLElBQUksQ0FBQyxZQUFZLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFFN0M7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBdUJHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sYUFBYSxHQUFtQixDQUE2QixNQUFpQixFQUFvQixFQUFFO0lBQzdHLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDO1FBQ3BDLDJCQUEyQixDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ3hDLENBQUM7SUFDRCxPQUFPLE1BQU0sQ0FBQztBQUNsQixDQUFDLENBQUM7QUFFRjs7OztHQUlHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sT0FBTyxHQUNoQixDQUFDLElBQVksRUFBRSxFQUFFLENBQUMsQ0FBQyxNQUFNLEVBQUUsV0FBNkIsRUFBRSxVQUF5QyxFQUFFLEVBQUU7SUFDbkcscUJBQXFCLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxFQUFFLE1BQU0sRUFBRSxXQUFXLENBQUMsQ0FBQztJQUNoRSxJQUFJLFdBQVcsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO1FBQzdCLFVBQVUsR0FBRyx3QkFBd0IsQ0FBQyxNQUFNLEVBQUUsV0FBVyxDQUFDLENBQUM7SUFDL0QsQ0FBQztJQUNELE9BQU8sV0FBVyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQztBQUM3QyxDQUFDLENBQUM7QUFFTjs7OztHQUlHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sUUFBUSxHQUNqQixDQUFDLElBQVksRUFBcUIsRUFBRSxDQUNwQyxDQUFDLE1BQWMsRUFBRSxXQUE0QixFQUFRLEVBQUU7SUFDbkQsc0JBQXNCLENBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxXQUFXLENBQUMsQ0FBQztJQUNsRCxjQUFjLENBQUMsTUFBTSxFQUFFLFdBQVcsRUFBRTtRQUNoQyxLQUFLLEVBQUUsSUFBSTtRQUNYLFlBQVksRUFBRSxJQUFJO1FBQ2xCLFVBQVUsRUFBRSxJQUFJO1FBQ2hCLFFBQVEsRUFBRSxLQUFLO0tBQ2xCLENBQUMsQ0FBQztBQUNQLENBQUMsQ0FBQztBQUVOOzs7O0dBSUc7QUFDSCxNQUFNLENBQUMsTUFBTSxjQUFjLEdBQ3ZCLENBQUMsY0FBMEQsRUFBa0IsRUFBRSxDQUMvRSxDQUE2QixNQUFpQixFQUFFLEVBQUU7SUFDOUMsSUFBSSxFQUFjLENBQUM7SUFDbkIsSUFBSSxjQUFjLENBQUMsY0FBYyxDQUFDLEVBQUUsQ0FBQztRQUNqQyxFQUFFLEdBQUcsVUFBVSxFQUFFLENBQUM7UUFDbEIsY0FBYyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEtBQUssRUFBRSxHQUFHLEVBQUUsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFDOUQsQ0FBQztTQUFNLENBQUM7UUFDSixFQUFFLEdBQUcsY0FBYyxDQUFDO0lBQ3hCLENBQUM7SUFDRCxJQUFJLHlCQUF5QixDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUM7UUFDcEMsTUFBTSxlQUFlLEdBQUcseUJBQXlCLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDMUQsZUFBZSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUM1Qiw0QkFBNEIsQ0FBQyxlQUFlLEVBQUUsTUFBTSxDQUFDLENBQUM7SUFDMUQsQ0FBQztTQUFNLENBQUM7UUFDSiw0QkFBNEIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDO0lBQy9DLENBQUM7SUFDRCxPQUFPLE1BQU0sQ0FBQztBQUNsQixDQUFDLENBQUM7QUFFTjs7R0FFRztBQUNILE1BQU0sQ0FBQyxNQUFNLEtBQUssR0FBRyxDQUNqQixXQUE0QixFQUM1QixXQUE2QixFQUM3QixVQUF5QyxFQUN0QyxFQUFFO0lBQ0wsdUJBQXVCO0lBQ3ZCLElBQUksT0FBTyxXQUFXLEtBQUssUUFBUSxFQUFFLENBQUM7UUFDbEMsT0FBTyxDQUNILE1BQWMsRUFDZCxXQUE0QixFQUM1QixVQUF3QyxFQUNMLEVBQUU7WUFDckMsbUJBQW1CLENBQUMsV0FBVyxFQUFFLE1BQU0sRUFBRSxXQUFXLENBQUMsQ0FBQztZQUN0RCxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7Z0JBQ2QsVUFBVSxHQUFHLHdCQUF3QixDQUFDLE1BQU0sRUFBRSxXQUFXLENBQUMsQ0FBQztZQUMvRCxDQUFDO1lBQ0QsSUFBSSxDQUFDLFVBQVUsQ0FBQyxVQUFVLEVBQUUsQ0FBQztnQkFDekIsVUFBVSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUM7WUFDakMsQ0FBQztZQUNELE9BQU8sVUFBVSxDQUFDO1FBQ3RCLENBQUMsQ0FBQztRQUNGLHdCQUF3QjtJQUM1QixDQUFDO1NBQU0sQ0FBQztRQUNKLG1CQUFtQixDQUFDLFdBQVcsRUFBRSxXQUFXLEVBQUUsV0FBVyxDQUFDLENBQUM7UUFDM0QsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO1lBQ2QsVUFBVSxHQUFHLHdCQUF3QixDQUFDLFdBQVcsRUFBRSxXQUFXLENBQUMsQ0FBQztRQUNwRSxDQUFDO1FBQ0QsSUFBSSxDQUFDLFVBQVUsQ0FBQyxVQUFVLEVBQUUsQ0FBQztZQUN6QixVQUFVLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQztRQUNqQyxDQUFDO1FBQ0QsT0FBTyxVQUFVLENBQUM7SUFDdEIsQ0FBQztBQUNMLENBQUMsQ0FBQztBQUVGOzs7OztHQUtHO0FBQ0gsTUFBTSxtQkFBbUI7SUFDWixXQUFXLENBQWM7SUFDekIsUUFBUSxDQUFXO0lBRTVCLFlBQVksUUFBa0IsRUFBRSxXQUF3QjtRQUNwRCxjQUFjLENBQUMsSUFBSSxFQUFFLFVBQVUsRUFBRTtZQUM3QixLQUFLLEVBQUUsUUFBUTtZQUNmLFlBQVksRUFBRSxJQUFJO1lBQ2xCLFVBQVUsRUFBRSxLQUFLO1lBQ2pCLFFBQVEsRUFBRSxLQUFLO1NBQ2xCLENBQUMsQ0FBQztRQUNILGNBQWMsQ0FBQyxJQUFJLEVBQUUsYUFBYSxFQUFFO1lBQ2hDLEtBQUssRUFBRSxXQUFXO1lBQ2xCLFlBQVksRUFBRSxJQUFJO1lBQ2xCLFVBQVUsRUFBRSxLQUFLO1lBQ2pCLFFBQVEsRUFBRSxLQUFLO1NBQ2xCLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFRCxLQUFLLENBQUMsVUFBaUI7UUFDbkIsTUFBTSxNQUFNLEdBQUcsVUFBVSxDQUFDLE1BQU0sQ0FBQztRQUNqQyxJQUFJLEtBQUssR0FBRyxDQUFDLENBQUM7UUFDZCxPQUFPLEtBQUssR0FBRyxNQUFNLEVBQUUsS0FBSyxFQUFFLEVBQUUsQ0FBQztZQUM3QixNQUFNLFdBQVcsR0FBRyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDdEMsSUFBSSx3QkFBd0IsQ0FBQyxXQUFXLENBQUMsRUFBRSxDQUFDO2dCQUN4QyxJQUFJLENBQUMsa0JBQWtCLENBQUMsV0FBVyxDQUFDLElBQUksSUFBSSxDQUFDLGdCQUFnQixDQUFDLGtCQUFrQixDQUFDLFdBQVcsQ0FBQyxDQUFDLEVBQUUsQ0FBQztvQkFDN0YsTUFBTSxNQUFNLEdBQUcsSUFBSSxXQUFXLEVBQUUsQ0FBQztvQkFDakMsSUFBSSx5QkFBeUIsQ0FBQyxXQUFXLENBQUMsRUFBRSxDQUFDO3dCQUN6QyxNQUFNLGNBQWMsR0FBRyx5QkFBeUIsQ0FBQyxXQUFXLENBQUMsQ0FBQzt3QkFDOUQsSUFBSSxDQUFDLHFCQUFxQixDQUFDLGNBQWMsQ0FBQyxDQUFDO3dCQUMzQyxJQUFJLENBQUMsZUFBZSxDQUFDLE1BQU0sQ0FBQyxDQUFDO29CQUNqQyxDQUFDO29CQUVELElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxNQUFNLENBQUMsQ0FBQztnQkFDdEMsQ0FBQztZQUNMLENBQUM7UUFDTCxDQUFDO0lBQ0wsQ0FBQztJQUVEOzs7T0FHRztJQUNILG9CQUFvQixDQUFDLGFBQWE7UUFDOUIsS0FBSyxNQUFNLEdBQUcsSUFBSSxhQUFhLEVBQUUsQ0FBQztZQUM5QixJQUNJLENBQUMsa0JBQWtCLENBQUMsYUFBYSxFQUFFLEdBQUcsQ0FBQztnQkFDdkMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLGtCQUFrQixDQUFDLGFBQWEsRUFBRSxHQUFHLENBQUMsQ0FBQyxFQUMvRCxDQUFDO2dCQUNDLElBQUksZ0JBQWdCLENBQUMsYUFBYSxFQUFFLEdBQUcsQ0FBQyxFQUFFLENBQUM7b0JBQ3ZDLE1BQU0sSUFBSSxHQUFXLGdCQUFnQixDQUFDLGFBQWEsRUFBRSxHQUFHLENBQUMsQ0FBQztvQkFDMUQsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLEVBQUUsYUFBYSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDO2dCQUNwRSxDQUFDO1lBQ0wsQ0FBQztRQUNMLENBQUM7SUFDTCxDQUFDO0lBRUQ7OztPQUdHO0lBQ0gsZUFBZSxDQUFDLGFBQWE7UUFDekIsS0FBSyxNQUFNLEdBQUcsSUFBSSxhQUFhLEVBQUUsQ0FBQztZQUM5QixJQUFJLG1CQUFtQixDQUFDLGFBQWEsRUFBRSxHQUFHLENBQUMsRUFBRSxDQUFDO2dCQUMxQyxNQUFNLElBQUksR0FBRyxtQkFBbUIsQ0FBQyxhQUFhLEVBQUUsR0FBRyxDQUFDLEVBQ2hELEtBQUssR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDL0MsY0FBYyxDQUFDLGFBQWEsRUFBRSxHQUFHLEVBQUU7b0JBQy9CLEtBQUssRUFBRSxLQUFLO29CQUNaLFlBQVksRUFBRSxJQUFJO29CQUNsQixVQUFVLEVBQUUsS0FBSztvQkFDakIsUUFBUSxFQUFFLEtBQUs7aUJBQ2xCLENBQUMsQ0FBQztZQUNQLENBQUM7UUFDTCxDQUFDO0lBQ0wsQ0FBQztJQUVEOzs7T0FHRztJQUNILHFCQUFxQixDQUFDLGNBQTRCO1FBQzdDLElBQUksQ0FBQyxXQUF1QyxDQUFDLGVBQWUsR0FBRyxjQUFjLENBQUM7SUFDbkYsQ0FBQztJQUVEOzs7T0FHRztJQUNILFlBQVksQ0FBQyxJQUFZLEVBQUUsS0FBZ0I7UUFDdkMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUM7SUFDMUMsQ0FBQztJQUVEOzs7OztPQUtHO0lBQ0ssZ0JBQWdCLENBQUMsUUFBa0I7UUFDdkMsTUFBTSxjQUFjLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxjQUFjLEVBQ2xELE1BQU0sR0FBRyxRQUFRLENBQUMsTUFBTSxDQUFDO1FBQzdCLElBQUksS0FBSyxHQUFHLENBQUMsQ0FBQztRQUNkLE9BQU8sS0FBSyxHQUFHLE1BQU0sRUFBRSxLQUFLLEVBQUUsRUFBRSxDQUFDO1lBQzdCLElBQUksY0FBYyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDO2dCQUNqRCxPQUFPLElBQUksQ0FBQztZQUNoQixDQUFDO1FBQ0wsQ0FBQztRQUNELE9BQU8sS0FBSyxDQUFDO0lBQ2pCLENBQUM7Q0FDSjtBQUVEOzs7Ozs7Ozs7O0dBVUc7QUFDSCxNQUFNLE9BQU8sc0JBQ1QsU0FBUSxxQkFBcUIsQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUd2RCxXQUFXLENBQWM7SUFFekIsb0JBQW9CLENBQUMsUUFBa0I7UUFDbkMsSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUNwQixJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksbUJBQW1CLEVBQUUsQ0FBQztRQUNqRCxDQUFDO1FBRUQsTUFBTSxNQUFNLEdBQUcsSUFBSSxtQkFBbUIsQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQ25FLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO0lBQzdCLENBQUM7Q0FDSjtBQUVEOzs7R0FHRztBQUNILE1BQU0sT0FBTyxnQ0FBaUMsU0FBUSx5QkFBeUI7SUFDM0Usb0JBQW9CLENBQXNCO0lBRTFDLFlBQVksSUFBWTtRQUNwQixLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDWixJQUFJLENBQUMsb0JBQW9CLEdBQUcsSUFBSSxtQkFBbUIsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO0lBQ2hGLENBQUM7SUFFRDs7O09BR0c7SUFDSCxRQUFRLENBQUMsV0FBVztRQUNoQixJQUFJLENBQUMsb0JBQW9CLENBQUMsS0FBSyxDQUFDLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztJQUNuRCxDQUFDO0NBQ0oifQ==