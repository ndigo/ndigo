/**
 * @author Jeff Rose
 */
import { like } from '@blue/util';
import { AbstractValueComparator } from './comparable';
import { glob } from '@blue/parser';
/**
 * Combines two patterns into a new pattern.
 *
 * The approach used for combining the two pattern depends on the underlying implementation.
 * @param {string} pattern1 The first pattern
 * @param {string} pattern2 The second pattern
 * @returns {string} The combination of the two patterns
 */
/**
 * Given a full path, returns a {@link Comparator|Comparator} suitable for sorting patterns in order of explicitness for that path.
 *
 * The approach used depends on the underlying implementation.
 * @param {string} path The full path to use for comparison
 * @returns {module:core.Comparator} A comparator capable of sorting patterns in order of explicitness
 */
/**
 * Match the given `path` against the given `pattern`, according to this PathMatcher's matching strategy.
 * @param {string} pattern The pattern to match against
 * @param {string} path The path to test
 * @returns {boolean} Whether or not the `path` matched.
 */
/**
 */
const DOT = '.', SLASH = '/', STAR = '*', GLOBSTAR = `${STAR}${STAR}`, DOT_STAR = `${DOT}${STAR}`, SLASH_STAR = `${SLASH}${STAR}`, SLASH_GLOBSTAR = `${SLASH}${GLOBSTAR}`;
/**
 * @param {*} value
 * @returns {boolean} Whether or not the `value` is a {@link PathMatcher|PathMatcher}.
 */
export const likePathMatcher = like({ getPatternComparator: Function, match: Function, merge: Function });
/**
 * @extends module:core.AbstractStringComparator
 */
class EqualsPathComparator extends AbstractValueComparator {
    compare(pattern1, pattern2) {
        const { value } = this, pattern1EqualsPath = pattern1 === value, pattern2EqualsPath = pattern2 === value;
        if (pattern1EqualsPath && pattern2EqualsPath) {
            return 0;
        }
        else if (pattern1EqualsPath) {
            return -1;
        }
        else if (pattern2EqualsPath) {
            return 1;
        }
        return 0;
    }
}
/**
 * @extends module:core.AbstractStringComparator
 */
class GlobPatternComparator extends AbstractValueComparator {
    compare(pattern1, pattern2) {
        const info1 = new GlobPatternInfo(pattern1), info2 = new GlobPatternInfo(pattern2);
        if (info1.isLeastSpecific && info2.isLeastSpecific) {
            return 0;
        }
        else if (info1.isLeastSpecific) {
            return 1;
        }
        else if (info2.isLeastSpecific) {
            return -1;
        }
        const { value } = this, pattern1EqualsPath = pattern1 === value, pattern2EqualsPath = pattern2 === value;
        if (pattern1EqualsPath && pattern2EqualsPath) {
            return 0;
        }
        else if (pattern1EqualsPath) {
            return -1;
        }
        else if (pattern2EqualsPath) {
            return 1;
        }
        if (info1.isPrefixPattern && info2.isPrefixPattern) {
            return info2.length - info1.length;
        }
        else if (info1.isPrefixPattern && info2.doubleWildcards === 0) {
            return 1;
        }
        else if (info2.isPrefixPattern && info1.doubleWildcards === 0) {
            return -1;
        }
        if (info1.totalCount !== info2.totalCount) {
            return info1.totalCount - info2.totalCount;
        }
        if (info1.length !== info2.length) {
            return info2.length - info1.length;
        }
        if (info1.singleWildcards < info2.singleWildcards) {
            return -1;
        }
        else if (info2.singleWildcards < info1.singleWildcards) {
            return 1;
        }
        return 0;
    }
}
/**
 * @extends module:core.PathMatcher
 */
export class EqualsPathMatcher {
    merge(pattern1, pattern2) {
        if (typeof pattern1 !== 'string') {
            throw new TypeError('"pattern1" must be a string');
        }
        if (typeof pattern2 !== 'string') {
            throw new TypeError('"pattern2" must be a string');
        }
        const isEmpty1 = pattern1.length === 0, isEmpty2 = pattern2.length === 0, hasSlash1 = !isEmpty1 && pattern1.indexOf(SLASH) === 0, hasSlash2 = !isEmpty2 && pattern2.indexOf(SLASH) === 0;
        if (isEmpty1 && isEmpty2) {
            return '';
        }
        else if (isEmpty1) {
            return pattern2;
        }
        else if (isEmpty2) {
            return pattern1;
        }
        else {
            const hasPeriod1 = pattern1.indexOf(DOT) !== -1, hasPeriod2 = pattern2.indexOf(DOT) !== -1;
            if (hasPeriod1 && !hasPeriod2) {
                return `${pattern2}${SLASH}${hasSlash1 ? pattern1.substring(1) : pattern1}`;
            }
            else if (!hasPeriod1 && hasPeriod2) {
                return `${pattern1}${SLASH}${hasSlash2 ? pattern2.substring(1) : pattern2}`;
            }
            else if (hasPeriod1 && hasPeriod2) {
                throw new Error(`Cannot combine "${pattern1}" and "${pattern2}"`);
            }
        }
        return `${pattern1}${SLASH}${hasSlash2 ? pattern2.substring(1) : pattern2}`;
    }
    getPatternComparator(path) {
        return new EqualsPathComparator(path);
    }
    match(pattern, path) {
        return pattern === path;
    }
}
/**
 * @extends module:core.PathMatcher
 */
