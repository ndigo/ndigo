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
 */
/**
 * @param {*} value
 * @returns {boolean}
 */
/**
 */
/**
 * @param {*} pattern
 * @param {*} value
 * @returns {boolean}
 */
//# sourceMappingURL=matchable.d.ts.map