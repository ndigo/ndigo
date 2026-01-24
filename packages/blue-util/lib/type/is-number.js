/**
 * @author Jeff Rose
 * @see {@link https://ramdajs.com/docs/}
 */
import { allPass, complement, is } from 'ramda';
const { isFinite, isNaN } = Number, isNotNaN = complement(isNaN), _isNumber = is(Number);
/**
 * Determines whether a given value is an actual finite number. The logic differs from `typeof`, which considers `NaN` and `Infinity` to be numbers and instances of `Number` to be objects.
 * @function module:util.isNumber
 * @category Type
 * @param {*} value The value to be tested.
 * @returns {external:boolean} Whether or not `value` is a number.
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
const isNumber = allPass([_isNumber, isNotNaN, isFinite]);
export default isNumber;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaXMtbnVtYmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3R5cGUvaXMtbnVtYmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7R0FHRztBQUVILE9BQU8sRUFBRSxPQUFPLEVBQUUsVUFBVSxFQUFFLEVBQUUsRUFBRSxNQUFNLE9BQU8sQ0FBQztBQUVoRCxNQUFNLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBRSxHQUFHLE1BQU0sRUFDOUIsUUFBUSxHQUFHLFVBQVUsQ0FBQyxLQUFLLENBQUMsRUFDNUIsU0FBUyxHQUFHLEVBQUUsQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUUzQjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0F1Qkc7QUFDSCxNQUFNLFFBQVEsR0FBRyxPQUFPLENBQUMsQ0FBQyxTQUFTLEVBQUUsUUFBUSxFQUFFLFFBQVEsQ0FBQyxDQUErQixDQUFDO0FBRXhGLGVBQWUsUUFBUSxDQUFDIn0=