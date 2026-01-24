/**
 * @author Jeff Rose
 */
import { complement } from '@blue/util';
/**
 * A primitive is data that is not an object and has no methods.
 * @typedef {external:boolean | external:number | external:string | external:symbol | external:bigint | external:undefined} module:core.primitive
 * @see {@link https://developer.mozilla.org/en-US/docs/Glossary/Primitive}
 */
/**
 * @function module:core.isPrimitive
 * @param {*} value
 * @returns {external:boolean} Whether or not a value is primitive
 * @see {@link module:core.primitive}
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
 * @function module:core.isNotPrimitive
 * @param {*} value
 * @returns {external:boolean} Whether or not a value is non-primitive
 * @see {@link module:core.primitive}
 */
export const isNotPrimitive = complement(isPrimitive);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJpbWl0aXZlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL3ByaW1pdGl2ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7R0FFRztBQUVILE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxZQUFZLENBQUM7QUFJeEM7Ozs7R0FJRztBQUVIOzs7OztHQUtHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sV0FBVyxHQUFHLENBQUMsS0FBSyxFQUFzQixFQUFFO0lBQ3JELFFBQVEsT0FBTyxLQUFLLEVBQUUsQ0FBQztRQUNuQixLQUFLLFFBQVEsQ0FBQztRQUNkLEtBQUssU0FBUyxDQUFDO1FBQ2YsS0FBSyxRQUFRLENBQUM7UUFDZCxLQUFLLFFBQVEsQ0FBQztRQUNkLEtBQUssUUFBUSxDQUFDO1FBQ2QsS0FBSyxXQUFXO1lBQ1osT0FBTyxJQUFJLENBQUM7UUFDaEIsS0FBSyxRQUFRO1lBQ1QsT0FBTyxLQUFLLEtBQUssSUFBSSxDQUFDO1FBQzFCO1lBQ0ksT0FBTyxLQUFLLENBQUM7SUFDckIsQ0FBQztBQUNMLENBQUMsQ0FBQztBQUVGOzs7OztHQUtHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sY0FBYyxHQUFHLFVBQVUsQ0FBQyxXQUFXLENBQStCLENBQUMifQ==