/**
 * @author Jeff Rose
 */
import { Route } from '@blue/router';
export interface ThemeResolver {
    resolveTheme(route: Route): string;
}
export declare abstract class AbstractThemeResolver implements ThemeResolver {
    readonly defaultThemeName: string;
    get [Symbol.toStringTag](): string;
    constructor(defaultThemeName: string);
    abstract resolveTheme(route: Route): string;
}
/**
 * @abstract
 * @class module:dispatcher.AbstractThemeResolver
 * @implements {module:dispatcher.ThemeResolver}
 */
/**
 * @member {external:string} module:dispatcher.AbstractThemeResolver#defaultThemeName
 */
/**
 * @abstract
 * @function module:dispatcher.AbstractThemeResolver#resolveTheme
 * @param {module:dispatcher.Route} route
 * @returns {external:string} The theme name
 */
/**
 * @class module:dispatcher.FixedThemeResolver
 * @extends {module:dispatcher.AbstractThemeResolver}
 */
export declare class FixedThemeResolver extends AbstractThemeResolver {
    resolveTheme(route: Route): string;
}
//# sourceMappingURL=theme-resolver.d.ts.map