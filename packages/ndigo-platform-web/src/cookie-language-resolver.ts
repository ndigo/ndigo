/**
 */
import { AbstractLanguageResolver, NavigatorLanguageResolver } from '@ndigo/dispatcher';
import { normalizeLocale } from '@ndigo/content';
import { ApplicationContext } from '@ndigo/context';
import { Route } from '@ndigo/router';
import Cookies from './cookies';

/**
 * Resolves the active language from a persisted cookie, falling back to the
 * browser language and then the configured default.
 *
 * The persisted user choice wins over the browser/navigator language —
 * the precedence rule for client-side locale resolution.
 */
export class CookieLanguageResolver extends AbstractLanguageResolver {
    #fallback: AbstractLanguageResolver;
    readonly cookieName: string;

    get [Symbol.toStringTag](): string {
        return `CookieLanguageResolver:${this.cookieName}`;
    }

    /**
     * Creates a cookie-backed language resolver.
     *
     * @param cookieName - Cookie name that stores the language.
     * @param fallback - Resolver used when no cookie value is present
     *   (defaults to {@link NavigatorLanguageResolver}).
     */
    constructor(
        cookieName: string = 'lang',
        fallback: AbstractLanguageResolver = new NavigatorLanguageResolver('en-US')
    ) {
        super(fallback.defaultLanguage);
        this.#fallback = fallback;
        this.cookieName = cookieName;
    }

    /**
     * Resolves the current language from the cookie, the fallback resolver,
     * or the configured default.
     *
     * @param route - The current route.
     * @returns The resolved language tag.
     */
    resolveLanguage(route: Route): string {
        const value = Cookies.get(this.cookieName);
        // Only well-formed tags are honored — a tampered cookie (quotes,
        // whitespace, script characters) falls through to the fallback
        // resolver instead of reaching views or formatters.
        const normalized = normalizeLocale(value);
        if (normalized) {
            return normalized;
        }

        return this.#fallback.resolveLanguage(route);
    }
}

/**
 * Registers a cookie-backed language resolver into the given context.
 *
 * @param applicationContext - The application context to update.
 * @param cookieName - Cookie name that stores the language.
 * @returns The configured language resolver.
 */
export const configureCookieLanguageResolver = (
    applicationContext: ApplicationContext,
    cookieName: string = 'lang'
): CookieLanguageResolver => {
    const resolver = new CookieLanguageResolver(cookieName);
    applicationContext.setValue('languageResolver', resolver);
    return resolver;
};
