/**
 * @author Jeff Rose
 */
import { isPrimitive } from './primitive';
import { equals, like } from '@blue/util';
/**
 * @interface module:core.Equatable
 */
/**
 * @function module.core.Equatable#equal
 * @param {*} value
 * @returns {external:boolean}
 */
/**
 * @typedef {module:core.Equatable | modeule:core.primitive} module:core.equatable
 */
/**
 * @function module:core.likeEquatable
 * @param {*} value The value to be tested
 * @returns {external:boolean} Whether or not the `value` is {@linkcode module:core.Equatable|Equatable}.
 */
export const likeEquatable = like({ equals: Function });
/**
 * @function module:core.equates
 * @param {*} value1 The first value to be tested
 * @param {*} value2 The second value to be tested
 * @returns {external:Boolean} Whether or not the values are equal.
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXF1YXRhYmxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2VxdWF0YWJsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7R0FFRztBQUVILE9BQU8sRUFBYSxXQUFXLEVBQUUsTUFBTSxhQUFhLENBQUM7QUFDckQsT0FBTyxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsTUFBTSxZQUFZLENBQUM7QUFRMUM7O0dBRUc7QUFFSDs7OztHQUlHO0FBRUg7O0dBRUc7QUFFSDs7OztHQUlHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sYUFBYSxHQUFHLElBQUksQ0FBQyxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsQ0FBa0MsQ0FBQztBQUV6Rjs7Ozs7R0FLRztBQUNILE1BQU0sQ0FBQyxNQUFNLE9BQU8sR0FBRyxDQUFDLE1BQWlCLEVBQUUsTUFBaUIsRUFBVyxFQUFFO0lBQ3JFLElBQUksYUFBYSxDQUFDLE1BQU0sQ0FBQyxJQUFJLGFBQWEsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDO1FBQ2pELE9BQU8sTUFBTSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUNqQyxDQUFDO1NBQU0sSUFBSSxXQUFXLENBQUMsTUFBTSxDQUFDLElBQUksV0FBVyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUM7UUFDcEQsT0FBTyxNQUFNLEtBQUssTUFBTSxDQUFDO0lBQzdCLENBQUM7U0FBTSxDQUFDO1FBQ0osT0FBTyxNQUFNLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFDO0lBQ2xDLENBQUM7QUFDTCxDQUFDLENBQUMifQ==