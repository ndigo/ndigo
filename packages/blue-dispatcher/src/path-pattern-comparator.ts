/**
 * @module blue-dispatcher
 * @since 1.0.0
 * @author Jeff Rose
 */
import { Comparator } from '@blue/core';

/**
 * Counts the number of wildcard segments in a path pattern.
 * Wildcard segments are `*`, `**`, or segments containing `{` (capture groups).
 */
function countWildcardSegments(pattern: string): number {
    const segments = pattern.split('/');
    let count = 0;
    for (const segment of segments) {
        if (segment === '*' || segment === '**' || segment.includes('{')) {
            count++;
        }
    }
    return count;
}

/**
 * Returns `true` when the pattern contains any wildcard characters (`*`, `?`, `{`, `[`).
 */
function hasWildcards(pattern: string): boolean {
    return /[*?{[)]/.test(pattern);
}

/**
 * Compares two path patterns by specificity so that more specific patterns
 * sort before less specific ones. This ensures deterministic route matching
 * when multiple patterns can match a given request path.
 *
 * ## Specificity Rules (most specific first)
 * 1. Exact matches (no wildcards) beat pattern matches.
 * 2. Longer patterns beat shorter patterns.
 * 3. Fewer wildcard segments beat more wildcard segments.
 */
export class PathPatternComparator implements Comparator<string> {
    get [Symbol.toStringTag](): string {
        return 'PathPatternComparator';
    }

    /**
     * Creates a comparator for path pattern specificity.
     */
    constructor() {
        // No state needed — the comparator is stateless.
    }

    /**
     * Compares two path patterns for specificity ordering.
     *
     * @param pattern1 - The first path pattern.
     * @param pattern2 - The second path pattern.
     * @returns A negative number when `pattern1` is more specific than `pattern2`,
     *          a positive number when `pattern2` is more specific,
     *          or zero when they have equal specificity.
     */
    compare(pattern1: string, pattern2: string): number {
        const hasWildcards1 = hasWildcards(pattern1);
        const hasWildcards2 = hasWildcards(pattern2);

        // 1. Exact matches beat wildcard matches.
        if (hasWildcards1 && !hasWildcards2) {
            return 1;
        }
        if (!hasWildcards1 && hasWildcards2) {
            return -1;
        }

        // 2. Longer patterns beat shorter patterns.
        if (pattern1.length !== pattern2.length) {
            return pattern2.length - pattern1.length;
        }

        // 3. Fewer wildcard segments beat more wildcard segments.
        const wildcards1 = countWildcardSegments(pattern1);
        const wildcards2 = countWildcardSegments(pattern2);
        if (wildcards1 !== wildcards2) {
            return wildcards1 - wildcards2;
        }

        return 0;
    }
}

/**
 * Singleton instance of `PathPatternComparator` for reuse.
 */
export const pathPatternComparator = new PathPatternComparator();
