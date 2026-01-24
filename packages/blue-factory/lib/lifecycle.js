/**
 * @author Jeff Rose
 */
import { like } from '@blue/util';
/**
 * @interface module:factory.Destroyable
 * @property {external:boolean} destroyed
 */
/**
 * @function module:factory.Destroyable#destroy
 */
/**
 * @interface module:factory.AsyncDestroyable
 * @extends module:factory.Destroyable
 */
/**
 * @function module:factory.AsyncDestroyable#destroy
 * @returns {external:Promise}
 */
/**
 * @interface module:factory.Initializable
 */
/**
 * @function module:factory.Initializable#init
 */
/**
 * @function module:factory.likeDestroyable
 * @param {*} value
 * @returns {external:boolean} Whether or not the `value` is {@linkcode module:factory.Destroyable|Destroyable}.
 */
export const likeDestroyable = like({ destroy: Function, destroyed: Boolean });
/**
 * @function module:factory.likeInitializable
 * @param {*} value
 * @returns {external:boolean} Whether or not the `value` is {@linkcode module:factory.Initializable|Initializable}.
 */
export const likeInitializable = like({ init: Function });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlmZWN5Y2xlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2xpZmVjeWNsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7R0FFRztBQUNILE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxZQUFZLENBQUM7QUFlbEM7OztHQUdHO0FBRUg7O0dBRUc7QUFFSDs7O0dBR0c7QUFFSDs7O0dBR0c7QUFFSDs7R0FFRztBQUVIOztHQUVHO0FBRUg7Ozs7R0FJRztBQUNILE1BQU0sQ0FBQyxNQUFNLGVBQWUsR0FBRyxJQUFJLENBQUMsRUFBRSxPQUFPLEVBQUUsUUFBUSxFQUFFLFNBQVMsRUFBRSxPQUFPLEVBQUUsQ0FBb0MsQ0FBQztBQUVsSDs7OztHQUlHO0FBQ0gsTUFBTSxDQUFDLE1BQU0saUJBQWlCLEdBQUcsSUFBSSxDQUFDLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxDQUFzQyxDQUFDIn0=