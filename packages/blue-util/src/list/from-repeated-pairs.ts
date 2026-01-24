/**
 * @author Jeff Rose
 * @see {@link https://ramdajs.com/docs/}
 */

/**
 * Creates a new object from a list key-value pairs. If a key appears in multiple pairs, the corresponding value will be an array.
 * @function module:util.fromRepeatedPairs
 * @category List
 * @see {@link module:util.fromPairs}
 * @see {@link module:util.pair}
 * @see {@link module:util.toPairs}
 */
const fromRepeatedPairs = ( pairs: [ any, any ][] ): { any?: any | any[] } => {
    const result = {};
    let index = 0;
    while( index < pairs.length ){
        const [ key, value ] = pairs[ index ];
        if( !( result.hasOwnProperty( key ) ) ){
            result[ key ] = value;
        } else if( Array.isArray( result[ key ] ) ){
            result[ key ].push( value );
        } else {
            result[ key ] = [ result[ key ], value ];
        }
        index += 1;
    }
    return result;
};

export default fromRepeatedPairs;
