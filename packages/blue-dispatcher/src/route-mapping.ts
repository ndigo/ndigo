/**
 * @author Jeff Rose
 */

import '@tsmetadata/polyfill';
import { compose } from '@blue/util/function';
import { when } from '@blue/util/logic';
import { mergeRight, objOf } from '@blue/util/object';
import { isString } from '@blue/util/types';

type RouteMappingValue = {
    value: string;
};

type RouteMappingConfiguration = RouteMappingValue & {
    name?: string;
    params?: string;
    private: boolean;
    path?: string; // Computed path combining class and method routes
};

const { defineProperty, getOwnPropertyDescriptor } = Reflect;

const defaultMapping: RouteMappingConfiguration = {
    value: '/**',
    private: false,
};

const withDefaults = mergeRight(defaultMapping);
const configurationOf = objOf('value') as (value: string) => RouteMappingValue;
const toRouteMappingConfiguration = when(isString, compose(withDefaults, configurationOf)) as (
    value: string | RouteMappingConfiguration
) => RouteMappingConfiguration;

/**
 * Helper to get metadata from class constructor
 */
function getMetadata(target: any): Record<string, any> {
    if (typeof target === 'function' && target[Symbol.metadata]) {
        return target[Symbol.metadata];
    }
    if (target && target.constructor && target.constructor[Symbol.metadata]) {
        return target.constructor[Symbol.metadata];
    }
    return {};
}

/**
 * Get route mapping from class or method
 * @param target - Class constructor or prototype
 * @param propertyKey - Optional method name
 */
export const getRouteMapping = (target: any, propertyKey?: string | symbol): RouteMappingConfiguration | undefined => {
    const metadata = getMetadata(target);
    if (propertyKey) {
        return metadata[`route:mapping:${String(propertyKey)}`];
    }
    return metadata['route:mapping'];
};

/**
 * Check if route mapping exists
 * @param target - Class constructor or prototype
 * @param propertyKey - Optional method name
 */
export const hasRouteMapping = (target: any, propertyKey?: string | symbol): boolean => {
    return getRouteMapping(target, propertyKey) !== undefined;
};

/**
 * TC39 Stage 3 decorator for route mapping
 * Works as both class and method decorator
 */
export function routeMapping(route: string | RouteMappingConfiguration = defaultMapping) {
    const conf = toRouteMappingConfiguration(route);

    return function (target: any, context: ClassDecoratorContext | ClassMethodDecoratorContext): any {
        if (context.kind === 'class') {
            // Class decorator
            context.metadata['route:mapping'] = conf;
            console.log('@RouteMapping', conf, target);
            return target;
        } else if (context.kind === 'method') {
            // Method decorator
            context.metadata[`route:mapping:${String(context.name)}`] = conf;

            // Make method enumerable so it can be discovered via for...in
            context.addInitializer(function (this: any) {
                const descriptor = getOwnPropertyDescriptor(Object.getPrototypeOf(this), context.name);
                if (descriptor && !descriptor.enumerable) {
                    defineProperty(Object.getPrototypeOf(this), context.name, {
                        ...descriptor,
                        enumerable: true,
                    });
                }
            });

            console.log('@RouteMapping', conf, target, context.name);
        }
    };
}

export const publicMapping = (route: string) => routeMapping({ value: route, private: false });

export const privateMapping = (route: string) => routeMapping({ value: route, private: true });
