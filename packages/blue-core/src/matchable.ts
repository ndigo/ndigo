/**
 * @author Jeff Rose
 */

export interface Matchable<TValue> {
    matches(value: TValue): boolean;
}

export interface PatternMatcher<TPattern, TValue> {
    match(pattern: TPattern, value: TValue): boolean;
}

/**
 * @interface module:core.Matchable
 */

/**
 * @function module:core.Matchable#matches
 * @param {*} value
 * @returns {external:boolean}
 */

/**
 * @interface module:core.PatternMatcher
 */

/**
 * @function module:core.PatternMatcher#match
 * @param {*} pattern
 * @param {*} value
 * @returns {external:boolean}
 */
