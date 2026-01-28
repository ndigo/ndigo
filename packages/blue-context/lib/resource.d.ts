/**
 * @author Jeff Rose
 */
import { Aware } from '@blue/factory';
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
 * @see module:context.AsResourceLoaderAware
 * @implements module:context.ResourceLoaderAware
 * @returns {module:context.Constructable<module:context.ResourceLoaderAware>}
 */
export declare const AsResourceLoaderAware: <T extends Constructable>(superclass: T) => Constructable<ResourceLoaderAware> & T;
/**
 * @param {*} value The value to be tested
 * @returns {boolean} Whether or not the `value` is {@link Resource|Resource}
 */
export declare const likeResource: (value: any) => value is Resource;
/**
 * @param {*} value The value to be tested
 * @returns {boolean} Whether or not the `value` is {@link ResourceLoader|ResourceLoader}
 */
export declare const likeResourceLoader: (value: any) => value is ResourceLoader;
/**
 * @param {*} value The value to be tested
 * @returns {boolean} Whether or not the `value` is {@link ResourceLoaderAware|ResourceLoaderAware}
 */
export declare const likeResourceLoaderAware: (value: any) => value is ResourceLoaderAware;
/**
 */
export declare class URLResource<T = any> implements Resource<T> {
    readonly url: URL;
    readonly value: T;
    get exists(): boolean;
    constructor(path: string, value: T);
}
/**
 * @implements module:context.Resource
 */
export declare class UnresolvedResource implements Resource<Error> {
    readonly value: Error;
    get exists(): boolean;
    constructor(path: string, value: Error);
}
/**
 * @see module:context.AsModuleResourceLoader
 * @implements module:context.ResourceLoader
 */
export declare const AsModuleResourceLoader: <T extends Constructable>(superclass: T) => Constructable<ResourceLoader> & T;
declare const DefaultResourceLoader_base: Constructable<ResourceLoader> & typeof Null;
/**
 * @see module:context.AsModuleResourceLoader
 */
export declare class DefaultResourceLoader extends DefaultResourceLoader_base {
}
export {};
//# sourceMappingURL=resource.d.ts.map