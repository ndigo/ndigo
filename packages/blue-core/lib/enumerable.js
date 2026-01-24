/**
 * @author Jeff Rose
 */
import { like } from '@blue/util';
/**
 * @interface module:core.Enumerable
 */
/**
 * @callback module:core.Enumerable~ForEachCallback
 * @param {*} value
 * @param {*} key
 * @param {Enumerable} list
 */
/**
 * @function module:core.Enumerable#entries
 * @returns {external:Iterator}
 */
/**
 * @function module:core.Enumerable#forEach
 * @param {module:core.Enumerable~ForEachCallback} callback
 * @param {*} [context]
 */
/**
 * @function module:core.Enumerable#keys
 * @returns {external:Iterator}
 */
/**
 * @function module:core.Enumerable#values
 * @returns {external:Iterator}
 */
/**
 * @interface module:core.AsyncEnumerable
 */
/**
 * @callback module:core.AsyncEnumerable~ForEachCallback
 * @param {*} value
 * @param {*} key
 * @param {EnumeraAsyncEnumerableble} list
 */
/**
 * @function module:core.AsyncEnumerable#entries
 * @returns {external:Iterator}
 */
/**
 * @function module:core.AsyncEnumerable#forEach
 * @param {module:core.AsyncEnumerable~ForEachCallback} callback
 * @param {*} [context]
 */
/**
 * @function module:core.AsyncEnumerable#keys
 * @returns {external:Iterator}
 */
/**
 * @function module:core.AsyncEnumerable#values
 * @returns {external:Iterator}
 */
/**
 * @function module:core.likeEnumerable
 * @param {*} value The value to be tested
 * @returns {external:boolean} Whether or not the `value` is {@linkcode module:core.Enumerable|Enumerable} or {@linkcode module:core.AsyncEnumerable|AsyncEnumerable}.
 */
export const likeEnumerable = like({ entries: Function, forEach: Function, keys: Function, values: Function });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW51bWVyYWJsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9lbnVtZXJhYmxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOztHQUVHO0FBRUgsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLFlBQVksQ0FBQztBQWdCbEM7O0dBRUc7QUFFSDs7Ozs7R0FLRztBQUVIOzs7R0FHRztBQUVIOzs7O0dBSUc7QUFFSDs7O0dBR0c7QUFFSDs7O0dBR0c7QUFFSDs7R0FFRztBQUVIOzs7OztHQUtHO0FBRUg7OztHQUdHO0FBRUg7Ozs7R0FJRztBQUVIOzs7R0FHRztBQUVIOzs7R0FHRztBQUVIOzs7O0dBSUc7QUFDSCxNQUFNLENBQUMsTUFBTSxjQUFjLEdBQUcsSUFBSSxDQUFDLEVBQUUsT0FBTyxFQUFFLFFBQVEsRUFBRSxPQUFPLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxDQUUvQyxDQUFDIn0=