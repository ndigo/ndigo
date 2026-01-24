/**
 * @author Jeff Rose
 */
import { RouteHandlerInterceptor } from './route-handler-interceptor';
import { ModelAndView } from './model-and-view';
import { Route } from '@blue/router';
/**
 * @class module:dispatcher.RouteHandlerExecutionChain
 */
export default class RouteHandlerExecutionChain {
    #private;
    handler: object;
    interceptorIndex: number;
    get [Symbol.toStringTag](): string;
    get interceptors(): RouteHandlerInterceptor[];
    constructor(handler: object | RouteHandlerExecutionChain, interceptors?: RouteHandlerInterceptor[]);
    /**
     * @function module:dispatcher.RouteHandlerExecutionChain#addInterceptor
     * @param {module:router.RouteHandlerInterceptor} interceptor
     */
    addInterceptor(interceptor: RouteHandlerInterceptor): void;
    /**
     * @function module:dispatcher.RouteHandlerExecutionChain#addInterceptors
     * @param {external:Array<module:router.RouteHandlerInterceptor>} interceptors
     */
    addInterceptors(interceptors: RouteHandlerInterceptor[]): void;
    /**
     * @function module:dispatcher.RouteHandlerExecutionChain#applyPostHandle
     * @param {module:router.Route} route
     * @param {module:dispatcher.ModelAndView} mv
     */
    applyPostHandle(route: Route, mv: ModelAndView): void;
    /**
     * @function module:dispatcher.RouteHandlerExecutionChain#applyPreHandle
     * @param {module:router.Route} route
     */
    applyPreHandle(route: Route): boolean;
    /**
     * @function module:dispatcher.RouteHandlerExecutionChain#triggerCompleteHandle
     * @param {module:router.Route} route
     * @param {external:Error} error
     */
    triggerCompleteHandle(route: Route, error?: Error): void;
}
//# sourceMappingURL=route-handler-execution-chain.d.ts.map