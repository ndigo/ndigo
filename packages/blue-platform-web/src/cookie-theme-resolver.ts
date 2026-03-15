/**
 * @author Jeff Rose
 */

import { AbstractThemeResolver } from '@blue/dispatcher';
import { ApplicationContext } from '@blue/context';
import { Route } from '@blue/router';
import Cookies from './cookies';

/**
 * @extends module:dispatcher.AbstractThemeResolver
 */
export class CookieThemeResolver extends AbstractThemeResolver {
    #fallbackThemeName: string;
    readonly cookieName: string;

    get [Symbol.toStringTag](): string {
        return `CookieThemeResolver:${this.cookieName}`;
    }

    constructor(cookieName: string = 'theme', defaultThemeName: string = 'default') {
        super(defaultThemeName);
        this.#fallbackThemeName = defaultThemeName;
        Reflect.defineProperty(this, 'cookieName', {
            value: cookieName,
            configurable: true,
            enumerable: false,
            writable: false,
        });
    }

    resolveTheme(route: Route): string {
        const themeName = Cookies.get(this.cookieName);
        if (typeof themeName === 'string') {
            return themeName;
        }

        void route;

        return this.#fallbackThemeName;
    }

    static fromApplicationContext(
        applicationContext: ApplicationContext,
        cookieName: string = 'theme'
    ): CookieThemeResolver {
        return new CookieThemeResolver(cookieName, applicationContext.themeName || 'default');
    }
}

/**
 * Registers a cookie-backed theme resolver into the given context.
 */
export const configureCookieThemeResolver = (
    applicationContext: ApplicationContext,
    cookieName: string = 'theme'
): CookieThemeResolver => {
    const resolver = CookieThemeResolver.fromApplicationContext(applicationContext, cookieName);
    applicationContext.setValue('themeResolver', resolver);
    return resolver;
};
