/**
 * HTTP pipeline wiring for the Todo-Backend app: CORS + a JSON-body gate.
 */
import { MediaTypes } from '@ndigo/core';
import type { ApplicationContext } from '@ndigo/context';
import { denialOf, HANDLER_MAPPING, type PreHandleOutcome, type RouteHandlerInterceptor } from '@ndigo/dispatcher';
import { contentTypeBase, HTTPHeaders, ResponseStatuses } from '@ndigo/http';
import { CORSInterceptor, getNodeRequest } from '@ndigo/platform-node';
import type { Route } from '@ndigo/router';

/** Methods whose body this API reads as JSON (static membership table). */
const JSON_BODY_METHODS: Record<string, true> = { POST: true, PUT: true, PATCH: true };

/**
 * Rejects a body-bearing write whose `Content-Type` is not JSON with `415`.
 *
 * This has to run as an interceptor, not inside the handler: argument
 * resolution (and therefore `@parameters(validatedBody(...))`) happens when the
 * adapter invokes the handler, *after* `preHandle`. A handler-level check can
 * only see the request once the body has already been rejected — or silently
 * bound — by validation, so `text/plain` would answer `422` (no `title`) while
 * `application/x-www-form-urlencoded` answered `415`, depending purely on how
 * the body happened to parse. Gating in `preHandle` makes the media-type
 * contract one rule for every write verb, and `404`/`405` decisions stay with
 * the mapping.
 *
 * The denial is finalized by the platform's `finalizeInterceptorDenial` as an
 * RFC 9457 problem document (`{"status":415,"title":"Unsupported Media Type"}`).
 */
class JSONBodyInterceptor implements RouteHandlerInterceptor {
    /** `415` unless a write verb carries a JSON `Content-Type`. */
    preHandle(route: Route): PreHandleOutcome {
        if (JSON_BODY_METHODS[route.method ?? ''] !== true) {
            return true;
        }
        const header = getNodeRequest(route)?.headers['content-type'];
        const contentType = Array.isArray(header) ? header[0] : header;
        return contentTypeBase(contentType) === String(MediaTypes.APPLICATION_JSON)
            ? true
            : denialOf(ResponseStatuses.UNSUPPORTED_MEDIA_TYPE.code);
    }

    /** No response shaping needed. */
    postHandle(): void {
        // no-op
    }

    /** No completion hook needed. */
    completeHandle(): void {
        // no-op
    }
}

/**
 * Installs the app's HTTP pipeline interceptors on the refreshed context — the
 * documented seam for mapping-level concerns (`07-ndigo-island` uses the same
 * `HANDLER_MAPPING.interceptors` splice for its CSP widening).
 *
 * Order matters: CORS is installed first so its `preHandle` attaches
 * `Access-Control-Allow-Origin` (and the rest of the allow headers) to the
 * response *before* the JSON gate can deny a cross-origin write with `415` —
 * the browser then reads the status instead of reporting a CORS failure.
 *
 * **Framework gap:** `CORSInterceptor` ships in `@ndigo/platform-node`, but
 * nothing registers it — `NodeAutoConfiguration.handlerMapping()` wires only
 * the security-headers and rate-limit interceptors, so every Ndigo server is
 * same-origin and a browser client on another origin (here the public
 * Todo-Backend runner at `todobackend.com`) is blocked with no configuration
 * knob. Cross-origin policy deserves a first-class registration (a
 * `@configurationProperties`-bound interceptor bean) rather than an app-side
 * splice. `allowedOrigins: ['*']` is correct here because the API is public and
 * credential-free; `Location` is exposed so browser JS can read the `201`
 * create's url.
 *
 * @param context - The refreshed application context.
 */
export function applyHttpInterceptors(context: ApplicationContext): void {
    const mapping = context.getValue(HANDLER_MAPPING);
    mapping.interceptors.splice(
        0,
        0,
        new CORSInterceptor({
            allowedOrigins: ['*'],
            exposedHeaders: [HTTPHeaders.LOCATION.name],
        }),
        new JSONBodyInterceptor()
    );
}
