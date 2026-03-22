import { constructN, pipe } from '@blue/util/function';
import { slice } from '@blue/util/list';
import { prop } from '@blue/util/object';
import { PathRoute } from './path-route';
import { AbstractRouter, RouterCallback } from './router';
import { RingBuffer } from '@blue/core';
import RouterExecutionChain from './router-execution-chain';
import { MappedRouterInterceptor, RouterInterceptor } from './router-interceptor';
import { DefaultRouteTransactionManager, RouteTransactionManager } from './transaction-manager';

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

export default class HashRouter extends AbstractRouter {
    #handler: HashChangeHandler;
    #history: RouteHistory;
    #route: PathRoute;
    #lastPublicRoute: string;
    #transactionManager: RouteTransactionManager;

    readonly callback: RouterCallback;

    get route(): string {
        return this.#route?.toString() || '';
    }

    destroyed: boolean;

    get history(): RouteHistory {
        return this.#history;
    }

    get transactionManager(): RouteTransactionManager {
        return this.#transactionManager;
    }

    constructor(callback: RouterCallback) {
        super();

        defineProperty(this, 'callback', {
            value: callback,
            configurable: true,
            enumerable: false,
            writable: false,
        });

        this.#handler = (event: HashChangeEvent) => this._onHashChange(event);
        this.#history = new RingBuffer<RouteTransaction>(256);
        this.#transactionManager = new DefaultRouteTransactionManager();

        const currentRoute = removeFirstCharacter(location.hash) || '/',
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

        addEventListener('hashchange', this.#handler);
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

    async setRoute(newRoute: string, isPublic = true): Promise<void> {
        const success = await this._setRoute(newRoute, isPublic);
        if (success) {
            const routeAccess = isPublic ? RouteAccess.PUBLIC : RouteAccess.PRIVATE,
                routeTx = new RouteTransaction(this.route, routeAccess, RouteSource.INTERNAL);
            this.#history.put(routeTx);
            if (isPublic) {
                this.#lastPublicRoute = this.route;
            }
            this.callback(this.#route);
        }
    }

    refresh(): void {
        if (this.#route) {
            this.callback(this.#route);
        }
    }

    protected _onHashChange(event: HashChangeEvent) {
        const newRoute = extractRouteFromURL(event.newURL);
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

    protected async _setRoute(newRoute: string, syncHash = true): Promise<boolean> {
        const route = new PathRoute(newRoute),
            oldRoute = syncHash ? this.route : this.#lastPublicRoute,
            status = this.#transactionManager.getTransaction(route, oldRoute, syncHash),
            chain = new RouterExecutionChain(this._resolveInterceptors(route));

        try {
            if ((await chain.applyPreRoute(route)) === false) {
                status.setRollbackOnly();
                this.#transactionManager.rollback(status);
                return false;
            }

            this.#route = route;

            await chain.applyPostRoute(route);

            this.#transactionManager.commit(status);

            return true;
        } catch {
            this.#transactionManager.rollback(status);
            return false;
        }
    }

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
