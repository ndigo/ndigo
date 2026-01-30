/**
 * @author Jeff Rose
 */
import { like } from '@blue/util/types';

export interface Destroyable {
    destroyed: boolean;
    destroy(): void;
}

export interface AsyncDestroyable extends Destroyable {
    destroy(): Promise<void>;
}

export interface Initializable {
    init(...args: any[]): void;
}

/**
 * @property {boolean} destroyed
 */

/**
 */

/**
 * @extends module:factory.Destroyable
 */

/**
 * @returns {Promise}
 */

/**
 */

/**
 */

/**
 * @param {*} value
 * @returns {boolean} Whether or not the `value` is {@link Destroyable|Destroyable}.
 */
export const likeDestroyable = like({ destroy: Function, destroyed: Boolean }) as (value) => value is Destroyable;

/**
 * @param {*} value
 * @returns {boolean} Whether or not the `value` is {@link Initializable|Initializable}.
 */
export const likeInitializable = like({ init: Function }) as (value) => value is Initializable;
