/**
 * @author Jeff Rose
 */
import { AsAware } from '@blue/factory';
import { test } from '@blue/util/string';
import { like } from '@blue/util/types';
import { Null } from '@blue/core';
/**
 * Interface for a resource descriptor that abstracts from the actual type of underlying resource, such as a file.
 */
/**
 * Strategy interface for loading resources (e.g. file system resources). An {@link ApplicationContext|ApplicationContext} is required to provide this functionality.
 *
 * Value properties of type Resource and Resource array can be populated from Strings when running in an ApplicationContext, using the particular context's resource loading strategy.
 */
/**
 * Interface to be implemented by any object that wishes to be notified of the {@link ResourceLoader|ResourceLoader} (typically the {@link ApplicationContext|ApplicationContext}) that it runs in. This is an alternative to a full ApplicationContext dependency via the {@link ApplicationContextAware|ApplicationContextAware} interface.
 *
 * You typically need a ResourceLoader when your application object has to access a variety of file resources whose names are calculated. A good strategy is to make the object use a {@link DefaultResourceLoader|DefaultResourceLoader} but still implement ResourceLoaderAware to allow for overriding when running in an ApplicationContext.
 * @extends module:context.Aware
 */
/**
 * Return a Resource handle for the specified resource location.
 *
 * Note that a Resource handle does not imply an existing resource; you need to invoke {@link Resource#exists|Resource#exists} to check for existence.
 * @param {string} location The resource location
 * @returns {module:context.Resource} A resource handle for the specified resource location.
 */
const { defineProperty } = Reflect, startsWithProtocol = /^(?:[a-z]+:)?\/\//i, isAbsoluteURL = test(startsWithProtocol);
/**
 * @see module:context.AsResourceLoaderAware
 * @implements module:context.ResourceLoaderAware
 * @returns {module:context.Constructable<module:context.ResourceLoaderAware>}
 */
export const AsResourceLoaderAware = (superclass) => class extends AsAware(superclass) {
    loader;
    setResourceLoader(loader) {
        defineProperty(this, 'loader', {
            value: loader,
            configurable: true,
            enumerable: false,
            writable: false,
        });
    }
};
/**
 * @param {*} value The value to be tested
 * @returns {boolean} Whether or not the `value` is {@link Resource|Resource}
 */
export const likeResource = like({ exists: Boolean });
/**
 * @param {*} value The value to be tested
 * @returns {boolean} Whether or not the `value` is {@link ResourceLoader|ResourceLoader}
 */
export const likeResourceLoader = like({ getResource: Function });
/**
 * @param {*} value The value to be tested
 * @returns {boolean} Whether or not the `value` is {@link ResourceLoaderAware|ResourceLoaderAware}
 */
export const likeResourceLoaderAware = like({ setResourceLoader: Function });
/**
 */
export class URLResource {
    url;
    value;
    get exists() {
        return true;
    }
    constructor(path, value) {
        const url = isAbsoluteURL(path) ? new URL(path) : new URL(path, location.href);
        // If there is no file extension, assume it's JavaScript
        if (url.pathname.lastIndexOf('.') === -1) {
            url.pathname += '.js';
        }
        defineProperty(this, 'url', {
            value: url,
            configurable: true,
            enumerable: false,
            writable: false,
        });
        defineProperty(this, 'value', {
            value: value,
            configurable: true,
            enumerable: false,
            writable: false,
        });
    }
}
/**
 * @implements module:context.Resource
 */
export class UnresolvedResource {
    value;
    get exists() {
        return false;
    }
    constructor(path, value) {
        defineProperty(this, 'path', {
            value: path,
            configurable: true,
            enumerable: false,
            writable: false,
        });
        defineProperty(this, 'value', {
            value: value,
            configurable: true,
            enumerable: false,
            writable: false,
        });
    }
}
/**
 * @see module:context.AsModuleResourceLoader
 * @implements module:context.ResourceLoader
 */
export const AsModuleResourceLoader = (superclass) => {
    // TypeScript 5.7 requires explicit type assertion for mixin pattern
    const LoaderClass = class extends superclass {
        async getResource(location) {
            try {
                const value = await import(location);
                return new URLResource(location, value);
            }
            catch (error) {
                throw new UnresolvedResource(location, error);
            }
        }
    };
    return LoaderClass;
};
/**
 * @see module:context.AsModuleResourceLoader
 */
export class DefaultResourceLoader extends AsModuleResourceLoader(Null) {
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzb3VyY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvcmVzb3VyY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7O0dBRUc7QUFFSCxPQUFPLEVBQUUsT0FBTyxFQUFTLE1BQU0sZUFBZSxDQUFDO0FBQy9DLE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQztBQUN6QyxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sa0JBQWtCLENBQUM7QUFFeEMsT0FBTyxFQUFpQixJQUFJLEVBQUUsTUFBTSxZQUFZLENBQUM7QUFlakQ7O0dBRUc7QUFFSDs7OztHQUlHO0FBRUg7Ozs7O0dBS0c7QUFFSDs7Ozs7O0dBTUc7QUFFSCxNQUFNLEVBQUUsY0FBYyxFQUFFLEdBQUcsT0FBTyxFQUM5QixrQkFBa0IsR0FBRyxvQkFBb0IsRUFDekMsYUFBYSxHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO0FBRTdDOzs7O0dBSUc7QUFDSCxNQUFNLENBQUMsTUFBTSxxQkFBcUIsR0FBRyxDQUEwQixVQUFhLEVBQTBDLEVBQUUsQ0FDcEgsS0FBTSxTQUFRLE9BQU8sQ0FBQyxVQUFVLENBQUM7SUFDN0IsTUFBTSxDQUFpQjtJQUV2QixpQkFBaUIsQ0FBQyxNQUFzQjtRQUNwQyxjQUFjLENBQUMsSUFBSSxFQUFFLFFBQVEsRUFBRTtZQUMzQixLQUFLLEVBQUUsTUFBTTtZQUNiLFlBQVksRUFBRSxJQUFJO1lBQ2xCLFVBQVUsRUFBRSxLQUFLO1lBQ2pCLFFBQVEsRUFBRSxLQUFLO1NBQ2xCLENBQUMsQ0FBQztJQUNQLENBQUM7Q0FDSixDQUFDO0FBRU47OztHQUdHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxFQUFFLE1BQU0sRUFBRSxPQUFPLEVBQUUsQ0FBaUMsQ0FBQztBQUV0Rjs7O0dBR0c7QUFDSCxNQUFNLENBQUMsTUFBTSxrQkFBa0IsR0FBRyxJQUFJLENBQUMsRUFBRSxXQUFXLEVBQUUs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