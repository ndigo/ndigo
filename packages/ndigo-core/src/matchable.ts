/**
 * Matchable contracts and the duck-typing guard.
 */
import { like } from '@ndigo/util/types';

/**
 * Represents an object that can determine if it matches a given value.
 *
 * @example
 * ```ts
 * const m: Matchable<string> = { matches: (v) => v === 'admin' };
 * m.matches('admin'); // true
 * ```
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
 * Type guard to check if a value implements the `Matchable` interface.
 *
 * @param value - The value to check.
 * @returns `true` if the value implements `Matchable`, `false` otherwise.
 */
export const likeMatchable = like({ matches: Function }) as (value: unknown) => value is Matchable<unknown>;

/**
 * Builds a matcher that matches only when every supplied matcher matches.
 *
 * An empty list matches everything, mirroring `Array.prototype.every`.
 *
 * @typeParam TValue - The value type being matched.
 * @param matchers - The matchers to combine.
 * @returns A matcher that applies logical AND across its inputs.
 *
 * @example
 * ```ts
 * const auditedWrites = matchAll(audited, matchNot(readOnly));
 * ```
 */
export function matchAll<TValue>(...matchers: readonly Matchable<TValue>[]): Matchable<TValue> {
    return {
        matches: (value: TValue): boolean => matchers.every((matcher) => matcher.matches(value)),
    };
}

/**
 * Builds a matcher that matches when at least one supplied matcher matches.
 *
 * An empty list matches nothing, mirroring `Array.prototype.some`.
 *
 * @typeParam TValue - The value type being matched.
 * @param matchers - The matchers to combine.
 * @returns A matcher that applies logical OR across its inputs.
 *
 * @example
 * ```ts
 * const sensitive = matchAny(adminOnly, billingOnly);
 * ```
 */
export function matchAny<TValue>(...matchers: readonly Matchable<TValue>[]): Matchable<TValue> {
    return {
        matches: (value: TValue): boolean => matchers.some((matcher) => matcher.matches(value)),
    };
}

/**
 * Builds a matcher that inverts another matcher.
 *
 * @typeParam TValue - The value type being matched.
 * @param matcher - The matcher to invert.
 * @returns A matcher that applies logical NOT.
 *
 * @example
 * ```ts
 * const nonHealthChecks = matchNot(healthCheck);
 * ```
 */
export function matchNot<TValue>(matcher: Matchable<TValue>): Matchable<TValue> {
    return {
        matches: (value: TValue): boolean => !matcher.matches(value),
    };
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
 *
 * @example
 * ```ts
 * const m: PatternMatcher<string, string> = { match: (p, v) => p === v };
 * m.match('a', 'a'); // true
 * ```
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
