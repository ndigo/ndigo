/**
 * @author Jeff Rose
 */
import { isPrimitive } from './primitive';
import { equals } from '@blue/util/relation';
import { like } from '@blue/util/types';
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXF1YXRhYmxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2VxdWF0YWJsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7R0FFRztBQUVILE9BQU8sRUFBYSxXQUFXLEVBQUUsTUFBTSxhQUFhLENBQUM7QUFDckQsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLHFCQUFxQixDQUFDO0FBQzdDLE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxrQkFBa0IsQ0FBQztBQVF4QztHQUNHO0FBRUg7OztHQUdHO0FBRUg7O0dBRUc7QUFFSDs7O0dBR0c7QUFDSCxNQUFNLENBQUMsTUFBTSxhQUFhLEdBQUcsSUFBSSxDQUFDLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxDQUFrQyxDQUFDO0FBRXpGOzs7O0dBSUc7QUFDSCxNQUFNLENBQUMsTUFBTSxPQUFPLEdBQUcsQ0FBQyxNQUFpQixFQUFFLE1BQWlCLEVBQVcsRUFBRTtJQUNyRSxJQUFJLGFBQWEsQ0FBQyxNQUFNLENBQUMsSUFBSSxhQUFhLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQztRQUNqRCxPQUFPLE1BQU0sQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDakMsQ0FBQztTQUFNLElBQUksV0FBVyxDQUFDLE1BQU0sQ0FBQyxJQUFJLFdBQVcsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDO1FBQ3BELE9BQU8sTUFBTSxLQUFLLE1BQU0sQ0FBQztJQUM3QixDQUFDO1NBQU0sQ0FBQztRQUNKLE9BQU8sTUFBTSxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsQ0FBQztJQUNsQyxDQUFDO0FBQ0wsQ0FBQyxDQUFDIn0=