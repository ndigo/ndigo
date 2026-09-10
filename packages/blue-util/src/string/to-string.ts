import isString from '../type/is-string.js';

/**
 * Returns the string representation of the given value. `eval`'ing the output
 * should result in a value equivalent to the input value. Many of the built-in
 * `toString` methods do not satisfy this requirement.
 *
 * If the given value is an `[object Object]` with a `toString` method other
 * than `Object.prototype.toString`, this method is invoked with no arguments
 * to produce the return value. This means user-defined constructor functions
 * can provide a suitable `toString` method. For example:
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
 * @category String
 * @param {*} value
 * @returns {string}
 * @example
 * toString( null );
 * //=> ""
 * toString( undefined );
 * //=> ""
 * toString( 42 );
 * //=> '42'
 * toString( 'abc' );
 * //=> "abc"
 * toString( [ 1, 2, 3 ] );
 * //=> '[ 1, 2, 3 ]'
 * toString( { toString: () => 'foo' } );
 * //=> "foo"
 * toString( { foo: 1, bar: 2, baz: 3 } );
 * //=> '{ "bar": 2, "baz": 3, "foo": 1 }'
 * toString( new Date('2001-02-03T04:05:06Z' ) );
 * //=> 'new Date( "2001-02-03T04:05:06.000Z" )'
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
