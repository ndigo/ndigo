import { RouteSegment, Route } from './route';
import { JSONValue, Serializable, JSONObject } from '@blue/core';
/**
 * @class module:router.PathRouteSegment
 */
export declare class PathRouteSegment implements RouteSegment, Serializable {
    readonly name: string;
    readonly data: JSONObject;
    readonly dataString?: string;
    readonly raw: string;
    constructor(segment: string);
    toJSON(): JSONValue;
    toString(): string;
}
/**
 * @class module:router.PathRoute
 * @implements module:router.Route
 * @implements module:core.Serializable
 */
export declare class PathRoute implements Route, Serializable {
    [n: number]: RouteSegment;
    readonly data: JSONObject;
    readonly dataString?: string;
    readonly id: number;
    readonly path: string;
    readonly raw: string;
    get length(): number;
    constructor(route: string);
    toJSON(): JSONValue;
    toString(): string;
}
//# sourceMappingURL=path-route.d.ts.map