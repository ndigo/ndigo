/**
 * @author Jeff Rose
 */
import { complement } from '@blue/util';
/**
 * A primitive is data that is not an object and has no methods.
 * @typedef {boolean | external:number | external:string | external:symbol | external:bigint | external:undefined} module:core.primitive
 * @see {@link https://developer.mozilla.org/en-US/docs/Glossary/Primitive}
 */
/**
 * @param {*} value
 * @returns {boolean} Whether or not a value is primitive
 * @see {@link primitive}
 */
export const isPrimitive = (value) => {
    switch (typeof value) {
        case 'bigint':
        case 'boolean':
        case 'number':
        case 'string':
        case 'symbol':
        case 'undefined':
            return true;
        case 'object':
            return value === null;
        default:
            return false;
    }
};
/**
 * @param {*} value
 * @returns {boolean} Whether or not a value is non-primitive
 * @see {@link primitive}
 */
export const isNotPrimitive = complement(isPrimitive);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJpbWl0aXZlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL3ByaW1pdGl2ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7R0FFRztBQUVILE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxZQUFZLENBQUM7QUFJeEM7Ozs7R0FJRztBQUVIOzs7O0dBSUc7QUFDSCxNQUFNLENBQUMsTUFBTSxXQUFXLEdBQUcsQ0FBQyxLQUFLLEVBQXNCLEVBQUU7SUFDckQsUUFBUSxPQUFPLEtBQUssRUFBRSxDQUFDO1FBQ25CLEtBQUssUUFBUSxDQUFDO1FBQ2QsS0FBSyxTQUFTLENBQUM7UUFDZixLQUFLLFFBQVEsQ0FBQztRQUNkLEtBQUssUUFBUSxDQUFDO1FBQ2QsS0FBSyxRQUFRLENBQUM7UUFDZCxLQUFLLFdBQVc7WUFDWixPQUFPLElBQUksQ0FBQztRQUNoQixLQUFLLFFBQVE7WUFDVCxPQUFPLEtBQUssS0FBSyxJQUFJLENBQUM7UUFDMUI7WUFDSSxPQUFPLEtBQUssQ0FBQztJQUNyQixDQUFDO0FBQ0wsQ0FBQyxDQUFDO0FBRUY7Ozs7R0FJRztBQUNILE1BQU0sQ0FBQyxNQUFNLGNBQWMsR0FBRyxVQUFVLENBQUMsV0FBVyxDQUErQixDQUFDIn0=