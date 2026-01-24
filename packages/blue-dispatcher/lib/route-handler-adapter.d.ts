/**
 * @author Jeff Rose
 */
import { ModelAndView } from './model-and-view';
import { Controller } from './controller';
import { Route } from '@blue/router';
import { Null } from '@blue/core';
import { Initializable, $aware } from '@blue/factory';
import { RouteHandlerMethod } from './route-handler-method';
import { ApplicationContext } from '@blue/context';
import { HandlerMethodArgumentResolver } from './argument-resolver';
export interface RouteHandlerAdapter {
    handle(route: Route, handler: any): Promise<ModelAndView>;
    supports(handler: any): boolean;
}
/**
 * @function module:dispatcher.likeController
 * @param {*} value The value to be tested
 * @returns {external:boolean} Whether or not the `value` is a {@linkcode module:dispatcher.Controller|Controller}
 */
export declare const likeController: (value: any) => value is Controller;
declare const AbstractHandlerMethodAdapter_base: import("@blue/core").Constructable<import("@blue/context").ApplicationContextAware> & typeof Null;
export declare abstract class AbstractHandlerMethodAdapter extends AbstractHandlerMethodAdapter_base implements RouteHandlerAdapter {
    applicationContext: ApplicationContext;
    get [Symbol.toStringTag](): string;
    supports(handler: any): boolean;
    abstract handle(route: Route, handler: RouteHandlerMethod): Promise<ModelAndView>;
    protected abstract _supports(handler: RouteHandlerMethod): boolean;
}
/**
 * @abstract
 * @class module:dispatcher.AbstractHandlerMethodAdapter
 * @implements module:dispatcher.HandlerAdapter
 */
/**
 * This implementation expects the handler to be a {@linkcode module:dispatcher.HandlerMethod|HandlerMethod}.
 * @function module:dispatcher.AbstractHandlerMethodAdapter#supports
 * @param handler The handler instance to check
 * @returns Whether or not this adapter can adapt the given handler
 */
/**
 * @class module:dispatcher.ControllerHandlerAdapter
 * @implements module:dispatcher.HandlerAdapter
 */
export declare class ControllerHandlerAdapter implements RouteHandlerAdapter {
    get [Symbol.toStringTag](): string;
    handle(route: Route, handler: any): Promise<ModelAndView>;
    supports(handler: any): boolean;
}
/**
 * Implementation of {@link module:dispatcher.AbstractHandlerMethodAdapter} that supports {@linkcode module:dispatcher.HandlerMethod|HandlerMethods} decorated with `route:mapping` metadata. This is usually applied using {@linkcode module:router.RouteMapping|@RouteMapping}.
 * @class module:dispatcher.MetadataHandlerAdapter
 * @extends module:dispatcher.AbstractHandlerMethodAdapter
 * @implements module:core.Initializable
 */
export declare class MetadataHandlerAdapter extends AbstractHandlerMethodAdapter implements Initializable {
    argumentResolvers: HandlerMethodArgumentResolver[];
    handlers: any[];
    get [Symbol.toStringTag](): string;
    get defaultArgumentResolvers(): HandlerMethodArgumentResolver[];
    get [$aware](): boolean;
    handle(route: Route, handler: RouteHandlerMethod): Promise<ModelAndView>;
    init(...args: any[]): void;
    _supports(handler: RouteHandlerMethod): boolean;
}
export {};
//# sourceMappingURL=route-handler-adapter.d.ts.map