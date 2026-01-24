/**
 * @author Jeff Rose
 */

import { like } from '@blue/util';
import { Constructable } from '@blue/core';
import { likeAwareAnd, Aware, AsAware } from '@blue/factory';

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
export const AsContentSourceAware = <T extends Constructable>(superclass: T): Constructable<ContentSourceAware> & T =>
    class extends AsAware(superclass) implements ContentSourceAware {
        contentSource: ContentSource;

        setContentSource(contentSource: ContentSource): void {
            Reflect.defineProperty(this, 'contentSource', {
                value: contentSource,
                configurable: true,
                enumerable: false,
                writable: false,
            });
        }
    };

/**
 * @function module:content.likeContentSource
 * @param {*} value The value to be tested
 * @returns {external:boolean} Whether or not the `value` is {@linkcode module:content.ContentSource|ContentSource}
 */
export const likeContentSource = like({ getContent: Function }) as (value) => value is ContentSource;

/**
 * @function module:content.likeContentSourceAware
 * @param {*} value The value to be tested
 * @returns {external:boolean} Whether or not the `value` is {@linkcode module:content.ContentSourceAware|ContentSourceAware}
 */
export const likeContentSourceAware = likeAwareAnd(like({ setContentSource: Function })) as (
    value
) => value is ContentSourceAware;
