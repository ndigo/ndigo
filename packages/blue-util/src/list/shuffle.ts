/**
 * @author Jeff Rose
 * @see {@link https://ramdajs.com/docs/}
 */

import randInt from '../math/rand-int';

/**
 * @function module:util.shuffle
 * @category List
 * @param {external:ArrayLike} list The list to be shuffled.
 * @returns {external:Array} The shuffled list.
 * @example
 * let list = [ "a", "b", "c" ];
 * shuffle( list );
 * //=> [ "c", "a", "b" ]
 * shuffle( list );
 * //=> [ "a", "c", "b" ]
 */
export default function shuffle<T = any>( list: ArrayLike<T> ): T[] {
    const
        length = list.length,
        result: T[] = [];
    let index = -1,
        position: number;

    while( ++index < length ){
        position = randInt( 0, index );
        result[ index ] = result[ position ];
        result[ position ] = list[ index ];
    }

    return result;
};
