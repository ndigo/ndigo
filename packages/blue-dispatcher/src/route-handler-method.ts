/**
 * @author Jeff Rose
 */

import { Factory, likeFactory } from '@blue/factory';
import { Route } from '@blue/router';
import { Serializable } from '@blue/core';
import { type } from '@blue/util/types';
import { HandlerMethodArgumentResolver } from './argument-resolver';
import { MethodParameter } from './route-parameter';
import { getRouteMapping } from './route-mapping';

export interface Invocable {
    invoke<T = any>(...args: any): T;
}

export interface HandlerMethod extends Invocable {
    invoke<ModelAndView>(route: Route, ...args: any): ModelAndView;
}

export interface RouteHandlerMethodMappingNamingStrategy<T = any> {
    getName(handlerMethod: RouteHandlerMethod, mapping: T): string;
}

/**
 */

/**
 * Encapsulates information about a handler method consisting of a `method` and `handler`.
 * @extends module:dispatcher.Invocable
 */

/**
 * A strategy for assigning a name to a route handler method's mapping.
 *
 * The strategy can be configured on {@link AbstractHandlerMethodMapping|AbstractHandlerMethodMapping}.
 * It is used to assign a name to the mapping of every registered handler method.
 */

/**
 * @param {*} handlerMethod
 * @param {*} mapping
 * @returns {string} The name
 */

const { defineProperty } = Reflect;

/**
 * @implements module:dispatcher.HandlerMethod
 * @implements module:core.Serializable
 */
export class RouteHandlerMethod implements HandlerMethod, Serializable {
    readonly factory: Factory;
    readonly name: string;
    readonly handler: object;
    readonly method: string;

    parameters: MethodParameter[];
    argumentResolvers: HandlerMethodArgumentResolver[];

    constructor(handler: object, method: string, ...args: any[]);
    constructor(factory: Factory, name: string, method: string, ...args: any[]);
    constructor(factoryOrHandler: Factory | object, nameOrMethod: string, ...args: any[]) {
        /**
         */

        /**
         */

        /**
         */

        /**
         */

        /**
         */

        if (likeFactory(factoryOrHandler)) {
            defineProperty(this, 'factory', {
                value: factoryOrHandler,
                configurable: true,
                enumerable: false,
                writable: false,
            });
            defineProperty(this, 'name', {
                value: nameOrMethod,
                configurable: true,
                enumerable: false,
                writable: false,
            });
            defineProperty(this, 'handler', {
                value: this.factory.getInstance(this.name),
                configurable: true,
                enumerable: false,
                writable: false,
            });
            defineProperty(this, 'method', {
                value: args.shift(),
                configurable: true,
                enumerable: false,
                writable: false,
            });
        } else {
            defineProperty(this, 'factory', {
                value: null,
                configurable: true,
                enumerable: false,
                writable: false,
            });
            defineProperty(this, 'name', {
                value: null,
                configurable: true,
                enumerable: false,
                writable: false,
            });
            defineProperty(this, 'handler', {
                value: factoryOrHandler,
                configurable: true,
                enumerable: false,
                writable: false,
            });
            defineProperty(this, 'method', {
                value: nameOrMethod,
                configurable: true,
                enumerable: false,
                writable: false,
            });
        }

        defineProperty(this, 'parameters', {
            value: args.length ? args : [],
            configurable: true,
            enumerable: false,
            writable: true,
        });
    }

    /**
     * @param {module:router.Request} route
     * @returns {module:dispatcher.ModelAndView}
     */
    invoke<ModelAndView>(route: Route, ...foo: any[]): ModelAndView {
        /**
         * * Hardcoding route as a parameter is a bit of a cop-out. It would be better to allow them to pick parameters, etc. as arguments. -JBR
         */

        const { argumentResolvers, parameters } = this,
            parametersLength = parameters.length,
            args = new Array(parametersLength),
            mapping = getRouteMapping(this.handler, this.method);
        if (parametersLength) {
            for (let index = 0; index < parametersLength; index++) {
                const parameter = parameters[index],
                    resolver = argumentResolvers.find((resolver) => resolver.supportsParameter(parameter));

                args[index] = resolver ? resolver.resolveArgument(parameter, route, mapping) : void 0;
            }
        }

        return this.handler[this.method](...args);
    }

    /**
     * @returns {string}
     */
    toString(): string {
        return `${type(this.handler)}#${this.method}( ${JSON.stringify(this.parameters)} )`;
    }
}

/**
 * @extends module:router.RouteHandlerMethod
 */
export class ErrorHandlerMethod extends RouteHandlerMethod {
    invoke<ModelAndView>(route: Route, error: Error, handlerMethod: RouteHandlerMethod): ModelAndView {
        return super.invoke(route, error, handlerMethod);
    }
}
