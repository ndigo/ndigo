/**
 * @author Jeff Rose
 */
import { AsAware } from '@blue/factory';
import { like, test } from '@blue/util';
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzb3VyY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvcmVzb3VyY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7O0dBRUc7QUFFSCxPQUFPLEVBQUUsT0FBTyxFQUFTLE1BQU0sZUFBZSxDQUFDO0FBQy9DLE9BQU8sRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLE1BQU0sWUFBWSxDQUFDO0FBRXhDLE9BQU8sRUFBaUIsSUFBSSxFQUFFLE1BQU0sWUFBWSxDQUFDO0FBZWpEOztHQUVHO0FBRUg7Ozs7R0FJRztBQUVIOzs7OztHQUtHO0FBRUg7Ozs7OztHQU1HO0FBRUgsTUFBTSxFQUFFLGNBQWMsRUFBRSxHQUFHLE9BQU8sRUFDOUIsa0JBQWtCLEdBQUcsb0JBQW9CLEVBQ3pDLGFBQWEsR0FBRyxJQUFJLENBQUMsa0JBQWtCLENBQUMsQ0FBQztBQUU3Qzs7OztHQUlHO0FBQ0gsTUFBTSxDQUFDLE1BQU0scUJBQXFCLEdBQUcsQ0FBMEIsVUFBYSxFQUEwQyxFQUFFLENBQ3BILEtBQU0sU0FBUSxPQUFPLENBQUMsVUFBVSxDQUFDO0lBQzdCLE1BQU0sQ0FBaUI7SUFFdkIsaUJBQWlCLENBQUMsTUFBc0I7UUFDcEMsY0FBYyxDQUFDLElBQUksRUFBRSxRQUFRLEVBQUU7WUFDM0IsS0FBSyxFQUFFLE1BQU07WUFDYixZQUFZLEVBQUUsSUFBSTtZQUNsQixVQUFVLEVBQUUsS0FBSztZQUNqQixRQUFRLEVBQUUsS0FBSztTQUNsQixDQUFDLENBQUM7SUFDUCxDQUFDO0NBQ0osQ0FBQztBQUVOOzs7R0FHRztBQUNILE1BQU0sQ0FBQyxNQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsRUFBRSxNQUFNLEVBQUUsT0FBTyxFQUFFLENBQWlDLENBQUM7QUFFdEY7OztHQUdHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sa0JBQWtCLEdBQUcsSUFBSSxDQUFDLEVBQUUsV0FBVyxFQUFFLFFBQVEsRUFBRSxDQUF1QyxDQUFDO0FBRXhHOzs7R0FHRztB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