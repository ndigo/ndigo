/**
 * @module ndigo-platform-node
 * @since 1.0.0
 * @author Jeff Rose
 */
import {
    MethodParameter,
    MethodParameterType,
    AbstractPlatformArgumentResolver,
    convertArgumentValue,
} from '@ndigo/dispatcher';
import { HTTPHeader } from '@ndigo/http';
import { Route } from '@ndigo/router';
import { getNodeRequest } from './node-request';

/**
 * Node.js request header argument resolver.
 */
export class NodeHeaderValueMethodArgumentResolver extends AbstractPlatformArgumentResolver {
    constructor() {
        super(convertArgumentValue);
    }

    get [Symbol.toStringTag](): string {
        return 'NodeHeaderValueMethodArgumentResolver';
    }

    protected resolveName(name: string, _parameter: MethodParameter, route: Route, _mapping: unknown): unknown {
        const request = getNodeRequest(route);
        if (!request) {
            return undefined;
        }
        // `headerValue()` (no name) binds the whole headers record.
        if (name === '') {
            return request.headers;
        }
        // HTTPHeader folds the key against lowercase Node-server records
        // (DSG-5); multi-value headers join into a comma list (Wave 5).
        return new HTTPHeader(name).getJoined(request.headers as unknown as Record<string, string>);
    }

    supportsParameter(parameter: MethodParameter): boolean {
        return MethodParameterType.HEADER.equals(parameter.type);
    }
}
