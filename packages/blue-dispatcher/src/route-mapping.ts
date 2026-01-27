/**
 * @author Jeff Rose
 */

import 'reflect-metadata';
import { compose, isString, mergeRight, objOf, when } from '@blue/util';

type RouteMappingValue = {
    value: string;
};

type RouteMappingConfiguration = RouteMappingValue & {
    name?: string;
    params?: string;
    private: boolean;
};

const ROUTE_MAPPING = 'route:mapping',
    defaultMapping: RouteMappingConfiguration = {
        value: '/**',
        private: false,
    },
    { defineMetadata, getMetadata, hasMetadata } = Reflect,
    withDefaults = mergeRight(defaultMapping),
    configurationOf = objOf<string>('value') as (value: string) => RouteMappingValue,
    toRouteMappingConfiguration = when<string | RouteMappingConfiguration, RouteMappingConfiguration>(
        isString,
        compose(withDefaults, configurationOf)
    );

/**
 * @param {*} value
 * @param {*} target
 * @param {string|external:symbol} [propertyKey]
 */
export const defineRouteMapping = (value, target, propertyKey: string | symbol = void 0): void =>
    defineMetadata(ROUTE_MAPPING, value, target, propertyKey);

/**
 * @param {*} target
 * @param {string|external:symbol} [propertyKey]
 * @returns {*}
 */
export const getRouteMapping = (target, propertyKey: string | symbol = void 0): any =>
    getMetadata(ROUTE_MAPPING, target, propertyKey);

/**
 * @param {*} target
 * @param {string|external:symbol} [propertyKey]
 * @returns {boolean} Whether or not the `target` and optional `propertyKey` has a route mapping defined.
 */
export const hasRouteMapping = (target, propertyKey: string | symbol = void 0): boolean =>
    hasMetadata(ROUTE_MAPPING, target, propertyKey);

/**
 * @param {string} route
 */
export const routeMapping = (route: string | RouteMappingConfiguration = defaultMapping) => {
    const conf = toRouteMappingConfiguration(route);
    return function (target: Object, propertyKey?: string | symbol, descriptor?: PropertyDescriptor): any {
        if (propertyKey) {
            defineRouteMapping(conf, target, propertyKey);
            descriptor.enumerable = true;
            console.log('@RouteMapping', conf, target, propertyKey);
            return descriptor;
        } else {
            defineRouteMapping(conf, target);
            console.log('@RouteMapping', conf, target);
            return target;
        }
    };
};

export const publicMapping = (route: string) => routeMapping({ value: route, private: false });

export const privateMapping = (route: string) => routeMapping({ value: route, private: true });
