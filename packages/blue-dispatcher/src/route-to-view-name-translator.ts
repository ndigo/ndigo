/**
 * @author Jeff Rose
 */

import { Route } from '@blue/router';

export interface RouteToViewNameTranslator {
    getViewName(route: Route): string;
}

/**
 * @interface module:router.RouteToViewNameTranslator
 */

/**
 * @function module:router.RouteToViewNameTranslator#getViewName
 * @param {module:router.Route} route
 * @returns {external:string}
 */

const { defineProperty } = Reflect,
    slash = '/';

/**
 * @class module:dispatcher.DefaultRouteToViewNameTranslator
 * @implements module:router.RouteToViewNameTranslator
 */
export class DefaultRouteToViewNameTranslator implements RouteToViewNameTranslator {
    prefix: string;
    separator: string;
    suffix: string;

    constructor() {
        defineProperty(this, 'prefix', {
            value: '',
            configurable: true,
            enumerable: false,
            writable: true,
        });
        defineProperty(this, 'separator', {
            value: slash,
            configurable: true,
            enumerable: false,
            writable: true,
        });
        defineProperty(this, 'suffix', {
            value: '',
            configurable: true,
            enumerable: false,
            writable: true,
        });
    }

    /**
     * @function module:dispatcher.DefaultRouteToViewNameTranslator#getViewName
     * @param {module:router.Route} route
     */
    getViewName(route: Route): string {
        console.log('DefaultRouteToViewNameTranslator::getViewName', route);
        let viewName: string = `${this.prefix}${route.path}${this.suffix}`;

        if (this.separator !== slash) {
            viewName = viewName.replace(slash, this.separator);
        }

        return viewName;
    }
}

/**
 * @member {external:string} module:dispatcher.DefaultRouteToViewNameTranslator#prefix=''
 */

/**
 * @member {external:string} module:dispatcher.DefaultRouteToViewNameTranslator#separator='/'
 */

/**
 * @member {external:string} module:dispatcher.DefaultRouteToViewNameTranslator#suffix=''
 */
