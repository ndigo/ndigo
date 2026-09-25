/**
 * @module blue-platform-node
 * @since 1.0.0
 * @author Jeff Rose
 */
import { MethodParameter, MethodParameterType, AbstractPlatformArgumentResolver } from '@blue/dispatcher';
import { HTTPHeader } from '@blue/http';
import { Route } from '@blue/router';
import { convertArgumentValue } from './_resolver-util';
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
        // (DSG-5); multi-value headers still join into a comma list.
        const value = new HTTPHeader(name).get(request.headers as unknown as Record<string, string>);
        return Array.isArray(value) ? value.join(', ') : value;
    }

    supportsParameter(parameter: MethodParameter): boolean {
        return MethodParameterType.HEADER.equals(parameter.type);
    }
}
