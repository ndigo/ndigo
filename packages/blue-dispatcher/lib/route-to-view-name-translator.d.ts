/**
 * @author Jeff Rose
 */
import { Route } from '@blue/router';
export interface RouteToViewNameTranslator {
    getViewName(route: Route): string;
}
/**
 * @class module:dispatcher.DefaultRouteToViewNameTranslator
 * @implements module:router.RouteToViewNameTranslator
 */
export declare class DefaultRouteToViewNameTranslator implements RouteToViewNameTranslator {
    prefix: string;
    separator: string;
    suffix: string;
    constructor();
    /**
     * @function module:dispatcher.DefaultRouteToViewNameTranslator#getViewName
     * @param {module:router.Route} route
     */
    getViewName(route: Route): string;
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
//# sourceMappingURL=route-to-view-name-translator.d.ts.map