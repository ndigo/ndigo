/**
 * @author Jeff Rose
 */
import { like } from '@blue/util';
/**
 * @extends module:core.PatternMatcher
 */
/**
 * Given a full url, returns a {@link Comparator|Comparator} suitable for sorting patterns in order of explicitness for that path.
 *
 * The approach used depends on the underlying implementation.
 * @param {string} url The full url to use for comparison
 * @returns {module:core.Comparator} A comparator capable of sorting patterns in order of explicitness
 */
/**
 * Match the given `url` against the given `pattern`, according to this URLMatcher's matching strategy.
 * @param {string} pattern The pattern to match against
 * @param {string} url The url to test
 * @returns {boolean} Whether or not the `url` matched.
 */
const { defineProperty } = Reflect;
/**
 * @param {*} value
 * @returns {boolean} Whether or not the `value` is a {@link URLMatcher|URLMatcher}.
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
 * @implements module:core.Comparator<external:string>
 */
/**
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXJsLW1hdGNoZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvdXJsLW1hdGNoZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7O0dBRUc7QUFFSCxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sWUFBWSxDQUFDO0FBUWxDOztHQUVHO0FBRUg7Ozs7OztHQU1HO0FBRUg7Ozs7O0dBS0c7QUFFSCxNQUFNLEVBQUUsY0FBYyxFQUFFLEdBQUcsT0FBTyxDQUFDO0FBRW5DOzs7R0FHRztBQUNILE1BQU0sQ0FBQyxNQUFNLGNBQWMsR0FBRyxJQUFJLENBQUMsRUFBRSxvQkFBb0IsRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRSxDQUU5RCxDQUFDO0FBRXpCLE1BQWUscUJBQXFCO0lBQ3ZCLEdBQUcsQ0FBUztJQUVyQixZQUFZLEdBQVc7UUFDbkIsY0FBYyxDQUFDLElBQUksRUFBRSxLQUFLLEVBQUU7WUFDeEIsS0FBSyxFQUFFLEdBQUc7WUFDVixZQUFZLEVBQUUsSUFBSTtZQUNsQixVQUFVLEVBQUUsS0FBSztZQUNqQixRQUFRLEVBQUUsS0FBSztTQUNsQixDQUFDLENBQUM7SUFDUCxDQUFDO0NBR0o7QUFFRDs7O0dBR0c7QUFFSDs7R0FFRztBQUNILE1BQU0sbUJBQW9CLFNBQVEscUJBQXFCO0lBQ25ELE9BQU8sQ0FBQyxRQUFnQixFQUFFLFFBQWdCO1FBQ3RDLE1BQU0sRUFBRSxHQUFHLEVBQUUsR0FBRyxJQUFJLEVBQ2hCLGlCQUFpQixHQUFHLFFBQVEsS0FBSyxHQUFHLEVBQ3BDLGlCQUFpQixHQUFHLFFBQVEsS0FBSyxHQUFHLENBQUM7UUFFekMsSUFBSSxpQkFBaUIsSUFBSSxpQkFBaUIsRUFBRSxDQUFDO1lBQ3pDLE9BQU8sQ0FBQyxDQUFDO1FBQ2IsQ0FBQzthQUFNLElBQUksaUJBQWlCLEVBQUUsQ0FBQztZQUMzQixPQUFPLENBQUMsQ0FBQyxDQUFDO1FBQ2QsQ0FBQzthQUFNLElBQUksaUJBQWlCLEVBQUUsQ0FBQztZQUMzQixPQUFPLENBQUMsQ0FBQztRQUNiLENBQUM7UUFFRCxPQUFPLENBQUMsQ0FBQztJQUNiLENBQUM7Q0FDSjtBQUVEOztHQUVHO0FBQ0gsTUFBTSxPQUFPLGdCQUFnQjtJQUN6QixvQkFBb0IsQ0FBQyxJQUFZO1FBQzdCLE9BQU8sSUFBSSxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUN6QyxDQUFDO0lBRUQsS0FBSyxDQUFDLE9BQWUsRUFBRSxHQUFXO1FBQzlCLE9BQU8sT0FBTyxLQUFLLEdBQUcsQ0FBQztJQUMzQixDQUFDO0NBQ0oifQ==