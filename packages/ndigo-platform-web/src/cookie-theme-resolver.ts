/**
 * Theme resolver backed by a cookie.
 */
import { AbstractThemeResolver, SystemThemeResolver } from '@ndigo/dispatcher';
import { normalizeThemeName } from '@ndigo/content';
import { ApplicationContext } from '@ndigo/context';
import { Route } from '@ndigo/router';
import { Cookies } from './cookies';

/**
 * Resolves the active theme from a persisted cookie, falling back to the
 * system color-scheme preference and then the configured default.
 *
 * The persisted user choice wins over the system preference — the precedence
 * rule for client-side theme resolution. Cookie values are untrusted input
 * and are normalized before use.
 */
export class CookieThemeResolver extends AbstractThemeResolver {
    #fallback: AbstractThemeResolver;
    /** The cookie name that stores the theme. */
    readonly cookieName: string;

    get [Symbol.toStringTag](): string {
        return `CookieThemeResolver:${this.cookieName}`;
    }

    /**
     * Creates a cookie-backed theme resolver.
     *
     * @param cookieName - Cookie name that stores the theme.
     * @param defaultThemeName - Fallback theme when no cookie or system
     *   preference is available.
     * @param fallback - Resolver used when the cookie is absent or invalid
     *   (defaults to {@link SystemThemeResolver}).
     */
    constructor(
        cookieName: string = 'theme',
        defaultThemeName: string = 'ndigo-dark',
        fallback: AbstractThemeResolver = new SystemThemeResolver(defaultThemeName)
    ) {
        super(defaultThemeName);
        this.#fallback = fallback;
        this.cookieName = cookieName;
    }

    /**
     * Resolves the current theme from the cookie, the fallback resolver, or
     * the configured default.
     *
     * Only well-formed names are honored — a tampered cookie (quotes,
     * whitespace, script characters, uppercase) falls through to the fallback
     * resolver instead of reaching markup or CSS.
     *
     * @param route - The current route.
     * @returns The resolved theme name.
     */
    resolveThemeName(route: Route): string {
        const normalized = normalizeThemeName(Cookies.get(this.cookieName));
        if (normalized) {
            return normalized;
        }

        return this.#fallback.resolveThemeName(route);
    }

    /**
     * Creates a resolver from application-context defaults.
     *
     * @param applicationContext - Context supplying the fallback theme.
     * @param cookieName - Cookie name that stores the theme.
     * @returns A cookie-backed theme resolver.
     */
    static fromApplicationContext(
        applicationContext: ApplicationContext,
        cookieName: string = 'theme'
    ): CookieThemeResolver {
        return new CookieThemeResolver(cookieName, applicationContext.themeName || 'ndigo-dark');
    }
}

/**
 * Registers a cookie-backed theme resolver into the given context.
 *
 * @param applicationContext - The application context to update.
 * @param cookieName - Cookie name that stores the theme.
 * @returns The configured theme resolver.
 */
export const configureCookieThemeResolver = (
    applicationContext: ApplicationContext,
    cookieName: string = 'theme'
): CookieThemeResolver => {
    const resolver = CookieThemeResolver.fromApplicationContext(applicationContext, cookieName);
    applicationContext.setValue('themeResolver', resolver);
    return resolver;
};
