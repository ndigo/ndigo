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
 */
/**
 * @param {string} key
 * @param {string} language
 * @returns {string}
 */
/**
 * @extends module:content.Aware
 */
/**
 * @see module:content.AsContentSourceAware
 * @implements module:content.ContentSourceAware
 * @returns {module:content.Constructable<module:content.ContentSourceAware>}
 */
export declare const AsContentSourceAware: <T extends Constructable>(superclass: T) => Constructable<ContentSourceAware> & T;
/**
 * @param {*} value The value to be tested
 * @returns {boolean} Whether or not the `value` is {@link ContentSource|ContentSource}
 */
export declare const likeContentSource: (value: any) => value is ContentSource;
/**
 * @param {*} value The value to be tested
 * @returns {boolean} Whether or not the `value` is {@link ContentSourceAware|ContentSourceAware}
 */
export declare const likeContentSourceAware: (value: any) => value is ContentSourceAware;
//# sourceMappingURL=content.d.ts.map