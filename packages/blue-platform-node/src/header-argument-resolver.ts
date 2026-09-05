import { MethodParameter, MethodParameterType, AbstractPlatformArgumentResolver } from '@blue/dispatcher';
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

    protected resolveName(name: string, _parameter: MethodParameter, route: Route, _mapping: any): any {
        const request = getNodeRequest(route);
        if (!request) {
            return undefined;
        }
        const value = request.headers[name.toLowerCase()];
        return Array.isArray(value) ? value.join(', ') : value;
    }

    supportsParameter(parameter: MethodParameter): boolean {
        return MethodParameterType.HEADER.equals(parameter.type);
    }
}
