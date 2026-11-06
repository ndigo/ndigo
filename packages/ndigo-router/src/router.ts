/**
 */
import {
    RouterInterceptorRegistry,
    RouterInterceptor,
    RouterMiddleware,
    MappedRouterInterceptor,
} from './router-interceptor';
import { Route } from './route';
import { PathRoute } from './path-route';
import { getLogger } from '@ndigo/log';

const logger = getLogger('ndigo-router:router');

/**
 * A callback function type that is invoked when a route changes.
 * @param route - The new `Route` object.
 */
export type RouterCallback = (route: Route) => void;

/**
 * Invoked when a navigation's interceptor pipeline throws or an
 * `afterCompletion` hook rejects. Lets routers surface failures instead of
 * swallowing them (PWB-REV-015).
 *
 * @param error - The error raised by the pipeline.
 * @param route - The route whose navigation failed.
 */
export type RouterErrorHandler = (error: unknown, route: Route) => void;

/**
 * Options accepted by router implementations.
 */
export interface RouterOptions {
    /**
     * Navigation-error hook. Defaults to logging through the `@ndigo/log`
     * logger for `ndigo-router:router`.
     */
    onError?: RouterErrorHandler;
}

/**
 * Defines the core interface for a router, providing access to the current route and a mechanism to refresh it.
 */
export interface Router {
    readonly route: string;
    readonly callback: RouterCallback;
    refresh(): void;
    /**
     * Programmatically navigates the router to the given path.
     *
     * Implementations that support programmatic navigation (e.g., `PartitionRouter`, `HashRouter`)
     * should provide this method. When absent, callers should fall back to platform-specific
     * navigation (e.g., `history.pushState`).
     *
     * @param path - The target path to navigate to.
     * @returns `void`, `boolean` (whether a mount matched), or a `Promise<void>` depending on the implementation.
     */
    navigate?(path: string): void | boolean | Promise<void>;
}

/**
 * An abstract base class that provides common functionality for router implementations.
 * It includes mechanisms for managing route interceptors.
 */
export abstract class AbstractRouter implements Router, RouterInterceptorRegistry {
    #interceptors: RouterInterceptor[];
    #onError: RouterErrorHandler;

    constructor(options: RouterOptions = {}) {
        this.#interceptors = [];
        this.#onError =
            options.onError ??
            ((error, route) => {
                logger.error(
                    `[Router] navigation to "${route}" failed`,
                    error instanceof Error ? error : String(error)
                );
            });
    }

    abstract get route(): string;
    abstract readonly callback: RouterCallback;

    /**
     * Returns the list of registered `RouterInterceptor` instances.
     * @returns An array of `RouterInterceptor`.
     */
    protected get interceptors(): RouterInterceptor[] {
        return this.#interceptors;
    }

    /**
     * The navigation-error hook, passed to the commit pipeline so pipeline
     * failures are surfaced rather than silently swallowed. Configured via
     * {@link RouterOptions.onError}.
     */
    protected get onError(): RouterErrorHandler {
        return this.#onError;
    }

    /**
     * Adds a `RouterInterceptor` to the router. Interceptors are processed in the order they are added.
     * Duplicate interceptors are ignored.
     * @param interceptor - The `RouterInterceptor` to add.
     */
    addInterceptor(interceptor: RouterInterceptor): void {
        if (this.#interceptors.indexOf(interceptor) === -1) {
            this.#interceptors.push(interceptor);
        }
    }

    /**
     * Registers a `RouterInterceptor` or `RouterMiddleware` with optional path matching.
     * If `interceptorOrPatterns` is a string or array of strings, it defines include patterns for the interceptor.
     * @param interceptorOrPatterns - Either a `RouterInterceptor`, `RouterMiddleware`, a single include pattern string, or an array of include pattern strings.
     * @param interceptor - The `RouterInterceptor` or `RouterMiddleware` to apply when `interceptorOrPatterns` defines patterns. Required if patterns are provided.
     * @param excludePatterns - An optional array of patterns to exclude from matching.
     * @throws If `interceptor` is not provided when `interceptorOrPatterns` defines patterns.
     */
    use(
        interceptorOrPatterns: RouterInterceptor | RouterMiddleware | string | string[],
        interceptor?: RouterInterceptor | RouterMiddleware,
        excludePatterns: string[] = []
    ): void {
        if (typeof interceptorOrPatterns === 'string' || Array.isArray(interceptorOrPatterns)) {
            const includePatterns = Array.isArray(interceptorOrPatterns)
                ? interceptorOrPatterns
                : [interceptorOrPatterns];

            if (!interceptor) {
                throw new TypeError('interceptor is required for mapped middleware');
            }

            this.addInterceptor(
                new MappedRouterInterceptor(this._toRouterInterceptor(interceptor), includePatterns, excludePatterns)
            );
            return;
        }

        this.addInterceptor(this._toRouterInterceptor(interceptorOrPatterns));
    }

    /**
     * Converts a `RouterMiddleware` function into a `RouterInterceptor` object.
     * If the input is already a `RouterInterceptor`, it is returned as is.
     * @param interceptor - The `RouterInterceptor` or `RouterMiddleware` to convert.
     * @returns A `RouterInterceptor` instance.
     */
    protected _toRouterInterceptor(interceptor: RouterInterceptor | RouterMiddleware): RouterInterceptor {
        if (typeof interceptor === 'function') {
            return {
                preHandle(route) {
                    const result = interceptor(route);
                    return result !== false;
                },
            };
        }

        return interceptor;
    }

    /**
     * Refreshes the current route by re-evaluating it and invoking the router's callback.
     * This is useful for re-applying routing logic or interceptors without a full page reload.
     */
    refresh(): void {
        const currentRoute = this.route;
        if (currentRoute) {
            this.callback(new PathRoute(currentRoute));
        }
    }
}

/**
 */
