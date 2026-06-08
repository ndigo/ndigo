/**
 * @author Jeff Rose
 */

import { Route } from '@blue/router';

/**
 * Resolves the active theme for a route.
 */
export interface ThemeResolver {
    /**
     * Resolve the theme name for a route.
     *
     * @param route - The current route.
     * @returns The resolved theme name.
     */
    resolveTheme(route: Route): string;
}

const { defineProperty } = Reflect;

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
    abstract resolveTheme(route: Route): string;
}

/**
 * Resolve a fixed theme regardless of route.
 */
export class FixedThemeResolver extends AbstractThemeResolver {
    /**
     * Return the configured fallback theme.
     *
     * @param route - The current route.
     * @returns The configured theme name.
     */
    resolveTheme(route: Route): string {
        return this.defaultThemeName;
    }
}
