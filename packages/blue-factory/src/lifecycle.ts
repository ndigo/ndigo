/**
 * @author Jeff Rose
 */
import { like } from '@blue/util';

export interface Destroyable {
    destroyed: boolean;
    destroy(): void;
}

export interface AsyncDestroyable extends Destroyable {
    destroy(): Promise<void>;
}

export interface Initializable {
    init( ...args: any[] ): void;
}

/**
 * @interface module:factory.Destroyable
 * @property {external:boolean} destroyed
 */

/**
 * @function module:factory.Destroyable#destroy
 */

/**
 * @interface module:factory.AsyncDestroyable
 * @extends module:factory.Destroyable
 */

/**
 * @function module:factory.AsyncDestroyable#destroy
 * @returns {external:Promise}
 */

/**
 * @interface module:factory.Initializable
 */

/**
 * @function module:factory.Initializable#init
 */

/**
 * @function module:factory.likeDestroyable
 * @param {*} value
 * @returns {external:boolean} Whether or not the `value` is {@linkcode module:factory.Destroyable|Destroyable}.
 */
export const likeDestroyable = like( { destroy: Function, destroyed: Boolean } ) as ( value ) => value is Destroyable;

/**
 * @function module:factory.likeInitializable
 * @param {*} value
 * @returns {external:boolean} Whether or not the `value` is {@linkcode module:factory.Initializable|Initializable}.
 */
export const likeInitializable = like( { init: Function } ) as ( value ) => value is Initializable;