export class GlobPathMatcher {
    getPatternComparator(path) {
        return new GlobPatternComparator(path);
    }
    match(pattern, path) {
        const parseResult = glob.run(pattern);
        if (!parseResult.isError) {
            // Type narrowing: parseResult is Ok<string, any> here
            const regex = new RegExp(parseResult.result);
            return regex.test(path);
        }
        return false;
    }
    merge(pattern1, pattern2) {
        if (typeof pattern1 !== 'string') {
            throw new TypeError('"pattern1" must be a string');
        }
        if (typeof pattern2 !== 'string') {
            throw new TypeError('"pattern2" must be a string');
        }
        if (pattern1.endsWith(SLASH_STAR)) {
            return `${pattern1.substring(0, pattern1.length - 2)}${pattern2}`;
        }
        if (pattern1.endsWith(SLASH_GLOBSTAR)) {
            return `${pattern1}${pattern2}`;
        }
        return `${pattern1}${pattern2}`;
    }
}
export class GlobPatternInfo {
    #catchAllPattern;
    pattern;
    doubleWildcards;
    singleWildcards;
    get isLeastSpecific() {
        return this.pattern === null || this.#catchAllPattern;
    }
    get isPrefixPattern() {
        return !this.#catchAllPattern && this.pattern.endsWith(SLASH_GLOBSTAR);
    }
    get length() {
        return this.pattern ? this.pattern.length : 0;
    }
    get totalCount() {
        return this.singleWildcards + 2 * this.doubleWildcards;
    }
    constructor(pattern = null) {
        this.pattern = pattern;
        this.doubleWildcards = 0;
        this.singleWildcards = 0;
        if (this.pattern) {
            this._initCounters();
            this.#catchAllPattern = this.pattern === SLASH_GLOBSTAR;
        }
    }
    _initCounters() {
        let index = 0;
        const pattern = this.pattern;
        if (pattern) {
            const length = pattern.length;
            while (index < length) {
                switch (pattern[index]) {
                    case STAR:
                        if (index + 1 < length && pattern[index + 1] === STAR) {
                            this.doubleWildcards++;
                            index++;
                        }
                        else if (index > 0 && pattern.substring(index - 1) === DOT_STAR) {
                            this.singleWildcards++;
                        }
                    default:
                        index++;
                        break;
                }
            }
        }
    }
}
// ! Not sure I like this name. Should really come up with a better one. -JBR
export const AsPathMatcherFilter = (superclass) => class extends superclass {
    #excludePatterns;
    #includePatterns;
    pathMatcher;
    matches(path, matcher) {
        const pathMatcher = matcher || this.pathMatcher;
        if (pathMatcher) {
            const excludePatterns = this.#excludePatterns ?? [], includePatterns = this.#includePatterns ?? [];
            let index, length;
            if (excludePatterns.length) {
                length = excludePatterns.length;
                for (index = 0; index < length; index++) {
                    if (pathMatcher.match(excludePatterns[index], path)) {
                        return false;
                    }
                }
            }
            if (!includePatterns.length) {
                return true;
            }
            length = includePatterns.length;
            for (index = 0; index < length; index++) {
                if (pathMatcher.match(includePatterns[index], path)) {
                    return true;
                }
            }
        }
        return false;
    }
    setExcludePatterns(excludePatterns = []) {
        this.#excludePatterns = excludePatterns;
    }
    setIncludePatterns(includePatterns = []) {
        this.#includePatterns = includePatterns;
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGF0aC1tYXRjaGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL3BhdGgtbWF0Y2hlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7R0FFRztBQUVILE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxZQUFZLENBQUM7QUFDbEMsT0FBTyxFQUFFLHVCQUF1QixFQUFjLE1BQU0sY0FBYyxDQUFDO0FBRW5FLE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxjQUFjLENBQUM7QUFpQnBDOzs7Ozs7O0dBT0c7QUFFSDs7Ozs7O0dBTUc7QUFFSDs7Ozs7R0FLRztBQUVIO0dBQ0c7QUFFSCxNQUFNLEdBQUcsR0FBRyxHQUFHLEVBQ1gsS0FBSyxHQUFHLEdBQUcsRUFDWCxJQUFJLEdBQUcsR0FBRyxFQUNWLFFBQVEsR0FBRyxHQUFHLElBQUksR0FBRyxJQUFJLEVBQUUsRUFDM0IsUUFBUSxHQUFHLEdBQUcsR0FBRyxHQUFHLElBQUksRUFBRSxFQUMxQixVQUFVLEdBQUcsR0FBRyxLQUFLLEdBQUcsSUFBSSxFQUFFLEVBQzlCLGNBQWMsR0FBRyxHQUFHLEtBQUssR0FBRyxRQUFRLEVBQUUsQ0FBQztBQUUzQzs7O0dBR0c7QUFDSCxNQUFNLENBQUMsTUFBTSxlQUFlLEdBQUcsSUFBSSxDQUFDLEVBQUUsb0JBQW9CLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRSxDQUUvRSxDQUFDO0FBRTFCOztHQUVHO0FBQ0gsTUFBTSxvQkFBcUIsU0FBUSx1QkFBdUI7SUFDdEQsT0FBTyxDQUFDLFFBQWdCLEVBQUUsUUFBZ0I7UUFDdEMsTUFBTSxFQUFFLEtBQUssRUFBRSxHQUFHLElBQUksRUFDbEIsa0JBQWtCLEdBQUcsUUFBUSxLQUFLLEtBQUssRUFDdkMsa0JBQWtCLEdBQUcsUUFBUSxLQUFLLEtBQUssQ0FBQztRQUU1QyxJQUFJLGtCQUFrQixJQUFJLGtCQUFrQixFQUFFLENBQUM7WUFDM0MsT0FB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