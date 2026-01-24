/**
 * @author Jeff Rose
 */
import { RouterInterceptor } from './router-interceptor';
import { Route } from './route';
/**
 * @class module:router.RouterExecutionChain
 * @implements module:core.Serializable
 */
export default class RouterExecutionChain {
    #private;
    interceptorIndex: number;
    get [Symbol.toStringTag](): string;
    get interceptors(): RouterInterceptor[];
    constructor(chain?: RouterExecutionChain | RouterInterceptor[]);
    /**
     * @function module:router.RouterExecutionChain#addInterceptor
     * @param {module:router.RouterInterceptor} interceptor
     */
    addInterceptor(interceptor: RouterInterceptor): void;
    /**
     * @function module:router.RouterExecutionChain#addInterceptors
     * @param {external:Array<module:router.RouterInterceptor>} interceptors
     */
    addInterceptors(interceptors: RouterInterceptor[]): void;
    /**
     * @function module:router.RouterExecutionChain#applyPostRoute
     * @param {module:router.Route} route
     */
    applyPostRoute(route: Route): void;
    /**
     * @function module:router.RouterExecutionChain#applyPreRoute
     * @param {module:router.Route} route
     */
    applyPreRoute(route: Route): boolean;
}
//# sourceMappingURL=router-execution-chain.d.ts.map