/**
 * @since 1.0.0
 * @author Jeff Rose
 */
import { AbstractThemeResolver } from '@ndigo/dispatcher';
import { ApplicationContext } from '@ndigo/context';
import { Route } from '@ndigo/router';
import Cookies from './cookies';

/**
 */
export class CookieThemeResolver extends AbstractThemeResolver {
    #fallbackThemeName: string;
    readonly cookieName: string;

    get [Symbol.toStringTag](): string {
        return `CookieThemeResolver:${this.cookieName}`;
    }

    /**
     * Creates a cookie-backed theme resolver.
     *
     * @param cookieName - Cookie name that stores the theme.
     * @param defaultThemeName - Fallback theme when the cookie is absent.
     */
    constructor(cookieName: string = 'theme', defaultThemeName: string = 'default') {
        super(defaultThemeName);
        this.#fallbackThemeName = defaultThemeName;
        this.cookieName = cookieName;
    }

    /** Resolves the current theme from cookies or the fallback value. */
    resolveTheme(route: Route): string {
        const themeName = Cookies.get(this.cookieName);
        if (typeof themeName === 'string') {
            return themeName;
        }

        void route;

        return this.#fallbackThemeName;
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
        return new CookieThemeResolver(cookieName, applicationContext.themeName || 'default');
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
