/**
 * @author Jeff Rose
 */
import { like } from '@blue/util';
/**
 * @interface module:http.URLMatcher
 * @extends module:core.PatternMatcher
 */
/**
 * Given a full url, returns a {@linkcode module:core.Comparator|Comparator} suitable for sorting patterns in order of explicitness for that path.
 *
 * The approach used depends on the underlying implementation.
 * @function module:http.URLMatcher#getPatternComparator
 * @param {external:string} url The full url to use for comparison
 * @returns {module:core.Comparator} A comparator capable of sorting patterns in order of explicitness
 */
/**
 * Match the given `url` against the given `pattern`, according to this URLMatcher's matching strategy.
 * @function module:http.URLMatcher#match
 * @param {external:string} pattern The pattern to match against
 * @param {external:string} url The url to test
 * @returns {external:boolean} Whether or not the `url` matched.
 */
const { defineProperty } = Reflect;
/**
 * @function module:core.likeURLMatcher
 * @param {*} value
 * @returns {external:boolean} Whether or not the `value` is a {@linkcode module:http.URLMatcher|URLMatcher}.
 */
export const likeURLMatcher = like({ getPatternComparator: Function, match: Function });
class AbstractURLComparator {
    url;
    constructor(url) {
        defineProperty(this, 'url', {
            value: url,
            configurable: true,
            enumerable: false,
            writable: false,
        });
    }
}
/**
 * @abstract
 * @class module:http.AbstractURLComparator
 * @implements module:core.Comparator<external:string>
 */
/**
 * @class module:http.EqualsURLComparator
 * @extends module:http.AbstractURLComparator
 */
class EqualsURLComparator extends AbstractURLComparator {
    compare(pattern1, pattern2) {
        const { url } = this, pattern1EqualsURL = pattern1 === url, pattern2EqualsURL = pattern2 === url;
        if (pattern1EqualsURL && pattern2EqualsURL) {
            return 0;
        }
        else if (pattern1EqualsURL) {
            return -1;
        }
        else if (pattern2EqualsURL) {
            return 1;
        }
        return 0;
    }
}
/**
 * @class module:core.EqualsURLMatcher
 * @extends module:http.URLMatcher
 */
export class EqualsURLMatcher {
    getPatternComparator(path) {
        return new EqualsURLComparator(path);
    }
    match(pattern, url) {
        return pattern === url;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXJsLW1hdGNoZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvdXJsLW1hdGNoZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7O0dBRUc7QUFFSCxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sWUFBWSxDQUFDO0FBUWxDOzs7R0FHRztBQUVIOzs7Ozs7O0dBT0c7QUFFSDs7Ozs7O0dBTUc7QUFFSCxNQUFNLEVBQUUsY0FBYyxFQUFFLEdBQUcsT0FBTyxDQUFDO0FBRW5DOzs7O0dBSUc7QUFDSCxNQUFNLENBQUMsTUFBTSxjQUFjLEdBQUcsSUFBSSxDQUFDLEVBQUUsb0JBQW9CLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsQ0FFOUQsQ0FBQztBQUV6QixNQUFlLHFCQUFxQjtJQUN2QixHQUFHLENBQVM7SUFFckIsWUFBWSxHQUFXO1FBQ25CLGNBQWMsQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFO1lBQ3hCLEtBQUssRUFBRSxHQUFHO1lBQ1YsWUFBWSxFQUFFLElBQUk7WUFDbEIsVUFBVSxFQUFFLEtBQUs7WUFDakIsUUFBUSxFQUFFLEtBQUs7U0FDbEIsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztDQUdKO0FBRUQ7Ozs7R0FJRztBQUVIOzs7R0FHRztBQUNILE1BQU0sbUJBQW9CLFNBQVEscUJBQXFCO0lBQ25ELE9BQU8sQ0FBQyxRQUFnQixFQUFFLFFBQWdCO1FBQ3RDLE1BQU0sRUFBRSxHQUFHLEVBQUUsR0FBRyxJQUFJLEVBQ2hCLGlCQUFpQixHQUFHLFFBQVEsS0FBSyxHQUFHLEVBQ3BDLGlCQUFpQixHQUFHLFFBQVEsS0FBSyxHQUFHLENBQUM7UUFFekMsSUFBSSxpQkFBaUIsSUFBSSxpQkFBaUIsRUFBRSxDQUFDO1lBQ3pDLE9BQU8sQ0FBQyxDQUFDO1FBQ2IsQ0FBQzthQUFNLElBQUksaUJBQWlCLEVBQUUsQ0FBQztZQUMzQixPQUFPLENBQUMsQ0FBQyxDQUFDO1FBQ2QsQ0FBQzthQUFNLElBQUksaUJBQWlCLEVBQUUsQ0FBQztZQUMzQixPQUFPLENBQUMsQ0FBQztRQUNiLENBQUM7UUFFRCxPQUFPLENBQUMsQ0FBQztJQUNiLENBQUM7Q0FDSjtBQUVEOzs7R0FHRztBQUNILE1BQU0sT0FBTyxnQkFBZ0I7SUFDekIsb0JBQW9CLENBQUMsSUFBWTtRQUM3QixPQUFPLElBQUksbUJBQW1CLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDekMsQ0FBQztJQUVELEtBQUssQ0FBQyxPQUFlLEVBQUUsR0FBVztRQUM5QixPQUFPLE9BQU8sS0FBSyxHQUFHLENBQUM7SUFDM0IsQ0FBQztDQUNKIn0=