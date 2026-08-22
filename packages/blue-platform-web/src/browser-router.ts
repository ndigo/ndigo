/* eslint-disable @blue/no-browser-globals-in-isomorphic -- BrowserRouter is a browser-only implementation; browser globals are intentional and expected here */

import { PathRoute } from '@blue/router';
import { AbstractRouter, RouterCallback } from '@blue/router';
import { RingBuffer } from '@blue/core';
import { RouterExecutionChain } from '@blue/router';
import { MappedRouterInterceptor, RouterInterceptor } from '@blue/router';
import { DefaultRouteTransactionManager } from './route-transaction-manager';
import { RouteTransactionManager } from '@blue/router';

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
    #lastPublicRoute: string;
    #transactionManager: RouteTransactionManager;

    readonly callback!: RouterCallback;

    get route(): string {
        return this.#route?.toString() || '';
    }

    destroyed!: boolean;

    get history(): RingBuffer<RouteTransaction> {
        return this.#history;
    }

    get transactionManager(): RouteTransactionManager {
        return this.#transactionManager;
    }

    /**
     * Creates an instance of `BrowserRouter`.
     *
     * @param callback - The `RouterCallback` to be invoked when the route changes.
     *   Called with a `PathRoute` representing the current URL path.
     */
    constructor(callback: RouterCallback) {
        super();

        defineProperty(this, 'callback', {
            value: callback,
            configurable: true,
            enumerable: false,
            writable: false,
        });

        this.#handler = (event: PopStateEvent) => this._onPopState(event);
        this.#history = new RingBuffer<RouteTransaction>(256);
        this.#transactionManager = new DefaultRouteTransactionManager();

        const currentRoute = window.location.pathname + window.location.search || '/',
            routeTx = new RouteTransaction(currentRoute, RouteAccess.PUBLIC, RouteSource.EXTERNAL);

        this.#route = new PathRoute(currentRoute);
        this.#lastPublicRoute = this.#route.toString();
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
        const success = await this._setRoute(newRoute, isPublic);
        if (success) {
            const routeAccess = isPublic ? RouteAccess.PUBLIC : RouteAccess.PRIVATE,
                routeTx = new RouteTransaction(this.route, routeAccess, RouteSource.INTERNAL);
            this.#history.put(routeTx);
            if (isPublic) {
                this.#lastPublicRoute = this.route;
                history.pushState(null, '', newRoute);
            }
            this.callback(this.#route);
        }
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
     */
    protected _onPopState(_event: PopStateEvent): void {
        const newRoute = window.location.pathname + window.location.search || '/';

        this._setRoute(newRoute, true).then((success) => {
            if (success) {
                const route = this.route,
                    routeTx = new RouteTransaction(route, RouteAccess.PUBLIC, RouteSource.EXTERNAL);
                this.#history.put(routeTx);
                this.#lastPublicRoute = route;
                this.callback(this.#route);
            }
        });
    }

    /**
     * Internal method to set a new route, apply interceptors, and manage the transaction.
     */
    protected async _setRoute(newRoute: string, syncHash = true): Promise<boolean> {
        const route = new PathRoute(newRoute),
            oldRoute = syncHash ? this.route : this.#lastPublicRoute,
            status = this.#transactionManager.getTransaction(route, oldRoute, syncHash),
            chain = new RouterExecutionChain(this._resolveInterceptors(route));

        this.#route = route;

        if (await chain.applyPreHandle(route)) {
            this.#transactionManager.commit(status);
            return true;
        }

        this.#route = new PathRoute(oldRoute);
        this.#transactionManager.rollback(status);
        return false;
    }

    /**
     * Resolves matching interceptors for the given route.
     */
    protected _resolveInterceptors(route: PathRoute): RouterInterceptor[] {
        return this.interceptors.filter((interceptor) => {
            if (interceptor instanceof MappedRouterInterceptor) {
                return interceptor.matches(route.path);
            }
            return true;
        });
    }
}