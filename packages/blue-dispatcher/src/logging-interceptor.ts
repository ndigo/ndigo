/**
 * @author Jeff Rose
 */

import { RouteHandlerInterceptor } from './route-handler-interceptor';
import { ModelAndView } from './model-and-view';
import { Route } from '@blue/router';

/**
 * A minimal logger interface for the {@link LoggingRouteHandlerInterceptor}.
 *
 * This interface is intentionally simple so that callers may supply any logger
 * implementation without depending on `@blue/telemetry`. When a `@blue/telemetry`
 * logger is provided, trace context (traceId, spanId) is automatically injected.
 */
export interface InterceptorLogger {
    info(message: string, attributes?: Record<string, unknown>): void;
    error(message: string, error?: unknown, attributes?: Record<string, unknown>): void;
}

/**
 * A standard interceptor that logs the execution time and outcome of a route handler.
 * Useful for performance monitoring and debugging.
 *
 * Accepts an optional {@link InterceptorLogger} via the constructor. When no logger
 * is provided, falls back to `console`-based logging for backward compatibility.
 */
export class LoggingRouteHandlerInterceptor implements RouteHandlerInterceptor {
    #startTimeMap: WeakMap<Route, number>;
    #logger: InterceptorLogger;

    constructor(logger?: InterceptorLogger) {
        this.#startTimeMap = new WeakMap();
        this.#logger = logger ?? {
            info(message: string): void {
                console.log(message);
            },
            error(message: string, error?: unknown): void {
                console.error(message, error ?? '');
            },
        };
    }

    async preHandle(route: Route, handler: any): Promise<boolean> {
        this.#startTimeMap.set(route, Date.now());
        this.#logger.info('[Dispatcher] -> Handling route', { 'route.path': route.path });
        return true;
    }

    async postHandle(route: Route, handler: any, modelAndView: ModelAndView): Promise<void> {
        const startTime = this.#startTimeMap.get(route);
        const duration = startTime ? Date.now() - startTime : -1;
        const viewName = modelAndView?.viewName || 'unknown';
        this.#logger.info('[Dispatcher] <- Handled route', {
            'route.path': route.path,
            'handler.duration_ms': duration,
            'view.name': viewName,
        });
    }

    async completeHandle(route: Route, handler: any, error: Error): Promise<void> {
        if (error) {
            const startTime = this.#startTimeMap.get(route);
            const duration = startTime ? Date.now() - startTime : -1;
            this.#logger.error('[Dispatcher] x- Failed route', error, {
                'route.path': route.path,
                'handler.duration_ms': duration,
            });
        }
        this.#startTimeMap.delete(route);
    }
}
