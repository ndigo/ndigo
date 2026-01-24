/**
 * @author Jeff Rose
 */

import { AbstractThemeResolver } from '@blue/dispatcher';
import { Route } from '@blue/router';
import Cookies from './cookies';

/**
 * @class module:dispatcher.CookieThemeResolver
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
         * @member {external:string} module:dispatcher.CookieThemeResolver#cookieName
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
