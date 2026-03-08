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
    readonly cookieName: string;

    get [Symbol.toStringTag](): string {
        return `CookieThemeResolver:${this.cookieName}`;
    }

    constructor(cookieName: string = 'theme', defaultThemeName: string = 'default') {
        super(defaultThemeName);
        /**
         */
        Reflect.defineProperty(this, 'cookieName', {
            value: cookieName,
            configurable: true,
            enumerable: false,
            writable: false,
        });
    }

    resolveTheme(route: Route): string {
        // @ts-ignore: ¯\_(ツ)_/¯
        const themeName: string = (Cookies.get(this.cookieName) as string) || this.defaultThemeName;
        return themeName;
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
