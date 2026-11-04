/**
 * @module ndigo-util
 * @since 1.0.0
 * @author Jeff Rose
 */
/**
 * Determines whether a given value is an actual finite number. The logic differs from `typeof`, which considers `NaN` and `Infinity` to be numbers and instances of `Number` to be objects.
 * @category Type
 * @param {*} value The value to be tested.
 * @returns {boolean} Whether or not `value` is a number.
 * @example
 * typeof new Number( 1 ) === 'number';
 * //=> false
 * isNumber( new Number( 1 ) );
 * //=> true
 * typeof 2 === 'number';
 * //=> true
 * isNumber( 2 );
 * //=> true
 * typeof NaN === 'number';
 * //=> true
 * isNumber( NaN );
 * //=> false
 * typeof Infinity === 'number';
 * //=> true
 * isNumber( Infinity );
 * //=> false
 */
const isNumber = (value: unknown): value is number => {
    const n = typeof value === 'number' ? value : value instanceof Number ? value.valueOf() : NaN;
    return Number.isFinite(n);
};

export default isNumber;
