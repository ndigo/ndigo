/**
 * @author Jeff Rose
 */
import { like } from '@blue/util/types';
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXJsLW1hdGNoZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvdXJsLW1hdGNoZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7O0dBRUc7QUFFSCxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sa0JBQWtCLENBQUM7QUFReEM7O0dBRUc7QUFFSDs7Ozs7O0dBTUc7QUFFSDs7Ozs7R0FLRztBQUVILE1BQU0sRUFBRSxjQUFjLEVBQUUsR0FBRyxPQUFPLENBQUM7QUFFbkM7OztHQUdHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sY0FBYyxHQUFHLElBQUksQ0FBQyxFQUFFLG9CQUFvQixFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLENBRTlELENBQUM7QUFFekIsTUFBZSxxQkFBcUI7SUFDdkIsR0FBRyxDQUFTO0lBRXJCLFlBQVksR0FBVztRQUNuQixjQUFjLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRTtZQUN4QixLQUFLLEVBQUUsR0FBRztZQUNWLFlBQVksRUFBRSxJQUFJO1lBQ2xCLFVBQVUsRUFBRSxLQUFLO1lBQ2pCLFFBQVEsRUFBRSxLQUFLO1NBQ2xCLENBQUMsQ0FBQztJQUNQLENBQUM7Q0FHSjtBQUVEOzs7R0FHRztBQUVIOztHQUVHO0FBQ0gsTUFBTSxtQkFBb0IsU0FBUSxxQkFBcUI7SUFDbkQsT0FBTyxDQUFDLFFBQWdCLEVBQUUsUUFBZ0I7UUFDdEMsTUFBTSxFQUFFLEdBQUcsRUFBRSxHQUFHLElBQUksRUFDaEIsaUJBQWlCLEdBQUcsUUFBUSxLQUFLLEdBQUcsRUFDcEMsaUJBQWlCLEdBQUcsUUFBUSxLQUFLLEdBQUcsQ0FBQztRQUV6QyxJQUFJLGlCQUFpQixJQUFJLGlCQUFpQixFQUFFLENBQUM7WUFDekMsT0FBTyxDQUFDLENBQUM7UUFDYixDQUFDO2FBQU0sSUFBSSxpQkFBaUIsRUFBRSxDQUFDO1lBQzNCLE9BQU8sQ0FBQyxDQUFDLENBQUM7UUFDZCxDQUFDO2FBQU0sSUFBSSxpQkFBaUIsRUFBRSxDQUFDO1lBQzNCLE9BQU8sQ0FBQyxDQUFDO1FBQ2IsQ0FBQztRQUVELE9BQU8sQ0FBQyxDQUFDO0lBQ2IsQ0FBQztDQUNKO0FBRUQ7O0dBRUc7QUFDSCxNQUFNLE9BQU8sZ0JBQWdCO0lBQ3pCLG9CQUFvQixDQUFDLElBQVk7UUFDN0IsT0FBTyxJQUFJLG1CQUFtQixDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ3pDLENBQUM7SUFFRCxLQUFLLENBQUMsT0FBZSxFQUFFLEdBQVc7UUFDOUIsT0FBTyxPQUFPLEtBQUssR0FBRyxDQUFDO0lBQzNCLENBQUM7Q0FDSiJ9