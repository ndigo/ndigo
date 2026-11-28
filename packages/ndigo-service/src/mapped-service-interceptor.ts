/**
 * Path-mapped service interceptor.
 */
import { URLGlobPathMatcher, matchesPathPatterns } from '@ndigo/core';
import type { ServiceInterceptor } from './service-types.js';

/**
 * Wraps an interceptor so it only applies to matching request paths.
 *
 * @example
 * ```ts
 * const mapped = new MappedServiceInterceptor(interceptor, ['/api/*']);
 * ```
 */
export class MappedServiceInterceptor {
    /**
     * The `Symbol.toStringTag` value for this instance.
     *
     * `Object.prototype.toString()` reads this symbol to render the
     * instance as `"[object <tag>]" ` (see MDN: Symbol.toStringTag).
     *
     * @returns The string "MappedServiceInterceptor".
     *
     * @example
     * console.log(Object.prototype.toString.call(instance)); // "[object MappedServiceInterceptor]"
     */
    get [Symbol.toStringTag](): string {
        return 'MappedServiceInterceptor';
    }

    #excludePatterns!: string[];
    #includePatterns!: string[];
    #interceptor: ServiceInterceptor;
    readonly #pathMatcher = new URLGlobPathMatcher();

    /** The wrapped interceptor. */
    get interceptor(): ServiceInterceptor {
        return this.#interceptor;
    }

    /**
     * Creates a path-mapped interceptor.
     *
     * @param interceptor - Interceptor to wrap.
     * @param includePatterns - Glob patterns that opt the interceptor in.
     * @param excludePatterns - Glob patterns that opt the interceptor out.
     */
    constructor(interceptor: ServiceInterceptor, includePatterns: string[], excludePatterns?: string[]) {
        this.#interceptor = interceptor;
        this.setExcludePatterns(excludePatterns);
        this.setIncludePatterns(includePatterns);
    }

    /**
     * Checks whether a path matches the configured include and exclude patterns.
     *
     * @param path - Request path to evaluate.
     * @param matcher - Optional pattern matcher used for comparisons.
     * @returns `true` when the path should use the wrapped interceptor.
     */
    matches(path: string, matcher?: (path: string, pattern: string) => boolean): boolean {
        return matchesPathPatterns(path, this.#includePatterns ?? [], this.#excludePatterns ?? [], (pattern, value) =>
            matcher ? matcher(value, pattern) : this.#pathMatcher.match(pattern, value)
        );
    }

    /**
     * Replaces the exclude pattern list.
     *
     * @param excludePatterns - Glob patterns to skip.
     */
    setExcludePatterns(excludePatterns: string[] = []): void {
        this.#excludePatterns = excludePatterns;
    }

    /**
     * Replaces the include pattern list.
     *
     * @param includePatterns - Glob patterns to accept.
     */
    setIncludePatterns(includePatterns: string[] = []): void {
        this.#includePatterns = includePatterns;
    }
}
