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
 * Counts the number of greedy segments (`**` / `{*name}`, D-1) in a path
 * pattern. Greedy segments are strictly less specific than single-segment
 * params at equal length, so patterns with fewer of them sort first.
 */
function countGreedySegments(pattern: string): number {
    const segments = pattern.split('/');
    let count = 0;
    for (const segment of segments) {
        if (segment === '**' || (segment.startsWith('{*') && segment.endsWith('}'))) {
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
 * 2. Fewer greedy segments (`**` / `{*name}`) beat more — a catch-all is
 *    strictly less specific than any non-greedy pattern.
 * 3. Longer patterns beat shorter patterns.
 * 4. Fewer wildcard segments beat more wildcard segments.
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

        // 2. Fewer greedy segments (`**` / `{*name}`) beat more. A catch-all
        // matches any depth below its anchor, so it is strictly less specific
        // than any non-greedy pattern — decided before length, since the
        // `{*name}` spelling is always one character longer than `{name}`.
        const greedy1 = countGreedySegments(pattern1);
        const greedy2 = countGreedySegments(pattern2);
        if (greedy1 !== greedy2) {
            return greedy1 - greedy2;
        }

        // 3. Longer patterns beat shorter patterns.
        if (pattern1.length !== pattern2.length) {
            return pattern2.length - pattern1.length;
        }

        // 4. Fewer wildcard segments beat more wildcard segments.
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
