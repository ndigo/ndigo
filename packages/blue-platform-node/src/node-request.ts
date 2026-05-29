/**
 * @author Jeff Rose
 */

import { Route } from '@blue/router';

/**
 * Well-known route attribute key under which the Node.js request context is stored.
 * Middleware must place a {@link NodeRequest} at this key before dispatching.
 */
export const NODE_REQUEST_ATTRIBUTE = '__node:request';

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
    /** Server-side session data keyed by session variable name. */
    session: Record<string, unknown>;
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