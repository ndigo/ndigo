/**
 * @author Jeff Rose
 */
import { Factory } from '@blue/factory';
import { Route } from '@blue/router';
import { Serializable } from '@blue/core';
import { HandlerMethodArgumentResolver } from './argument-resolver';
import { MethodParameter } from './route-parameter';
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
 * @implements module:dispatcher.HandlerMethod
 * @implements module:core.Serializable
 */
export declare class RouteHandlerMethod implements HandlerMethod, Serializable {
    readonly factory: Factory;
    readonly name: string;
    readonly handler: object;
    readonly method: string;
    parameters: MethodParameter[];
    argumentResolvers: HandlerMethodArgumentResolver[];
    constructor(handler: object, method: string, ...args: any[]);
    constructor(factory: Factory, name: string, method: string, ...args: any[]);
    /**
     * @param {module:router.Request} route
     * @returns {module:dispatcher.ModelAndView}
     */
    invoke<ModelAndView>(route: Route, ...foo: any[]): ModelAndView;
    /**
     * @returns {string}
     */
    toString(): string;
}
/**
 * @extends module:router.RouteHandlerMethod
 */
export declare class ErrorHandlerMethod extends RouteHandlerMethod {
    invoke<ModelAndView>(route: Route, error: Error, handlerMethod: RouteHandlerMethod): ModelAndView;
}
//# sourceMappingURL=route-handler-method.d.ts.map