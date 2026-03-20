/**
 * @author Jeff Rose
 */

import { RouteHandlerInterceptor } from './route-handler-interceptor';
import { ModelAndView } from './model-and-view';
import { Route } from '@blue/router';

/**
 * A standard interceptor that logs the execution time and outcome of a route handler.
 * Useful for performance monitoring and debugging.
 */
export class LoggingRouteHandlerInterceptor implements RouteHandlerInterceptor {
    #startTimeMap: WeakMap<Route, number>;

    constructor() {
        this.#startTimeMap = new WeakMap();
    }

    async preHandle(route: Route, handler: any): Promise<boolean> {
        this.#startTimeMap.set(route, Date.now());
        console.log(`[Dispatcher] -> Handling route: ${route.path}`);
        return true;
    }

    async postHandle(route: Route, handler: any, modelAndView: ModelAndView): Promise<void> {
        const startTime = this.#startTimeMap.get(route);
        const duration = startTime ? Date.now() - startTime : 'unknown';
        const viewName = modelAndView?.viewName || 'unknown';
        console.log(`[Dispatcher] <- Handled route: ${route.path} in ${duration}ms. View: ${viewName}`);
    }

    async completeHandle(route: Route, handler: any, error: Error): Promise<void> {
        if (error) {
            const startTime = this.#startTimeMap.get(route);
            const duration = startTime ? Date.now() - startTime : 'unknown';
            console.error(`[Dispatcher] x- Failed route: ${route.path} in ${duration}ms. Error: ${error.message}`);
        }
        this.#startTimeMap.delete(route);
    }
}
