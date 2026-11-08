/**
 * Argument resolver that reads request-session values.
 */
import {
    MethodParameter,
    MethodParameterType,
    AbstractPlatformArgumentResolver,
    readDottedValue,
    convertArgumentValue,
} from '@ndigo/dispatcher';
import { Route } from '@ndigo/router';
import { getNodeRequest } from './node-request';

/**
 * Node.js request-session argument resolver.
 *
 * Reads `request.session` — the server-side session bag populated by
 * middleware before dispatch (session persistence/restoration is an open
 * contract; see {@link node-request.NodeRequest#session | NodeRequest.session}).
 */
export class NodeRequestSessionValueMethodArgumentResolver extends AbstractPlatformArgumentResolver {
    constructor() {
        super(convertArgumentValue);
    }

    get [Symbol.toStringTag](): string {
        return 'NodeRequestSessionValueMethodArgumentResolver';
    }

    /**
     * Reads the request-session bag (or a dotted value).
     *
     * @param name - The value path, or `''` for the whole session.
     * @param _parameter - The method parameter (unused).
     * @param route - The current route.
     * @param _mapping - The route mapping (unused).
     * @returns The session value.
     */
    protected resolveName(name: string, _parameter: MethodParameter, route: Route, _mapping: unknown): unknown {
        // `requestSessionValue()` (no name) binds the whole session bag;
        // named reads are nested-capable (D-2).
        const session = getNodeRequest(route)?.session;
        return name === '' ? session : readDottedValue(session, name);
    }

    /**
     * Whether this resolver supports request-session parameters.
     *
     * @param parameter - The method parameter to test.
     * @returns Whether the parameter type matches.
     */
    supportsParameter(parameter: MethodParameter): boolean {
        return MethodParameterType.REQUEST_SESSION.equals(parameter.type);
    }
}
