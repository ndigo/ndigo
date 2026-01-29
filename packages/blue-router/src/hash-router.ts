import { constructN, pipe } from '@blue/util/function';
import { slice } from '@blue/util/list';
import { prop } from '@blue/util/object';
import { PathRoute } from './path-route';
import { Router, RouterCallback } from './router';
import { RingBuffer } from '@blue/core';
import RouterExecutionChain from './router-execution-chain';
import { RouterInterceptor, RouterInterceptorRegistry } from './router-interceptor';

//type RouteSource = 'private' | 'public' | 'external';
//type RouteResult = 'aborted' | 'completed';
//type RouteTransaction = Route & { source: RouteSource; result: RouteResult };
type HashChangeHandler = (event: HashChangeEvent) => void;
type RouteHistory = RingBuffer<RouteTransaction>;

enum RouteAccess {
    PUBLIC,
    PRIVATE,
}

enum RouteSource {
    EXTERNAL,
    INTERNAL,
}

const { defineProperty } = Reflect,
    constructURL = constructN(1, URL) as (value: string) => URL,
    getHashProperty = prop('hash') as (value: object) => string,
    removeFirstCharacter = slice(1, Infinity) as (value: string) => string,
    extractRouteFromURL = pipe(constructURL, getHashProperty, removeFirstCharacter);

class RouteTransaction {
    route: string;
    access: RouteAccess;
    source: RouteSource;

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
 * ? Implement factory.Destroyable? It seems excessive to include @blue/factory just for the interface. Move factory.Destroyable to @blue/core? -JBR
 */

export default class HashRouter implements Router, RouterInterceptorRegistry {
    #handler: HashChangeHandler;
    #history: RouteHistory;
    #interceptors: RouterInterceptor[];
    #route: PathRoute;

    readonly callback: RouterCallback;

    get route(): string {
        return this.#route?.toString() || '';
    }

    destroyed: boolean;

    get history(): RouteHistory {
        return this.#history;
    }

    constructor(callback: RouterCallback) {
        defineProperty(this, 'callback', {
            value: callback,
            configurable: true,
            enumerable: false,
            writable: false,
        });

        this.#handler = (event: HashChangeEvent) => this._onHashChange(event);
        this.#history = new RingBuffer<RouteTransaction>(256);
        this.#interceptors = [];

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

    addInterceptor(interceptor: RouterInterceptor): void {
        // TODO Check for duplicates and deny?
        this.#interceptors.push(interceptor);
    }

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

    setRoute(newRoute: string, isPublic = true) {
        if (this._setRoute(newRoute)) {
            const routeAccess = isPublic ? RouteAccess.PUBLIC : RouteAccess.PRIVATE,
                routeTx = new RouteTransaction(this.route, routeAccess, RouteSource.INTERNAL);
            this.#history.put(routeTx);
            this.callback(this.route);
        }
    }

    protected _onHashChange(event: HashChangeEvent) {
        const newRoute = extractRouteFromURL(event.newURL);
        if (this._setRoute(newRoute)) {
            const route = this.route,
                routeTx = new RouteTransaction(route, RouteAccess.PUBLIC, RouteSource.EXTERNAL);
            this.#history.put(routeTx);
            this.callback(route);
        }
    }

    protected _setRoute(newRoute: string): boolean {
        const route = new PathRoute(newRoute),
            chain = new RouterExecutionChain(this.#interceptors);
        let isCompleted = false;

        try {
            if (chain.applyPreRoute(route) === false) {
                const oldRoute = this.route;
                if (location.hash !== oldRoute) {
                    location.hash = oldRoute;
                }
                return isCompleted;
            }

            this.#route = route;

            chain.applyPostRoute(route);

            isCompleted = true;
        } catch (e) {}

        return isCompleted;
    }
}
