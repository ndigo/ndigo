/**
 * @author Jeff Rose
 */
import { RouteHandlerInterceptor } from './route-handler-interceptor';
import { ModelAndView } from './model-and-view';
import { Route } from '@blue/router';
/**
 */
export default class RouteHandlerExecutionChain {
    #private;
    handler: object;
    interceptorIndex: number;
    get [Symbol.toStringTag](): string;
    get interceptors(): RouteHandlerInterceptor[];
    constructor(handler: object | RouteHandlerExecutionChain, interceptors?: RouteHandlerInterceptor[]);
    /**
     * @param {module:router.RouteHandlerInterceptor} interceptor
     */
    addInterceptor(interceptor: RouteHandlerInterceptor): void;
    /**
     * @param {Array<module:router.RouteHandlerInterceptor>} interceptors
     */
    addInterceptors(interceptors: RouteHandlerInterceptor[]): void;
    /**
     * @param {module:router.Route} route
     * @param {module:dispatcher.ModelAndView} mv
     */
    applyPostHandle(route: Route, mv: ModelAndView): void;
    /**
     * @param {module:router.Route} route
     */
    applyPreHandle(route: Route): boolean;
    /**
     * @param {module:router.Route} route
     * @param {Error} error
     */
    triggerCompleteHandle(route: Route, error?: Error): void;
}
//# sourceMappingURL=route-handler-execution-chain.d.ts.map