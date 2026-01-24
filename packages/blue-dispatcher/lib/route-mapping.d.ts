/**
 * @author Jeff Rose
 */
import 'reflect-metadata';
type RouteMappingValue = {
    value: string;
};
type RouteMappingConfiguration = RouteMappingValue & {
    name?: string;
    params?: string;
    private: boolean;
};
/**
 * @function module:dispatcher.defineRouteMapping
 * @param {*} value
 * @param {*} target
 * @param {external:string|external:symbol} [propertyKey]
 */
export declare const defineRouteMapping: (value: any, target: any, propertyKey?: string | symbol) => void;
/**
 * @function module:dispatcher.getRouteMapping
 * @param {*} target
 * @param {external:string|external:symbol} [propertyKey]
 * @returns {*}
 */
export declare const getRouteMapping: (target: any, propertyKey?: string | symbol) => any;
/**
 * @function module:dispatcher.hasRouteMapping
 * @param {*} target
 * @param {external:string|external:symbol} [propertyKey]
 * @returns {external:boolean} Whether or not the `target` and optional `propertyKey` has a route mapping defined.
 */
export declare const hasRouteMapping: (target: any, propertyKey?: string | symbol) => boolean;
/**
 * @function module:router.RouteMapping
 * @param {external:string} route
 */
export declare const routeMapping: (route?: string | RouteMappingConfiguration) => (target: Object, propertyKey?: string | symbol, descriptor?: PropertyDescriptor) => any;
export declare const publicMapping: (route: string) => (target: Object, propertyKey?: string | symbol, descriptor?: PropertyDescriptor) => any;
export declare const privateMapping: (route: string) => (target: Object, propertyKey?: string | symbol, descriptor?: PropertyDescriptor) => any;
export {};
//# sourceMappingURL=route-mapping.d.ts.map