/**
 * @module blue-platform-node
 * @since 1.0.0
 * @author Jeff Rose
 */
import { Route } from '@blue/router';
import type { MultipartContext } from './multipart-file';

/**
 * Well-known route attribute key under which the Node.js request context is stored.
 * Middleware must place a {@link NodeRequest} at this key before dispatching.
 */
export const NODE_REQUEST_ATTRIBUTE = '__node:request';
/** Well-known route attribute key under which the Node.js ServerResponse is stored. */
export const NODE_RESPONSE_ATTRIBUTE = '__node:response';

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
     * The client's socket address (`req.socket.remoteAddress`), populated
     * by the adapter. The rate limiter keys on this (SEC-6, Wave 3);
     * `X-Forwarded-For` is deliberately NOT consulted — trusted-proxy
     * resolution is a Tier-2 deferral (gap analysis), and trusting the
     * header unconditionally is a spoofing hole.
     */
    remoteAddress?: string;
    /**
     * Server-side session data keyed by session variable name.
     *
     * **Reserved — always empty in the built-in pipeline.** The adapter
     * creates requests with `session: {}` and no session provider populates
     * it yet; session persistence/restoration is an open contract (see the
     * repo's remediation plan, "Session contract"). Middleware may fill this
     * record before dispatch (e.g. from a signed cookie or a session store);
     * the `session()` argument extractor reads it.
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
