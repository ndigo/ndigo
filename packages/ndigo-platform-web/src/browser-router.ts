/**
 * History-API router implementation for browser applications.
 */
/* eslint-disable internal/no-browser-globals-in-isomorphic -- BrowserRouter is a browser-only implementation; browser globals are intentional and expected here */

import { PathRoute } from '@ndigo/router';
import { AbstractRouter, RouterCallback } from '@ndigo/router';
import { RingBuffer } from '@ndigo/core';
import { RouterExecutionChain } from '@ndigo/router';
import { MappedRouterInterceptor, RouterInterceptor } from '@ndigo/router';
import type { RouterOptions } from '@ndigo/router';
import { commitRoute } from './_commit-route';

/**
 * A type alias for the native `PopStateEvent` handler function.
 */
type PopStateHandler = (event: PopStateEvent) => void;

/**
 * Defines the source of a route change.
 */
enum RouteSource {
    INTERNAL = 'internal',
    EXTERNAL = 'external',
}

/**
 * Defines the access level of a route.
 */
enum RouteAccess {
    PUBLIC = 'public',
    PRIVATE = 'private',
}

/**
 * Represents a single route transaction for history tracking.
 */
class RouteTransaction {
    readonly route: string;
    readonly access: RouteAccess;
    readonly source: RouteSource;

    constructor(route: string, access: RouteAccess, source: RouteSource) {
        this.route = route;
        this.access = access;
        this.source = source;
    }
}

const { defineProperty } = Reflect;

/**
 * A History API-based router implementation for browser environments.
 *
 * Uses `pushState`/`popstate` for clean URLs without hash fragments.
 * Follows the same pattern as `HashRouter` but uses the History API.
 *
 * @example
 * ```ts
 * const router = new BrowserRouter((route) => {
 *   dispatcher.dispatch(route);
 * });
 * ```
 */
export class BrowserRouter extends AbstractRouter {
    #handler: PopStateHandler;
    #history: RingBuffer<RouteTransaction>;
    #route: PathRoute;
    /**
     * Serializes navigations so concurrent `setRoute` calls (and external
     * `popstate` dispatches) cannot interleave across their interceptor
     * awaits and drop an earlier navigation (PWB-REV-005).
     */
    #navigation: Promise<unknown>;

    /** The callback invoked with the current route after a navigation. */
    readonly callback!: RouterCallback;

    /** The current route's string form. */
    get route(): string {
        return this.#route?.toString() || '';
    }

    /** Whether the router has been destroyed. */
    destroyed!: boolean;

    /** Navigation history, newest first. */
    get history(): RingBuffer<RouteTransaction> {
        return this.#history;
    }

