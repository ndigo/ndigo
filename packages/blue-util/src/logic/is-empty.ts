/**
 * @author Jeff Rose
 */

import { isEmpty as _isEmpty, equals, pipe } from 'ramda';
import empty from '../function/empty';

/**
 * Returns `true` if the given value is its type's empty value; `false` otherwise.
 * @function module:util.isEmpty
 * @returns {external:boolean}
 * @category Logic
 * @example
 * isEmpty( [ 1, 2, 3 ] );           //=> false
 * isEmpty( [] );                    //=> true
 * isEmpty( '' );                    //=> true
 * isEmpty( null );                  //=> false
 * isEmpty( {} );                    //=> true
 * isEmpty( { length: 0 } );         //=> false
 * isEmpty( Uint8Array.from( '' ) ); //=> true
 */
const isEmpty = ( x ): boolean => {
    let result = _isEmpty( x );
    if( x != null && result === false ){
        result = pipe( empty, equals( x ) )( x );
    }
    return result;
};

export default isEmpty;
