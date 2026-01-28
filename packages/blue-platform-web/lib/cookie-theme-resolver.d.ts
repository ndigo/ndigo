/**
 * @author Jeff Rose
 */
import { AbstractThemeResolver } from '@blue/dispatcher';
import { Route } from '@blue/router';
/**
 * @extends module:dispatcher.AbstractThemeResolver
 */
export declare class CookieThemeResolver extends AbstractThemeResolver {
    readonly cookieName: string;
    get [Symbol.toStringTag](): string;
    constructor(cookieName: string, defaultThemeName: string);
    resolveTheme(route: Route): string;
}
//# sourceMappingURL=cookie-theme-resolver.d.ts.map