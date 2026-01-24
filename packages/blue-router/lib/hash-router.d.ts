import { Router, RouterCallback } from './router';
import { RingBuffer } from '@blue/core';
import { RouterInterceptor, RouterInterceptorRegistry } from './router-interceptor';
type RouteHistory = RingBuffer<RouteTransaction>;
declare enum RouteAccess {
    PUBLIC = 0,
    PRIVATE = 1
}
declare enum RouteSource {
    EXTERNAL = 0,
    INTERNAL = 1
}
declare class RouteTransaction {
    route: string;
    access: RouteAccess;
    source: RouteSource;
    constructor(route: string, access: RouteAccess, source: RouteSource);
}
/**
 * ? Implement factory.Destroyable? It seems excessive to include @blue/factory just for the interface. Move factory.Destroyable to @blue/core? -JBR
 */
export default class HashRouter implements Router, RouterInterceptorRegistry {
    #private;
    readonly callback: RouterCallback;
    get route(): string;
    destroyed: boolean;
    get history(): RouteHistory;
    constructor(callback: RouterCallback);
    addInterceptor(interceptor: RouterInterceptor): void;
    destroy(): void;
    setRoute(newRoute: string, isPublic?: boolean): void;
    protected _onHashChange(event: HashChangeEvent): void;
    protected _setRoute(newRoute: string): boolean;
}
export {};
//# sourceMappingURL=hash-router.d.ts.map