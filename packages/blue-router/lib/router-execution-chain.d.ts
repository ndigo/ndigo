/**
 * @author Jeff Rose
 */
import { RouterInterceptor } from './router-interceptor';
import { Route } from './route';
/**
 * @implements module:core.Serializable
 */
export default class RouterExecutionChain {
    #private;
    interceptorIndex: number;
    get [Symbol.toStringTag](): string;
    get interceptors(): RouterInterceptor[];
    constructor(chain?: RouterExecutionChain | RouterInterceptor[]);
    /**
     * @param {module:router.RouterInterceptor} interceptor
     */
    addInterceptor(interceptor: RouterInterceptor): void;
    /**
     * @param {Array<module:router.RouterInterceptor>} interceptors
     */
    addInterceptors(interceptors: RouterInterceptor[]): void;
    /**
     * @param {module:router.Route} route
     */
    applyPostRoute(route: Route): void;
    /**
     * @param {module:router.Route} route
     */
    applyPreRoute(route: Route): boolean;
}
//# sourceMappingURL=router-execution-chain.d.ts.map