/**
 * @author Jeff Rose
 */
import { AsPathMatcherFilter, Null } from '@blue/core';
/**
 * Workflow interface that allows for customized handler execution chains.
 * Applications can register any number of existing or custom interceptors
 * for certain groups of handlers, to add common preprocessing behavior
 * without needing to modify each handler implementation.
 *
 * A `RouteHandlerInterceptor` gets called before the appropriate `RouteHandlerAdapter`
 * triggers the execution of the handler itself. This mechanism can be used
 * for a large field of preprocessing aspects, e.g. for authorization checks,
 * or common handler behavior like locale or theme changes. Its main purpose
 * is to allow for factoring out repetitive handler code.
 *
 */
/**
 * Callback after completion of route processing, that is, after rendering the view. Will be called on any outcome of handler execution, thus allows for proper resource cleanup.
 */
/**
 * Intercept the execution of a handler. Called after RouteHandlerAdapter actually invoked the handler, but before the Dispatcher renders the view.
 */
/**
 * Intercept the execution of a handler. Called after HandlerMapping determined
 * an appropriate handler object, but before RouteHandlerAdapter invokes the handler.
 */
/**
 * @implements module:router.RouteHandlerInterceptor
 */
export class MappedHandlerInterceptor extends AsPathMatcherFilter(Null) {
    #interceptor;
    pathMatcher;
    get interceptor() {
        return this.#interceptor;
    }
    constructor(interceptor, includePatterns, excludePatterns) {
        super();
        this.#interceptor = interceptor;
        this.setExcludePatterns(excludePatterns);
        this.setIncludePatterns(includePatterns);
    }
    completeHandle(route, handler, error = null) {
        this.#interceptor.completeHandle(route, handler, error);
    }
    postHandle(route, handler, modelAndView) {
        this.#interceptor.postHandle(route, handler, modelAndView);
    }
    preHandle(route, handler) {
        return this.#interceptor.preHandle(route, handler);
    }
}
/**
 * * Developers Notes
 * ? Should we rename pre-, post-, and complete- handle? before-, after-, complete-?
 */
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUtaGFuZGxlci1pbnRlcmNlcHRvci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9yb3V0ZS1oYW5kbGVyLWludGVyY2VwdG9yLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOztHQUVHO0FBR0gsT0FBTyxFQUFlLG1CQUFtQixFQUFFLElBQUksRUFBRSxNQUFNLFlBQVksQ0FBQztBQVNwRTs7Ozs7Ozs7Ozs7O0dBWUc7QUFFSDs7R0FFRztBQUVIOztHQUVHO0FBRUg7OztHQUdHO0FBRUg7O0dBRUc7QUFDSCxNQUFNLE9BQU8sd0JBQXlCLFNBQVEsbUJBQW1CLENBQUMsSUFBSSxDQUFDO0lBQ25FLFlBQVksQ0FBMEI7SUFFdEMsV0FBVyxDQUFjO0lBRXpCLElBQUksV0FBVztRQUNYLE9BQU8sSUFBSSxDQUFDLFlBQVksQ0FBQztJQUM3QixDQUFDO0lBRUQsWUFBWSxXQUFvQyxFQUFFLGVBQXlCLEVBQUUsZUFBMEI7UUFDbkcsS0FBSyxFQUFFLENBQUM7UUFDUixJQUFJLENBQUMsWUFBWSxHQUFHLFdBQVcsQ0FBQztRQUNoQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsZUFBZSxDQUFDLENBQUM7UUFDekMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLGVBQWUsQ0FBQyxDQUFDO0lBQzdDLENBQUM7SUFFRCxjQUFjLENBQUMsS0FBWSxFQUFFLE9BQU8sRUFBRSxRQUFlLElBQUk7UUFDckQsSUFBSSxDQUFDLFlBQVksQ0FBQyxjQUFjLENBQUMsS0FBSyxFQUFFLE9BQU8sRUFBRSxLQUFLLENBQUMsQ0FBQztJQUM1RCxDQUFDO0lBRUQsVUFBVSxDQUFDLEtBQVksRUFBRSxPQUFPLEVBQUUsWUFBMEI7UUFDeEQsSUFBSSxDQUFDLFlBQVksQ0FBQyxVQUFVLENBQUMsS0FBSyxFQUFFLE9BQU8sRUFBRSxZQUFZLENBQUMsQ0FBQztJQUMvRCxDQUFDO0lBRUQsU0FBUyxDQUFDLEtBQVksRUFBRSxPQUFPO1FBQzNCLE9BQU8sSUFBSSxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsS0FBSyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQ3ZELENBQUM7Q0FDSjtBQUVEOzs7R0FHRyJ9