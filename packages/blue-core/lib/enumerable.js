/**
 * @author Jeff Rose
 */
import { like } from '@blue/util/types';
/**
 */
/**
 * @callback module:core.Enumerable~ForEachCallback
 * @param {*} value
 * @param {*} key
 * @param {Enumerable} list
 */
/**
 * @returns {Iterator}
 */
/**
 * @param {module:core.Enumerable~ForEachCallback} callback
 * @param {*} [context]
 */
/**
 * @returns {Iterator}
 */
/**
 * @returns {Iterator}
 */
/**
 */
/**
 * @callback module:core.AsyncEnumerable~ForEachCallback
 * @param {*} value
 * @param {*} key
 * @param {EnumeraAsyncEnumerableble} list
 */
/**
 * @returns {Iterator}
 */
/**
 * @param {module:core.AsyncEnumerable~ForEachCallback} callback
 * @param {*} [context]
 */
/**
 * @returns {Iterator}
 */
/**
 * @returns {Iterator}
 */
/**
 * @param {*} value The value to be tested
 * @returns {boolean} Whether or not the `value` is {@link Enumerable|Enumerable} or {@link AsyncEnumerable|AsyncEnumerable}.
 */
export const likeEnumerable = like({ entries: Function, forEach: Function, keys: Function, values: Function });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW51bWVyYWJsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9lbnVtZXJhYmxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOztHQUVHO0FBRUgsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLGtCQUFrQixDQUFDO0FBZ0J4QztHQUNHO0FBRUg7Ozs7O0dBS0c7QUFFSDs7R0FFRztBQUVIOzs7R0FHRztBQUVIOztHQUVHO0FBRUg7O0dBRUc7QUFFSDtHQUNHO0FBRUg7Ozs7O0dBS0c7QUFFSDs7R0FFRztBQUVIOzs7R0FHRztBQUVIOztHQUVHO0FBRUg7O0dBRUc7QUFFSDs7O0dBR0c7QUFDSCxNQUFNLENBQUMsTUFBTSxjQUFjLEdBQUcsSUFBSSxDQUFDLEVBQUUsT0FBTyxFQUFFLFFBQVEsRUFBRSxPQUFPLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxDQUUvQyxDQUFDIn0=