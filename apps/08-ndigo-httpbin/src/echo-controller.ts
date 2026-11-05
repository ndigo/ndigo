/**
 * Echo probes: `/anything`, `/get`, `/post`, `/headers`, `/ip`.
 *
 * @since 1.0.0
 * @author Jeff Rose
 */
import '@tsmetadata/polyfill';
import {
    bodyValue,
    getMapping,
    headerValue,
    parameters,
    postMapping,
    queryValue,
    requestMapping,
    routeValue,
} from '@ndigo/dispatcher';
import { getNodeRequest } from '@ndigo/platform-node';
import type { Route } from '@ndigo/router';
import { echoPayload } from './httpbin-support';

/**
 * The "echo what you sent" surface — the same projection served at every
 * ingress path so a client can POST, PUT, PATCH or DELETE to `/anything` (or
 * any `/anything/<rest>` sub-path) and read back exactly what the server saw.
 *
 * `/anything` and `/anything/{*rest}` are method-less mappings: the pattern
 * matches any verb, so GET/POST/PUT/PATCH/DELETE are all handled by one
 * projection and a wrong method is never a 405 on this route.
 */
@requestMapping('/')
export class EchoController {
    /**
     * GET /get — echo of a bodyless request.
     */
    @getMapping('/get')
    @parameters({
        route: routeValue(),
        query: queryValue(),
        headers: headerValue(),
        body: bodyValue(),
    })
    get(route: Route, query: unknown, headers: unknown, body: unknown) {
        return echoPayload(route, query, headers, body);
    }

    /**
     * POST /post — echo of a JSON, urlencoded or multipart body. Multipart
     * file parts are summarised under `files` (name + byte size).
     */
    @postMapping('/post')
    @parameters({
        route: routeValue(),
        query: queryValue(),
        headers: headerValue(),
        body: bodyValue(),
    })
    post(route: Route, query: unknown, headers: unknown, body: unknown) {
        return echoPayload(route, query, headers, body);
    }

    /**
     * GET /headers — echo the request headers only.
     */
    @getMapping('/headers')
    @parameters({ headers: headerValue() })
    headers(headers: unknown) {
        return { headers: headers ?? {} };
    }

    /**
     * GET /ip — echo the resolved client address (the rate limiter's key).
     */
    @getMapping('/ip')
    @parameters({ route: routeValue() })
    ip(route: Route) {
        return { origin: getNodeRequest(route)?.remoteAddress ?? null };
    }

    /**
     * Any-method `/anything` — echoes the request.
     */
    @requestMapping({ value: '/anything', private: false })
    @parameters({
        route: routeValue(),
        query: queryValue(),
        headers: headerValue(),
        body: bodyValue(),
    })
    anything(route: Route, query: unknown, headers: unknown, body: unknown) {
        return echoPayload(route, query, headers, body);
    }

    /**
     * Any-method wildcard `/anything/{*rest}` — the greedy tail matches any
     * number of sub-segments and is echoed through `path`/`url`.
     */
    @requestMapping({ value: '/anything/{*rest}', private: false })
    @parameters({
        route: routeValue(),
        query: queryValue(),
        headers: headerValue(),
        body: bodyValue(),
    })
    anythingRest(route: Route, query: unknown, headers: unknown, body: unknown) {
        return echoPayload(route, query, headers, body);
    }
}
