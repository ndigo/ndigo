/**
 * @module blue-dispatcher
 * @since 1.0.0
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
    /**
     * Log an informational message.
     *
     * @param message - The log message.
     * @param attributes - Structured attributes for the event.
     */
    info(message: string, attributes?: Record<string, unknown>): void;

    /**
     * Log an error message.
     *
     * @param message - The log message.
     * @param error - The error, if any.
     * @param attributes - Structured attributes for the event.
     */
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
    /**
     * Route start timestamps used to compute duration.
     */
    #startTimeMap: WeakMap<Route, number>;

    /**
     * Logger used to emit interceptor events.
     */
    #logger: InterceptorLogger;

    /**
     * Create a logging interceptor.
     *
     * @param logger - Optional structured logger implementation.
     */
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

    /**
     * Record the start time and emit a "route started" log entry.
     *
     * @param route - The current route.
     * @param handler - The route handler.
     * @returns `true` to continue execution.
     */
    async preHandle(route: Route, handler: object | undefined): Promise<boolean> {
        this.#startTimeMap.set(route, Date.now());
        this.#logger.info('[Dispatcher] -> Handling route', { 'route.path': route.path });
        return true;
    }

    /**
     * Emit a completion log entry after successful handler execution.
     *
     * @param route - The current route.
     * @param handler - The route handler.
     * @param modelAndView - The model and view returned by the handler.
     */
    async postHandle(route: Route, handler: object | undefined, modelAndView: ModelAndView): Promise<void> {
        const startTime = this.#startTimeMap.get(route);
        const duration = startTime ? Date.now() - startTime : -1;
        const viewName = modelAndView?.viewName || 'unknown';
        this.#logger.info('[Dispatcher] <- Handled route', {
            'route.path': route.path,
            'handler.duration_ms': duration,
            'view.name': viewName,
        });
    }

    /**
     * Emit a failure log entry and clear the recorded start time.
     *
     * @param route - The current route.
     * @param handler - The route handler.
     * @param error - The error thrown during execution.
     */
    async completeHandle(route: Route, handler: object | undefined, error: Error): Promise<void> {
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
