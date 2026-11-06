/**
 */
import { AbstractCookieValueArgumentResolver } from '@ndigo/dispatcher';
import { Route } from '@ndigo/router';
import { getNodeRequest } from './node-request';

/**
 * Node.js cookie argument resolver.
 *
 * Binds `cookieValue()` (no name → the whole `request.cookies` jar) and
 * named cookie values through the shared
 * `AbstractCookieValueArgumentResolver` base.
 */
export class NodeCookieValueMethodArgumentResolver extends AbstractCookieValueArgumentResolver {
    get [Symbol.toStringTag](): string {
        return 'NodeCookieValueMethodArgumentResolver';
    }

    /** Reads the parsed cookies off the Node request attached to the route. */
    protected getCookieJar(route: Route): Record<string, unknown> | undefined {
        return getNodeRequest(route)?.cookies;
    }
}
