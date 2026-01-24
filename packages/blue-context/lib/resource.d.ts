/**
 * @author Jeff Rose
 */
import { Aware } from '@blue/factory';
import { Constructable } from '@blue/core';
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
 * @mixin module:context.AsResourceLoaderAware
 * @implements module:context.ResourceLoaderAware
 * @returns {module:context.Constructable<module:context.ResourceLoaderAware>}
 */
export declare const AsResourceLoaderAware: <T extends Constructable>(superclass: T) => Constructable<ResourceLoaderAware> & T;
/**
 * @function module:context.likeResource
 * @param {*} value The value to be tested
 * @returns {external:boolean} Whether or not the `value` is {@linkcode module:context.Resource|Resource}
 */
export declare const likeResource: (value: any) => value is Resource;
/**
 * @function module:context.likeResourceLoader
 * @param {*} value The value to be tested
 * @returns {external:boolean} Whether or not the `value` is {@linkcode module:context.ResourceLoader|ResourceLoader}
 */
export declare const likeResourceLoader: (value: any) => value is ResourceLoader;
/**
 * @function module:context.likeResourceLoaderAware
 * @param {*} value The value to be tested
 * @returns {external:boolean} Whether or not the `value` is {@linkcode module:context.ResourceLoaderAware|ResourceLoaderAware}
 */
export declare const likeResourceLoaderAware: (value: any) => value is ResourceLoaderAware;
/**
 * @class module:context.URLResource
 */
export declare class URLResource<T = any> implements Resource<T> {
    readonly url: URL;
    readonly value: T;
    get exists(): boolean;
    constructor(path: string, value: T);
}
/**
 * @class module:context.UnresolvedResource
 * @implements module:context.Resource
 */
export declare class UnresolvedResource implements Resource<Error> {
    readonly value: Error;
    get exists(): boolean;
    constructor(path: string, value: Error);
}
/**
 * @mixin module:context.AsModuleResourceLoader
 * @implements module:context.ResourceLoader
 */
export declare const AsModuleResourceLoader: <T extends Constructable>(superclass: T) => Constructable<ResourceLoader> & T;
declare const DefaultResourceLoader_base: any;
/**
 * @class module:context.DefaultResourceLoader
 * @mixes module:context.AsModuleResourceLoader
 */
export declare class DefaultResourceLoader extends DefaultResourceLoader_base {
}
export {};
//# sourceMappingURL=resource.d.ts.map