import { constructN, pipe, prop, slice } from '@blue/util';
import { PathRoute } from './path-route';
import { RingBuffer } from '@blue/core';
import RouterExecutionChain from './router-execution-chain';
var RouteAccess;
(function (RouteAccess) {
    RouteAccess[RouteAccess["PUBLIC"] = 0] = "PUBLIC";
    RouteAccess[RouteAccess["PRIVATE"] = 1] = "PRIVATE";
})(RouteAccess || (RouteAccess = {}));
var RouteSource;
(function (RouteSource) {
    RouteSource[RouteSource["EXTERNAL"] = 0] = "EXTERNAL";
    RouteSource[RouteSource["INTERNAL"] = 1] = "INTERNAL";
})(RouteSource || (RouteSource = {}));
const { defineProperty } = Reflect, constructURL = constructN(1, URL), getHashProperty = prop('hash'), removeFirstCharacter = slice(1, Infinity), extractRouteFromURL = pipe(constructURL, getHashProperty, removeFirstCharacter);
class RouteTransaction {
    route;
    access;
    source;
    constructor(route, access, source) {
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
export default class HashRouter {
    #handler;
    #history;
    #interceptors;
    #route;
    callback;
    get route() {
        return this.#route?.toString() || '';
    }
    destroyed;
    get history() {
        return this.#history;
    }
    constructor(callback) {
        defineProperty(this, 'callback', {
            value: callback,
            configurable: true,
            enumerable: false,
            writable: false,
        });
        this.#handler = (event) => this._onHashChange(event);
        this.#history = new RingBuffer(256);
        this.#interceptors = [];
        const currentRoute = removeFirstCharacter(location.hash) || '/', routeTx = new RouteTransaction(currentRoute, RouteAccess.PUBLIC, RouteSource.EXTERNAL);
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
    addInterceptor(interceptor) {
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
    setRoute(newRoute, isPublic = true) {
        if (this._setRoute(newRoute)) {
            const routeAccess = isPublic ? RouteAccess.PUBLIC : RouteAccess.PRIVATE, routeTx = new RouteTransaction(this.route, routeAccess, RouteSource.INTERNAL);
            this.#history.put(routeTx);
            this.callback(this.route);
        }
    }
    _onHashChange(event) {
        const newRoute = extractRouteFromURL(event.newURL);
        if (this._setRoute(newRoute)) {
            const route = this.route, routeTx = new RouteTransaction(route, RouteAccess.PUBLIC, RouteSource.EXTERNAL);
            this.#history.put(routeTx);
            this.callback(route);
        }
    }
    _setRoute(newRoute) {
        const route = new PathRoute(newRoute), chain = new RouterExecutionChain(this.#interceptors);
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
        }
        catch (e) { }
        return isCompleted;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGFzaC1yb3V0ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaGFzaC1yb3V0ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFVBQVUsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxNQUFNLFlBQVksQ0FBQztBQUMzRCxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sY0FBYyxDQUFDO0FBRXpDLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxZQUFZLENBQUM7QUFDeEMsT0FBTyxvQkFBb0IsTUFBTSwwQkFBMEIsQ0FBQztBQVM1RCxJQUFLLFdBR0o7QUFIRCxXQUFLLFdBQVc7SUFDWixpREFBTSxDQUFBO0lBQ04sbURBQU8sQ0FBQTtBQUNYLENBQUMsRUFISSxXQUFXLEtBQVgsV0FBVyxRQUdmO0FBRUQsSUFBSyxXQUdKO0FBSEQsV0FBSyxXQUFXO0lBQ1oscURBQVEsQ0FBQTtJQUNSLHFEQUFRLENBQUE7QUFDWixDQUFDLEVBSEksV0FBVyxLQUFYLFdBQVcsUUFHZjtBQUVELE1BQU0sRUFBRSxjQUFjLEVBQUUsR0FBRyxPQUFPLEVBQzlCLFlBQVksR0FBRyxVQUFVLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBMkIsRUFDM0QsZUFBZSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQThCLEVBQzNELG9CQUFvQixHQUFHLEtBQUssQ0FBQyxDQUFDLEVBQUUsUUFBUSxDQUE4QixFQUN0RSxtQkFBbUIsR0FBRyxJQUFJLENBQUMsWUFBWSxFQUFFLGVBQWUsRUFBRSxvQkFBb0IsQ0FBQyxDQUFDO0FBRXBGLE1BQU0sZ0JBQWdCO0lBQ2xCLEtBQUssQ0FBUztJQUNkLE1BQU0sQ0FBYztJQUNwQixNQUFNLENBQWM7SUFFcEIsWUFBWSxLQUFhLEVBQUUsTUFBbUIsRUFBRSxNQUFtQjtRQUMvRCxjQUFjLENBQUMsSUFBSSxFQUFFLE9BQU8sRUFBRTtZQUMxQixLQUFLLEVBQUUsS0FBSztZQUNaLFlBQVksRUFB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