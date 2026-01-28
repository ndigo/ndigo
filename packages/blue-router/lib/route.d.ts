import { JSONObject, Serializable } from '@blue/core';
export interface RouteSegment extends Serializable {
    name: string;
    data: JSONObject;
    dataString?: string;
    raw: string;
}
export interface Route extends ArrayLike<RouteSegment>, Serializable {
    [n: number]: RouteSegment;
    data: JSONObject;
    dataString?: string;
    id: number;
    path: string;
    raw: string;
}
/**
 * @extends module:core.Serializable
 */
/**
 */
/**
 */
/**
 */
/**
 */
/**
 * @extends external:ArrayLike<router.RouteSegment>
 * @extends module:core.Serializable
 */
/**
 */
/**
 */
/**
 */
/**
 */
//# sourceMappingURL=route.d.ts.map