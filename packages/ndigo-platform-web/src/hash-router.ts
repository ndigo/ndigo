/**
 * @since 1.0.0
 * @author Jeff Rose
 */
/* eslint-disable internal/no-browser-globals-in-isomorphic -- HashRouter is a browser-only implementation; browser globals are intentional and expected here */

import { PathRoute } from '@ndigo/router';
import { AbstractRouter, RouterCallback } from '@ndigo/router';
import { RingBuffer } from '@ndigo/core';
import { RouterExecutionChain } from '@ndigo/router';
import { MappedRouterInterceptor, RouterInterceptor } from '@ndigo/router';
import type { RouterOptions } from '@ndigo/router';
import { commitRoute } from './_commit-route';

//type RouteSource = 'private' | 'public' | 'external';
//type RouteResult = 'aborted' | 'completed';
//type RouteTransaction = Route & { source: RouteSource; result: RouteResult };
/**
 * A type alias for the native `HashChangeEvent` handler function.
 * @param event - The `HashChangeEvent` object.
 * @since 1.0.0
 */
type HashChangeHandler = (event: HashChangeEvent) => void;
/**
 * A type alias for a `RingBuffer` that stores `RouteTransaction` objects, representing the route history.
 * @since 1.0.0
 */
type RouteHistory = RingBuffer<RouteTransaction>;

/**
 * Defines the access level of a route, indicating whether it's public or private.
 * @since 1.0.0
 */
enum RouteAccess {
    PUBLIC,
    PRIVATE,
}

/**
 * Defines the source of a route change, indicating whether it's external (e.g., browser navigation) or internal (e.g., programmatic).
 * @since 1.0.0
 */
enum RouteSource {
    EXTERNAL,
    INTERNAL,
}

const { defineProperty } = Reflect,
    removeFirstCharacter = (value: string): string => value.slice(1),
    extractRouteFromURL = (url: string): string => new URL(url).hash.slice(1);

/**
 * Represents a single route transaction, capturing the route, its access level, and its source.
 * @since 1.0.0
 */
class RouteTransaction {
    route!: string;
    access!: RouteAccess;
    source!: RouteSource;

    /**
     * Creates an instance of `RouteTransaction`.
     * @param route - The route string involved in the transaction.
     * @param access - The `RouteAccess` level of the route.
     * @param source - The `RouteSource` indicating how the route change originated.
     * @since 1.0.0
     */
    constructor(route: string, access: RouteAccess, source: RouteSource) {
        defineProperty(this, 'route', {
            value: route,
            configurable: true,
            enumerable: true,
            writable: false,
        });

        defineProperty(this, 'access', {
            value: access,
            configurable: true,
            enumerable: true,
            writable: false,
        });

        defineProperty(this, 'source', {
            value: source,
            configurable: true,
            enumerable: true,
            writable: false,
        });
    }
}

/**
 * A hash-based router implementation for browser environments that extends `AbstractRouter`.
 * It manages routing based on the URL hash fragment, supports route interceptors, and maintains a route history.
 * This class structurally conforms to the `Destroyable` shape (`destroyed` + `destroy()`) without importing the interface,
 * so `likeDestroyable` checks can still identify it by duck typing.
 * @since 1.0.0
 */
export class HashRouter extends AbstractRouter {
    #handler: HashChangeHandler;
    #history: RouteHistory;
    #route: PathRoute;
    /** Routes whose `location.hash` write is still awaiting its `hashchange` echo. */
    #pendingHashEchoes: string[];
    /**
     * Serializes navigations. Concurrent `setRoute` calls (and external
     * `hashchange` dispatches) otherwise interleave across their interceptor
     * awaits: an earlier navigation is dropped and the winner's callback can
     * fire twice (PWB-REV-005).
     */
    #navigation: Promise<unknown>;

    readonly callback!: RouterCallback;

    /**
     * Gets the current route as a string.
     * @returns The string representation of the current route, or an empty string if no route is set.
     * @since 1.0.0
     */
    get route(): string {
        return this.#route?.toString() || '';
    }

    /**
     * Indicates whether the router has been destroyed and its event listeners removed.
     * @since 1.0.0
     */
    destroyed!: boolean;

    /**
     * Gets the `RingBuffer` instance that stores the route history.
     * @returns The route history buffer.
     * @since 1.0.0
     */
    get history(): RouteHistory {
        return this.#history;
    }

