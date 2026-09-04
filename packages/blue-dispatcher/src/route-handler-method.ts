/**
 * @author Jeff Rose
 */

import { Factory, likeFactory } from '@blue/factory';
import { Route } from '@blue/router';
import { Serializable, getSymbolMetadata } from '@blue/core';
import { type } from '@blue/util/types';
import { HandlerMethodArgumentResolver } from './argument-resolver';
import { MethodParameter } from './route-parameter';
import { getRouteMapping } from './route-mapping';
import { getFunctionParamNames } from './_decorator-util';

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

export class RouteHandlerMethod implements HandlerMethod, Serializable {
    readonly factory!: Factory | null;
    readonly name!: string | null;
    readonly handler!: object;
    readonly method!: string;

    parameters!: MethodParameter[];
    argumentResolvers!: HandlerMethodArgumentResolver[];

    constructor(handler: object, method: string, ...args: any[]);
    constructor(factory: Factory, name: string, method: string, ...args: any[]);
    constructor(factoryOrHandler: Factory | object, nameOrMethod: string, ...args: any[]) {
        if (likeFactory(factoryOrHandler)) {
            this.factory = factoryOrHandler;
            this.name = nameOrMethod;
            this.handler = this.factory.getInstance(this.name);
            this.method = args.shift();
        } else {
            this.factory = null;
            this.name = null;
            this.handler = factoryOrHandler;
            this.method = nameOrMethod;
        }

        this.parameters = args.length ? args : [];
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
        } else {
            // No @routeParams metadata — check for an implicit route-named
            // parameter (e.g. `handleIndex(route: Route)`). Mirrors Spring's
            // implicit resolved-arg injection; without this the route is
            // `undefined`. The @traced wrapper destroys the signature, so use
            // the original function preserved in metadata when present.
            const original =
                getSymbolMetadata(this.handler)[`telemetry:traced:${String(this.method)}:original`] ??
                (this.handler as Record<string, unknown>)[this.method];
            const paramNames = getFunctionParamNames(original as Function);
            const routeParamIndex = paramNames.findIndex((name) => name === 'route' || name === 'request' || name === 'req');
            if (routeParamIndex !== -1) {
                args[routeParamIndex] = route;
            }
        }

        return (this.handler as any)[this.method](...args);
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
