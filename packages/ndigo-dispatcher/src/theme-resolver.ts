/**
 * Theme resolution contracts.
 */

import { normalizeThemeName } from '@ndigo/content';
import { REQUESTED_THEME_ATTRIBUTE, Route } from '@ndigo/router';

/**
 * Resolves the active theme name for a route.
 */
export interface ThemeResolver {
    /**
     * Resolve the theme name for a route.
     *
     * @param route - The current route.
     * @returns The resolved theme name.
     */
    resolveThemeName(route: Route): string;
}

/**
 * Base class for theme resolvers with a configurable fallback theme.
 */
export abstract class AbstractThemeResolver implements ThemeResolver {
    /**
     * Fallback theme name used when a route-specific theme is unavailable.
     */
    readonly defaultThemeName!: string;

    get [Symbol.toStringTag](): string {
        return 'ThemeResolver';
    }

    /**
     * Store the fallback theme name.
     *
     * @param defaultThemeName - The theme to use by default.
     */
    constructor(defaultThemeName: string) {
        this.defaultThemeName = defaultThemeName;
    }

    /**
     * Resolve the theme name for a route.
     *
     * @param route - The current route.
     * @returns The resolved theme name.
     */
    abstract resolveThemeName(route: Route): string;
}

/**
 * Resolve a fixed theme regardless of route.
 */
export class FixedThemeResolver extends AbstractThemeResolver {
    get [Symbol.toStringTag](): string {
        return 'FixedThemeResolver';
    }

    /**
     * Return the configured fallback theme.
     *
     * @param _route - The current route.
     * @returns The configured theme name.
     */
    resolveThemeName(_route: Route): string {
        return this.defaultThemeName;
    }
}

/**
 * Resolves the theme name stamped on the route by a platform adapter.
 *
 * The attribute carries untrusted transport input (typically the `theme`
 * cookie), so the value is normalized before use; anything that does not
 * match the accepted name shape falls back to the configured default.
 */
export class AttributeThemeResolver extends AbstractThemeResolver {
    get [Symbol.toStringTag](): string {
        return 'AttributeThemeResolver';
    }

    /**
     * Resolve the requested theme from the route attribute.
     *
     * @param route - The current route.
     * @returns The normalized requested theme or the configured default.
     */
    resolveThemeName(route: Route): string {
        const requested = normalizeThemeName(route.attributes?.[REQUESTED_THEME_ATTRIBUTE]);

        return requested ?? this.defaultThemeName;
    }
}

/**
 * Preference mapping for {@link SystemThemeResolver}.
 */
export interface SystemThemeResolverOptions {
    /** Theme name used when the system prefers dark. Default: `ndigo-dark`. */
    darkThemeName?: string;
    /** Theme name used when the system prefers light. Default: `ndigo-light`. */
    lightThemeName?: string;
}

const DARK_COLOR_SCHEME_QUERY = '(prefers-color-scheme: dark)';
const LIGHT_COLOR_SCHEME_QUERY = '(prefers-color-scheme: light)';

/**
 * Resolves the theme from the operating system's color-scheme preference.
 *
 * `matchMedia` is read at call time (never cached), so an OS-level change is
 * honored on the next resolution. Outside a DOM runtime — or when the browser
 * reports no preference — the configured default applies.
 */
export class SystemThemeResolver extends AbstractThemeResolver {
    #darkThemeName: string;
    #lightThemeName: string;

    get [Symbol.toStringTag](): string {
        return 'SystemThemeResolver';
    }

    /**
     * Creates a system-preference theme resolver.
     *
     * @param defaultThemeName - Theme used when no preference is available.
     * @param options - Optional dark/light theme name overrides.
     */
    constructor(defaultThemeName: string, options: SystemThemeResolverOptions = {}) {
        super(defaultThemeName);
        this.#darkThemeName = options.darkThemeName ?? 'ndigo-dark';
        this.#lightThemeName = options.lightThemeName ?? 'ndigo-light';
    }

    /**
     * Resolve the theme matching the current system color scheme.
     *
     * @param _route - The current route.
     * @returns The dark/light theme name or the configured default.
     */
    resolveThemeName(_route: Route): string {
        if (typeof matchMedia !== 'function') {
            return this.defaultThemeName;
        }

        if (matchMedia(DARK_COLOR_SCHEME_QUERY).matches) {
            return this.#darkThemeName;
        }

        if (matchMedia(LIGHT_COLOR_SCHEME_QUERY).matches) {
            return this.#lightThemeName;
        }

        return this.defaultThemeName;
    }
}
