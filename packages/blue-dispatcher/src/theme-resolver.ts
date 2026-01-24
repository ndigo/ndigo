/**
 * @author Jeff Rose
 */

import { Route } from '@blue/router';

export interface ThemeResolver {
    resolveTheme(route: Route): string;
}

/**
 * @interface module:dispatcher.ThemeResolver
 */

/**
 * @function module:dispatcher.ThemeResolver#resolveTheme
 * @param {module:dispatcher.Route} route
 * @returns {external:string} The theme name
 */

const { defineProperty } = Reflect;

export abstract class AbstractThemeResolver implements ThemeResolver {
    readonly defaultThemeName: string;

    get [Symbol.toStringTag](): string {
        return 'ThemeResolver';
    }

    constructor(defaultThemeName: string) {
        defineProperty(this, 'defaultThemeName', {
            value: defaultThemeName,
            configurable: true,
            enumerable: false,
            writable: false,
        });
    }

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
export class FixedThemeResolver extends AbstractThemeResolver {
    resolveTheme(route: Route): string {
        return this.defaultThemeName;
    }
}
