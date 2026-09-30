/**
 * @module blue-test
 * @since 1.0.0
 * @author Jeff Rose
 */
import { guid } from '@blue/util/math';
/**
 * Builds a Blue `Route` and `NodeRequest` from a MockHTTP request spec.
 *
 * Mirrors `NodeHTTPServerAdapter`'s request→route conversion (path segments,
 * matrix params, query params) so an in-process dispatch behaves identically
 * to a real HTTP request.
 *
 * @module
 * @since 1.0.0
 */

import { HTTPHeaders } from '@blue/http';
import { Route, RouteSegment, ACCEPT_LANGUAGE_ATTRIBUTE } from '@blue/router';
import { NODE_REQUEST_ATTRIBUTE, NODE_RESPONSE_ATTRIBUTE, NodeRequest } from '@blue/platform-node';
import { ResponseSink } from './memory-response';

/**
 * A mock HTTP request to be dispatched through the application's pipeline.
 */
export interface MockRequest {
    /** HTTP method. Defaults to `GET`. */
    method?: string;
    /** Path, e.g. `/todos/42`. Map params like `/todos/{id}` are resolved by the framework. */
    path: string;
    /** Query parameters, e.g. `{ filter: 'active' }`. */
    query?: Record<string, string>;
    /** Request body (JSON object). Bound as `'*'` for the whole object, or by field name. */
    body?: Record<string, unknown>;
    /** Raw request body sent verbatim (string or Buffer). `multipart/form-data` streams through the real parser before dispatch; any other Content-Type is parsed like a live body (JSON / urlencoded / raw text). */
    rawBody?: string | Buffer;
    /** Request headers — keys are case-insensitive and normalized to lowercase, matching Node's `IncomingMessage`. */
    headers?: Record<string, string>;
    /** Cookies. */
    cookies?: Record<string, string>;
    /** Session data. */
    session?: Record<string, unknown>;
    /**
     * Client socket address for the rate limiter's key. Defaults to a
     * fresh per-request `mock-peer-<n>` address — tests are isolated from
     * each other's budgets unless they deliberately share an address.
     */
    remoteAddress?: string;
}

/**
 * A route with its request context populated, ready for dispatch.
 */
export interface PreparedRoute {
    /** The assembled route. */
    route: Route;
    /** The node request context stored in `route.attributes`. */
    request: NodeRequest;
}

/**
 * Split a pathname into cleaned path and per-segment data (matrix params),
 * matching `NodeHTTPServerAdapter`.
 *
 * @param pathname - The path, e.g. `/todos/42;color=red`.
 * @returns The cleaned path and ordered segments.
 */
function splitPath(pathname: string): { cleanedPath: string; segments: RouteSegment[] } {
    const segments: RouteSegment[] = [];
    const parts = pathname.split('/').filter((part) => part !== '');

    let cleanedPath = '';

    for (let index = 0; index < parts.length; index++) {
        const part = parts[index];
        const [segmentValue, ...matrixParams] = part.split(';');

        cleanedPath = index === 0 ? segmentValue : `${cleanedPath}/${segmentValue}`;

        const data: Record<string, string> = {};
        for (const param of matrixParams) {
            const [key, value] = param.split('=');
            data[key] = value ?? '';
        }

        segments.push({ name: segmentValue, raw: part, data });
    }

    return { cleanedPath: cleanedPath ? `/${cleanedPath}` : '/', segments };
}

/** Module-level counter giving each mock request a distinct peer address. */
let mockPeerCounter = 0;

/**
 * Builds a {@link Route} with `NODE_REQUEST_ATTRIBUTE` / `NODE_RESPONSE_ATTRIBUTE`
 * attributes and the path/query/body/segments populated.
 *
 * @param request - The mock request spec.
 * @param responseSink - The in-memory response sink to place at `NODE_RESPONSE_ATTRIBUTE`.
 * @returns The prepared route.
 */
export function buildRoute(request: MockRequest, responseSink: ResponseSink): PreparedRoute {
    const { cleanedPath, segments } = splitPath(request.path);

    // RUS-4: Node lower-cases `IncomingMessage` header names; the mock must
    // match at the boundary so `Content-Type:` keys never skip the pipeline's
    // content-type gates. Response-side headers are already normalized.
    const headers: Record<string, string> = {};
    for (const [name, value] of Object.entries(request.headers ?? {})) {
        headers[name.toLowerCase()] = value;
    }

    const nodeRequest: NodeRequest = {
        headers,
        body: request.body ?? {},
        cookies: request.cookies ?? {},
        session: request.session ?? {},
        remoteAddress: request.remoteAddress ?? `mock-peer-${(mockPeerCounter += 1)}`,
    };

    // Query params go into route.data (NamePathHandlerMapping expects `data`).
    const data: Record<string, string> = { ...request.query };

    // Build the route, then assign per-segment matrix data below. The numeric
    // index members come from `ArrayLike<RouteSegment>`; they are populated
    // incrementally after construction, so the literal cannot satisfy the type
    // until populated (cast with a named const + reason).
    const route = {
        length: segments.length,
        id: guid(),
        path: cleanedPath,
        raw: request.path,
        data,
        params: null,
        method: request.method ?? 'GET',
        attributes: {
            [NODE_REQUEST_ATTRIBUTE]: nodeRequest,
            [NODE_RESPONSE_ATTRIBUTE]: responseSink,
            [ACCEPT_LANGUAGE_ATTRIBUTE]: HTTPHeaders.ACCEPT_LANGUAGE.get(headers) ?? undefined,
        },
    } as unknown as Route;

    // Per-segment matrix data so matrix-param conditions can match.
    for (let index = 0; index < segments.length; index++) {
        route[index] = segments[index];
    }

    return { route, request: nodeRequest };
}
