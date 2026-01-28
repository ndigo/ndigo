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
 * @param {*} value
 * @param {*} target
 * @param {string|external:symbol} [propertyKey]
 */
export declare const defineRouteMapping: (value: any, target: any, propertyKey?: string | symbol) => void;
/**
 * @param {*} target
 * @param {string|external:symbol} [propertyKey]
 * @returns {*}
 */
export declare const getRouteMapping: (target: any, propertyKey?: string | symbol) => any;
/**
 * @param {*} target
 * @param {string|external:symbol} [propertyKey]
 * @returns {boolean} Whether or not the `target` and optional `propertyKey` has a route mapping defined.
 */
export declare const hasRouteMapping: (target: any, propertyKey?: string | symbol) => boolean;
/**
 * @param {string} route
 */
export declare const routeMapping: (route?: string | RouteMappingConfiguration) => (target: Object, propertyKey?: string | symbol, descriptor?: PropertyDescriptor) => any;
export declare const publicMapping: (route: string) => (target: Object, propertyKey?: string | symbol, descriptor?: PropertyDescriptor) => any;
export declare const privateMapping: (route: string) => (target: Object, propertyKey?: string | symbol, descriptor?: PropertyDescriptor) => any;
export {};
//# sourceMappingURL=route-mapping.d.ts.map