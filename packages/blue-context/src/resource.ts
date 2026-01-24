/**
 * @author Jeff Rose
 */

import { AsAware, Aware } from '@blue/factory';
import { like, test } from '@blue/util';

import { Constructable, Null } from '@blue/core';

export interface Resource<T = any> {
    readonly exists: boolean;
    readonly value: T;
}

export interface ResourceLoader {
    getResource(location: string): Promise<Resource>;
}

export interface ResourceLoaderAware extends Aware {
    setResourceLoader(loader: ResourceLoader): void;
}

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

const { defineProperty } = Reflect,
    startsWithProtocol = /^(?:[a-z]+:)?\/\//i,
    isAbsoluteURL = test(startsWithProtocol);

/**
 * @mixin module:context.AsResourceLoaderAware
 * @implements module:context.ResourceLoaderAware
 * @returns {module:context.Constructable<module:context.ResourceLoaderAware>}
 */
export const AsResourceLoaderAware = <T extends Constructable>(superclass: T): Constructable<ResourceLoaderAware> & T =>
    class extends AsAware(superclass) implements ResourceLoaderAware {
        loader: ResourceLoader;

        setResourceLoader(loader: ResourceLoader): void {
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
export const likeResource = like({ exists: Boolean }) as (value) => value is Resource;

/**
 * @function module:context.likeResourceLoader
 * @param {*} value The value to be tested
 * @returns {external:boolean} Whether or not the `value` is {@linkcode module:context.ResourceLoader|ResourceLoader}
 */
export const likeResourceLoader = like({ getResource: Function }) as (value) => value is ResourceLoader;

/**
 * @function module:context.likeResourceLoaderAware
 * @param {*} value The value to be tested
 * @returns {external:boolean} Whether or not the `value` is {@linkcode module:context.ResourceLoaderAware|ResourceLoaderAware}
 */
export const likeResourceLoaderAware = like({ setResourceLoader: Function }) as (value) => value is ResourceLoaderAware;

/**
 * @class module:context.URLResource
 */
export class URLResource<T = any> implements Resource<T> {
    readonly url: URL;
    readonly value: T;

    get exists(): boolean {
        return true;
    }

    constructor(path: string, value: T) {
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
export class UnresolvedResource implements Resource<Error> {
    readonly value: Error;

    get exists(): boolean {
        return false;
    }

    constructor(path: string, value: Error) {
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
export const AsModuleResourceLoader = <T extends Constructable>(
    superclass: T
): Constructable<ResourceLoader> & T => {
    // TypeScript 5.7 requires explicit type assertion for mixin pattern
    const LoaderClass = class extends (superclass as new (...args: any[]) => any) implements ResourceLoader {
        async getResource(location: string): Promise<Resource> {
            try {
                const value = await import(location);
                return new URLResource(location, value);
            } catch (error) {
                throw new UnresolvedResource(location, error);
            }
        }
    };
    return LoaderClass as Constructable<ResourceLoader> & T;
};

/**
 * @class module:context.DefaultResourceLoader
 * @mixes module:context.AsModuleResourceLoader
 */
export class DefaultResourceLoader extends AsModuleResourceLoader(Null) {}
