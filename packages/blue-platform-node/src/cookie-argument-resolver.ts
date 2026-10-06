/**
 * @module blue-platform-node
 * @since 1.0.0
 * @author Jeff Rose
 */
import {
    MethodParameter,
    MethodParameterType,
    AbstractPlatformArgumentResolver,
    convertArgumentValue,
} from '@blue/dispatcher';
import { Route } from '@blue/router';
import { getNodeRequest } from './node-request';

/**
 * Node.js cookie argument resolver.
 */
export class NodeCookieValueMethodArgumentResolver extends AbstractPlatformArgumentResolver {
    constructor() {
        super(convertArgumentValue);
    }

    get [Symbol.toStringTag](): string {
        return 'NodeCookieValueMethodArgumentResolver';
    }

    protected resolveName(name: string, _parameter: MethodParameter, route: Route, _mapping: unknown): unknown {
        // `cookieValue()` (no name) binds the whole cookie jar.
        if (name === '') {
            return getNodeRequest(route)?.cookies;
        }
        return getNodeRequest(route)?.cookies?.[name];
    }

    supportsParameter(parameter: MethodParameter): boolean {
        return MethodParameterType.COOKIE.equals(parameter.type);
    }
}
