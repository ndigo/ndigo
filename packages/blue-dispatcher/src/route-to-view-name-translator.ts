/**
 * @author Jeff Rose
 */

import { Route } from '@blue/router';

/**
 * Translates a route into a view name.
 */
export interface RouteToViewNameTranslator {
    /**
     * Resolve the view name for a route.
     *
     * @param route - The current route.
     * @returns The resolved view name.
     */
    getViewName(route: Route): string;
}

const { defineProperty } = Reflect,
    slash = '/';

export class DefaultRouteToViewNameTranslator implements RouteToViewNameTranslator {
    /**
     * Prefix added to every translated view name.
     */
    prefix!: string;

    /**
     * Separator used when rewriting the route path.
     */
    separator!: string;

    /**
     * Suffix added to every translated view name.
     */
    suffix!: string;

    /**
     * Create a translator with empty prefix and suffix.
     */
    constructor() {
        this.prefix = '';
        this.separator = slash;
        this.suffix = '';
    }

    /**
     * Translate a route path into a view name.
     *
     * @param route - The current route.
     * @returns The translated view name.
     */
    getViewName(route: Route): string {
        let viewName: string = `${this.prefix}${route.path}${this.suffix}`;

        if (this.separator !== slash) {
            viewName = viewName.replace(slash, this.separator);
        }

        return viewName;
    }
}

/**
 */

/**
 */

/**
 */
