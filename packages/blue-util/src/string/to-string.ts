/**
 * @module blue-util
 * @since 1.0.0
 * @author Jeff Rose
 */
import isString from '../type/is-string.js';

/**
 * Returns the string representation of the given value.
 *
 * `null` and `undefined` yield `''` and strings pass through unchanged. Any
 * object with a callable `toString` (own or inherited, including
 * `Array.prototype.toString`) is invoked with no arguments and its string
 * result returned — so user-defined constructor functions can provide a
 * suitable representation. Everything else falls back to `String(value)`.
 * For example:
 *
 *     function Point( x, y ){
 *       this.x = x;
 *       this.y = y;
 *     }
 *
 *     Point.prototype.toString = function(){
 *       return 'new Point(' + this.x + ', ' + this.y + ')';
 *     };
 *
 *     toString( new Point( 1, 2 ) ); //=> 'new Point(1, 2)'
 *
 * This is a display coercer, not a serializer: arrays become `'1,2,3'` and
 * plain objects `'[object Object]'`, which do not round-trip through `eval`.
 * Use `JSON.stringify` when you need a serialized representation.
 *
 * @category String
 * @param {*} value
 * @returns {string}
 * @example
 * toString( null );      //=> ''
 * toString( undefined ); //=> ''
 * toString( 42 );        //=> '42'
 * toString( 'abc' );     //=> 'abc'
 * toString( [ 1, 2, 3 ] ); //=> '1,2,3'
 * toString( { toString: () => 'foo' } ); //=> 'foo'
 * toString( { foo: 1, bar: 2 } ); //=> '[object Object]'
 */
function toString(value: unknown): string {
    if (value == null) return '';
    if (isString(value)) return value;
    if (typeof value === 'object' && value !== null) {
        const customToString = (value as { toString?: unknown }).toString;
        if (typeof customToString === 'function') {
            const custom: unknown = customToString.call(value);
            if (typeof custom === 'string') return custom;
        }
    }
    return String(value);
}

export default toString;
