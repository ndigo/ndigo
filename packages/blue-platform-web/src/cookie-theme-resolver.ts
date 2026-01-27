/**
 * @author Jeff Rose
 */

import { AbstractThemeResolver } from '@blue/dispatcher';
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

    constructor(cookieName: string, defaultThemeName: string) {
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
}
