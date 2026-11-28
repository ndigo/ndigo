/**
 * Glob pattern specificity analysis.
 */
import { DOT_STAR, SLASH_GLOBSTAR, STAR } from './_path-matcher-constants.js';

/**
 * Wildcard-pattern analysis used by `GlobPatternComparator`: counts `*` and
 * `**` occurrences and answers the specificity questions ordering depends on
 * (`isLeastSpecific`, `isPrefixPattern`).
 *
 * @example
 * ```ts
 * const info = new GlobPatternInfo('/users/*');
 * info.singleWildcards; // 1
 * ```
 */
export class GlobPatternInfo {
    /**
     * The `Symbol.toStringTag` value for this instance.
     *
     * `Object.prototype.toString()` reads this symbol to render the
     * instance as `"[object <tag>]" ` (see MDN: Symbol.toStringTag).
     *
     * @returns The string "GlobPatternInfo".
     *
     * @example
     * console.log(Object.prototype.toString.call(instance)); // "[object GlobPatternInfo]"
     */
    get [Symbol.toStringTag](): string {
        return 'GlobPatternInfo';
    }

    #catchAllPattern: boolean;

    /** The glob pattern being analyzed. */
    readonly pattern: string;

    /** Number of `**` double-wildcard occurrences. */
    doubleWildcards: number;
    /** Number of single `*` wildcard occurrences. */
    singleWildcards: number;

    /** Whether the pattern is the catch-all `/**`. */
    get isLeastSpecific(): boolean {
        return this.pattern === null || this.#catchAllPattern;
    }

    /** Whether the pattern ends with a trailing `/**`. */
    get isPrefixPattern(): boolean {
        return !this.#catchAllPattern && this.pattern.endsWith(SLASH_GLOBSTAR);
    }

    /** Length of the pattern string. */
    get length(): number {
        return this.pattern ? this.pattern.length : 0;
    }

    /** Weighted wildcard count used for specificity ordering. */
    get totalCount(): number {
        return this.singleWildcards + 2 * this.doubleWildcards;
    }

    constructor(pattern: string | null = null) {
        this.pattern = pattern ?? '';

        this.doubleWildcards = 0;
        this.singleWildcards = 0;
        this.#catchAllPattern = false;

        if (this.pattern) {
            this._initCounters();
            this.#catchAllPattern = this.pattern === SLASH_GLOBSTAR;
        }
    }

    /** Counts wildcard occurrences in the pattern. */
    protected _initCounters(): void {
        let index: number = 0;
        const pattern = this.pattern;
        if (pattern) {
            const length: number = pattern.length;
            while (index < length) {
                switch (pattern[index]) {
                    case STAR:
                        if (index + 1 < length && pattern[index + 1] === STAR) {
                            this.doubleWildcards++;
                            index++;
                        } else if (index > 0 && pattern.substring(index - 1, index + 1) === DOT_STAR) {
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
