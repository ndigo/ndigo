/**
 * Prefix-based view resolution with safe-name enforcement.
 */
import { MediaType, MediaTypes } from '@ndigo/core';
import { AbstractCachingViewResolver } from './abstract-caching-view-resolver.js';

/**
 * Returns whether a view name is safe to interpolate into a resolver path.
 *
 * View names can reach resolvers from request-derived data (default route
 * names, path extensions), so a name must never escape the resolver's
 * `prefix` once joined with it. Rejected forms:
 *
 * - NUL bytes, which truncate paths in native syscalls;
 * - absolute paths (`/x`, `\x`, `C:\x`), which discard the prefix;
 * - any drive specifier (`C:`, `c:`), including drive-relative forms like
 *   `C:foo` that lack a separator after the colon;
 * - any path segment that is `..`, including its matrix-param and
 *   trailing-space spellings (`..;x=1`, `.. `), which climb out of the
 *   prefix.
 *
 * Separators are otherwise allowed so nested names (`admin/user`) keep
 * resolving, and dots inside a segment (`v1.2`, `my.file`) stay valid.
 *
 * This is the single source of truth for the predicate: the resolver class
 * delegates to it, and the `no-unsafe-view-name-literal` lint rule asserts the
 * same vector table so the runtime and lint grammars cannot drift.
 *
 * @param name - The view name to validate.
 * @returns `true` when the name is safe to use as a relative path.
 *
 * @example
 * ```ts
 * isSafeViewName();
 * ```
 */
export function isSafeViewName(name: string): boolean {
    if (name.includes('\0')) {
        return false;
    }

    if (name.startsWith('/') || name.startsWith('\\') || /^[a-zA-Z]:/.test(name)) {
        return false;
    }

    // A segment escapes only when, after dropping any matrix-parameter
    // suffix and trailing spaces (Windows), it is exactly `..`.
    return name.split(/[\\/]+/).every((segment) => segment.split(';', 1)[0].replace(/\s+$/, '') !== '..');
}

/**
 * AbstractPathBasedViewResolver.
 *
 * @example
 * ```ts
 * const instance = new AbstractPathBasedViewResolver();
 * ```
 */
export abstract class AbstractPathBasedViewResolver extends AbstractCachingViewResolver {
    /**
     * The `Symbol.toStringTag` value for this instance.
     *
     * `Object.prototype.toString()` reads this symbol to render the
     * instance as `"[object <tag>]" ` (see MDN: Symbol.toStringTag).
     *
     * @returns The string "AbstractPathBasedViewResolver".
     *
     * @example
     * console.log(Object.prototype.toString.call(instance)); // "[object AbstractPathBasedViewResolver]"
     */
    get [Symbol.toStringTag](): string {
        return 'AbstractPathBasedViewResolver';
    }

    /**
     * Media type assigned to resolved views.
     */
    mediaType: MediaType | null;
    /**
     * Prefix applied before the resolved view name.
     */
    prefix: string;
    /**
     * Suffix applied after the resolved view name.
     */
    suffix: string;
    /**
     * The set of names this resolver supports.
     */
    viewNames: (string | RegExp)[] | null;

    /**
     * Creates a path-based resolver with JavaScript media type defaults.
     */
    constructor() {
        super();
        this.mediaType = MediaTypes.APPLICATION_JAVASCRIPT;
        this.prefix = '';
        this.suffix = '';
        this.viewNames = null;
    }

    /**
     * Returns whether this resolver can handle the given view name.
     *
     * @param name - The view name to test.
     * @param language - Optional locale or language hint.
     * @returns `true` when the name is supported; otherwise `false`.
     */
    supports(name: string, language?: unknown): boolean {
        let isSupported: boolean = !!this.viewNames;

        if (isSupported && this.viewNames) {
            const names = this.viewNames;
            isSupported = names.some(function (viewName: string | RegExp) {
                if (viewName instanceof RegExp) {
                    return viewName.test(name);
                } else if (typeof viewName === 'string') {
                    return viewName === name;
                }
            });
        }

        return isSupported;
    }

    /**
     * Returns whether a view name is safe to interpolate into a resolver path.
     *
     * Delegates to the module-level {@link isSafeViewName} predicate — the
     * single source of truth shared with the `no-unsafe-view-name-literal`
     * lint rule.
     *
     * @param name - The view name to validate.
     * @returns `true` when the name is safe to use as a relative path.
     */
    protected isSafeViewName(name: string): boolean {
        return isSafeViewName(name);
    }
}
