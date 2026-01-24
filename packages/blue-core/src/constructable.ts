/**
 * @author Jeff Rose
 */

import { like } from '@blue/util';

export type Constructable<T = {}> = new (...args: any[]) => T;

/**
 * @interface module:core.Constructable
 * @property {T} [prototype]
 */

/**
 * @function module:core.likeConstructable
 * @param {*} value
 * @returns {external:boolean} Whether or not the `value` is {@linkcode module:core.Constructable|Constructable}.
 * @todo This is actually not a great test since prototype is optional - JBR
 */
export const likeConstructable = like({ prototype: Object }) as (value: any) => value is Constructable;
