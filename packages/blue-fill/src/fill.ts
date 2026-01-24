/**
 * @author Jeff Rose
 */

import has, { resetDetector } from '@blue/has';
import fills from './fills';

/**
 * @function module:fill.fill
 * @param {external:string|exteral:Array<external:string>} id
 * @param {external:Function} onMissing
 * @param {external:Function} [onFound=null]
 */
const fill = ( id: string | string[], onMissing: Function, onFound: Function = null ) => {
    // * This code block written with convenience, not efficiency or performance, in mind. It would
    // * likely be more efficient to have different code paths based on whether id is a string or
    // * array of strings instead of just converting everything into an array of strings. -JBR
    if( typeof id === 'string' ){
        id = [ id ];
    }

    const hasId = id.reduce( ( sum, value ) => sum && has[ value ], true );

    if( !hasId ){
        onMissing();

        const length = id.length;
        for( let index = 0; index < length; index++ ){
            fills.push( id[ index ] );
            resetDetector( id[ index ] );
        }
    } else if( onFound ){
        onFound();
    }
};

export default fill;
