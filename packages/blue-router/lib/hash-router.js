import { constructN, pipe } from '@blue/util/function';
import { slice } from '@blue/util/list';
import { prop } from '@blue/util/object';
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGFzaC1yb3V0ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaGFzaC1yb3V0ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFVBQVUsRUFBRSxJQUFJLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQztBQUN2RCxPQUFPLEVBQUUsS0FBSyxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFDeEMsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBQ3pDLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxjQUFjLENBQUM7QUFFekMsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLFlBQVksQ0FBQztBQUN4QyxPQUFPLG9CQUFvQixNQUFNLDBCQUEwQixDQUFDO0FBUzVELElBQUssV0FHSjtBQUhELFdBQUssV0FBVztJQUNaLGlEQUFNLENBQUE7SUFDTixtREFBTyxDQUFBO0FBQ1gsQ0FBQyxFQUhJLFdBQVcsS0FBWCxXQUFXLFFBR2Y7QUFFRCxJQUFLLFdBR0o7QUFIRCxXQUFLLFdBQVc7SUFDWixxREFBUSxDQUFBO0lBQ1IscURBQVEsQ0FBQTtBQUNaLENBQUMsRUFISSxXQUFXLEtBQVgsV0FBVyxRQUdmO0FBRUQsTUFBTSxFQUFFLGNBQWMsRUFBRSxHQUFHLE9BQU8sRUFDOUIsWUFBWSxHQUFHLFVBQVUsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUEyQixFQUMzRCxlQUFlLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBOEIsRUFDM0Qsb0JBQW9CLEdBQUcsS0FBSyxDQUFDLENBQUMsRUFBRSxRQUFRLENBQThCLEVBQ3RFLG1CQUFtQixHQUFHLElBQUksQ0FBQyxZQUFZLEVBQUUsZUFBZSxFQUFFLG9CQUFvQixDQUFDLENBQUM7QUFFcEYsTUFBTSxnQkFBZ0I7SUFDbEIsS0FBSyxDQUFTO0lBQ2QsTUFBTSxDQUFjO0lBQ3BCLE1BQU0sQ0FBYztJQUVwQixZQUFZLEtBQWEsRUFBRSxNQUFtQixFQUFFLE1BQW1CO1FB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