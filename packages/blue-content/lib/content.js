/**
 * @author Jeff Rose
 */
import { like } from '@blue/util';
import { likeAwareAnd, AsAware } from '@blue/factory';
/**
 * Strategy interface for resolving content.
 */
/**
 * @param {string} key
 * @param {string} language
 * @returns {string}
 */
/**
 * @extends module:content.Aware
 */
/**
 * @see module:content.AsContentSourceAware
 * @implements module:content.ContentSourceAware
 * @returns {module:content.Constructable<module:content.ContentSourceAware>}
 */
export const AsContentSourceAware = (superclass) => class extends AsAware(superclass) {
    contentSource;
    setContentSource(contentSource) {
        Reflect.defineProperty(this, 'contentSource', {
            value: contentSource,
            configurable: true,
            enumerable: false,
            writable: false,
        });
    }
};
/**
 * @param {*} value The value to be tested
 * @returns {boolean} Whether or not the `value` is {@link ContentSource|ContentSource}
 */
export const likeContentSource = like({ getContent: Function });
/**
 * @param {*} value The value to be tested
 * @returns {boolean} Whether or not the `value` is {@link ContentSourceAware|ContentSourceAware}
 */
export const likeContentSourceAware = likeAwareAnd(like({ setContentSource: Function }));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udGVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9jb250ZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOztHQUVHO0FBRUgsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLFlBQVksQ0FBQztBQUVsQyxPQUFPLEVBQUUsWUFBWSxFQUFTLE9BQU8sRUFBRSxNQUFNLGVBQWUsQ0FBQztBQVU3RDs7R0FFRztBQUVIOzs7O0dBSUc7QUFFSDs7R0FFRztBQUVIOzs7O0dBSUc7QUFDSCxNQUFNLENBQUMsTUFBTSxvQkFBb0IsR0FBRyxDQUEwQixVQUFhLEVBQXlDLEVBQUUsQ0FDbEgsS0FBTSxTQUFRLE9BQU8sQ0FBQyxVQUFVLENBQUM7SUFDN0IsYUFBYSxDQUFnQjtJQUU3QixnQkFBZ0IsQ0FBQyxhQUE0QjtRQUN6QyxPQUFPLENBQUMsY0FBYyxDQUFDLElBQUksRUFBRSxlQUFlLEVBQUU7WUFDMUMsS0FBSyxFQUFFLGFBQWE7WUFDcEIsWUFBWSxFQUFFLElBQUk7WUFDbEIsVUFBVSxFQUFFLEtBQUs7WUFDakIsUUFBUSxFQUFFLEtBQUs7U0FDbEIsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztDQUNKLENBQUM7QUFFTjs7O0dBR0c7QUFDSCxNQUFNLENBQUMsTUFBTSxpQkFBaUIsR0FBRyxJQUFJLENBQUMsRUFBRSxVQUFVLEVBQUUsUUFBUSxFQUFFLENBQXNDLENBQUM7QUFFckc7OztHQUdHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sc0JBQXNCLEdBQUcsWUFBWSxDQUFDLElBQUksQ0FBQyxFQUFFLGdCQUFnQixFQUFFLFFBQVEsRUFBRSxDQUFDLENBRXZELENBQUMifQ==