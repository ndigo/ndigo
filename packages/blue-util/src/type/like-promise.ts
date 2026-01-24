/**
 * @author Jeff Rose
 * @see {@link https://ramdajs.com/docs/}
 */

import like from './like';

const
    /**
     * Determines whether a given object is thenable, i.e. has a `then` method.
     * @function module:util.likePromise
     * @category Type
     * @param {*} value The value to be tested.
     * @returns {external:boolean} Whether or not `value` is thenable.
     * @example
     * const promise = new Promise( ... );
     * likePromise( promise );
     * //=> true
     * likePromise( { then: function(){} } );
     * //=> true
     * likePromise( {} );
     * //=> false
     */
    likePromise = like( { then: Function } ) as ( value ) => value is PromiseLike<any>;

export default likePromise;
