/**
 * Node request attribute helpers.
 */
import { Route } from '@ndigo/router';
import type { MultipartContext } from './multipart-file';

/**
 * Well-known route attribute key under which the Node.js request context is stored.
 * Middleware must place a {@link NodeRequest} at this key before dispatching.
 */
export const NODE_REQUEST_ATTRIBUTE = '__node:request';
/** Well-known route attribute key under which the Node.js ServerResponse is stored. */
export const NODE_RESPONSE_ATTRIBUTE = '__node:response';
/**
 * Well-known route attribute key under which the raw `IncomingMessage` is
 * stored. Handlers that own the transport (MCP Streamable HTTP, raw SSE) need
 * the Node request object, which the parsed {@link NodeRequest} cannot
 * substitute for.
 */
export const NODE_INCOMING_ATTRIBUTE = '__node:incoming';

/**
 * Minimal Node.js request abstraction stored in `route.attributes[NODE_REQUEST_ATTRIBUTE]`.
 * Middleware is responsible for populating this before the dispatcher resolves arguments.
 */
export interface NodeRequest {
    /** HTTP request headers (lower-cased names). */
    headers: Record<string, string | string[] | undefined>;
    /** Pre-parsed request body. Use `'*'` as a body parameter name to bind the entire object. */
    body: Record<string, unknown>;
    /** Pre-parsed cookies from the `Cookie` header. */
    cookies: Record<string, string>;
    /**
     * The client address, populated by the adapter. Without trusted
     * proxies configured this is the socket address
     * (`req.socket.remoteAddress`); when the direct peer matches the
     * adapter's `trustedProxies` allowlist (AD-37), `X-Forwarded-For` is
     * walked from the rightmost entry and the first non-trusted valid IP
     * wins — the header is attacker input from any other peer and is
     * never consulted. The rate limiter keys on this (SEC-6, Wave 3).
     */
    remoteAddress?: string;
    /**
     * Server-side session data keyed by session variable name, populated
     * **before dispatch** by `NodeSessionInterceptor` when the request
     * carries a valid `__Host-ndigo-session` cookie: `principal` (the resolved
     * `@ndigo/auth-core` principal) and `token` (the opaque session id).
     * An absent, unknown, or expired session leaves the bag **empty**
     * (anonymous) — nothing is ever fabricated; `AuthRouteGuard` then
     * denies protected routes (401/403).
     *
     * Middleware may also fill this record before dispatch (e.g. from a
     * signed cookie or another session store); the `session()` argument
     * extractor (`requestSessionValue`) reads it.
     */
    session: Record<string, unknown>;
    /**
     * Parsed `multipart/form-data` parts when the request's `Content-Type` is
     * `multipart/form-data`. Populated by the adapter before dispatch; text
     * fields are also merged into {@link NodeRequest.body}. Absent for every
     * other content type. See `parseMultipart`.
     */
    multipart?: MultipartContext;
}

/**
 * Retrieves the {@link NodeRequest} stored in route attributes, if present.
 *
 * @param route - The current route.
 * @returns The Node request context, or `undefined` if not set.
 */
export function getNodeRequest(route: Route): NodeRequest | undefined {
    return route.attributes?.[NODE_REQUEST_ATTRIBUTE] as NodeRequest | undefined;
}
