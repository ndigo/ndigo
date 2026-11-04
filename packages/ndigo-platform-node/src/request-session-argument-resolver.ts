/**
 * @module ndigo-platform-node
 * @since 1.0.0
 * @author Jeff Rose
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
 * contract; see {@link NodeRequest.session}).
 */
export class NodeRequestSessionValueMethodArgumentResolver extends AbstractPlatformArgumentResolver {
    constructor() {
        super(convertArgumentValue);
    }

    get [Symbol.toStringTag](): string {
        return 'NodeRequestSessionValueMethodArgumentResolver';
    }

    protected resolveName(name: string, _parameter: MethodParameter, route: Route, _mapping: unknown): unknown {
        // `requestSessionValue()` (no name) binds the whole session bag;
        // named reads are nested-capable (D-2).
        const session = getNodeRequest(route)?.session;
        return name === '' ? session : readDottedValue(session, name);
    }

    supportsParameter(parameter: MethodParameter): boolean {
        return MethodParameterType.REQUEST_SESSION.equals(parameter.type);
    }
}
