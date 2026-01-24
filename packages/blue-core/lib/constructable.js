/**
 * @author Jeff Rose
 */
import { like } from '@blue/util';
/**
 * @interface module:core.Constructable
 * @property {T} [prototype]
 */
/**
 * @function module:core.likeConstructable
 * @param {*} value
 * @returns {external:boolean} Whether or not the `value` is {@linkcode module:core.Constructable|Constructable}.
 * @todo This is actually not a great test since prototype is optional - JBR
 */
export const likeConstructable = like({ prototype: Object });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uc3RydWN0YWJsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9jb25zdHJ1Y3RhYmxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOztHQUVHO0FBRUgsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLFlBQVksQ0FBQztBQUlsQzs7O0dBR0c7QUFFSDs7Ozs7R0FLRztBQUNILE1BQU0sQ0FBQyxNQUFNLGlCQUFpQixHQUFHLElBQUksQ0FBQyxFQUFFLFNBQVMsRUFBRSxNQUFNLEVBQUUsQ0FBMkMsQ0FBQyJ9