    /**
     * Creates an instance of `BrowserRouter`.
     *
     * @param callback - The `RouterCallback` to be invoked when the route changes.
     *   Called with a `PathRoute` representing the current URL path.
     * @param options - Router options, e.g. the navigation-error hook.
     */
    constructor(callback: RouterCallback, options: RouterOptions = {}) {
        super(options);

        defineProperty(this, 'callback', {
            value: callback,
            configurable: true,
            enumerable: false,
            writable: false,
        });

        this.#handler = (event: PopStateEvent) => this._onPopState(event);
        this.#history = new RingBuffer<RouteTransaction>(256);
        this.#navigation = Promise.resolve();

        const currentRoute = window.location.pathname + window.location.search || '/',
            routeTx = new RouteTransaction(currentRoute, RouteAccess.PUBLIC, RouteSource.EXTERNAL);

        this.#route = new PathRoute(currentRoute);
        this.#history.put(routeTx);

        defineProperty(this, 'destroyed', {
            value: false,
            configurable: true,
            enumerable: false,
            writable: false,
        });

        addEventListener('popstate', this.#handler);
    }

    /**
     * Destroys the router by removing its `popstate` event listener.
     */
    destroy(): void {
        if (!this.destroyed) {
            defineProperty(this, 'destroyed', {
                value: true,
                configurable: true,
                enumerable: false,
                writable: false,
            });

            removeEventListener('popstate', this.#handler);
        }
    }

    /**
     * Programmatically sets a new route.
     *
     * Updates the browser URL via `pushState` when `isPublic` is `true`.
     *
     * @param newRoute - The new route string to set.
     * @param isPublic - `true` to update the browser URL, `false` for internal changes.
     * @returns A promise that resolves when the route has been processed.
     */
    async setRoute(newRoute: string, isPublic = true): Promise<void> {
        await this.#serialize(() => this.#applyNavigation(newRoute, isPublic, RouteSource.INTERNAL));
    }

    /**
     * Refreshes the current route by re-invoking the callback.
     */
    refresh(): void {
        if (this.#route) {
            this.callback(this.#route);
        }
    }

    /**
     * Programmatically navigates to the given path.
     *
     * Updates the browser URL and triggers the routing pipeline.
     *
     * @param path - The target path to navigate to.
     * @returns A promise that resolves when the route has been processed.
     */
    navigate(path: string): Promise<void> {
        return this.setRoute(path, true);
    }

    /**
     * Handles the native `popstate` event (back/forward navigation).
     *
     * @param _event - The popstate event (unused; the URL is read directly).
     */
    protected _onPopState(_event: PopStateEvent): void {
        const newRoute = window.location.pathname + window.location.search || '/';

        void this.#serialize(() => this.#applyNavigation(newRoute, true, RouteSource.EXTERNAL)).catch(
            (error: unknown) => this.onError(error, new PathRoute(newRoute))
        );
    }

    /**
     * Runs one navigation to completion and records it: commits the route,
     * appends a history transaction, pushes the URL for public routes, and
     * invokes the callback. A rejection or pipeline failure is a no-op here —
     * `commitRoute` already restored the previous route.
     */
    async #applyNavigation(newRoute: string, isPublic: boolean, source: RouteSource): Promise<void> {
        const success = await this._setRoute(newRoute, isPublic);
        if (!success) {
            return;
        }

        const routeAccess = isPublic ? RouteAccess.PUBLIC : RouteAccess.PRIVATE,
            routeTx = new RouteTransaction(this.route, routeAccess, source);
        this.#history.put(routeTx);
        if (isPublic) {
            history.pushState(null, '', newRoute);
        }
        this.callback(this.#route);
    }

    /**
     * Chains navigation work onto the single-flight queue so concurrent
     * navigations run one at a time in call order.
     */
    #serialize<T>(task: () => Promise<T>): Promise<T> {
        const run = this.#navigation.then(task, task);
        this.#navigation = run.then(
            () => undefined,
            () => undefined
        );
        return run;
    }

    /**
     * Internal method to set a new route, apply interceptors, and manage the transaction.
     *
     * Runs the full interceptor pipeline (`preHandle` → `postHandle` →
     * `afterCompletion`); the route is only committed once `preHandle` accepts
     * it and is restored to the pre-call route when the route change is
     * rejected or fails.
     *
     * @param newRoute - The target path.
     * @param _syncHash - Accepted for API parity; the browser router owns the URL.
     * @returns Whether the route was committed.
     */
    protected async _setRoute(newRoute: string, _syncHash = true): Promise<boolean> {
        const route = new PathRoute(newRoute),
            oldRoute = this.route,
            chain = new RouterExecutionChain(this._resolveInterceptors(route));

        return commitRoute(
            route,
            chain,
            () => {
                this.#route = route;
            },
            () => {
                this.#route = new PathRoute(oldRoute);
            },
            (error, failedRoute) => this.onError(error, failedRoute)
        );
    }

    /**
     * Resolves matching interceptors for the given route.
     *
     * Mapped interceptors are matched with named-parameter support, and their
     * parameters are bound onto the route before any phase runs.
     *
     * @param route - The route being navigated to.
     * @returns The interceptors that apply to the route.
     */
    protected _resolveInterceptors(route: PathRoute): RouterInterceptor[] {
        return this.interceptors.filter((interceptor) => {
            if (interceptor instanceof MappedRouterInterceptor) {
                const matches = interceptor.matchesRoute(route);
                if (matches) {
                    interceptor.resolveRouteParams(route);
                }
                return matches;
            }

            return true;
        });
    }
}
