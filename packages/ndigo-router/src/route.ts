/**
 * @module ndigo-router
 * @since 1.0.0
 * @author Jeff Rose
 */
import { JSONObject, Serializable } from '@ndigo/core';
import type { HTTPMethod } from '@ndigo/http';

/**
 * Represents a single segment within a route, including its name, associated data, and raw string value.
 * @since 1.0.0
 */
export interface RouteSegment extends Serializable {
    name: string;
    data: JSONObject;
    dataString?: string;
    raw: string;
}

/**
 * Represents a complete route, composed of multiple segments, along with its parameters, path, and associated data.
 * It extends `ArrayLike<RouteSegment>` to allow iteration over its segments.
 * @template TParams - A type representing the route parameters, defaulting to `Record<string, string>`.
 * @since 1.0.0
 */
export interface Route<TParams extends Record<string, string> = Record<string, string>>
    extends ArrayLike<RouteSegment>, Serializable {
    [n: number]: RouteSegment;

    data: JSONObject;
    dataString?: string;
    id: string;
    method?: HTTPMethod;
    params: TParams | null;
    path: string;
    raw: string;
    attributes: Record<string, unknown>;
}
