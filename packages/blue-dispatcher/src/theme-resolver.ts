/**
 * @author Jeff Rose
 */

import { Route } from '@blue/router';

export interface ThemeResolver {
    resolveTheme(route: Route): string;
}

/**
 */

/**
 * @param {module:dispatcher.Route} route
 * @returns {string} The theme name
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
export class FixedThemeResolver extends AbstractThemeResolver {
    resolveTheme(route: Route): string {
        return this.defaultThemeName;
    }
}
