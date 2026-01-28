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
 * @implements {module:dispatcher.ThemeResolver}
 */
/**
 */
/**
 * @abstract
 * @param {module:dispatcher.Route} route
 * @returns {string} The theme name
 */
/**
 * @extends {module:dispatcher.AbstractThemeResolver}
 */
export declare class FixedThemeResolver extends AbstractThemeResolver {
    resolveTheme(route: Route): string;
}
//# sourceMappingURL=theme-resolver.d.ts.map