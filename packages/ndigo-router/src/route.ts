/**
 * The route contract.
 */
import { JSONObject, Serializable } from '@ndigo/core';
import type { HTTPMethod } from '@ndigo/http';

/**
 * Represents a single segment within a route, including its name, associated data, and raw string value.
 */
export interface RouteSegment extends Serializable {
    /** The segment name. */
    name: string;
    /** The parsed matrix-parameter data. */
    data: JSONObject;
    /** The raw matrix-parameter string. */
    dataString?: string;
    /** The raw segment text. */
    raw: string;
}

/**
 * Represents a complete route, composed of multiple segments, along with its parameters, path, and associated data.
 * It extends `ArrayLike<RouteSegment>` to allow iteration over its segments.
 * @typeParam TParams - A type representing the route parameters, defaulting to `Record<string, string>`.
 */
export interface Route<TParams extends Record<string, string> = Record<string, string>>
    extends ArrayLike<RouteSegment>, Serializable {
    [n: number]: RouteSegment;

    /** The query/matrix data. */
    data: JSONObject;
    /** The raw query string. */
    dataString?: string;
    /** The unique route id. */
    id: string;
    /** The HTTP method, when known. */
    method?: HTTPMethod;
    /** The parsed route parameters. */
    params: TParams | null;
    /** The route path. */
    path: string;
    /** The raw route text. */
    raw: string;
    /** Additional route attributes. */
    attributes: Record<string, unknown>;
}
