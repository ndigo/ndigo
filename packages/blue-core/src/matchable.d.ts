/**
 * @author Jeff Rose
 */
/**
 * Represents an object that can determine if it matches a given value.
 * @template TValue - The type of the value to match against.
 */
export interface Matchable<TValue> {
    /**
     * Determines if this object matches the specified value.
     * @param value - The value to match against.
     * @returns `true` if the object matches the value, `false` otherwise.
     */
    matches(value: TValue): boolean;
}
/**
 * Represents an object that can match a pattern against a value.
 * @template TPattern - The type of the pattern to match.
 * @template TValue - The type of the value to match against.
 */
export interface PatternMatcher<TPattern, TValue> {
    /**
     * Matches a given pattern against a value.
     * @param pattern - The pattern to match.
     * @param value - The value to match against.
     * @returns `true` if the pattern matches the value, `false` otherwise.
     */
    match(pattern: TPattern, value: TValue): boolean;
}
