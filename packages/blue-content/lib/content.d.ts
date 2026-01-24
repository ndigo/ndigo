/**
 * @author Jeff Rose
 */
import { Constructable } from '@blue/core';
import { Aware } from '@blue/factory';
export interface ContentSource {
    getContent(key: string, language: string): string;
}
export interface ContentSourceAware extends Aware {
    setContentSource(contentSource: ContentSource): void;
}
/**
 * Strategy interface for resolving content.
 * @interface module:content.ContentSource
 */
/**
 * @function module:content.ContentSource#getContent
 * @param {external:string} key
 * @param {external:string} language
 * @returns {external:string}
 */
/**
 * @interface module:content.ContentSourceAware
 * @extends module:content.Aware
 */
/**
 * @mixin module:content.AsContentSourceAware
 * @implements module:content.ContentSourceAware
 * @returns {module:content.Constructable<module:content.ContentSourceAware>}
 */
export declare const AsContentSourceAware: <T extends Constructable>(superclass: T) => Constructable<ContentSourceAware> & T;
/**
 * @function module:content.likeContentSource
 * @param {*} value The value to be tested
 * @returns {external:boolean} Whether or not the `value` is {@linkcode module:content.ContentSource|ContentSource}
 */
export declare const likeContentSource: (value: any) => value is ContentSource;
/**
 * @function module:content.likeContentSourceAware
 * @param {*} value The value to be tested
 * @returns {external:boolean} Whether or not the `value` is {@linkcode module:content.ContentSourceAware|ContentSourceAware}
 */
export declare const likeContentSourceAware: (value: any) => value is ContentSourceAware;
//# sourceMappingURL=content.d.ts.map