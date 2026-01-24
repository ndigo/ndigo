/**
 * @author Jeff Rose
 */
import { AsAware } from '@blue/factory';
import { like, test } from '@blue/util';
import { Null } from '@blue/core';
/**
 * Interface for a resource descriptor that abstracts from the actual type of underlying resource, such as a file.
 * @interface module:context.Resource
 */
/**
 * Strategy interface for loading resources (e.g. file system resources). An {@linkcode module:context.ApplicationContext|ApplicationContext} is required to provide this functionality.
 *
 * Value properties of type Resource and Resource array can be populated from Strings when running in an ApplicationContext, using the particular context's resource loading strategy.
 * @interface module:context.ResourceLoader
 */
/**
 * Interface to be implemented by any object that wishes to be notified of the {@linkcode module:context.ResourceLoader|ResourceLoader} (typically the {@linkcode module:context.ApplicationContext|ApplicationContext}) that it runs in. This is an alternative to a full ApplicationContext dependency via the {@linkcode module:context.ApplicationContextAware|ApplicationContextAware} interface.
 *
 * You typically need a ResourceLoader when your application object has to access a variety of file resources whose names are calculated. A good strategy is to make the object use a {@linkcode module:context.DefaultResourceLoader|DefaultResourceLoader} but still implement ResourceLoaderAware to allow for overriding when running in an ApplicationContext.
 * @interface module:context.ResourceLoaderAware
 * @extends module:context.Aware
 */
/**
 * Return a Resource handle for the specified resource location.
 *
 * Note that a Resource handle does not imply an existing resource; you need to invoke {@linkcode module:context.Resource#exists|Resource#exists} to check for existence.
 * @function module:context.ResourceLoader#getResource
 * @param {external:string} location The resource location
 * @returns {module:context.Resource} A resource handle for the specified resource location.
 */
const { defineProperty } = Reflect, startsWithProtocol = /^(?:[a-z]+:)?\/\//i, isAbsoluteURL = test(startsWithProtocol);
/**
 * @mixin module:context.AsResourceLoaderAware
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
 * @function module:context.likeResource
 * @param {*} value The value to be tested
 * @returns {external:boolean} Whether or not the `value` is {@linkcode module:context.Resource|Resource}
 */
export const likeResource = like({ exists: Boolean });
/**
 * @function module:context.likeResourceLoader
 * @param {*} value The value to be tested
 * @returns {external:boolean} Whether or not the `value` is {@linkcode module:context.ResourceLoader|ResourceLoader}
 */
export const likeResourceLoader = like({ getResource: Function });
/**
 * @function module:context.likeResourceLoaderAware
 * @param {*} value The value to be tested
 * @returns {external:boolean} Whether or not the `value` is {@linkcode module:context.ResourceLoaderAware|ResourceLoaderAware}
 */
export const likeResourceLoaderAware = like({ setResourceLoader: Function });
/**
 * @class module:context.URLResource
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
 * @class module:context.UnresolvedResource
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
 * @mixin module:context.AsModuleResourceLoader
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
 * @class module:context.DefaultResourceLoader
 * @mixes module:context.AsModuleResourceLoader
 */
export class DefaultResourceLoader extends AsModuleResourceLoader(Null) {
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzb3VyY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvcmVzb3VyY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7O0dBRUc7QUFFSCxPQUFPLEVBQUUsT0FBTyxFQUFTLE1BQU0sZUFBZSxDQUFDO0FBQy9DLE9BQU8sRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLE1BQU0sWUFBWSxDQUFDO0FBRXhDLE9BQU8sRUFBaUIsSUFBSSxFQUFFLE1BQU0sWUFBWSxDQUFDO0FBZWpEOzs7R0FHRztBQUVIOzs7OztHQUtHO0FBRUg7Ozs7OztHQU1HO0FBRUg7Ozs7Ozs7R0FPRztBQUVILE1BQU0sRUFBRSxjQUFjLEVBQUUsR0FBRyxPQUFPLEVBQzlCLGtCQUFrQixHQUFHLG9CQUFvQixFQUN6QyxhQUFhLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUM7QUFFN0M7Ozs7R0FJRztBQUNILE1BQU0sQ0FBQyxNQUFNLHFCQUFxQixHQUFHLENBQTBCLFVBQWEsRUFBMEMsRUFBRSxDQUNwSCxLQUFNLFNBQVEsT0FBTyxDQUFDLFVBQVUsQ0FBQztJQUM3QixNQUFNLENBQWlCO0lBRXZCLGlCQUFpQixDQUFDLE1BQXNCO1FBQ3BDLGNBQWMsQ0FBQyxJQUFJLEVBQUUsUUFBUSxFQUFFO1lBQzNCLEtBQUssRUFBRSxNQUFNO1lBQ2IsWUFBWSxFQUFFLElBQUk7WUFDbEIsVUFBVSxFQUFFLEtBQUs7WUFDakIsUUFBUSxFQUFFLEtBQUs7U0FDbEIsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztDQUNKLENBQUM7QUFFTjs7OztHQUlHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxFQUFFLE1BQU0sRUFBRSxPQUFPLEVBQUUsQ0FBaUMsQ0FBQztBQUV0Rjs7OztHQUlHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sa0JBQWtCLEdBQUcsSUFBSSxDQUFDLEVBQUUsV0FBVyxFQUFFLFFBQVEsRUFBRSxDQUF1QyxDQUFDO0FBRXhHOzs7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