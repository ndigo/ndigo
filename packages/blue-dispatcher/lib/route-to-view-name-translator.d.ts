/**
 * @author Jeff Rose
 */
import { Route } from '@blue/router';
export interface RouteToViewNameTranslator {
    getViewName(route: Route): string;
}
/**
 * @implements module:router.RouteToViewNameTranslator
 */
export declare class DefaultRouteToViewNameTranslator implements RouteToViewNameTranslator {
    prefix: string;
    separator: string;
    suffix: string;
    constructor();
    /**
     * @param {module:router.Route} route
     */
    getViewName(route: Route): string;
}
/**
 */
/**
 */
/**
 */
//# sourceMappingURL=route-to-view-name-translator.d.ts.map