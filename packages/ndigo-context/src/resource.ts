/**
 * Resource loading abstractions and implementations.
 */
import { AsAware, Aware } from '@ndigo/factory';
import { like } from '@ndigo/util/types';

import { Constructable, Null } from '@ndigo/core';

/**
 * Reads a file's text content, or `null` when the file does not exist.
 *
 * The config-file seam (AD-13 Q1) keeps `@ndigo/boot` isomorphic:
 * `@ndigo/platform-node` supplies an `fs`-backed implementation; browsers and
 * specs pass none (files skipped / fake reader). Return `null` for missing
 * files — do not throw. Lives here (the shared core) so both `@ndigo/boot` and
 * `@ndigo/platform-node` reference the same seam type.
 */
export type ConfigFileReader = (path: string) => Promise<string | null>;

/**
 * Represents a resolved resource handle and its loaded value.
 */
export interface Resource<T = unknown> {
    /** Whether the resource exists. */
    readonly exists: boolean;
    /** The loaded value. */
    readonly value: T;
}

/**
 * Loads resources from a location string.
 */
export interface ResourceLoader {
    /** Returns a resource handle for the location. @param location - The resource location. */
    getResource(location: string): Promise<Resource>;
}

/**
 * Receives a resource loader during initialization.
 */
export interface ResourceLoaderAware extends Aware {
    /** Sets the resource loader. @param loader - The loader. */
    setResourceLoader(loader: ResourceLoader): void;
}

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
 */

/**
 * Return a Resource handle for the specified resource location.
 *
 * Note that a Resource handle does not imply an existing resource; you need to invoke {@link Resource#exists|Resource#exists} to check for existence.
 * @param location - The resource location
 * @returns A resource handle for the specified resource location.
 */

const { defineProperty } = Reflect,
    startsWithProtocol = /^(?:[a-z]+:)?\/\//i,
    isAbsoluteURL = (value: string) => startsWithProtocol.test(value);

/**
 * @see module:context.AsResourceLoaderAware
 */
export const AsResourceLoaderAware = <T extends Constructable>(superclass: T): Constructable<ResourceLoaderAware> & T =>
    class extends AsAware(superclass) implements ResourceLoaderAware {
        loader!: ResourceLoader;

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
 * Returns whether a value behaves like a resource.
 *
 * @param value - The value to test.
 * @returns `true` when the value looks like a resource.
 */
export const likeResource = like({ exists: Boolean }) as (value: unknown) => value is Resource;

/**
 * Returns whether a value behaves like a resource loader.
 *
 * @param value - The value to test.
 * @returns `true` when the value looks like a resource loader.
 */
export const likeResourceLoader = like({ getResource: Function }) as (value: unknown) => value is ResourceLoader;

/**
 * Returns whether a value can receive a resource loader.
 *
 * @param value - The value to test.
 * @returns `true` when the value looks like resource-loader aware.
 */
export const likeResourceLoaderAware = like({ setResourceLoader: Function }) as (
    value: unknown
) => value is ResourceLoaderAware;

/**
 * Resource implementation backed by a URL.
 */
export class URLResource<T = unknown> implements Resource<T> {
    /** The resolved URL. */
    readonly url!: URL;
    /** The loaded value. */
    readonly value!: T;

    /** Whether the resource exists (always `true` for URL resources). */
    get exists(): boolean {
        return true;
    }

    constructor(path: string, value: T) {
        const base = typeof location !== 'undefined' ? location.href : 'http://localhost/';
        const url = isAbsoluteURL(path) ? new URL(path) : new URL(path, base);

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
 * Resource wrapper used when loading fails.
 */
export class UnresolvedResource implements Resource<Error> {
    /** The load error. */
    readonly value!: Error;

    /** Whether the resource exists (always `false`). */
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
 * Mixin that resolves a resource by dynamic `import()` of its location, so a
 * resource module is loaded on demand. A failed import is wrapped in
 * `UnresolvedResource` rather than surfacing the loader error.
 */
export const AsModuleResourceLoader = <T extends Constructable>(superclass: T): Constructable<ResourceLoader> & T => {
    // TypeScript 5.7 requires explicit type assertion for mixin pattern
    const LoaderClass = class extends (superclass as new (...args: never[]) => object) implements ResourceLoader {
        async getResource(location: string): Promise<Resource> {
            try {
                const value = await import(/* @vite-ignore */ location);
                return new URLResource(location, value);
            } catch (error) {
                throw new UnresolvedResource(location, error as Error);
            }
        }
    };
    return LoaderClass as Constructable<ResourceLoader> & T;
};

/**
 * @see module:context.AsModuleResourceLoader
 * @param superclass - The base class to extend.
 * @returns A resource-loader mixin applied to the base class.
 */
/**
 * Resource loader that resolves modules through dynamic import.
 */
export class DefaultResourceLoader extends AsModuleResourceLoader(Null) {}

/**
 * Resource loader backed by an in-memory map of location to value.
 *
 * Useful for tests, browser rendering with bundled content, and prototypes
 * where resource content is known at construction time.
 *
 * @example
 * ```ts
 * const loader = new InMemoryResourceLoader();
 * loader.set('app.js', 'console.log("hi")');
 * const resource = await loader.getResource('app.js');
 * resource.value; // 'console.log("hi")'
 * ```
 */
export class InMemoryResourceLoader implements ResourceLoader {
    readonly #sources = new Map<string, unknown>();

    /**
     * Register a resource value under the given location.
     *
     * @param location - The resource location to register.
     * @param value - The resource content.
     * @returns This loader, for chaining.
     */
    set(location: string, value: unknown): this {
        this.#sources.set(location, value);
        return this;
    }

    /** {@inheritDoc ResourceLoader#getResource} @param location - The resource location. */
    async getResource(location: string): Promise<Resource> {
        const value = this.#sources.get(location);
        if (value === undefined) {
            return new UnresolvedResource(location, new Error(`No resource registered for: ${location}`));
        }
        return new InMemoryResource(location, value);
    }
}

/**
 * Resource wrapper holding a value registered in an {@link InMemoryResourceLoader}.
 */
class InMemoryResource implements Resource {
    readonly value!: unknown;

    get exists(): boolean {
        return true;
    }

    constructor(location: string, value: unknown) {
        defineProperty(this, 'location', {
            value: location,
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
