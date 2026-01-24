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
 * @interface module:router.RouteHandlerInterceptor
 */
/**
 * Callback after completion of route processing, that is, after rendering the view. Will be called on any outcome of handler execution, thus allows for proper resource cleanup.
 * @function module:router.RouteHandlerInterceptor#completeHandle
 */
/**
 * Intercept the execution of a handler. Called after RouteHandlerAdapter actually invoked the handler, but before the Dispatcher renders the view.
 * @function module:router.RouteHandlerInterceptor#postHandle
 */
/**
 * Intercept the execution of a handler. Called after HandlerMapping determined
 * an appropriate handler object, but before RouteHandlerAdapter invokes the handler.
 * @function module:router.RouteHandlerInterceptor#preHandle
 */
/**
 * @class module:dispatcher.MappedHandlerInterceptor
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUtaGFuZGxlci1pbnRlcmNlcHRvci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9yb3V0ZS1oYW5kbGVyLWludGVyY2VwdG9yLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOztHQUVHO0FBR0gsT0FBTyxFQUFlLG1CQUFtQixFQUFFLElBQUksRUFBRSxNQUFNLFlBQVksQ0FBQztBQVNwRTs7Ozs7Ozs7Ozs7OztHQWFHO0FBRUg7OztHQUdHO0FBRUg7OztHQUdHO0FBRUg7Ozs7R0FJRztBQUVIOzs7R0FHRztBQUNILE1BQU0sT0FBTyx3QkFBeUIsU0FBUSxtQkFBbUIsQ0FBQyxJQUFJLENBQUM7SUFDbkUsWUFBWSxDQUEwQjtJQUV0QyxXQUFXLENBQWM7SUFFekIsSUFBSSxXQUFXO1FBQ1gsT0FBTyxJQUFJLENBQUMsWUFBWSxDQUFDO0lBQzdCLENBQUM7SUFFRCxZQUFZLFdBQW9DLEVBQUUsZUFBeUIsRUFBRSxlQUEwQjtRQUNuRyxLQUFLLEVBQUUsQ0FBQztRQUNSLElBQUksQ0FBQyxZQUFZLEdBQUcsV0FBVyxDQUFDO1FBQ2hDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxlQUFlLENBQUMsQ0FBQztRQUN6QyxJQUFJLENBQUMsa0JBQWtCLENBQUMsZUFBZSxDQUFDLENBQUM7SUFDN0MsQ0FBQztJQUVELGNBQWMsQ0FBQyxLQUFZLEVBQUUsT0FBTyxFQUFFLFFBQWUsSUFBSTtRQUNyRCxJQUFJLENBQUMsWUFBWSxDQUFDLGNBQWMsQ0FBQyxLQUFLLEVBQUUsT0FBTyxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQzVELENBQUM7SUFFRCxVQUFVLENBQUMsS0FBWSxFQUFFLE9BQU8sRUFBRSxZQUEwQjtRQUN4RCxJQUFJLENBQUMsWUFBWSxDQUFDLFVBQVUsQ0FBQyxLQUFLLEVBQUUsT0FBTyxFQUFFLFlBQVksQ0FBQyxDQUFDO0lBQy9ELENBQUM7SUFFRCxTQUFTLENBQUMsS0FBWSxFQUFFLE9BQU87UUFDM0IsT0FBTyxJQUFJLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxLQUFLLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDdkQsQ0FBQztDQUNKO0FBRUQ7OztHQUdHIn0=