/**
 * Builds `var()` references for design tokens.
 */
import type { TokenName } from './token-name.js';

/**
 * Builds a `var()` reference for a token, optionally with a fallback.
 * @param name - Token to reference.
 * @param fallback - Value used when the custom property is unset.
 * @returns A CSS `var()` expression.
 */
export function resolveToken(name: TokenName, fallback?: string): string {
    return fallback === undefined ? `var(${name})` : `var(${name}, ${fallback})`;
}
