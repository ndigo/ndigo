/**
 * @author Jeff Rose
 */
import { isPrimitive } from './primitive';
import { equals, like } from '@blue/util';
/**
 */
/**
 * @param {*} value
 * @returns {boolean}
 */
/**
 * @typedef {module:core.Equatable | modeule:core.primitive} module:core.equatable
 */
/**
 * @param {*} value The value to be tested
 * @returns {boolean} Whether or not the `value` is {@link Equatable|Equatable}.
 */
export const likeEquatable = like({ equals: Function });
/**
 * @param {*} value1 The first value to be tested
 * @param {*} value2 The second value to be tested
 * @returns {Boolean} Whether or not the values are equal.
 */
export const equates = (value1, value2) => {
    if (likeEquatable(value1) && likeEquatable(value2)) {
        return value1.equals(value2);
    }
    else if (isPrimitive(value1) && isPrimitive(value2)) {
        return value1 === value2;
    }
    else {
        return equals(value1, value2);
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXF1YXRhYmxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2VxdWF0YWJsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7R0FFRztBQUVILE9BQU8sRUFBYSxXQUFXLEVBQUUsTUFBTSxhQUFhLENBQUM7QUFDckQsT0FBTyxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsTUFBTSxZQUFZLENBQUM7QUFRMUM7R0FDRztBQUVIOzs7R0FHRztBQUVIOztHQUVHO0FBRUg7OztHQUdHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sYUFBYSxHQUFHLElBQUksQ0FBQyxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsQ0FBa0MsQ0FBQztBQUV6Rjs7OztHQUlHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sT0FBTyxHQUFHLENBQUMsTUFBaUIsRUFBRSxNQUFpQixFQUFXLEVBQUU7SUFDckUsSUFBSSxhQUFhLENBQUMsTUFBTSxDQUFDLElBQUksYUFBYSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUM7UUFDakQsT0FBTyxNQUFNLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ2pDLENBQUM7U0FBTSxJQUFJLFdBQVcsQ0FBQyxNQUFNLENBQUMsSUFBSSxXQUFXLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQztRQUNwRCxPQUFPLE1BQU0sS0FBSyxNQUFNLENBQUM7SUFDN0IsQ0FBQztTQUFNLENBQUM7UUFDSixPQUFPLE1BQU0sQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLENBQUM7SUFDbEMsQ0FBQztBQUNMLENBQUMsQ0FBQyJ9