    /**
     * Creates an instance of `HashRouter`.
     * @param callback - The `RouterCallback` to be invoked when the route changes.
     * @param options - Router options, e.g. the navigation-error hook.
     * @since 1.0.0
     */
    constructor(callback: RouterCallback, options: RouterOptions = {}) {
        super(options);

        defineProperty(this, 'callback', {
            value: callback,
            configurable: true,
            enumerable: false,
            writable: false,
        });

        this.#handler = (event: HashChangeEvent) => this._onHashChange(event);
        this.#history = new RingBuffer<RouteTransaction>(256);
        this.#pendingHashEchoes = [];
        this.#navigation = Promise.resolve();

        const currentRoute = removeFirstCharacter(location.hash) || '/',
            routeTx = new RouteTransaction(currentRoute, RouteAccess.PUBLIC, RouteSource.EXTERNAL);

        this.#route = new PathRoute(currentRoute);
        this.#history.put(routeTx);

        defineProperty(this, 'destroyed', {
            value: false,
            configurable: true,
            enumerable: false,
            writable: false,
        });

        addEventListener('hashchange', this.#handler);
    }

    /**
     * Destroys the router by removing its `hashchange` event listener.
     * Once destroyed, the router will no longer respond to URL hash changes.
     * @since 1.0.0
     */
    destroy() {
        if (!this.destroyed) {
            defineProperty(this, 'destroyed', {
                value: true,
                configurable: true,
                enumerable: false,
                writable: false,
            });

            removeEventListener('hashchange', this.#handler);
        }
    }

    /**
     * Programmatically sets a new route for the router.
     * This method will trigger route interceptors and update the browser's hash if `isPublic` is `true`.
     * @param newRoute - The new route string to set.
     * @param isPublic - `true` if the route change should be reflected in the browser's URL hash and recorded as a public route, `false` for internal/private route changes. Defaults to `true`.
     * @returns A promise that resolves when the route has been successfully set and processed.
     * @since 1.0.0
     */
    async setRoute(newRoute: string, isPublic = true): Promise<void> {
        await this.#serialize(() => this.#applyNavigation(newRoute, isPublic, RouteSource.INTERNAL));
    }

    /**
     * Refreshes the current route by re-invoking the router's callback with the current route.
     * This can be useful to re-apply routing logic or update UI components without a full navigation.
     * @since 1.0.0
     */
    refresh(): void {
        if (this.#route) {
            this.callback(this.#route);
        }
    }

    /**
     * Programmatically navigates to the given route path.
     *
     * Delegates to {@link setRoute} with `isPublic = true`, updating the browser hash and
     * triggering the routing pipeline.
     *
     * @param path - The target route string to navigate to.
     * @returns A promise that resolves when the route has been set and processed.
     * @since 1.0.0
     */
    navigate(path: string): Promise<void> {
        return this.setRoute(path, true);
    }

    /**
     * Handles the native `hashchange` event, extracting the new route and initiating the routing process.
     * The echo of a hash written by {@link setRoute} is ignored — that route change has already been
     * recorded and dispatched, so re-running the pipeline would duplicate it.
     * @param event - The `HashChangeEvent` object.
     * @protected
     * @since 1.0.0
     */
    protected _onHashChange(event: HashChangeEvent) {
        const newRoute = extractRouteFromURL(event.newURL),
            echoIndex = this.#pendingHashEchoes.indexOf(newRoute);

        if (echoIndex !== -1) {
            this.#pendingHashEchoes.splice(echoIndex, 1);
            return;
        }

        void this.#serialize(() => this.#applyNavigation(newRoute, true, RouteSource.EXTERNAL)).catch(
            (error: unknown) => this.onError(error, new PathRoute(newRoute))
        );
    }

    /**
     * Runs one navigation to completion and records it: commits the route,
     * appends a history transaction, mirrors public routes into the hash, and
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
            this._syncHash();
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
     * Internal method to set a new route, apply interceptors, and manage the route transaction.
     * @param newRoute - The new route string to set.
     * @param syncHash - `true` if the browser hash should be updated, `false` otherwise. Defaults to `true`.
     * @returns A promise that resolves to `true` if the route was successfully set and processed, `false` otherwise.
     * @protected
     * @since 1.0.0
     */
    protected async _setRoute(newRoute: string, syncHash = true): Promise<boolean> {
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
                this._restoreHash(oldRoute, syncHash);
            },
            (error, failedRoute) => this.onError(error, failedRoute)
        );
    }

    /**
     * Mirrors the current route into `location.hash`, recording the written hash so the
     * `hashchange` event the browser emits for it is not re-dispatched.
     * Does nothing outside a browser environment.
     * @private
     * @since 1.0.0
     */
    private _syncHash(): void {
        if (typeof location === 'undefined') {
            return;
        }

        const route = this.route,
            hash = `#${route}`;

        if (location.hash === hash) {
            return;
        }

        location.hash = route;
        this.#pendingHashEchoes.push(removeFirstCharacter(location.hash));
    }

    /**
     * Restores the browser hash to the given route when a navigation is rejected or fails.
     * Only acts when syncHash is enabled and the hash no longer represents the given route.
     * The rollback write is recorded as an echo so the `hashchange` it emits does not
     * re-dispatch the restored route (PWB-REV-003).
     */
    private _restoreHash(oldRoute: string, syncHash: boolean): void {
        if (!syncHash || typeof location === 'undefined') {
            return;
        }

        const currentRoute = removeFirstCharacter(location.hash) || '/';

        if (currentRoute === oldRoute) {
            return;
        }

        location.hash = oldRoute;
        this.#pendingHashEchoes.push(removeFirstCharacter(location.hash));
    }

    /**
     * Resolves and filters the active `RouterInterceptor` instances for a given route.
     * For `MappedRouterInterceptor`s, it checks if the route matches their patterns and resolves parameters.
     * @param route - The `PathRoute` object for which to resolve interceptors.
     * @returns An array of active `RouterInterceptor` instances.
     * @private
     * @since 1.0.0
     */
    private _resolveInterceptors(route: PathRoute): RouterInterceptor[] {
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
