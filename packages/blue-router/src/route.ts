import { JSONObject, Serializable } from '@blue/core';

export interface RouteSegment extends Serializable {
    name: string;
    data: JSONObject;
    dataString?: string;
    raw: string;
}

export interface Route<TParams extends Record<string, string> = Record<string, string>>
    extends ArrayLike<RouteSegment>,
        Serializable {
    [n: number]: RouteSegment;

    data: JSONObject;
    dataString?: string;
    id: number;
    params: TParams | null;
    path: string;
    raw: string;
}
