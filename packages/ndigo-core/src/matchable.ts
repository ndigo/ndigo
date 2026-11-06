/**
 * Represents an object that can determine if it matches a given value.
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
 * Represents an object that returns a matching result for an input.
 * @typeParam TInput - The type of the input to match.
 * @typeParam TResult - The type of the matching result.
 */
export interface ResultMatcher<TInput, TResult> {
    /**
     * Matches an input and returns the narrowed result, or `null` when no match exists.
     * @param input - The input to match.
     * @returns The matching result, or `null` when the input does not match.
     */
    match(input: TInput): TResult | null;
}

/**
 * Represents an object that can match a pattern against a value.
 * @typeParam TPattern - The type of the pattern to match.
 * @typeParam TValue - The type of the value to match against.
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
