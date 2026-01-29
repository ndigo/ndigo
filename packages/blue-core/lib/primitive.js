/**
 * @author Jeff Rose
 */
import { complement } from '@blue/util/logic';
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJpbWl0aXZlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL3ByaW1pdGl2ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7R0FFRztBQUVILE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxrQkFBa0IsQ0FBQztBQUk5Qzs7OztHQUlHO0FBRUg7Ozs7R0FJRztBQUNILE1BQU0sQ0FBQyxNQUFNLFdBQVcsR0FBRyxDQUFDLEtBQUssRUFBc0IsRUFBRTtJQUNyRCxRQUFRLE9BQU8sS0FBSyxFQUFFLENBQUM7UUFDbkIsS0FBSyxRQUFRLENBQUM7UUFDZCxLQUFLLFNBQVMsQ0FBQztRQUNmLEtBQUssUUFBUSxDQUFDO1FBQ2QsS0FBSyxRQUFRLENBQUM7UUFDZCxLQUFLLFFBQVEsQ0FBQztRQUNkLEtBQUssV0FBVztZQUNaLE9BQU8sSUFBSSxDQUFDO1FBQ2hCLEtBQUssUUFBUTtZQUNULE9BQU8sS0FBSyxLQUFLLElBQUksQ0FBQztRQUMxQjtZQUNJLE9BQU8sS0FBSyxDQUFDO0lBQ3JCLENBQUM7QUFDTCxDQUFDLENBQUM7QUFFRjs7OztHQUlHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sY0FBYyxHQUFHLFVBQVUsQ0FBQyxXQUFXLENBQStCLENBQUMifQ==