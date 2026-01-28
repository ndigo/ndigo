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