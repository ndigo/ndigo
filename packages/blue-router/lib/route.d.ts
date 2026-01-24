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
 * @interface module:router.RouteSegment
 * @extends module:core.Serializable
 */
/**
 * @member {external:string} module:router.RouteSegment#name
 */
/**
 * @member {module:core.JSONObject} module:router.RouteSegment#data
 */
/**
 * @member {external:string} [module:router.RouteSegment#dataString]
 */
/**
 * @member {external:string} module:router.RouteSegment#raw
 */
/**
 * @interface module:router.Route
 * @extends external:ArrayLike<router.RouteSegment>
 * @extends module:core.Serializable
 */
/**
 * @member {module:core.JSONObject} module:router.Route#data
 */
/**
 * @member {external:string} [module:router.Route#dataString]
 */
/**
 * @member {external:string} module:router.Route#path
 */
/**
 * @member {external:string} module:router.Route#raw
 */
//# sourceMappingURL=route.d.ts.map